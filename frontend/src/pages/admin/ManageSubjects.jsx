import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Edit2, Trash2, BookOpen, 
  Save, X, RefreshCw, UploadCloud, FileSpreadsheet, 
  FileText, Download, CheckCircle2, AlertCircle, 
  Loader2, Filter, ChevronLeft, ChevronRight, Eye,
  Layers
} from 'lucide-react';

const DEGREE_OPTIONS = [
  { value: 'all', label: 'ทุกระดับการศึกษา' },
  { value: 'bachelor', label: 'ปริญญาตรี (Bachelor)' },
  { value: 'master', label: 'ปริญญาโท (Master)' },
  { value: 'doctorate', label: 'ปริญญาเอก (Doctorate)' },
];

const DEFAULT_CURRICULUM_LIST = [
  { code: 'CS69', label: 'CS69 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2569)', year: 2569, degree: 'bachelor' },
  { code: 'CS64', label: 'CS64 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2564)', year: 2564, degree: 'bachelor' },
  { code: 'CSB64', label: 'CSB64 - โครงการพิเศษ สองภาษา (พ.ศ. 2564)', year: 2564, degree: 'bachelor' },
  { code: 'CS59', label: 'CS59 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2559)', year: 2559, degree: 'bachelor' },
  { code: 'CS54', label: 'CS54 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2554)', year: 2554, degree: 'bachelor' },
  { code: 'MS-CS67', label: 'MS-CS67 - วท.ม. วิทยาการคอมพิวเตอร์ (พ.ศ. 2567)', year: 2567, degree: 'master' },
  { code: 'MS-CS62', label: 'MS-CS62 - วท.ม. วิทยาการคอมพิวเตอร์ (พ.ศ. 2562)', year: 2562, degree: 'master' },
  { code: 'MS-SE59', label: 'MS-SE59 - วท.ม. วิศวกรรมซอฟต์แวร์ (พ.ศ. 2559)', year: 2559, degree: 'master' },
  { code: 'PhD-CS64', label: 'PhD-CS64 - ปร.ด. วิทยาการคอมพิวเตอร์ (พ.ศ. 2564)', year: 2564, degree: 'doctorate' },
];

const CATEGORY_OPTIONS = [
  'หมวดวิชาเฉพาะด้าน',
  'หมวดวิชาเฉพาะด้านบังคับ',
  'หมวดวิชาเลือก',
  'หมวดวิชาศึกษาทั่วไป',
  'หมวดโครงงาน/วิทยานิพนธ์',
  'หมวดฝึกงานและสหกิจศึกษา',
  'หมวดสัมมนา'
];

const TRACK_OPTIONS = [
  'ทั่วไป',
  'Software Engineering & Cloud',
  'Data Science & Artificial Intelligence',
  'Network & Cybersecurity',
  'IoT & Intelligent Systems'
];

