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

const upload = multer({ storage });

router.get("/banners", getBanners);
router.post("/banners", upload.single("image"), createBanner);
router.delete("/banners/:id", deleteBanner);

router.get("/settings", getSiteConfig);
router.post("/settings", updateSiteConfig);
router.post("/logo", upload.single("logo"), uploadLogo);

export default router;