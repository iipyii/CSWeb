import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Settings } from 'lucide-react';
import Footer from '../components/Footer';

// ข้อมูลบุคลากรสายสนับสนุน 
const supportStaff = [
  {
    name: "นางสาวอาลิษา หุ่นไทย",
    role: "เจ้าหน้าที่บริหารงานทั่วไป",
    email: "alisa.h@sci.kmutnb.ac.th",
    image: "/img/staff/staff-alisa.jpg"
  },
  {
    name: "นางสาวจันทิมา อรรฆรุจิรัตน์",
    role: "นักวิชาการศึกษา",
    email: "jantima.p@sci.kmutnb.ac.th",
    image: "/img/staff/staff-jantima.jpg"
  },
  {
    name: "นายเกรียงไกร เอี่ยมวงค์",
    role: "ช่างเทคนิค",
    email: "kriangkrai.a@sci.kmutnb.ac.th",
    image: "/img/staff/staff-kriangkrai.jpg"
  },
  {
    name: "นายนที ปัญญาประสิทธิ์",
    role: "เจ้าหน้าที่บริหารงานทั่วไป",
    email: "natee.p@sci.kmutnb.ac.th",
    image: "/img/staff/staff-natee.jpg"
  },
  {
    name: "นางสาวอุษณีย์ บัลลังน้อย",
    role: "นักวิชาการคอมพิวเตอร์",
    email: "ousanee.b@sci.kmutnb.ac.th",
    image: "/img/staff/staff-ousanee.jpg"
  },
  {
    name: "นายปิยศิวเณศ์ พุ่มไสว",
    role: "เจ้าหน้าที่บริหารงานทั่วไป",
    email: "piyasiwanet.p@sci.kmutnb.ac.th",
    image: "/img/staff/staff-piyasiwanet.png"
  }
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

export default function Staff() {
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
          <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
            <h2 className="text-[5rem] font-bold">CIS</h2>
          </div>
        </section>

      <main className="max-w-7xl mx-auto px-6 py-20">

        {/* Support Staff Grid - รูปภาพขนาดใหญ่สัดส่วน Portrait 3:4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {supportStaff.map((staff, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Image Area */}
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                <img 
                  src={staff.image} 
                  alt={staff.name} 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center text-slate-300">
                  <User size={64} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#3F51B5]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content Area */}
              <div className="p-6 text-center flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-slate-800 font-bold text-base mb-1 group-hover:text-[#3F51B5] transition-colors">
                    {staff.name}
                  </h3>
                  <p className="text-[#3F51B5] text-xs font-bold mb-4 uppercase tracking-wide">
                    {staff.role}
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

      </main>

      <Footer />
    </div>
  );
}