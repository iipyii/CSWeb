import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Users, GraduationCap, Mail, ExternalLink, 
  UserCheck, ArrowLeft, Phone, BookOpen, AlertCircle, X,
  ChevronDown, CheckCircle2, Sparkles, User, Copy, Check,
  ArrowRight, Filter, ChevronRight
} from "lucide-react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function ConsultStudent() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // กำจัดกรณีที่ URL เป็น :code ตัวอักษรตรงๆ เพื่อไม่ให้เกิด Error
  const activeCode = (code && code !== ":code" && code !== "all" && code.trim() !== "") 
    ? code.trim() 
    : null;

  useEffect(() => {
    if (code === ":code") {
      navigate('/consult-student', { replace: true });
    }
  }, [code, navigate]);

  // ============================================================
  // Active Tab State: 'search' (สำหรับนักศึกษา), 'advisor' (ตามอาจารย์), 'year' (ตามรุ่นปี)
  // ============================================================
  const initialTab = activeCode 
    ? 'advisor' 
    : (searchParams.get('tab') === 'advisor' ? 'advisor' : searchParams.get('tab') === 'year' ? 'year' : 'search');
  const [activeTab, setActiveTab] = useState(initialTab);

  // ============================================================
  // State: รายชื่ออาจารย์ที่ปรึกษาทั้งหมด
  // ============================================================
  const [advisorsList, setAdvisorsList] = useState([]);
  const [selectedAdvisorCode, setSelectedAdvisorCode] = useState(activeCode || "");
  const [advisorDirectorySearch, setAdvisorDirectorySearch] = useState("");

  // ============================================================
  // State: ค้นหาตามนักศึกษา (Tab 1)
  // ============================================================
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [matchedAdvisor, setMatchedAdvisor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ============================================================
  // State: ข้อมูลนักศึกษาในความดูแลของอาจารย์ที่เลือก (Tab 2)
  // ============================================================
  const [advisorData, setAdvisorData] = useState(null);
  const [advisorStudents, setAdvisorStudents] = useState([]);
  const [advisorSearch, setAdvisorSearch] = useState("");
  const [advisorLevelFilter, setAdvisorLevelFilter] = useState("all");
  const [advisorYearFilter, setAdvisorYearFilter] = useState("all");
  const [advisorLoading, setAdvisorLoading] = useState(false);

  // State: คัดลอกรหัสนักศึกษา
  const [copiedId, setCopiedId] = useState(null);

  // คำนวณปี พ.ศ. สำหรับ Tab 3 (Browse by Year)
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
      color: "from-blue-600 to-indigo-700",
      badgeBg: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      level: "master",
      levelTh: "ระดับปริญญาโท",
      years: autoYears,
      color: "from-indigo-600 to-purple-700",
      badgeBg: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
      level: "doctor",
      levelTh: "ระดับปริญญาเอก",
      years: autoYears,
      color: "from-purple-600 to-rose-700",
      badgeBg: "bg-rose-50 text-rose-700 border-rose-200"
    },
  ];

  const levelLabel = (level) => {
    if (level === "bachelor") return "ปริญญาตรี";
    if (level === "master") return "ปริญญาโท";
    if (level === "doctor") return "ปริญญาเอก";
    return level || "ปริญญาตรี";
  };

  const levelBadge = (level) => {
    if (level === "master") {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">ป.โท</span>;
    }
    if (level === "doctor") {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">ป.เอก</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">ป.ตรี</span>;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/placeholder-user.png";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
    return `/${cleanPath}`;
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id || text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ดึงสรุปรายชื่ออาจารย์ทั้งหมดในภาควิชา
  useEffect(() => {
    axios.get("/api/consult/advisors-summary")
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
      setActiveTab('advisor');
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

    axios.get(`/api/consult/advisor/${selectedAdvisorCode}`)
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

  // ค้นหาตามนักศึกษา (Smart Search: รหัสนักศึกษา หรือ ชื่อนามสกุล)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const q = keyword.trim();
      if (!q) {
        setResults([]);
        setMatchedAdvisor(null);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      axios.get("/api/consult/search", {
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
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [keyword, levelFilter]);

  // รายชื่ออาจารย์ที่กรองใน Directory Grid
  const filteredAdvisorsDirectory = useMemo(() => {
    if (!advisorDirectorySearch.trim()) return advisorsList;
    const q = advisorDirectorySearch.toLowerCase().trim();
    return advisorsList.filter(adv => 
      (adv.fullname_th && adv.fullname_th.toLowerCase().includes(q)) ||
      (adv.fullname_en && adv.fullname_en.toLowerCase().includes(q)) ||
      (adv.lecturer_code && adv.lecturer_code.toLowerCase().includes(q)) ||
      (adv.position_th && adv.position_th.toLowerCase().includes(q))
    );
  }, [advisorsList, advisorDirectorySearch]);

  // กรองรายชื่อเฉพาะในความดูแลของอาจารย์ที่เลือก
  const filteredAdvisorStudents = useMemo(() => {
    return advisorStudents.filter(s => {
      // 1. กรองคำค้นหา
      if (advisorSearch.trim()) {
        const q = advisorSearch.toLowerCase().trim();
        const matches = 
          s.student_id.toLowerCase().includes(q) ||
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.firstname && s.firstname.toLowerCase().includes(q)) ||
          (s.lastname && s.lastname.toLowerCase().includes(q)) ||
          (s.room && s.room.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // 2. กรองระดับ
      if (advisorLevelFilter !== 'all' && s.level !== advisorLevelFilter) {
        return false;
      }
      // 3. กรองปีการศึกษา
      if (advisorYearFilter !== 'all') {
        const shortYear = String(s.year || "").slice(-2);
        if (shortYear !== advisorYearFilter) return false;
      }
      return true;
    });
  }, [advisorStudents, advisorSearch, advisorLevelFilter, advisorYearFilter]);

  // ปีการศึกษาที่มีในกลุ่มนักศึกษาของอาจารย์นี้
  const availableCohortYears = useMemo(() => {
    const set = new Set();
    advisorStudents.forEach(s => {
      if (s.year) {
        set.add(String(s.year).slice(-2));
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [advisorStudents]);

  // ============================================================
  // Handlers
  // ============================================================

  // ฟังก์ชันเลือกดูอาจารย์จากหน้าค้นหา หรือจาก Directory
  const handleSelectAdvisor = (advCode, clearSearch = true) => {
    if (clearSearch) {
      setKeyword(""); // ✨ เคลียร์ช่องค้นหานักศึกษา เพื่อไม่ให้ค้างหรือเกิดฟิลเตอร์ซ้ำซ้อน
    }
    setSelectedAdvisorCode(advCode);
    setAdvisorSearch("");
    setAdvisorLevelFilter("all");
    setAdvisorYearFilter("all");
    setActiveTab('advisor');

    if (advCode) {
      navigate(`/consult-student/${advCode}`);
    } else {
      navigate('/consult-student');
    }
  };

  // ล้างการเลือกอาจารย์ (กลับสู่หน้ารายชื่ออาจารย์ทั้งหมดใน Tab 2)
  const handleClearAdvisor = () => {
    setSelectedAdvisorCode("");
    setAdvisorData(null);
    setAdvisorStudents([]);
    setAdvisorSearch("");
    navigate('/consult-student');
  };

  // เปลี่ยนแท็บ
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'search') {
      navigate('/consult-student');
    } else if (newTab === 'advisor') {
      if (selectedAdvisorCode) {
        navigate(`/consult-student/${selectedAdvisorCode}`);
      } else {
        navigate('/consult-student');
      }
    }
  };

  return (
    <div className="bg-slate-50/60 min-h-screen flex flex-col text-left">
      
      {/* 🌟 Header Section */}
      <section className="bg-gradient-to-r from-[#183153] via-[#234370] to-[#3F51B5] text-white py-12 px-6 relative overflow-hidden shadow-sm">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-2 text-indigo-200 text-xs md:text-sm font-semibold uppercase tracking-wider">
              <Users size={16} />
              <span>บริการนักศึกษา • ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight">
              ระบบค้นหาและตรวจสอบอาจารย์ที่ปรึกษา
            </h1>
            
            <p className="text-white/80 text-xs md:text-sm max-w-2xl leading-relaxed">
              ค้นหาอาจารย์ที่ปรึกษาของตนเองได้อย่างสะดวกรวดเร็ว หรือตรวจสอบรายชื่อนักศึกษาในความดูแลของอาจารย์ประจำภาควิชา
            </p>

            {/* 💡 ทางลัดสำหรับอาจารย์ที่ล็อกอินอยู่ */}
            {user && (user.lecturer_code || user.role === 'lecturer') && (
              <div className="mt-5 inline-flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-xs md:text-sm">
                <span className="flex items-center gap-1.5 font-medium text-white">
                  <User size={16} className="text-amber-300" />
                  ยินดีต้อนรับอาจารย์ <strong>{user.full_name}</strong>
                </span>
                <button
                  onClick={() => handleSelectAdvisor(user.lecturer_code || String(user.lecturer_id || user.id), true)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1"
                >
                  <Users size={14} /> ดูนักศึกษาในความดูแลของฉัน
                </button>
              </div>
            )}
          </motion.div>
        </div>

        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[7rem] font-bold">ADVISOR</h2>
        </div>
      </section>

      <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 flex-grow space-y-6">

        {/* ============================================================ */}
        {/* 🎛️ Segmented Mode Navigation (แท็บเลือกโหมดการใช้งานชัดเจน ไม่ซ้ำซ้อน) */}
        {/* ============================================================ */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            
            {/* Tab 1: สำหรับนักศึกษาค้นหาอาจารย์ */}
            <button
              onClick={() => handleTabChange('search')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'search'
                  ? 'bg-[#183153] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Search size={17} />
              <span>ค้นหาอาจารย์ที่ปรึกษา</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'search' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                สำหรับนักศึกษา
              </span>
            </button>

            {/* Tab 2: สำหรับอาจารย์ / ดูรายชื่อทั้งกลุ่ม */}
            <button
              onClick={() => handleTabChange('advisor')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'advisor'
                  ? 'bg-[#183153] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserCheck size={17} />
              <span>รายชื่อตามอาจารย์ที่ปรึกษา</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'advisor' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {advisorsList.length > 0 ? `${advisorsList.length} ท่าน` : 'ทั้งหมด'}
              </span>
            </button>

            {/* Tab 3: ดูตามรุ่นปีการศึกษา */}
            <button
              onClick={() => handleTabChange('year')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'year'
                  ? 'bg-[#183153] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BookOpen size={17} />
              <span>ดูตามรุ่นปีการศึกษา</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'year' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                ปี 58-69
              </span>
            </button>

          </div>
        </section>

        {/* ============================================================ */}
        {/* 🔍 TAB 1: ค้นหาอาจารย์ที่ปรึกษา (โหมดค้นหาตามรหัส/ชื่อนักศึกษา)   */}
        {/* ============================================================ */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            
            {/* กล่องค้นหาหลัก */}
            <section className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Search className="text-[#3F51B5]" size={20} />
                    ค้นหาอาจารย์ที่ปรึกษาของคุณ
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    กรอกรหัสนักศึกษา 13 หลัก หรือพิมพ์ชื่อ-นามสกุลเพื่อตรวจสอบอาจารย์ที่ปรึกษาได้ทันที
                  </p>
                </div>

                {/* ตัวกรองระดับการศึกษาแบบ Chip Buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: 'all', label: 'ทุกระดับ' },
                    { id: 'bachelor', label: 'ป.ตรี' },
                    { id: 'master', label: 'ป.โท' },
                    { id: 'doctor', label: 'ป.เอก' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setLevelFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        levelFilter === tab.id
                          ? 'bg-white text-[#183153] shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ช่อง Input ค้นหา */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="พิมพ์รหัสนักศึกษา (เช่น 65040626...) หรือชื่อ-นามสกุลนักศึกษา..."
                  className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50/60 py-4 pl-12 pr-12 text-sm md:text-base outline-none focus:border-[#3F51B5] focus:bg-white focus:ring-4 focus:ring-[#3F51B5]/10 transition-all font-medium text-slate-800"
                  autoFocus
                />
                {keyword && (
                  <button
                    onClick={() => setKeyword("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/60 transition-all"
                    title="ล้างคำค้นหา"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </section>

            {/* แสดงการแจ้งเตือนหากคำค้นหาตรงกับชื่ออาจารย์ */}
            {matchedAdvisor && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-600 font-semibold uppercase">พบข้อมูลอาจารย์ที่ปรึกษา</p>
                    <h4 className="text-sm md:text-base font-bold text-slate-800">{matchedAdvisor.fullname_th}</h4>
                  </div>
                </div>
                <button
                  onClick={() => handleSelectAdvisor(matchedAdvisor.lecturer_code || matchedAdvisor.fullname_th, true)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#183153] hover:bg-[#234370] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  <span>ดูนักศึกษาในความดูแลของอาจารย์ท่านนี้</span>
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            )}

            {/* สถานะ Loading */}
            {loading && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-600">กำลังค้นหาข้อมูลนักศึกษาและอาจารย์ที่ปรึกษา...</p>
              </div>
            )}

            {/* ไม่พบผลลัพธ์ */}
            {!loading && hasSearched && results.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <AlertCircle size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-700">ไม่พบข้อมูลที่ตรงกับคำค้นหา "{keyword}"</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  กรุณาตรวจสอบการสะกดชื่อ-นามสกุล หรือลองค้นหาด้วยรหัสนักศึกษา 13 หลัก
                </p>
                <button
                  onClick={() => setKeyword("")}
                  className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  ล้างคำค้นหา
                </button>
              </div>
            )}

            {/* แสดงผลการค้นหา */}
            {!loading && results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs md:text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    พบข้อมูลนักศึกษา {results.length} รายการ
                  </span>
                  <span className="text-xs text-slate-400">
                    คลิกที่ชื่ออาจารย์เพื่อดูนักศึกษาทั้งหมดในความดูแล
                  </span>
                </div>

                {/* 🌟 กรณีที่ 1: พบนักศึกษา 1 คนพอดี (Single Exact Match - แสดงการ์ดผลลัพธ์ประกบคู่แบบพรีเมียม) */}
                {results.length === 1 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-2 border-indigo-100 rounded-3xl overflow-hidden shadow-sm"
                  >
                    <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/80 px-6 py-3 border-b border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#3F51B5] font-bold text-xs md:text-sm">
                        <Sparkles size={16} />
                        <span>ผลการตรวจสอบอาจารย์ที่ปรึกษา</span>
                      </div>
                      {levelBadge(results[0].level)}
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      
                      {/* ฝั่งข้อมูลนักศึกษา */}
                      <div className="lg:col-span-5 space-y-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                          <GraduationCap size={15} />
                          <span>ข้อมูลนักศึกษา</span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                              {results[0].title}{results[0].firstname} {results[0].lastname}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-mono text-base md:text-lg font-bold text-[#183153] bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                              {results[0].student_id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(results[0].student_id, 'main')}
                              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                              title="คัดลอกรหัสนักศึกษา"
                            >
                              {copiedId === 'main' ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-600">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[11px]">ระดับการศึกษา</span>
                            <span className="font-bold text-slate-700">ระดับ{levelLabel(results[0].level)}</span>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[11px]">ห้อง / รุ่นปี</span>
                            <span className="font-bold text-slate-700">{results[0].room || "-"} (รหัส {String(results[0].admission_year || "").slice(-2)})</span>
                          </div>
                        </div>
                      </div>

                      {/* ลูกศรเชื่อมโยงระหว่างนักศึกษากับอาจารย์ */}
                      <div className="lg:col-span-2 flex flex-col items-center justify-center text-center py-2 lg:py-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-[#3F51B5] flex items-center justify-center shadow-inner">
                          <ArrowRight size={18} className="hidden lg:block" />
                          <ChevronDown size={18} className="lg:hidden" />
                        </div>
                        <span className="text-[11px] font-bold text-indigo-600 mt-1 uppercase tracking-wider">
                          อาจารย์ที่ปรึกษา
                        </span>
                      </div>

                      {/* ฝั่งข้อมูลอาจารย์ที่ปรึกษา */}
                      <div className="lg:col-span-5 bg-gradient-to-br from-indigo-50/50 to-white p-6 rounded-2xl border border-indigo-100 space-y-4">
                        {results[0].advisor?.fullname_th ? (
                          <>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-20 rounded-xl overflow-hidden shadow-sm border-2 border-indigo-100 bg-slate-100 shrink-0">
                                <img
                                  src={getImageUrl(results[0].advisor.image_path)}
                                  alt={results[0].advisor.fullname_th}
                                  className="w-full h-full object-cover object-top"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/img/placeholder-user.png";
                                  }}
                                />
                              </div>
                              <div>
                                {results[0].advisor.lecturer_code && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#183153] text-white uppercase tracking-wider">
                                    {results[0].advisor.lecturer_code}
                                  </span>
                                )}
                                <h4 className="text-base md:text-lg font-bold text-slate-800 mt-1">
                                  {results[0].advisor.fullname_th}
                                </h4>
                                {results[0].advisor.email && results[0].advisor.email !== '-' && (
                                  <a
                                    href={`mailto:${results[0].advisor.email}`}
                                    className="text-xs text-slate-500 hover:text-[#3F51B5] flex items-center gap-1 mt-1"
                                  >
                                    <Mail size={13} className="text-[#3F51B5]" /> {results[0].advisor.email}
                                  </a>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleSelectAdvisor(results[0].advisor.lecturer_code || results[0].advisor.fullname_th, true)}
                              className="w-full py-2.5 px-4 bg-[#183153] hover:bg-[#234370] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                              <Users size={15} />
                              <span>ดูนักศึกษาทั้งหมดในความดูแลของอาจารย์ท่านนี้</span>
                              <ChevronRight size={15} />
                            </button>
                          </>
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-xs italic">
                            ยังไม่มีข้อมูลอาจารย์ที่ปรึกษาสำหรับนักศึกษาท่านนี้
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                ) : (
                  /* 🌟 กรณีที่ 2: พบหลายคน (แสดงเป็นการ์ดรายชื่อแต่ละคน) */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((student) => (
                      <div
                        key={student.id}
                        className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#183153] bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                              {student.student_id}
                            </span>
                            <h3 className="text-base font-bold text-slate-800 mt-1.5">
                              {student.title}{student.firstname} {student.lastname}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              ห้อง {student.room || "-"} • รหัส {String(student.admission_year || "").slice(-2)}
                            </p>
                          </div>
                          {levelBadge(student.level)}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                          {student.advisor?.fullname_th ? (
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-11 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                <img
                                  src={getImageUrl(student.advisor.image_path)}
                                  alt={student.advisor.fullname_th}
                                  className="w-full h-full object-cover object-top"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/img/placeholder-user.png";
                                  }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] text-slate-400 font-bold uppercase">อาจารย์ที่ปรึกษา</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{student.advisor.fullname_th}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">ยังไม่ระบุอาจารย์</span>
                          )}

                          {student.advisor?.lecturer_code && (
                            <button
                              onClick={() => handleSelectAdvisor(student.advisor.lecturer_code, true)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#3F51B5] text-xs font-bold rounded-xl transition-all shrink-0 flex items-center gap-1"
                              title="ดูนักศึกษาทั้งหมดในความดูแล"
                            >
                              <span>ดูเพื่อนในกลุ่ม</span>
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* ไกด์คำแนะนำเมื่อยังไม่ได้พิมพ์ค้นหา */}
            {!hasSearched && (
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3F51B5] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">ค้นหาด้วยรหัสนักศึกษา</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    พิมพ์รหัสนักศึกษา 13 หลัก เช่น <span className="font-mono font-semibold text-slate-700">65040626...</span> เพื่อดูชื่ออาจารย์ที่ปรึกษาได้แม่นยำที่สุด
                  </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3F51B5] flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">ค้นหาด้วยชื่อ-นามสกุล</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    สามารถพิมพ์เฉพาะชื่อ หรือนามสกุลของนักศึกษาเพื่อค้นหารายชื่ออาจารย์ที่ปรึกษาได้ทันที
                  </p>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3F51B5] flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">ดูนักศึกษาทั้งกลุ่ม</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    คลิกแท็บ <span className="font-bold text-[#183153]">"รายชื่อตามอาจารย์ที่ปรึกษา"</span> หากต้องการเลือกดูนักศึกษาทั้งหมดในความดูแลของอาจารย์แต่ละท่าน
                  </p>
                </div>
              </section>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* 👨‍🏫 TAB 2: รายชื่อตามอาจารย์ที่ปรึกษา (Advisor Directory & Cohort) */}
        {/* ============================================================ */}
        {activeTab === 'advisor' && (
          <div className="space-y-6">

            {/* ======================================================== */}
            {/* SUB-STATE 2A: มีการเลือกอาจารย์แล้ว -> แสดงรายชื่อนักศึกษาในกลุ่ม */}
            {/* ======================================================== */}
            {selectedAdvisorCode && advisorData ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* แถบย้อนกลับและสลับอาจารย์ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearAdvisor}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      <ArrowLeft size={15} />
                      <span>กลับไปรายชื่ออาจารย์ทั้งหมด</span>
                    </button>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      กำลังดูนักศึกษาในความดูแลของ อ.{advisorData.fullname_th}
                    </span>
                  </div>

                  {/* สลับไปดูอาจารย์ท่านอื่น */}
                  <div className="relative">
                    <select
                      value={selectedAdvisorCode}
                      onChange={(e) => handleSelectAdvisor(e.target.value, false)}
                      className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-8 text-xs font-bold text-slate-700 outline-none focus:border-[#3F51B5] cursor-pointer"
                    >
                      {advisorsList.map((adv) => (
                        <option key={adv.id} value={adv.lecturer_code}>
                          สลับดู: {adv.fullname_th} ({adv.advised_student_count} คน)
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* การ์ดข้อมูลอาจารย์ที่ปรึกษา (Advisor Header Banner) */}
                <div className="bg-white border-2 border-indigo-100 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start sm:items-center gap-5">
                    <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden shadow-md border-2 border-indigo-100 bg-slate-100 shrink-0">
                      <img
                        src={getImageUrl(advisorData.image_path)}
                        alt={advisorData.fullname_th}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/img/placeholder-user.png";
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-[#183153] text-white uppercase tracking-wider">
                          {advisorData.lecturer_code || "ADVISOR"}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">อาจารย์ที่ปรึกษาประจำภาควิชา</span>
                      </div>
                      
                      {advisorData.position_th && (
                        <p className="text-xs font-semibold text-[#3F51B5] mt-1 whitespace-pre-line">
                          {advisorData.position_th}
                        </p>
                      )}
                      
                      <h2 className="text-xl md:text-2xl font-bold text-slate-800 mt-1">
                        {advisorData.fullname_th}
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                        {advisorData.email && (
                          <a 
                            href={`mailto:${advisorData.email}`}
                            className="flex items-center gap-1.5 text-slate-600 hover:text-[#3F51B5] transition-colors"
                          >
                            <Mail size={14} className="text-[#3F51B5]" /> {advisorData.email}
                          </a>
                        )}
                        {advisorData.tel && (
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <Phone size={14} className="text-[#3F51B5]" /> {advisorData.tel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* สรุปจำนวนนักศึกษา */}
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 text-center shrink-0 min-w-[140px]">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                      นักศึกษาในความดูแล
                    </span>
                    <span className="text-3xl font-black text-[#183153] block mt-0.5">
                      {advisorStudents.length}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">คนทั้งหมด</span>
                  </div>
                </div>

                {/* เครื่องมือกองและค้นหาภายในกลุ่มนักศึกษานี้ */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* ช่องค้นหาภายในกลุ่ม */}
                    <div className="relative flex-grow max-w-md">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={advisorSearch}
                        onChange={(e) => setAdvisorSearch(e.target.value)}
                        placeholder="พิมพ์รหัสนักศึกษา หรือชื่อ-นามสกุล เพื่อค้นหาในกลุ่มนี้..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-xs font-medium outline-none focus:border-[#3F51B5] focus:bg-white"
                      />
                      {advisorSearch && (
                        <button
                          onClick={() => setAdvisorSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* ตัวกรองระดับ และปีการศึกษา */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* เลือกระดับ */}
                      <select
                        value={advisorLevelFilter}
                        onChange={(e) => setAdvisorLevelFilter(e.target.value)}
                        className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                      >
                        <option value="all">ทุกระดับการศึกษา</option>
                        <option value="bachelor">ปริญญาตรี</option>
                        <option value="master">ปริญญาโท</option>
                        <option value="doctor">ปริญญาเอก</option>
                      </select>

                      {/* เลือกรุ่นปี */}
                      {availableCohortYears.length > 0 && (
                        <select
                          value={advisorYearFilter}
                          onChange={(e) => setAdvisorYearFilter(e.target.value)}
                          className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                        >
                          <option value="all">ทุกรุ่นปี</option>
                          {availableCohortYears.map(yr => (
                            <option key={yr} value={yr}>รหัสรุ่น {yr}</option>
                          ))}
                        </select>
                      )}

                      <span className="text-xs text-slate-500 font-bold ml-1">
                        แสดง {filteredAdvisorStudents.length} จาก {advisorStudents.length} คน
                      </span>
                    </div>

                  </div>
                </div>

                {/* ตารางแสดงรายชื่อนักศึกษา */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  {advisorLoading ? (
                    <div className="p-12 text-center text-slate-500 text-xs">
                      <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>กำลังโหลดข้อมูลนักศึกษา...</p>
                    </div>
                  ) : filteredAdvisorStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                          <tr>
                            <th className="py-3.5 px-6">ลำดับ</th>
                            <th className="py-3.5 px-6">รหัสนักศึกษา</th>
                            <th className="py-3.5 px-6">ชื่อ - นามสกุล</th>
                            <th className="py-3.5 px-6">ระดับการศึกษา</th>
                            <th className="py-3.5 px-6">ห้อง</th>
                            <th className="py-3.5 px-6">รุ่นปีการศึกษา</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredAdvisorStudents.map((st, idx) => (
                            <tr key={st.id} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="py-3 px-6 text-slate-400 font-mono text-xs">{idx + 1}</td>
                              <td className="py-3 px-6">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#183153] font-mono">{st.student_id}</span>
                                  <button
                                    onClick={() => copyToClipboard(st.student_id, st.id)}
                                    className="p-1 text-slate-300 hover:text-slate-600 rounded transition-all"
                                    title="คัดลอกรหัส"
                                  >
                                    {copiedId === st.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                                  </button>
                                </div>
                              </td>
                              <td className="py-3 px-6 font-medium text-slate-800">{st.name}</td>
                              <td className="py-3 px-6">{levelBadge(st.level)}</td>
                              <td className="py-3 px-6 text-slate-600 font-semibold">{st.room || "-"}</td>
                              <td className="py-3 px-6">
                                <span className="px-2.5 py-0.5 bg-slate-100 rounded-md text-xs font-bold text-slate-600">
                                  รหัส {String(st.year || "").slice(-2) || "-"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-xs">
                      {advisorSearch ? "ไม่พบนักศึกษาที่ตรงกับคำค้นหาในกลุ่มนี้" : "ยังไม่มีข้อมูลนักศึกษาในความดูแล"}
                    </div>
                  )}
                </div>

              </motion.div>
            ) : (
              /* ======================================================== */
              /* SUB-STATE 2B: ยังไม่ได้เลือกอาจารย์ -> แสดงทำเนียบอาจารย์ทั้งหมด */
              /* ======================================================== */
              <div className="space-y-6">
                
                {/* แถบค้นหาอาจารย์ที่ปรึกษาในทำเนียบ */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-[#3F51B5]" size={20} />
                        ทำเนียบอาจารย์ที่ปรึกษาประจำภาควิชา
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        คลิกเลือกอาจารย์ท่านใดก็ได้เพื่อเปิดดูรายชื่อนักศึกษาทั้งหมดในความดูแล
                      </p>
                    </div>

                    <span className="text-xs font-bold text-[#183153] bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 self-start sm:self-auto">
                      ทั้งหมด {advisorsList.length} ท่าน
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={advisorDirectorySearch}
                      onChange={(e) => setAdvisorDirectorySearch(e.target.value)}
                      placeholder="พิมพ์ค้นหาชื่ออาจารย์ หรือรหัสอาจารย์ (เช่น KAB, TNA, อ.คันธารัตน์)..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-xs md:text-sm outline-none focus:border-[#3F51B5] focus:bg-white focus:ring-2 focus:ring-[#3F51B5]/20 font-medium"
                    />
                    {advisorDirectorySearch && (
                      <button
                        onClick={() => setAdvisorDirectorySearch("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid แสดงการ์ดอาจารย์แต่ละท่าน */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAdvisorsDirectory.map((adv) => (
                    <motion.div
                      key={adv.id}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => handleSelectAdvisor(adv.lecturer_code, true)}
                      className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-16 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 shrink-0">
                          <img
                            src={getImageUrl(adv.image_path)}
                            alt={adv.fullname_th}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/img/placeholder-user.png";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center gap-1.5">
                            {adv.lecturer_code && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#183153] text-white uppercase tracking-wider">
                                {adv.lecturer_code}
                              </span>
                            )}
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {adv.advised_student_count} คน
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#3F51B5] transition-colors mt-1.5 line-clamp-1">
                            {adv.fullname_th}
                          </h3>

                          {adv.position_th && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {adv.position_th}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span className="group-hover:text-[#3F51B5] transition-colors">
                          คลิกดูรายชื่อนักศึกษา
                        </span>
                        <ArrowRight size={14} className="text-slate-400 group-hover:text-[#3F51B5] group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredAdvisorsDirectory.length === 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400 text-xs">
                    ไม่พบอาจารย์ที่ตรงกับคำค้นหา "{advisorDirectorySearch}"
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* 📚 TAB 3: ดูตามรุ่นปีการศึกษา (Browse by Year)                  */}
        {/* ============================================================ */}
        {activeTab === 'year' && (
          <section className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                <BookOpen className="text-[#3F51B5]" size={20} />
                เลือกดูตามระดับและรหัสนักศึกษา (Browse by Admission Year)
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                เปิดดูรายชื่อนักศึกษาและอาจารย์ที่ปรึกษาแบบจัดกลุ่มแยกตามรุ่นปีการศึกษา (เช่น รหัส 67, รหัส 66, รหัส 65)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {studentCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white flex flex-col"
                >
                  <div className={`bg-gradient-to-r ${cat.color} text-white py-4 px-6 text-center font-bold text-base shadow-sm`}>
                    {cat.levelTh}
                  </div>

                  <div className="p-6 flex flex-wrap gap-2.5 flex-grow content-start">
                    {cat.years.map((year, yIdx) => (
                      <Link
                        key={yIdx}
                        to={`/consult-detail/${cat.level}/${year}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-[#183153] hover:border-[#183153] hover:text-white transition-all shadow-xs"
                      >
                        รหัส {year}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      <Footer />
    </div>
  );
}