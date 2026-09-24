import { prisma } from "../lib/prisma.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
const XLSX = require("xlsx");

function cleanThaiEncoding(str) {
  if (!str) return "";
  return str
    .replace(/[\x9B\u009B›]/g, "่")
    .replace(/[\x9C\u009Cœ]/g, "้")
    .replace(/[\x9D\u009D\x8E\u008E]/g, "์")
    .replace(/[\x9E\u009Ež]/g, "ั")
    .replace(/[\x9F\u009FŸ]/g, "็")
    .replace(/[\x9A\u009A]/g, "๊")
    .replace(/[\x85\u0085—]/g, "ึ")
    .replace(/[\x84\u0084•]/g, "ิ")
    .replace(/องค[v ]+ประกอบ/g, "องค์ประกอบ")
    .replace(/องค[v ]+กร/g, "องค์กร")
    .replace(/อาจารย[v ]+/g, "อาจารย์")
    .replace(/ซอฟต[v ]*แวร[v ]*/g, "ซอฟต์แวร์")
    .replace(/คณิตศาสตร[v ]*/g, "คณิตศาสตร์")
    .replace(/ปัญญาประดิษฐ[v ]*/g, "ปัญญาประดิษฐ์")
    .replace(/วิเคราะห[v ]*/g, "วิเคราะห์")
    .replace(/ประยุกต[v ]*/g, "ประยุกต์")
    .replace(/คอมพิวเตอร[v ]*/g, "คอมพิวเตอร์")
    .replace(/ศาสตร[v ]*/g, "ศาสตร์")
    .replace(/การณ[v ]*/g, "การณ์")
    .replace(/เซ็นเซอร[v ]*/g, "เซ็นเซอร์")
    .replace(/อินเทอร[v ]*เน็ต/g, "อินเทอร์เน็ต")
    .replace(/คลาวด[v ]*/g, "คลาวด์")
    .replace(/เวิลด[v ]*/g, "เวิลด์")
    .replace(/ไซเบอร[v ]*/g, "ไซเบอร์")
    .replace(/แพลตฟอร[v ]*ม/g, "แพลตฟอร์ม")
    .replace(/เซิร[v ]*ฟเวอร[v ]*/g, "เซิร์ฟเวอร์")
    .replace(/ไดรฟ[v ]*/g, "ไดรฟ์")
    .replace(/อิเล็กทรอนิกส[v ]*/g, "อิเล็กทรอนิกส์")
    .replace(/รีจิสเตอร[v ]*/g, "รีจิสเตอร์")
    .replace(/แดชบอร[v ]*ด/g, "แดชบอร์ด")
    .replace(/อีเวนท[v ]*/g, "อีเวนต์")
    .replace(/โมบายล[v ]*/g, "โมบายล์")
    .replace(/สตาร[v ]*ตอัพ/g, "สตาร์ตอัป")
    .replace(/สตาร[v ]*ทอัพ/g, "สตาร์ทอัพ")
    .replace(/([์ิีึืุูั็่้๊๋])\1+/g, "$1") // Remove duplicate tonal marks
    .replace(/\s*\*+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Helper to parse subject chunks from extracted PDF text
function parseSubjectsFromText(text, defaultCurriculum = {}) {
  const cleanText = text
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const codeMatches = [];
  const codeRegex = /(?:^|\n)\s*(\d{8,9})\s+/g;
  let m;
  while ((m = codeRegex.exec(cleanText)) !== null) {
    const code = m[1];
    if (code.startsWith("04") || code.startsWith("08") || code.startsWith("40") || code.startsWith("80")) {
      codeMatches.push({ code, index: m.index });
    }
  }

  const parsedSubjects = [];

  for (let i = 0; i < codeMatches.length; i++) {
    const curr = codeMatches[i];
    const next = codeMatches[i + 1];
    const chunk = cleanText.slice(curr.index, next ? next.index : curr.index + 2500).trim();

    const lines = chunk.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const firstLine = lines[0];
    const headerMatch = firstLine.match(/^(\d{8,9})\s+(.*?)(?:\s+(\d\s*\([\d\s\-]+\)))?$/);
    
    let subject_code = curr.code;
    let title_th = "";
    let credit = "";

    if (headerMatch) {
      subject_code = headerMatch[1];
      title_th = cleanThaiEncoding(headerMatch[2]);
      credit = headerMatch[3] ? headerMatch[3].replace(/\s+/g, "") : "";
    } else {
      title_th = cleanThaiEncoding(firstLine.replace(subject_code, ""));
    }

    if (!credit) {
      for (let j = 1; j < Math.min(lines.length, 4); j++) {
        const cMatch = lines[j].match(/(\d\s*\([\d\s\wก-๙\-]+\))/);
        if (cMatch) {
          credit = cMatch[1].replace(/\s+/g, "");
          break;
        }
      }
    }

    let title_en = "";
    for (let j = 1; j < Math.min(lines.length, 5); j++) {
      const enMatch = lines[j].match(/^\((.*?)\)$/);
      if (enMatch && !enMatch[1].includes("บรรยาย") && !enMatch[1].includes("ทฤษฎี")) {
        title_en = enMatch[1].trim();
        break;
      }
    }

    let prereq1 = null;
    let prereq2 = null;
    const prereqLine = lines.find(l => 
      l.includes("วิชาบังคับ") || 
      l.includes("Prerequisite") ||
      l.includes("ก›อน") ||
      l.includes("ก\x9Bอน")
    );
    if (prereqLine) {
      const pText = prereqLine.replace(/^.*?วิชาบังคับ[^\:]*[:\s]*/i, "").trim();
      const codeMatchesInPrereq = pText.match(/\d{8,9}/g);
      if (codeMatchesInPrereq && codeMatchesInPrereq.length > 0) {
        prereq1 = codeMatchesInPrereq[0];
        if (codeMatchesInPrereq.length > 1) {
          prereq2 = codeMatchesInPrereq[1];
        }
      } else if (pText.includes("ไม่") || pText.includes("ไม›") || pText.includes("ไม\x9B") || pText.toLowerCase().includes("none")) {
        prereq1 = "ไม่มี";
      } else if (pText) {
        prereq1 = cleanThaiEncoding(pText).slice(0, 50);
      }
    }

    let descLines = [];
    let startDesc = false;
    for (const l of lines) {
      if (l.includes("วิชาบังคับ") || l.includes("Prerequisite") || l.includes("ก›อน") || l.includes("ก\x9Bอน")) {
        startDesc = true;
        continue;
      }
      if (startDesc) {
        descLines.push(l);
      }
    }

    let description_th = "";
    let description_en = "";

    if (descLines.length > 0) {
      const thLines = [];
      const enLines = [];
      for (const l of descLines) {
        if (/[\u0E00-\u0E7F\x9B-\x9F]/.test(l)) {
          thLines.push(cleanThaiEncoding(l));
        } else if (/[a-zA-Z]/.test(l)) {
          enLines.push(l.trim());
        }
      }
      description_th = thLines.join(" ").trim();
      description_en = enLines.join(" ").trim();
    }

    let track = defaultCurriculum.track || "ทั่วไป";
    const combinedTitle = (title_th + " " + title_en).toLowerCase();
    if (combinedTitle.includes("software") || combinedTitle.includes("ซอฟต์แวร์") || combinedTitle.includes("web") || combinedTitle.includes("เว็บ") || combinedTitle.includes("cloud") || combinedTitle.includes("คลาวด์") || combinedTitle.includes("programming") || combinedTitle.includes("โปรแกรม") || combinedTitle.includes("devops")) {
      track = "Software Engineering & Cloud";
    } else if (combinedTitle.includes("data") || combinedTitle.includes("ข้อมูล") || combinedTitle.includes("intelligence") || combinedTitle.includes("ปัญญาประดิษฐ์") || combinedTitle.includes("ai") || combinedTitle.includes("learning") || combinedTitle.includes("mining") || combinedTitle.includes("analytics")) {
      track = "Data Science & Artificial Intelligence";
    } else if (combinedTitle.includes("security") || combinedTitle.includes("มั่นคง") || combinedTitle.includes("network") || combinedTitle.includes("เครือข่าย") || combinedTitle.includes("cyber")) {
      track = "Network & Cybersecurity";
    } else if (combinedTitle.includes("iot") || combinedTitle.includes("robot") || combinedTitle.includes("หุ่นยนต์") || combinedTitle.includes("embedded") || combinedTitle.includes("ฝังตัว") || combinedTitle.includes("sensor")) {
      track = "IoT & Intelligent Systems";
    }

    let category = "หมวดวิชาเฉพาะด้าน";
    if (subject_code.startsWith("080")) {
      category = "หมวดวิชาศึกษาทั่วไป";
    } else if (combinedTitle.includes("โครงงาน") || combinedTitle.includes("project") || combinedTitle.includes("วิทยานิพนธ์") || combinedTitle.includes("thesis")) {
      category = "หมวดโครงงาน/วิทยานิพนธ์";
    } else if (combinedTitle.includes("สัมมนา") || combinedTitle.includes("seminar")) {
      category = "หมวดสัมมนา";
    } else if (combinedTitle.includes("ฝึกงาน") || combinedTitle.includes("สหกิจ") || combinedTitle.includes("cooperative") || combinedTitle.includes("internship")) {
      category = "หมวดฝึกงานและสหกิจศึกษา";
    } else if (title_th.includes("เลือก") || combinedTitle.includes("elective") || combinedTitle.includes("หัวข้อพิเศษ") || combinedTitle.includes("special topics")) {
      category = "หมวดวิชาเลือก";
    }

    if (title_th && title_th.length >= 2 && !title_th.startsWith("รหัส")) {
      parsedSubjects.push({
        subject_code,
        title_th,
        title_en: title_en || title_th,
        credit: credit || "3(3-0-6)",
        prereq1: prereq1 || "ไม่มี",
        prereq2,
        description_th: description_th || title_th,
        description_en: description_en || title_en || null,
        category,
        curriculum_code: defaultCurriculum.curriculum_code || "CS69",
        curriculum_year: defaultCurriculum.curriculum_year ? parseInt(defaultCurriculum.curriculum_year) : 2569,
        degree_level: defaultCurriculum.degree_level || "bachelor",
        track
      });
    }
  }

  // Deduplicate and keep longer description
  const map = new Map();
  for (const s of parsedSubjects) {
    if (!map.has(s.subject_code) || (map.get(s.subject_code).description_th.length < s.description_th.length)) {
      map.set(s.subject_code, s);
    }
  }

  return Array.from(map.values());
}

// GET /api/subjects
export const getSubjects = async (req, res) => {
  try {
    const { keyword, curriculum_code, curriculum_year, degree_level, track, category } = req.query;

    const where = {};

    if (curriculum_code && curriculum_code !== "all" && curriculum_code.trim() !== "") {
      where.curriculum_code = curriculum_code;
    }

    if (curriculum_year && curriculum_year !== "all" && !isNaN(parseInt(curriculum_year))) {
      where.curriculum_year = parseInt(curriculum_year);
    }

    if (degree_level && degree_level !== "all" && degree_level.trim() !== "") {
      where.degree_level = degree_level;
    }

    if (track && track !== "all" && track.trim() !== "") {
      where.track = track;
    }

    if (category && category !== "all" && category.trim() !== "") {
      where.category = category;
    }

    if (keyword && keyword.trim() !== "") {
      const q = keyword.trim();
      where.OR = [
        { subject_code: { contains: q, mode: "insensitive" } },
        { title_th: { contains: q, mode: "insensitive" } },
        { title_en: { contains: q, mode: "insensitive" } },
        { description_th: { contains: q, mode: "insensitive" } },
        { description_en: { contains: q, mode: "insensitive" } }
      ];
    }

    const subjects = await prisma.subjects.findMany({
      where,
      orderBy: [
        { curriculum_year: "desc" },
        { subject_code: "asc" }
      ]
    });

    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลรายวิชาได้" });
  }
};

// GET /api/subjects/:id
export const getSubjectById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const subject = await prisma.subjects.findUnique({
      where: { id }
    });

    if (!subject) {
      return res.status(404).json({ error: "ไม่พบรายวิชานี้" });
    }

    res.json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา" });
  }
};

