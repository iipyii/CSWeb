import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Edit3, Trash2, GraduationCap, 
  BookOpen, ExternalLink, X, Save, RefreshCw, Loader2,
  FileText, Upload, CheckCircle2, AlertCircle, Eye, Calendar, Layers
} from 'lucide-react';

const levelTabs = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'bachelor', label: 'ปริญญาตรี' },
  { id: 'master', label: 'ปริญญาโท' },
  { id: 'doctorate', label: 'ปริญญาเอก' },
];

const SECTION_DEFAULTS = [
  { no: 1, title: 'หมวดที่ 1 ข้อมูลทั่วไป' },
  { no: 2, title: 'หมวดที่ 2 ข้อมูลเฉพาะของหลักสูตร' },
  { no: 3, title: 'หมวดที่ 3 ระบบการจัดการศึกษา โครงสร้าง และรายวิชา' },
  { no: 4, title: 'หมวดที่ 4 ผลการเรียนรู้และกลยุทธ์การสอน' },
  { no: 5, title: 'หมวดที่ 5 หลักเกณฑ์ในการประเมินผล' },
  { no: 6, title: 'หมวดที่ 6 การพัฒนาคณาจารย์' },
  { no: 7, title: 'หมวดที่ 7 การประกันคุณภาพหลักสูตร' },
  { no: 8, title: 'หมวดที่ 8 การประเมินและปรับปรุงการดำเนินการ' },
  { no: 9, title: 'หมวดที่ 9 เอกสารแนบ / ภาคผนวก' },
];

const getPdfUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  let clean = path.replace(/\\/g, '/').trim();
  if (!clean.startsWith('/')) clean = '/' + clean;
  if (!clean.startsWith('/uploads/')) clean = '/uploads' + clean;
  clean = clean.replace(/^\/uploads\/uploads\//, '/uploads/');
  return `http://localhost:5000${clean}`;
};

