import { prisma } from "../lib/prisma.js";

// ✅ GET active news
export const getActiveNews = async (req, res) => {
  try {
    const today = new Date();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const news = await prisma.news.findMany({
      where: {
        status: "active",
        start_date: {
          lte: today,
        },
        OR: [
          { end_date: null },
          { end_date: { gte: today } },
        ],
      },
      orderBy: {
        created_at: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ POST news (admin only)
export const createNews = async (req, res) => {
  try {
    const { title, content, category, start_date, end_date } = req.body;

    // 1. ดึงไฟล์รูปหน้าปก (ถ้ามี)
    const imagePath = req.files?.['image'] ? `/uploads/${req.files['image'][0].filename}` : null;

    // 2. ดึงรูปเพิ่มเติม (จับมา map เป็น Array ของชื่อไฟล์)
    const additionalImages = req.files?.['additional_images']
      ? req.files['additional_images'].map(file => `/uploads/${file.filename}`)
      : [];

    // 3. ดึงไฟล์เอกสาร (จับมา map เป็น Array ของชื่อไฟล์)
    const attachments = req.files?.['attachments']
      ? req.files['attachments'].map(file => `/uploads/${file.filename}`)
      : [];

    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        category,
        image: imagePath,
        status: "active",
        additional_images: additionalImages, // 🌟 บันทึก Array รูปลง DB
        attachments: attachments,            // 🌟 บันทึก Array เอกสารลง DB
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,

        users: {
          // connect: { id: req.user.id }
          connect: { id: 1 }
        }
        // created_by: req.user.id, // ต้องมี auth middleware ก่อน
      },
    });

    res.status(201).json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }

};

// ✅ GET all news (admin)
export const getAllNews = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

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
    const {
      title,
      content,
      category,
      status,
      start_date,
      end_date,
      is_urgent,
      existing_additional_images,
      existing_attachments
    } = req.body;

    // 2. จัดการไฟล์เดิม: แปลงจาก JSON String กลับเป็น Array และตัด URL ทิ้งให้เหลือแค่ Path
    let finalExtraImages = [];
    if (existing_additional_images) {
      const parsed = JSON.parse(existing_additional_images);
      finalExtraImages = parsed.map(url => url.replace('http://localhost:5000', ''));
    }

    let finalAttachments = [];
    if (existing_attachments) {
      const parsed = JSON.parse(existing_attachments);
      finalAttachments = parsed.map(url => url.replace('http://localhost:5000', ''));
    }

    // 3. จัดการไฟล์ใหม่: ถ้ามีการอัปโหลดไฟล์เข้ามาทาง req.files
    let newCoverImagePath = undefined;

    if (req.files) {
      // 3.1 รูปหน้าปกใหม่
      if (req.files['image'] && req.files['image'].length > 0) {
        newCoverImagePath = `/uploads/${req.files['image'][0].filename}`;
      }

      // 3.2 รูปเพิ่มเติมใหม่ (เอาไปต่อท้าย Array เดิม)
      if (req.files['additional_images']) {
        const newExtraImagesPaths = req.files['additional_images'].map(file => `/uploads/${file.filename}`);
        finalExtraImages = [...finalExtraImages, ...newExtraImagesPaths];
      }

      // 3.3 เอกสารแนบใหม่ (เอาไปต่อท้าย Array เดิม)
      if (req.files['attachments']) {
        const newAttachmentsPaths = req.files['attachments'].map(file => `/uploads/${file.filename}`);
        finalAttachments = [...finalAttachments, ...newAttachmentsPaths];
      }
    }

    // 4. เตรียมข้อมูลสำหรับอัปเดตลง Database
    const updateData = {
      title,
      content,
      category,
      // หาก Frontend ไม่ได้ส่ง status มา มันจะเป็น undefined ซึ่ง Prisma จะข้ามการอัปเดตฟิลด์นี้ไปเอง
      status: status !== undefined ? status : undefined,
      start_date: start_date && start_date !== "null" ? new Date(start_date) : null,
      end_date: end_date && end_date !== "null" ? new Date(end_date) : null,
      is_urgent: is_urgent === 'true', // แปลงจาก String 'true'/'false' เป็น Boolean
      additional_images: finalExtraImages,
      attachments: finalAttachments,
    };

    // อัปเดตฟิลด์ image เฉพาะตอนที่มีการเปลี่ยนรูปปกใหม่
    if (newCoverImagePath) {
      updateData.image = newCoverImagePath;
    }

    // 5. สั่งอัปเดตผ่าน Prisma
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

    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Soft delete (archive)
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.news.update({
      where: { id: Number(id) },
      data: {
        status: "archived",
      },
    });

    res.json({ message: "News archived (soft deleted)" });
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
    const news = await prisma.news.findMany({
      where: {
        status: "archived",
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getLatestNews = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      where: { status: "active" },
      orderBy: { created_at: "desc" },
      take: 5,
    });

    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const news = await prisma.news.findMany({
      where: {
        category,
        status: "active",
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};