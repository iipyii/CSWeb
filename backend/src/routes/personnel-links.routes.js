import express from "express";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

export const defaultPersonnelLinks = [
  { id: "1", title: "ระบบเพื่องานทะเบียนนักศึกษา", icon_name: "Users", color: "text-rose-500", url: "https://reg.kmutnb.ac.th/" },
  { id: "2", title: "สหกรณ์ออมทรัพย์", icon_name: "Wallet", color: "text-purple-500", url: "https://www.ppn-scc.com/" },
  { id: "3", title: "ระบบเพื่อรายงานข้อมูลและสถิตินักศึกษา", icon_name: "BarChart3", color: "text-blue-500", url: "https://ureport.kmutnb.ac.th/" },
  { id: "4", title: "Microsoft Azure Dev Tool for Teaching", icon_name: "Monitor", color: "text-orange-500", url: "https://login.microsoftonline.com/" },
  { id: "5", title: "KMUTNB Online Learning", icon_name: "MonitorPlay", color: "text-amber-500", url: "https://www.kmutnb.ac.th/kmutnb-online-learning.aspx" },
  { id: "6", title: "บริการซอฟต์แวร์ลิขสิทธิ์", icon_name: "ShieldCheck", color: "text-emerald-500", url: "https://software.kmutnb.ac.th/" },
  { id: "7", title: "ระบบบริหารลูกหนี้เงินยืม", icon_name: "Landmark", color: "text-teal-600", url: "http://loan.kmutnb.ac.th/" },
  { id: "8", title: "ระบบเบิกเงินสวัสดิการเกี่ยวกับการรักษาพยาบาล", icon_name: "HeartPulse", color: "text-cyan-600", url: "https://medical.kmutnb.ac.th/index.php?r=site%2Flogin" },
  { id: "9", title: "ระบบสวัสดิการเกี่ยวกับการศึกษาของบุตร", icon_name: "GraduationCap", color: "text-pink-500", url: "https://edufee.kmutnb.ac.th/" },
  { id: "10", title: "ระบบสารสนเทศทรัพยากรมนุษย์ : Human Resources Information System (HRIS)", icon_name: "UserCog", color: "text-stone-500", url: "https://hris.kmutnb.ac.th/web/site/contact" },
  { id: "11", title: "ระบบลาออนไลน์", icon_name: "CalendarDays", color: "text-indigo-500", url: "https://pls.kmutnb.ac.th/site/login" },
  { id: "12", title: "ระบบยื่นคำร้องสอนชดเชย", icon_name: "FileEdit", color: "text-orange-600", url: "https://reservation.sci.kmutnb.ac.th/auth/login" },
  { id: "13", title: "แบบฟอร์มขออนุมัติตัวบุคคลและค่าใช้จ่าย", icon_name: "FileSpreadsheet", color: "text-blue-700", url: "https://docs.google.com/forms/" },
  { id: "14", title: "ระบบส่งเอกสาร OBE และ IDP", icon_name: "ClipboardCheck", color: "text-orange-500", url: "https://cs.kmutnb.ac.th/login.jsp" }
];

// GET all personnel links (Public)
router.get("/", async (req, res) => {
  try {
    const config = await prisma.site_config.findUnique({
      where: { config_key: "personnel_links" }
    });

    if (!config || !config.config_value) {
      return res.json({ data: defaultPersonnelLinks });
    }

    try {
      const parsed = JSON.parse(config.config_value);
      return res.json({ data: Array.isArray(parsed) ? parsed : defaultPersonnelLinks });
    } catch (e) {
      return res.json({ data: defaultPersonnelLinks });
    }
  } catch (error) {
    console.error("Get personnel links error:", error);
    res.status(500).json({ error: "Failed to fetch personnel links" });
  }
});

// POST update personnel links (Admin Only)
router.post("/", verifyToken, checkRole(["admin"]), async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "ข้อมูลลิงก์สำหรับบุคลากรไม่ถูกต้อง" });
    }

    await prisma.site_config.upsert({
      where: { config_key: "personnel_links" },
      update: {
        config_value: JSON.stringify(data),
        description: "Links for department personnel"
      },
      create: {
        config_key: "personnel_links",
        config_value: JSON.stringify(data),
        description: "Links for department personnel"
      }
    });

    res.json({ message: "บันทึกข้อมูลลิงก์สำหรับบุคลากรสำเร็จ", data });
  } catch (error) {
    console.error("Update personnel links error:", error);
    res.status(500).json({ error: "Failed to update personnel links" });
  }
});

export default router;
