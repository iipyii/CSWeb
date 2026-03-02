import React from 'react';
import { Users, GraduationCap, Award, TrendingUp } from 'lucide-react';

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
      {icon}
    </div>
  </div>
);

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-slate-800">แดชบอร์ดสรุปผล</h1>
        <p className="text-slate-500">ยินดีต้อนรับ, Admin • ข้อมูลล่าสุดวันนี้</p>
      </div>

      {/* ส่วนการ์ดสถิติ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="นักศึกษาทั้งหมด" value="5,699" icon={<Users />} color="bg-blue-500" />
        <StatCard label="อาจารย์ประจำ" value="297" icon={<GraduationCap />} color="bg-indigo-500" />
        <StatCard label="โครงงานวิจัย" value="368" icon={<Award />} color="bg-cyan-500" />
        <StatCard label="งบประมาณวิจัย" value="฿87.3M" icon={<TrendingUp />} color="bg-emerald-500" />
      </div>

      {/* ส่วนกราฟหรือข้อมูลอื่นๆ (จำลอง) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-80 flex items-center justify-center text-slate-300 italic">
          ส่วนแสดงกราฟผลการเรียนเฉลี่ย (Academic Performance)
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-80 flex items-center justify-center text-slate-300 italic">
          ส่วนแสดงกิจกรรมนักศึกษาล่าสุด (Student Activity)
        </div>
      </div>
    </div>
  );
}