import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Edit2, Trash2, 
  BookOpen, ChevronDown, Save, X 
} from 'lucide-react';

export default function ManageSubjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // 1. ข้อมูลหลักสูตรและปี (ใช้ร่วมกับหน้าบ้าน)
  const curriculumData = {
    "bachelor-normal": { label: "ปริญญาตรี ภาคปกติ", years: ["2559", "2564"] },
    "bachelor-inter": { label: "ปริญญาตรี โครงการพิเศษ สองภาษา", years: ["2564"] },
    "master-cs": { label: "ปริญญาโท สาขาวิทยาการคอมพิวเตอร์", years: ["2562", "2567"] },
    "master-se": { label: "ปริญญาโท สาขาวิชาวิศวกรรมซอฟต์แวร์", years: ["2559"] },
    "doctor-cs": { label: "ปริญญาเอก สาขาวิชาวิทยาการคอมพิวเตอร์", years: ["2559", "2564"] }
  };

  // 2. ข้อมูลรายวิชา (State สำหรับจัดการข้อมูล)
  const [subjects, setSubjects] = useState([
    {
      code: "040613100",
      degree: "bachelor-normal",
      year: "2564",
      titleTH: "พื้นฐานวิทยาการคอมพิวเตอร์และประเด็นทางวิชาชีพ",
      titleEN: "Fundamental of Computer Science and Professional Issue",
      credit: "3(3-0-6)",
      prerequisiteTH: "ไม่มี",
      prerequisiteEN: "None",
      descriptionTH: "องค์ประกอบพื้นฐานของคอมพิวเตอร์ ระบบจำนวน...",
      descriptionEN: "Fundamental component of computer system..."
    }
  ]);

  // ฟอร์ม State สำหรับ Modal
  const [formData, setFormData] = useState({
    code: "", degree: "bachelor-normal", year: "", titleTH: "", titleEN: "", 
    credit: "", prerequisiteTH: "ไม่มี", prerequisiteEN: "None", 
    descriptionTH: "", descriptionEN: ""
  });

  // อัปเดตปีอัตโนมัติเมื่อเลือกหลักสูตรในฟอร์ม
  useEffect(() => {
    if (!editingSubject) {
      setFormData(prev => ({ ...prev, year: curriculumData[prev.degree].years[0] }));
    }
  }, [formData.degree]);

  // เปิด Modal เพื่อแก้ไข
  const openEditModal = (subject) => {
    setEditingSubject(subject);
    setFormData(subject);
    setIsModalOpen(true);
  };

  const filteredSubjects = subjects.filter((item) => {
    const matchesSearch = item.titleTH.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.includes(searchTerm);
    const matchesDegree = selectedDegree === "" || item.degree === selectedDegree;
    return matchesSearch && matchesDegree;
  });

  return (
    <div className="space-y-6 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-[#3F51B5]" /> จัดการข้อมูลรายวิชา
          </h1>
          <p className="text-slate-500 text-sm">จัดการคำอธิบายรายวิชา ปีหลักสูตร และวิชาบังคับก่อน</p>
        </div>
        <button 
          onClick={() => { setEditingSubject(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-[#3F51B5] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> เพิ่มรายวิชาใหม่
        </button>
      </header>

      {/* 🔍 Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="ค้นหารหัสวิชา หรือ ชื่อวิชา..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="min-w-[200px] bg-slate-50 border-none rounded-xl text-sm p-2 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
          value={selectedDegree}
          onChange={(e) => setSelectedDegree(e.target.value)}
        >
          <option value="">ทุกหลักสูตร</option>
          {Object.keys(curriculumData).map(key => (
            <option key={key} value={key}>{curriculumData[key].label}</option>
          ))}
        </select>
      </div>

      {/* 📊 Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">รหัส / ปี</th>
                <th className="px-6 py-4">ชื่อวิชา</th>
                <th className="px-6 py-4">หลักสูตร</th>
                <th className="px-6 py-4">วิชาบังคับก่อน</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.map((subject) => (
                <tr key={subject.code} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#3F51B5]">{subject.code}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">ปีหลักสูตร {subject.year}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700">{subject.titleTH}</div>
                    <div className="text-xs text-slate-400 italic line-clamp-1">{subject.titleEN}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-indigo-50 text-[#3F51B5] text-[10px] font-bold rounded-lg border border-indigo-100">
                      {curriculumData[subject.degree]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <div className="font-bold">TH: <span className="font-normal">{subject.prerequisiteTH}</span></div>
                    <div className="font-bold">EN: <span className="font-normal italic">{subject.prerequisiteEN}</span></div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => openEditModal(subject)} className="p-2 text-slate-400 hover:text-amber-500"><Edit2 size={16} /></button>
                      <button className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📝 Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[95vh]">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800">{editingSubject ? "แก้ไขข้อมูลรายวิชา" : "เพิ่มรายวิชาใหม่"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
              </div>

              <form className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">รหัสวิชา</label>
                    <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.code} onChange={(e)=>setFormData({...formData, code: e.target.value})}/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">หลักสูตร</label>
                    <select className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.degree} onChange={(e)=>setFormData({...formData, degree: e.target.value})}>
                      {Object.keys(curriculumData).map(key => <option key={key} value={key}>{curriculumData[key].label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">ปีหลักสูตร (พ.ศ.)</label>
                    <select className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.year} onChange={(e)=>setFormData({...formData, year: e.target.value})}>
                      {curriculumData[formData.degree].years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">วิชาบังคับก่อน (ไทย)</label>
                    <input type="text" placeholder="เช่น ไม่มี หรือ 040613101" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.prerequisiteTH} onChange={(e)=>setFormData({...formData, prerequisiteTH: e.target.value})}/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Prerequisite (EN)</label>
                    <input type="text" placeholder="เช่น None หรือ 040613101" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.prerequisiteEN} onChange={(e)=>setFormData({...formData, prerequisiteEN: e.target.value})}/>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">ชื่อวิชา (ไทย / EN)</label>
                  <div className="flex flex-col gap-2">
                    <input type="text" placeholder="ชื่อภาษาไทย" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.titleTH} onChange={(e)=>setFormData({...formData, titleTH: e.target.value})}/>
                    <input type="text" placeholder="English Name" className="w-full p-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20" value={formData.titleEN} onChange={(e)=>setFormData({...formData, titleEN: e.target.value})}/>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">คำอธิบายรายวิชา (ไทย)</label>
                  <textarea rows={3} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm" value={formData.descriptionTH} onChange={(e)=>setFormData({...formData, descriptionTH: e.target.value})}/>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-50">
                  <button type="button" className="flex-1 py-4 bg-[#3F51B5] text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"><Save size={20}/> บันทึกข้อมูลรายวิชา</button>
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