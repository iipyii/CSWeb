import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft
} from 'lucide-react';
import Footer from '../components/Footer';

export default function PersonnelRegs() {
  const navigate = useNavigate();

  // 📝 ข้อมูลระเบียบ/ประกาศงานบุคคล
  const personnelDocs = [
    { 
      id: 1, 
      title: "ระเบียบมหาวิทยาลัย ว่าด้วย สวัสดิการด้านการรักษาพยาบาลสำหรับพนักงานมหาวิทยาลัยและครอบครัว พ.ศ.2567", 
      file: "hr_01.pdf" 
    },
    // สามารถเพิ่มรายการเอกสารอื่นๆ ของงานบุคคลตรงนี้ได้
  ];

  return (
    <div className="bg-slate-50 font-['Prompt'] min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">งานบุคคล</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>

        {/* ลายน้ำพื้นหลัง */}
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>


      {/* 📚 Document List Section */}
      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-grow">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50 p-5 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest">
            <div className="col-span-1 text-center">ลำดับ</div>
            <div className="col-span-9">รายการเอกสาร</div>
            <div className="col-span-2 text-center">ไฟล์</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-100">
            {personnelDocs.map((doc) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 items-center hover:bg-slate-50/50 transition-colors"
              >
                {/* ลำดับ */}
                <div className="hidden md:block col-span-1 text-center font-medium text-slate-400 text-sm">
                  {doc.id}
                </div>

                {/* ชื่อเอกสาร */}
                <div className="col-span-12 md:col-span-9">
                  <span className="text-slate-700 font-medium leading-relaxed text-[14.5px] md:text-[15px]">
                    {doc.title}
                  </span>
                </div>

                {/* ปุ่มเปิดดู PDF */}
                <div className="col-span-12 md:col-span-2 flex justify-center">
                  <a 
                    href={`/files/hr/${doc.file}`} 
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