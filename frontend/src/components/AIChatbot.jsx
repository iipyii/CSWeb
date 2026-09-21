import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import axios from 'axios';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "สวัสดีครับ! ผมคือ CS-AI Assistant ผู้ช่วยอัจฉริยะประจำภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ มจพ.\n\nคุณสามารถสอบถามเกี่ยวกับระเบียบการในคู่มือนักศึกษา หลักสูตรและคำอธิบายรายวิชา อาจารย์ที่ปรึกษา หรือการฝึกงานได้เลยครับ!", 
      isBot: true 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("handbook");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef(null);

  // ชุดคำถามที่เกี่ยวข้องกับนักศึกษาแยกตามหมวดหมู่ (อาจารย์เสนอให้มีกรองคำถามแยกหมวดหมู่)
  const questionCategories = [
    {
      id: "handbook",
      label: "คู่มือนักศึกษา",
      icon: "📘",
      questions: [
        "เกณฑ์การคิดเกรดและการติดวิทยาทัณฑ์ (โปร) มีเงื่อนไขอย่างไร?",
        "เกณฑ์การพ้นสภาพนักศึกษา (Retire) มีอะไรบ้าง?",
        "เพิ่ม-ถอนรายวิชา (Add/Drop) ได้ถึงสัปดาห์ไหน?",
        "เกณฑ์การผ่านภาษาอังกฤษ (KMUTNB-TEP) เพื่อขอสำเร็จการศึกษา?"
      ]
    },
    {
      id: "curriculum",
      label: "หลักสูตร & รายวิชา",
      icon: "🎓",
      questions: [
        "หลักสูตรปรับปรุงปี 2569 มีวิชาอะไรบ้าง?",
        "วิชาโครงสร้างข้อมูลและขั้นตอนวิธี (040613003) ต้องผ่านวิชาอะไรมาก่อน?",
        "กลุ่มวิชาชีพ (Track) ของวิทยาการคอมพิวเตอร์มีอะไรบ้าง?",
        "วิชาคลาวด์คอมพิวติงและเดฟออปส์ (040613011) มีเนื้อหาเกี่ยวกับอะไร?"
      ]
    },
    {
      id: "advisor",
      label: "อาจารย์ที่ปรึกษา",
      icon: "👨‍🏫",
      questions: [
        "ฉันจะตรวจสอบและค้นหาอาจารย์ที่ปรึกษาได้อย่างไร?",
        "อาจารย์ รศ.ดร.ธนภัทร์ ดูแลนักศึกษารุ่นไหนบ้าง?",
        "ช่องทางการติดต่อภาควิชาฯ และเบอร์โทรศัพท์?"
      ]
    },
    {
      id: "internship",
      label: "ฝึกงาน & สหกิจ",
      icon: "💼",
      questions: [
        "คุณสมบัติของนักศึกษาที่จะสมัครฝึกงานภาคฤดูร้อน?",
        "ต้องเก็บชั่วโมงฝึกงานไม่น้อยกว่ากี่ชั่วโมง?",
        "ความแตกต่างระหว่างการฝึกงานปกติกับสหกิจศึกษา?"
      ]
    },
    {
      id: "general",
      label: "คำถามทั่วไป",
      icon: "❓",
      questions: [
        "ภาควิชาตั้งอยู่ที่อาคารไหน และติดต่อได้ในเวลาใด?",
        "มีทุนการศึกษาอะไรบ้างสำหรับนักศึกษา CS?"
      ]
    }
  ];

  // Auto scroll ไปที่ข้อความล่าสุด
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendQuery = async (queryText) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg = { id: Date.now(), text: queryText, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: queryText,
        category: selectedCategory
      });

      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: response.data.reply, isBot: true }
      ]);
    } catch (error) {
      console.error("Chat API Error:", error);
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: "ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งครับ 😅", isBot: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendQuery(input);
  };

  const handleSelectQuestion = (q) => {
    sendQuery(q);
  };

  const currentQuestions = questionCategories.find(c => c.id === selectedCategory)?.questions || [];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[360px] md:w-[430px] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* 🌟 Header */}
            <div className="bg-[#183153] p-4 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-[#3F51B5] p-2.5 rounded-2xl shadow-inner">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none flex items-center gap-1.5">
                    CS-AI Assistant 
                    <span className="px-1.5 py-0.5 bg-indigo-500/50 rounded-md text-[9px] font-mono">v2.5</span>
                  </h3>
                  <p className="text-[10px] text-slate-300 flex items-center gap-1 mt-1 font-medium">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> คู่มือนักศึกษา & ข้อมูลภาควิชา
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  title={showSuggestions ? "ซ่อนคำถามแนะนำ" : "แสดงคำถามแนะนำ"}
                  className={`p-1.5 rounded-xl text-xs font-bold transition-colors ${showSuggestions ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-300'}`}
                >
                  <Sparkles size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 🎛️ Category Tabs (ตัวกรองหมวดหมู่คำถาม) */}
            <div className="bg-slate-50 border-b border-slate-100 p-2 overflow-x-auto no-scrollbar flex gap-1.5">
              {questionCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#3F51B5] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* 💡 Suggested Questions Box (เมื่อเปิดใช้งาน) */}
            {showSuggestions && (
              <div className="bg-indigo-50/50 border-b border-indigo-100/60 p-2.5 max-h-32 overflow-y-auto">
                <p className="text-[10px] font-black text-indigo-900/70 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <HelpCircle size={12} /> คำถามแนะนำ ({questionCategories.find(c => c.id === selectedCategory)?.label})
                </p>
                <div className="flex flex-col gap-1">
                  {currentQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuestion(q)}
                      className="text-left text-xs bg-white hover:bg-indigo-600 hover:text-white text-slate-700 py-1.5 px-2.5 rounded-lg transition-all border border-indigo-100/80 shadow-2xs flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{q}</span>
                      <ChevronRight size={12} className="opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 💬 Chat Body */}
            <div className="flex-grow p-4 overflow-y-auto bg-slate-50/50 space-y-3.5 scroll-smooth">
              <div ref={scrollRef} className="space-y-3.5">
                {messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.isBot ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg.id}
                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex gap-2 max-w-[88%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-7 h-7 mt-1 rounded-full flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-indigo-100 text-[#3F51B5]' : 'bg-[#3F51B5] text-white shadow-sm'}`}>
                        {msg.isBot ? <Bot size={15} /> : <User size={15} />}
                      </div>
                      <div className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                        msg.isBot 
                          ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' 
                          : 'bg-[#3F51B5] text-white rounded-tr-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center ml-9">
                      <Loader2 size={15} className="animate-spin text-[#3F51B5]" />
                      <span className="text-xs text-slate-400 font-medium">AI กำลังค้นหาข้อมูลจากคู่มือและหลักสูตร...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ⌨️ Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์คำถามของคุณที่นี่..."
                className="flex-grow bg-slate-100/80 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#3F51B5]/20 outline-none transition-all"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className={`text-white p-2.5 rounded-xl transition-all shadow-md ${
                  isLoading || !input.trim() 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-[#3F51B5] hover:bg-indigo-700 active:scale-95'
                }`}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔘 Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#3F51B5] hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative group border-2 border-white"
        aria-label="เปิดแชทกับ AI"
      >
        <MessageCircle size={26} />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}