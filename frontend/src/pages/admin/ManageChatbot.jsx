import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Search, Plus, Edit2, Trash2, MessageSquare, 
  Save, X, Bot, Zap, Settings, RefreshCw, Loader2,
  BookOpen, Filter, FileText, GraduationCap, CheckCircle2,
  ExternalLink, Layers, ChevronRight
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

const FAQ_CATEGORIES = [
  { key: "all", label: "ทั้งหมด" },
  { key: "คู่มือนักศึกษา", label: "คู่มือนักศึกษา" },
  { key: "หลักสูตร", label: "หลักสูตร & รายวิชา" },
  { key: "อาจารย์ที่ปรึกษา", label: "อาจารย์ที่ปรึกษา" },
  { key: "ฝึกงาน", label: "ฝึกงาน & สหกิจ" },
  { key: "ทั่วไป", label: "ทั่วไป" },
];

const HANDBOOK_DEFAULT_CATEGORIES = [
  "การวัดผลและเกรด",
  "การพ้นสภาพและรอพินิจ",
  "การเพิ่มถอนรายวิชา",
  "การฝึกงานและสหกิจศึกษา",
  "เกณฑ์การสำเร็จการศึกษา",
  "อาจารย์ที่ปรึกษา",
  "วินัยและกิจกรรมนักศึกษา",
  "ระเบียบและข้อบังคับทั่วไป"
];

