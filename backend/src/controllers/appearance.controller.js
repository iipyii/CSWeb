import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

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
      finalImagePath = `/uploads/appearance/${req.file.filename}`;
    }

    if (!finalImagePath) {
      return res.status(400).json({ error: "Banner image is required" });
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
      return res.status(400).json({ error: "Logo file is required" });
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