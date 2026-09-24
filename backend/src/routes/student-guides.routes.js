import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

export const defaultStudentGuides = [
  { id: "1", title: "คู่มือการลงทะเบียน", type: "Manual", year: "ทั่วไป", url: "https://reg.kmutnb.ac.th/Download/MAN_UW-KMUTNB63-REG-02-student_Register.pdf", order: 1 },
  { id: "2", title: "คู่มือนักศึกษา ปี 2568", type: "PDF", year: "2568", url: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2025/03/student_manual2568_1.pdf", order: 2 },
  { id: "3", title: "คู่มือนักศึกษา ปี 2567", type: "PDF", year: "2567", url: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2024/04/stdHB2567.pdf", order: 3 },
  { id: "4", title: "คู่มือนักศึกษา ปี 2566", type: "PDF", year: "2566", url: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2023/03/stdHB2566_edit_15092023.pdf", order: 4 },
  { id: "5", title: "คู่มือนักศึกษา ปี 2565", type: "PDF", year: "2565", url: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2022/03/StdHB2565.pdf", order: 5 },
  { id: "6", title: "คู่มือนักศึกษา ปี 2564", type: "PDF", year: "2564", url: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2021/02/studentHandBook2564.pdf", order: 6 },
  { id: "7", title: "คู่มือนักศึกษา ปี 2563", type: "PDF", year: "2563", url: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2020/07/ManualStu63.pdf", order: 7 }
];

/* ---------- multer config for uploaded guides ---------- */
const uploadDir = path.join(process.cwd(), "uploads", "guides");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/guides");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "guide-" + Date.now() + ext);
  },
});

const upload = multer({ storage });

// GET all student guides (Public)
router.get("/", async (req, res) => {
  try {
    const config = await prisma.site_config.findUnique({
      where: { config_key: "student_guides" }
    });

    if (!config || !config.config_value) {
      return res.json({ data: defaultStudentGuides });
    }

    try {
      const parsed = JSON.parse(config.config_value);
      return res.json({ data: Array.isArray(parsed) ? parsed : defaultStudentGuides });
    } catch (e) {
      return res.json({ data: defaultStudentGuides });
    }
  } catch (error) {
    console.error("Get student guides error:", error);
    res.status(500).json({ error: "Failed to fetch student guides" });
  }
});

// POST update all student guides (Admin / Lecturer)
router.post("/", verifyToken, checkRole(["admin", "lecturer"]), async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "ข้อมูลคู่มือนักศึกษาไม่ถูกต้อง" });
    }

    await prisma.site_config.upsert({
      where: { config_key: "student_guides" },
      update: {
        config_value: JSON.stringify(data),
        description: "Student handbooks and guides list"
      },
      create: {
        config_key: "student_guides",
        config_value: JSON.stringify(data),
        description: "Student handbooks and guides list"
      }
    });

    res.json({ message: "บันทึกข้อมูลคู่มือนักศึกษาสำเร็จ", data });
  } catch (error) {
    console.error("Update student guides error:", error);
    res.status(500).json({ error: "Failed to update student guides" });
  }
});

// POST upload guide PDF file
router.post("/upload-file", verifyToken, checkRole(["admin", "lecturer"]), upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "กรุณาแนบไฟล์ PDF" });
  }
  const fileUrl = `/uploads/guides/${req.file.filename}`;
  res.json({ fileUrl, originalName: req.file.originalname });
});

export default router;
