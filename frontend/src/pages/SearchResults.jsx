import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

export default function SearchResults() {
  const query = new URLSearchParams(useLocation().search).get('q') || "";

  // 1. สร้าง State มารับข้อมูลจาก Backend
  const [results, setResults] = useState({ news: [], lecturers: [], courses: [] });
  const [isLoading, setIsLoading] = useState(false);

  // 2. ดึงข้อมูลทันทีที่คำค้นหา (query) เปลี่ยนแปลง
  useEffect(() => {
    if (!query) return;

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const hasResults = results.news.length > 0 || results.lecturers.length > 0 || results.courses.length > 0;

  return (
    <div className="container-1440 mx-auto px-6 py-16 min-h-screen">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">
        ผลการค้นหาสำหรับ: <span className="text-indigo-600">"{query}"</span>
      </h1>

      {/* สถานะตอนกำลังโหลด */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : !hasResults && query ? (
        /* UI ตอนหาไม่เจอ (ใช้สไตล์เดิมของเพื่อน) */
        <div className="bg-white p-20 rounded-2xl text-center shadow-inner border border-gray-100">
          <p className="text-2xl text-gray-400 italic">ไม่พบข้อมูลที่ตรงกับการค้นหาของคุณ</p>
        </div>
      ) : (
        /* UI ตอนหาเจอ (แยกเป็น 3 หมวดหมู่ แต่คุมโทนด้วยสไตล์การ์ดของเพื่อน) */
        <div className="space-y-12">

          {/* 📚 หมวดรายวิชา */}
          {results.courses.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-indigo-100 pb-2">
                📚 คำอธิบายรายวิชา
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.courses.map(course => (
                  <Link to="/course-description" key={`course-${course.id}`} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500 border border-transparent transition-all group block">
                    <span className="text-xs font-bold text-indigo-600 uppercase">รายวิชา</span>
                    <h3 className="text-xl font-bold mt-2 text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">{course.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 👥 หมวดบุคลากร */}
          {results.lecturers.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-indigo-100 pb-2">
                👥 บุคลากร / อาจารย์
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.lecturers.map(person => (
                  <Link to="/administrator" key={`person-${person.id}`} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500 border border-transparent transition-all group block">
                    <span className="text-xs font-bold text-indigo-600 uppercase">บุคลากร</span>
                    <h3 className="text-xl font-bold mt-2 text-gray-800 group-hover:text-indigo-600 transition-colors">{person.fullname_th}</h3>
                    {person.email && <p className="text-gray-500 text-sm mt-3">{person.email}</p>}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 📰 หมวดข่าวสาร */}
          {results.news.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-indigo-100 pb-2">
                📰 ข่าวสารและประกาศ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.news.map(item => (
                  <Link to={`/news/${item.id}`} key={`news-${item.id}`} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-500 border border-transparent transition-all group block">
                    <span className="text-xs font-bold text-indigo-600 uppercase">ข่าวสาร</span>
                    <h3 className="text-xl font-bold mt-2 text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">{item.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}