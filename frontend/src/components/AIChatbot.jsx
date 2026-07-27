import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios'; // 👈 อย่าลืม import axios

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "สวัสดีครับ! ผมคือ AI ผู้ช่วยประจำภาควิชา CS มีอะไรให้ผมช่วยไหมครับ?", isBot: true }
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

    // 1. เอาข้อความผู้ใช้ไปโชว์ในแชทก่อน
    const userMsg = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 🎯 2. ยิง API ไปหา Backend ที่เราทำไว้ (เช็ก URL ให้ตรงกับพอร์ต Backend ของคุณนะครับ)
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMsg.text
      });

      // 3. เอาคำตอบจาก Gemini มาโชว์
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: response.data.reply, isBot: true }
      ]);

    } catch (error) {
      console.error("Chat API Error:", error);
      // กรณี Backend มีปัญหา หรือลืมเปิด Server
      setMessages(prev => [
        ...prev, 
        { id: Date.now() + 1, text: "ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้งครับ 😅", isBot: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
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
                  <h3 className="font-bold text-sm">CS AI Assistant</h3>
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
            <div className="flex-grow p-5 overflow-y-auto bg-slate-50 space-y-4 scroll-smooth">
              <div ref={scrollRef} className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.isBot ? -10 : 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg.id}
                    className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                      <div className={`w-8 h-8 mt-1 rounded-full flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-indigo-100 text-indigo-600' : 'bg-[#3F51B5] text-white'}`}>
                        {msg.isBot ? <Bot size={16} /> : <User size={16} />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.isBot ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' : 'bg-[#3F51B5] text-white rounded-tr-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center ml-10">
                      <Loader2 size={16} className="animate-spin text-indigo-500" />
                      <span className="text-xs text-slate-400 font-light">AI กำลังค้นหาข้อมูล...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความที่นี่..."
                className="flex-grow bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#3F51B5]/20 outline-none transition-all"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className={`text-white p-2 rounded-xl transition-all shadow-md ${isLoading || !input.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#3F51B5] hover:bg-indigo-700 active:scale-95'}`}
              >
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