import express from "express";
import {
  searchStudent,
  getStudent,
  getConsultByYear,
  getAllConsultants,
  addStudentConsultant,
  deleteStudentConsultant
} from "../controllers/consult.controller.js";

const router = express.Router();

router.get("/list", getAllConsultants);
router.post("/students", addStudentConsultant);
router.delete("/students/:id", deleteStudentConsultant);

router.get("/search", searchStudent);
router.get("/student/:student_id", getStudent);
router.get("/year/:level/:year", getConsultByYear);

export default router;