// src/pages/CourseDetail.jsx
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "../components/Footer";
import { courses } from "../data/courses";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentData = courses[id];

  if (!currentData) {
    return (
      <div className="bg-[#f8fafc] font-['Prompt'] min-h-screen flex flex-col items-center justify-center p-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          ไม่พบข้อมูลหลักสูตร (ID: {id})
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#183153] text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-slate-700 transition-colors"
        >
          กลับไปหน้าก่อนหน้า
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] font-['Prompt'] min-h-screen flex flex-col">
      {/* Banner Header สีน้ำเงินเข้ม */}
      <div className="bg-[#183153] text-white py-8 shadow-lg">
        <div className="max-w-[1440px] mx-auto px-10">
          <h1 className="text-3xl font-medium mb-3 tracking-tight">
            รายละเอียดหลักสูตร
          </h1>

          {/* Breadcrumbs ที่แสดงผลต่อเนื่องจากหน้า CourseSections */}
          <div className="flex items-center space-x-2 text-sm font-light opacity-90">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              หน้าหลัก
            </Link>
            <ChevronRight size={14} className="opacity-40" />

            <Link
              to={`/course-sections/${currentData.level || "bachelor"}`}
              className="hover:text-blue-400 transition-colors"
            >
              หลักสูตร
            </Link>
            <ChevronRight size={14} className="opacity-40" />
            
            {/* แสดงชื่อสาขาตาม level ที่ระบุไว้ในฐานข้อมูล */}
            <span className="">
              {(() => {
                const level = currentData.level;
                if (level === "cs-master") return "สาขาวิชาวิทยาการคอมพิวเตอร์";
                if (level === "se-master") return "สาขาวิชาวิศวกรรมซอฟต์แวร์";
                if (level === "cs-english") return "สาขาวิชาวิทยาการคอมพิวเตอร์ (โครงการพิเศษ สองภาษา)";
                if (level === "doctor") return "สาขาวิชาวิทยาการคอมพิวเตอร์";
                return "สาขาวิชาวิทยาการคอมพิวเตอร์ (ภาคปกติ)";
              })()}
            </span>

            <ChevronRight size={14} className="opacity-40" />
            <span className="text-slate-300 font-medium">{currentData.year}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-10 py-12 flex-grow w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#3F51B5] font-bold mb-8 group transition-all"
        >
          <div className="bg-white p-1.5 rounded-full shadow-sm mr-3 border border-gray-100 group-hover:shadow-md transition-all">
            <ChevronLeft size={18} />
          </div>
          ย้อนกลับ
        </button>

        {/* Card แสดงรายการหมวดหมู่ */}
        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-[#183153] mb-2 leading-tight">
            {currentData.title}
          </h2>
          {currentData.subtitle && (
            <p className="text-slate-500 mb-10 text-lg">{currentData.subtitle}</p>
          )}

          <div className="grid grid-cols-1 gap-4">
            {currentData.sections.map((section) => (
              <a
                key={section.id}
                href={section.pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl transition-all group hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-1.5 h-8 rounded-full bg-[#3F51B5]" />
                  <span className="text-lg font-medium text-slate-700 group-hover:text-[#183153] transition-colors">
                    {section.title}
                  </span>
                </div>

                <div className="text-slate-300 group-hover:text-[#183153] transition-all transform group-hover:scale-110">
                  <Eye size={22} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}