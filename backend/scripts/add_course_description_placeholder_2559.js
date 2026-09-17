// Fills the "คำอธิบายรายวิชา" gap for regular/2559 (curriculumId=8) that
// was identified and deliberately deferred as item D when the chart file
// (id=66) and the mislabeled amendment doc (id=74, since moved to
// regular-edit) were sorted out earlier -- no real course-description PDF
// exists for this year, so this is a placeholder (content='', pdf_path=
// null), the same pattern used for the 2569 curriculum's not-yet-attached
// sections and the 2554 chart placeholder.
//
// order_index=999 is the standard key for this content
// (sectionTitles[999] = "คำอธิบายรายวิชา") and was confirmed free within
// curriculumId=8 before inserting -- it was previously used by id=74,
// which has since moved to the regular-edit program.
import { prisma } from "../src/lib/prisma.js";

const CURRICULUM_ID = 8;
const ORDER_INDEX = 999;
const TITLE = "คำอธิบายรายวิชา";

async function main() {
  const existing = await prisma.courses.findFirst({
    where: { curriculumId: CURRICULUM_ID, order_index: ORDER_INDEX },
  });
  if (existing) {
    console.log(`skip: curriculumId=${CURRICULUM_ID} already has a row at order_index=${ORDER_INDEX} (id=${existing.id})`);
    return;
  }

  const created = await prisma.courses.create({
    data: {
      curriculumId: CURRICULUM_ID,
      section_no: 9,
      title: TITLE,
      content: "",
      order_index: ORDER_INDEX,
      pdf_path: null,
    },
  });
  console.log(`created: id=${created.id} order_index=${created.order_index} title="${created.title}" is_active=${created.is_active}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
