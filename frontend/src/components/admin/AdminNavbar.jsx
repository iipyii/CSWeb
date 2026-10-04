import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, ChevronDown, User, LogOut, Bell, Menu, X, Shield, 
  GraduationCap, FileText, Newspaper, Files, ExternalLink, 
  ArrowRight, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function AdminNavbar({ isSidebarOpen, onToggleSidebar }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.full_name || user?.username || 'ผู้ใช้งานระบบ';
  const displayEmail = user?.email || '';
  const isAdmin = role === 'admin';
  const roleLabel = isAdmin ? 'SUPER ADMIN' : 'LECTURER (อาจารย์)';

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const adminMenuItems = [
    { label: 'แดชบอร์ด (Dashboard)', path: '/admin', group: 'ภาพรวม', keywords: 'หน้าหลัก dashboard ภาพรวม สถิติ' },
    { label: 'จัดการภาพลักษณ์ (Appearance)', path: '/admin/appearance', group: 'ทั่วไป', keywords: 'โลโก้ แบนเนอร์ ปุ่มทางลัด ปรับแต่ง' },
    { label: 'จัดการข้อมูลแนะนำภาควิชาฯ (About CS)', path: '/admin/about', group: 'ข้อมูลภาควิชา', keywords: 'เกี่ยวกับ ประวัติ วิสัยทัศน์ กรีนออฟฟิศ green office โปสเตอร์' },
    { label: 'บุคลากรสายวิชาการ (อาจารย์)', path: '/admin/personnel?tab=lecturers', group: 'บุคลากร', keywords: 'อาจารย์ บุคลากร ผู้สอน lecturer' },
    { label: 'บุคลากรสายสนับสนุน (Staff)', path: '/admin/personnel?tab=staff', group: 'บุคลากร', keywords: 'เจ้าหน้าที่ บุคลากร สายสนับสนุน staff' },
    { label: 'ลิงก์สำหรับบุคลากร', path: '/admin/personnel?tab=links', group: 'บุคลากร', keywords: 'ลิงก์ ภายนอก บุคลากร staff links' },
    { label: 'ข้อมูลส่วนตัวอาจารย์ (Profile)', path: '/admin/profile', group: 'บุคลากร', keywords: 'โปรไฟล์ ข้อมูลส่วนตัว แก้ไขประวัติ profile' },
    { label: 'จัดการข่าวสาร (News)', path: '/admin/news', group: 'ประชาสัมพันธ์', keywords: 'ข่าว ประกาศ ข่าวสาร news กิจกรรม' },
    { label: 'คลังข่าวสาร (News Archive)', path: '/admin/news/archive', group: 'ประชาสัมพันธ์', keywords: 'คลังข่าว ข่าวเก่า archive' },
    { label: 'จัดการหลักสูตร (Curriculum)', path: '/admin/curriculum', group: 'การศึกษา', keywords: 'หลักสูตร ปริญญาตรี ปริญญาโท ปริญญาเอก วิชา 2569 course' },
    { label: 'จัดการโครงงานนักศึกษา (Projects)', path: '/admin/projects', group: 'นักศึกษา', keywords: 'โครงงาน โปรเจกต์ ปริญญานิพนธ์ project' },
    { label: 'นักศึกษาในที่ปรึกษา (Consultants)', path: '/admin/consultants', group: 'นักศึกษา', keywords: 'ที่ปรึกษา นักศึกษา consult advisor' },
    { label: 'จัดการข้อมูลการฝึกงาน (Internship)', path: '/admin/internship', group: 'นักศึกษา', keywords: 'ฝึกงาน สหกิจ internship coop' },
    { label: 'จัดการขบวนวิชา (Subject Courses)', path: '/admin/subject-courses', group: 'นักศึกษา', keywords: 'ขบวนวิชา ตารางสอน subject course' },
    { label: 'จัดการคู่มือนักศึกษา (Student Guide)', path: '/admin/student-guide', group: 'นักศึกษา', keywords: 'คู่มือนักศึกษา ระเบียบการ handbook guide' },
    { label: 'จัดการลิงก์สำหรับนักศึกษา', path: '/admin/student-links', group: 'นักศึกษา', keywords: 'ลิงก์ นักศึกษา student links' },
    { label: 'จัดการไฟล์และเอกสาร (Downloads)', path: '/admin/files', group: 'เอกสาร', keywords: 'ไฟล์ เอกสาร ดาวน์โหลด แบบฟอร์ม download' },
    { label: 'จัดการระเบียบและข้อบังคับ (Regulations)', path: '/admin/regulations', group: 'เอกสาร', keywords: 'ระเบียบ ข้อบังคับ ประกาศ บัณฑิตศึกษา การเงิน บุคคล regulation' },
    { label: 'จัดการบทบาทและสิทธิ์ (Roles)', path: '/admin/roles', group: 'ผู้ดูแลระบบ', keywords: 'บทบาท สิทธิ์ permission role' },
    { label: 'จัดการผู้ใช้งานระบบ (Users)', path: '/admin/users', group: 'ผู้ดูแลระบบ', keywords: 'ผู้ใช้ สมาชิก บัญชี user account' },
  ];

  const searchResults = searchQuery.trim()
    ? adminMenuItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.group.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectMenuItem = (path) => {
    navigate(path);
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const [newsRes, filesRes] = await Promise.allSettled([
        axios.get('/api/news?limit=5'),
        axios.get('/api/downloads')
      ]);

      const items = [];
      if (newsRes.status === 'fulfilled' && Array.isArray(newsRes.value?.data)) {
        newsRes.value.data.slice(0, 4).forEach(n => {
          items.push({
            id: `news-${n.id}`,
            type: 'news',
            title: n.title,
            category: n.category || 'ข่าวสาร',
            time: n.created_at || new Date(),
            path: '/admin/news'
          });
        });
      }
      if (filesRes.status === 'fulfilled' && Array.isArray(filesRes.value?.data)) {
        filesRes.value.data.slice(0, 4).forEach(f => {
          items.push({
            id: `file-${f.id}`,
            type: 'file',
            title: f.title,
            category: f.category || 'เอกสาร',
            time: f.created_at || new Date(),
            path: '/admin/files'
          });
        });
      }

      // Sort by date descending
      items.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(items.slice(0, 6));
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleToggleNotifications = () => {
    const nextState = !isNotifOpen;
    setIsNotifOpen(nextState);
    if (nextState) {
      setHasUnread(false);
      fetchNotifications();
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'เมื่อเร็วๆ นี้';
    const date = new Date(dateStr);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return 'เมื่อสักครู่';
    if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diff / 86400)} วันที่แล้ว`;
  };

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

      {/* 🔍 Search Bar with Live Results Dropdown */}
      <div className="flex-1 max-w-xl relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-300 group-focus-within:text-[#3F51B5] transition-colors" />
          </div>
          <input 
            ref={searchInputRef}
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="ค้นหาเมนู, ข้อมูล หรือเอกสาร... (Ctrl+K)" 
            className="w-full bg-slate-50 border border-transparent focus:border-indigo-100 rounded-2xl py-3 pl-14 pr-16 text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/10 transition-all text-slate-700"
          />
          <div className="absolute inset-y-0 right-4 flex items-center gap-1.5">
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X size={14} />
              </button>
            )}
            <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-2xs">
              Ctrl+K
            </span>
          </div>
        </div>

        {/* 📋 Autocomplete Search Results Dropdown */}
        <AnimatePresence>
          {isSearchFocused && searchQuery.trim() && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsSearchFocused(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 max-h-80 overflow-y-auto"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center border-b border-slate-100 mb-1">
                  <span>ผลการค้นหาเมนู ({searchResults.length} รายการ)</span>
                  <span className="text-[10px]">กดคลิกเพื่อไปยังหน้านั้น</span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectMenuItem(item.path)}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-indigo-50/70 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700">
                            {item.group}
                          </span>
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-900">
                            {item.label}
                          </span>
                        </div>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-sm text-slate-400">
                    ไม่พบเมนูที่ตรงกับคำว่า "{searchQuery}"
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* 👤 User Profile & Notifications */}
      <div className="flex items-center gap-4 ml-4">
        
        {/* 🔔 Notification Bell & Dropdown */}
        <div className="relative">
          <button 
            type="button"
            onClick={handleToggleNotifications}
            title="การแจ้งเตือน"
            aria-label="การแจ้งเตือน"
            className={`relative p-2.5 rounded-xl transition-all ${isNotifOpen ? 'bg-indigo-50 text-[#3F51B5]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <Bell size={20} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-1 ring-rose-300 animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 p-4 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#3F51B5]"></div>
                      <h4 className="font-bold text-sm text-slate-800">การแจ้งเตือนล่าสุด</h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      ข่าวสารและไฟล์ใหม่
                    </span>
                  </div>

                  {loadingNotifs ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      กำลังโหลดรายการแจ้งเตือน...
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setIsNotifOpen(false);
                            navigate(n.path);
                          }}
                          className="p-3 rounded-2xl hover:bg-indigo-50/60 transition-colors cursor-pointer border border-slate-50 flex items-start gap-3 group"
                        >
                          <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${n.type === 'news' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-[#3F51B5]'}`}>
                            {n.type === 'news' ? <Newspaper size={16} /> : <FileText size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-900 transition-colors">
                              {n.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                              <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                                {n.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={10} /> {formatTimeAgo(n.time)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      ไม่มีรายการแจ้งเตือนใหม่ในขณะนี้
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/admin/news');
                      }}
                      className="text-xs font-bold text-[#3F51B5] hover:text-indigo-800 transition-colors"
                    >
                      ดูรายการข่าวสารทั้งหมด →
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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