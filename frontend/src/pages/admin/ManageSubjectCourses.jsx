import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, Plus, Trash2, Edit3, Save,
  RefreshCw, AlertCircle, CheckCircle2, ExternalLink,
  FileText, UploadCloud, GraduationCap, Users, BookOpenCheck,
  X, Layers, FolderPlus, ArrowUpRight
} from 'lucide-react';

const CATEGORIES = [
  { id: 'วิทยาการคอมพิวเตอร์ (CS)', label: 'วิทยาการคอมพิวเตอร์ (CS)', icon: <GraduationCap size={18} /> },
  { id: 'วิทยาการคอมพิวเตอร์และธุรกิจ (CSB)', label: 'วิทยาการคอมพิวเตอร์และธุรกิจ (CSB)', icon: <BookOpenCheck size={18} /> },
  { id: 'ระดับบัณฑิตศึกษา (MCS)', label: 'ระดับบัณฑิตศึกษา (MCS)', icon: <GraduationCap size={18} /> },
  { id: 'ระดับปริญญาเอก (DCS)', label: 'ระดับปริญญาเอก (DCS)', icon: <GraduationCap size={18} /> },
  { id: 'บริการวิชาการนอกภาค', label: 'บริการวิชาการนอกภาค', icon: <Users size={18} /> },
];

