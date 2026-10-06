import React, { useState, useEffect } from  'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2, FileText } from 'lucide-react';
import axios from 'axios';
import Footer from '../components/Footer';

export default function FinanceRegs() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [financeDocs, setFinanceDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/downloads/regulation?category=finance');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setFinanceDocs(res.data);
        }
      } catch (err) {
        console.error('Failed to load finance regulations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const getPdfUrl = (doc) => {
    if (!doc.file_path) return '#';
    if (doc.file_path.startsWith('http://') || doc.file_path.startsWith('https://')) return doc.file_path;
    return `/downloads/${doc.file_path}`;
  };

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
                    href={getPdfUrl(doc)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-12 py-3 bg-[#3F51B5] text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 uppercase tracking-widest"
                  >
                    <span className="text-white">pdf</span>
                  </a>
                </div>
              </motion.div>
            ))}

            {financeDocs.length === 0 && !loading && (
              <div className="text-center py-16 text-slate-400">
                <FileText className="mx-auto mb-2 text-slate-300" size={40} />
                <p>ยังไม่มีรายการเอกสารในหมวดนี้</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}