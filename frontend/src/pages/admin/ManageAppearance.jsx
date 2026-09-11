import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Upload, Save, Image as ImageIcon, Trash2, ArrowUp, ArrowDown, ToggleLeft, ToggleRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function ManageAppearance() {
  const [logo, setLogo] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [busyId, setBusyId] = useState(null); // id ของแบนเนอร์ (หรือ 'new') ที่กำลังมี request ค้างอยู่ ใช้ disable ปุ่มกันกดซ้ำ
  const addFileInputRef = useRef(null);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/appearance/banners`);
      setBanners(res.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('order_no', banners.length);
    try {
      setBusyId('new');
      await axios.post(`${API_BASE}/api/appearance/banners`, formData);
      await fetchBanners();
    } catch (error) {
      console.error('Error adding banner:', error);
      alert('เพิ่มแบนเนอร์ไม่สำเร็จ');
    } finally {
      setBusyId(null);
      e.target.value = '';
    }
  };

  const handleReplaceImage = async (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      setBusyId(id);
      await axios.put(`${API_BASE}/api/appearance/banners/${id}`, formData);
      await fetchBanners();
    } catch (error) {
      console.error('Error replacing banner image:', error);
      alert('เปลี่ยนรูปแบนเนอร์ไม่สำเร็จ');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      setBusyId(banner.id);
      await axios.put(`${API_BASE}/api/appearance/banners/${banner.id}`, {
        is_active: !banner.is_active,
      });
      await fetchBanners();
    } catch (error) {
      console.error('Error toggling banner:', error);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบแบนเนอร์นี้ใช่หรือไม่?')) return;
    try {
      setBusyId(id);
      await axios.delete(`${API_BASE}/api/appearance/banners/${id}`);
      await fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
    } finally {
      setBusyId(null);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= banners.length) return;
    const current = banners[index];
    const target = banners[targetIndex];
    try {
      setBusyId(current.id);
      await Promise.all([
        axios.put(`${API_BASE}/api/appearance/banners/${current.id}`, { order_no: target.order_no }),
        axios.put(`${API_BASE}/api/appearance/banners/${target.id}`, { order_no: current.order_no }),
      ]);
      await fetchBanners();
    } catch (error) {
      console.error('Error reordering banners:', error);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-10 text-left">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการภาพลักษณ์เว็บไซต์</h1>
          <p className="text-slate-500">แก้ไข Logo และรูป Banner ที่แสดงบนหน้าเว็บไซต์หลัก</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3F51B5] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
          <Save size={18} /> บันทึกการเปลี่ยนแปลง
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* 🏢 ส่วนจัดการโลโก้ (Logo) */}
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 self-start">
            <ImageIcon className="text-[#3F51B5]" /> CIS Logo
          </h3>
          <div className="w-40 h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center relative group overflow-hidden mb-6">
            {logo ? (
              <img src={URL.createObjectURL(logo)} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto text-slate-300 mb-2" size={32} />
                <span className="text-[10px] text-slate-400">ขนาดแนะนำ 512x512px</span>
              </div>
            )}
          </div>
          <input type="file" id="logo-upload" hidden onChange={(e) => setLogo(e.target.files[0])} />
          <label htmlFor="logo-upload" className="w-full text-center py-3 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition-colors text-sm">
            เลือกรูปภาพโลโก้ใหม่
          </label>
        </section>

        {/* 🖼️ ส่วนจัดการแบนเนอร์หน้าแรก (Home Banners) */}
        <section className="md:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="text-[#3F51B5]" /> แบนเนอร์หน้าแรก (Hero Sliders)
            </h3>
            <input
              type="file"
              accept="image/*"
              ref={addFileInputRef}
              hidden
              onChange={handleAddBanner}
            />
            <button
              onClick={() => addFileInputRef.current?.click()}
              disabled={busyId === 'new'}
              className="text-sm font-bold text-[#3F51B5] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busyId === 'new' ? 'กำลังอัปโหลด...' : '+ เพิ่มรูปแบนเนอร์'}
            </button>
          </div>

          {loadingBanners ? (
            <p className="text-slate-400 text-sm text-center py-10">กำลังโหลด...</p>
          ) : banners.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">
              ยังไม่มีแบนเนอร์ กด "+ เพิ่มรูปแบนเนอร์" เพื่อเริ่มต้น
            </p>
          ) : (
            <div className="space-y-4">
              {banners.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row gap-6 p-4 border border-slate-50 rounded-2xl bg-slate-50/50 items-center"
                >
                  <div className="w-full md:w-60 h-24 bg-white rounded-xl overflow-hidden shadow-inner border border-slate-100">
                    <img src={`${API_BASE}${item.image_path}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-bold text-slate-700">{item.title || `ลำดับที่ ${index + 1}`}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      ลำดับ: {item.order_no} · สถานะ: {item.is_active ? 'แสดงผล' : 'ซ่อนอยู่'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0 || busyId === item.id}
                      title="เลื่อนขึ้น"
                      className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 hover:text-indigo-600 transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === banners.length - 1 || busyId === item.id}
                      title="เลื่อนลง"
                      className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 hover:text-indigo-600 transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      disabled={busyId === item.id}
                      title={item.is_active ? 'ปิดการแสดงผล' : 'เปิดการแสดงผล'}
                      className="p-2.5 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {item.is_active ? (
                        <ToggleRight size={18} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={18} className="text-slate-400" />
                      )}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      id={`replace-banner-${item.id}`}
                      onChange={(e) => e.target.files[0] && handleReplaceImage(item.id, e.target.files[0])}
                    />
                    <label
                      htmlFor={`replace-banner-${item.id}`}
                      title="เปลี่ยนรูป"
                      className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 hover:text-indigo-600 transition-colors shadow-sm cursor-pointer"
                    >
                      <Upload size={18} />
                    </label>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={busyId === item.id}
                      title="ลบ"
                      className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 hover:text-rose-500 transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
