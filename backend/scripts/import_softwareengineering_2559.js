// Imports master/SoftwareEngineering's main 2559 curriculum. Its
// course_editse.pdf amendment is handled separately in
// import_softwareengineering_edit_2559.js, since it needs a sibling
// program to avoid colliding with 2559's (programId, year) here.
//
// Content verified per-file via extract_pdf.py: uses the "หมวดที่ N" TQF
// format (same as ComputerScience/2562) -> sectionTitles[1]-[8],
// course_se9.pdf is a combined ภาคผนวก -> sectionTitles[990].
import { execSync } from "child_process";
import { prisma } from "../src/lib/prisma.js";

const DEGREE_SLUG = "master";
const DEGREE_NAME_TH = "ปริญญาโท";
const PROGRAM_SLUG = "SoftwareEngineering";
const PROGRAM_NAME_TH = "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์";
const YEAR = 2559;

const FILES = [
  { relPath: "courses/master/SoftwareEngineering/2559/course_se1.pdf", section_no: 1, order_index: 1 },
  { relPath: "courses/master/SoftwareEngineering/2559/course_se2.pdf", section_no: 2, order_index: 2 },
  { relPath: "courses/master/SoftwareEngineering/2559/course_se3.pdf", section_no: 3, order_index: 3 },
  { relPath: "courses/master/SoftwareEngineering/2559/course_se4.pdf", section_no: 4, order_index: 4 },
  { relPath: "courses/master/SoftwareEngineering/2559/course_se5.pdf", section_no: 5, order_index: 5 },
  { relPath: "courses/master/SoftwareEngineering/2559/course_se6.pdf", section_no: 6, order_index: 6 },
  { relPath: "courses/master/SoftwareEngineering/2559/course_se7.pdf", section_no: 7, order_index: 7 },
  { relPath: "courses/master/SoftwareEngineering/2559/course_se8.pdf", section_no: 8, order_index: 8 },
  { relPath: "courses/master/SoftwareEngineering/2559/course_se9.pdf", section_no: 9, order_index: 990 },
];

function extractText(relPath) {
  const output = execSync(`python scripts/extract_pdf.py "uploads/${relPath}"`).toString();
  return JSON.parse(output).content;
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

  let curriculum = await prisma.curriculums.findUnique({
    where: { programId_year: { programId: program.id, year: YEAR } },
  });
  if (!curriculum) {
    curriculum = await prisma.curriculums.create({ data: { programId: program.id, year: YEAR, pdf_url: null } });
    console.log(`created curriculums row: id=${curriculum.id}`);
  } else {
    console.log(`curriculums row already exists: id=${curriculum.id}`);
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
