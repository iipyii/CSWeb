import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  getDownloads,
  getDownloadStats,
  getDownloadById,
  getDownloadsByAudience,
  createDownload,
  updateDownload,
  deleteDownload
} from "../controllers/downloads.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/downloads");
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

// GET all downloads
router.get("/", getDownloads);

// GET download stats
router.get("/stats", getDownloadStats);

// GET download by ID
router.get("/detail/:id", getDownloadById);

// GET downloads by audience (staff | student)
router.get("/:audience", getDownloadsByAudience);

// POST upload file
router.post("/upload", upload.single("file"), createDownload);

// PUT update file
router.put("/:id", upload.single("file"), updateDownload);

// DELETE file
router.delete("/:id", deleteDownload);

export default router;