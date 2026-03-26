import { prisma } from "../lib/prisma.js";
import { getLocalEmbedding } from "../services/embedding.service.js";
import Fuse from 'fuse.js';

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
      ORDER BY distance ASC
      LIMIT 3
    `;

    // 3. 🎯 เปลี่ยนมาค้นหาใน CourseKnowledge ด้วย Vector (ฉลาดกว่าแบบเดิม 100 เท่า!)
    const courseResult = await prisma.$queryRaw`
      SELECT course_code, title_th, content,
             embedding <=> ${vectorString}::vector AS distance
      FROM "CourseKnowledge"
      ORDER BY 
        -- ล็อกเป้า! ถ้า "ชื่อวิชา" หรือ "รหัสวิชา" ไปซ่อนอยู่ในประโยคที่คนพิมพ์มา ให้เด้งขึ้นอันดับ 1 ทันที
        CASE 
          WHEN LENGTH(title_th) > 3 AND ${message} LIKE '%' || title_th || '%' THEN 0 
          WHEN ${message} LIKE '%' || course_code || '%' THEN 0
          ELSE 1 
        END,
        distance ASC
      LIMIT 10
    `;

    console.log("🔍 วิชาที่ดึงมาได้ (อัปเกรด Hybrid แล้ว):", courseResult.map(c => c.title_th));
    const allLecturers = await prisma.lecturers.findMany({
      select: { id: true, fullname_th: true }
    });

    let exactMatchId = -1; // ตัวแปรเก็บ ID อาจารย์ถ้าหาเจอ

    for (const t of allLecturers) {
      if (!t.fullname_th) continue;

      // ตัดยศและคำนำหน้าออกจากชื่อใน DB ให้เหลือแค่ชื่อเพียวๆ
      // เช่น "รองศาสตราจารย์ ดร.เฉียบวุฒิ รัตนวิไลสกุล" -> จะเหลือ "เฉียบวุฒิ รัตนวิไลสกุล"
      let cleanName = t.fullname_th.replace(/(รองศาสตราจารย์|ผู้ช่วยศาสตราจารย์|ศาสตราจารย์|ดร\.|อาจารย์|อ\.|นาย|นางสาว|นาง)\s*/g, '').trim();

      // ตัดเอานามสกุลออก ให้เหลือแค่ "คำแรก" (ชื่อจริง) -> จะได้ "เฉียบวุฒิ"
      let firstName = cleanName.split(/\s+/)[0];

      // เช็กว่าข้อความที่ผู้ใช้พิมพ์มา มีชื่อจริงคนนี้โผล่มาไหม?
      // เช่น พิมพ์ว่า "ขอเบอร์อาจารย์เฉียบวุฒิหน่อย" -> message.includes("เฉียบวุฒิ") จะเป็น TRUE ทันที!
      if (firstName.length > 2 && message.includes(firstName)) {
        exactMatchId = t.id;
        break; // เจอเป้าหมายแล้ว หยุดหาเลย
      }
    }

    // 3.2 สั่ง Database ดึงข้อมูล (Hybrid Search)
    const teacherResult = await prisma.$queryRaw`
      SELECT id, fullname_th, position_th, email, education_th, tel,
             embedding <=> ${vectorString}::vector AS distance
      FROM lecturers
      WHERE embedding IS NOT NULL
      ORDER BY 
        -- ถ้ารหัสตรงกับคนที่จับชื่อได้ ให้เด้งขึ้นอันดับ 1 ทันที! (ต่อให้พิมพ์นามสกุลผิดก็หาเจอ)
        CASE WHEN id = ${exactMatchId} THEN 0 ELSE 1 END,
        distance ASC
      LIMIT 3
    `;
    // 🎯 4. ฟีเจอร์พิเศษ: ค้นหาอาจารย์ที่ปรึกษาของนักศึกษา
    // 🎯 4. ฟีเจอร์พิเศษ: ค้นหาอาจารย์ที่ปรึกษาของนักศึกษา (อัปเกรดความฉลาดขั้นสุด!)
    let advisorContext = "";

    // ดักจับว่าผู้ใช้กำลังถามหา "ที่ปรึกษา" อยู่หรือเปล่า?
    if (message.includes("ที่ปรึกษา")) {

      // 4.1 โหลดรายชื่อนักศึกษามาเพื่อทำ Smart Extraction (หาชื่อในประโยค)
      const allStudents = await prisma.students.findMany({
        select: { id: true, student_id: true, firstname: true, lastname: true }
      });

      let targetStudentId = null;

      for (const st of allStudents) {
        // ตัดช่องว่างหน้า-หลังทิ้ง เพื่อป้องกัน Database เก็บค่ามาเพี้ยน
        const fname = st.firstname ? st.firstname.trim() : "";
        const lname = st.lastname ? st.lastname.trim() : "";
        const sid = st.student_id ? st.student_id.trim() : "";

        // 🌟 เช็กแบบที่ 1: พิมพ์รหัสนักศึกษามาไหม? (แม่นยำ 100%)
        if (sid && message.includes(sid)) {
          targetStudentId = st.id;
          break;
        }

        // 🌟 เช็กแบบที่ 2: พิมพ์มาทั้ง "ชื่อ + นามสกุล" ไหม? (แม่นยำ 100%)
        if (fname && lname && message.includes(fname) && message.includes(lname)) {
          targetStudentId = st.id;
          break;
        }

        // 🌟 เช็กแบบที่ 3: พิมพ์แค่ "ชื่อจริง" ไหม? (เช็กเฉพาะชื่อที่ยาวเกิน 2 ตัวอักษร ป้องกันคำซ้ำ)
        if (fname && fname.length > 2 && message.includes(fname)) {
          targetStudentId = st.id;
          // ไม่ใส่ break เผื่อลูปถัดไปเจอคนที่พิมพ์ทั้งชื่อและนามสกุลตรงกว่า
        }
      }

      // 4.2 ถ้าสกัดหา ID นักศึกษาเจอแล้ว ค่อยให้ Database ดึงชื่ออาจารย์ออกมา!
      if (targetStudentId) {
        const studentInfo = await prisma.$queryRaw`
                SELECT 
                    s.student_id, s.firstname, s.lastname, 
                    l.fullname_th AS advisor_name, l.email, l.tel, l.position_th
                FROM students s
                JOIN advisor_students asu ON s.id = asu."studentId"
                JOIN advisors a ON a.id = asu."advisorId"
                JOIN lecturers l ON l.id = a."lecturerId"
                WHERE s.id = ${targetStudentId}
                LIMIT 1;
            `;

        if (studentInfo && studentInfo.length > 0) {
          const st = studentInfo[0];
          advisorContext = `[ข้อมูลอาจารย์ที่ปรึกษา] นักศึกษาชื่อ ${st.firstname} ${st.lastname} (รหัสนักศึกษา: ${st.student_id}) มีอาจารย์ที่ปรึกษาคือ ${st.position_th || ''}${st.advisor_name} (ช่องทางติดต่อ: อีเมล ${st.email || '-'}, โทร ${st.tel || '-'}) \n`;
        }
      }
    }
    // 4. มัดรวม Context
    let contextText = "";

    // ใส่ข้อมูลจาก FAQ (คัดเฉพาะอันที่ระยะห่างน้อยกว่า 0.8 ถือว่าใกล้เคียง)
    // faqResult.filter(row => row.distance < 0.8).forEach((faq) => {
    //   contextText += `[FAQ] คำถาม: ${faq.question} | คำตอบ: ${faq.answer}\n`;
    // });

    // // 🎯 ใส่ข้อมูลจาก รายวิชา (คัดเฉพาะอันที่ความหมายใกล้เคียง)
    // courseResult.filter(row => row.distance < 0.8).forEach((course) => {
    //   contextText += `[รายวิชา] เนื้อหา: ${course.content}\n`;
    // });

    // // 🎯 ใส่อาจารย์
    // teacherResult.filter(row => row.distance < 0.8).forEach((teacher) => {
    //   contextText += `[ข้อมูลบุคลากร] ชื่อ: ${teacher.fullname_th}, ตำแหน่ง: ${teacher.position_th}, การศึกษา: ${teacher.education_th}, ติดต่อ: อีเมล ${teacher.email || '-'}, โทร ${teacher.tel || '-'}\n`;
    // });
    if (advisorContext) {
      contextText += advisorContext + "\n";
    }

    faqResult.forEach((faq) => {
      contextText += `[FAQ] คำถาม: ${faq.question} | คำตอบ: ${faq.answer}\n`;
    });

    // 🎯 ใส่รายวิชา (เอา .filter ออก)
    if (courseResult && courseResult.length > 0) {
      courseResult.forEach((course) => {
        contextText += `[รายวิชา] รหัส: ${course.course_code} ชื่อ: ${course.title_th} เนื้อหา: ${course.content}\n`;
      });
    }

    // 🎯 ใส่อาจารย์ (เอา .filter ออก)
    teacherResult.forEach((teacher) => {
      contextText += `[ข้อมูลบุคลากร/อาจารย์] ชื่อ: ${teacher.fullname_th}, ตำแหน่ง: ${teacher.position_th || 'ไม่ระบุ'}, การศึกษา: ${teacher.education_th || 'ไม่ระบุ'}, ติดต่อ: อีเมล ${teacher.email || '-'}, โทร ${teacher.tel || '-'}\n`;
    });

    // 5. เตรียม Prompt แบบรัดกุม
    const prompt = `
