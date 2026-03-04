import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function ConsultStudent() {
  const navigate = useNavigate();

  // 🎓 ข้อมูลกลุ่มนักศึกษาพร้อมการกำหนดสีที่ดูเป็นทางการ
  const studentCategories = [
    {
      level: "ระดับปริญญาตรี",
      headerColor: "bg-[#3F51B5] text-white", 
      bodyColor: "bg-indigo-50/30",
      years: ["68", "67", "66", "65", "64", "63", "62", "61", "60", "59", "58"]
    },
    {
      level: "ระดับปริญญาโท",
      headerColor: "bg-[#3F51B5] text-white",
      bodyColor: "bg-indigo-50/30",
      years: ["68", "67", "66", "65", "64", "63", "62", "61", "60", "59"]
    },
    {
      level: "ระดับปริญญาเอก",
      headerColor: "bg-[#3F51B5] text-white",
      bodyColor: "bg-indigo-50/30",
      years: ["68", "66", "62", "60", "59"]
    }
  ];

  return (
    <div className="bg-white font-['Prompt'] min-h-screen flex flex-col text-left">
      

      {/* Hero Section */}
            <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
              <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">อาจารย์ที่ปรึกษา</h1>
                  <div className="w-12 h-1 bg-white/30 mb-5"></div>
                </motion.div>
              </div>
              <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                <h2 className="text-[5rem] font-bold">CIS</h2>
              </div>
            </section>

      <main className="max-w-6xl mx-auto w-full px-6 py-16 flex-grow">
        
        {/* 📊 Grid Display: ปรับปรุงสีคอลัมน์ใหม่ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-slate-300 rounded-xl overflow-hidden shadow-md">
          {studentCategories.map((cat, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${idx !== 0 ? 'border-t md:border-t-0 md:border-l border-slate-300' : ''}`}
            >
              
              {/* Header คอลัมน์ - ใช้สีทึบเพื่อให้ดูเป็นหัวข้อที่ชัดเจน */}
              <div className={`py-5 px-4 text-center border-b border-slate-300 font-bold text-sm uppercase tracking-wider ${cat.headerColor}`}>
                {cat.level}
              </div>
              
              {/* รายการปีรหัสนักศึกษา - ใช้สีพื้นหลังอ่อนๆ เพื่อช่วยให้อ่านง่าย */}
              <div className={`divide-y divide-slate-200 ${cat.bodyColor}`}>
                {cat.years.map((year, yIdx) => (
                  <motion.div 
                    whileHover={{ backgroundColor: "rgba(63, 81, 181, 0.05)" }}
                    key={yIdx} 
                    className="py-4 px-6 text-center group cursor-pointer transition-colors"
                  >
                    <span className="text-slate-600 group-hover:text-[#3F51B5] group-hover:font-bold text-sm font-medium transition-all">
                      นักศึกษารหัส {year}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer ของเนื้อหาหลัก */}
        <div className="mt-12 border-t border-slate-100 pt-8">
          <p className="text-slate-400 text-[12px] text-center italic leading-relaxed">
            ข้อมูลรายชื่อนักศึกษาในที่ปรึกษาแยกตามปีการศึกษา <br />
            ภาควิชาคอมพิวเตอร์และสารสนเทศ คณะวิทยาศาสตร์ประยุกต์ มจพ.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}