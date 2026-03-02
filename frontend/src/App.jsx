import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop'; 
import AdminSidebar from './components/admin/AdminSidebar';

// Pages - General
import Home from './pages/Home';
import News from './pages/News'; 
import NewsDetail from './pages/NewsDetail';
import CourseSections from './pages/CourseSections'; 
import CourseDetail from './pages/CourseDetail';
import CourseDescription from "./pages/CourseDescription";
import StudentDownloads from "./pages/StudentDownloads";
import History from './pages/History'; 
import Organization from './pages/Organization';
import Contact from './pages/Contact';
import Administrator from './pages/Administrator';
import AdministratorDetail from './pages/AdministratorDetail';
import Staff from './pages/Staff';
import StaffDownloads from "./pages/StaffDownloads";
import GreenOffice from './pages/GreenOffice';

// Pages - Admin
import Login from './pages/admin/Login';
import ManageNews from './pages/admin/ManageNews';
import AdminDashboard from './pages/admin/AdminDashboard';

// 🟢 Component สำหรับจัด Layout หน้าบ้าน (มี Navbar)
const MainLayout = () => (
  <div className="min-h-screen flex flex-col font-['Prompt']">
    <ScrollToTop />
    <Navbar />
    <main className="flex-grow">
      <Outlet /> {/* เนื้อหาแต่ละหน้าจะมาแสดงตรงนี้ */}
    </main>
  </div>
);

// 🔴 Component สำหรับจัด Layout หน้า Admin (ไม่มี Navbar หลัก)
const AdminLayout = () => (
  <div className="min-h-screen font-['Prompt'] bg-slate-50">
    <ScrollToTop />
    <AdminSidebar />
    <main>
      <Outlet />
    </main>
  </div>
);

export default function App() {
  return (
    <Routes>
      
      {/* 🏡 กลุ่มหน้าบ้าน  */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/administrator" element={<Administrator />} />
        <Route path="/administrator/:id" element={<AdministratorDetail />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/staff-download" element={<StaffDownloads />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/course-sections/:level" element={<CourseSections />} />
        <Route path="/course-detail/:id" element={<CourseDetail />} />
        <Route path="/course-description" element={<CourseDescription />} />
        <Route path="/student-downloads" element={<StudentDownloads />} />
        <Route path="/green-office" element={<GreenOffice />} />
        
        {/* กรณีพิมพ์ URL มั่ว ให้เด้งกลับหน้า Home ภายใต้ Layout ปกติ */}
        <Route path="*" element={<Home />} />
      </Route>

      {/* 🔐 กลุ่มหน้า Admin */}
        <Route path="/admin/login" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/news" element={<ManageNews />} />

        
      </Route>

    </Routes>
  );
}