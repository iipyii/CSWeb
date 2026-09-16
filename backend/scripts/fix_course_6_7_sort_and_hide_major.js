// Two independent fixes for regular/2559 (curriculumId=8), confirmed with
// the user against the target reference (8 sections: 1,2,3,4,5,6-7,8,
// คำอธิบายรายวิชา — no chart, unlike 2564):
//
// 1. id=72 (course_bachelor_cs59_6_7.pdf) was moved to order_index=67 in an
//    earlier fix so it wouldn't collide with sectionTitles[7]'s single-topic
//    text — but 67 sorts after order_index=8, so "หมวดที่ 6-7" displayed
//    after "หมวดที่ 8" instead of before it. Now that order_index is a
//    float (see the migration alongside this script), it can sit at 6.5 —
//    between the real order_index=5 and 8 rows — without colliding with the
//    integer keys 6/7 that sectionTitles still uses for other programs'
//    genuinely separate หมวด 6 / หมวด 7 sections.
//
// 2. id=66 (the "major" chart file) should not appear in 2559's list at all
//    per the confirmed reference. Rather than deleting the row, it's hidden
//    via the new is_active flag (mirrors banners.is_active) so it can be
//    restored with a single UPDATE if this decision changes again.
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const sortFix = await prisma.courses.findUnique({ where: { id: 72 } });
  if (!sortFix) {
    console.log("skip: id=72 not found");
  } else if (sortFix.order_index !== 67) {
    console.log(`skip: id=72 order_index is ${sortFix.order_index}, expected 67 — not touching, data may have changed`);
  } else {
    const updated = await prisma.courses.update({
      where: { id: 72 },
      data: { order_index: 6.5 },
    });
    console.log(`fixed: id=${updated.id} order_index 67 -> ${updated.order_index}`);
  }

  const hideFix = await prisma.courses.findUnique({ where: { id: 66 } });
  if (!hideFix) {
    console.log("skip: id=66 not found");
  } else if (!hideFix.is_active) {
    console.log("skip: id=66 already is_active=false");
  } else {
    const updated = await prisma.courses.update({
      where: { id: 66 },
      data: { is_active: false },
    });
    console.log(`fixed: id=${updated.id} is_active -> ${updated.is_active}`);
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
