// course_editse.pdf sits in the same 2559 folder as SoftwareEngineering's
// main curriculum, so it can't be a second curriculum row under
// (programId=SoftwareEngineering, year=2559) — that's taken by
// import_softwareengineering_2559.js. Same sibling-program fix as
// regular-edit and ComputerScience-edit.
//
// Unlike ComputerScience/2562's edit file, this one's text extracted
// cleanly and was directly confirmed: "การปรับปรุงแก้ไขหลักสูตรวิทยาศาสตร
// มหาบัณฑิตสาขาวิชาวิศวกรรมซอฟต์แวร์ (ฉบับปี พ.ศ. 2559)" — a real content
// match, not just filename/folder-placement inference.
import { execSync } from "child_process";
import { prisma } from "../src/lib/prisma.js";

const SOURCE_PROGRAM_SLUG = "SoftwareEngineering";
const NEW_PROGRAM_SLUG = "SoftwareEngineering-edit";
const AMENDMENT_TITLE = "การปรับปรุงแก้ไขหลักสูตรวิทยาศาสตรมหาบัณฑิตสาขาวิชาวิศวกรรมซอฟต์แวร์ปี 2559";
const YEAR = 2559;
const PDF_REL_PATH = "courses/master/SoftwareEngineering/2559/course_editse.pdf";
const ORDER_INDEX = 88; // sectionTitles[88] = "การปรับปรุงแก้ไขหลักสูตร"

function extractText(relPath) {
  const output = execSync(`python scripts/extract_pdf.py "uploads/${relPath}"`).toString();
  return JSON.parse(output).content;
}

async function main() {
  const sourceProgram = await prisma.programs.findFirst({ where: { slug: SOURCE_PROGRAM_SLUG } });
  if (!sourceProgram) {
    throw new Error(`source program not found: ${SOURCE_PROGRAM_SLUG} (run import_softwareengineering_2559.js first)`);
  }

  let newProgram = await prisma.programs.findFirst({ where: { slug: NEW_PROGRAM_SLUG } });
  if (!newProgram) {
    newProgram = await prisma.programs.create({
      data: { degreeId: sourceProgram.degreeId, name_th: AMENDMENT_TITLE, slug: NEW_PROGRAM_SLUG },
    });
    console.log(`created programs row: id=${newProgram.id} slug=${newProgram.slug}`);
  } else {
    console.log(`programs row already exists: id=${newProgram.id}`);
  }

  let curriculum = await prisma.curriculums.findUnique({
    where: { programId_year: { programId: newProgram.id, year: YEAR } },
  });
  if (!curriculum) {
    curriculum = await prisma.curriculums.create({ data: { programId: newProgram.id, year: YEAR, pdf_url: null } });
    console.log(`created curriculums row: id=${curriculum.id}`);
  } else {
    console.log(`curriculums row already exists: id=${curriculum.id}`);
  }

  const existing = await prisma.courses.findFirst({ where: { curriculumId: curriculum.id, order_index: ORDER_INDEX } });
  if (existing) {
    console.log(`skip: course already exists at order_index=${ORDER_INDEX}`);
    return;
  }

  const content = extractText(PDF_REL_PATH);
  const created = await prisma.courses.create({
    data: {
      curriculumId: curriculum.id,
      section_no: 1,
      title: AMENDMENT_TITLE,
      content,
      order_index: ORDER_INDEX,
      pdf_path: PDF_REL_PATH,
    },
  });
  console.log(`created course: id=${created.id} order_index=${created.order_index} title="${created.title}" content_len=${content.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