export default function ManageChatbot() {
  const [activeTab, setActiveTab] = useState("faq"); // 'faq' | 'handbook' | 'settings'
  const [loading, setLoading] = useState(true);

  // Auth Header helper
  const getAuthHeader = () => {
    const token = localStorage.getItem("csweb_token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // ==========================================
  // 1. Bot Settings State
  // ==========================================
  const [botSettings, setBotSettings] = useState({
    welcomeMessage: "สวัสดีครับ! ผมคือ AI ผู้ช่วยประจำภาควิชา CIS มีอะไรให้ผมช่วยไหมครับ?",
    fallbackMessage: "ขออภัยครับ ผมไม่พบข้อมูลในส่วนนี้ คุณสามารถติดต่อสอบถามเพิ่มเติมได้ที่สำนักงานภาควิชาครับ",
    isActive: true
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // ==========================================
  // 2. FAQ / Knowledge Base State
  // ==========================================
  const [faqList, setFaqList] = useState([]);
  const [faqSearch, setFaqSearch] = useState("");
  const [faqCategoryFilter, setFaqCategoryFilter] = useState("all");
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqFormData, setFaqFormData] = useState({
    keywords: "",
    answer: "",
    category: "ทั่วไป"
  });
  const [submittingFaq, setSubmittingFaq] = useState(false);

  // ==========================================
  // 3. Student Handbook State
  // ==========================================
  const [handbookList, setHandbookList] = useState([]);
  const [handbookCategories, setHandbookCategories] = useState(HANDBOOK_DEFAULT_CATEGORIES);
  const [handbookSearch, setHandbookSearch] = useState("");
  const [handbookCategoryFilter, setHandbookCategoryFilter] = useState("all");
  const [isHandbookModalOpen, setIsHandbookModalOpen] = useState(false);
  const [editingHandbook, setEditingHandbook] = useState(null);
  const [handbookFormData, setHandbookFormData] = useState({
    category: "การวัดผลและเกรด",
    topic: "",
    content: "",
    applicable_years: "ทุกชั้นปี",
    degree_level: "all",
    file_url: ""
  });
  const [submittingHandbook, setSubmittingHandbook] = useState(false);

  // ==========================================
  // Fetch Data
  // ==========================================
  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, faqRes, handbookRes] = await Promise.all([
        axios.get(`${API_BASE}/chat/settings`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/faq/all`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/handbooks`).catch(() => ({ data: { data: [], categories: [] } }))
      ]);

      if (settingsRes.data) {
        setBotSettings(settingsRes.data);
      }

      if (Array.isArray(faqRes.data)) {
        setFaqList(faqRes.data.map(f => ({
          id: f.id,
          keywords: f.question,
          answer: f.answer,
          category: f.category || "ทั่วไป",
          status: f.status
        })));
      }

      if (handbookRes.data?.data) {
        setHandbookList(handbookRes.data.data);
        if (handbookRes.data.categories && handbookRes.data.categories.length > 0) {
          const combined = Array.from(new Set([...HANDBOOK_DEFAULT_CATEGORIES, ...handbookRes.data.categories]));
          setHandbookCategories(combined);
        }
      }
    } catch (error) {
      console.error("Failed to load chatbot data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // Bot Settings Handlers
  // ==========================================
  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await axios.post(`${API_BASE}/chat/settings`, botSettings, getAuthHeader());
      alert("บันทึกการตั้งค่า Chatbot สำเร็จ");
    } catch (error) {
      console.error("Save settings error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
    } finally {
      setSavingSettings(false);
    }
  };

  // ==========================================
  // FAQ Handlers
  // ==========================================
  const openFaqModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFaqFormData({
        keywords: faq.keywords,
        answer: faq.answer,
        category: faq.category || "ทั่วไป"
      });
    } else {
      setEditingFaq(null);
      setFaqFormData({
        keywords: "",
        answer: "",
        category: faqCategoryFilter !== "all" ? faqCategoryFilter : "ทั่วไป"
      });
    }
    setIsFaqModalOpen(true);
  };

  const handleDeleteFaq = async (id) => {
    if (window.confirm("คุณต้องการลบชุดข้อมูลคำถามนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`${API_BASE}/faq/${id}`, getAuthHeader());
        alert("ลบข้อมูลสำเร็จ");
        fetchData();
      } catch (error) {
        console.error("Delete FAQ error:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  const handleSubmitFaq = async (e) => {
    e.preventDefault();
    if (!faqFormData.keywords.trim() || !faqFormData.answer.trim()) {
      alert("กรุณากรอก Keywords/คำถาม และคำตอบให้ครบถ้วน");
      return;
    }

    try {
      setSubmittingFaq(true);
      const payload = {
        question: faqFormData.keywords.trim(),
        answer: faqFormData.answer.trim(),
        category: faqFormData.category.trim()
      };

      if (editingFaq) {
        await axios.put(`${API_BASE}/faq/${editingFaq.id}`, payload, getAuthHeader());
        alert("แก้ไขข้อมูลคำถามสำเร็จ");
      } else {
        await axios.post(`${API_BASE}/faq`, payload, getAuthHeader());
        alert("เพิ่มชุดคำถามใหม่สำเร็จ");
      }

      setIsFaqModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Submit FAQ error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmittingFaq(false);
    }
  };

  const filteredFaqs = faqList.filter(item => {
    const matchCategory = faqCategoryFilter === "all" || item.category === faqCategoryFilter;
    const matchSearch = 
      (item.keywords || "").toLowerCase().includes(faqSearch.toLowerCase()) ||
      (item.answer || "").toLowerCase().includes(faqSearch.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(faqSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  // ==========================================
  // Student Handbook Handlers
  // ==========================================
  const openHandbookModal = (item = null) => {
    if (item) {
      setEditingHandbook(item);
      setHandbookFormData({
        category: item.category || "การวัดผลและเกรด",
        topic: item.topic || "",
        content: item.content || "",
        applicable_years: item.applicable_years || "ทุกชั้นปี",
        degree_level: item.degree_level || "all",
        file_url: item.file_url || ""
      });
    } else {
      setEditingHandbook(null);
      setHandbookFormData({
        category: handbookCategoryFilter !== "all" ? handbookCategoryFilter : "การวัดผลและเกรด",
        topic: "",
        content: "",
        applicable_years: "ทุกชั้นปี",
        degree_level: "all",
        file_url: ""
      });
    }
    setIsHandbookModalOpen(true);
  };

  const handleDeleteHandbook = async (id) => {
    if (window.confirm("คุณต้องการลบระเบียบ/ข้อบังคับคู่มือนักศึกษานี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`${API_BASE}/handbooks/${id}`, getAuthHeader());
        alert("ลบข้อมูลคู่มือนักศึกษาสำเร็จ");
        fetchData();
      } catch (error) {
        console.error("Delete handbook error:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูลคู่มือนักศึกษา");
      }
    }
  };

  const handleSubmitHandbook = async (e) => {
    e.preventDefault();
    if (!handbookFormData.category.trim() || !handbookFormData.topic.trim() || !handbookFormData.content.trim()) {
      alert("กรุณากรอกหมวดหมู่, หัวข้อข้อบังคับ และเนื้อหาให้ครบถ้วน");
      return;
    }

    try {
      setSubmittingHandbook(true);
      const payload = {
        category: handbookFormData.category.trim(),
        topic: handbookFormData.topic.trim(),
        content: handbookFormData.content.trim(),
        applicable_years: handbookFormData.applicable_years.trim() || "ทุกชั้นปี",
        degree_level: handbookFormData.degree_level,
        file_url: handbookFormData.file_url.trim() || null
      };

      if (editingHandbook) {
        await axios.put(`${API_BASE}/handbooks/${editingHandbook.id}`, payload, getAuthHeader());
        alert("แก้ไขข้อมูลคู่มือนักศึกษาสำเร็จ");
      } else {
        await axios.post(`${API_BASE}/handbooks`, payload, getAuthHeader());
        alert("เพิ่มข้อมูลคู่มือนักศึกษาสำเร็จ");
      }

      setIsHandbookModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Submit handbook error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกคู่มือนักศึกษา (ต้องมีสิทธิ์ Admin หรือ Lecturer)");
    } finally {
      setSubmittingHandbook(false);
    }
  };

  const filteredHandbooks = handbookList.filter(item => {
    const matchCategory = handbookCategoryFilter === "all" || item.category === handbookCategoryFilter;
    const matchSearch = 
      (item.topic || "").toLowerCase().includes(handbookSearch.toLowerCase()) ||
      (item.content || "").toLowerCase().includes(handbookSearch.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(handbookSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-8 text-left pb-16">
      
      {/* 🤖 Main Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#183153] to-[#3F51B5] text-white rounded-2xl shadow-lg shadow-indigo-100">
              <Bot size={26} />
            </div>
            จัดการ AI Chatbot & คู่มือนักศึกษา
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ตั้งค่าพฤติกรรม AI, จัดการคลังคำถาม-คำตอบ (FAQ) แยกหมวดหมู่ และบันทึกระเบียบคู่มือนักศึกษา (Student Handbook) เพื่อให้ AI ใช้ตอบคำถามได้อย่างถูกต้อง
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> รีเฟรช
          </button>
        </div>
      </header>

      {/* 🗂️ Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl max-w-2xl">
        <button
          onClick={() => setActiveTab("faq")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === "faq"
              ? "bg-white text-[#183153] shadow-md shadow-slate-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Zap size={18} className={activeTab === "faq" ? "text-amber-500" : ""} />
          ชุดคำถาม-คำตอบ (FAQ)
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 font-semibold text-slate-600">
            {faqList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("handbook")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === "handbook"
              ? "bg-white text-[#183153] shadow-md shadow-slate-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <BookOpen size={18} className={activeTab === "handbook" ? "text-emerald-500" : ""} />
          คู่มือนักศึกษา (Handbook)
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 font-semibold">
            {handbookList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === "settings"
              ? "bg-white text-[#183153] shadow-md shadow-slate-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Settings size={18} className={activeTab === "settings" ? "text-[#3F51B5]" : ""} />
          ตั้งค่าระบบ AI
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ⚡ TAB 1: FAQ / Knowledge Base                                           */}
      {/* ========================================================================= */}
      {activeTab === "faq" && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Zap size={20} className="text-amber-500" />
                  ชุดข้อมูลคำถาม-คำตอบ (Knowledge Base & FAQ)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  อาจารย์สามารถกรองคำถามตามหมวดหมู่ หรือเพิ่มคีย์เวิร์ดเพื่อให้ AI จับคู่คำตอบได้อย่างแม่นยำ
                </p>
              </div>

              <button 
                onClick={() => openFaqModal()}
                className="flex items-center gap-2 bg-[#183153] hover:bg-[#234370] text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all text-sm whitespace-nowrap"
              >
                <Plus size={18} /> เพิ่มคำถามใหม่
              </button>
            </div>

            {/* Category Filter Chips & Search */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              {/* Category Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter size={14} /> กรองหมวด:
                </span>
                {FAQ_CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setFaqCategoryFilter(cat.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      faqCategoryFilter === cat.key
                        ? "bg-[#183153] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="ค้นหาคีย์เวิร์ด, คำถาม, คำตอบ..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#183153]/20"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                />
              </div>
            </div>

            {/* FAQ Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider rounded-xl">
                  <tr>
                    <th className="px-6 py-3.5 rounded-l-xl">หมวดหมู่</th>
                    <th className="px-6 py-3.5">Keywords / คำถาม</th>
                    <th className="px-6 py-3.5">AI Response / คำตอบ</th>
                    <th className="px-6 py-3.5 text-center rounded-r-xl">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-6 py-4 align-top w-40">
                          <span className="inline-block px-2.5 py-1 bg-blue-50 text-[#183153] text-[11px] font-bold rounded-lg border border-blue-100 whitespace-nowrap">
                            {item.category || "ทั่วไป"}
                          </span>
                        </td>
                        <td className="px-6 py-4 align-top max-w-[220px]">
                          <div className="flex flex-wrap gap-1.5">
                            {item.keywords?.split(',').map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md border border-slate-200">
                                {kw.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal whitespace-pre-line">
                            {item.answer}
                          </p>
                        </td>
                        <td className="px-6 py-4 align-top text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <button 
                              onClick={() => openFaqModal(item)} 
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" 
                              title="แก้ไข"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteFaq(item.id)} 
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                              title="ลบ"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-slate-400 text-sm">
                        {loading ? "กำลังโหลดข้อมูลคำถาม..." : "ไม่พบข้อมูลคำถามตามเงื่อนไขที่เลือก สามารถกด 'เพิ่มคำถามใหม่' ได้ครับ"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📖 TAB 2: Student Handbook (คู่มือนักศึกษา)                                */}
      {/* ========================================================================= */}
      {activeTab === "handbook" && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
            {/* Header & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-600" />
                  ระเบียบและข้อบังคับในคู่มือนักศึกษา (Student Handbook)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ฐานข้อมูลระเบียบการเรียน, การวัดผลเกรด, วิทยาทัณฑ์ (Probation), การพ้นสภาพ (Retire), Add/Drop และการฝึกงาน เพื่อให้ Chatbot ตอบคำถามระเบียบวิชาการได้อย่างถูกต้อง
                </p>
              </div>

              <button 
                onClick={() => openHandbookModal()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-100 transition-all text-sm whitespace-nowrap"
              >
                <Plus size={18} /> เพิ่มข้อมูลคู่มือนักศึกษา
              </button>
            </div>

            {/* Filter Chips & Search */}
            <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter size={14} /> หมวดหมู่:
                </span>
                <button
                  onClick={() => setHandbookCategoryFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    handbookCategoryFilter === "all"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ทั้งหมด ({handbookList.length})
                </button>
                {handbookCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setHandbookCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      handbookCategoryFilter === cat
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="ค้นหาหัวข้อระเบียบ, เนื้อหา..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={handbookSearch}
                  onChange={(e) => setHandbookSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Handbook Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left">
                <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold tracking-wider rounded-xl">
                  <tr>
                    <th className="px-5 py-3.5 rounded-l-xl">หมวดหมู่</th>
                    <th className="px-5 py-3.5">หัวข้อข้อบังคับ / ระเบียบ</th>
                    <th className="px-5 py-3.5">ระดับ / ชั้นปี</th>
                    <th className="px-5 py-3.5">เนื้อหารายละเอียด (AI ใช้ตอบ)</th>
                    <th className="px-5 py-3.5 text-center rounded-r-xl">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHandbooks.length > 0 ? (
                    filteredHandbooks.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-5 py-4 align-top w-40">
                          <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top max-w-[220px]">
                          <div className="font-bold text-slate-800 text-xs">{item.topic}</div>
                          {item.file_url && (
                            <a 
                              href={item.file_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1 font-semibold"
                            >
                              <ExternalLink size={12} /> เอกสารประกาศ
                            </a>
                          )}
                        </td>
                        <td className="px-5 py-4 align-top w-36 text-xs text-slate-600">
                          <div className="font-semibold text-slate-700">
                            {item.degree_level === "bachelor" ? "ปริญญาตรี" : item.degree_level === "all" ? "ทุกระดับการศึกษา" : item.degree_level}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{item.applicable_years || "ทุกชั้นปี"}</div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal whitespace-pre-line">
                            {item.content}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            <button 
                              onClick={() => openHandbookModal(item)} 
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" 
                              title="แก้ไข"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteHandbook(item.id)} 
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                              title="ลบ"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-400 text-sm">
                        {loading ? "กำลังโหลดข้อมูลคู่มือ..." : "ไม่พบข้อมูลคู่มือนักศึกษาตามหมวดหมู่ที่เลือก สามารถกดเพิ่มข้อมูลใหม่ได้ครับ"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚙️ TAB 3: Bot Settings                                                    */}
      {/* ========================================================================= */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings size={20} className="text-[#3F51B5]" /> 
            ตั้งค่าพฤติกรรม AI Assistant
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-sm font-bold text-slate-700 block">เปิดใช้งาน Chatbot หน้าระบบ</span>
                <span className="text-xs text-slate-400">อนุญาตให้นักศึกษาและผู้เข้าชมสามารถสนทนากับ AI ได้</span>
              </div>
              <button 
                type="button"
                onClick={() => setBotSettings({...botSettings, isActive: !botSettings.isActive})}
                className={`w-12 h-6 rounded-full transition-all relative ${botSettings.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${botSettings.isActive ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ข้อความทักทายเริ่มต้น (Welcome Message)
              </label>
              <textarea 
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#3F51B5]/20 outline-none leading-relaxed"
                value={botSettings.welcomeMessage}
                onChange={(e) => setBotSettings({...botSettings, welcomeMessage: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ข้อความเมื่อไม่พบข้อมูล (Fallback Message)
              </label>
              <textarea 
                rows={3}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#3F51B5]/20 outline-none leading-relaxed"
                value={botSettings.fallbackMessage}
                onChange={(e) => setBotSettings({...botSettings, fallbackMessage: e.target.value})}
              />
            </div>

            <button 
              type="button"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="w-full py-3.5 bg-[#183153] hover:bg-[#234370] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 MODAL: Add / Edit FAQ                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isFaqModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsFaqModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/70">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Zap size={20} className="text-amber-500" />
                  {editingFaq ? "แก้ไขชุดคำถาม FAQ" : "เพิ่มชุดคำถาม FAQ ใหม่"}
                </h2>
                <button onClick={() => setIsFaqModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitFaq} className="p-6 md:p-8 space-y-5 overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">หมวดหมู่คำถาม</label>
                  <div className="flex gap-2">
                    <select
                      value={faqFormData.category}
                      onChange={(e) => setFaqFormData({ ...faqFormData, category: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#183153]/20"
                    >
                      <option value="ทั่วไป">ทั่วไป</option>
                      <option value="คู่มือนักศึกษา">คู่มือนักศึกษา</option>
                      <option value="หลักสูตร">หลักสูตร & รายวิชา</option>
                      <option value="อาจารย์ที่ปรึกษา">อาจารย์ที่ปรึกษา</option>
                      <option value="ฝึกงาน">ฝึกงาน & สหกิจ</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    Keywords หรือคำถามที่พบบ่อย (คั่นด้วยเครื่องหมาย , เพื่อใส่ได้หลายคำ)
                  </label>
                  <input 
                    type="text" 
                    placeholder="เช่น ค่าเทอม, ผ่อนผันค่าเทอม, ทุนการศึกษา"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#183153]/20"
                    value={faqFormData.keywords}
                    onChange={(e) => setFaqFormData({...faqFormData, keywords: e.target.value})}
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    เมื่อผู้ใช้งานถามคำถามที่มีคำสำคัญเหล่านี้ AI จะดึงคำตอบนี้ไปเรียบเรียงตอบกลับทันที
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">คำตอบจาก AI (Response)</label>
                  <textarea 
                    rows={6}
                    placeholder="พิมพ์คำตอบที่ถูกต้อง ครบถ้วน เพื่อให้ AI ตอบแก่นักศึกษา..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#183153]/20 leading-relaxed"
                    value={faqFormData.answer}
                    onChange={(e) => setFaqFormData({...faqFormData, answer: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={submittingFaq}
                    className="flex-1 py-3 bg-[#183153] hover:bg-[#234370] text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingFaq ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    บันทึกข้อมูล
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsFaqModalOpen(false)} 
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 📚 MODAL: Add / Edit Handbook Item                                      */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isHandbookModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsHandbookModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh]"
            >
              <div className="p-6 border-b flex justify-between items-center bg-emerald-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-600" />
                  {editingHandbook ? "แก้ไขระเบียบคู่มือนักศึกษา" : "เพิ่มระเบียบคู่มือนักศึกษาใหม่"}
                </h2>
                <button onClick={() => setIsHandbookModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmitHandbook} className="p-6 md:p-8 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">หมวดหมู่ระเบียบข้อบังคับ</label>
                    <input 
                      type="text"
                      list="handbook-cats"
                      placeholder="เช่น การวัดผลและเกรด, การฝึกงาน"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={handbookFormData.category}
                      onChange={(e) => setHandbookFormData({ ...handbookFormData, category: e.target.value })}
                      required
                    />
                    <datalist id="handbook-cats">
                      {handbookCategories.map((c, i) => (
                        <option key={i} value={c} />
                      ))}
                    </datalist>
                  </div>

                  {/* Degree Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">ระดับการศึกษาที่บังคับใช้</label>
                    <select
                      value={handbookFormData.degree_level}
                      onChange={(e) => setHandbookFormData({ ...handbookFormData, degree_level: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="all">ทุกระดับการศึกษา (All)</option>
                      <option value="bachelor">ปริญญาตรี (Bachelor)</option>
                      <option value="master">ปริญญาโท (Master)</option>
                      <option value="doctoral">ปริญญาเอก (Doctoral)</option>
                    </select>
                  </div>
                </div>

                {/* Topic */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    หัวข้อข้อบังคับ / ระเบียบ (Topic)
                  </label>
                  <input 
                    type="text" 
                    placeholder="เช่น เกณฑ์การติดวิทยาทัณฑ์ (Probation) และการพ้นสภาพ"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={handbookFormData.topic}
                    onChange={(e) => setHandbookFormData({...handbookFormData, topic: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Applicable Years */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">ชั้นปี/รหัส นศ. ที่บังคับใช้</label>
                    <input 
                      type="text" 
                      placeholder="เช่น ทุกชั้นปี, รหัส 64 เป็นต้นไป"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={handbookFormData.applicable_years}
                      onChange={(e) => setHandbookFormData({...handbookFormData, applicable_years: e.target.value})}
                    />
                  </div>

                  {/* File URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">ลิงก์ประกาศ/ไฟล์ PDF อ้างอิง (ถ้ามี)</label>
                    <input 
                      type="url" 
                      placeholder="https://... หรือ /files/regulations.pdf"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20"
                      value={handbookFormData.file_url}
                      onChange={(e) => setHandbookFormData({...handbookFormData, file_url: e.target.value})}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    เนื้อหาระเบียบและข้อกำหนดโดยละเอียด (AI จะนำข้อความนี้ไปใช้อ้างอิงตอบนักศึกษา)
                  </label>
                  <textarea 
                    rows={8}
                    placeholder="พิมพ์กฎ ระเบียบ เกณฑ์ตัวเลข เกรด เงื่อนไข หรือข้อปฏิบัติที่สำคัญ..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 leading-relaxed font-mono"
                    value={handbookFormData.content}
                    onChange={(e) => setHandbookFormData({...handbookFormData, content: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={submittingHandbook}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingHandbook ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    บันทึกระเบียบคู่มือ
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsHandbookModalOpen(false)} 
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}