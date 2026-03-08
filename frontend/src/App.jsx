import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import AdminSidebar from './components/admin/AdminSidebar';

import AdminNavbar from './components/admin/AdminNavbar'; 
import AIChatbot from './components/AIChatbot';


// Pages - General
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import CourseSections from './pages/CourseSections';
import CourseSectionContent from "./pages/CourseSectionContent"
import CourseDetail from './pages/CourseDetail';
import CourseDescription from './pages/CourseDescription';
import StudentDownloads from './pages/StudentDownloads';
import History from './pages/History';
import Organization from './pages/Organization';
import Contact from './pages/Contact';
import Administrator from './pages/Administrator';
import AdministratorDetail from './pages/AdministratorDetail';
import Staff from './pages/Staff';
import StaffDownloads from './pages/StaffDownloads';
import PersonnelLinks from './pages/PersonnelLinks';

import StudentProjects from './pages/StudentProjects';
import ProjectDetail from './pages/ProjectDetail';
import ConsultStudent from './pages/ConsultStudent';
import ConsultDetail from './pages/ConsultDetail';
import Internship from './pages/Internship';
import SubjectCourses from './pages/SubjectCourses';
import SubjectDetail from './pages/SubjectDetail';
import StudentGuide from './pages/StudentGuide';
import StudentLinks from './pages/StudentLinks';

import FinanceRegs from './pages/FinanceRegs';
import AcademicRegs from './pages/AcademicRegs';
import PersonnelRegs from './pages/PersonnelRegs';
import GraduateRegs from './pages/GraduateRegs';
import StudentAffairsRegs from './pages/StudentAffairsRegs';
import CoopRegs from './pages/CoopRegs';
import ScholarshipRegs from './pages/ScholarshipRegs';

import FAQ from './pages/FAQ';

import GreenOffice from './pages/GreenOffice';

// Pages - Admin
import Login from './pages/admin/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageAppearance from './pages/admin/ManageAppearance';
import ManageNews from './pages/admin/ManageNews';
import CreateNews from './pages/admin/CreateNews';
import EditNews from './pages/admin/EditNews';
import NewsArchive from './pages/admin/NewsArchive';
import ManageCurriculum from './pages/admin/ManageCurriculum';
import ManageFiles from './pages/admin/ManageFiles';
import CreateFile from './pages/admin/CreateFile';
import EditFile from './pages/admin/EditFile';
import ManageRoles from './pages/admin/ManageRoles';
import ManageSubjects from './pages/admin/ManageSubjects';
import ManageProjects from './pages/admin/ManageProjects';
import ManageChatbot from './pages/admin/ManageChatbot';


// 🟢 Layout สำหรับหน้าบ้าน (Public)
const MainLayout = () => (
  <div className="min-h-screen flex flex-col font-['Prompt']">
    <ScrollToTop />
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <AIChatbot />
  </div>
);

// 🔴 Layout สำหรับหน้า Admin (จัดวาง Sidebar และ Navbar)
const AdminLayout = () => (
  <div className="flex h-screen w-full bg-slate-50 font-['Prompt'] overflow-hidden">
    <ScrollToTop />

    <aside className="w-72 flex-shrink-0 bg-white border-r border-slate-100 z-20">
      <AdminSidebar />
    </aside>

    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

      <AdminNavbar />

      <main className="flex-1 overflow-y-auto p-10 bg-[#FDF8F4]/30">
        <div className="max-w-[1600px] mx-auto pb-10">
          <Outlet />
        </div>
      </main>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* 🏡 กลุ่มหน้าบ้าน */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/organization" element={<Organization />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/administrator" element={<Administrator />} />
        <Route path="/administrator/:code" element={<AdministratorDetail />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/staff-download" element={<StaffDownloads />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/course-sections/:level" element={<CourseSections />} />
        <Route path="/course-section/:id" element={<CourseSectionContent />} />
        <Route path="/course-detail/:id" element={<CourseDetail />} />
        <Route path="/course-description" element={<CourseDescription />} />
        <Route path="/student-downloads" element={<StudentDownloads />} />
        <Route path="/personnel-links" element={<PersonnelLinks />} />

        <Route path="/student-projects" element={<StudentProjects />} />
        <Route path="/student-projects/:id" element={<ProjectDetail />} />
        <Route path="/consult-student/:code" element={<ConsultStudent />} />
        <Route path="/consult-detail/:level/:year" element={<ConsultDetail />} />
        <Route path="/internship" element={<Internship />} />
        <Route path="/subject-courses" element={<SubjectCourses />} />
        <Route path="/subject-courses/detail/:year/:term" element={<SubjectDetail />} />
        <Route path="/student-guide" element={<StudentGuide />} />
        <Route path="/student-links" element={<StudentLinks />} />

        <Route path="/finance-regulations" element={<FinanceRegs />} />
        <Route path="/academic-regulations" element={<AcademicRegs />} />
        <Route path="/personnel-regulations" element={<PersonnelRegs />} />
        <Route path="/graduate-regulations" element={<GraduateRegs />} />
        <Route path="/student-affairs-regulations" element={<StudentAffairsRegs />} />
        <Route path="/coop-regulations" element={<CoopRegs />} />
        <Route path="/scholarship-regulations" element={<ScholarshipRegs />} />

        <Route path="/green-office" element={<GreenOffice />} />

        <Route path="/faq" element={<FAQ />} />

        <Route path="*" element={<Home />} />

      </Route>

      {/* 🔐 Admin Login */}
      <Route path="/admin/login" element={<Login />} />

      {/* 🔐 กลุ่มหน้า Admin */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* แก้ไขบรรทัดที่เคย Error: ใช้ <Route index ... /> เพียงบรรทัดเดียว */}
        <Route index element={<AdminDashboard />} />

        <Route path="appearance" element={<ManageAppearance />} />

        <Route path="news" element={<ManageNews />} />
        <Route path="news/create" element={<CreateNews />} />
        <Route path="news/edit/:id" element={<EditNews />} />
        <Route path="news/archive" element={<NewsArchive />} />

        <Route path="curriculum" element={<ManageCurriculum />} />
        <Route path="projects" element={<ManageProjects />} />
        <Route path="files" element={<ManageFiles />} />
        <Route path="files/create" element={<CreateFile />} />
        <Route path="files/edit/:id" element={<EditFile />} />

        <Route path="roles" element={<ManageRoles />} />

        <Route path="subjects" element={<ManageSubjects />} />

        <Route path="chatbot" element={<ManageChatbot />} />
      </Route>
    </Routes>
  );
}