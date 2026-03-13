import { PrismaClient } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import { getLocalEmbedding } from '../src/services/embedding.service.js'; // 👈 แก้พาธให้ตรงกับไฟล์ของคุณ

const prisma = new PrismaClient();

async function runEmbedding() {
    console.log("⏳ กำลังสร้างสมอง (Vector) ให้ Chatbot...");


    // 1. ล้างข้อมูลเก่าเผื่อรันซ้ำ
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "CourseKnowledge" RESTART IDENTITY;`);

    // 2. สั่งลบคอลัมน์ Vector อันเก่า (768) ทิ้ง
    await prisma.$executeRawUnsafe(`ALTER TABLE "CourseKnowledge" DROP COLUMN IF EXISTS embedding;`);

    // 3. สั่งสร้างคอลัมน์ Vector ใหม่ให้เป็นขนาด 384 มิติเป๊ะๆ
    await prisma.$executeRawUnsafe(`ALTER TABLE "CourseKnowledge" ADD COLUMN embedding vector(384);`);
    const allSections = await prisma.program_sections.findMany({
        where: { xml_data: { not: null } }
    });

    const parser = new XMLParser();
    let count = 0;

    for (const section of allSections) {
        const jsonObj = parser.parse(section.xml_data);
        let courses = jsonObj.curriculum?.course;
        if (!courses) continue;
        if (!Array.isArray(courses)) courses = [courses];

        for (const course of courses) {
            // 💡 นำข้อมูลมาเรียบเรียงใหม่ เพื่อให้ AI เข้าใจบริบทได้ดีที่สุด
            const textToEmbed = `
            รหัสวิชา: ${course.course_code}
            ชื่อวิชาภาษาไทย: ${course.title_th}
            ชื่อวิชาภาษาอังกฤษ: ${course.title_en}
            วิชาที่ต้องเรียนก่อน (Prerequisite): ${course.prerequisite_th} / ${course.prerequisite_en}
            คำอธิบายเนื้อหาที่เรียน: ${course.description_th} ${course.description_en}
            `.trim();

            // 1. แปลงเป็น Vector (384 มิติ)
            const embeddingArray = await getLocalEmbedding(textToEmbed);

            // 2. บันทึกลง Database
            await prisma.$executeRaw`
                INSERT INTO "CourseKnowledge" (course_code, title_th, content, embedding)
                VALUES (
                    ${String(course.course_code)}, 
                    ${String(course.title_th)}, 
                    ${textToEmbed}, 
                    ${embeddingArray}::vector
                )
            `;
            count++;
        }
    }
    console.log(`✅ อัดความรู้สำเร็จ! บันทึกไปทั้งหมด ${count} วิชา พร้อมคุยแล้ว!`);
}

runEmbedding().catch(console.error).finally(() => prisma.$disconnect());