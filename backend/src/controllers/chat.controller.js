import pool from "../config/db.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // 🔎 ดึง FAQ ที่เกี่ยวข้อง
    const faqResult = await pool.query(
      `
      SELECT question, answer 
      FROM faq 
      WHERE status='active'
      AND question ILIKE $1
      LIMIT 5
      `,
      [`%${message}%`]
    );

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

    // 🔥 เรียก Gemini ผ่าน REST
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