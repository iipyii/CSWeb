import { PrismaClient } from '@prisma/client';
import { XMLParser } from 'fast-xml-parser';
import { getLocalEmbedding } from '../src/services/embedding.service.js'; // 👈 แก้พาธให้ตรงกับไฟล์ของคุณ

const prisma = new PrismaClient();

async function runEmbedding() {
    console.log("⏳ กำลังสร้างสมอง (Vector) ให้ Chatbot...");


    // 1. ล้างข้อมูลเก่าเผื่อรันซ้ำ (เฉพาะความรู้ประเภทรายวิชา)
    await prisma.$executeRaw`DELETE FROM chatbot_knowledge WHERE source_type = 'course';`;

    const allSections = await prisma.courses.findMany({
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
                INSERT INTO chatbot_knowledge (source_type, reference_id, content, embedding)
                VALUES (
                    'course',
                    ${section.id},
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