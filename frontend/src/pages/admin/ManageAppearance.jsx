import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, Save, Image as ImageIcon, Trash2, Plus, RefreshCw, Loader2, 
  ExternalLink, Monitor, Calendar, Download, ClipboardCheck, BookOpen, 
  GraduationCap, FileText, Users, Laptop, CheckCircle2, AlertCircle, ArrowUp, ArrowDown
} from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'Monitor', label: 'Monitor (คอมพิวเตอร์/ระบบ)', icon: Monitor },
  { value: 'Calendar', label: 'Calendar (ปฏิทิน)', icon: Calendar },
  { value: 'Download', label: 'Download (ดาวน์โหลด)', icon: Download },
  { value: 'ClipboardCheck', label: 'ClipboardCheck (การประเมิน)', icon: ClipboardCheck },
  { value: 'BookOpen', label: 'BookOpen (หนังสือ/หลักสูตร)', icon: BookOpen },
  { value: 'GraduationCap', label: 'GraduationCap (หมวกปริญญา)', icon: GraduationCap },
  { value: 'FileText', label: 'FileText (เอกสาร)', icon: FileText },
  { value: 'Users', label: 'Users (ผู้ใช้งาน/บุคลากร)', icon: Users },
  { value: 'Laptop', label: 'Laptop (แล็ปท็อป)', icon: Laptop },
];

const LEVEL_OPTIONS = [
  { value: 'bachelor', label: 'ปริญญาตรี (ภาคปกติ)' },
  { value: 'cs-english', label: 'ปริญญาตรี (โครงการพิเศษ สองภาษา CSB)' },
  { value: 'cs-master', label: 'ปริญญาโท (Computer Science)' },
  { value: 'se-master', label: 'ปริญญาโท (Software Engineering)' },
  { value: 'doctor', label: 'ปริญญาเอก (Computer Science)' },
];

