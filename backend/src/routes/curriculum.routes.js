import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getAllPrograms,
  getProgramById,
  getDegrees,
  createProgram,
  updateProgram,
  deleteProgram,
  addProgramVersion,
  deleteProgramVersion,
  uploadSectionPdf,
  deleteSectionPdf
} from "../controllers/curriculum.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Configure Multer for Course Sections PDF Uploads
const uploadDir = "uploads/courses";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `section_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("รองรับเฉพาะไฟล์ PDF เท่านั้น"));
    }
  }
});

// Public routes
router.get("/programs", getAllPrograms);
router.get("/programs/:id", getProgramById);
router.get("/degrees", getDegrees);

// Protected Admin routes
router.post("/programs", verifyToken, checkRole(["admin"]), createProgram);
router.put("/programs/:id", verifyToken, checkRole(["admin"]), updateProgram);
router.delete("/programs/:id", verifyToken, checkRole(["admin"]), deleteProgram);

router.post("/versions", verifyToken, checkRole(["admin"]), addProgramVersion);
router.delete("/versions/:versionId", verifyToken, checkRole(["admin"]), deleteProgramVersion);

router.post("/sections/upload-pdf", verifyToken, checkRole(["admin"]), upload.single("file"), uploadSectionPdf);
router.delete("/sections/:sectionId/pdf", verifyToken, checkRole(["admin"]), deleteSectionPdf);

export default router;