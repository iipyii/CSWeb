// regular and csb's name_th already end with a degree-type qualifier in
// parentheses (ภาคปกติ / โครงการพิเศษ สองภาษา), which is why their
// CourseDetail.jsx heading (rendered as {currentData.name_th}) already
// reads correctly. ComputerScience, SoftwareEngineering and computersci
// were imported without one, so their heading was incomplete. Backfills
// those three to match the existing convention -- no schema change, no
// new field, just makes name_th consistent across every program.
//
// The "-edit" sibling programs (regular-edit, ComputerScience-edit,
// SoftwareEngineering-edit) are amendment notices, not full curricula --
// their name_th is already the complete announcement title and doesn't
// need a degree-type qualifier appended.
import { prisma } from "../src/lib/prisma.js";

const UPDATES = [
  { slug: "ComputerScience", name_th: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาโท)" },
  { slug: "SoftwareEngineering", name_th: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์ (ปริญญาโท)" },
  { slug: "computersci", name_th: "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาเอก)" },
];

async function main() {
  for (const update of UPDATES) {
    const program = await prisma.programs.findFirst({ where: { slug: update.slug } });
    if (!program) {
      console.log(`skip: program not found: ${update.slug}`);
      continue;
    }
    if (program.name_th === update.name_th) {
      console.log(`skip: ${update.slug} already has the target name_th`);
      continue;
    }
    const updated = await prisma.programs.update({
      where: { id: program.id },
      data: { name_th: update.name_th },
    });
    console.log(`updated: ${updated.slug} name_th="${updated.name_th}"`);
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
