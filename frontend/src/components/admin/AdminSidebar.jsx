import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Palette, ShieldCheck  } from 'lucide-react';
import { 
  LayoutDashboard, Newspaper, Archive, GraduationCap, 
  Files, Users, BookOpen, FolderGit2, LogOut, UserCircle,
  MessageSquare 
} from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();
  const userRole = 'admin';

  const menuItems = [
    { label: 'แดชบอร์ด', icon: <LayoutDashboard size={22} />, path: '/admin', roles: ['admin', 'lecturer'] },
    { label: 'ภาพลักษณ์', icon: <Palette size={22} />, path: '/admin/appearance', roles: ['admin'] },
    { label: 'ข่าวสาร', icon: <Newspaper size={22} />, path: '/admin/news', roles: ['admin', 'teacher'] },
    { label: 'คลังข่าว', icon: <Archive size={22} />, path: '/admin/news/archive', roles: ['admin'] }, 
    { label: 'ข้อมูลส่วนตัวอาจารย์', icon: <UserCircle size={22} />, path: '/admin/profile', roles: ['lecturer'] },
    { label: 'หลักสูตร', icon: <GraduationCap size={22} />, path: '/admin/curriculum', roles: ['admin'] },
    { label: 'โครงงานนักศึกษา', icon: <FolderGit2 size={22} />, path: '/admin/projects', roles: ['admin'] },
    { label: 'ไฟล์และเอกสาร', icon: <Files size={22} />, path: '/admin/files', roles: ['admin'] },
    { label: 'บทบาทและสิทธิ์', icon: <ShieldCheck size={22} />, path: '/admin/roles', roles: ['admin'] },
    { label: 'ข้อมูลรายวิชา', icon: <BookOpen size={22} />, path: '/admin/subjects', roles: ['admin'] },
    { label: 'ระบบ AI Chatbot', icon: <MessageSquare size={22} />, path: '/admin/chatbot', roles: ['admin'] },
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col font-['Prompt'] border-r border-slate-50 text-left">
      {/* 🏛️ Admin Header Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 bg-[#3F51B5] rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
            CIS
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 leading-tight">Admin Panel</h2>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Management System</p>
          </div>
        </div>
        <h3 className="text-[#3F51B5] font-black text-[11px] uppercase tracking-[0.25em] mb-4 opacity-50 ml-2">
          Main Management
        </h3>
      </div>
      
      {/* 🧭 Navigation Menu */}
      <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
        <nav className="space-y-1.5 pb-8">
          {menuItems.filter(item => item.roles.includes(userRole)).map((item) => {
            
            // ✨ ปรับปรุง Logic การเช็ค Active ใหม่ ✨
            // 1. ถ้าเป็นหน้าคลังข่าว ให้เช็คแบบตรงตัวเท่านั้น เพื่อไม่ให้ไปติดที่หน้าจัดการข่าวสาร
            // 2. สำหรับเมนูอื่นๆ ให้เช็คว่า Path ปัจจุบันตรงกับเมนู หรือเริ่มต้นด้วย Path ของเมนูนั้นๆ
            const isActive = item.path === '/admin/news/archive' 
              ? location.pathname === item.path 
              : (location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path + '/')));

            // พิเศษสำหรับหน้าจัดการข่าวสาร (เมนูหลัก) ไม่ให้สว่างเมื่ออยู่หน้าคลังข่าว
            const isNewsMainActive = item.path === '/admin/news' && location.pathname.startsWith('/admin/news/archive');
            const finalActive = isActive && !isNewsMainActive;
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 group ${
                  finalActive 
                  ? 'bg-[#3F51B5] text-white shadow-xl shadow-indigo-100/40' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-[#3F51B5]'
                }`}
              >
                <span className={`${finalActive ? 'text-white' : 'group-hover:text-[#3F51B5] transition-colors'}`}>
                  {item.icon}
                </span>
                <span className={`font-bold text-sm tracking-tight ${finalActive ? 'text-white' : ''}`}>
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
        <button className="flex items-center gap-4 px-6 py-4 w-full text-rose-500 hover:bg-rose-100/50 rounded-[1.5rem] transition-all duration-300 font-black text-sm group">
          <div className="p-2 bg-rose-100/50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
            <LogOut size={18} />
          </div>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}