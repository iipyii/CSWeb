import { GoogleGenerativeAI } from "@google/generative-ai";
import pool from "../config/db.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // 🧠 เรียก Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    คุณคือผู้ช่วยของภาควิชาคอมพิวเตอร์และสารสนเทศ
    ให้ตอบจากข้อมูลด้านล่างเท่านั้น
    ถ้าไม่มีข้อมูลให้ตอบว่า "ไม่พบข้อมูลที่เกี่ยวข้อง"

    ข้อมูล:
    ${contextText}

    คำถาม:
    ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};