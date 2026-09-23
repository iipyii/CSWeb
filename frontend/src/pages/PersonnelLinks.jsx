import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
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
  ClipboardCheck,
  Globe,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const ICON_MAP = {
  Users: Users,
  Wallet: Wallet,
  BarChart3: BarChart3,
  Monitor: Monitor,
  MonitorPlay: MonitorPlay,
  ShieldCheck: ShieldCheck,
  Landmark: Landmark,
  HeartPulse: HeartPulse,
  GraduationCap: GraduationCap,
  UserCog: UserCog,
  CalendarDays: CalendarDays,
  FileEdit: FileEdit,
  FileSpreadsheet: FileSpreadsheet,
  ClipboardCheck: ClipboardCheck,
  Globe: Globe,
  BookOpen: BookOpen
};

const defaultLinkData = [
  { title: "ระบบเพื่องานทะเบียนนักศึกษา", icon_name: "Users", color: "text-rose-500", url: "https://reg.kmutnb.ac.th/" },
  { title: "สหกรณ์ออมทรัพย์", icon_name: "Wallet", color: "text-purple-500", url: "https://www.ppn-scc.com/" },
  { title: "ระบบเพื่อรายงานข้อมูลและสถิตินักศึกษา", icon_name: "BarChart3", color: "text-blue-500", url: "https://ureport.kmutnb.ac.th/" },
  { title: "Microsoft Azure Dev Tool for Teaching", icon_name: "Monitor", color: "text-orange-500", url: "https://login.microsoftonline.com/" },
  { title: "KMUTNB Online Learning", icon_name: "MonitorPlay", color: "text-amber-500", url: "https://www.kmutnb.ac.th/kmutnb-online-learning.aspx" },
  { title: "บริการซอฟต์แวร์ลิขสิทธิ์", icon_name: "ShieldCheck", color: "text-emerald-500", url: "https://software.kmutnb.ac.th/" },
  { title: "ระบบบริหารลูกหนี้เงินยืม", icon_name: "Landmark", color: "text-teal-600", url: "http://loan.kmutnb.ac.th/" },
  { title: "ระบบเบิกเงินสวัสดิการเกี่ยวกับการรักษาพยาบาล", icon_name: "HeartPulse", color: "text-cyan-600", url: "https://medical.kmutnb.ac.th/index.php?r=site%2Flogin" },
  { title: "ระบบสวัสดิการเกี่ยวกับการศึกษาของบุตร", icon_name: "GraduationCap", color: "text-pink-500", url: "https://edufee.kmutnb.ac.th/" },
  { title: "ระบบสารสนเทศทรัพยากรมนุษย์ : Human Resources Information System (HRIS)", icon_name: "UserCog", color: "text-stone-500", url: "https://hris.kmutnb.ac.th/web/site/contact" },
  { title: "ระบบลาออนไลน์", icon_name: "CalendarDays", color: "text-indigo-500", url: "https://pls.kmutnb.ac.th/site/login" },
  { title: "ระบบยื่นคำร้องสอนชดเชย", icon_name: "FileEdit", color: "text-orange-600", url: "https://reservation.sci.kmutnb.ac.th/auth/login" },
  { title: "แบบฟอร์มขออนุมัติตัวบุคคลและค่าใช้จ่าย", icon_name: "FileSpreadsheet", color: "text-blue-700", url: "https://docs.google.com/forms/" },
  { title: "ระบบส่งเอกสาร OBE และ IDP", icon_name: "ClipboardCheck", color: "text-orange-500", url: "https://cs.kmutnb.ac.th/login.jsp" }
];

export default function PersonnelLinks() {
  const { t } = useLanguage();
  const [links, setLinks] = useState(defaultLinkData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/personnel-links');
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setLinks(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load personnel links:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              {t('nav_personnel_links') || 'ลิงก์สำหรับบุคลากร'}
            </h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* Links Grid Area */}
      <main className="max-w-6xl mx-auto w-full px-6 md:px-10 py-16 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="animate-spin mb-4 text-[#3F51B5]" size={32} />
            <p>กำลังดึงข้อมูลลิงก์...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {links.map((item, index) => {
              const IconComp = ICON_MAP[item.icon_name] || Globe;
              return (
                <motion.a
                  key={item.id || index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all flex flex-col items-center text-center group"
                >
                  {/* Icon Container */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                    <div className={`scale-125 group-hover:scale-150 transition-transform duration-300 ${item.color || 'text-indigo-600'}`}>
                      <IconComp size={24} />
                    </div>
                  </div>
                  {/* Link Title */}
                  <h3 className="text-[15px] font-bold text-slate-700 leading-relaxed group-hover:text-[#3F51B5] transition-colors">
                    {item.title}
                  </h3>
                </motion.a>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}