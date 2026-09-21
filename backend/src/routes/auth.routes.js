import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

/* 1. LOGIN REDIRECT TO KMUTNB SSO */
router.get("/login", (req, res) => {
  const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
  res.cookie("sso_state", state, { httpOnly: true, maxAge: 10 * 60 * 1000 });

  const scope = process.env.SSO_SCOPE || "profile email student_info";
  const authUrl = new URL(process.env.SSO_AUTH_URL || "https://sso.kmutnb.ac.th/auth/authorize");
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("client_id", process.env.SSO_CLIENT_ID);
  authUrl.searchParams.append("redirect_uri", process.env.SSO_REDIRECT_URI);
  authUrl.searchParams.append("scope", scope);
  authUrl.searchParams.append("state", state);

  res.redirect(authUrl.toString());
});

/* 2. CALLBACK FROM KMUTNB SSO */
router.get("/callback", async (req, res) => {
  const { code, error, error_description } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (error) {
    console.error("KMUTNB SSO error:", error, error_description);
    return res.redirect(`${frontendUrl}/admin/login?error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/admin/login?error=${encodeURIComponent("ไม่พบ Authorization Code จาก SSO")}`);
  }

  try {
    /* 2.1 แลก Authorization Code เป็น Access Token */
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.SSO_REDIRECT_URI);
    params.append("client_id", process.env.SSO_CLIENT_ID);
    params.append("client_secret", process.env.SSO_CLIENT_SECRET);

    const tokenRes = await axios.post(
      process.env.SSO_TOKEN_URL || "https://sso.kmutnb.ac.th/auth/token",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const access_token = tokenRes.data.access_token;
    if (!access_token) {
      throw new Error("Failed to obtain access token from SSO response");
    }

    /* 2.2 ดึงข้อมูล User Profile จาก SSO */
    const userRes = await axios.get(
      process.env.SSO_USERINFO_URL || "https://sso.kmutnb.ac.th/resources/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    const profile = userRes.data || {};
    const email = profile.email || (profile.username ? `${profile.username}@kmutnb.ac.th` : `user_${Date.now()}@kmutnb.ac.th`);
    const displayName = profile.display_name || profile.name || profile.username || "ผู้ใช้งาน KMUTNB";
    const username = profile.username || profile.preferred_username || (email ? email.split("@")[0] : null);
    const accountType = profile.account_type || "";

    /* 2.3 ค้นหาผู้ใช้ในฐานข้อมูล users */
    let user = await prisma.users.findFirst({
      where: {
        OR: [
          { email: email },
          ...(username ? [{ username: username }] : [])
        ]
      }
    });

    if (user) {
      // อัปเดตชื่อผู้ใช้ถ้ามีการเปลี่ยนแปลง
      user = await prisma.users.update({
        where: { id: user.id },
        data: {
          full_name: displayName || user.full_name,
          username: username || user.username,
          person_key: profile.person_key || user.person_key
        }
      });
    } else {
      // กำหนดสิทธิ์เริ่มต้น: ถ้าเป็น admintest ให้เป็น admin ทันที, ถ้าทั่วไปให้เป็น lecturer
      let initialRole = "lecturer";
      if (username === "admintest") {
        initialRole = "admin";
      } else if (accountType === "student") {
        initialRole = "student";
      }

      user = await prisma.users.create({
        data: {
          email: email,
          username: username,
          full_name: displayName,
          role: initialRole,
          person_key: profile.person_key || null
        }
      });
    }

    /* 2.4 ตรวจสอบว่าตรงกับอาจารย์ในตาราง lecturers หรือไม่ */
    let lecturer = null;
    if (email) {
      lecturer = await prisma.lecturers.findFirst({
        where: {
          OR: [
            { email: { equals: email, mode: "insensitive" } },
            { fullname_th: { contains: displayName.split(" ").slice(-1)[0] || displayName } }
          ]
        }
      });
    }

    /* 2.5 สร้าง JWT Token สำหรับ Session */
    const tokenPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      lecturer_id: lecturer ? lecturer.id : null,
      lecturer_code: lecturer ? lecturer.lecturer_code : null
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "supersecret", {
      expiresIn: "7d"
    });

    /* 2.6 ตั้งค่า Cookie และ Redirect ไปยังหน้า Frontend Callback */
    res.cookie("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error("SSO Callback Error:", err.response?.data || err.message);
    const errorMsg = err.response?.data?.error_description || err.response?.data?.error || err.message || "การเข้าสู่ระบบผ่าน SSO ล้มเหลว";
    res.redirect(`${frontendUrl}/admin/login?error=${encodeURIComponent(errorMsg)}`);
  }
});

/* 2.7 Login ด้วยบัญชี Super Admin เดิม (admin@cs.com) เพื่อตั้งค่าและกำหนดสิทธิ์ผู้ใช้งาน */
router.post("/legacy-admin", async (req, res) => {
  try {
    let adminUser = await prisma.users.findFirst({
      where: { role: "admin" }
    });

    if (!adminUser) {
      adminUser = await prisma.users.create({
        data: {
          email: "admin@cs.com",
          username: "admin",
          full_name: "Super Administrator",
          role: "admin"
        }
      });
    }

    const tokenPayload = {
      id: adminUser.id,
      email: adminUser.email,
      username: adminUser.username,
      full_name: adminUser.full_name,
      role: adminUser.role,
      lecturer_id: null,
      lecturer_code: null
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "supersecret", {
      expiresIn: "7d"
    });

    res.cookie("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        username: adminUser.username,
        full_name: adminUser.full_name,
        role: adminUser.role
      }
    });
  } catch (err) {
    console.error("Legacy Admin Login Error:", err);
    res.status(500).json({ error: "ไม่สามารถเข้าสู่ระบบผู้ดูแลได้" });
  }
});

/* 3. GET CURRENT USER (ME) */
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith("Bearer "))
    ? authHeader.split(" ")[1]
    : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "ยังไม่ได้เข้าสู่ระบบ" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    const user = await prisma.users.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ error: "ไม่พบข้อมูลผู้ใช้งานในระบบ" });
    }

    // ดึงข้อมูลอาจารย์ที่เชื่อมโยง
    let lecturer = null;
    if (decoded.lecturer_id) {
      lecturer = await prisma.lecturers.findUnique({ where: { id: decoded.lecturer_id } });
    } else if (user.email) {
      lecturer = await prisma.lecturers.findFirst({
        where: {
          OR: [
            { email: { equals: user.email, mode: "insensitive" } },
            { fullname_th: { contains: user.full_name.split(" ").slice(-1)[0] || user.full_name } }
          ]
        }
      });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      lecturer_id: lecturer ? lecturer.id : null,
      lecturer_code: lecturer ? lecturer.lecturer_code : null,
      lecturer: lecturer || null
    });
  } catch (err) {
    res.status(401).json({ error: "เซสชันหมดอายุหรือไม่ถูกต้อง" });
  }
});

/* 4. LOGOUT */
router.all("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "ออกจากระบบเรียบร้อยแล้ว" });
});

export default router;