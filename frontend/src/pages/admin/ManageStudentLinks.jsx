import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2, Plus, Trash2, Edit3, Save, RefreshCw,
  AlertCircle, CheckCircle2, ExternalLink, ArrowUp,
  ArrowDown, X, Table2, CalendarDays,
  BadgeDollarSign, UserPlus, UserCheck, FileText,
  ClipboardList, MessageSquareMore, ShieldAlert,
  Landmark, ShieldCheck, GraduationCap, Globe,
  BookOpen, Monitor, Award, Sparkles, Heart, Bell
} from 'lucide-react';

// Icon Map for dynamic icon rendering
const ICON_MAP = {
  Table2: Table2,
  CalendarDays: CalendarDays,
  BadgeDollarSign: BadgeDollarSign,
  UserPlus: UserPlus,
  UserCheck: UserCheck,
  FileText: FileText,
  ClipboardList: ClipboardList,
  MessageSquareMore: MessageSquareMore,
  ShieldAlert: ShieldAlert,
  Landmark: Landmark,
  ShieldCheck: ShieldCheck,
  GraduationCap: GraduationCap,
  Link2: Link2,
  Globe: Globe,
  BookOpen: BookOpen,
  Monitor: Monitor,
  Award: Award,
  Sparkles: Sparkles,
  Heart: Heart,
  Bell: Bell,
};

