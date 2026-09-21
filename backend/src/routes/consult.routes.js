import express from "express";
import {
  searchStudent,
  getStudent,
  getConsultByYear,
  getAllConsultants,
  addStudentConsultant,
  deleteStudentConsultant,
  getStudentsByAdvisorCode,
  getAdvisorsSummary
} from "../controllers/consult.controller.js";

const router = express.Router();

router.get("/list", getAllConsultants);
router.get("/advisors-summary", getAdvisorsSummary);
router.post("/students", addStudentConsultant);
router.delete("/students/:id", deleteStudentConsultant);

router.get("/search", searchStudent);
router.get("/advisor/:code", getStudentsByAdvisorCode);
router.get("/student/:student_id", getStudent);
router.get("/year/:level/:year", getConsultByYear);

export default router;