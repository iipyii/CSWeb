import pool from "../config/db.js";

// GET active FAQ
export const getActiveFAQ = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM faq WHERE status='active' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all FAQ (admin)
export const getAllFAQ = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM faq ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE FAQ
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    const result = await pool.query(
      `
      INSERT INTO faq (question, answer, category)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [question, answer, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE FAQ
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, status } = req.body;

    const result = await pool.query(
      `
      UPDATE faq
      SET question=$1,
          answer=$2,
          category=$3,
          status=$4
      WHERE id=$5
      RETURNING *
      `,
      [question, answer, category, status, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE (soft)
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE faq SET status='inactive' WHERE id=$1",
      [id]
    );

    res.json({ message: "FAQ deactivated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};