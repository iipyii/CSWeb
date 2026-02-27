import pool from "../config/db.js";

export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }  
};