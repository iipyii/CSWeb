import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Wallet, 
  BarChart3, 
  Monitor, 
  MonitorPlay, 
  ShieldCheck, 
  Landmark, 
  HeartPulse, 
  GraduationCap, 
  UserCog, 
  CalendarDays, 
  FileEdit, 
  FileSpreadsheet, 
  ClipboardCheck 
} from 'lucide-react';
import Footer from '../components/Footer';

const linkData = [
  { title: "ระบบเพื่องานทะเบียนนักศึกษา", icon: <Users className="text-rose-500" />, url: "https://reg.kmutnb.ac.th/" },
  { title: "สหกรณ์ออมทรัพย์", icon: <Wallet className="text-purple-500" />, url: "https://www.coop.kmutnb.ac.th/" },
  { title: "ระบบเพื่อรายงานข้อมูลและสถิตินักศึกษา", icon: <BarChart3 className="text-blue-500" />, url: "https://mis.kmutnb.ac.th/" },
  { title: "Microsoft Azure Dev Tool for Teaching", icon: <Monitor className="text-orange-500" />, url: "https://azureforeducation.microsoft.com/" },
  { title: "KMUTNB Online Learning", icon: <MonitorPlay className="text-amber-500" />, url: "https://moodle.kmutnb.ac.th/" },
  { title: "บริการซอฟต์แวร์ลิขสิทธิ์", icon: <ShieldCheck className="text-emerald-500" />, url: "https://icit.kmutnb.ac.th/services/software-license/" },
  { title: "ระบบบริหารลูกหนี้เงินยืม", icon: <Landmark className="text-teal-600" />, url: "https://finance.kmutnb.ac.th/" },
  { title: "ระบบเบิกเงินสวัสดิการเกี่ยวกับการรักษาพยาบาล", icon: <HeartPulse className="text-cyan-600" />, url: "https://hris.kmutnb.ac.th/" },
  { title: "ระบบสวัสดิการเกี่ยวกับการศึกษาของบุตร", icon: <GraduationCap className="text-pink-500" />, url: "https://hris.kmutnb.ac.th/" },
  { title: "ระบบสารสนเทศทรัพยากรมนุษย์ : Human Resources Information System (HRIS)", icon: <UserCog className="text-stone-500" />, url: "https://hris.kmutnb.ac.th/" },
  { title: "ระบบลาออนไลน์", icon: <CalendarDays className="text-indigo-500" />, url: "https://hris.kmutnb.ac.th/" },
  { title: "ระบบยื่นคำร้องสอนชดเชย", icon: <FileEdit className="text-orange-600" />, url: "https://acdserv.kmutnb.ac.th/" },
  { title: "แบบฟอร์มขออนุมัติตัวบุคคลและค่าใช้จ่าย", icon: <FileSpreadsheet className="text-blue-700" />, url: "https://finance.kmutnb.ac.th/" },
  { title: "ระบบส่งเอกสาร OBE และ IDP", icon: <ClipboardCheck className="text-orange-500" />, url: "https://obe.kmutnb.ac.th/" }
];

export default function PersonnelLinks() {
  return (
    <div className="bg-slate-50 font-['Prompt'] min-h-screen flex flex-col">
      
      {/* Hero Section */}
            <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
              <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ลิงก์สำหรับบุคลากร</h1>
                  <div className="w-12 h-1 bg-white/30 mb-5"></div>
                </motion.div>
              </div>
              <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                <h2 className="text-[5rem] font-bold">CIS</h2>
              </div>
            </section>

      {/* Links Grid Area */}
      <main className="max-w-6xl mx-auto w-full px-6 py-16 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {linkData.map((item, index) => (
            <motion.a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center text-center group"
            >
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                <div className="scale-125 group-hover:scale-150 transition-transform duration-300">
                  {item.icon}
                </div>
              </div>
              {/* Link Title */}
              <h3 className="text-[15px] font-bold text-slate-700 leading-relaxed group-hover:text-[#3F51B5] transition-colors">
                {item.title}
              </h3>
            </motion.a>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}