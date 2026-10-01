import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

export const defaultQuickActions = [
  { id: 1, label: 'ระบบคำร้องออนไลน์', path: 'https://reg.kmutnb.ac.th/registrar/home', isExternal: true, icon: 'Monitor' },
  { id: 2, label: 'ปฏิทินการศึกษา', path: 'https://acdserv.kmutnb.ac.th/academic-calendar', isExternal: true, icon: 'Calendar' },
  { id: 3, label: 'ดาวน์โหลดเอกสาร', path: '/student-downloads', isExternal: false, icon: 'Download' },
  { id: 4, label: 'ระบบประเมินอาจารย์', path: 'https://reg4.kmutnb.ac.th/registrar/home', isExternal: true, icon: 'ClipboardCheck' }
];

export const defaultFeaturedCourses = [
  { id: 'cs-normal', level: 'bachelor', title: 'หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาตรี ภาคปกติ)', enTitle: 'BACHELOR OF SCIENCE PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' },
  { id: 'cs-english', level: 'cs-english', title: 'หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาตรี โครงการพิเศษ สองภาษา)', enTitle: 'BACHELOR OF SCIENCE PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1684503830683-108f3e0fd03f?auto=format&fit=crop&w=800&q=80' },
  { id: 'cs-master', level: 'cs-master', title: 'หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาโท)', enTitle: 'MASTER OF SCIENCE PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&w=800&q=80' },
  { id: 'se-master', level: 'se-master', title: 'หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์ (ปริญญาโท)', enTitle: 'MASTER OF SCIENCE PROGRAM IN SOFTWARE ENGINEERING', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1727434032773-af3cd98375ba?auto=format&fit=crop&w=800&q=80' },
  { id: 'cs-phd', level: 'doctor', title: 'หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาเอก)', enTitle: 'DOCTOR OF PHILOSOPHY PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80' }
];

// === Banners ===
export const getBanners = async (req, res) => {
  try {
    const banners = await prisma.banners.findMany({
      orderBy: { order_no: 'asc' }
    });
    res.json(banners);
  } catch (error) {
    console.error("Fetch banners error:", error);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { title, image_path, link_url, is_active, order_no } = req.body;
    let finalImagePath = image_path;

    if (req.file) {
      const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (!allowedExts.includes(ext) || !req.file.mimetype.startsWith("image/")) {
        const filePath = path.join(process.cwd(), "uploads/appearance", req.file.filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
        return res.status(400).json({ error: "ไฟล์รูปภาพไม่ถูกต้อง รองรับเฉพาะไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif) เท่านั้น" });
      }
      finalImagePath = `/uploads/appearance/${req.file.filename}`;
    }

    if (!finalImagePath) {
      return res.status(400).json({ error: "กรุณาอัปโหลดรูปภาพแบนเนอร์" });
    }

    const count = await prisma.banners.count();
    const newBanner = await prisma.banners.create({
      data: {
        title: title || `Banner ${count + 1}`,
        image_path: finalImagePath,
        link_url: link_url || null,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        order_no: order_no !== undefined ? parseInt(order_no) : count + 1
      }
    });

    res.status(201).json(newBanner);
  } catch (error) {
    console.error("Create banner error:", error);
    res.status(500).json({ error: "Failed to create banner" });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banners.findUnique({
      where: { id: parseInt(id) }
    });

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    if (banner.image_path && banner.image_path.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), banner.image_path);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error("Failed to delete banner file:", e);
        }
      }
    }

    await prisma.banners.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "ลบแบนเนอร์สำเร็จ" });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({ error: "Failed to delete banner" });
  }
};

// === Site Config (Logo & Settings) ===
export const getSiteConfig = async (req, res) => {
  try {
    const configs = await prisma.site_config.findMany();
    // แปลง array configs เป็น key-value map เพื่อให้ frontend ใช้งานง่าย
    const configMap = {};
    configs.forEach(c => {
      configMap[c.config_key] = c.config_value;
    });
    res.json({ configs, configMap });
  } catch (error) {
    console.error("Fetch configs error:", error);
    res.status(500).json({ error: "Failed to fetch configs" });
  }
};

