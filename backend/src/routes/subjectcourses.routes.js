import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getCourseYears,
  createCourseYear,
  deleteCourseYear,
  getCourses,
  getAllCourses,
  uploadCourse,
  updateCourse,
  deleteCourse
} from "../controllers/subjectcourses.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

/* ---------- multer config ---------- */
const uploadDir = path.join(process.cwd(), "uploads", "course");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/course");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + ext);
  },
});

const upload = multer({ storage });

/* ---------- public routes ---------- */
router.get("/years", getCourseYears);
router.get("/all", getAllCourses);
router.get("/:year/:semester", getCourses);

/* ---------- protected admin routes ---------- */
router.post("/years", verifyToken, checkRole(["admin"]), createCourseYear);
router.delete("/years/:id", verifyToken, checkRole(["admin"]), deleteCourseYear);

router.post("/upload", verifyToken, checkRole(["admin"]), upload.single("file"), uploadCourse);
router.put("/:id", verifyToken, checkRole(["admin"]), upload.single("file"), updateCourse);
router.delete("/:id", verifyToken, checkRole(["admin"]), deleteCourse);

export default router;