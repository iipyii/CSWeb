// course_editcs2562.pdf sits in the same 2562 folder as ComputerScience's
// main curriculum files, so it can't be a second curriculum row under
// (programId=ComputerScience, year=2562) — that's already taken by
// import_computerscience_2562_2567.js. Same fix as regular-edit: a sibling
// program dedicated to the amendment.
//
// The file's own text couldn't be verified — extract_pdf.py returns an
// empty string for it (almost certainly a scanned/image-only PDF, no text
// layer). Classified by its exclusive placement in the 2562 folder and its
// filename matching the same "*_edit*"/"course_edit*" convention as the
// two other amendment files already confirmed by content
// (course_editse.pdf, course_edit2559.pdf) — not a guess made lightly, but
// weaker evidence than a direct text match, worth knowing if this
// classification is ever questioned.
import { prisma } from "../src/lib/prisma.js";

const SOURCE_PROGRAM_SLUG = "ComputerScience";
const NEW_PROGRAM_SLUG = "ComputerScience-edit";
const AMENDMENT_TITLE = "การปรับปรุงแก้ไขหลักสูตรวิทยาศาสตรมหาบัณฑิตสาขาวิชาวิทยาการคอมพิวเตอร์ปี 2562";
const YEAR = 2562;
const PDF_REL_PATH = "courses/master/ComputerScience/2562/course_editcs2562.pdf";
const ORDER_INDEX = 88; // sectionTitles[88] = "การปรับปรุงแก้ไขหลักสูตร"

async function main() {
  const sourceProgram = await prisma.programs.findFirst({ where: { slug: SOURCE_PROGRAM_SLUG } });
  if (!sourceProgram) {
    throw new Error(`source program not found: ${SOURCE_PROGRAM_SLUG} (run import_computerscience_2562_2567.js first)`);
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

  const created = await prisma.courses.create({
    data: {
      curriculumId: curriculum.id,
      section_no: 1,
      title: AMENDMENT_TITLE,
      content: "", // extract_pdf.py returned no text for this file
      order_index: ORDER_INDEX,
      pdf_path: PDF_REL_PATH,
    },
  });
  console.log(`created course: id=${created.id} order_index=${created.order_index} title="${created.title}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
