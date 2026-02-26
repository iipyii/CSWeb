import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop'; 

// Pages
import Home from './pages/Home';
import News from './pages/News'; 
import NewsDetail from './pages/NewsDetail';
import CourseSections from './pages/CourseSections'; 
import CourseDetail from './pages/CourseDetail';
import CourseDescription from "./pages/CourseDescription";
import StudentDownloads from "./pages/StudentDownloads";
import History from './pages/History'; // นำเข้าหน้าประวัติที่สร้างใหม่

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-['Prompt']">
      {/* จัดการเรื่อง Scroll เมื่อเปลี่ยนหน้าให้ไปที่จุดบนสุดเสมอ */}
      <ScrollToTop /> 
      
      {/* ส่วนหัวของเว็บไซต์ (แสดงทุกหน้า) */}
      <Navbar />

      {/* เนื้อหาหลักที่จะเปลี่ยนไปตาม URL (Route) */}
      <main className="flex-grow">
        <Routes>
          
          {/* 🏠 หน้าหลักของเว็บไซต์ */}
          <Route path="/" element={<Home />} />

          {/* 🏛️ เกี่ยวกับภาควิชา */}
          <Route path="/history" element={<History />} />

          {/* 📰 หน้าข่าวสารและประชาสัมพันธ์ */}
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />

          {/* 🎓 หลักสูตรและการศึกษา */}
          <Route path="/course-sections/:level" element={<CourseSections />} />
          <Route path="/course-detail/:id" element={<CourseDetail />} />
          <Route path="/course-description" element={<CourseDescription />} />

          {/* 📥 บริการนักศึกษาและดาวน์โหลด */}
          <Route path="/student-downloads" element={<StudentDownloads />} />

          {/* ⚠️ Page Not Found: กรณีเข้า URL ที่ไม่มีในระบบ ให้ตีกลับไปหน้า Home */}
          <Route path="*" element={<Home />} />
          
        </Routes>
      </main>
    </div>
  );
}