import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = (authHeader && authHeader.startsWith("Bearer "))
      ? authHeader.split(" ")[1]
      : req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "กรุณาเข้าสู่ระบบก่อนทำรายการ (Unauthorized)"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");

    // ดึงข้อมูลผู้ใช้สดจาก DB เพื่อให้สิทธิ์ (role) ล่าสุดมีผลทันที
    const user = await prisma.users.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        message: "ไม่พบบัญชีผู้ใช้งานในระบบ หรือบัญชีถูกลบแล้ว"
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      lecturer_id: decoded.lecturer_id || null,
      lecturer_code: decoded.lecturer_code || null
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({
      message: "เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง"
    });
  }
};