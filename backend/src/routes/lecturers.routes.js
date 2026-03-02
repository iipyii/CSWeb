import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET all lecturers
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lecturers ORDER BY lecturer_code"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET lecturer by code
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const result = await pool.query(
      "SELECT * FROM lecturers WHERE lecturer_code = $1",
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lecturer not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;