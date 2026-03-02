import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Newspaper, Archive, GraduationCap, 
  FileText, Users, BookOpen, FolderGit2, LogOut, UserCircle 
} from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();
  // ในอนาคตดึง Role จาก Auth Context
  const userRole = 'admin'; // 'admin' หรือ 'teacher'

  // ✅ ปรับปรุงรายการเมนูและ Path ให้ตรงตามโครงสร้างระบบจัดการ
  const menuItems = [
    { label: 'แดชบอร์ด', icon: <LayoutDashboard size={22} />, path: '/admin', roles: ['admin', 'teacher'] },
    { label: 'จัดการข่าวสาร', icon: <Newspaper size={22} />, path: '/admin/news', roles: ['admin', 'teacher'] },
    { label: 'คลังข่าว', icon: <Archive size={22} />, path: '/admin/news/archive', roles: ['admin'] }, // 👈 อัปเดต Path ให้ตรงกับ NewsArchive
    { label: 'ข้อมูลส่วนตัวอาจารย์', icon: <UserCircle size={22} />, path: '/admin/profile', roles: ['teacher'] },
    { label: 'หลักสูตร', icon: <GraduationCap size={22} />, path: '/admin/curriculum', roles: ['admin'] },
    { label: 'เอกสาร/ดาวน์โหลด', icon: <FileText size={22} />, path: '/admin/downloads', roles: ['admin'] },
    { label: 'จัดการผู้ใช้งาน', icon: <Users size={22} />, path: '/admin/users', roles: ['admin'] },
    { label: 'ข้อมูลรายวิชา', icon: <BookOpen size={22} />, path: '/admin/subjects', roles: ['admin'] },
    { label: 'โครงงานนักศึกษา', icon: <FolderGit2 size={22} />, path: '/admin/projects', roles: ['admin'] },
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col font-['Prompt'] border-r border-slate-50">
      <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
        {/* Header Section */}
        <h3 className="text-[#3F51B5] font-black text-[11px] uppercase tracking-[0.25em] mb-8 opacity-50 ml-2">
          Main Management
        </h3>
        
        <nav className="space-y-1.5">
          {menuItems.filter(item => item.roles.includes(userRole)).map((item) => {
            // ตรวจสอบว่า Path ปัจจุบันตรงกับเมนูหรือไม่ (รองรับ Nested Route เช่น news/archive)
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 group ${
                  isActive 
                  ? 'bg-[#3F51B5] text-white shadow-xl shadow-indigo-100' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-[#3F51B5]'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'group-hover:text-[#3F51B5] transition-colors'}`}>
                  {item.icon}
                </span>
                <span className={`font-bold text-sm tracking-tight ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </span>
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Section */}
      <div className="p-8 border-t border-slate-50 bg-slate-50/30">
        <button className="flex items-center gap-4 px-6 py-4 w-full text-rose-500 hover:bg-rose-50 rounded-[1.5rem] transition-all duration-300 font-black text-sm group">
          <div className="p-2 bg-rose-100/50 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all">
            <LogOut size={18} />
          </div>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}