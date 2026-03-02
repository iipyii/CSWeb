import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Newspaper, GraduationCap, 
  FileText, Users, BookOpen, FolderGit2, Archive, LogOut 
} from 'lucide-react';

const menuItems = [
  { label: 'แดชบอร์ด', icon: <LayoutDashboard size={20} />, path: '/admin' },
  { label: 'ข่าวสาร', icon: <Newspaper size={20} />, path: '/admin/news' },
  { label: 'คลังข่าว', icon: <Archive size={20} />, path: '/admin/news-archive' },
  { label: 'หลักสูตร', icon: <GraduationCap size={20} />, path: '/admin/curriculum' },
  { label: 'เอกสาร/ดาวน์โหลด', icon: <FileText size={20} />, path: '/admin/downloads' },
  { label: 'ผู้ใช้งาน', icon: <Users size={20} />, path: '/admin/users' },
  { label: 'ข้อมูลรายวิชา', icon: <BookOpen size={20} />, path: '/admin/subjects' },
  { label: 'โครงงานนักศึกษา', icon: <FolderGit2 size={20} />, path: '/admin/projects' },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-72 bg-[#F0F5F9] min-h-screen border-r border-slate-200 p-6 sticky top-0 flex flex-col">
      {/* ส่วนหัว Sidebar */}
      <div className="mb-10 px-2">
        <h3 className="text-[#3F51B5] font-bold text-lg uppercase tracking-wider">การจัดการ</h3>
      </div>

      {/* รายการเมนู */}
      <nav className="space-y-1 flex-grow">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                isActive 
                ? 'bg-white text-[#3F51B5] shadow-sm' 
                : 'text-slate-500 hover:bg-white/50 hover:text-[#3F51B5]'
              }`}
            >
              <span className={isActive ? 'text-[#3F51B5]' : 'text-slate-400'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ปุ่มออกจากระบบ */}
      <div className="pt-6 border-t border-slate-200">
        <button className="flex items-center gap-4 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
          <LogOut size={20} />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}