import express from "express";
import { prisma } from "../lib/prisma.js";

import {
  searchStudent,
  getStudent,
  getConsultByYear
} from "../controllers/consult.controller.js";

const router = express.Router();

router.get("/search", searchStudent);

router.get("/student/:student_id", getStudent);

router.get("/consult/year/:level/:year", getConsultByYear);

export default router;