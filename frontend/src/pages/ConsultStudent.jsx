import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom'; // เพิ่ม Link
import Footer from '../components/Footer';

export default function ConsultStudent() {
  const navigate = useNavigate();

  const studentCategories = [
    {
      level: "bachelor", // ใช้ชื่อภาษาอังกฤษเพื่อสะดวกในการทำ URL
      levelTh: "ระดับปริญญาตรี",
      headerColor: "bg-[#3F51B5] text-white", 
      bodyColor: "bg-indigo-50/30",
      years: ["68", "67", "66", "65", "64", "63", "62", "61", "60", "59", "58"]
    },
    {
      level: "master",
      levelTh: "ระดับปริญญาโท",
      headerColor: "bg-[#3F51B5] text-white",
      bodyColor: "bg-indigo-50/30",
      years: ["68", "67", "66", "65", "64", "63", "62", "61", "60", "59"]
    },
    {
      level: "doctor",
      levelTh: "ระดับปริญญาเอก",
      headerColor: "bg-[#3F51B5] text-white",
      bodyColor: "bg-indigo-50/30",
      years: ["68", "66", "62", "60", "59"]
    }
  ];

  return (
    <div className="bg-white font-['Prompt'] min-h-screen flex flex-col text-left">
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">อาจารย์ที่ปรึกษา</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-6xl mx-auto w-full px-6 py-16 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-300 rounded-xl overflow-hidden shadow-md">
          {studentCategories.map((cat, idx) => (
            <div key={idx} className={`flex flex-col ${idx !== 0 ? 'border-t md:border-t-0 md:border-l border-slate-300' : ''}`}>
              <div className={`py-5 px-4 text-center border-b border-slate-300 font-bold text-sm uppercase tracking-wider ${cat.headerColor}`}>
                {cat.levelTh}
              </div>
              <div className={`divide-y divide-slate-200 ${cat.bodyColor}`}>
                {cat.years.map((year, yIdx) => (
                  <Link 
                    key={yIdx} 
                    to={`/consult-detail/${cat.level}/${year}`} // ลิงก์ไปหน้าละเอียด
                    className="block"
                  >
                    <motion.div 
                      whileHover={{ backgroundColor: "rgba(63, 81, 181, 0.05)" }}
                      className="py-4 px-6 text-center group cursor-pointer transition-colors"
                    >
                      <span className="text-slate-600 group-hover:text-[#3F51B5] group-hover:font-bold text-sm font-medium transition-all">
                        นักศึกษารหัส {year}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}