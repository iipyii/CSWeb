import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  ChevronLeft,
  ArrowRight,
  X,
  Maximize2,
  User,
  FileText,
  Download
} from 'lucide-react';

import Footer from '../components/Footer';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [zoomedImage, setZoomedImage] = useState(null);
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const safeParseArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch (e) { return []; }
    }
    return [];
  };

  useEffect(() => {
    const fetchSingleNews = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/news/${id}`);
        const data = res.data;

        setNews({
          ...data,
          image: data.image ? `http://localhost:5000${data.image}` : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800",
          
          additional_images: safeParseArray(data.additional_images).map(img => `http://localhost:5000${img}`),
          
          attachments: safeParseArray(data.attachments),

          date: new Date(data.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
          tag: data.category === 'department' ? 'ข่าวภาควิชาฯ' : 'ข่าวสาร',
          author: 'ผู้ดูแลระบบ', 
        });
      } catch (error) {
        console.error("Error fetching news detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSingleNews();
  }, [id]);

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

  if (loading) return <div className="text-center py-20">กำลังโหลดข้อมูล...</div>;

  // กรณีไม่พบข่าว (เช่น พิมพ์ ID ผิดใน URL)
  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] p-6 text-center">
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
    <div className="bg-[#F8FAFC] min-h-screen pb-20">

      {/* --- Lightbox สำหรับดูรููปขนาดเต็ม (รองรับทุกรูป) --- */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <button className="absolute top-6 right-6 text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors">
            <X size={24} />
          </button>
          <img
            src={zoomedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in duration-200"
          />
        </div>
      )}

      {/* ปุ่มย้อนกลับ */}
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
            onClick={() => setZoomedImage(news.image)} // 🌟 ซูมรูปปก
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

          <div className="px-6 md:px-12 py-10">
            {/* ข้อมูล Metadata */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-gray-500 text-[13px] font-medium">
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar size={14} className="mr-2 text-[#3F51B5]" /> {news.date}
              </div>
              <div className="flex items-center bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100/50 text-[#3F51B5]">
                <User size={14} className="mr-2" />
                <span>{news.author}</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] leading-[1.3] mb-8">
              {news.title}
            </h1>

            <div className="w-12 h-1 bg-[#3F51B5] rounded-full mb-8 opacity-80"></div>

            {/* รายละเอียดเนื้อหาฉบับเต็ม */}
            <article
              className="prose prose-slate max-w-none text-gray-600 text-base md:text-lg leading-[1.7] mb-12 font-light"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />

            {/* 🌟 1. ส่วนแสดงรูปภาพเพิ่มเติม 🌟 */}
            {news.additional_images && news.additional_images.length > 0 && (
              <div className="mb-12">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-[#3F51B5] rounded-full"></div>
                  รูปภาพเพิ่มเติม
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {news.additional_images.map((imgUrl, index) => (
                    <div 
                      key={index} 
                      className="aspect-video rounded-2xl overflow-hidden cursor-zoom-in group border border-slate-100 shadow-sm relative"
                      onClick={() => setZoomedImage(imgUrl)} // 🌟 คลิกเพื่อซูมรูปนี้
                    >
                      <img 
                        src={imgUrl} 
                        alt={`รูปเพิ่มเติม ${index + 1}`} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🌟 2. ส่วนแสดงเอกสารแนบ 🌟 */}
            {news.attachments && news.attachments.length > 0 && (
              <div className="mb-12 pt-8 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-[#3F51B5] rounded-full"></div>
                  เอกสารดาวน์โหลด
                </h3>
                <div className="space-y-3">
                  {news.attachments.map((filePath, index) => {
                    // ดึงชื่อไฟล์ออกมาโชว์ (ตัดเอาแค่ส่วนหลังสุด)
                    const fileName = filePath.split('/').pop() || `เอกสารแนบที่ ${index + 1}`;
                    const fileUrl = `http://localhost:5000${filePath}`;

                    return (
                      <a
                        key={index}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 md:px-6 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#3F51B5] shadow-sm group-hover:scale-110 transition-transform shrink-0">
                          <FileText size={24} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-bold text-slate-700 group-hover:text-[#3F51B5] truncate transition-colors">{fileName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">คลิกเพื่อดาวน์โหลดหรือเปิดดูไฟล์</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-300 group-hover:text-[#3F51B5] transition-colors shrink-0 shadow-sm">
                          <Download size={18} />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

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