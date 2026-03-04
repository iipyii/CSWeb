import { prisma } from "../lib/prisma.js";
import { getLocalEmbedding } from "../services/embedding.service.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Generate embedding
    const messageVector = await getLocalEmbedding(message);
    const vectorString = `[${messageVector.join(",")}]`;

    // Vector similarity search (pgvector)
    const faqResult = await prisma.$queryRaw`
      SELECT question,
             answer,
             embedding <-> ${vectorString}::vector AS distance
      FROM faq
      ORDER BY distance
      LIMIT 5
    `;

    // Filter by similarity threshold
    const filtered = faqResult.filter(row => row.distance < 0.8);

    let contextText = "";

    filtered.forEach((faq) => {
      contextText += `
Q: ${faq.question}
A: ${faq.answer}
`;
    });

    if (!contextText.trim()) {
      return res.json({
        reply: "ไม่พบข้อมูลที่เกี่ยวข้อง"
      });
    }

    const prompt = `
คุณคือผู้ช่วยของภาควิชาคอมพิวเตอร์และสารสนเทศ
ตอบโดยใช้เฉพาะข้อมูลด้านล่างเท่านั้น
ห้ามแต่งข้อมูลเพิ่มเอง
ถ้าไม่พบข้อมูลให้ตอบว่า "ไม่พบข้อมูลที่เกี่ยวข้อง"

ข้อมูล:
${contextText}

คำถาม:
${message}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!data.candidates) {
      return res.status(500).json({ error: data });
    }

    const reply = data.candidates[0].content.parts[0].text;

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI processing error" });
  }
};


// Rebuild FAQ embeddings
export const updateFaqVectors = async (req, res) => {
  try {
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

    res.json({ message: `อัปเดต Vector สำเร็จทั้งหมด ${count} รายการ!` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Vector update failed" });
  }
};