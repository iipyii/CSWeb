import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axios from 'axios';

import {
  Save, Image as ImageIcon, FileText, Upload, ChevronLeft, CheckCircle2,
  User, Layout, Plus, Calendar, Bold, Italic, List, AlertCircle, X, File
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';

export default function EditNews() {
  const { id } = useParams(); // รับ ID จาก URL เพื่อบอกว่ากำลังแก้ข่าวไหน

  const navigate = useNavigate();

  // 1. สร้าง State มารับข้อมูล
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("department");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const [existingCover, setExistingCover] = useState(null);
  const [existingExtraImages, setExistingExtraImages] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const [extraPreviews, setExtraPreviews] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // 2. ตั้งค่า Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>กำลังโหลดเนื้อหา...</p>', // ข้อความระหว่างรอโหลด
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none w-full py-6 px-8 min-h-[300px] text-[15px] font-['Prompt'] leading-[1.8] text-slate-700 max-w-none bg-white rounded-b-[2rem]",
      },
    },
  });

  // 1. จัดการเปลี่ยนรูปหน้าปก
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setImagePreview(URL.createObjectURL(file)); // สร้าง URL จำลองให้โชว์รูปได้ทันที
    }
  };

  // 2. จัดการเพิ่มรูปภาพเพิ่มเติม
  const handleExtraImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (existingExtraImages.length + extraImages.length + files.length > 5) {
        alert("อัปโหลดรูปเพิ่มเติมรวมทั้งหมดได้สูงสุด 5 รูปครับ");
        return;
      }
      setExtraImages(prev => [...prev, ...files]);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setExtraPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // 🌟 ฟังก์ชันลบรูปภาพเพิ่มเติม (ของเดิม)
  const removeExistingExtraImage = (index) => {
    // เอาตัวที่ถูกกดลบออกจากการแสดงผล
    setExistingExtraImages(prev => prev.filter((_, i) => i !== index));
  };

  // 🌟 ฟังก์ชันลบเอกสารแนบ (ของเดิม)
  const removeExistingAttachment = (index) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 3. ฟังก์ชันลบรููปภาพเพิ่มเติม (รูปใหม่) ที่เพิ่งเลือก
  const removeExtraImage = (index) => {
    setExtraImages(prev => prev.filter((_, i) => i !== index));
    setExtraPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // 4. จัดการเพิ่มเอกสารแนบ
  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (existingAttachments.length + attachments.length + files.length > 3) {
        alert("อัปโหลดเอกสารแนบรวมทั้งหมดได้สูงสุด 3 ไฟล์ครับ");
        return;
      }
      setAttachments(prev => [...prev, ...files]);
    }
  };

  // 5. ฟังก์ชันลบเอกสารแนบ (ไฟล์ใหม่) ที่เพิ่งเลือก
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 3. ดึงข้อมูลข่าวเก่ามาโชว์ตอนเปิดหน้านี้
  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/news/${id}`);
        const data = res.data;

        // เอาข้อมูลจาก DB มาใส่ฟอร์ม
        setTitle(data.title || "");
        setSummary(data.summary || "");
        setCategory(data.category || "department");
        setIsUrgent(data.is_urgent || false);

        // จัดฟอร์แมตวันที่ให้ช่อง input type="date" อ่านเข้าใจ (YYYY-MM-DD)
        if (data.start_date) setStartDate(data.start_date.split('T')[0]);
        if (data.end_date) setEndDate(data.end_date.split('T')[0]);

        // ถ้ารูปมีให้เซ็ต URL เพื่อแสดงรูปเก่า
        if (data.image) setExistingCover(`http://localhost:5000${data.image}`);

        // รูปภาพเพิ่มเติม (ต้องแปลงจาก JSON String เป็น Array)
        if (data.additional_images) {
          const parsedImages = typeof data.additional_images === 'string'
            ? JSON.parse(data.additional_images)
            : data.additional_images;
          setExistingExtraImages(parsedImages.map(img => `http://localhost:5000${img}`));
        }

        // เอกสารแนบ
        if (data.attachments) {
          const parsedDocs = typeof data.attachments === 'string'
            ? JSON.parse(data.attachments)
            : data.attachments;
          setExistingAttachments(parsedDocs); // เก็บ path ไว้โชว์ชื่อไฟล์
        }

        // ทริคสำคัญ: อัปเดตเนื้อหาใน Tiptap Editor ทันทีที่โหลดข้อมูลเสร็จ
        if (editor && data.content) {
          editor.commands.setContent(data.content);
        }

      } catch (error) {
        console.error("Error fetching news:", error);
        alert("ไม่พบข้อมูลข่าวสาร");
      }
    };

    if (editor) fetchNewsData(); // ดึงข้อมูลเมื่อ editor พร้อมแล้ว
  }, [id, editor]);

  // 4. ฟังก์ชันสำหรับกดปุ่ม "ยืนยันการแก้ไขข้อมูล"
  const handleUpdate = async () => {
    try {
      const content = editor?.getHTML();

      // 🌟 สร้าง FormData เพื่อห่อทั้ง Text และ File ส่งไปพร้อมกัน
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);
      formData.append("is_urgent", isUrgent);

      // 🌟 ส่ง "ไฟล์ของเดิมที่ยังเหลืออยู่" ไปให้ Backend รู้ว่าเราไม่ได้ลบมันทิ้ง
      // (ต้องแปลงเป็น String เพราะ FormData รับได้แค่ String กับ File)
      formData.append("existing_additional_images", JSON.stringify(existingExtraImages));
      formData.append("existing_attachments", JSON.stringify(existingAttachments));

      // 🌟 ส่ง "ไฟล์ใหม่" ที่ต้องการอัปโหลดเพิ่ม
      if (coverImage) {
        formData.append("image", coverImage);
      }
      extraImages.forEach((file) => {
        formData.append("additional_images", file);
      });
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      // 🌟 เปลี่ยนจากการส่ง JSON ธรรมดา เป็นส่ง FormData (อาจจะต้องใช้เมธอด PUT หรือ POST ขึ้นอยู่กับ Backend ของคุณ)
      await axios.put(`http://localhost:5000/api/news/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("อัปเดตข่าวสารสำเร็จ!");
      navigate('/admin/news');
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  return (
    <div className="font-['Prompt'] space-y-8 pb-20 max-w-7xl mx-auto p-4">

      {/* 🚀 Top Bar: Actions (เปลี่ยนชื่อเป็น แก้ไขข่าว) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/news" className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#3F51B5] transition-all shadow-sm">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">แก้ไขเนื้อหาข่าว</h1>
            <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">News ID: #{id}</p>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          className="bg-[#3F51B5] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#1A1D2E] transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Save size={18} /> ยืนยันการแก้ไขข้อมูล
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 📝 Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* ข้อมูลพื้นฐาน - ใส่ค่าเดิมลงใน defaultValue */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-2 flex items-center gap-2">
                <Layout size={16} className="text-[#3F51B5]" /> หัวข้อข่าวสาร
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)} // 🌟 พิมพ์แล้วอัปเดต State
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-2">เนื้อหาย่อ (แสดงหน้าการ์ด)</label>
              <textarea
                rows="3"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* รายละเอียดฉบับเต็ม */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <label className="text-sm font-black text-slate-700 ml-2 uppercase tracking-wider">รายละเอียดฉบับเต็ม</label>
              <div className="flex gap-2">
                <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 rounded-lg ${editor?.isActive('bold') ? 'bg-indigo-50 text-[#3F51B5]' : 'hover:bg-white'}`}><Bold size={16} /></button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg ${editor?.isActive('italic') ? 'bg-indigo-50 text-[#3F51B5]' : 'hover:bg-white'}`}><Italic size={16} /></button>
                <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg ${editor?.isActive('bulletList') ? 'bg-indigo-50 text-[#3F51B5]' : 'hover:bg-white'}`}><List size={16} /></button>
              </div>
            </div>
            <EditorContent editor={editor} />
          </div>

          {/* 🖼️ รูปภาพเพิ่มเติม */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <ImageIcon className="text-[#3F51B5]" size={22} /> รูปภาพเพิ่มเติม
            </h2>

            <div className="flex flex-wrap gap-4">

              {/* ตัวอย่างรูปเดิมที่มีอยู่ */}
              {existingExtraImages.map((imgUrl, idx) => (
                <div key={`existing-img-${idx}`} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0 group">
                  {/* คลิกที่รูปเพื่อดูรูปเต็ม */}
                  <a href={imgUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-zoom-in">
                    <img src={imgUrl} alt="Existing Extra" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </a>

                  {/* 🌟 ปุ่มลบรูปเดิม */}
                  <button
                    type="button"
                    onClick={() => removeExistingExtraImage(idx)}
                    className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <X size={14} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5 pointer-events-none">
                    รูปเดิม
                  </div>
                </div>
              ))}

              {extraPreviews.map((preview, index) => (
                <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-[#3F51B5] shadow-sm">
                  <img src={preview} alt="New Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeExtraImage(index)}
                    className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <X size={14} />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-[#3F51B5]/80 text-white text-[9px] text-center py-0.5">
                    รูปใหม่
                  </div>
                </div>
              ))}

              {/* ปุ่มเพิ่มรูป */}
              <label className="w-24 h-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-[#3F51B5]/50 hover:bg-indigo-50 hover:text-[#3F51B5] transition-all cursor-pointer group shrink-0">
                <Plus size={24} className="mb-1" />
                <span className="text-[10px] font-bold">เพิ่มรูปภาพ</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleExtraImagesChange} />
              </label>

            </div>

            <div className="flex items-center gap-2 mt-4 ml-2 text-slate-400">
              <AlertCircle size={14} />
              <p className="text-[11px] font-medium text-slate-400">* รองรับไฟล์ประเภท <span className="font-bold text-slate-600">.png, .jpg, .jpeg</span></p>
            </div>
          </div>

          {/* 📎 เอกสารแนบ */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <FileText className="text-[#3F51B5]" size={22} /> เอกสารแนบ
            </h2>

            {/* แสดงรายการไฟล์ที่มีอยู่แล้ว */}
            <div className="mb-6 space-y-2">
              {/* 🌟 1. ลูปโชว์เอกสาร "ของเดิม" */}
              {existingAttachments.map((filePath, idx) => {
                const fileName = filePath.split('/').pop();
                const fileUrl = `http://localhost:5000${filePath}`;

                return (
                  <div key={`existing-doc-${idx}`} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-100 rounded-2xl transition-all group">
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 overflow-hidden pr-4 flex-1 cursor-pointer">
                      <File className="text-slate-400 group-hover:text-[#3F51B5] transition-colors shrink-0" size={20} />
                      <span className="text-sm font-bold text-slate-600 group-hover:text-[#3F51B5] transition-colors line-clamp-1">{fileName}</span>
                    </a>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-1 rounded-md">ไฟล์เดิม</span>
                      {/* 🌟 ปุ่มลบไฟล์เดิม */}
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(idx)}
                        className="text-slate-400 hover:text-red-500 bg-white border border-slate-200 shadow-sm p-1.5 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* 🌟 2. ลูปโชว์เอกสาร "ใหม่"*/}
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl group">
                  <div className="flex items-center gap-3">
                    <FileText className="text-rose-500" size={24} />
                    <span className="text-sm font-bold text-slate-700 line-clamp-1">{file.name}</span>
                  </div>
                  <button onClick={() => removeAttachment(index)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <X size={18} />
                  </button>
                </div>
              ))}


            </div>

            {/* กล่องอัปโหลดไฟล์เพิ่ม */}
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-[#3F51B5] hover:bg-indigo-50/30 transition-all group">
              <div className="w-12 h-12 bg-slate-50 group-hover:bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-[#3F51B5] transition-colors mb-3 shadow-sm">
                <Upload size={24} />
              </div>
              <span className="text-sm font-bold text-slate-600 mb-1">คลิกเพื่ออัปโหลดไฟล์ใหม่เพิ่มเติม</span>
              <span className="text-xs font-bold text-slate-400 tracking-wider"><span className="text-rose-500">.PDF</span> <span className="text-blue-500">.DOC / .DOCX</span></span>
              <input type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={handleAttachmentsChange} />
            </label>
          </div>
        </div>

        {/* ⚙️ Right Column: Settings & Media */}
        <div className="space-y-8">

          {/* รูปหน้าปกข่าว */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight">รูปหน้าปกข่าว</h2>
            <label className="aspect-[4/3] rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-slate-300 group hover:bg-slate-100 cursor-pointer transition-all overflow-hidden relative shadow-inner block w-full">
              <img src={imagePreview ? imagePreview : existingCover ? existingCover : "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=2070"}
                alt="Cover Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <p className="text-[10px] font-black text-white uppercase tracking-widest bg-[#3F51B5] px-4 py-2 rounded-full">เปลี่ยนรูปหน้าปก</p>
              </div>

              {/* 🌟 เพิ่ม input ไฟล์ที่ซ่อนไว้ และเรียกใช้ฟังก์ชัน handleCoverImageChange */}
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverImageChange} />
            </label>
          </div>

          {/* ข้อมูลผู้เขียนและหมวดหมู่ */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-tighter">
                <CheckCircle2 size={16} className="text-[#3F51B5]" /> หมวดหมู่ข่าว
              </label>
              <select
                value={category} // 🌟 ผูกกับ State category
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
              <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-tighter">
                <User size={16} className="text-[#3F51B5]" /> ชื่อผู้เขียน / แหล่งที่มา
              </label>
              <input type="text" defaultValue="Admin ภาควิชา" className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-600 outline-none shadow-inner" />
            </div>

            <div className="pt-4 border-t border-slate-50 space-y-4">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-tighter">
                <Calendar size={16} className="text-[#3F51B5]" /> ระยะเวลาประชาสัมพันธ์
              </label>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase">เริ่มเผยแพร่</p>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-600 shadow-inner" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase">สิ้นสุดการเผยแพร่</p>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-600 shadow-inner" />
                </div>
              </div>
            </div>

            {/* ปุ่ม Urgent Toggle */}
            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between group">
                <span className="text-sm font-bold text-slate-600 group-hover:text-rose-500 transition-colors flex items-center gap-2">
                  <AlertCircle size={16} /> ตั้งเป็นข่าวล่าสุด (Urgent)
                </span>

                {/* 🌟 เปลี่ยนมาใช้ Button ล้วนๆ ผูกกับ State โดยตรง */}
                <button
                  type="button"
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 shadow-inner focus:outline-none ${isUrgent ? 'bg-rose-500' : 'bg-slate-200'
                    }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isUrgent ? 'translate-x-7' : 'translate-x-1'
                      }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}