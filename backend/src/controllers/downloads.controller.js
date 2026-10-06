import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

// ถอดรหัสชื่อไฟล์ภาษาไทยจาก latin1 เป็น UTF-8
const decodeOriginalName = (orig) => {
  if (!orig) return "";
  try {
    return Buffer.from(orig, 'latin1').toString('utf8');
  } catch {
    return orig;
  }
};

// GET all downloads
export const getDownloads = async (req, res) => {
  try {
    const files = await prisma.downloads.findMany({
      orderBy: { created_at: "desc" }
    });
    res.json(files);
  } catch (error) {
    console.error("Fetch downloads error:", error);
    res.status(500).json({ error: "Failed to fetch downloads" });
  }
};

// GET download stats
export const getDownloadStats = async (req, res) => {
  try {
    const totalFiles = await prisma.downloads.count();
    let totalSizeBytes = 0;
    const dirPath = path.join(process.cwd(), "uploads/downloads");
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        try {
          const stat = fs.statSync(path.join(dirPath, file));
          totalSizeBytes += stat.size;
        } catch (e) {
          // ignore
        }
      }
    }
    const sizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
    res.json({
      totalFiles,
      totalDownloads: 486, // baseline mock download metric
      totalSize: `${sizeMB} MB`
    });
  } catch (error) {
    console.error("Download stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

// GET download by ID
export const getDownloadById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await prisma.downloads.findUnique({
      where: { id: parseInt(id) }
    });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.json(file);
  } catch (error) {
    console.error("Fetch download by id error:", error);
    res.status(500).json({ error: "Failed to fetch file" });
  }
};

// GET downloads by audience (staff | student | regulation)
export const getDownloadsByAudience = async (req, res) => {
  try {
    const { audience } = req.params;
    const { category } = req.query;
    const where = { audience };
    if (category) {
      if (category === 'graduate') {
        where.category = { startsWith: 'graduate' };
      } else {
        where.category = category;
      }
    }
    const files = await prisma.downloads.findMany({
      where,
      orderBy: [
        { category: "asc" },
        { created_at: "desc" }
      ]
    });
    res.json(files);
  } catch (error) {
    console.error("DOWNLOAD ERROR:", error);
    res.status(500).json({
      error: "failed to fetch downloads",
      message: error.message
    });
  }
};

// GET file download stream with original filename
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await prisma.downloads.findUnique({
      where: { id: parseInt(id) }
    });

    if (!file || !file.file_path) {
      return res.status(404).json({ error: "File not found" });
    }

    // ถ้าเป็น URL ภายนอก ให้ redirect ไปยัง URL ปลายทางทันที
    if (file.file_path.startsWith('http://') || file.file_path.startsWith('https://')) {
      return res.redirect(file.file_path);
    }

    // ป้องกัน Path Traversal และ normalize path
    const relPath = file.file_path.replace(/^\/?downloads\/?/, '').replace(/^\/+/, '');
    const absolutePath = path.join(process.cwd(), "uploads/downloads", relPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    const filenameToSend = file.file_name || `${file.title}${path.extname(absolutePath)}`;
    res.download(absolutePath, filenameToSend);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
};

// POST create download
export const createDownload = async (req, res) => {
  try {
    const { title, title_en, category, audience, file_type, url, link_url } = req.body;
    const directUrl = (url || link_url || req.body.file_url || "").trim();

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "กรุณาระบุชื่อเอกสาร" });
    }

    if (!req.file && !directUrl) {
      return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์หรือระบุลิงก์ (URL)" });
    }

    // กรณีระบุลิงก์ภายนอก (URL)
    if (directUrl) {
      const file = await prisma.downloads.create({
        data: {
          title: title.trim(),
          title_en: title_en ? title_en.trim() : null,
          category: category?.trim() || "ทั่วไป",
          audience: audience?.trim() || "student",
          file_type: (file_type || "LINK").toUpperCase(),
          file_path: directUrl,
          file_name: directUrl
        }
      });
      return res.status(201).json(file);
    }

    // กรณีอัปโหลดไฟล์จริง
    const originalName = decodeOriginalName(req.file.originalname);
    const ext = path.extname(originalName).replace(".", "").toUpperCase();
    const file = await prisma.downloads.create({
      data: {
        title: title.trim(),
        title_en: title_en ? title_en.trim() : null,
        category: category?.trim() || "ทั่วไป",
        audience: audience?.trim() || "student",
        file_type: file_type || ext || "PDF",
        file_path: req.file.filename,
        file_name: originalName || req.file.filename
      }
    });

    res.status(201).json(file);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

// PUT update download
export const updateDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, title_en, category, audience, file_type, url, link_url } = req.body;
    const directUrl = (url || link_url || req.body.file_url || "").trim();

    const existing = await prisma.downloads.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existing) {
      return res.status(404).json({ error: "File not found" });
    }

    const data = {
      title: title ? title.trim() : existing.title,
      title_en: title_en !== undefined ? (title_en ? title_en.trim() : null) : existing.title_en,
      category: category ? category.trim() : existing.category,
      audience: audience ? audience.trim() : existing.audience,
      file_type: file_type || existing.file_type
    };

    if (directUrl) {
      data.file_path = directUrl;
      data.file_name = directUrl;
      data.file_type = (file_type || "LINK").toUpperCase();

      // ลบไฟล์เดิมบนดิสก์ถ้าเปลี่ยนจากไฟล์จริงเป็น URL
      if (existing.file_path && !existing.file_path.startsWith('http://') && !existing.file_path.startsWith('https://')) {
        const oldClean = existing.file_path.replace(/^\/?downloads\/?/, '').replace(/^\/+/, '');
        const oldFilePath = path.join(process.cwd(), "uploads/downloads", oldClean);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (e) {
            console.error("Failed to delete old file:", e);
          }
        }
      }
    } else if (req.file) {
      const originalName = decodeOriginalName(req.file.originalname);
      data.file_path = req.file.filename;
      data.file_name = originalName || req.file.filename;
      data.file_type = path.extname(originalName).replace(".", "").toUpperCase();

      // ลบไฟล์เดิมบนดิสก์
      if (existing.file_path && !existing.file_path.startsWith('http://') && !existing.file_path.startsWith('https://')) {
        const oldClean = existing.file_path.replace(/^\/?downloads\/?/, '').replace(/^\/+/, '');
        const oldFilePath = path.join(process.cwd(), "uploads/downloads", oldClean);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (e) {
            console.error("Failed to delete old file:", e);
          }
        }
      }
    }

    const updated = await prisma.downloads.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(updated);
  } catch (err) {
    console.error("Update download error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

// DELETE download
export const deleteDownload = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.downloads.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existing) {
      return res.status(404).json({ error: "File not found" });
    }

    // ลบไฟล์บนดิสก์เฉพาะกรณีไม่ใช่ URL ภายนอก
    if (existing.file_path && !existing.file_path.startsWith('http://') && !existing.file_path.startsWith('https://')) {
      const relPath = existing.file_path.replace(/^\/?downloads\/?/, '').replace(/^\/+/, '');
      const filePath = path.join(process.cwd(), "uploads/downloads", relPath);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Failed to delete file from disk:", e);
        }
      }
    }

    await prisma.downloads.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete download error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};