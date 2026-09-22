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
  getArchivedNews,
  downloadAttachment
} from "../controllers/news.controller.js";

import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Middleware จัดการ Error จาก multer (เช่น อัปโหลดไฟล์ผิดประเภท)
const handleUploadFields = (fields) => {
  const multerMiddleware = upload.fields(fields);
  return (req, res, next) => {
    multerMiddleware(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" });
      }
      next();
    });
  };
};

const newsUploadFields = [
  { name: 'image', maxCount: 1 },                // รูปหน้าปก (1 รูป)
  { name: 'additional_images', maxCount: 5 },    // รูปเพิ่มเติม (สูงสุด 5 รูป)
  { name: 'attachments', maxCount: 3 }           // เอกสารแนบ (สูงสุด 3 ไฟล์)
];

router.get("/", getActiveNews);
router.get("/latest", getLatestNews);
router.get("/all", getAllNews);
router.get("/archive", getArchivedNews);
router.get("/attachment/download", downloadAttachment);
router.get("/category/:category", getNewsByCategory);

router.get("/:id", getNewsById);

router.put("/:id", handleUploadFields(newsUploadFields), updateNews);
router.delete("/:id", deleteNews);
router.post("/", handleUploadFields(newsUploadFields), createNews);

export default router;