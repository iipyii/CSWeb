import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // กำลังโหลดข้อมูลผู้ใช้งาน
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="animate-spin text-[#3F51B5]" />
        <span className="text-sm font-bold text-slate-500">กำลังตรวจสอบสิทธิ์เข้าใช้งาน...</span>
      </div>
    );
  }

  // ถ้ายังไม่ได้เข้าสู่ระบบ ให้ redirect ไปหน้า Login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // ตรวจสอบสิทธิ์ Role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          ไม่มีสิทธิ์เข้าถึงหน้านี้ (403 Forbidden)
        </h2>
        <p className="text-slate-500 text-sm max-w-md mb-6">
          หน้านี้สงวนสิทธิ์เฉพาะ <span className="font-bold text-slate-700">{allowedRoles.join(" หรือ ")}</span> เท่านั้น 
          (สิทธิ์ปัจจุบันของบัญชีคุณ: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[#3F51B5] font-bold">{role || "ไม่ระบุ"}</span>)
        </p>
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3F51B5] text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm shadow-md"
        >
          <ArrowLeft size={16} /> กลับไปยังหน้าแดชบอร์ด
        </button>
      </div>
    );
  }

  return children;
}
