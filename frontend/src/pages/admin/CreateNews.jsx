import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import axios from "axios";
import {
  Save, Image as ImageIcon, FileText, Upload, ChevronLeft, CheckCircle2,
  User, Layout, Plus, Calendar, Bold, Italic, List, AlertCircle, X, File,
  Sparkles, Loader2, Globe, Palette
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function EditorToolbar({ editor, label }) {
  const colors = [
    { label: 'สีดำ (ค่าเริ่มต้น)', value: '#1e293b', bg: 'bg-[#1e293b]' },
    { label: 'สีน้ำเงินภาควิชา', value: '#3F51B5', bg: 'bg-[#3F51B5]' },
    { label: 'สีแดงเน้นย้ำ', value: '#e11d48', bg: 'bg-[#e11d48]' },
    { label: 'สีส้มแจ้งเตือน', value: '#ea580c', bg: 'bg-[#ea580c]' },
    { label: 'สีเขียว', value: '#16a34a', bg: 'bg-[#16a34a]' },
    { label: 'สีฟ้า', value: '#0284c7', bg: 'bg-[#0284c7]' },
  ];

  return (
    <div 
      className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      <label className="text-sm font-black text-slate-700 ml-2">{label}</label>
      
      <div className="flex flex-wrap items-center gap-2">
        {/* Basic formatting */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs">
          <button 
            type="button" 
            title="ตัวหนา (Bold)"
            onClick={() => editor?.chain().focus().toggleBold().run()} 
            className={`p-2 rounded-lg transition-colors cursor-pointer ${editor?.isActive('bold') ? 'bg-indigo-50 text-[#3F51B5]' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <Bold size={15} />
          </button>
          <button 
            type="button" 
            title="ตัวเอียง (Italic)"
            onClick={() => editor?.chain().focus().toggleItalic().run()} 
            className={`p-2 rounded-lg transition-colors cursor-pointer ${editor?.isActive('italic') ? 'bg-indigo-50 text-[#3F51B5]' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <Italic size={15} />
          </button>
          <button 
            type="button" 
            title="รายการแบบจุด (Bullet List)"
            onClick={() => editor?.chain().focus().toggleBulletList().run()} 
            className={`p-2 rounded-lg transition-colors cursor-pointer ${editor?.isActive('bulletList') ? 'bg-indigo-50 text-[#3F51B5]' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <List size={15} />
          </button>
        </div>

        {/* Color Palette Controls */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 px-1 hidden sm:inline">สีข้อความ:</span>
          {colors.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => editor?.chain().focus().setColor(c.value).run()}
              className={`w-5 h-5 rounded-full ${c.bg} border-2 transition-transform hover:scale-125 cursor-pointer ${
                editor?.isActive('textStyle', { color: c.value })
                  ? 'border-white ring-2 ring-[#3F51B5] scale-110 shadow-xs'
                  : 'border-white/80'
              }`}
            />
          ))}

          {/* Custom color input with Palette icon */}
          <label 
            title="เลือกสีข้อความเพิ่มเติม..."
            className="relative w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#3F51B5] flex items-center justify-center cursor-pointer transition-colors ml-0.5"
          >
            <Palette size={13} className="text-slate-600" />
            <input
              type="color"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
            />
          </label>

          {/* Reset Color */}
          {editor?.isActive('textStyle') && (
            <button
              type="button"
              title="ล้างสีข้อความ (กลับเป็นค่าเริ่มต้น)"
              onClick={() => editor?.chain().focus().unsetColor().run()}
              className="px-2 py-0.5 text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            >
              ล้างสี
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateNews() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const defaultAuthorName = user?.lecturer?.fullname_th || user?.full_name || (user?.role === 'lecturer' ? "อาจารย์ประจำภาควิชา" : "Admin ภาควิชา");

  const [isUrgent, setIsUrgent] = useState(false);
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [author, setAuthor] = useState(defaultAuthorName || "Admin ภาควิชา");

  useEffect(() => {
    if (defaultAuthorName && (!author || author === 'Admin')) {
      setAuthor(defaultAuthorName);
    }
  }, [defaultAuthorName]);
  const [summary, setSummary] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [category, setCategory] = useState("department");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImage, setCoverImage] = useState(null); // เก็บไฟล์รูป
  const [imagePreview, setImagePreview] = useState(null); // เก็บ URL สำหรับโชว์พรีวิว
  const [extraImages, setExtraImages] = useState([]);
  const [extraPreviews, setExtraPreviews] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // จัดการแท็บภาษา & สถานะ AI
  const [activeLangTab, setActiveLangTab] = useState('th'); // 'th' | 'en'
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateSuccess, setTranslateSuccess] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'พิมพ์รายละเอียดข่าวสารที่นี่...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none w-full py-6 px-8 min-h-[300px] text-[15px] leading-[1.8] text-slate-700 max-w-none bg-white rounded-b-[2rem]",
      },
    },
  });

  const editorEn = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: 'Enter English details here or click AI translate...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none w-full py-6 px-8 min-h-[300px] text-[15px] leading-[1.8] text-slate-700 max-w-none bg-white rounded-b-[2rem]",
      },
    },
  });

  // 🤖 ฟังก์ชันแปลข่าวสารเป็นภาษาอังกฤษอัตโนมัติด้วย AI
  const handleAiTranslate = async () => {
    const thaiContent = editor?.getHTML();
    if (!title.trim() && (!thaiContent || thaiContent === '<p></p>' || editor?.isEmpty)) {
      alert("กรุณากรอกหัวข้อข่าวหรือเนื้อหาภาษาไทยก่อนกดแปลภาษาด้วย AI ครับ");
      return;
    }

    try {
      setIsTranslating(true);
      setTranslateSuccess(false);

      const res = await axios.post("/api/news/ai-translate", {
        title,
        summary,
        content: thaiContent
      });

      if (res.data) {
        if (res.data.title_en) setTitleEn(res.data.title_en);
        if (res.data.summary_en) setSummaryEn(res.data.summary_en);
        if (res.data.content_en) {
          editorEn?.commands.setContent(res.data.content_en);
        }
        setTranslateSuccess(true);
        setActiveLangTab('en');
        setTimeout(() => setTranslateSuccess(false), 6000);
      }
    } catch (err) {
      console.error("AI Translate error:", err);
      alert(err.response?.data?.error || "เกิดข้อผิดพลาดในการแปลภาษาด้วย AI กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!title.trim()) {
        alert("กรุณาระบุหัวข้อข่าวสาร");
        return;
      }

      const content = editor?.getHTML();
      if (!content || content === '<p></p>' || editor?.isEmpty) {
        alert("กรุณากรอกรายละเอียดข่าวสาร");
        return;
      }

      // 🌟 สร้างกล่องพัสดุ FormData
      const formData = new FormData();
      formData.append("title", title);
      if (titleEn.trim()) formData.append("title_en", titleEn.trim());
      formData.append("content", content);
      
      const enHtml = editorEn?.getHTML();
      if (enHtml && enHtml !== '<p></p>' && !editorEn?.isEmpty) {
        formData.append("content_en", enHtml);
      }

      formData.append("category", category);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);
      formData.append("is_urgent", isUrgent);
      formData.append("author", author);
      if (summary) {
        formData.append("summary", summary);
      }
      if (summaryEn.trim()) {
        formData.append("summary_en", summaryEn.trim());
      }
      attachments.forEach((file) => {
        formData.append("attachments", file); // 🌟 ชื่อคำว่า "attachments" ต้องตรงกับที่ Backend รับด้วยนะครับ!
      });
      // ถ้ามีการเลือกรูปภาพ ให้แนบไปด้วย
      if (coverImage) {
        formData.append("image", coverImage);
      }
      extraImages.forEach((file) => {
        formData.append("additional_images", file);
      });

      // 🌟 ส่งแบบ multipart/form-data
      await axios.post("/api/news", formData);

      alert("สร้างข่าวสำเร็จ");
      navigate('/admin/news');

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข่าว");
    }
  };

  const handleExtraImagesChange = (e) => {
    // ดึงไฟล์ทั้งหมดที่ User เลือก
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
      const invalidFiles = files.filter(file => {
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        return !file.type.startsWith('image/') && !allowedExtensions.includes(ext);
      });
      if (invalidFiles.length > 0) {
        alert("ไฟล์รูปภาพเพิ่มเติมไม่ถูกต้อง! กรุณาเลือกเฉพาะไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif) เท่านั้น");
        e.target.value = "";
        return;
      }
      // เช็กว่าถ้ารวมกับของเดิมแล้วเกิน 5 รูปไหม
      if (extraImages.length + files.length > 5) {
        alert("อัปโหลดรูปเพิ่มเติมได้สูงสุด 5 รูปครับ");
        return;
      }
      setExtraImages(prev => [...prev, ...files]);

      // สร้าง URL สำหรับโชว์พรีวิว
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setExtraPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // ผมตั้งให้รับได้สูงสุด 3 ไฟล์ (ให้ตรงกับ Backend ที่ตั้งไว้ maxCount: 3)
      if (attachments.length + files.length > 3) {
        alert("อัปโหลดเอกสารแนบได้สูงสุด 3 ไฟล์");
        return;
      }
      setAttachments(prev => [...prev, ...files]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExtraImage = (index) => {
    setExtraImages(prev => prev.filter((_, i) => i !== index));
    setExtraPreviews(prev => prev.filter((_, i) => i !== index));
  };


  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto p-4">

      {/* 🚀 Top Bar: Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/news" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#3F51B5] transition-all shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">สร้างข่าวใหม่</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">จัดการเนื้อหาและเผยแพร่ข่าวสารภาควิชาคอมพิวเตอร์และสารสนเทศ</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-[#3F51B5] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#1A1D2E] transition-all shadow-xl shadow-indigo-100">
          <Save size={18} /> บันทึกและเผยแพร่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* 📝 Left Column: Main Content */}
        <div className="md:col-span-2 space-y-6">

          {/* 🌐 แถบเลือกภาษา & ปุ่ม AI Translate */}
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveLangTab('th')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeLangTab === 'th'
                    ? 'bg-white text-[#3F51B5] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🇹🇭 ภาษาไทย (TH)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('en')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeLangTab === 'en'
                    ? 'bg-white text-[#3F51B5] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🇬🇧 English (EN)</span>
                {titleEn.trim() ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" title="มีเนื้อหาภาษาอังกฤษแล้ว"></span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" title="ยังไม่มีเนื้อหาภาษาอังกฤษ"></span>
                )}
              </button>
            </div>

            {/* ปุ่ม AI Translate */}
            <button
              type="button"
              disabled={isTranslating}
              onClick={handleAiTranslate}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#3F51B5] via-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center gap-2.5 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isTranslating ? (
                <>
                  <Loader2 size={16} className="animate-spin text-amber-300" />
                  <span>AI กำลังแปลภาษาและจัดรูปแบบ...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="text-amber-300 animate-pulse" />
                  <span>แปลเป็นภาษาอังกฤษด้วย AI</span>
                </>
              )}
            </button>
          </div>

          {/* กล่องแจ้งเตือนผลการแปล AI */}
          {translateSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in duration-300">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>แปลเนื้อหาภาษาอังกฤษสำเร็จเรียบร้อย! ข้อมูลถูกนำมาใส่ในแท็บ English ด้านล่าง คุณสามารถตรวจสอบและปรับแก้คำศัพท์ได้ตามต้องการ</span>
            </div>
          )}

          {/* 🇹🇭 แท็บภาษาไทย */}
          {activeLangTab === 'th' && (
            <div className="space-y-6">
              {/* ข้อมูลพื้นฐาน ภาษาไทย */}
              <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    🇹🇭 เนื้อหาภาษาไทย (Thai Version)
                  </span>
                  <span className="text-[11px] font-bold text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    * จำเป็น
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 ml-2 flex items-center gap-2">
                    <Layout size={16} className="text-[#3F51B5]" /> หัวข้อข่าวสาร (ภาษาไทย)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ระบุชื่อหัวข้อข่าวภาษาไทย..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 ml-2">เนื้อหาย่อ (แสดงหน้าการ์ด)</label>
                  <textarea
                    rows="3"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="เขียนสรุปข่าวสั้นๆ สำหรับแสดงผลหน้าแรก..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* รายละเอียดฉบับเต็ม ภาษาไทย */}
              <div 
                className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden cursor-text"
                onClick={() => editor?.chain().focus().run()}
              >
                <EditorToolbar editor={editor} label="รายละเอียดฉบับเต็ม (ภาษาไทย)" />
                <EditorContent editor={editor} />
              </div>
            </div>
          )}

          {/* 🇬🇧 แท็บภาษาอังกฤษ */}
          {activeLangTab === 'en' && (
            <div className="space-y-6">
              {/* ข้อมูลพื้นฐาน ภาษาอังกฤษ */}
              <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    🇬🇧 English Version (Optional / แนะนำให้มี)
                  </span>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    หากเว้นว่างไว้ ระบบจะแสดงภาษาไทยทดแทนอัตโนมัติ
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 ml-2 flex items-center gap-2">
                    <Layout size={16} className="text-[#3F51B5]" /> News Title (English)
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. CS Open House 2026: Discover Computing at KMUTNB..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-700 ml-2">Short Summary (English Card Description)</label>
                  <textarea
                    rows="3"
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    placeholder="Brief 1-2 sentence summary for cards..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              {/* รายละเอียดฉบับเต็ม ภาษาอังกฤษ */}
              <div 
                className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden cursor-text"
                onClick={() => editorEn?.chain().focus().run()}
              >
                <EditorToolbar editor={editorEn} label="Full Content (English)" />
                <EditorContent editor={editorEn} />
              </div>
            </div>
          )}

          {/* 🖼️ รูปภาพเพิ่มเติม */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <ImageIcon className="text-[#3F51B5]" size={22} /> รูปภาพเพิ่มเติม
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              {/* 1. ลูปโชว์รูปที่เลือกมาแล้ว */}
              {extraPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square rounded-3xl overflow-hidden group border border-slate-100 shadow-sm">
                  <img src={preview} alt={`preview-${index}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeExtraImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* 2. ปุ่มเพิ่มรูป (จะซ่อนถ้าเลือกครบ 5 รูปแล้ว) */}
              {extraImages.length < 5 && (
                <>
                  <input
                    type="file"
                    id="extra-images-upload"
                    multiple
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleExtraImagesChange}
                  />
                  <label htmlFor="extra-images-upload" className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-[#3F51B5]/20 hover:bg-indigo-50 transition-all cursor-pointer group">
                    <Plus size={24} className="group-hover:text-[#3F51B5] mb-1" />
                    <span className="text-[10px] font-bold">เพิ่มรูปภาพ</span>
                  </label>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 ml-2 text-slate-400">
              <AlertCircle size={14} />
              <p className="text-[11px] font-medium">* รองรับไฟล์ประเภท <span className="font-bold text-slate-600">.png, .jpg, .jpeg</span> (สูงสุด 5 รูป)</p>
            </div>
          </div>

          {/* 📎 เอกสารแนบ (แก้ไขรายละเอียดประเภทไฟล์) */}
          {/* 📎 เอกสารแนบ */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <FileText className="text-[#3F51B5]" size={22} /> เอกสารแนบ
            </h2>

            {/* แสดงรายการไฟล์ที่ถูกเลือกไว้แล้ว */}
            {attachments.length > 0 && (
              <div className="mb-6 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 text-[#3F51B5] rounded-lg"><FileText size={18} /></div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600 line-clamp-1">{file.name}</span>
                        <span className="text-[10px] text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </div>
                    <button onClick={() => removeAttachment(index)} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={18} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* ปุ่มอัปโหลดไฟล์ (จะซ่อนถ้าเลือกครบ 3 ไฟล์แล้ว) */}
            {attachments.length < 3 && (
              <>
                <input
                  type="file"
                  id="attachments-upload"
                  multiple
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleAttachmentsChange}
                />
                <label htmlFor="attachments-upload" className="border-2 border-dashed border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center group hover:border-[#3F51B5]/20 transition-all cursor-pointer block w-full">
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 mb-3 group-hover:bg-indigo-50 group-hover:text-[#3F51B5] transition-all">
                    <Upload size={28} />
                  </div>
                  <p className="text-sm font-bold text-slate-500">คลิกเพื่ออัปโหลดไฟล์เอกสาร</p>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold">.PDF</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-lg text-[10px] font-bold">.DOC / .DOCX</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-3 italic">* ขนาดไฟล์รวมไม่เกิน 10MB (สูงสุด 3 ไฟล์)</p>
                </label>
              </>
            )}
          </div>
        </div>

        {/* ⚙️ Right Column: Settings & Media */}
        <div className="space-y-8">
          {/* รูปหน้าปกข่าว */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight">รูปหน้าปกข่าว</h2>

            <input
              type="file"
              id="cover-upload"
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
                  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                  const isImage = file.type.startsWith('image/') || allowedExtensions.includes(ext);

                  if (!isImage || !allowedExtensions.includes(ext)) {
                    alert("ไฟล์รูปหน้าปกไม่ถูกต้อง! กรุณาเลือกไฟล์รูปภาพ (.jpg, .jpeg, .png, .webp, .gif) เท่านั้น (ระบบปฏิเสธไฟล์ " + (ext || 'ผิดประเภท') + ")");
                    e.target.value = "";
                    return;
                  }
                  setCoverImage(file);
                  setImagePreview(URL.createObjectURL(file)); // สร้างพรีวิว
                }
              }}
            />

            <label htmlFor="cover-upload" className="block w-full cursor-pointer">
              <div className="aspect-[4/3] bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-slate-300 group hover:bg-slate-100 transition-all overflow-hidden relative">
                {imagePreview ? (
                  // ถ้ามีรูปแล้วให้โชว์รูป
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  // ถ้ายังไม่มีรูป ให้โชว์ไอคอนอัปโหลด
                  <>
                    <ImageIcon size={48} className="mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-center px-6">Upload Cover Image</p>
                  </>
                )}
              </div>
            </label>
            {imagePreview && (
              <p onClick={() => { setCoverImage(null); setImagePreview(null); }} className="text-center text-xs text-rose-500 font-bold mt-3 cursor-pointer hover:underline">
                ลบรูปภาพ
              </p>
            )}
          </div>

          {/* ข้อมูลผู้เขียนและหมวดหมู่ */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#3F51B5]" /> หมวดหมู่ข่าว
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-600 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-100"
              >
                <option value="department">ข่าวภาควิชาฯ</option>
                <option value="faculty">ข่าวคณะและมหาวิทยาลัย</option>
                <option value="scholarship">ข่าวทุนการศึกษา</option>
                <option value="recruitment">ข่าวรับสมัครงาน</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                <User size={16} className="text-[#3F51B5]" /> ชื่อผู้เขียน
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="ระบุชื่อผู้เขียน..."
                className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold outline-none" />
            </div>

            <div className="pt-4 border-t border-slate-50 space-y-4">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                <Calendar size={16} className="text-[#3F51B5]" /> ระยะเวลาประชาสัมพันธ์
              </label>
              <div className="grid grid-cols-1 gap-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase">เริ่มเผยแพร่</p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase">สิ้นสุดการเผยแพร่</p>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-600" />
                </div>
              </div>
            </div>

            {/* ปุ่ม Urgent Toggle */}
            <div className="pt-4 border-t border-slate-50">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold text-slate-600 group-hover:text-rose-500 transition-colors flex items-center gap-2">
                  <AlertCircle size={16} /> ตั้งเป็นข่าวล่าสุด (Urgent)
                </span>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" checked={isUrgent} onChange={() => setIsUrgent(!isUrgent)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-rose-500 transition-all shadow-inner"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}