// POST /api/subjects (Admin only)
export const createSubject = async (req, res) => {
  try {
    const {
      subject_code,
      title_th,
      title_en,
      prereq1,
      prereq2,
      credit,
      description_th,
      description_en,
      category,
      curriculum_code,
      curriculum_year,
      degree_level,
      track
    } = req.body;

    if (!subject_code || !title_th) {
      return res.status(400).json({ error: "กรุณาระบุรหัสวิชาและชื่อวิชาภาษาไทย" });
    }

    const newSubject = await prisma.subjects.create({
      data: {
        subject_code: subject_code.trim(),
        title_th: title_th.trim(),
        title_en: title_en ? title_en.trim() : "",
        prereq1: prereq1 ? prereq1.trim() : "ไม่มี",
        prereq2: prereq2 ? prereq2.trim() : null,
        credit: credit ? credit.trim() : "3(3-0-6)",
        description_th: description_th ? description_th.trim() : "",
        description_en: description_en ? description_en.trim() : "",
        category: category || "หมวดวิชาเฉพาะด้านบังคับ",
        curriculum_code: curriculum_code || "CS69",
        curriculum_year: curriculum_year ? parseInt(curriculum_year) : 2569,
        degree_level: degree_level || "bachelor",
        track: track || "ทั่วไป"
      }
    });

    res.status(201).json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ error: "ไม่สามารถเพิ่มข้อมูลรายวิชาได้" });
  }
};

