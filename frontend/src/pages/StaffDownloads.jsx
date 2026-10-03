import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, FileText, Loader2 } from 'lucide-react';
import Footer from '../components/Footer';
import axios from "axios";

// Map raw categories to user-friendly Thai display titles
const categoryLabels = {
  'finance': 'งานการเงิน',
  'personnel': 'งานบุคคล',
  'academic': 'งานวิชาการ',
  'curriculum': 'งานหลักสูตร',
  'general': 'ทั่วไป',
  'special-project': 'โครงงานพิเศษ, ปริญญานิพนธ์',
  'csb': 'โครงการสองภาษา (CSB)',
  'internship': 'การฝึกงาน',
  'graduate': 'ระดับบัณฑิตศึกษา',
  'current-student': 'สำหรับนักศึกษาปัจจุบัน',
};

const getCategoryLabel = (category) => {
  if (!category) return 'ทั่วไป';
  return categoryLabels[category] || categoryLabels[category.toLowerCase()] || category;
};

// Generates a grouping key for merging identical documents across formats (e.g. PDF and DOCX)
const getGroupKey = (item) => {
  if (item.file_name) {
    const base = item.file_name.replace(/\.[^/.]+$/, '').trim().toLowerCase();
    if (base) return `base:${base}`;
  }
  const cleanTitle = (item.title || '')
    .replace(/\s*[\(\[](?:pdf|docx?|word|excel|xlsx?)[\)\]]\s*$/i, '')
    .replace(/\s+(?:pdf|docx?|word|excel|xlsx?)$/i, '')
    .replace(/\s+[12]$/i, '')
    .replace(/-v0\.[12]$/i, '')
    .trim()
    .toLowerCase();
  return `title:${cleanTitle}`;
};

// Cleans display title so that differences like " 1", " 2", or "-v0.2" are unified
const getCleanTitle = (title = '') => {
  return title
    .replace(/\s*[\(\[](?:pdf|docx?|word|excel|xlsx?)[\)\]]\s*$/i, '')
    .replace(/\s+(?:pdf|docx?|word|excel|xlsx?)$/i, '')
    .replace(/\s+[12]$/i, '')
    .replace(/-v0\.2$/i, '-v0.1')
    .trim();
};

// Subtitle under the title showing filename details
const getFileSubtitle = (files) => {
  if (!files || files.length === 0) return '';
  if (files.length === 1) return files[0].file_name || '';

  const getBase = (fn) => (fn || '').replace(/\.[^/.]+$/, '');
  const base0 = getBase(files[0].file_name);
  const allSameBase = files.every((f) => getBase(f.file_name) === base0);

  if (allSameBase && base0) {
    const exts = files
      .map((f) => (f.file_type ? `.${f.file_type.toLowerCase()}` : ''))
      .filter(Boolean)
      .join(', ');
    return base0 + (exts ? ` (${exts})` : '');
  }
  return files.map((f) => f.file_name).filter(Boolean).join(' • ');
};

const formatOrder = { pdf: 1, docx: 2, doc: 3, xlsx: 4, xls: 5 };

