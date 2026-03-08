import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, Search, Trash2, UserPlus, X, Save, CheckCircle, UserCheck} from 'lucide-react';

export default function ManageConsultants() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // จำลองข้อมูลนักศึกษาในที่ปรึกษา
  const [students, setStudents] = useState([
    { id: "6504062610001", name: "นายสมชาย ใจดี", level: "ปี 3", advisor: "ผศ.ดร. มานะ มีนา" },
    { id: "6504062610002", name: "นางสาวสมหญิง รักเรียน", level: "ปี 3", advisor: "ผศ.ดร. มานะ มีนา" },
  ]);

  return (
    <div className="space-y-8 font-['Prompt'] text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <UserCheck className="text-[#3F51B5]" /> จัดการรายชื่อนักศึกษาในที่ปรึกษา
          </h1>
          <p className="text-slate-500 text-sm">อัปโหลดรายชื่อและตรวจสอบข้อมูลนักศึกษาภายใต้การดูแล</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all text-sm"
          >
            <Upload size={18} /> อัปโหลดรายชื่อ (Excel/CSV)
          </button>
        </div>
      </header>

      {/* 🔍 Filter & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหารหัส หรือ ชื่อนักศึกษา..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#3F51B5]/20 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 📊 Student Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-5">รหัสนักศึกษา</th>
                <th className="px-8 py-5">ชื่อ-นามสกุล</th>
                <th className="px-8 py-5">ชั้นปี</th>
                <th className="px-8 py-5">อาจารย์ที่ปรึกษา</th>
                <th className="px-8 py-5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.filter(s => s.name.includes(searchTerm) || s.id.includes(searchTerm)).map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-[#3F51B5] text-sm">{student.id}</td>
                  <td className="px-8 py-5 font-bold text-slate-700 text-sm">{student.name}</td>
                  <td className="px-8 py-5 text-sm text-slate-500">{student.level}</td>
                  <td className="px-8 py-5 text-sm text-slate-500">{student.advisor}</td>
                  <td className="px-8 py-5 text-center">
                    <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📤 Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="text-green-600" /> อัปโหลดไฟล์รายชื่อ
                </h2>
                <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>

              <div className="p-8 space-y-6">
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-[#3F51B5] transition-colors cursor-pointer group">
                  <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="text-[#3F51B5]" size={28} />
                  </div>
                  <p className="text-slate-600 font-bold">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                  <p className="text-slate-400 text-xs mt-2">รองรับไฟล์ .xlsx, .csv (ไม่เกิน 5MB)</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <h4 className="text-amber-800 text-xs font-bold mb-1 flex items-center gap-2">
                    <CheckCircle size={14}/> คำแนะนำการอัปโหลด
                  </h4>
                  <p className="text-amber-700 text-[10px] leading-relaxed">
                    ไฟล์ต้องมีคอลัมน์: รหัสนักศึกษา, ชื่อ-นามสกุล, ชั้นปี ตามลำดับ <br/>
                    <a href="#" className="underline font-bold">ดาวน์โหลดไฟล์แม่แบบ (Template)</a>
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" className="flex-1 py-4 bg-[#3F51B5] text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2">
                    เริ่มการนำเข้าข้อมูล
                  </button>
                  <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                    ยกเลิก
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}