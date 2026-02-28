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

// เพิ่มฟังก์ชันสำหรับขอ Vector จาก Google
async function getEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/text-embedding-004",
      content: { parts: [{ text: text }] }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.embedding.values; // คืนค่าเป็น Array ตัวเลข
}

// 📌 สร้าง Controller สำหรับกด update vector
export const updateFaqVectors = async (req, res) => {
  try {
    // 1. ดึง FAQ ทั้งหมดที่ยังไม่มี Vector
    const result = await pool.query("SELECT id, question, answer FROM faq");

    let count = 0;

    // 2. วนลูปสร้าง Vector ทีละข้อ
    for (const row of result.rows) {
      console.log("==== เริ่มทำ ID:", row.id);

      const textToEmbed = `คำถาม: ${row.question} คำตอบ: ${row.answer}`;

      try {
        console.log("กำลังขอ embedding...");
        const vector = await getEmbedding(textToEmbed);

        console.log("Vector length:", vector.length);

        const vectorString = `[${vector.join(",")}]`;

        console.log("กำลัง UPDATE DB...");

        const updateResult = await pool.query(
          "UPDATE faq SET embedding = $1::vector WHERE id = $2",
          [vectorString, row.id]
        );

        console.log("Update rowCount:", updateResult.rowCount);

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