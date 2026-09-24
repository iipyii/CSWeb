import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspectAndPopulate2569() {
  console.log("🔍 Checking Programs and Sections in DB...");

  const programs = await prisma.programs.findMany({
    include: {
      versions: {
        include: {
          sections: true
        }
      }
    }
  });

  for (const p of programs) {
    console.log(`\nProgram ID: ${p.id}, Slug: ${p.slug}, Name: ${p.name_th}`);
    for (const v of p.versions) {
      console.log(`  Version ID: ${v.id}, Year: ${v.year}, Sections Count: ${v.sections.length}`);
      for (const s of v.sections) {
        console.log(`    Sec ${s.section_no} (order: ${s.order_index}): ${s.title} -> pdf_path: "${s.pdf_path}"`);
      }
    }
  }

  // Find regular bachelor program
  const bachelorProg = programs.find(p => p.slug === "regular" || p.name_th.includes("ปกติ"));
  if (bachelorProg) {
    console.log(`\nFound Bachelor Program: ID ${bachelorProg.id}`);
    
    // Find or create version 2569
    let v2569 = bachelorProg.versions.find(v => v.year === 2569);
    if (!v2569) {
      v2569 = await prisma.program_versions.create({
        data: {
          programId: bachelorProg.id,
          year: 2569
        }
      });
      console.log(`Created Version 2569 with ID: ${v2569.id}`);
    } else {
      console.log(`Found Version 2569 with ID: ${v2569.id}`);
    }

    // Populate sections 1-9 for 2569
    const sectionMapping = [
      { no: 1, order: 1, title: "หมวดที่ 1 ข้อมูลทั่วไป", file: "course_bachelor1_2569.pdf" },
      { no: 2, order: 2, title: "หมวดที่ 2 ข้อมูลเฉพาะของหลักสูตร", file: "course_bachelor2_2569.pdf" },
      { no: 3, order: 3, title: "หมวดที่ 3 ระบบการจัดการศึกษา การดำเนินการและโครงสร้างของหลักสูตร", file: "course_bachelor3_2569.pdf" },
      { no: 4, order: 4, title: "หมวดที่ 4 ผลการเรียนรู้ กลยุทธ์การสอนและการประเมินผล", file: "course_bachelor4_2569.pdf" },
      { no: 5, order: 5, title: "หมวดที่ 5 หลักเกณฑ์ในการประเมินผลนักศึกษา", file: "course_bachelor5_2569.pdf" },
      { no: 6, order: 6, title: "หมวดที่ 6 การพัฒนาคณาจารย์", file: "course_bachelor6_2569.pdf" },
      { no: 7, order: 7, title: "หมวดที่ 7 การประกันคุณภาพหลักสูตร", file: "course_bachelor7_2569.pdf" },
      { no: 8, order: 8, title: "หมวดที่ 8 การประเมินและปรับปรุงการดำเนินการของหลักสูตร", file: "course_bachelor8_2569.pdf" },
      { no: 9, order: 9, title: "หมวดที่ 9 เอกสารแนบ / ภาคผนวก", file: "course_bachelor9_2569.pdf" },
      { no: 99, order: 99, title: "แผนภูมิแสดงความต่อเนื่องของการศึกษาในหลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์", file: "Curriculum_Continuity_Chart_2569.pdf" }
    ];

    for (const sec of sectionMapping) {
      const pdfPath = `/uploads/courses/bachelor/regular/2569/${sec.file}`;
      const existing = await prisma.program_sections.findFirst({
        where: {
          versionId: v2569.id,
          order_index: sec.order
        }
      });

      if (existing) {
        await prisma.program_sections.update({
          where: { id: existing.id },
          data: {
            title: sec.title,
            section_no: sec.no,
            pdf_path: pdfPath
          }
        });
        console.log(`Updated sec ${sec.no} -> ${pdfPath}`);
      } else {
        await prisma.program_sections.create({
          data: {
            versionId: v2569.id,
            section_no: sec.no,
            order_index: sec.order,
            title: sec.title,
            content: "",
            pdf_path: pdfPath
          }
        });
        console.log(`Created sec ${sec.no} -> ${pdfPath}`);
      }
    }
  }
}

inspectAndPopulate2569()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
