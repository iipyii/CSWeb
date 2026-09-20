import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Save, Image as ImageIcon, Trash2, Plus, RefreshCw, Loader2 } from 'lucide-react';

export default function ManageAppearance() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bannersRes, settingsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/appearance/banners"),
        axios.get("http://localhost:5000/api/appearance/settings")
      ]);
      setBanners(bannersRes.data || []);
      const logoUrl = settingsRes.data?.configMap?.site_logo;
      if (logoUrl) {
        setLogoPreview(logoUrl.startsWith('http') ? logoUrl : `http://localhost:5000${logoUrl}`);
      }
    } catch (error) {
      console.error("Failed to load appearance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("logo", file);

      const res = await axios.post("http://localhost:5000/api/appearance/logo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const newPath = res.data.logoPath;
      setLogoPreview(`http://localhost:5000${newPath}`);
      window.dispatchEvent(new CustomEvent('site_config_updated', { detail: { site_logo: newPath } }));
      alert("อัปเดตโลโก้เรียบร้อยแล้ว");
    } catch (error) {
      console.error("Upload logo error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดโลโก้");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    if (!window.confirm("ต้องการรีเซ็ตโลโก้กลับเป็นค่าเริ่มต้นของระบบใช่หรือไม่?")) return;
    try {
      setUploadingLogo(true);
      await axios.post("http://localhost:5000/api/appearance/settings", {
        config_key: "site_logo",
        config_value: ""
      });
      setLogoPreview(null);
      window.dispatchEvent(new CustomEvent('site_config_updated', { detail: { site_logo: "" } }));
      alert("รีเซ็ตโลโก้เป็นค่าเริ่มต้นเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Reset logo error:", error);
      alert("เกิดข้อผิดพลาดในการรีเซ็ตโลโก้");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", `แบนเนอร์ ${banners.length + 1}`);
      formData.append("order_no", banners.length + 1);

      await axios.post("http://localhost:5000/api/appearance/banners", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("เพิ่มแบนเนอร์เรียบร้อยแล้ว");
      fetchData();
      window.dispatchEvent(new CustomEvent('site_config_updated', { detail: { banners: true } }));
    } catch (error) {
      console.error("Upload banner error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดแบนเนอร์");
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("ต้องการลบแบนเนอร์นี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:5000/api/appearance/banners/${id}`);
        alert("ลบแบนเนอร์เรียบร้อย");
        fetchData();
        window.dispatchEvent(new CustomEvent('site_config_updated', { detail: { banners: true } }));
      } catch (error) {
        console.error("Delete banner error:", error);
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  return (
    <div className="space-y-10 text-left pb-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการภาพลักษณ์เว็บไซต์</h1>
          <p className="text-slate-500">แก้ไข Logo และรูป Banner ที่แสดงบนหน้าเว็บไซต์หลัก</p>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
        >
          <RefreshCw size={16} /> รีเฟรช
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 🏢 ส่วนจัดการโลโก้ (Logo) */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 self-start">
            <ImageIcon className="text-[#3F51B5]" /> CIS Logo
          </h3>
          <div className="w-44 h-44 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center relative group overflow-hidden mb-6">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto text-slate-300 mb-2" size={36} />
                <span className="text-[10px] text-slate-400">ขนาดแนะนำ 512x512px</span>
              </div>
            )}
            {uploadingLogo && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#3F51B5]" size={32} />
              </div>
            )}
          </div>
          <input 
            type="file" 
            id="logo-upload" 
            accept="image/*"
            hidden 
            onChange={handleLogoUpload} 
            disabled={uploadingLogo}
          />
          <div className="w-full flex flex-col gap-2">
            <label 
              htmlFor="logo-upload" 
              className="w-full text-center py-3 bg-[#3F51B5] text-white rounded-xl font-bold cursor-pointer hover:bg-indigo-700 transition-colors text-sm shadow-sm"
            >
              {uploadingLogo ? "กำลังอัปโหลด..." : "เลือกรูปภาพโลโก้ใหม่"}
            </label>
            {logoPreview && (
              <button
                type="button"
                onClick={handleResetLogo}
                disabled={uploadingLogo}
                className="w-full text-center py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-rose-50 hover:text-rose-600 transition-colors text-xs"
              >
                รีเซ็ตเป็นโลโก้เริ่มต้น
              </button>
            )}
          </div>
        </section>

        {/* 🖼️ ส่วนจัดการแบนเนอร์หน้าแรก (Home Banners) */}
        <section className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="text-[#3F51B5]" /> แบนเนอร์หน้าแรก (Hero Sliders)
            </h3>
            <div>
              <input 
                type="file" 
                id="banner-upload" 
                accept="image/*"
                hidden 
                onChange={handleBannerUpload} 
                disabled={uploadingBanner}
              />
              <label 
                htmlFor="banner-upload" 
                className="text-sm font-bold text-[#3F51B5] hover:underline cursor-pointer flex items-center gap-1.5"
              >
                {uploadingBanner ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                เพิ่มรูปแบนเนอร์
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {banners.length > 0 ? (
              banners.map((item, index) => {
                const imgUrl = item.image_path?.startsWith("http") 
                  ? item.image_path 
                  : `http://localhost:5000${item.image_path}`;

                return (
                  <div key={item.id} className="flex flex-col md:flex-row gap-6 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 items-center">
                    <div className="w-full md:w-60 h-24 bg-white rounded-xl overflow-hidden shadow-inner border border-slate-200 shrink-0">
                      <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm text-left">
                      <p className="font-bold text-slate-700">{item.title || `ลำดับที่ ${index + 1}`}</p>
                      <p className="text-slate-400 text-xs mt-1">แนะนำขนาด: 1920x800px</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteBanner(item.id)}
                        className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-200 hover:text-rose-500 transition-colors shadow-sm"
                        title="ลบแบนเนอร์"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-400 text-sm">
                {loading ? "กำลังโหลดแบนเนอร์..." : "ยังไม่มีรูปแบนเนอร์ สามารถกดเพิ่มได้จากปุ่มด้านบน"}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}