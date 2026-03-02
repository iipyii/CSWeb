import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Save, Image as ImageIcon, FileText, Upload, ChevronLeft, CheckCircle2,
  User, Layout, Plus, Calendar, Bold, Italic, List, AlertCircle, X, File
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export default function EditNews() {
  const { id } = useParams(); // รับ ID จาก URL เพื่อบอกว่ากำลังแก้ข่าวไหน
  const [isUrgent, setIsUrgent] = useState(true); // สมมติว่าข่าวเดิมเป็น Urgent

  // --- Editor สำหรับรายละเอียดฉบับเต็ม พร้อมดึงเนื้อหาเดิมมาแสดง ---
  const editor = useEditor({
    extensions: [StarterKit],
    content: `
      <p>ประกาศเรื่อง กำหนดการโครงงานพิเศษและปริญญานิพนธ์ ภาคการศึกษาที่ 1/2568</p>
      <p>รายละเอียดกำหนดการส่งหัวข้อและสอบป้องกันโครงงานประจำปีการศึกษา...</p>
      <ul>
        <li>ส่งหัวข้อภายในวันที่ 15 กรกฎาคม</li>
        <li>สอบก้าวหน้าเดือนสิงหาคม</li>
      </ul>
    `, // เนื้อหาจำลองจากข่าวเดิม
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none w-full py-6 px-8 min-h-[300px] text-[15px] font-['Prompt'] leading-[1.8] text-slate-700 max-w-none bg-white rounded-b-[2rem]",
      },
    },
  });

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
        <button className="bg-[#3F51B5] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#1A1D2E] transition-all shadow-xl shadow-indigo-100 active:scale-95">
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
                defaultValue="ประกาศเรื่อง กำหนดการโครงงานพิเศษและปริญญานิพนธ์ ภาคการศึกษาที่ 1/2568"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all placeholder:text-slate-300" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-2">เนื้อหาย่อ (แสดงหน้าการ์ด)</label>
              <textarea 
                rows="3" 
                defaultValue="รายละเอียดกำหนดการส่งหัวข้อและสอบป้องกันโครงงานประจำปีการศึกษาสำหรับนักศึกษาภาควิชา CIS ประจำภาคเรียนที่ 1/2568"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all resize-none leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* รายละเอียดฉบับเต็ม */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <label className="text-sm font-black text-slate-700 ml-2 uppercase tracking-wider">รายละเอียดฉบับเต็ม</label>
                <div className="flex gap-2">
                   <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`p-2 rounded-lg ${editor?.isActive('bold') ? 'bg-indigo-50 text-[#3F51B5]' : 'hover:bg-white'}`}><Bold size={16}/></button>
                   <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`p-2 rounded-lg ${editor?.isActive('italic') ? 'bg-indigo-50 text-[#3F51B5]' : 'hover:bg-white'}`}><Italic size={16}/></button>
                   <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className={`p-2 rounded-lg ${editor?.isActive('bulletList') ? 'bg-indigo-50 text-[#3F51B5]' : 'hover:bg-white'}`}><List size={16}/></button>
                </div>
             </div>
             <EditorContent editor={editor} />
          </div>

          {/* 🖼️ รูปภาพเพิ่มเติม */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <ImageIcon className="text-[#3F51B5]" size={22} /> รูปภาพเพิ่มเติม
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {/* ตัวอย่างรูปเดิมที่มีอยู่ */}
               <div className="relative aspect-square rounded-3xl overflow-hidden group border border-slate-100">
                  <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400" className="w-full h-full object-cover" alt="Existing" />
                  <button className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
               </div>
               
               {/* ปุ่มเพิ่มรูป */}
               <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-[#3F51B5]/20 hover:bg-indigo-50 transition-all cursor-pointer group">
                  <Plus size={24} className="group-hover:text-[#3F51B5] mb-1" />
                  <span className="text-[10px] font-bold">เพิ่มรูปภาพ</span>
               </div>
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
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-rose-100 text-rose-500 rounded-lg"><FileText size={18}/></div>
                     <span className="text-sm font-bold text-slate-600 italic">Project_Schedule_2025.pdf</span>
                  </div>
                  <button className="text-slate-300 hover:text-rose-500 transition-colors"><X size={18}/></button>
               </div>
            </div>

            <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center group hover:border-[#3F51B5]/20 transition-all cursor-pointer">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 mb-3 group-hover:bg-indigo-50 group-hover:text-[#3F51B5] transition-all">
                <Upload size={28} />
              </div>
              <p className="text-sm font-bold text-slate-500">คลิกเพื่ออัปโหลดไฟล์ใหม่เพิ่มเติม</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-tighter">
                 <span className="text-red-400">.PDF</span>
                 <span className="text-blue-400">.DOC / .DOCX</span>
              </div>
            </div>
          </div>
        </div>

        {/* ⚙️ Right Column: Settings & Media */}
        <div className="space-y-8">
          
          {/* รูปหน้าปกข่าว */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight">รูปหน้าปกข่าว</h2>
            <div className="aspect-[4/3] rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-slate-300 group hover:bg-slate-100 cursor-pointer transition-all overflow-hidden relative shadow-inner">
              <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800" className="w-full h-full object-cover" alt="Cover" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <p className="text-[10px] font-black text-white uppercase tracking-widest bg-[#3F51B5] px-4 py-2 rounded-full">เปลี่ยนรูปหน้าปก</p>
              </div>
            </div>
          </div>

          {/* ข้อมูลผู้เขียนและหมวดหมู่ */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase tracking-tighter">
                <CheckCircle2 size={16} className="text-[#3F51B5]" /> หมวดหมู่ข่าว
              </label>
              <select defaultValue="department" className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-600 outline-none cursor-pointer focus:ring-1 focus:ring-indigo-100">
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
                   <input type="date" defaultValue="2025-06-25" className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-600 shadow-inner" />
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 ml-1 uppercase">สิ้นสุดการเผยแพร่</p>
                   <input type="date" className="w-full bg-slate-50 border-none rounded-xl py-2 px-4 text-xs font-bold text-slate-600 shadow-inner" />
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
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5 shadow-md"></div>
                </div>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}