import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function ManageAppearance() {
  const [logo, setLogo] = useState(null);
  const [banners, setBanners] = useState([
    { id: 1, url: 'https://via.placeholder.com/1200x400', name: 'Banner 1' }
  ]);

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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
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
        <section className="xl:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon className="text-[#3F51B5]" /> แบนเนอร์หน้าแรก (Hero Sliders)
            </h3>
            <button className="text-sm font-bold text-[#3F51B5] hover:underline">+ เพิ่มรูปแบนเนอร์</button>
          </div>

          <div className="space-y-4">
            {banners.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-6 p-4 border border-slate-50 rounded-2xl bg-slate-50/50 items-center">
                <div className="w-full md:w-60 h-24 bg-white rounded-xl overflow-hidden shadow-inner border border-slate-100">
                  <img src={item.url} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-bold text-slate-700">ลำดับที่ {item.id}</p>
                  <p className="text-slate-400 text-xs mt-1">แนะนำขนาด: 1920x800px (ไม่เกิน 2MB)</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 hover:text-indigo-600 transition-colors shadow-sm">
                    <Upload size={18} />
                  </button>
                  <button className="p-2.5 bg-white text-slate-400 rounded-xl border border-slate-100 hover:text-rose-500 transition-colors shadow-sm">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}