import express from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../lib/prisma.js";

import {
  getDownloads,
  getDownloadsByAudience
} from "../controllers/downloads.controller.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/downloads");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, unique);
  }
});

const upload = multer({ storage });


// GET all downloads
router.get("/", getDownloads);


// GET downloads by audience
router.get("/:audience", getDownloadsByAudience);


// POST upload file
router.post("/upload", upload.single("file"), async (req, res) => {

  try {

    const { title, category, audience, file_type } = req.body;

    const file = await prisma.downloads.create({
      data: {
        title,
        category,
        audience,
        file_type,
        file_path: req.file.filename
      }
    });

    res.json(file);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "Upload failed" });

  }

});

export default router;