export default function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState('all');
  const [selectedDegree, setSelectedDegree] = useState('all');
  const [selectedTrack, setSelectedTrack] = useState('all');

  // Dynamic Curriculum state
  const [curriculumList, setCurriculumList] = useState(DEFAULT_CURRICULUM_LIST);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState(false);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [curriculumActionLoading, setCurriculumActionLoading] = useState(false);
  const [editingCurriculumCode, setEditingCurriculumCode] = useState(null);
  const [editingCurriculumModalItem, setEditingCurriculumModalItem] = useState(null);
  const [editCurriculumForm, setEditCurriculumForm] = useState({
    code: '',
    label: '',
    year: 2569,
    degree: 'bachelor'
  });
  const [curriculumForm, setCurriculumForm] = useState({
    code: '',
    label: '',
    year: 2569,
    degree: 'bachelor'
  });
  const [curriculumFeedback, setCurriculumFeedback] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Manual CRUD Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subject_code: '',
    title_th: '',
    title_en: '',
    credit: '3(3-0-6)',
    prereq1: 'ไม่มี',
    prereq2: '',
    category: 'หมวดวิชาเฉพาะด้าน',
    curriculum_code: 'CS69',
    curriculum_year: 2569,
    degree_level: 'bachelor',
    track: 'ทั่วไป',
    description_th: '',
    description_en: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState('pdf'); // 'pdf' | 'excel'
  const [importFile, setImportFile] = useState(null);
  const [importConfig, setImportConfig] = useState({
    curriculum_code: 'CS69',
    curriculum_year: '2569',
    degree_level: 'bachelor',
    track: 'ทั่วไป',
    replace_existing: false
  });
  const [previewData, setPreviewData] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('csweb_token') || localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchCurriculums = async () => {
    try {
      setCurriculumLoading(true);
      const res = await axios.get('/api/subjects/curriculums');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCurriculumList(res.data);
      }
    } catch (err) {
      console.error("Failed to load curriculums:", err);
    } finally {
      setCurriculumLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculums();
    window.addEventListener('curriculums_updated', fetchCurriculums);
    return () => window.removeEventListener('curriculums_updated', fetchCurriculums);
  }, []);

  const handleSaveCurriculum = async (e) => {
    e?.preventDefault();
    if (!curriculumForm.code.trim() || !curriculumForm.label.trim()) {
      setCurriculumFeedback({ type: 'error', message: 'กรุณากรอกรหัสและชื่อหลักสูตรให้ครบถ้วน' });
      return;
    }
    setCurriculumActionLoading(true);
    setCurriculumFeedback(null);
    try {
      if (editingCurriculumCode) {
        await axios.put(`/api/subjects/curriculums/${editingCurriculumCode}`, {
          newCode: curriculumForm.code.trim(),
          label: curriculumForm.label.trim(),
          year: parseInt(curriculumForm.year) || 2569,
          degree: curriculumForm.degree
        }, getAuthHeaders());
        setCurriculumFeedback({ type: 'success', message: 'แก้ไขข้อมูลหลักสูตรเรียบร้อยแล้ว' });
      } else {
        await axios.post('/api/subjects/curriculums', {
          code: curriculumForm.code.trim(),
          label: curriculumForm.label.trim(),
          year: parseInt(curriculumForm.year) || 2569,
          degree: curriculumForm.degree
        }, getAuthHeaders());
        setCurriculumFeedback({ type: 'success', message: 'เพิ่มหลักสูตรใหม่เข้าสู่ระบบเรียบร้อยแล้ว' });
      }
      setEditingCurriculumCode(null);
      setCurriculumForm({ code: '', label: '', year: 2569, degree: 'bachelor' });
      await fetchCurriculums();
      window.dispatchEvent(new Event('curriculums_updated'));
    } catch (err) {
      setCurriculumFeedback({ 
        type: 'error', 
        message: err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกหลักสูตร' 
      });
    } finally {
      setCurriculumActionLoading(false);
    }
  };

  const handleDeleteCurriculum = async (code) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหลักสูตร "${code}" ออกจากตัวเลือก?`)) {
      return;
    }
    setCurriculumActionLoading(true);
    setCurriculumFeedback(null);
    try {
      await axios.delete(`/api/subjects/curriculums/${code}`, getAuthHeaders());
      setCurriculumFeedback({ type: 'success', message: `ลบหลักสูตร ${code} สำเร็จ` });
      if (selectedCurriculum === code) setSelectedCurriculum('all');
      await fetchCurriculums();
      window.dispatchEvent(new Event('curriculums_updated'));
    } catch (err) {
      setCurriculumFeedback({ 
        type: 'error', 
        message: err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบหลักสูตร' 
      });
    } finally {
      setCurriculumActionLoading(false);
    }
  };  const handleOpenEditCurriculumModal = (c) => {
    setEditingCurriculumModalItem(c);
    setEditCurriculumForm({
      code: c.code,
      label: c.label || '',
      year: c.year || 2569,
      degree: c.degree || 'bachelor'
    });
    setCurriculumFeedback(null);
  };

  const handleSaveEditedCurriculumModal = async (e) => {
    e?.preventDefault();
    if (!editCurriculumForm.code.trim() || !editCurriculumForm.label.trim()) {
      alert('กรุณากรอกรหัสและชื่อหลักสูตรให้ครบถ้วน');
      return;
    }
    setCurriculumActionLoading(true);
    try {
      await axios.put(`/api/subjects/curriculums/${editingCurriculumModalItem.code}`, {
        newCode: editCurriculumForm.code.trim(),
        label: editCurriculumForm.label.trim(),
        year: parseInt(editCurriculumForm.year) || 2569,
        degree: editCurriculumForm.degree
      }, getAuthHeaders());
      
      setEditingCurriculumModalItem(null);
      setCurriculumFeedback({ type: 'success', message: 'แก้ไขข้อมูลหลักสูตรเรียบร้อยแล้ว' });
      await fetchCurriculums();
      window.dispatchEvent(new Event('curriculums_updated'));
      await fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.error || 'เกิดข้อผิดพลาดในการแก้ไขหลักสูตร');
    } finally {
      setCurriculumActionLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCurriculum !== 'all') params.curriculum_code = selectedCurriculum;
      if (selectedDegree !== 'all') params.degree_level = selectedDegree;
      if (selectedTrack !== 'all') params.track = selectedTrack;
      if (searchTerm.trim()) params.keyword = searchTerm.trim();

      const res = await axios.get("/api/subjects", { params });
      setSubjects(res.data || []);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to load subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [selectedCurriculum, selectedDegree, selectedTrack]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      subject_code: '',
      title_th: '',
      title_en: '',
      credit: '3(3-0-6)',
      prereq1: 'ไม่มี',
      prereq2: '',
      category: 'หมวดวิชาเฉพาะด้าน',
      curriculum_code: selectedCurriculum !== 'all' ? selectedCurriculum : 'CS69',
      curriculum_year: 2569,
      degree_level: selectedDegree !== 'all' ? selectedDegree : 'bachelor',
      track: selectedTrack !== 'all' ? selectedTrack : 'ทั่วไป',
      description_th: '',
      description_en: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData({
      subject_code: subject.subject_code || '',
      title_th: subject.title_th || '',
      title_en: subject.title_en || '',
      credit: subject.credit || '3(3-0-6)',
      prereq1: subject.prereq1 || 'ไม่มี',
      prereq2: subject.prereq2 || '',
      category: subject.category || 'หมวดวิชาเฉพาะด้าน',
      curriculum_code: subject.curriculum_code || 'CS69',
      curriculum_year: subject.curriculum_year || 2569,
      degree_level: subject.degree_level || 'bachelor',
      track: subject.track || 'ทั่วไป',
      description_th: subject.description_th || '',
      description_en: subject.description_en || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!formData.subject_code.trim() || !formData.title_th.trim()) {
      alert("กรุณาระบุรหัสวิชาและชื่อวิชาภาษาไทย");
      return;
    }

    try {
      setSubmitting(true);
      if (editingSubject) {
        await axios.put(`/api/subjects/${editingSubject.id}`, formData, getAuthHeaders());
        alert("แก้ไขข้อมูลรายวิชาสำเร็จ");
      } else {
        await axios.post("/api/subjects", formData, getAuthHeaders());
        alert("เพิ่มข้อมูลรายวิชาสำเร็จ");
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (error) {
      console.error("Save subject error:", error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกรายวิชา");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (id, code, title) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชา "${code} ${title}"?`)) {
      try {
        await axios.delete(`/api/subjects/${id}`, getAuthHeaders());
        alert("ลบรายวิชาสำเร็จ");
        fetchSubjects();
      } catch (error) {
        console.error("Delete subject error:", error);
        alert("เกิดข้อผิดพลาดในการลบรายวิชา");
      }
    }
  };

  // Import Actions
  const handlePreviewImport = async () => {
    if (!importFile) {
      alert("กรุณาเลือกไฟล์ที่ต้องการนำเข้าก่อน");
      return;
    }

    try {
      setImportLoading(true);
      const fd = new FormData();
      fd.append("file", importFile);
      fd.append("action", "preview");
      fd.append("curriculum_code", importConfig.curriculum_code);
      fd.append("curriculum_year", importConfig.curriculum_year);
      fd.append("degree_level", importConfig.degree_level);
      fd.append("track", importConfig.track);

      const endpoint = importTab === 'pdf' 
        ? "/api/subjects/import-pdf"
        : "/api/subjects/import-excel";

      const res = await axios.post(endpoint, fd, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data"
        }
      });

      setPreviewData(res.data);
    } catch (error) {
      console.error("Preview import error:", error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการวิเคราะห์ไฟล์");
    } finally {
      setImportLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importFile) {
      alert("กรุณาเลือกไฟล์");
      return;
    }

    try {
      setImportLoading(true);
      const fd = new FormData();
      fd.append("file", importFile);
      fd.append("action", "import");
      fd.append("curriculum_code", importConfig.curriculum_code);
      fd.append("curriculum_year", importConfig.curriculum_year);
      fd.append("degree_level", importConfig.degree_level);
      fd.append("track", importConfig.track);
      fd.append("replace_existing", String(importConfig.replace_existing));

      const endpoint = importTab === 'pdf' 
        ? "/api/subjects/import-pdf"
        : "/api/subjects/import-excel";

      const res = await axios.post(endpoint, fd, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data"
        }
      });

      alert(res.data?.message || "นำเข้าข้อมูลรายวิชาสำเร็จเรียบร้อย");
      setIsImportModalOpen(false);
      setImportFile(null);
      setPreviewData(null);
      fetchSubjects();
    } catch (error) {
      console.error("Confirm import error:", error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
    } finally {
      setImportLoading(false);
    }
  };

  const paginatedSubjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return subjects.slice(start, start + pageSize);
  }, [subjects, currentPage, pageSize]);

  const totalPages = Math.ceil(subjects.length / pageSize) || 1;

  return (
    <div className="space-y-6 text-left pb-20">
      
      {/* 🚀 Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BookOpen className="text-[#3F51B5]" size={32} /> จัดการคำอธิบายรายวิชา (Subjects)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ค้นหา แก้ไข เพิ่มเติม หรือ นำเข้ารายวิชาอัตโนมัติจากเล่มหลักสูตร PDF / Excel
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={fetchSubjects}
            title="รีเฟรช"
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-[#3F51B5] transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => {
              setIsCurriculumModalOpen(true);
              setCurriculumFeedback(null);
              setEditingCurriculumCode(null);
              setCurriculumForm({ code: '', label: '', year: 2569, degree: 'bachelor' });
            }}
            className="flex items-center gap-2 bg-slate-800 text-white px-4 py-3 rounded-2xl font-bold text-xs shadow-md hover:bg-slate-900 transition-all active:scale-95"
          >
            <Layers size={17} /> จัดการปี/หลักสูตร ({curriculumList.length})
          </button>
          <button 
            onClick={() => {
              setIsImportModalOpen(true);
              setPreviewData(null);
              setImportFile(null);
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
          >
            <UploadCloud size={17} /> นำเข้าข้อมูล (Import PDF / Excel)
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#3F51B5] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-lg shadow-indigo-100 hover:bg-[#2D3B8E] transition-all active:scale-95"
          >
            <Plus size={18} /> เพิ่มรายวิชาใหม่
          </button>
        </div>
      </header>

      {/* 🔍 Filter & Search Bar */}
      <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="ค้นหารหัสวิชา, ชื่อภาษาไทย หรือ ชื่อภาษาอังกฤษ..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Curriculum Select */}
          <div>
            <select 
              className="w-full bg-slate-50 border-none rounded-xl text-xs p-3 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-bold text-slate-700 cursor-pointer"
              value={selectedCurriculum}
              onChange={(e) => setSelectedCurriculum(e.target.value)}
            >
              <option value="all">ทุกหลักสูตร</option>
              {curriculumList.map(c => (
                <option key={c.code} value={c.code}>{c.label || `${c.code} (พ.ศ. ${c.year})`}</option>
              ))}
            </select>
          </div>

          {/* Degree Select */}
          <div>
            <select 
              className="w-full bg-slate-50 border-none rounded-xl text-xs p-3 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-bold text-slate-700 cursor-pointer"
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
            >
              {DEGREE_OPTIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats and Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">พบทั้งหมด:</span>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-[#3F51B5] font-black rounded-lg text-xs">
              {subjects.length} รายวิชา
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>แสดงหน้าละ:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-50 text-slate-700 rounded-lg p-1 text-xs font-bold"
            >
              <option value={15}>15 รายการ</option>
              <option value={30}>30 รายการ</option>
              <option value={50}>50 รายการ</option>
              <option value={100}>100 รายการ</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📊 Subjects Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">รหัส / ปี</th>
                <th className="px-6 py-4">ชื่อวิชา (TH / EN)</th>
                <th className="px-6 py-4">หน่วยกิต</th>
                <th className="px-6 py-4">หลักสูตร / แขนง</th>
                <th className="px-6 py-4">วิชาบังคับก่อน</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#3F51B5]" />
                    กำลังโหลดข้อมูลรายวิชา...
                  </td>
                </tr>
              ) : paginatedSubjects.length > 0 ? (
                paginatedSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono font-black text-sm text-[#3F51B5]">{subject.subject_code}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        ปี พ.ศ. {subject.curriculum_year} ({subject.curriculum_code})
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-bold text-slate-800 text-sm leading-snug">{subject.title_th}</div>
                      <div className="text-slate-400 text-[11px] italic line-clamp-1 mt-0.5">{subject.title_en}</div>
                      {subject.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded">
                          {subject.category}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-mono font-bold rounded-lg border border-amber-200/60 text-xs">
                        {subject.credit}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700 capitalize">{subject.degree_level}</div>
                      <div className="text-[11px] text-slate-400">{subject.track || 'ทั่วไป'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-[11px]">
                      <div><span className="font-bold text-slate-400">1:</span> {subject.prereq1 || 'ไม่มี'}</div>
                      {subject.prereq2 && (
                        <div><span className="font-bold text-slate-400">2:</span> {subject.prereq2}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-1">
                        <button 
                          onClick={() => openEditModal(subject)} 
                          className="p-2 text-slate-400 hover:text-[#3F51B5] hover:bg-indigo-50 rounded-xl transition-all"
                          title="แก้ไข"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSubject(subject.id, subject.subject_code, subject.title_th)} 
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
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
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                    ไม่พบข้อมูลรายวิชาที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              หน้า <span className="font-bold text-slate-800">{currentPage}</span> จาก <span className="font-bold text-slate-800">{totalPages}</span> หน้า
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#3F51B5] text-white shadow-md'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 Modal: นำเข้าข้อมูลรายวิชา (Import PDF / Excel) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
                  <UploadCloud className="text-emerald-600" size={28} /> นำเข้ารายวิชาสู่ฐานข้อมูล (Import)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  รองรับการถอดรหัสจากเอกสาร มคอ.2 หมวด 3 (PDF) อัตโนมัติ หรือ อัปโหลดผ่านไฟล์แม่แบบ Excel (.xlsx)
                </p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400">
                <X size={22} />
              </button>
            </div>

            {/* Import Method Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
              <button
                onClick={() => { setImportTab('pdf'); setPreviewData(null); }}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  importTab === 'pdf'
                    ? 'bg-white text-[#3F51B5] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText size={16} /> นำเข้าอัตโนมัติจากไฟล์ PDF (หมวด 3)
              </button>
              <button
                onClick={() => { setImportTab('excel'); setPreviewData(null); }}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  importTab === 'excel'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileSpreadsheet size={16} /> นำเข้าจากไฟล์ Excel / CSV
              </button>
            </div>

            {/* Quick Curriculum Selector */}
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-xs text-indigo-950 font-bold flex items-center gap-2 shrink-0">
                <Layers size={16} className="text-[#3F51B5]" /> เลือกปี/หลักสูตรที่มีในระบบ:
              </div>
              <select
                onChange={(e) => {
                  const sel = curriculumList.find(c => c.code === e.target.value);
                  if (sel) {
                    setImportConfig(prev => ({
                      ...prev,
                      curriculum_code: sel.code,
                      curriculum_year: String(sel.year),
                      degree_level: sel.degree
                    }));
                  }
                }}
                className="w-full md:w-auto flex-1 px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-bold text-slate-700 cursor-pointer"
              >
                <option value="">-- หรือเลือกหลักสูตรที่บันทึกไว้เพื่อกรอกอัตโนมัติ --</option>
                {curriculumList.map(c => (
                  <option key={c.code} value={c.code}>{c.label || `${c.code} (พ.ศ. ${c.year})`}</option>
                ))}
              </select>
            </div>

            {/* Configuration Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">รหัสหลักสูตรกำกับ (เช่น CS69)</label>
                <input 
                  type="text"
                  value={importConfig.curriculum_code}
                  onChange={(e) => setImportConfig({ ...importConfig, curriculum_code: e.target.value })}
                  placeholder="CS69"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5] font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">ปี พ.ศ. หลักสูตร</label>
                <input 
                  type="number"
                  value={importConfig.curriculum_year}
                  onChange={(e) => setImportConfig({ ...importConfig, curriculum_year: e.target.value })}
                  placeholder="2569"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5] font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">ระดับการศึกษา</label>
                <select
                  value={importConfig.degree_level}
                  onChange={(e) => setImportConfig({ ...importConfig, degree_level: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5] font-bold cursor-pointer"
                >
                  <option value="bachelor">ปริญญาตรี (Bachelor)</option>
                  <option value="master">ปริญญาโท (Master)</option>
                  <option value="doctorate">ปริญญาเอก (Doctorate)</option>
                </select>
              </div>
            </div>

            {/* File Upload Box */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#3F51B5] transition-colors bg-white">
              <input
                type="file"
                id="file-upload"
                accept={importTab === 'pdf' ? '.pdf' : '.xlsx,.xls,.csv'}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImportFile(e.target.files[0]);
                    setPreviewData(null);
                  }
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 bg-indigo-50 text-[#3F51B5] rounded-full flex items-center justify-center mx-auto">
                  {importTab === 'pdf' ? <FileText size={24} /> : <FileSpreadsheet size={24} />}
                </div>
                <div className="text-xs font-bold text-slate-700">
                  {importFile ? (
                    <span className="text-emerald-600 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={16} /> เลือกไฟล์แล้ว: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                    </span>
                  ) : (
                    <span>คลิกเพื่อเลือกไฟล์ {importTab === 'pdf' ? 'PDF หมวด 3' : 'Excel (.xlsx, .csv)'} หรือ ลากไฟล์มาวางที่นี่</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {importTab === 'pdf' ? 'ระบบจะตัดคำภาษาไทยและจัดกลุ่มรายวิชาโดยอัตโนมัติ' : 'กรุณาใช้ฟิลด์ตามตารางแม่แบบ'}
                </div>
              </label>

              {importTab === 'excel' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                  <a
                    href="/api/subjects/template"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#3F51B5] hover:underline bg-indigo-50 px-4 py-2 rounded-xl"
                  >
                    <Download size={14} /> ดาวน์โหลดไฟล์แม่แบบตัวอย่าง (Subjects Template .xlsx)
                  </a>
                </div>
              )}
            </div>

            {/* Replace Checkbox */}
            <div className="flex items-center gap-2 px-2">
              <input
                type="checkbox"
                id="replace_existing"
                checked={importConfig.replace_existing}
                onChange={(e) => setImportConfig({ ...importConfig, replace_existing: e.target.checked })}
                className="w-4 h-4 text-[#3F51B5] rounded cursor-pointer"
              />
              <label htmlFor="replace_existing" className="text-xs font-bold text-slate-700 cursor-pointer">
                ลบข้อมูลรายวิชาเดิมของหลักสูตรและปีนี้ก่อนทำการบันทึก (Replace Existing Records)
              </label>
            </div>

            {/* Preview Box */}
            {previewData && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> {previewData.message}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    แสดงตัวอย่าง {previewData.subjects?.length} รายการ
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-slate-400 border-b border-slate-200">
                      <tr>
                        <th className="py-1">รหัสวิชา</th>
                        <th className="py-1">ชื่อวิชา (TH)</th>
                        <th className="py-1">หน่วยกิต</th>
                        <th className="py-1">วิชาบังคับก่อน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {previewData.subjects?.slice(0, 10).map((s, idx) => (
                        <tr key={idx}>
                          <td className="py-1 font-mono font-bold text-[#3F51B5]">{s.subject_code}</td>
                          <td className="py-1">{s.title_th}</td>
                          <td className="py-1">{s.credit}</td>
                          <td className="py-1">{s.prereq1 || 'ไม่มี'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.subjects?.length > 10 && (
                    <div className="text-center text-[10px] text-slate-400 italic py-1">
                      ...และอีก {previewData.subjects.length - 10} รายวิชา
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handlePreviewImport}
                disabled={!importFile || importLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {importLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                1. ตรวจสอบตัวอย่าง (Preview)
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={!importFile || importLoading}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {importLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                2. ยืนยันนำเข้าลงฐานข้อมูล (Confirm & Import)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 Modal Form: เพิ่ม/แก้ไขข้อมูลรายวิชา (Manual CRUD) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <BookOpen className="text-[#3F51B5]" size={22} />
                  {editingSubject ? `แก้ไขรายวิชา: ${editingSubject.subject_code}` : "เพิ่มรายวิชาใหม่"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400">
                  <X size={20}/>
                </button>
              </div>

              <form onSubmit={handleSaveSubject} className="p-6 md:p-8 overflow-y-auto space-y-5 text-left text-xs">
                
                {/* Row 1: Code, Credit, Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">รหัสวิชา (subject_code) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="เช่น 040613001" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-mono font-bold" 
                      value={formData.subject_code} 
                      onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">หน่วยกิต (credit)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น 3(2-2-5)" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-mono" 
                      value={formData.credit} 
                      onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">หมวดหมู่วิชา (category)</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] cursor-pointer" 
                      value={formData.category} 
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Quick Curriculum Selector */}
                <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5 shrink-0">
                    <Layers size={15} className="text-[#3F51B5]" /> เลือกจากหลักสูตรที่มีในระบบ:
                  </span>
                  <select
                    onChange={(e) => {
                      const sel = curriculumList.find(c => c.code === e.target.value);
                      if (sel) {
                        setFormData(prev => ({
                          ...prev,
                          curriculum_code: sel.code,
                          curriculum_year: sel.year,
                          degree_level: sel.degree
                        }));
                      }
                    }}
                    className="w-full md:w-auto flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="">-- เลือกหลักสูตรเพื่อกรอกรหัส/ปี/ระดับการศึกษาอัตโนมัติ --</option>
                    {curriculumList.map(c => (
                      <option key={c.code} value={c.code}>{c.label || `${c.code} (พ.ศ. ${c.year})`}</option>
                    ))}
                  </select>
                </div>

                {/* Row 2: Curriculum Code, Year, Degree, Track */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">รหัสหลักสูตร</label>
                    <input 
                      type="text" 
                      placeholder="CS69" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-bold" 
                      value={formData.curriculum_code} 
                      onChange={(e) => setFormData({ ...formData, curriculum_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">ปีหลักสูตร (พ.ศ.)</label>
                    <input 
                      type="number" 
                      placeholder="2569" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5]" 
                      value={formData.curriculum_year} 
                      onChange={(e) => setFormData({ ...formData, curriculum_year: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">ระดับการศึกษา</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] cursor-pointer" 
                      value={formData.degree_level} 
                      onChange={(e) => setFormData({ ...formData, degree_level: e.target.value })}
                    >
                      <option value="bachelor">ปริญญาตรี</option>
                      <option value="master">ปริญญาโท</option>
                      <option value="doctorate">ปริญญาเอก</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">กลุ่ม/แขนงวิชา</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] cursor-pointer" 
                      value={formData.track} 
                      onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    >
                      {TRACK_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 3: Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">ชื่อวิชา (ภาษาไทย) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="เช่น การเขียนโปรแกรมคอมพิวเตอร์ 1" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-bold" 
                      value={formData.title_th} 
                      onChange={(e) => setFormData({ ...formData, title_th: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">ชื่อวิชา (ภาษาอังกฤษ)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น Computer Programming I" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5]" 
                      value={formData.title_en} 
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 4: Prereq 1 & 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">วิชาบังคับก่อน 1 (prereq1)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น ไม่มี หรือ 040613001" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5]" 
                      value={formData.prereq1} 
                      onChange={(e) => setFormData({ ...formData, prereq1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block">วิชาบังคับก่อน 2 (prereq2)</label>
                    <input 
                      type="text" 
                      placeholder="เช่น 040613002 (ถ้ามี)" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5]" 
                      value={formData.prereq2} 
                      onChange={(e) => setFormData({ ...formData, prereq2: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 5: Descriptions */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">คำอธิบายรายวิชา (ภาษาไทย)</label>
                  <textarea 
                    rows={3} 
                    placeholder="ระบุคำอธิบายรายวิชาภาษาไทย..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5]" 
                    value={formData.description_th} 
                    onChange={(e) => setFormData({ ...formData, description_th: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">คำอธิบายรายวิชา (ภาษาอังกฤษ)</label>
                  <textarea 
                    rows={3} 
                    placeholder="Course description in English..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5]" 
                    value={formData.description_en} 
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-[#3F51B5] text-white rounded-xl font-bold hover:bg-[#2D3B8E] shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {editingSubject ? "บันทึกการแก้ไข" : "บันทึกรายวิชาใหม่"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🎓 Modal: จัดการตัวเลือกปีและหลักสูตร (Curriculums Manager) */}
      <AnimatePresence>
        {isCurriculumModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }} 
              className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto text-left"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2.5">
                    <Layers className="text-[#3F51B5]" size={28} /> จัดการตัวเลือกปีและหลักสูตร (Curriculums)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    เพิ่ม ลบ หรือแก้ไขตัวเลือกหลักสูตรและปีการศึกษา โดยตัวเลือกนี้จะถูกนำไปแสดงในแถบตัวกรองและเมนูเลือกหลักสูตรทั้งหมด
                  </p>
                </div>
                <button 
                  onClick={() => setIsCurriculumModalOpen(false)} 
                  className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Feedback Alert */}
              {curriculumFeedback && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
                  curriculumFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {curriculumFeedback.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : <AlertCircle size={18} className="shrink-0 text-rose-600" />}
                  <span>{curriculumFeedback.message}</span>
                </div>
              )}

              {/* Add / Edit Form */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    {editingCurriculumCode ? (
                      <>
                        <Edit2 size={16} className="text-[#3F51B5]" /> แก้ไขหลักสูตร: <span className="text-[#3F51B5]">{editingCurriculumCode}</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} className="text-emerald-600" /> เพิ่มหลักสูตร / ปีการศึกษาใหม่
                      </>
                    )}
                  </h3>
                  {editingCurriculumCode && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCurriculumCode(null);
                        setCurriculumForm({ code: '', label: '', year: 2569, degree: 'bachelor' });
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
                    >
                      ยกเลิกโหมดแก้ไข
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveCurriculum} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">รหัสหลักสูตร *</label>
                      <input 
                        type="text" 
                        placeholder="เช่น CS69, MS-CS67" 
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-bold"
                        value={curriculumForm.code}
                        onChange={(e) => setCurriculumForm({ ...curriculumForm, code: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">ปี พ.ศ. *</label>
                      <input 
                        type="number" 
                        placeholder="2569" 
                        required
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-bold"
                        value={curriculumForm.year}
                        onChange={(e) => setCurriculumForm({ ...curriculumForm, year: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">ระดับการศึกษา</label>
                      <select 
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-bold cursor-pointer"
                        value={curriculumForm.degree}
                        onChange={(e) => setCurriculumForm({ ...curriculumForm, degree: e.target.value })}
                      >
                        <option value="bachelor">ปริญญาตรี (Bachelor)</option>
                        <option value="master">ปริญญาโท (Master)</option>
                        <option value="doctorate">ปริญญาเอก (Doctorate)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button 
                        type="submit"
                        disabled={curriculumActionLoading}
                        className="w-full py-2.5 px-4 bg-[#3F51B5] text-white rounded-xl font-bold hover:bg-[#2D3B8E] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {curriculumActionLoading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : editingCurriculumCode ? (
                          <>
                            <Save size={16} /> บันทึกการแก้ไข
                          </>
                        ) : (
                          <>
                            <Plus size={16} /> เพิ่มหลักสูตร
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1 text-xs">ชื่อเต็ม / คำอธิบายหลักสูตร (Label) *</label>
                    <input 
                      type="text" 
                      placeholder="เช่น CS69 - วท.บ. วิทยาการคอมพิวเตอร์ (พ.ศ. 2569)" 
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5] font-medium"
                      value={curriculumForm.label}
                      onChange={(e) => setCurriculumForm({ ...curriculumForm, label: e.target.value })}
                    />
                  </div>
                </form>
              </div>

              {/* Existing Curriculums Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    รายการหลักสูตรในระบบ ({curriculumList.length})
                  </h3>
                  <button 
                    onClick={fetchCurriculums}
                    disabled={curriculumLoading}
                    className="text-xs text-[#3F51B5] hover:underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw size={12} className={curriculumLoading ? "animate-spin" : ""} /> รีเฟรชรายการ
                  </button>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5">รหัส</th>
                        <th className="p-3.5">ระดับ</th>
                        <th className="p-3.5">ปี พ.ศ.</th>
                        <th className="p-3.5">จำนวนวิชา</th>
                        <th className="p-3.5">ชื่อหลักสูตร (แสดงผลในเมนู)</th>
                        <th className="p-3.5 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {curriculumList.map((c) => (
                        <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-black text-slate-800">{c.code}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              c.degree === 'master' 
                                ? 'bg-amber-100 text-amber-800' 
                                : c.degree === 'doctorate' || c.degree === 'doctor'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {c.degree === 'master' ? 'ปริญญาโท' : c.degree === 'doctorate' || c.degree === 'doctor' ? 'ปริญญาเอก' : 'ปริญญาตรี'}
                            </span>
                          </td>
                          <td className="p-3.5 font-bold text-slate-600">{c.year}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                              c.subjectCount > 0 ? 'bg-indigo-50 text-[#3F51B5]' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {c.subjectCount !== undefined ? `${c.subjectCount} วิชา` : '-'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-700 font-medium">{c.label}</td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCurriculumModal(c)}
                                className="p-1.5 text-slate-400 hover:text-[#3F51B5] hover:bg-indigo-50 rounded-lg transition-colors"
                                title="แก้ไข"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCurriculum(c.code)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="ลบ"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsCurriculumModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✏️ Dedicated Edit Curriculum Modal Dialog (No scrolling needed) */}
      <AnimatePresence>
        {editingCurriculumModalItem && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-50 text-[#3F51B5] rounded-xl">
                    <Edit2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      แก้ไขข้อมูลหลักสูตร: <span className="text-[#3F51B5]">{editingCurriculumModalItem.code}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      การแก้ไขรหัสหลักสูตรจะอัปเดตรายวิชาทั้งหมดที่ผูกอยู่กับหลักสูตรนี้โดยอัตโนมัติ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCurriculumModalItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEditedCurriculumModal} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">รหัสหลักสูตร *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น CSB64, CS69"
                      value={editCurriculumForm.code}
                      onChange={(e) => setEditCurriculumForm({ ...editCurriculumForm, code: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">ปี พ.ศ. *</label>
                    <input
                      type="number"
                      required
                      placeholder="2564"
                      value={editCurriculumForm.year}
                      onChange={(e) => setEditCurriculumForm({ ...editCurriculumForm, year: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1 text-xs">ระดับการศึกษา *</label>
                  <select
                    value={editCurriculumForm.degree}
                    onChange={(e) => setEditCurriculumForm({ ...editCurriculumForm, degree: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#3F51B5] font-bold text-slate-800 cursor-pointer text-xs"
                  >
                    <option value="bachelor">ปริญญาตรี (Bachelor)</option>
                    <option value="master">ปริญญาโท (Master)</option>
                    <option value="doctorate">ปริญญาเอก (Doctorate)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1 text-xs">ชื่อเต็ม / คำอธิบายหลักสูตร (Label) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น CSB64 - โครงการพิเศษ สองภาษา (พ.ศ. 2564)"
                    value={editCurriculumForm.label}
                    onChange={(e) => setEditCurriculumForm({ ...editCurriculumForm, label: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5] font-medium text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * ชื่อนี้จะแสดงผลในตัวเลือก Dropdown ของทั้งหน้าบ้านและหลังบ้านทันที
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCurriculumModalItem(null)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={curriculumActionLoading}
                    className="px-5 py-2.5 bg-[#3F51B5] text-white font-bold rounded-xl text-xs hover:bg-[#2D3B8E] shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {curriculumActionLoading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <>
                        <Save size={15} /> บันทึกการแก้ไข
                      </>
                    )}
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