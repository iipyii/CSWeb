import React, { useState } from 'react';
import { 
  Plus, Search, Edit3, Trash2, GraduationCap, 
  FileText, LayoutGrid, ChevronRight, BookOpen, ExternalLink 
} from 'lucide-react';

// หมวดหมู่ระดับการศึกษา
const levels = [
  { id: 'all', label: 'ทั้งหมด', icon: <LayoutGrid size={18} /> },
  { id: 'bachelor', label: 'ปริญญาตรี', icon: <GraduationCap size={18} /> },
  { id: 'master', label: 'ปริญญาโท', icon: <GraduationCap size={18} /> },
  { id: 'doctorate', label: 'ปริญญาเอก', icon: <GraduationCap size={18} /> },
];

export default function ManageCurriculum() {
  const [activeLevel, setActiveLevel] = useState('all');

  // ข้อมูลจำลองหลักสูตร ภาควิชา CIS
  const curriculumData = [
    {
      id: 1,
      name: "วท.บ. วิทยาการคอมพิวเตอร์ (Computer Science)",
      level: 'bachelor',
      code: "CS-01",
      lastUpdate: "2026-01-15",
      status: "Active"
    },
    {
      id: 2,
      name: "วท.บ. เทคโนโลยีสารสนเทศ (Information Technology)",
      level: 'bachelor',
      code: "IT-02",
      lastUpdate: "2026-02-10",
      status: "Active"
    },
    {
      id: 3,
      name: "วท.ม. วิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ",
      level: 'master',
      code: "MS-CIS",
      lastUpdate: "2025-12-01",
      status: "Active"
    }
  ];

  const filteredData = curriculumData.filter(item => 
    activeLevel === 'all' || item.level === activeLevel
  );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* 🚀 Header Area: CIS Blue & Bold Style */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">จัดการหลักสูตร</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">บริหารจัดการข้อมูลหลักสูตรและรายวิชาภาควิชา CIS</p>
        </div>
        <button className="bg-[#3F51B5] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#2D3B8E] transition-all shadow-xl shadow-indigo-100 active:scale-95">
          <Plus size={20} />
          เพิ่มหลักสูตรใหม่
        </button>
      </div>

      {/* 📂 Education Level Tabs: Pastel Accent */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {levels.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLevel(tab.id)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              activeLevel === tab.id 
              ? 'bg-[#3F51B5] text-white shadow-lg shadow-indigo-100' 
              : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔍 Search Bar: High Radius */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative max-w-2xl text-left">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อหลักสูตร หรือ รหัสหลักสูตร..."
            className="w-full bg-slate-50 border-none rounded-[1.5rem] py-4 pl-16 pr-5 text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all font-medium"
          />
        </div>
      </div>

      {/* 📋 Curriculum List: Modern Card */}
      <div className="grid grid-cols-1 gap-6">
        {filteredData.map((item) => (
          <div key={item.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 w-full">
              <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-[#3F51B5] shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen size={28} />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.code}</span>
                  <span className="text-[10px] font-bold text-[#3F51B5] opacity-60 uppercase">{item.level} Program</span>
                </div>
                <h3 className="text-xl font-black text-slate-800 leading-tight">{item.name}</h3>
                <p className="text-slate-400 text-[12px] mt-1 font-medium italic">ปรับปรุงล่าสุดเมื่อ: {item.lastUpdate}</p>
              </div>
            </div>

            {/* Actions Bottom Bar */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-3 bg-indigo-50 text-[#3F51B5] rounded-xl text-xs font-black hover:bg-[#3F51B5] hover:text-white transition-all flex items-center justify-center gap-2">
                <Edit3 size={16} /> แก้ไขข้อมูล
              </button>
              <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                <Trash2 size={20} />
              </button>
              <button className="p-3 bg-white border border-slate-100 text-slate-300 rounded-xl hover:text-[#3F51B5] transition-all">
                <ExternalLink size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
          <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4 text-slate-200">
            <BookOpen size={48} />
          </div>
          <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">ไม่พบข้อมูลหลักสูตร</h3>
        </div>
      )}
    </div>
  );
}