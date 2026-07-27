import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft
} from 'lucide-react';
import Footer from '../components/Footer';

export default function StudentAffairsRegs() {
  const navigate = useNavigate();

  // 📝 ข้อมูลประกาศ-งานกิจการนักศึกษา
  const studentDocs = [
    { id: 1, title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนการศึกษาเพื่อศึกษาต่อในระดับบัณฑิตศึกษา คณะวิทยาศาสตร์ประยุกต์", file: "std_01.pdf" },
    { id: 2, title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนสนับสนุนบุคลากรเข้าร่วมแข่งขันสิ่งประดิษฐ์ นวัตกรรม หรือผลงานวิจัย ณ ต่างประเทศ คณะวิทยาศาสตร์ประยุกต์", file: "std_02.pdf" },
    { id: 3, title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนสนับสนุนเพื่อพัฒนาศักยภาพนักศึกษา คณะวิทยาศาสตร์ประยุกต์", file: "std_03.pdf" },
    { id: 4, title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนสนับสนุนเพื่อพัฒนาศักยภาพนักศึกษาระดับปริญญาตรี คณะวิทยาศาสตร์ประยุกต์ (ฉบับที่ 2)", file: "std_04.pdf" },
    { id: 5, title: "ประกาศมหาวิทยาลัย เรื่อง การให้ทุนสนับสนุนเพื่อพัฒนาศักยภาพนักศึกษาระดับปริญญาตรี คณะวิทยาศาสตร์ประยุกต์", file: "std_05.pdf" },
    { id: 6, title: "ประกาศมหาวิทยาลัย เรื่อง กำหนดประเภทและลักษณะความผิดวินัยนักศึกษา", file: "std_06.pdf" },
    { id: 7, title: "ประกาศมหาวิทยาลัย เรื่อง ลักษณะโทษความผิดวินัยนักศึกษากรณีดื่มสุราของมึนเมา หรือมั่วสุมสิ่งเสพติดและสูบบุหรี่ ภายในพื้นที่มหาวิทยาลัย", file: "std_07.pdf" },
    { id: 8, title: "ประกาศมหาวิทยาลัย เรื่อง สวัสดิการช่วยเหลือสำหรับนักศึกษาและบุคลากร ในช่วงการแพร่ระบาดของโรคติดเชื้อไวรัสโคโรนา 2019 (COVID-19) ต่อ", file: "std_08.pdf" },
    { id: 9, title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การลงทะเบียนเรียนซ้ำวิชาเรียนในรายวิชาที่สอบตกของนักศึกษาระดับปริญญาตรี", file: "std_09.pdf" },
    { id: 10, title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์และอัตราการจ้างนักศึกษาช่วยงานวิชาการ", file: "std_10.pdf" },
    { id: 11, title: "เรื่องแต่งตั้งคณะกรรมการบริหารงานกิจการนักศึกษาภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ ประจำปีการศึกษา 2568", file: "std_11.pdf" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
                    <div className="max-w-5xl mx-auto relative z-10">
                      <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ประกาศ-งานกิจการนักศึกษา</h1>
                        <div className="w-12 h-1 bg-white/30 mb-5"></div>
                      </motion.div>
                    </div>
            
                    {/* ลายน้ำพื้นหลัง */}
                    <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                      <h2 className="text-[5rem] font-bold">CIS</h2>
                    </div>
                  </section>


      {/* 📚 Document List Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-grow">
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
          
          {/* หัวตารางจำลอง */}
          <div className="hidden lg:grid grid-cols-12 gap-4 bg-slate-50/50 p-4 border-b border-slate-100 text-slate-400 font-bold text-[13px] uppercase tracking-wider">
            <div className="col-span-1 text-center">ลำดับ</div>
            <div className="col-span-9">รายการเอกสาร</div>
            <div className="col-span-2 text-center">ไฟล์</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-100">
            {studentDocs.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 lg:p-6 items-center hover:bg-slate-50/30 transition-colors group"
              >
                {/* ลำดับ */}
                <div className="hidden lg:block col-span-1 text-center font-bold text-slate-300">
                  {idx + 1}
                </div>

                {/* ✨ ชื่อเอกสาร: นำเส้นขีดใต้ตอน Hover ออกแล้ว */}
                <div className="col-span-12 lg:col-span-9">
                  <div className="flex items-start gap-4">
                    <span className="lg:hidden text-xs font-bold text-slate-300 mt-1 w-6">{idx + 1}</span>
                    {/* ลบ class group-hover:border-[#3F51B5]/20 ออก */}
                    <div className="border-b border-transparent pb-1 transition-all inline-block">
                      <span className="text-[15px] md:text-[16px] font-medium text-slate-700 leading-relaxed group-hover:text-[#3F51B5] transition-colors">
                        {doc.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ปุ่มเปิดดู PDF สไตล์ Indigo */}
                <div className="col-span-12 lg:col-span-2 flex justify-end lg:justify-center">
                  <a 
                    href={`/files/student-affairs/${doc.file}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-2.5 bg-[#3F51B5] text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 uppercase tracking-wider"
                  >
                    <span className="text-white">pdf</span>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}