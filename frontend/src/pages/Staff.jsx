import React, { useState } from 'react';
import { Search, Mail, User } from 'lucide-react';

export default function Staff() {
  const [query, setQuery] = useState('');
  const staff = [
    { name: "ผศ.ดร.สมชาย ใจดี", pos: "หัวหน้าภาควิชา", research: "AI, ML" },
    { name: "รศ.ดร.หญิง สวยงาม", pos: "อาจารย์ประจำ", research: "Cyber Security" },
  ];

  return (
    <div className="container-1440 py-16">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800">คณาจารย์และบุคลากร</h1>
        <div className="relative w-80">
          <input 
            type="text" 
            placeholder="ค้นหารายชื่อ..." 
            className="w-full pl-10 pr-4 py-2 border rounded-full outline-none focus:ring-2 focus:ring-indigo-600"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {staff.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border p-6 text-center hover:shadow-md transition">
            <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-300">
              <User size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{s.name}</h3>
            <p className="text-indigo-700 font-bold text-sm mb-2">{s.pos}</p>
            <p className="text-slate-400 text-xs mb-4">วิจัย: {s.research}</p>
            <div className="flex justify-center text-slate-300"><Mail size={16} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}