const COLOR_OPTIONS = [
  { label: 'Rose (ชมพู-แดง)', value: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'Orange (ส้ม)', value: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Amber (เหลืองทอง)', value: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Emerald (เขียว)', value: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Teal (เขียวหม่น)', value: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Cyan (ฟ้าอมเขียว)', value: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: 'Blue (ฟ้า)', value: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Indigo (น้ำเงินคราม)', value: 'text-indigo-600', bg: 'bg-indigo-50' },
  { label: 'Purple (ม่วง)', value: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Pink (ชมพู)', value: 'text-pink-500', bg: 'bg-pink-50' },
];

export default function ManageStudentLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    url: '',
    icon_name: 'Globe',
    color: 'text-indigo-600'
  });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 4000);
  };

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/student-links');
      setLinks(res.data?.data || []);
    } catch (error) {
      console.error('Fetch student links error:', error);
      showAlert('error', 'โหลดข้อมูลลิงก์สำหรับนักศึกษาไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      id: String(Date.now()),
      title: '',
      url: '',
      icon_name: 'Globe',
      color: 'text-indigo-600'
    });
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setFormData({
      id: item.id,
      title: item.title,
      url: item.url,
      icon_name: item.icon_name || 'Link2',
      color: item.color || 'text-indigo-600'
    });
    setModalOpen(true);
  };

  // Save Link item
  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      showAlert('error', 'กรุณากรอกชื่อบริการและ URL ให้ครบถ้วน');
      return;
    }

    try {
      setSaving(true);
      let updatedList = [...links];
      const newObj = {
        id: formData.id,
        title: formData.title.trim(),
        url: formData.url.trim(),
        icon_name: formData.icon_name,
        color: formData.color
      };

      if (modalMode === 'create') {
        updatedList.push(newObj);
      } else {
        updatedList = updatedList.map(l => l.id === formData.id ? newObj : l);
      }

      await axios.post('http://localhost:5000/api/student-links', { data: updatedList }, { withCredentials: true });
      setLinks(updatedList);
      showAlert('success', 'บันทึกข้อมูลลิงก์สำหรับนักศึกษาสำเร็จ');
      setModalOpen(false);
    } catch (error) {
      console.error('Save link error:', error);
      showAlert('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  // Delete Link
  const handleDeleteLink = async (id, title) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบลิงก์ "${title}"?`)) return;
    try {
      const updatedList = links.filter(l => l.id !== id);
      await axios.post('http://localhost:5000/api/student-links', { data: updatedList }, { withCredentials: true });
      setLinks(updatedList);
      showAlert('success', 'ลบลิงก์สำเร็จ');
    } catch (error) {
      console.error('Delete link error:', error);
      showAlert('error', 'เกิดข้อผิดพลาดในการลบลิงก์');
    }
  };

  // Move Order
  const handleMoveOrder = async (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= links.length) return;

    const list = [...links];
    const [moved] = list.splice(idx, 1);
    list.splice(targetIdx, 0, moved);

    setLinks(list);
    try {
      await axios.post('http://localhost:5000/api/student-links', { data: list }, { withCredentials: true });
    } catch (e) {
      console.error('Sync order error:', e);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-50 text-[#3F51B5] rounded-xl font-bold">
              <Link2 size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              จัดการลิงก์สำหรับนักศึกษา (Student Links)
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            จัดการการ์ดลิงก์ระบบบริการสำคัญสำหรับนักศึกษา เช่น ระบบลงทะเบียน, กยศ., ผลการเรียน, ซอฟต์แวร์ลิขสิทธิ์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/student-links"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ExternalLink size={14} /> ดูหน้าเว็บจริง
          </a>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
          >
            <Plus size={16} /> เพิ่มลิงก์ใหม่
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

      {/* Horizontal List of Student Links (Matching Personnel Style) */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Link2 className="text-[#3F51B5]" size={20} /> รายการลิงก์สำหรับนักศึกษา ({links.length} ลิงก์)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              จัดการลิงก์ระบบบริการ สวัสดิการ ระบบทะเบียน และบริการสารสนเทศสำหรับนักศึกษา
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
          >
            <Plus size={15} /> เพิ่มลิงก์ใหม่
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw size={28} className="animate-spin mx-auto text-[#3F51B5]" />
            <p className="text-sm font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            ยังไม่มีรายการลิงก์ คลิกปุ่ม "เพิ่มลิงก์ใหม่"
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((item, idx) => {
              const IconComp = ICON_MAP[item.icon_name] || Link2;
              return (
                <div
                  key={item.id || idx}
                  className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4 transition-all shadow-xs group"
                >
                  {/* Left info: Number, Icon, Title + URL */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 ${item.color || 'text-indigo-600'}`}>
                      <IconComp size={20} />
                    </div>

                    <div className="min-w-0 text-left">
                      <h3 className="text-sm font-bold text-slate-800 truncate">{item.title}</h3>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-slate-400 hover:text-indigo-600 truncate block font-mono"
                      >
                        {item.url}
                      </a>
                    </div>
                  </div>

                  {/* Right actions: Up, Down, Edit, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                      title="ย้ายขึ้น"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 'down')}
                      disabled={idx === links.length - 1}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                      title="ย้ายลง"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ml-1"
                      title="แก้ไขลิงก์"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(item.id, item.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบลิงก์"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Link */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 w-full max-w-lg space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {modalMode === 'create' ? 'เพิ่มลิงก์บริการนักศึกษา' : 'แก้ไขลิงก์บริการนักศึกษา'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveLink} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อระบบบริการ / ลิงก์ (Title) *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="เช่น ระบบลงทะเบียน"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">URL ปลายทาง *</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://reg.kmutnb.ac.th/"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                    required
                  />
                </div>

                {/* Icon Grid Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">เลือกไอคอน</label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    {Object.keys(ICON_MAP).map((iconName) => {
                      const Comp = ICON_MAP[iconName];
                      const isSelected = formData.icon_name === iconName;
                      return (
                        <button
                          type="button"
                          key={iconName}
                          onClick={() => setFormData(prev => ({ ...prev, icon_name: iconName }))}
                          className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#3F51B5] text-white shadow-sm ring-2 ring-indigo-200'
                              : 'bg-white text-slate-600 hover:bg-indigo-50 hover:text-[#3F51B5]'
                          }`}
                        >
                          <Comp size={20} />
                          <span className="text-[9px] mt-1 font-mono truncate w-full text-center">{iconName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">เลือกโทนสีไอคอน</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none font-medium"
                  >
                    {COLOR_OPTIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Preview Box */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs ${formData.color}`}>
                    {(() => {
                      const IconPreview = ICON_MAP[formData.icon_name] || Link2;
                      return <IconPreview size={20} />;
                    })()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{formData.title || 'ชื่อบริการ'}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-xs">{formData.url || 'https://...'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึกลิงก์'}
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
