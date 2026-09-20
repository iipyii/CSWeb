import express from "express";
import {
  getAllPrograms,
  getDegrees,
  createProgram,
  updateProgram,
  deleteProgram
} from "../controllers/curriculum.controller.js";

const router = express.Router();

router.get("/programs", getAllPrograms);
router.get("/degrees", getDegrees);
router.post("/programs", createProgram);
router.put("/programs/:id", updateProgram);
router.delete("/programs/:id", deleteProgram);

export default router;