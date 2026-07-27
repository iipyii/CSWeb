import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, FolderGit2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 👈 นำเข้าสำหรับเปลี่ยนหน้า
import Footer from '../components/Footer';

export default function StudentProjects() {
  const navigate = useNavigate(); // 👈 ประกาศตัวแปรสำหรับเปลี่ยนหน้า
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("2568");

  // ข้อมูลโครงงาน
  const projects = [
    { 
      id: 1, 
      titleTh: "โครงการพัฒนาเว็บไซต์ภาควิชาคอมพิวเตอร์และสารสนเทศ", 
      titleEn: "Department of Computer and Information Science Website Development Project",
      year: "2568" 
    },
    { 
      id: 2, 
      titleTh: "ระบบจัดการคลังข่าวสารและฐานข้อมูลบุคลากร", 
      titleEn: "News Repository and Personnel Database Management System",
      year: "2568" 
    },
    { 
      id: 3, 
      titleTh: "แอปพลิเคชันแนะนำหลักสูตรและการลงทะเบียน", 
      titleEn: "Course Recommendation and Registration Assistant Application",
      year: "2567" 
    },
    { 
      id: 4, 
      titleTh: "โครงงานพัฒนาเว็บแอปพลิเคชันเพื่อการจัดการเรียนการสอน", 
      titleEn: "Web Application Development for Learning Management System",
      year: "2567" 
    },
    { 
      id: 5, 
      titleTh: "ระบบติดตามความก้าวหน้าโครงงานพิเศษ", 
      titleEn: "Senior Project Progress Tracking System",
      year: "2566" 
    },
  ];

  // รายการปีการศึกษา (ไม่มีคำว่า "ทั้งหมด")
  const years = ["2568", "2567", "2566"];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.titleTh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.titleEn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = project.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <div className="bg-[#FDFDFD] min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden text-left">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">โครงงานของนักศึกษา</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* 🔍 Search & Filter Tools */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 flex-grow">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาโครงงาน"
              className="w-full bg-transparent border-none rounded-xl py-4 pl-14 pr-6 text-sm font-medium outline-none focus:ring-0 text-slate-700 placeholder:text-slate-400"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 px-4 md:border-l border-slate-100 w-full md:w-auto">
            <Calendar className="text-slate-400" size={18} />
            <select 
              className="bg-transparent border-none py-4 pr-10 text-sm font-bold text-slate-600 outline-none focus:ring-0 cursor-pointer min-w-[140px]"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>{`ปีการศึกษา ${year}`}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 📋 Official List Area */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 px-8 py-5 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <div className="col-span-10">รายชื่อโครงงาน (Project Title)</div>
            <div className="col-span-2 text-right">ปีการศึกษา</div>
          </div>

          <div className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <motion.div 
                    key={project.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    // 👈 เพิ่มการคลิกเพื่อเปลี่ยนหน้าไปยังรายละเอียด
                    onClick={() => navigate(`/student-projects/${project.id}`)}
                    className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <div className="grid grid-cols-12 px-8 py-7 items-center gap-4">
                      <div className="col-span-10">
                        <h3 className="text-[16px] font-bold text-slate-800 group-hover:text-[#3F51B5] transition-colors leading-tight mb-1">
                          {project.titleTh}
                        </h3>
                        <p className="text-[13px] font-medium text-slate-400 italic leading-snug">
                          {project.titleEn}
                        </p>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg group-hover:bg-[#3F51B5] group-hover:text-white transition-all">
                          {project.year}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-24 text-center">
                  <div className="inline-flex p-5 bg-slate-50 rounded-full mb-4 text-slate-300">
                    <FileText size={32} />
                  </div>
                  <h3 className="text-slate-400 font-bold text-sm">ไม่พบข้อมูลโครงงานในปีการศึกษานี้</h3>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}