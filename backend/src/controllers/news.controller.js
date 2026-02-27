import pool from "../config/db.js";

// GET active news
export const getActiveNews = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM news
      WHERE status = 'active'
      AND start_date <= CURRENT_DATE
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST news (admin only)
export const createNews = async (req, res) => {
  try {
    const { title, content, category, start_date, end_date } = req.body;

    const result = await pool.query(
      `
      INSERT INTO news
      (title, content, category, status, start_date, end_date, created_by)
      VALUES ($1, $2, $3, 'active', $4, $5, $6)
      RETURNING *
      `,
      [title, content, category, start_date, end_date, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllNews = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM news ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, status, start_date, end_date } = req.body;

    const result = await pool.query(
      `
      UPDATE news
      SET title=$1,
          content=$2,
          category=$3,
          status=$4,
          start_date=$5,
          end_date=$6
      WHERE id=$7
      RETURNING *
      `,
      [title, content, category, status, start_date, end_date, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE news
      SET status='deleted'
      WHERE id=$1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "News not found" });
    }

    res.json({ message: "News archived (soft deleted)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM news WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "News not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getArchivedNews = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM news
      WHERE status = 'archived'
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
