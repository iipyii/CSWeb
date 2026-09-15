// One-off seed for the หลักสูตรปรับปรุง พ.ศ. 2569 placeholder curriculum.
// Unlike import_courses.js, there are no real PDF files yet, so this just
// writes the 10 section titles directly instead of scanning/extracting PDFs.
import { prisma } from "../src/lib/prisma.js";

const PROGRAM_ID = 1; // programs.slug === "regular" (ป.ตรี ภาคปกติ วิทยาการคอมพิวเตอร์)
const YEAR = 2569;

// order_index เริ่มที่ 101 โดยตั้งใจ เพื่อไม่ชนกับ key ที่ CourseDetail.jsx's
// sectionTitles ใช้แสดงข้อความแทน title ที่เก็บใน DB อยู่แล้ว (1-8, 11, 22, 33,
// 88, 99, 111-900, 990, 999) ถ้าใช้ order_index ที่ชนกัน หน้าเว็บจะแสดงข้อความ
// เดิมของ sectionTitles แทนที่ title ที่ seed ไว้ตรงนี้
const sections = [
  "องค์ประกอบที่ 1 ชื่อปริญญา ประกาศนียบัตร ประกาศนียบัตรชั้นสูง และสาขาวิชา",
  "องค์ประกอบที่ 2 ปรัชญา วัตถุประสงค์ ผลลัพธ์การเรียนรู้",
  "องค์ประกอบที่ 3 โครงสร้างหลักสูตร รายวิชาและหน่วยกิต",
  "องค์ประกอบที่ 4 การจัดกระบวนการเรียนรู้",
  "องค์ประกอบที่ 5 ความพร้อมและศักยภาพในการบริหารจัดการหลักสูตรซึ่งรวมถึงคณาจารย์และที่ปรึกษาวิทยานิพนธ์",
  "องค์ประกอบที่ 6 คุณสมบัติของผู้เข้าศึกษา",
  "องค์ประกอบที่ 7 การประเมินผลการเรียนและเกณฑ์การสำเร็จการศึกษา",
  "องค์ประกอบที่ 8 การประกันคุณภาพหลักสูตร",
  "องค์ประกอบที่ 9 ระบบและกลไกในการพัฒนาหลักสูตร",
  "แผนภูมิแสดงความต่อเนื่องของหลักสูตร",
];

async function main() {
  const curriculum = await prisma.curriculums.upsert({
    where: { programId_year: { programId: PROGRAM_ID, year: YEAR } },
    update: {},
    create: { programId: PROGRAM_ID, year: YEAR, pdf_url: null },
  });
  console.log("curriculum:", curriculum);

  for (let i = 0; i < sections.length; i++) {
    const sectionNo = i + 1;
    const orderIndex = 100 + sectionNo;

    const existing = await prisma.courses.findFirst({
      where: { curriculumId: curriculum.id, order_index: orderIndex },
    });
    if (existing) {
      console.log(`skip (already exists): order_index=${orderIndex}`);
      continue;
    }

    // content เป็น NOT NULL ใน schema จริง จึงใช้ "" แทน null ตามที่ระบุไว้ว่า
    // "ว่างหรือ null" — pdf_path/xml_data เป็น nullable จริง ใช้ null ได้ตรงๆ
    const created = await prisma.courses.create({
      data: {
        curriculumId: curriculum.id,
        section_no: sectionNo,
        title: sections[i],
        content: "",
        order_index: orderIndex,
        pdf_path: null,
      },
    });
    console.log("created course:", created.id, created.title);
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
