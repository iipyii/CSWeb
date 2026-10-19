import { prisma } from "../lib/prisma.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
const XLSX = require("xlsx");

export function normalizeThaiText(text) {
  if (!text) return "";
  return text
    .replace(/[\x9B\u009B›]/g, "่")
    .replace(/[\x9C\u009Cœ\x9A\u009Aš]/g, "้")
    .replace(/[\x9D\u009D\x8E\u008E]/g, "์")
    .replace(/[\x9E\u009Ež]/g, "ั")
    .replace(/[\x9F\u009FŸ]/g, "็")
    .replace(/[\x85\u0085—]/g, "ึ")
    .replace(/[\x98\u0098˜]/g, "ื")
    .replace(/[\x84\u0084\x95\u0095•]/g, "ิ")
    .replace(/\uF701/g, "ิ")
    .replace(/\uF702/g, "ี")
    .replace(/\uF703/g, "ึ")
    .replace(/\uF704/g, "ื")
    .replace(/\uF705/g, "่")
    .replace(/\uF706/g, "้")
    .replace(/\uF709/g, "์")
    .replace(/\uF70A/g, "่")
    .replace(/\uF70B/g, "้")
    .replace(/\uF70C/g, "๊")
    .replace(/\uF70D/g, "๋")
    .replace(/\uF70E/g, "์")
    .replace(/\uF70F/g, "ํ")
    .replace(/\uF710/g, "ั")
    .replace(/\uF711/g, "่")
    .replace(/\uF712/g, "็")
    .replace(/\uF713/g, "้")
    .replace(/\uF714/g, "๊")
    .replace(/\uF715/g, "ั")
    .replace(/\uF716/g, "็")
    .replace(/\uF717/g, "์")
    .replace(/\uF718/g, "ิ")
    .replace(/\uF719/g, "ี")
    .replace(/\uF71A/g, "ึ")
    .replace(/ํ[ ]*า/g, "ำ")
    .replace(/\u0E4D\u0E32/g, "ำ");
}

