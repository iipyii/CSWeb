import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Newspaper, GraduationCap, FileText, Users, TrendingUp, RefreshCw, Plus, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const userRole = role || 'lecturer';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    newsCount: 0,
    curriculumCount: 0,
    filesCount: 0,
    adminCount: 1
  });
  const [activities, setActivities] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [trafficSummary, setTrafficSummary] = useState({
    today: 0,
    week: 0,
    total: 0
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/dashboard");
      if (res.data.stats) setStats(res.data.stats);
      if (res.data.activities) setActivities(res.data.activities);
      if (res.data.traffic) setTrafficData(res.data.traffic);
      if (res.data.trafficSummary) setTrafficSummary(res.data.trafficSummary);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatActivityTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            title="รีเฟรชข้อมูล"
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#3F51B5] transition-all shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => navigate('/admin/news/create')}
            className="bg-[#1A1D2E] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-200 text-sm transition-all"
          >
            <Plus size={18} /> {userRole === 'admin' ? 'เพิ่มข่าวสาร' : 'ประกาศข่าวใหม่'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="ข่าวสาร" value={stats.newsCount} icon={<Newspaper />} color="bg-blue-600" />
        {userRole === 'admin' && (
          <>
            <StatCard title="หลักสูตร" value={stats.curriculumCount} icon={<GraduationCap />} color="bg-indigo-600" />
            <StatCard title="ไฟล์สะสม" value={stats.filesCount} icon={<FileText />} color="bg-cyan-600" />
            <StatCard title="ผู้ดูแลระบบ" value={stats.adminCount} icon={<Users />} color="bg-emerald-600" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* กราฟสถิติ - แสดงเฉพาะ Admin */}
        <div className={`lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all ${userRole !== 'admin' && 'opacity-50 grayscale pointer-events-none'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-slate-800">สถิติผู้เข้าชมเว็บไซต์</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ข้อมูลจริง (Unique)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">ยอดผู้เข้าชมจริงในรอบ 7 วันย้อนหลัง (นับคนจริง ไม่นับทุกคลิก)</p>
            </div>
            
            {/* Live Traffic Summary Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-left">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">วันนี้</div>
                <div className="text-sm font-black text-slate-800">{Number(trafficSummary.today || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">คน</span></div>
              </div>
              <div className="px-3.5 py-2 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-left">
                <div className="text-[10px] font-bold text-[#3F51B5] uppercase tracking-wider">7 วันนี้</div>
                <div className="text-sm font-black text-[#3F51B5]">{Number(trafficSummary.week || 0).toLocaleString()} <span className="text-[10px] font-normal text-indigo-400">คน</span></div>
              </div>
              <div className="px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-left">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">สะสมทั้งหมด</div>
                <div className="text-sm font-black text-slate-700">{Number(trafficSummary.total || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-400">คน</span></div>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3F51B5" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3F51B5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toLocaleString()} คน`, 'ผู้เข้าชม']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.date ? `${label} (${item.date})` : label;
                  }}
                  contentStyle={{
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="v" stroke="#3F51B5" strokeWidth={3.5} fill="url(#colorV)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* กิจกรรมล่าสุด */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-black text-slate-800 mb-8">กิจกรรมล่าสุด</h2>
          <div className="space-y-6 flex-grow">
            {activities.length > 0 ? (
              activities.map((act) => (
                <ActivityItem 
                  key={act.id} 
                  color={act.color || "bg-blue-500"} 
                  title={act.title} 
                  time={formatActivityTime(act.time)} 
                />
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center py-6">ยังไม่มีกิจกรรมล่าสุด</p>
            )}
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