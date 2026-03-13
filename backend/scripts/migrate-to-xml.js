import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const escapeXml = (unsafe) => {
    if (!unsafe) return "";
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;'; case '>': return '&gt;';
            case '&': return '&amp;'; case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};

async function runXMLMigration() {
    console.log("🗑️ กำลังล้างข้อมูลเก่า และแปลง XML ชุดใหม่ (แก้ปัญหาวิชาบังคับก่อน 2 บรรทัด)...");
    
    await prisma.program_sections.updateMany({ data: { xml_data: null } });

    const allSections = await prisma.program_sections.findMany({ include: { version: true } });
    let totalSaved = 0;

    for (const section of allSections) {
        if (!section.content) continue;

        const year = section.version?.year || "ไม่ระบุ";
        const safeText = "\n" + section.content;
        
        // 🚨 จุดที่แก้ปัญหา: จำกัดช่องว่างหน้าตัวเลข 9 หลักต้องไม่เกิน 10 ตัวอักษร ({0,10})
        // เพื่อป้องกันการไปหั่นโดนรหัสวิชาบังคับก่อนที่เคาะย่อหน้าเข้าไปลึกๆ
        const courseBlocks = safeText.split(/\n(?=[ \t]{0,10}\d{9}\s+[ก-๙A-Za-z])/);

        let xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n<curriculum year="${year}">\n`;

        for (const block of courseBlocks) {
            let cleanText = block.replace(/มคอ\.\s*\d/g, '').trim();
            if (!cleanText.match(/^\d{9}/)) continue; 

            // 1. ดึงรหัส, หน่วยกิต, ชื่อไทย
            const codeMatch = cleanText.match(/^(\d{9})/);
            const code = codeMatch ? codeMatch[1] : "";
            const creditMatch = cleanText.match(/\d\(\d-\d-\d\)/);
            const credit = creditMatch ? creditMatch[0] : "ไม่ระบุหน่วยกิต";

            let firstLine = cleanText.split('\n')[0];
            let titleTH = firstLine.replace(code, '').replace(credit, '').trim();

            let restOfText = cleanText.replace(firstLine, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

            // 2. ดึงชื่ออังกฤษ
            let titleEN = "";
            const enTitleMatch = restOfText.match(/^\s*\(([^ก-๙\)]+)\)/);
            if (enTitleMatch) {
                titleEN = enTitleMatch[1].trim();
                restOfText = restOfText.replace(enTitleMatch[0], '').trim();
            }

            // 3. ดึงวิชาบังคับก่อน (แยก TH / EN)
            let prerequisiteTH = "ไม่มี";
            let prerequisiteEN = "None";

            // กวาดข้อความตั้งแต่ "วิชาบังคับก่อน" จนถึง "Prerequisite" มาทั้งหมด (ได้วิชามาครบทั้ง 2 ตัว)
            const thMatch = restOfText.match(/วิชาบังคับก่อน\s*[:：]?\s*(.*?)(?=Prerequisite\s*[:：]?|$)/i);
            if (thMatch) {
                let thText = thMatch[1].trim();
                if (thText && !thText.includes("ไม่มี")) prerequisiteTH = thText;
                restOfText = restOfText.replace(thMatch[0], '').trim();
            }

            // กวาดข้อความตั้งแต่ "Prerequisite" จนกว่าจะเจอตัวอักษรภาษาไทยติดกัน (เริ่มคำอธิบาย)
            const enMatch = restOfText.match(/Prerequisite\s*[:：]?\s*(.*?)(?=[ก-๙]{2,}|$)/i);
            if (enMatch) {
                let enText = enMatch[1].trim();
                if (enText && !enText.toLowerCase().includes("none")) prerequisiteEN = enText;
                restOfText = restOfText.replace(enMatch[0], '').trim();
            }

            // 4. ดึงคำอธิบาย (แยก TH / EN)
            let description = restOfText.replace(/^(ไม่มี|None|[\s\)\|\-\:\.]*)+/ig, '').trim();
            let descTH = description;
            let descEN = "";

            const enDescMatch = description.match(/([a-zA-Z][^ก-๙]+)$/);
            if (enDescMatch && enDescMatch[1].length > 30) {
                descEN = enDescMatch[1].trim();
                descTH = description.replace(enDescMatch[1], '').trim();
            }

            // 5. ประกอบร่าง XML
            if (descTH.length > 20) {
                xmlString += `  <course>\n`;
                xmlString += `    <course_code>${escapeXml(code)}</course_code>\n`;
                xmlString += `    <title_th>${escapeXml(titleTH)}</title_th>\n`;
                xmlString += `    <title_en>${escapeXml(titleEN)}</title_en>\n`;
                xmlString += `    <credit>${escapeXml(credit)}</credit>\n`;
                xmlString += `    <prerequisite_th>${escapeXml(prerequisiteTH)}</prerequisite_th>\n`;
                xmlString += `    <prerequisite_en>${escapeXml(prerequisiteEN)}</prerequisite_en>\n`;
                xmlString += `    <description_th>${escapeXml(descTH)}</description_th>\n`;
                xmlString += `    <description_en>${escapeXml(descEN)}</description_en>\n`;
                xmlString += `  </course>\n`;
                totalSaved++;
            }
        }
        
        xmlString += `</curriculum>`;
        await prisma.program_sections.update({ where: { id: section.id }, data: { xml_data: xmlString } });
    }
    console.log(`✅ อัปเดต XML สำเร็จ! บันทึกวิชาไปทั้งหมด ${totalSaved} วิชา`);
}

runXMLMigration().catch(console.error).finally(() => prisma.$disconnect());