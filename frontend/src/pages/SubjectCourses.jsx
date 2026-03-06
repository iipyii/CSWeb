import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✨ เพิ่ม Link สำหรับนำทางภายในแอป
import { motion } from 'framer-motion';
import { ChevronLeft, BookOpen, FileText, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

export default function SubjectCourses() {
  const navigate = useNavigate();

  // 📝 รายการขบวนวิชาตามปีการศึกษา
  const courseData = [
    { title: "ขบวนวิชาที่เปิดสอน ระดับ ป.ตรีและระดับบัณฑิตศึกษา ปีการศึกษา 1/2568", year: "2568", term: "1" },
    { title: "ขบวนวิชาที่เปิดสอน ระดับ ป.ตรีและระดับบัณฑิตศึกษา ปีการศึกษา 2/2568", year: "2568", term: "2" },
    { title: "ขบวนวิชาที่เปิดสอน ระดับ ป.ตรีและระดับบัณฑิตศึกษา ปีการศึกษา 1/2567", year: "2567", term: "1" },
    { title: "ขบวนวิชาที่เปิดสอน ระดับ ป.ตรีและระดับบัณฑิตศึกษา ปีการศึกษา 2/2567", year: "2567", term: "2" },
    { title: "ขบวนวิชาที่เปิดสอน ระดับ ป.ตรีและระดับบัณฑิตศึกษา ปีการศึกษา 1/2566", year: "2566", term: "1" },
    { title: "ขบวนวิชาที่เปิดสอน ระดับ ป.ตรีและระดับบัณฑิตศึกษา ปีการศึกษา 2/2566", year: "2566", term: "2" },
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
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ขบวนวิชา</h1>
                  <div className="w-12 h-1 bg-white/30 mb-5"></div>
                </motion.div>
              </div>
              <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                <h2 className="text-[5rem] font-bold">CIS</h2>
              </div>
            </section>

      {/* 📚 Main Content List */}
      <main className="max-w-4xl mx-auto w-full px-6 py-16 flex-grow">
        <div className="grid gap-4">
          {courseData.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              viewport={{ once: true }}
            >
              <Link 
                to={`/subject-courses/detail/${item.year}/${item.term}`} // ✨ ส่ง Parameter ปีและเทอมไปหน้าละเอียด
                className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#3F51B5] transition-all flex items-center justify-between gap-6"
              >
                <div className="flex items-center gap-5">
                  {/* Icon ประจำรายการ */}
                  <div className="w-12 h-12 bg-indigo-50 text-[#3F51B5] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#3F51B5] group-hover:text-white transition-all duration-300">
                    <FileText size={24} />
                  </div>
                  
                  <div>
                    <h3 className="text-slate-700 font-bold text-lg leading-snug group-hover:text-[#3F51B5] transition-colors">
                      {item.title}
                    </h3>
                   
                  </div>
                </div>

                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-[#3F51B5] transition-all shrink-0">
                  <ArrowRight size={20} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        
      </main>

      <Footer />
    </div>
  );
}