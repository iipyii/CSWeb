import { prisma } from "../lib/prisma.js";

// ✅ GET active news
export const getActiveNews = async (req, res) => {
  try {
    const today = new Date();

    const news = await prisma.news.findMany({
      where: {
        status: "active",
        start_date: {
          lte: today,
        },
        OR: [
          { end_date: null },
          { end_date: { gte: today } },
        ],
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ POST news (admin only)
export const createNews = async (req, res) => {
  try {
    const { title, content, category, start_date, end_date } = req.body;

    const newNews = await prisma.news.create({
      data: {
        title,
        content,
        category,
        status: "active",
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
        created_by: req.user.id, // ต้องมี auth middleware ก่อน
      },
    });

    res.status(201).json(newNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET all news (admin)
export const getAllNews = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ UPDATE news
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, status, start_date, end_date } = req.body;

    const updated = await prisma.news.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        category,
        status,
        start_date: new Date(start_date),
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Soft delete (archive)
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.news.update({
      where: { id: Number(id) },
      data: {
        status: "deleted",
      },
    });

    res.json({ message: "News archived (soft deleted)" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET by ID
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await prisma.news.findUnique({
      where: { id: Number(id) },
    });

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET archived news
export const getArchivedNews = async (req, res) => {
  try {
    const news = await prisma.news.findMany({
      where: {
        status: "archived",
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};