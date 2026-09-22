import multer from "multer";
import path from "path";
import fs from "fs";

// ตรวจสอบว่ามีโฟลเดอร์ uploads ไหม ถ้าไม่มีให้สร้างใหม่
const uploadDir = "public/uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// กำหนด Storage สำหรับบันทึกไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ตรวจสอบประเภทไฟล์
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // รูปหน้าปกและรูปเพิ่มเติม
  if (file.fieldname === "image" || file.fieldname === "additional_images") {
    const allowedImages = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
    const isMimeImage = file.mimetype.startsWith("image/");
    if (allowedImages.includes(ext) && isMimeImage) {
      return cb(null, true);
    }
    return cb(new Error("รูปหน้าปกและรูปภาพเพิ่มเติมต้องเป็นไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif) เท่านั้น"), false);
  }

  // เอกสารแนบ
  if (file.fieldname === "attachments") {
    const allowedDocs = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
    if (allowedDocs.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error("เอกสารแนบต้องเป็นไฟล์ .pdf, .doc, หรือ .docx เท่านั้น"), false);
  }

  cb(null, true);
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  }
});