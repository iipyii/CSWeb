import express from "express";
import { 
    getActiveNews, 
    createNews, 
    getAllNews, 
    updateNews, 
    deleteNews, 
    getNewsById, 
    getArchivedNews } from "../controllers/news.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";

console.log("PUT ROUTE REGISTERED");

const router = express.Router();

router.get("/", getActiveNews);
router.get("/archive", checkRole(["admin"]), getArchivedNews);
router.get("/all", checkRole(["admin"]), getAllNews);
router.post("/", checkRole(["admin", "lecturer"]), createNews);
router.put("/:id", checkRole(["admin"]), updateNews);
router.delete("/:id", checkRole(["admin"]), deleteNews);
router.get("/:id", getNewsById);


export default router;