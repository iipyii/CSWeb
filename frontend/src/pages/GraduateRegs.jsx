import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, FileText, Search } from 'lucide-react';
import axios from 'axios';
import Footer from '../components/Footer';

export default function GraduateRegs() {
  const [openSections, setOpenSections] = useState([0]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/downloads/regulation?category=graduate');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDocs(res.data);
        }
      } catch (err) {
        console.error('Failed to load graduate regulations:', err);
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

  const filteredDocs = docs.filter(d =>
    (d.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-left">
      {/* 🏛️ Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight leading-snug">
              ข้อบังคับ-ประกาศ-หลักเกณฑ์ สำหรับระดับบัณฑิตศึกษา
            </h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* 📂 Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-10 py-12 flex-grow">
        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาข้อบังคับ / ประกาศบัณฑิตศึกษา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#3F51B5] outline-none"
          />
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50/50 p-4 border-b border-slate-100 text-slate-400 font-bold text-[13px] uppercase tracking-wider">
            <div className="col-span-1 text-center">ลำดับ</div>
            <div className="col-span-9">รายการเอกสาร</div>
            <div className="col-span-2 text-center">ไฟล์</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredDocs.map((item, iIdx) => (
              <div 
                key={item.id || iIdx} 
                className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 md:p-6 items-center hover:bg-slate-50/30 transition-colors group"
              >
                <div className="hidden md:block col-span-1 text-center font-bold text-slate-300">
                  {iIdx + 1}
                </div>
                <div className="col-span-12 md:col-span-9">
                  <div className="flex items-start gap-4">
                    <span className="md:hidden text-xs font-bold text-slate-300 mt-1 w-6">{iIdx + 1}</span>
                    <span className="text-[15px] md:text-[16px] font-medium text-slate-700 leading-relaxed group-hover:text-[#3F51B5] transition-colors">
                      {item.title}
                    </span>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-2 flex justify-end md:justify-center">
                  <a 
                    href={getPdfUrl(item)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-2.5 bg-[#3F51B5] text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 uppercase tracking-wider"
                  >
                    <span className="text-white">pdf</span>
                  </a>
                </div>
              </div>
            ))}

            {filteredDocs.length === 0 && !loading && (
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