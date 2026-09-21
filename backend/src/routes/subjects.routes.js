import express from "express";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  batchImportSubjects
} from "../controllers/subjects.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Public routes for viewing / searching course descriptions
router.get("/", getSubjects);
router.get("/:id", getSubjectById);

// Protected admin routes for managing subjects
router.post("/", verifyToken, checkRole(["admin"]), createSubject);
router.put("/:id", verifyToken, checkRole(["admin"]), updateSubject);
router.delete("/:id", verifyToken, checkRole(["admin"]), deleteSubject);
router.post("/batch-import", verifyToken, checkRole(["admin"]), batchImportSubjects);

export default router;