export function fixThaiSpacing(str) {
  if (!str) return "";
  let s = str;
  s = s.replace(/([ก-ฮ])\s+([่้๊๋์ิีึืุูั็])/g, "$1$2");
  s = s.replace(/([่้๊๋์ิีึืุูั็])\s+([ก-ฮะ-ูเ-ไ])/g, "$1$2");
  s = s.replace(/([่้๊๋์ิีึืุูั็])\s+([ก-ฮะ-ูเ-ไ])/g, "$1$2");
  // Decomposed SARA AM: Consonant + space + า -> Consonant + ำ
  s = s.replace(/([ก-ฮ])\s+า(?![a-zA-Z0-9])/g, "$1ำ");
  s = s.replace(/([ก-ฮ])([่้๊๋])\s+า(?![a-zA-Z0-9])/g, "$1$2ำ");

  // Fix Latin 'O' or '0' used as thanthakhat / garan
  s = s.replace(/ซอฟต[O0]แวร[O0]?/g, "ซอฟต์แวร์");
  s = s.replace(/([ก-ฮ])([O0])(?=[ก-ฮ\s]|$)/g, "$1์");

  // Missing SARA AM words (where า was stored without ํ)
  s = s
    .replace(/(?<![ก-ฮ])สาหรับ(?![ก-ฮ])/g, "สำหรับ")
    .replace(/(?<![ก-ฮ])จานวน(?![ก-ฮ])/g, "จำนวน")
    .replace(/(?<![ก-ฮ])กาหนด(?![ก-ฮ])/g, "กำหนด")
    .replace(/(?<![ก-ฮ])กาเนิด(?![ก-ฮ])/g, "กำเนิด")
    .replace(/(?<![ก-ฮ])กาจัด(?![ก-ฮ])/g, "กำจัด")
    .replace(/(?<![ก-ฮ])ทาวิจัย(?![ก-ฮ])/g, "ทำวิจัย")
    .replace(/(?<![ก-ฮ])ทาวิทยานิพนธ์(?![ก-ฮ])/g, "ทำวิทยานิพนธ์")
    .replace(/(?<![ก-ฮ])การทางาน(?![ก-ฮ])/g, "การทำงาน")
    .replace(/(?<![ก-ฮ])ทาการ(?![ก-ฮ])/g, "ทำการ")
    .replace(/(?<![ก-ฮ])ทาหน้าที่(?![ก-ฮ])/g, "ทำหน้าที่")
    .replace(/(?<![ก-ฮ])ทาความ(?![ก-ฮ])/g, "ทำความ")
    .replace(/(?<![ก-ฮ])จัดทา(?![ก-ฮ])/g, "จัดทำ")
    .replace(/(?<![ก-ฮ])ทานาย(?![ก-ฮ])/g, "ทำนาย")
    .replace(/(?<![ก-ฮ])คาแนะนา(?![ก-ฮ])/g, "คำแนะนำ")
    .replace(/(?<![ก-ฮ])คาตอบ(?![ก-ฮ])/g, "คำตอบ")
    .replace(/(?<![ก-ฮ])คาถาม(?![ก-ฮ])/g, "คำถาม")
    .replace(/(?<![ก-ฮ])คานวณ(?![ก-ฮ])/g, "คำนวณ")
    .replace(/(?<![ก-ฮ])คาศัพท์(?![ก-ฮ])/g, "คำศัพท์")
    .replace(/(?<![ก-ฮ])นาเสนอ(?![ก-ฮ])/g, "นำเสนอ")
    .replace(/(?<![ก-ฮ])นาทาง(?![ก-ฮ])/g, "นำทาง")
    .replace(/(?<![ก-ฮ])นาเข้า(?![ก-ฮ])/g, "นำเข้า")
    .replace(/(?<![ก-ฮ])นาออก(?![ก-ฮ])/g, "นำออก")
    .replace(/(?<![ก-ฮ])นาไปใช้(?![ก-ฮ])/g, "นำไปใช้")
    .replace(/(?<![ก-ฮ])นามาใช้(?![ก-ฮ])/g, "นำมาใช้")
    .replace(/(?<![ก-ฮ])การนา(?![ก-ฮ])/g, "การนำ")
    .replace(/(?<![ก-ฮ])ดาเนิน(?![ก-ฮ])/g, "ดำเนิน")
    .replace(/(?<![ก-ฮ])สารวจ(?![ก-ฮ])/g, "สำรวจ")
    .replace(/(?<![ก-ฮ])สาเร็จ(?![ก-ฮ])/g, "สำเร็จ")
    .replace(/(?<![ก-ฮ])สาคัญ(?![ก-ฮ])/g, "สำคัญ")
    .replace(/(?<![ก-ฮ])จาลอง(?![ก-ฮ])/g, "จำลอง")
    .replace(/(?<![ก-ฮ])จาแนก(?![ก-ฮ])/g, "จำแนก")
    .replace(/(?<![ก-ฮ])จากัด(?![ก-ฮ])/g, "จำกัด")
    .replace(/(?<![ก-ฮ])จาเป็น(?![ก-ฮ])/g, "จำเป็น")
    .replace(/(?<![ก-ฮ])จดจา(?![ก-ฮ])/g, "จดจำ")
    .replace(/(?<![ก-ฮ])ประจาวัน(?![ก-ฮ])/g, "ประจำวัน");

  // Specific common misspellings from OCR / PDF
  s = s
    .replace(/ฝกประสบการณ[ ]*วิชาชีพ/g, "ฝึกประสบการณ์วิชาชีพ")
    .replace(/ฝกประสบการณ/g, "ฝึกประสบการณ์")
    .replace(/ประสบการณ(?!์)/g, "ประสบการณ์")
    .replace(/ฝกงาน/g, "ฝึกงาน")
    .replace(/สมบูรณ(?!์)/g, "สมบูรณ์")
    .replace(/ประยุกต(?!์)/g, "ประยุกต์")
    .replace(/ประสิทธภาพ/g, "ประสิทธิภาพ");

  s = s
    .replace(/ซอฟต[ ]*แวร[ ]*/g, "ซอฟต์แวร์")
    .replace(/คอมพิวเตอร[ ]*/g, "คอมพิวเตอร์")
    .replace(/อินเทอร[ ]*เน็ต/g, "อินเทอร์เน็ต")
    .replace(/ปัญญาประดิษฐ[ ]*/g, "ปัญญาประดิษฐ์")
    .replace(/คณิตศาสตร[ ]*/g, "คณิตศาสตร์")
    .replace(/วิทยาศาสตร[ ]*/g, "วิทยาศาสตร์")
    .replace(/ศาสตร[ ]*(?=[ก-ฮ\s]|$)/g, "ศาสตร์")
    .replace(/วิเคราะห[ ]*(?=[ก-ฮ\s]|$)/g, "วิเคราะห์")
    .replace(/โครงงานพิกษ/g, "โครงงานพิเศษ")
    .replace(/กราฟ[ •\x95]*กส[ ]*/g, "กราฟิกส์")
    .replace(/ฟ[ •\x95]*สิกส[ ]*/g, "ฟิสิกส์")
    .replace(/เวิลด[ ]*/g, "เวิลด์")
    .replace(/คลาวด[ ]*/g, "คลาวด์")
    .replace(/ไซเบอร[ ]*/g, "ไซเบอร์")
    .replace(/แพลตฟอร[ ]*ม/g, "แพลตฟอร์ม")
    .replace(/เซิร[ ]*ฟเวอร[ ]*/g, "เซิร์ฟเวอร์")
    .replace(/ไดรฟ[ ]*/g, "ไดรฟ์")
    .replace(/อิเล็กทรอนิกส[ ]*/g, "อิเล็กทรอนิกส์")
    .replace(/รีจิสเตอร[ ]*/g, "รีจิสเตอร์")
    .replace(/แดชบอร[ ]*ด/g, "แดชบอร์ด")
    .replace(/อีเวนท[ ]*/g, "อีเวนต์")
    .replace(/โมบายล[ ]*/g, "โมบายล์")
    .replace(/แอปพลิเคช[ ]*น/g, "แอปพลิเคชัน")
    .replace(/สตาร[ ]*ตอัพ/g, "สตาร์ตอัป")
    .replace(/สตาร[ ]*ทอัพ/g, "สตาร์ทอัพ")
    .replace(/สาหรับการคณนา/g, "สำหรับการคณนา")
    .replace(/([์ิีึืุูั็่้๊๋])\1+/g, "$1")
    .replace(/\s*\*+\s*/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
  return s;
}

function cleanThaiEncoding(str) {
  return fixThaiSpacing(normalizeThaiText(str));
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
      const codeTrim = curriculum_code.trim();
      if (codeTrim.includes(",")) {
        const codeList = codeTrim.split(",").map(c => c.trim()).filter(Boolean);
        where.curriculum_code = { in: codeList };
      } else {
        where.curriculum_code = { equals: codeTrim, mode: "insensitive" };
      }
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

    let isSearchByKeyword = false;
    let rawKeyword = "";
    if (keyword && keyword.trim() !== "") {
      isSearchByKeyword = true;
      rawKeyword = keyword.trim();
      const hasThai = /[\u0E00-\u0E7F]/.test(rawKeyword);
      const cleanCode = rawKeyword.replace(/[^0-9a-zA-Z]/g, "");
      const isDigitsOnly = /^\d+$/.test(cleanCode) && cleanCode.length >= 3 && !hasThai;
      const isSpecificCode = cleanCode.length >= 8 && /^\d+$/.test(cleanCode) && !hasThai;

      if (isSpecificCode) {
        // Exact subject code search (8-9 digits) -> match subject_code only!
        where.subject_code = { equals: cleanCode };
      } else if (isDigitsOnly) {
        // Partial subject code digits -> match subject_code only!
        where.subject_code = { contains: cleanCode, mode: "insensitive" };
      } else {
        // Search by subject name / title
        const normQ = cleanThaiEncoding(rawKeyword);
        const words = normQ.split(/\s+/).filter(w => w.length >= 1);
        const orConditions = [];

        if (words.length > 1) {
          // Require all words to be in title (AND logic across words)
          orConditions.push({
            AND: words.map(w => ({
              title_th: { contains: w, mode: "insensitive" }
            }))
          });
          orConditions.push({
            AND: words.map(w => ({
              title_en: { contains: w, mode: "insensitive" }
            }))
          });
          orConditions.push({
            title_th: { contains: normQ, mode: "insensitive" }
          });
          orConditions.push({
            title_en: { contains: rawKeyword, mode: "insensitive" }
          });
        } else {
          orConditions.push({ title_th: { contains: normQ, mode: "insensitive" } });
          orConditions.push({ title_en: { contains: rawKeyword, mode: "insensitive" } });
        }

        // Only search subject_code if query is not Thai and has at least 3 chars, or code has at least 6 digits
        if ((!hasThai && cleanCode.length >= 3) || cleanCode.length >= 6) {
          orConditions.push({ subject_code: { contains: cleanCode, mode: "insensitive" } });
        }

        where.OR = orConditions;
      }
    }

    let subjects = await prisma.subjects.findMany({
      where,
      orderBy: [
        { curriculum_year: "desc" },
        { subject_code: "asc" }
      ]
    });

    // Fallback: If 0 results matched title/code, and user typed text (not digits),
    // search inside description_th and description_en
    if (subjects.length === 0 && isSearchByKeyword) {
      const cleanCode = rawKeyword.replace(/[^0-9a-zA-Z]/g, "");
      const isDigitsOnly = /^\d+$/.test(cleanCode);
      if (!isDigitsOnly && rawKeyword.length >= 2) {
        const normQ = cleanThaiEncoding(rawKeyword);
        const fallbackWhere = { ...where };
        delete fallbackWhere.OR;
        fallbackWhere.OR = [
          { description_th: { contains: normQ, mode: "insensitive" } },
          { description_en: { contains: rawKeyword, mode: "insensitive" } }
        ];
        subjects = await prisma.subjects.findMany({
          where: fallbackWhere,
          orderBy: [
            { curriculum_year: "desc" },
            { subject_code: "asc" }
          ]
        });
      }
    }

    // Smart Ranking:
    // Exact subject_code match first, exact title match second, startsWith third
    if (isSearchByKeyword && subjects.length > 1) {
      const qLower = rawKeyword.toLowerCase();
      const cleanCode = rawKeyword.replace(/[^0-9a-zA-Z]/g, "").toLowerCase();

      subjects.sort((a, b) => {
        const aCode = (a.subject_code || "").toLowerCase();
        const bCode = (b.subject_code || "").toLowerCase();
        const aTitleTh = (a.title_th || "").toLowerCase();
        const bTitleTh = (b.title_th || "").toLowerCase();
        const aTitleEn = (a.title_en || "").toLowerCase();
        const bTitleEn = (b.title_en || "").toLowerCase();

        // 1. Exact subject code match
        const aExactCode = cleanCode && aCode === cleanCode;
        const bExactCode = cleanCode && bCode === cleanCode;
        if (aExactCode && !bExactCode) return -1;
        if (!aExactCode && bExactCode) return 1;

        // 2. Exact title match
        const aExactTitle = aTitleTh === qLower || aTitleEn === qLower;
        const bExactTitle = bTitleTh === qLower || bTitleEn === qLower;
        if (aExactTitle && !bExactTitle) return -1;
        if (!aExactTitle && bExactTitle) return 1;

        // 3. Subject code starts with cleanCode
        const aCodeStart = cleanCode && aCode.startsWith(cleanCode);
        const bCodeStart = cleanCode && bCode.startsWith(cleanCode);
        if (aCodeStart && !bCodeStart) return -1;
        if (!aCodeStart && bCodeStart) return 1;

        // 4. Title starts with search term
        const aTitleStart = aTitleTh.startsWith(qLower) || aTitleEn.startsWith(qLower);
        const bTitleStart = bTitleTh.startsWith(qLower) || bTitleEn.startsWith(qLower);
        if (aTitleStart && !bTitleStart) return -1;
        if (!aTitleStart && bTitleStart) return 1;

        // Default: curriculum_year desc, then subject_code asc
        if (b.curriculum_year !== a.curriculum_year) {
          return b.curriculum_year - a.curriculum_year;
        }
        return aCode.localeCompare(bCode);
      });
    }

    // Enrich subjects with prerequisite course titles
    const prereqCodes = new Set();
    subjects.forEach(s => {
      if (s.prereq1 && s.prereq1 !== "ไม่มี" && /^\d+$/.test(s.prereq1.trim())) {
        prereqCodes.add(s.prereq1.trim());
      }
      if (s.prereq2 && s.prereq2 !== "ไม่มี" && /^\d+$/.test(s.prereq2.trim())) {
        prereqCodes.add(s.prereq2.trim());
      }
    });

    let prereqTitleMap = new Map();
    if (prereqCodes.size > 0) {
      const prereqSubjects = await prisma.subjects.findMany({
        where: {
          subject_code: { in: Array.from(prereqCodes) }
        },
        select: {
          subject_code: true,
          title_th: true,
          curriculum_code: true
        }
      });
      for (const ps of prereqSubjects) {
        if (!prereqTitleMap.has(ps.subject_code)) {
          prereqTitleMap.set(ps.subject_code, ps.title_th);
        }
      }
    }

    const enrichedSubjects = subjects.map(s => ({
      ...s,
      prereq1_title: prereqTitleMap.get((s.prereq1 || "").trim()) || null,
      prereq2_title: prereqTitleMap.get((s.prereq2 || "").trim()) || null
    }));

    res.json(enrichedSubjects);
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

    let prereq1_title = null;
    let prereq2_title = null;
    const prereqCodes = [subject.prereq1, subject.prereq2].filter(c => c && c !== "ไม่มี" && /^\d+$/.test(c.trim()));
    if (prereqCodes.length > 0) {
      const prereqs = await prisma.subjects.findMany({
        where: { subject_code: { in: prereqCodes } },
        select: { subject_code: true, title_th: true }
      });
      const map = new Map(prereqs.map(p => [p.subject_code, p.title_th]));
      prereq1_title = map.get((subject.prereq1 || "").trim()) || null;
      prereq2_title = map.get((subject.prereq2 || "").trim()) || null;
    }

    res.json({
      ...subject,
      prereq1_title,
      prereq2_title
    });
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

    const targetCurriculumCode = (curriculum_code || "CS69").trim();
    let pvId = req.body.program_version_id ? parseInt(req.body.program_version_id) : null;
    if (!pvId) {
      const pv = await prisma.program_versions.findFirst({
        where: { curriculum_code: targetCurriculumCode }
      });
      if (pv) pvId = pv.id;
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
        curriculum_code: targetCurriculumCode,
        curriculum_year: curriculum_year ? parseInt(curriculum_year) : 2569,
        degree_level: degree_level || "bachelor",
        track: track || "ทั่วไป",
        program_version_id: pvId
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

    let pvId = req.body.program_version_id ? parseInt(req.body.program_version_id) : undefined;
    if (pvId === undefined && curriculum_code) {
      const pv = await prisma.program_versions.findFirst({
        where: { curriculum_code: curriculum_code.trim() }
      });
      if (pv) pvId = pv.id;
    }

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
        curriculum_code: curriculum_code !== undefined ? curriculum_code.trim() : undefined,
        curriculum_year: curriculum_year ? parseInt(curriculum_year) : undefined,
        degree_level: degree_level !== undefined ? degree_level : undefined,
        track: track !== undefined ? track : undefined,
        program_version_id: pvId
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
    // ดึงตัวอย่างรายวิชาจริงจากฐานข้อมูลแบบ Dynamic เพื่อสร้างไฟล์ Template
    const existing = await prisma.subjects.findMany({
      take: 2,
      orderBy: { created_at: "desc" }
    });

    let sampleData = [];
    if (existing.length > 0) {
      sampleData = existing.map(s => ({
        "รหัสวิชา (subject_code)": s.subject_code,
        "ชื่อวิชาภาษาไทย (title_th)": s.title_th,
        "ชื่อวิชาภาษาอังกฤษ (title_en)": s.title_en || "",
        "หน่วยกิต (credit)": s.credit || "3(3-0-6)",
        "วิชาบังคับก่อน 1 (prereq1)": s.prereq1 || "ไม่มี",
        "วิชาบังคับก่อน 2 (prereq2)": s.prereq2 || "",
        "คำอธิบายรายวิชาภาษาไทย (description_th)": s.description_th || "",
        "คำอธิบายรายวิชาภาษาอังกฤษ (description_en)": s.description_en || "",
        "หมวดหมู่วิชา (category)": s.category || "หมวดวิชาเฉพาะด้าน",
        "รหัสหลักสูตร (curriculum_code)": s.curriculum_code,
        "ปีหลักสูตร (curriculum_year)": s.curriculum_year,
        "ระดับการศึกษา (degree_level)": s.degree_level,
        "กลุ่ม/แขนงวิชา (track)": s.track || "ทั่วไป"
      }));
    } else {
      sampleData = [
        {
          "รหัสวิชา (subject_code)": "040600001",
          "ชื่อวิชาภาษาไทย (title_th)": "ตัวอย่างวิชาภาษาไทย",
          "ชื่อวิชาภาษาอังกฤษ (title_en)": "Sample Subject English",
          "หน่วยกิต (credit)": "3(3-0-6)",
          "วิชาบังคับก่อน 1 (prereq1)": "ไม่มี",
          "วิชาบังคับก่อน 2 (prereq2)": "",
          "คำอธิบายรายวิชาภาษาไทย (description_th)": "คำอธิบายรายวิชาตัวอย่าง...",
          "คำอธิบายรายวิชาภาษาอังกฤษ (description_en)": "Sample course description...",
          "หมวดหมู่วิชา (category)": "หมวดวิชาเฉพาะด้าน",
          "รหัสหลักสูตร (curriculum_code)": "CS69",
          "ปีหลักสูตร (curriculum_year)": 2569,
          "ระดับการศึกษา (degree_level)": "bachelor",
          "กลุ่ม/แขนงวิชา (track)": "ทั่วไป"
        }
      ];
    }

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

// ==========================================
// 🎓 CURRICULUM OPTIONS (จัดการปี/หลักสูตร)
// ==========================================

export const DEFAULT_CURRICULUMS = [
  { code: 'CS69', label: 'CS69 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2569)', year: 2569, degree: 'bachelor' },
  { code: 'CS64', label: 'CS64 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2564)', year: 2564, degree: 'bachelor' },
  { code: 'CSB64', label: 'CSB64 - โครงการพิเศษ สองภาษา (พ.ศ. 2564)', year: 2564, degree: 'bachelor' },
  { code: 'CS59', label: 'CS59 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2559)', year: 2559, degree: 'bachelor' },
  { code: 'CS54', label: 'CS54 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2554)', year: 2554, degree: 'bachelor' },
  { code: 'MS-CS67', label: 'MS-CS67 - วท.ม. วิทยาการคอมพิวเตอร์ (พ.ศ. 2567)', year: 2567, degree: 'master' },
  { code: 'MS-CS62', label: 'MS-CS62 - วท.ม. วิทยาการคอมพิวเตอร์ (พ.ศ. 2562)', year: 2562, degree: 'master' },
  { code: 'MS-SE59', label: 'MS-SE59 - วท.ม. วิศวกรรมซอฟต์แวร์ (พ.ศ. 2559)', year: 2559, degree: 'master' },
  { code: 'PhD-CS64', label: 'PhD-CS64 - ปร.ด. วิทยาการคอมพิวเตอร์ (พ.ศ. 2564)', year: 2564, degree: 'doctorate' }
];

export const getCurriculums = async (req, res) => {
  try {
    // 1. ดึงข้อมูลจาก program_versions และ programs ในฐานข้อมูลโดยตรง (Single Source of Truth)
    const versions = await prisma.program_versions.findMany({
      include: {
        program: {
          include: { degree: true }
        }
      },
      orderBy: { year: "desc" }
    });

    // 2. นับจำนวนรายวิชาของแต่ละหลักสูตร
    const countMap = new Map();
    try {
      const counts = await prisma.subjects.groupBy({
        by: ['curriculum_code'],
        _count: { id: true }
      });
      for (const item of counts) {
        if (item.curriculum_code) {
          countMap.set(item.curriculum_code.toLowerCase().trim(), item._count.id);
        }
      }
    } catch (e) {}

    const list = [];
    const seenCodes = new Set();

    // Map ข้อมูลจาก programs และ program_versions เป็นหลัก
    for (const v of versions) {
      const code = v.curriculum_code || `${(v.program?.slug || 'CS').toUpperCase()}${String(v.year).slice(-2)}`;
      const normalizedCode = code.toLowerCase().includes('inter') ? 'CSB64' : code;
      const key = normalizedCode.toLowerCase().trim();
      if (!seenCodes.has(key)) {
        seenCodes.add(key);
        list.push({
          code: normalizedCode,
          label: `${normalizedCode} - ${v.program?.name_th || 'หลักสูตร'} (พ.ศ. ${v.year})`,
          year: v.year,
          degree: v.program?.degree?.slug || 'bachelor',
          programId: v.programId,
          versionId: v.id,
          subjectCount: countMap.get(key) || 0
        });
      }
    }

    // 3. Fallback: รวมตัวเลือกเดิมเพื่อความต่อเนื่อง
    for (const item of DEFAULT_CURRICULUMS) {
      const key = item.code.toLowerCase().trim();
      if (!seenCodes.has(key)) {
        seenCodes.add(key);
        list.push({
          ...item,
          subjectCount: countMap.get(key) || 0
        });
      }
    }

    // 4. ผสานรหัสหลักสูตรที่มีอยู่ในตาราง subjects
    try {
      const dbGroups = await prisma.subjects.groupBy({
        by: ['curriculum_code', 'curriculum_year', 'degree_level']
      });

      for (const g of dbGroups) {
        if (!g.curriculum_code) continue;
        const normalizedCode = g.curriculum_code.toLowerCase().includes('inter') ? 'CSB64' : g.curriculum_code;
        const key = normalizedCode.toLowerCase().trim();
        if (!seenCodes.has(key)) {
          seenCodes.add(key);
          list.push({
            code: normalizedCode,
            label: `${normalizedCode} (พ.ศ. ${g.curriculum_year || 'ไม่ระบุ'})`,
            year: g.curriculum_year || 2564,
            degree: g.degree_level || 'bachelor',
            subjectCount: countMap.get(key) || 0
          });
        }
      }
    } catch (e) {}

    list.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));
    res.json(list);
  } catch (error) {
    console.error("Get curriculums error:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลหลักสูตรได้" });
  }
};

