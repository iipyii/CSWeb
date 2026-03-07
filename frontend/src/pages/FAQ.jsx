import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import Footer from '../components/Footer';

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  // 📝 ข้อมูลคำถาม-คำตอบ (สามารถแก้ไขหรือเพิ่มได้ที่นี่)
  const faqData = [
    {
      question: "ค่าเทอมต่อภาคการศึกษา เทอมละเท่าไหร่?",
      answer: "หลักสูตรเน้นการเรียนรู้ด้านการเขียนโปรแกรม, โครงสร้างข้อมูล, ขั้นตอนวิธี (Algorithm), ระบบฐานข้อมูล, การพัฒนาเว็บและโมบายแอปพลิเคชัน, ปัญญาประดิษฐ์ (AI), และความมั่นคงปลอดภัยไซเบอร์ โดยผสมผสานทั้งทฤษฎีและการปฏิบัติ"
    },
    {
      question: "การฝึกงานและสหกิจศึกษาต่างกันอย่างไร?",
      answer: "การฝึกงานปกติจะใช้เวลาช่วงปิดเทอมประมาณ 2 เดือน ส่วนสหกิจศึกษาจะเป็นการทำงานจริงในสถานประกอบการเป็นเวลา 1 ภาคการศึกษาเต็ม (ประมาณ 4-6 เดือน) ซึ่งนักศึกษาจะได้ประสบการณ์ทำงานที่เข้มข้นกว่าและมีการประเมินผลเป็นรายวิชา"
    },
    {
      question: "นักศึกษาที่จบไปสามารถประกอบอาชีพอะไรได้บ้าง?",
      answer: "สามารถประกอบอาชีพได้หลากหลาย เช่น Software Developer, Data Scientist, System Analyst, Network Engineer, UX/UI Designer, หรือประกอบธุรกิจส่วนตัวด้านเทคโนโลยี"
    },
    {
      question: "ติดต่อสำนักงานภาควิชาได้ที่ไหน?",
      answer: "ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ ตั้งอยู่ที่อาคาร 78 ชั้น 2 คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ หรือติดต่อทางโทรศัพท์ได้ที่ 02-555-2000 ต่อ 4601"
    }
  ];

  // ฟังก์ชันกรองคำถามตามการค้นหา
  const filteredFaqs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-50 font-['Prompt'] min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
              <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">คำถามที่พบบ่อย</h1>
                  <div className="w-12 h-1 bg-white/30 mb-5"></div>
                </motion.div>
              </div>
              <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                <h2 className="text-[5rem] font-bold">CIS</h2>
              </div>
            </section>

      {/* 📂 Main Content */}
      <main className="max-w-4xl mx-auto w-full px-6 py-16 flex-grow">
        
        {/* 🔍 Search Bar */}
        <div className="relative mb-12 group">
          <input
            type="text"
            placeholder="ค้นหาคำถามที่ต้องการทราบ..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#3F51B5] focus:border-transparent transition-all outline-none text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3F51B5] transition-colors" size={24} />
        </div>

        {/* 📋 FAQ List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-700 md:text-lg pr-4">
                      {faq.question}
                    </span>
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
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <MessageCircle className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400">ไม่พบคำถามที่เกี่ยวข้องกับการค้นหา</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        
      </main>

      <Footer />
    </div>
  );
}