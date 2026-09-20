import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Upload, FileSpreadsheet, Search, Trash2, UserPlus, X, Save, CheckCircle, UserCheck, RefreshCw, Loader2 } from 'lucide-react';

export default function ManageConsultants() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    level: "ปี 3"
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/consult/list");
      setStudents(res.data || []);
    } catch (error) {
      console.error("Failed to load consultants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบข้อมูลนักศึกษารายนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:5000/api/consult/students/${id}`);
        alert("ลบข้อมูลนักศึกษาสำเร็จ");
        fetchStudents();
      } catch (error) {
        console.error("Delete error:", error);
        alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!formData.student_id.trim() || !formData.name.trim()) {
      alert("กรุณาระบุรหัสนักศึกษาและชื่อ-นามสกุล");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post("http://localhost:5000/api/consult/students", formData);
      alert("เพิ่มข้อมูลนักศึกษาสำเร็จ");
      setIsAddModalOpen(false);
      setFormData({ student_id: "", name: "", level: "ปี 3" });
      fetchStudents();
    } catch (error) {
      console.error("Add error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.student_id || "").includes(searchTerm)
  );

  return (
    <div className="space-y-8 text-left pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <UserCheck className="text-[#3F51B5]" /> จัดการรายชื่อนักศึกษาในที่ปรึกษา
          </h1>
          <p className="text-slate-500 text-sm">ตรวจสอบและจัดการข้อมูลนักศึกษาภายใต้การดูแลของอาจารย์</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStudents}
            title="รีเฟรช"
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#3F51B5] transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#3F51B5] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all text-sm"
          >
            <UserPlus size={18} /> เพิ่มนักศึกษา
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
          <table className="w-full min-w-[720px] text-left border-collapse">
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
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-[#3F51B5] text-sm">{student.student_id}</td>
                    <td className="px-8 py-5 font-bold text-slate-700 text-sm">{student.name}</td>
                    <td className="px-8 py-5 text-sm text-slate-500">{student.level}</td>
                    <td className="px-8 py-5 text-sm text-slate-500">{student.advisor}</td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors" 
                        title="ลบ"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-slate-400 text-sm">
                    {loading ? "กำลังโหลดข้อมูล..." : "ไม่พบข้อมูลนักศึกษา"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📤 Add Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus className="text-[#3F51B5]" /> เพิ่มข้อมูลนักศึกษา
                </h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
              </div>

              <form onSubmit={handleAddStudent} className="p-8 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">รหัสนักศึกษา (13 หลัก)</label>
                  <input 
                    type="text" 
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="เช่น 6504062610001"
                    maxLength={13}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อ-นามสกุล</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น นายสมชาย ใจดี"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ชั้นปี</label>
                  <select 
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                  >
                    <option value="ปี 1">ปี 1</option>
                    <option value="ปี 2">ปี 2</option>
                    <option value="ปี 3">ปี 3</option>
                    <option value="ปี 4">ปี 4</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-[#3F51B5] text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    บันทึกข้อมูล
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)} 
                    className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}