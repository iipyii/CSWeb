import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, GraduationCap, BookOpen, Users, Calendar, Info, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Footer from '../components/Footer';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        console.error("Failed to load project details:", err);
        setError("ไม่พบข้อมูลโครงงาน หรือเกิดข้อผิดพลาดในการโหลด");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center py-32 text-slate-400 gap-3">
          <Loader2 className="animate-spin text-[#3F51B5]" size={32} />
          <span className="text-base font-medium">กำลังโหลดรายละเอียดโครงงาน...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center py-32 text-center px-4">
          <div className="text-rose-500 font-bold text-lg mb-2">{error || "ไม่พบข้อมูลโครงงาน"}</div>
          <button 
            onClick={() => navigate('/student-projects')}
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#3F51B5] text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
          >
            <ArrowLeft size={16} /> กลับไปยังหน้ารายการโครงงาน
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // เตรียมรายชื่อนักศึกษา
  let studentList = [];
  if (project.students_text) {
    studentList = project.students_text.split("\n").map(s => s.trim()).filter(Boolean);
  } else if (project.student) {
    studentList = [`${project.student.firstname} ${project.student.lastname} (${project.student.student_id})`];
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-12 px-6 relative overflow-hidden text-left shadow-md">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button 
              onClick={() => navigate('/student-projects')}
              className="inline-flex items-center gap-2 text-indigo-100 hover:text-white text-xs font-semibold mb-4 transition-colors"
            >
              <ChevronLeft size={16} /> ย้อนกลับหน้ารายการโครงงาน
            </button>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug">รายละเอียดโครงงาน</h1>
            <div className="w-12 h-1 bg-white/30 my-3"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* 📄 Content Area */}
      <main className="max-w-5xl mx-auto w-full px-6 md:px-10 py-12 relative z-20 flex-grow space-y-8">
        
        {/* ส่วนข้อมูล (Data Block) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-[#EEF2FF] px-8 py-4 border-b border-slate-100 flex items-center gap-2">
            <Info size={18} className="text-[#3F51B5]" />
            <span className="text-[#3F51B5] font-bold text-sm">ข้อมูลโครงงาน</span>
          </div>
          
          <div className="p-8 md:p-10 space-y-6 text-[15px]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-y-6">
              <div className="md:col-span-3 font-bold text-slate-700">ชื่อโครงงาน (ภาษาไทย):</div>
              <div className="md:col-span-9 text-slate-800 font-bold leading-relaxed">{project.title_th}</div>

              {project.title_en && (
                <>
                  <div className="md:col-span-3 font-bold text-slate-700">ชื่อโครงงาน (ภาษาอังกฤษ):</div>
                  <div className="md:col-span-9 text-slate-600 italic font-medium leading-relaxed">{project.title_en}</div>
                </>
              )}

              <div className="md:col-span-3 font-bold text-slate-700 pt-1">อาจารย์ที่ปรึกษา:</div>
              <div className="md:col-span-9 text-slate-700 space-y-1.5">
                {project.advisor ? (
                  <div className="flex items-center gap-2 font-semibold text-indigo-700">
                    <span>{project.advisor.fullname_th}</span>
                    {project.advisor.lecturer_code && (
                      <span className="text-xs bg-indigo-50 px-2 py-0.5 rounded font-mono">
                        ({project.advisor.lecturer_code})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">ไม่ระบุ</span>
                )}

                {project.co_advisor && (
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <span className="text-slate-400 font-semibold">(ที่ปรึกษาร่วม)</span>
                    <span>{project.co_advisor.fullname_th}</span>
                    {project.co_advisor.lecturer_code && (
                      <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                        ({project.co_advisor.lecturer_code})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="md:col-span-3 font-bold text-slate-700 pt-1">รายชื่อนักศึกษาผู้จัดทำ:</div>
              <div className="md:col-span-9 text-slate-700 space-y-1.5">
                {studentList.length > 0 ? (
                  studentList.map((stu, i) => (
                    <div key={i} className="flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3F51B5]"></span>
                      <span>{stu}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-400 italic">ไม่ระบุ</span>
                )}
              </div>

              <div className="md:col-span-3 font-bold text-slate-700">ภาค/ปีการศึกษา:</div>
              <div className="md:col-span-9 text-slate-700">
                <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-[#3F51B5] text-xs font-bold rounded-lg border border-indigo-100">
                  {project.semester ? `ภาคเรียนที่ ${project.semester} / ` : ''}ปีการศึกษา {project.year || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนบทคัดย่อ (Abstract Block) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="bg-[#EEF2FF] px-8 py-4 border-b border-slate-100 flex items-center gap-2">
            <BookOpen size={18} className="text-[#3F51B5]" />
            <span className="text-[#3F51B5] font-bold text-sm">บทคัดย่อ (Abstract)</span>
          </div>
          <div className="p-8 md:p-10">
            {project.abstract ? (
              <div className="text-slate-600 leading-[2] text-justify whitespace-pre-line text-base font-normal">
                {project.abstract}
              </div>
            ) : (
              <div className="text-slate-400 italic text-sm py-4 text-center">
                อยู่ระหว่างจัดทำและรวบรวมบทคัดย่อ
              </div>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}