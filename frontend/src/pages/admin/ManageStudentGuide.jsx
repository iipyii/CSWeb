import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark, Plus, Trash2, Edit3, Save, RefreshCw,
  AlertCircle, CheckCircle2, ExternalLink, FileText,
  UploadCloud, MoveUp, MoveDown, Eye, X, Link as LinkIcon
} from 'lucide-react';

export default function ManageStudentGuide() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [sourceType, setSourceType] = useState('url'); // 'url' | 'upload'
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    year: '2569',
    type: 'PDF',
    url: '',
    order: 1,
    file: null
  });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 4000);
  };

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/student-guides');
      const list = res.data?.data || [];
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setGuides(list);
    } catch (error) {
      console.error('Fetch student guides error:', error);
      showAlert('error', 'โหลดข้อมูลคู่มือนักศึกษาไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  // Open Modal Create
  const handleOpenCreate = () => {
    setModalMode('create');
    setSourceType('url');
    setFormData({
      id: String(Date.now()),
      title: 'คู่มือนักศึกษา ปี 2569',
      year: '2569',
      type: 'PDF',
      url: '',
      order: guides.length + 1,
      file: null
    });
    setModalOpen(true);
  };

  // Open Modal Edit
  const handleOpenEdit = (item) => {
    setModalMode('edit');
    const isUploaded = item.url?.startsWith('/uploads/');
    setSourceType(isUploaded ? 'upload' : 'url');
    setFormData({
      id: item.id,
      title: item.title,
      year: item.year || '',
      type: item.type || 'PDF',
      url: item.url || '',
      order: item.order || 1,
      file: null
    });
    setModalOpen(true);
  };

  // Submit Save
  const handleSaveGuide = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showAlert('error', 'กรุณาระบุชื่อคู่มือ');
      return;
    }

    try {
      setSaving(true);
      let targetUrl = formData.url.trim();

      // If upload mode and a new file is attached
      if (sourceType === 'upload' && formData.file) {
        const uploadData = new FormData();
        uploadData.append('file', formData.file);
        const uploadRes = await axios.post('http://localhost:5000/api/student-guides/upload-file', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        targetUrl = uploadRes.data.fileUrl;
      }

      if (!targetUrl) {
        showAlert('error', 'กรุณาระบุลิงก์ URL หรือเลือกไฟล์ PDF');
        setSaving(false);
        return;
      }

      let updatedList = [...guides];
      const newObj = {
        id: formData.id,
        title: formData.title.trim(),
        year: formData.year.trim(),
        type: formData.type.trim(),
        url: targetUrl,
        order: Number(formData.order) || 1
      };

      if (modalMode === 'create') {
        updatedList.push(newObj);
      } else {
        updatedList = updatedList.map(g => g.id === formData.id ? newObj : g);
      }

      // Re-index orders
      updatedList.forEach((g, idx) => { g.order = idx + 1; });

      await axios.post('http://localhost:5000/api/student-guides', { data: updatedList }, { withCredentials: true });
      setGuides(updatedList);
      showAlert('success', 'บันทึกข้อมูลคู่มือนักศึกษาสำเร็จ');
      setModalOpen(false);
    } catch (error) {
      console.error('Save guide error:', error);
      showAlert('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  // Delete Guide
  const handleDeleteGuide = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคู่มือนี้?')) return;
    try {
      const updatedList = guides.filter(g => g.id !== id);
      updatedList.forEach((g, idx) => { g.order = idx + 1; });
      await axios.post('http://localhost:5000/api/student-guides', { data: updatedList }, { withCredentials: true });
      setGuides(updatedList);
      showAlert('success', 'ลบคู่มือสำเร็จ');
    } catch (error) {
      console.error('Delete guide error:', error);
      showAlert('error', 'เกิดข้อผิดพลาดในการลบคู่มือ');
    }
  };

  // Move Order
  const handleMoveOrder = async (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= guides.length) return;

    const list = [...guides];
    const [moved] = list.splice(idx, 1);
    list.splice(targetIdx, 0, moved);
    list.forEach((g, i) => { g.order = i + 1; });

    setGuides(list);
    try {
      await axios.post('http://localhost:5000/api/student-guides', { data: list }, { withCredentials: true });
    } catch (e) {
      console.error('Sync order error:', e);
    }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-50 text-[#3F51B5] rounded-xl font-bold">
              <Bookmark size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              จัดการคู่มือนักศึกษา (Student Guide)
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            จัดการรายการคู่มือนักศึกษา คู่มือการลงทะเบียน ลิงก์เอกสารทางการ และไฟล์ PDF ประจำแต่ละปีการศึกษา
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/student-guide"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <ExternalLink size={14} /> ดูหน้าบ้าน
          </a>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
          >
            <Plus size={16} /> เพิ่มคู่มือใหม่
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

      {/* Main Guides List Table Card */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-[#3F51B5]" size={20} /> รายการคู่มือทั้งหมด ({guides.length} รายการ)
          </h2>
          <span className="text-xs text-slate-400">คลิกลูกศรขึ้น-ลงเพื่อจัดลำดับการแสดงผล</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <RefreshCw size={28} className="animate-spin mx-auto text-[#3F51B5]" />
            <p className="text-sm font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        ) : guides.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            ยังไม่มีรายการคู่มือ คลิกปุ่ม "เพิ่มคู่มือใหม่" เพื่อสร้างรายการแรก
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 w-20 text-center">ลำดับ</th>
                  <th className="px-6 py-4">ชื่อคู่มือเอกสาร</th>
                  <th className="px-5 py-4 text-center w-32">ปีการศึกษา</th>
                  <th className="px-5 py-4 text-center w-28">ประเภท</th>
                  <th className="px-6 py-4">ลิงก์ / ไฟล์</th>
                  <th className="px-6 py-4 text-center w-36">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guides.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}</span>
                        <div className="flex flex-col">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveOrder(idx, 'up')}
                            className="text-slate-300 hover:text-[#3F51B5] disabled:opacity-20"
                          >
                            <MoveUp size={13} />
                          </button>
                          <button
                            disabled={idx === guides.length - 1}
                            onClick={() => handleMoveOrder(idx, 'down')}
                            className="text-slate-300 hover:text-[#3F51B5] disabled:opacity-20"
                          >
                            <MoveDown size={13} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-[#3F51B5] rounded-xl shrink-0">
                          <FileText size={18} />
                        </div>
                        <span>{item.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-lg text-xs font-bold">
                        {item.year || 'ทั่วไป'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold">
                        {item.type || 'PDF'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={getFullUrl(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#3F51B5] hover:underline truncate max-w-xs block font-medium"
                      >
                        {item.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={getFullUrl(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-[#3F51B5] hover:bg-slate-100 rounded-lg transition-all"
                          title="ดูเอกสาร"
                        >
                          <Eye size={16} />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-slate-400 hover:text-[#3F51B5] hover:bg-slate-100 rounded-lg transition-all"
                          title="แก้ไข"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteGuide(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition-all"
                          title="ลบ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Guide */}
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
                  {modalMode === 'create' ? 'เพิ่มคู่มือนักศึกษาใหม่' : 'แก้ไขคู่มือนักศึกษา'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveGuide} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อคู่มือ (Title)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="เช่น คู่มือนักศึกษา ปี 2569"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3F51B5]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">ปีการศึกษา</label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="เช่น 2569 หรือ ทั่วไป"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#3F51B5]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">ประเภทเอกสาร</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3F51B5]"
                    >
                      <option value="PDF">PDF</option>
                      <option value="Manual">Manual</option>
                      <option value="Link">Web Link</option>
                    </select>
                  </div>
                </div>

                {/* Source Type Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">ที่มาของไฟล์เอกสาร</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSourceType('url')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        sourceType === 'url'
                          ? 'bg-indigo-50 border-[#3F51B5] text-[#3F51B5]'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <LinkIcon size={14} /> ระบุ URL ลิงก์ตรง
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceType('upload')}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        sourceType === 'upload'
                          ? 'bg-indigo-50 border-[#3F51B5] text-[#3F51B5]'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <UploadCloud size={14} /> อัปโหลดไฟล์ PDF
                    </button>
                  </div>
                </div>

                {sourceType === 'url' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">URL ลิงก์ของเอกสาร (KMUTNB or External)</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://acdserv.kmutnb.ac.th/wp-content/uploads/..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#3F51B5]"
                      required={sourceType === 'url'}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">เลือกไฟล์ PDF</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3F51B5] file:text-white hover:file:bg-indigo-700"
                      required={sourceType === 'upload' && !formData.url}
                    />
                    {formData.url && <p className="text-[11px] text-slate-400 mt-1">ไฟล์ปัจจุบัน: {formData.url}</p>}
                  </div>
                )}

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
                    {saving ? 'กำลังบันทึก...' : 'บันทึกคู่มือ'}
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
