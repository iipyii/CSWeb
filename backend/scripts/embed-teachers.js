import { PrismaClient } from '@prisma/client';
import { getLocalEmbedding } from '../src/services/embedding.service.js';

const prisma = new PrismaClient();

async function runLecturerEmbedding() {
    console.log("⏳ กำลังดึงข้อมูลอาจารย์และผลงานวิจัยมาสร้าง Vector...");

    // 1. ดึงข้อมูลอาจารย์ทั้งหมด "พร้อมดึงผลงานวิจัย" ของแต่ละคนมาด้วย
    const lecturers = await prisma.lecturers.findMany({
        include: {
            research_publications: true // ดึงข้อมูลจากตารางผลงานมาด้วย
        }
    });

    let count = 0;
    for (const lecturer of lecturers) {
        // 2. รวบรวมชื่อผลงานวิจัยทั้งหมดของอาจารย์ท่านนี้ มาคั่นด้วยลูกน้ำ
        const researchTitles = lecturer.research_publications
            .map(pub => pub.title)
            .join(" , ");

        // 3. เรียบเรียงข้อความเพื่อให้ AI อ่านและจำง่ายๆ (Prompt Formatting)
        const textToEmbed = `
ข้อมูลอาจารย์
ชื่อ-นามสกุล: ${lecturer.fullname_th} ${lecturer.fullname_en ? `(${lecturer.fullname_en})` : ''}
ตำแหน่งทางวิชาการ: ${lecturer.position_th || 'ไม่ระบุ'}
ประวัติการศึกษา: ${lecturer.education_th || 'ไม่ระบุ'}
อีเมลติดต่อ: ${lecturer.email || 'ไม่ระบุ'}
เบอร์โทรศัพท์: ${lecturer.tel || 'ไม่ระบุ'}
ผลงานวิจัยและความเชี่ยวชาญ: ${researchTitles || 'ยังไม่มีข้อมูลผลงานวิจัย'}
        `.trim();

        // 4. แปลงข้อความเป็น Vector (384 มิติ)
        const embeddingArray = await getLocalEmbedding(textToEmbed);
        const vectorString = `[${embeddingArray.join(",")}]`;

        // 5. อัปเดต Vector กลับเข้าไปในตาราง lecturers (ใช้ Raw SQL เพราะเป็น pgvector)
        await prisma.$executeRaw`
            UPDATE lecturers 
            SET embedding = ${vectorString}::vector
            WHERE id = ${lecturer.id}
        `;
        count++;
    }

    console.log(`✅ อัปเดตสมองให้ข้อมูลอาจารย์สำเร็จ! จำนวน ${count} ท่าน`);
}

runLecturerEmbedding().catch(console.error).finally(() => prisma.$disconnect());