import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, Users, Link2, Plus, Search, Edit3, Trash2, 
  UploadCloud, ExternalLink, RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, ArrowUp, ArrowDown, Mail, Phone, BookOpen, 
  X, Save, ShieldCheck, Wallet, BarChart3, Monitor, MonitorPlay, 
  Landmark, HeartPulse, UserCog, CalendarDays, FileEdit, FileSpreadsheet, 
  ClipboardCheck, Globe, UserCheck
} from 'lucide-react';

const ICON_MAP = {
  Users: Users,
  Wallet: Wallet,
  BarChart3: BarChart3,
  Monitor: Monitor,
  MonitorPlay: MonitorPlay,
  ShieldCheck: ShieldCheck,
  Landmark: Landmark,
  HeartPulse: HeartPulse,
  GraduationCap: GraduationCap,
  UserCog: UserCog,
  CalendarDays: CalendarDays,
  FileEdit: FileEdit,
  FileSpreadsheet: FileSpreadsheet,
  ClipboardCheck: ClipboardCheck,
  Globe: Globe,
  BookOpen: BookOpen
};

const COLOR_OPTIONS = [
  { label: 'Rose (ชมพู-แดง)', value: 'text-rose-500', bg: 'bg-rose-50' },
  { label: 'Purple (ม่วง)', value: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Blue (น้ำเงิน)', value: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Indigo (คราม/แบรนด์)', value: 'text-indigo-500', bg: 'bg-indigo-50' },
  { label: 'Orange (ส้ม)', value: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'Amber (เหลืองทอง)', value: 'text-amber-500', bg: 'bg-amber-50' },
  { label: 'Emerald (เขียวมรกต)', value: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Teal (เขียวหัวเป็ด)', value: 'text-teal-600', bg: 'bg-teal-50' },
  { label: 'Cyan (ฟ้าสว่าง)', value: 'text-cyan-600', bg: 'bg-cyan-50' },
  { label: 'Pink (ชมพู)', value: 'text-pink-500', bg: 'bg-pink-50' },
  { label: 'Stone (เทาเข้ม)', value: 'text-stone-500', bg: 'bg-stone-50' },
];

export default function ManagePersonnel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'lecturers'); // 'lecturers' | 'staff' | 'links'

  useEffect(() => {
    if (tabParam && ['lecturers', 'staff', 'links'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Data lists
  const [lecturers, setLecturers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [linksList, setLinksList] = useState([]);

  // Search queries
  const [searchLecturer, setSearchLecturer] = useState('');
  const [filterLecturerRole, setFilterLecturerRole] = useState('all');
  const [searchStaff, setSearchStaff] = useState('');

  // Modals state
  const [lecturerModal, setLecturerModal] = useState({ open: false, mode: 'create', data: null });
  const [staffModal, setStaffModal] = useState({ open: false, mode: 'create', data: null });
  const [linkModal, setLinkModal] = useState({ open: false, mode: 'create', data: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', id: null, name: '' });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 4000);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [resLect, resStaff, resLinks] = await Promise.all([
        axios.get('http://localhost:5000/api/lecturers'),
        axios.get('http://localhost:5000/api/staff'),
        axios.get('http://localhost:5000/api/personnel-links')
      ]);

      setLecturers(resLect.data || []);
      setStaffList(resStaff.data || []);
      setLinksList(resLinks.data?.data || []);
    } catch (err) {
      console.error('Failed to load personnel data:', err);
      showAlert('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูลบุคลากร');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Helper for image url
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    const cleanPath = img.replace(/\\/g, '/').replace(/^\//, '');
    return `http://localhost:5000/${cleanPath}`;
  };

  // Image Upload helper
  const handleImageUpload = async (e, endpoint, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      showAlert('info', 'กำลังอัปโหลดรูปภาพ...');
      const res = await axios.post(`http://localhost:5000/api/${endpoint}/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (res.data?.imagePath) {
        callback(res.data.imagePath);
        showAlert('success', 'อัปโหลดรูปภาพสำเร็จ');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      showAlert('error', 'อัปโหลดรูปภาพไม่สำเร็จ กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง');
    }
  };

  // ======================= 1. LECTURER HANDLERS =======================
  const handleOpenCreateLecturer = () => {
    setLecturerModal({
      open: true,
      mode: 'create',
      data: {
        lecturer_code: '',
        fullname_th: '',
        fullname_en: '',
        position_th: 'อาจารย์ประจำ',
        position_en: 'Lecturer',
        email: '',
        tel: '',
        education_th: '',
        education_en: '',
        image_path: '',
        orcid: '',
        scholar_name: ''
      }
    });
  };

  const handleOpenEditLecturer = (lect) => {
    setLecturerModal({
      open: true,
      mode: 'edit',
      data: { ...lect }
    });
  };

  const handleSaveLecturer = async (e) => {
    e.preventDefault();
    const data = lecturerModal.data;
    if (!data.lecturer_code?.trim() || !data.fullname_th?.trim()) {
      showAlert('error', 'กรุณากรอกรหัสอาจารย์และชื่อ-นามสกุลภาษาไทย');
      return;
    }

    try {
      setSaving(true);
      if (lecturerModal.mode === 'create') {
        const res = await axios.post('http://localhost:5000/api/lecturers', data, { withCredentials: true });
        setLecturers(prev => [...prev, res.data.lecturer]);
        showAlert('success', 'เพิ่มข้อมูลอาจารย์สำเร็จ');
      } else {
        const res = await axios.put(`http://localhost:5000/api/lecturers/${data.id}`, data, { withCredentials: true });
        setLecturers(prev => prev.map(l => l.id === data.id ? res.data.lecturer : l));
        showAlert('success', 'แก้ไขข้อมูลอาจารย์สำเร็จ');
      }
      setLecturerModal({ open: false, mode: 'create', data: null });
    } catch (err) {
      console.error('Save lecturer failed:', err);
      showAlert('error', err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลอาจารย์');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLecturer = async (id) => {
    try {
      setSaving(true);
      await axios.delete(`http://localhost:5000/api/lecturers/${id}`, { withCredentials: true });
      setLecturers(prev => prev.filter(l => l.id !== id));
      showAlert('success', 'ลบข้อมูลอาจารย์เรียบร้อยแล้ว');
      setDeleteConfirm({ open: false, type: '', id: null, name: '' });
    } catch (err) {
      console.error('Delete lecturer failed:', err);
      showAlert('error', err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบข้อมูลอาจารย์');
    } finally {
      setSaving(false);
    }
  };

  // ======================= 2. STAFF HANDLERS =======================
  const handleOpenCreateStaff = () => {
    setStaffModal({
      open: true,
      mode: 'create',
      data: {
        staff_code: '',
        fullname_th: '',
        fullname_en: '',
        position_th: 'เจ้าหน้าที่บริหารงานทั่วไป',
        position_en: 'General Administration Officer',
        email: '',
        image_path: ''
      }
    });
  };

  const handleOpenEditStaff = (staff) => {
    setStaffModal({
      open: true,
      mode: 'edit',
      data: { ...staff }
    });
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    const data = staffModal.data;
    if (!data.fullname_th?.trim()) {
      showAlert('error', 'กรุณากรอกชื่อ-นามสกุลภาษาไทย');
      return;
    }

    try {
      setSaving(true);
      if (staffModal.mode === 'create') {
        const res = await axios.post('http://localhost:5000/api/staff', data, { withCredentials: true });
        setStaffList(prev => [...prev, res.data.staff]);
        showAlert('success', 'เพิ่มบุคลากรสายสนับสนุนสำเร็จ');
      } else {
        const res = await axios.put(`http://localhost:5000/api/staff/${data.id}`, data, { withCredentials: true });
        setStaffList(prev => prev.map(s => s.id === data.id ? res.data.staff : s));
        showAlert('success', 'แก้ไขบุคลากรสายสนับสนุนสำเร็จ');
      }
      setStaffModal({ open: false, mode: 'create', data: null });
    } catch (err) {
      console.error('Save staff failed:', err);
      showAlert('error', err.response?.data?.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลเจ้าหน้าที่');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (id) => {
    try {
      setSaving(true);
      await axios.delete(`http://localhost:5000/api/staff/${id}`, { withCredentials: true });
      setStaffList(prev => prev.filter(s => s.id !== id));
      showAlert('success', 'ลบข้อมูลบุคลากรสายสนับสนุนเรียบร้อยแล้ว');
      setDeleteConfirm({ open: false, type: '', id: null, name: '' });
    } catch (err) {
      console.error('Delete staff failed:', err);
      showAlert('error', err.response?.data?.error || 'เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  // ======================= 3. PERSONNEL LINKS HANDLERS =======================
  const handleOpenCreateLink = () => {
    setLinkModal({
      open: true,
      mode: 'create',
      index: null,
      data: {
        id: String(Date.now()),
        title: '',
        url: 'https://',
        icon_name: 'Globe',
        color: 'text-indigo-500'
      }
    });
  };

  const handleOpenEditLink = (item, index) => {
    setLinkModal({
      open: true,
      mode: 'edit',
      index,
      data: { ...item }
    });
  };

  const handleSaveLinkItem = async (e) => {
    e.preventDefault();
    const data = linkModal.data;
    if (!data.title?.trim() || !data.url?.trim()) {
      showAlert('error', 'กรุณากรอกชื่อลิงก์และ URL');
      return;
    }

    let updatedLinks = [...linksList];
    if (linkModal.mode === 'create') {
      updatedLinks.push(data);
    } else {
      updatedLinks[linkModal.index] = data;
    }

    try {
      setSaving(true);
      await axios.post('http://localhost:5000/api/personnel-links', { data: updatedLinks }, { withCredentials: true });
      setLinksList(updatedLinks);
      showAlert('success', 'บันทึกข้อมูลลิงก์สำเร็จ');
      setLinkModal({ open: false, mode: 'create', index: null, data: null });
    } catch (err) {
      console.error('Save personnel link error:', err);
      showAlert('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูลลิงก์');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (index) => {
    const updatedLinks = linksList.filter((_, idx) => idx !== index);
    try {
      setSaving(true);
      await axios.post('http://localhost:5000/api/personnel-links', { data: updatedLinks }, { withCredentials: true });
      setLinksList(updatedLinks);
      showAlert('success', 'ลบลิงก์เรียบร้อยแล้ว');
      setDeleteConfirm({ open: false, type: '', id: null, name: '' });
    } catch (err) {
      console.error('Delete link error:', err);
      showAlert('error', 'เกิดข้อผิดพลาดในการลบลิงก์');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveLink = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= linksList.length) return;

    const updated = [...linksList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setLinksList(updated);
    try {
      await axios.post('http://localhost:5000/api/personnel-links', { data: updated }, { withCredentials: true });
      showAlert('success', 'ปรับเปลี่ยนลำดับลิงก์สำเร็จ');
    } catch (err) {
      console.error('Move link error:', err);
      showAlert('error', 'เกิดข้อผิดพลาดในการบันทึกลำดับ');
    }
  };

  // Filtered lists
  const filteredLecturers = lecturers.filter(l => {
    const matchesSearch = 
      (l.fullname_th && l.fullname_th.toLowerCase().includes(searchLecturer.toLowerCase())) ||
      (l.fullname_en && l.fullname_en.toLowerCase().includes(searchLecturer.toLowerCase())) ||
      (l.lecturer_code && l.lecturer_code.toLowerCase().includes(searchLecturer.toLowerCase())) ||
      (l.email && l.email.toLowerCase().includes(searchLecturer.toLowerCase()));

    if (filterLecturerRole === 'exec') {
      return matchesSearch && (
        l.position_en?.includes('Head') ||
        l.position_en?.includes('Assistant') ||
        l.position_th?.includes('หัวหน้า')
      );
    }
    if (filterLecturerRole === 'faculty') {
      return matchesSearch && (
        !l.position_en?.includes('Head') &&
        !l.position_en?.includes('Assistant') &&
        !l.position_th?.includes('หัวหน้า')
      );
    }
    return matchesSearch;
  });

  const filteredStaff = staffList.filter(s => {
    return (
      (s.fullname_th && s.fullname_th.toLowerCase().includes(searchStaff.toLowerCase())) ||
      (s.fullname_en && s.fullname_en.toLowerCase().includes(searchStaff.toLowerCase())) ||
      (s.position_th && s.position_th.toLowerCase().includes(searchStaff.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchStaff.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 text-left pb-16">
      
      {/* 🌟 Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Users className="text-[#3F51B5]" size={28} />
            จัดการข้อมูลบุคลากร
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            จัดการบุคลากรสายวิชาการ (อาจารย์), บุคลากรสายสนับสนุน (Staff) และลิงก์สำหรับบุคลากร
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            title="รีเฟรชข้อมูล"
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl transition-all border border-slate-200 shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          {activeTab === 'lecturers' && (
            <a
              href="/administrator"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all"
            >
              <ExternalLink size={14} /> ดูหน้าเว็บจริง
            </a>
          )}
          {activeTab === 'staff' && (
            <a
              href="/staff"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all"
            >
              <ExternalLink size={14} /> ดูหน้าเว็บจริง
            </a>
          )}
          {activeTab === 'links' && (
            <a
              href="/personnel-links"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all"
            >
              <ExternalLink size={14} /> ดูหน้าเว็บจริง
            </a>
          )}
        </div>
      </header>

      {/* 🔔 Notification Alert */}
      <AnimatePresence>
        {alertInfo.show && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-sm ${
              alertInfo.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              alertInfo.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {alertInfo.type === 'success' && <CheckCircle2 size={20} className="text-emerald-600" />}
            {alertInfo.type === 'error' && <AlertCircle size={20} className="text-rose-600" />}
            {alertInfo.type === 'info' && <Loader2 size={20} className="text-blue-600 animate-spin" />}
            <span>{alertInfo.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧭 Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => handleTabChange('lecturers')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'lecturers'
              ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <GraduationCap size={18} /> บุคลากรสายวิชาการ ({lecturers.length})
        </button>

        <button
          onClick={() => handleTabChange('staff')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'staff'
              ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <UserCheck size={18} /> บุคลากรสายสนับสนุน ({staffList.length})
        </button>

        <button
          onClick={() => handleTabChange('links')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'links'
              ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <Link2 size={18} /> ลิงก์สำหรับบุคลากร ({linksList.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#3F51B5] mr-2" />
          <span className="text-slate-500 font-medium text-sm">กำลังโหลดข้อมูลบุคลากร...</span>
        </div>
      ) : (
        <div>
          {/* ========================================================================= */}
          {/* 🎓 TAB 1: ACADEMIC PERSONNEL / LECTURERS */}
          {/* ========================================================================= */}
          {activeTab === 'lecturers' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อ, รหัส, หรืออีเมลอาจารย์..."
                      value={searchLecturer}
                      onChange={(e) => setSearchLecturer(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                    />
                  </div>

                  <select
                    value={filterLecturerRole}
                    onChange={(e) => setFilterLecturerRole(e.target.value)}
                    className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value="all">ทั้งหมด ({lecturers.length})</option>
                    <option value="exec">คณะผู้บริหาร</option>
                    <option value="faculty">คณาจารย์ประจำ</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateLecturer}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-all"
                >
                  <Plus size={16} /> เพิ่มอาจารย์ใหม่
                </button>
              </div>

              {/* Grid of Lecturers */}
              {filteredLecturers.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl text-center border border-slate-100 text-slate-400">
                  <GraduationCap size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-base font-medium">ไม่พบข้อมูลอาจารย์ที่ตรงกับคำค้นหา</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredLecturers.map((lect) => (
                    <div
                      key={lect.id}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Photo & Code Tag */}
                        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4 bg-slate-50 border border-slate-100">
                          {lect.image_path ? (
                            <img
                              src={getImageUrl(lect.image_path)}
                              alt={lect.fullname_th}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/img/placeholder-user.png'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                              <GraduationCap size={48} />
                              <span className="text-[10px] font-bold mt-1 text-slate-400">ไม่มีรูปภาพ</span>
                            </div>
                          )}
                          <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                            {lect.lecturer_code}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-800 leading-snug group-hover:text-[#3F51B5] transition-colors">
                          {lect.fullname_th}
                        </h3>
                        {lect.fullname_en && (
                          <p className="text-[11px] text-slate-400 font-light mt-0.5 line-clamp-1">{lect.fullname_en}</p>
                        )}
                        <div className="mt-2 inline-block px-2.5 py-0.5 bg-indigo-50 text-[#3F51B5] rounded text-[11px] font-bold">
                          {lect.position_th || 'อาจารย์ประจำ'}
                        </div>

                        {lect.email && (
                          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 truncate">
                            <Mail size={12} className="shrink-0 text-slate-400" />
                            {lect.email}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        <a
                          href={`/administrator/${lect.lecturer_code}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> หน้าโปรไฟล์
                        </a>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditLecturer(lect)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="แก้ไขข้อมูลอาจารย์"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm({ open: true, type: 'lecturer', id: lect.id, name: lect.fullname_th })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบข้อมูลอาจารย์"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 👥 TAB 2: SUPPORTING STAFF */}
          {/* ========================================================================= */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, ตำแหน่ง หรืออีเมลเจ้าหน้าที่..."
                    value={searchStaff}
                    onChange={(e) => setSearchStaff(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateStaff}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-all"
                >
                  <Plus size={16} /> เพิ่มบุคลากรสายสนับสนุน
                </button>
              </div>

              {/* Grid of Staff */}
              {filteredStaff.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl text-center border border-slate-100 text-slate-400">
                  <UserCheck size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-base font-medium">ไม่พบข้อมูลบุคลากรสายสนับสนุน</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Photo */}
                        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4 bg-slate-50 border border-slate-100">
                          {staff.image_path ? (
                            <img
                              src={getImageUrl(staff.image_path)}
                              alt={staff.fullname_th}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/img/placeholder-user.png'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                              <UserCheck size={48} />
                              <span className="text-[10px] font-bold mt-1 text-slate-400">ไม่มีรูปภาพ</span>
                            </div>
                          )}
                          {staff.staff_code && (
                            <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                              {staff.staff_code}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-slate-800 leading-snug group-hover:text-[#3F51B5] transition-colors">
                          {staff.fullname_th}
                        </h3>
                        {staff.fullname_en && (
                          <p className="text-[11px] text-slate-400 font-light mt-0.5 line-clamp-1">{staff.fullname_en}</p>
                        )}
                        <div className="mt-2 inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-bold">
                          {staff.position_th || 'เจ้าหน้าที่'}
                        </div>

                        {staff.email && (
                          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 truncate">
                            <Mail size={12} className="shrink-0 text-slate-400" />
                            {staff.email}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditStaff(staff)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="แก้ไขข้อมูลเจ้าหน้าที่"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ open: true, type: 'staff', id: staff.id, name: staff.fullname_th })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบข้อมูลเจ้าหน้าที่"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🔗 TAB 3: PERSONNEL LINKS */}
          {/* ========================================================================= */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    รายการลิงก์สำหรับบุคลากร ({linksList.length} ลิงก์)
                  </h2>
                  <p className="text-xs text-slate-400">
                    จัดการลิงก์ระบบงาน, สวัสดิการ, ระบบทะเบียน และบริการสารสนเทศสำหรับบุคลากร
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreateLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-all"
                >
                  <Plus size={16} /> เพิ่มลิงก์ใหม่
                </button>
              </div>

              {/* List of Links with drag/move & edit */}
              <div className="space-y-3">
                {linksList.map((item, idx) => {
                  const IconComponent = ICON_MAP[item.icon_name] || Globe;
                  return (
                    <div
                      key={item.id || idx}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>

                        <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 ${item.color || 'text-indigo-600'}`}>
                          <IconComponent size={20} />
                        </div>

                        <div className="min-w-0">
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

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveLink(idx, -1)}
                          disabled={idx === 0}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                          title="ย้ายขึ้น"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveLink(idx, 1)}
                          disabled={idx === linksList.length - 1}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                          title="ย้ายลง"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditLink(item, idx)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ml-1"
                          title="แก้ไขลิงก์"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ open: true, type: 'link', id: idx, name: item.title })}
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
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 MODAL 1: LECTURER FORM (ADD / EDIT) */}
      {/* ========================================================================= */}
      {lecturerModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 my-8 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <GraduationCap className="text-[#3F51B5]" size={22} />
                {lecturerModal.mode === 'create' ? 'เพิ่มข้อมูลอาจารย์ใหม่' : `แก้ไขข้อมูลอาจารย์ (${lecturerModal.data?.lecturer_code})`}
              </h2>
              <button
                type="button"
                onClick={() => setLecturerModal({ open: false, mode: 'create', data: null })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLecturer} className="space-y-4">
              {/* Photo & Basic Info */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-white shadow bg-white shrink-0 relative">
                  {lecturerModal.data?.image_path ? (
                    <img
                      src={getImageUrl(lecturerModal.data.image_path)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <GraduationCap size={32} />
                      <span className="text-[9px] mt-1 font-bold text-slate-400">ไม่มีรูป</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-[#3F51B5] bg-white hover:bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl shadow-2xs">
                    <UploadCloud size={14} /> อัปโหลดรูปโปรไฟล์อาจารย์
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'lecturers', (path) => setLecturerModal(prev => ({
                        ...prev,
                        data: { ...prev.data, image_path: path }
                      })))}
                    />
                  </label>
                  <p className="text-[11px] text-slate-400">แนะนำรูปอัตราส่วน 3:4 ขนาดไฟล์ไม่เกิน 10MB</p>
                </div>
              </div>

              {/* Input grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">รหัสอาจารย์ (Lecturer Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น TNA, LPP"
                    value={lecturerModal.data?.lecturer_code || ''}
                    onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, lecturer_code: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อ-นามสกุล (ไทย) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น รศ.ดร.ธนภัทร์ อนุศาสน์อมรกุล"
                    value={lecturerModal.data?.fullname_th || ''}
                    onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, fullname_th: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อ-นามสกุล (อังกฤษ)</label>
                <input
                  type="text"
                  placeholder="เช่น Assoc. Prof. Dr. Thanapat Anusas-amornkul"
                  value={lecturerModal.data?.fullname_en || ''}
                  onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, fullname_en: e.target.value } }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ตำแหน่ง (ไทย)</label>
                  <input
                    type="text"
                    placeholder="เช่น หัวหน้าภาควิชาฯ, อาจารย์ประจำ"
                    value={lecturerModal.data?.position_th || ''}
                    onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, position_th: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ตำแหน่ง (อังกฤษ)</label>
                  <input
                    type="text"
                    placeholder="เช่น Head of Department, Lecturer"
                    value={lecturerModal.data?.position_en || ''}
                    onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, position_en: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">อีเมล (Email)</label>
                  <input
                    type="email"
                    placeholder="เช่น tanapat.a@sci.kmutnb.ac.th"
                    value={lecturerModal.data?.email || ''}
                    onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, email: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">เบอร์โทรศัพท์ (Tel)</label>
                  <input
                    type="text"
                    placeholder="เช่น 02-555-2000 ต่อ 4601"
                    value={lecturerModal.data?.tel || ''}
                    onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, tel: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ประวัติการศึกษา (ไทย)</label>
                <textarea
                  rows={2}
                  placeholder="เช่น ปร.ด. (วิทยาการคอมพิวเตอร์) มหาวิทยาลัยเกษตรศาสตร์..."
                  value={lecturerModal.data?.education_th || ''}
                  onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, education_th: e.target.value } }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ORCID ID</label>
                  <input
                    type="text"
                    placeholder="0000-0000-0000-0000"
                    value={lecturerModal.data?.orcid || ''}
                    onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, orcid: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Google Scholar Name / Link</label>
                  <input
                    type="text"
                    placeholder="ชื่อหรือ ID บน Google Scholar"
                    value={lecturerModal.data?.scholar_name || ''}
                    onChange={(e) => setLecturerModal(prev => ({ ...prev, data: { ...prev.data, scholar_name: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLecturerModal({ open: false, mode: 'create', data: null })}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  บันทึกข้อมูลอาจารย์
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 MODAL 2: STAFF FORM (ADD / EDIT) */}
      {/* ========================================================================= */}
      {staffModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 my-8 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="text-[#3F51B5]" size={22} />
                {staffModal.mode === 'create' ? 'เพิ่มบุคลากรสายสนับสนุน' : 'แก้ไขข้อมูลบุคลากรสายสนับสนุน'}
              </h2>
              <button
                type="button"
                onClick={() => setStaffModal({ open: false, mode: 'create', data: null })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              {/* Photo & Basic Info */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-white shadow bg-white shrink-0 relative">
                  {staffModal.data?.image_path ? (
                    <img
                      src={getImageUrl(staffModal.data.image_path)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <UserCheck size={32} />
                      <span className="text-[9px] mt-1 font-bold text-slate-400">ไม่มีรูป</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold text-[#3F51B5] bg-white hover:bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl shadow-2xs">
                    <UploadCloud size={14} /> อัปโหลดรูปถ่ายเจ้าหน้าที่
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'staff', (path) => setStaffModal(prev => ({
                        ...prev,
                        data: { ...prev.data, image_path: path }
                      })))}
                    />
                  </label>
                  <p className="text-[11px] text-slate-400">แนะนำรูปอัตราส่วน 3:4 ขนาดไฟล์ไม่เกิน 10MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">รหัสเจ้าหน้าที่ (ถ้ามี)</label>
                  <input
                    type="text"
                    placeholder="เช่น STF-01"
                    value={staffModal.data?.staff_code || ''}
                    onChange={(e) => setStaffModal(prev => ({ ...prev, data: { ...prev.data, staff_code: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อ-นามสกุล (ไทย) *</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น นางสาวสมศรี มีสุข"
                    value={staffModal.data?.fullname_th || ''}
                    onChange={(e) => setStaffModal(prev => ({ ...prev, data: { ...prev.data, fullname_th: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อ-นามสกุล (อังกฤษ)</label>
                <input
                  type="text"
                  placeholder="เช่น Ms. Somsri Meesook"
                  value={staffModal.data?.fullname_en || ''}
                  onChange={(e) => setStaffModal(prev => ({ ...prev, data: { ...prev.data, fullname_en: e.target.value } }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ตำแหน่ง (ไทย)</label>
                  <input
                    type="text"
                    placeholder="เช่น เจ้าหน้าที่บริหารงานทั่วไป"
                    value={staffModal.data?.position_th || ''}
                    onChange={(e) => setStaffModal(prev => ({ ...prev, data: { ...prev.data, position_th: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ตำแหน่ง (อังกฤษ)</label>
                  <input
                    type="text"
                    placeholder="เช่น General Administration Officer"
                    value={staffModal.data?.position_en || ''}
                    onChange={(e) => setStaffModal(prev => ({ ...prev, data: { ...prev.data, position_en: e.target.value } }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">อีเมลติดต่อ (Email)</label>
                <input
                  type="email"
                  placeholder="เช่น somsri.m@sci.kmutnb.ac.th"
                  value={staffModal.data?.email || ''}
                  onChange={(e) => setStaffModal(prev => ({ ...prev, data: { ...prev.data, email: e.target.value } }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStaffModal({ open: false, mode: 'create', data: null })}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  บันทึกข้อมูลเจ้าหน้าที่
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 MODAL 3: PERSONNEL LINK FORM (ADD / EDIT) */}
      {/* ========================================================================= */}
      {linkModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Link2 className="text-[#3F51B5]" size={22} />
                {linkModal.mode === 'create' ? 'เพิ่มลิงก์สำหรับบุคลากร' : 'แก้ไขลิงก์สำหรับบุคลากร'}
              </h2>
              <button
                type="button"
                onClick={() => setLinkModal({ open: false, mode: 'create', index: null, data: null })}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLinkItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อลิงก์ / บริการ *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ระบบเพื่องานทะเบียนนักศึกษา"
                  value={linkModal.data?.title || ''}
                  onChange={(e) => setLinkModal(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">URL ปลายทาง *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={linkModal.data?.url || ''}
                  onChange={(e) => setLinkModal(prev => ({ ...prev, data: { ...prev.data, url: e.target.value } }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                />
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">เลือกไอคอน</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {Object.keys(ICON_MAP).map((iconName) => {
                    const Comp = ICON_MAP[iconName];
                    const isSelected = linkModal.data?.icon_name === iconName;
                    return (
                      <button
                        type="button"
                        key={iconName}
                        onClick={() => setLinkModal(prev => ({ ...prev, data: { ...prev.data, icon_name: iconName } }))}
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
                <label className="text-xs font-bold text-slate-600 block mb-2">เลือกโทนสีไอคอน</label>
                <select
                  value={linkModal.data?.color || 'text-indigo-500'}
                  onChange={(e) => setLinkModal(prev => ({ ...prev, data: { ...prev.data, color: e.target.value } }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none font-medium"
                >
                  {COLOR_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLinkModal({ open: false, mode: 'create', index: null, data: null })}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  บันทึกลิงก์
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ⚠️ DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={26} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">ยืนยันการลบข้อมูล</h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณต้องการลบข้อมูล <strong className="text-slate-700">"{deleteConfirm.name}"</strong> ใช่หรือไม่?
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, type: '', id: null, name: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  if (deleteConfirm.type === 'lecturer') handleDeleteLecturer(deleteConfirm.id);
                  if (deleteConfirm.type === 'staff') handleDeleteStaff(deleteConfirm.id);
                  if (deleteConfirm.type === 'link') handleDeleteLink(deleteConfirm.id);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-200 disabled:opacity-50"
              >
                {saving ? 'กำลังลบ...' : 'ลบข้อมูล'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
