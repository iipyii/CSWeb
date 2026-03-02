import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  Plus, Search, Edit3, Trash2, Archive, 
  Clock, FileText, LayoutGrid 
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'ทั้งหมด', icon: <LayoutGrid size={16} /> },
  { id: 'department', label: 'ข่าวภาควิชาฯ', icon: <FileText size={16} /> },
  { id: 'faculty', label: 'ข่าวคณะและมหาวิทยาลัย', icon: <FileText size={16} /> },
  { id: 'scholarship', label: 'ข่าวทุนการศึกษา', icon: <FileText size={16} /> },
  { id: 'recruitment', label: 'ข่าวรับสมัครงาน-ประชาสัมพันธ์', icon: <FileText size={16} /> },
];

export default function ManageNews() {
  const navigate = useNavigate(); 
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ ใช้ useState เพื่อจัดการรายการข่าวให้หายไปเมื่อกดจัดเก็บ
  const [newsList, setNewsList] = useState([
    {
      id: 1,
      title: "ประกาศเรื่อง กำหนดการโครงงานพิเศษและปริญญานิพนธ์ ภาคการศึกษาที่ 1/2568",
      date: "25 มิถุนายน 2568",
      category: 'department',
      categoryLabel: "ข่าวภาควิชาฯ",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800",
    },
    {
      id: 2,
      title: "ประชาสัมพันธ์คณะศิลปศาสตร์ประยุกต์ จัดสอบ K-StEP TEST ครั้งที่ 2",
      date: "9 กรกฎาคม 2568",
      category: 'faculty',
      categoryLabel: "ข่าวคณะและมหาวิทยาลัย",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800",
    },
    {
      id: 3,
      title: "เรื่อง การให้ทุนการศึกษา ปีการศึกษา 2568 โดยนักศึกษาในสังกัดคณะวิทยาศาสตร์",
      date: "6 กรกฎาคม 2568",
      category: 'scholarship',
      categoryLabel: "ข่าวทุนการศึกษา",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800",
    }
  ]);

  // 🛠️ ฟังก์ชันจัดเก็บข่าว (กรองข่าวที่ถูกเลือกออกจากหน้าจอ)
  const handleArchive = (id) => {
    // ในแอปจริง ตรงนี้ต้องส่ง API ไปอัปเดต Status ใน Database เป็น 'archived'
    const updatedList = newsList.filter(item => item.id !== id);
    setNewsList(updatedList);
    // คุณสามารถเพิ่ม Toast Notification แจ้งเตือนว่า "ย้ายไปคลังข่าวแล้ว" ได้ตรงนี้
  };

  const filteredNews = newsList.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="font-['Prompt'] space-y-8 pb-20">
      
      {/* 🚀 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">จัดการข่าวสาร</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">แยกหมวดหมู่และจัดการเนื้อหาข่าวสารภาควิชา CIS</p>
        </div>
        <button 
          onClick={() => navigate('/admin/news/create')} 
          className="bg-[#3F51B5] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#1A1D2E] transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus size={20} />
          สร้างโพสต์
        </button>
      </div>

      {/* 📂 Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id 
              ? 'bg-[#3F51B5] text-white shadow-lg' 
              : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🔍 Search */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-left">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อข่าวหรือหัวข้อ..."
            className="w-full bg-slate-50 border-none rounded-[1.5rem] py-4 pl-16 pr-5 text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 📰 News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col group animate-in fade-in duration-500"
          >
            <div className="relative h-60 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl bg-white/90 backdrop-blur-md text-slate-600">
                  {item.categoryLabel}
                </span>
              </div>
            </div>

            <div className="p-8 flex flex-col flex-grow text-left">
              <div className="flex items-center gap-2 text-[11px] font-black text-[#3F51B5] mb-4 uppercase tracking-widest">
                <Clock size={12} /> {item.date}
              </div>
              <h3 className="text-xl font-black text-slate-800 leading-tight mb-6 line-clamp-2">
                {item.title}
              </h3>
              
              <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col gap-3">
                <button 
                  onClick={() => navigate(`/admin/news/edit/${item.id}`)} 
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-50 text-[#3F51B5] rounded-2xl text-xs font-black hover:bg-[#3F51B5] hover:text-white transition-all shadow-sm"
                >
                  <Edit3 size={16} /> แก้ไขเนื้อหา
                </button>
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black hover:bg-rose-500 hover:text-white transition-all">
                    <Trash2 size={14} /> ลบ
                  </button>
                  {/* ✅ ปุ่มจัดเก็บ: กดแล้วเรียก handleArchive เพื่อให้ข่าวหายไปจากหน้านี้ */}
                  <button 
                    onClick={() => handleArchive(item.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-slate-400 border border-slate-100 rounded-2xl text-[10px] font-black hover:bg-slate-50 hover:text-slate-600 transition-all shadow-sm"
                  >
                    <Archive size={14} /> จัดเก็บ
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive size={30} className="text-slate-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">ไม่มีรายการข่าวสาร</h3>
          <p className="text-slate-400 text-sm mt-1 font-medium">รายการข่าวอาจถูกจัดเก็บหรือยังไม่มีข้อมูลในหมวดหมู่นี้</p>
        </div>
      )}
    </div>
  );
}