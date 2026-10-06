import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, MessageCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const categoryMap = {
  all: { th: 'ทั้งหมด', en: 'All' },
  'หลักสูตร': { th: 'หลักสูตร', en: 'Curriculum' },
  'ฝึกงาน': { th: 'ฝึกงาน', en: 'Internship' },
  'ทั่วไป': { th: 'ทั่วไป', en: 'General' },
};

const faqTranslations = {
  1: {
    question_en: "What is the tuition fee and course overview per semester?",
    answer_en: "The curriculum focuses on computer programming, data structures, algorithms, database systems, web & mobile app development, artificial intelligence (AI), and cybersecurity, blending theory with hands-on practice. (Tuition is approximately 19,000 - 24,000 THB per semester for regular programs; please refer to official announcements for exact fee schedules)."
  },
  2: {
    question_en: "What is the difference between an Internship and Cooperative Education (Co-op)?",
    answer_en: "A standard internship is conducted during the summer break for approximately 2 months. In contrast, Cooperative Education (Co-op) requires full-time professional immersion at an enterprise or partner company for a full semester (approx. 4-6 months), giving students deeper career readiness and evaluated as formal coursework."
  },
  3: {
    question_en: "What career paths can CIS graduates pursue?",
    answer_en: "Graduates can pursue high-demand technology roles, including Software Developer, Data Scientist, Systems Analyst, Network Engineer, UX/UI Designer, Cybersecurity Analyst, Cloud Architect, or launch tech entrepreneurship ventures."
  },
  4: {
    question_en: "Where is the department office located, and how can I contact them?",
    answer_en: "The Department of Computer and Information Science is located at Building 78, 2nd Floor, Faculty of Applied Science, King Mongkut's University of Technology North Bangkok (KMUTNB). You can reach the department office by phone at +66 2 555-2000 ext. 4601."
  }
};

const getCategoryLabel = (cat, lang) => {
  if (cat === 'all') return lang === 'EN' ? 'All' : 'ทั้งหมด';
  if (lang === 'EN') {
    if (categoryMap[cat]?.en) return categoryMap[cat].en;
  }
  return categoryMap[cat]?.th || cat;
};

const getFaqQuestion = (faq, lang) => {
  if (lang === 'EN') {
    if (faq.question_en) return faq.question_en;
    if (faqTranslations[faq.id]?.question_en) return faqTranslations[faq.id].question_en;
  }
  return faq.question;
};

const getFaqAnswer = (faq, lang) => {
  if (lang === 'EN') {
    if (faq.answer_en) return faq.answer_en;
    if (faqTranslations[faq.id]?.answer_en) return faqTranslations[faq.id].answer_en;
  }
  return faq.answer;
};

export default function FAQ() {
  const { lang } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/faq');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setFaqs(res.data);
        } else {
          // Fallback
          setFaqs([
            {
              id: 1,
              question: "ค่าเทอมต่อภาคการศึกษา เทอมละเท่าไหร่?",
              answer: "หลักสูตรเน้นการเรียนรู้ด้านการเขียนโปรแกรม, โครงสร้างข้อมูล, ขั้นตอนวิธี (Algorithm), ระบบฐานข้อมูล, การพัฒนาเว็บและโมบายแอปพลิเคชัน, ปัญญาประดิษฐ์ (AI), และความมั่นคงปลอดภัยไซเบอร์ โดยผสมผสานทั้งทฤษฎีและการปฏิบัติ",
              category: "หลักสูตร"
            },
            {
              id: 2,
              question: "การฝึกงานและสหกิจศึกษาต่างกันอย่างไร?",
              answer: "การฝึกงานปกติจะใช้เวลาช่วงปิดเทอมประมาณ 2 เดือน ส่วนสหกิจศึกษาจะเป็นการทำงานจริงในสถานประกอบการเป็นเวลา 1 ภาคการศึกษาเต็ม (ประมาณ 4-6 เดือน) ซึ่งนักศึกษาจะได้ประสบการณ์ทำงานที่เข้มข้นกว่าและมีการประเมินผลเป็นรายวิชา",
              category: "ฝึกงาน"
            },
            {
              id: 3,
              question: "นักศึกษาที่จบไปสามารถประกอบอาชีพอะไรได้บ้าง?",
              answer: "สามารถประกอบอาชีพได้หลากหลาย เช่น Software Developer, Data Scientist, System Analyst, Network Engineer, UX/UI Designer, หรือประกอบธุรกิจส่วนตัวด้านเทคโนโลยี",
              category: "ทั่วไป"
            },
            {
              id: 4,
              question: "ติดต่อสำนักงานภาควิชาได้ที่ไหน?",
              answer: "ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ ตั้งอยู่ที่อาคาร 78 ชั้น 2 คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ หรือติดต่อทางโทรศัพท์ได้ที่ 02-555-2000 ต่อ 4601",
              category: "ทั่วไป"
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load FAQ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // หมวดหมู่ทั้งหมดที่มี
  const categories = ["all", ...Array.from(new Set(faqs.map(f => f.category).filter(Boolean)))];

  // กรองคำถามตามการค้นหาและหมวดหมู่
  const filteredFaqs = faqs.filter(faq => {
    const matchCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const q = getFaqQuestion(faq, lang).toLowerCase();
    const a = getFaqAnswer(faq, lang).toLowerCase();
    const origQ = (faq.question || "").toLowerCase();
    const origA = (faq.answer || "").toLowerCase();
    const s = searchTerm.toLowerCase();
    const matchSearch = q.includes(s) || a.includes(s) || origQ.includes(s) || origA.includes(s);
    return matchCategory && matchSearch;
  });

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-left">
      
      {/* Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              {lang === 'EN' ? 'Frequently Asked Questions (FAQ)' : 'คำถามที่พบบ่อย'}
            </h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 md:px-10 py-16 flex-grow">
        
        {/* Search Bar */}
        <div className="relative mb-6 group">
          <input
            type="text"
            placeholder={lang === 'EN' ? "Search questions or keywords..." : "ค้นหาคำถามที่ต้องการทราบ..."}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#3F51B5] focus:border-transparent transition-all outline-none text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3F51B5] transition-colors" size={24} />
        </div>

        {/* Category Filter Chips */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-[#3F51B5] text-white shadow-md shadow-indigo-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {getCategoryLabel(cat, lang)}
              </button>
            ))}
          </div>
        )}

        {/* FAQ List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="animate-spin text-[#3F51B5]" size={36} />
            <span>
              {lang === 'EN' ? 'Loading frequently asked questions...' : 'กำลังโหลดข้อมูลคำถาม-คำตอบ...'}
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        {faq.category && (
                          <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-50 text-[#3F51B5]">
                            {getCategoryLabel(faq.category, lang)}
                          </span>
                        )}
                        <span className="font-bold text-slate-700 md:text-lg">
                          {getFaqQuestion(faq, lang)}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                        className="text-[#3F51B5] shrink-0"
                      >
                        <ChevronDown size={24} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-6 pb-6 text-slate-500 leading-relaxed border-t border-slate-50 pt-4">
                            {getFaqAnswer(faq, lang)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <MessageCircle className="mx-auto text-slate-200 mb-4" size={48} />
                  <p className="text-slate-400">
                    {lang === 'EN' ? 'No questions found matching your search.' : 'ไม่พบคำถามที่เกี่ยวข้องกับการค้นหา'}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}