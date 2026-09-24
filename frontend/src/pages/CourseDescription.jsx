import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Search, ChevronDown, BookOpen, Layers, Filter, X, 
  ExternalLink, Sparkles, Check, Copy, Info 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Footer from "../components/Footer";

export default function CourseDescription() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("bachelor-normal");
  const [selectedYear, setSelectedYear] = useState("2569");
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalSubject, setActiveModalSubject] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || params.get('search') || "";
    if (q) {
      setSearchTerm(q);
    }
  }, [location.search]);

  // ข้อมูลหลักสูตรครบถ้วนทั้งใหม่และเก่า ตามโครงสร้างภาควิชาฯ
  const curriculumOptions = [
    {
      id: "bachelor-normal",
      label: "ปริญญาตรี ภาคปกติ (วท.บ.)",
      degree_level: "bachelor",
      years: [
        { year: "2569", code: "CS69", name: "หลักสูตรปรับปรุง พ.ศ. 2569 (ใหม่ล่าสุด)" },
        { year: "2564", code: "CS64", name: "หลักสูตรปรับปรุง พ.ศ. 2564" },
        { year: "2559", code: "CS59", name: "หลักสูตรปรับปรุง พ.ศ. 2559" },
        { year: "2554", code: "CS54", name: "หลักสูตร พ.ศ. 2554" }
      ]
    },
    {
      id: "bachelor-inter",
      label: "ปริญญาตรี โครงการพิเศษ สองภาษา (วท.บ.)",
      degree_level: "bachelor",
      years: [
        { year: "2564", code: "CS-Inter64", name: "โครงการพิเศษ สองภาษา พ.ศ. 2564" }
      ]
    },
    {
      id: "master-cs",
      label: "ปริญญาโท สาขาวิชาวิทยาการคอมพิวเตอร์ (วท.ม.)",
      degree_level: "master",
      years: [
        { year: "2567", code: "MS-CS67", name: "หลักสูตรปรับปรุง พ.ศ. 2567" },
        { year: "2562", code: "MS-CS62", name: "หลักสูตรปรับปรุง พ.ศ. 2562" }
      ]
    },
    {
      id: "master-se",
      label: "ปริญญาโท สาขาวิชาวิศวกรรมซอฟต์แวร์ (วท.ม.)",
      degree_level: "master",
      years: [
        { year: "2559", code: "MS-SE59", name: "หลักสูตรปรับปรุง พ.ศ. 2559" }
      ]
    },
    {
      id: "doctor-cs",
      label: "ปริญญาเอก สาขาวิชาวิทยาการคอมพิวเตอร์ (ปร.ด.)",
      degree_level: "doctor",
      years: [
        { year: "2564", code: "PhD-CS64", name: "หลักสูตรปรับปรุง พ.ศ. 2564" },
        { year: "2559", code: "PhD-CS59", name: "หลักสูตรปรับปรุง พ.ศ. 2559" }
      ]
    }
  ];

  // รายการกลุ่มวิชาชีพ (Track)
  const trackOptions = [
    { id: "all", label: "ทุกกลุ่มวิชาชีพ (All Tracks)" },
    { id: "Software Engineering & Cloud", label: "Software Engineering & Cloud" },
    { id: "Data Science & Artificial Intelligence", label: "Data Science & AI" },
    { id: "Network & Cybersecurity", label: "Network & Cybersecurity" },
    { id: "IoT & Intelligent Systems", label: "IoT & Intelligent Systems" },
    { id: "ทั่วไป", label: "วิชาแกน / ทั่วไป" }
  ];

  // เมื่อเปลี่ยนระดับหลักสูตร ให้เลือกปีแรกอัตโนมัติ
  const currentDegreeConfig = curriculumOptions.find(c => c.id === selectedDegree) || curriculumOptions[0];

  useEffect(() => {
    if (currentDegreeConfig && currentDegreeConfig.years.length > 0) {
      setSelectedYear(currentDegreeConfig.years[0].year);
    }
  }, [selectedDegree]);

  // ดึงข้อมูลรายวิชา
  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const selectedYearObj = currentDegreeConfig.years.find(y => y.year === selectedYear) || currentDegreeConfig.years[0];
      const params = {
        keyword: searchTerm.trim(),
        curriculum_year: selectedYear,
        degree_level: currentDegreeConfig.degree_level
      };

      if (selectedTrack !== "all") {
        params.track = selectedTrack;
      }
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      const res = await axios.get("http://localhost:5000/api/subjects", { params });
      setSubjects(res.data || []);
    } catch (err) {
      console.error("Fetch subjects error:", err);
      setSubjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDegree, selectedYear, selectedTrack, selectedCategory]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTrackBadgeClass = (track) => {
    switch (track) {
      case "Software Engineering & Cloud":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Data Science & Artificial Intelligence":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Network & Cybersecurity":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IoT & Intelligent Systems":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen flex flex-col text-left">
      {/* 🌟 Header Section */}
      <section className="bg-[#183153] text-white py-12 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold mb-2">
              <BookOpen size={18} />
              <span>หลักสูตรการศึกษา / คำอธิบายรายวิชา</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
              คำอธิบายรายวิชา (Course Descriptions)
            </h1>
            <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
              สืบค้นข้อมูลรายวิชา โครงสร้างหน่วยกิต วิชาบังคับก่อน (Prerequisite) และกลุ่มวิชาชีพ (Track) ครอบคลุมทั้งหลักสูตรปรับปรุงล่าสุดและหลักสูตรก่อนหน้า
            </p>
          </motion.div>
        </div>

        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none text-white">
          <h2 className="text-[6rem] font-bold">COURSES</h2>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 flex-grow space-y-8">
        {/* 🎛️ ตัวกรองหลักสูตรและค้นหา (Filter & Search Controls) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
          {/* แถบเลือกหลักสูตรและปี */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                ระดับหลักสูตร
              </label>
              <div className="relative">
                <select
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 focus:border-[#3F51B5] transition-all cursor-pointer"
                >
                  {curriculumOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                ปีหลักสูตร
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 focus:border-[#3F51B5] transition-all cursor-pointer"
                >
                  {currentDegreeConfig.years.map((y) => (
                    <option key={y.year} value={y.year}>{y.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                กลุ่มวิชาชีพ (Track)
              </label>
              <div className="relative">
                <select
                  value={selectedTrack}
                  onChange={(e) => setSelectedTrack(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 focus:border-[#3F51B5] transition-all cursor-pointer"
                >
                  {trackOptions.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                หมวดหมู่วิชา
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 focus:border-[#3F51B5] transition-all cursor-pointer"
                >
                  <option value="all">ทุกหมวดหมู่วิชา</option>
                  <option value="หมวดวิชาเฉพาะด้านบังคับ">หมวดวิชาเฉพาะด้านบังคับ</option>
                  <option value="หมวดวิชาเลือก">หมวดวิชาเลือก</option>
                  <option value="หมวดวิชาศึกษาทั่วไป">หมวดวิชาศึกษาทั่วไป</option>
                </select>
              </div>
            </div>
          </div>

          {/* แถบค้นหาข้อความ */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารหัสวิชา, ชื่อวิชา (ไทย/อังกฤษ) หรือคำอธิบายรายวิชา..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl py-4 pl-14 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-[#3F51B5]/20 focus:border-[#3F51B5] focus:bg-white transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 📊 สรุปผลการค้นหา */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">ผลการค้นหารายวิชา:</span>
            <span className="px-3 py-1 bg-[#3F51B5] text-white rounded-full text-xs font-black">
              {isLoading ? "กำลังโหลด..." : `${subjects.length} วิชา`}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              (หลักสูตรปี {selectedYear} • {currentDegreeConfig.label})
            </span>
          </div>

          {selectedYear === "2569" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold">
              <Sparkles size={14} className="text-amber-500" /> หลักสูตรใหม่ล่าสุด พ.ศ. 2569
            </span>
          )}
        </div>

        {/* 📋 ตารางรายวิชา (Table แยกฟิลด์อย่างละเอียด) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead className="bg-slate-50/70 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6 w-36">รหัสวิชา</th>
                  <th className="py-4 px-6">ชื่อวิชา (TH / EN)</th>
                  <th className="py-4 px-4 w-28 text-center">หน่วยกิต</th>
                  <th className="py-4 px-6 w-44">วิชาบังคับก่อน (Prerequisite)</th>
                  <th className="py-4 px-6 w-40">กลุ่มวิชาชีพ (Track)</th>
                  <th className="py-4 px-6 w-32 text-center">คำอธิบาย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">
                      กำลังดึงข้อมูลรายวิชา...
                    </td>
                  </tr>
                ) : subjects.length > 0 ? (
                  subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors group">
                      {/* รหัสวิชา */}
                      <td className="py-4 px-6 font-bold font-mono text-[#3F51B5] align-top">
                        <div className="flex items-center gap-1.5">
                          <span>{sub.subject_code}</span>
                          <button
                            onClick={() => copyToClipboard(sub.subject_code)}
                            title="คัดลอกรหัสวิชา"
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#3F51B5] transition-opacity"
                          >
                            {copiedCode === sub.subject_code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                          {sub.category || "วิชาเฉพาะ"}
                        </span>
                      </td>

                      {/* ชื่อวิชา */}
                      <td className="py-4 px-6 align-top">
                        <p className="font-bold text-slate-800 text-base">{sub.title_th}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{sub.title_en}</p>
                      </td>

                      {/* หน่วยกิต */}
                      <td className="py-4 px-4 align-top text-center">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold font-mono">
                          {sub.credit}
                        </span>
                      </td>

                      {/* วิชาบังคับก่อน */}
                      <td className="py-4 px-6 align-top">
                        {sub.prereq1 && sub.prereq1 !== "ไม่มี" ? (
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold font-mono">
                              {sub.prereq1}
                            </span>
                            {sub.prereq2 && (
                              <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold font-mono ml-1">
                                {sub.prereq2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">ไม่มี</span>
                        )}
                      </td>

                      {/* กลุ่มวิชาชีพ (Track) */}
                      <td className="py-4 px-6 align-top">
                        <span className={`inline-block px-2.5 py-1 border rounded-lg text-xs font-bold ${getTrackBadgeClass(sub.track)}`}>
                          {sub.track || "ทั่วไป"}
                        </span>
                      </td>

                      {/* ปุ่มดูคำอธิบาย */}
                      <td className="py-4 px-6 align-top text-center">
                        <button
                          onClick={() => setActiveModalSubject(sub)}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-[#3F51B5] text-[#3F51B5] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 mx-auto"
                        >
                          <Info size={14} /> รายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">
                      ไม่พบข้อมูลรายวิชาตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 🔍 Modal รายละเอียดและคำอธิบายรายวิชา (แยกฟิลด์อย่างชัดเจน) */}
      <AnimatePresence>
        {activeModalSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 p-6 md:p-8 relative text-left"
            >
              <button
                onClick={() => setActiveModalSubject(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#3F51B5] text-white rounded-full text-xs font-black font-mono">
                  {activeModalSubject.subject_code}
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase">
                  หน่วยกิต {activeModalSubject.credit}
                </span>
              </div>

              <h2 className="text-2xl font-black text-slate-800 mt-1">
                {activeModalSubject.title_th}
              </h2>
              <p className="text-sm font-semibold text-slate-500 mb-6">
                {activeModalSubject.title_en}
              </p>

              {/* ข้อมูลประกอบ */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 bg-slate-50 rounded-2xl text-xs">
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">วิชาบังคับก่อน</p>
                  <p className="font-bold text-slate-700 mt-0.5">
                    {activeModalSubject.prereq1 || "ไม่มี"}
                    {activeModalSubject.prereq2 ? `, ${activeModalSubject.prereq2}` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">กลุ่มวิชาชีพ (Track)</p>
                  <p className="font-bold text-[#3F51B5] mt-0.5">{activeModalSubject.track || "ทั่วไป"}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">หลักสูตร</p>
                  <p className="font-bold text-slate-700 mt-0.5">พ.ศ. {activeModalSubject.curriculum_year}</p>
                </div>
              </div>

              {/* คำอธิบายรายวิชาภาษาไทย */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#3F51B5]"></span> คำอธิบายรายวิชา (ภาษาไทย)
                  </h3>
                  <div className="p-4 bg-indigo-50/40 rounded-2xl text-sm leading-relaxed text-slate-700 border border-indigo-100/50">
                    {activeModalSubject.description_th || "ไม่มีข้อมูลคำอธิบายรายวิชาภาษาไทย"}
                  </div>
                </div>

                {/* คำอธิบายรายวิชาภาษาอังกฤษ */}
                {activeModalSubject.description_en && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400"></span> Course Description (English)
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-2xl text-sm leading-relaxed text-slate-600 border border-slate-200/60 font-sans">
                      {activeModalSubject.description_en}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveModalSubject(null)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}