import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft
} from 'lucide-react';
import Footer from '../components/Footer';

export default function AcademicRegs() {
  const navigate = useNavigate();

  // 📝 ข้อมูลระเบียบ/ประกาศงานวิชาการ
  const academicDocs = [
    { 
      id: 1, 
      title: "ประกาศ เรื่องเกณฑ์การยื่นขอสอบหัวข้อโครงงานพิเศษ (ฉบับหลักสูตรปรับปรุง พ.ศ.2564)", 
      file: "academic_01.pdf" 
    },
    // สามารถเพิ่มรายการเอกสารอื่นๆ ตรงนี้ได้
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section - ขยายความกว้างสูงสุดเป็น 7xl */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
                    <div className="max-w-5xl mx-auto relative z-10">
                      <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">งานวิชาการ</h1>
                        <div className="w-12 h-1 bg-white/30 mb-5"></div>
                      </motion.div>
                    </div>
            
                    {/* ลายน้ำพื้นหลัง */}
                    <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                      <h2 className="text-[5rem] font-bold">CIS</h2>
                    </div>
                  </section>


      {/* 📚 Document List Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-grow">
        

        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
          
          {/* หัวตารางจำลอง (Table Header) */}
          <div className="hidden lg:grid grid-cols-12 gap-4 bg-slate-50/50 p-4 border-b border-slate-100 text-slate-400 font-bold text-[13px] uppercase tracking-wider">
            <div className="col-span-1 text-center">ลำดับ</div>
            <div className="col-span-9">รายการเอกสาร</div>
            <div className="col-span-2 text-center">ไฟล์</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-100">
            {academicDocs.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 lg:p-6 items-center hover:bg-slate-50/30 transition-colors group"
              >
                {/* ลำดับ */}
                <div className="hidden lg:block col-span-1 text-center font-bold text-slate-300">
                  {idx + 1}
                </div>

                {/* ชื่อเอกสาร */}
                <div className="col-span-12 lg:col-span-9">
                  <div className="flex items-start gap-4">
                    <span className="lg:hidden text-xs font-bold text-slate-300 mt-1 w-6">{idx + 1}</span>
                    <div className="border-b border-transparent pb-1 transition-all inline-block">
                      <span className="text-[15px] md:text-[16px] font-medium text-slate-700 leading-relaxed group-hover:text-[#3F51B5] transition-colors">
                        {doc.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ปุ่มเปิดดู PDF สไตล์ Indigo */}
                <div className="col-span-12 lg:col-span-2 flex justify-end lg:justify-center">
                  <a 
                    href={`/files/academic/${doc.file}`} 
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