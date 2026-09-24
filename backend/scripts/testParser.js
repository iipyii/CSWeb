import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

function cleanText(text) {
  return text
    .replace(/-- \d+ of \d+ --/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function parseSubjectsFromText(rawText, meta) {
  const text = cleanText(rawText);
  
  // Find where course description section starts if possible
  // Usually starts with subject codes like 0406... or 040...
  // Regex to match a subject header
  // Matches: 8-9 digits followed by Thai title and credit e.g. "040613100 พื้นฐานวิทยาการคอมพิวเตอร์ 3(3-0-6)"
  const subjectHeaderRegex = /(?:^|\n)\s*(\d{8,9})\s+([^\n\r\(]+?)(?:\s+(\d\s*\([\d\-]+\)))?(?:\n|\r|\()/g;

  // Let's find all subject code positions
  const codeMatches = [];
  const codeRegex = /(?:^|\n)\s*(\d{8,9})\s+/g;
  let m;
  while ((m = codeRegex.exec(text)) !== null) {
    const code = m[1];
    // Filter out obvious non-subject codes (e.g. phone numbers or years)
    if (code.startsWith("040") || code.startsWith("04") || code.startsWith("40")) {
      codeMatches.push({ code, index: m.index });
    }
  }

  const subjects = [];

  for (let i = 0; i < codeMatches.length; i++) {
    const curr = codeMatches[i];
    const next = codeMatches[i + 1];
    const chunk = text.slice(curr.index, next ? next.index : curr.index + 2000).trim();

    // Check if this chunk is a course description (should have prerequisite or description or english title)
    // Avoid table of contents / curriculum structure summaries if they don't have descriptions
    const isDescription = chunk.includes("วิชาบังคับก่อน") || 
                          chunk.includes("Prerequisite") || 
                          chunk.includes("(") ||
                          chunk.length > 120;

    // Extract details from chunk
    const lines = chunk.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const firstLine = lines[0];
    const headerMatch = firstLine.match(/^(\d{8,9})\s+(.*?)(?:\s+(\d\s*\([\d\s\-]+\)))?$/);
    
    let subject_code = curr.code;
    let title_th = "";
    let credit = "";

    if (headerMatch) {
      subject_code = headerMatch[1];
      title_th = headerMatch[2].replace(/\*+/g, "").trim();
      credit = headerMatch[3] ? headerMatch[3].replace(/\s+/g, "") : "";
    } else {
      title_th = firstLine.replace(subject_code, "").replace(/\*+/g, "").trim();
    }

    // If credit wasn't in first line, look in lines 1 or 2
    if (!credit) {
      for (let j = 1; j < Math.min(lines.length, 4); j++) {
        const cMatch = lines[j].match(/(\d\s*\([\d\s\-]+\))/);
        if (cMatch) {
          credit = cMatch[1].replace(/\s+/g, "");
          break;
        }
      }
    }

    // English title
    let title_en = "";
    for (let j = 1; j < Math.min(lines.length, 5); j++) {
      const enMatch = lines[j].match(/^\((.*?)\)$/);
      if (enMatch && !enMatch[1].includes("บรรยาย") && !enMatch[1].includes("ทฤษฎี")) {
        title_en = enMatch[1].trim();
        break;
      }
    }

    // Prerequisite
    let prereq1 = null;
    let prereq2 = null;
    const prereqLine = lines.find(l => l.includes("วิชาบังคับก่อน") || l.includes("Prerequisite"));
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

    // Thai and English Description
    // Find text after prerequisite
    let descLines = [];
    let startDesc = false;
    for (const l of lines) {
      if (l.includes("วิชาบังคับก่อน") || l.includes("Prerequisite")) {
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
      // Separate Thai lines from English lines
      const thLines = [];
      const enLines = [];
      for (const l of descLines) {
        // Test if line contains Thai chars
        if (/[\u0E00-\u0E7F]/.test(l)) {
          thLines.push(l);
        } else if (/[a-zA-Z]/.test(l)) {
          enLines.push(l);
        }
      }
      description_th = thLines.join(" ").trim();
      description_en = enLines.join(" ").trim();
    }

    // Determine track based on title
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

    // Category
    let category = "หมวดวิชาเฉพาะด้าน";
    if (combinedTitle.includes("โครงงาน") || combinedTitle.includes("project") || combinedTitle.includes("วิทยานิพนธ์") || combinedTitle.includes("thesis")) {
      category = "หมวดโครงงาน/วิทยานิพนธ์";
    } else if (combinedTitle.includes("สัมมนา") || combinedTitle.includes("seminar")) {
      category = "หมวดสัมมนา";
    } else if (combinedTitle.includes("ฝึกงาน") || combinedTitle.includes("สหกิจ") || combinedTitle.includes("cooperative") || combinedTitle.includes("internship")) {
      category = "หมวดฝึกงานและสหกิจศึกษา";
    } else if (title_th.includes("เลือก") || combinedTitle.includes("elective") || combinedTitle.includes("หัวข้อพิเศษ") || combinedTitle.includes("special topics")) {
      category = "หมวดวิชาเลือก";
    }

    if (title_th && title_th.length > 2) {
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
        track,
        rawLength: chunk.length
      });
    }
  }

  // Deduplicate by subject_code (keep the one with longest description)
  const map = new Map();
  for (const s of subjects) {
    if (!map.has(s.subject_code) || map.get(s.subject_code).description_th.length < s.description_th.length) {
      map.set(s.subject_code, s);
    }
  }

  return Array.from(map.values());
}

const files = [
  { path: "uploads/courses/bachelor/regular/2564/course_bachelor3.pdf", code: "CS64", year: 2564, degree: "bachelor" },
  { path: "uploads/courses/bachelor/regular/2559/course_bachelor_cs59_3.pdf", code: "CS59", year: 2559, degree: "bachelor" },
  { path: "uploads/courses/master/ComputerScience/2567/course_ms_cs67_3.pdf", code: "MS-CS67", year: 2567, degree: "master" },
  { path: "uploads/courses/master/ComputerScience/2562/course_ms_cs3.pdf", code: "MS-CS62", year: 2562, degree: "master" },
  { path: "uploads/courses/master/SoftwareEngineering/2559/course_se3.pdf", code: "MS-SE59", year: 2559, degree: "master" },
  { path: "uploads/courses/doctor/computersci/2564/course-phd3.pdf", code: "PhD-CS64", year: 2564, degree: "doctor" }
];

async function testAll() {
  let totalFound = 0;
  for (const f of files) {
    const dataBuffer = fs.readFileSync(f.path);
    const parser = new PDFParse({ data: dataBuffer });
    const res = await parser.getText();
    const parsed = parseSubjectsFromText(res.text, f);
    console.log(`\n========================================`);
    console.log(`[${f.code}] Found ${parsed.length} subjects`);
    console.log(`Sample Subject from ${f.code}:`, parsed[0]);
    if (parsed.length > 5) {
      console.log(`Another Subject:`, parsed[Math.floor(parsed.length / 2)]);
    }
    totalFound += parsed.length;
  }
  console.log(`\n🎉 TOTAL PARSED ACROSS ALL 6 CURRICULA: ${totalFound} subjects!`);
}

testAll().catch(console.error);
