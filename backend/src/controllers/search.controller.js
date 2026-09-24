import { prisma } from "../lib/prisma.js";

// รายการเมนูและหน้าเว็บทั้งหมดของระบบ (Site Navigation & Pages)
const SITE_MENUS = [
  { title: "หน้าหลัก", title_en: "Home", url: "/", category: "หน้าหลัก", keywords: "home main หน้าแรก cis kmutnb" },
  { title: "ประวัติภาควิชาฯ", title_en: "Department History", url: "/history", category: "แนะนำภาควิชา", keywords: "ประวัติ history ความเป็นมา ก่อตั้ง 2530 2536 ประวัติความเป็นมา" },
  { title: "โครงสร้างการบริหาร", title_en: "Organization Structure", url: "/organization", category: "แนะนำภาควิชา", keywords: "โครงสร้าง องค์กร organization ผู้บริหาร หัวหน้าภาค รองหัวหน้า กรรมการบริหาร" },
  { title: "ติดต่อภาควิชาฯ", title_en: "Contact Us", url: "/contact", category: "แนะนำภาควิชา", keywords: "ติดต่อ contact ที่อยู่ เบอร์โทร โทรศัพท์ แผนที่ map facebook email ติดต่อเรา" },
  
  { title: "บุคลากรสายวิชาการ (อาจารย์)", title_en: "Academic Personnel (Lecturers)", url: "/administrator", category: "บุคลากร", keywords: "อาจารย์ บุคลากร สายวิชาการ lecturers professor teacher ผู้สอน คณาจารย์" },
  { title: "บุคลากรสายสนับสนุน (เจ้าหน้าที่)", title_en: "Supporting Staff", url: "/staff", category: "บุคลากร", keywords: "เจ้าหน้าที่ บุคลากร สายสนับสนุน staff officer นักวิทยาศาสตร์ ธุรการ" },
  { title: "ดาวน์โหลดเอกสารสำหรับบุคลากร", title_en: "Staff Downloads", url: "/staff-download", category: "บุคลากร", keywords: "ดาวน์โหลด download เอกสาร staff ฟอร์ม ใบคำร้อง บุคลากร แบบฟอร์ม" },
  { title: "ลิงก์สำหรับบุคลากร", title_en: "Personnel Links", url: "/personnel-links", category: "บุคลากร", keywords: "ลิงก์ link ระบบสารสนเทศ บุคลากร intranet azure office365" },
  
  { title: "หลักสูตรระดับปริญญาตรี (ภาคปกติ)", title_en: "Bachelor Degree (Regular)", url: "/course-sections/bachelor", category: "หลักสูตร", keywords: "หลักสูตร ปริญญาตรี ป.ตรี bachelor curriculum cs64 cs69 cs59 วิทยาการคอมพิวเตอร์" },
  { title: "หลักสูตรระดับปริญญาตรี (โครงการพิเศษ/สองภาษา)", title_en: "Bachelor Degree (English Program)", url: "/course-sections/cs-english", category: "หลักสูตร", keywords: "สองภาษา english inter พิเศษ cs-inter ปริญญาตรี english program" },
  { title: "หลักสูตรระดับปริญญาโท (วิทยาการคอมพิวเตอร์)", title_en: "Master Degree (Computer Science)", url: "/course-sections/cs-master", category: "หลักสูตร", keywords: "ปริญญาโท ป.โท master cs ms-cs วิทยาการคอมพิวเตอร์" },
  { title: "หลักสูตรระดับปริญญาโท (วิศวกรรมซอฟต์แวร์)", title_en: "Master Degree (Software Engineering)", url: "/course-sections/se-master", category: "หลักสูตร", keywords: "วิศวกรรมซอฟต์แวร์ software engineering ปริญญาโท se ms-se" },
  { title: "หลักสูตรระดับปริญญาเอก", title_en: "Doctoral Degree (Ph.D.)", url: "/course-sections/doctor", category: "หลักสูตร", keywords: "ปริญญาเอก ป.เอก phd doctor ดุษฎีบัณฑิต" },
  { title: "คำอธิบายรายวิชา (Course Description)", title_en: "Course Description", url: "/course-description", category: "หลักสูตร", keywords: "คำอธิบายรายวิชา course description วิชา subject syllabus รายวิชา" },
  
  { title: "โครงงานนักศึกษา (Student Projects)", title_en: "Student Projects", url: "/student-projects", category: "นักศึกษา", keywords: "โครงงานนักศึกษา โครงงาน ปริญญานิพนธ์ โปรเจกต์ project student projects วิทยานิพนธ์ senior project ผู้จัดทำ" },
  { title: "ดาวน์โหลดเอกสารสำหรับนักศึกษา", title_en: "Student Downloads", url: "/student-downloads", category: "นักศึกษา", keywords: "ดาวน์โหลด download เอกสาร student แบบฟอร์ม ใบคำร้อง นักศึกษา" },
  { title: "อาจารย์ที่ปรึกษา / ค้นหารายชื่อนักศึกษาในที่ปรึกษา", title_en: "Advisors & Consult Students", url: "/consult-student", category: "นักศึกษา", keywords: "ที่ปรึกษา อาจารย์ที่ปรึกษา advisor consult นักศึกษาในที่ปรึกษา รายชื่อนักศึกษา" },
  { title: "การฝึกงานและสหกิจศึกษา", title_en: "Internship & Co-op", url: "/internship", category: "นักศึกษา", keywords: "ฝึกงาน internship สหกิจ coop ฝึกงานสหกิจ สถานประกอบการ" },
  { title: "ปฏิทินการศึกษา", title_en: "Academic Calendar", url: "https://acdserv.kmutnb.ac.th/academic-calendar", isExternal: true, category: "นักศึกษา", keywords: "ปฏิทินการศึกษา calendar กำหนดการ ลงทะเบียน สอบ เปิดเทอม" },
  { title: "ขบวนวิชาและแผนการเรียน", title_en: "Subject Courses & Study Plan", url: "/subject-courses", category: "นักศึกษา", keywords: "ขบวนวิชา แผนการเรียน course map study plan วิชา ผังวิชา" },
  { title: "คู่มือนักศึกษา", title_en: "Student Handbook", url: "/student-guide", category: "นักศึกษา", keywords: "คู่มือนักศึกษา handbook guide กฎระเบียบ ข้อบังคับ นักศึกษาใหม่" },
  { title: "ลิงก์สำหรับนักศึกษา", title_en: "Student Links", url: "/student-links", category: "นักศึกษา", keywords: "ลิงก์ student links portal reg klogic ict e-learning" },
  
  { title: "ข่าวสารและกิจกรรม", title_en: "News & Events", url: "/news", category: "ข่าวสาร", keywords: "ข่าว news ประชาสัมพันธ์ ประกาศ กิจกรรม ทุนการศึกษา รับสมัครงาน ข่าวสาร" },
  { title: "ข่าวภาควิชาฯ", title_en: "Department News", url: "/news?tab=ข่าวภาควิชาฯ", category: "ข่าวสาร", keywords: "ข่าวภาควิชา กิจกรรมภาควิชา" },
  { title: "ข่าวทุนการศึกษา", title_en: "Scholarship News", url: "/news?tab=ข่าวทุนการศึกษา", category: "ข่าวสาร", keywords: "ข่าวทุน ทุนการศึกษา" },
  
  { title: "ระเบียบและประกาศงานการเงิน", title_en: "Finance Regulations", url: "/finance-regulations", category: "ระเบียบ/ประกาศ", keywords: "การเงิน finance ค่าธรรมเนียม เบิกจ่าย ระเบียบ ประกาศ" },
  { title: "ระเบียบและประกาศงานวิชาการ", title_en: "Academic Regulations", url: "/academic-regulations", category: "ระเบียบ/ประกาศ", keywords: "วิชาการ academic ระเบียบ ประกาศ เกณฑ์ ผลการเรียน" },
  { title: "ระเบียบและประกาศงานบุคคล", title_en: "Personnel Regulations", url: "/personnel-regulations", category: "ระเบียบ/ประกาศ", keywords: "บุคคล personnel ระเบียบ ประกาศ" },
  { title: "ระเบียบและประกาศระดับบัณฑิตศึกษา", title_en: "Graduate Regulations", url: "/graduate-regulations", category: "ระเบียบ/ประกาศ", keywords: "บัณฑิตศึกษา graduate ป.โท ป.เอก ระเบียบ" },
  { title: "ระเบียบและประกาศงานกิจการนักศึกษา", title_en: "Student Affairs Regulations", url: "/student-affairs-regulations", category: "ระเบียบ/ประกาศ", keywords: "กิจการนักศึกษา student affairs ระเบียบ ประกาศ วินัย" },
  { title: "ระเบียบและประกาศสหกิจศึกษา", title_en: "Co-op Regulations", url: "/coop-regulations", category: "ระเบียบ/ประกาศ", keywords: "สหกิจศึกษา coop ระเบียบ ประกาศ" },
  { title: "ระเบียบและประกาศงานทุนการศึกษา", title_en: "Scholarship Regulations", url: "/scholarship-regulations", category: "ระเบียบ/ประกาศ", keywords: "ทุนการศึกษา scholarship ระเบียบ ประกาศ ทุน" },
  
  { title: "สำนักงานสีเขียว (CS Green Office)", title_en: "CS Green Office", url: "/green-office", category: "Green Office", keywords: "green office สำนักงานสีเขียว สิ่งแวดล้อม พลังงาน ขยะ คาร์บอน ขยะอิเล็กทรอนิกส์" },
  { title: "คำถามที่พบบ่อย (FAQ)", title_en: "Frequently Asked Questions (FAQ)", url: "/faq", category: "FAQ", keywords: "faq คำถามที่พบบ่อย ถามตอบ ข้อสงสัย ติดต่อสอบถาม ข้อข้องใจ" }
];

