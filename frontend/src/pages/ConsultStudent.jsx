import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, GraduationCap, Mail, Filter, ExternalLink, 
  UserCheck, ArrowLeft, Phone, BookOpen, AlertCircle, X,
  ChevronDown, CheckCircle2, Sparkles, User
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function ConsultStudent() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // กำจัดกรณีที่ URL เป็น :code ตัวอักษรตรงๆ เพื่อไม่ให้เกิด Error แปลกๆ
  const activeCode = (code && code !== ":code" && code !== "all" && code.trim() !== "") 
    ? code.trim() 
    : null;

  useEffect(() => {
    if (code === ":code") {
      navigate('/consult-student', { replace: true });
    }
  }, [code, navigate]);

  // ============================================================
  // State: รายชื่ออาจารย์ที่ปรึกษาทั้งหมดสำหรับ Dropdown / Quick Select
  // ============================================================
  const [advisorsList, setAdvisorsList] = useState([]);
  const [selectedAdvisorCode, setSelectedAdvisorCode] = useState(activeCode || "");

  // ============================================================
  // State: ค้นหาทั่วไป
  // ============================================================
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [matchedAdvisor, setMatchedAdvisor] = useState(null);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // State: ข้อมูลนักศึกษาในความดูแลของอาจารย์ที่เลือก
  // ============================================================
  const [advisorData, setAdvisorData] = useState(null);
  const [advisorStudents, setAdvisorStudents] = useState([]);
  const [advisorSearch, setAdvisorSearch] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);

  const currentThaiYear = new Date().getFullYear() + 543;
  const futureYear = currentThaiYear + 1;
  const autoYears = [];
  for (let y = futureYear; y >= 2558; y--) {
    autoYears.push(String(y).slice(-2));
  }

  const studentCategories = [
    {
      level: "bachelor",
      levelTh: "ระดับปริญญาตรี",
      years: autoYears,
    },
    {
      level: "master",
      levelTh: "ระดับปริญญาโท",
      years: autoYears,
    },
    {
      level: "doctor",
      levelTh: "ระดับปริญญาเอก",
      years: autoYears,
    },
  ];

  const levelLabel = (level) => {
    if (level === "bachelor") return "ปริญญาตรี";
    if (level === "master") return "ปริญญาโท";
    if (level === "doctor") return "ปริญญาเอก";
    return level || "ปริญญาตรี";
  };

  // ดึงสรุปรายชื่ออาจารย์ทั้งหมดในภาควิชา
  useEffect(() => {
    axios.get("http://localhost:5000/api/consult/advisors-summary")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAdvisorsList(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load advisors summary:", err);
      });
  }, []);

  // ซิงค์ activeCode จาก URL เข้าสู่ selectedAdvisorCode
  useEffect(() => {
    if (activeCode) {
      setSelectedAdvisorCode(activeCode);
    }
  }, [activeCode]);

  // ดึงข้อมูลนักศึกษาในความดูแลเมื่อมีการเลือกอาจารย์
  useEffect(() => {
    if (!selectedAdvisorCode) {
      setAdvisorData(null);
      setAdvisorStudents([]);
      return;
    }

    setAdvisorLoading(true);

    axios.get(`http://localhost:5000/api/consult/advisor/${selectedAdvisorCode}`)
      .then((res) => {
        setAdvisorData(res.data.advisor);
        setAdvisorStudents(res.data.students || []);
      })
      .catch((err) => {
        console.error("Fetch advisor students error:", err);
        setAdvisorData(null);
        setAdvisorStudents([]);
      })
      .finally(() => {
        setAdvisorLoading(false);
      });
  }, [selectedAdvisorCode]);

  // ค้นหาอัจฉริยะ (Smart Search: รหัสนักศึกษา, ชื่อนามสกุลนักศึกษา, หรือชื่ออาจารย์)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const q = keyword.trim();
      if (!q) {
        setResults([]);
        setMatchedAdvisor(null);
        return;
      }

      setLoading(true);

      axios.get("http://localhost:5000/api/consult/search", {
        params: {
          q: q,
          level: levelFilter,
        },
      })
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setResults(list);
          setMatchedAdvisor(res.data?.matched_advisor || null);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setResults([]);
          setMatchedAdvisor(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [keyword, levelFilter]);

  // จัดกลุ่มผลการค้นหานักศึกษา
  const groupedResults = useMemo(() => {
    return results.reduce((acc, item) => {
      const lvl = item.level || (
        item.room?.toLowerCase().includes("m") ? "master" :
        item.room?.toLowerCase().includes("d") ? "doctor" : "bachelor"
      );
      const yr = item.admission_year || (
        item.student_id ? parseInt(item.student_id.slice(0, 2)) + 2500 : 2565
      );
      const key = `${lvl}-${yr}`;
      if (!acc[key]) {
        acc[key] = {
          level: lvl,
          admission_year: yr,
          students: [],
        };
      }
      acc[key].students.push({
        ...item,
        level: lvl,
        admission_year: yr
      });
      return acc;
    }, {});
  }, [results]);

  // กรองรายชื่อเฉพาะในความดูแลของอาจารย์ที่เลือก
  const filteredAdvisorStudents = useMemo(() => {
    if (!advisorSearch.trim()) return advisorStudents;
    const q = advisorSearch.toLowerCase().trim();
    return advisorStudents.filter(s => 
      s.student_id.toLowerCase().includes(q) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.firstname && s.firstname.toLowerCase().includes(q)) ||
      (s.lastname && s.lastname.toLowerCase().includes(q)) ||
      (s.room && s.room.toLowerCase().includes(q))
    );
  }, [advisorStudents, advisorSearch]);

  // ฟังก์ชันเลือกดูอาจารย์
  const handleSelectAdvisor = (advCode) => {
    setSelectedAdvisorCode(advCode);
    setAdvisorSearch("");
    if (advCode) {
      navigate(`/consult-student/${advCode}`);
    } else {
      navigate('/consult-student');
    }
  };

  const handleClearAdvisor = () => {
    setSelectedAdvisorCode("");
    setAdvisorData(null);
    setAdvisorStudents([]);
    navigate('/consult-student');
  };

  return (
    <div className="bg-slate-50/50 min-h-screen flex flex-col text-left">
      
      {/* 🌟 Header Section */}
      <section className="bg-gradient-to-r from-[#183153] via-[#234370] to-[#3F51B5] text-white py-12 px-6 relative overflow-hidden shadow-sm">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2 text-indigo-200 text-xs md:text-sm font-semibold uppercase tracking-wider">
              <Users size={18} />
              <span>บริการนักศึกษา / อาจารย์ที่ปรึกษา</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight">
              ระบบตรวจสอบและค้นหาอาจารย์ที่ปรึกษา
            </h1>
            
            <p className="text-white/80 text-xs md:text-sm max-w-3xl leading-relaxed">
              ให้นักศึกษาสามารถค้นหาว่าใครเป็นอาจารย์ที่ปรึกษาของตนเอง และให้อาจารย์สามารถตรวจสอบรายชื่อนักศึกษาทั้งหมดที่อยู่ในความดูแลได้อย่างสะดวกรวดเร็ว
            </p>

            {/* 💡 ทางลัดสำหรับอาจารย์ที่ล็อกอินอยู่ */}
            {user && (user.lecturer_code || user.role === 'lecturer') && (
              <div className="mt-5 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs md:text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <User size={16} className="text-amber-300" />
                  ยินดีต้อนรับอาจารย์ <strong>{user.full_name}</strong>
                </span>
                <button
                  onClick={() => handleSelectAdvisor(user.lecturer_code || String(user.lecturer_id || user.id))}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-3 py-1 rounded-xl text-xs transition-all shadow-sm"
                >
                  คลิกเพื่อดูนักศึกษาในความดูแลของฉัน
                </button>
              </div>
            )}
          </motion.div>
        </div>

        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[6rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 flex-grow space-y-8">

        {/* ============================================================ */}
        {/* 🔍 Unified Smart Search Box & Advisor Directory Dropdown      */}
        {/* ============================================================ */}
        <section className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 md:p-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
              <Search className="text-[#3F51B5]" size={20} />
              ค้นหารายชื่อนักศึกษา หรือค้นหาอาจารย์ที่ปรึกษา
            </h2>
            <span className="text-xs text-slate-400">
              ค้นหาได้ทั้งรหัสนักศึกษา, ชื่อ-นามสกุล, หรือชื่ออาจารย์
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* ช่องค้นหาหลัก (Smart Search) */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="ค้นหาด้วยรหัสนักศึกษา / ชื่อ-นามสกุล / ชื่ออาจารย์ที่ปรึกษา"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-10 text-xs md:text-sm outline-none focus:border-[#3F51B5] focus:bg-white focus:ring-2 focus:ring-[#3F51B5]/20 transition-all font-medium"
              />
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* ตัวเลือกดูตามอาจารย์ที่ปรึกษา (Advisor Directory Dropdown) */}
            <div className="md:col-span-4 relative">
              <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <select
                value={selectedAdvisorCode}
                onChange={(e) => handleSelectAdvisor(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-10 text-xs md:text-sm outline-none focus:border-[#3F51B5] focus:bg-white focus:ring-2 focus:ring-[#3F51B5]/20 transition-all font-medium cursor-pointer"
              >
                <option value="">-- เลือกดูตามรายชื่ออาจารย์ --</option>
                {advisorsList.map((adv) => (
                  <option key={adv.id} value={adv.lecturer_code}>
                    {adv.fullname_th} {adv.lecturer_code ? `(${adv.lecturer_code})` : ""} - นศ. {adv.advised_student_count} คน
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* ตัวกรองระดับการศึกษา */}
            <div className="md:col-span-2 relative">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3.5 px-4 text-xs md:text-sm outline-none focus:border-[#3F51B5] focus:bg-white focus:ring-2 focus:ring-[#3F51B5]/20 transition-all font-medium cursor-pointer text-slate-600"
              >
                <option value="all">ทุกระดับ</option>
                <option value="bachelor">ปริญญาตรี</option>
                <option value="master">ปริญญาโท</option>
                <option value="doctor">ปริญญาเอก</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 👨‍🏫 CASE 1: แสดงข้อมูลอาจารย์ที่ปรึกษาและนักศึกษาในความดูแล      */}
        {/* (แสดงเมื่อเลือกอาจารย์ หรือเมื่อคำค้นหาตรงกับอาจารย์ที่ปรึกษา)    */}
        {/* ============================================================ */}
        {(selectedAdvisorCode && advisorData) && (
          <motion.section 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-indigo-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
          >
            {/* Header การ์ดอาจารย์ */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-indigo-50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#183153] to-[#3F51B5] text-white flex items-center justify-center font-bold text-2xl shadow-md flex-shrink-0">
                  {advisorData.fullname_th ? advisorData.fullname_th.charAt(0) : "อ"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-[#183153] text-white uppercase">
                      {advisorData.lecturer_code || "ADVISOR"}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">อาจารย์ที่ปรึกษาประจำภาควิชา</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">
                    {advisorData.position_th || ""}{advisorData.fullname_th}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5">
                    {advisorData.email && (
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Mail size={14} className="text-[#3F51B5]" /> {advisorData.email}
                      </span>
                    )}
                    {advisorData.tel && (
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Phone size={14} className="text-[#3F51B5]" /> {advisorData.tel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-indigo-50/70 px-5 py-2.5 rounded-2xl border border-indigo-100 text-center">
                  <p className="text-[11px] text-indigo-700 font-bold uppercase">นักศึกษาในความดูแล</p>
                  <p className="text-2xl font-black text-[#183153]">
                    {advisorStudents.length} <span className="text-xs font-normal text-slate-500">คน</span>
                  </p>
                </div>
                <button
                  onClick={handleClearAdvisor}
                  className="flex items-center gap-1.5 px-4 py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
                  title="ปิดการเลือกอาจารย์"
                >
                  <X size={16} /> ล้างการเลือก
                </button>
              </div>
            </div>

            {/* ช่องค้นหาย่อยในกลุ่มนักศึกษาในความดูแล */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Users size={16} className="text-[#3F51B5]" />
                  รายชื่อนักศึกษาที่อยู่ในความดูแลของ อ.{advisorData.fullname_th}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  แสดง {filteredAdvisorStudents.length} จากทั้งหมด {advisorStudents.length} คน
                </span>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={advisorSearch}
                  onChange={(e) => setAdvisorSearch(e.target.value)}
                  placeholder="พิมพ์รหัสนักศึกษา, ชื่อ-นามสกุล หรือห้อง เพื่อกรองเฉพาะในกลุ่มนี้..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#3F51B5]"
                />
              </div>
            </div>

            {/* ตารางแสดงนักศึกษาในความดูแล */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              {advisorLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs">กำลังโหลดข้อมูลนักศึกษา...</div>
              ) : filteredAdvisorStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">รหัสนักศึกษา</th>
                        <th className="py-3 px-5">ชื่อ - นามสกุล</th>
                        <th className="py-3 px-5">ห้อง / ระดับ</th>
                        <th className="py-3 px-5">รุ่นปีการศึกษา</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAdvisorStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-indigo-50/30 transition-colors">
                          <td className="py-3 px-5 font-bold text-[#183153] font-mono">{st.student_id}</td>
                          <td className="py-3 px-5 font-medium text-slate-800">{st.name}</td>
                          <td className="py-3 px-5 text-slate-600">{st.room || st.level || "-"}</td>
                          <td className="py-3 px-5 text-slate-500">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-600">
                              รหัส {String(st.year || "").slice(-2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {advisorSearch ? "ไม่พบนักศึกษาที่ตรงกับคำค้นหาในกลุ่มนี้" : "ยังไม่มีข้อมูลนักศึกษาในความดูแล"}
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* ============================================================ */}
        {/* 🎓 CASE 2: ผลการค้นหาภาพรวม (จากกล่องค้นหาด้านบน)               */}
        {/* ============================================================ */}
        {keyword.trim() !== "" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                <Users size={18} className="text-[#3F51B5]" />
                <span>
                  ผลการค้นหา {loading ? "..." : `(พบ ${results.length} รายการ)`}
                </span>
              </div>
            </div>

            {loading && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
                กำลังค้นหาข้อมูล...
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">ไม่พบข้อมูลที่ตรงกับคำค้นหา "{keyword}"</p>
                <p className="text-xs text-slate-400">
                  กรุณาตรวจสอบการสะกดชื่อ-นามสกุล หรือลองค้นหาด้วยรหัสนักศึกษา / รหัสอาจารย์
                </p>
              </div>
            )}

            {/* แสดงการ์ดผลการค้นหานักศึกษา */}
            {!loading && results.length > 0 && (
              <div className="space-y-4">
                {Object.values(groupedResults).map((group, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="bg-[#EEF2FF] px-5 py-3 border-b border-slate-200 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-[#3F51B5] font-bold text-xs md:text-sm">
                        <GraduationCap size={18} />
                        <span>
                          ระดับ{levelLabel(group.level)} • รหัส {String(group.admission_year || "").slice(-2)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">({group.students.length} คน)</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {group.students.map((student, idx) => (
                        <div
                          key={idx}
                          className="p-5 hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            {/* ข้อมูลนักศึกษา */}
                            <div className="md:col-span-5">
                              <p className="text-[11px] text-slate-400 font-semibold mb-0.5">นักศึกษา</p>
                              <h3 className="font-bold text-slate-800 text-sm md:text-base">
                                {student.title}
                                {student.firstname} {student.lastname}
                              </h3>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">
                                รหัส: <span className="font-bold text-[#183153]">{student.student_id}</span> • ห้อง: {student.room || "-"} • ระดับ{levelLabel(student.level)}
                              </p>
                            </div>

                            {/* อาจารย์ที่ปรึกษา */}
                            <div className="md:col-span-5">
                              <p className="text-[11px] text-slate-400 font-semibold mb-0.5">อาจารย์ที่ปรึกษา</p>
                              {student.advisor?.fullname_th ? (
                                <div>
                                  <button
                                    onClick={() => handleSelectAdvisor(student.advisor.lecturer_code || student.advisor.fullname_th)}
                                    className="text-xs md:text-sm font-bold text-[#183153] hover:text-[#3F51B5] hover:underline flex items-center gap-1.5 transition-colors text-left"
                                  >
                                    <UserCheck size={15} className="text-[#3F51B5]" />
                                    <span>{student.advisor.fullname_th}</span>
                                    {student.advisor.lecturer_code && (
                                      <span className="px-1.5 py-0.2 bg-indigo-50 text-[#3F51B5] text-[10px] rounded border border-indigo-100">
                                        {student.advisor.lecturer_code}
                                      </span>
                                    )}
                                  </button>
                                  {student.advisor?.email && (
                                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                      <Mail size={12} className="text-slate-400" />
                                      {student.advisor.email}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">ยังไม่ระบุอาจารย์ที่ปรึกษา</p>
                              )}
                            </div>

                            {/* ปุ่มการกระทำ */}
                            <div className="md:col-span-2 flex md:justify-end">
                              {student.advisor?.lecturer_code && (
                                <button
                                  onClick={() => handleSelectAdvisor(student.advisor.lecturer_code)}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-[#3F51B5] hover:bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-all"
                                >
                                  ดูเพื่อนร่วมกลุ่ม
                                  <ExternalLink size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============================================================ */}
        {/* 📚 Browse by Year (คงไว้เหมือนเดิม 100%)                       */}
        {/* ============================================================ */}
        <section className="pt-4 space-y-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-1">
              เลือกดูตามระดับและรหัสนักศึกษา (Browse by Year)
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              สำหรับการเปิดดูรายชื่อนักศึกษาและอาจารย์ที่ปรึกษาแบบแยกตามรุ่นปีการศึกษา
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studentCategories.map((cat, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white"
              >
                <div className="bg-[#183153] text-white py-3.5 px-5 text-center font-bold text-sm">
                  {cat.levelTh}
                </div>

                <div className="p-4 flex flex-wrap gap-2.5">
                  {cat.years.map((year, yIdx) => (
                    <Link
                      key={yIdx}
                      to={`/consult-detail/${cat.level}/${year}`}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-[#3F51B5] hover:text-[#3F51B5] transition-all"
                    >
                      รหัส {year}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}