export const createCurriculum = async (req, res) => {
  try {
    const { code, label, year, degree } = req.body;
    if (!code || !label) {
      return res.status(400).json({ error: "กรุณาระบุรหัสหลักสูตรและชื่อหลักสูตร" });
    }

    const trimmedCode = String(code).trim();
    const config = await prisma.site_config.findUnique({
      where: { config_key: "curriculum_options" }
    });

    let list = [];
    if (config?.config_value) {
      try { list = JSON.parse(config.config_value); } catch (e) { list = [...DEFAULT_CURRICULUMS]; }
    } else {
      list = [...DEFAULT_CURRICULUMS];
    }

    if (list.some(c => c.code.toLowerCase() === trimmedCode.toLowerCase())) {
      return res.status(400).json({ error: `รหัสหลักสูตร ${trimmedCode} มีอยู่ในระบบแล้ว` });
    }

    const newItem = {
      code: trimmedCode,
      label: String(label).trim(),
      year: parseInt(year) || 2569,
      degree: degree || "bachelor"
    };

    list.push(newItem);
    list.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));

    await prisma.site_config.upsert({
      where: { config_key: "curriculum_options" },
      update: { config_value: JSON.stringify(list) },
      create: {
        config_key: "curriculum_options",
        config_value: JSON.stringify(list),
        description: "รายการตัวเลือกหลักสูตรและปีการศึกษา"
      }
    });

    res.json({ message: "เพิ่มตัวเลือกหลักสูตรสำเร็จ", data: list });
  } catch (error) {
    console.error("Create curriculum error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มหลักสูตร" });
  }
};

