import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, User, LogOut, Bell, Menu, X, Shield, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function AdminNavbar({ isSidebarOpen, onToggleSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.full_name || user?.username || 'ผู้ใช้งานระบบ';
  const displayEmail = user?.email || '';
  const isAdmin = role === 'admin';
  const roleLabel = isAdmin ? 'SUPER ADMIN' : 'LECTURER (อาจารย์)';

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-10 flex-shrink-0 relative z-30 gap-4">

      {/* Hamburger: แสดงเฉพาะจอเล็กกว่า md (768px) เพื่อเปิด/ปิด sidebar */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? "ปิดเมนู" : "เปิดเมนู"}
        aria-expanded={isSidebarOpen}
        className="md:hidden flex-shrink-0 p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 🔍 Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-300 group-focus-within:text-[#3F51B5] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="ค้นหาเมนู, ข้อมูล หรือเอกสาร... (Ctrl+K)" 
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-14 pr-16 text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all"
          />
          <div className="absolute inset-y-0 right-5 flex items-center">
            <span className="text-[10px] font-bold text-slate-300 border border-slate-200 px-1.5 py-0.5 rounded-md">⌘ K</span>
          </div>
        </div>
      </div>

      {/* 👤 User Profile & Notifications */}
      <div className="flex items-center gap-6 ml-8">
        
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile Dropdown Area */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-4 group hover:bg-slate-50 p-1.5 pr-4 rounded-2xl transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-indigo-50 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center relative text-[#3F51B5] font-black">
              {displayName.charAt(0).toUpperCase()}
              <div className={`absolute bottom-0 right-0 w-3 h-3 ${isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'} border-2 border-white rounded-full`}></div>
            </div>
            <div className="text-right hidden sm:block max-w-[150px]">
              <p className="text-sm font-bold text-slate-800 truncate leading-none">{displayName}</p>
              <p className={`text-[10px] font-black uppercase tracking-wider mt-1.5 ${isAdmin ? 'text-[#3F51B5]' : 'text-emerald-600'}`}>
                {roleLabel}
              </p>
            </div>
            <ChevronDown 
              size={16} 
              className={`text-slate-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* 📋 Dropdown Menu */}
          <AnimatePresence>
            {isProfileOpen && (
              <>
                {/* Overlay สำหรับปิดเมื่อคลิกข้างนอก */}
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-72 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50 p-3 z-50 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-slate-50 mb-2">
                    <p className="font-bold text-slate-800 text-[15px] truncate">{displayName}</p>
                    {displayEmail && <p className="text-xs text-slate-400 mt-1 truncate">{displayEmail}</p>}
                    <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${isAdmin ? 'bg-indigo-50 text-[#3F51B5]' : 'bg-emerald-50 text-emerald-600'}`}>
                      {roleLabel}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/profile');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium group"
                    >
                      <User size={18} className="text-slate-300 group-hover:text-[#3F51B5]" />
                      ข้อมูลส่วนตัว (แก้ไขประวัติ)
                    </button>

                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors text-sm font-bold group border-t border-slate-50 mt-2"
                    >
                      <LogOut size={18} />
                      ออกจากระบบ
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}