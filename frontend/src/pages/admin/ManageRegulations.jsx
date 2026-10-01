import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Plus, Search, Trash2, Edit3, ExternalLink, 
  RefreshCw, Loader2, Upload, X, Save, Eye, CheckCircle2,
  BookOpen, DollarSign, Users, GraduationCap, Award, Briefcase, Landmark
} from 'lucide-react';

const CATEGORIES = [
  { key: 'finance', label: 'งานการเงิน', icon: DollarSign, publicPath: '/finance-regulations' },
  { key: 'academic', label: 'งานวิชาการ', icon: BookOpen, publicPath: '/academic-regulations' },
  { key: 'personnel', label: 'งานบุคคล', icon: Users, publicPath: '/personnel-regulations' },
  { key: 'graduate', label: 'งานบัณฑิตศึกษา', icon: GraduationCap, publicPath: '/graduate-regulations' },
  { key: 'student_affairs', label: 'งานกิจการนักศึกษา', icon: Award, publicPath: '/student-affairs-regulations' },
  { key: 'coop', label: 'งานสหกิจศึกษา', icon: Briefcase, publicPath: '/coop-regulations' },
  { key: 'scholarship', label: 'งานทุนการศึกษา', icon: Landmark, publicPath: '/scholarship-regulations' },
];

export default function ManageRegulations() {
  const [activeTab, setActiveTab] = useState('finance');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'finance',
    file: null
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/downloads/regulation');
      setDocs(res.data || []);
    } catch (err) {
      console.error('Failed to load regulations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const currentCategory = CATEGORIES.find(c => c.key === activeTab);

  const filteredDocs = docs.filter(doc => {
    const matchCategory = doc.category === activeTab;
    const matchSearch = (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      category: activeTab,
      file: null
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      category: doc.category || activeTab,
      file: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารระเบียบนี้?')) return;
    try {
      await axios.delete(`/api/downloads/${id}`);
      alert('ลบเอกสารสำเร็จ');
      fetchDocs();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('เกิดข้อผิดพลาดในการลบเอกสาร');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('กรุณากรอกชื่อระเบียบ/ประกาศ');
      return;
    }

    if (!editingDoc && !formData.file) {
      alert('กรุณาเลือกไฟล์ PDF');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('audience', 'regulation');
      data.append('category', formData.category);
      if (formData.file) {
        data.append('file', formData.file);
      }

      if (editingDoc) {
        await axios.put(`/api/downloads/${editingDoc.id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('แก้ไขระเบียบ/ประกาศสำเร็จ');
      } else {
        await axios.post('/api/downloads/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('เพิ่มระเบียบ/ประกาศสำเร็จ');
      }

      setIsModalOpen(false);
      fetchDocs();
    } catch (err) {
      console.error('Submit regulation failed:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const getPdfViewUrl = (doc) => {
    if (!doc.file_path) return '#';
    if (doc.file_path.startsWith('http://') || doc.file_path.startsWith('https://')) {
      return doc.file_path;
    }
    // Check if it's an uploaded file or existing static file
    if (doc.file_path.endsWith('.pdf')) {
      return `/api/downloads/download/${doc.id}`;
    }
    return `/downloads/${doc.file_path}`;
  };

  return (
    <div className="space-y-6 text-left">
      {/* 🏛️ Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-[#3F51B5] rounded-xl">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">จัดการระเบียบและข้อบังคับ</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                จัดการเอกสาร ประกาศ และข้อบังคับทั้ง 7 ด้านของภาควิชาฯ
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentCategory && (
            <a
              href={currentCategory.publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-all"
            >
              <ExternalLink size={16} />
              <span>ดูหน้าเว็บจริง ({currentCategory.label})</span>
            </a>
          )}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#3F51B5] text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
          >
            <Plus size={18} />
            <span>เพิ่มระเบียบ/ประกาศใหม่</span>
          </button>
        </div>
      </div>

      {/* 🏷️ Category Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.key;
          const count = docs.filter(d => d.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveTab(cat.key)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 🔍 Search Bar & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={`ค้นหาใน ${currentCategory?.label || ''}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3F51B5] focus:border-transparent outline-none transition-all"
          />
        </div>

        <button
          onClick={fetchDocs}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all self-end md:self-auto"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* 📋 Table of Documents */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="animate-spin text-[#3F51B5]" size={36} />
            <span>กำลังโหลดเอกสารระเบียบ...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="mx-auto text-slate-300 mb-3" size={48} />
            <h3 className="text-base font-bold text-slate-700">ยังไม่มีเอกสารในหมวดหมู่นี้</h3>
            <p className="text-sm text-slate-400 mt-1 mb-5">
              คลิกปุ่ม &quot;เพิ่มระเบียบ/ประกาศใหม่&quot; ด้านบนเพื่ออัปโหลดเอกสาร
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3F51B5] text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
            >
              <Plus size={16} />
              <span>เพิ่มเอกสารใหม่</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">ลำดับ</th>
                  <th className="px-6 py-4">ชื่อประกาศ / ระเบียบ</th>
                  <th className="px-6 py-4 w-40 text-center">ประเภท / ไฟล์</th>
                  <th className="px-6 py-4 w-40 text-center">วันที่อัปโหลด</th>
                  <th className="px-6 py-4 w-32 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDocs.map((doc, idx) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800 leading-relaxed block">
                        {doc.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold uppercase">
                        {doc.file_type || 'PDF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-slate-400">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={getPdfViewUrl(doc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="ดูเอกสาร"
                          className="p-2 text-slate-500 hover:text-[#3F51B5] hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          title="แก้ไขชื่อ/ไฟล์"
                          className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          title="ลบเอกสาร"
                          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
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

      {/* 📝 Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {editingDoc ? 'แก้ไขระเบียบ/ประกาศ' : 'เพิ่มระเบียบ/ประกาศใหม่'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              หมวดหมู่: <span className="font-semibold text-[#3F51B5]">{CATEGORIES.find(c => c.key === formData.category)?.label}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  หมวดหมู่ระเบียบ
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-[#3F51B5] outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  ชื่อประกาศ / ระเบียบ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="เช่น ประกาศ เรื่อง หลักเกณฑ์การจ่ายเงิน..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-[#3F51B5] outline-none leading-relaxed"
                  required
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  ไฟล์เอกสาร (PDF) {editingDoc ? '(เลือกหากต้องการเปลี่ยนไฟล์)' : <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-[#3F51B5] hover:file:bg-indigo-100 cursor-pointer"
                />
                {editingDoc && editingDoc.file_path && !formData.file && (
                  <p className="text-xs text-slate-400 mt-2">
                    ไฟล์ปัจจุบัน: <span className="font-mono text-slate-600">{editingDoc.file_name || editingDoc.file_path}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3F51B5] text-white text-sm font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{editingDoc ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