export default function ManageCurriculum() {
  const [activeLevel, setActiveLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [degrees, setDegrees] = useState([]);

  // Program Modal State
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programForm, setProgramForm] = useState({
    name_th: '',
    slug: '',
    degreeId: 1,
    year: '2569'
  });
  const [submittingProgram, setSubmittingProgram] = useState(false);

  // Detail / Section Manager Modal State
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeVersionYear, setActiveVersionYear] = useState(null);
  const [newVersionYear, setNewVersionYear] = useState('');
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [uploadingSection, setUploadingSection] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const [progRes, degRes] = await Promise.all([
        axios.get("http://localhost:5000/api/curriculum/programs"),
        axios.get("http://localhost:5000/api/curriculum/degrees")
      ]);
      const fetchedPrograms = progRes.data || [];
      setPrograms(fetchedPrograms);
      setDegrees(degRes.data || []);

      if (selectedProgram) {
        const updatedSelected = fetchedPrograms.find(p => p.id === selectedProgram.id);
        if (updatedSelected) {
          setSelectedProgram(updatedSelected);
          if (!activeVersionYear && updatedSelected.versions?.length > 0) {
            setActiveVersionYear(updatedSelected.versions[0].year);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load curriculum:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const openProgramModal = (program = null) => {
    if (program) {
      setEditingProgram(program);
      setProgramForm({
        name_th: program.name_th || '',
        slug: program.slug || '',
        degreeId: program.degreeId || (degrees[0]?.id || 1),
        year: program.versions?.[0]?.year?.toString() || '2569'
      });
    } else {
      setEditingProgram(null);
      setProgramForm({
        name_th: '',
        slug: '',
        degreeId: degrees[0]?.id || 1,
        year: '2569'
      });
    }
    setIsProgramModalOpen(true);
  };

  const openSectionManager = (program) => {
    setSelectedProgram(program);
    if (program.versions && program.versions.length > 0) {
      setActiveVersionYear(program.versions[0].year);
    } else {
      setActiveVersionYear(null);
    }
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    if (!programForm.name_th.trim()) {
      alert("กรุณาระบุชื่อหลักสูตร");
      return;
    }

    try {
      setSubmittingProgram(true);
      if (editingProgram) {
        await axios.put(`http://localhost:5000/api/curriculum/programs/${editingProgram.id}`, {
          name_th: programForm.name_th,
          slug: programForm.slug,
          degreeId: programForm.degreeId
        }, getAuthHeaders());
        alert("แก้ไขข้อมูลหลักสูตรสำเร็จ");
      } else {
        await axios.post("http://localhost:5000/api/curriculum/programs", programForm, getAuthHeaders());
        alert("เพิ่มหลักสูตรสำเร็จ");
      }
      setIsProgramModalOpen(false);
      fetchCurriculum();
    } catch (error) {
      console.error("Save program error:", error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกหลักสูตร");
    } finally {
      setSubmittingProgram(false);
    }
  };

  const handleDeleteProgram = async (id) => {
    if (window.confirm("คุณต้องการลบหลักสูตรนี้และเวอร์ชันรวมถึงไฟล์ PDF ที่เกี่ยวข้องใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:5000/api/curriculum/programs/${id}`, getAuthHeaders());
        alert("ลบหลักสูตรสำเร็จ");
        if (selectedProgram?.id === id) {
          setSelectedProgram(null);
        }
        fetchCurriculum();
      } catch (error) {
        console.error("Failed to delete program:", error);
        alert("เกิดข้อผิดพลาดในการลบหลักสูตร");
      }
    }
  };

  // Version Management
  const handleAddVersion = async () => {
    if (!newVersionYear || isNaN(parseInt(newVersionYear))) {
      alert("กรุณาระบุปี พ.ศ. ให้ถูกต้อง เช่น 2574");
      return;
    }

    try {
      setIsAddingVersion(true);
      await axios.post("http://localhost:5000/api/curriculum/versions", {
        programId: selectedProgram.id,
        year: parseInt(newVersionYear)
      }, getAuthHeaders());
      alert(`เพิ่มเวอร์ชันปี ${newVersionYear} สำเร็จ`);
      setNewVersionYear('');
      await fetchCurriculum();
      setActiveVersionYear(parseInt(newVersionYear));
    } catch (error) {
      console.error("Add version error:", error);
      alert(error.response?.data?.error || "ไม่สามารถเพิ่มเวอร์ชันได้");
    } finally {
      setIsAddingVersion(false);
    }
  };

  const handleDeleteVersion = async (versionId, year) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบเวอร์ชันปี ${year} และเอกสารหมวดทั้งหมด?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/curriculum/versions/${versionId}`, getAuthHeaders());
        alert(`ลบเวอร์ชันปี ${year} สำเร็จ`);
        await fetchCurriculum();
      } catch (error) {
        console.error("Delete version error:", error);
        alert("ไม่สามารถลบเวอร์ชันได้");
      }
    }
  };

  // Section PDF Upload
  const handleUploadSectionPdf = async (sectionNo, file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert("กรุณาเลือกไฟล์เอกสาร PDF เท่านั้น");
      return;
    }

    const currentVersion = selectedProgram?.versions?.find(v => v.year === activeVersionYear);
    if (!currentVersion) {
      alert("ไม่พบข้อมูลเวอร์ชันปีที่เลือก");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("versionId", currentVersion.id);
    formData.append("section_no", sectionNo);
    const secDefault = SECTION_DEFAULTS.find(s => s.no === sectionNo);
    formData.append("title", secDefault ? secDefault.title : `หมวดที่ ${sectionNo}`);

    try {
      setUploadingSection(sectionNo);
      await axios.post("http://localhost:5000/api/curriculum/sections/upload", formData, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data"
        }
      });
      alert(`อัปโหลดไฟล์ PDF สำหรับหมวดที่ ${sectionNo} สำเร็จ`);
      await fetchCurriculum();
    } catch (error) {
      console.error("Upload section PDF error:", error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์ PDF");
    } finally {
      setUploadingSection(null);
    }
  };

  const handleDeleteSectionPdf = async (sectionId, sectionNo) => {
    if (window.confirm(`ต้องการลบไฟล์ PDF หมวดที่ ${sectionNo} ใช่หรือไม่?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/curriculum/sections/${sectionId}/pdf`, getAuthHeaders());
        alert(`ลบไฟล์ PDF หมวดที่ ${sectionNo} สำเร็จ`);
        await fetchCurriculum();
      } catch (error) {
        console.error("Delete PDF error:", error);
        alert("ไม่สามารถลบไฟล์ PDF ได้");
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

  const currentActiveVersion = selectedProgram?.versions?.find(v => v.year === activeVersionYear);

  return (
    <div className="space-y-8 pb-20 text-left">
      
      {/* 🚀 Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BookOpen className="text-[#3F51B5]" size={32} /> จัดการเล่มหลักสูตร มคอ.2
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            บริหารจัดการเวอร์ชันปีหลักสูตร และอัปโหลดไฟล์ PDF เอกสาร มคอ.2 (หมวด 1 - หมวด 9)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCurriculum}
            title="รีเฟรชข้อมูล"
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-[#3F51B5] transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => openProgramModal()}
            className="bg-[#3F51B5] text-white px-7 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#2D3B8E] transition-all shadow-xl shadow-indigo-100 active:scale-95 text-sm"
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
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative max-w-2xl text-left">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อหลักสูตร หรือ รหัสกำกับ (slug)..."
            className="w-full bg-slate-50 border-none rounded-[1.5rem] py-3.5 pl-16 pr-5 text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 📋 Curriculum List */}
      <div className="grid grid-cols-1 gap-5">
        {filteredData.length > 0 ? (
          filteredData.map((item) => {
            const versions = item.versions || [];
            return (
              <div key={item.id} className="bg-white p-6 md:p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 w-full">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#3F51B5] shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen size={26} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-black uppercase tracking-wider">{item.slug}</span>
                      <span className="text-[11px] font-bold text-[#3F51B5] bg-indigo-50/70 px-2 py-0.5 rounded-md">{item.degree?.name_th || 'หลักสูตร'}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{item.name_th}</h3>
                    
                    {/* Version badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-xs text-slate-400 font-medium">ปีหลักสูตร:</span>
                      {versions.length > 0 ? (
                        versions.map(v => {
                          const secCount = v.sections?.filter(s => s.pdf_path)?.length || 0;
                          return (
                            <span key={v.id} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200/60 flex items-center gap-1.5">
                              <Calendar size={12} className="text-[#3F51B5]" /> พ.ศ. {v.year}
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${secCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {secCount}/9 หมวด
                              </span>
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-amber-500 font-medium">ยังไม่มีเวอร์ชัน</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Bottom Bar */}
                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                  <button 
                    onClick={() => openSectionManager(item)}
                    className="flex-1 md:flex-none px-5 py-2.5 bg-[#3F51B5] text-white rounded-xl text-xs font-bold hover:bg-[#2D3B8E] transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
                  >
                    <Layers size={16} /> จัดการหมวด 1-9 & PDF
                  </button>
                  <button 
                    onClick={() => openProgramModal(item)}
                    className="p-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                    title="แก้ไขชื่อหลักสูตร"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProgram(item.id)}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                    title="ลบหลักสูตร"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-4 text-slate-200">
              <BookOpen size={48} />
            </div>
            <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">
              {loading ? "กำลังโหลดข้อมูลหลักสูตร..." : "ไม่พบข้อมูลหลักสูตร"}
            </h3>
          </div>
        )}
      </div>

      {/* 📂 Modal: จัดการหมวด 1-9 & ไฟล์ PDF ของแต่ละปี */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-4xl w-full shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-indigo-50 text-[#3F51B5] rounded-md text-xs font-bold uppercase">
                    {selectedProgram.degree?.name_th}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">({selectedProgram.slug})</span>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mt-1">
                  จัดการเล่มหลักสูตร: {selectedProgram.name_th}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedProgram(null)} 
                className="p-2 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Version Tabs & Add Version Bar */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-1">เลือกปีหลักสูตร:</span>
                {selectedProgram.versions?.map((v) => (
                  <div key={v.id} className="flex items-center">
                    <button
                      onClick={() => setActiveVersionYear(v.year)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeVersionYear === v.year
                          ? 'bg-[#3F51B5] text-white shadow-md'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Calendar size={14} />
                      พ.ศ. {v.year}
                    </button>
                    {activeVersionYear === v.year && selectedProgram.versions.length > 1 && (
                      <button
                        onClick={() => handleDeleteVersion(v.id, v.year)}
                        title={`ลบเวอร์ชัน ${v.year}`}
                        className="ml-1 p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Version input */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="เช่น 2574"
                  value={newVersionYear}
                  onChange={(e) => setNewVersionYear(e.target.value)}
                  className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5]"
                />
                <button
                  onClick={handleAddVersion}
                  disabled={isAddingVersion}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center gap-1 disabled:opacity-50 shrink-0"
                >
                  {isAddingVersion ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  เพิ่มปีใหม่
                </button>
              </div>
            </div>

            {/* Sections 1 - 9 Grid */}
            {currentActiveVersion ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={18} className="text-[#3F51B5]" /> รายการหมวด มคอ.2 ประจำปี พ.ศ. {activeVersionYear}
                  </h3>
                  <span className="text-xs text-slate-400">
                    อัปโหลดไฟล์ PDF แยกตามแต่ละหมวด
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {SECTION_DEFAULTS.map((sec) => {
                    const existingSec = currentActiveVersion.sections?.find(s => s.section_no === sec.no);
                    const hasPdf = !!existingSec?.pdf_path;
                    const isUploading = uploadingSection === sec.no;

                    return (
                      <div 
                        key={sec.no}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                          hasPdf 
                            ? 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-200' 
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${hasPdf ? 'bg-indigo-100 text-[#3F51B5]' : 'bg-slate-100 text-slate-400'}`}>
                              <FileText size={18} />
                            </div>
                            <div>
                              <span className="text-[11px] font-black text-[#3F51B5] uppercase">หมวดที่ {sec.no}</span>
                              <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">{sec.title}</h4>
                            </div>
                          </div>
                          <div>
                            {hasPdf ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                <CheckCircle2 size={12} /> มีไฟล์ PDF
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                <AlertCircle size={12} /> ยังไม่มีไฟล์
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Actions for each Section */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                          {hasPdf ? (
                            <a
                              href={getPdfUrl(existingSec.pdf_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-[#3F51B5] hover:underline flex items-center gap-1"
                            >
                              <Eye size={14} /> ดูไฟล์ PDF
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">เลือกไฟล์ PDF เพื่ออัปโหลด</span>
                          )}

                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3F51B5] text-slate-700 text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:text-[#3F51B5]">
                              {isUploading ? (
                                <Loader2 size={13} className="animate-spin text-[#3F51B5]" />
                              ) : (
                                <Upload size={13} />
                              )}
                              <span>{hasPdf ? "เปลี่ยนไฟล์" : "อัปโหลด PDF"}</span>
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleUploadSectionPdf(sec.no, e.target.files[0]);
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </label>

                            {hasPdf && existingSec && (
                              <button
                                onClick={() => handleDeleteSectionPdf(existingSec.id, sec.no)}
                                title="ลบไฟล์ PDF"
                                className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <p className="text-sm font-bold text-slate-400">กรุณาเพิ่มเวอร์ชันปีหลักสูตรเพื่อจัดการหมวด มคอ.2</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 Modal เพิ่ม/แก้ไขข้อมูลหลักสูตร */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {editingProgram ? "แก้ไขข้อมูลหลักสูตร" : "เพิ่มหลักสูตรใหม่"}
              </h2>
              <button onClick={() => setIsProgramModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ชื่อหลักสูตร (ภาษาไทย)</label>
                <input 
                  type="text" 
                  value={programForm.name_th}
                  onChange={(e) => setProgramForm({ ...programForm, name_th: e.target.value })}
                  placeholder="เช่น วิทยาการคอมพิวเตอร์ ภาคปกติ"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Slug / รหัสกำกับ</label>
                <input 
                  type="text" 
                  value={programForm.slug}
                  onChange={(e) => setProgramForm({ ...programForm, slug: e.target.value })}
                  placeholder="เช่น cs-regular"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">ระดับการศึกษา</label>
                <select 
                  value={programForm.degreeId}
                  onChange={(e) => setProgramForm({ ...programForm, degreeId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5] cursor-pointer"
                >
                  {degrees.map(d => (
                    <option key={d.id} value={d.id}>{d.name_th}</option>
                  ))}
                </select>
              </div>

              {!editingProgram && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">ปีหลักสูตรเริ่มต้น (พ.ศ.)</label>
                  <input 
                    type="number" 
                    value={programForm.year}
                    onChange={(e) => setProgramForm({ ...programForm, year: e.target.value })}
                    placeholder="2569"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={submittingProgram}
                  className="px-6 py-2.5 bg-[#3F51B5] text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submittingProgram ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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