คุณคือ "CS-AI Assistant" ผู้ช่วยอัจฉริยะของภาควิชาคอมพิวเตอร์และสารสนเทศ มจพ. (KMUTNB)
จงตอบคำถามอย่างสุภาพ เป็นมิตร และอ่านง่าย โดยใช้ข้อมูลอ้างอิงที่ให้มาเท่านั้น 

[ข้อมูลพื้นฐานของภาควิชา (ใช้ข้อมูลส่วนนี้ตอบคำถามเกี่ยวกับการติดต่อได้ทันที)]
- ชื่อหน่วยงาน: ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ (CS) คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (KMUTNB)
- ที่อยู่: 1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800 (ชั้น 6 ตึก 78 คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ  )
- เบอร์โทรศัพท์: 02-555-2000 ต่อ 4601, 4602 (ติดต่อได้ในเวลาราชการ)
- เวลาทำการ: วันจันทร์ - ศุกร์ เวลา 08:30 - 16:30 น.
- ช่องทางติดตามข่าวสาร: Facebook เพจ "CIS KMUTNB"

กฎการตอบ:
- ถ้าผู้ใช้พิมพ์มาแค่ "ชื่ออาจารย์" หรือ "ชื่อวิชา" สั้นๆ ให้คุณดึงประวัติ/ข้อมูลของอาจารย์หรือวิชานั้นๆ มาสรุปแนะนำตัวให้ผู้ใช้อ่านได้เลย
- ถ้าพบข้อมูล ให้สรุปคำตอบให้เข้าใจง่าย (สามารถใช้ Bullet point ได้)
- ถ้าคำถามไม่เกี่ยวกับข้อมูลที่มีในอ้างอิง ให้ตอบว่า "ขออภัยครับ จากข้อมูลที่ผมมี ไม่พบข้อมูลในส่วนนี้ครับ..."
- ห้ามมโนหรือแต่งข้อมูลขึ้นมาเองเด็ดขาด

