import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  Palette, ShieldCheck, Building2, ClipboardCheck, 
  BookOpenCheck, Bookmark, Link2, ChevronDown, 
  LayoutDashboard, Newspaper, Archive, GraduationCap, 
  Files, Users, BookOpen, FolderGit2, LogOut, UserCircle,
  MessageSquare, UserCheck
} from 'lucide-react';

export default function AdminSidebar({ onNavigate }) {
  const location = useLocation();
  const { role, user, logout } = useAuth();
  const userRole = role || 'lecturer';
  const [logoUrl, setLogoUrl] = useState(null);

  const currentTab = new URLSearchParams(location.search).get('tab');

  // 1. Personnel sub-items
  const personnelSubItems = [
    { label: 'บุคลากรสายวิชาการ (อาจารย์)', icon: <GraduationCap size={18} />, path: '/admin/personnel?tab=lecturers', basePath: '/admin/personnel', tab: 'lecturers', roles: ['admin'] },
    { label: 'บุคลากรสายสนับสนุน (Staff)', icon: <UserCheck size={18} />, path: '/admin/personnel?tab=staff', basePath: '/admin/personnel', tab: 'staff', roles: ['admin'] },
    { label: 'ลิงก์สำหรับบุคลากร', icon: <Link2 size={18} />, path: '/admin/personnel?tab=links', basePath: '/admin/personnel', tab: 'links', roles: ['admin'] },
    { label: 'ข้อมูลส่วนตัวอาจารย์', icon: <UserCircle size={18} />, path: '/admin/profile', basePath: '/admin/profile', roles: ['lecturer', 'admin'] },
  ];

  const isPersonnelActive = location.pathname.startsWith('/admin/personnel') || location.pathname.startsWith('/admin/profile');
  const [isPersonnelOpen, setIsPersonnelOpen] = useState(isPersonnelActive);

  // 2. Student sub-items
  const studentSubItems = [
    { label: 'โครงงานนักศึกษา', icon: <FolderGit2 size={18} />, path: '/admin/projects', roles: ['admin'] },
    { label: 'นักศึกษาในที่ปรึกษา', icon: <UserCheck size={18} />, path: '/admin/consultants', roles: ['admin', 'lecturer'] },
    { label: 'จัดการข้อมูลการฝึกงาน', icon: <ClipboardCheck size={18} />, path: '/admin/internship', roles: ['admin', 'lecturer'] },
    { label: 'จัดการขบวนวิชา', icon: <BookOpenCheck size={18} />, path: '/admin/subject-courses', roles: ['admin', 'lecturer'] },
    { label: 'จัดการคู่มือนักศึกษา', icon: <Bookmark size={18} />, path: '/admin/student-guide', roles: ['admin', 'lecturer'] },
    { label: 'จัดการลิงก์สำหรับนักศึกษา', icon: <Link2 size={18} />, path: '/admin/student-links', roles: ['admin'] },
  ];

  const isStudentActive = studentSubItems.some(item => 
    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  );
  const [isStudentOpen, setIsStudentOpen] = useState(isStudentActive);

  useEffect(() => {
    if (isPersonnelActive) setIsPersonnelOpen(true);
  }, [location.pathname, isPersonnelActive]);

  useEffect(() => {
    if (isStudentActive) setIsStudentOpen(true);
  }, [location.pathname, isStudentActive]);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/appearance/settings");
        const logo = res.data?.configMap?.site_logo;
        if (logo && logo.trim() !== "") {
          setLogoUrl(logo.startsWith("http") ? logo : `http://localhost:5000${logo}`);
        } else {
          setLogoUrl(null);
        }
      } catch (err) {
        // ignore
      }
    };
    fetchLogo();
    const handleUpdate = (e) => {
      if (e.detail?.site_logo !== undefined) {
        const logo = e.detail.site_logo;
        setLogoUrl(logo && logo.trim() !== "" ? (logo.startsWith("http") ? logo : `http://localhost:5000${logo}`) : null);
      } else {
        fetchLogo();
      }
    };
    window.addEventListener("site_config_updated", handleUpdate);
    return () => window.removeEventListener("site_config_updated", handleUpdate);
  }, []);

  const menuItems = [
    { label: 'แดชบอร์ด', icon: <LayoutDashboard size={22} />, path: '/admin', roles: ['admin', 'lecturer'] },
    { label: 'ภาพลักษณ์', icon: <Palette size={22} />, path: '/admin/appearance', roles: ['admin'] },
    { label: 'จัดการข้อมูลแนะนำภาควิชาฯ', icon: <Building2 size={22} />, path: '/admin/about', roles: ['admin'] },
    
    // Group 1: จัดการข้อมูลบุคลากร
    { isGroup: true, id: 'personnel' },

    { label: 'ข่าวสาร', icon: <Newspaper size={22} />, path: '/admin/news', roles: ['admin', 'lecturer'] },
    { label: 'คลังข่าว', icon: <Archive size={22} />, path: '/admin/news/archive', roles: ['admin'] }, 
    { label: 'หลักสูตร', icon: <GraduationCap size={22} />, path: '/admin/curriculum', roles: ['admin'] },

    // Group 2: จัดการข้อมูลนักศึกษา
    { isGroup: true, id: 'students' },

    { label: 'ไฟล์และเอกสาร', icon: <Files size={22} />, path: '/admin/files', roles: ['admin'] },
    { label: 'บทบาทและสิทธิ์', icon: <ShieldCheck size={22} />, path: '/admin/roles', roles: ['admin'] },
    { label: 'ข้อมูลรายวิชา', icon: <BookOpen size={22} />, path: '/admin/subjects', roles: ['admin'] },
    { label: 'ระบบ AI Chatbot', icon: <MessageSquare size={22} />, path: '/admin/chatbot', roles: ['admin'] },
  ];

  const allowedPersonnelSubItems = personnelSubItems.filter(item => item.roles.includes(userRole));
  const allowedStudentSubItems = studentSubItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-full h-full bg-white flex flex-col border-r border-slate-100 text-left">
      {/* 🏛️ Admin Header Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-2xl object-contain shadow-sm border border-slate-100 bg-white p-1" />
          ) : (
            <div className="w-10 h-10 bg-[#3F51B5] rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
              CIS
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">Admin Panel</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Management System</p>
          </div>
        </div>
        <h3 className="text-[#3F51B5] font-black text-[11px] uppercase tracking-[0.25em] mb-4 opacity-70 ml-2">
          Main Management
        </h3>
      </div>
      
      {/* 🧭 Navigation Menu */}
      <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
        <nav className="space-y-1.5 pb-8">
          {menuItems.map((item, idx) => {
            
            // 👥 Group 1: Personnel Management Group
            if (item.isGroup && item.id === 'personnel') {
              if (allowedPersonnelSubItems.length === 0) return null;

              return (
                <div key="personnel-group" className="space-y-1 my-1">
                  <button
                    type="button"
                    onClick={() => setIsPersonnelOpen(prev => !prev)}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-300 group ${
                      isPersonnelActive && !isPersonnelOpen
                        ? 'bg-[#3F51B5]/10 text-[#3F51B5] border border-[#3F51B5]/20 font-black'
                        : isPersonnelActive
                        ? 'bg-slate-50 text-[#3F51B5] font-black'
                        : 'text-slate-800 hover:bg-slate-50 hover:text-[#3F51B5] font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`${isPersonnelActive ? 'text-[#3F51B5]' : 'text-slate-800 group-hover:text-[#3F51B5] transition-colors'}`}>
                        <Users size={22} />
                      </span>
                      <span className="text-sm tracking-tight text-left">
                        จัดการข้อมูลบุคลากร
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isPersonnelActive && (
                        <div className="w-2 h-2 rounded-full bg-[#3F51B5]" />
                      )}
                      <motion.div
                        animate={{ rotate: isPersonnelOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-700 group-hover:text-[#3F51B5]"
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isPersonnelOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden pl-3 space-y-1"
                      >
                        <div className="border-l-2 border-indigo-100 pl-3 space-y-1 my-1">
                          {allowedPersonnelSubItems.map((sub) => {
                            let isSubActive = false;
                            if (sub.basePath === '/admin/profile') {
                              isSubActive = location.pathname.startsWith('/admin/profile');
                            } else if (sub.basePath === '/admin/personnel') {
                              if (location.pathname.startsWith('/admin/personnel')) {
                                if (sub.tab === 'lecturers') {
                                  isSubActive = !currentTab || currentTab === 'lecturers';
                                } else {
                                  isSubActive = currentTab === sub.tab;
                                }
                              }
                            }

                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={onNavigate}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                                  isSubActive
                                    ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100/50'
                                    : 'text-slate-800 hover:bg-slate-100 hover:text-[#3F51B5]'
                                }`}
                              >
                                <span className={`${isSubActive ? 'text-white' : 'text-slate-800 group-hover:text-[#3F51B5] transition-colors'}`}>
                                  {sub.icon}
                                </span>
                                <span className="truncate">{sub.label}</span>
                                {isSubActive && (
                                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // 🎓 Group 2: Student Management Group
            if (item.isGroup && item.id === 'students') {
              if (allowedStudentSubItems.length === 0) return null;

              return (
                <div key="student-group" className="space-y-1 my-1">
                  <button
                    type="button"
                    onClick={() => setIsStudentOpen(prev => !prev)}
                    className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-300 group ${
                      isStudentActive && !isStudentOpen
                        ? 'bg-[#3F51B5]/10 text-[#3F51B5] border border-[#3F51B5]/20 font-black'
                        : isStudentActive
                        ? 'bg-slate-50 text-[#3F51B5] font-black'
                        : 'text-slate-800 hover:bg-slate-50 hover:text-[#3F51B5] font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`${isStudentActive ? 'text-[#3F51B5]' : 'text-slate-800 group-hover:text-[#3F51B5] transition-colors'}`}>
                        <GraduationCap size={22} />
                      </span>
                      <span className="text-sm tracking-tight text-left">
                        จัดการข้อมูลนักศึกษา
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isStudentActive && (
                        <div className="w-2 h-2 rounded-full bg-[#3F51B5]" />
                      )}
                      <motion.div
                        animate={{ rotate: isStudentOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-700 group-hover:text-[#3F51B5]"
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isStudentOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden pl-3 space-y-1"
                      >
                        <div className="border-l-2 border-indigo-100 pl-3 space-y-1 my-1">
                          {allowedStudentSubItems.map((sub) => {
                            const isSubActive = location.pathname === sub.path || location.pathname.startsWith(sub.path + '/');
                            return (
                              <Link
                                key={sub.path}
                                to={sub.path}
                                onClick={onNavigate}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                                  isSubActive
                                    ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100/50'
                                    : 'text-slate-800 hover:bg-slate-100 hover:text-[#3F51B5]'
                                }`}
                              >
                                <span className={`${isSubActive ? 'text-white' : 'text-slate-800 group-hover:text-[#3F51B5] transition-colors'}`}>
                                  {sub.icon}
                                </span>
                                <span className="truncate">{sub.label}</span>
                                {isSubActive && (
                                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Regular menu items
            if (!item.roles || !item.roles.includes(userRole)) return null;

            const isActive = item.path === '/admin/news/archive' 
              ? location.pathname === item.path 
              : (location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path + '/')));

            const isNewsMainActive = item.path === '/admin/news' && location.pathname.startsWith('/admin/news/archive');
            const finalActive = isActive && !isNewsMainActive;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 group ${
                  finalActive 
                  ? 'bg-[#3F51B5] text-white shadow-xl shadow-indigo-100/40 font-black' 
                  : 'text-slate-800 hover:bg-slate-50 hover:text-[#3F51B5] font-bold'
                }`}
              >
                <span className={`${finalActive ? 'text-white' : 'text-slate-800 group-hover:text-[#3F51B5] transition-colors'}`}>
                  {item.icon}
                </span>
                <span className="text-sm tracking-tight">
                  {item.label}
                </span>
                
                {finalActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 🚪 Logout Section */}
      <div className="p-8 border-t border-slate-50 bg-slate-50/30">
        <button 
          onClick={logout}
          className="flex items-center gap-4 px-6 py-4 w-full text-rose-500 hover:bg-rose-100/50 rounded-[1.5rem] transition-all duration-300 font-black text-sm group"
        >
          <div className="p-2 bg-rose-100/50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
            <LogOut size={18} />
          </div>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}