// PUT /api/subjects/:id (Admin only)
export const updateSubject = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      subject_code,
      title_th,
      title_en,
      prereq1,
      prereq2,
      credit,
      description_th,
      description_en,
      category,
      curriculum_code,
      curriculum_year,
      degree_level,
      track
    } = req.body;

    const updated = await prisma.subjects.update({
      where: { id },
      data: {
        subject_code: subject_code ? subject_code.trim() : undefined,
        title_th: title_th ? title_th.trim() : undefined,
        title_en: title_en !== undefined ? title_en.trim() : undefined,
        prereq1: prereq1 !== undefined ? prereq1.trim() : undefined,
        prereq2: prereq2 !== undefined ? prereq2.trim() : undefined,
        credit: credit ? credit.trim() : undefined,
        description_th: description_th !== undefined ? description_th.trim() : undefined,
        description_en: description_en !== undefined ? description_en.trim() : undefined,
        category: category !== undefined ? category : undefined,
        curriculum_code: curriculum_code !== undefined ? curriculum_code : undefined,
        curriculum_year: curriculum_year ? parseInt(curriculum_year) : undefined,
        degree_level: degree_level !== undefined ? degree_level : undefined,
        track: track !== undefined ? track : undefined
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating subject:", error);
    res.status(500).json({ error: "ไม่สามารถอัปเดตข้อมูลรายวิชาได้" });
  }
};

// DELETE /api/subjects/:id (Admin only)
export const deleteSubject = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.subjects.delete({ where: { id } });
    res.json({ message: "ลบรายวิชาสำเร็จ" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    res.status(500).json({ error: "ไม่สามารถลบรายวิชาได้" });
  }
};

// POST /api/subjects/import-pdf (Admin only)
export const importSubjectsFromPdf = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์ PDF ของหลักสูตร" });
    }

    const {
      curriculum_code = "CS69",
      curriculum_year = "2569",
      degree_level = "bachelor",
      track = "ทั่วไป",
      action = "import", // "preview" | "import"
      replace_existing = "false"
    } = req.body;

    const parser = new PDFParse({ data: req.file.buffer });
    const parsedPdf = await parser.getText();

    if (!parsedPdf || !parsedPdf.text) {
      return res.status(400).json({ error: "ไม่สามารถอ่านข้อความจากไฟล์ PDF ได้" });
    }

    const subjects = parseSubjectsFromText(parsedPdf.text, {
      curriculum_code,
      curriculum_year: parseInt(curriculum_year) || 2569,
      degree_level,
      track
    });

    if (subjects.length === 0) {
      return res.status(400).json({ error: "ไม่พบข้อมูลรหัสวิชาและคำอธิบายในไฟล์ PDF นี้ กรุณาตรวจสอบว่าเป็นไฟล์หมวดที่ 3 หรือไม่" });
    }

    if (action === "preview") {
      return res.json({
        message: `วิเคราะห์พบ ${subjects.length} รายวิชา`,
        count: subjects.length,
        subjects
      });
    }

    // Save to Database
    if (replace_existing === "true") {
      await prisma.subjects.deleteMany({
        where: {
          curriculum_code,
          curriculum_year: parseInt(curriculum_year) || 2569
        }
      });
    }

    let insertedCount = 0;
    for (const sub of subjects) {
      await prisma.subjects.create({
        data: sub
      });
      insertedCount++;
    }

    res.json({
      message: `นำเข้าข้อมูลรายวิชาจาก PDF สำเร็จทั้งหมด ${insertedCount} รายวิชา`,
      count: insertedCount,
      subjects
    });
  } catch (error) {
    console.error("PDF Import Error:", error);
    res.status(500).json({ error: `เกิดข้อผิดพลาดในการประมวลผล PDF: ${error.message}` });
  }
};

