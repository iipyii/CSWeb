import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Upload, 
  FileSpreadsheet, 
  Search, 
  Trash2, 
  UserPlus, 
  X, 
  Save, 
  CheckCircle, 
  UserCheck, 
  RefreshCw, 
  Loader2, 
  Calendar, 
  Download, 
  AlertCircle,
  Pencil
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ManageConsultants() {
  const { isAdmin, user } = useAuth();
  const isUserAdmin = isAdmin || user?.role === 'admin';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [availableYears, setAvailableYears] = useState([2570, 2569, 2568, 2567, 2566, 2565, 2564, 2563, 2562, 2561, 2560, 2559, 2558]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);

  // Import states
  const [importFile, setImportFile] = useState(null);
  const [defaultImportYear, setDefaultImportYear] = useState("69");
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatusText, setImportStatusText] = useState("");
  const [importResult, setImportResult] = useState(null);

  const [formData, setFormData] = useState({
    student_id: "",
    name: "",
    year: "69",
    advisor_id: ""
  });

  // Edit student states
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: "",
    student_id: "",
    name: "",
    room: "-",
    year: "69",
    advisor_id: ""
  });

  const getCohort = (student) => {
    if (student?.student_id && student.student_id.length >= 2) {
      return student.student_id.slice(0, 2);
    }
    if (student?.academic_year) {
      const s = String(student.academic_year);
      return s.length >= 2 ? s.slice(-2) : s;
    }
    if (student?.year) {
      const s = String(student.year);
      return s.length >= 2 ? s.slice(-2) : s;
    }
    return "-";
  };

  // คำนวณช่วงปีการศึกษาอัตโนมัติจากปี พ.ศ. ปัจจุบัน + เผื่อล่วงหน้า 1 ปี และรวมทุกปีที่มีในฐานข้อมูล
  const currentThaiYear = new Date().getFullYear() + 543;
  const maxYear = Math.max(
    currentThaiYear + 1,
    ...(availableYears.length > 0 ? availableYears : [currentThaiYear + 1]),
    ...(students.length > 0 ? students.map(s => {
      const c = getCohort(s);
      return (!isNaN(parseInt(c)) && c.length === 2) ? parseInt(c) + 2500 : 0;
    }) : [0])
  );

  const dynamicCohorts = [];
  for (let y = maxYear; y >= 2558; y--) {
    dynamicCohorts.push(String(y).slice(-2));
  }

  const cohortList = Array.from(new Set([
    ...dynamicCohorts,
    ...availableYears.map(y => String(y).slice(-2)),
    ...students.map(s => getCohort(s)).filter(c => c && c.length === 2 && !isNaN(parseInt(c)))
  ])).filter(c => c && c.length === 2 && !isNaN(parseInt(c)))
    .sort((a, b) => parseInt(b) - parseInt(a));

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/consult/list");
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setStudents(list);
      if (res.data?.years && Array.isArray(res.data.years) && res.data.years.length > 0) {
        setAvailableYears(res.data.years);
        const topCohort = String(res.data.years[0]).slice(-2);
        setDefaultImportYear(topCohort);
      }
    } catch (error) {
      console.error("Failed to load consultants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/lecturers");
      setLecturers(res.data || []);
    } catch (error) {
      console.error("Failed to load lecturers:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchLecturers();
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
      setFormData({ 
        student_id: "", 
        name: "", 
        year: cohortList[0] || "68", 
        advisor_id: "" 
      });
      fetchStudents();
    } catch (error) {
      console.error("Add error:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (student) => {
    const cohort = getCohort(student);
    setEditFormData({
      id: student.id,
      student_id: student.student_id || "",
      name: student.name || "",
      room: student.room || "-",
      year: cohort !== "-" ? cohort : "69",
      advisor_id: student.advisor_id ? String(student.advisor_id) : ""
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editFormData.student_id.trim() || !editFormData.name.trim()) {
      alert("กรุณาระบุรหัสนักศึกษาและชื่อ-นามสกุล");
      return;
    }

    try {
      setEditSubmitting(true);
      await axios.put(`http://localhost:5000/api/consult/students/${editFormData.id}`, editFormData);
      alert("แก้ไขข้อมูลนักศึกษาสำเร็จ");
      setIsEditModalOpen(false);
      fetchStudents();
    } catch (error) {
      console.error("Update error:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขข้อมูล: " + (error.response?.data?.error || error.message));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!importFile) {
      alert("กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls)");
      return;
    }

    const data = new FormData();
    data.append("file", importFile);
    data.append("default_year", defaultImportYear);

    setImporting(true);
    setImportResult(null);
    setImportProgress(15);
    setImportStatusText("กำลังอัปโหลดไฟล์...");

    let progressInterval = setInterval(() => {
      setImportProgress((prev) => {
        if (prev < 40) return prev + 12;
        if (prev < 70) return prev + 6;
        if (prev < 88) return prev + 3;
        if (prev < 96) return prev + 1;
        return prev;
      });
    }, 280);

    try {
      const res = await axios.post("http://localhost:5000/api/consult/import-excel", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.min(50, Math.round((progressEvent.loaded * 50) / progressEvent.total));
            setImportProgress((prev) => Math.max(prev, percent));
            if (percent >= 50) {
              setImportStatusText("กำลังอ่านไฟล์ Excel และประมวลผลรายชื่อ...");
            }
          }
        }
      });

      clearInterval(progressInterval);
      setImportProgress(100);
      setImportStatusText("นำเข้าข้อมูลเรียบร้อยแล้ว!");
      setImportResult(res.data);
      fetchStudents();
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Import error:", error);
      setImportResult({
        success: false,
        error: error.response?.data?.error || "เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel"
      });
    } finally {
      setTimeout(() => {
        setImporting(false);
      }, 500);
    }
  };

  const filteredStudents = students.filter(s => {
    const q = searchTerm.toLowerCase().trim();
    const matchSearch = !q || 
      (s.name || "").toLowerCase().includes(q) || 
      (s.student_id || "").includes(q) ||
      (s.advisor || "").toLowerCase().includes(q);

    const cohort = getCohort(s);
    const targetCohort = selectedYear === "all" ? "all" : String(selectedYear).slice(-2);
    const matchCohort = targetCohort === "all" || cohort === targetCohort;

    return matchSearch && matchCohort;
  });

  return (
    <div className="space-y-8 text-left pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <UserCheck className="text-[#3F51B5]" /> จัดการรายชื่อนักศึกษาในที่ปรึกษา
          </h1>
          <p className="text-slate-500 text-sm">ตรวจสอบและจัดการข้อมูลนักศึกษาภายใต้การดูแลของอาจารย์</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchStudents}
            title="รีเฟรชข้อมูล"
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#3F51B5] transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-[#3F51B5]" : ""} />
          </button>

          {/* ปุ่มนำเข้าไฟล์ Excel เฉพาะสำหรับแอดมิน */}
          {isUserAdmin && (
            <button 
              onClick={() => {
                setIsImportModalOpen(true);
                setImportResult(null);
                setImportFile(null);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all text-sm cursor-pointer"
            >
              <FileSpreadsheet size={18} /> นำเข้าไฟล์ Excel
            </button>
          )}

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#3F51B5] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all text-sm cursor-pointer"
          >
            <UserPlus size={18} /> เพิ่มนักศึกษา
          </button>
        </div>
      </header>

      {/* 🔍 Filter & Search */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            {/* ค้นหา */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหารหัส หรือ ชื่อนักศึกษา, ชื่ออาจารย์..." 
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:ring-2 focus:ring-[#3F51B5]/20 focus:border-[#3F51B5] outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* ฟิลเตอร์เลือก Dropdown */}
            <div className="relative min-w-[180px]">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3F51B5] pointer-events-none">
                <Calendar size={16} />
              </div>
              <select
                value={selectedYear === "all" ? "all" : String(selectedYear).slice(-2)}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 focus:border-[#3F51B5] transition-all cursor-pointer appearance-none"
              >
                <option value="all">ทุกรหัส (ทั้งหมด)</option>
                {cohortList.map(c => (
                  <option key={c} value={c}>
                    รหัส {c}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* จำนวนรายการ */}
          <div className="text-xs text-slate-500 font-medium px-2 flex items-center gap-1.5 self-end md:self-center">
            <span>แสดง</span>
            <span className="font-bold text-[#3F51B5] bg-indigo-50 px-2 py-0.5 rounded-md">
              {filteredStudents.length}
            </span>
            <span>คน (จากทั้งหมด {students.length} คน)</span>
          </div>
        </div>

        {/* 🏷️ Quick Cohort Pills (ปุ่มเลือกรหัส เช่น รหัส 68, รหัส 67, รหัส 65...) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 select-none">
            เลือกรหัส:
          </span>
          <button
            type="button"
            onClick={() => setSelectedYear("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
              selectedYear === "all"
                ? "bg-[#183153] text-white"
                : "bg-white text-slate-700 hover:text-[#183153] hover:border-[#183153] hover:bg-slate-50 border border-slate-200"
            }`}
          >
            ทั้งหมด
          </button>
          {cohortList.map((c) => {
            const isSelected = selectedYear === c || String(selectedYear).slice(-2) === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedYear(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  isSelected
                    ? "bg-[#183153] text-white"
                    : "bg-white text-slate-700 hover:text-[#183153] hover:border-[#183153] hover:bg-slate-50 border border-slate-200"
                }`}
              >
                รหัส {c}
              </button>
            );
          })}
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
                <th className="px-8 py-5">รหัสรุ่น</th>
                <th className="px-8 py-5">อาจารย์ที่ปรึกษา</th>
                <th className="px-8 py-5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const cohort = getCohort(student);
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 font-bold text-[#3F51B5] text-sm tracking-wide">
                        {student.student_id}
                      </td>
                      <td className="px-8 py-5 font-bold text-slate-700 text-sm">
                        {student.name}
                      </td>
                      <td className="px-8 py-5 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-[#3F51B5] border border-indigo-100/70">
                          รหัส {cohort}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                        {student.advisor}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleOpenEditModal(student)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" 
                            title="แก้ไขข้อมูล"
                          >
                            <Pencil size={18}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(student.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" 
                            title="ลบ"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400 text-sm">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin text-[#3F51B5]" />
                        <span>กำลังโหลดข้อมูลนักศึกษา...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search size={28} className="text-slate-300" />
                        <span>ไม่พบข้อมูลนักศึกษาที่ตรงกับเงื่อนไข</span>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📥 Import Excel Modal (เฉพาะสำหรับแอดมิน) */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !importing && setIsImportModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      นำเข้าข้อมูลนักศึกษาจาก Excel
                    </h2>
                    <p className="text-xs text-slate-500">
                      เพิ่มหรืออัปเดตข้อมูลนักศึกษาและอาจารย์ที่ปรึกษาแบบชุด
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => !importing && setIsImportModalOpen(false)} 
                  disabled={importing}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleImportExcel} className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Template Download Box */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      ยังไม่มีแบบฟอร์มใช่หรือไม่?
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      ดาวน์โหลดเทมเพลต Excel ที่มีรายชื่อและรหัสย่ออาจารย์พร้อมตัวอย่างข้อมูล
                    </p>
                  </div>
                  <a 
                    href="http://localhost:5000/api/consult/template"
                    download="student_consultants_template.xlsx"
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Download size={14} /> ดาวน์โหลดแบบฟอร์ม
                  </a>
                </div>

                {/* Default Cohort / Academic Year */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    รหัสรุ่นเริ่มต้น (กรณีในไฟล์ Excel ไม่ได้ระบุคอลัมน์รหัส/ปีการศึกษา)
                  </label>
                  <select
                    value={defaultImportYear}
                    onChange={(e) => setDefaultImportYear(e.target.value)}
                    disabled={importing}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {cohortList.map(c => (
                      <option key={c} value={c}>รหัส {c} (ปีการศึกษา 25{c})</option>
                    ))}
                  </select>
                </div>

                {/* File Drag & Drop / Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    เลือกไฟล์ Excel (.xlsx, .xls)
                  </label>
                  <div 
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                      importFile 
                        ? 'border-emerald-400 bg-emerald-50/30' 
                        : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50'
                    }`}
                    onClick={() => document.getElementById('consultant-excel-file')?.click()}
                  >
                    <input 
                      id="consultant-excel-file"
                      type="file" 
                      accept=".xlsx, .xls"
                      disabled={importing}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImportFile(e.target.files[0]);
                          setImportResult(null);
                        }
                      }}
                      className="hidden"
                    />
                    {importFile ? (
                      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200 shadow-sm text-left">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileSpreadsheet size={20} />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold text-slate-800 truncate">{importFile.name}</p>
                            <p className="text-xs text-slate-400">{(importFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImportFile(null);
                            setImportResult(null);
                          }}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Upload size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-700">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                        <p className="text-xs text-slate-400">รองรับไฟล์รูปแบบ .xlsx, .xls สูงสุด 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Import Result Feedback */}
                {importResult && (
                  <div className={`p-4 rounded-2xl border text-sm ${
                    importResult.success 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    <div className="flex items-start gap-3">
                      {importResult.success ? (
                        <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                      ) : (
                        <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                      )}
                      <div className="space-y-1">
                        <p className="font-bold">{importResult.message || importResult.error}</p>
                        {importResult.success && (
                          <div className="flex gap-4 text-xs mt-2 text-emerald-700 font-semibold">
                            <span>ทั้งหมด: {importResult.total} คน</span>
                            <span>เพิ่มใหม่: {importResult.created} คน</span>
                            <span>อัปเดต: {importResult.updated} คน</span>
                          </div>
                        )}
                        {importResult.errors && importResult.errors.length > 0 && (
                          <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                            <p className="font-bold mb-1">ข้อความแจ้งเตือนบางแถว ({importResult.errors.length} รายการ):</p>
                            <ul className="list-disc pl-4 space-y-0.5 max-h-32 overflow-y-auto">
                              {importResult.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 📊 Progress Bar ขณะกำลังนำเข้าข้อมูล */}
                {importing && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-2.5 text-left"
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                      <span className="flex items-center gap-2">
                        <Loader2 size={15} className="animate-spin text-emerald-600" />
                        {importStatusText || "กำลังนำเข้าข้อมูล..."}
                      </span>
                      <span className="text-emerald-700 font-mono text-sm font-extrabold">{importProgress}%</span>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-emerald-100/70 rounded-full h-2.5 overflow-hidden p-0.5 border border-emerald-200/60 shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-full rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500">
                      ระบบกำลังอ่านข้อมูลจากไฟล์ Excel ตรวจสอบรายชื่อ และบันทึกข้อมูลอาจารย์ที่ปรึกษาลงฐานข้อมูล...
                    </p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t">
                  <button 
                    type="submit" 
                    disabled={importing || !importFile}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
                  >
                    {importing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        กำลังนำเข้าข้อมูล...
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        เริ่มนำเข้าข้อมูล
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsImportModalOpen(false)} 
                    disabled={importing}
                    className="px-5 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm cursor-pointer"
                  >
                    {importResult?.success ? "เสร็จสิ้น" : "ยกเลิก"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📤 Add Student Modal (เพิ่มรายบุคคล) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsAddModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <UserPlus className="text-[#3F51B5]" /> เพิ่มข้อมูลนักศึกษา
                </h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddStudent} className="p-8 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    รหัสนักศึกษา (13 หลัก) *
                  </label>
                  <input 
                    type="text" 
                    value={formData.student_id}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      let autoYear = formData.year;
                      if (val.length >= 2) {
                        autoYear = val.slice(0, 2);
                      }
                      setFormData({ ...formData, student_id: val, year: autoYear });
                    }}
                    placeholder="เช่น 6804062610011"
                    maxLength={13}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5] focus:ring-2 focus:ring-[#3F51B5]/20 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="เช่น นายสมชาย ใจดี"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5] focus:ring-2 focus:ring-[#3F51B5]/20"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    รหัสรุ่น (เช่น รหัส 68) *
                  </label>
                  <select 
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5] focus:ring-2 focus:ring-[#3F51B5]/20 font-semibold text-slate-700"
                  >
                    {cohortList.map(c => (
                      <option key={c} value={c}>รหัส {c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    อาจารย์ที่ปรึกษา (ระบุหรือไม่ระบุก็ได้)
                  </label>
                  <select 
                    value={formData.advisor_id}
                    onChange={(e) => setFormData({ ...formData, advisor_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5] focus:ring-2 focus:ring-[#3F51B5]/20"
                  >
                    <option value="">-- ยังไม่ระบุอาจารย์ที่ปรึกษา --</option>
                    {lecturers.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.fullname_th} {l.lecturer_code ? `(${l.lecturer_code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-[#3F51B5] text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    บันทึกข้อมูล
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)} 
                    className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✏️ Edit Student Modal (แก้ไขข้อมูลนักศึกษา) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => !editSubmitting && setIsEditModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Pencil className="text-amber-500" size={22} /> แก้ไขข้อมูลนักศึกษา
                </h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)} 
                  disabled={editSubmitting}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateStudent} className="p-8 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    รหัสนักศึกษา (13 หลัก) *
                  </label>
                  <input 
                    type="text" 
                    value={editFormData.student_id}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      let autoYear = editFormData.year;
                      if (val.length >= 2) {
                        autoYear = val.slice(0, 2);
                      }
                      setEditFormData({ ...editFormData, student_id: val, year: autoYear });
                    }}
                    placeholder="เช่น 6904062610010"
                    maxLength={13}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input 
                    type="text" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="เช่น นายคมนภัส สุริยวรรณ"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      รหัสรุ่น *
                    </label>
                    <select 
                      value={editFormData.year}
                      onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-semibold text-slate-700"
                    >
                      {cohortList.map(c => (
                        <option key={c} value={c}>รหัส {c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      ห้อง / ตอนเรียน
                    </label>
                    <input 
                      type="text" 
                      value={editFormData.room}
                      onChange={(e) => setEditFormData({ ...editFormData, room: e.target.value })}
                      placeholder="เช่น RA, RB หรือ -"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    อาจารย์ที่ปรึกษา
                  </label>
                  <select 
                    value={editFormData.advisor_id}
                    onChange={(e) => setEditFormData({ ...editFormData, advisor_id: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium text-slate-700"
                  >
                    <option value="">-- ยังไม่ระบุอาจารย์ที่ปรึกษา --</option>
                    {lecturers.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.fullname_th} {l.lecturer_code ? `(${l.lecturer_code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t mt-6">
                  <button 
                    type="submit" 
                    disabled={editSubmitting}
                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                  >
                    {editSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> บันทึกการแก้ไข
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsEditModalOpen(false)} 
                    disabled={editSubmitting}
                    className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm cursor-pointer disabled:opacity-50"
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