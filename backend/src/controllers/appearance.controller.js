import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

// ฟอร์มมัลติพาร์ตส่งทุก field มาเป็น string จึงต้องแปลง boolean เอง
const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  return value === true || value === "true";
};

// ลบไฟล์รูปเก่าออกจากดิสก์ (เงียบไว้ถ้าลบไม่สำเร็จ เช่นไฟล์ถูกลบไปแล้ว)
const deleteBannerFile = (imagePath) => {
  if (!imagePath) return;
  const filePath = path.join(process.cwd(), imagePath.replace(/^\//, ""));
  fs.unlink(filePath, () => {});
};

// === Banners ===
export const getBanners = async (req, res) => {
  try {
    const activeOnly = req.query.active === "true";
    const banners = await prisma.banners.findMany({
      where: activeOnly ? { is_active: true } : undefined,
      orderBy: { order_no: 'asc' }
    });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

export const createBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }
    const { title, link_url, is_active, order_no } = req.body;
    const orderNo = order_no !== undefined ? parseInt(order_no) : await prisma.banners.count();
    const newBanner = await prisma.banners.create({
      data: {
        title: title || null,
        image_path: `/uploads/banners/${req.file.filename}`,
        link_url: link_url || null,
        is_active: parseBoolean(is_active, true),
        order_no: Number.isNaN(orderNo) ? 0 : orderNo
      }
    });
    res.status(201).json(newBanner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create banner" });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.banners.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Banner not found" });
    }

    const { title, link_url, is_active, order_no } = req.body;
    const data = {};
    if (title !== undefined) data.title = title || null;
    if (link_url !== undefined) data.link_url = link_url || null;
    if (is_active !== undefined) data.is_active = parseBoolean(is_active, existing.is_active);
    if (order_no !== undefined) data.order_no = parseInt(order_no);
    if (req.file) {
      data.image_path = `/uploads/banners/${req.file.filename}`;
      deleteBannerFile(existing.image_path);
    }

    const updated = await prisma.banners.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update banner" });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.banners.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Banner not found" });
    }
    await prisma.banners.delete({ where: { id } });
    deleteBannerFile(existing.image_path);
    res.json({ message: "ลบแบนเนอร์สำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete banner" });
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