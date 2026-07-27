import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Upload, Save, Calendar as CalendarIcon, FileText, X, FileUp } from 'lucide-react';

export default function EditFile() {
  const navigate = useNavigate();
  const { id } = useParams(); // รับ ID จาก URL เพื่อใช้ดึงข้อมูลเดิม
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // 📝 สร้าง State สำหรับเก็บข้อมูลเดิมของไฟล์
  const [formData, setFormData] = useState({
    name: "แบบคำร้องขอฝึกงาน (คพ.05)", // ข้อมูลเดิมที่ดึงมาจาก Database
    category: "student",
    date: "2026-03-01",
    note: "เอกสารสำหรับนักศึกษาชั้นปีที่ 3 ขึ้นไปที่ประสงค์จะออกฝึกงานภาคฤดูร้อน"
  });

  // ฟังก์ชันจัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-7 text-left pb-10">
      
      {/* 🔙 Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <ChevronLeft size={22} className="text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">แก้ไขข้อมูลเอกสาร</h1>
            <p className="text-[14px] text-slate-400">แก้ไขรายละเอียดสำหรับไฟล์รหัส: {id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            ยกเลิก
          </button>
          <button className="flex items-center gap-2 bg-[#3F51B5] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95">
            <Save size={18} /> บันทึกการแก้ไข
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 📝 Form Section: แสดงข้อมูลเดิมที่มีอยู่ */}
        <div className="lg:col-span-7 space-y-7">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            
            <div className="flex items-center gap-3 mb-2 text-[#3F51B5]">
              <FileText size={20} />
              <h2 className="text-base font-bold">ข้อมูลปัจจุบันของเอกสาร</h2>
            </div>

            {/* 1. ชื่อเอกสาร - ผูกข้อมูลเดิมด้วย value */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">ชื่อเอกสาร / หัวข้อข่าวสาร</label>
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
              {/* 2. หมวดหมู่ - ผูกข้อมูลเดิมด้วย value */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 ml-1">หมวดหมู่เอกสาร</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 focus:border-[#3F51B5] outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="student">นักศึกษา</option>
                  <option value="staff">บุคลากร</option>
                </select>
              </div>

              {/* 3. วันที่อัปโหลด - ผูกข้อมูลเดิมด้วย value */}
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
            </div>

            {/* หมายเหตุ - ผูกข้อมูลเดิมด้วย value */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 ml-1">หมายเหตุเพิ่มเติม</label>
              <textarea 
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows="4"
                className="w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-[15px] focus:ring-4 focus:ring-[#3F51B5]/5 outline-none transition-all placeholder:text-slate-300"
                placeholder="ระบุคำอธิบายสั้นๆ..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* 📁 Upload Section: ส่วนเปลี่ยนไฟล์ */}
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
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • ใหม่
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="w-full py-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={16} /> กลับไปใช้ไฟล์เดิม
                </button>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#3F51B5]">
                  <FileText size={28} />
                </div>
                <div className="space-y-2">
                  <p className="text-base font-bold text-slate-700">ไฟล์ปัจจุบันในระบบ</p>
                  <p className="text-[13px] text-[#3F51B5] font-medium underline cursor-pointer">kp-05-internship-form.pdf</p>
                  <p className="text-[11px] text-slate-400">คลิกที่นี่เพื่อเปลี่ยนไฟล์ใหม่ หรือลากมาวาง</p>
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
                  อัปโหลดไฟล์ใหม่
                </label>
                <p className="text-[11px] text-slate-300 pt-2 italic">* ปล่อยว่างไว้หากไม่ต้องการเปลี่ยนไฟล์เดิม</p>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}