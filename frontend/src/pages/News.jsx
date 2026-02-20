import React, { useMemo, useState, useEffect } from 'react';
import Footer from '../components/Footer';
import { ArrowRightCircle, Clock, Search, Tag } from 'lucide-react';

const ALLOWED_TAGS = [
  'ข่าวภาควิชาฯ',
  'ข่าวคณะและมหาวิทยาลัย',
  'ข่าวทุนการศึกษา',
  'ข่าวรับสมัครงาน-ประชาสัมพันธ์'
];

export default function News() {
  const [activeTab, setActiveTab] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  // ข้อมูลข่าวสาร (แนะนำให้ดึงมาจาก API ในอนาคต)
  const newsData = [
    {
      id: 1,
      tag: 'ข่าวภาควิชาฯ',
      title: 'ประกาศภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ เรื่อง การส่งเอกสารฝึกงาน ประจำปีการศึกษา 2568',
      date: '1 กุมภาพันธ์ 2569',
      description: 'ให้นักศึกษาที่มีความประสงค์จะออกฝึกงานในช่วงปิดภาคฤดูร้อน ดำเนินการส่งเอกสารตามขั้นตอนที่กำหนด...',
      image: 'https://scontent.fbkk5-3.fna.fbcdn.net/v/t39.30808-6/615952669_1420443876536360_4055644891408316922_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&oh=00_AfqAEDu4A96Ofr-UcEacrc-GR8ozkkv3tBww1OKpt5krAw&oe=698298E8',
    },
    {
      id: 2,
      tag: 'ข่าวคณะและมหาวิทยาลัย',
      title: 'ประชาสัมพันธ์ SCIENCE EXHIBITION DAY 2026 คณะวิทยาศาสตร์ประยุกต์ มจพ.',
      date: '16 มกราคม 2569',
      description: 'ขอเชิญน้องๆ มัธยมปลายเข้าร่วมชมนิทรรศการผลงานทางวิชาการและการแนะนำหลักสูตรใหม่ล่าสุดของคณะ...',
      image: 'https://scontent.fbkk5-5.fna.fbcdn.net/v/t39.30808-6/615463552_1414123583835056_4148235800047827583_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=127cfc&oh=00_AfqGtBfCYF3Me1uIrbTxNbiKKto0dxmswvqcbKsIwqDPHA&oe=6982C990',
    },
    {
      id: 3,
      tag: 'ข่าวทุนการศึกษา',
      title: 'เปิดรับสมัครทุนการศึกษาต่อระดับปริญญาโท TAIST-Tokyo Tech (Academic Year 2026)',
      date: '23 ธันวาคม 2568',
      description: 'โอกาสทางการศึกษาสำหรับนักศึกษาที่สนใจพัฒนาทักษะด้านเทคโนโลยีระดับสูงร่วมกับสถาบันเทคโนโลยีแห่งโตเกียว...',
      image: 'https://scontent.fbkk5-5.fna.fbcdn.net/v/t39.30808-6/605056162_1398140932099988_2653063218622137128_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=833d8c&oh=00_Afp1PULq3AFK8v2haGrkm36snHTsXeF8rfL_ZwPC-7ko5A&oe=6982BCB2',
    }
  ];

  const tabs = useMemo(() => ['ทั้งหมด', ...ALLOWED_TAGS], []);

  const filteredNews = useMemo(() => {
    return newsData.filter((news) => {
      const matchesTab = activeTab === 'ทั้งหมด' || news.tag === activeTab;
      const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className="bg-[#f8fafc] font-['Prompt'] min-h-screen">
      {/* Header Section */}
      <div className="bg-[#3F51B5] py-20 px-10 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">ข่าวสารและประชาสัมพันธ์</h1>
          <p className="text-indigo-100 text-lg">ติดตามความเคลื่อนไหว กิจกรรม และประกาศสำคัญจากภาควิชา CIS</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-12">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-6 md:space-y-0">
          {/* Tabs */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap shadow-sm
                  ${activeTab === tab 
                    ? 'bg-[#3F51B5] text-white' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาข่าวสาร..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3F51B5]/20 bg-white shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredNews.map((item) => (
              <div key={item.id} className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-xl transition-all duration-500 flex flex-col group border border-gray-50">
                <div className="relative h-[240px] w-full overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 bg-[#3F51B5] text-white text-[11px] px-4 py-1.5 rounded-lg font-bold shadow-lg flex items-center">
                    <Tag size={12} className="mr-2" /> {item.tag}
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center text-gray-400 text-[13px] mb-4 font-medium">
                    <Clock size={14} className="mr-2" />
                    {item.date}
                  </div>
                  <h3 className="text-xl font-bold text-[#1e293b] leading-snug mb-4 group-hover:text-[#3F51B5] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {item.description}
                  </p>
                  <div className="mt-auto pt-5 border-t border-gray-50 flex justify-between items-center">
                    <button className="text-[#3F51B5] text-sm font-bold flex items-center group-hover:underline">
                      รายละเอียดข่าว
                      <ArrowRightCircle size={18} className="ml-2 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">ไม่พบข่าวสารที่คุณกำลังค้นหา</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}