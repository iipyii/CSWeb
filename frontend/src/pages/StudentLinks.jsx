import React from 'react';
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
  Link2 
} from 'lucide-react';
import Footer from '../components/Footer';

const studentLinkData = [
  { title: "ตารางสอน/ตารางสอบ", icon: <Table2 className="text-rose-400" />, url: "https://reg.kmutnb.ac.th/" },
  { title: "ปฏิทินการศึกษา", icon: <CalendarDays className="text-orange-400" />, url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบการชำระเงินนักศึกษาใหม่", icon: <BadgeDollarSign className="text-amber-500" />, url: "https://newstudent.kmutnb.ac.th/Student/StudentLogin.aspx" },
  { title: "ระบบขึ้นทะเบียนนักศึกษาใหม่", icon: <UserPlus className="text-orange-500" />, url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบลงทะเบียน", icon: <UserCheck className="text-amber-500" />, url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบดูผลการเรียน", icon: <FileText className="text-emerald-400" />, url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบประเมินการสอน", icon: <ClipboardList className="text-teal-400" />, url: "https://assessment.kmutnb.ac.th/" },
  { title: "ระบบคำร้องออนไลน์", icon: <MessageSquareMore className="text-cyan-500" />, url: "https://reg.kmutnb.ac.th/" },
  { title: "ระบบขอเอกสารสำคัญทางการศึกษา", icon: <ShieldAlert className="text-rose-400" />, url: "http://e-service.acdserv.kmutnb.ac.th/regReqDoc/login/" },
  { title: "ระบบ e-Studentloan สำหรับผู้กู้ กยศ. และ กรอ.", icon: <Landmark className="text-blue-400" />, url: "https://eservices.studentloan.or.th/SLFSTUDENT/html/index.html" },
  { title: "บริการซอฟต์แวร์ลิขสิทธิ์", icon: <ShieldCheck className="text-cyan-500" />, url: "https://icit.kmutnb.ac.th/services/software-license/" },
  { title: "บัณฑิตวิทยาลัย", icon: <GraduationCap className="text-rose-400" />, url: "https://www.grad.kmutnb.ac.th/index.php" },
  { title: "แบบฟอร์มขออนุมัติตัวนักศึกษา", icon: <Link2 className="text-indigo-600" />, url: "https://docs.google.com/forms/d/e/1FAIpQLSfBW8Dj47DlKvgdTu2EHHeQpTrCeBlJP0yu_lbuDPC4gn-8fA/viewform?vc=0&c=0&w=1&flr=0" },
];

export default function StudentLinks() {
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

      <main className="max-w-6xl mx-auto w-full px-6 py-16 flex-grow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentLinkData.map((item, index) => (
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
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
                <div className="scale-125 group-hover:scale-150 transition-transform duration-300">
                  {item.icon}
                </div>
              </div>

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