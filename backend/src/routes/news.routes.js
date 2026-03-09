import express from "express";
import {
  getActiveNews,
  getLatestNews,
  getNewsByCategory,
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getArchivedNews
} from "../controllers/news.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", getActiveNews);
router.get("/latest", getLatestNews);
router.get("/category/:category", getNewsByCategory);

router.get("/all", verifyToken, checkRole(["admin"]), getAllNews);
router.get("/archive", verifyToken, checkRole(["admin"]), getArchivedNews);

router.get("/:id", getNewsById);

router.post("/", verifyToken, checkRole(["admin","lecturer"]), createNews);
router.put("/:id", verifyToken, checkRole(["admin"]), updateNews);
router.delete("/:id", verifyToken, checkRole(["admin"]), deleteNews);

export default router;