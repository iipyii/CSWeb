import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft, 
  ArrowRight,
  X,
  Maximize2,
  User,
} from 'lucide-react';
import Footer from '../components/Footer';

// นำเข้าข้อมูลจากไฟล์ data (ตรวจสอบ path ให้ตรงกับโครงสร้างโฟลเดอร์ของคุณ)
import { newsData } from '../data/newsData';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isZoomed, setIsZoomed] = useState(false);
  
  // ค้นหาข่าวสารจาก data โดยใช้ ID จาก URL
  const news = useMemo(() => newsData.find(n => n.id === parseInt(id)), [id]);

  const renderContent = (text) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      // ตรวจสอบว่าเป็น URL หรือไม่
      if (part.match(urlRegex)) {
        return (
          <a 
            key={`url-${i}`} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[#3F51B5] font-semibold underline underline-offset-4 hover:text-indigo-800 break-all mx-1"
          >
            {part}
          </a>
        );
      }
      
      // ตรวจสอบการเน้นคำด้วย *...*
      const highlightRegex = /\*(.*?)\*/g;
      const subParts = part.split(highlightRegex);
      
      return subParts.map((subPart, j) => {
        if (j % 2 === 1) {
          return (
            <span key={`bold-${i}-${j}`} className="text-[#3F51B5] font-bold px-0.5">
              {subPart}
            </span>
          );
        }
        return subPart;
      });
    });
  };

  // กรณีไม่พบข่าว (เช่น พิมพ์ ID ผิดใน URL)
  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-['Prompt'] bg-[#F8FAFC] p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบข้อมูลข่าวสารที่คุณต้องการ</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-[#3F51B5] font-semibold hover:underline"
        >
          <ChevronLeft size={20} className="mr-1" /> ย้อนกลับหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] font-['Prompt'] min-h-screen pb-20">
      
      {/* --- Lightbox สำหรับดูรูปขนาดเต็ม --- */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
            <X size={24} />
          </button>
          <img 
            src={news.image} 
            alt="Full size" 
            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in duration-200" 
          />
        </div>
      )}

      {/* 1. ส่วนปุ่มย้อนกลับ */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-[#3F51B5] font-medium transition-all group text-sm"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center mr-2 group-hover:shadow-md transition-all border border-gray-100">
            <ChevronLeft size={18} />
          </div>
          ย้อนกลับ
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden border border-gray-100">
          
          {/* ส่วนรูปภาพหน้าปก */}
          <div 
            className="relative h-[250px] md:h-[400px] w-full cursor-zoom-in group/img overflow-hidden" 
            onClick={() => setIsZoomed(true)}
          >
            <img 
              src={news.image} 
              alt={news.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            <div className="absolute top-6 left-6">
              <span className="bg-[#3F51B5] text-white text-[10px] px-4 py-1.5 rounded-full font-bold shadow-md uppercase tracking-wide">
                {news.tag}
              </span>
            </div>

            <div className="absolute bottom-4 right-6 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-light flex items-center opacity-0 group-hover/img:opacity-100 transition-opacity border border-white/20">
              <Maximize2 size={14} className="mr-1.5" /> คลิกเพื่อดูรูปเต็ม
            </div>
          </div>

          {/* ส่วนเนื้อหาข่าว */}
          <div className="px-6 md:px-12 py-10">
            {/* ข้อมูล Metadata (วันที่และผู้ลงข่าว) */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-gray-500 text-[13px] font-medium">
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar size={14} className="mr-2 text-[#3F51B5]" /> {news.date}
              </div>
              <div className="flex items-center bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/50 text-[#3F51B5]">
                <User size={14} className="mr-2" /> 
                <span>{news.author}</span>
              </div>
            </div>

            {/* หัวข้อข่าว */}
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] leading-[1.3] mb-8">
              {news.title}
            </h1>

            <div className="w-12 h-1 bg-[#3F51B5] rounded-full mb-8 opacity-80"></div>

            {/* รายละเอียดเนื้อหา */}
            <article className="text-gray-600 text-base md:text-lg leading-[1.7] mb-12 whitespace-pre-line font-light">
              {renderContent(news.content)}
            </article>

            {/* ปุ่มกดดูข่าวอื่นๆ */}
            <div className="flex items-center justify-end pt-8 border-t border-gray-50">
              <button 
                onClick={() => navigate('/news')} 
                className="flex items-center text-[#3F51B5] font-semibold hover:gap-2 transition-all group text-base"
              >
                ดูข่าวสารอื่นๆ
                <ArrowRight size={18} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewsDetail;