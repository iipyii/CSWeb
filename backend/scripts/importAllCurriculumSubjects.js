import fs from "fs";
import { createRequire } from "module";
import { PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
const prisma = new PrismaClient();

// 1. Normalize Thai PUA & Broken Windows-874 / Mac Encodings
export function normalizeThaiText(text) {
  if (!text) return "";
  return text
    // Replace Win-874 / Mac broken single-byte characters
    .replace(/[\x9B\u009B›]/g, "่")
    .replace(/[\x9C\u009Cœ\x9A\u009Aš]/g, "้")
    .replace(/[\x9D\u009D\x8E\u008E]/g, "์")
    .replace(/[\x9E\u009Ež]/g, "ั")
    .replace(/[\x9F\u009FŸ]/g, "็")
    .replace(/[\x85\u0085—]/g, "ึ")
    .replace(/[\x98\u0098˜]/g, "ื")
    .replace(/[\x84\u0084\x95\u0095•]/g, "ิ")
    // Replace Unicode Private Use Area (PUA) Thai glyphs common in Thai academic PDFs
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
    // Normalize SARA AM decomposed into NIKHAHIT + SARA AA
    .replace(/ํ[ ]*า/g, "ำ")
    .replace(/\u0E4D\u0E32/g, "ำ");
}

// 2. Fix Thai character & syllable spacing
export function fixThaiSpacing(str) {
  if (!str) return "";
  let s = str;

  // Remove spaces before upper/lower vowels & tone marks
  // e.g. "ข ่ า ย" -> "ข่", "ก ์" -> "ก์"
  s = s.replace(/([ก-ฮ])\s+([่้๊๋์ิีึืุูั็])/g, "$1$2");

  // Remove spaces between tone marks / vowels and following Thai consonants/vowels
  // e.g. "เครือข่ าย" -> "เครือข่าย", "ข้ อมูล" -> "ข้อมูล", "อีสปอร์ ต" -> "อีสปอร์ต", "องค์ ประกอบ" -> "องค์ประกอบ"
  s = s.replace(/([่้๊๋์ิีึืุูั็])\s+([ก-ฮะ-ูเ-ไ])/g, "$1$2");
  s = s.replace(/([่้๊๋์ิีึืุูั็])\s+([ก-ฮะ-ูเ-ไ])/g, "$1$2");

  // Fix broken SARA AM: Consonant + space + า -> Consonant + ำ
  // e.g. "ส าหรับ" -> "สำหรับ", "ประจ าวัน" -> "ประจำวัน", "จ านวน" -> "จำนวน", "ด าเนินการ" -> "ดำเนินการ"
  s = s.replace(/([ก-ฮ])\s+า(?![a-zA-Z0-9])/g, "$1ำ");

  // Fix SARA AM with tone marks: "น้ า" -> "น้ำ", "ต่ า" -> "ต่ำ"
  s = s.replace(/([ก-ฮ])([่้๊๋])\s+า(?![a-zA-Z0-9])/g, "$1$2ำ");

  // Fix common technical words and academic terminology that have spurious spaces or typos
  s = s
    .replace(/ซอฟต[ ]*แวร[ ]*/g, "ซอฟต์แวร์")
    .replace(/คอมพิวเตอร[ ]*/g, "คอมพิวเตอร์")
    .replace(/อินเทอร[ ]*เน็ต/g, "อินเทอร์เน็ต")
    .replace(/ปัญญาประดิษฐ[ ]*/g, "ปัญญาประดิษฐ์")
    .replace(/คณิตศาสตร[ ]*/g, "คณิตศาสตร์")
    .replace(/วิทยาศาสตร[ ]*/g, "วิทยาศาสตร์")
    .replace(/ศาสตร[ ]*/g, "ศาสตร์")
    .replace(/ประยุกต[ ]*/g, "ประยุกต์")
    .replace(/วิเคราะห[ ]*/g, "วิเคราะห์")
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
    .replace(/([์ิีึืุูั็่้๊๋])\1+/g, "$1") // Remove duplicate tonal marks
    .replace(/\s*\*+\s*/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

  return s;
}

export function parseAllSubjects(rawText, meta) {
  let text = normalizeThaiText(rawText);
  text = text
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const lines = text.split("\n");
  const headers = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const m = line.match(/^(\d{8,9})\s+(.*)$/);
    if (!m) continue;

    const subjectCode = m[1];
    const rest = m[2].trim();

    // Check previous line: was it "วิชาบังคับก่อน" or "Prerequisite"?
    const prevLine = i > 0 ? lines[i - 1].trim() : "";
    const isPrevPrereq = /วิชาบังคับก่อน|Prerequisite/i.test(prevLine);

    // Check if this line has credit like 3(3-0-6) or 3(2-2-5) or 3(x-x-x)
    const hasCredit = /\d\s*\([\d\s\-xX]+\)/.test(rest);

    // Check if next 1-2 lines has English title in parentheses e.g. "(Computer Graphics)"
    let hasNextEnglish = false;
    for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
      const nextL = lines[j].trim();
      if (/^\([a-zA-Z\s,.\-']+\)$/.test(nextL)) {
        hasNextEnglish = true;
        break;
      }
    }

    if ((hasCredit || hasNextEnglish) && !isPrevPrereq) {
      headers.push({ index: i, code: subjectCode, line });
    }
  }

  const subjects = [];

  for (let i = 0; i < headers.length; i++) {
    const curr = headers[i];
    const next = headers[i + 1];

    const chunkLines = lines.slice(curr.index, next ? next.index : curr.index + 40).map(l => l.trim()).filter(Boolean);
    if (chunkLines.length === 0) continue;

    const firstLine = chunkLines[0];
    const headerMatch = firstLine.match(/^(\d{8,9})\s+(.*?)(?:\s+(\d\s*\([\d\s\-xX]+\)))?$/);

    let subject_code = curr.code;
    let title_th = "";
    let credit = "";

    if (headerMatch) {
      title_th = fixThaiSpacing(headerMatch[2]);
      credit = headerMatch[3] ? headerMatch[3].replace(/\s+/g, "") : "";
    } else {
      title_th = fixThaiSpacing(firstLine.replace(subject_code, ""));
    }

    // If credit wasn't in first line, search lines 1-3
    if (!credit) {
      for (let j = 1; j < Math.min(chunkLines.length, 4); j++) {
        const cMatch = chunkLines[j].match(/(\d\s*\([\d\s\-xX]+\))/);
        if (cMatch) {
          credit = cMatch[1].replace(/\s+/g, "");
          break;
        }
      }
    }

    // English title: usually in ( ... )
    let title_en = "";
    for (let j = 1; j < Math.min(chunkLines.length, 5); j++) {
      const enMatch = chunkLines[j].match(/^\((.*?)\)$/);
      if (enMatch && !enMatch[1].includes("บรรยาย") && !enMatch[1].includes("ทฤษฎี")) {
        title_en = enMatch[1].replace(/[ \t]+/g, " ").trim();
        break;
      }
    }

    // Prerequisite
    let prereq1 = null;
    let prereq2 = null;
    const prereqLine = chunkLines.find(l => l.includes("วิชาบังคับก่อน") || l.includes("Prerequisite"));
    if (prereqLine) {
      const pText = prereqLine.replace(/^.*?วิชาบังคับก่อน\s*[:\s]*/i, "").trim();
      const codeMatchesInPrereq = pText.match(/\d{8,9}/g);
      if (codeMatchesInPrereq && codeMatchesInPrereq.length > 0) {
        prereq1 = codeMatchesInPrereq[0];
        if (codeMatchesInPrereq.length > 1) {
          prereq2 = codeMatchesInPrereq[1];
        }
      } else if (pText.includes("ไม่มี") || pText.toLowerCase().includes("none")) {
        prereq1 = "ไม่มี";
      } else if (pText) {
        prereq1 = pText.slice(0, 50);
      }
    }

    // Also look for prerequisite code in following prerequisite lines (e.g. multi-line prerequisites)
    const pIdx = chunkLines.findIndex(l => l.includes("วิชาบังคับก่อน") || l.includes("Prerequisite"));
    if (pIdx !== -1) {
      for (let k = pIdx + 1; k < Math.min(chunkLines.length, pIdx + 5); k++) {
        const checkL = chunkLines[k];
        if (checkL.includes("วิชาบังคับก่อน") || checkL.includes("Prerequisite")) continue;
        const codes = checkL.match(/\d{8,9}/g);
        if (codes && codes.length > 0) {
          if (!prereq1 || prereq1 === "ไม่มี") {
            prereq1 = codes[0];
            if (codes.length > 1) prereq2 = codes[1];
          } else if (!prereq2 && codes[0] !== prereq1) {
            prereq2 = codes[0];
          }
        } else {
          // If we reach non-prereq text, break
          if (/[ก-๙]{10,}/.test(checkL) && !checkL.includes("Prerequisite")) {
            break;
          }
        }
      }
    }

    // Description lines
    const descLines = [];
    let passedPrereq = false;
    let seenPrereqTag = false;

    for (let j = 1; j < chunkLines.length; j++) {
      const l = chunkLines[j];

      if (l.includes("วิชาบังคับก่อน") || l.includes("Prerequisite")) {
        seenPrereqTag = true;
        continue;
      }

      // If we saw prerequisite tag, skip prerequisite subject lines like "040613601 ความมั่นคงของระบบคอมพิวเตอร์"
      if (seenPrereqTag && !passedPrereq) {
        if (/^\d{8,9}/.test(l) || /^[A-Za-z\s]+$/.test(l) && l.length < 40) {
          continue; // Prerequisite course code/title line
        }
        passedPrereq = true;
      }

      if (passedPrereq || (!seenPrereqTag && title_en && chunkLines.indexOf(l) > chunkLines.findIndex(x => x.includes(title_en)))) {
        // Skip table headers, OBE marks, and page numbers
        if (l.includes("OBE") || l.includes("มคอ.") || /^\d+$/.test(l) || l.startsWith("PLO") || l.startsWith("YLO") || l.startsWith("รายวิชา")) {
          continue;
        }
        descLines.push(l);
      }
    }

    let description_th = "";
    let description_en = "";

    if (descLines.length > 0) {
      const thLines = [];
      const enLines = [];
      for (const l of descLines) {
        if (/[\u0E00-\u0E7F]/.test(l)) {
          thLines.push(fixThaiSpacing(l));
        } else if (/[a-zA-Z]/.test(l)) {
          enLines.push(l.replace(/[ \t]+/g, " ").trim());
        }
      }
      description_th = thLines.join(" ").trim();
      description_en = enLines.join(" ").trim();
    }

    // Track determination
    let track = "ทั่วไป";
    const combinedTitle = (title_th + " " + title_en).toLowerCase();
    if (combinedTitle.includes("software") || combinedTitle.includes("ซอฟต์แวร์") || combinedTitle.includes("web") || combinedTitle.includes("เว็บ") || combinedTitle.includes("cloud") || combinedTitle.includes("คลาวด์") || combinedTitle.includes("programming") || combinedTitle.includes("โปรแกรม")) {
      track = "Software Engineering & Cloud";
    } else if (combinedTitle.includes("data") || combinedTitle.includes("ข้อมูล") || combinedTitle.includes("intelligence") || combinedTitle.includes("ปัญญาประดิษฐ์") || combinedTitle.includes("ai") || combinedTitle.includes("learning") || combinedTitle.includes("mining") || combinedTitle.includes("analytics")) {
      track = "Data Science & Artificial Intelligence";
    } else if (combinedTitle.includes("security") || combinedTitle.includes("มั่นคง") || combinedTitle.includes("network") || combinedTitle.includes("เครือข่าย") || combinedTitle.includes("cyber")) {
      track = "Network & Cybersecurity";
    } else if (combinedTitle.includes("iot") || combinedTitle.includes("robot") || combinedTitle.includes("หุ่นยนต์") || combinedTitle.includes("embedded") || combinedTitle.includes("ฝังตัว") || combinedTitle.includes("sensor")) {
      track = "IoT & Intelligent Systems";
    }

    // Category determination
    let category = "หมวดวิชาเฉพาะด้านบังคับ";
    if (combinedTitle.includes("โครงงาน") || combinedTitle.includes("project") || combinedTitle.includes("วิทยานิพนธ์") || combinedTitle.includes("thesis")) {
      category = "หมวดโครงงาน/วิทยานิพนธ์";
    } else if (combinedTitle.includes("สัมมนา") || combinedTitle.includes("seminar")) {
      category = "หมวดสัมมนา";
    } else if (combinedTitle.includes("ฝึกงาน") || combinedTitle.includes("สหกิจ") || combinedTitle.includes("cooperative") || combinedTitle.includes("internship")) {
      category = "หมวดฝึกงานและสหกิจศึกษา";
    } else if (title_th.includes("เลือก") || combinedTitle.includes("elective") || combinedTitle.includes("หัวข้อพิเศษ") || combinedTitle.includes("special topics") || title_th.includes("การศึกษาเฉพาะเรื่อง")) {
      category = "หมวดวิชาเลือก";
    } else if (title_th.includes("เคมี") || title_th.includes("ชีววิทยา") || title_th.includes("ฟิสิกส์") || title_th.includes("อาหาร") || title_th.includes("สิ่งแวดล้อม")) {
      category = "หมวดวิชาศึกษาทั่วไป";
    }

    if (title_th && title_th.length >= 2 && !title_th.startsWith("รหัส")) {
      subjects.push({
        subject_code,
        title_th,
        title_en: title_en || title_th,
        credit: credit || "3(3-0-6)",
        prereq1: prereq1 || "ไม่มี",
        prereq2,
        description_th: description_th || title_th,
        description_en: description_en || title_en || null,
        category,
        curriculum_code: meta.code,
        curriculum_year: meta.year,
        degree_level: meta.degree,
        track
      });
    }
  }

  // Deduplicate by subject_code (keep longest description)
  const map = new Map();
  for (const s of subjects) {
    if (!map.has(s.subject_code) || (map.get(s.subject_code).description_th.length < s.description_th.length)) {
      map.set(s.subject_code, s);
    }
  }

  return Array.from(map.values());
}

const curriculumFiles = [
  { path: "uploads/courses/bachelor/regular/2569/course_bachelor3_2569.pdf", code: "CS69", year: 2569, degree: "bachelor" },
  { path: "uploads/courses/bachelor/regular/2564/course_bachelor3.pdf", code: "CS64", year: 2564, degree: "bachelor" },
  { path: "uploads/courses/bachelor/regular/2559/course_bachelor_cs59_3.pdf", code: "CS59", year: 2559, degree: "bachelor" },
  { path: "uploads/courses/bachelor/regular/2554/bsc54-3.pdf", code: "CS54", year: 2554, degree: "bachelor" },
  { path: "uploads/courses/master/ComputerScience/2567/course_ms_cs67_3.pdf", code: "MS-CS67", year: 2567, degree: "master" },
  { path: "uploads/courses/master/ComputerScience/2562/course_ms_cs3.pdf", code: "MS-CS62", year: 2562, degree: "master" },
  { path: "uploads/courses/master/SoftwareEngineering/2559/course_se3.pdf", code: "MS-SE59", year: 2559, degree: "master" },
  { path: "uploads/courses/doctor/computersci/2564/course-phd3.pdf", code: "PhD-CS64", year: 2564, degree: "doctor" }
];

async function main() {
  console.log("🚀 Starting Curriculum Subjects Import & Spacing Fix from PDF...");

  let totalUpdated = 0;
  let totalInserted = 0;

  // Remove phantom / typo courses from DB if any
  await prisma.subjects.deleteMany({
    where: { subject_code: "040613316", curriculum_year: 2569 }
  });

  for (const item of curriculumFiles) {
    if (!fs.existsSync(item.path)) {
      console.log(`⚠️ Skipped missing file: ${item.path}`);
      continue;
    }

    console.log(`\n📄 Parsing [${item.code}] (${item.degree} ${item.year}) from ${item.path}...`);
    const dataBuffer = fs.readFileSync(item.path);
    const parser = new PDFParse({ data: dataBuffer });
    const res = await parser.getText();
    const subjects = parseAllSubjects(res.text, item);

    // Apply 040603104 -> 040613104 mapping for CS64 and CS69
    const typoSub = subjects.find(s => s.subject_code === "040603104");
    const targetSub = subjects.find(s => s.subject_code === "040613104");
    if (typoSub && targetSub) {
      targetSub.description_th = typoSub.description_th;
      targetSub.description_en = typoSub.description_en;
      targetSub.prereq1 = typoSub.prereq1;
      targetSub.prereq2 = typoSub.prereq2;
    }

    // Filter out 040603104 typo duplicate if target 040613104 exists
    const finalSubjects = subjects.filter(s => {
      if (s.subject_code === "040603104" && targetSub) return false;
      return true;
    });

    console.log(`   Found ${finalSubjects.length} subjects in PDF.`);

    let inserted = 0;
    let updated = 0;

    for (const sub of finalSubjects) {
      // Find existing subject with same code, curriculum_code, curriculum_year
      const existing = await prisma.subjects.findFirst({
        where: {
          subject_code: sub.subject_code,
          curriculum_code: sub.curriculum_code,
          curriculum_year: sub.curriculum_year
        }
      });

      if (existing) {
        await prisma.subjects.update({
          where: { id: existing.id },
          data: {
            title_th: sub.title_th,
            title_en: sub.title_en,
            credit: sub.credit,
            prereq1: sub.prereq1,
            prereq2: sub.prereq2,
            description_th: sub.description_th,
            description_en: sub.description_en,
            category: sub.category,
            degree_level: sub.degree_level,
            track: sub.track
          }
        });
        updated++;
      } else {
        await prisma.subjects.create({
          data: sub
        });
        inserted++;
      }
    }

    console.log(`   ✅ [${item.code}] Inserted: ${inserted}, Updated: ${updated}`);
    totalUpdated += updated;
    totalInserted += inserted;
  }

  // Also do a comprehensive clean on any subjects in DB to ensure zero spacing issues
  console.log("\n🧹 Running secondary spacing cleanup pass on all DB subjects...");
  const allInDb = await prisma.subjects.findMany();
  let secondaryCleaned = 0;

  for (const s of allInDb) {
    const cleanTitleTh = fixThaiSpacing(normalizeThaiText(s.title_th));
    const cleanTitleEn = (s.title_en || "").replace(/[ \t]+/g, " ").trim();
    const cleanDescTh = fixThaiSpacing(normalizeThaiText(s.description_th));
    const cleanDescEn = (s.description_en || "").replace(/[ \t]+/g, " ").trim();

    if (
      cleanTitleTh !== s.title_th ||
      cleanTitleEn !== s.title_en ||
      cleanDescTh !== s.description_th ||
      cleanDescEn !== s.description_en
    ) {
      await prisma.subjects.update({
        where: { id: s.id },
        data: {
          title_th: cleanTitleTh,
          title_en: cleanTitleEn,
          description_th: cleanDescTh,
          description_en: cleanDescEn
        }
      });
      secondaryCleaned++;
    }
  }

  console.log(`Secondary cleanup updated: ${secondaryCleaned} subjects.`);

  // Summary
  const countByCurriculum = await prisma.subjects.groupBy({
    by: ['curriculum_code', 'curriculum_year', 'degree_level'],
    _count: { id: true },
    orderBy: [
      { curriculum_year: 'desc' }
    ]
  });

  const totalInDb = await prisma.subjects.count();

  console.log("\n========================================================");
  console.log("🎉 CURRICULUM SUBJECTS IMPORT & CLEANING COMPLETED!");
  console.log("========================================================");
  console.log(`Total subjects in Database: ${totalInDb} subjects\n`);
  console.table(countByCurriculum.map(c => ({
    "Curriculum Code": c.curriculum_code,
    "Year": c.curriculum_year,
    "Degree Level": c.degree_level,
    "Total Subjects": c._count.id
  })));
}

main()
  .catch((e) => {
    console.error("❌ Import error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
