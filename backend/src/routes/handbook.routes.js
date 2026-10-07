import express from "express";
import {
  getHandbooks,
  getHandbookById,
  createHandbook,
  updateHandbook,
  deleteHandbook
} from "../controllers/handbook.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Public routes for viewing / querying student handbooks
router.get("/", getHandbooks);
router.get("/:id", getHandbookById);

// Management routes (Admin only)
router.post("/", verifyToken, checkRole(["admin"]), createHandbook);
router.put("/:id", verifyToken, checkRole(["admin"]), updateHandbook);
router.delete("/:id", verifyToken, checkRole(["admin"]), deleteHandbook);

export default router;
