import multer from "multer";
import path from "path";
import fs from "fs";

// ตรวจสอบว่ามีโฟลเดอร์ uploads ไหม ถ้าไม่มีให้สร้างใหม่
const uploadDir = "public/uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ใหม่ ป้องกันชื่อซ้ำ (เช่น news-163456789.jpg)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "news-" + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });