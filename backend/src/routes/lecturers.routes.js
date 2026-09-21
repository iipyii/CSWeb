import express from "express";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

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

// PUT my lecturer profile (อัปเดตข้อมูลตนเอง เช่น ประวัติการศึกษา ผลงานวิจัย ช่องทางติดต่อ)
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
    const data = req.body;

    const updated = await prisma.lecturers.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({ message: "แก้ไขข้อมูลอาจารย์สำเร็จ", lecturer: updated });
  } catch (err) {
    console.error("Admin update lecturer error:", err);
    res.status(500).json({ error: "Failed to update lecturer" });
  }
});

export default router;