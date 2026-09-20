import express from "express";
import { getDashboardOverview } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", getDashboardOverview);

export default router;
