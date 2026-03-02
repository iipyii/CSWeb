import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Newspaper, Archive, GraduationCap, FileText, Users, BookOpen, FolderGit2, LogOut, UserCircle } from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();
  // ในอนาคตดึง Role จาก Auth Context
  const userRole = 'admin'; // 'admin' หรือ 'teacher'

  const menuItems = [
    { label: 'แดชบอร์ด', icon: <LayoutDashboard size={22} />, path: '/admin', roles: ['admin', 'teacher'] },
    { label: 'จัดการข่าวสาร', icon: <Newspaper size={22} />, path: '/admin/news', roles: ['admin', 'teacher'] },
    { label: 'ข้อมูลส่วนตัวอาจารย์', icon: <UserCircle size={22} />, path: '/admin/profile', roles: ['teacher'] },
    { label: 'คลังข่าว', icon: <Archive size={22} />, path: '/admin/news-archive', roles: ['admin'] },
    { label: 'หลักสูตร', icon: <GraduationCap size={22} />, path: '/admin/curriculum', roles: ['admin'] },
    { label: 'เอกสาร/ดาวน์โหลด', icon: <FileText size={22} />, path: '/admin/downloads', roles: ['admin'] },
    { label: 'จัดการผู้ใช้งาน', icon: <Users size={22} />, path: '/admin/users', roles: ['admin'] },
    { label: 'ข้อมูลรายวิชา', icon: <BookOpen size={22} />, path: '/admin/subjects', roles: ['admin'] },
    { label: 'โครงงานนักศึกษา', icon: <FolderGit2 size={22} />, path: '/admin/projects', roles: ['admin'] },
  ];

  return (
    <div className="w-full h-full bg-white flex flex-col font-['Prompt']">
      <div className="p-8 flex-1 overflow-y-auto">
        <h3 className="text-[#3F51B5] font-bold text-sm uppercase tracking-[0.2em] mb-8">การจัดการ</h3>
        <nav className="space-y-2">
          {menuItems.filter(item => item.roles.includes(userRole)).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-white text-[#3F51B5] shadow-lg shadow-indigo-100 border border-slate-50' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
                <span className={`${isActive ? 'text-[#3F51B5]' : 'group-hover:text-[#3F51B5]'}`}>{item.icon}</span>
                <span className={`font-bold text-[15px] ${isActive ? 'text-slate-800' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-8 border-t border-slate-50">
        <button className="flex items-center gap-4 px-5 py-3 w-full text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300 font-bold text-[15px] group">
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}