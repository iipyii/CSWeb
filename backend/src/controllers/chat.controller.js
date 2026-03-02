import pool from "../config/db.js";
import { getLocalEmbedding } from "../services/embedding.service.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔎 ดึง FAQ ที่เกี่ยวข้อง
    const messageVector = await getLocalEmbedding(message);
    const vectorString = `[${messageVector.join(",")}]`;

    const faqResult = await pool.query(
      `
      SELECT question,
            answer,
            embedding <-> $1::vector AS distance
      FROM faq
      ORDER BY distance
      LIMIT 5
      `,
      [vectorString]
    );

    // กรองเฉพาะ distance < 0.8
    const filtered = faqResult.rows.filter(row => row.distance < 0.8);

    let contextText = "";

    faqResult.rows.forEach((faq) => {
      contextText += `
      Q: ${faq.question}
      A: ${faq.answer}
      `;
    });

    const prompt = `
คุณคือผู้ช่วยของภาควิชาคอมพิวเตอร์และสารสนเทศ
ให้ตอบจากข้อมูลด้านล่างเท่านั้น
ถ้าไม่มีข้อมูลให้ตอบว่า "ไม่พบข้อมูลที่เกี่ยวข้อง"

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
    res.status(500).json({ error: error.message });
  }
};

export const updateFaqVectors = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, question, answer FROM faq"
    );

    let count = 0;

    for (const row of result.rows) {
      console.log("==== เริ่มทำ ID:", row.id);

      const textToEmbed = `คำถาม: ${row.question} คำตอบ: ${row.answer}`;

      try {
        const vector = await getLocalEmbedding(textToEmbed);
        const vectorString = `[${vector.join(",")}]`;

        await pool.query(
          "UPDATE faq SET embedding = $1::vector WHERE id = $2",
          [vectorString, row.id]
        );

        count++;

      } catch (err) {
        console.error("❌ Error ID", row.id, ":", err.message);
      }
    }

    res.json({ message: `อัปเดต Vector สำเร็จทั้งหมด ${count} รายการ!` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};