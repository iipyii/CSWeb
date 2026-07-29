import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, GraduationCap, BookOpen, User, Users, Calendar, Info } from 'lucide-react';
import Footer from '../components/Footer';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ข้อมูลจำลองโครงงานตามรูปแบบทางการ
  const projectInfo = {
    titleTh: "โครงการพัฒนาเว็บไซต์ภาควิชาคอมพิวเตอร์และสารสนเทศ",
    titleEn: "Design and development of the Computer Science and Information department website.",
    advisors: [
      "รองศาสตราจารย์ ดร.เบญจพร ลิ้มธรรมาภรณ์ (BLT)",
      "อาจารย์ปรัชญาพร เลี้ยงสุทธิสิานนท์ (PLS)"
    ],
    students: [
      { id: "6504062610188", name: "นางสาวปิยะนันท์ ดวงแข" },
      { id: "6504062620035", name: "นางสาวชุติกาญจน์ เกตุหลิม" }
    ],
    academicYear: "2568",
    status: "กำลังดำเนินการ",
    abstract: `โครงการนี้จัดทำขึ้นเพื่อออกแบบและพัฒนาเว็บไซต์ที่ใช้เป็นศูนย์กลางในการเผยแพร่ข้อมูล ข่าวสาร และผลงานของภาควิชาให้แก่นักศึกษา อาจารย์ บุคลากร ตลอดจนผู้สนใจทั่วไป โดยเว็บไซต์จะประกอบด้วยข้อมูลสำคัญ ได้แก่ ประวัติภาควิชา หลักสูตรการเรียนการสอน ข้อมูลอาจารย์และบุคลากร กิจกรรม ข่าวประชาสัมพันธ์ งานวิจัย รวมถึงช่องทางติดต่อ

โครงการนี้ได้ศึกษาเทคโนโลยีและเครื่องมือที่เหมาะสมในการพัฒนาเว็บไซต์ เช่น HTML, CSS, JavaScript และเฟรมเวิร์กเสริมอื่นๆ เพื่อให้การออกแบบมีความทันสมัย รองรับการใช้งานได้ทั้งบนคอมพิวเตอร์และอุปกรณ์พกพา (Responsive Design) นอกจากนี้ยังมีการออกแบบระบบฐานข้อมูลเพื่อจัดเก็บและบริหารจัดการข้อมูลให้สามารถอัปเดตและค้นหาได้อย่างสะดวก

ผลลัพธ์ที่คาดว่าจะได้รับคือเว็บไซต์ภาควิชาที่มีความครบถ้วนด้านข้อมูล ใช้งานง่าย มีความน่าเชื่อถือ และสามารถเป็นศูนย์กลางในการสื่อสารระหว่างภาควิชากับผู้ใช้งานกลุ่มเป้าหมายได้อย่างมีประสิทธิภาพ อีกทั้งยังเป็นการส่งเสริมภาพลักษณ์ที่ทันสมัยและเป็นระบบของภาควิชาอีกด้วย`
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden text-left">
              <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">รายละเอียดโครงงาน</h1>
                  <div className="w-12 h-1 bg-white/30 mb-5"></div>
                </motion.div>
              </div>
              <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                <h2 className="text-[5rem] font-bold">CIS</h2>
              </div>
            </section>

      {/* 📄 Content Area */}
      <main className="max-w-5xl mx-auto w-full px-6 md:px-10 py-16 relative z-20 flex-grow space-y-10">
        
        {/* ส่วนข้อมูล (Data Block) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-[#EEF2FF] px-8 py-4 border-b border-slate-100 flex items-center gap-2">
            <Info size={18} className="text-[#3F51B5]" />
            <span className="text-[#3F51B5] font-bold text-sm">ข้อมูล</span>
          </div>
          
          <div className="p-8 md:p-10 space-y-6 text-[15px]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-6">
              <div className="md:col-span-3 font-bold text-slate-700">ชื่อโครงงาน (ภาษาไทย):</div>
              <div className="md:col-span-9 text-slate-600">{projectInfo.titleTh}</div>

              <div className="md:col-span-3 font-bold text-slate-700">ชื่อโครงงาน (ภาษาอังกฤษ):</div>
              <div className="md:col-span-9 text-slate-600 italic font-medium">{projectInfo.titleEn}</div>

              <div className="md:col-span-3 font-bold text-slate-700 pt-2">อาจารย์ที่ปรึกษา:</div>
              <div className="md:col-span-9 text-slate-600 space-y-1">
                {projectInfo.advisors.map((advisor, i) => <p key={i}>{advisor}</p>)}
              </div>

              <div className="md:col-span-3 font-bold text-slate-700 pt-2">รายชื่อนักศึกษา:</div>
              <div className="md:col-span-9 text-slate-600 space-y-1">
                {projectInfo.students.map((student, i) => (
                  <p key={i}>{student.id} {student.name}</p>
                ))}
              </div>

              <div className="md:col-span-3 font-bold text-slate-700">ปีการศึกษา:</div>
              <div className="md:col-span-9 text-slate-600">{projectInfo.academicYear}</div>

              <div className="md:col-span-3 font-bold text-slate-700">สถานะโครงงาน:</div>
              <div className="md:col-span-9 text-emerald-600 font-bold">{projectInfo.status}</div>
            </div>
          </div>
        </div>

        {/* ส่วนบทคัดย่อ (Abstract Block) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-[#EEF2FF] px-8 py-4 border-b border-slate-100 flex items-center gap-2">
            <BookOpen size={18} className="text-[#3F51B5]" />
            <span className="text-[#3F51B5] font-bold text-sm">บทคัดย่อ</span>
          </div>
          <div className="p-8 md:p-10">
            <div className="text-slate-600 leading-[2] text-justify whitespace-pre-line text-base font-normal">
              {projectInfo.abstract}
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}