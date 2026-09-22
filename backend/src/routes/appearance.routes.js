import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { 
  getBanners, 
  createBanner, 
  deleteBanner, 
  getSiteConfig, 
  updateSiteConfig,
  uploadLogo
} from "../controllers/appearance.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/appearance");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const ext = path.extname(file.originalname).toLowerCase();
  const isMimeImage = file.mimetype.startsWith("image/");

  if (allowedExtensions.includes(ext) && isMimeImage) {
    return cb(null, true);
  }
  return cb(new Error("รูปภาพต้องเป็นไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif) เท่านั้น ไม่อนุญาตให้อัปโหลดไฟล์ประเภท " + (ext || "นี้")), false);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB
  }
});

const handleSingleUpload = (fieldName) => {
  const single = upload.single(fieldName);
  return (req, res, next) => {
    single(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์รูปภาพ" });
      }
      next();
    });
  };
};

router.get("/banners", getBanners);
router.post("/banners", handleSingleUpload("image"), createBanner);
router.delete("/banners/:id", deleteBanner);

router.get("/settings", getSiteConfig);
router.post("/settings", updateSiteConfig);
router.post("/logo", handleSingleUpload("logo"), uploadLogo);

export default router;