import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Mail, Phone, GraduationCap, BookOpen, 
  Save, RefreshCw, Loader2, CheckCircle2, AlertCircle, 
  ExternalLink, Award, FileText
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await axios.get("http://localhost:5000/api/lecturers/profile/me");
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

      const res = await axios.put("http://localhost:5000/api/lecturers/profile/me", formData);
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

        {/* ปุ่มบันทึก */}
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

      {/* รายการผลงานวิจัยของอาจารย์ */}
      {profile?.research_publications && profile.research_publications.length > 0 && (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-[#3F51B5]" /> ผลงานวิจัยและงานตีพิมพ์ ({profile.research_publications.length} รายการ)
            </h2>
            <span className="text-xs text-slate-400">ซิงค์จากฐานข้อมูลภาควิชา</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-2">
            {profile.research_publications.map((pub, idx) => (
              <div key={idx} className="py-3.5 space-y-1 text-xs">
                <div className="font-bold text-slate-800 text-sm leading-snug">
                  {pub.title}
                </div>
                {pub.authors && (
                  <p className="text-slate-500 italic">{pub.authors}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-slate-400 pt-1">
                  {pub.publication_year && (
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                      {pub.publication_year}
                    </span>
                  )}
                  {pub.publication_type && (
                    <span className="bg-indigo-50 text-[#3F51B5] px-2 py-0.5 rounded font-medium">
                      {pub.publication_type}
                    </span>
                  )}
                  {pub.venue && <span>{pub.venue}</span>}
                  {pub.url && (
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#3F51B5] hover:underline flex items-center gap-1 ml-auto font-bold"
                    >
                      <ExternalLink size={12} /> ดูลิงก์
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