export const updateSiteConfig = async (req, res) => {
  try {
    const { config_key, config_value, description } = req.body;
    const updatedConfig = await prisma.site_config.upsert({
      where: { config_key },
      update: { config_value, description },
      create: { config_key, config_value, description }
    });
    res.json({ message: "อัปเดตตั้งค่าสำเร็จ", updatedConfig });
  } catch (error) {
    console.error("Update config error:", error);
    res.status(500).json({ error: "Failed to update config" });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์โลโก้" });
    }

    const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExts.includes(ext) || !req.file.mimetype.startsWith("image/")) {
      const filePath = path.join(process.cwd(), "uploads/appearance", req.file.filename);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
      return res.status(400).json({ error: "ไฟล์โลโก้ไม่ถูกต้อง รองรับเฉพาะไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif) เท่านั้น" });
    }

    const logoPath = `/uploads/appearance/${req.file.filename}`;

    const config = await prisma.site_config.upsert({
      where: { config_key: "site_logo" },
      update: { config_value: logoPath },
      create: {
        config_key: "site_logo",
        config_value: logoPath,
        description: "Main website logo"
      }
    });

    res.json({ message: "อัปโหลดโลโก้สำเร็จ", logoPath, config });
  } catch (error) {
    console.error("Upload logo error:", error);
    res.status(500).json({ error: "Failed to upload logo" });
  }
};

// === Quick Actions ===
export const getQuickActions = async (req, res) => {
  try {
    const config = await prisma.site_config.findUnique({
      where: { config_key: "homepage_quick_actions" }
    });

    if (!config || !config.config_value) {
      return res.json({ data: defaultQuickActions });
    }

    try {
      const parsed = JSON.parse(config.config_value);
      return res.json({ data: parsed });
    } catch (e) {
      return res.json({ data: defaultQuickActions });
    }
  } catch (error) {
    console.error("Fetch quick actions error:", error);
    res.status(500).json({ error: "Failed to fetch quick actions" });
  }
};

export const updateQuickActions = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "ข้อมูลปุ่มทางลัดไม่ถูกต้อง" });
    }

    await prisma.site_config.upsert({
      where: { config_key: "homepage_quick_actions" },
      update: {
        config_value: JSON.stringify(data),
        description: "Homepage 4 quick action buttons"
      },
      create: {
        config_key: "homepage_quick_actions",
        config_value: JSON.stringify(data),
        description: "Homepage 4 quick action buttons"
      }
    });

    res.json({ message: "บันทึกปุ่มทางลัดหน้าแรกสำเร็จ", data });
  } catch (error) {
    console.error("Update quick actions error:", error);
    res.status(500).json({ error: "Failed to update quick actions" });
  }
};

// === Featured Courses ===
export const getFeaturedCourses = async (req, res) => {
  try {
    const config = await prisma.site_config.findUnique({
      where: { config_key: "homepage_featured_courses" }
    });

    if (!config || !config.config_value) {
      return res.json({ data: defaultFeaturedCourses });
    }

    try {
      const parsed = JSON.parse(config.config_value);
      return res.json({ data: parsed });
    } catch (e) {
      return res.json({ data: defaultFeaturedCourses });
    }
  } catch (error) {
    console.error("Fetch featured courses error:", error);
    res.status(500).json({ error: "Failed to fetch featured courses" });
  }
};

export const updateFeaturedCourses = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "ข้อมูลหลักสูตรแนะนำไม่ถูกต้อง" });
    }

    await prisma.site_config.upsert({
      where: { config_key: "homepage_featured_courses" },
      update: {
        config_value: JSON.stringify(data),
        description: "Homepage featured courses cards"
      },
      create: {
        config_key: "homepage_featured_courses",
        config_value: JSON.stringify(data),
        description: "Homepage featured courses cards"
      }
    });

    res.json({ message: "บันทึกหลักสูตรแนะนำหน้าแรกสำเร็จ", data });
  } catch (error) {
    console.error("Update featured courses error:", error);
    res.status(500).json({ error: "Failed to update featured courses" });
  }
};

// === Upload Appearance Image ===
export const uploadAppearanceImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์รูปภาพ" });
    }

    const imagePath = `/uploads/appearance/${req.file.filename}`;
    res.json({ message: "อัปโหลดรูปภาพสำเร็จ", imagePath });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};