import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserCheck, Lock, Save, Search, UserCog } from 'lucide-react';

export default function ManageRoles() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // จำลองข้อมูลผู้ใช้งานระบบหลังบ้าน
  const [users, setUsers] = useState([
    { id: 1, name: "แอดมิน ภาควิชา", email: "admin@kmutnb.ac.th", role: "admin", status: "active" },
    { id: 2, name: "รศ.ดร. สมชาย ใจดี", email: "somchai.j@cis.kmutnb.ac.th", role: "lecturer", status: "active" },
    { id: 3, name: "ผศ.หญิง มณี รัตนา", email: "manee.r@cis.kmutnb.ac.th", role: "lecturer", status: "active" },
  ]);

  const handleRoleChange = (id, newRole) => {
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  return (
    <div className="space-y-8 text-left">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-[#3F51B5]" /> จัดการบทบาทและสิทธิ์ผู้ใช้งาน
          </h1>
          <p className="text-slate-500 text-sm">กำหนดขอบเขตการเข้าถึงระบบหลังบ้านสำหรับบุคลากร</p>
        </div>
        <button className="flex items-center gap-2 bg-[#3F51B5] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
          <Save size={18} /> บันทึกการตั้งค่าทั้งหมด
        </button>
      </header>

      {/* 📊 ส่วนสรุปสิทธิ์ (Permission Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-[#3F51B5]"><Shield size={20}/></div>
            <h3 className="font-bold text-slate-800">สิทธิ์ Admin</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            สามารถเข้าถึงและแก้ไขข้อมูลได้ทุกส่วน รวมถึงการจัดการไฟล์ภาพลักษณ์, ผู้ใช้งาน, และข้อมูลหลักสูตร
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><UserCog size={20}/></div>
            <h3 className="font-bold text-slate-800">สิทธิ์ Lecturer</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            จำกัดการเข้าถึงเฉพาะส่วนของ "จัดการข่าวสาร" เพื่อประชาสัมพันธ์ และ "ข้อมูลส่วนตัว" เพื่ออัปเดตประวัติการศึกษาและผลงานวิจัยเท่านั้น
          </p>
        </div>
      </div>

      {/* 🔍 User List Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อหรืออีเมลบุคลากร..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-5">รายชื่อบุคลากร</th>
                <th className="px-8 py-5">อีเมล</th>
                <th className="px-8 py-5">บทบาทปัจจุบัน</th>
                <th className="px-8 py-5">สถานะ</th>
                <th className="px-8 py-5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.filter(u => u.name.includes(searchTerm) || u.email.includes(searchTerm)).map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-[#3F51B5] font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-medium">{user.email}</td>
                  <td className="px-8 py-5">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl outline-none border-none shadow-sm cursor-pointer
                        ${user.role === 'admin' ? 'bg-[#3F51B5] text-white' : 'bg-white text-slate-600 border border-slate-100'}`}
                    >
                      <option value="admin">Administrator</option>
                      <option value="lecturer">Lecturer</option>
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-1.5 text-green-500 text-xs font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> ออนไลน์
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <button className="p-2.5 text-slate-400 hover:text-[#3F51B5] transition-colors" title="Lock Account"><Lock size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}