import { prisma } from "../lib/prisma.js";

// GET /api/handbooks
export const getHandbooks = async (req, res) => {
  try {
    const { category, degree_level, keyword } = req.query;

    const where = {};

    if (category && category !== "all" && category.trim() !== "") {
      where.category = category;
    }

    if (degree_level && degree_level !== "all" && degree_level.trim() !== "") {
      where.OR = [
        { degree_level: degree_level },
        { degree_level: "all" }
      ];
    }

    if (keyword && keyword.trim() !== "") {
      const q = keyword.trim();
      where.OR = [
        ...(where.OR || []),
        { topic: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } }
      ];
    }

    const handbooks = await prisma.student_handbooks.findMany({
      where,
      orderBy: [
        { category: "asc" },
        { id: "asc" }
      ]
    });

    // ดึงหมวดหมู่ทั้งหมดที่มีอยู่
    const categories = await prisma.student_handbooks.findMany({
      distinct: ["category"],
      select: { category: true }
    });

    res.json({
      data: handbooks,
      categories: categories.map(c => c.category)
    });
  } catch (error) {
    console.error("Error fetching handbooks:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลคู่มือนักศึกษาได้" });
  }
};

// GET /api/handbooks/:id
export const getHandbookById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const handbook = await prisma.student_handbooks.findUnique({
      where: { id }
    });

    if (!handbook) {
      return res.status(404).json({ error: "ไม่พบข้อมูลคู่มือนี้" });
    }

    res.json(handbook);
  } catch (error) {
    console.error("Error fetching handbook item:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// POST /api/handbooks (Admin only)
export const createHandbook = async (req, res) => {
  try {
    const { category, topic, content, applicable_years, degree_level, file_url } = req.body;

    if (!category || !topic || !content) {
      return res.status(400).json({ error: "กรุณาระบุหมวดหมู่ หัวข้อ และเนื้อหา" });
    }

    const item = await prisma.student_handbooks.create({
      data: {
        category: category.trim(),
        topic: topic.trim(),
        content: content.trim(),
        applicable_years: applicable_years || "ทุกชั้นปี",
        degree_level: degree_level || "all",
        file_url: file_url || null
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating handbook item:", error);
    res.status(500).json({ error: "ไม่สามารถเพิ่มข้อมูลคู่มือได้" });
  }
};

// PUT /api/handbooks/:id (Admin only)
export const updateHandbook = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { category, topic, content, applicable_years, degree_level, file_url } = req.body;

    const updated = await prisma.student_handbooks.update({
      where: { id },
      data: {
        category: category !== undefined ? category.trim() : undefined,
        topic: topic !== undefined ? topic.trim() : undefined,
        content: content !== undefined ? content.trim() : undefined,
        applicable_years: applicable_years !== undefined ? applicable_years : undefined,
        degree_level: degree_level !== undefined ? degree_level : undefined,
        file_url: file_url !== undefined ? file_url : undefined
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating handbook:", error);
    res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลคู่มือได้" });
  }
};

// DELETE /api/handbooks/:id (Admin only)
export const deleteHandbook = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.student_handbooks.delete({ where: { id } });
    res.json({ message: "ลบข้อมูลคู่มือสำเร็จ" });
  } catch (error) {
    console.error("Error deleting handbook:", error);
    res.status(500).json({ error: "ไม่สามารถลบข้อมูลคู่มือได้" });
  }
};
