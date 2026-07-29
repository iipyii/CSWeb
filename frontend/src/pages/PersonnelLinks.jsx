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
  { title: "สหกรณ์ออมทรัพย์", icon: <Wallet className="text-purple-500" />, url: "https://www.ppn-scc.com/" },
  { title: "ระบบเพื่อรายงานข้อมูลและสถิตินักศึกษา", icon: <BarChart3 className="text-blue-500" />, url: "https://ureport.kmutnb.ac.th/" },
  { title: "Microsoft Azure Dev Tool for Teaching", icon: <Monitor className="text-orange-500" />, url: "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?client_id=8e0e8db5-b713-4e91-98e6-470fed0aa4c2&response_type=code%20id_token&scope=openid%20profile&state=OpenIdConnect.AuthenticationProperties%3D4_ygztJC8Cgpcw9_yX7Ac4k0WHB31OE7EW_WrRVASPjbUNyI679kYPMOhBTNc2nIMOtSIzrvhv2sjhfS9OzjxZUSJHxuMyfKXciyUPIBFqGw-vlxWj0rRs2V_jVf6eKN20oEZ-v--ZaSACYltUGLtMVJIEDeAEFptP0Vi5KMTwLKF-h5XFzS4frHjkRf-5t9&response_mode=form_post&nonce=639086171108057923.ZDMwZjllNmUtNDNhZC00YTRkLTgwNjktY2UyYjdkNjYxYTA3YjZjZTdkMTUtZTNkNC00NzYxLWIzZjktYTM5NDEwN2FhMmZi&redirect_uri=https%3A%2F%2Fsignup.azure.com%2Fapi%2Fuser%2Flogin&max_age=86400&post_logout_redirect_uri=https%3A%2F%2Fsignup.azure.com%2Fstudentverification%3FofferType%3D1&x-client-SKU=ID_NET472&x-client-ver=8.3.0.0&sso_reload=true" },
  { title: "KMUTNB Online Learning", icon: <MonitorPlay className="text-amber-500" />, url: "https://www.kmutnb.ac.th/kmutnb-online-learning.aspx" },
  { title: "บริการซอฟต์แวร์ลิขสิทธิ์", icon: <ShieldCheck className="text-emerald-500" />, url: "https://software.kmutnb.ac.th/" },
  { title: "ระบบบริหารลูกหนี้เงินยืม", icon: <Landmark className="text-teal-600" />, url: "http://loan.kmutnb.ac.th/" },
  { title: "ระบบเบิกเงินสวัสดิการเกี่ยวกับการรักษาพยาบาล", icon: <HeartPulse className="text-cyan-600" />, url: "https://medical.kmutnb.ac.th/index.php?r=site%2Flogin" },
  { title: "ระบบสวัสดิการเกี่ยวกับการศึกษาของบุตร", icon: <GraduationCap className="text-pink-500" />, url: "https://edufee.kmutnb.ac.th/" },
  { title: "ระบบสารสนเทศทรัพยากรมนุษย์ : Human Resources Information System (HRIS)", icon: <UserCog className="text-stone-500" />, url: "https://hris.kmutnb.ac.th/web/site/contact" },
  { title: "ระบบลาออนไลน์", icon: <CalendarDays className="text-indigo-500" />, url: "https://pls.kmutnb.ac.th/site/login" },
  { title: "ระบบยื่นคำร้องสอนชดเชย", icon: <FileEdit className="text-orange-600" />, url: "https://reservation.sci.kmutnb.ac.th/auth/login" },
  { title: "แบบฟอร์มขออนุมัติตัวบุคคลและค่าใช้จ่าย", icon: <FileSpreadsheet className="text-blue-700" />, url: "https://docs.google.com/forms/d/e/1FAIpQLSfu4s3T6sO2XLPKsKOtEDga00z01cg2W5FzxsnAJZGY6pphUw/viewform" },
  { title: "ระบบส่งเอกสาร OBE และ IDP", icon: <ClipboardCheck className="text-orange-500" />, url: "https://cs.kmutnb.ac.th/login.jsp" }
];

export default function PersonnelLinks() {
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
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ลิงก์สำหรับบุคลากร</h1>
                  <div className="w-12 h-1 bg-white/30 mb-5"></div>
                </motion.div>
              </div>
              <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                <h2 className="text-[5rem] font-bold">CIS</h2>
              </div>
            </section>

      {/* Links Grid Area */}
      <main className="max-w-6xl mx-auto w-full px-6 md:px-10 py-16 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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