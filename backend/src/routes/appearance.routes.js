import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getSiteConfig,
  updateSiteConfig
} from "../controllers/appearance.controller.js";

const router = express.Router();

const uploadDir = "uploads/banners";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, unique);
  }
});

const upload = multer({ storage });

router.get("/banners", getBanners);
router.post("/banners", upload.single("image"), createBanner);
router.put("/banners/:id", upload.single("image"), updateBanner);
router.delete("/banners/:id", deleteBanner);

router.get("/settings", getSiteConfig);
router.post("/settings", updateSiteConfig);

export default router;