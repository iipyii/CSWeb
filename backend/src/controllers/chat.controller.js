import { prisma } from "../lib/prisma.js";
import { getLocalEmbedding } from "../services/embedding.service.js";
import Fuse from 'fuse.js';

const GEMINI_MODELS = [
  "gemini-2.5-flash",   // อันดับ 1: ลองก่อน
  // "gemini-1.5-flash",   // อันดับ 2: fallback ถ้าอันแรกยุ่ง
  // "gemini-1.5-flash-8b" // อันดับ 3: เบาที่สุด ใช้เป็น last resort
];

const isOverloadedError = (err) => {
  const msg = (err?.message || err?.status || "").toLowerCase();
  return (
    err?.code === 429 ||
    err?.code === 503 ||
    msg.includes("high demand") ||
    msg.includes("overloaded") ||
    msg.includes("quota exceeded") ||
    msg.includes("resource_exhausted") ||
    msg.includes("service unavailable") ||
    msg.includes("try again")
  );
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const callGemini = async (model, prompt) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      }),
    }
  );

  const data = await res.json();

  // Gemini ส่ง error object กลับมา
  if (data.error) {
    const err = new Error(data.error.message || "Gemini error");
    err.code = data.error.code;
    err.status = data.error.status;
    err.gemini = true;
    throw err;
  }

  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) throw new Error("empty_response");

  return reply;
};

