import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Search, Plus, Edit2, Trash2, FolderGit2, 
  Save, X, Calendar, Users, GraduationCap, RefreshCw, Loader2,
  FileSpreadsheet, Download, UploadCloud, CheckCircle2, AlertCircle,
  FileText
} from 'lucide-react';

export default function ManageProjects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // State for Excel Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStatusText, setImportStatusText] = useState("");
  const fileInputRef = useRef(null);

  const years = ["2569", "2568", "2567", "2566", "2565"];
  const [projects, setProjects] = useState([]);
  const [lecturers, setLecturers] = useState([]);

  // Helper: แยกข้อความนักศึกษาเป็น Array ของ { id, name }
  const parseStudentsToList = (text, studentObj = null) => {
    if (text) {
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        return lines.map(line => {
          // ตรงกับรูปแบบ "ชื่อ นามสกุล (รหัส)"
          const match = line.match(/^(.*?)\s*\((\d{10,13})\)$/);
          if (match) {
            return { name: match[1].trim(), id: match[2].trim() };
          }
          // ตรงกับรูปแบบ "(รหัส) ชื่อ นามสกุล"
          const match2 = line.match(/^\((\d{10,13})\)\s*(.*)$/);
          if (match2) {
            return { id: match2[1].trim(), name: match2[2].trim() };
          }
          // ตรงกับรูปแบบ "รหัส ชื่อ นามสกุล"
          const match3 = line.match(/^(\d{10,13})\s+(.*)$/);
          if (match3) {
            return { id: match3[1].trim(), name: match3[2].trim() };
          }
          return { name: line.trim(), id: "" };
        });
      }
    }
    if (studentObj) {
      return [
        {
          id: studentObj.student_id || "",
          name: `${studentObj.firstname || ''} ${studentObj.lastname || ''}`.trim()
        }
      ];
    }
    return [
      { id: "", name: "" },
      { id: "", name: "" }
    ];
  };

  const [formData, setFormData] = useState({
    titleTh: "", 
    titleEn: "", 
    year: "2568",
    semester: "1",
    studentsList: [
      { id: "", name: "" },
      { id: "", name: "" }
    ],
    advisorId: "",
    coAdvisorId: "",
    abstract: ""
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/projects");
      setProjects(res.data || []);
    } catch (error) {
      console.error("Failed to load projects:", error);
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
    fetchProjects();
    fetchLecturers();
  }, []);

  const openModal = (project = null) => {
    setModalError("");
    if (project) {
      setEditingProject(project);
      
      const parsedList = parseStudentsToList(project.students_text, project.student);
      while (parsedList.length < 2) {
        parsedList.push({ id: "", name: "" });
      }

      setFormData({ 
        titleTh: project.title_th || "", 
        titleEn: project.title_en || "", 
        year: project.year ? project.year.toString() : "2568",
        semester: project.semester ? project.semester.toString() : "1",
        studentsList: parsedList,
        advisorId: project.advisor_id ? project.advisor_id.toString() : (project.advisor?.id ? project.advisor.id.toString() : ""),
        coAdvisorId: project.co_advisor_id ? project.co_advisor_id.toString() : (project.co_advisor?.id ? project.co_advisor.id.toString() : ""),
        abstract: project.abstract || ""
      });
    } else {
      setEditingProject(null);
      setFormData({ 
        titleTh: "", 
        titleEn: "", 
        year: "2568",
        semester: "1",
        studentsList: [
          { id: "", name: "" },
          { id: "", name: "" }
        ],
        advisorId: "",
        coAdvisorId: "",
        abstract: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleStudentChange = (index, field, value) => {
    setModalError("");
    const updated = [...formData.studentsList];
    let val = value;
    if (field === "id") {
      // Allow numbers only, max 13 digits
      val = value.replace(/\D/g, '').slice(0, 13);
    }
    updated[index] = { ...updated[index], [field]: val };
    setFormData({ ...formData, studentsList: updated });
  };

  const handleAddStudent = () => {
    if (formData.studentsList.length >= 4) {
      alert("สามารถเพิ่มนักศึกษาได้สูงสุด 4 คน");
      return;
    }
    setFormData({
      ...formData,
      studentsList: [...formData.studentsList, { id: "", name: "" }]
    });
  };

  const handleRemoveStudent = (index) => {
    if (formData.studentsList.length <= 1) {
      setFormData({
        ...formData,
        studentsList: [{ id: "", name: "" }]
      });
      return;
    }
    const updated = formData.studentsList.filter((_, i) => i !== index);
    setFormData({ ...formData, studentsList: updated });
  };

  const handleDelete = async (id) => {
    if (window.confirm("คุณต้องการลบโครงงานนี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}`);
        alert("ลบโครงงานสำเร็จ");
        fetchProjects();
      } catch (error) {
        console.error("Delete error:", error);
        alert("เกิดข้อผิดพลาดในการลบโครงงาน");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!formData.titleTh || !formData.titleTh.trim()) {
      setModalError("กรุณาระบุชื่อโครงงานภาษาไทย");
      return;
    }

    // Filter rows that have at least one field filled
    const filledStudents = formData.studentsList
      .map((s, originalIndex) => ({
        id: (s.id || "").trim(),
        name: (s.name || "").trim(),
        originalIndex
      }))
      .filter(s => s.id !== "" || s.name !== "");

    // TC-PRJ-14: No students filled
    if (filledStudents.length === 0) {
      setModalError("กรุณาระบุข้อมูลนักศึกษาผู้จัดทำโครงงานอย่างน้อย 1 คน (พร้อมรหัสนักศึกษา 13 หลัก และชื่อ-นามสกุล)");
      return;
    }

    const seenIds = new Set();
    const seenNames = new Set();

    for (let i = 0; i < filledStudents.length; i++) {
      const s = filledStudents[i];
      const rowNum = i + 1;

      // TC-PRJ-14: Empty ID
      if (!s.id) {
        setModalError(`กรุณาระบุรหัสนักศึกษาให้ครบถ้วน (นักศึกษาคนที่ ${rowNum})`);
        return;
      }

      // TC-PRJ-12, TC-PRJ-13: Validate 13 digits numeric
      if (!/^\d{13}$/.test(s.id)) {
        setModalError(`รหัสนักศึกษาต้องเป็นตัวเลข 13 หลักเท่านั้น (นักศึกษาคนที่ ${rowNum} พบ '${s.id}' ซึ่งมี ${s.id.length} หลัก)`);
        return;
      }

      // Empty Name
      if (!s.name) {
        setModalError(`กรุณาระบุชื่อ-นามสกุลนักศึกษาให้ครบถ้วน (นักศึกษาคนที่ ${rowNum})`);
        return;
      }

      // TC-PRJ-15: Duplicate ID in same project
      if (seenIds.has(s.id)) {
        setModalError(`พบรหัสนักศึกษาซ้ำกันในโครงงานเดียวกัน: ${s.id}`);
        return;
      }
      seenIds.add(s.id);

      // TC-PRJ-16: Duplicate Name in same project
      const normalizedName = s.name.replace(/\s+/g, ' ').toLowerCase();
      if (seenNames.has(normalizedName)) {
        setModalError(`พบชื่อนักศึกษาซ้ำกันในโครงงานเดียวกัน: ${s.name}`);
        return;
      }
      seenNames.add(normalizedName);
    }

    // TC-PRJ-17: Check duplicate in same semester across existing projects
    const targetYear = formData.year ? parseInt(formData.year) : null;
    const targetSemester = formData.semester ? parseInt(formData.semester) : 1;

    if (targetYear) {
      const conflictProjects = projects.filter(p => 
        p.year === targetYear && 
        p.semester === targetSemester && 
        (!editingProject || p.id !== editingProject.id)
      );

      for (const st of filledStudents) {
        for (const proj of conflictProjects) {
          let isMatch = false;
          if (proj.student && proj.student.student_id === st.id) {
            isMatch = true;
          }
          if (!isMatch && proj.students_text && proj.students_text.includes(st.id)) {
            isMatch = true;
          }

          if (isMatch) {
            setModalError(`นักศึกษารหัส ${st.id} (${st.name}) มีโครงงานในภาคเรียนที่ ${targetSemester}/${targetYear} อยู่แล้ว (โครงงาน: "${proj.title_th}")`);
            return;
          }
        }
      }
    }

    try {
      setSubmitting(true);
      const validStudents = filledStudents.map(s => ({ id: s.id, name: s.name }));
      const studentsText = validStudents.map(s => {
        const id = s.id;
        const name = s.name;
        if (id && name) return `${name} (${id})`;
        return name || id;
      }).join("\n");

      const payload = {
        title_th: formData.titleTh.trim(),
        title_en: formData.titleEn.trim(),
        year: targetYear,
        semester: targetSemester,
        studentsList: validStudents,
        students_text: studentsText,
        advisor_id: formData.advisorId ? parseInt(formData.advisorId) : null,
        co_advisor_id: formData.coAdvisorId ? parseInt(formData.coAdvisorId) : null,
        abstract: formData.abstract
      };

      if (editingProject) {
        await axios.put(`http://localhost:5000/api/projects/${editingProject.id}`, payload);
        alert("แก้ไขโครงงานสำเร็จ");
      } else {
        await axios.post("http://localhost:5000/api/projects", payload);
        alert("เพิ่มโครงงานสำเร็จ");
      }

      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Save error:", error);
      const errMsg = error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกโครงงาน";
      setModalError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Excel Import Handlers ---
  const handleOpenImportModal = () => {
    setImportFile(null);
    setImportResult(null);
    setImportError("");
    setUploadProgress(0);
    setImportStatusText("");
    setIsImportModalOpen(true);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    if (!isValid) {
      setImportError("กรุณาเลือกไฟล์ Excel นามสกุล .xlsx หรือ .xls เท่านั้น");
      setImportFile(null);
      return;
    }
    setImportError("");
    setImportResult(null);
    setImportFile(file);
  };

  const handleUploadExcel = async () => {
    if (!importFile) {
      setImportError("กรุณาเลือกไฟล์ Excel ก่อนกดยืนยัน");
      return;
    }

    try {
      setImporting(true);
      setImportError("");
      setImportResult(null);
      setUploadProgress(15);
      setImportStatusText("กำลังอัปโหลดไฟล์ Excel ขึ้นสู่เซิร์ฟเวอร์...");

      const formDataUpload = new FormData();
      formDataUpload.append("file", importFile);

      const res = await axios.post("http://localhost:5000/api/projects/import-excel", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            if (percentCompleted >= 100) {
              setImportStatusText("อัปโหลดสำเร็จ กำลังอ่าน Sheet และประมวลผลข้อมูลในฐานข้อมูล...");
            } else {
              setImportStatusText(`กำลังอัปโหลดไฟล์ (${percentCompleted}%)...`);
            }
          }
        }
      });

      setUploadProgress(100);
      setImportStatusText("นำเข้าข้อมูลสำเร็จ!");
      setImportResult(res.data);
      fetchProjects();
    } catch (error) {
      console.error("Excel import error:", error);
      setImportError(error.response?.data?.error || "เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open("http://localhost:5000/api/projects/template", "_blank");
  };

  // Filtered Projects
  const filteredProjects = projects.filter(project => {
    const titleTh = project.title_th || "";
    const titleEn = project.title_en || "";
    const stuText = project.students_text || "";
    const stuName = project.student ? `${project.student.firstname} ${project.student.lastname || ''}` : "";
    const stuId = project.student?.student_id || "";
    const advName = project.advisor?.fullname_th || "";
    const advCode = project.advisor?.lecturer_code || "";
    const coAdvName = project.co_advisor?.fullname_th || "";

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      titleTh.toLowerCase().includes(searchLower) ||
      titleEn.toLowerCase().includes(searchLower) ||
      stuText.toLowerCase().includes(searchLower) ||
      stuName.toLowerCase().includes(searchLower) ||
      stuId.includes(searchLower) ||
      advName.toLowerCase().includes(searchLower) ||
      advCode.toLowerCase().includes(searchLower) ||
      coAdvName.toLowerCase().includes(searchLower);

    const matchesYear = selectedYear === "" || (project.year && project.year.toString() === selectedYear);
    const matchesSemester = selectedSemester === "" || (project.semester && project.semester.toString() === selectedSemester);

    return matchesSearch && matchesYear && matchesSemester;
  });

  return (
    <div className="space-y-6 text-left pb-10">
      {/* 🚀 Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderGit2 className="text-[#3F51B5]" /> จัดการโครงงานนักศึกษา
          </h1>
          <p className="text-slate-500 text-sm">จัดการรายละเอียดโครงงาน รายชื่อผู้จัดทำ ที่ปรึกษา และนำเข้าจาก Excel</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchProjects}
            title="รีเฟรช"
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#3F51B5] transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          
          {/* 📊 ปุ่มนำเข้าไฟล์ Excel */}
          <button 
            onClick={handleOpenImportModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all text-sm"
          >
            <FileSpreadsheet size={18} /> นำเข้าไฟล์ Excel
          </button>

          {/* ➕ ปุ่มเพิ่มโครงงานใหม่ */}
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-[#3F51B5] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm"
          >
            <Plus size={18} /> เพิ่มโครงงานใหม่
          </button>
        </div>
      </header>

      {/* 🔍 Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อโครงงาน, ชื่อนักศึกษา, หรืออาจารย์ที่ปรึกษา..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* ตัวกรองปีการศึกษา */}
          <select 
            className="bg-slate-50 border-none rounded-xl text-sm p-2 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-medium text-slate-600"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">ทุกปีการศึกษา</option>
            {years.map(year => <option key={year} value={year}>{`ปีการศึกษา ${year}`}</option>)}
          </select>

          {/* ตัวกรองภาคเรียน */}
          <select 
            className="bg-slate-50 border-none rounded-xl text-sm p-2 outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-medium text-slate-600"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="">ทุกภาคเรียน</option>
            <option value="1">ภาคเรียนที่ 1</option>
            <option value="2">ภาคเรียนที่ 2</option>
            <option value="3">ภาคฤดูร้อน</option>
          </select>

          <div className="hidden lg:flex items-center px-3 py-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 whitespace-nowrap">
            {filteredProjects.length} รายการ
          </div>
        </div>
      </div>

      {/* 📋 Project Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">ภาค/ปีการศึกษา</th>
                <th className="px-6 py-4">ชื่อโครงงาน</th>
                <th className="px-6 py-4">ผู้จัดทำ (นักศึกษา)</th>
                <th className="px-6 py-4">อาจารย์ที่ปรึกษา</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* ภาค / ปี */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-[#3F51B5] text-xs font-bold rounded-lg border border-indigo-100">
                        {project.semester ? `${project.semester}/` : ''}{project.year || '-'}
                      </span>
                    </td>

                    {/* ชื่อโครงงาน */}
                    <td className="px-6 py-4 max-w-md">
                      <div className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">
                        {project.title_th}
                      </div>
                      {project.title_en && (
                        <div className="text-[11px] text-slate-400 italic line-clamp-1 mt-0.5">
                          {project.title_en}
                        </div>
                      )}
                    </td>

                    {/* นักศึกษา */}
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {project.students_text ? (
                        <div className="space-y-1">
                          {project.students_text.split("\n").map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5 font-medium text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                              <span>{s}</span>
                            </div>
                          ))}
                        </div>
                      ) : project.student ? (
                        <div className="font-medium text-slate-700">
                          {project.student.firstname} {project.student.lastname} 
                          <span className="text-slate-400 text-[11px] block">{project.student.student_id}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">ไม่ระบุ</span>
                      )}
                    </td>

                    {/* อาจารย์ที่ปรึกษา */}
                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-1">
                        {project.advisor ? (
                          <div className="font-bold text-[#3F51B5] flex items-center gap-1.5">
                            <span>{project.advisor.fullname_th}</span>
                            {project.advisor.lecturer_code && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-semibold">
                                {project.advisor.lecturer_code}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">ไม่ระบุ</span>
                        )}

                        {project.co_advisor && (
                          <div className="text-slate-500 flex items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold">(ร่วม)</span>
                            <span>{project.co_advisor.fullname_th}</span>
                            {project.co_advisor.lecturer_code && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-mono">
                                {project.co_advisor.lecturer_code}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ปุ่มจัดการ */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => openModal(project)} 
                          className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" 
                          title="แก้ไข"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(project.id)} 
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" 
                          title="ลบ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-slate-400 text-sm">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-[#3F51B5]" size={20} /> กำลังโหลดข้อมูลโครงงาน...
                      </div>
                    ) : (
                      <div>ไม่พบข้อมูลโครงงานตามเงื่อนไขที่เลือก</div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📥 Excel Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsImportModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center bg-emerald-50/50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="text-emerald-600" size={22} />
                  นำเข้าโครงงานนักศึกษาจากไฟล์ Excel
                </h2>
                <button 
                  onClick={() => setIsImportModalOpen(false)} 
                  className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                {/* คำแนะนำและฟอร์แมต */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <FileText size={16} className="text-emerald-600" /> รูปแบบไฟล์ที่รองรับ
                    </h3>
                    <button 
                      onClick={handleDownloadTemplate}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Download size={14} /> ดาวน์โหลดไฟล์ตัวอย่าง (.xlsx)
                    </button>
                  </div>
                  <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
                    <li>รองรับไฟล์ <span className="font-semibold text-slate-700">.xlsx</span> หรือ <span className="font-semibold text-slate-700">.xls</span></li>
                    <li>สามารถมีหลาย Sheet แยกตามเทอม เช่น <span className="font-mono bg-slate-200/80 px-1 py-0.5 rounded text-slate-700">1-2566</span>, <span className="font-mono bg-slate-200/80 px-1 py-0.5 rounded text-slate-700">2-2566</span>, <span className="font-mono bg-slate-200/80 px-1 py-0.5 rounded text-slate-700">1-2567</span> ระบบจะอ่านทุก Sheet ให้อัตโนมัติ</li>
                    <li>คอลัมน์มาตรฐาน: <span className="font-semibold text-slate-700">ลำดับ, ชื่อหัวข้อ, รหัสนักศึกษา, ชื่อ-นามสกุล, ที่ปรึกษาหลัก, ที่ปรึกษาร่วม</span> (รองรับนักศึกษา 1-3 คน ทั้งแบบแยกแถว ผสานเซลล์ หรืออยู่ในเซลล์เดียว)</li>
                    <li>ระบบตรวจจับรหัสย่ออาจารย์ เช่น <span className="font-mono bg-slate-200/80 px-1 py-0.5 rounded text-slate-700">SWK</span>, <span className="font-mono bg-slate-200/80 px-1 py-0.5 rounded text-slate-700">SRS</span>, <span className="font-mono bg-slate-200/80 px-1 py-0.5 rounded text-slate-700">NJR</span> ให้โดยอัตโนมัติ</li>
                  </ul>
                </div>

                {/* Dropzone */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]' 
                      : importFile 
                        ? 'border-emerald-400 bg-emerald-50/20' 
                        : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/60'
                  }`}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                    onChange={handleFileSelect}
                  />

                  {importFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <FileSpreadsheet size={28} />
                      </div>
                      <div className="font-bold text-slate-800 text-sm">{importFile.name}</div>
                      <div className="text-xs text-slate-400">{(importFile.size / 1024).toFixed(1)} KB</div>
                      <span className="text-xs text-emerald-600 font-bold underline mt-1">คลิกเพื่อเปลี่ยนไฟล์</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-1">
                        <UploadCloud size={28} />
                      </div>
                      <div className="font-bold text-slate-700 text-sm">ลากไฟล์ Excel มาวางที่นี่ หรือ <span className="text-emerald-600 underline">คลิกเพื่อเลือกไฟล์</span></div>
                      <div className="text-xs text-slate-400">รองรับไฟล์ .xlsx หรือ .xls (ขนาดไม่เกิน 10MB)</div>
                    </div>
                  )}
                </div>

                {/* 📊 Upload & Processing Progress Bar */}
                {importing && (
                  <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-800 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-emerald-600 shrink-0" />
                        <span>{importStatusText || "กำลังประมวลผล..."}</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                        {uploadProgress}%
                      </span>
                    </div>

                    {/* Outer track */}
                    <div className="w-full h-3 bg-emerald-100/80 rounded-full overflow-hidden p-0.5 border border-emerald-200/60 shadow-inner">
                      {/* Inner bar */}
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300 ease-out relative"
                        style={{ width: `${Math.max(5, uploadProgress)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-emerald-600/80">
                      <span>กรุณาอย่าเพิ่งปิดหน้าต่าง ระบบกำลังอ่านและเชื่อมโยงข้อมูล</span>
                      <span>{uploadProgress < 100 ? "Uploading..." : "Processing DB..."}</span>
                    </div>
                  </div>
                )}

                {/* Error Alert */}
                {importError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Success Result */}
                {importResult && (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                      <CheckCircle2 size={18} />
                      <span>{importResult.message}</span>
                    </div>
                    {importResult.sheets && importResult.sheets.length > 0 && (
                      <div className="text-xs text-emerald-800 space-y-1 pt-1 border-t border-emerald-200/60">
                        <div className="font-semibold">รายละเอียดที่นำเข้า:</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                          {importResult.sheets.map((sh, idx) => (
                            <div key={idx} className="bg-white/80 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                              <span className="font-bold">Sheet {sh.sheetName}:</span> {sh.count} รายการ
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t bg-slate-50/50 flex gap-3">
                <button 
                  type="button" 
                  onClick={handleUploadExcel}
                  disabled={!importFile || importing}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {importing ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                  {importing ? "กำลังนำเข้าข้อมูล..." : "เริ่มนำเข้าข้อมูล"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsImportModalOpen(false)} 
                  className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all text-sm"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✏️ Create / Edit Modal */}
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

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
                {/* ⚠️ Modal Error Alert */}
                {modalError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2.5 font-medium shadow-sm">
                    <AlertCircle size={18} className="shrink-0 text-rose-500 mt-0.5" />
                    <div className="flex-1 leading-relaxed">{modalError}</div>
                    <button 
                      type="button" 
                      onClick={() => setModalError("")} 
                      className="text-rose-400 hover:text-rose-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* ปีการศึกษา & ภาคการศึกษา */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 text-[#3F51B5] mb-2">
                      <Calendar size={16}/>
                      <span className="text-xs font-bold uppercase tracking-wider">ปีการศึกษาที่จัดทำ</span>
                    </div>
                    <select 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-medium" 
                      value={formData.year} 
                      onChange={(e)=>setFormData({...formData, year: e.target.value})}
                    >
                      {years.map(y => <option key={y} value={y}>{`ปีการศึกษา ${y}`}</option>)}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-[#3F51B5] mb-2">
                      <GraduationCap size={16}/>
                      <span className="text-xs font-bold uppercase tracking-wider">ภาคการศึกษา (Semester)</span>
                    </div>
                    <select 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-medium" 
                      value={formData.semester} 
                      onChange={(e)=>setFormData({...formData, semester: e.target.value})}
                    >
                      <option value="1">ภาคเรียนที่ 1</option>
                      <option value="2">ภาคเรียนที่ 2</option>
                      <option value="3">ภาคฤดูร้อน</option>
                    </select>
                  </div>
                </div>

                {/* 👥 รายชื่อนักศึกษาผู้จัดทำ (แยกรหัสนักศึกษา และ ชื่อ-นามสกุล) */}
                <div className="space-y-4 p-6 border border-slate-100 rounded-3xl bg-slate-50/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#3F51B5]">
                      <Users size={18}/>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block">นักศึกษาผู้จัดทำโครงงาน</span>
                        <span className="text-[11px] text-slate-400 font-normal">แยกรหัสประจำตัว 13 หลัก และ ชื่อ-นามสกุล (รองรับ 1-4 คน)</span>
                      </div>
                    </div>
                    {formData.studentsList.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddStudent}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3F51B5] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <Plus size={14} /> เพิ่มนักศึกษา
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {formData.studentsList.map((stu, index) => {
                      const idLen = (stu.id || "").length;
                      const is13 = idLen === 13;
                      const hasInput = idLen > 0;

                      return (
                        <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                          </div>

                          {/* รหัสนักศึกษา */}
                          <div className="w-full sm:w-52 shrink-0">
                            <div className="flex items-center justify-between mb-0.5 ml-1">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">รหัสนักศึกษา</span>
                              <span className={`text-[10px] font-mono font-bold ${
                                is13 ? "text-emerald-600" : hasInput ? "text-amber-600" : "text-slate-400"
                              }`}>
                                {is13 ? "✓ 13 หลัก" : hasInput ? `(${idLen}/13)` : "(13 หลัก)"}
                              </span>
                            </div>
                            <input 
                              type="text" 
                              placeholder="เช่น 6504062630103"
                              value={stu.id || ""}
                              maxLength={13}
                              onChange={(e) => handleStudentChange(index, "id", e.target.value)}
                              className={`w-full p-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-xs font-mono font-medium text-slate-800 transition-colors ${
                                is13 
                                  ? "border-emerald-300 focus:border-emerald-500" 
                                  : hasInput 
                                    ? "border-amber-300 focus:border-amber-500" 
                                    : "border-slate-200"
                              }`}
                            />
                          </div>

                          {/* ชื่อ-นามสกุล */}
                          <div className="flex-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5 ml-1">ชื่อ-นามสกุล (พร้อมคำนำหน้า)</div>
                            <input 
                              type="text" 
                              placeholder="เช่น นายณัชพล ทองน่วม"
                              value={stu.name || ""}
                              onChange={(e) => handleStudentChange(index, "name", e.target.value)}
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-xs font-medium text-slate-800"
                            />
                          </div>

                          {/* ปุ่มลบ */}
                          <div className="sm:self-end pb-0.5 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveStudent(index)}
                              disabled={formData.studentsList.length <= 1}
                              className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="ลบนักศึกษาคนนี้"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* อาจารย์ที่ปรึกษา (หลัก และ ร่วม) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border border-slate-100 rounded-3xl">
                  <div>
                    <label className="text-xs font-bold text-[#3F51B5] uppercase tracking-wider block mb-2">
                      อาจารย์ที่ปรึกษาหลัก
                    </label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-medium"
                      value={formData.advisorId}
                      onChange={(e) => setFormData({ ...formData, advisorId: e.target.value })}
                    >
                      <option value="">-- เลือกอาจารย์ที่ปรึกษาหลัก --</option>
                      {lecturers.map(lec => (
                        <option key={lec.id} value={lec.id}>
                          {lec.fullname_th} {lec.lecturer_code ? `(${lec.lecturer_code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      อาจารย์ที่ปรึกษาร่วม (ถ้ามี)
                    </label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-medium"
                      value={formData.coAdvisorId}
                      onChange={(e) => setFormData({ ...formData, coAdvisorId: e.target.value })}
                    >
                      <option value="">-- ไม่มีอาจารย์ที่ปรึกษาร่วม --</option>
                      {lecturers.map(lec => (
                        <option key={lec.id} value={lec.id}>
                          {lec.fullname_th} {lec.lecturer_code ? `(${lec.lecturer_code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ชื่อโครงงานและบทคัดย่อ */}
                <div className="space-y-4 p-6 border border-slate-100 rounded-3xl bg-indigo-50/20">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#3F51B5] uppercase tracking-widest">ชื่อโครงงาน (ภาษาไทย) *</label>
                    <textarea rows={2} className="w-full p-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 font-bold text-sm" value={formData.titleTh} onChange={(e)=>setFormData({...formData, titleTh: e.target.value})} required/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#3F51B5] uppercase tracking-widest">Project Title (English)</label>
                    <textarea rows={2} className="w-full p-3 bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 italic text-sm" value={formData.titleEn} onChange={(e)=>setFormData({...formData, titleEn: e.target.value})}/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#3F51B5] uppercase tracking-widest">บทคัดย่อ (Abstract)</label>
                    <textarea rows={5} className="w-full p-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm leading-relaxed" value={formData.abstract} onChange={(e)=>setFormData({...formData, abstract: e.target.value})}/>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2 border-t border-slate-50">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 py-4 bg-[#3F51B5] text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={20}/>} 
                    บันทึกข้อมูลโครงงาน
                  </button>
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