import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Search, Trash2, RotateCcw, FileText } from 'lucide-react';

export default function NewsArchive() {
  const navigate = useNavigate();
  const [archivedData, setArchivedData] = useState([]);

  // 🟢 1. ดึงข้อมูลข่าวเฉพาะที่ถูกจัดเก็บแล้ว
  const fetchArchivedNews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/news");
      const archived = res.data.filter(item => item.status === 'archived');
      setArchivedData(archived);
    } catch (error) {
      console.error("Error fetching archived news:", error);
    }
  };

  useEffect(() => {
    fetchArchivedNews();
  }, []);

  // 🟢 2. ฟังก์ชันกู้คืนข่าวกลับไปหน้าหลัก
  const handleRestore = async (id) => {
    if (window.confirm("ต้องการกู้คืนข่าวนี้กลับไปหน้าหลักใช่หรือไม่?")) {
      try {
        await axios.put(`http://localhost:5000/api/news/${id}`, { status: 'active' });
        fetchArchivedNews(); // โหลดข้อมูลใหม่
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการกู้คืน");
      }
    }
  };

  // 🟢 3. ฟังก์ชันลบถาวร
  const handleDelete = async (id) => {
    if (window.confirm("คำเตือน: คุณต้องการลบข่าวนี้ทิ้งถาวรใช่หรือไม่?")) {
      try {
        await axios.delete(`http://localhost:5000/api/news/${id}`);
        fetchArchivedNews();
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  return (
    <div className="space-y-8 pb-20">

      {/* 🚀 Header Area */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => navigate('/admin/news')}
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#3F51B5] transition-all"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">จัดการคลังข่าวเก่า</h1>
      </div>

      {/* 🔍 Search bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            placeholder="ค้นหาข่าว..."
            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-14 pr-5 text-sm outline-none font-medium"
          />
        </div>
      </div>

      {/* 📋 Archived List Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-sm font-black text-slate-700">หัวข้อข่าว</th>
                <th className="px-8 py-6 text-sm font-black text-slate-700 w-48 text-center">วันที่ประกาศ</th>
                <th className="px-8 py-6 text-sm font-black text-slate-700 w-64 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {archivedData.map((item) => (
                <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                        <FileText size={18} />
                      </div>
                      <span className="text-sm font-bold text-slate-600 line-clamp-1">{item.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-400 text-center">
                    {item.date}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                      {/* ปุ่มกู้คืนข่าวกลับไปหน้าหลัก */}
                      <button
                        onClick={() => handleRestore(item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[11px] font-black hover:bg-emerald-500 hover:text-white transition-all"
                      >
                        <RotateCcw size={14} /> กู้คืน
                      </button>
                      {/* ปุ่มลบถาวร */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[11px] font-black hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 size={14} /> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}