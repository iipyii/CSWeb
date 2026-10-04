import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2, FileText, Search, BookOpen, HelpCircle, DollarSign } from 'lucide-react';
import axios from 'axios';
import Footer from '../components/Footer';

const SUBCATEGORIES = [
  { 
    id: 'rules', 
    title: '1. ข้อบังคับ-ประกาศ-หลักเกณฑ์',
    icon: BookOpen,
    desc: 'ข้อบังคับและประกาศหลักเกณฑ์การศึกษาระดับปริญญาโทและปริญญาเอก'
  },
  { 
    id: 'clarifications', 
    title: '2. ชี้แจงกฎระเบียบ-ข้อบังคับฯ',
    icon: HelpCircle,
    desc: 'ประกาศชี้แจง ขั้นตอนการศึกษา และแนวปฏิบัติต่างๆ'
  },
  { 
    id: 'finance', 
    title: '3. ระเบียบ-ประกาศ (การเงิน)',
    icon: DollarSign,
    desc: 'ระเบียบการเงิน ค่าธรรมเนียมการศึกษา และการเบิกจ่าย'
  }
];

export default function GraduateRegs() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/downloads/regulation?category=graduate');
        if (Array.isArray(res.data)) {
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

  const getSubcategory = (doc) => {
    const cat = doc.category || '';
    if (cat.includes(':')) {
      const sub = cat.split(':')[1];
      if (sub.includes('การเงิน')) return 'finance';
      if (sub.includes('ชี้แจง')) return 'clarifications';
      return 'rules';
    }
    const t = doc.title || '';
    if (t.includes('การเงิน') || t.includes('ค่าธรรมเนียม') || t.includes('เบิกจ่าย')) return 'finance';
    if (t.includes('ชี้แจง') || t.includes('ขั้นตอน') || t.includes('ขอแจ้งมติ')) return 'clarifications';
    return 'rules';
  };

  const filteredDocs = docs.filter(d =>
    (d.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-left">
      {/* 🏛️ Hero Section */}
      <section className="bg-[#3F51B5] text-white py-10 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-3 inline-block">
              งานบัณฑิตศึกษา
            </span>
            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight leading-snug">
              ข้อบังคับ-ประกาศ-หลักเกณฑ์ สำหรับระดับบัณฑิตศึกษา
            </h1>
            <p className="text-indigo-100 text-sm max-w-2xl leading-relaxed">
              ระเบียบ ประกาศ และแนวปฏิบัติสำหรับนักศึกษาระดับปริญญาโทและปริญญาเอก ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ
            </p>
            <div className="w-12 h-1 bg-white/40 mt-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* 📂 Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-10 py-10 flex-grow">
        {/* Search */}
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาข้อบังคับ / ประกาศบัณฑิตศึกษา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-[#3F51B5] outline-none shadow-2xs"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Loader2 className="animate-spin text-[#3F51B5]" size={36} />
            <span>กำลังโหลดเอกสารบัณฑิตศึกษา...</span>
          </div>
        ) : (
          <div className="space-y-10">
            {SUBCATEGORIES.map((subcat) => {
              const subcatDocs = filteredDocs.filter(d => getSubcategory(d) === subcat.id);
              const SubIcon = subcat.icon;

              return (
                <div 
                  key={subcat.id}
                  className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden"
                >
                  {/* Subcategory Header */}
                  <div className="p-5 md:px-8 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50 text-[#3F51B5] rounded-xl shrink-0">
                        <SubIcon size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-800">
                          {subcat.title}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {subcat.desc}
                        </p>
                      </div>
                    </div>
                    <span className="self-start md:self-auto px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold shadow-2xs">
                      {subcatDocs.length} รายการ
                    </span>
                  </div>

                  {/* Document Table */}
                  {subcatDocs.length > 0 ? (
                    <>
                      <div className="hidden md:grid grid-cols-12 gap-4 bg-slate-50/40 p-4 border-b border-slate-100 text-slate-400 font-bold text-[13px] uppercase tracking-wider">
                        <div className="col-span-1 text-center">ลำดับ</div>
                        <div className="col-span-9">รายการเอกสาร</div>
                        <div className="col-span-2 text-center">ไฟล์</div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {subcatDocs.map((item, idx) => (
                          <div 
                            key={item.id || idx} 
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 md:p-6 items-center hover:bg-slate-50/40 transition-colors group"
                          >
                            <div className="hidden md:block col-span-1 text-center font-bold text-slate-300">
                              {idx + 1}
                            </div>
                            <div className="col-span-12 md:col-span-9">
                              <div className="flex items-start gap-4">
                                <span className="md:hidden text-xs font-bold text-slate-300 mt-1 w-6">{idx + 1}</span>
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
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-2 bg-[#3F51B5] text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 uppercase tracking-wider"
                              >
                                <span>PDF</span>
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 px-4 text-slate-400 text-sm">
                      <FileText className="mx-auto mb-2 text-slate-300" size={32} />
                      <p>ไม่มีเอกสารในหัวข้อย่อยนี้</p>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 shadow-sm">
                <FileText className="mx-auto mb-3 text-slate-300" size={48} />
                <h3 className="text-base font-bold text-slate-700">ไม่พบเอกสารที่ค้นหา</h3>
                <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}