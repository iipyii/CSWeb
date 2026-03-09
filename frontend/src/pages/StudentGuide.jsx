import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Eye, 
  Bookmark,
  FileText
} from 'lucide-react';
import Footer from '../components/Footer';

export default function StudentGuide() {
  const navigate = useNavigate();

  const guideData = [
    { title: "คู่มือการลงทะเบียน", type: "Manual", file: "https://reg.kmutnb.ac.th/Download/MAN_UW-KMUTNB63-REG-02-student_Register.pdf" },
    { title: "คู่มือนักศึกษา ปี 2568", year: "2568", type: "PDF", file: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2025/03/student_manual2568_1.pdf" },
    { title: "คู่มือนักศึกษา ปี 2567", year: "2567", type: "PDF", file: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2024/04/stdHB2567.pdf" },
    { title: "คู่มือนักศึกษา ปี 2566", year: "2566", type: "PDF", file: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2023/03/stdHB2566_edit_15092023.pdf" },
    { title: "คู่มือนักศึกษา ปี 2565", year: "2565", type: "PDF", file: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2022/03/StdHB2565.pdf" },
    { title: "คู่มือนักศึกษา ปี 2564", year: "2564", type: "PDF", file: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2021/02/studentHandBook2564.pdf" },
    { title: "คู่มือนักศึกษา ปี 2563", year: "2563", type: "PDF", file: "https://acdserv.kmutnb.ac.th/wp-content/uploads/2020/07/ManualStu63.pdf" },
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
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">คู่มือนักศึกษา</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* 📚 Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 py-16 flex-grow">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Bookmark className="text-[#3F51B5]" size={20} /> รายการคู่มือทั้งหมด
            </h2>
          </div>

          {guideData.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <a 
                href={item.file} 
                target="_blank" 
                rel="noopener noreferrer"
                // ✨ ปรับปรุง: ลบเงื่อนไข isHighlight ออกเพื่อให้ทุกรายการมีสีเริ่มต้นเหมือนกัน
                className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl transition-all shadow-sm hover:shadow-md hover:border-[#3F51B5]/30 hover:bg-indigo-50/10"
              >
                <div className="flex items-center gap-5">
                  {/* ✨ ปรับปรุง: ไอคอนจะเปลี่ยนสีเมื่อ Hover เท่านั้น */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 text-slate-400 group-hover:bg-[#3F51B5] group-hover:text-white transition-colors">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-700 group-hover:text-[#3F51B5] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>
                
                {/* ✨ เพิ่มไอคอนดวงตาเพื่อให้รู้ว่าคลิกเพื่อเปิดดูได้ */}
                <div className="flex items-center gap-2 text-slate-300 group-hover:text-[#3F51B5] transition-colors">
                  <Eye size={18} />
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}