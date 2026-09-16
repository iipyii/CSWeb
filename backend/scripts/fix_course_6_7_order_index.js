// regular/2559's "course_bachelor_cs59_6_7.pdf" (id=72) already contains the
// merged หมวด 6+7 content (confirmed by filename and non-empty extracted
// text), but was imported with order_index=7 — the same key used by every
// OTHER program/year's genuinely separate, single-topic หมวดที่ 7 file.
// CourseDetail.jsx's sectionTitles[7] therefore rendered the single-topic
// "หมวดที่ 7 การประกันคุณภาพหลักสูตร" text for this combined-content row,
// silently dropping "หมวดที่ 6" and "การพัฒนาคณาจารย์" from the heading.
//
// Fix is a dedicated sectionTitles[67] key (added in CourseDetail.jsx
// alongside this script) plus moving this one row to order_index=67.
// Confirmed via a system-wide query that no other row uses order_index=67,
// so this doesn't collide with or change any other program/year's display.
import { prisma } from "../src/lib/prisma.js";

const ROW_ID = 72;
const OLD_ORDER_INDEX = 7;
const NEW_ORDER_INDEX = 67;

async function main() {
  const existing = await prisma.courses.findUnique({ where: { id: ROW_ID } });
  if (!existing) {
    console.log(`skip: id=${ROW_ID} not found`);
    return;
  }
  if (existing.order_index !== OLD_ORDER_INDEX) {
    console.log(
      `skip: id=${ROW_ID} order_index is ${existing.order_index}, expected ${OLD_ORDER_INDEX} — not touching, data may have changed`
    );
    return;
  }

  const updated = await prisma.courses.update({
    where: { id: ROW_ID },
    data: { order_index: NEW_ORDER_INDEX },
  });
  console.log(`fixed: id=${updated.id} order_index ${OLD_ORDER_INDEX} -> ${updated.order_index}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
