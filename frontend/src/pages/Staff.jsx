import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, RefreshCw } from 'lucide-react';
import Footer from '../components/Footer';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

export default function Staff() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // กำหนด Base URL ของ Backend (ปรับตามจริง)
  const BASE_URL = "http://localhost:5000";

  const fetchStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/staff`);
      if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      const data = await response.json();
      setStaffData(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // ฟังก์ชันจัดการ Path รูปภาพให้ถูกต้อง (ลบ backslash และป้องกัน double slash)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
    return `${BASE_URL}/${cleanPath}`;
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-700 flex flex-col">
      
      {/* 🏛️ Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
              <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">บุคลากรสายสนับสนุน</h1>
                  <div className="w-12 h-1 bg-white/30 mb-5"></div>
                </motion.div>
              </div>
              <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                <h2 className="text-[5rem] font-bold">CIS</h2>
              </div>
            </section>

      <main className="max-w-7xl mx-auto w-full px-6 md:px-10 py-16 flex-grow">
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-slate-400"
            >
              <RefreshCw className="animate-spin mb-4" size={32} />
              <p>กำลังดึงข้อมูลจากฐานข้อมูล...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              className="text-center py-20"
            >
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={fetchStaff}
                className="px-6 py-2 bg-[#3F51B5] text-white rounded-full text-sm font-bold shadow-lg active:scale-95 transition-all"
              >
                ลองใหม่อีกครั้ง
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10"
            >
              {staffData.map((staff) => (
                <motion.div
                  key={staff.id}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col"
                >
                  {/* Image Area */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                    <img 
                      src={getImageUrl(staff.image_path)} 
                      alt={staff.fullname_th} 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback Icon */}
                    <div className="hidden w-full h-full items-center justify-center text-slate-300">
                      <User size={80} strokeWidth={1} />
                    </div>
                    
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3F51B5]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>

                  {/* Content Area */}
                  <div className="p-8 text-center flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-slate-800 font-bold text-lg mb-1 group-hover:text-[#3F51B5] transition-colors leading-tight">
                        {staff.fullname_th}
                      </h3>
                      <p className="text-slate-400 text-[11px] mb-3 font-medium uppercase tracking-tight italic">
                        {staff.fullname_en}
                      </p>
                      <div className="inline-block px-4 py-1 bg-slate-50 rounded-full mb-6">
                        <p className="text-[#3F51B5] text-xs font-bold uppercase tracking-wide">
                          {staff.position_th}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-50">
                      <a
                        href={`mailto:${staff.email}`}
                        className="inline-flex items-center gap-2 min-h-[44px] px-2 -mx-2 text-slate-400 hover:text-[#3F51B5] transition-all text-xs group/mail"
                      >
                        <div className="p-2 bg-slate-50 rounded-lg group-hover/mail:bg-indigo-50 transition-colors">
                          <Mail size={14} className="group-hover/mail:scale-110 transition-transform" />
                        </div>
                        <span className="truncate font-medium">{staff.email}</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
}