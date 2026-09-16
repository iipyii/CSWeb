// Imports the 3 CSB (โครงการพิเศษ สองภาษา) course files that were already
// sitting in uploads/courses/bachelor/csb/2564/ but never linked to any
// program/curriculum — there was no "csb" row in `programs` at all.
//
// Doesn't reuse import_courses.js's generic scan+getSection() logic: that
// parses order_index straight from each filename's trailing number
// (course_csb64_1.pdf -> 1, _2.pdf -> 2, _3.pdf -> 3), which would collide
// with sectionTitles[1]/[2]/[3] in CourseDetail.jsx — "หมวดที่ 1/2/3" text
// used by the "regular" curriculum, completely wrong for CSB's actual
// content. Verified each file's real extracted text first (not just
// filename order) and it maps to sectionTitles[11]/[22]/[33], an existing
// dedicated key set that was seemingly reserved for exactly this import:
//   _1.pdf -> "โครงการพิเศษ (สองภาษา)...ระยะเวลาดำเนินการ..." -> ข้อมูลทั่วไป (11)
//   _2.pdf -> "การจัดการเรียนการสอนการจัดการเรียนการสอนจะใช้ทั้งภาษาอังกฤษ..." -> การจัดการเรียนการสอน (22)
//   _3.pdf -> garbled encoding but clearly a different, announcement-style
//             document -> ประกาศ มจพ เรื่องหลักเกณฑ์การเบิกจ่ายเงินรายได้ฯ (33)
//
// Also fixes the pdf_path format for these new rows: stores a clean
// forward-slash path with no "uploads/" prefix (courses/bachelor/csb/...),
// matching what CourseSectionContent.jsx actually expects when it builds
// `http://localhost:5000/uploads/${section.pdf_path}`. The historical
// "regular" rows store the literal Windows path including "uploads\" —
// left untouched here since fixing those is a separate, unrequested change.
import { execSync } from "child_process";
import { prisma } from "../src/lib/prisma.js";

const PROGRAM_SLUG = "csb";
const PROGRAM_NAME_TH = "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (โครงการพิเศษ สองภาษา)";
const DEGREE_ID = 1; // ปริญญาตรี, same as "regular"
const YEAR = 2564;

const FILES = [
  { relPath: "courses/bachelor/csb/2564/course_csb64_1.pdf", section_no: 1, order_index: 11 },
  { relPath: "courses/bachelor/csb/2564/course_csb64_2.pdf", section_no: 2, order_index: 22 },
  { relPath: "courses/bachelor/csb/2564/course_csb64_3.pdf", section_no: 3, order_index: 33 },
];

function extractText(relPath) {
  const output = execSync(`python scripts/extract_pdf.py "uploads/${relPath}"`).toString();
  const { content } = JSON.parse(output);
  return content;
}

async function main() {
  let program = await prisma.programs.findFirst({ where: { slug: PROGRAM_SLUG } });
  if (program) {
    console.log(`programs row already exists: id=${program.id}`);
  } else {
    program = await prisma.programs.create({
      data: { degreeId: DEGREE_ID, name_th: PROGRAM_NAME_TH, slug: PROGRAM_SLUG },
    });
    console.log(`created programs row: id=${program.id} slug=${program.slug}`);
  }

  let curriculum = await prisma.curriculums.findUnique({
    where: { programId_year: { programId: program.id, year: YEAR } },
  });
  if (curriculum) {
    console.log(`curriculums row already exists: id=${curriculum.id}`);
  } else {
    curriculum = await prisma.curriculums.create({
      data: { programId: program.id, year: YEAR, pdf_url: null },
    });
    console.log(`created curriculums row: id=${curriculum.id}`);
  }

  for (const file of FILES) {
    const existing = await prisma.courses.findFirst({
      where: { curriculumId: curriculum.id, order_index: file.order_index },
    });
    if (existing) {
      console.log(`skip (already exists): order_index=${file.order_index}`);
      continue;
    }

    const content = extractText(file.relPath);
    const title = file.relPath.split("/").pop();

    const created = await prisma.courses.create({
      data: {
        curriculumId: curriculum.id,
        section_no: file.section_no,
        title,
        content,
        order_index: file.order_index,
        pdf_path: file.relPath,
      },
    });
    console.log(`created course: id=${created.id} order_index=${created.order_index} title="${created.title}" content_len=${content.length}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
