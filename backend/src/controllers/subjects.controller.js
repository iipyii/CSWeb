import { prisma } from "../lib/prisma.js";

// GET /api/subjects
export const getSubjects = async (req, res) => {
  try {
    const { keyword, curriculum_code, curriculum_year, degree_level, track, category } = req.query;

    const where = {};

    if (curriculum_code && curriculum_code !== "all" && curriculum_code.trim() !== "") {
      where.curriculum_code = curriculum_code;
    }

    if (curriculum_year && curriculum_year !== "all" && !isNaN(parseInt(curriculum_year))) {
      where.curriculum_year = parseInt(curriculum_year);
    }

    if (degree_level && degree_level !== "all" && degree_level.trim() !== "") {
      where.degree_level = degree_level;
    }

    if (track && track !== "all" && track.trim() !== "") {
      where.track = track;
    }

    if (category && category !== "all" && category.trim() !== "") {
      where.category = category;
    }

    if (keyword && keyword.trim() !== "") {
      const q = keyword.trim();
      where.OR = [
        { subject_code: { contains: q, mode: "insensitive" } },
        { title_th: { contains: q, mode: "insensitive" } },
        { title_en: { contains: q, mode: "insensitive" } },
        { description_th: { contains: q, mode: "insensitive" } },
        { description_en: { contains: q, mode: "insensitive" } }
      ];
    }

    const subjects = await prisma.subjects.findMany({
      where,
      orderBy: [
        { curriculum_year: "desc" },
        { subject_code: "asc" }
      ]
    });

    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลรายวิชาได้" });
  }
};

// GET /api/subjects/:id
export const getSubjectById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const subject = await prisma.subjects.findUnique({
      where: { id }
    });

    if (!subject) {
      return res.status(404).json({ error: "ไม่พบรายวิชานี้" });
    }

    res.json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา" });
  }
};

// POST /api/subjects (Admin only)
export const createSubject = async (req, res) => {
  try {
    const {
      subject_code,
      title_th,
      title_en,
      prereq1,
      prereq2,
      credit,
      description_th,
      description_en,
      category,
      curriculum_code,
      curriculum_year,
      degree_level,
      track
    } = req.body;

    if (!subject_code || !title_th) {
      return res.status(400).json({ error: "กรุณาระบุรหัสวิชาและชื่อวิชาภาษาไทย" });
    }

    const newSubject = await prisma.subjects.create({
      data: {
        subject_code: subject_code.trim(),
        title_th: title_th.trim(),
        title_en: title_en ? title_en.trim() : "",
        prereq1: prereq1 ? prereq1.trim() : "ไม่มี",
        prereq2: prereq2 ? prereq2.trim() : null,
        credit: credit ? credit.trim() : "3(3-0-6)",
        description_th: description_th ? description_th.trim() : "",
        description_en: description_en ? description_en.trim() : "",
        category: category || "หมวดวิชาเฉพาะด้านบังคับ",
        curriculum_code: curriculum_code || "CS69",
        curriculum_year: curriculum_year ? parseInt(curriculum_year) : 2569,
        degree_level: degree_level || "bachelor",
        track: track || "ทั่วไป"
      }
    });

    res.status(201).json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ error: "ไม่สามารถเพิ่มข้อมูลรายวิชาได้" });
  }
};

// PUT /api/subjects/:id (Admin only)
export const updateSubject = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      subject_code,
      title_th,
      title_en,
      prereq1,
      prereq2,
      credit,
      description_th,
      description_en,
      category,
      curriculum_code,
      curriculum_year,
      degree_level,
      track
    } = req.body;

    const updated = await prisma.subjects.update({
      where: { id },
      data: {
        subject_code: subject_code ? subject_code.trim() : undefined,
        title_th: title_th ? title_th.trim() : undefined,
        title_en: title_en !== undefined ? title_en.trim() : undefined,
        prereq1: prereq1 !== undefined ? prereq1.trim() : undefined,
        prereq2: prereq2 !== undefined ? prereq2.trim() : undefined,
        credit: credit ? credit.trim() : undefined,
        description_th: description_th !== undefined ? description_th.trim() : undefined,
        description_en: description_en !== undefined ? description_en.trim() : undefined,
        category: category !== undefined ? category : undefined,
        curriculum_code: curriculum_code !== undefined ? curriculum_code : undefined,
        curriculum_year: curriculum_year ? parseInt(curriculum_year) : undefined,
        degree_level: degree_level !== undefined ? degree_level : undefined,
        track: track !== undefined ? track : undefined
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลรายวิชาได้" });
  }
};

// DELETE /api/subjects/:id (Admin only)
export const deleteSubject = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.subjects.delete({ where: { id } });
    res.json({ message: "ลบรายวิชาสำเร็จ" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ error: "ไม่สามารถลบรายวิชาได้" });
  }
};

// POST /api/subjects/batch-import (Admin only)
export const batchImportSubjects = async (req, res) => {
  try {
    const { subjects: items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "ข้อมูลรายวิชาไม่ถูกต้องหรือว่างเปล่า" });
    }

    let createdCount = 0;
    for (const item of items) {
      if (!item.subject_code || !item.title_th) continue;

      await prisma.subjects.create({
        data: {
          subject_code: String(item.subject_code).trim(),
          title_th: String(item.title_th).trim(),
          title_en: item.title_en ? String(item.title_en).trim() : "",
          prereq1: item.prereq1 ? String(item.prereq1).trim() : "ไม่มี",
          prereq2: item.prereq2 ? String(item.prereq2).trim() : null,
          credit: item.credit ? String(item.credit).trim() : "3(3-0-6)",
          description_th: item.description_th ? String(item.description_th).trim() : "",
          description_en: item.description_en ? String(item.description_en).trim() : "",
          category: item.category || "หมวดวิชาเฉพาะด้านบังคับ",
          curriculum_code: item.curriculum_code || "CS69",
          curriculum_year: item.curriculum_year ? parseInt(item.curriculum_year) : 2569,
          degree_level: item.degree_level || "bachelor",
          track: item.track || "ทั่วไป"
        }
      });
      createdCount++;
    }

    res.json({ message: `นำเข้าข้อมูลรายวิชาสำเร็จ ${createdCount} รายการ` });
  } catch (error) {
    console.error("Batch import error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล" });
  }
};
