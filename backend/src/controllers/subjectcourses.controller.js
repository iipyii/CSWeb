import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

/* ---------------- get years ---------------- */
export const getCourseYears = async (req, res) => {
  try {
    const years = await prisma.course_years.findMany({
      orderBy: { year: "desc" },
      include: {
        _count: {
          select: { course_documents: true }
        }
      }
    });

    res.json(years);
  } catch (error) {
    console.error("Fetch years error:", error);
    res.status(500).json({ error: "failed to fetch years" });
  }
};

/* ---------------- create year ---------------- */
export const createCourseYear = async (req, res) => {
  try {
    const { year } = req.body;
    const numYear = parseInt(year);
    if (!numYear || isNaN(numYear)) {
      return res.status(400).json({ error: "ปีการศึกษาไม่ถูกต้อง" });
    }

    const exists = await prisma.course_years.findUnique({
      where: { year: numYear }
    });

    if (exists) {
      return res.status(400).json({ error: `ปีการศึกษา ${numYear} มีอยู่ในระบบแล้ว` });
    }

    const created = await prisma.course_years.create({
      data: { year: numYear }
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("Create year error:", error);
    res.status(500).json({ error: "Failed to create academic year" });
  }
};

/* ---------------- delete year ---------------- */
export const deleteCourseYear = async (req, res) => {
  try {
    const { id } = req.params;
    const yearId = parseInt(id);

    // Delete associated documents first
    const docs = await prisma.course_documents.findMany({
      where: { year_id: yearId }
    });

    for (const doc of docs) {
      if (doc.file_path) {
        const fullPath = path.join(process.cwd(), "uploads", "course", doc.file_path);
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch (e) {}
        }
      }
    }

    await prisma.course_documents.deleteMany({
      where: { year_id: yearId }
    });

    await prisma.course_years.delete({
      where: { id: yearId }
    });

    res.json({ message: "ลบปีการศึกษาสำเร็จ" });
  } catch (error) {
    console.error("Delete year error:", error);
    res.status(500).json({ error: "Failed to delete academic year" });
  }
};

/* ---------------- get courses by year + semester ---------------- */
export const getCourses = async (req, res) => {
  try {
    const { year, semester } = req.params;

    const docs = await prisma.course_documents.findMany({
      where: {
        semester: Number(semester),
        year: {
          year: Number(year),
        },
      },
      orderBy: [
        { order_no: "asc" },
        { category: "asc" },
        { title: "asc" }
      ],
      include: {
        year: true
      }
    });

    res.json(docs);
  } catch (error) {
    console.error("Fetch courses error:", error);
    res.status(500).json({ error: "failed to fetch courses" });
  }
};

/* ---------------- get all courses (Admin) ---------------- */
export const getAllCourses = async (req, res) => {
  try {
    const docs = await prisma.course_documents.findMany({
      orderBy: [
        { year: { year: "desc" } },
        { semester: "desc" },
        { order_no: "asc" },
        { id: "desc" }
      ],
      include: {
        year: true
      }
    });

    res.json(docs);
  } catch (error) {
    console.error("Fetch all courses error:", error);
    res.status(500).json({ error: "Failed to fetch all courses" });
  }
};

/* ---------------- upload pdf ---------------- */
export const uploadCourse = async (req, res) => {
  try {
    const { year_id, semester, category, title, order_no } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "กรุณาแนบไฟล์ PDF" });
    }

    if (!year_id || !semester || !category || !title) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const doc = await prisma.course_documents.create({
      data: {
        year_id: Number(year_id),
        semester: Number(semester),
        category: category.trim(),
        title: title.trim(),
        order_no: order_no ? Number(order_no) : 0,
        file_path: req.file.filename,
      },
      include: {
        year: true
      }
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error("Upload course error:", err);
    res.status(500).json({ error: "upload failed" });
  }
};

/* ---------------- update course document ---------------- */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { year_id, semester, category, title, order_no } = req.body;

    const dataToUpdate = {};
    if (year_id) dataToUpdate.year_id = Number(year_id);
    if (semester) dataToUpdate.semester = Number(semester);
    if (category) dataToUpdate.category = category.trim();
    if (title) dataToUpdate.title = title.trim();
    if (order_no !== undefined) dataToUpdate.order_no = Number(order_no);
    if (req.file) {
      dataToUpdate.file_path = req.file.filename;
    }

    const updated = await prisma.course_documents.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      include: {
        year: true
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ error: "Failed to update course document" });
  }
};

/* ---------------- delete course document ---------------- */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await prisma.course_documents.findUnique({
      where: { id: parseInt(id) }
    });

    if (!doc) {
      return res.status(404).json({ error: "ไม่พบเอกสาร" });
    }

    if (doc.file_path) {
      const fullPath = path.join(process.cwd(), "uploads", "course", doc.file_path);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch (e) {}
      }
    }

    await prisma.course_documents.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "ลบเอกสารขบวนวิชาสำเร็จ" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ error: "Failed to delete course document" });
  }
};