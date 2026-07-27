import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, Save, Calendar as CalendarIcon, FileText, X, FileUp } from 'lucide-react';

export default function CreateFile() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-7 text-left pb-10">
      
      {/* 🔙 Header Section - ปรับฟอนต์หัวข้อเป็น text-2xl */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <ChevronLeft size={22} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">เพิ่มเอกสารใหม่</h1>
            <p className="text-[14px] text-slate-400">ระบบอัปโหลดไฟล์คลังเอกสารภาควิชา</p>
          </div>
        </div>
        
        {/* 💾 Action Buttons (Top) - ปรับฟอนต์ปุ่มเป็น text-sm */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            ยกเลิก
          </button>
          <button className="flex items-center gap-2 bg-[#3F51B5] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95">
            <Save size={18} /> บันทึกและอัปโหลด
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 📝 Form Section: ข้อมูลเอกสาร */}
        <div className="lg:col-span-7 space-y-7">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            
            <div className="flex items-center gap-3 mb-2 text-[#3F51B5]">
              <FileText size={20} />
              <h2 className="text-base font-bold">ข้อมูลทั่วไปของเอกสาร</h2>
            </div>

            {/* 1. ชื่อเอกสาร - ปรับ Label เป็น text-sm (ประมาณ 14px) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">ชื่อเอกสาร / หัวข้อข่าวสาร</label>
              <input 
                type="text" 
                placeholder="ระบุชื่อเอกสารที่ต้องการให้แสดงบนหน้าเว็บ..."
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 focus:border-[#3F51B5] outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 2. หมวดหมู่ */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">หมวดหมู่เอกสาร</label>
                <select className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 focus:border-[#3F51B5] outline-none transition-all appearance-none cursor-pointer">
                  <option value="student">นักศึกษา</option>
                  <option value="staff">บุคลากร</option>
                </select>
              </div>

              {/* 3. วันที่อัปโหลด */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">วันที่ระบุในเอกสาร</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* หมายเหตุ */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">หมายเหตุเพิ่มเติม</label>
              <textarea 
                rows="4"
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 outline-none transition-all placeholder:text-slate-300"
                placeholder="ระบุคำอธิบายสั้นๆ (ถ้ามี)..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* 📁 Upload Section: ส่วนอัปโหลดไฟล์ */}
        <div className="lg:col-span-5">
          <div 
            className={`bg-white p-8 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center space-y-5 h-full min-h-[400px] relative ${
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
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • พร้อมใช้งาน
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} /> ล้างข้อมูลไฟล์
                </button>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#3F51B5]">
                  <Upload size={28} />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-700">อัปโหลดไฟล์เอกสารประกอบ</p>
                  <p className="text-[13px] text-slate-400">ลากไฟล์มาวาง หรือใช้ปุ่มด้านล่างเพื่อเลือก</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  id="fileUpload" 
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="fileUpload"
                  className="px-6 py-3 bg-[#3F51B5] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-700 transition-all shadow-lg active:scale-95 shadow-indigo-100"
                >
                  เลือกจากคอมพิวเตอร์
                </label>
                <p className="text-[11px] text-slate-300">รองรับ PDF, DOCX, ZIP (สูงสุด 20MB)</p>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}