import { prisma } from "../lib/prisma.js";
import { getLocalEmbedding } from "../services/embedding.service.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 1. สร้าง Vector จากคำถามของผู้ใช้
    const messageVector = await getLocalEmbedding(message);
    const vectorString = `[${messageVector.join(",")}]`;

    // 2. ค้นหาใน FAQ (ใช้ pgvector)
    const faqResult = await prisma.$queryRaw`
      SELECT question, answer, 
             embedding <-> ${vectorString}::vector AS distance
      FROM faq
      ORDER BY distance LIMIT 3
    `;

    // 3. ค้นหาใน Program Sections (คำอธิบายรายวิชา)
    // หมายเหตุ: ถ้าตาราง program_sections ยังไม่มีคอลัมน์ embedding 
    // ให้ใช้การค้นหาแบบ LIKE (contains) ไปก่อนครับ เพื่อให้โชว์อาจารย์ได้ทันที
    const courseResult = await prisma.program_sections.findMany({
        where: {
            content: { contains: message.substring(0, 10) } 
        },
        take: 3
    });

    // 4. มัดรวม Context
    let contextText = "";

    // ใส่ข้อมูลจาก FAQ
    faqResult.filter(row => row.distance < 0.8).forEach((faq) => {
      contextText += `[FAQ] คำถาม: ${faq.question} | คำตอบ: ${faq.answer}\n`;
    });

    // ใส่ข้อมูลจาก รายวิชา
    courseResult.forEach((course) => {
      contextText += `[หลักสูตร/วิชา] เนื้อหา: ${course.content}\n`;
    });

    // 5. เตรียม Prompt (ใช้ gemini-1.5-flash จะประหยัดและเร็วกว่าครับ)
    const prompt = `
คุณคือ "CS-AI Assistant" ผู้ช่วยอัจฉริยะของภาควิชาคอมพิวเตอร์และสารสนเทศ มจพ. (KMUTNB)
จงตอบคำถามอย่างสุภาพ โดยใช้ข้อมูลอ้างอิงที่ให้มาเท่านั้น 

กฎการตอบ:
- ถ้าพบข้อมูลในข้อมูลอ้างอิง ให้สรุปคำตอบให้เข้าใจง่าย
- ถ้าไม่พบข้อมูลให้ตอบว่า "ขออภัยครับ ผมยังไม่มีข้อมูลในส่วนนี้ คุณสามารถติดต่อสอบถามเพิ่มเติมได้ที่สำนักงานภาควิชาครับ"
- ห้ามแต่งข้อมูลขึ้นมาเองเด็ดขาด

ข้อมูลอ้างอิง:
${contextText || "ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล"}

คำถาม: ${message}
`;

    // 6. ส่งหา Gemini API (ปรับ URL ให้เป็นรุ่นล่าสุด)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI ไม่สามารถตอบได้ในขณะนี้";

    res.json({ reply });

  } catch (error) {
    console.error("💥 Chat Error:", error);
    res.status(500).json({ error: "AI processing error" });
  }
};

// ... โค้ด chatWithAI เดิมของคุณ ...

// 👉 อย่าลืมเติม export นำหน้าฟังก์ชันนี้ครับ
export const updateFaqVectors = async (req, res) => {
  try {
    console.log("⏳ เริ่มต้นอัปเดต Vector สำหรับ FAQ...");
    const faqs = await prisma.faq.findMany({
      select: {
        id: true,
        question: true,
        answer: true
      }
    });

    let count = 0;
    for (const row of faqs) {
      const textToEmbed = `คำถาม: ${row.question} คำตอบ: ${row.answer}`;
      const vector = await getLocalEmbedding(textToEmbed);
      const vectorString = `[${vector.join(",")}]`;

      await prisma.$executeRaw`
        UPDATE faq
        SET embedding = ${vectorString}::vector
        WHERE id = ${row.id}
      `;
      count++;
    }

    console.log(`✅ อัปเดตสำเร็จทั้งหมด ${count} รายการ`);
    res.json({ message: `อัปเดต Vector สำเร็จทั้งหมด ${count} รายการ!` });

  } catch (error) {
    console.error("💥 Vector Update Error:", error);
    res.status(500).json({ error: "Vector update failed", details: error.message });
  }
};