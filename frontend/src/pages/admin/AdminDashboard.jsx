import React from 'react';
import { Newspaper, GraduationCap, FileText, Users, TrendingUp, RefreshCw, Plus, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trafficData = [{ name: 'จ.', v: 400 }, { name: 'อ.', v: 300 }, { name: 'พ.', v: 500 }, { name: 'พฤ.', v: 280 }, { name: 'ศ.', v: 590 }, { name: 'ส.', v: 320 }, { name: 'อา.', v: 210 }];

export default function AdminDashboard() {
  const userRole = 'admin'; // 'admin' หรือ 'teacher'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {userRole === 'admin' ? 'Dashboard Overview' : 'พื้นที่จัดการสำหรับอาจารย์'}
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            {userRole === 'admin' ? 'สรุปภาพรวมและจัดการเว็บไซต์ภาควิชาคอมพิวเตอร์และสารสนเทศ' : 'จัดการประกาศข่าวสารและข้อมูลส่วนตัว'}
          </p>
        </div>
        <button className="bg-[#1A1D2E] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-200 text-sm transition-all">
          <Plus size={18} /> {userRole === 'admin' ? 'เพิ่มข่าวสาร' : 'ประกาศข่าวใหม่'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="ข่าวสาร" value="156" icon={<Newspaper />} color="bg-blue-600" />
        {userRole === 'admin' && (
          <>
            <StatCard title="หลักสูตร" value="4" icon={<GraduationCap />} color="bg-indigo-600" />
            <StatCard title="ไฟล์สะสม" value="1,240" icon={<FileText />} color="bg-cyan-600" />
            {/* 🛠 แก้ไขจำนวนผู้ดูแลระบบเหลือ 1 คน */}
            <StatCard title="ผู้ดูแลระบบ" value="1" icon={<Users />} color="bg-emerald-600" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* กราฟสถิติ - แสดงเฉพาะ Admin */}
        <div className={`lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all ${userRole !== 'admin' && 'opacity-50 grayscale pointer-events-none'}`}>
          <h2 className="text-xl font-black text-slate-800 mb-8">สถิติการเข้าชมเว็บไซต์</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3F51B5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3F51B5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} 
                />
                <Area type="monotone" dataKey="v" stroke="#3F51B5" strokeWidth={4} fill="url(#colorV)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* กิจกรรมล่าสุด */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-black text-slate-800 mb-8">กิจกรรมล่าสุด</h2>
          <div className="space-y-6 flex-grow">
            <ActivityItem color="bg-blue-500" title="เพิ่มข่าวรับสมัคร" time="10 นาทีที่แล้ว" />
            <ActivityItem color="bg-emerald-500" title="อัปเดตไฟล์ มคอ.2" time="2 ชม. ที่แล้ว" />
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
    <div>
      <p className="text-slate-400 text-xs font-bold uppercase mb-1 tracking-wider">{title}</p>
      <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg shadow-inner transition-transform group-hover:scale-110`}>
      {icon}
    </div>
  </div>
);

const ActivityItem = ({ color, title, time }) => (
  <div className="flex gap-4 group cursor-default">
    <div className={`w-1 h-10 rounded-full ${color} opacity-30 group-hover:opacity-100 transition-opacity`} />
    <div>
      <h4 className="font-bold text-slate-800 text-sm leading-tight">{title}</h4>
      <p className="text-[11px] text-slate-400 mt-1">{time}</p>
    </div>
  </div>
);