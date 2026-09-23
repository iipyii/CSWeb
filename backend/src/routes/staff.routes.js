import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Multer Storage for Staff Profile Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), "uploads/staff");
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
router.post("/upload-image", verifyToken, checkRole(["admin"]), upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์รูปภาพ" });
    }
    const imagePath = `/uploads/staff/${req.file.filename}`;
    res.json({ message: "อัปโหลดรูปภาพสำเร็จ", imagePath });
  } catch (error) {
    console.error("Upload staff image error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// GET all staff (Public)
router.get("/", async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { id: "asc" }
    });

    res.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// GET staff by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const staffId = parseInt(req.params.id);
    const staffMember = await prisma.staff.findUnique({
      where: { id: staffId }
    });

    if (!staffMember) {
      return res.status(404).json({ error: "ไม่พบข้อมูลเจ้าหน้าที่" });
    }

    res.json(staffMember);
  } catch (error) {
    console.error("Error fetching staff by id:", error);
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// POST create staff (Admin Only)
router.post("/", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const {
      staff_code,
      fullname_th,
      fullname_en,
      position_th,
      position_en,
      email,
      image_path
    } = req.body;

    if (!fullname_th) {
      return res.status(400).json({ error: "กรุณากรอกชื่อ-นามสกุลภาษาไทย" });
    }

    // Check staff_code uniqueness if provided
    if (staff_code && staff_code.trim() !== "") {
      const existing = await prisma.staff.findUnique({
        where: { staff_code: staff_code.trim() }
      });
      if (existing) {
        return res.status(400).json({ error: `รหัสเจ้าหน้าที่ '${staff_code}' มีอยู่ในระบบแล้ว` });
      }
    }

    const newStaff = await prisma.staff.create({
      data: {
        staff_code: staff_code?.trim() || null,
        fullname_th: fullname_th.trim(),
        fullname_en: fullname_en?.trim() || null,
        position_th: position_th?.trim() || "เจ้าหน้าที่บริหารงานทั่วไป",
        position_en: position_en?.trim() || "General Administration Officer",
        email: email?.trim() || null,
        image_path: image_path || null
      }
    });

    res.status(201).json({ message: "เพิ่มข้อมูลบุคลากรสายสนับสนุนสำเร็จ", staff: newStaff });
  } catch (error) {
    console.error("Create staff error:", error);
    res.status(500).json({ error: "Failed to create staff: " + error.message });
  }
});

// PUT update staff (Admin Only)
router.put("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const staffId = parseInt(req.params.id);
    const {
      staff_code,
      fullname_th,
      fullname_en,
      position_th,
      position_en,
      email,
      image_path
    } = req.body;

    if (staff_code && staff_code.trim() !== "") {
      const duplicate = await prisma.staff.findFirst({
        where: {
          staff_code: staff_code.trim(),
          NOT: { id: staffId }
        }
      });
      if (duplicate) {
        return res.status(400).json({ error: `รหัสเจ้าหน้าที่ '${staff_code}' ถูกใช้งานแล้ว` });
      }
    }

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: {
        staff_code: staff_code !== undefined ? (staff_code?.trim() || null) : undefined,
        fullname_th: fullname_th !== undefined ? fullname_th.trim() : undefined,
        fullname_en: fullname_en !== undefined ? fullname_en?.trim() || null : undefined,
        position_th: position_th !== undefined ? position_th?.trim() || null : undefined,
        position_en: position_en !== undefined ? position_en?.trim() || null : undefined,
        email: email !== undefined ? email?.trim() || null : undefined,
        image_path: image_path !== undefined ? image_path : undefined
      }
    });

    res.json({ message: "แก้ไขข้อมูลบุคลากรสายสนับสนุนสำเร็จ", staff: updated });
  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({ error: "Failed to update staff: " + error.message });
  }
});

// DELETE staff (Admin Only)
router.delete("/:id", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const staffId = parseInt(req.params.id);
    await prisma.staff.delete({
      where: { id: staffId }
    });

    res.json({ message: "ลบข้อมูลบุคลากรสายสนับสนุนสำเร็จ" });
  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({ error: "Failed to delete staff: " + error.message });
  }
});

export default router;