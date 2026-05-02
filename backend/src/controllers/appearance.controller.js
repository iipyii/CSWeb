import { prisma } from "../lib/prisma.js";

// === Banners ===
export const getBanners = async (req, res) => {
  try {
    const banners = await prisma.banners.findMany({
      orderBy: { order_no: 'asc' }
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { title, image_path, link_url, is_active, order_no } = req.body;
    const newBanner = await prisma.banners.create({
      data: { title, image_path, link_url, is_active, order_no: parseInt(order_no) || 0 }
    });
    res.status(201).json(newBanner);
  } catch (error) {
    res.status(500).json({ error: "Failed to create banner" });
  }
};

// === Site Config (Logo & Settings) ===
export const getSiteConfig = async (req, res) => {
  try {
    const configs = await prisma.site_config.findMany();
    res.json(configs);
  } catch (error) {
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
    res.status(500).json({ error: "Failed to update config" });
  }
};