// วนลอง models ทีละตัว พร้อม retry 2 ครั้งต่อ model
const callGeminiWithFallback = async (prompt) => {
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🤖 Trying ${model} (attempt ${attempt})`);
        const reply = await callGemini(model, prompt);
        console.log(`✅ Success with ${model}`);
        return reply;
      } catch (err) {
        console.warn(`⚠️  ${model} attempt ${attempt} failed:`, err.message);

        if (isOverloadedError(err)) {
          if (attempt < 2) {
            // รอ 3 วินาทีแล้ว retry ด้วย model เดิม
            console.log(`⏳ Waiting 3s before retry...`);
            await sleep(3000);
            continue;
          }
          // retry หมดแล้ว → ลอง model ถัดไป
          break;
        }

        // error ประเภทอื่น (เช่น API key ผิด) ไม่ต้อง retry
        throw err;
      }
    }
  }

  // ทุก model ล้มเหลว
  throw new Error("ALL_MODELS_OVERLOADED");
};

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
        CASE 
          WHEN LENGTH(title_th) > 3 AND ${message} LIKE '%' || title_th || '%' THEN 0 
          WHEN ${message} LIKE '%' || course_code || '%' THEN 0
          ELSE 1 
        END,
        distance ASC
      LIMIT 10
    `;

    // console.log("🔍 วิชาที่ดึงมาได้ (อัปเกรด Hybrid แล้ว):", courseResult.map(c => c.title_th));
    
    const allLecturers = await prisma.lecturers.findMany({
      select: { id: true, fullname_th: true }
    });

    let exactMatchId = -1;

    for (const t of allLecturers) {
      if (!t.fullname_th) continue;

      // ตัดยศและคำนำหน้าออกจากชื่อใน DB ให้เหลือแค่ชื่อเพียวๆ
      // เช่น "รองศาสตราจารย์ ดร.เฉียบวุฒิ รัตนวิไลสกุล" -> จะเหลือ "เฉียบวุฒิ รัตนวิไลสกุล"
      const cleanName = t.fullname_th.replace(/(รองศาสตราจารย์|ผู้ช่วยศาสตราจารย์|ศาสตราจารย์|ดร\.|อาจารย์|อ\.|นาย|นางสาว|นาง)\s*/g, '').trim();

      // ตัดเอานามสกุลออก ให้เหลือแค่ "คำแรก" (ชื่อจริง) -> จะได้ "เฉียบวุฒิ"
      const firstName = cleanName.split(/\s+/)[0];

      // เช็กว่าข้อความที่ผู้ใช้พิมพ์มา มีชื่อจริงคนนี้โผล่มาไหม?
      // เช่น พิมพ์ว่า "ขอเบอร์อาจารย์เฉียบวุฒิหน่อย" -> message.includes("เฉียบวุฒิ") จะเป็น TRUE ทันที!
      if (firstName.length > 2 && message.includes(firstName)) {
        exactMatchId = t.id;
        break; // เจอเป้าหมาย หยุดหา
      }
    }

    // 3.2 สั่ง Database ดึงข้อมูล (Hybrid Search)
    const teacherResult = await prisma.$queryRaw`
      SELECT id, fullname_th, position_th, email, education_th, tel,
             embedding <=> ${vectorString}::vector AS distance
      FROM lecturers
      WHERE embedding IS NOT NULL
      ORDER BY 
        CASE WHEN id = ${exactMatchId} THEN 0 ELSE 1 END,
        distance ASC
      LIMIT 3
    `;
    // 
    // 🎯 4. ค้นหาอาจารย์ที่ปรึกษาของนักศึกษา
    let advisorContext = "";

    // ดักจับว่าผู้ใช้กำลังถามหา "ที่ปรึกษา" อยู่หรือเปล่า?
    if (message.includes("ที่ปรึกษา")) {

      // 4.1 โหลดรายชื่อนักศึกษามาเพื่อทำ Smart Extraction (หาชื่อในประโยค)
      const allStudents = await prisma.students.findMany({
        select: { id: true, student_id: true, firstname: true, lastname: true }
      });

      // จัดเรียงชื่อนักศึกษาจาก "ยาวไปหาสั้น"
      allStudents.sort((a, b) => (b.firstname || "").length - (a.firstname || "").length);

      let matchedStudents = [];   // 🌟 เปลี่ยนเป็น Array เพื่อเก็บคนชื่อซ้ำได้หลายคน
      let longestMatchLength = 0; // 🌟 จำความยาวชื่อที่ยาวที่สุดที่หาเจอ

      for (const st of allStudents) {
        let fname = st.firstname ? st.firstname.trim() : "";
        fname = fname.replace(/^(นาย|นางสาว|นาง|น\.ส\.|ด\.ช\.|ด\.ญ\.)\s*/g, '').trim();
        
        const lname = st.lastname ? st.lastname.trim() : "";
        const sid = st.student_id ? st.student_id.trim() : "";

        // แบบที่ 1: พิมพ์รหัสนักศึกษามา (เป๊ะ 100% เจอคนเดียวแน่นอน)
        if (sid && message.includes(sid)) {
          matchedStudents = [st.id];
          break; // เจอด้วยรหัสปุ๊บ หยุดหาได้เลย
        }

        // แบบที่ 2: พิมพ์มาทั้ง "ชื่อ + นามสกุล" (เจอคนเดียวแน่นอน)
        if (fname && lname && message.includes(fname) && message.includes(lname)) {
          matchedStudents = [st.id];
          break; // เจอเต็มยศปุ๊บ หยุดหาได้เลย
        }

        // แบบที่ 3: พิมพ์แค่ "ชื่อจริง" (อาจจะมีชื่อซ้ำหลายคน!)
        if (fname && fname.length > 2 && message.includes(fname)) {
          // ถ้าเพิ่งเจอชื่อที่ตรงกัน "คนแรก" ให้จำความยาวชื่อนั้นไว้
          // (เพราะเราเรียงคนชื่อยาวไว้บนสุดแล้ว แปลว่านี่คือความยาวที่ถูกต้องที่สุด)
          if (longestMatchLength === 0) {
            longestMatchLength = fname.length;
          }
          
          // ตรวจสอบว่าคนที่เจอ มีความยาวชื่อเท่ากับตัวแรกไหม 
          // (เพื่ออนุญาตให้ "สมชาย" A และ "สมชาย" B เข้ามาได้ แต่เตะ "ปิยะ" ออกไปถ้าเรากำลังหา "ปิยะนันท์")
          if (fname.length === longestMatchLength) {
            matchedStudents.push(st.id); // ยัดใส่ Array ไว้ก่อน ยังไม่ break เผื่อมีชื่อซ้ำอีก
          }
        }
      }

      // 4.2 ถ้าสกัดหา ID นักศึกษาเจอ (อาจจะเจอหลายคนจาก Array)
      if (matchedStudents.length > 0) {
        // วนลูปดึงข้อมูลอาจารย์ของนักศึกษา "ทุกคน" ที่หาเจอ
        for (const sId of matchedStudents) {
          const studentInfo = await prisma.$queryRaw`
            SELECT 
                s.student_id, s.firstname, s.lastname, 
                l.fullname_th AS advisor_name, l.email, l.tel, l.position_th
            FROM students s
            JOIN advisor_students asu ON s.id = asu."studentId"
            JOIN advisors a ON a.id = asu."advisorId"
            JOIN lecturers l ON l.id = a."lecturerId"
            WHERE s.id = ${sId}
            LIMIT 1;
          `;

          if (studentInfo && studentInfo.length > 0) {
            const st = studentInfo[0];
            // 🌟 นำข้อมูลมาต่อๆ กัน (Append) ลงใน Context
            advisorContext += `[ข้อมูลอาจารย์ที่ปรึกษา] นักศึกษาชื่อ ${st.firstname} ${st.lastname} (รหัสนักศึกษา: ${st.student_id}) มีอาจารย์ที่ปรึกษาคือ ${st.position_th || ''}${st.advisor_name} (ติดต่อ: อีเมล ${st.email || '-'}, โทร ${st.tel || '-'}) \n`;
          }
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

    // 5. เตรียม Prompt
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
- ถ้าผู้ใช้ถามว่า "รู้อะไรบ้าง" หรือ "ช่วยอะไรได้บ้าง" ให้แนะนำความสามารถของตัวเองเป็น bullet point
- ถ้าผู้ใช้พิมพ์มาแค่ "ชื่ออาจารย์" หรือ "ชื่อวิชา" สั้นๆ ให้คุณดึงประวัติ/ข้อมูลของอาจารย์หรือวิชานั้นๆ มาสรุปแนะนำตัวให้ผู้ใช้อ่านได้เลย
- ถ้าพบข้อมูล ให้สรุปคำตอบให้เข้าใจง่าย (สามารถใช้ Bullet point ได้)
- ถ้าคำถามไม่เกี่ยวกับข้อมูลที่มีในอ้างอิง ให้ตอบว่า "ขออภัยครับ จากข้อมูลที่ผมมี ไม่พบข้อมูลในส่วนนี้ครับ..."
- ห้ามมโนหรือแต่งข้อมูลขึ้นมาเองเด็ดขาด

ข้อมูลอ้างอิง:
${contextText || "ไม่พบข้อมูลที่เกี่ยวข้องในฐานข้อมูล"}

คำถาม: "${message}"
`;

    // เรียก Gemini พร้อม retry + fallback
    let reply;
    try {
      reply = await callGeminiWithFallback(prompt);
    } catch (err) {
      console.error("🔴 Gemini all models failed:", err.message);
 
      // ข้อความตอบกลับที่เหมาะสมตามประเภท error
      if (err.message === "ALL_MODELS_OVERLOADED") {
        reply = "⏳ ขออภัย ขณะนี้ระบบ AI มีผู้ใช้งานจำนวนมาก กรุณารอสักครู่แล้วลองถามใหม่อีกครั้งครับ 🙏";
      } else if (err.message === "empty_response") {
        reply = "ขออภัยครับ AI ไม่สามารถสร้างคำตอบได้ในขณะนี้ กรุณาลองถามใหม่อีกครั้งครับ";
      } else {
        // log จริงๆ แต่ไม่โชว์ technical error ให้ user เห็น
        reply = "ขออภัยครับ เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง";
      }
    }
 
    res.json({ reply, references: courseResult });
 
  } catch (error) {
    console.error("💥 Chat Controller Error:", error);
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