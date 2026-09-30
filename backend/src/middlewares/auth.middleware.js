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

    let lecturerId = decoded.lecturer_id || null;
    let lecturerCode = decoded.lecturer_code || null;

    if (!lecturerId || user.person_key) {
      let match = null;
      if (user.person_key) {
        match = await prisma.lecturers.findFirst({
          where: {
            OR: [
              { lecturer_code: { equals: user.person_key, mode: "insensitive" } },
              { id: !isNaN(Number(user.person_key)) ? Number(user.person_key) : -1 }
            ]
          }
        });
      } else if (user.email) {
        match = await prisma.lecturers.findFirst({
          where: {
            OR: [
              { email: { equals: user.email, mode: "insensitive" } },
              { fullname_th: { contains: user.full_name.split(" ").slice(-1)[0] || user.full_name } }
            ]
          }
        });
      }
      if (match) {
        lecturerId = match.id;
        lecturerCode = match.lecturer_code;
      }
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      lecturer_id: lecturerId,
      lecturer_code: lecturerCode
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({
      message: "เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่อีกครั้ง"
    });
  }
};