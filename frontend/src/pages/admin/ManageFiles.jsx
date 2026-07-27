import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ExternalLink,
  Files,
  ArrowUpDown,
  DownloadCloud
} from 'lucide-react';

export default function ManageFiles() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // ข้อมูลจำลองไฟล์เอกสารในระบบ
  const [files, setFiles] = useState([
    { id: 1, name: "แบบคำร้องขอฝึกงาน (คพ.05)", category: "นักศึกษา", type: "PDF", size: "1.2 MB", date: "2026-03-01", downloads: 145 },
    { id: 2, name: "คู่มือการฝึกงาน ประจำปี 2568", category: "นักศึกษา", type: "PDF", size: "4.5 MB", date: "2026-02-15", downloads: 89 },
    { id: 3, name: "แบบฟอร์มเบิกค่าตอบแทน", category: "บุคลากร", type: "DOCX", size: "850 KB", date: "2026-01-10", downloads: 42 },
    { id: 4, name: "ระเบียบการสำเร็จการศึกษา", category: "ทั่วไป", type: "PDF", size: "2.1 MB", date: "2025-12-20", downloads: 210 },
  ]);

  return (
    <div className="space-y-7 text-left pb-10">
      
      {/* 🚀 Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Files className="text-[#3F51B5]" size={28} /> จัดการไฟล์และเอกสาร
          </h1>
          <p className="text-[14px] text-slate-400 mt-1">ศูนย์กลางจัดการไฟล์ดาวน์โหลดสำหรับนักศึกษาและบุคลากร</p>
        </div>
        
        <button 
          onClick={() => navigate('/admin/files/create')}
          className="flex items-center gap-2 bg-[#3F51B5] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus size={18} /> เพิ่มเอกสารใหม่
        </button>
      </div>

      {/* 📊 Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'ไฟล์ทั้งหมด', value: files.length, unit: 'ไฟล์', color: 'text-slate-800' },
          { label: 'ยอดดาวน์โหลดรวม', value: '486', unit: 'ครั้ง', color: 'text-emerald-500' },
          { label: 'ขนาดพื้นที่ใช้ไป', value: '8.5', unit: 'MB', color: 'text-orange-500' },
          { label: 'อัปเดตล่าสุด', value: 'วันนี้', unit: '', color: 'text-[#3F51B5]' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
            <h2 className={`text-xl font-bold ${stat.color}`}>{stat.value} <span className="text-[12px] font-medium text-slate-400 ml-0.5">{stat.unit}</span></h2>
          </div>
        ))}
      </div>

      {/* 🔍 Search & Filter Tools */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อไฟล์ หรือประเภทเอกสาร..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:ring-4 focus:ring-[#3F51B5]/5 focus:border-[#3F51B5] outline-none transition-all placeholder:text-slate-300"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-[14px] text-slate-600 focus:outline-none cursor-pointer hover:border-slate-300 transition-colors appearance-none pr-10 relative">
            <option>ทุกหมวดหมู่</option>
            <option>นักศึกษา</option>
            <option>บุคลากร</option>
          </select>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-bold text-slate-500 hover:bg-slate-100 transition-all">
            <Filter size={16} /> กรอง
          </button>
        </div>
      </div>

      {/* 📁 File Management Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">ข้อมูลไฟล์เอกสาร</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">หมวดหมู่</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">ขนาด</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">ยอดโหลด</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#3F51B5] group-hover:scale-110 transition-transform">
                        <FileText size={22} />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-slate-700 leading-snug">{file.name}</p>
                        <p className="text-[12px] text-slate-400 mt-0.5">วันที่อัปโหลด: {file.date} • {file.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${
                      file.category === 'นักศึกษา' ? 'bg-indigo-50 text-[#3F51B5]' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {file.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center text-[13px] font-medium text-slate-500">
                    {file.size}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[14px] font-bold text-slate-700">{file.downloads}</span>
                      <span className="text-[9px] text-slate-300 uppercase font-black tracking-tighter">Downloads</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-2.5 text-slate-400 hover:text-[#3F51B5] hover:bg-white hover:shadow-sm rounded-xl transition-all" title="ดูไฟล์">
                        <ExternalLink size={18} />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/files/edit/${file.id}`)}
                        className="p-2.5 text-slate-400 hover:text-emerald-500 hover:bg-white hover:shadow-sm rounded-xl transition-all" 
                        title="แก้ไข"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-sm rounded-xl transition-all" title="ลบ">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}