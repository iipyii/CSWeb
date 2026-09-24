import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TITLE_MAP = {
  1: "หมวดที่ 1 ข้อมูลทั่วไป",
  2: "หมวดที่ 2 ข้อมูลเฉพาะของหลักสูตร",
  3: "หมวดที่ 3 ระบบการจัดการศึกษา โครงสร้าง และรายวิชา",
  4: "หมวดที่ 4 ผลการเรียนรู้ กลยุทธ์การสอนและการประเมินผล",
  5: "หมวดที่ 5 หลักเกณฑ์ในการประเมินผลนักศึกษา",
  6: "หมวดที่ 6 การพัฒนาคณาจารย์",
  7: "หมวดที่ 7 การประกันคุณภาพหลักสูตร",
  8: "หมวดที่ 8 การประเมินและปรับปรุงการดำเนินการของหลักสูตร",
  9: "หมวดที่ 9 เอกสารแนบ / ภาคผนวก",
  11: "หมวดที่ 1 ข้อมูลทั่วไป",
  22: "หมวดที่ 2 การจัดการเรียนการสอน",
  33: "หมวดที่ 3 ประกาศหลักเกณฑ์และการเบิกจ่าย",
  111: "องค์ประกอบที่ 1 ชื่อปริญญาและสาขาวิชา",
  222: "องค์ประกอบที่ 2 ปรัชญา วัตถุประสงค์ และผลลัพธ์การเรียนรู้",
  333: "องค์ประกอบที่ 3 โครงสร้างหลักสูตร รายวิชาและหน่วยกิต",
  444: "องค์ประกอบที่ 4 การจัดกระบวนการเรียนรู้",
  555: "องค์ประกอบที่ 5 ความพร้อมและศักยภาพในการบริหารจัดการ",
  666: "องค์ประกอบที่ 6 คุณสมบัติของผู้เข้าศึกษา",
  777: "องค์ประกอบที่ 7 การประเมินผลและเกณฑ์การสำเร็จการศึกษา",
  888: "องค์ประกอบที่ 8 การประกันคุณภาพหลักสูตร",
  900: "องค์ประกอบที่ 9 ระบบและกลไกในการพัฒนาหลักสูตร",
  990: "หมวดที่ 9 เอกสารแนบ / ภาคผนวก",
  99: "แผนภูมิแสดงความต่อเนื่องของการศึกษา",
  88: "การปรับปรุงแก้ไขหลักสูตร",
  999: "คำอธิบายรายวิชา"
};

async function cleanSectionTitles() {
  console.log("Cleaning section titles in database...");

  const sections = await prisma.program_sections.findMany();
  let updatedCount = 0;

  for (const s of sections) {
    let cleanTitle = s.title;

    // If title is a raw filename like "course_bachelor1.pdf" or "bsc54-2.pdf"
    if (!s.title || s.title.endsWith(".pdf") || s.title.includes("course_") || s.title.includes("bsc54") || s.title.includes("appendix")) {
      cleanTitle = TITLE_MAP[s.order_index] || TITLE_MAP[s.section_no] || `หมวดที่ ${s.section_no || 1}`;
    }

    if (cleanTitle !== s.title) {
      await prisma.program_sections.update({
        where: { id: s.id },
        data: { title: cleanTitle }
      });
      console.log(`Updated ID ${s.id}: "${s.title}" -> "${cleanTitle}"`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} section titles!`);
}

cleanSectionTitles()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
