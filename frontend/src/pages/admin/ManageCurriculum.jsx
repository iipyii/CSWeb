import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Edit3, Trash2, GraduationCap, 
  BookOpen, ExternalLink, X, Save, RefreshCw, Loader2 
} from 'lucide-react';

const levelTabs = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'bachelor', label: 'ปริญญาตรี' },
  { id: 'master', label: 'ปริญญาโท' },
  { id: 'doctorate', label: 'ปริญญาเอก' },
];

export default function ManageCurriculum() {
  const [activeLevel, setActiveLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [degrees, setDegrees] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    name_th: '',
    slug: '',
    degreeId: 1,
    year: '2565'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const [progRes, degRes] = await Promise.all([
        axios.get("http://localhost:5000/api/curriculum/programs"),
        axios.get("http://localhost:5000/api/curriculum/degrees")
      ]);
      setPrograms(progRes.data || []);
      setDegrees(degRes.data || []);
    } catch (error) {
      console.error("Failed to load curriculum:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const openModal = (program = null) => {
    if (program) {
      setEditingProgram(program);
      setFormData({
        name_th: program.name_th || '',
        slug: program.slug || '',
        degreeId: program.degreeId || (degrees[0]?.id || 1),
        year: program.versions?.[0]?.year?.toString() || '2565'
      });
    } else {
      setEditingProgram(null);
      setFormData({
        name_th: '',
        slug: '',
        degreeId: degrees[0]?.id || 1,
        year: '2565'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name_th.trim()) {
      alert("กรุณาระบุชื่อหลักสูตร");
      return;
    }

    try {
      setSubmitting(true);
      if (editingProgram) {
        await axios.put(`http://localhost:5000/api/curriculum/programs/${editingProgram.id}`, {
          name_th: formData.name_th,
          slug: formData.slug,
          degreeId: formData.degreeId
        });
        alert("แก้ไขหลักสูตรสำเร็จ");
      } else {
        await axios.post("http://localhost:5000/api/curriculum/programs", formData);
        alert("เพิ่มหลักสูตรสำเร็จ");
      }
      setIsModalOpen(false);
      fetchCurriculum();
    } catch (error) {
      console.error("Save program error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกหลักสูตร");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบหลักสูตรนี้และเวอร์ชันที่เกี่ยวข้องใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:5000/api/curriculum/programs/${id}`);
        alert("ลบหลักสูตรสำเร็จ");
        fetchCurriculum();
      } catch (error) {
        console.error("Failed to delete program:", error);
        alert("เกิดข้อผิดพลาดในการลบหลักสูตร");
      }
    }
  };

  const filteredData = programs.filter(item => {
    const degreeSlug = item.degree?.slug || '';
    const matchesLevel = activeLevel === 'all' || 
      (activeLevel === 'bachelor' && (degreeSlug.includes('bachelor') || item.degree?.name_th?.includes('ตรี'))) ||
      (activeLevel === 'master' && (degreeSlug.includes('master') || item.degree?.name_th?.includes('โท'))) ||
      (activeLevel === 'doctorate' && (degreeSlug.includes('doctor') || item.degree?.name_th?.includes('เอก')));
    
    const matchesSearch = item.name_th?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-20 text-left">
      
      {/* 🚀 Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">จัดการหลักสูตร</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">บริหารจัดการข้อมูลหลักสูตรและเวอร์ชันภาควิชา CIS</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCurriculum}
            title="รีเฟรช"
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-[#3F51B5] transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => openModal()}
            className="bg-[#3F51B5] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#2D3B8E] transition-all shadow-xl shadow-indigo-100 active:scale-95 text-sm"
          >
            <Plus size={20} /> เพิ่มหลักสูตรใหม่
          </button>
        </div>
      </div>

      {/* 📂 Education Level Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {levelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLevel(tab.id)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              activeLevel === tab.id 
              ? 'bg-[#3F51B5] text-white shadow-lg shadow-indigo-100' 
              : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            <GraduationCap size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔍 Search Bar */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative max-w-2xl text-left">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อหลักสูตร หรือ รหัสหลักสูตร..."
            className="w-full bg-slate-50 border-none rounded-[1.5rem] py-4 pl-16 pr-5 text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 📋 Curriculum List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            const versionsText = item.versions?.map(v => v.year).join(', ') || 'ไม่มีเวอร์ชัน';
            return (
              <div key={item.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full">
                  <div className="w-16 h-16 bg-indigo-50 rounded-[1.5rem] flex items-center justify-center text-[#3F51B5] shrink-0 group-hover:scale-110 transition-transform">
                    <BookOpen size={28} />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.slug}</span>
                      <span className="text-[10px] font-bold text-[#3F51B5] opacity-60 uppercase">{item.degree?.name_th || 'หลักสูตร'}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight">{item.name_th}</h3>
                    <p className="text-slate-400 text-[12px] mt-1 font-medium italic">
                      เวอร์ชันปี: {versionsText}
                    </p>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => openModal(item)}
                    className="flex-1 md:flex-none px-6 py-3 bg-indigo-50 text-[#3F51B5] rounded-xl text-xs font-black hover:bg-[#3F51B5] hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Edit3 size={16} /> แก้ไขข้อมูล
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                    title="ลบ"
                  >
                    <Trash2 size={20} />
                  </button>
                  <a 
                    href={`/course-sections/${item.degree?.slug || 'bachelor'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-white border border-slate-100 text-slate-300 rounded-xl hover:text-[#3F51B5] transition-all"
                    title="ดูหน้ารายละเอียด"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
            <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4 text-slate-200">
              <BookOpen size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">
              {loading ? "กำลังโหลดข้อมูลหลักสูตร..." : "ไม่พบข้อมูลหลักสูตร"}
            </h3>
          </div>
        )}
      </div>

      {/* 📝 Modal เพิ่ม/แก้ไขหลักสูตร */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {editingProgram ? "แก้ไขข้อมูลหลักสูตร" : "เพิ่มหลักสูตรใหม่"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อหลักสูตร (ภาษาไทย)</label>
                <input 
                  type="text" 
                  value={formData.name_th}
                  onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
                  placeholder="เช่น วิทยาการคอมพิวเตอร์ ภาคปกติ"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Slug / รหัสกำกับ</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="เช่น cs-regular"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ระดับการศึกษา</label>
                <select 
                  value={formData.degreeId}
                  onChange={(e) => setFormData({ ...formData, degreeId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5] cursor-pointer"
                >
                  {degrees.map(d => (
                    <option key={d.id} value={d.id}>{d.name_th}</option>
                  ))}
                </select>
              </div>

              {!editingProgram && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ปีหลักสูตรเริ่มต้น</label>
                  <input 
                    type="number" 
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="2565"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#3F51B5] text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}