import express from "express";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

export const defaultStudentLinks = [
  { id: "1", title: "ตารางสอน/ตารางสอบ", icon_name: "Table2", color: "text-rose-400", url: "https://reg.kmutnb.ac.th/" },
  { id: "2", title: "ปฏิทินการศึกษา", icon_name: "CalendarDays", color: "text-orange-400", url: "https://reg.kmutnb.ac.th/" },
  { id: "3", title: "ระบบการชำระเงินนักศึกษาใหม่", icon_name: "BadgeDollarSign", color: "text-amber-500", url: "https://newstudent.kmutnb.ac.th/Student/StudentLogin.aspx" },
  { id: "4", title: "ระบบขึ้นทะเบียนนักศึกษาใหม่", icon_name: "UserPlus", color: "text-orange-500", url: "https://reg.kmutnb.ac.th/" },
  { id: "5", title: "ระบบลงทะเบียน", icon_name: "UserCheck", color: "text-amber-500", url: "https://reg.kmutnb.ac.th/" },
  { id: "6", title: "ระบบดูผลการเรียน", icon_name: "FileText", color: "text-emerald-400", url: "https://reg.kmutnb.ac.th/" },
  { id: "7", title: "ระบบประเมินการสอน", icon_name: "ClipboardList", color: "text-teal-400", url: "https://assessment.kmutnb.ac.th/" },
  { id: "8", title: "ระบบคำร้องออนไลน์", icon_name: "MessageSquareMore", color: "text-cyan-500", url: "https://reg.kmutnb.ac.th/" },
  { id: "9", title: "ระบบขอเอกสารสำคัญทางการศึกษา", icon_name: "ShieldAlert", color: "text-rose-400", url: "http://e-service.acdserv.kmutnb.ac.th/regReqDoc/login/" },
  { id: "10", title: "ระบบ e-Studentloan สำหรับผู้กู้ กยศ. และ กรอ.", icon_name: "Landmark", color: "text-blue-400", url: "https://eservices.studentloan.or.th/SLFSTUDENT/html/index.html" },
  { id: "11", title: "บริการซอฟต์แวร์ลิขสิทธิ์", icon_name: "ShieldCheck", color: "text-cyan-500", url: "https://icit.kmutnb.ac.th/services/software-license/" },
  { id: "12", title: "บัณฑิตวิทยาลัย", icon_name: "GraduationCap", color: "text-rose-400", url: "https://www.grad.kmutnb.ac.th/index.php" },
  { id: "13", title: "แบบฟอร์มขออนุมัติตัวนักศึกษา", icon_name: "Link2", color: "text-indigo-600", url: "https://docs.google.com/forms/d/e/1FAIpQLSfBW8Dj47DlKvgdTu2EHHeQpTrCeBlJP0yu_lbuDPC4gn-8fA/viewform?vc=0&c=0&w=1&flr=0" }
];

// GET all student links (Public)
router.get("/", async (req, res) => {
  try {
    const config = await prisma.site_config.findUnique({
      where: { config_key: "student_links" }
    });

    if (!config || !config.config_value) {
      return res.json({ data: defaultStudentLinks });
    }

    try {
      const parsed = JSON.parse(config.config_value);
      return res.json({ data: Array.isArray(parsed) ? parsed : defaultStudentLinks });
    } catch (e) {
      return res.json({ data: defaultStudentLinks });
    }
  } catch (error) {
    console.error("Get student links error:", error);
    res.status(500).json({ error: "Failed to fetch student links" });
  }
});

// POST update student links (Admin Only)
router.post("/", verifyToken, checkRole(["admin", "lecturer"]), async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "ข้อมูลลิงก์สำหรับนักศึกษาไม่ถูกต้อง" });
    }

    await prisma.site_config.upsert({
      where: { config_key: "student_links" },
      update: {
        config_value: JSON.stringify(data),
        description: "Links for students and portal services"
      },
      create: {
        config_key: "student_links",
        config_value: JSON.stringify(data),
        description: "Links for students and portal services"
      }
    });

    res.json({ message: "บันทึกข้อมูลลิงก์สำหรับนักศึกษาสำเร็จ", data });
  } catch (error) {
    console.error("Update student links error:", error);
    res.status(500).json({ error: "Failed to update student links" });
  }
});

export default router;
