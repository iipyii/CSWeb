import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ChevronLeft, ChevronRight, FileText, BookOpen, 
  Clock, Download, ExternalLink, GraduationCap, 
  Layers, AlertCircle, ArrowLeft, ArrowRight, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";

const getPdfUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  let clean = path.replace(/\\/g, "/").trim();
  if (!clean.startsWith("/")) clean = "/" + clean;
  if (!clean.startsWith("/uploads/")) clean = "/uploads" + clean;
  clean = clean.replace(/^\/uploads\/uploads\//, "/uploads/");
  return `http://localhost:5000${clean}`;
};

export default function CourseSectionContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/program-sections/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Section not found");
        return res.json();
      })
      .then((data) => {
        setSection(data);
      })
      .catch((err) => {
        console.error("Fetch section error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#f8fafc] min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center py-32 text-slate-500 gap-3">
          <Loader2 className="animate-spin text-[#183153]" size={36} />
          <span className="text-base font-medium">กำลังโหลดเอกสารหลักสูตร...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="bg-[#f8fafc] min-h-screen flex flex-col">
        <div className="flex-grow flex flex-col items-center justify-center p-10 text-center">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-full mb-4">
            <AlertCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">ไม่พบข้อมูลหมวดหลักสูตรนี้</h2>
          <p className="text-slate-500 text-sm mb-6">กรุณากลับไปเลือกหมวดหลักสูตรใหม่อีกครั้ง</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#183153] text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-slate-700 transition-colors inline-flex items-center gap-2 text-sm"
          >
            <ChevronLeft size={18} /> ย้อนกลับ
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const version = section.version;
  const program = version?.program;
  const degree = program?.degree;
  const allSections = version?.sections || [];
  
  // Find current index and prev/next
  const currentIndex = allSections.findIndex((s) => s.id === section.id);
  const prevSection = currentIndex > 0 ? allSections[currentIndex - 1] : null;
  const nextSection = currentIndex >= 0 && currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null;

  const pdfUrl = getPdfUrl(section.pdf_path);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      
      {/* 🏛️ Header Banner */}
      <div className="bg-[#183153] text-white pt-10 pb-16 shadow-lg">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 text-left">
          
          {/* Breadcrumbs */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs md:text-sm font-light opacity-90 mb-4">
            <Link to="/" className="text-blue-300 hover:text-blue-200 transition-colors">
              หน้าหลัก
            </Link>
            <ChevronRight size={14} className="opacity-40" />
            <Link 
              to={`/course-sections/${degree?.slug || 'bachelor'}`}
              className="text-blue-300 hover:text-blue-200 transition-colors"
            >
              หลักสูตร ({degree?.name_th || 'ปริญญาตรี'})
            </Link>
            <ChevronRight size={14} className="opacity-40" />
            <span className="text-slate-200">
              {program?.name_th || 'วิทยาการคอมพิวเตอร์'} (พ.ศ. {version?.year || '2564'})
            </span>
            <ChevronRight size={14} className="opacity-40" />
            <span className="text-amber-300 font-medium">
              {section.title}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-200 border border-blue-400/30 rounded-lg text-xs font-bold">
                  {program?.name_th || 'หลักสูตรวิทยาการคอมพิวเตอร์'}
                </span>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-lg text-xs font-bold">
                  พ.ศ. {version?.year}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {section.title}
              </h1>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm"
              >
                <ChevronLeft size={16} /> ย้อนกลับ
              </button>
              {pdfUrl && (
                <>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-sm"
                  >
                    <ExternalLink size={15} /> เปิดแท็บใหม่
                  </a>
                  <a
                    href={pdfUrl}
                    download
                    className="px-5 py-2.5 bg-[#3F51B5] hover:bg-[#2f3ea3] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-900/30"
                  >
                    <Download size={15} /> ดาวน์โหลด PDF
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📑 Main Content Area */}
      <main className="max-w-[1440px] mx-auto w-full px-6 md:px-10 -mt-8 mb-20 flex-grow relative z-20 space-y-6">
        
        {/* Sections Navigation Bar */}
        {allSections.length > 0 && (
          <div className="bg-white rounded-2xl p-3 shadow-md border border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-400 px-3 whitespace-nowrap flex items-center gap-1.5">
              <Layers size={15} className="text-[#3F51B5]" /> เลือกหมวด:
            </span>
            {allSections.map((s) => {
              const isActive = s.id === section.id;
              return (
                <button
                  key={s.id}
                  onClick={() => navigate(`/course-section/${s.id}`)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100 scale-105'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                  }`}
                >
                  <span>หมวด {s.section_no || s.order_index}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 📄 Interactive Embedded PDF Viewer Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-4 md:p-8 overflow-hidden">
          {pdfUrl ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <FileText size={16} className="text-[#3F51B5]" />
                  <span>เอกสารหลักสูตร มคอ.2 ฉบับทางการ</span>
                </div>
                <div className="text-xs text-slate-400">
                  หากเอกสารไม่แสดงผล กรุณาคลิก <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[#3F51B5] underline font-bold">เปิดดูเอกสาร PDF โดยตรง</a>
                </div>
              </div>

              {/* PDF Viewer Container */}
              <div className="w-full h-[78vh] min-h-[550px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/80 shadow-inner">
                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  title={section.title}
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          ) : (
            <div className="py-24 text-center space-y-3">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-600">ยังไม่มีเอกสาร PDF สำหรับหมวดนี้</h3>
              <p className="text-xs text-slate-400">กรุณาติดต่อผู้ดูแลระบบเพื่อทำการอัปโหลดเอกสาร มคอ.2</p>
            </div>
          )}
        </div>

        {/* 🔄 Next / Previous Section Navigation Card */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {prevSection ? (
            <button
              onClick={() => navigate(`/course-section/${prevSection.id}`)}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold shadow-sm border border-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} className="text-[#3F51B5]" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 uppercase font-medium">หมวดก่อนหน้า</div>
                <div>{prevSection.title}</div>
              </div>
            </button>
          ) : <div />}

          {nextSection && (
            <button
              onClick={() => navigate(`/course-section/${nextSection.id}`)}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#3F51B5] hover:bg-[#2f3ea3] text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 text-right"
            >
              <div className="text-right">
                <div className="text-[10px] text-indigo-200 uppercase font-medium">หมวดถัดไป</div>
                <div>{nextSection.title}</div>
              </div>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}