// GET /api/subjects/template (Admin only)
export const downloadSubjectsTemplate = async (req, res) => {
  try {
    const sampleData = [
      {
        "รหัสวิชา (subject_code)": "040613001",
        "ชื่อวิชาภาษาไทย (title_th)": "การเขียนโปรแกรมคอมพิวเตอร์ 1",
        "ชื่อวิชาภาษาอังกฤษ (title_en)": "Computer Programming I",
        "หน่วยกิต (credit)": "3(2-2-5)",
        "วิชาบังคับก่อน 1 (prereq1)": "ไม่มี",
        "วิชาบังคับก่อน 2 (prereq2)": "",
        "คำอธิบายรายวิชาภาษาไทย (description_th)": "แนวคิดพื้นฐานเกี่ยวกับการเขียนโปรแกรม โครงสร้างข้อมูลเบื้องต้น การควบคุมการทำงาน ฟังก์ชัน และการแก้ปัญหาด้วยโปรแกรมคอมพิวเตอร์",
        "คำอธิบายรายวิชาภาษาอังกฤษ (description_en)": "Fundamental concepts of computer programming, basic data structures, control structures, functions, and problem solving using computer programs.",
        "หมวดหมู่วิชา (category)": "หมวดวิชาเฉพาะด้าน",
        "รหัสหลักสูตร (curriculum_code)": "CS69",
        "ปีหลักสูตร (curriculum_year)": 2569,
        "ระดับการศึกษา (degree_level)": "bachelor",
        "กลุ่ม/แขนงวิชา (track)": "Software Engineering & Cloud"
      },
      {
        "รหัสวิชา (subject_code)": "040613101",
        "ชื่อวิชาภาษาไทย (title_th)": "โครงสร้างข้อมูลและขั้นตอนวิธี",
        "ชื่อวิชาภาษาอังกฤษ (title_en)": "Data Structures and Algorithms",
        "หน่วยกิต (credit)": "3(3-0-6)",
        "วิชาบังคับก่อน 1 (prereq1)": "040613001",
        "วิชาบังคับก่อน 2 (prereq2)": "",
        "คำอธิบายรายวิชาภาษาไทย (description_th)": "การวิเคราะห์ขั้นตอนวิธี โครงสร้างข้อมูลแบบเชิงเส้นและไม่เชิงเส้น การค้นหา การเรียงลำดับ",
        "คำอธิบายรายวิชาภาษาอังกฤษ (description_en)": "Algorithm analysis, linear and non-linear data structures, searching, sorting algorithms.",
        "หมวดหมู่วิชา (category)": "หมวดวิชาเฉพาะด้าน",
        "รหัสหลักสูตร (curriculum_code)": "CS69",
        "ปีหลักสูตร (curriculum_year)": 2569,
        "ระดับการศึกษา (degree_level)": "bachelor",
        "กลุ่ม/แขนงวิชา (track)": "Software Engineering & Cloud"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subjects_Template");

    // Adjust column widths
    const colWidths = [
      { wch: 25 }, // subject_code
      { wch: 35 }, // title_th
      { wch: 35 }, // title_en
      { wch: 18 }, // credit
      { wch: 25 }, // prereq1
      { wch: 25 }, // prereq2
      { wch: 60 }, // description_th
      { wch: 60 }, // description_en
      { wch: 25 }, // category
      { wch: 20 }, // curriculum_code
      { wch: 20 }, // curriculum_year
      { wch: 25 }, // degree_level
      { wch: 35 }  // track
    ];
    ws["!cols"] = colWidths;

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=subjects_template.xlsx");
    res.send(buffer);
  } catch (error) {
    console.error("Template Download Error:", error);
    res.status(500).json({ error: "ไม่สามารถสร้างไฟล์ Template ได้" });
  }
};

// POST /api/subjects/import-excel (Admin only)
export const importSubjectsFromExcel = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์ Excel (.xlsx, .xls) หรือ CSV" });
    }

    const {
      curriculum_code_override,
      curriculum_year_override,
      degree_level_override,
      action = "import",
      replace_existing = "false"
    } = req.body;

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet);

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ error: "ไฟล์ไม่มีข้อมูลหรือว่างเปล่า" });
    }

    // Normalize keys (support both Thai column names and English column names)
    const normalizedSubjects = rawData.map(row => {
      const getVal = (...keys) => {
        for (const k of keys) {
          if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
            return String(row[k]).trim();
          }
        }
        return "";
      };

      const subject_code = getVal("subject_code", "รหัสวิชา", "รหัสวิชา (subject_code)", "Code");
      const title_th = getVal("title_th", "ชื่อวิชาภาษาไทย", "ชื่อวิชาภาษาไทย (title_th)", "ชื่อวิชา (ไทย)", "Title TH");
      const title_en = getVal("title_en", "ชื่อวิชาภาษาอังกฤษ", "ชื่อวิชาภาษาอังกฤษ (title_en)", "ชื่อวิชา (อังกฤษ)", "Title EN");
      const credit = getVal("credit", "หน่วยกิต", "หน่วยกิต (credit)", "Credit") || "3(3-0-6)";
      const prereq1 = getVal("prereq1", "วิชาบังคับก่อน 1", "วิชาบังคับก่อน 1 (prereq1)", "วิชาบังคับก่อน", "Prerequisite 1") || "ไม่มี";
      const prereq2 = getVal("prereq2", "วิชาบังคับก่อน 2", "วิชาบังคับก่อน 2 (prereq2)", "Prerequisite 2") || null;
      const description_th = getVal("description_th", "คำอธิบายรายวิชาภาษาไทย", "คำอธิบายรายวิชาภาษาไทย (description_th)", "คำอธิบาย (ไทย)", "Description TH");
      const description_en = getVal("description_en", "คำอธิบายรายวิชาภาษาอังกฤษ", "คำอธิบายรายวิชาภาษาอังกฤษ (description_en)", "คำอธิบาย (อังกฤษ)", "Description EN");
      const category = getVal("category", "หมวดหมู่วิชา", "หมวดหมู่วิชา (category)", "หมวดวิชา", "Category") || "หมวดวิชาเฉพาะด้าน";
      const curriculum_code = curriculum_code_override || getVal("curriculum_code", "รหัสหลักสูตร", "รหัสหลักสูตร (curriculum_code)", "หลักสูตร") || "CS69";
      const curriculum_year = curriculum_year_override ? parseInt(curriculum_year_override) : (parseInt(getVal("curriculum_year", "ปีหลักสูตร", "ปีหลักสูตร (curriculum_year)", "ปี")) || 2569);
      const degree_level = degree_level_override || getVal("degree_level", "ระดับการศึกษา", "ระดับการศึกษา (degree_level)", "ระดับ", "Degree") || "bachelor";
      const track = getVal("track", "กลุ่ม/แขนงวิชา", "กลุ่ม/แขนงวิชา (track)", "แขนง", "Track") || "ทั่วไป";

      return {
        subject_code,
        title_th,
        title_en: title_en || title_th,
        credit,
        prereq1,
        prereq2,
        description_th: description_th || title_th,
        description_en: description_en || title_en || null,
        category,
        curriculum_code,
        curriculum_year,
        degree_level,
        track
      };
    }).filter(s => s.subject_code && s.title_th);

    if (normalizedSubjects.length === 0) {
      return res.status(400).json({ error: "ไม่พบข้อมูลรายวิชาที่ถูกต้องในไฟล์ กรุณาตรวจสอบหัวตาราง (Headers)" });
    }

    if (action === "preview") {
      return res.json({
        message: `วิเคราะห์พบ ${normalizedSubjects.length} รายวิชา`,
        count: normalizedSubjects.length,
        subjects: normalizedSubjects
      });
    }

    // Save to Database
    if (replace_existing === "true" && normalizedSubjects.length > 0) {
      const distinctCurr = [...new Set(normalizedSubjects.map(s => `${s.curriculum_code}_${s.curriculum_year}`))];
      for (const item of distinctCurr) {
        const [code, year] = item.split("_");
        await prisma.subjects.deleteMany({
          where: {
            curriculum_code: code,
            curriculum_year: parseInt(year)
          }
        });
      }
    }

    let insertedCount = 0;
    for (const sub of normalizedSubjects) {
      await prisma.subjects.create({
        data: sub
      });
      insertedCount++;
    }

    res.json({
      message: `นำเข้าข้อมูลรายวิชาจากไฟล์ Excel สำเร็จ ${insertedCount} รายการ`,
      count: insertedCount,
      subjects: normalizedSubjects
    });
  } catch (error) {
    console.error("Excel Import Error:", error);
    res.status(500).json({ error: `เกิดข้อผิดพลาดในการประมวลผลไฟล์ Excel: ${error.message}` });
  }
};