export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.json({ menus: [], projects: [], news: [], lecturers: [], courses: [], downloads: [] });
        }

        const keyword = String(q).trim().toLowerCase();
        console.log(`🔍 ค้นหาแบบ Global Search ด้วยคำว่า: "${keyword}"`);

        // 1. ค้นหาเมนูหน้าเว็บ (Navigation Menus)
        const matchedMenus = SITE_MENUS.filter(item => {
          const matchTitle = (item.title || "").toLowerCase().includes(keyword);
          const matchTitleEn = (item.title_en || "").toLowerCase().includes(keyword);
          const matchCategory = (item.category || "").toLowerCase().includes(keyword);
          const matchKeywords = (item.keywords || "").toLowerCase().includes(keyword);
          return matchTitle || matchTitleEn || matchCategory || matchKeywords;
        }).map(m => ({
          ...m,
          path: m.url
        })).slice(0, 8);

        // 2. ค้นหาตารางฐานข้อมูลพร้อมกัน
        const [rawProjects, rawNews, rawLecturers, rawCourses, rawDownloads] = await Promise.all([
            // 2.1 โครงงานนักศึกษา (projects)
            prisma.projects.findMany({
                where: {
                    OR: [
                        { title_th: { contains: keyword, mode: "insensitive" } },
                        { title_en: { contains: keyword, mode: "insensitive" } },
                        { students_text: { contains: keyword, mode: "insensitive" } },
                        { student: { firstname: { contains: keyword, mode: "insensitive" } } },
                        { student: { lastname: { contains: keyword, mode: "insensitive" } } },
                        { student: { student_id: { contains: keyword } } }
                    ]
                },
                select: {
                    id: true,
                    title_th: true,
                    title_en: true,
                    year: true,
                    semester: true,
                    students_text: true,
                    abstract: true,
                    student: { select: { firstname: true, lastname: true, student_id: true } },
                    advisor: { select: { fullname_th: true, lecturer_code: true } }
                },
                take: 8
            }).catch((err) => {
                console.warn("⚠️ ค้นหา projects ไม่สำเร็จ:", err.message);
                return [];
            }),

            // 2.2 ข่าวสาร (news)
            prisma.news.findMany({
                where: { 
                    OR: [
                        { title: { contains: keyword, mode: "insensitive" } },
                        { content: { contains: keyword, mode: "insensitive" } },
                        { category: { contains: keyword, mode: "insensitive" } }
                    ]
                },
                select: { id: true, title: true, category: true, created_at: true },
                take: 8
            }).catch((err) => {
                console.warn("⚠️ ค้นหา news ไม่สำเร็จ:", err.message);
                return [];
            }),

            // 2.3 บุคลากร / อาจารย์ (lecturers & staff)
            prisma.lecturers.findMany({
                where: {
                    OR: [
                        { fullname_th: { contains: keyword, mode: "insensitive" } },
                        { fullname_en: { contains: keyword, mode: "insensitive" } },
                        { lecturer_code: { contains: keyword, mode: "insensitive" } },
                        { email: { contains: keyword, mode: "insensitive" } }
                    ]
                },
                select: { id: true, fullname_th: true, fullname_en: true, lecturer_code: true, email: true, image_path: true, position_th: true, position_en: true },
                take: 8
            }).catch((err) => {
                console.warn("⚠️ ค้นหา lecturers ไม่สำเร็จ:", err.message);
                return [];
            }),

            // 2.4 คำอธิบายรายวิชา (subjects / program_sections)
            prisma.subjects.findMany({
                where: {
                    OR: [
                        { subject_code: { contains: keyword, mode: "insensitive" } },
                        { title_th: { contains: keyword, mode: "insensitive" } },
                        { title_en: { contains: keyword, mode: "insensitive" } },
                        { description_th: { contains: keyword, mode: "insensitive" } },
                        { description_en: { contains: keyword, mode: "insensitive" } }
                    ]
                },
                select: { 
                    id: true, 
                    subject_code: true, 
                    title_th: true, 
                    title_en: true, 
                    category: true,
                    credit: true,
                    curriculum_year: true,
                    degree_level: true
                },
                take: 12
            }).then(subs => {
                return subs.map(s => ({
                    id: s.id,
                    subject_code: s.subject_code,
                    title_th: s.title_th,
                    title_en: s.title_en,
                    title: s.subject_code ? `${s.subject_code} ${s.title_th || s.title_en || ''}`.trim() : (s.title_th || s.title_en),
                    category: s.category,
                    credit: s.credit,
                    curriculum_year: s.curriculum_year,
                    degree_level: s.degree_level
                }));
            }).catch(async (err) => {
                // Fallback to program_sections if subjects table query encounters issue
                return prisma.program_sections.findMany({
                    where: { content: { contains: keyword, mode: "insensitive" } },
                    select: { id: true, title: true, version: { select: { year: true } } },
                    take: 8
                }).then(secs => secs.map(sec => ({
                    id: sec.id,
                    title: sec.title,
                    title_th: sec.title,
                    curriculum_year: sec.version?.year
                }))).catch(() => []);
            }),

            // 2.5 เอกสารดาวน์โหลด (downloads)
            prisma.downloads.findMany({
                where: {
                    OR: [
                        { title: { contains: keyword, mode: "insensitive" } },
                        { file_name: { contains: keyword, mode: "insensitive" } },
                        { category: { contains: keyword, mode: "insensitive" } }
                    ]
                },
                select: { id: true, title: true, file_name: true, file_path: true, category: true, audience: true },
                take: 12
            }).then(docs => {
                return docs.map(d => ({
                    ...d,
                    file_url: `http://localhost:5000/api/downloads/download/${d.id}`
                }));
            }).catch((err) => {
                console.warn("⚠️ ค้นหา downloads ไม่สำเร็จ:", err.message);
                return [];
            })
        ]);

        console.log("✅ ค้นหาสำเร็จ! เจอเมนู:", matchedMenus.length, "โครงงาน:", rawProjects.length, "ข่าว:", rawNews.length, "อาจารย์:", rawLecturers.length, "วิชา:", rawCourses.length, "ดาวน์โหลด:", rawDownloads.length);

        res.json({
            menus: matchedMenus,
            projects: rawProjects,
            news: rawNews,
            lecturers: rawLecturers,
            courses: rawCourses,
            downloads: rawDownloads
        });

    } catch (error) {
        console.error("💥 Global Search Error:", error);
        res.status(500).json({ error: "Search failed", details: error.message });
    }
};