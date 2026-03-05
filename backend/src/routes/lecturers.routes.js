import express from "express";
import { prisma } from "../lib/prisma.js"

const router = express.Router();

// GET all lecturers
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

// GET lecturer by code
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

export default router;