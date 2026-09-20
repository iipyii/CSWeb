import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

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

// GET downloads by audience (staff | student)
export const getDownloadsByAudience = async (req, res) => {
  try {
    const { audience } = req.params;
    const files = await prisma.downloads.findMany({
      where: { audience },
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

// POST create download
export const createDownload = async (req, res) => {
  try {
    const { title, category, audience, file_type } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    const ext = path.extname(req.file.originalname).replace(".", "").toUpperCase();
    const file = await prisma.downloads.create({
      data: {
        title,
        category: category || "general",
        audience: audience || "student",
        file_type: file_type || ext || "PDF",
        file_path: req.file.filename
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
    const { title, category, audience, file_type } = req.body;

    const existing = await prisma.downloads.findUnique({
      where: { id: parseInt(id) }
    });
    if (!existing) {
      return res.status(404).json({ error: "File not found" });
    }

    const data = {
      title: title || existing.title,
      category: category || existing.category,
      audience: audience || existing.audience,
      file_type: file_type || existing.file_type
    };

    if (req.file) {
      data.file_path = req.file.filename;
      data.file_type = path.extname(req.file.originalname).replace(".", "").toUpperCase();

      // Delete old file if present
      const oldFilePath = path.join(process.cwd(), "uploads/downloads", existing.file_path);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.error("Failed to delete old file:", e);
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

    const filePath = path.join(process.cwd(), "uploads/downloads", existing.file_path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Failed to delete file from disk:", e);
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