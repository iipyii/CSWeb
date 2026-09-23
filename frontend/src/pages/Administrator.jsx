import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Administrator() {
  const { t } = useLanguage();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/lecturers")
      .then(res => {
        setLecturers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/placeholder-user.png";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    return `http://localhost:5000${imagePath.startsWith("/") ? imagePath : "/" + imagePath}`;
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium text-sm">กำลังโหลดข้อมูลบุคลากรสายวิชาการ...</p>
        </div>
      </div>
    );
  }

  // 🔥 แบ่งกลุ่มจากตำแหน่ง
  const head = lecturers.find(l => 
    l.position_en === "Head of Department" || 
    l.position_th?.includes("หัวหน้าภาควิชา") && !l.position_th?.includes("รอง") && !l.position_th?.includes("ผู้ช่วย")
  );
  
  const deputy = lecturers.find(l => 
    l.position_en === "Associate Head of Department" || 
    (l.position_th?.includes("รองหัวหน้าภาควิชา") && l.id !== head?.id)
  );

  const assistants = lecturers.filter(l =>
    (l.position_en?.includes("Assistant to the Head") || l.position_th?.includes("ผู้ช่วยหัวหน้าภาควิชา")) &&
    l.id !== head?.id && 
    l.id !== deputy?.id
  );

  const faculty = lecturers.filter(l =>
    l.id !== head?.id &&
    l.id !== deputy?.id &&
    !assistants.some(a => a.id === l.id)
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-700">
      
      {/* Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              {t('nav_lecturers') || 'บุคลากรสายวิชาการ'}
            </h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {/* คณะผู้บริหาร (Executive Section) */}
        {(head || deputy || assistants.length > 0) && (
          <section className="mb-24 text-center">
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#3F51B5]">ผู้บริหารภาควิชา</h2>
              <div className="w-16 h-1 bg-[#3F51B5] mx-auto mt-4"></div>
            </div>
            
            {/* แถวที่ 1: หัวหน้าภาควิชา */}
            {head && (
              <div className="flex justify-center mb-16">
                <Link to={`/administrator/${head.lecturer_code}`} className="group block">
                  <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" className="flex flex-col items-center">
                    <div className="relative aspect-[3/4] w-64 mb-6 rounded-3xl overflow-hidden shadow-xl border-4 border-[#3F51B5]/20 bg-white group-hover:-translate-y-2 transition-all duration-300">
                      <img
                        src={getImageUrl(head.image_path)}
                        alt={head.fullname_th}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src = "/img/placeholder-user.png"; }}
                      />
                    </div>
                    
                    <div className="w-full max-w-[400px] text-center px-4">
                      <h3 className="font-bold text-base md:text-[17px] text-slate-800 group-hover:text-[#3F51B5] whitespace-nowrap">
                        {head.fullname_th}
                      </h3>
                      <p className="text-[#3F51B5] font-bold text-sm uppercase tracking-wide mt-1">
                        {head.position_th}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </div>
            )}

            {/* แถวที่ 2: รองหัวหน้าภาควิชา */}
            {deputy && (
              <div className="flex justify-center mb-16">
                <Link to={`/administrator/${deputy.lecturer_code}`} className="group block">
                  <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" className="flex flex-col items-center">
                    <div className="relative aspect-[3/4] w-64 mb-6 rounded-3xl overflow-hidden shadow-xl border-4 border-[#3F51B5]/20 bg-white group-hover:-translate-y-2 transition-all duration-300">
                      <img
                        src={getImageUrl(deputy.image_path)}
                        alt={deputy.fullname_th}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src = "/img/placeholder-user.png"; }}
                      />
                    </div>
                    
                    <div className="w-full max-w-[400px] text-center px-4">
                      <h3 className="font-bold text-base md:text-[17px] text-slate-800 group-hover:text-[#3F51B5] whitespace-nowrap">
                        {deputy.fullname_th}
                      </h3>
                      <p className="text-[#3F51B5] font-bold text-sm uppercase tracking-wide mt-1">
                        {deputy.position_th}
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </div>
            )}

            {/* แถวที่ 3: ผู้ช่วยหัวหน้าภาควิชา */}
            {assistants.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {assistants.map((staff) => (
                  <Link 
                    key={staff.lecturer_code}
                    to={`/administrator/${staff.lecturer_code}`}
                    className="group block"
                  >
                    <motion.div 
                      variants={fadeInUp} 
                      initial="hidden" 
                      whileInView="visible"
                      className="flex flex-col items-center"
                    >
                      <div className="relative aspect-[3/4] w-48 mb-6 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300">
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <img
                            src={getImageUrl(staff.image_path)}
                            alt={staff.fullname_th}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => { e.target.src = "/img/placeholder-user.png"; }}
                          />
                        </div>
                      </div>

                      <div className="w-full max-w-[280px] text-center px-2">
                        <h4 className="font-bold text-slate-800 text-[14px] md:text-[15px] group-hover:text-[#3F51B5] transition-colors">
                          {staff.fullname_th}
                        </h4>
                        <p className="text-[11px] text-[#3F51B5] font-black uppercase tracking-tighter mt-1.5 leading-tight">
                          {staff.position_th}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {/* คณาจารย์ประจำ (Faculty Section) */}
        <section className="text-center">
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#3F51B5]">คณาจารย์</h2>
            <div className="w-16 h-1 bg-[#3F51B5] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {faculty.map((staff) => (
              <Link 
                key={staff.lecturer_code} 
                to={`/administrator/${staff.lecturer_code}`} 
                className="group block text-center"
              >
                <motion.div 
                  variants={fadeInUp} 
                  initial="hidden" 
                  whileInView="visible"
                  className="flex flex-col items-center"
                >
                  <div className="relative aspect-[3/4] w-48 mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white group-hover:shadow-lg group-hover:-translate-y-2 transition-all duration-300">
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                      <img
                        src={getImageUrl(staff.image_path)}
                        alt={staff.fullname_th}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => { e.target.src = "/img/placeholder-user.png"; }}
                      />
                    </div>
                  </div>

                  <div className="w-full max-w-[260px] px-1">
                    <h4 className="font-bold text-slate-800 text-[13.5px] md:text-[14px] group-hover:text-[#3F51B5] transition-colors">
                      {staff.fullname_th}
                    </h4>
                    <p className="text-[11px] text-[#3F51B5] font-medium mt-1.5 opacity-80">
                      {staff.position_th || "อาจารย์ประจำ"}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}