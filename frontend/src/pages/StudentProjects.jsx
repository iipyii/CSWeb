import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, FolderGit2, FileText, GraduationCap, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';

export default function StudentProjects() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || params.get('search') || "";
    if (q) {
      setSearchTerm(q);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/projects");
        setProjects(res.data || []);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // ดึงปีการศึกษาที่มีอยู่จริงในข้อมูล
  const availableYears = Array.from(
    new Set(projects.map(p => p.year).filter(Boolean))
  ).sort((a, b) => b - a).map(String);

  const displayYears = availableYears.length > 0 ? availableYears : ["2569", "2568", "2567", "2566"];

  const filteredProjects = projects.filter(project => {
    const titleTh = project.title_th || "";
    const titleEn = project.title_en || "";
    const studentsText = project.students_text || "";
    const stuName = project.student ? `${project.student.firstname} ${project.student.lastname || ''}` : "";
    const advName = project.advisor?.fullname_th || "";
    const advCode = project.advisor?.lecturer_code || "";
    const coAdvName = project.co_advisor?.fullname_th || "";

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      titleTh.toLowerCase().includes(searchLower) ||
      titleEn.toLowerCase().includes(searchLower) ||
      studentsText.toLowerCase().includes(searchLower) ||
      stuName.toLowerCase().includes(searchLower) ||
      advName.toLowerCase().includes(searchLower) ||
      advCode.toLowerCase().includes(searchLower) ||
      coAdvName.toLowerCase().includes(searchLower);

    const matchesYear = selectedYear === "" || (project.year && project.year.toString() === selectedYear);
    const matchesSemester = selectedSemester === "" || (project.semester && project.semester.toString() === selectedSemester);

    return matchesSearch && matchesYear && matchesSemester;
  });

  return (
    <div className="bg-[#FDFDFD] min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-12 px-6 relative overflow-hidden text-left shadow-md">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold mb-3 backdrop-blur-sm">
              <FolderGit2 size={14} /> ผลงานนักศึกษาภาควิชา
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">โครงงานของนักศึกษา</h1>
            <p className="text-indigo-100 text-sm max-w-xl leading-relaxed">
              รวบรวมหัวข้อโครงงานพิเศษและปริญญานิพนธ์ของนักศึกษาภาควิชาคอมพิวเตอร์และสารสนเทศ
            </p>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[6rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* 🔍 Search & Filter Tools */}
      <main className="max-w-6xl mx-auto w-full px-6 md:px-10 py-10 flex-grow">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-8 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาโครงงาน, ชื่อนักศึกษา หรืออาจารย์ที่ปรึกษา..."
              className="w-full bg-transparent border-none rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-0 text-slate-700 placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto md:border-l border-slate-100 pl-0 md:pl-4">
            {/* ตัวกรองปีการศึกษา */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl text-sm font-medium text-slate-600">
              <Calendar size={16} className="text-slate-400" />
              <select 
                className="bg-transparent border-none text-xs md:text-sm font-bold text-slate-700 outline-none cursor-pointer"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">ทุกปีการศึกษา</option>
                {displayYears.map(year => (
                  <option key={year} value={year}>{`ปี ${year}`}</option>
                ))}
              </select>
            </div>

            {/* ตัวกรองภาคเรียน */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl text-sm font-medium text-slate-600">
              <GraduationCap size={16} className="text-slate-400" />
              <select 
                className="bg-transparent border-none text-xs md:text-sm font-bold text-slate-700 outline-none cursor-pointer"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="">ทุกภาคเรียน</option>
                <option value="1">ภาคเรียนที่ 1</option>
                <option value="2">ภาคเรียนที่ 2</option>
              </select>
            </div>
          </div>
        </div>

        {/* 📋 Project List */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 px-6 md:px-8 py-4 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            <div className="col-span-8 md:col-span-9">รายชื่อโครงงาน (Project Title)</div>
            <div className="col-span-4 md:col-span-3 text-right">ภาค/ปีการศึกษา</div>
          </div>

          <div className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="animate-spin text-[#3F51B5]" size={28} />
                  <span>กำลังโหลดข้อมูลโครงงาน...</span>
                </div>
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <motion.div 
                    key={project.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => navigate(`/student-projects/${project.id}`)}
                    className="group hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <div className="grid grid-cols-12 px-6 md:px-8 py-6 items-center gap-4">
                      <div className="col-span-8 md:col-span-9">
                        <h3 className="text-[15px] md:text-[16px] font-bold text-slate-800 group-hover:text-[#3F51B5] transition-colors leading-snug mb-1.5">
                          {project.title_th}
                        </h3>
                        {project.title_en && (
                          <p className="text-[12px] md:text-[13px] font-medium text-slate-400 italic leading-snug mb-2">
                            {project.title_en}
                          </p>
                        )}

                        {/* ข้อมูลผู้จัดทำและที่ปรึกษา */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                          {/* นักศึกษา */}
                          {project.students_text ? (
                            <div className="flex items-center gap-1.5 font-medium text-slate-600">
                              <span className="text-slate-400">ผู้จัดทำ:</span>
                              <span>{project.students_text.split("\n").join(", ")}</span>
                            </div>
                          ) : project.student ? (
                            <div className="flex items-center gap-1.5 font-medium text-slate-600">
                              <span className="text-slate-400">ผู้จัดทำ:</span>
                              <span>{project.student.firstname} {project.student.lastname}</span>
                            </div>
                          ) : null}

                          {/* ที่ปรึกษา */}
                          {project.advisor && (
                            <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                              <span className="text-slate-400 font-normal">ที่ปรึกษา:</span>
                              <span>{project.advisor.fullname_th}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ป้ายเทอม/ปี */}
                      <div className="col-span-4 md:col-span-3 text-right">
                        <span className="inline-flex items-center text-xs font-bold text-slate-600 bg-slate-100 group-hover:bg-[#3F51B5] group-hover:text-white px-3 py-1.5 rounded-lg transition-all">
                          {project.semester ? `${project.semester}/` : ''}{project.year || '-'}
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
                  <h3 className="text-slate-400 font-bold text-sm">ไม่พบข้อมูลโครงงานตามเงื่อนไขที่เลือก</h3>
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