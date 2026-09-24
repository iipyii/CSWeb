import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Calendar, FileText, Link2, Plus,
  Trash2, Edit3, Save, RefreshCw, AlertCircle, CheckCircle2,
  ExternalLink, Info, Check, X, MoveUp, MoveDown, Award, HelpCircle
} from 'lucide-react';

export default function ManageInternship() {
  const [activeTab, setActiveTab] = useState('qualification'); // 'qualification' | 'evaluation' | 'schedule' | 'process' | 'links'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Data States
  const [items, setItems] = useState([]);
  const [config, setConfig] = useState({
    links: { docsUrl: '', placesUrl: '' },
    evaluation: { items: [], note: '' }
  });

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [formData, setFormData] = useState({
    id: null,
    section: 'qualification',
    title: '',
    content: ''
  });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, configRes] = await Promise.all([
        axios.get('http://localhost:5000/api/internships'),
        axios.get('http://localhost:5000/api/internships/config')
      ]);

      setItems(itemsRes.data || []);
      if (configRes.data) {
        setConfig({
          links: configRes.data.links || { docsUrl: '', placesUrl: '' },
          evaluation: configRes.data.evaluation || { items: [], note: '' }
        });
      }
    } catch (error) {
      console.error('Fetch internship data error:', error);
      showAlert('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter items by active section
  const qualificationItems = items.filter(i => i.section === 'qualification');
  const criteriaItems = items.filter(i => i.section === 'criteria');
  const noteItems = items.filter(i => i.section === 'note');
  const scheduleItems = items.filter(i => i.section === 'schedule');
  const processItems = items.filter(i => i.section === 'process');

  // Open Modal for Create
  const handleOpenCreate = (section) => {
    setModalMode('create');
    setFormData({
      id: null,
      section: section || 'qualification',
      title: section === 'schedule' ? 'กำหนดการ' : section === 'process' ? `ขั้นตอนที่ ${processItems.length + 1}` : '',
      content: ''
    });
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setFormData({
      id: item.id,
      section: item.section,
      title: item.title || '',
      content: item.content || ''
    });
    setModalOpen(true);
  };

  // Submit Modal Item
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      showAlert('error', 'กรุณากรอกเนื้อหาข้อมูล');
      return;
    }

    try {
      setSaving(true);
      if (modalMode === 'create') {
        const res = await axios.post('http://localhost:5000/api/internships/item', formData, { withCredentials: true });
        setItems(prev => [...prev, res.data]);
        showAlert('success', 'เพิ่มข้อมูลสำเร็จ');
      } else {
        const res = await axios.put(`http://localhost:5000/api/internships/item/${formData.id}`, formData, { withCredentials: true });
        setItems(prev => prev.map(item => item.id === formData.id ? res.data : item));
        showAlert('success', 'แก้ไขข้อมูลสำเร็จ');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Save item error:', error);
      showAlert('error', error.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/internships/item/${id}`, { withCredentials: true });
      setItems(prev => prev.filter(item => item.id !== id));
      showAlert('success', 'ลบข้อมูลสำเร็จ');
    } catch (error) {
      console.error('Delete item error:', error);
      showAlert('error', 'เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // Save Links Config
  const handleSaveLinks = async () => {
    try {
      setSaving(true);
      await axios.post('http://localhost:5000/api/internships/links', config.links, { withCredentials: true });
      showAlert('success', 'บันทึกลิงก์เอกสารประกอบการฝึกงานสำเร็จ');
    } catch (error) {
      console.error('Save links error:', error);
      showAlert('error', 'บันทึกลิงก์ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  // Save Evaluation Config
  const handleSaveEvaluation = async () => {
    try {
      setSaving(true);
      await axios.post('http://localhost:5000/api/internships/evaluation', config.evaluation, { withCredentials: true });
      showAlert('success', 'บันทึกเกณฑ์การประเมินคะแนนสำเร็จ');
    } catch (error) {
      console.error('Save evaluation error:', error);
      showAlert('error', 'บันทึกเกณฑ์การประเมินไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  // Add / Edit Evaluation Row
  const handleAddEvalItem = () => {
    setConfig(prev => ({
      ...prev,
      evaluation: {
        ...prev.evaluation,
        items: [...prev.evaluation.items, { title: 'หัวข้อการประเมินใหม่', score: 20 }]
      }
    }));
  };

  const handleUpdateEvalItem = (idx, field, val) => {
    const updated = [...config.evaluation.items];
    updated[idx] = { ...updated[idx], [field]: field === 'score' ? Number(val) : val };
    setConfig(prev => ({
      ...prev,
      evaluation: { ...prev.evaluation, items: updated }
    }));
  };

  const handleDeleteEvalItem = (idx) => {
    const updated = config.evaluation.items.filter((_, i) => i !== idx);
    setConfig(prev => ({
      ...prev,
      evaluation: { ...prev.evaluation, items: updated }
    }));
  };

  const totalScore = config.evaluation.items?.reduce((sum, item) => sum + (Number(item.score) || 0), 0) || 0;

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-50 text-[#3F51B5] rounded-xl font-bold">
              <ClipboardCheck size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              จัดการข้อมูลการฝึกงาน
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            จัดการคุณสมบัติ, เกณฑ์การฝึกงาน, กำหนดการประจำปี, ลำดับ 9 ขั้นตอน และลิงก์เอกสารสำคัญ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/internship"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ExternalLink size={14} /> ดูหน้าบ้าน
          </a>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      <AnimatePresence>
        {alertInfo.show && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 shadow-md ${
              alertInfo.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {alertInfo.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500 shrink-0" /> : <AlertCircle size={20} className="text-rose-500 shrink-0" />}
            <span>{alertInfo.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60 max-w-fit">
        {[
          { id: 'qualification', label: 'คุณสมบัติ & เกณฑ์', icon: <ClipboardCheck size={16} /> },
          { id: 'evaluation', label: 'เกณฑ์การประเมินคะแนน', icon: <Award size={16} /> },
          { id: 'schedule', label: 'กำหนดการประจำปี', icon: <Calendar size={16} /> },
          { id: 'process', label: 'ขั้นตอนการฝึกงาน (9 ขั้นตอน)', icon: <FileText size={16} /> },
          { id: 'links', label: 'ลิงก์เอกสาร & สถานที่', icon: <Link2 size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-[#3F51B5] shadow-md shadow-slate-200 scale-100'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 📋 TAB 1: Qualification, Criteria, Note */}
      {activeTab === 'qualification' && (
        <div className="space-y-8">
          {/* Section 1: คุณสมบัติ */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500" size={20} /> คุณสมบัตินักศึกษาฝึกงาน
                </h2>
                <p className="text-xs text-slate-400 mt-1">ข้อกำหนดและเงื่อนไขสำหรับนักศึกษาที่มีสิทธิ์ยื่นขอฝึกงาน</p>
              </div>
              <button
                onClick={() => handleOpenCreate('qualification')}
                className="px-4 py-2 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 self-start sm:self-auto"
              >
                <Plus size={16} /> เพิ่มคุณสมบัติ
              </button>
            </div>

            <div className="grid gap-3">
              {qualificationItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  ยังไม่มีรายการคุณสมบัติ คลิกปุ่ม "เพิ่มคุณสมบัติ" เพื่อเพิ่มข้อมูล
                </div>
              ) : (
                qualificationItems.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4 group transition-all">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        {item.title && <div className="text-xs font-bold text-[#3F51B5] mb-1">{item.title}</div>}
                        <div className="text-sm text-slate-700 leading-relaxed">{item.content}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-slate-400 hover:text-[#3F51B5] hover:bg-white rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: เกณฑ์การฝึกงาน */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardCheck className="text-[#3F51B5]" size={20} /> เกณฑ์การฝึกงาน
                </h2>
                <p className="text-xs text-slate-400 mt-1">ข้อกำหนดช่วงเวลา จำนวนชั่วโมง และสถานประกอบการ</p>
              </div>
              <button
                onClick={() => handleOpenCreate('criteria')}
                className="px-4 py-2 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 self-start sm:self-auto"
              >
                <Plus size={16} /> เพิ่มเกณฑ์
              </button>
            </div>

            <div className="grid gap-3">
              {criteriaItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  ยังไม่มีรายการเกณฑ์การฝึกงาน
                </div>
              ) : (
                criteriaItems.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-4 group transition-all">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        {item.title && <div className="text-xs font-bold text-[#3F51B5] mb-1">{item.title}</div>}
                        <div className="text-sm text-slate-700 leading-relaxed">{item.content}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-slate-400 hover:text-[#3F51B5] hover:bg-white rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: หมายเหตุ */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Info className="text-amber-500" size={20} /> *หมายเหตุและข้อควรระวัง
                </h2>
                <p className="text-xs text-slate-400 mt-1">ข้อพึงระวังเพิ่มเติมสำหรับการลงทะเบียนและดำเนินการ</p>
              </div>
              <button
                onClick={() => handleOpenCreate('note')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-amber-100 self-start sm:self-auto"
              >
                <Plus size={16} /> เพิ่มหมายเหตุ
              </button>
            </div>

            <div className="grid gap-3">
              {noteItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  ยังไม่มีหมายเหตุ
                </div>
              ) : (
                noteItems.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-amber-50/40 hover:bg-amber-50/70 rounded-2xl border border-amber-200/60 flex items-start justify-between gap-4 group transition-all">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        *
                      </span>
                      <div>
                        {item.title && <div className="text-xs font-bold text-amber-800 mb-1">{item.title}</div>}
                        <div className="text-sm text-slate-700 leading-relaxed">{item.content}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg transition-all"
                        title="แก้ไข"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🏆 TAB 2: Evaluation Criteria */}
      {activeTab === 'evaluation' && (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Award className="text-[#3F51B5]" size={20} /> จัดการเกณฑ์การประเมินผล
              </h2>
              <p className="text-xs text-slate-400 mt-1">กำหนดหัวข้อการประเมินและสัดส่วนคะแนนที่สถานประกอบการใช้ประเมิน</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${
                totalScore === 100 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}>
                คะแนนรวม: {totalScore} / 100
              </span>
              <button
                onClick={handleAddEvalItem}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus size={16} /> เพิ่มหัวข้อ
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {config.evaluation.items.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">หัวข้อการประเมิน</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateEvalItem(idx, 'title', e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3F51B5]"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">คะแนนเต็ม</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.score}
                      onChange={(e) => handleUpdateEvalItem(idx, 'score', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#3F51B5] focus:outline-none focus:border-[#3F51B5]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-slate-400">คะแนน</span>
                  </div>
                </div>
                <div className="sm:pt-5">
                  <button
                    onClick={() => handleDeleteEvalItem(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                    title="ลบหัวข้อ"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {/* Evaluation Pass/Fail Note */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Info size={15} className="text-rose-500" /> เกณฑ์การตัดสิน (ข้อความเตือนเมื่อไม่ผ่าน)
              </label>
              <textarea
                rows={2}
                value={config.evaluation.note || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  evaluation: { ...prev.evaluation, note: e.target.value }
                }))}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#3F51B5]"
                placeholder="เช่น นิสิตจะไม่ผ่านการฝึกงานในกรณีดังต่อไปนี้: คะแนนประเมินรวมได้น้อยกว่า 70 คะแนน"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSaveEvaluation}
                disabled={saving}
                className="px-6 py-3 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <Save size={16} /> {saving ? 'กำลังบันทึก...' : 'บันทึกเกณฑ์การประเมิน'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📅 TAB 3: Schedule */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="text-[#3F51B5]" size={20} /> กำหนดการประจำปีการศึกษา
              </h2>
              <p className="text-xs text-slate-400 mt-1">กำหนดการสำคัญ เช่น วันยื่นคำร้อง, วันปิดภาคการศึกษา, ช่วงเวลาออกฝึกงาน</p>
            </div>
            <button
              onClick={() => handleOpenCreate('schedule')}
              className="px-4 py-2 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
            >
              <Plus size={16} /> เพิ่มกำหนดการ
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">#</th>
                  <th className="px-6 py-4">กิจกรรม / กำหนดการ</th>
                  <th className="px-6 py-4 text-center w-72">ช่วงเวลาและรายละเอียด</th>
                  <th className="px-6 py-4 text-center w-28">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scheduleItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs">
                      ยังไม่มีรายการกำหนดการ คลิกปุ่ม "เพิ่มกำหนดการ" เพื่อสร้างรายการใหม่
                    </td>
                  </tr>
                ) : (
                  scheduleItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{item.title}</td>
                      <td className="px-6 py-4 text-center font-bold text-[#3F51B5] bg-indigo-50/30">
                        {item.content}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 text-slate-400 hover:text-[#3F51B5] hover:bg-slate-100 rounded-lg transition-all"
                            title="แก้ไข"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition-all"
                            title="ลบ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🚀 TAB 4: Process Steps */}
      {activeTab === 'process' && (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-[#3F51B5]" size={20} /> ลำดับขั้นตอนการดำเนินการฝึกงาน
              </h2>
              <p className="text-xs text-slate-400 mt-1">แสดงเป็นกล่องการ์ดขั้นตอนที่ 1 ถึง 9 ในหน้าแสดงผล</p>
            </div>
            <button
              onClick={() => handleOpenCreate('process')}
              className="px-4 py-2 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
            >
              <Plus size={16} /> เพิ่มขั้นตอน
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processItems.map((step, idx) => (
              <div key={step.id} className="p-6 bg-slate-50 hover:bg-white rounded-3xl border border-slate-200/80 shadow-sm relative group flex flex-col justify-between transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-2xl bg-[#3F51B5] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-100">
                      {idx + 1}
                    </div>
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(step)}
                        className="p-1.5 text-slate-400 hover:text-[#3F51B5] rounded-lg"
                        title="แก้ไข"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(step.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                        title="ลบ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-[#3F51B5] mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🔗 TAB 5: External Links */}
      {activeTab === 'links' && (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Link2 className="text-[#3F51B5]" size={20} /> จัดการลิงก์เอกสาร & สถานที่ฝึกงาน
            </h2>
            <p className="text-xs text-slate-400 mt-1">ปุ่มลิงก์ทางลัด Google Drive และ Google Sheets ที่ปรากฏด้านบนของขั้นตอนการฝึกงาน</p>
          </div>

          <div className="space-y-6 max-w-3xl">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <FileText size={16} className="text-[#3F51B5]" /> ลิงก์โฟลเดอร์เอกสารประกอบการฝึกงาน (Google Drive)
              </label>
              <input
                type="url"
                value={config.links.docsUrl}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  links: { ...prev.links, docsUrl: e.target.value }
                }))}
                placeholder="https://drive.google.com/drive/folders/..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#3F51B5]"
              />
              <p className="text-[11px] text-slate-400">ปุ่ม "ดูเอกสารประกอบการฝึกงาน" จะเปิดไปยัง URL นี้</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <Link2 size={16} className="text-emerald-500" /> ลิงก์ตรวจสอบสถานที่ฝึกงาน (Google Sheets / Portal)
              </label>
              <input
                type="url"
                value={config.links.placesUrl}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  links: { ...prev.links, placesUrl: e.target.value }
                }))}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#3F51B5]"
              />
              <p className="text-[11px] text-slate-400">ปุ่ม "ตรวจสอบสถานที่ฝึกงาน" จะเปิดไปยัง URL นี้</p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveLinks}
                disabled={saving}
                className="px-6 py-3 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
              >
                <Save size={16} /> {saving ? 'กำลังบันทึก...' : 'บันทึกลิงก์เอกสาร'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 w-full max-w-lg space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {modalMode === 'create' ? 'เพิ่มรายการใหม่' : 'แก้ไขรายการ'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">หมวดหมู่ข้อมูล</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    disabled={modalMode === 'edit'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3F51B5]"
                  >
                    <option value="qualification">คุณสมบัตินักศึกษาฝึกงาน</option>
                    <option value="criteria">เกณฑ์การฝึกงาน</option>
                    <option value="note">หมายเหตุ</option>
                    <option value="schedule">กำหนดการประจำปี</option>
                    <option value="process">ขั้นตอนการฝึกงาน (Process Step)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {formData.section === 'schedule' ? 'ชื่อกิจกรรม / กำหนดการ' : formData.section === 'process' ? 'ชื่อขั้นตอน (Title)' : 'หัวข้อย่อย (ถ้ามี)'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={formData.section === 'schedule' ? 'เช่น วันปิดภาคการศึกษาที่ 2/2568' : 'ระบุหัวข้อ'}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#3F51B5]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {formData.section === 'schedule' ? 'ช่วงเวลาและรายละเอียด (Date / Details)' : 'รายละเอียดเนื้อหา'}
                  </label>
                  <textarea
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={formData.section === 'schedule' ? 'เช่น บัดนี้ - 13 มีนาคม 2569' : 'ระบุรายละเอียดข้อความ'}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#3F51B5]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
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
