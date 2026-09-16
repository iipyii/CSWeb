// Backs the "cs-edit-2559" card (CourseSections.jsx) with real data, moving
// course_edit2559.pdf (id=74) out of regular/2559's own section list — it
// was confirmed via its extracted text to genuinely be a curriculum
// amendment document, not a course-description file, and the target
// reference structure for regular/2559 has no room for it anyway.
//
// Can't just add a second curriculums row with (programId=1, year=2559) —
// that's the exact (programId, year) unique constraint already used by the
// real regular/2559 curriculum (id=8). Rather than loosening that
// constraint (which would require the /api/programs/:slug/:year endpoint
// and CourseDetail.jsx's fetch logic to both learn how to disambiguate two
// curricula sharing a year), this creates a sibling "program" dedicated to
// the amendment — reusing the existing generic slug+year lookup completely
// unchanged. The same recipe generalizes to the other "-edit" cards that
// exist in CourseSections.jsx today with no backing data yet
// (cs-master-edit-2562, se-master-edit-2559): create an analogous
// "<Slug>-edit" program + one curriculum + move/create the amendment's
// course row into it.
import { prisma } from "../src/lib/prisma.js";

const SOURCE_PROGRAM_SLUG = "regular";
const NEW_PROGRAM_SLUG = "regular-edit";
const AMENDMENT_TITLE = "การปรับปรุงแก้ไขหลักสูตรวิทยาศาสตรบัณฑิตปี 2559";
const YEAR = 2559;
const COURSE_ROW_ID = 74;
const NEW_ORDER_INDEX = 1000; // not a key in CourseDetail.jsx's sectionTitles, so section.title renders as-is

async function main() {
  const sourceProgram = await prisma.programs.findFirst({ where: { slug: SOURCE_PROGRAM_SLUG } });
  if (!sourceProgram) {
    throw new Error(`source program not found: ${SOURCE_PROGRAM_SLUG}`);
  }

  let newProgram = await prisma.programs.findFirst({ where: { slug: NEW_PROGRAM_SLUG } });
  if (newProgram) {
    console.log(`programs row already exists: id=${newProgram.id} slug=${NEW_PROGRAM_SLUG}`);
  } else {
    newProgram = await prisma.programs.create({
      data: {
        degreeId: sourceProgram.degreeId,
        name_th: AMENDMENT_TITLE,
        slug: NEW_PROGRAM_SLUG,
      },
    });
    console.log(`created programs row: id=${newProgram.id} slug=${newProgram.slug}`);
  }

  let curriculum = await prisma.curriculums.findUnique({
    where: { programId_year: { programId: newProgram.id, year: YEAR } },
  });
  if (curriculum) {
    console.log(`curriculums row already exists: id=${curriculum.id}`);
  } else {
    curriculum = await prisma.curriculums.create({
      data: { programId: newProgram.id, year: YEAR, pdf_url: null },
    });
    console.log(`created curriculums row: id=${curriculum.id}`);
  }

  const course = await prisma.courses.findUnique({ where: { id: COURSE_ROW_ID } });
  if (!course) {
    console.log(`skip: courses id=${COURSE_ROW_ID} not found`);
    return;
  }
  if (course.curriculumId === curriculum.id) {
    console.log(`skip: courses id=${COURSE_ROW_ID} already under curriculumId=${curriculum.id}`);
    return;
  }

  const updated = await prisma.courses.update({
    where: { id: COURSE_ROW_ID },
    data: {
      curriculumId: curriculum.id,
      title: AMENDMENT_TITLE,
      order_index: NEW_ORDER_INDEX,
    },
  });
  console.log(`moved: courses id=${updated.id} -> curriculumId=${updated.curriculumId}, order_index=${updated.order_index}, title="${updated.title}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
