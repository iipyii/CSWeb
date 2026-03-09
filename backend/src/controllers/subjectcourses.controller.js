import { prisma } from "../lib/prisma.js";

/* ---------------- get years ---------------- */

export const getCourseYears = async (req, res) => {
  try {

    const years = await prisma.course_years.findMany({
      orderBy: { year: "desc" },
    });

    res.json(years);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "failed to fetch years" });

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
        { category: "asc" },
        { title: "asc" }
      ],
    });

    res.json(docs);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "failed to fetch courses" });

  }

};


/* ---------------- upload pdf ---------------- */

export const uploadCourse = async (req, res) => {

  try {

    const { year_id, semester, category, title, order_no } = req.body;

    const doc = await prisma.course_documents.create({
      data: {
        year_id: Number(year_id),
        semester: Number(semester),
        category,
        title,
        order_no: order_no ? Number(order_no) : null,
        file_path: req.file.filename,
      },
    });

    res.json(doc);

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: "upload failed" });

  }

};