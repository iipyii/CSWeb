import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "สวัสดีครับ! ผมคือ AI ผู้ช่วยประจำภาควิชา CIS มีอะไรให้ผมช่วยไหมครับ? เช่น สอบถามค่าเทอม หรือ ข้อมูลหลักสูตร", isBot: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto scroll ไปที่ข้อความล่าสุด
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // จำลองการตอบกลับของ AI
    setTimeout(() => {
      let botResponse = "ขออภัยครับ ผมยังอยู่ในช่วงพัฒนา คุณสามารถดูข้อมูลเพิ่มเติมได้ที่หน้า FAQ หรือติดต่อสำนักงานภาควิชาครับ";
      
      const query = input.toLowerCase();
      if (query.includes("ค่าเทอม")) botResponse = "ค่าเทอมหลักสูตรปกติอยู่ที่ 25,000 บาท และหลักสูตรสองภาษาอยู่ที่ 45,000 บาทครับ";
      if (query.includes("ติดต่อ")) botResponse = "สำนักงานภาควิชาตั้งอยู่ที่อาคาร 78 ชั้น 2 คณะวิทยาศาสตร์ประยุกต์ ครับ";
      if (query.includes("ข่าว")) botResponse = "คุณสามารถติดตามข่าวสารล่าสุดได้ที่เมนู 'ข่าวสารและกิจกรรม' ครับ";

      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, isBot: true }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-['Prompt']">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#3F51B5] p-5 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">CIS AI Assistant</h3>
                  <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> ออนไลน์
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto bg-slate-50 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.isBot ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-indigo-100 text-indigo-600' : 'bg-[#3F51B5] text-white'}`}>
                      {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.isBot ? 'bg-white text-slate-700 rounded-tl-none' : 'bg-[#3F51B5] text-white rounded-tr-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm flex gap-2 items-center">
                    <Loader2 size={16} className="animate-spin text-indigo-500" />
                    <span className="text-xs text-slate-400 font-light">AI กำลังพิมพ์...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความที่นี่..."
                className="flex-grow bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#3F51B5]/20 outline-none transition-all"
              />
              <button type="submit" className="bg-[#3F51B5] text-white p-2 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-md">
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#3F51B5] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:bg-indigo-700 transition-all border-4 border-white relative group"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute right-20 bg-white text-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            มีคำถาม? คุยกับ AI ของเราได้ที่นี่
          </div>
        )}
      </motion.button>
    </div>
  );
}