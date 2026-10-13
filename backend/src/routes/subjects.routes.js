import express from "express";
import multer from "multer";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  batchImportSubjects,
  importSubjectsFromPdf,
  importSubjectsFromExcel,
  downloadSubjectsTemplate,
  getCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum
} from "../controllers/subjects.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();
const uploadMemory = multer({ storage: multer.memoryStorage() });

// Public routes for viewing / searching course descriptions & curriculums
router.get("/curriculums", getCurriculums);
router.get("/", getSubjects);
router.get("/template", downloadSubjectsTemplate);
router.get("/:id", getSubjectById);

// Protected admin routes for managing curriculums (ปี/หลักสูตร)
router.post("/curriculums", verifyToken, checkRole(["admin"]), createCurriculum);
router.put("/curriculums/:code", verifyToken, checkRole(["admin"]), updateCurriculum);
router.delete("/curriculums/:code", verifyToken, checkRole(["admin"]), deleteCurriculum);

// Protected admin routes for managing subjects
router.post("/", verifyToken, checkRole(["admin"]), createSubject);
router.put("/:id", verifyToken, checkRole(["admin"]), updateSubject);
router.delete("/:id", verifyToken, checkRole(["admin"]), deleteSubject);
router.post("/batch-import", verifyToken, checkRole(["admin"]), batchImportSubjects);

// PDF & Excel Import routes
router.post("/import-pdf", verifyToken, checkRole(["admin"]), uploadMemory.single("file"), importSubjectsFromPdf);
router.post("/import-excel", verifyToken, checkRole(["admin"]), uploadMemory.single("file"), importSubjectsFromExcel);

export default router;