export default function ManageSubjectCourses() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Modals
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');

  const [docModalOpen, setDocModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [docFormData, setDocFormData] = useState({
    id: null,
    year_id: '',
    semester: 1,
    category: 'วิทยาการคอมพิวเตอร์ (CS)',
    customCategory: '',
    title: '',
    order_no: 1,
    file: null
  });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 4000);
  };

  // Fetch Academic Years
  const fetchYears = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses/years');
      setYears(res.data || []);
      if (res.data?.length > 0 && !selectedYear) {
        setSelectedYear(res.data[0]);
      }
    } catch (error) {
      console.error('Fetch years error:', error);
      showAlert('error', 'โหลดข้อมูลปีการศึกษาไม่สำเร็จ');
    }
  };

  // Fetch Courses for Selected Year and Semester
  const fetchCourses = async () => {
    if (!selectedYear) return;
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/courses/${selectedYear.year}/${selectedSemester}`);
      setCourses(res.data || []);
    } catch (error) {
      console.error('Fetch courses error:', error);
      showAlert('error', 'โหลดรายการขบวนวิชาไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchCourses();
    }
  }, [selectedYear, selectedSemester]);

  // Create Academic Year
  const handleCreateYear = async (e) => {
    e.preventDefault();
    if (!newYearInput) return;
    try {
      setSaving(true);
      const res = await axios.post('http://localhost:5000/api/courses/years', { year: newYearInput }, { withCredentials: true });
      showAlert('success', `เพิ่มปีการศึกษา ${res.data.year} สำเร็จ`);
      setNewYearInput('');
      setYearModalOpen(false);
      await fetchYears();
      setSelectedYear(res.data);
    } catch (error) {
      console.error('Create year error:', error);
      showAlert('error', error.response?.data?.error || 'เกิดข้อผิดพลาดในการเพิ่มปีการศึกษา');
    } finally {
      setSaving(false);
    }
  };

  // Delete Academic Year
  const handleDeleteYear = async (yearObj) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบปีการศึกษา ${yearObj.year}? เอกสารทั้งหมดในปีนี้จะถูกลบไปด้วย`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/years/${yearObj.id}`, { withCredentials: true });
      showAlert('success', `ลบปีการศึกษา ${yearObj.year} สำเร็จ`);
      setSelectedYear(null);
      await fetchYears();
    } catch (error) {
      console.error('Delete year error:', error);
      showAlert('error', 'เกิดข้อผิดพลาดในการลบปีการศึกษา');
    }
  };

  // Open Document Modal for Create
  const handleOpenCreateDoc = (defaultCat) => {
    if (!selectedYear) return;
    setModalMode('create');
    setDocFormData({
      id: null,
      year_id: selectedYear.id,
      semester: selectedSemester,
      category: defaultCat || 'วิทยาการคอมพิวเตอร์ (CS)',
      customCategory: '',
      title: '',
      order_no: courses.length + 1,
      file: null
    });
    setDocModalOpen(true);
  };

  // Open Document Modal for Edit
  const handleOpenEditDoc = (doc) => {
    const isStandardCat = CATEGORIES.some(c => c.id === doc.category);
    setModalMode('edit');
    setDocFormData({
      id: doc.id,
      year_id: doc.year_id,
      semester: doc.semester,
      category: isStandardCat ? doc.category : 'custom',
      customCategory: isStandardCat ? '' : doc.category,
      title: doc.title,
      order_no: doc.order_no || 1,
      file: null
    });
    setDocModalOpen(true);
  };

  // Save Document (Create or Edit)
  const handleSaveDoc = async (e) => {
    e.preventDefault();
    if (!docFormData.title.trim()) {
      showAlert('error', 'กรุณาระบุชื่อเอกสาร');
      return;
    }

    if (modalMode === 'create' && !docFormData.file) {
      showAlert('error', 'กรุณาเลือกไฟล์ PDF ตารางขบวนวิชา');
      return;
    }

    const finalCategory = docFormData.category === 'custom' ? docFormData.customCategory.trim() : docFormData.category;
    if (!finalCategory) {
      showAlert('error', 'กรุณาระบุหมวดหมู่วิชา');
      return;
    }

    const formData = new FormData();
    formData.append('year_id', selectedYear.id);
    formData.append('semester', selectedSemester);
    formData.append('category', finalCategory);
    formData.append('title', docFormData.title.trim());
    formData.append('order_no', docFormData.order_no);
    if (docFormData.file) {
      formData.append('file', docFormData.file);
    }

    try {
      setSaving(true);
      if (modalMode === 'create') {
        await axios.post('http://localhost:5000/api/courses/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        showAlert('success', 'อัปโหลดเอกสารขบวนวิชาสำเร็จ');
      } else {
        await axios.put(`http://localhost:5000/api/courses/${docFormData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
        showAlert('success', 'แก้ไขข้อมูลเอกสารสำเร็จ');
      }
      setDocModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error('Save course error:', error);
      showAlert('error', error.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกเอกสาร');
    } finally {
      setSaving(false);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (id) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารนี้?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`, { withCredentials: true });
      showAlert('success', 'ลบเอกสารสำเร็จ');
      setCourses(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error('Delete doc error:', error);
      showAlert('error', 'เกิดข้อผิดพลาดในการลบเอกสาร');
    }
  };

  // Group current courses by category
  const groupedCourses = courses.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-8 text-left">
      {/* Top Banner */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-50 text-[#3F51B5] rounded-xl font-bold">
              <BookOpen size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              จัดการขบวนวิชา (ตารางสอน)
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            อัปโหลดและจัดการไฟล์ PDF ตารางขบวนวิชาที่เปิดสอนระดับ ป.ตรี - บัณฑิตศึกษา แยกตามปีและภาคการศึกษา
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedYear && (
            <a
              href={`/subject-courses/detail/${selectedYear.year}/${selectedSemester}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ExternalLink size={14} /> ดูหน้าบ้าน
            </a>
          )}
          <button
            onClick={() => setYearModalOpen(true)}
            className="px-4 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100"
          >
            <FolderPlus size={16} /> เพิ่มปีการศึกษา
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

      {/* Controls Bar: Year Selection & Semester Switcher */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Year Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 px-2 whitespace-nowrap">ปีการศึกษา:</span>
          {years.length === 0 ? (
            <span className="text-xs text-slate-400">ยังไม่มีปีการศึกษา</span>
          ) : (
            years.map(y => {
              const isSelected = selectedYear?.id === y.id;
              return (
                <div key={y.id} className="relative group shrink-0">
                  <button
                    onClick={() => setSelectedYear(y)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <span>พ.ศ. {y.year}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-500'
                    }`}>
                      {y._count?.course_documents || 0}
                    </span>
                  </button>
                  {years.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteYear(y); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm text-[10px]"
                      title={`ลบปี ${y.year}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Semester Selector Tabs & Add Doc Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/60">
            {[
              { sem: 1, label: 'ภาคเรียนที่ 1' },
              { sem: 2, label: 'ภาคเรียนที่ 2' },
              { sem: 3, label: 'ภาคฤดูร้อน' }
            ].map(s => (
              <button
                key={s.sem}
                onClick={() => setSelectedSemester(s.sem)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSemester === s.sem
                    ? 'bg-white text-[#3F51B5] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenCreateDoc()}
            disabled={!selectedYear}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-100"
          >
            <UploadCloud size={16} /> อัปโหลด PDF ขบวนวิชา
          </button>
        </div>
      </div>

      {/* Main Content Area: Grouped Course Documents */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 space-y-3 bg-white rounded-[2rem] border border-slate-100">
          <RefreshCw size={32} className="animate-spin mx-auto text-[#3F51B5]" />
          <p className="text-sm font-medium">กำลังโหลดเอกสารตารางขบวนวิชา...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-[2rem] border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700">
            ยังไม่มีเอกสารตารางขบวนวิชาสำหรับ ภาคเรียนที่ {selectedSemester}/{selectedYear?.year}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            คลิกปุ่ม "อัปโหลด PDF ขบวนวิชา" ด้านบนเพื่อเพิ่มไฟล์ PDF ตารางเรียนตารางสอนสำหรับแต่ละกลุ่มสาขาวิชา
          </p>
          <button
            onClick={() => handleOpenCreateDoc()}
            className="px-5 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <UploadCloud size={16} /> อัปโหลดเอกสารแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(groupedCourses).map(([category, docList]) => (
            <div key={category} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-[#3F51B5] rounded-xl font-bold">
                      <GraduationCap size={18} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">{category}</h3>
                  </div>
                  <button
                    onClick={() => handleOpenCreateDoc(category)}
                    className="p-1.5 text-slate-400 hover:text-[#3F51B5] hover:bg-slate-50 rounded-lg transition-all text-xs flex items-center gap-1 font-semibold"
                    title="เพิ่มในหมวดนี้"
                  >
                    <Plus size={14} /> เพิ่มไฟล์
                  </button>
                </div>

                <div className="space-y-2.5">
                  {docList.map((doc, idx) => (
                    <div
                      key={doc.id}
                      className="p-3.5 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 group transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 bg-white text-slate-400 group-hover:text-[#3F51B5] rounded-xl shadow-xs shrink-0 transition-colors">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-700 group-hover:text-slate-900 truncate">
                            {doc.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {doc.file_path}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={`http://localhost:5000/uploads/course/${doc.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-[#3F51B5] hover:bg-white rounded-lg transition-all"
                          title="เปิดดู PDF"
                        >
                          <ArrowUpRight size={16} />
                        </a>
                        <button
                          onClick={() => handleOpenEditDoc(doc)}
                          className="p-1.5 text-slate-400 hover:text-[#3F51B5] hover:bg-white rounded-lg transition-all"
                          title="แก้ไข"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                          title="ลบ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-50 flex items-center justify-between">
                <span>จำนวน {docList.length} ไฟล์</span>
                <span>ภาคเรียน {selectedSemester}/{selectedYear?.year}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: เพิ่มปีการศึกษา */}
      <AnimatePresence>
        {yearModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 w-full max-w-sm space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">เพิ่มปีการศึกษาใหม่</h3>
                <button
                  onClick={() => setYearModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateYear} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ปีการศึกษา (พ.ศ.)</label>
                  <input
                    type="number"
                    min="2550"
                    max="2600"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    placeholder="เช่น 2569"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3F51B5]"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setYearModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100"
                  >
                    {saving ? 'กำลังบันทึก...' : 'เพิ่มปีการศึกษา'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: อัปโหลด / แก้ไขไฟล์ขบวนวิชา */}
      <AnimatePresence>
        {docModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 w-full max-w-lg space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {modalMode === 'create' ? 'อัปโหลดเอกสารขบวนวิชา' : 'แก้ไขข้อมูลเอกสาร'}
                </h3>
                <button
                  onClick={() => setDocModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveDoc} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">ปีการศึกษา</label>
                    <input
                      type="text"
                      value={`พ.ศ. ${selectedYear?.year}`}
                      disabled
                      className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">ภาคการศึกษา</label>
                    <input
                      type="text"
                      value={`ภาคเรียนที่ ${selectedSemester}`}
                      disabled
                      className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">กลุ่มสาขาวิชา (Category)</label>
                  <select
                    value={docFormData.category}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3F51B5]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                    <option value="custom">+ ระบุหมวดหมู่อื่นๆ</option>
                  </select>
                </div>

                {docFormData.category === 'custom' && (
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อหมวดหมู่ที่กำหนดเอง</label>
                    <input
                      type="text"
                      value={docFormData.customCategory}
                      onChange={(e) => setDocFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                      placeholder="เช่น หลักสูตรนานาชาติ"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#3F51B5]"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อหัวข้อเอกสาร (Title)</label>
                  <input
                    type="text"
                    value={docFormData.title}
                    onChange={(e) => setDocFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="เช่น สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CS1 RA/RB/RC)"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#3F51B5]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    {modalMode === 'create' ? 'เลือกไฟล์ PDF ตารางเรียน' : 'เปลี่ยนไฟล์ PDF (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)'}
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setDocFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3F51B5] file:text-white hover:file:bg-indigo-700"
                    required={modalMode === 'create'}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setDocModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100"
                  >
                    {saving ? 'กำลังบันทึก...' : 'บันทึกเอกสาร'}
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