ข้อมูลอ้างอิง (FAQ, รายวิชา, ข้อมูลอาจารย์):
${contextText || "ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล"}

คำถาม: "${message}"
`;

    // 6. ส่งหา Gemini API (ใช้รุ่นล่าสุด gemini-2.5-flash)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      }
    );

    const data = await response.json();

    // 🚨 ดักจับ Error จาก Google
    if (data.error) {
      // เช็กว่าเป็น Error โควต้าเต็ม/ยิงรัวเกินไป (Rate Limit - Code 429) ใช่หรือไม่
      if (data.error.code === 429 || data.error.message.includes("Quota exceeded")) {
        return res.json({
          reply: "⏳ ตอนนี้ระบบกำลังประมวลผลคำถามจำนวนมาก (ติดข้อจำกัด API ชั่วคราว) รบกวนรอประมาณ 10 วินาทีแล้วลองถามใหม่อีกครั้งนะครับ 🙏"
        });
      }

      // ถ้าเป็น Error อื่นๆ
      return res.json({ reply: `เกิดข้อผิดพลาดจากระบบ AI: ${data.error.message}` });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "AI ไม่สามารถตอบได้ในขณะนี้";
    // ส่งคำตอบกลับไปที่หน้าเว็บ (แอบแนบอ้างอิงกลับไปด้วยเผื่อ Frontend อยากใช้)
    res.json({ reply, references: courseResult });

  } catch (error) {
    console.error("💥 Chat Error:", error);
    res.status(500).json({ error: "AI processing error" });
  }
};

// 👉 ฟังก์ชันสำหรับอัปเดต FAQ Vector (ใช้ของเดิมได้เลยครับ)
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