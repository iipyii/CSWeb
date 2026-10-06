import React, { useState, useEffect } from  'react';
import { useLanguage } from '../context/LanguageContext';
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  History,
  ChevronRight,
  Laptop,
  Loader2,
} from "lucide-react";
import axios from "axios";
import Footer from "../components/Footer";

// Fallback ข้อมูลเดิม เพื่อความต่อเนื่องหากโหลด API ไม่ทัน
const fallbackLevels = {
  bachelor: {
    label: "ปริญญาตรี",
    icon: <GraduationCap size={32} />,
    borderColor: "border-[#3F51B5]",
    current: [
      { id: "cs-normal-2569", title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2569)" },
      { id: "cs-normal-2564", title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2564)" },
      { id: "cs-normal-2559", title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2559)" },
    ],
    old: [
      { id: "cs-old-2554", title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (หลักสูตรปรับปรุง พ.ศ. 2554)" },
    ],
  },
  "cs-english": {
    label: "ปริญญาตรี",
    icon: <Laptop size={32} />,
    borderColor: "border-orange-500",
    current: [
      { id: "cs-english-2564", title: "โครงการพิเศษ สองภาษา CSB พ.ศ. 2564" },
    ],
    old: [],
  },
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

export default function CourseSections() {
  const { t, lang } = useLanguage();
  const { level } = useParams(); // bachelor | cs-english | cs-master | se-master | doctor
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [levelConfig, setLevelConfig] = useState(fallbackLevels[level] || fallbackLevels.bachelor);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/curriculum/programs");
        const allPrograms = res.data;

        if (Array.isArray(allPrograms) && allPrograms.length > 0) {
          // ค้นหา program ที่ตรงกับ level
          let targetProg = null;
          let degreeLabel = t('nav_bachelor');
          let icon = <GraduationCap size={32} />;
          let borderColor = "border-[#3F51B5]";

          if (level === "bachelor" || level === "regular") {
            targetProg = allPrograms.find(p => p.slug === "regular" || (p.degree?.slug === "bachelor" && p.slug !== "csb"));
            degreeLabel = lang === 'en' && targetProg?.degree?.name_en ? targetProg.degree.name_en : (targetProg?.degree?.name_th || t('nav_bachelor'));
            icon = <GraduationCap size={32} />;
            borderColor = "border-[#3F51B5]";
          } else if (level === "cs-english" || level === "csb") {
            targetProg = allPrograms.find(p => p.slug === "csb");
            degreeLabel = t('nav_bachelor');
            icon = <Laptop size={32} />;
            borderColor = "border-orange-500";
          } else if (level === "cs-master") {
            targetProg = allPrograms.find(p => p.slug === "ComputerScience");
            degreeLabel = targetProg?.degree?.name_th || "ปริญญาโท";
            icon = <BookOpen size={32} />;
            borderColor = "border-green-600";
          } else if (level === "se-master") {
            targetProg = allPrograms.find(p => p.slug === "SoftwareEngineering");
            degreeLabel = targetProg?.degree?.name_th || "ปริญญาโท";
            icon = <BookOpen size={32} />;
            borderColor = "border-green-600";
          } else if (level === "doctor" || level === "computersci") {
            targetProg = allPrograms.find(p => p.slug === "computersci" || p.degree?.slug === "doctor");
            degreeLabel = targetProg?.degree?.name_th || "ปริญญาเอก";
            icon = <History size={32} />;
            borderColor = "border-purple-600";
          } else {
            targetProg = allPrograms.find(p => p.slug === level || p.degree?.slug === level);
          }

          if (targetProg && targetProg.versions) {
            const currentList = [];
            const oldList = [];

            // จัดเรียงเวอร์ชันจากปีล่าสุด
            const sortedVersions = [...targetProg.versions].sort((a, b) => b.year - a.year);

            sortedVersions.forEach(v => {
              const hasEditSection = (v.sections || []).some(s => s.order_index === 88);
              const hasNormalSections = (v.sections || []).some(s => s.order_index !== 88);

              let titlePrefix = targetProg.name_th || "หลักสูตร";
              if (targetProg.slug === "regular") {
                titlePrefix = "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์";
              } else if (targetProg.slug === "csb") {
                titlePrefix = "โครงการพิเศษ สองภาษา CSB";
              } else if (targetProg.slug === "ComputerScience") {
                titlePrefix = "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์";
              } else if (targetProg.slug === "SoftwareEngineering") {
                titlePrefix = "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์";
              } else if (targetProg.slug === "computersci") {
                titlePrefix = "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์";
              }

              // ถ้าเป็นหลักสูตรปี 2554 ของ ป.ตรี ให้ใส่ไว้ในหลักสูตรเก่า
              const isOldYear = targetProg.slug === "regular" && v.year < 2559;

              // รายการหลักสูตรปกติ
              if (hasNormalSections || (targetProg.slug === "computersci" && v.year === 2564) || !hasEditSection) {
                const item = {
                  id: v.id, // ใช้ id จากฐานข้อมูล หรือ legacy slug
                  title: `${titlePrefix} (${v.year === 2559 && targetProg.slug === "SoftwareEngineering" ? "หลักสูตรใหม่ พ.ศ. " : "หลักสูตรปรับปรุง พ.ศ. "}${v.year})`
                };

                // รองรับ legacy identifier เพื่อความคุ้นเคย
                if (targetProg.slug === "regular") item.id = `cs-normal-${v.year}`;
                if (targetProg.slug === "csb") item.id = `cs-english-${v.year}`;
                if (targetProg.slug === "ComputerScience" && v.year === 2567) item.id = "cs-master-2567";
                if (targetProg.slug === "ComputerScience" && v.year === 2562) item.id = "cs-master-2562";
                if (targetProg.slug === "SoftwareEngineering" && v.year === 2559) item.id = "se-master-2559";
                if (targetProg.slug === "computersci" && v.year === 2564) item.id = "cs-phd-2564";

                if (isOldYear) {
                  oldList.push(item);
                } else {
                  currentList.push(item);
                }
              }

              // รายการปรับปรุงแก้ไขหลักสูตร (ถ้ามี section 88)
              if (hasEditSection) {
                let editId = `${targetProg.slug}-edit-${v.year}`;
                let editTitle = `การปรับปรุงแก้ไขหลักสูตร (${titlePrefix}ปี ${v.year})`;
                if (targetProg.slug === "ComputerScience" && v.year === 2562) {
                  editId = "cs-master-edit-2562";
                  editTitle = "การปรับปรุงแก้ไขหลักสูตร (หลักสูตรวิทยาศาสตรมหาบัณฑิตปี 2562)";
                } else if (targetProg.slug === "SoftwareEngineering" && v.year === 2559) {
                  editId = "se-master-edit-2559";
                  editTitle = "การปรับปรุงแก้ไขหลักสูตรวิทยาศาสตรมหาบัณฑิตปี 2559";
                } else if (targetProg.slug === "computersci" && v.year === 2559) {
                  editId = "cs-phd-edit-2559";
                  editTitle = "การปรับปรุงแก้ไขหลักสูตร ปรัชญาดุษฎีบัณฑิตปี 2559";
                }

                currentList.push({
                  id: editId,
                  title: editTitle
                });
              }
            });

            setLevelConfig({
              label: degreeLabel,
              icon,
              borderColor,
              current: currentList.length > 0 ? currentList : (fallbackLevels[level]?.current || []),
              old: oldList
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [level]);

  const currentLevel = levelConfig;

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      {/* Banner Header */}
      <div className="bg-[#183153] text-white py-8 shadow-lg">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <h1 className="text-3xl font-medium mb-3 tracking-tight">
            {currentLevel.label}
          </h1>

          {/* Breadcrumbs ที่ปรับปรุงตามระดับการศึกษา */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-light opacity-90">
            <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
              หน้าหลัก
            </Link>
            <ChevronRight size={14} className="opacity-40" />
            <span className="text-slate-100">หลักสูตร</span>
            <ChevronRight size={14} className="opacity-40" />
            <span className="text-slate-300">
              {(() => {
                if (level === "cs-master") return "สาขาวิชาวิทยาการคอมพิวเตอร์";
                if (level === "se-master") return "สาขาวิชาวิศวกรรมซอฟต์แวร์";
                if (level === "cs-english" || level === "csb") return "สาขาวิชาวิทยาการคอมพิวเตอร์ (โครงการพิเศษ สองภาษา)"; 
                if (level === "doctor") return "สาขาวิชาวิทยาการคอมพิวเตอร์"; 
                return "สาขาวิชาวิทยาการคอมพิวเตอร์ (ภาคปกติ)";
              })()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-16 flex-grow w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="animate-spin text-[#3F51B5]" size={36} />
            <span className="text-sm">กำลังโหลดข้อมูลหลักสูตร...</span>
          </div>
        ) : (
          <>
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
          </>
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
          <span>{t('course_details')}</span>
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