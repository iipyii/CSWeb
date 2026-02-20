import React from 'react';
import { useLocation } from 'react-router-dom';
import { newsData } from '../data/mockData';

export default function SearchResults() {
  const query = new URLSearchParams(useLocation().search).get('q')?.toLowerCase() || "";
  const filtered = newsData.filter(item => 
    item.title.toLowerCase().includes(query) || 
    item.tag.toLowerCase().includes(query)
  );

  return (
    <div className="container-1440 py-16 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">ผลการค้นหาสำหรับ: <span className="text-indigo-600">"{query}"</span></h1>
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm">
              <span className="text-xs font-bold text-indigo-600 uppercase">{item.tag}</span>
              <h3 className="text-xl font-bold mt-2">{item.title}</h3>
              <p className="text-gray-400 mt-4">{item.date}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-2xl text-center shadow-inner">
          <p className="text-2xl text-gray-400 italic">ไม่พบข้อมูลที่ตรงกับการค้นหาของคุณ</p>
        </div>
      )}
    </div>
  );
}