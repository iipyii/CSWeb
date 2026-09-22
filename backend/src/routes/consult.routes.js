import express from "express";
import multer from "multer";
import {
  searchStudent,
  getStudent,
  getConsultByYear,
  getAllConsultants,
  addStudentConsultant,
  updateStudentConsultant,
  deleteStudentConsultant,
  getStudentsByAdvisorCode,
  getAdvisorsSummary,
  importConsultantsExcel,
  downloadConsultantsTemplate
} from "../controllers/consult.controller.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.get("/list", getAllConsultants);
router.get("/advisors-summary", getAdvisorsSummary);
router.get("/template", downloadConsultantsTemplate);
router.post("/import-excel", upload.single("file"), importConsultantsExcel);
router.post("/students", addStudentConsultant);
router.put("/students/:id", updateStudentConsultant);
router.delete("/students/:id", deleteStudentConsultant);

router.get("/search", searchStudent);
router.get("/advisor/:code", getStudentsByAdvisorCode);
router.get("/student/:student_id", getStudent);
router.get("/year/:level/:year", getConsultByYear);

export default router;