import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar'; // นำเข้า Navbar ที่มีโปรไฟล์และช่องค้นหา

export default function AdminLayout() {
  return (
    /**
     * 1. ใช้ flex และ h-screen เพื่อแบ่งพื้นที่ซ้าย (Sidebar) และขวา (Content) 
     * บังคับให้ความสูงเท่าหน้าจอพอดีเพื่อป้องกัน Dashboard ต่อท้ายด้านล่าง
     */
    <div className="flex h-screen w-full bg-slate-50 font-['Prompt'] overflow-hidden">
      
      {/* 2. Sidebar Area: ล็อกความกว้างคงที่และไม่ให้หดตัว */}
      <aside className="w-72 flex-shrink-0 h-full border-r border-slate-100 bg-white z-20 shadow-sm">
        <AdminSidebar />
      </aside>

      {/* 3. Main Area: พื้นที่ส่วนขวาที่รวม Navbar และ Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* 🚀 Top Navbar: ส่วนค้นหาและ User Profile */}
        <AdminNavbar />

        {/* 4. Dashboard Scrollable Content: พื้นที่แสดงผลหน้าต่างๆ ผ่าน Outlet */}
        <main className="flex-1 overflow-y-auto p-10 bg-[#FDF8F4]/30">
          <div className="max-w-[1600px] mx-auto pb-10">
            {/* เนื้อหาจาก AdminDashboard หรือหน้าจัดการอื่นๆ จะมาแสดงตรงนี้ */}
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}