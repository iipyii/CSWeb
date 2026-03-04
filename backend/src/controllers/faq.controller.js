import { prisma } from "../lib/prisma.js";

// ✅ GET active FAQ
export const getActiveFAQ = async (req, res) => {
  try {
    const faq = await prisma.faq.findMany({
      where: {
        status: "active",
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        status: true,
        created_at: true,
      },
    });

    res.json(faq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ GET all FAQ (admin)
export const getAllFAQ = async (req, res) => {
  try {
    const faq = await prisma.faq.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(faq);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ CREATE FAQ
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    const newFAQ = await prisma.faq.create({
      data: {
        question,
        answer,
        category,
        status: "active",
      },
    });

    res.status(201).json(newFAQ);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ UPDATE FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, status } = req.body;

    const updated = await prisma.faq.update({
      where: {
        id: Number(id),
      },
      data: {
        question,
        answer,
        category,
        status,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Soft delete
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.faq.update({
      where: { id: Number(id) },
      data: {
        status: "inactive",
      },
    });

    res.json({ message: "FAQ deactivated" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res.status(500).json({ error: "Server error" });
  }
};