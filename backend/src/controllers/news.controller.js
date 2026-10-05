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

// คำนวณขอบเขตวันปัจจุบันตามเวลาประเทศไทย (Asia/Bangkok) สำหรับคอลัมน์ @db.Date
const getBangkokDateBounds = () => {
  const bkkDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());
  // สำหรับ Prisma กับ PostgreSQL @db.Date ฟิลด์เป็น DATE บริสุทธิ์
  // ต้องส่ง Date object ที่มีเวลา UTC 00:00:00.000Z ของวันที่ bkkDate เพื่อไม่ให้เกิด timezone shift
  const todayDateUtc = new Date(`${bkkDate}T00:00:00.000Z`);
  return { bkkDate, todayDateUtc };
};

// แปลง Input วันที่สำหรับคอลัมน์ @db.Date (PostgreSQL DATE)
// ต้องให้ค่า UTC ตรงกับวันที่ที่ผู้ใช้เลือก (YYYY-MM-DD)
// เพื่อไม่ให้เกิดปัญหา Timezone Offset ลบถอยหลัง 1 วันเมื่อบันทึกลงฐานข้อมูล
const parseDateInput = (val) => {
  if (!val || val === "null" || val === "undefined" || val === "") return null;
  const str = String(val).trim();
  const match = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) {
    return new Date(`${match[1]}T00:00:00.000Z`);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// ตรวจสอบและย้ายข่าวที่หมดอายุ (end_date < ปัจจุบัน) ไปยังคลังข่าว (status: 'archived') อัตโนมัติ
const autoArchiveExpiredNews = async () => {
  try {
    const { todayDateUtc } = getBangkokDateBounds();
    await prisma.news.updateMany({
      where: {
        status: "active",
        end_date: {
          lt: todayDateUtc
        }
      },
      data: {
        status: "archived"
      }
    });
  } catch (e) {
    console.error("autoArchiveExpiredNews error:", e);
  }
};

// จัดเรียงข่าวสารตามวันเผยแพร่ที่กำหนดเอง (start_date) หรือวันสร้างจริง (created_at) จากใหม่ไปเก่า
const sortByEffectiveDate = (list) => {
  if (!Array.isArray(list)) return list;
  return list.sort((a, b) => {
    const timeA = new Date(a.start_date || a.created_at).getTime();
    const timeB = new Date(b.start_date || b.created_at).getTime();
    return timeB - timeA;
  });
};

// ✅ GET active news (เฉพาะข่าวที่ถึงกำหนดเผยแพร่ start_date <= วันนี้ และยังไม่หมดอายุ)
export const getActiveNews = async (req, res) => {
  try {
    await autoArchiveExpiredNews();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const { todayDateUtc } = getBangkokDateBounds();

    const news = await prisma.news.findMany({
      where: {
        status: "active",
        AND: [
          {
            OR: [
              { start_date: null },
              { start_date: { lte: todayDateUtc } }
            ]
          },
          {
            OR: [
              { end_date: null },
              { end_date: { gte: todayDateUtc } }
            ]
          }
        ]
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    sortByEffectiveDate(news);
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ POST news (admin only)
export const createNews = async (req, res) => {
  try {
    const { title, content, summary, category, start_date, end_date, is_urgent } = req.body;

    // 1. ดึงไฟล์รูปหน้าปก (ถ้ามี)
    const imagePath = req.files?.['image'] ? `/uploads/${req.files['image'][0].filename}` : null;

    // 2. ดึงรูปเพิ่มเติม (จับมา map เป็น Array ของชื่อไฟล์)
    const additionalImages = req.files?.['additional_images']
      ? req.files['additional_images'].map(file => `/uploads/${file.filename}`)
      : [];

    // 3. ดึงไฟล์เอกสาร พร้อมบันทึกชื่อไฟล์เดิม (Original Name) เพื่อแสดงผลและดาวน์โหลด
    const attachments = req.files?.['attachments']
      ? req.files['attachments'].map(file => {
          const origName = decodeOriginalName(file.originalname);
          return JSON.stringify({
            path: `/uploads/${file.filename}`,
            name: origName || file.filename,
            size: file.size
          });
        })
      : [];

    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

    const parsedStartDate = parseDateInput(start_date);
    const parsedEndDate = parseDateInput(end_date);

    // ตรวจสอบวันสิ้นสุด: ถ้าสิ้นสุดเป็นวันที่ผ่านมาแล้ว ให้ย้ายเข้าคลังข่าว (status: 'archived') ทันที
    let finalStatus = "active";
    if (parsedEndDate) {
      const { todayDateUtc } = getBangkokDateBounds();
      if (parsedEndDate < todayDateUtc) {
        finalStatus = "archived";
      }
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        summary: summary || null,
        category,
        image: imagePath,
        status: finalStatus,
        additional_images: additionalImages,
        attachments: attachments,
        start_date: parsedStartDate || undefined,
        end_date: parsedEndDate || undefined,
        is_urgent: is_urgent === 'true' || is_urgent === true,
        users: {
          connect: { id: 1 }
        }
      },
    });

    res.status(201).json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

// ✅ GET all news (admin)
export const getAllNews = async (req, res) => {
  try {
    await autoArchiveExpiredNews();

    const news = await prisma.news.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
    sortByEffectiveDate(news);
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ UPDATE news
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.news.findUnique({
      where: { id: Number(id) }
    });

    if (!existing) {
      return res.status(404).json({ message: "News not found" });
    }

    const {
      title,
      content,
      summary,
      category,
      status,
      start_date,
      end_date,
      is_urgent,
      existing_additional_images,
      existing_attachments
    } = req.body;

    // 2. จัดการไฟล์รูปภาพเพิ่มเติมเดิม (ถ้าไม่ได้ส่ง field นี้มา ให้คงของเดิมไว้ ไม่ลบทิ้ง!)
    let finalExtraImages = existing.additional_images || [];
    if (existing_additional_images !== undefined) {
      try {
        const parsed = JSON.parse(existing_additional_images);
        finalExtraImages = Array.isArray(parsed) 
          ? parsed.map(url => typeof url === 'string' ? url.replace('http://localhost:5000', '') : url)
          : [];
      } catch (e) {
        finalExtraImages = [];
      }
    }

    // จัดการไฟล์เอกสารแนบเดิม (ถ้าไม่ได้ส่ง field นี้มา ให้คงของเดิมไว้ ไม่ลบทิ้ง!)
    let finalAttachments = existing.attachments || [];
    if (existing_attachments !== undefined) {
      try {
        const parsed = JSON.parse(existing_attachments);
        finalAttachments = Array.isArray(parsed)
          ? parsed.map(item => typeof item === 'object' ? JSON.stringify(item) : item)
          : [];
      } catch (e) {
        finalAttachments = [];
      }
    }

    // 3. จัดการไฟล์ใหม่
    let coverImagePath = existing.image;

    if (req.files) {
      // 3.1 รูปหน้าปกใหม่
      if (req.files['image'] && req.files['image'].length > 0) {
        coverImagePath = `/uploads/${req.files['image'][0].filename}`;
      }

      // 3.2 รูปเพิ่มเติมใหม่
      if (req.files['additional_images'] && req.files['additional_images'].length > 0) {
        const newExtraImagesPaths = req.files['additional_images'].map(file => `/uploads/${file.filename}`);
        finalExtraImages = [...finalExtraImages, ...newExtraImagesPaths];
      }

      // 3.3 เอกสารแนบใหม่ พร้อมบันทึกชื่อไฟล์เดิม
      if (req.files['attachments'] && req.files['attachments'].length > 0) {
        const newAttachmentsPaths = req.files['attachments'].map(file => {
          const origName = decodeOriginalName(file.originalname);
          return JSON.stringify({
            path: `/uploads/${file.filename}`,
            name: origName || file.filename,
            size: file.size
          });
        });
        finalAttachments = [...finalAttachments, ...newAttachmentsPaths];
      }
    }

    // จัดการวันที่ (ถ้าไม่ได้ส่งมา ให้คงของเดิมไว้)
    let finalStartDate = existing.start_date;
    if (start_date !== undefined) {
      finalStartDate = parseDateInput(start_date);
    }

    let finalEndDate = existing.end_date;
    if (end_date !== undefined) {
      finalEndDate = parseDateInput(end_date);
    }

    // จัดการสถานะและการกู้คืน (Restore)
    let finalStatus = status !== undefined ? status : existing.status;
    const { todayDateUtc } = getBangkokDateBounds();
    
    // ถ้าผู้ใช้ระบุ end_date มา และวันสิ้นสุดเป็นอดีต -> ย้ายเข้า archived
    if (end_date !== undefined && finalEndDate) {
      if (finalEndDate < todayDateUtc) {
        finalStatus = "archived";
      }
    }

    // กรณีพิเศษ: กด "กู้คืน" จากคลังข่าว (status: 'active' และไม่ได้ส่ง end_date มาใหม่)
    // หากวันสิ้นสุดเดิมในอดีตหมดอายุไปแล้ว ให้ล้างวันสิ้นสุด (เป็น null) 
    // เพื่อไม่ให้ autoArchiveExpiredNews ดึงข่าวกลับเข้าคลังทันทีที่รีเฟรชหน้าเว็บ!
    if (status === 'active' && end_date === undefined && finalEndDate) {
      if (finalEndDate < todayDateUtc) {
        finalEndDate = null;
      }
    }

    // 4. ข้อมูลสำหรับอัปเดตลง Database (ถ้า field ไหนไม่ได้ส่งมา ให้คงของเดิมไว้ทั้งหมด)
    const updateData = {
      title: title !== undefined ? title : existing.title,
      content: content !== undefined ? content : existing.content,
      summary: summary !== undefined ? summary : existing.summary,
      category: category !== undefined ? category : existing.category,
      status: finalStatus,
      start_date: finalStartDate,
      end_date: finalEndDate,
      is_urgent: is_urgent !== undefined ? (is_urgent === 'true' || is_urgent === true) : existing.is_urgent,
      image: coverImagePath,
      additional_images: finalExtraImages,
      attachments: finalAttachments,
    };

    const updated = await prisma.news.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(500).json({ error: error.message || "Server error" });
  }
};

// ✅ Permanent delete
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await prisma.news.findUnique({
      where: { id: Number(id) },
    });

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    // ลบไฟล์รูปหน้าปก (ถ้ามี)
    if (news.image && news.image.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", news.image);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
    }

    // ลบไฟล์รูปภาพเพิ่มเติม (ถ้ามี)
    if (news.additional_images && Array.isArray(news.additional_images)) {
      news.additional_images.forEach(img => {
        if (img && img.startsWith("/uploads/")) {
          const filePath = path.join(process.cwd(), "public", img);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
          }
        }
      });
    }

    // ลบไฟล์เอกสารแนบ (ถ้ามี)
    if (news.attachments && Array.isArray(news.attachments)) {
      news.attachments.forEach(att => {
        let attPath = att;
        if (typeof att === 'string' && att.startsWith('{')) {
          try { attPath = JSON.parse(att).path; } catch {}
        }
        if (attPath && attPath.startsWith("/uploads/")) {
          const filePath = path.join(process.cwd(), "public", attPath);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
          }
        }
      });
    }

    await prisma.news.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "ลบข่าวสารเรียบร้อยแล้ว" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET by ID
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await prisma.news.findUnique({
      where: { id: Number(id) },
    });

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET archived news
export const getArchivedNews = async (req, res) => {
  try {
    await autoArchiveExpiredNews();

    const news = await prisma.news.findMany({
      where: {
        status: "archived",
      },
      orderBy: {
        created_at: "desc",
      },
    });

    sortByEffectiveDate(news);
    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getLatestNews = async (req, res) => {
  try {
    await autoArchiveExpiredNews();

    const { todayDateUtc } = getBangkokDateBounds();

    const news = await prisma.news.findMany({
      where: { 
        status: "active",
        AND: [
          {
            OR: [
              { start_date: null },
              { start_date: { lte: todayDateUtc } }
            ]
          },
          {
            OR: [
              { end_date: null },
              { end_date: { gte: todayDateUtc } }
            ]
          }
        ]
      },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    sortByEffectiveDate(news);
    res.json(news.slice(0, 5));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getNewsByCategory = async (req, res) => {
  try {
    await autoArchiveExpiredNews();

    const { category } = req.params;
    const { todayDateUtc } = getBangkokDateBounds();

    const news = await prisma.news.findMany({
      where: {
        category,
        status: "active",
        AND: [
          {
            OR: [
              { start_date: null },
              { start_date: { lte: todayDateUtc } }
            ]
          },
          {
            OR: [
              { end_date: null },
              { end_date: { gte: todayDateUtc } }
            ]
          }
        ]
      },
      orderBy: {
        created_at: "desc",
      },
    });

    sortByEffectiveDate(news);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ ดาวน์โหลดเอกสารแนบพร้อมระบุชื่อไฟล์เดิม (Original Name)
export const downloadAttachment = async (req, res) => {
  try {
    const filePath = req.query.path;
    const downloadName = req.query.name;

    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    // ป้องกัน Path Traversal และค้นหาทั้ง public/uploads และ uploads
    let cleanPath = filePath.replace(/^\/+/, '');
    if (cleanPath.startsWith('public/')) {
      cleanPath = cleanPath.replace(/^public\//, '');
    }
    let absolutePath = path.join(process.cwd(), "public", cleanPath);
    if (!fs.existsSync(absolutePath)) {
      const alt = path.join(process.cwd(), cleanPath);
      if (fs.existsSync(alt)) {
        absolutePath = alt;
      } else {
        return res.status(404).json({ error: "File not found" });
      }
    }

    const filenameToSend = downloadName || path.basename(absolutePath);
    res.download(absolutePath, filenameToSend);
  } catch (error) {
    console.error("Download attachment error:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
};