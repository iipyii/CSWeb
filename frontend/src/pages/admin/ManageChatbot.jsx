import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Search, Plus, Edit2, Trash2, MessageSquare, 
  Save, X, Bot, Zap, Settings, RefreshCw, Loader2 
} from 'lucide-react';

export default function ManageChatbot() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQA, setEditingQA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [submittingQA, setSubmittingQA] = useState(false);

  // 1. ข้อมูลการตั้งค่าพื้นฐานของ Chatbot
  const [botSettings, setBotSettings] = useState({
    welcomeMessage: "สวัสดีครับ! ผมคือ AI ผู้ช่วยประจำภาควิชา CIS มีอะไรให้ผมช่วยไหมครับ?",
    fallbackMessage: "ขออภัยครับ ผมไม่พบข้อมูลในส่วนนี้ คุณสามารถติดต่อสอบถามเพิ่มเติมได้ที่สำนักงานภาควิชาครับ",
    isActive: true
  });

  // 2. ข้อมูลชุดคำถาม-คำตอบ (Knowledge Base / FAQ)
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [formData, setFormData] = useState({ keywords: "", answer: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [settingsRes, faqRes] = await Promise.all([
        axios.get("http://localhost:5000/api/chat/settings"),
        axios.get("http://localhost:5000/api/faq/all")
      ]);

      if (settingsRes.data) {
        setBotSettings(settingsRes.data);
      }

      const formattedFAQs = (faqRes.data || []).map(f => ({
        id: f.id,
        keywords: f.question,
        answer: f.answer,
        status: f.status
      }));
      setKnowledgeBase(formattedFAQs);
    } catch (error) {
      console.error("Failed to load chatbot data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      await axios.post("http://localhost:5000/api/chat/settings", botSettings);
      alert("บันทึกการตั้งค่า Chatbot สำเร็จ");
    } catch (error) {
      console.error("Save settings error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
    } finally {
      setSavingSettings(false);
    }
  };

  const openModal = (qa = null) => {
    if (qa) {
      setEditingQA(qa);
      setFormData({ keywords: qa.keywords, answer: qa.answer });
    } else {
      setEditingQA(null);
      setFormData({ keywords: "", answer: "" });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบชุดข้อมูลคำถามนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:5000/api/faq/${id}`);
        alert("ลบข้อมูลสำเร็จ");
        fetchData();
      } catch (error) {
        console.error("Delete error:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  const handleSubmitQA = async (e) => {
    e.preventDefault();
    if (!formData.keywords.trim() || !formData.answer.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    try {
      setSubmittingQA(true);
      if (editingQA) {
        await axios.put(`http://localhost:5000/api/faq/${editingQA.id}`, {
          question: formData.keywords,
          answer: formData.answer,
          category: "chatbot"
        });
        alert("แก้ไขข้อมูลสำเร็จ");
      } else {
        await axios.post("http://localhost:5000/api/faq", {
          question: formData.keywords,
          answer: formData.answer,
          category: "chatbot"
        });
        alert("เพิ่มข้อมูลสำเร็จ");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Submit QA error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmittingQA(false);
    }
  };

  const filteredData = knowledgeBase.filter(item => 
    (item.keywords || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.answer || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left pb-10">
      
      {/* 🤖 Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-[#3F51B5] text-white rounded-xl shadow-lg shadow-indigo-100">
              <Bot size={24} />
            </div>
            จัดการ AI Chatbot
          </h1>
          <p className="text-slate-500 text-sm mt-1">ตั้งค่าชุดข้อมูลและพฤติกรรมการตอบกลับของระบบ AI Assistant</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 bg-white text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> รีเฟรช
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#3F51B5] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm"
          >
            <Plus size={18} /> เพิ่มคำถามใหม่
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ⚙️ ส่วนตั้งค่าพื้นฐาน (General Settings) */}
        <section className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Settings size={20} className="text-[#3F51B5]" /> ตั้งค่าพื้นฐาน
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-sm font-bold text-slate-600">สถานะ Chatbot</span>
                <button 
                  type="button"
                  onClick={() => setBotSettings({...botSettings, isActive: !botSettings.isActive})}
                  className={`w-12 h-6 rounded-full transition-all relative ${botSettings.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${botSettings.isActive ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ข้อความต้อนรับ</label>
                <textarea 
                  rows={3}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#3F51B5]/20 outline-none"
                  value={botSettings.welcomeMessage}
                  onChange={(e) => setBotSettings({...botSettings, welcomeMessage: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">ข้อความเมื่อไม่พบคำตอบ</label>
                <textarea 
                  rows={3}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#3F51B5]/20 outline-none"
                  value={botSettings.fallbackMessage}
                  onChange={(e) => setBotSettings({...botSettings, fallbackMessage: e.target.value})}
                />
              </div>

              <button 
                type="button"
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="w-full py-3 bg-[#3F51B5] text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </section>

        {/* 📚 ส่วนจัดการ Knowledge Base */}
        <section className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Zap size={20} className="text-amber-500" /> ชุดข้อมูลคำถาม-คำตอบ (Knowledge Base)
              </h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="ค้นหาคีย์เวิร์ด..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Keywords / คำถาม</th>
                    <th className="px-6 py-4">AI Response / คำตอบ</th>
                    <th className="px-6 py-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5 max-w-[200px]">
                          <div className="flex flex-wrap gap-1">
                            {item.keywords?.split(',').map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 bg-indigo-50 text-[#3F51B5] text-[10px] font-bold rounded-md border border-indigo-100">
                                {kw.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{item.answer}</p>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-amber-500 transition-colors" title="แก้ไข"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="ลบ"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-12 text-slate-400 text-sm">
                        {loading ? "กำลังโหลดข้อมูล..." : "ยังไม่มีข้อมูลคำถาม-คำตอบ สามารถกดเพิ่มได้จากปุ่มด้านบน"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* 📝 Modal สำหรับ เพิ่ม/แก้ไข QA */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl relative z-10 overflow-hidden flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#3F51B5]" />
                  {editingQA ? "แก้ไขข้อมูล AI" : "เพิ่มชุดข้อมูลใหม่"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>

              <form onSubmit={handleSubmitQA} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Keywords / คำถาม (แยกด้วยเครื่องหมาย , )</label>
                  <input 
                    type="text" 
                    placeholder="เช่น ค่าเทอม, ราคา, จ่ายเงิน"
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#3F51B5]/20 outline-none"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                    required
                  />
                  <p className="text-[10px] text-slate-400 italic">เมื่อผู้ใช้งานพิมพ์คำที่มีคีย์เวิร์ดเหล่านี้ AI จะเลือกตอบด้วยข้อความนี้</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">คำตอบจาก AI (Response)</label>
                  <textarea 
                    rows={5}
                    placeholder="พิมพ์คำตอบที่ต้องการให้ AI ตอบโต้กลับ..."
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#3F51B5]/20 outline-none leading-relaxed"
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={submittingQA}
                    className="flex-1 py-4 bg-[#3F51B5] text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingQA ? <Loader2 size={18} className="animate-spin" /> : <Save size={20} />} 
                    บันทึกข้อมูล
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all">
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