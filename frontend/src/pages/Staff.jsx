import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, User } from 'lucide-react';
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

  // URL ของ Backend
  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/staff`);
        const data = await response.json();
        setStaffData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching staff:", error);
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // ฟังก์ชันสำหรับจัดการ Path รูปภาพให้ถูกต้อง
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // เปลี่ยน backslash เป็น forward slash และต่อเข้ากับ BASE_URL
    const cleanPath = imagePath.replace(/\\/g, '/');
    return `${BASE_URL}${cleanPath}`;
  };

  return (
    <div className="bg-slate-50 font-['Prompt'] min-h-screen text-slate-700">
      
      {/* Hero Section */}
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
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none text-white">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-20">
        
        {loading ? (
          <div className="text-center py-10">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {staffData.map((staff, idx) => (
              <motion.div
                key={staff.id}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Image Area */}
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-200">
                  <img 
                    src={getImageUrl(staff.image_path)} 
                    alt={staff.fullname_th} 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback Icon เมื่อไม่มีรูปหรือโหลดไม่ขึ้น */}
                  <div className="hidden w-full h-full items-center justify-center text-slate-400">
                    <User size={80} />
                  </div>
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3F51B5]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content Area */}
                <div className="p-6 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-slate-800 font-bold text-base mb-1 group-hover:text-[#3F51B5] transition-colors">
                      {staff.fullname_th}
                    </h3>
                    <p className="text-slate-500 text-[10px] mb-2 font-medium uppercase italic">
                      {staff.fullname_en}
                    </p>
                    <p className="text-[#3F51B5] text-xs font-bold mb-4 uppercase tracking-wide">
                      {staff.position_th}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-50">
                    <a 
                      href={`mailto:${staff.email}`}
                      className="inline-flex items-center gap-2 text-slate-400 hover:text-[#3F51B5] transition-colors text-xs"
                    >
                      <Mail size={14} />
                      <span className="truncate">{staff.email}</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}