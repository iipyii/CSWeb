import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Edit2, Trash2, FolderGit2, 
  ChevronDown, Save, X, FileText, Calendar, Users, GraduationCap 
} from 'lucide-react';

export default function ManageProjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const years = ["2569", "2568", "2567", "2566", "2565"];

  const [projects, setProjects] = useState([
    { 
      id: 1, 
      titleTh: "โครงการพัฒนาเว็บไซต์ภาควิชาคอมพิวเตอร์และสารสนเทศ", 
      titleEn: "Department of Computer and Information Science Website Development Project",
      year: "2568",
      student1Id: "6504062610001",
      student1Name: "นายสมชาย ใจดี",
      student2Id: "6504062610002",
      student2Name: "นายวิชา เรียนดี",
      advisor1: "ผศ.ดร. มานะ มีนา",
      advisor2: "", 
      abstract: "เนื้อหาบทคัดย่อของโครงการพัฒนาเว็บไซต์..."
    }
  ]);

  const [formData, setFormData] = useState({
    titleTh: "", titleEn: "", year: "2568",
    student1Id: "", student1Name: "",
    student2Id: "", student2Name: "",
    advisor1: "", advisor2: "",
    abstract: ""
  });

  // ✨ ฟังก์ชันควบคุมการกรอกรหัสให้รับเฉพาะตัวเลขและจำกัด 13 หลัก
  const handleStudentIdChange = (key, value) => {
    const onlyNums = value.replace(/[^0-9]/g, '');
    if (onlyNums.length <= 13) {
      setFormData({ ...formData, [key]: onlyNums });
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData(project);
    } else {
      setEditingProject(null);
      setFormData({ 
        titleTh: "", titleEn: "", year: "2568",
        student1Id: "", student1Name: "",
        student2Id: "", student2Name: "",
        advisor1: "", advisor2: "",
        abstract: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if(window.confirm("คุณต้องการลบโครงงานนี้ใช่หรือไม่?")) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.titleTh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.student1Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.student2Name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === "" || project.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <div className="space-y-6 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderGit2 className="text-[#3F51B5]" /> จัดการโครงงานนักศึกษา
          </h1>
          <p className="text-slate-500 text-sm">จัดการรายละเอียดโครงงาน รายชื่อผู้จัดทำ ที่ปรึกษา และบทคัดย่อ</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#3F51B5] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> เพิ่มโครงงานใหม่
        </button>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="ค้นหาชื่อโครงงาน หรือ ชื่อนักศึกษา..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="min-w-[200px] bg-slate-50 border-none rounded-xl text-sm p-2 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">ทุกปีการศึกษา</option>
          {years.map(year => <option key={year} value={year}>{`ปีการศึกษา ${year}`}</option>)}
        </select>
      </div>

      {/* Project Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">ปีการศึกษา</th>
                <th className="px-6 py-4">ชื่อโครงงาน</th>
                <th className="px-6 py-4">ผู้จัดทำ (นักศึกษา)</th>
                <th className="px-6 py-4">ที่ปรึกษา</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-50 text-[#3F51B5] text-xs font-bold rounded-lg border border-indigo-100">
                      {project.year}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="text-sm font-bold text-slate-700 leading-snug line-clamp-1">{project.titleTh}</div>
                    <div className="text-[11px] text-slate-400 italic line-clamp-1">{project.titleEn}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div className="mb-1">1. {project.student1Name} ({project.student1Id})</div>
                    <div>2. {project.student2Name} ({project.student2Id})</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <div className="font-bold text-[#3F51B5]">{project.advisor1}</div>
                    {project.advisor2 && <div className="text-slate-400 italic">{project.advisor2}</div>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => openModal(project)} className="p-2 text-slate-400 hover:text-amber-500 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(project.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[95vh]">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Plus className="text-[#3F51B5]" size={20}/> 
                  {editingProject ? "แก้ไขข้อมูลโครงงาน" : "เพิ่มโครงงานใหม่"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
              </div>

              <form className="p-8 overflow-y-auto space-y-6">
                {/* ปีการศึกษา */}
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2 text-[#3F51B5] mb-2">
                    <Calendar size={16}/>
                    <span className="text-sm font-bold uppercase tracking-wider">ปีการศึกษาที่จัดทำ</span>
                  </div>
                  <select className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.year} onChange={(e)=>setFormData({...formData, year: e.target.value})}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* รายชื่อนักศึกษา (รับเฉพาะตัวเลข 13 หลัก) */}
                <div className="space-y-4 p-6 border border-slate-100 rounded-3xl">
                  <div className="flex items-center gap-2 text-[#3F51B5] mb-2">
                    <Users size={16}/>
                    <span className="text-sm font-bold uppercase tracking-wider">รายชื่อนักศึกษาผู้จัดทำ</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">นักศึกษาคนที่ 1</label>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder="รหัสนักศึกษา" 
                          className="p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm" 
                          value={formData.student1Id} 
                          onChange={(e)=> handleStudentIdChange('student1Id', e.target.value)} 
                          maxLength="13"
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="ชื่อ-นามสกุล" 
                          className="p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm" 
                          value={formData.student1Name} 
                          onChange={(e)=>setFormData({...formData, student1Name: e.target.value})} 
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">นักศึกษาคนที่ 2</label>
                      <div className="flex flex-col gap-2">
                        <input 
                          type="text" 
                          placeholder="รหัสนักศึกษา" 
                          className="p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm" 
                          value={formData.student2Id} 
                          onChange={(e)=> handleStudentIdChange('student2Id', e.target.value)} 
                          maxLength="13"
                          required
                        />
                        <input 
                          type="text" 
                          placeholder="ชื่อ-นามสกุล" 
                          className="p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm" 
                          value={formData.student2Name} 
                          onChange={(e)=>setFormData({...formData, student2Name: e.target.value})} 
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* อาจารย์ที่ปรึกษา */}
                <div className="space-y-4 p-6 border border-slate-100 rounded-3xl">
                  <div className="flex items-center gap-2 text-[#3F51B5] mb-2">
                    <GraduationCap size={16}/>
                    <span className="text-sm font-bold uppercase tracking-wider">อาจารย์ที่ปรึกษาโครงงาน</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่ปรึกษาหลัก (บังคับ)</label>
                      <input type="text" placeholder="ระบุชื่ออาจารย์ที่ปรึกษาหลัก" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.advisor1} onChange={(e)=>setFormData({...formData, advisor1: e.target.value})} required/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ที่ปรึกษาร่วม (ถ้ามี)</label>
                      <input type="text" placeholder="ระบุชื่ออาจารย์ที่ปรึกษาร่วม" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.advisor2} onChange={(e)=>setFormData({...formData, advisor2: e.target.value})}/>
                    </div>
                  </div>
                </div>

                {/* ชื่อโครงงานและบทคัดย่อ */}
                <div className="space-y-4 p-6 border border-slate-100 rounded-3xl bg-indigo-50/20">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#3F51B5] uppercase tracking-widest">ชื่อโครงงาน (ภาษาไทย)</label>
                    <textarea rows={2} className="w-full p-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-bold" value={formData.titleTh} onChange={(e)=>setFormData({...formData, titleTh: e.target.value})} required/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#3F51B5] uppercase tracking-widest">Project Title (English)</label>
                    <textarea rows={2} className="w-full p-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 italic" value={formData.titleEn} onChange={(e)=>setFormData({...formData, titleEn: e.target.value})} required/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#3F51B5] uppercase tracking-widest">บทคัดย่อ (Abstract)</label>
                    <textarea rows={6} className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm leading-relaxed" value={formData.abstract} onChange={(e)=>setFormData({...formData, abstract: e.target.value})} required/>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2 border-t border-slate-50">
                  <button type="submit" className="flex-1 py-4 bg-[#3F51B5] text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"><Save size={20}/> บันทึกข้อมูลโครงงาน</button>
                  <button type="button" onClick={()=>setIsModalOpen(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all">ยกเลิก</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}