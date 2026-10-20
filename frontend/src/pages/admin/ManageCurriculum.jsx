import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Edit3, Trash2, GraduationCap, 
  BookOpen, ExternalLink, X, Save, RefreshCw, Loader2,
  FileText, Upload, CheckCircle2, AlertCircle, Eye, Calendar, Layers, Sparkles, Star, Image as ImageIcon
} from 'lucide-react';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

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
  return `${clean}`;
};

export default function ManageCurriculum() {
  const [activeLevel, setActiveLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [degrees, setDegrees] = useState([]);

  // Universal Delete Confirm Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    title: 'ยืนยันการลบข้อมูล',
    itemName: '',
    description: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลจะถูกลบออกจากระบบอย่างถาวร',
    confirmWord: 'delete',
    onConfirm: null,
    isLoading: false
  });

  const closeDeleteModal = () => {
    setDeleteModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
  };

  // Program Modal State
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [uploadingProgramImage, setUploadingProgramImage] = useState(false);
  const [programForm, setProgramForm] = useState({
    name_th: '',
    name_en: '',
    slug: '',
    degreeId: 1,
    year: '2569',
    curriculum_code: '',
    image_path: '',
    is_featured: true,
    date_tag: '',
    order_no: 0
  });
  const [submittingProgram, setSubmittingProgram] = useState(false);

  // Detail / Section Manager Modal State
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [activeVersionYear, setActiveVersionYear] = useState(null);
  const [newVersionYear, setNewVersionYear] = useState('');
  const [newVersionCode, setNewVersionCode] = useState('');
  const [isAddingVersion, setIsAddingVersion] = useState(false);
  const [uploadingSection, setUploadingSection] = useState(null);

  // Version Edit State
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [editVersionYear, setEditVersionYear] = useState('');
  const [editVersionCode, setEditVersionCode] = useState('');
  const [isUpdatingVersion, setIsUpdatingVersion] = useState(false);

  // Section Add / Edit Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [sectionModalMode, setSectionModalMode] = useState('create'); // 'create' | 'edit'
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [existingPdfPath, setExistingPdfPath] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    section_no: '',
    title: '',
    order_index: '',
    file: null
  });
  const [submittingSection, setSubmittingSection] = useState(false);
  const [seedingSections, setSeedingSections] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('csweb_token') || localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      const [progRes, degRes] = await Promise.all([
        axios.get("/api/curriculum/programs"),
        axios.get("/api/curriculum/degrees")
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
        name_en: program.name_en || '',
        slug: program.slug || '',
        degreeId: program.degreeId || (degrees[0]?.id || 1),
        year: program.versions?.[0]?.year?.toString() || '2569',
        curriculum_code: program.versions?.[0]?.curriculum_code || '',
        image_path: program.image_path || '',
        is_featured: program.is_featured ?? true,
        date_tag: program.date_tag || '',
        order_no: program.order_no ?? 0
      });
    } else {
      setEditingProgram(null);
      setProgramForm({
        name_th: '',
        name_en: '',
        slug: '',
        degreeId: degrees[0]?.id || 1,
        year: '2569',
        curriculum_code: '',
        image_path: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        is_featured: true,
        date_tag: `มีนาคม ${new Date().getFullYear() + 543}`,
        order_no: programs.length
      });
    }
    setIsProgramModalOpen(true);
  };

  const handleProgramImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingProgramImage(true);
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post("/api/appearance/upload-image", formData, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data"
        }
      });
      if (res.data?.imagePath) {
        setProgramForm(prev => ({ ...prev, image_path: res.data.imagePath }));
      }
    } catch (err) {
      console.error("Upload program image error:", err);
      alert("อัปโหลดรูปภาพไม่สำเร็จ");
    } finally {
      setUploadingProgramImage(false);
    }
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
        await axios.put(`/api/curriculum/programs/${editingProgram.id}`, {
          name_th: programForm.name_th.trim(),
          name_en: programForm.name_en.trim(),
          slug: programForm.slug.trim(),
          degreeId: programForm.degreeId,
          image_path: programForm.image_path.trim() || null,
          is_featured: programForm.is_featured,
          date_tag: programForm.date_tag.trim() || null,
          order_no: parseInt(programForm.order_no) || 0
        }, getAuthHeaders());
        alert("แก้ไขข้อมูลหลักสูตรสำเร็จ");
      } else {
        await axios.post("/api/curriculum/programs", {
          name_th: programForm.name_th.trim(),
          name_en: programForm.name_en.trim(),
          slug: programForm.slug.trim(),
          degreeId: programForm.degreeId,
          year: programForm.year,
          curriculum_code: programForm.curriculum_code.trim(),
          image_path: programForm.image_path.trim() || null,
          is_featured: programForm.is_featured,
          date_tag: programForm.date_tag.trim() || null,
          order_no: parseInt(programForm.order_no) || 0
        }, getAuthHeaders());
        alert("เพิ่มหลักสูตรใหม่สำเร็จและเชื่อมโยงกับหน้าแรกอัตโนมัติแล้ว");
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

  const handleDeleteProgram = (program) => {
    setDeleteModal({
      isOpen: true,
      title: "ยืนยันการลบหลักสูตร",
      itemName: program.name_th,
      description: "การลบหลักสูตรนี้จะลบทุกเวอร์ชันปีและไฟล์เอกสาร มคอ.2 ทั้งหมดที่เกี่ยวข้องออกจากระบบอย่างถาวร",
      confirmWord: "delete",
      isLoading: false,
      onConfirm: async () => {
        try {
          setDeleteModal(prev => ({ ...prev, isLoading: true }));
          await axios.delete(`/api/curriculum/programs/${program.id}`, getAuthHeaders());
          alert("ลบหลักสูตรสำเร็จ");
          if (selectedProgram?.id === program.id) {
            setSelectedProgram(null);
          }
          closeDeleteModal();
          fetchCurriculum();
        } catch (error) {
          console.error("Failed to delete program:", error);
          alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการลบหลักสูตร");
          setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  // Version Management
  const handleAddVersion = async () => {
    if (!newVersionYear || isNaN(parseInt(newVersionYear))) {
      alert("กรุณาระบุปี พ.ศ. ให้ถูกต้อง เช่น 2574");
      return;
    }

    try {
      setIsAddingVersion(true);
      await axios.post("/api/curriculum/versions", {
        programId: selectedProgram.id,
        year: parseInt(newVersionYear),
        curriculum_code: newVersionCode.trim() || undefined
      }, getAuthHeaders());
      alert(`เพิ่มเวอร์ชันปี ${newVersionYear} สำเร็จ`);
      setNewVersionYear('');
      setNewVersionCode('');
      await fetchCurriculum();
      setActiveVersionYear(parseInt(newVersionYear));
    } catch (error) {
      console.error("Add version error:", error);
      alert(error.response?.data?.error || "ไม่สามารถเพิ่มเวอร์ชันได้");
    } finally {
      setIsAddingVersion(false);
    }
  };

  const handleDeleteVersion = (versionId, year) => {
    setDeleteModal({
      isOpen: true,
      title: "ยืนยันการลบเวอร์ชันปีหลักสูตร",
      itemName: `หลักสูตร พ.ศ. ${year} (${selectedProgram?.name_th || ''})`,
      description: `ข้อมูลเวอร์ชันปี ${year} และไฟล์เอกสาร มคอ.2 ทุกหมวดประจำปีนี้จะถูกลบถาวร`,
      confirmWord: "delete",
      isLoading: false,
      onConfirm: async () => {
        try {
          setDeleteModal(prev => ({ ...prev, isLoading: true }));
          await axios.delete(`/api/curriculum/versions/${versionId}`, getAuthHeaders());
          alert(`ลบเวอร์ชันปี ${year} สำเร็จ`);
          closeDeleteModal();
          await fetchCurriculum();
        } catch (error) {
          console.error("Delete version error:", error);
          alert(error.response?.data?.error || "ไม่สามารถลบเวอร์ชันได้");
          setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  const handleStartEditVersion = (version) => {
    setEditingVersionId(version.id);
    setEditVersionYear(version.year?.toString() || '');
    setEditVersionCode(version.curriculum_code || '');
  };

  const handleCancelEditVersion = () => {
    setEditingVersionId(null);
    setEditVersionYear('');
    setEditVersionCode('');
  };

  const handleSaveEditVersion = async (versionId) => {
    if (!editVersionYear || isNaN(parseInt(editVersionYear))) {
      alert("กรุณาระบุปี พ.ศ. ให้ถูกต้อง เช่น 2569");
      return;
    }

    try {
      setIsUpdatingVersion(true);
      await axios.put(`/api/curriculum/versions/${versionId}`, {
        year: parseInt(editVersionYear),
        curriculum_code: editVersionCode.trim() || null
      }, getAuthHeaders());

      const updatedYear = parseInt(editVersionYear);
      setActiveVersionYear(updatedYear);
      setEditingVersionId(null);

      // Update selectedProgram in state immediately
      setSelectedProgram(prev => {
        if (!prev) return prev;
        const newVersions = (prev.versions || []).map(v => 
          v.id === versionId ? { ...v, year: updatedYear, curriculum_code: editVersionCode.trim() || null } : v
        );
        return { ...prev, versions: newVersions };
      });

      await fetchCurriculum();
      alert("บันทึกการแก้ไขเวอร์ชันหลักสูตรสำเร็จ");
    } catch (error) {
      console.error("Update version error:", error);
      alert(error.response?.data?.error || "ไม่สามารถแก้ไขเวอร์ชันได้");
    } finally {
      setIsUpdatingVersion(false);
    }
  };

  const currentActiveVersion = selectedProgram?.versions?.find(v => v.year === activeVersionYear);

  // Open Create Section Modal
  const openCreateSectionModal = () => {
    const curSections = currentActiveVersion?.sections || [];
    const maxSectionNo = curSections.reduce((max, s) => Math.max(max, s.section_no || 0), 0);
    const nextNo = maxSectionNo > 0 ? maxSectionNo + 1 : 1;
    setSectionModalMode('create');
    setEditingSectionId(null);
    setExistingPdfPath(null);
    setSectionForm({
      section_no: nextNo,
      title: `หมวดที่ ${nextNo} `,
      order_index: nextNo,
      file: null
    });
    setIsSectionModalOpen(true);
  };

  // Open Edit Section Modal
  const openEditSectionModal = (sec) => {
    setSectionModalMode('edit');
    setEditingSectionId(sec.id);
    setExistingPdfPath(sec.pdf_path || null);
    setSectionForm({
      section_no: sec.section_no ?? '',
      title: sec.title || `หมวดที่ ${sec.section_no}`,
      order_index: sec.order_index ?? sec.section_no ?? '',
      file: null
    });
    setIsSectionModalOpen(true);
  };

  // Save Section (Create or Update)
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.title.trim()) {
      alert("กรุณากรอกชื่อหมวด");
      return;
    }
    if (!currentActiveVersion) {
      alert("ไม่พบข้อมูลเวอร์ชันปีหลักสูตร");
      return;
    }

    try {
      setSubmittingSection(true);
      const formData = new FormData();
      formData.append("title", sectionForm.title.trim());
      formData.append("section_no", sectionForm.section_no);
      formData.append("order_index", sectionForm.order_index || sectionForm.section_no);
      if (sectionForm.file) {
        formData.append("pdf", sectionForm.file);
      }

      if (sectionModalMode === 'create') {
        formData.append("versionId", currentActiveVersion.id);
        await axios.post("/api/curriculum/sections", formData, {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            "Content-Type": "multipart/form-data"
          }
        });
        alert("เพิ่มหมวดหลักสูตรสำเร็จ");
      } else {
        await axios.put(`/api/curriculum/sections/${editingSectionId}`, formData, {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            "Content-Type": "multipart/form-data"
          }
        });
        alert("แก้ไขข้อมูลหมวดสำเร็จ");
      }

      setIsSectionModalOpen(false);
      await fetchCurriculum();
    } catch (error) {
      console.error("Save section error:", error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกหมวดหลักสูตร");
    } finally {
      setSubmittingSection(false);
    }
  };

  // Delete Section
  const handleDeleteSection = (sectionId, title) => {
    setDeleteModal({
      isOpen: true,
      title: "ยืนยันการลบหมวดหลักสูตร",
      itemName: title || `หมวดที่ ${sectionId}`,
      description: "ข้อมูลและไฟล์ PDF ทั้งหมดของหมวดนี้จะถูกลบออกจากเล่มหลักสูตร",
      confirmWord: "delete",
      isLoading: false,
      onConfirm: async () => {
        try {
          setDeleteModal(prev => ({ ...prev, isLoading: true }));
          await axios.delete(`/api/curriculum/sections/${sectionId}`, getAuthHeaders());
          alert("ลบหมวดหลักสูตรสำเร็จ");
          closeDeleteModal();
          await fetchCurriculum();
        } catch (error) {
          console.error("Delete section error:", error);
          alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการลบหมวดหลักสูตร");
          setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
  };

  // Seed Standard 1 - 9 Sections
  const handleSeedStandardSections = async () => {
    if (!currentActiveVersion) return;
    try {
      setSeedingSections(true);
      await axios.post("/api/curriculum/sections/seed-standard", {
        versionId: currentActiveVersion.id
      }, getAuthHeaders());
      alert("สร้างหมวดมาตรฐาน 1 - 9 เรียบร้อยแล้ว");
      await fetchCurriculum();
    } catch (error) {
      console.error("Seed standard error:", error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการสร้างหมวดมาตรฐาน");
    } finally {
      setSeedingSections(false);
    }
  };

  // Section PDF Upload directly from Card
  const handleUploadSectionPdf = async (sec, file) => {
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
    if (sec.id) {
      formData.append("sectionId", sec.id);
    }
    formData.append("versionId", currentVersion.id);
    formData.append("section_no", sec.section_no);
    formData.append("title", sec.title || `หมวดที่ ${sec.section_no}`);

    try {
      setUploadingSection(sec.id || sec.section_no);
      await axios.post("/api/curriculum/sections/upload", formData, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          "Content-Type": "multipart/form-data"
        }
      });
      alert(`อัปโหลดไฟล์ PDF สำหรับ "${sec.title || `หมวดที่ ${sec.section_no}`}" สำเร็จ`);
      await fetchCurriculum();
    } catch (error) {
      console.error("Upload section PDF error:", error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการอัปโหลดไฟล์ PDF");
    } finally {
      setUploadingSection(null);
    }
  };

  const handleDeleteSectionPdf = (sectionId, title) => {
    setDeleteModal({
      isOpen: true,
      title: "ยืนยันการลบไฟล์เอกสาร PDF",
      itemName: title || `ไฟล์ PDF ของหมวด ${sectionId}`,
      description: "ไฟล์เอกสาร PDF จะถูกลบถาวร ผู้เข้าชมจะไม่สามารถเปิดอ่านเอกสารของหมวดนี้ได้",
      confirmWord: "delete",
      isLoading: false,
      onConfirm: async () => {
        try {
          setDeleteModal(prev => ({ ...prev, isLoading: true }));
          await axios.delete(`/api/curriculum/sections/${sectionId}/pdf`, getAuthHeaders());
          alert("ลบไฟล์ PDF สำเร็จ");
          closeDeleteModal();
          await fetchCurriculum();
        } catch (error) {
          console.error("Delete PDF error:", error);
          alert(error.response?.data?.error || "ไม่สามารถลบไฟล์ PDF ได้");
          setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
      }
    });
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
                  {/* Thumbnail / Icon */}
                  {item.image_path ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                      <img 
                        src={item.image_path} 
                        alt={item.name_th} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }} 
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#3F51B5] shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen size={28} />
                    </div>
                  )}

                  <div className="text-left flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-black uppercase tracking-wider">{item.slug}</span>
                      <span className="text-[11px] font-bold text-[#3F51B5] bg-indigo-50/70 px-2 py-0.5 rounded-md">{item.degree?.name_th || 'หลักสูตร'}</span>
                      {item.is_featured && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Star size={11} className="fill-amber-500 text-amber-500" /> แนะนำหน้าแรก
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{item.name_th}</h3>
                    {item.name_en && (
                      <p className="text-xs text-slate-400 font-medium italic mt-0.5 uppercase tracking-wide truncate">{item.name_en}</p>
                    )}
                    
                    {/* Version badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-xs text-slate-400 font-medium">ปีหลักสูตร:</span>
                      {versions.length > 0 ? (
                        versions.map(v => {
                          const secCount = v.sections?.filter(s => s.pdf_path)?.length || 0;
                          return (
                            <span key={v.id} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-200/60 flex items-center gap-1.5">
                              <Calendar size={12} className="text-[#3F51B5]" /> พ.ศ. {v.year}
                              {v.curriculum_code && (
                                <span className="font-mono text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded font-bold">
                                  {v.curriculum_code}
                                </span>
                              )}
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${secCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {secCount}/{v.sections?.length || 9} หมวด (PDF)
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
                    <Layers size={16} /> จัดการหมวดหลักสูตร & PDF
                  </button>
                  <button 
                    onClick={() => openProgramModal(item)}
                    className="p-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                    title="แก้ไขข้อมูลหลักสูตร"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProgram(item)}
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
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-1">เลือกปีหลักสูตร:</span>
                  {selectedProgram.versions?.map((v) => (
                    <div key={v.id} className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm">
                      <button
                        onClick={() => setActiveVersionYear(v.year)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          activeVersionYear === v.year
                            ? 'bg-[#3F51B5] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Calendar size={13} />
                        <span>พ.ศ. {v.year}</span>
                        {v.curriculum_code && (
                          <span className={`text-[10px] font-mono px-1 rounded ${activeVersionYear === v.year ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {v.curriculum_code}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleStartEditVersion(v)}
                        title={`แก้ไขปี/รหัสเวอร์ชัน ${v.year}`}
                        className="p-1.5 text-slate-400 hover:text-[#3F51B5] hover:bg-slate-100 rounded-lg transition-colors ml-0.5"
                      >
                        <Edit3 size={13} />
                      </button>
                      {selectedProgram.versions.length > 1 && (
                        <button
                          onClick={() => handleDeleteVersion(v.id, v.year)}
                          title={`ลบเวอร์ชัน ${v.year}`}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add New Version input */}
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="number"
                    placeholder="ปี พ.ศ. เช่น 2574"
                    value={newVersionYear}
                    onChange={(e) => setNewVersionYear(e.target.value)}
                    className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5]"
                  />
                  <input
                    type="text"
                    placeholder="รหัส เช่น CS74"
                    value={newVersionCode}
                    onChange={(e) => setNewVersionCode(e.target.value)}
                    className="w-28 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-[#3F51B5]"
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

              {/* Edit Version Inline Box */}
              {editingVersionId && (
                <div className="bg-white border-2 border-indigo-200 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm animate-fadeIn">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <Edit3 size={14} className="text-[#3F51B5]" /> แก้ไขข้อมูลเวอร์ชันหลักสูตร:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">ปีหลักสูตร (พ.ศ.):</label>
                      <input
                        type="number"
                        value={editVersionYear}
                        onChange={(e) => setEditVersionYear(e.target.value)}
                        className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-[#3F51B5] focus:bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">รหัสหลักสูตร:</label>
                      <input
                        type="text"
                        value={editVersionCode}
                        onChange={(e) => setEditVersionCode(e.target.value)}
                        placeholder="เช่น CS64"
                        className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#3F51B5] focus:bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEditVersion(editingVersionId)}
                      disabled={isUpdatingVersion}
                      className="px-3.5 py-1.5 bg-[#3F51B5] text-white hover:bg-[#2D3B8E] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      {isUpdatingVersion ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      บันทึกการแก้ไข
                    </button>
                    <button
                      onClick={handleCancelEditVersion}
                      disabled={isUpdatingVersion}
                      className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold transition-all"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sections List */}
            {currentActiveVersion ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={18} className="text-[#3F51B5]" /> รายการหมวดหลักสูตร ประจำปี พ.ศ. {activeVersionYear}
                      <span className="text-xs font-bold text-[#3F51B5] bg-indigo-50 px-2 py-0.5 rounded-full lowercase">
                        {currentActiveVersion.sections?.length || 0} หมวด
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      สามารถแก้ไขชื่อหมวด เพิ่มหมวดใหม่ หรืออัปโหลดไฟล์ PDF ประจำหมวดได้อิสระ
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(!currentActiveVersion.sections || currentActiveVersion.sections.length < 9) && (
                      <button
                        onClick={handleSeedStandardSections}
                        disabled={seedingSections}
                        className="px-3.5 py-2 bg-indigo-50 text-[#3F51B5] hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-indigo-200/60 disabled:opacity-50"
                        title="สร้างหมวดมาตรฐาน 1 - 9 (มคอ.2) ให้อัตโนมัติ"
                      >
                        {seedingSections ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        สร้างหมวดมาตรฐาน 1-9
                      </button>
                    )}
                    <button
                      onClick={openCreateSectionModal}
                      className="px-4 py-2 bg-[#3F51B5] text-white hover:bg-[#2D3B8E] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-100 shrink-0"
                    >
                      <Plus size={15} /> เพิ่มหมวดใหม่
                    </button>
                  </div>
                </div>

                {/* Sections cards grid */}
                {(!currentActiveVersion.sections || currentActiveVersion.sections.length === 0) ? (
                  <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 space-y-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl w-fit mx-auto text-[#3F51B5]">
                      <Layers size={32} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-700">ยังไม่มีรายการหมวดในหลักสูตรปี พ.ศ. {activeVersionYear}</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                        คุณสามารถกดสร้างหมวดมาตรฐาน 1 ถึง 9 (มคอ.2) ได้ทันที หรือกดเพิ่มหมวดด้วยตนเอง
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={handleSeedStandardSections}
                        disabled={seedingSections}
                        className="px-5 py-2.5 bg-indigo-50 text-[#3F51B5] hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                      >
                        {seedingSections ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        สร้างหมวดมาตรฐาน 1 - 9 อัตโนมัติ
                      </button>
                      <button
                        onClick={openCreateSectionModal}
                        className="px-5 py-2.5 bg-[#3F51B5] text-white hover:bg-[#2D3B8E] rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                      >
                        <Plus size={14} /> เพิ่มหมวดเอง
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[...currentActiveVersion.sections]
                      .sort((a, b) => (a.order_index ?? a.section_no ?? 0) - (b.order_index ?? b.section_no ?? 0))
                      .map((sec) => {
                        const hasPdf = !!sec.pdf_path;
                        const isUploading = uploadingSection === sec.id;

                        return (
                          <div 
                            key={sec.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                              hasPdf 
                                ? 'bg-indigo-50/30 border-indigo-100 hover:border-indigo-200' 
                                : 'bg-white border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${hasPdf ? 'bg-indigo-100 text-[#3F51B5]' : 'bg-slate-100 text-slate-400'}`}>
                                  <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <span className="text-[11px] font-black text-[#3F51B5] uppercase bg-indigo-50 px-2 py-0.5 rounded-md">
                                      หมวดที่ {sec.section_no}
                                    </span>
                                    {sec.order_index !== sec.section_no && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        (ลำดับ: {sec.order_index})
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2" title={sec.title}>
                                    {sec.title || `หมวดที่ ${sec.section_no}`}
                                  </h4>
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center gap-1.5">
                                {hasPdf ? (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    <CheckCircle2 size={12} /> มี PDF
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    <AlertCircle size={12} /> ยังไม่มีไฟล์
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bottom Actions for each Section */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {hasPdf ? (
                                  <a
                                    href={getPdfUrl(sec.pdf_path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-bold text-[#3F51B5] hover:underline flex items-center gap-1 shrink-0"
                                  >
                                    <Eye size={14} /> เปิดดู PDF
                                  </a>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic truncate">ยังไม่มีเอกสาร</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <label className="cursor-pointer px-2.5 py-1.5 bg-white border border-slate-200 hover:border-[#3F51B5] text-slate-700 text-[11px] font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all hover:text-[#3F51B5]">
                                  {isUploading ? (
                                    <Loader2 size={13} className="animate-spin text-[#3F51B5]" />
                                  ) : (
                                    <Upload size={13} />
                                  )}
                                  <span>{hasPdf ? "เปลี่ยน PDF" : "อัปโหลด PDF"}</span>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    disabled={isUploading}
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleUploadSectionPdf(sec, e.target.files[0]);
                                        e.target.value = '';
                                      }
                                    }}
                                  />
                                </label>

                                {hasPdf && (
                                  <button
                                    onClick={() => handleDeleteSectionPdf(sec.id, sec.title)}
                                    title="ลบเฉพาะไฟล์ PDF"
                                    className="p-1.5 text-slate-300 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}

                                <button
                                  onClick={() => openEditSectionModal(sec)}
                                  title="แก้ไขชื่อหมวด / หมายเลขหมวด"
                                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-[#3F51B5] rounded-xl transition-colors"
                                >
                                  <Edit3 size={14} />
                                </button>

                                <button
                                  onClick={() => handleDeleteSection(sec.id, sec.title)}
                                  title="ลบหมวดนี้ออกจากหลักสูตร"
                                  className="p-1.5 text-slate-300 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <p className="text-sm font-bold text-slate-400">กรุณาเพิ่มเวอร์ชันปีหลักสูตรเพื่อจัดการหมวด</p>
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingProgram ? "แก้ไขข้อมูลหลักสูตร" : "เพิ่มหลักสูตรใหม่"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ระบบจะเชื่อมโยงหลักสูตรเข้าสู่หน้าเล่มหลักสูตร มคอ.2 และการ์ดแนะนำหน้าแรกโดยอัตโนมัติ
                </p>
              </div>
              <button onClick={() => setIsProgramModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  ชื่อหลักสูตร (ภาษาไทย) <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={programForm.name_th}
                  onChange={(e) => setProgramForm({ ...programForm, name_th: e.target.value })}
                  placeholder="เช่น หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาตรี ภาคปกติ)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  ชื่อหลักสูตร (ภาษาอังกฤษ / SUBTITLE)
                </label>
                <input 
                  type="text" 
                  value={programForm.name_en}
                  onChange={(e) => setProgramForm({ ...programForm, name_en: e.target.value })}
                  placeholder="เช่น BACHELOR OF SCIENCE PROGRAM IN COMPUTER SCIENCE"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Slug / รหัสกำกับ</label>
                  <input 
                    type="text" 
                    value={programForm.slug}
                    onChange={(e) => setProgramForm({ ...programForm, slug: e.target.value })}
                    placeholder="เช่น regular หรือ csb"
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
              </div>

              {/* Featured toggle & Date Tag */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={programForm.is_featured}
                    onChange={(e) => setProgramForm({ ...programForm, is_featured: e.target.checked })}
                    className="w-4 h-4 text-[#3F51B5] rounded border-slate-300 focus:ring-[#3F51B5]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                      แสดงเป็นการ์ดหลักสูตรแนะนำที่หน้าแรก (Featured Course)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      เมื่อติ๊กเลือก หลักสูตรนี้จะแสดงบนหน้าแรกทันทีโดยอัตโนมัติ
                    </p>
                  </div>
                </label>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    ข้อความวันที่อัปเดต (Date Tag)
                  </label>
                  <input 
                    type="text" 
                    value={programForm.date_tag}
                    onChange={(e) => setProgramForm({ ...programForm, date_tag: e.target.value })}
                    placeholder="เช่น มีนาคม 2564"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5]"
                  />
                </div>
              </div>

              {/* Image URL & Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  รูปภาพปกหลักสูตร (สำหรับการ์ดหน้าแรก)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    {programForm.image_path ? (
                      <img src={programForm.image_path} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input 
                      type="text" 
                      value={programForm.image_path}
                      onChange={(e) => setProgramForm({ ...programForm, image_path: e.target.value })}
                      placeholder="https://... หรือ /uploads/..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5]"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#3F51B5] text-slate-700 text-[11px] font-bold rounded-xl cursor-pointer transition-colors">
                      {uploadingProgramImage ? <Loader2 size={13} className="animate-spin text-[#3F51B5]" /> : <Upload size={13} />}
                      <span>{uploadingProgramImage ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพจากเครื่อง"}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        disabled={uploadingProgramImage}
                        onChange={handleProgramImageUpload} 
                      />
                    </label>
                  </div>
                </div>
              </div>

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

      {/* 📝 Modal เพิ่ม/แก้ไขหมวดหลักสูตร */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-[#3F51B5] bg-indigo-50 px-2.5 py-0.5 rounded-md">
                  ปี พ.ศ. {activeVersionYear}
                </span>
                <h2 className="text-xl font-bold text-slate-800 mt-1">
                  {sectionModalMode === 'create' ? "เพิ่มหมวดหลักสูตรใหม่" : "แก้ไขข้อมูลหมวดหลักสูตร"}
                </h2>
              </div>
              <button 
                onClick={() => setIsSectionModalOpen(false)} 
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    หมายเลขหมวด (section_no) <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={sectionForm.section_no}
                    onChange={(e) => setSectionForm({ ...sectionForm, section_no: e.target.value })}
                    placeholder="เช่น 1, 2, 99"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                    required
                  />
                  <span className="text-[11px] text-slate-400">เลขหมวด เช่น 1-9 หรือ 99</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">
                    ลำดับการแสดงผล (order_index)
                  </label>
                  <input 
                    type="number" 
                    value={sectionForm.order_index}
                    onChange={(e) => setSectionForm({ ...sectionForm, order_index: e.target.value })}
                    placeholder="เช่น 1, 2, 99"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                  />
                  <span className="text-[11px] text-slate-400">เรียงจากน้อยไปมาก</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  ชื่อหมวดหลักสูตร <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  placeholder="เช่น หมวดที่ 1 ข้อมูลทั่วไป"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#3F51B5]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  ไฟล์เอกสาร PDF ประจำหมวด (ไม่บังคับ)
                </label>
                {existingPdfPath && sectionModalMode === 'edit' && (
                  <div className="mb-2 p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-[#3F51B5] font-medium flex items-center gap-1.5">
                      <FileText size={15} /> มีไฟล์ PDF ปัจจุบันอยู่แล้ว
                    </span>
                    <a
                      href={getPdfUrl(existingPdfPath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#3F51B5] hover:underline flex items-center gap-1"
                    >
                      <Eye size={13} /> ดูไฟล์
                    </a>
                  </div>
                )}
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setSectionForm({ ...sectionForm, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#3F51B5] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#3F51B5] file:text-white hover:file:bg-[#2D3B8E]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {sectionModalMode === 'edit' ? "เลือกไฟล์ใหม่หากต้องการเปลี่ยนไฟล์ PDF" : "สามารถเลือกไฟล์ PDF เพื่ออัปโหลดพร้อมสร้างหมวดได้"}
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  disabled={submittingSection}
                  className="px-6 py-2.5 bg-[#3F51B5] text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submittingSection ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        itemName={deleteModal.itemName}
        description={deleteModal.description}
        confirmWord={deleteModal.confirmWord}
        isLoading={deleteModal.isLoading}
        onConfirm={deleteModal.onConfirm}
        onClose={closeDeleteModal}
      />

    </div>
  );
}