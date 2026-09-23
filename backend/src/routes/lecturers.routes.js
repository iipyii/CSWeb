import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Multer Storage for Lecturer Profile Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/lecturers");
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

// POST /upload-image (Admin only)
router.post("/upload-image", verifyToken, checkRole(["admin", "lecturer"]), upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์รูปภาพ" });
    }
    const imagePath = `/uploads/lecturers/${req.file.filename}`;
    res.json({ message: "อัปโหลดรูปภาพสำเร็จ", imagePath });
  } catch (error) {
    console.error("Upload lecturer image error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// GET all lecturers (Public)
router.get("/", async (req, res) => {
  try {
    const lecturers = await prisma.lecturers.findMany({
      orderBy: {
        id: "asc",
      },
    });
    res.json(lecturers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create lecturer (Admin Only)
router.post("/", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const {
      lecturer_code,
      fullname_th,
      fullname_en,
      position_th,
      position_en,
      email,
      tel,
      education_th,
      education_en,
      image_path,
      orcid,
      scholar_name
    } = req.body;

    if (!lecturer_code || !fullname_th) {
      return res.status(400).json({ error: "กรุณากรอกรหัสอาจารย์และชื่อ-นามสกุลภาษาไทย" });
    }

    const existing = await prisma.lecturers.findUnique({
      where: { lecturer_code: lecturer_code.trim() }
    });

    if (existing) {
      return res.status(400).json({ error: `รหัสอาจารย์ '${lecturer_code}' มีอยู่ในระบบแล้ว` });
    }

    const newLecturer = await prisma.lecturers.create({
      data: {
        lecturer_code: lecturer_code.trim(),
        fullname_th: fullname_th.trim(),
        fullname_en: fullname_en?.trim() || null,
        position_th: position_th?.trim() || "อาจารย์ประจำ",
        position_en: position_en?.trim() || "Lecturer",
        email: email?.trim() || null,
        tel: tel?.trim() || null,
        education_th: education_th?.trim() || null,
        education_en: education_en?.trim() || null,
        image_path: image_path || null,
        orcid: orcid?.trim() || null,
        scholar_name: scholar_name?.trim() || null
      }
    });

    res.status(201).json({ message: "เพิ่มข้อมูลอาจารย์สำเร็จ", lecturer: newLecturer });
  } catch (err) {
    console.error("Create lecturer error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มข้อมูลอาจารย์: " + err.message });
  }
});

// GET my lecturer profile (สำหรับอาจารย์ที่ล็อกอินอยู่)
router.get("/profile/me", verifyToken, async (req, res) => {
  try {
    let lecturerId = req.user.lecturer_id;
    if (!lecturerId && req.user.email) {
      const match = await prisma.lecturers.findFirst({
        where: {
          OR: [
            { email: { equals: req.user.email, mode: "insensitive" } },
            { fullname_th: { contains: req.user.full_name.split(" ").slice(-1)[0] || req.user.full_name } }
          ]
        }
      });
      if (match) lecturerId = match.id;
    }

    if (!lecturerId) {
      return res.status(404).json({ error: "ไม่พบข้อมูลโปรไฟล์อาจารย์ที่เชื่อมโยงกับบัญชีนี้" });
    }

    const lecturer = await prisma.lecturers.findUnique({
      where: { id: lecturerId },
      include: {
        research_publications: {
          orderBy: {
            publication_year: "desc",
          },
        },
      },
    });

    res.json(lecturer);
  } catch (err) {
    console.error("Get my lecturer profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT my lecturer profile
router.put("/profile/me", verifyToken, async (req, res) => {
  try {
    let lecturerId = req.user.lecturer_id;
    if (!lecturerId && req.user.email) {
      const match = await prisma.lecturers.findFirst({
        where: {
          OR: [
            { email: { equals: req.user.email, mode: "insensitive" } },
            { fullname_th: { contains: req.user.full_name.split(" ").slice(-1)[0] || req.user.full_name } }
          ]
        }
      });
      if (match) lecturerId = match.id;
    }

    if (!lecturerId) {
      return res.status(404).json({ error: "ไม่พบข้อมูลโปรไฟล์อาจารย์ที่เชื่อมโยงกับบัญชีนี้" });
    }

    const {
      tel, email, education_th, education_en, orcid, scholar_name, fullname_en, position_th, position_en
    } = req.body;

    const updated = await prisma.lecturers.update({
      where: { id: lecturerId },
      data: {
        tel: tel !== undefined ? tel : undefined,
        email: email !== undefined ? email : undefined,
        education_th: education_th !== undefined ? education_th : undefined,
        education_en: education_en !== undefined ? education_en : undefined,
        orcid: orcid !== undefined ? orcid : undefined,
        scholar_name: scholar_name !== undefined ? scholar_name : undefined,
        fullname_en: fullname_en !== undefined ? fullname_en : undefined,
        position_th: position_th !== undefined ? position_th : undefined,
        position_en: position_en !== undefined ? position_en : undefined
      },
      include: {
        research_publications: {
          orderBy: {
            publication_year: "desc",
          },
        },
      },
    });

    res.json({ message: "บันทึกข้อมูลส่วนตัวสำเร็จ", lecturer: updated });
  } catch (err) {
    console.error("Update my lecturer profile error:", err);
    res.status(500).json({ error: "Failed to update profile: " + err.message });
  }
});

// GET lecturer by code (Public)
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const lecturer = await prisma.lecturers.findUnique({
      where: {
        lecturer_code: code,
      },
      include: {
        research_publications: {
          orderBy: {
            publication_year: "desc",
          },
        },
      },
    });

    if (!lecturer) {
      return res.status(404).json({ error: "Lecturer not found" });
    }

    res.json(lecturer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT lecturer by ID (Admin Only)
router.put("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lecturer_code,
      fullname_th,
      fullname_en,
      position_th,
      position_en,
      email,
      tel,
      education_th,
      education_en,
      image_path,
      orcid,
      scholar_name
    } = req.body;

    const lecturerId = parseInt(id);

    // Check if duplicate code on other records
    if (lecturer_code) {
      const duplicate = await prisma.lecturers.findFirst({
        where: {
          lecturer_code: lecturer_code.trim(),
          NOT: { id: lecturerId }
        }
      });
      if (duplicate) {
        return res.status(400).json({ error: `รหัสอาจารย์ '${lecturer_code}' ถูกใช้งานโดยอาจารย์ท่านอื่นแล้ว` });
      }
    }

    const updated = await prisma.lecturers.update({
      where: { id: lecturerId },
      data: {
        lecturer_code: lecturer_code !== undefined ? lecturer_code.trim() : undefined,
        fullname_th: fullname_th !== undefined ? fullname_th.trim() : undefined,
        fullname_en: fullname_en !== undefined ? fullname_en?.trim() || null : undefined,
        position_th: position_th !== undefined ? position_th?.trim() || null : undefined,
        position_en: position_en !== undefined ? position_en?.trim() || null : undefined,
        email: email !== undefined ? email?.trim() || null : undefined,
        tel: tel !== undefined ? tel?.trim() || null : undefined,
        education_th: education_th !== undefined ? education_th?.trim() || null : undefined,
        education_en: education_en !== undefined ? education_en?.trim() || null : undefined,
        image_path: image_path !== undefined ? image_path : undefined,
        orcid: orcid !== undefined ? orcid?.trim() || null : undefined,
        scholar_name: scholar_name !== undefined ? scholar_name?.trim() || null : undefined
      }
    });

    res.json({ message: "แก้ไขข้อมูลอาจารย์สำเร็จ", lecturer: updated });
  } catch (err) {
    console.error("Admin update lecturer error:", err);
    res.status(500).json({ error: "Failed to update lecturer: " + err.message });
  }
});

// DELETE lecturer by ID (Admin Only)
router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const lecturerId = parseInt(req.params.id);

    // Check existence
    const lecturer = await prisma.lecturers.findUnique({
      where: { id: lecturerId },
      include: {
        advisors: true,
        projects: true,
        co_projects: true
      }
    });

    if (!lecturer) {
      return res.status(404).json({ error: "ไม่พบข้อมูลอาจารย์ที่ต้องการลบ" });
    }

    // Unlink projects advisors safely
    await prisma.projects.updateMany({
      where: { advisor_id: lecturerId },
      data: { advisor_id: null }
    });
    await prisma.projects.updateMany({
      where: { co_advisor_id: lecturerId },
      data: { co_advisor_id: null }
    });

    // Delete advisor relations
    await prisma.advisor_students.deleteMany({
      where: {
        advisor: { lecturerId: lecturerId }
      }
    });
    await prisma.advisors.deleteMany({
      where: { lecturerId: lecturerId }
    });

    // Delete research publications
    await prisma.research_publications.deleteMany({
      where: { lecturer_id: lecturerId }
    });

    // Delete lecturer
    await prisma.lecturers.delete({
      where: { id: lecturerId }
    });

    res.json({ message: "ลบข้อมูลอาจารย์เรียบร้อยแล้ว" });
  } catch (err) {
    console.error("Admin delete lecturer error:", err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบข้อมูลอาจารย์: " + err.message });
  }
});

export default router;