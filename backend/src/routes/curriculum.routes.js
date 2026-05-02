import express from "express";
import { getAllPrograms } from "../controllers/curriculum.controller.js";

const router = express.Router();

router.get("/programs", getAllPrograms);

export default router;