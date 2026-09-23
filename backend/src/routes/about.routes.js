import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getOrganization,
  updateOrganization,
  getHistory,
  updateHistory,
  getContact,
  updateContact,
  uploadAboutImage
} from "../controllers/about.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/about");
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
  return cb(new Error("รูปภาพต้องเป็นไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif) เท่านั้น"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Organization Routes
router.get("/organization", getOrganization);
router.post("/organization", updateOrganization);

// History Routes
router.get("/history", getHistory);
router.post("/history", updateHistory);

// Contact Routes
router.get("/contact", getContact);
router.post("/contact", updateContact);

// Upload Image
router.post("/upload-image", upload.single("image"), uploadAboutImage);

export default router;
