import express from "express";
import { getDashboardOverview, trackVisit } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", getDashboardOverview);
router.post("/track-visit", trackVisit);

export default router;
