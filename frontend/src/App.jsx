import React, { useState } from 'react';
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
import SearchResults from './pages/SearchResults';

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
import ManageAbout from './pages/admin/ManageAbout';
import ManagePersonnel from './pages/admin/ManagePersonnel';
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
import ManageConsultants from './pages/admin/ManageConsultants';
import ManageChatbot from './pages/admin/ManageChatbot';
import ManageProfile from './pages/admin/ManageProfile';
import ManageInternship from './pages/admin/ManageInternship';
import ManageSubjectCourses from './pages/admin/ManageSubjectCourses';
import ManageStudentGuide from './pages/admin/ManageStudentGuide';
import ManageStudentLinks from './pages/admin/ManageStudentLinks';

// Auth & Language Context
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';

const MainLayout = () => (
  <div className="min-h-screen flex flex-col overflow-x-hidden">
    <ScrollToTop />
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <AIChatbot />
  </div>
);

// 🔴 Layout สำหรับหน้า Admin (จัดวาง Sidebar และ Navbar)
// จอเล็กกว่า md (768px, breakpoint เดียวกับ Navbar): sidebar เป็น drawer เปิด/ปิดด้วย hamburger ใน AdminNavbar
const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <ScrollToTop />

      {/* Overlay มือถือ: แตะข้างนอกเพื่อปิด sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 w-72 flex-shrink-0 bg-white border-r border-slate-100 z-40 md:z-20 transform transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onNavigate={() => setIsSidebarOpen(false)} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        <AdminNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-y-auto p-10 bg-[#FDF8F4]/30">
          <div className="max-w-[1600px] mx-auto pb-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
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
            <Route path="/consult-student" element={<ConsultStudent />} />
            <Route path="/consult-student/:code" element={<ConsultStudent />} />
            <Route path="/consult-detail/:level/:year" element={<ConsultDetail />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="/subject-courses" element={<SubjectCourses />} />
            <Route path="/subject-courses/detail/:year/:term" element={<SubjectDetail />} />
            <Route path="/student-guide" element={<StudentGuide />} />
            <Route path="/student-links" element={<StudentLinks />} />
            <Route path="/search" element={<SearchResults />} />
            
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

          {/* 🔐 Admin Login & OAuth SSO Callback */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* 🔐 กลุ่มหน้า Admin (ป้องกันด้วย ProtectedRoute) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<ManageProfile />} />

            {/* เมนูสำหรับ Admin เท่านั้น */}
            <Route path="appearance" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageAppearance />
              </ProtectedRoute>
            } />

            <Route path="about" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageAbout />
              </ProtectedRoute>
            } />

            <Route path="personnel" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManagePersonnel />
              </ProtectedRoute>
            } />

            <Route path="curriculum" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageCurriculum />
              </ProtectedRoute>
            } />

            <Route path="files" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageFiles />
              </ProtectedRoute>
            } />
            <Route path="files/create" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CreateFile />
              </ProtectedRoute>
            } />
            <Route path="files/edit/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EditFile />
              </ProtectedRoute>
            } />

            <Route path="roles" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageRoles />
              </ProtectedRoute>
            } />

            <Route path="chatbot" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageChatbot />
              </ProtectedRoute>
            } />

            {/* เมนูสำหรับทั้ง Admin และ Lecturer */}
            <Route path="news" element={<ManageNews />} />
            <Route path="news/create" element={<CreateNews />} />
            <Route path="news/edit/:id" element={<EditNews />} />
            <Route path="news/archive" element={<NewsArchive />} />

            <Route path="projects" element={<ManageProjects />} />
            <Route path="subjects" element={<ManageSubjects />} />
            <Route path="consultants" element={<ManageConsultants />} />
            <Route path="internship" element={<ManageInternship />} />
            <Route path="subject-courses" element={<ManageSubjectCourses />} />
            <Route path="student-guide" element={<ManageStudentGuide />} />
            <Route path="student-links" element={<ManageStudentLinks />} />
          </Route>
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
}