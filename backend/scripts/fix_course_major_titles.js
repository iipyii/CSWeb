// Fixes the "Computer-Science-major" chart file for regular/2564 and
// regular/2559: it was imported with order_index=999, the same value as
// the genuine "คำอธิบายรายวิชา" (appendix/course-description) file for
// that year. CourseDetail.jsx's sectionTitles map renders a fixed string
// per order_index (999 -> "คำอธิบายรายวิชา"), so both rows displayed the
// same text regardless of their actual title column.
//
// sectionTitles already has a dedicated key for this content —
// 99: "แผนภูมิแสดงความต่อเนื่องของการศึกษาในหลักสูตรวิทยาศาสตรบัณฑิต
//      สาขาวิชาวิทยาการคอมพิวเตอร์" — so moving the major-chart row to
// order_index=99 makes the page render correctly without touching
// CourseDetail.jsx at all. title is also corrected to match, for the
// DB record's own sake (even though the page currently prefers the
// sectionTitles override over this column).
//
// The other order_index=999 row for each year is left untouched.
import { prisma } from "../src/lib/prisma.js";

const CORRECT_TITLE =
  "แผนภูมิแสดงความต่อเนื่องของการศึกษาในหลักสูตรวิทยาศาสตรบัณฑิตสาขาวิชาวิทยาการคอมพิวเตอร์";

const fixes = [
  { id: 76, year: 2564, oldTitle: "Computer-Science-major-2564.pdf" },
  { id: 66, year: 2559, oldTitle: "Computer-Science-major-2559.pdf" },
];

async function main() {
  for (const fix of fixes) {
    const existing = await prisma.courses.findUnique({ where: { id: fix.id } });
    if (!existing) {
      console.log(`skip: id=${fix.id} (${fix.year}) not found`);
      continue;
    }
    if (existing.title !== fix.oldTitle) {
      console.log(
        `skip: id=${fix.id} (${fix.year}) title is "${existing.title}", expected "${fix.oldTitle}" — not touching, data may have changed`
      );
      continue;
    }

    const updated = await prisma.courses.update({
      where: { id: fix.id },
      data: { title: CORRECT_TITLE, order_index: 99 },
    });
    console.log(`fixed: id=${updated.id} (${fix.year}) -> order_index=${updated.order_index}, title="${updated.title}"`);
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
