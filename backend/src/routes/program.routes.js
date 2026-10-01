import express from "express";
import { getProgramBySlugYear, getProgramDetail } from "../controllers/program.controller.js";

const router = express.Router();

router.get("/detail/:identifier", getProgramDetail);
router.get("/:slug/:year", getProgramBySlugYear);

export default router;