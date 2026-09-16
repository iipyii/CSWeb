// Imports master/ComputerScience's two main curricula (2562, 2567) —
// their course_editcs2562.pdf amendment is handled separately in
// import_computerscience_edit_2562.js, since it needs a sibling program to
// avoid colliding with 2562's (programId, year) here.
//
// Content verified per-file via extract_pdf.py before assigning
// order_index (not guessed from filenames):
// - 2562 uses the older "หมวดที่ N" TQF format -> sectionTitles[1]-[8],
//   course_ms_cs9.pdf is a combined ภาคผนวก -> sectionTitles[990]
// - 2567 uses the newer OBE "องค์ประกอบที่ N" format -> sectionTitles[111]-[900],
//   appendix_67.pdf -> sectionTitles[990]
import { execSync } from "child_process";
import { prisma } from "../src/lib/prisma.js";

const DEGREE_SLUG = "master";
const DEGREE_NAME_TH = "ปริญญาโท";
const PROGRAM_SLUG = "ComputerScience";
const PROGRAM_NAME_TH = "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์";

const CURRICULA = [
  {
    year: 2562,
    files: [
      { relPath: "courses/master/ComputerScience/2562/course_ms_cs1.pdf", section_no: 1, order_index: 1 },
      { relPath: "courses/master/ComputerScience/2562/course_ms_cs2.pdf", section_no: 2, order_index: 2 },
      { relPath: "courses/master/ComputerScience/2562/course_ms_cs3.pdf", section_no: 3, order_index: 3 },
      { relPath: "courses/master/ComputerScience/2562/course_ms_cs4.pdf", section_no: 4, order_index: 4 },
      { relPath: "courses/master/ComputerScience/2562/course_ms_cs5.pdf", section_no: 5, order_index: 5 },
      { relPath: "courses/master/ComputerScience/2562/course_ms_cs6.pdf", section_no: 6, order_index: 6 },
      { relPath: "courses/master/ComputerScience/2562/course_ms_cs7.pdf", section_no: 7, order_index: 7 },
      { relPath: "courses/master/ComputerScience/2562/course_ms_cs8.pdf", section_no: 8, order_index: 8 },
      { relPath: "courses/master/ComputerScience/2562/course_ms_cs9.pdf", section_no: 9, order_index: 990 },
    ],
  },
  {
    year: 2567,
    files: [
      { relPath: "courses/master/ComputerScience/2567/course_ms_cs67_1.pdf", section_no: 1, order_index: 111 },
      { relPath: "courses/master/ComputerScience/2567/course_ms_cs67_2.pdf", section_no: 2, order_index: 222 },
      { relPath: "courses/master/ComputerScience/2567/course_ms_cs67_3.pdf", section_no: 3, order_index: 333 },
      { relPath: "courses/master/ComputerScience/2567/course_ms_cs67_4.pdf", section_no: 4, order_index: 444 },
      { relPath: "courses/master/ComputerScience/2567/course_ms_cs67_5.pdf", section_no: 5, order_index: 555 },
      { relPath: "courses/master/ComputerScience/2567/course_ms_cs67_6.pdf", section_no: 6, order_index: 666 },
      { relPath: "courses/master/ComputerScience/2567/course_ms_cs67_7.pdf", section_no: 7, order_index: 777 },
      { relPath: "courses/master/ComputerScience/2567/course_ms_cs67_8.pdf", section_no: 8, order_index: 888 },
      { relPath: "courses/master/ComputerScience/2567/course_ms_cs9_67.pdf", section_no: 9, order_index: 900 },
      { relPath: "courses/master/ComputerScience/2567/appendix_67.pdf", section_no: 10, order_index: 990 },
    ],
  },
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

  for (const { year, files } of CURRICULA) {
    let curriculum = await prisma.curriculums.findUnique({
      where: { programId_year: { programId: program.id, year } },
    });
    if (!curriculum) {
      curriculum = await prisma.curriculums.create({ data: { programId: program.id, year, pdf_url: null } });
      console.log(`created curriculums row: id=${curriculum.id} year=${year}`);
    } else {
      console.log(`curriculums row already exists: id=${curriculum.id} year=${year}`);
    }

    for (const file of files) {
      const existing = await prisma.courses.findFirst({
        where: { curriculumId: curriculum.id, order_index: file.order_index },
      });
      if (existing) {
        console.log(`  skip (already exists): year=${year} order_index=${file.order_index}`);
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
      console.log(`  created course: id=${created.id} order_index=${created.order_index} title="${created.title}" content_len=${content.length}`);
    }
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
