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

import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", getActiveNews);
router.get("/latest", getLatestNews);
router.get("/category/:category", getNewsByCategory);


router.get("/all", checkRole(["admin"]), getAllNews);
router.get("/archive", checkRole(["admin"]), getArchivedNews);

router.get("/:id", getNewsById);

router.post("/", checkRole(["admin", "lecturer"]), createNews);
router.put("/:id", checkRole(["admin"]), updateNews);
router.delete("/:id", checkRole(["admin"]), deleteNews);

export default router;