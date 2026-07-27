import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FileText, BookOpen, Clock, Download } from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

export default function CourseSectionContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);

  useEffect(() => {
    // ดึงข้อมูลจาก API
    fetch(`http://localhost:5000/api/program-sections/${id}`)
      .then((res) => res.json())
      .then((data) => setSection(data))
      .catch((err) => console.error(err));
  }, [id]);

  // ✨ ฟังก์ชันสำหรับจัดรูปแบบข้อความอัตโนมัติ (Content Parser)
  const renderFormattedContent = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <br key={index} />;

      // ตรวจสอบว่าเป็นหัวข้อหลัก (เช่น "1. ", "2. ")
      const isHeader = /^\d+\./.test(trimmedLine);

      if (isHeader) {
        return (
          <motion.h3 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold text-[#183153] mt-10 mb-5 pb-2 border-b-2 border-slate-100 flex items-center gap-3"
          >
            <span className="w-2 h-6 bg-[#3F51B5] rounded-full"></span>
            {trimmedLine}
          </motion.h3>
        );
      }

      // สำหรับข้อความปกติ จัดย่อหน้าให้อ่านง่าย
      return (
        <p key={index} className="text-slate-600 leading-extra-relaxed mb-4 text-[17px] font-light md:indent-10 text-left">
          {trimmedLine}
        </p>
      );
    });
  };

  if (!section) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-[#3F51B5] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-slate-500">กำลังโหลดเนื้อหาหลักสูตร...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      {/* 🏛️ Header Section - ส่วนแบนเนอร์ด้านบน */}
      <div className="bg-[#183153] text-white pt-16 pb-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-left">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-400 hover:text-blue-300 font-bold mb-8 transition-all group"
          >
            <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
            กลับไปหน้าหลักสูตร
          </button>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold leading-tight max-w-4xl"
          >
            {section.title}
          </motion.h1>

          <div className="flex flex-wrap items-center gap-6 mt-8 text-sm font-light text-slate-300">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-blue-400" />
              <span>หมวดหมู่รายวิชา</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              <span>อัปเดตข้อมูลล่าสุดปี 2568</span>
            </div>
          </div>
        </div>
        {/* Background Decoration */}
        <div className="absolute right-[-5%] top-[-10%] opacity-10 select-none pointer-events-none text-white">
          <FileText size={400} />
        </div>
      </div>

      {/* 📄 Main Content Card - ขยายความกว้างเป็น 6xl */}
      <main className="max-w-6xl mx-auto w-full px-6 -mt-12 mb-24 flex-grow relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-16"
        >
          {/* ส่วนเนื้อหาที่จัดรูปแบบแล้ว */}
          <article className="prose prose-slate max-w-none">
            {renderFormattedContent(section.content)}
          </article>

          {/* 📥 PDF Download Section - กล่องดาวน์โหลดด้านล่าง */}
          <div className="mt-16 pt-10 border-t border-slate-50">
            <div className="bg-slate-50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm border border-slate-100">
                  <FileText size={32} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-[#183153] text-lg">เอกสารต้นฉบับ</h4>
                  <p className="text-slate-500 text-sm">ดาวน์โหลดไฟล์ PDF เพื่ออ่านรายละเอียดฉบับเต็ม</p>
                </div>
              </div>
              
              <a
                href={`http://localhost:5000/uploads/${section.pdf_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-[#3F51B5] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#2f3ea3] hover:shadow-xl transition-all active:scale-95 shadow-lg shadow-indigo-100"
              >
                <Download size={20} />
                เปิดไฟล์ PDF
              </a>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}