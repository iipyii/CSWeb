import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runXMLMigration() {
    console.log("⏳ กำลังแปลงข้อมูล Text เป็นโครงสร้าง XML...");
    
    const allSections = await prisma.program_sections.findMany({
        include: { version: true }
    });

    for (const section of allSections) {
        if (!section.content) continue;

        const year = section.version?.year || "ไม่ระบุ";
        const rawText = section.content;
        const courseBlocks = rawText.split(/(?=\b\d{9}\b)/);

        let xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n<curriculum year="${year}">\n`;

        for (const block of courseBlocks) {
            if (!block.match(/^\d{9}/)) continue;

            let cleanText = block.replace(/มคอ\.\s*\d/g, '').trim();
            const codeMatch = cleanText.match(/^(\d{9})/);
            const code = codeMatch ? codeMatch[1] : "";
            const creditMatch = cleanText.match(/\d\(\d-\d-\d\)/);
            const credit = creditMatch ? creditMatch[0] : "ไม่ระบุหน่วยกิต";

            let firstLine = cleanText.split('\n')[0];
            let titleTH = firstLine.replace(code, '').replace(credit, '').trim();

            const titleENMatch = cleanText.match(/\(([a-zA-Z\s\-\,]+)\)/);
            const titleEN = titleENMatch ? titleENMatch[1].trim() : "";

            let prerequisite = "ไม่มี";
            const prereqRegexTH = /วิชาบังคับก่อน\s*[:：]?\s*([^\n]+)/;
            const prereqRegexEN = /Prerequisite\s*[:：]?\s*([^\n]+)/;
            const matchTH = cleanText.match(prereqRegexTH);
            const matchEN = cleanText.match(prereqRegexEN);

            if (matchTH && !matchTH[1].includes("ไม่มี")) prerequisite = matchTH[1].trim();
            else if (matchEN && !matchEN[1].toLowerCase().includes("none")) prerequisite = matchEN[1].trim();

            let description = cleanText.replace(firstLine, '');
            if (titleENMatch) description = description.replace(titleENMatch[0], '');
            description = description.replace(/วิชาบังคับก่อน.*?(?=\n|$)/g, '');
            description = description.replace(/Prerequisite.*?(?=\n|$)/g, '');
            description = description.replace(/\s+/g, ' ').trim();

            
            if (description.length > 40) {
                xmlString += `  <course>\n`;
                xmlString += `    <course_code>${code}</course_code>\n`;
                xmlString += `    <title_th>${titleTH}</title_th>\n`;
                xmlString += `    <title_en>${titleEN}</title_en>\n`;
                xmlString += `    <credit>${credit}</credit>\n`;
                xmlString += `    <prerequisite>${prerequisite}</prerequisite>\n`;
                xmlString += `    <description>${description}</description>\n`;
                xmlString += `  </course>\n`;
            }
        }
        
        
        xmlString += `</curriculum>`;

        
        await prisma.program_sections.update({
            where: { id: section.id },
            data: { xml_data: xmlString }
        });
    }
    console.log("✅ แปลงข้อมูลเป็น XML และบันทึกลง Database สำเร็จ!");
}

runXMLMigration().catch(console.error).finally(() => prisma.$disconnect());