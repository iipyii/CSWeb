import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, 
  Upload, 
  Save, 
  Calendar as CalendarIcon, 
  FileText, 
  X, 
  FileUp, 
  Loader2, 
  Link2, 
  Globe, 
  ExternalLink,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function EditFile() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [sourceType, setSourceType] = useState('file'); // 'file' | 'url'
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [fileType, setFileType] = useState("PDF");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    audience: "student",
    category: "",
    date: new Date().toISOString().split('T')[0],
    note: "",
    currentFilePath: "",
    fileName: ""
  });

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/downloads/detail/${id}`);
        const data = res.data;
        if (data) {
          const isUrl = 
            data.file_path?.startsWith('http://') || 
            data.file_path?.startsWith('https://') || 
            data.file_type === 'LINK' || 
            data.file_type === 'URL';

          setSourceType(isUrl ? 'url' : 'file');
          if (isUrl) {
            setLinkUrl(data.file_path || "");
            setFileType(data.file_type || "LINK");
          } else {
            setFileType(data.file_type || "PDF");
          }

          setFormData({
            name: data.title || "",
            audience: data.audience || "student",
            category: data.category || "ทั่วไป",
            date: data.created_at ? data.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            note: "",
            currentFilePath: data.file_path || "",
            fileName: data.file_name || (data.file_path ? data.file_path.split('/').pop() : "")
          });
        }
      } catch (error) {
        console.error("Failed to fetch file detail:", error);
        alert("ไม่พบข้อมูลเอกสาร");
        navigate('/admin/files');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchFileData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleTestLink = () => {
    if (!linkUrl.trim()) {
      alert("กรุณาระบุลิงก์ก่อนทดสอบ");
      return;
    }
    let urlToOpen = linkUrl.trim();
    if (!/^https?:\/\//i.test(urlToOpen)) {
      urlToOpen = 'https://' + urlToOpen;
    }
    window.open(urlToOpen, '_blank', 'noopener,noreferrer');
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      alert("กรุณาระบุชื่อเอกสาร / หัวข้อ");
      return;
    }

    if (sourceType === 'url' && !linkUrl.trim()) {
      alert("กรุณาระบุลิงก์ (URL)");
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("title", formData.name.trim());
      data.append("audience", formData.audience);
      data.append("category", formData.category.trim() || "ทั่วไป");

      if (sourceType === 'url') {
        let finalUrl = linkUrl.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = 'https://' + finalUrl;
        }
        data.append("url", finalUrl);
        data.append("file_type", fileType || "LINK");
      } else {
        if (selectedFile) {
          data.append("file", selectedFile);
        }
      }

      await axios.put(`/api/downloads/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("บันทึกการแก้ไขสำเร็จ");
      navigate('/admin/files');
    } catch (error) {
      console.error("Failed to update file:", error);
      const msg = error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกเอกสาร";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#3F51B5]" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7 text-left pb-10">
      
      {/* 🔙 Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <ChevronLeft size={22} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">แก้ไขข้อมูลเอกสาร</h1>
            <p className="text-[14px] text-slate-400">แก้ไขรายละเอียดสำหรับเอกสารรหัส: #{id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            ยกเลิก
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="flex items-center gap-2 bg-[#3F51B5] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
            {submitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* 📝 Form Section */}
        <div className="md:col-span-7 space-y-7">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            
            <div className="flex items-center gap-3 mb-2 text-[#3F51B5]">
              <FileText size={20} />
              <h2 className="text-base font-bold">ข้อมูลปัจจุบันของเอกสาร</h2>
            </div>

            {/* 1. ชื่อเอกสาร */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">ชื่อเอกสาร / หัวข้อ *</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ระบุชื่อเอกสาร..."
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 focus:border-[#3F51B5] outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 2. กลุ่มผู้ใช้งาน */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">กลุ่มผู้ใช้งาน</label>
                <select 
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 focus:border-[#3F51B5] outline-none transition-all cursor-pointer"
                >
                  <option value="student">นักศึกษา</option>
                  <option value="staff">บุคลากร</option>
                </select>
              </div>

              {/* หมวดหมู่ */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">หมวดหมู่เอกสาร</label>
                <input 
                  type="text" 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="เช่น โครงงานพิเศษ, การเงิน"
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* 3. วันที่อัปโหลด */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">วันที่ระบุในเอกสาร</label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">หมายเหตุเพิ่มเติม</label>
              <textarea 
                rows="4"
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 outline-none transition-all placeholder:text-slate-300"
                placeholder="ระบุคำอธิบายสั้นๆ..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* 📁 Attachment Section: เลือกไฟล์ หรือ ลิงก์ */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Segmented Mode Control */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
            <button
              type="button"
              onClick={() => setSourceType('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                sourceType === 'file'
                  ? 'bg-[#3F51B5] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Upload size={16} /> อัปโหลดไฟล์
            </button>
            <button
              type="button"
              onClick={() => setSourceType('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                sourceType === 'url'
                  ? 'bg-[#3F51B5] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Link2 size={16} /> ระบุลิงก์ (URL)
            </button>
          </div>

          {sourceType === 'file' ? (
            /* 1. อัปโหลดไฟล์ */
            <div 
              className={`bg-white p-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-5 min-h-[420px] relative ${
                dragActive ? 'border-[#3F51B5] bg-indigo-50/40' : 'border-slate-200 hover:border-slate-300'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileChange(e); }}
            >
              {selectedFile ? (
                <div className="space-y-6 w-full max-w-[280px]">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <FileUp size={32} />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-slate-700 truncate px-2">{selectedFile.name}</p>
                    <p className="text-[12px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • ไฟล์ใหม่ที่จะแทนที่
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={16} /> ยกเลิกการเปลี่ยนไฟล์
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#3F51B5]">
                    <Upload size={28} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-bold text-slate-700">เปลี่ยนไฟล์เอกสาร (ถ้าต้องการ)</p>
                    {(formData.fileName || formData.currentFilePath) && !formData.currentFilePath.startsWith('http') && (
                      <p className="text-xs text-indigo-600 font-medium break-all">
                        ไฟล์ปัจจุบัน: {formData.fileName || formData.currentFilePath}
                      </p>
                    )}
                    <p className="text-[13px] text-slate-400">ลากไฟล์ใหม่มาวาง หรือกดเลือกด้านล่าง</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="fileUpload" 
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="fileUpload"
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
                  >
                    เลือกไฟล์ใหม่
                  </label>
                  <p className="text-[11px] text-slate-300">รองรับ PDF, DOCX, ZIP (สูงสุด 20MB)</p>
                </>
              )}
            </div>
          ) : (
            /* 2. ระบุลิงก์ (URL) */
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6 min-h-[420px] flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">ระบุลิงก์เอกสารภายนอก</h3>
                    <p className="text-xs text-slate-400">เช่น ลิงก์ Google Drive, OneDrive หรือเว็บไซต์</p>
                  </div>
                </div>

                {/* URL Input */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-600">ลิงก์ URL ปลายทาง *</label>
                  <div className="relative">
                    <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://drive.google.com/... หรือ https://..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[14px] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all placeholder:text-slate-300 font-mono"
                    />
                  </div>
                </div>

                {/* Link Badge Type */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-600">ข้อความบนปุ่มกด (Badge)</label>
                  <div className="flex gap-2">
                    {['LINK', 'URL', 'DOC', 'PDF'].map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => setFileType(badge)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          fileType === badge
                            ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Test Link Button */}
                {linkUrl.trim() && (
                  <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                    <p className="text-xs font-semibold text-purple-900 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-purple-600" />
                      ตรวจสอบลิงก์ก่อนบันทึก
                    </p>
                    <button
                      type="button"
                      onClick={handleTestLink}
                      className="w-full py-2 bg-white text-purple-700 border border-purple-200 rounded-xl text-xs font-bold hover:bg-purple-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <ExternalLink size={14} /> ทดสอบเปิดลิงก์ในแท็บใหม่
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <Sparkles size={12} className="text-amber-500" /> บันทึกลิงก์เพื่อเปิดปลายทางอัตโนมัติเมื่อกดดาวน์โหลด
                </span>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}