export const updateCurriculum = async (req, res) => {
  try {
    const { code } = req.params;
    const { newCode, label, year, degree } = req.body;

    const config = await prisma.site_config.findUnique({
      where: { config_key: "curriculum_options" }
    });

    let list = [];
    if (config?.config_value) {
      try { list = JSON.parse(config.config_value); } catch (e) { list = [...DEFAULT_CURRICULUMS]; }
    } else {
      list = [...DEFAULT_CURRICULUMS];
    }

    const idx = list.findIndex(c => c.code.toLowerCase() === code.toLowerCase());
    if (idx === -1) {
      return res.status(404).json({ error: "ไม่พบหลักสูตรนี้ในระบบ" });
    }

    const finalCode = (newCode && newCode.trim()) ? newCode.trim() : list[idx].code;

    if (finalCode.toLowerCase() !== code.toLowerCase() && list.some((c, i) => i !== idx && c.code.toLowerCase() === finalCode.toLowerCase())) {
      return res.status(400).json({ error: `รหัสหลักสูตร ${finalCode} มีอยู่ในระบบแล้ว` });
    }

    list[idx] = {
      code: finalCode,
      label: label ? String(label).trim() : list[idx].label,
      year: year ? parseInt(year) : list[idx].year,
      degree: degree || list[idx].degree || "bachelor"
    };

    list.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0));

    await prisma.site_config.upsert({
      where: { config_key: "curriculum_options" },
      update: { config_value: JSON.stringify(list) },
      create: {
        config_key: "curriculum_options",
        config_value: JSON.stringify(list),
        description: "รายการตัวเลือกหลักสูตรและปีการศึกษา"
      }
    });

    if (finalCode !== code) {
      await prisma.subjects.updateMany({
        where: { curriculum_code: code },
        data: {
          curriculum_code: finalCode,
          curriculum_year: parseInt(year) || undefined,
          degree_level: degree || undefined
        }
      });
    }

    res.json({ message: "แก้ไขตัวเลือกหลักสูตรสำเร็จ", data: list });
  } catch (error) {
    console.error("Update curriculum error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขหลักสูตร" });
  }
};

export const deleteCurriculum = async (req, res) => {
  try {
    const { code } = req.params;

    const config = await prisma.site_config.findUnique({
      where: { config_key: "curriculum_options" }
    });

    let list = [];
    if (config?.config_value) {
      try { list = JSON.parse(config.config_value); } catch (e) { list = [...DEFAULT_CURRICULUMS]; }
    } else {
      list = [...DEFAULT_CURRICULUMS];
    }

    const filtered = list.filter(c => c.code.toLowerCase() !== code.toLowerCase());

    await prisma.site_config.upsert({
      where: { config_key: "curriculum_options" },
      update: { config_value: JSON.stringify(filtered) },
      create: {
        config_key: "curriculum_options",
        config_value: JSON.stringify(filtered),
        description: "รายการตัวเลือกหลักสูตรและปีการศึกษา"
      }
    });

    res.json({ message: "ลบตัวเลือกหลักสูตรสำเร็จ", data: filtered });
  } catch (error) {
    console.error("Delete curriculum error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบหลักสูตร" });
  }
};