export default function StaffDownloads() {
  const [openSections, setOpenSections] = useState([0]);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/downloads/staff")
      .then((res) => {
        setDownloads(res.data || []);
      })
      .catch((err) => {
        console.error("Fetch staff downloads error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleSection = (index) => {
    if (openSections.includes(index)) {
      setOpenSections(openSections.filter((i) => i !== index));
    } else {
      setOpenSections([...openSections, index]);
    }
  };

  const grouped = useMemo(() => {
    const categoryMap = {};
    downloads.forEach((item) => {
      const cat = item.category || 'ทั่วไป';
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(item);
    });

    const result = {};
    Object.entries(categoryMap).forEach(([cat, rawItems]) => {
      const topicMap = new Map();

      rawItems.forEach((item) => {
        const key = getGroupKey(item);
        if (!topicMap.has(key)) {
          topicMap.set(key, {
            id: item.id,
            title: getCleanTitle(item.title),
            category: item.category,
            files: [],
          });
        }
        const topic = topicMap.get(key);
        if (!topic.files.some((f) => f.id === item.id)) {
          topic.files.push({
            id: item.id,
            file_name: item.file_name,
            file_type: item.file_type || (item.file_name ? item.file_name.split('.').pop() : 'file'),
            file_path: item.file_path,
            created_at: item.created_at,
          });
        }
      });

      const topicList = Array.from(topicMap.values()).map((topic) => {
        topic.files.sort((a, b) => {
          const orderA = formatOrder[a.file_type?.toLowerCase()] || 99;
          const orderB = formatOrder[b.file_type?.toLowerCase()] || 99;
          return orderA - orderB;
        });
        return topic;
      });

      // Sort topics naturally by Thai title
      topicList.sort((a, b) => a.title.localeCompare(b.title, 'th', { numeric: true }));

      result[cat] = topicList;
    });

    return result;
  }, [downloads]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">แบบฟอร์มดาวน์โหลดสำหรับบุคลากร</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 size={32} className="animate-spin text-[#3F51B5]" />
            <p className="text-sm">กำลังโหลดเอกสารดาวน์โหลด...</p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm text-slate-500">
            <FileText size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-lg">ยังไม่มีรายการเอกสารสำหรับบุคลากร</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items], sIdx) => {
            const isOpen = openSections.includes(sIdx);
            const categoryTitle = getCategoryLabel(category);
            return (
              <div key={sIdx} className="mb-6">
                <button
                  onClick={() => toggleSection(sIdx)}
                  className="w-full flex items-center gap-2 mb-2 pb-3 border-b-2 border-[#3F51B5]/10 group transition-all text-left"
                >
                  <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronRight size={22} className="text-[#3F51B5]" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-[#3F51B5] transition-colors">
                    {categoryTitle}
                  </h2>
                  <span className="ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    {items.length} รายการ
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8 mt-2">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[640px] text-left">
                            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400">
                              <tr>
                                <th className="px-6 py-4 text-xs font-bold w-16 text-center uppercase tracking-wider">ลำดับ</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ชื่อรายการเอกสาร</th>
                                <th className="px-6 py-4 text-xs font-bold text-center w-48 uppercase tracking-wider">ไฟล์</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {items.map((item, iIdx) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-5 text-center text-slate-400 text-sm">{iIdx + 1}</td>
                                  <td className="px-6 py-5 text-slate-700 text-[15px] group-hover:text-[#3F51B5] transition-colors">
                                    <div>
                                      <p className="font-medium text-slate-800 group-hover:text-[#3F51B5] transition-colors">
                                        {item.title}
                                      </p>
                                      {item.files?.length > 0 && (
                                        <p className="text-xs text-slate-400 font-normal mt-0.5 flex items-center gap-1.5 flex-wrap">
                                          <FileText size={13} className="text-slate-400 shrink-0" />
                                          <span className="truncate max-w-lg">{getFileSubtitle(item.files)}</span>
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 text-center">
                                    <div className="flex justify-center items-center gap-2 flex-wrap">
                                      {item.files.map((file) => {
                                        const fType = file.file_type?.toLowerCase();
                                        const isPdf = fType === 'pdf';
                                        const isDoc = fType === 'docx' || fType === 'doc' || fType === 'word';
                                        const isXls = fType === 'xlsx' || fType === 'xls';

                                        const badgeStyle = isPdf
                                          ? 'text-rose-600 border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white'
                                          : isDoc
                                            ? 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-600 hover:text-white'
                                            : isXls
                                              ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-600 hover:text-white'
                                              : 'text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-600 hover:text-white';

                                        if (file.url) {
                                          return (
                                            <a
                                              key={file.id}
                                              href={file.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-3 py-1.5 rounded-lg text-[11px] font-bold border text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-xs"
                                            >
                                              LINK
                                            </a>
                                          );
                                        }

                                        return (
                                          <a
                                            key={file.id}
                                            href={`/api/downloads/download/${file.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download={file.file_name || `${item.title}.${file.file_type || 'pdf'}`}
                                            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 inline-flex items-center gap-1 shadow-xs ${badgeStyle}`}
                                            title={`ดาวน์โหลด ${file.file_name || file.file_type?.toUpperCase()}`}
                                          >
                                            {file.file_type?.toUpperCase() || 'FILE'}
                                          </a>
                                        );
                                      })}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </main>
      <Footer />
    </div>
  );
}