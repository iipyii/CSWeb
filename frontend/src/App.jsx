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

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-['Prompt']">
      {/* จัดการเรื่อง Scroll เมื่อเปลี่ยนหน้า */}
      <ScrollToTop /> 
      
      {/* ส่วนหัวของเว็บไซต์ */}
      <Navbar />

      {/* เนื้อหาหลักที่จะเปลี่ยนไปตาม Route */}
      <main className="flex-grow">
        <Routes>
          {/* 🏠 หน้าหลักของเว็บไซต์ */}
          <Route path="/" element={<Home />} />

          {/* 📰 หน้าข่าวสารและประชาสัมพันธ์ (แยกออกมาใหม่) */}
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />

          {/* 🎓 หมวดหมู่หลักสูตร (เช่น bachelor, master, doctor) */}
          <Route path="/course-sections/:level" element={<CourseSections />} />

          {/* 📄 รายละเอียดวิชาหรือหลักสูตรรายบุคคล */}
          <Route path="/course-detail/:id" element={<CourseDetail />} />

          {/* 📝 คำอธิบายรายวิชา */}
          <Route path="/course-description" element={<CourseDescription />} />

          {/* 📥 เอกสารดาวน์โหลดสำหรับนักศึกษา */}
          <Route path="/student-downloads" element={<StudentDownloads />} />

          {/* ⚠️ กรณีเข้า URL ที่ไม่ถูกต้อง ให้กลับไปที่หน้า Home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}