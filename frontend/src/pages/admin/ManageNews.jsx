import React from 'react';
import { Plus, Edit3, Trash2, Archive } from 'lucide-react';

const mockNews = [
  { id: 1, date: "25 มิถุนายน 2568", title: "ประกาศเรื่อง กำหนดการโครงงานพิเศษและปริญญานิพนธ์...", img: "/img/news1.jpg" },
  { id: 2, date: "9 กรกฎาคม 2568", title: "ประชาสัมพันธ์คณะศิลปศาสตร์ประยุกต์...", img: "/img/news2.jpg" },
];

export default function ManageNews() {
  return (
    <div className="p-8 bg-[#fdf8f4] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-700">โพสต์ทั้งหมด</h2>
        <button className="bg-[#4a50c7] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <Plus size={18} /> สร้างโพสต์
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {mockNews.map((news) => (
          <div key={news.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
            <img src={news.img} className="w-full h-48 object-cover" alt="news" />
            <div className="p-5">
              <span className="text-indigo-500 text-xs font-bold">{news.date}</span>
              <h3 className="font-bold text-slate-800 my-2 line-clamp-2">{news.title}</h3>
              
              <div className="flex gap-2 mt-6">
                <button className="flex-1 bg-[#4a50c7] text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm">
                  <Edit3 size={16} /> แก้ไข
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 bg-[#d32f2f] text-white py-2 rounded-md flex items-center justify-center gap-2 text-sm">
                  <Trash2 size={16} /> ลบ
                </button>
                <button className="flex-1 border border-[#d32f2f] text-[#d32f2f] py-2 rounded-md flex items-center justify-center gap-2 text-sm">
                  <Archive size={16} /> จัดเก็บ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}