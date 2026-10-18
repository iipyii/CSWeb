import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { 
  Search, ChevronDown, BookOpen, Layers, Filter, X, 
  ExternalLink, Sparkles, Check, Copy, Info 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Footer from "../components/Footer";
import { cleanThaiDisplay } from "../utils/thaiText";

// รายการหลักสูตรตั้งต้น (Fallback หากยังโหลด API ไม่เสร็จ)
const DEFAULT_RAW_CURRICULUMS = [
  { code: 'CS69', label: 'CS69 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2569)', year: 2569, degree: 'bachelor' },
  { code: 'CS64', label: 'CS64 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2564)', year: 2564, degree: 'bachelor' },
  { code: 'CSB64', label: 'CSB64 - โครงการพิเศษ สองภาษา (พ.ศ. 2564)', year: 2564, degree: 'bachelor' },
  { code: 'CS59', label: 'CS59 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2559)', year: 2559, degree: 'bachelor' },
  { code: 'CS54', label: 'CS54 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2554)', year: 2554, degree: 'bachelor' },
  { code: 'MS-CS67', label: 'MS-CS67 - วท.ม. วิทยาการคอมพิวเตอร์ (พ.ศ. 2567)', year: 2567, degree: 'master' },
  { code: 'MS-CS62', label: 'MS-CS62 - วท.ม. วิทยาการคอมพิวเตอร์ (พ.ศ. 2562)', year: 2562, degree: 'master' },
  { code: 'MS-SE59', label: 'MS-SE59 - วท.ม. วิศวกรรมซอฟต์แวร์ (พ.ศ. 2559)', year: 2559, degree: 'master' },
  { code: 'PhD-CS64', label: 'PhD-CS64 - ปร.ด. วิทยาการคอมพิวเตอร์ (พ.ศ. 2564)', year: 2564, degree: 'doctorate' }
];

export default function CourseDescription() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("all");
  const [selectedCurriculumCode, setSelectedCurriculumCode] = useState("all");
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeDegreeTab, setActiveDegreeTab] = useState("all");
  
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModalSubject, setActiveModalSubject] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // ดึงรายการหลักสูตรและปีแบบไดนามิกจากฐานข้อมูล
  const [rawCurriculums, setRawCurriculums] = useState(DEFAULT_RAW_CURRICULUMS);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const res = await axios.get("/api/subjects/curriculums");
        if (Array.isArray(res.data) && res.data.length > 0) {
          setRawCurriculums(res.data);
        }
      } catch (err) {
        console.warn("Failed to load curriculums, using defaults:", err);
      }
    };
    fetchCurriculums();
  }, []);

  // สร้างตัวเลือกหลักสูตรและปีแบบไดนามิกตามกลุ่มระดับการศึกษา
  const curriculumOptions = useMemo(() => {
    const bachelorItems = rawCurriculums.filter(c => c.degree === 'bachelor');
    const bachelorNormal = bachelorItems.filter(c => !c.code?.toLowerCase().includes('csb'));
    const bachelorCsb = bachelorItems.filter(c => c.code?.toLowerCase().includes('csb'));
    const masterItems = rawCurriculums.filter(c => c.degree === 'master');
    const masterCs = masterItems.filter(c => !c.code?.toLowerCase().includes('se'));
    const masterSe = masterItems.filter(c => c.code?.toLowerCase().includes('se'));
    const doctorItems = rawCurriculums.filter(c => c.degree === 'doctor' || c.degree === 'doctorate');

    return [
      {
        id: "all",
        label: "ทุกระดับการศึกษา (ปริญญาตรี / โท / เอก ทั้งหมด)",
        degree_level: "all",
        curriculums: [
          { code: "all", name: "ทุกปีหลักสูตร (ทั้งหมด)" },
          ...rawCurriculums.map(item => ({
            code: item.code,
            year: item.year,
            name: item.label ? item.label : `${item.code} (พ.ศ. ${item.year})`
          }))
        ]
      },
      {
        id: "bachelor-all",
        label: "ปริญญาตรี ทั้งหมด (วท.บ.)",
        degree_level: "bachelor",
        curriculums: [
          { code: "all", name: "ทุกปีหลักสูตรปริญญาตรี" },
          ...bachelorItems.map(item => ({
            code: item.code,
            year: item.year,
            name: item.label ? item.label : `${item.code} (พ.ศ. ${item.year})`
          }))
        ]
      },
      {
        id: "bachelor-normal",
        label: "ปริญญาตรี ภาคปกติ (วท.บ.)",
        degree_level: "bachelor",
        curriculum_code_filter: bachelorNormal.map(c => c.code).join(','),
        curriculums: [
          { code: "all", name: "ทุกปีหลักสูตรภาคปกติ" },
          ...bachelorNormal.map(item => ({
            code: item.code,
            year: item.year,
            name: item.label ? item.label : `${item.code} (พ.ศ. ${item.year})`
          }))
        ]
      },
      {
        id: "bachelor-csb",
        label: "ปริญญาตรี โครงการพิเศษ สองภาษา (CSB)",
        degree_level: "bachelor",
        curriculum_code_filter: bachelorCsb.map(c => c.code).join(','),
        curriculums: [
          { code: "all", name: "ทุกปีหลักสูตรโครงการพิเศษ (CSB)" },
          ...bachelorCsb.map(item => ({
            code: item.code,
            year: item.year,
            name: item.label ? item.label : `${item.code} (พ.ศ. ${item.year})`
          }))
        ]
      },
      {
        id: "master-all",
        label: "ปริญญาโท ทั้งหมด (วท.ม.)",
        degree_level: "master",
        curriculums: [
          { code: "all", name: "ทุกปีหลักสูตรปริญญาโท" },
          ...masterItems.map(item => ({
            code: item.code,
            year: item.year,
            name: item.label ? item.label : `${item.code} (พ.ศ. ${item.year})`
          }))
        ]
      },
      {
        id: "master-cs",
        label: "ปริญญาโท สาขาวิชาวิทยาการคอมพิวเตอร์ (วท.ม.)",
        degree_level: "master",
        curriculum_code_filter: masterCs.map(c => c.code).join(','),
        curriculums: [
          { code: "all", name: "ทุกปีหลักสูตร CS ปริญญาโท" },
          ...masterCs.map(item => ({
            code: item.code,
            year: item.year,
            name: item.label ? item.label : `${item.code} (พ.ศ. ${item.year})`
          }))
        ]
      },
      {
        id: "master-se",
        label: "ปริญญาโท สาขาวิชาวิศวกรรมซอฟต์แวร์ (วท.ม.)",
        degree_level: "master",
        curriculum_code_filter: masterSe.map(c => c.code).join(','),
        curriculums: [
          { code: "all", name: "ทุกปีหลักสูตร SE ปริญญาโท" },
          ...masterSe.map(item => ({
            code: item.code,
            year: item.year,
            name: item.label ? item.label : `${item.code} (พ.ศ. ${item.year})`
          }))
        ]
      },
      {
        id: "doctor-all",
        label: "ปริญญาเอก ทั้งหมด (ปร.ด.)",
        degree_level: "doctor",
        curriculums: [
          { code: "all", name: "ทุกปีหลักสูตรปริญญาเอก" },
          ...doctorItems.map(item => ({
            code: item.code,
            year: item.year,
            name: item.label ? item.label : `${item.code} (พ.ศ. ${item.year})`
          }))
        ]
      },
      {
        id: "doctor-cs",
        label: "ปริญญาเอก สาขาวิชาวิทยาการคอมพิวเตอร์ (ปร.ด.)",
        degree_level: "doctor",
        curriculum_code_filter: doctorItems.map(c => c.code).join(','),
        curriculums: [
          { code: "all", name: "ทุกปีหลักสูตร CS ปริญญาเอก" },
          ...doctorItems.map(item => ({
            code: item.code,
            year: item.year,
            name: item.label ? item.label : `${item.code} (พ.ศ. ${item.year})`
          }))
        ]
      }
    ];
  }, [rawCurriculums]);

  // รายการกลุ่มวิชาชีพ (Track)
  const trackOptions = [
    { id: "all", label: "ทุกกลุ่มวิชาชีพ (All Tracks)" },
    { id: "Software Engineering & Cloud", label: "Software Engineering & Cloud" },
    { id: "Data Science & Artificial Intelligence", label: "Data Science & AI" },
    { id: "Network & Cybersecurity", label: "Network & Cybersecurity" },
    { id: "IoT & Intelligent Systems", label: "IoT & Intelligent Systems" },
    { id: "ทั่วไป", label: "วิชาแกน / ทั่วไป" }
  ];

  // รายการหมวดหมู่วิชา
  const categoryOptions = [
    { id: "all", label: "ทุกหมวดหมู่วิชา" },
    { id: "หมวดวิชาเฉพาะด้านบังคับ", label: "หมวดวิชาเฉพาะด้านบังคับ" },
    { id: "หมวดวิชาบังคับ", label: "หมวดวิชาบังคับ / วิชาแกน" },
    { id: "หมวดวิชาเลือก", label: "หมวดวิชาเลือก" },
    { id: "หมวดโครงงาน/วิทยานิพนธ์", label: "หมวดโครงงาน / วิทยานิพนธ์ / สารนิพนธ์" },
    { id: "หมวดสัมมนา", label: "หมวดสัมมนา" },
    { id: "หมวดฝึกงานและสหกิจศึกษา", label: "หมวดฝึกงานและสหกิจศึกษา" },
    { id: "หมวดวิชาศึกษาทั่วไป", label: "หมวดวิชาศึกษาทั่วไป" }
  ];

  // เมื่อเปลี่ยนระดับหลักสูตร
  const currentDegreeConfig = curriculumOptions.find(c => c.id === selectedDegree) || curriculumOptions[0];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || params.get('search') || "";
    const code = params.get('code') || "";
    const year = params.get('year') || "";
    const degree = params.get('degree') || "";

    if (q) {
      setSearchTerm(q);
    }

    if (code) {
      for (const deg of curriculumOptions) {
        const foundCurriculum = deg.curriculums.find(y => y.code.toLowerCase() === code.toLowerCase());
        if (foundCurriculum) {
          setSelectedDegree(deg.id);
          setSelectedCurriculumCode(foundCurriculum.code);
          return;
        }
      }
    }

    if (degree) {
      if (degree === 'master') {
        setSelectedDegree('master-all');
      } else if (degree === 'doctor') {
        setSelectedDegree('doctor-all');
      } else if (degree === 'bachelor') {
        setSelectedDegree('bachelor-normal');
      }
    }
  }, [location.search, curriculumOptions]);

  useEffect(() => {
    if (currentDegreeConfig && currentDegreeConfig.curriculums.length > 0) {
      const hasCurrentCode = currentDegreeConfig.curriculums.some(c => c.code === selectedCurriculumCode);
      if (!hasCurrentCode) {
        setSelectedCurriculumCode("all");
      }
    }
  }, [selectedDegree]);

  useEffect(() => {
    setActiveDegreeTab("all");
  }, [selectedDegree, selectedCurriculumCode]);

  // ดึงข้อมูลรายวิชาตามตัวกรองที่เลือกอย่างเคร่งครัด
  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const q = searchTerm.trim();
      const params = {};

      if (q) {
        params.keyword = q;
      }

      // กรองตามรหัสหลักสูตรที่เลือก
      if (selectedCurriculumCode && selectedCurriculumCode !== "all") {
        params.curriculum_code = selectedCurriculumCode;
      } else {
        // กรองตามระดับการศึกษา (ถ้าไม่ได้เลือก 'all')
        if (currentDegreeConfig && currentDegreeConfig.degree_level !== "all") {
          params.degree_level = currentDegreeConfig.degree_level;
        }

        // กรองตามกลุ่มรหัสหลักสูตรเฉพาะทาง (เช่น ภาคปกติ CS69,CS64 หรือ สองภาษา CSB64)
        if (currentDegreeConfig?.curriculum_code_filter) {
          params.curriculum_code = currentDegreeConfig.curriculum_code_filter;
        }
      }

      if (selectedTrack !== "all") {
        params.track = selectedTrack;
      }
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      const res = await axios.get("/api/subjects", { params });
      const data = (res.data || []).map(s => ({
        ...s,
        title_th: cleanThaiDisplay(s.title_th),
        description_th: cleanThaiDisplay(s.description_th)
      }));

      setSubjects(data);
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
  }, [searchTerm, selectedDegree, selectedCurriculumCode, selectedTrack, selectedCategory]);

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

  // กรองรายวิชาตาม Degree Tab ที่เลือกบนหน้าจอ
  const bachelorCount = subjects.filter(s => s.degree_level === 'bachelor').length;
  const masterCount = subjects.filter(s => s.degree_level === 'master').length;
  const doctorCount = subjects.filter(s => s.degree_level === 'doctor').length;

  const displayedSubjects = activeDegreeTab === "all" 
    ? subjects 
    : subjects.filter(s => s.degree_level === activeDegreeTab);

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
                  value={selectedCurriculumCode}
                  onChange={(e) => setSelectedCurriculumCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 focus:border-[#3F51B5] transition-all cursor-pointer"
                >
                  {currentDegreeConfig.curriculums.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
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
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
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
              placeholder="ค้นหารหัสวิชา, ชื่อวิชา (ไทย/อังกฤษ) หรือคำอธิบายรายวิชา (เช่น 040635201, ความมั่นคงไซเบอร์, วิจัย)..."
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

        {/* 🏷️ แถบสลับระดับการศึกษา (Quick Degree Tabs) & สรุปผลการค้นหา */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          {/* Degree Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveDegreeTab("all")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeDegreeTab === "all"
                  ? "bg-[#183153] text-white shadow-md shadow-slate-900/10"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>ทั้งหมด</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeDegreeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
              }`}>
                {subjects.length}
              </span>
            </button>

            <button
              onClick={() => setActiveDegreeTab("bachelor")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeDegreeTab === "bachelor"
                  ? "bg-[#3F51B5] text-white shadow-md shadow-indigo-600/10"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span>ปริญญาตรี (วท.บ.)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeDegreeTab === "bachelor" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"
              }`}>
                {bachelorCount}
              </span>
            </button>

            <button
              onClick={() => setActiveDegreeTab("master")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeDegreeTab === "master"
                  ? "bg-purple-700 text-white shadow-md shadow-purple-900/10"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>ปริญญาโท (วท.ม.)</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeDegreeTab === "master" ? "bg-white/20 text-white" : "bg-purple-50 text-purple-700"
              }`}>
                {masterCount}
              </span>
            </button>

            {doctorCount > 0 && (
              <button
                onClick={() => setActiveDegreeTab("doctor")}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeDegreeTab === "doctor"
                    ? "bg-rose-700 text-white shadow-md shadow-rose-900/10"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>ปริญญาเอก (ปร.ด.)</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeDegreeTab === "doctor" ? "bg-white/20 text-white" : "bg-rose-50 text-rose-700"
                }`}>
                  {doctorCount}
                </span>
              </button>
            )}
          </div>

          {/* สรุปจำนวน */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>แสดงผล: <strong className="text-slate-800">{displayedSubjects.length}</strong> รายวิชา</span>
            {searchTerm && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                ค้นหา: "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* 📋 ตารางรายวิชา (Table แยกฟิลด์อย่างละเอียด) */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead className="bg-slate-50/70 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6 w-44">รหัสวิชา & ระดับ</th>
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
                ) : displayedSubjects.length > 0 ? (
                  displayedSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-indigo-50/30 transition-colors group">
                      {/* รหัสวิชา & ระดับการศึกษา */}
                      <td className="py-4 px-6 font-bold font-mono text-[#3F51B5] align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{sub.subject_code}</span>
                          <button
                            onClick={() => copyToClipboard(sub.subject_code)}
                            title="คัดลอกรหัสวิชา"
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-[#3F51B5] transition-opacity"
                          >
                            {copiedCode === sub.subject_code ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        
                        {/* ป้ายกำกับระดับหลักสูตร */}
                        <div className="mt-1 flex flex-wrap gap-1 items-center">
                          {sub.degree_level === 'master' ? (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 font-bold rounded text-[10px]">
                              ป.โท วท.ม.
                            </span>
                          ) : sub.degree_level === 'doctor' ? (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded text-[10px]">
                              ป.เอก ปร.ด.
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded text-[10px]">
                              ป.ตรี วท.บ.
                            </span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">
                            {sub.curriculum_code || `ปี ${sub.curriculum_year}`}
                          </span>
                        </div>

                        <span className="text-[10px] font-medium text-slate-400 block mt-1">
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
                      <div className="max-w-md mx-auto space-y-3 px-4">
                        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                          <Info size={24} />
                        </div>
                        <p className="text-slate-700 font-bold text-base">
                          ไม่พบข้อมูลรายวิชาที่ตรงกับเงื่อนไข
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {searchTerm && (
                            <>
                              คำค้นหา <strong className="text-slate-800 font-mono">"{searchTerm}"</strong>{" "}
                            </>
                          )}
                          {selectedCurriculumCode !== 'all' ? (
                            <>ไม่มีอยู่ในหลักสูตร <strong className="text-slate-800 font-semibold">{selectedCurriculumCode}</strong></>
                          ) : (
                            <>ไม่พบในตัวกรองหลักสูตรที่เลือก</>
                          )}
                        </p>
                        {(selectedCurriculumCode !== 'all' || selectedDegree !== 'all' || selectedTrack !== 'all' || selectedCategory !== 'all' || searchTerm) && (
                          <div className="pt-2 flex flex-wrap justify-center gap-2">
                            {selectedCurriculumCode !== 'all' && (
                              <button
                                onClick={() => setSelectedCurriculumCode("all")}
                                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#3F51B5] text-xs font-bold rounded-xl transition-all shadow-sm"
                              >
                                ค้นหาในทุกหลักสูตร
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedDegree("all");
                                setSelectedCurriculumCode("all");
                                setSelectedTrack("all");
                                setSelectedCategory("all");
                                setSearchTerm("");
                              }}
                              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all"
                            >
                              ล้างตัวกรองทั้งหมด
                            </button>
                          </div>
                        )}
                      </div>
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

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-[#3F51B5] text-white rounded-full text-xs font-black font-mono">
                  {activeModalSubject.subject_code}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  activeModalSubject.degree_level === 'master'
                    ? "bg-purple-100 text-purple-700"
                    : activeModalSubject.degree_level === 'doctor'
                    ? "bg-rose-100 text-rose-700"
                    : "bg-indigo-100 text-indigo-700"
                }`}>
                  {activeModalSubject.degree_level === 'master'
                    ? "ระดับปริญญาโท (วท.ม.)"
                    : activeModalSubject.degree_level === 'doctor'
                    ? "ระดับปริญญาเอก (ปร.ด.)"
                    : "ระดับปริญญาตรี (วท.บ.)"}
                </span>
                <span className="text-xs text-slate-400 font-bold uppercase ml-auto">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-slate-50 rounded-2xl text-xs">
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
                  <p className="font-bold text-slate-700 mt-0.5">
                    {activeModalSubject.curriculum_code || `พ.ศ. ${activeModalSubject.curriculum_year}`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">หมวดหมู่</p>
                  <p className="font-bold text-slate-700 mt-0.5">{activeModalSubject.category || "วิชาเฉพาะ"}</p>
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