import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft
} from 'lucide-react';
import Footer from '../components/Footer';

export default function FinanceRegs() {
  const navigate = useNavigate();

  // ข้อมูลระเบียบ/ประกาศงานการเงิน
  const financeDocs = [
    { id: 1, title: "การจัดเก็บค่าธรรมเนียมและเงินอุดหนุนการศึกษาโครงการพิเศษ (สองภาษา) หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ พ.ศ.2557", file: "fin_01.pdf" },
    { id: 2, title: "ประกาศมหาวิทยาลัย เรื่อง การจ่ายค่าสอนพิเศษและค่าสอนเกินภาระงานสอน (ฉบับที่ 2)", file: "fin_02.pdf" },
    { id: 3, title: "ประกาศมหาวิทยาลัย เรื่อง การจ่ายค่าสอนพิเศษและค่าสอนเกินภาระงานสอน (ฉบับที่ 3)", file: "fin_03.pdf" },
    { id: 4, title: "ประกาศมหาวิทยาลัย เรื่อง การจ่ายค่าสอนพิเศษและค่าสอนเกินภาระงานสอน (ฉบับที่ 4)", file: "fin_04.pdf" },
    { id: 5, title: "ประกาศมหาวิทยาลัย เรื่อง การจ่ายค่าสอนพิเศษและค่าสอนเกินภาระงานสอน (ฉบับที่ 5)", file: "fin_05.pdf" },
    { id: 6, title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การเบิกจ่ายเงินรายได้สำหรับหลักสูตรพิเศษระดับปริญญาตรี (24 ส.ค. 58)", file: "fin_06.pdf" },
    { id: 7, title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การเบิกจ่ายเงินรายได้สำหรับหลักสูตรพิเศษระดับปริญญาตรี (ฉบับที่ 2)", file: "fin_07.pdf" },
    { id: 8, title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การเบิกจ่ายเงินรายได้สำหรับหลักสูตรพิเศษระดับปริญญาตรี (ฉบับที่ 3) 2562", file: "fin_08.pdf" },
    { id: 9, title: "ประกาศมหาวิทยาลัย เรื่อง หลักเกณฑ์การเบิกจ่ายเงินรายได้สำหรับหลักสูตรพิเศษระดับปริญญาตรี 2561", file: "fin_09.pdf" },
    { id: 10, title: "ระเบียบมหาวิทยาลัย ว่าด้วย การเบิกจ่ายเงินรายได้ของมหาวิทยาลัย พ.ศ. 2551", file: "fin_10.pdf" },
    { id: 11, title: "ระเบียบมหาวิทยาลัย ว่าด้วย ค่าธรรมเนียมและเงินอุดหนุนการศึกษาหลักสูตรพิเศษ ระดับปริญญาตรี พ.ศ. 2563", file: "fin_11.pdf" },
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
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">งานการเงิน</h1>
                        <div className="w-12 h-1 bg-white/30 mb-5"></div>
                      </motion.div>
                    </div>
                    <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                      <h2 className="text-[5rem] font-bold">CIS</h2>
                    </div>
                  </section>

      {/* 📂 Main Content - ขยายพื้นที่การแสดงผล */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-10 py-12 flex-grow">
        
       
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
          
          {/* ✨ หัวตารางจำลอง (Table Header) */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50/80 p-5 border-b border-slate-100 text-slate-400 font-bold text-[13px] uppercase tracking-wider">
            <div className="col-span-1 text-center">ลำดับ</div>
            <div className="col-span-9">รายการเอกสาร</div>
            <div className="col-span-2 text-center">ไฟล์</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-50">
            {financeDocs.map((doc, idx) => (
              <motion.div 
                key={doc.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 md:p-7 items-center hover:bg-slate-50/50 transition-colors group"
              >
                {/* ลำดับ */}
                <div className="hidden md:block col-span-1 text-center font-bold text-slate-300">
                  {idx + 1}
                </div>

                {/* ชื่อเอกสาร - เน้นสีน้ำเงินเมื่อ Hover */}
                <div className="col-span-12 md:col-span-9">
                  <div className="flex items-start gap-4">
                    <span className="md:hidden text-xs font-bold text-slate-300 mt-1.5 w-8 shrink-0">{idx + 1}</span>
                    <span className="text-[15px] md:text-[16px] font-medium text-slate-700 leading-relaxed group-hover:text-[#3F51B5] transition-colors">
                      {doc.title}
                    </span>
                  </div>
                </div>

                {/* ปุ่มเปิดดู PDF สไตล์พรีเมียม */}
                <div className="col-span-12 md:col-span-2 flex justify-end md:justify-center">
                  <a 
                    href={`/files/finance/${doc.file}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-12 py-3 bg-[#3F51B5] text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 uppercase tracking-widest"
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