// POST /api/subjects/batch-import (Admin only - raw JSON items)
export const batchImportSubjects = async (req, res) => {
  try {
    const { subjects: items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "ข้อมูลรายวิชาไม่ถูกต้องหรือว่างเปล่า" });
    }

    let createdCount = 0;
    for (const item of items) {
      if (!item.subject_code || !item.title_th) continue;

      await prisma.subjects.create({
        data: {
          subject_code: String(item.subject_code).trim(),
          title_th: String(item.title_th).trim(),
          title_en: item.title_en ? String(item.title_en).trim() : "",
          prereq1: item.prereq1 ? String(item.prereq1).trim() : "ไม่มี",
          prereq2: item.prereq2 ? String(item.prereq2).trim() : null,
          credit: item.credit ? String(item.credit).trim() : "3(3-0-6)",
          description_th: item.description_th ? String(item.description_th).trim() : "",
          description_en: item.description_en ? String(item.description_en).trim() : "",
          category: item.category || "หมวดวิชาเฉพาะด้านบังคับ",
          curriculum_code: item.curriculum_code || "CS69",
          curriculum_year: item.curriculum_year ? parseInt(item.curriculum_year) : 2569,
          degree_level: item.degree_level || "bachelor",
          track: item.track || "ทั่วไป"
        }
      });
      createdCount++;
    }

    res.json({ message: `นำเข้าข้อมูลรายวิชาสำเร็จ ${createdCount} รายการ` });
  } catch (error) {
    console.error("Batch import error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการนำเข้าข้อมูล" });
  }
};

