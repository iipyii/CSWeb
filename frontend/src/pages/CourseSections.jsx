import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  History,
  ChevronRight,
  Laptop,
} from "lucide-react";
import Footer from "../components/Footer";

export default function CourseSections() {
  const { level } = useParams(); // bachelor | cs-english | cs-master | se-master | doctor
  const navigate = useNavigate();

  // ==========================================
  // ข้อมูลแยกตามระดับและการประเภทหลักสูตร
  // ==========================================
  const educationLevels = {
    // 1. ปริญญาตรี ภาคปกติ
    bachelor: {
      label: "ปริญญาตรี",
      icon: <GraduationCap size={32} />,
      borderColor: "border-[#3F51B5]",
      current: [
        { id: "cs-normal-2564", title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2564)" },
        { id: "cs-normal-2559", title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2559)" },
        //{ id: "cs-edit-2559", title: "การปรับปรุงแก้ไขหลักสูตร สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรวิทยาศาสตรบัณฑิตปี 2559)" },
      ],
      old: [
        { id: "cs-old-2554", title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2554)" },
      ],
    },

    // 2. ปริญญาตรี โครงการพิเศษ สองภาษา
    "cs-english": {
      label: "ปริญญาตรี",
      icon: <Laptop size={32} />,
      borderColor: "border-orange-500",
      current: [
        { id: "cs-english-2564", title: "โครงการพิเศษ สองภาษา CSB พ.ศ. 2564" },
      ],
      old: [],
    },

    // 3. ปริญญาโท CS
    "cs-master": {
      label: "ปริญญาโท",
      icon: <BookOpen size={32} />,
      borderColor: "border-green-600",
      current: [
        { id: "cs-master-2567", title: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2567)" },
        { id: "cs-master-2562", title: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2562)" },
        { id: "cs-master-edit-2562", title: "การปรับปรุงแก้ไขหลักสูตร (หลักสูตรวิทยาศาสตรมหาบัณฑิตปี 2562)" },
      ],
      old: [],
    },

    // 4. ปริญญาโท SE
    "se-master": {
      label: "ปริญญาโท",
      icon: <BookOpen size={32} />,
      borderColor: "border-green-600",
      current: [
        { id: "se-master-2559", title: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์ (หลักสูตรใหม่ พ.ศ. 2559)" },
        { id: "se-master-edit-2559", title: "การปรับปรุงแก้ไขหลักสูตรวิทยาศาสตรมหาบัณฑิตปี 2559" },
      ],
      old: [],
    },

    // 5. ปริญญาเอก
    doctor: {
      label: "ปริญญาเอก",
      icon: <History size={32} />,
      borderColor: "border-purple-600",
      current: [
        { id: "cs-phd-2564", title: "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2564)" },
        { id: "cs-phd-edit-2559", title: "การปรับปรุงแก้ไขหลักสูตร ปรัชญาดุษฎีบัณฑิตปี 2559" },
      ],
      old: [],
    },
  };

  const currentLevel = educationLevels[level] || educationLevels.bachelor;

  return (
    <div className="bg-[#f8fafc] font-['Prompt'] min-h-screen flex flex-col">
      {/* Banner Header */}
      <div className="bg-[#183153] text-white py-8 shadow-lg">
        <div className="max-w-[1440px] mx-auto px-10">
          <h1 className="text-3xl font-medium mb-3 tracking-tight">
            {currentLevel.label}
          </h1>

          {/* Breadcrumbs ที่ปรับปรุงตามระดับการศึกษา */}
          <div className="flex items-center space-x-2 text-sm font-light opacity-90">
            <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              หน้าหลัก
            </Link>
            <ChevronRight size={14} className="opacity-40" />
            <span className="text-slate-100">หลักสูตร</span>
            <ChevronRight size={14} className="opacity-40" />
            <span className="text-slate-300">
              {(() => {
                // สำหรับ ป.โท CS (cs-master)
                if (level === "cs-master") return "สาขาวิชาวิทยาการคอมพิวเตอร์";
                
                // สำหรับ ป.โท SE (se-master)
                if (level === "se-master") return "สาขาวิชาวิศวกรรมซอฟต์แวร์";

                // กรณีโครงการพิเศษ สองภาษา
                if (level === "cs-english") return "สาขาวิชาวิทยาการคอมพิวเตอร์ (โครงการพิเศษ สองภาษา)"; 
                
                // กรณีปริญญาเอก
                if (level === "doctor") return "สาขาวิชาวิทยาการคอมพิวเตอร์"; 
                
                // กรณีปริญญาตรี ภาคปกติ
                return "สาขาวิชาวิทยาการคอมพิวเตอร์ (ภาคปกติ)";
              })()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-10 py-16 flex-grow w-full">
        <section className="mb-20">
          <div className={`flex items-center mb-10 space-x-3 border-l-8 ${currentLevel.borderColor} pl-5 bg-white py-4 rounded-r-2xl shadow-sm`}>
            <div className="text-[#3F51B5]">{currentLevel.icon}</div>
            <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
              {level === "cs-english" ? "รายละเอียดโครงการ" : "หลักสูตรปัจจุบัน"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentLevel.current.map((course) => (
              <SelectionCard
                key={course.id}
                title={course.title}
                onClick={() => navigate(`/course-detail/${course.id}`)}
              />
            ))}
          </div>
        </section>

        {currentLevel.old.length > 0 && (
          <section className="pb-10">
            <div className="flex items-center mb-10 space-x-3 border-l-8 border-slate-400 pl-5 bg-white py-4 rounded-r-2xl shadow-sm">
              <History className="text-slate-500" size={32} />
              <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wide">
                หลักสูตรเก่า
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {currentLevel.old.map((course) => (
                <SelectionCard
                  key={course.id}
                  title={course.title}
                  variant="old"
                  onClick={() => navigate(`/course-detail/${course.id}`)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}

function SelectionCard({ title, onClick, variant = "current" }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between p-6 bg-white rounded-[28px] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 text-left w-full"
    >
      <div className="flex flex-col flex-1 mr-4">
        <h4 className={`text-[18px] font-bold leading-tight transition-colors duration-300 ${
          variant === "current" ? "text-slate-800 group-hover:text-[#3F51B5]" : "text-slate-600 group-hover:text-slate-800"
        }`}>
          {title}
        </h4>
        <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-[#3F51B5] transition-colors">
          <span>รายละเอียดหลักสูตร</span>
          <ChevronRight size={16} className="ml-2 transform group-hover:translate-x-2 transition-transform" />
        </div>
      </div>
      <div className={`shrink-0 w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-500 shadow-inner ${
        variant === "current" ? "bg-blue-50 text-[#3F51B5] group-hover:bg-[#3F51B5] group-hover:text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-500 group-hover:text-white"
      }`}>
        <BookOpen size={28} />
      </div>
    </button>
  );
}