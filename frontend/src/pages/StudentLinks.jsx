import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Table2, 
  CalendarDays, 
  BadgeDollarSign, 
  UserPlus, 
  UserCheck, 
  FileText, 
  ClipboardList, 
  MessageSquareMore, 
  ShieldAlert, 
  Landmark, 
  ShieldCheck, 
  GraduationCap, 
  Link2,
  Globe,
  BookOpen,
  Monitor,
  Award,
  Sparkles,
  Heart,
  Bell,
  Loader2
} from 'lucide-react';
import Footer from '../components/Footer';
import axios from 'axios';

const ICON_MAP = {
  Table2: <Table2 size={28} />,
  CalendarDays: <CalendarDays size={28} />,
  BadgeDollarSign: <BadgeDollarSign size={28} />,
  UserPlus: <UserPlus size={28} />,
  UserCheck: <UserCheck size={28} />,
  FileText: <FileText size={28} />,
  ClipboardList: <ClipboardList size={28} />,
  MessageSquareMore: <MessageSquareMore size={28} />,
  ShieldAlert: <ShieldAlert size={28} />,
  Landmark: <Landmark size={28} />,
  ShieldCheck: <ShieldCheck size={28} />,
  GraduationCap: <GraduationCap size={28} />,
  Link2: <Link2 size={28} />,
  Globe: <Globe size={28} />,
  BookOpen: <BookOpen size={28} />,
  Monitor: <Monitor size={28} />,
  Award: <Award size={28} />,
  Sparkles: <Sparkles size={28} />,
  Heart: <Heart size={28} />,
  Bell: <Bell size={28} />,
};

const defaultStudentLinks = [
  { title: "ตารางสอน/ตารางสอบ", icon_name: "Table2", color: "text-rose-400", url: "https://reg.kmutnb.ac.th/" },
  { title: "ปฏิทินการศึกษา", icon_name: "CalendarDays", color: "text-orange-400", url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบการชำระเงินนักศึกษาใหม่", icon_name: "BadgeDollarSign", color: "text-amber-500", url: "https://newstudent.kmutnb.ac.th/Student/StudentLogin.aspx" },
  { title: "ระบบขึ้นทะเบียนนักศึกษาใหม่", icon_name: "UserPlus", color: "text-orange-500", url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบลงทะเบียน", icon_name: "UserCheck", color: "text-amber-500", url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบดูผลการเรียน", icon_name: "FileText", color: "text-emerald-400", url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบประเมินการสอน", icon_name: "ClipboardList", color: "text-teal-400", url: "https://assessment.kmutnb.ac.th/" },
  { title: "ระบบคำร้องออนไลน์", icon_name: "MessageSquareMore", color: "text-cyan-500", url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบขอเอกสารสำคัญทางการศึกษา", icon_name: "ShieldAlert", color: "text-rose-400", url: "http://e-service.acdserv.kmutnb.ac.th/regReqDoc/login/" },
  { title: "ระบบ e-Studentloan สำหรับผู้กู้ กยศ. และ กรอ.", icon_name: "Landmark", color: "text-blue-400", url: "https://eservices.studentloan.or.th/SLFSTUDENT/html/index.html" },
  { title: "บริการซอฟต์แวร์ลิขสิทธิ์", icon_name: "ShieldCheck", color: "text-cyan-500", url: "https://icit.kmutnb.ac.th/services/software-license/" },
  { title: "บัณฑิตวิทยาลัย", icon_name: "GraduationCap", color: "text-rose-400", url: "https://www.grad.kmutnb.ac.th/index.php" },
  { title: "แบบฟอร์มขออนุมัติตัวนักศึกษา", icon_name: "Link2", color: "text-indigo-600", url: "https://docs.google.com/forms/d/e/1FAIpQLSfBW8Dj47DlKvgdTu2EHHeQpTrCeBlJP0yu_lbuDPC4gn-8fA/viewform?vc=0&c=0&w=1&flr=0" },
];

export default function StudentLinks() {
  const [links, setLinks] = useState(defaultStudentLinks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/student-links")
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setLinks(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Fetch student links error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const renderIcon = (iconName, colorClass) => {
    const icon = ICON_MAP[iconName] || <Link2 size={28} />;
    return <span className={colorClass || 'text-indigo-600'}>{icon}</span>;
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden text-left">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ลิงก์สำหรับนักศึกษา</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-6xl mx-auto w-full px-6 md:px-10 py-16 flex-grow">
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <Loader2 className="animate-spin text-[#3F51B5] mx-auto" size={32} />
            <p className="text-xs">กำลังโหลดข้อมูลลิงก์...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {links.map((item, index) => (
              <motion.a
                key={item.id || index}
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
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                  <div className="scale-110 group-hover:scale-125 transition-transform duration-300">
                    {renderIcon(item.icon_name, item.color)}
                  </div>
                </div>

                <h3 className="text-[15px] font-bold text-slate-700 leading-relaxed group-hover:text-[#3F51B5] transition-colors">
                  {item.title}
                </h3>
              </motion.a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}