// regular/2554 (curriculumId=7) target structure per the confirmed reference:
// หมวด 1-8 (separate, already correct) + a chart item at the end, with no
// course-description item (unlike other years, which do have one).
//
// bsc54-appendix.pdf (id=65, order_index=999) is confirmed via its actual
// extracted text (subject codes, course names, credit-hour notation) to
// genuinely be course-description content — its current "คำอธิบายรายวิชา"
// label is factually correct, not a mislabeling bug like the ones found in
// 2559/2564. It's hidden here only because the confirmed target structure
// says this page shouldn't show one for 2554, not because the file itself
// is wrong.
//
// No chart file exists anywhere for 2554 (checked the whole courses table
// and the actual uploads/courses/bachelor/regular/2554/ folder — there's
// nothing resembling 2559/2564's large image-only "major" PDFs). This adds
// a placeholder row instead (content='', pdf_path=null), the same pattern
// used for the 2569 curriculum's not-yet-attached sections.
import { prisma } from "../src/lib/prisma.js";

const CURRICULUM_ID = 7;
const APPENDIX_ROW_ID = 65;
const CHART_TITLE =
  "แผนภูมิแสดงความต่อเนื่องของการศึกษาในหลักสูตรวิทยาศาสตรบัณฑิตสาขาวิชาวิทยาการคอมพิวเตอร์";
const CHART_ORDER_INDEX = 99;

async function main() {
  const appendix = await prisma.courses.findUnique({ where: { id: APPENDIX_ROW_ID } });
  if (!appendix) {
    console.log(`skip: id=${APPENDIX_ROW_ID} not found`);
  } else if (!appendix.is_active) {
    console.log(`skip: id=${APPENDIX_ROW_ID} already is_active=false`);
  } else {
    const updated = await prisma.courses.update({
      where: { id: APPENDIX_ROW_ID },
      data: { is_active: false },
    });
    console.log(`hidden: id=${updated.id} is_active -> ${updated.is_active}`);
  }

  const existingChart = await prisma.courses.findFirst({
    where: { curriculumId: CURRICULUM_ID, order_index: CHART_ORDER_INDEX },
  });
  if (existingChart) {
    console.log(`skip: curriculumId=${CURRICULUM_ID} already has order_index=${CHART_ORDER_INDEX} (id=${existingChart.id})`);
  } else {
    const created = await prisma.courses.create({
      data: {
        curriculumId: CURRICULUM_ID,
        section_no: 9,
        title: CHART_TITLE,
        content: "",
        order_index: CHART_ORDER_INDEX,
        pdf_path: null,
      },
    });
    console.log(`created placeholder: id=${created.id} order_index=${created.order_index} title="${created.title}"`);
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
