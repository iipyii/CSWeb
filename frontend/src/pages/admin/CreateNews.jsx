import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axios from "axios";
import {
  Save, Image as ImageIcon, FileText, Upload, ChevronLeft, CheckCircle2,
  User, Layout, Plus, Calendar, Bold, Italic, List, AlertCircle, X, File
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateNews() {
  const [isUrgent, setIsUrgent] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("department");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>พิมพ์รายละเอียดข่าวสารที่นี่...</p>',
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none w-full py-6 px-8 min-h-[300px] text-[15px] font-['Prompt'] leading-[1.8] text-slate-700 max-w-none bg-white rounded-b-[2rem]",
      },
    },
  });

  const handleSubmit = async () => {
    try {

      const content = editor?.getHTML();

      const res = await axios.post("http://localhost:5000/api/news", {
        title: title,
        content: content,
        category: category,
        start_date: startDate,
        end_date: endDate
      });

      alert("สร้างข่าวสำเร็จ");

    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    }
  };


  return (
    <div className="font-['Prompt'] space-y-8 pb-20 max-w-7xl mx-auto p-4">

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 📝 Left Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* ข้อมูลพื้นฐาน */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-2 flex items-center gap-2">
                <Layout size={16} className="text-[#3F51B5]" /> หัวข้อข่าวสาร
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ระบุชื่อหัวข้อข่าว..."
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all placeholder:text-slate-300" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-2">เนื้อหาย่อ (แสดงหน้าการ์ด)</label>
              <textarea
                rows="3"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="เขียนสรุปข่าวสั้นๆ สำหรับแสดงผลหน้าแรก..."
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all resize-none"></textarea>
            </div>
          </div>

          {/* รายละเอียดฉบับเต็ม */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <label className="text-sm font-black text-slate-700 ml-2">รายละเอียดฉบับเต็ม</label>
              <div className="flex gap-2">
                <button onClick={() => editor?.chain().focus().toggleBold().run()} className="p-2 hover:bg-white rounded-lg"><Bold size={16} /></button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="p-2 hover:bg-white rounded-lg"><Italic size={16} /></button>
                <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="p-2 hover:bg-white rounded-lg"><List size={16} /></button>
              </div>
            </div>
            <EditorContent editor={editor} />
          </div>

          {/* 🖼️ รูปภาพเพิ่มเติม (แก้ไขรายละเอียดประเภทไฟล์) */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <ImageIcon className="text-[#3F51B5]" size={22} /> รูปภาพเพิ่มเติม
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-[#3F51B5]/20 hover:bg-indigo-50 transition-all cursor-pointer group">
                <Plus size={24} className="group-hover:text-[#3F51B5] mb-1" />
                <span className="text-[10px] font-bold">เพิ่มรูปภาพ</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 ml-2 text-slate-400">
              <AlertCircle size={14} />
              <p className="text-[11px] font-medium">* รองรับไฟล์ประเภท <span className="font-bold text-slate-600">.png, .jpg, .jpeg</span> เท่านั้น</p>
            </div>
          </div>

          {/* 📎 เอกสารแนบ (แก้ไขรายละเอียดประเภทไฟล์) */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <FileText className="text-[#3F51B5]" size={22} /> เอกสารแนบ
            </h2>
            <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center group hover:border-[#3F51B5]/20 transition-all cursor-pointer">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 mb-3 group-hover:bg-indigo-50 group-hover:text-[#3F51B5] transition-all">
                <Upload size={28} />
              </div>
              <p className="text-sm font-bold text-slate-500">คลิกเพื่ออัปโหลดไฟล์เอกสาร</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-[10px] font-bold">.PDF</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-500 rounded-lg text-[10px] font-bold">.DOC / .DOCX</span>
              </div>
              <p className="text-[10px] text-slate-300 mt-3 italic">* ขนาดไฟล์รวมไม่เกิน 10MB ต่อหนึ่งรายการ</p>
            </div>
          </div>
        </div>

        {/* ⚙️ Right Column: Settings & Media */}
        <div className="space-y-8">
          {/* รูปหน้าปกข่าว */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight">รูปหน้าปกข่าว</h2>
            <div className="aspect-[4/3] bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-slate-300 group hover:bg-slate-100 cursor-pointer transition-all overflow-hidden relative">
              <ImageIcon size={48} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest text-center px-6">Upload Cover Image</p>
            </div>
          </div>

          {/* ข้อมูลผู้เขียนและหมวดหมู่ */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-[#3F51B5]" /> หมวดหมู่ข่าว
              </label>
              <select className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-600 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-100">
                value={category}
                onChange={(e) => setCategory(e.target.value)}

                {/* <option value="department">ข่าวภาควิชาฯ</option>
                <option value="faculty">ข่าวคณะและมหาวิทยาลัย</option>
                <option value="scholarship">ข่าวทุนการศึกษา</option>
                <option value="recruitment">ข่าวรับสมัครงาน</option> */}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                <User size={16} className="text-[#3F51B5]" /> ชื่อผู้เขียน
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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