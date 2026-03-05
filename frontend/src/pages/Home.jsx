import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';
import { Monitor, Calendar, Download, ClipboardCheck, ArrowRightCircle, Clock } from 'lucide-react';

import { newsData } from '../data/newsData';

export default function Home() {
  const navigate = useNavigate(); 

  // 1. เพิ่มข้อมูล Path และสถานะ Link ภายนอก
  const actions = [
    { icon: <Monitor size={24} />, label: 'ระบบคำร้องออนไลน์', path: 'https://reg.kmutnb.ac.th/registrar/home', isExternal: true },
    { icon: <Calendar size={24} />, label: 'ปฏิทินการศึกษา', path: 'https://acdserv.kmutnb.ac.th/academic-calendar', isExternal: true },
    { icon: <Download size={24} />, label: 'ดาวน์โหลดเอกสาร', path: '/student-downloads' },
    { icon: <ClipboardCheck size={24} />, label: 'ระบบประเมินอาจารย์', path: 'https://reg4.kmutnb.ac.th/registrar/home', isExternal: true },
  ];

  // 2. ฟังก์ชันจัดการการคลิกปุ่มทางลัด
  const handleActionClick = (act) => {
    if (act.isExternal) {
      window.open(act.path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(act.path);
    }
  };

  const highlightNews = useMemo(() => {
    return newsData.filter(news => news.isLatest === true);
  }, []);

  const courses = [
    { id: 'cs-normal', level: 'bachelor', title: 'หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาตรี ภาคปกติ)', enTitle: 'BACHELOR OF SCIENCE PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' },
    { id: 'cs-english', level: 'cs-english', title: 'หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาตรี โครงการพิเศษ สองภาษา)', enTitle: 'BACHELOR OF SCIENCE PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1684503830683-108f3e0fd03f?auto=format&fit=crop&w=800&q=80' },
    { id: 'cs-master', level: 'cs-master', title: 'หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาโท)', enTitle: 'MASTER OF SCIENCE PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&w=800&q=80' },
    { id: 'se-master', level: 'se-master', title: 'หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์ (ปริญญาโท)', enTitle: 'MASTER OF SCIENCE PROGRAM IN SOFTWARE ENGINEERING', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1727434032773-af3cd98375ba?auto=format&fit=crop&w=800&q=80' },
    { id: 'cs-phd', level: 'doctor', title: 'หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาเอก)', enTitle: 'DOCTOR OF PHILOSOPHY PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80' }
  ];

  return (
    <div className="bg-[#f8fafc] font-['Prompt'] text-left">
      <HeroSlider />

      <div className="bg-white relative z-30 pb-24 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-10">
          
          {/* Quick Actions - เพิ่ม onClick เพื่อให้ทำงานได้ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-[60px] mb-24 max-w-[1000px] mx-auto relative z-40">
            {actions.map((act, i) => (
              <div 
                key={i} 
                onClick={() => handleActionClick(act)}
                className="bg-[#3F51B5] text-white py-7 px-4 rounded-2xl shadow-xl flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:bg-[#2e3b8a] transition-all duration-300 group"
              >
                <div className="mb-2 opacity-90 group-hover:scale-110 transition-transform">
                  {act.icon}
                </div>
                <span className="text-[14px] font-medium tracking-wide text-center leading-tight">
                  {act.label}
                </span>
              </div>
            ))}
          </div>

          {/* Section: ข่าวสาร CIS */}
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-l-[8px] border-[#3F51B5] pl-5">
              <div>
                <h2 className="text-4xl font-bold text-[#1e293b] tracking-tight uppercase">ข่าวสาร CIS</h2>
              </div>
              <button 
                onClick={() => navigate('/news')}
                className="mt-4 md:mt-0 flex items-center text-[#3F51B5] font-bold hover:underline group"
              >
                ดูข่าวทั้งหมด <ArrowRightCircle size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {highlightNews.length > 0 ? (
                highlightNews.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(`/news/${item.id}`)}
                    className="w-full max-w-[360px] mx-auto bg-white rounded-2xl overflow-hidden shadow-[0_6px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_10px_28px_rgb(0,0,0,0.10)] transition-all duration-300 flex flex-col group cursor-pointer border border-gray-50"
                  >
                    <div className="relative h-[200px] w-full overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute top-4 left-4 bg-[#3F51B5] text-white text-[10px] px-3 py-1 rounded-full font-bold">
                        {item.tag}
                      </div>
                    </div>
                    <div className="px-6 pt-6 pb-5 flex flex-col flex-1 min-h-[180px]">
                      <div className="flex items-center text-gray-400 text-[12px] mb-3 font-medium">
                        <Clock size={13} className="mr-2 opacity-60" />
                        {item.date}
                      </div>
                      <h3 className="text-[15px] font-bold text-[#1e293b] leading-[1.55] mb-3 line-clamp-2 group-hover:text-[#3F51B5] transition-colors">
                        {item.title}
                      </h3>
                      <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-[#3F51B5] text-[13px] font-bold">อ่านต่อ</span>
                        <ArrowRightCircle size={16} className="text-gray-300 group-hover:text-[#3F51B5] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 col-span-full text-center py-10">ยังไม่มีข่าวประชาสัมพันธ์ล่าสุดในขณะนี้</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ส่วนหลักสูตรแนะนำ */}
      <div className="bg-[#FAFAFA] py-28 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto px-10">
          <section>
            <div className="flex items-center mb-16 border-l-[8px] border-[#3F51B5] pl-5">
              <h2 className="text-4xl font-bold text-[#1e293b] tracking-tight uppercase">หลักสูตรแนะนำของเรา</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {courses.slice(0, 4).map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  onViewDetail={() => navigate(`/course-sections/${course.level}`)} 
                />
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <div className="w-full lg:w-1/2">
                <CourseCard 
                  course={courses[4]} 
                  onViewDetail={() => navigate(`/course-sections/${courses[4].level}`)} 
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function CourseCard({ course, onViewDetail }) {
  return (
    <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col sm:flex-row space-y-6 sm:space-y-0 sm:space-x-8 hover:shadow-xl transition-all duration-300 group">
      <div className="w-full sm:w-52 h-52 rounded-2xl shrink-0 overflow-hidden bg-slate-50 shadow-inner">
        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex flex-col justify-between py-1 flex-1 text-left">
        <div>
          <span className="text-xs text-gray-400 flex items-center mb-4">
            <Calendar size={14} className="mr-2" /> {course.date}
          </span>
          <h4 className="text-[#1e293b] font-bold text-[20px] leading-tight mb-4 group-hover:text-[#3F51B5] transition-colors">{course.title}</h4>
          <p className="text-[13.5px] text-gray-400 italic font-light leading-relaxed line-clamp-2 uppercase">{course.enTitle}</p>
        </div>
        <button 
          onClick={onViewDetail}
          className="bg-[#3F51B5] text-white text-[14px] px-10 py-3 rounded-full w-fit font-bold hover:bg-indigo-800 transition-colors flex items-center shadow-md mt-6 active:scale-95 transition-transform"
        >
          <ArrowRightCircle size={18} className="mr-2" /> รายละเอียด
        </button>
      </div>
    </div>
  );
}