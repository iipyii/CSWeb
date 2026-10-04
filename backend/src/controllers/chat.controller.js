import { prisma } from "../lib/prisma.js";
import { getLocalEmbedding } from "../services/embedding.service.js";
import Fuse from 'fuse.js';

const GEMINI_MODELS = [
  "gemini-3.6-flash",         // อันดับ 1: เร็ว แม่นยำ และรองรับล่าสุด
  "gemini-3.5-flash",         // อันดับ 2: สำรองคุณภาพสูง
  "gemini-flash-lite-latest", // อันดับ 3: สำรองเบาและเร็ว
  "gemini-flash-latest",      // อันดับ 4: fallback อัตโนมัติ
  "gemini-2.5-flash"          // อันดับ 5: fallback
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

    // 4.0 ตรวจสอบว่าผู้ใช้ถามวิธีการตรวจสอบ/ค้นหาอาจารย์ที่ปรึกษาหรือไม่
    if (
      message.includes("ตรวจสอบ") || 
      message.includes("ค้นหา") || 
      message.includes("หาอาจารย์") || 
      message.includes("ดูอาจารย์") ||
      (message.includes("อาจารย์ที่ปรึกษา") && (message.includes("อย่างไร") || message.includes("ยังไง") || message.includes("ที่ไหน") || message.includes("ฉันจะ")))
    ) {
      advisorContext += `[ขั้นตอนการตรวจสอบและค้นหาอาจารย์ที่ปรึกษา]
นักศึกษาสามารถตรวจสอบและค้นหาอาจารย์ที่ปรึกษาได้จาก 3 ช่องทางหลัก:
1. ระบบบริการการศึกษา มจพ. (Reg KMUTNB / KLogic: https://klogic.kmutnb.ac.th): เข้าสู่ระบบด้วยบัญชีผู้ใช้ของนักศึกษา ไปที่เมนู "ข้อมูลประวัตินักศึกษา" เพื่อดูชื่อและตำแหน่งอาจารย์ที่ปรึกษาประจำตัว
2. เว็บไซต์ภาควิชาฯ ในระบบบริการนักศึกษา: เข้าไปที่หน้า "บริการนักศึกษา" -> "อาจารย์ที่ปรึกษา" (หรือเมนู /consult-student) โดยสามารถระบุรหัสนักศึกษา หรือค้นหาตามชั้นปี/กลุ่มเรียน เพื่อดูรายชื่ออาจารย์และเพื่อนร่วมกลุ่มที่ปรึกษา
3. สำนักงานภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ: ติดต่อสอบถามได้โดยตรงที่ชั้น 6 อาคาร 78 หรือโทร. 02-555-2000 ต่อ 4601, 4602 ในวันและเวลาราชการ\n`;
    }

    // 4.1 ตรวจสอบว่าถามเกี่ยวกับอาจารย์คนไหนดูแลนักศึกษารุ่นใดบ้าง (เช่น รศ.ดร.ธนภัทร์)
    for (const t of allLecturers) {
      if (!t.fullname_th) continue;
      const cleanName = t.fullname_th.replace(/(รองศาสตราจารย์|ผู้ช่วยศาสตราจารย์|ศาสตราจารย์|ดร\.|อาจารย์|อ\.|นาย|นางสาว|นาง)\s*/g, '').trim();
      const firstName = cleanName.split(/\s+/)[0];
      if (firstName.length > 2 && message.includes(firstName)) {
        try {
          const advList = await prisma.advisors.findMany({
            where: { lecturerId: t.id },
            include: {
              advisor_students: {
                select: { id: true }
              }
            },
            orderBy: { year: 'asc' }
          });

          if (advList.length > 0) {
            const bachYears = [...new Set(advList.filter(a => a.level === 'bachelor').map(a => a.year))].sort((a,b) => a-b);
            const mastYears = [...new Set(advList.filter(a => a.level === 'master').map(a => a.year))].sort((a,b) => a-b);
            const bachCodes = bachYears.map(y => y.toString().substring(2)).join(', ');
            const mastCodes = mastYears.map(y => y.toString().substring(2)).join(', ');

            advisorContext += `[ข้อมูลการดูแลนักศึกษาของอาจารย์] ${t.fullname_th} เป็นอาจารย์ที่ปรึกษาดูแลนักศึกษาในรุ่น/ปีการศึกษาดังต่อไปนี้:
- ระดับปริญญาตรี (วท.บ. วิทยาการคอมพิวเตอร์): ดูแลนักศึกษารุ่นปีการศึกษา ${bachYears.join(', ')} (นักศึกษารหัส ${bachCodes}) รวมทั้งหมด ${advList.filter(a => a.level === 'bachelor').reduce((acc, a) => acc + a.advisor_students.length, 0)} คน
${mastYears.length > 0 ? `- ระดับบัณฑิตศึกษา (ปริญญาโท): ดูแลนักศึกษารุ่นปีการศึกษา ${mastYears.join(', ')} (นักศึกษารุ่นรหัส ${mastCodes})\n` : ''}\n`;
          }
        } catch (advErr) {
          console.warn("Could not query advisor cohort:", advErr.message);
        }
        break;
      }
    }

    // 4.2 ดักจับว่าผู้ใช้กำลังถามหารายชื่ออาจารย์ที่ปรึกษาของนักศึกษาเฉพาะบุคคลหรือไม่
    if (message.includes("ที่ปรึกษา")) {
      const allStudents = await prisma.students.findMany({
        select: { id: true, student_id: true, firstname: true, lastname: true }
      });
      allStudents.sort((a, b) => (b.firstname || "").length - (a.firstname || "").length);

      let matchedStudents = [];
      let longestMatchLength = 0;

      for (const st of allStudents) {
        let fname = st.firstname ? st.firstname.trim() : "";
        fname = fname.replace(/^(นาย|นางสาว|นาง|น\.ส\.|ด\.ช\.|ด\.ญ\.)\s*/g, '').trim();
        const lname = st.lastname ? st.lastname.trim() : "";
        const sid = st.student_id ? st.student_id.trim() : "";

        if (sid && message.includes(sid)) {
          matchedStudents = [st.id];
          break;
        }
        if (fname && lname && message.includes(fname) && message.includes(lname)) {
          matchedStudents = [st.id];
          break;
        }
        if (fname && fname.length > 2 && message.includes(fname)) {
          if (longestMatchLength === 0) longestMatchLength = fname.length;
          if (fname.length === longestMatchLength) {
            matchedStudents.push(st.id);
          }
        }
      }

      if (matchedStudents.length > 0) {
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
            advisorContext += `[ข้อมูลอาจารย์ที่ปรึกษา] นักศึกษาชื่อ ${st.firstname} ${st.lastname} (รหัสนักศึกษา: ${st.student_id}) มีอาจารย์ที่ปรึกษาคือ ${st.position_th || ''}${st.advisor_name} (ติดต่อ: อีเมล ${st.email || '-'}, โทร ${st.tel || '-'}) \n`;
          }
        }
      }
    }

    // 4. มัดรวม Context
    let contextText = "";
    if (advisorContext) {
      contextText += advisorContext + "\n";
    }

    // 🎯 4.3 ข้อมูลกลุ่มวิชาชีพ (Track) ของวิทยาการคอมพิวเตอร์
    if (
      message.includes("Track") || 
      message.includes("track") || 
      message.includes("กลุ่มวิชาชีพ") || 
      message.includes("แทร็ก") || 
      message.includes("แขนง") ||
      (message.includes("วิทยาการคอมพิวเตอร์") && message.includes("มีอะไรบ้าง"))
    ) {
      contextText += `[กลุ่มวิชาชีพ (Track) ของหลักสูตรวิทยาการคอมพิวเตอร์ (CS KMUTNB)]
หลักสูตรวิทยาการคอมพิวเตอร์มีกลุ่มวิชาชีพ (Track) 4 กลุ่มหลัก เพื่อให้นักศึกษาเลือกเรียนตามความสนใจและความเชี่ยวชาญ:
1. กลุ่ม Software Engineering & Cloud: เน้นการออกแบบและพัฒนาสถาปัตยกรรมซอฟต์แวร์ระดับองค์กร, คลาวด์คอมพิวติง, DevOps, คอนเทนเนอร์ (Docker / Kubernetes), การสร้าง CI/CD Pipelines และระบบซอฟต์แวร์สมัยใหม่
2. กลุ่ม Data Science & Artificial Intelligence (AI): เน้นการวิเคราะห์ข้อมูลขนาดใหญ่ (Big Data Analytics), การเรียนรู้ของเครื่อง (Machine Learning), โมเดล Deep Learning, การประมวลผลภาษาธรรมชาติ (NLP) และการพัฒนาโมเดลปัญญาประดิษฐ์
3. กลุ่ม Network & Cybersecurity: เน้นความมั่นคงปลอดภัยทางไซเบอร์ (Cybersecurity), การตรวจจับและป้องกันภัยคุกคาม, กฎหมายและความปลอดภัยไซเบอร์, ระบบเครือข่ายคอมพิวเตอร์ขั้นสูง และ Cloud Security
4. กลุ่ม IoT & Intelligent Systems: เน้นระบบสมองกลฝังตัว (Embedded Systems), ไมโครคอนโทรลเลอร์, สถาปัตยกรรมอุปกรณ์เชื่อมต่อ IoT, การประมวลผลที่ขอบเครือข่าย (Edge Computing) และระบบอัจฉริยะในงานอุตสาหกรรม\n\n`;
    }

    // 🎯 4.4 ข้อมูลหลักสูตรปรับปรุงปี 2569 (CS69)
    if (
      message.includes("2569") || 
      message.includes("CS69") || 
      message.includes("ปรับปรุงปี 2569") ||
      (message.includes("หลักสูตร") && message.includes("มีวิชาอะไรบ้าง"))
    ) {
      contextText += `[โครงสร้างและรายวิชาหลักสูตรวิทยาการคอมพิวเตอร์ หลักสูตรปรับปรุง พ.ศ. 2569 (CS69)]
หลักสูตร วท.บ. วิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2569) มีโครงสร้างและกลุ่มรายวิชาที่สำคัญดังนี้:
1. หมวดวิชาศึกษาทั่วไป (General Education): เช่น การอ่านอย่างมีกลยุทธ์ (080103030), กีฬาและนันทนาการ (บาสเกตบอล 080303501, แบดมินตัน 080303503), สังคมและชีวิต (ธุรกิจในชีวิตประจำวัน 080203907, กฎหมายในชีวิตประจำวัน 080203904, เศรษฐศาสตร์ในชีวิตประจำวัน 080203905), วิทยาศาสตร์ (อาหารในชีวิตประจำวัน 040433002, เคมีในชีวิตประจำวัน 040113005)
2. หมวดวิชาเฉพาะด้านบังคับ (Core / Required Courses): เช่น
   - การโปรแกรมคอมพิวเตอร์ 1 (040613201) และ การโปรแกรมคอมพิวเตอร์ 2 (040613212)
   - การโปรแกรมเชิงวัตถุ (040613204)
   - โครงสร้างข้อมูลและขั้นตอนวิธี (040613208 / 040613003)
   - คณิตศาสตร์สำหรับการคณนา (040613104) และ การคำนวณเชิงวิทยาการ (040613106)
   - สถิติสำหรับวิศวกรและนักวิทยาศาสตร์ (040503011)
   - ระบบฐานข้อมูล (040613301)
   - วิศวกรรมซอฟต์แวร์ (040613306)
   - เครือข่ายคอมพิวเตอร์ (040613502)
   - ปัญญาประดิษฐ์ (040613711)
   - คอมพิวเตอร์กราฟิกส์ (040613801)
   - การออกแบบวงจรดิจิทัล (040613181)
3. หมวดวิชาชีพตามกลุ่ม Track 4 กลุ่ม (Software Engineering & Cloud, Data Science & AI, Network & Cybersecurity, IoT & Intelligent Systems)\n\n`;
    }

    // 🎯 4.5 ข้อมูลวิชาบังคับก่อนและเนื้อหาเฉพาะเจาะจง (โครงสร้างข้อมูล & คลาวด์คอมพิวติงและเดฟออปส์)
    if (
      message.includes("โครงสร้างข้อมูล") || 
      message.includes("040613003") || 
      message.includes("040613208") ||
      (message.includes("ขั้นตอนวิธี") && message.includes("ผ่าน"))
    ) {
      contextText += `[รายวิชาและวิชาบังคับก่อน (Prerequisite)] วิชาโครงสร้างข้อมูลและขั้นตอนวิธี (Data Structures and Algorithms) รหัสวิชา 040613003 (หรือ 040613208 ในหลักสูตร 2569 / 040613205 ในหลักสูตร 2564) (3 หน่วยกิต):
- วิชาที่ต้องเรียนและสอบผ่านมาก่อน (Prerequisite): คือ วิชาการโปรแกรมคอมพิวเตอร์ (Computer Programming) ได้แก่ "040613212 การโปรแกรมคอมพิวเตอร์ 2" (หรือ "040613201 / 040613001 การโปรแกรมคอมพิวเตอร์ 1") นักศึกษาต้องสอบผ่านวิชาการโปรแกรมคอมพิวเตอร์นี้ก่อน จึงจะสามารถลงทะเบียนเรียนวิชาโครงสร้างข้อมูลและขั้นตอนวิธีได้\n\n`;
    }

    if (
      message.includes("040613011") || 
      (message.includes("คลาวด์") && (message.includes("เดฟออปส์") || message.includes("DevOps") || message.includes("เนื้อหา")))
    ) {
      contextText += `[รายวิชาและคำอธิบายเนื้อหา] วิชาคลาวด์คอมพิวติงและเดฟออปส์ (Cloud Computing and DevOps) รหัสวิชา 040613011 (3 หน่วยกิต, หมวดวิชาเลือก, กลุ่มวิชาชีพ Software Engineering & Cloud):
- เนื้อหาและคำอธิบายรายวิชา: ศึกษาเกี่ยวกับสถาปัตยกรรมคลาวด์คอมพิวติง (Cloud Architecture) ได้แก่ IaaS, PaaS, SaaS, การสร้างและจัดการคอนเทนเนอร์ด้วย Docker, การจัดระบบและบริหารคอนเทนเนอร์แบบออเคสเตรชันด้วย Kubernetes, การสร้างไปป์ไลน์ CI/CD (Continuous Integration / Continuous Deployment) เพื่อส่งมอบซอฟต์แวร์แบบอัตโนมัติ, การจัดการโครงสร้างพื้นฐานด้วยโค้ด (Infrastructure as Code - IaC) และระบบตรวจสอบ ติดตาม และบันทึกประวัติการทำงานของระบบบนคลาวด์ (Cloud Monitoring & Observability)\n\n`;
    }

    // 🎯 4.6 เปรียบเทียบการฝึกงานปกติ vs สหกิจศึกษา
    if (
      (message.includes("ฝึกงาน") && (message.includes("สหกิจ") || message.includes("ความแตกต่าง") || message.includes("ต่างกัน"))) ||
      (message.includes("สหกิจ") && message.includes("ฝึกงาน"))
    ) {
      contextText += `[เปรียบเทียบการฝึกงานปกติ กับ สหกิจศึกษา (Cooperative Education)]
ความแตกต่างระหว่างการฝึกงานปกติกับสหกิจศึกษา:
1. การฝึกงานปกติ (Summer Internship):
   - ระยะเวลา: ไม่น้อยกว่า 320 ชั่วโมง (ประมาณ 8 สัปดาห์) ในช่วงปิดภาคการศึกษาฤดูร้อน ระหว่างชั้นปีที่ 3 ขึ้นปีที่ 4
   - คุณสมบัติ: สอบผ่านรายวิชาตามเกณฑ์หลักสูตรกำหนด และมีหน่วยกิตสะสมไม่น้อยกว่า 90 หน่วยกิต
   - ลักษณะงาน: เรียนรู้งานและฝึกประสบการณ์วิชาชีพเบื้องต้นในองค์กรหรือบริษัท
2. สหกิจศึกษา (Cooperative Education):
   - ระยะเวลา: ปฏิบัติงานเต็มเวลาตลอด 1 ภาคการศึกษาเต็ม (อย่างน้อย 16 สัปดาห์ หรือ 4 เดือน) ในชั้นปีที่ 4
   - คุณสมบัติ: มีผลการเรียนดี (GPAX ไม่ต่ำกว่า 2.50 หรือตามเกณฑ์ของคณะ) และผ่านการคัดเลือก
   - ลักษณะงาน: ปฏิบัติงานเสมือนเป็นพนักงานจริง ทำโครงงานสหกิจศึกษาเพื่อแก้ปัญหาจริงให้สถานประกอบการ และเทียบโอนหน่วยกิตแทนการฝึกงานและวิชาเลือก\n\n`;
    }

    // 🎯 4.7 ข้อมูลทุนการศึกษา
    if (message.includes("ทุน") || message.includes("scholarship")) {
      contextText += `[ทุนการศึกษาสำหรับนักศึกษา CS]
ทุนการศึกษาสำหรับนักศึกษาภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ (CS KMUTNB) มีดังนี้:
1. ทุนการศึกษาขาดแคลนทุนทรัพย์: สนับสนุนค่าใช้จ่ายทางการศึกษาและค่าครองชีพ สำหรับนักศึกษาที่มีความประพฤติดีแต่ขาดแคลนทุนทรัพย์
2. ทุนรางวัลเรียนดีเด่น: สำหรับนักศึกษาที่มีผลการเรียนยอดเยี่ยม GPA สูงสุดในแต่ละชั้นปี
3. ทุนผู้ช่วยสอน (TA) และผู้ช่วยวิจัย (RA): สำหรับนักศึกษาช่วยงานในห้องปฏิบัติการคอมพิวเตอร์หรืองานวิจัยของคณาจารย์ในภาควิชา
4. ทุนสนับสนุนกิจกรรมและการแข่งขัน: สนับสนุนทีมนักศึกษาที่เป็นตัวแทนแข่งขันทักษะวิชาการ เช่น การแข่งขันเขียนโปรแกรม ICPC, การแข่งขันความมั่นคงปลอดภัยไซเบอร์ หรือการประกวดนวัตกรรมซอฟต์แวร์
5. ทุนการศึกษาจากองค์กรเอกชนและศิษย์เก่า: สนับสนุนโดยบริษัทพันธมิตรด้านไอทีและกองทุนศิษย์เก่า CS
- นักศึกษาสามารถติดตามประกาศรับสมัครและยื่นแบบคำขอรับทุนได้ที่ งานกิจการนักศึกษา คณะวิทยาศาสตร์ประยุกต์ หรือเมนูข่าวสารทุนการศึกษาบนเว็บไซต์ภาควิชา\n\n`;
    }

    // 🎯 4.8 ค้นหาข้อมูลในคู่มือนักศึกษา (student_handbooks)
    try {
      const handbooks = await prisma.student_handbooks.findMany({
        take: 10
      });
      const relevantHandbooks = handbooks.filter(h => {
        const text = `${h.category} ${h.topic} ${h.content}`.toLowerCase();
        const words = message.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
        return words.some(w => text.includes(w));
      });

      const handbooksToAdd = relevantHandbooks.length > 0 ? relevantHandbooks.slice(0, 4) : handbooks.slice(0, 2);
      handbooksToAdd.forEach(h => {
        contextText += `[คู่มือนักศึกษา/ระเบียบการ] หมวดหมู่: ${h.category} หัวข้อ: ${h.topic} รายละเอียด: ${h.content}\n`;
      });
    } catch (err) {
      console.warn("Could not query student_handbooks:", err.message);
    }

    // 🎯 4.9 ค้นหารายวิชาในตาราง subjects
    try {
      const extractedCodes = message.match(/\b\d{6,9}\b/g) || [];
      const cleanTerms = message
        .replace(/วิชา|หลักสูตร|ปรับปรุงปี|รหัส|กลุ่มวิชาชีพ|มีเนื้อหาเกี่ยวกับอะไร|ต้องผ่านวิชาอะไรมาก่อน|มีวิชาอะไรบ้าง/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(w => w.length >= 2);

      const orConditions = [];
      if (extractedCodes.length > 0) {
        extractedCodes.forEach(c => {
          orConditions.push({ subject_code: { contains: c } });
        });
      }
      cleanTerms.forEach(t => {
        orConditions.push({ title_th: { contains: t } });
        orConditions.push({ title_en: { contains: t, mode: "insensitive" } });
      });

      if (orConditions.length > 0) {
        const matchedSubjects = await prisma.subjects.findMany({
          where: { OR: orConditions },
          take: 8
        });

        matchedSubjects.forEach(s => {
          contextText += `[รายวิชาหลักสูตร ${s.curriculum_year}] รหัส: ${s.subject_code} ชื่อ: ${s.title_th} (${s.title_en}) หน่วยกิต: ${s.credit} วิชาบังคับก่อน: ${s.prereq1 || 'ไม่มี'} หมวดหมู่: ${s.category} กลุ่มวิชาชีพ (Track): ${s.track || 'ทั่วไป'} คำอธิบาย: ${s.description_th || '-'}\n`;
        });
      }
    } catch (err) {
      console.warn("Could not query subjects:", err.message);
    }

    // 🎯 4.5 ค้นหาข้อมูลการฝึกงานและสหกิจศึกษา (internships)
    try {
      if (message.includes("ฝึกงาน") || message.includes("สหกิจ") || message.includes("internship") || message.includes("coop")) {
        const internshipData = await prisma.internships.findMany({
          take: 10
        });
        internshipData.forEach(item => {
          contextText += `[ข้อมูลการฝึกงาน/สหกิจศึกษา] หัวข้อ: ${item.title} หมวดหมู่: ${item.category} รายละเอียด: ${item.content}\n`;
        });
      }
    } catch (err) {
      console.warn("Could not query internships:", err.message);
    }

    // 🎯 4.6 ค้นหาแบบฟอร์มและเอกสารดาวน์โหลด (downloads)
    try {
      if (message.includes("แบบฟอร์ม") || message.includes("ดาวน์โหลด") || message.includes("เอกสาร") || message.includes("ใบคำร้อง") || message.includes("คพ.") || message.includes("บ.") || message.includes("CSB")) {
        const downloadDocs = await prisma.downloads.findMany({
          where: {
            OR: [
              { title: { contains: message.trim(), mode: "insensitive" } },
              { file_name: { contains: message.trim(), mode: "insensitive" } },
              { category: { contains: message.trim(), mode: "insensitive" } }
            ]
          },
          take: 8
        });

        downloadDocs.forEach(d => {
          contextText += `[เอกสารดาวน์โหลด/แบบฟอร์ม] ชื่อเอกสาร: ${d.title} (สำหรับ: ${d.audience === 'staff' ? 'บุคลากร' : 'นักศึกษา'}) หมวดหมู่: ${d.category} ไฟล์: ${d.file_name} ลิงก์ดาวน์โหลด: /api/downloads/download/${d.id}\n`;
        });
      }
    } catch (err) {
      console.warn("Could not query downloads:", err.message);
    }

    // 🎯 4.7 ค้นหาโครงงานนักศึกษา (projects)
    try {
      if (message.includes("โครงงาน") || message.includes("โปรเจกต์") || message.includes("ปริญญานิพนธ์") || message.includes("project")) {
        const matchedProjects = await prisma.projects.findMany({
          where: {
            OR: [
              { title_th: { contains: message.trim(), mode: "insensitive" } },
              { title_en: { contains: message.trim(), mode: "insensitive" } },
              { students_text: { contains: message.trim(), mode: "insensitive" } }
            ]
          },
          include: {
            advisor: { select: { fullname_th: true } }
          },
          take: 6
        });

        matchedProjects.forEach(p => {
          contextText += `[โครงงานนักศึกษา] ชื่อเรื่อง: ${p.title_th} (${p.title_en || '-'}) ปีการศึกษา: ${p.year} ผู้จัดทำ: ${p.students_text || '-'} ที่ปรึกษา: ${p.advisor?.fullname_th || '-'} บทคัดย่อ: ${p.abstract ? p.abstract.substring(0, 150) + '...' : '-'}\n`;
        });
      }
    } catch (err) {
      console.warn("Could not query projects:", err.message);
    }

    // 🎯 4.8 ค้นหาข่าวสารและประกาศ (news)
    try {
      if (message.includes("ข่าว") || message.includes("ประกาศ") || message.includes("ทุน") || message.includes("กิจกรรม")) {
        const newsItems = await prisma.news.findMany({
          where: {
            OR: [
              { title: { contains: message.trim(), mode: "insensitive" } },
              { content: { contains: message.trim(), mode: "insensitive" } },
              { category: { contains: message.trim(), mode: "insensitive" } }
            ]
          },
          take: 5
        });

        newsItems.forEach(n => {
          contextText += `[ข่าวสาร/ประกาศ] หัวข้อ: ${n.title} หมวดหมู่: ${n.category} รายละเอียด: ${n.content ? n.content.substring(0, 150) + '...' : '-'}\n`;
        });
      }
    } catch (err) {
      console.warn("Could not query news:", err.message);
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

export const getChatSettings = async (req, res) => {
  try {
    const configs = await prisma.site_config.findMany({
      where: {
        config_key: {
          in: ["chatbot_welcome", "chatbot_fallback", "chatbot_active"]
        }
      }
    });

    const map = {};
    configs.forEach(c => { map[c.config_key] = c.config_value; });

    res.json({
      welcomeMessage: map.chatbot_welcome || "สวัสดีครับ! ผมคือ AI ผู้ช่วยประจำภาควิชา CIS มีอะไรให้ผมช่วยไหมครับ?",
      fallbackMessage: map.chatbot_fallback || "ขออภัยครับ ผมไม่พบข้อมูลในส่วนนี้ คุณสามารถติดต่อสอบถามเพิ่มเติมได้ที่สำนักงานภาควิชาครับ",
      isActive: map.chatbot_active !== "false"
    });
  } catch (error) {
    console.error("Get chat settings error:", error);
    res.status(500).json({ error: "Failed to get chat settings" });
  }
};

export const updateChatSettings = async (req, res) => {
  try {
    const { welcomeMessage, fallbackMessage, isActive } = req.body;

    const updates = [];
    if (welcomeMessage !== undefined) {
      updates.push(prisma.site_config.upsert({
        where: { config_key: "chatbot_welcome" },
        update: { config_value: welcomeMessage },
        create: { config_key: "chatbot_welcome", config_value: welcomeMessage }
      }));
    }
    if (fallbackMessage !== undefined) {
      updates.push(prisma.site_config.upsert({
        where: { config_key: "chatbot_fallback" },
        update: { config_value: fallbackMessage },
        create: { config_key: "chatbot_fallback", config_value: fallbackMessage }
      }));
    }
    if (isActive !== undefined) {
      updates.push(prisma.site_config.upsert({
        where: { config_key: "chatbot_active" },
        update: { config_value: String(isActive) },
        create: { config_key: "chatbot_active", config_value: String(isActive) }
      }));
    }

    await Promise.all(updates);
    res.json({ message: "บันทึกการตั้งค่า Chatbot สำเร็จ" });
  } catch (error) {
    console.error("Update chat settings error:", error);
    res.status(500).json({ error: "Failed to update chat settings" });
  }
};