export default function ManageAppearance() {
  const [activeTab, setActiveTab] = useState('banners'); // 'banners' | 'quick_actions' | 'featured_courses'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // 1. Logo & Banners
  const [logoPreview, setLogoPreview] = useState(null);
  const [banners, setBanners] = useState([]);

  // 2. Quick Actions
  const [quickActions, setQuickActions] = useState([]);

  // 3. Featured Courses
  const [featuredCourses, setFeaturedCourses] = useState([]);

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bannersRes, settingsRes, qaRes, fcRes] = await Promise.all([
        axios.get("/api/appearance/banners"),
        axios.get("/api/appearance/settings"),
        axios.get("/api/appearance/quick-actions"),
        axios.get("/api/appearance/featured-courses")
      ]);

      setBanners(bannersRes.data || []);
      const logoUrl = settingsRes.data?.configMap?.site_logo;
      if (logoUrl) {
        setLogoPreview(logoUrl.startsWith('http') ? logoUrl : `${logoUrl}`);
      }

      if (qaRes.data?.data) {
        setQuickActions(qaRes.data.data);
      }
      if (fcRes.data?.data) {
        setFeaturedCourses(fcRes.data.data);
      }
    } catch (error) {
      console.error("Failed to load appearance data:", error);
      showAlert('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === Logo & Banner Handlers ===
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isImage = file.type.startsWith('image/') || allowedExtensions.includes(ext);

    if (!isImage || !allowedExtensions.includes(ext)) {
      showAlert('error', "ไฟล์โลโก้ไม่ถูกต้อง! กรุณาเลือกไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif) เท่านั้น");
      e.target.value = "";
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("logo", file);

      const res = await axios.post("/api/appearance/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const newPath = res.data.logoPath;
      setLogoPreview(`${newPath}`);
      window.dispatchEvent(new CustomEvent('site_config_updated', { detail: { site_logo: newPath } }));
      showAlert('success', "อัปเดตโลโก้เรียบร้อยแล้ว");
    } catch (error) {
      console.error("Upload logo error:", error);
      showAlert('error', error.response?.data?.error || "เกิดข้อผิดพลาดในการอัปโหลดโลโก้");
    } finally {
      if (e.target) e.target.value = "";
      setUploadingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    if (!window.confirm("ต้องการรีเซ็ตโลโก้กลับเป็นค่าเริ่มต้นของระบบใช่หรือไม่?")) return;
    try {
      setUploadingLogo(true);
      await axios.post("/api/appearance/settings", {
        config_key: "site_logo",
        config_value: ""
      });
      setLogoPreview(null);
      window.dispatchEvent(new CustomEvent('site_config_updated', { detail: { site_logo: "" } }));
      showAlert('success', "รีเซ็ตโลโก้เป็นค่าเริ่มต้นเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Reset logo error:", error);
      showAlert('error', error.response?.data?.error || "เกิดข้อผิดพลาดในการรีเซ็ตโลโก้");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isImage = file.type.startsWith('image/') || allowedExtensions.includes(ext);

    if (!isImage || !allowedExtensions.includes(ext)) {
      showAlert('error', "ไฟล์รูปภาพแบนเนอร์ไม่ถูกต้อง! กรุณาเลือกไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif) เท่านั้น");
      e.target.value = "";
      return;
    }

    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", `แบนเนอร์ ${banners.length + 1}`);
      formData.append("order_no", banners.length + 1);

      await axios.post("/api/appearance/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      showAlert('success', "เพิ่มแบนเนอร์เรียบร้อยแล้ว");
      fetchData();
      window.dispatchEvent(new CustomEvent('site_config_updated', { detail: { banners: true } }));
    } catch (error) {
      console.error("Upload banner error:", error);
      showAlert('error', error.response?.data?.error || "เกิดข้อผิดพลาดในการอัปโหลดแบนเนอร์");
    } finally {
      if (e.target) e.target.value = "";
      setUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("ต้องการลบแบนเนอร์นี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`/api/appearance/banners/${id}`);
        showAlert('success', "ลบแบนเนอร์เรียบร้อย");
        fetchData();
        window.dispatchEvent(new CustomEvent('site_config_updated', { detail: { banners: true } }));
      } catch (error) {
        console.error("Delete banner error:", error);
        showAlert('error', error.response?.data?.error || "เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  // === Quick Actions Handlers ===
  const handleAddQuickAction = () => {
    setQuickActions(prev => [
      ...prev,
      {
        id: Date.now(),
        label: 'ปุ่มใหม่',
        path: 'https://...',
        isExternal: true,
        icon: 'Monitor'
      }
    ]);
  };

  const handleRemoveQuickAction = (index) => {
    setQuickActions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickActionChange = (index, field, value) => {
    const updated = [...quickActions];
    updated[index] = { ...updated[index], [field]: value };
    setQuickActions(updated);
  };

  const handleSaveQuickActions = async () => {
    try {
      setSaving(true);
      await axios.post("/api/appearance/quick-actions", { data: quickActions });
      showAlert('success', "บันทึกปุ่มทางลัดหน้าแรกเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Save quick actions error:", error);
      showAlert('error', "เกิดข้อผิดพลาดในการบันทึกปุ่มทางลัด");
    } finally {
      setSaving(false);
    }
  };

  // === Featured Courses Handlers ===
  const handleAddCourse = () => {
    setFeaturedCourses(prev => [
      ...prev,
      {
        id: `course-${Date.now()}`,
        level: 'bachelor',
        title: 'ชื่อหลักสูตรภาษาไทย',
        enTitle: 'COURSE TITLE IN ENGLISH',
        date: 'มีนาคม 2567',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'
      }
    ]);
  };

  const handleRemoveCourse = (index) => {
    setFeaturedCourses(prev => prev.filter((_, i) => i !== index));
  };

  const handleCourseChange = (index, field, value) => {
    const updated = [...featuredCourses];
    updated[index] = { ...updated[index], [field]: value };
    setFeaturedCourses(updated);
  };

  const handleCourseImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post("/api/appearance/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data?.imagePath) {
        handleCourseChange(index, 'image', res.data.imagePath);
        showAlert('success', "อัปโหลดรูปภาพหลักสูตรสำเร็จ");
      }
    } catch (error) {
      console.error("Upload course image error:", error);
      showAlert('error', "อัปโหลดรูปภาพไม่สำเร็จ");
    }
  };

  const handleSaveFeaturedCourses = async () => {
    try {
      setSaving(true);
      await axios.post("/api/appearance/featured-courses", { data: featuredCourses });
      showAlert('success', "บันทึกหลักสูตรแนะนำหน้าแรกเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Save featured courses error:", error);
      showAlert('error', "เกิดข้อผิดพลาดในการบันทึกหลักสูตรแนะนำ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left pb-12">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการภาพลักษณ์และหน้าแรก (Appearance)</h1>
          <p className="text-slate-500 text-sm mt-1">ปรับแต่งโลโก้, สไลด์แบนเนอร์, ปุ่มทางลัด 4 ปุ่ม, และหลักสูตรแนะนำหน้าแรก</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-sm font-semibold transition-colors shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> รีเฟรช
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-100 transition-all"
          >
            <ExternalLink size={16} /> ดูหน้าเว็บจริง
          </a>
        </div>
      </header>

      {/* Alert Notification */}
      {alertInfo.show && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-sm transition-all ${
          alertInfo.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          alertInfo.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {alertInfo.type === 'success' && <CheckCircle2 size={20} className="text-emerald-600" />}
          {alertInfo.type === 'error' && <AlertCircle size={20} className="text-rose-600" />}
          {alertInfo.type === 'info' && <Loader2 size={20} className="text-blue-600 animate-spin" />}
          <span>{alertInfo.message}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'banners'
              ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <ImageIcon size={18} /> โลโก้และแบนเนอร์สไลด์
        </button>

        <button
          onClick={() => setActiveTab('quick_actions')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'quick_actions'
              ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <Monitor size={18} /> ปุ่มทางลัดหน้าแรก ({quickActions.length} ปุ่ม)
        </button>

        <button
          onClick={() => setActiveTab('featured_courses')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'featured_courses'
              ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <BookOpen size={18} /> หลักสูตรแนะนำหน้าแรก ({featuredCourses.length} การ์ด)
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#3F51B5] mr-2" />
          <span className="text-slate-500 font-medium text-sm">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
        <div>
          {/* ========================================================================= */}
          {/* 🖼️ TAB 1: LOGO & BANNERS */}
          {/* ========================================================================= */}
          {activeTab === 'banners' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo */}
              <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 self-start">
                  <ImageIcon className="text-[#3F51B5]" /> CIS Logo
                </h3>
                <div className="w-44 h-44 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center relative group overflow-hidden mb-6">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-4" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto text-slate-300 mb-2" size={36} />
                      <span className="text-[10px] text-slate-400">ขนาดแนะนำ 512x512px</span>
                    </div>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="animate-spin text-[#3F51B5]" size={32} />
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  id="logo-upload" 
                  accept=".jpg,.jpeg,.png,.webp,.gif,.svg,image/*"
                  hidden 
                  onChange={handleLogoUpload} 
                  disabled={uploadingLogo}
                />
                <div className="w-full flex flex-col gap-2">
                  <label 
                    htmlFor="logo-upload" 
                    className="w-full text-center py-3 bg-[#3F51B5] text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-700 transition-colors text-sm shadow-sm"
                  >
                    {uploadingLogo ? "กำลังอัปโหลด..." : "เลือกรูปภาพโลโก้ใหม่"}
                  </label>
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      disabled={uploadingLogo}
                      className="w-full text-center py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors text-xs"
                    >
                      รีเซ็ตเป็นโลโก้เริ่มต้น
                    </button>
                  )}
                </div>
              </section>

              {/* Banners */}
              <section className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <ImageIcon className="text-[#3F51B5]" /> แบนเนอร์หน้าแรก (Hero Sliders)
                  </h3>
                  <div>
                    <input 
                      type="file" 
                      id="banner-upload" 
                      accept=".jpg,.jpeg,.png,.webp,.gif,.svg,image/*"
                      hidden 
                      onChange={handleBannerUpload} 
                      disabled={uploadingBanner}
                    />
                    <label 
                      htmlFor="banner-upload" 
                      className="text-sm font-bold text-[#3F51B5] hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      {uploadingBanner ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      เพิ่มรูปแบนเนอร์
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  {banners.length > 0 ? (
                    banners.map((item, index) => {
                      const imgUrl = item.image_path?.startsWith("http") 
                        ? item.image_path 
                        : `${item.image_path}`;

                      return (
                        <div key={item.id} className="flex flex-col md:flex-row gap-6 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 items-center">
                          <div className="w-full md:w-60 h-24 bg-white rounded-xl overflow-hidden shadow-inner border border-slate-200 shrink-0">
                            <img 
                              src={imgUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 240 96'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%2394a3b8'%3E%E0%B9%84%E0%B8%A1%E0%B9%88%E0%B8%AA%E0%B8%B2%E0%B8%A1%E0%B8%B2%E0%B8%A3%E0%B8%96%E0%B9%81%E0%B8%AA%E0%B8%94%E0%B8%87%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B9%84%E0%B8%94%E0%B9%89%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <div className="flex-1 text-sm text-left">
                            <p className="font-bold text-slate-700">{item.title || `ลำดับที่ ${index + 1}`}</p>
                            <p className="text-slate-400 text-xs mt-1">แนะนำขนาด: 1920x800px</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleDeleteBanner(item.id)}
                              className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-200 hover:text-rose-500 transition-colors shadow-sm"
                              title="ลบแบนเนอร์"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      {loading ? "กำลังโหลดแบนเนอร์..." : "ยังไม่มีรูปแบนเนอร์ สามารถกดเพิ่มได้จากปุ่มด้านบน"}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ⚡ TAB 2: QUICK ACTIONS */}
          {/* ========================================================================= */}
          {activeTab === 'quick_actions' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Monitor className="text-[#3F51B5]" /> ปุ่มทางลัดหน้าแรก (Quick Action Buttons)
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    ปรับแต่งชื่อปุ่ม ลิงก์ปลายทาง และไอคอนที่แสดงด้านล่าง Hero Slider ในหน้าแรก
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddQuickAction}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-[#3F51B5] font-bold rounded-xl text-xs transition-colors"
                  >
                    <Plus size={16} /> เพิ่มปุ่มใหม่
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveQuickActions}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    บันทึกปุ่มทางลัด
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {quickActions.map((action, idx) => (
                  <div key={action.id || idx} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-1 text-center font-bold text-slate-400 text-sm">
                      #{idx + 1}
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        ข้อความบนปุ่ม (Label)
                      </label>
                      <input
                        type="text"
                        value={action.label || ''}
                        onChange={(e) => handleQuickActionChange(idx, 'label', e.target.value)}
                        placeholder="เช่น ระบบคำร้องออนไลน์"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        ลิงก์ปลายทาง (URL หรือ Path)
                      </label>
                      <input
                        type="text"
                        value={action.path || ''}
                        onChange={(e) => handleQuickActionChange(idx, 'path', e.target.value)}
                        placeholder="https://... หรือ /student-downloads"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        ไอคอน
                      </label>
                      <select
                        value={action.icon || 'Monitor'}
                        onChange={(e) => handleQuickActionChange(idx, 'icon', e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-1 flex items-center justify-center pt-5">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 font-medium">
                        <input
                          type="checkbox"
                          checked={Boolean(action.isExternal)}
                          onChange={(e) => handleQuickActionChange(idx, 'isExternal', e.target.checked)}
                          className="rounded text-[#3F51B5]"
                        />
                        <span>แท็บใหม่</span>
                      </label>
                    </div>

                    <div className="md:col-span-1 flex justify-end pt-5">
                      <button
                        type="button"
                        onClick={() => handleRemoveQuickAction(idx)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="ลบปุ่มนี้"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {quickActions.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm">ยังไม่มีปุ่มทางลัด กดปุ่ม "+ เพิ่มปุ่มใหม่" เพื่อเพิ่ม</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 🎓 TAB 3: FEATURED COURSES */}
          {/* ========================================================================= */}
          {activeTab === 'featured_courses' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-[#3F51B5]" /> หลักสูตรแนะนำหน้าแรก (Featured Courses)
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    ปรับเปลี่ยนชื่อหลักสูตร, ชื่อภาษาอังกฤษ, วันที่อัปเดต, รูปภาพ และระดับการศึกษาที่เชื่อมโยง
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddCourse}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-[#3F51B5] font-bold rounded-xl text-xs transition-colors"
                  >
                    <Plus size={16} /> เพิ่มการ์ดหลักสูตร
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveFeaturedCourses}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#3F51B5] hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    บันทึกหลักสูตรแนะนำ
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {featuredCourses.map((course, idx) => (
                  <div key={course.id || idx} className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl relative group">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/60">
                      <span className="font-bold text-slate-700 text-sm flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#3F51B5] text-white rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        หลักสูตรแนะนำลำดับที่ {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(idx)}
                        className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} /> ลบการ์ดนี้
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Image Preview & Upload */}
                      <div className="lg:col-span-4 space-y-3">
                        <div className="w-full h-40 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-inner flex items-center justify-center relative">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                            URL รูปภาพหลักสูตร
                          </label>
                          <input
                            type="text"
                            value={course.image || ''}
                            onChange={(e) => handleCourseChange(idx, 'image', e.target.value)}
                            placeholder="https://images.unsplash.com/... หรือ /uploads/..."
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 outline-none"
                          />
                        </div>
                        <label className="flex items-center justify-center gap-1.5 p-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors border border-slate-200 text-xs">
                          <Upload size={14} />
                          <span>อัปโหลดรูปภาพใหม่จากเครื่อง</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleCourseImageUpload(e, idx)}
                          />
                        </label>
                      </div>

                      {/* Course Details Fields */}
                      <div className="lg:col-span-8 space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                            ชื่อหลักสูตร (ภาษาไทย)
                          </label>
                          <input
                            type="text"
                            value={course.title || ''}
                            onChange={(e) => handleCourseChange(idx, 'title', e.target.value)}
                            placeholder="เช่น หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์..."
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                            ชื่อหลักสูตร (ภาษาอังกฤษ - Subtitle)
                          </label>
                          <input
                            type="text"
                            value={course.enTitle || ''}
                            onChange={(e) => handleCourseChange(idx, 'enTitle', e.target.value)}
                            placeholder="BACHELOR OF SCIENCE PROGRAM IN COMPUTER SCIENCE"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 outline-none uppercase"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                              ระดับการศึกษา (ลิงก์ไปยังหมวดหลักสูตร)
                            </label>
                            <select
                              value={course.level || 'bachelor'}
                              onChange={(e) => handleCourseChange(idx, 'level', e.target.value)}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
                            >
                              {LEVEL_OPTIONS.map((lvl) => (
                                <option key={lvl.value} value={lvl.value}>
                                  {lvl.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                              วันที่อัปเดต (Date tag)
                            </label>
                            <input
                              type="text"
                              value={course.date || ''}
                              onChange={(e) => handleCourseChange(idx, 'date', e.target.value)}
                              placeholder="เช่น มีนาคม 2564"
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {featuredCourses.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <p className="text-sm">ยังไม่มีหลักสูตรแนะนำ กดปุ่ม "+ เพิ่มการ์ดหลักสูตร" เพื่อเพิ่ม</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}