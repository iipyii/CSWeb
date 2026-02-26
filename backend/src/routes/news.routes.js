import express from "express";
import { getActiveNews, createNews } from "../controllers/news.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";
import e from "express";

const router = express.Router();

router.get("/", getActiveNews);
router.post("/", checkRole(["admin", "lecturer"]), createNews);

export default router;