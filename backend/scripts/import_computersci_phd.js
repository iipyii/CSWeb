// Imports doctor/computersci's main 2564 curriculum and its 2559 amendment
// into the SAME program — unlike ComputerScience/2562 and
// SoftwareEngineering/2559, these two don't share a year (main=2564,
// edit=2559), so there's no (programId, year) collision and no sibling
// "-edit" program is needed here.
//
// Content verified per-file via extract_pdf.py: 2564 uses the "หมวดที่ N"
// TQF format -> sectionTitles[1]-[8], appendix-phd.pdf is a combined
// ภาคผนวก -> sectionTitles[990]. course_edit_phd2559.pdf's text couldn't
// be verified (extract_pdf.py returns empty — almost certainly a
// scanned/image-only PDF, like course_editcs2562.pdf); classified by its
// being the sole file in the 2559 folder and matching idMap's pre-existing
// "cs-phd-edit-2559" expectation, not by a direct text match.
import { execSync } from "child_process";
import { prisma } from "../src/lib/prisma.js";

const DEGREE_SLUG = "doctorate";
const DEGREE_NAME_TH = "ปริญญาเอก";
const PROGRAM_SLUG = "computersci";
const PROGRAM_NAME_TH = "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์";

const MAIN_YEAR = 2564;
const MAIN_FILES = [
  { relPath: "courses/doctor/computersci/2564/course-phd1.pdf", section_no: 1, order_index: 1 },
  { relPath: "courses/doctor/computersci/2564/course-phd2.pdf", section_no: 2, order_index: 2 },
  { relPath: "courses/doctor/computersci/2564/course-phd3.pdf", section_no: 3, order_index: 3 },
  { relPath: "courses/doctor/computersci/2564/course-phd4.pdf", section_no: 4, order_index: 4 },
  { relPath: "courses/doctor/computersci/2564/course-phd5.pdf", section_no: 5, order_index: 5 },
  { relPath: "courses/doctor/computersci/2564/course-phd6.pdf", section_no: 6, order_index: 6 },
  { relPath: "courses/doctor/computersci/2564/course-phd7.pdf", section_no: 7, order_index: 7 },
  { relPath: "courses/doctor/computersci/2564/course-phd8.pdf", section_no: 8, order_index: 8 },
  { relPath: "courses/doctor/computersci/2564/appendix-phd.pdf", section_no: 9, order_index: 990 },
];

const EDIT_YEAR = 2559;
const EDIT_TITLE = "การปรับปรุงแก้ไขหลักสูตรปรัชญาดุษฎีบัณฑิตสาขาวิชาวิทยาการคอมพิวเตอร์ปี 2559";
const EDIT_FILE = { relPath: "courses/doctor/computersci/2559/course_edit_phd2559.pdf", section_no: 1, order_index: 88 };

function extractText(relPath) {
  const output = execSync(`python scripts/extract_pdf.py "uploads/${relPath}"`).toString();
  return JSON.parse(output).content;
}

async function ensureCurriculum(programId, year) {
  let curriculum = await prisma.curriculums.findUnique({ where: { programId_year: { programId, year } } });
  if (!curriculum) {
    curriculum = await prisma.curriculums.create({ data: { programId, year, pdf_url: null } });
    console.log(`created curriculums row: id=${curriculum.id} year=${year}`);
  } else {
    console.log(`curriculums row already exists: id=${curriculum.id} year=${year}`);
  }
  return curriculum;
}

async function importFile(curriculumId, file, titleOverride) {
  const existing = await prisma.courses.findFirst({ where: { curriculumId, order_index: file.order_index } });
  if (existing) {
    console.log(`  skip (already exists): order_index=${file.order_index}`);
    return;
  }
  const content = extractText(file.relPath);
  const title = titleOverride || file.relPath.split("/").pop();
  const created = await prisma.courses.create({
    data: {
      curriculumId,
      section_no: file.section_no,
      title,
      content,
      order_index: file.order_index,
      pdf_path: file.relPath,
    },
  });
  console.log(`  created course: id=${created.id} order_index=${created.order_index} title="${created.title}" content_len=${content.length}`);
}

async function main() {
  let degree = await prisma.degrees.findUnique({ where: { slug: DEGREE_SLUG } });
  if (!degree) {
    degree = await prisma.degrees.create({ data: { name_th: DEGREE_NAME_TH, slug: DEGREE_SLUG } });
    console.log(`created degrees row: id=${degree.id} slug=${degree.slug}`);
  } else {
    console.log(`degrees row already exists: id=${degree.id}`);
  }

  let program = await prisma.programs.findFirst({ where: { slug: PROGRAM_SLUG } });
  if (!program) {
    program = await prisma.programs.create({
      data: { degreeId: degree.id, name_th: PROGRAM_NAME_TH, slug: PROGRAM_SLUG },
    });
    console.log(`created programs row: id=${program.id} slug=${program.slug}`);
  } else {
    console.log(`programs row already exists: id=${program.id}`);
  }

  const mainCurriculum = await ensureCurriculum(program.id, MAIN_YEAR);
  for (const file of MAIN_FILES) {
    await importFile(mainCurriculum.id, file);
  }

  const editCurriculum = await ensureCurriculum(program.id, EDIT_YEAR);
  await importFile(editCurriculum.id, EDIT_FILE, EDIT_TITLE);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
