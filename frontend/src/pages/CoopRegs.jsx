import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Footer from '../components/Footer';

export default function CoopRegs() {
  const navigate = useNavigate();

  // 📝 ข้อมูลประกาศ-ข้อบังคับ-สหกิจศึกษา
  const coopDocs = [
    { id: 1, title: "ข้อบังคับมหาวิทยาลัย ว่าด้วย สหกิจศึกษาและการบูรณาการการเรียนรู้กับการทำงาน พ.ศ. 2562", file: "coop_01.pdf" },
    { id: 2, title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การจัดสรรเงินรายได้และการเบิกจ่ายค่าใช้จ่ายในการบริหารงาน โครงการสหกิจศึกษาและโครงการบูรณาการการเรียนรู้กับการทำงาน", file: "coop_02.pdf" },
    { id: 3, title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การจัดสรรเงินรายได้และการเบิกจ่ายค่าใช้จ่ายในการบริหารงาน โครงการสหกิจศึกษาและโครงการบูรณาการการเรียนรู้กับการทำงาน (ฉบับที่ 3)", file: "coop_03.pdf" },
    { id: 4, title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การจัดสรรและการเบิกจ่ายค่าใช้จ่ายในการบริหารงานโครงการสหกิจศึกษาและโครงการบูรณาการการเรียนรู้กับการทำงาน(ฉบับที่ 2)", file: "coop_04.pdf" },
    { id: 5, title: "ประกาศมหาวิทยาลัย เรื่อง อัตราค่าเบี้ยประชุม ค่าตอบแทน และค่าใช้จ่ายในการบริหารงานโครงการสหกิจศึกษา (ฉบับที่ 2)", file: "coop_05.pdf" },
    { id: 6, title: "ประกาศ คุณสมบัตินักศึกษาโครงการสหกิจ ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ", file: "coop_06.pdf" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
              <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ประกาศ-ข้อบังคับ-สหกิจศึกษา</h1>
                  <div className="w-12 h-1 bg-white/30 mb-5"></div>
                </motion.div>
              </div>
      
              {/* ลายน้ำพื้นหลัง */}
              <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                <h2 className="text-[5rem] font-bold">CIS</h2>
              </div>
            </section>

      {/* 📂 Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-10 py-12 flex-grow">

        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50/50 p-4 border-b border-slate-100 text-slate-400 font-bold text-[13px] uppercase tracking-wider">
            <div className="col-span-1 text-center">ลำดับ</div>
            <div className="col-span-9">รายการเอกสาร</div>
            <div className="col-span-2 text-center">ไฟล์</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-100">
            {coopDocs.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 md:p-6 items-center hover:bg-slate-50/30 transition-colors group"
              >
                {/* ลำดับ */}
                <div className="hidden md:block col-span-1 text-center font-bold text-slate-300">
                  {idx + 1}
                </div>

                {/* ชื่อเอกสาร */}
                <div className="col-span-12 md:col-span-9">
                  <div className="flex items-start gap-4">
                    <span className="md:hidden text-xs font-bold text-slate-300 mt-1 w-6">{idx + 1}</span>
                    <div className="border-b border-transparent pb-1 transition-all inline-block">
                      <span className="text-[15px] md:text-[16px] font-medium text-slate-700 leading-relaxed group-hover:text-[#3F51B5] transition-colors">
                        {doc.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ปุ่มเปิดดู PDF สไตล์ Indigo */}
                <div className="col-span-12 md:col-span-2 flex justify-end md:justify-center">
                  <a 
                    href={`/files/coop/${doc.file}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-2.5 bg-[#3F51B5] text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 uppercase tracking-wider"
                  >
                    <span className="text-white">pdf</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}