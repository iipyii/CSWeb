import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';
import {
  Monitor,
  Calendar,
  Download,
  ClipboardCheck,
  ArrowRightCircle,
  Clock,
  AlertCircle,
  BookOpen,
  GraduationCap,
  FileText,
  Users,
  ExternalLink,
  Laptop,
  HelpCircle
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';
import { formatNewsDate, getCategoryLabel } from './News';

const defaultActions = [
  { icon: 'Monitor', label: 'ระบบคำร้องออนไลน์', path: 'https://reg.kmutnb.ac.th/registrar/home', isExternal: true },
  { icon: 'Calendar', label: 'ปฏิทินการศึกษา', path: 'https://acdserv.kmutnb.ac.th/academic-calendar', isExternal: true },
  { icon: 'Download', label: 'ดาวน์โหลดเอกสาร', path: '/student-downloads', isExternal: false },
  { icon: 'ClipboardCheck', label: 'ระบบประเมินอาจารย์', path: 'https://reg4.kmutnb.ac.th/registrar/home', isExternal: true },
];

const defaultCourses = [
  { id: 'cs-normal', level: 'bachelor', title: 'หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาตรี ภาคปกติ)', enTitle: 'BACHELOR OF SCIENCE PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' },
  { id: 'cs-english', level: 'cs-english', title: 'หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาตรี โครงการพิเศษ สองภาษา)', enTitle: 'BACHELOR OF SCIENCE PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1684503830683-108f3e0fd03f?auto=format&fit=crop&w=800&q=80' },
  { id: 'cs-master', level: 'cs-master', title: 'หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาโท)', enTitle: 'MASTER OF SCIENCE PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1644088379091-d574269d422f?auto=format&fit=crop&w=800&q=80' },
  { id: 'se-master', level: 'se-master', title: 'หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์ (ปริญญาโท)', enTitle: 'MASTER OF SCIENCE PROGRAM IN SOFTWARE ENGINEERING', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1727434032773-af3cd98375ba?auto=format&fit=crop&w=800&q=80' },
  { id: 'cs-phd', level: 'doctor', title: 'หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ปริญญาเอก)', enTitle: 'DOCTOR OF PHILOSOPHY PROGRAM IN COMPUTER SCIENCE', date: 'มีนาคม 2564', image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80' }
];

const renderActionIcon = (iconName) => {
  switch (iconName) {
    case 'Monitor': return <Monitor size={24} />;
    case 'Calendar': return <Calendar size={24} />;
    case 'Download': return <Download size={24} />;
    case 'ClipboardCheck': return <ClipboardCheck size={24} />;
    case 'BookOpen': return <BookOpen size={24} />;
    case 'GraduationCap': return <GraduationCap size={24} />;
    case 'FileText': return <FileText size={24} />;
    case 'Users': return <Users size={24} />;
    case 'Laptop': return <Laptop size={24} />;
    default: return <ExternalLink size={24} />;
  }
};

const getActionLabel = (act, lang) => {
  if (lang !== 'EN') return act.label;
  const map = {
    'ระบบคำร้องออนไลน์': 'Online Request System',
    'ปฏิทินการศึกษา': 'Academic Calendar',
    'ดาวน์โหลดเอกสาร': 'Student Downloads',
    'ระบบประเมินอาจารย์': 'Instructor Evaluation'
  };
  return map[act.label] || act.label;
};

export default function Home() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [newsList, setNewsList] = useState([]);
  const [actions, setActions] = useState(defaultActions);
  const [courses, setCourses] = useState(defaultCourses);

  // ดึงข้อมูลข่าวสาร, ปุ่มทางลัด, และหลักสูตรแนะนำ
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, actionsRes, coursesRes] = await Promise.all([
          axios.get("/api/news"),
          axios.get("/api/appearance/quick-actions").catch(() => null),
          axios.get("/api/appearance/featured-courses").catch(() => null)
        ]);

        // จัดการข่าวสาร
        if (newsRes?.data) {
          const todayBkk = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

          const formattedNews = newsRes.data
            .filter(item => {
              if (item.status !== 'active') return false;
              if (item.start_date) {
                const startStr = String(item.start_date).split('T')[0];
                if (startStr > todayBkk) return false;
              }
              return true;
            })
            .map(item => ({
              id: item.id,
              title: item.title,
              title_en: item.title_en,
              summary_en: item.summary_en,
              category: item.category,
              isPinned: item.is_urgent,
              image: item.image ? `${item.image}` : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800",
              rawDate: item.start_date || item.created_at
            }))
            .sort((a, b) => {
              if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
              const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
              const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
              return timeB - timeA;
            });
          setNewsList(formattedNews.slice(0, 3));
        }

        // ปุ่มทางลัด
        if (actionsRes?.data?.data && Array.isArray(actionsRes.data.data) && actionsRes.data.data.length > 0) {
          setActions(actionsRes.data.data);
        }

        // หลักสูตรแนะนำ
        if (coursesRes?.data?.data && Array.isArray(coursesRes.data.data) && coursesRes.data.data.length > 0) {
          setCourses(coursesRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      }
    };

    fetchData();
  }, []);

  // ฟังก์ชันจัดการการคลิกปุ่มทางลัด
  const handleActionClick = (act) => {
    if (act.isExternal) {
      window.open(act.path, '_blank', 'noopener,noreferrer');
    } else {
      navigate(act.path);
    }
  };

  return (
    <div className="bg-slate-50 text-left">
      <HeroSlider />

      <div className="bg-white relative z-30 pb-24 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-[60px] mb-24 max-w-[1000px] mx-auto relative z-40">
            {actions.map((act, i) => (
              <motion.div
                key={act.id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div
                  onClick={() => handleActionClick(act)}
                  className="bg-secondary text-white py-7 px-4 rounded-2xl shadow-xl hover:shadow-indigo-300/40 flex flex-col items-center justify-center cursor-pointer hover:-translate-y-2 hover:bg-secondary-dark transition-all duration-300 group"
                >
                  <motion.div whileHover={{ rotate: 5, scale: 1.15 }} className="mb-2 opacity-90">
                    {renderActionIcon(act.icon)}
                  </motion.div>
                  <span className="text-[14px] font-medium tracking-wide text-center leading-tight">
                    {getActionLabel(act, lang)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Section: ข่าวสาร CIS */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex flex-col md:flex-row md:items-end justify-between mb-20 border-l-[8px] border-secondary pl-5"
            >
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-slate-800 tracking-tight uppercase">
                  {lang === 'EN' ? 'CIS News' : 'ข่าวสาร CIS'}
                </h2>
              </div>
              <button
                onClick={() => navigate('/news')}
                className="mt-4 md:mt-0 flex items-center text-secondary font-bold group"
              >
                <span className="bg-gradient-to-r from-current to-current bg-no-repeat bg-left-bottom bg-[length:0%_2px] group-hover:bg-[length:100%_2px] transition-[background-size] duration-300 pb-0.5">
                  {lang === 'EN' ? 'View All News' : 'ดูข่าวทั้งหมด'}
                </span>
                <ArrowRightCircle size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {newsList.length > 0 ? (
                newsList.map((item, index) => {
                  const displayTitle = lang === 'EN' && item.title_en ? item.title_en : item.title;
                  const displayTag = getCategoryLabel(item.category, lang);
                  const displayDate = formatNewsDate(item.rawDate, lang);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/news/${item.id}`)}
                      className={`w-full sm:max-w-[380px] mx-auto bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 flex flex-col group cursor-pointer border
                        ${item.isPinned ? 'border-indigo-100 bg-indigo-50/10' : 'border-slate-50'}`}
                    >
                      <div className="relative h-[220px] w-full overflow-hidden">
                        <img src={item.image} alt={displayTitle} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />

                        {/* Tag หมวดหมู่ */}
                        <div className="absolute top-4 left-4 bg-secondary text-white text-[10px] px-3 py-1.5 rounded-xl font-bold shadow-md">
                          {displayTag}
                        </div>

                        {/* ✨ Badge ข่าวด่วน (Urgent) */}
                        {item.isPinned && (
                          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                            <div className="bg-rose-500 text-white text-[10px] px-3 py-1.5 rounded-full font-black shadow-[0_0_15px_rgba(244,63,94,0.4)] uppercase tracking-wider flex items-center gap-1">
                              <AlertCircle size={12} strokeWidth={3} /> URGENT
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="px-7 pt-7 pb-6 flex flex-col flex-1 min-h-[190px]">
                        <div className="flex items-center text-slate-400 text-[12px] mb-4 font-bold uppercase tracking-wider">
                          <Clock size={14} className="mr-2 text-secondary/40" />
                          {lang === 'EN' ? 'Published : ' : 'ประกาศเมื่อ : '}{displayDate}
                        </div>
                        <h3 className="text-[17px] font-bold text-slate-800 leading-[1.6] mb-4 line-clamp-2 group-hover:text-secondary transition-colors">
                          {displayTitle}
                        </h3>

                        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-secondary text-[13px] font-bold">
                            {lang === 'EN' ? 'Read More' : 'อ่านรายละเอียด'}
                          </span>
                          <ArrowRightCircle size={18} className="text-slate-300 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-slate-400 col-span-full text-center py-20">
                  {lang === 'EN' ? 'No recent news available at this time' : 'ยังไม่มีข่าวประชาสัมพันธ์ล่าสุดในขณะนี้'}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Section: หลักสูตรแนะนำ */}
      <div className="bg-indigo-50/30 py-24 border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10">
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="flex items-center mb-20 border-l-[8px] border-secondary pl-5"
            >
              <h2 className="text-2xl md:text-4xl font-bold text-slate-800 tracking-tight uppercase">
                {lang === 'EN' ? 'Recommended Programs' : 'หลักสูตรแนะนำของเรา'}
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {courses.slice(0, 4).map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={index}
                  lang={lang}
                  onViewDetail={() => navigate(`/course-sections/${course.level}`)}
                />
              ))}
            </div>
            {/* ปริญญาเอก หรือหลักสูตรลำดับที่ 5 (จัดกึ่งกลาง) */}
            {courses[4] && (
              <div className="flex justify-center mt-12">
                <div className="w-full md:w-1/2">
                  <CourseCard
                    course={courses[4]}
                    index={4}
                    lang={lang}
                    onViewDetail={() => navigate(`/course-sections/${courses[4].level}`)}
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// คอมโพเนนต์การ์ดหลักสูตร
function CourseCard({ course, index = 0, lang, onViewDetail }) {
  const displayTitle = lang === 'EN' && course.enTitle ? course.enTitle : course.title;
  const displaySub = lang === 'EN' ? (course.title !== course.enTitle ? course.title : '') : course.enTitle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="bg-white p-8 rounded-[28px] shadow-[0_8px_30px_rgba(63,81,181,0.08)] border border-slate-100 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8 hover:shadow-xl transition-all duration-500 group"
    >
      <div className="w-full lg:w-56 h-56 rounded-3xl shrink-0 overflow-hidden bg-slate-50 shadow-inner">
        <img src={course.image} alt={displayTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      </div>
      <div className="flex flex-col justify-between py-2 flex-1 text-left">
        <div>
          <span className="text-xs text-slate-400 font-bold flex items-center mb-4 uppercase tracking-widest">
            <Calendar size={14} className="mr-2 text-indigo-300" />
            {lang === 'EN' ? 'Updated: ' : 'อัปเดตเมื่อ: '} {course.date}
          </span>
          <h4 className="text-slate-800 font-bold text-[20px] leading-[1.4] mb-4 group-hover:text-secondary transition-colors">{displayTitle}</h4>
          {displaySub && (
            <p className="text-[13px] text-slate-400 italic font-light leading-relaxed line-clamp-2 uppercase tracking-tight">{displaySub}</p>
          )}
        </div>
        <button
          onClick={onViewDetail}
          className="bg-secondary text-white text-[14px] px-10 py-3.5 rounded-full w-fit font-bold hover:bg-indigo-800 transition-all flex items-center shadow-lg hover:shadow-indigo-200 mt-8 active:scale-95"
        >
          <ArrowRightCircle size={18} className="mr-2" />
          {lang === 'EN' ? 'Program Details' : 'รายละเอียดหลักสูตร'}
        </button>
      </div>
    </motion.div>
  );
}