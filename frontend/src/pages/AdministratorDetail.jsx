import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, GraduationCap, BookOpen, ChevronLeft } from 'lucide-react';
import Footer from '../components/Footer';

// ฐานข้อมูลจำลองสำหรับดึงข้อมูลมาแสดงผล
const staffDatabase = {
  "รศดรธนภัทร์-อนุศาสน์อมรกุล": {
    name: "รองศาสตราจารย์ ดร.ธนภัทร์ อนุศาสน์อมรกุล (TNA)",
    engName: "Associate Professor Tanapat Anusas-amornkul, Ph.D.",
    image: "/img/staff/tanapat.jpg",
    email: "tanapat.a@sci.kmutnb.ac.th",
    phone: "0-2555-2000 ต่อ 4621",
    education: [
      "ปริญญาเอก Ph.D. (Information Science), University of Pittsburgh, USA",
      "ปริญญาโท MS. (Telecommunications), University of Colorado at Boulder, USA",
      "ปริญญาตรี วศ.บ. (วิศวกรรมไฟฟ้า) มหาวิทยาลัยเกษตรศาสตร์"
    ],
    publications: [
      "N. Bussabong and T. Anusas-amornkul, \"Enhanced Keystroke Dynamics Authentication Using Keystroke Vector Dissimilarity,\" 2023 15th International Conference on Information Technology and Electrical Engineering (ICITEE), Chiang Mai, Thailand, 2023, pp. 223-228.",
      "T. Anusas-amornkul, K. Intarak and B. Limthanmaphon, \"Security Enhancement on ECC Dynamic Point Encoding for IoT,\" 2020 Fourth World Conference on Smart Trends in Systems, Security and Sustainability (WorldS4), London, UK, 2020, pp. 443-448."
    ]
  }
  // คุณสามารถเพิ่มข้อมูลอาจารย์ท่านอื่นลงใน Object นี้ได้โดยใช้ชื่อเป็น Key
};

export default function AdministratorDetail() {
  const { staffName } = useParams();
  const navigate = useNavigate();
  
  // ดึงข้อมูลตามชื่อจาก URL ถ้าไม่พบจะแสดงข้อมูลของหัวหน้าภาคเป็นตัวอย่าง (Fallback)
  const profile = staffDatabase[staffName] || staffDatabase["รศดรธนภัทร์-อนุศาสน์อมรกุล"];

  return (
    <div className="bg-white font-['Prompt'] min-h-screen text-slate-700">
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        
        {/* Navigation - ปุ่มย้อนกลับ */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-[#3F51B5] transition-colors mb-12 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">ย้อนกลับหน้าบุคลากร</span>
        </button>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
          
          {/* ส่วนข้อมูลด้านซ้าย (รูปภาพและช่องทางการติดต่อ) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-1/3 md:sticky md:top-24"
          >
            <div className="rounded-[2rem] overflow-hidden shadow-2xl mb-8 border-[10px] border-slate-50 bg-slate-100 aspect-[3/4]">
              <img 
                src={profile.image} 
                alt={profile.name} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "/img/staff/default-avatar.jpg"; }}
              />
            </div>
            
            <div className="space-y-4 px-2">
              <div className="flex items-center gap-4 text-sm group">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3F51B5] group-hover:bg-[#3F51B5] group-hover:text-white transition-colors">
                  <Mail size={18} />
                </div>
                <a href={`mailto:${profile.email}`} className="text-slate-600 hover:text-[#3F51B5] hover:underline transition-colors break-all">
                  {profile.email}
                </a>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={18} />
                </div>
                <span className="text-slate-600">{profile.phone}</span>
              </div>
            </div>
          </motion.div>

          {/* ส่วนข้อมูลด้านขวา (ประวัติและผลงานวิชาการ) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-2/3"
          >
            <div className="mb-12 border-b border-slate-100 pb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 leading-tight">
                {profile.name}
              </h1>
              <p className="text-lg md:text-xl text-[#3F51B5] font-light italic leading-relaxed">
                {profile.engName}
              </p>
            </div>

            {/* ส่วนวุฒิการศึกษา */}
            <section className="mb-16">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-[#3F51B5] rounded-full"></div>
                <GraduationCap className="text-[#3F51B5]" /> วุฒิการศึกษา
              </h2>
              <ul className="space-y-4">
                {profile.education.map((edu, index) => (
                  <li key={index} className="flex gap-4 items-start text-slate-600">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0"></span>
                    <span className="text-base md:text-lg font-light leading-relaxed">{edu}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ส่วนผลงานทางวิชาการ */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-[#3F51B5] rounded-full"></div>
                <BookOpen className="text-[#3F51B5]" /> ผลงานทางวิชาการ
              </h2>
              <div className="space-y-10">
                <div>
                  <h3 className="text-[#3F51B5] font-bold text-xs uppercase tracking-[0.2em] mb-6 opacity-80">
                    International Conferences
                  </h3>
                  <ul className="space-y-8">
                    {profile.publications.map((pub, index) => (
                      <li key={index} className="relative pl-8 border-l border-slate-100 pb-2">
                        <div className="absolute left-[-5.5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-100 border-2 border-white"></div>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-light italic">
                          {pub}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}