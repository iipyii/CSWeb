import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    /* 1. ใช้ flex เพื่อให้ Sidebar และ Main จัดเรียงต่อกันในแนวนอน */
    <div className="flex min-h-screen bg-slate-50 font-['Prompt']">
      
      {/* 2. Sidebar: กำหนดความกว้างให้คงที่ (w-72) และไม่ให้หดตัว (shrink-0) */}
      <div className="w-72 shrink-0 border-r border-slate-200 sticky top-0 h-screen overflow-y-auto bg-white">
        <AdminSidebar />
      </div>

      {/* 3. Main Content: ใช้ flex-grow เพื่อให้พื้นที่ที่เหลือทั้งหมดเป็นของเนื้อหา */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header ส่วนบน */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <img src="/cis-logo.svg" className="h-10" alt="CIS Logo" />
          <div className="flex items-center gap-3">
             <span className="text-sm font-bold">Admin User</span>
             <div className="w-8 h-8 rounded-full bg-slate-200" />
          </div>
        </header>

        {/* 4. พื้นที่แสดงเนื้อหา (Outlet): ตั้งค่า overflow-y-auto เพื่อให้เลื่อนดูข้อมูลได้อิสระ */}
        <main className="flex-grow overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}