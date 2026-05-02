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

import { upload } from "../middlewares/upload.middleware.js";


// import { verifyToken } from "../middlewares/auth.middleware.js";
// import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", getActiveNews);
router.get("/latest", getLatestNews);
router.get("/all", getAllNews);
router.get("/archive", getArchivedNews);
router.get("/category/:category", getNewsByCategory);

// router.get("/all", verifyToken, checkRole(["admin"]), getAllNews);
// router.get("/archive", verifyToken, checkRole(["admin"]), getArchivedNews);

router.get("/:id", getNewsById);


router.post("/", createNews);
router.put("/:id", updateNews);
router.delete("/:id", deleteNews);
router.post("/", upload.fields([
  { name: 'image', maxCount: 1 },                // รูปหน้าปก (1 รูป)
  { name: 'additional_images', maxCount: 5 },    // รูปเพิ่มเติม (สูงสุด 5 รูป)
  { name: 'attachments', maxCount: 3 }           // เอกสารแนบ (สูงสุด 3 ไฟล์)
]), createNews);
// router.post("/", verifyToken, checkRole(["admin","lecturer"]), createNews);
// router.put("/:id", verifyToken, checkRole(["admin"]), updateNews);
// router.delete("/:id", verifyToken, checkRole(["admin"]), deleteNews);

export default router;