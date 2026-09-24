import fs from "fs";
import { createRequire } from "module";
import { PrismaClient } from "@prisma/client";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
const prisma = new PrismaClient();

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

async function main() {
  console.log("🚀 Starting Import for CS69 (2569) from PDF...");

  const filePath = "uploads/courses/bachelor/regular/2569/course_bachelor3_2569.pdf";
  if (!fs.existsSync(filePath)) {
    console.error("❌ File not found:", filePath);
    return;
  }

  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const res = await parser.getText();
  
  const text = res.text
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  const codeMatches = [];
  const codeRegex = /(?:^|\n)\s*(\d{8,9})\s+/g;
  let m;
  while ((m = codeRegex.exec(text)) !== null) {
    const code = m[1];
    if (code.startsWith("04") || code.startsWith("08") || code.startsWith("40") || code.startsWith("80")) {
      codeMatches.push({ code, index: m.index });
    }
  }

  const subjects = [];

  for (let i = 0; i < codeMatches.length; i++) {
    const curr = codeMatches[i];
    const next = codeMatches[i + 1];
    const chunk = text.slice(curr.index, next ? next.index : curr.index + 2500).trim();

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

    let track = "ทั่วไป";
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
        curriculum_code: "CS69",
        curriculum_year: 2569,
        degree_level: "bachelor",
        track
      });
    }
  }

  const map = new Map();
  for (const s of subjects) {
    if (!map.has(s.subject_code) || (map.get(s.subject_code).description_th.length < s.description_th.length)) {
      map.set(s.subject_code, s);
    }
  }

  const finalSubjects = Array.from(map.values());
  console.log(`\n📄 Extracted ${finalSubjects.length} subjects from CS69 PDF.`);

  // Delete previous CS69 subjects to refresh completely
  const deleted = await prisma.subjects.deleteMany({
    where: {
      curriculum_code: "CS69",
      curriculum_year: 2569
    }
  });
  console.log(`🗑️ Cleared ${deleted.count} old CS69 subjects.`);

  let insertedCount = 0;
  for (const sub of finalSubjects) {
    await prisma.subjects.create({
      data: sub
    });
    insertedCount++;
  }

  console.log(`✅ Successfully inserted ${insertedCount} new subjects for CS69 (2569)!`);

  // Overall summary
  const summary = await prisma.subjects.groupBy({
    by: ['curriculum_code', 'curriculum_year', 'degree_level'],
    _count: { id: true },
    orderBy: [
      { curriculum_year: 'desc' }
    ]
  });

  const totalInDb = await prisma.subjects.count();

  console.log("\n========================================================");
  console.log(`🎉 ALL SUBJECTS IN DATABASE NOW: ${totalInDb} subjects`);
  console.log("========================================================");
  console.table(summary.map(c => ({
    "Curriculum Code": c.curriculum_code,
    "Year": c.curriculum_year,
    "Degree Level": c.degree_level,
    "Total Subjects": c._count.id
  })));
}

main()
  .catch((e) => {
    console.error("❌ Error importing CS69:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
