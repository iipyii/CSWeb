import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, GraduationCap, BookOpen, 
  Save, RefreshCw, Loader2, CheckCircle2, AlertCircle, 
  ExternalLink, Award, FileText, Plus, Edit2, Trash2, X
} from 'lucide-react';

export default function ManageProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    fullname_en: "",
    position_th: "",
    position_en: "",
    tel: "",
    email: "",
    education_th: "",
    education_en: "",
    orcid: "",
    scholar_name: ""
  });

  // Modal states for Research Publications
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [editingPubId, setEditingPubId] = useState(null);
  const [pubSaving, setPubSaving] = useState(false);
  const [pubModalError, setPubModalError] = useState("");

  // Delete confirmation modal state
  const [pubToDelete, setPubToDelete] = useState(null);
  const [pubDeleting, setPubDeleting] = useState(false);

  const initialPubForm = {
    title: "",
    authors: "",
    publication_type: "Journal Article",
    venue: "",
    publication_year: new Date().getFullYear().toString(),
    volume: "",
    issue: "",
    pages: "",
    doi: "",
    url: "",
    abstract: "",
    is_published: true
  };

  const [pubFormData, setPubFormData] = useState(initialPubForm);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await axios.get("/api/lecturers/profile/me");
      const data = res.data;
      setProfile(data);
      setFormData({
        fullname_en: data.fullname_en || "",
        position_th: data.position_th || "",
        position_en: data.position_en || "",
        tel: data.tel || "",
        email: data.email || "",
        education_th: data.education_th || "",
        education_en: data.education_en || "",
        orcid: data.orcid || "",
        scholar_name: data.scholar_name || ""
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
      setErrorMessage(err.response?.data?.error || "ไม่พบข้อมูลโปรไฟล์อาจารย์ที่เชื่อมโยงกับบัญชีนี้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMessage("");
      setErrorMessage("");

      const res = await axios.put("/api/lecturers/profile/me", formData);
      setSuccessMessage(res.data?.message || "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
      fetchProfile();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Save profile error:", err);
      setErrorMessage(err.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddPub = () => {
    setPubFormData(initialPubForm);
    setEditingPubId(null);
    setPubModalError("");
    setIsPubModalOpen(true);
  };

  const handleOpenEditPub = (pub) => {
    setPubFormData({
      title: pub.title || "",
      authors: pub.authors || "",
      publication_type: pub.publication_type || "Journal Article",
      venue: pub.venue || "",
      publication_year: pub.publication_year ? pub.publication_year.toString() : "",
      volume: pub.volume || "",
      issue: pub.issue || "",
      pages: pub.pages || "",
      doi: pub.doi || "",
      url: pub.url || "",
      abstract: pub.abstract || "",
      is_published: pub.is_published !== false
    });
    setEditingPubId(pub.id);
    setPubModalError("");
    setIsPubModalOpen(true);
  };

  const handleSavePublication = async (e) => {
    e.preventDefault();
    if (!pubFormData.title.trim()) {
      setPubModalError("กรุณากรอกชื่องานวิจัยหรือผลงานตีพิมพ์");
      return;
    }

    try {
      setPubSaving(true);
      setPubModalError("");

      const payload = {
        ...pubFormData,
        publication_year: pubFormData.publication_year ? parseInt(pubFormData.publication_year) : null
      };

      if (editingPubId) {
        const res = await axios.put(`/api/lecturers/profile/publications/${editingPubId}`, payload);
        setSuccessMessage(res.data?.message || "แก้ไขผลงานวิจัยสำเร็จ");
      } else {
        const res = await axios.post("/api/lecturers/profile/publications", payload);
        setSuccessMessage(res.data?.message || "เพิ่มผลงานวิจัยสำเร็จ");
      }

      setIsPubModalOpen(false);
      fetchProfile();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Save publication error:", err);
      setPubModalError(err.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกผลงานวิจัย");
    } finally {
      setPubSaving(false);
    }
  };

  const handleConfirmDeletePub = async () => {
    if (!pubToDelete) return;
    try {
      setPubDeleting(true);
      const res = await axios.delete(`/api/lecturers/profile/publications/${pubToDelete.id}`);
      setSuccessMessage(res.data?.message || "ลบผลงานวิจัยสำเร็จ");
      setPubToDelete(null);
      fetchProfile();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error("Delete publication error:", err);
      setErrorMessage(err.response?.data?.error || "เกิดข้อผิดพลาดในการลบผลงานวิจัย");
      setPubToDelete(null);
    } finally {
      setPubDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
        <Loader2 size={36} className="animate-spin text-[#3F51B5]" />
        <span className="text-sm font-medium">กำลังโหลดข้อมูลโปรไฟล์อาจารย์...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#3F51B5] flex items-center justify-center font-bold text-2xl shadow-inner">
            {profile?.fullname_th ? profile.fullname_th.charAt(0) : <User size={30} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-800">
                {profile?.fullname_th || user?.full_name}
              </h1>
              {profile?.lecturer_code && (
                <span className="text-xs bg-[#3F51B5]/10 text-[#3F51B5] font-mono font-bold px-2 py-0.5 rounded-md">
                  {profile.lecturer_code}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              จัดการประวัติการศึกษา ข้อมูลการติดต่อ และผลงานวิจัยส่วนบุคคล
            </p>
          </div>
        </div>

        <button
          onClick={fetchProfile}
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-200"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> รีเฟรช
        </button>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-center gap-2 font-medium animate-in fade-in">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-sm flex items-center gap-2 font-medium animate-in fade-in">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ข้อมูลทั่วไป */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <User size={18} className="text-[#3F51B5]" /> ข้อมูลทั่วไปและตำแหน่งทางวิชาการ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                ชื่อ-นามสกุล (ภาษาอังกฤษ)
              </label>
              <input
                type="text"
                value={formData.fullname_en}
                onChange={(e) => setFormData({ ...formData, fullname_en: e.target.value })}
                placeholder="เช่น Assoc. Prof. Dr. Tanapat Anusas-amornkul"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                ตำแหน่งทางวิชาการ (ภาษาไทย)
              </label>
              <input
                type="text"
                value={formData.position_th}
                onChange={(e) => setFormData({ ...formData, position_th: e.target.value })}
                placeholder="เช่น รองศาสตราจารย์ ดร."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                ตำแหน่งทางวิชาการ (ภาษาอังกฤษ)
              </label>
              <input
                type="text"
                value={formData.position_en}
                onChange={(e) => setFormData({ ...formData, position_en: e.target.value })}
                placeholder="เช่น Associate Professor, Ph.D."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                เบอร์โทรศัพท์ / ต่อภายใน
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={formData.tel}
                  onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                  placeholder="เช่น 02-555-2000 ต่อ 4321"
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                อีเมลติดต่อสาธารณะ (Email)
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="เช่น tanapat.a@sci.kmutnb.ac.th"
                  className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ประวัติการศึกษา */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap size={18} className="text-[#3F51B5]" /> ประวัติการศึกษา (Education Background)
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                ประวัติการศึกษา (ภาษาไทย)
              </label>
              <textarea
                rows={4}
                value={formData.education_th}
                onChange={(e) => setFormData({ ...formData, education_th: e.target.value })}
                placeholder="เช่น:&#10;ปร.ด. (วิทยาการคอมพิวเตอร์) มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ&#10;วศ.ม. (วิศวกรรมคอมพิวเตอร์) มหาวิทยาลัยเกษตรศาสตร์"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">ขึ้นบรรทัดใหม่เพื่อแยกแต่ละระดับวุฒิการศึกษา</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                ประวัติการศึกษา (ภาษาอังกฤษ)
              </label>
              <textarea
                rows={4}
                value={formData.education_en}
                onChange={(e) => setFormData({ ...formData, education_en: e.target.value })}
                placeholder="เช่น:&#10;Ph.D. in Computer Science, KMUTNB&#10;M.Eng. in Computer Engineering, Kasetsart University"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ข้อมูลการวิจัย & แหล่งข้อมูลภายนอก (ORCID / Google Scholar) */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Award size={18} className="text-[#3F51B5]" /> แหล่งข้อมูลวิจัยภายนอก (ORCID & Google Scholar)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                ORCID ID
              </label>
              <input
                type="text"
                value={formData.orcid}
                onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                placeholder="เช่น 0000-0002-1234-5678"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Google Scholar Name / Identifier
              </label>
              <input
                type="text"
                value={formData.scholar_name}
                onChange={(e) => setFormData({ ...formData, scholar_name: e.target.value })}
                placeholder="เช่น Tanapat Anusas-amornkul"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
              />
            </div>
          </div>
        </div>

        {/* ปุ่มบันทึกข้อมูลส่วนตัว */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? "กำลังบันทึกข้อมูล..." : "บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </form>

      {/* ส่วนจัดการผลงานวิจัยของอาจารย์ */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-[#3F51B5]" /> ผลงานวิจัยและงานตีพิมพ์ (Research Publications)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ผลงานวิจัยทั้งหมด {profile?.research_publications?.length || 0} รายการ (แสดงผลในหน้ารายละเอียดอาจารย์)
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddPub}
            className="flex items-center justify-center gap-2 bg-[#3F51B5] hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 shrink-0"
          >
            <Plus size={16} /> เพิ่มผลงานวิจัย
          </button>
        </div>

        {/* รายการผลงานวิจัย */}
        {profile?.research_publications && profile.research_publications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {profile.research_publications.map((pub) => (
              <div 
                key={pub.id} 
                className="py-4 flex flex-col md:flex-row md:items-start justify-between gap-4 group hover:bg-slate-50/70 -mx-4 px-4 rounded-2xl transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <h3 className="font-bold text-slate-800 text-sm leading-snug">
                      {pub.title}
                    </h3>
                    {pub.is_published === false && (
                      <span className="shrink-0 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">
                        ซ่อนอยู่
                      </span>
                    )}
                  </div>

                  {pub.authors && (
                    <p className="text-slate-500 text-xs italic">{pub.authors}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-slate-400 text-xs pt-1">
                    {pub.publication_year && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                        {pub.publication_year}
                      </span>
                    )}
                    {pub.publication_type && (
                      <span className="bg-indigo-50 text-[#3F51B5] px-2 py-0.5 rounded font-medium text-[11px]">
                        {pub.publication_type}
                      </span>
                    )}
                    {pub.venue && (
                      <span className="font-medium text-slate-600">{pub.venue}</span>
                    )}
                    {(pub.volume || pub.issue || pub.pages) && (
                      <span className="text-slate-400 text-[11px]">
                        {[
                          pub.volume ? `Vol. ${pub.volume}` : '',
                          pub.issue ? `No. ${pub.issue}` : '',
                          pub.pages ? `pp. ${pub.pages}` : ''
                        ].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {pub.doi && (
                      <a
                        href={`https://doi.org/${pub.doi.replace(/^https?:\/\/doi\.org\//, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#3F51B5] hover:underline flex items-center gap-0.5 text-[11px] font-mono"
                      >
                        DOI: {pub.doi}
                      </a>
                    )}
                    {pub.url && (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#3F51B5] hover:underline flex items-center gap-1 font-bold text-[11px] ml-auto md:ml-0"
                      >
                        <ExternalLink size={12} /> ดูลิงก์เอกสาร
                      </a>
                    )}
                  </div>

                  {pub.abstract && (
                    <p className="text-slate-500 text-xs line-clamp-2 mt-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {pub.abstract}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-start pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditPub(pub)}
                    title="แก้ไขผลงานวิจัย"
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPubToDelete(pub)}
                    title="ลบผลงานวิจัย"
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#3F51B5] flex items-center justify-center">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="font-bold text-slate-700 text-sm">ยังไม่มีข้อมูลผลงานวิจัย</p>
              <p className="text-xs text-slate-400 mt-0.5">กดปุ่มด้านล่างเพื่อเพิ่มข้อมูลผลงานวิจัยหรือบทความตีพิมพ์ของคุณ</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddPub}
              className="mt-2 flex items-center gap-1.5 bg-white hover:bg-slate-100 text-[#3F51B5] border border-indigo-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus size={14} /> เพิ่มผลงานวิจัยชิ้นแรก
            </button>
          </div>
        )}
      </div>

      {/* Modal เพิ่ม / แก้ไข ผลงานวิจัย */}
      {isPubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3F51B5] flex items-center justify-center font-bold">
                  {editingPubId ? <Edit2 size={18} /> : <Plus size={18} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {editingPubId ? "แก้ไขผลงานวิจัย / งานตีพิมพ์" : "เพิ่มผลงานวิจัย / งานตีพิมพ์"}
                  </h3>
                  <p className="text-xs text-slate-400">กรอกรายละเอียดผลงานวิจัยเพื่อนำไปแสดงบนหน้าโปรไฟล์</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPubModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePublication} className="p-6 space-y-4 overflow-y-auto flex-1">
              {pubModalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{pubModalError}</span>
                </div>
              )}

              {/* ชื่องานวิจัย */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่องานวิจัย / บทความวิจัย <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={pubFormData.title}
                  onChange={(e) => setPubFormData({ ...pubFormData, title: e.target.value })}
                  placeholder="เช่น An AI-based Predictive Modeling for Student Performance"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-medium"
                />
              </div>

              {/* คณะผู้วิจัย / ผู้แต่ง */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  คณะผู้วิจัย / ผู้แต่ง (Authors)
                </label>
                <input
                  type="text"
                  value={pubFormData.authors}
                  onChange={(e) => setPubFormData({ ...pubFormData, authors: e.target.value })}
                  placeholder="เช่น T. Anusas-amornkul, S. Jaidee, P. Somchai"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
                />
              </div>

              {/* ประเภทผลงาน & ปีที่ตีพิมพ์ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ประเภทผลงาน (Publication Type)
                  </label>
                  <select
                    value={pubFormData.publication_type}
                    onChange={(e) => setPubFormData({ ...pubFormData, publication_type: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
                  >
                    <option value="Journal Article">Journal Article (วารสารวิชาการ)</option>
                    <option value="Conference Paper">Conference Paper (การประชุมวิชาการ)</option>
                    <option value="Book Chapter">Book Chapter (บทความในหนังสือ)</option>
                    <option value="Book">Book (หนังสือ/ตำรา)</option>
                    <option value="Patent">Patent (สิทธิบัตร/อนุสิทธิบัตร)</option>
                    <option value="Other">Other (อื่นๆ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ปีที่ตีพิมพ์ ค.ศ. (Year)
                  </label>
                  <input
                    type="number"
                    value={pubFormData.publication_year}
                    onChange={(e) => setPubFormData({ ...pubFormData, publication_year: e.target.value })}
                    placeholder="เช่น 2024"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-mono"
                  />
                </div>
              </div>

              {/* ชื่องานประชุม หรือ วารสาร */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ชื่อวารสาร / แหล่งตีพิมพ์ / งานประชุมวิชาการ (Venue / Journal)
                </label>
                <input
                  type="text"
                  value={pubFormData.venue}
                  onChange={(e) => setPubFormData({ ...pubFormData, venue: e.target.value })}
                  placeholder="เช่น IEEE Access, International Conference on Computer Science"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
                />
              </div>

              {/* Volume, Issue, Pages */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Volume
                  </label>
                  <input
                    type="text"
                    value={pubFormData.volume}
                    onChange={(e) => setPubFormData({ ...pubFormData, volume: e.target.value })}
                    placeholder="เช่น 12"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Issue / No.
                  </label>
                  <input
                    type="text"
                    value={pubFormData.issue}
                    onChange={(e) => setPubFormData({ ...pubFormData, issue: e.target.value })}
                    placeholder="เช่น 3"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pages
                  </label>
                  <input
                    type="text"
                    value={pubFormData.pages}
                    onChange={(e) => setPubFormData({ ...pubFormData, pages: e.target.value })}
                    placeholder="เช่น 45-56"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
                  />
                </div>
              </div>

              {/* DOI & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    DOI
                  </label>
                  <input
                    type="text"
                    value={pubFormData.doi}
                    onChange={(e) => setPubFormData({ ...pubFormData, doi: e.target.value })}
                    placeholder="เช่น 10.1109/ACCESS.2024.1234567"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    URL ลิงก์เอกสารฉบับเต็ม / เว็บไซต์
                  </label>
                  <input
                    type="url"
                    value={pubFormData.url}
                    onChange={(e) => setPubFormData({ ...pubFormData, url: e.target.value })}
                    placeholder="เช่น https://doi.org/... หรือ https://ieeexplore.ieee.org/..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm"
                  />
                </div>
              </div>

              {/* บทคัดย่อ (Abstract) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  บทคัดย่อ (Abstract)
                </label>
                <textarea
                  rows={3}
                  value={pubFormData.abstract}
                  onChange={(e) => setPubFormData({ ...pubFormData, abstract: e.target.value })}
                  placeholder="บทคัดย่อหรือสรุปสาระสำคัญของงานวิจัย..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm leading-relaxed"
                />
              </div>

              {/* Checkbox สถานะการเผยแพร่ */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pubFormData.is_published}
                    onChange={(e) => setPubFormData({ ...pubFormData, is_published: e.target.checked })}
                    className="w-4 h-4 text-[#3F51B5] rounded border-slate-300 focus:ring-[#3F51B5]"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    แสดงผลงานนี้บนหน้าเว็บสาธารณะ (Publicly Visible)
                  </span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPubModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={pubSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#3F51B5] hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50"
                >
                  {pubSaving && <Loader2 size={14} className="animate-spin" />}
                  {pubSaving ? "กำลังบันทึก..." : (editingPubId ? "บันทึกการแก้ไข" : "เพิ่มผลงานวิจัย")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ยืนยันการลบผลงานวิจัย */}
      {pubToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <AlertCircle size={24} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800 text-base">
                ยืนยันการลบผลงานวิจัย
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                คุณแน่ใจหรือไม่ว่าต้องการลบผลงานวิจัยนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium text-slate-700 line-clamp-2">
                "{pubToDelete.title}"
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPubToDelete(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={pubDeleting}
                onClick={handleConfirmDeletePub}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-100 flex items-center gap-2 disabled:opacity-50"
              >
                {pubDeleting && <Loader2 size={14} className="animate-spin" />}
                {pubDeleting ? "กำลังลบ..." : "ลบผลงานวิจัย"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
