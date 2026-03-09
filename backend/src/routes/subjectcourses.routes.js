import express from "express";
import multer from "multer";

import {
  getCourseYears,
  getCourses,
  uploadCourse
} from "../controllers/subjectcourses.controller.js";

const router = express.Router();

/* ---------- multer config ---------- */

const storage = multer.diskStorage({
  destination: "uploads/course",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ---------- routes ---------- */

router.get("/years", getCourseYears);

router.get("/:year/:semester", getCourses);

router.post("/upload", upload.single("file"), uploadCourse);

export default router;