import React from 'react';

export default function Login() {
  const handleSSOLogin = () => {
    // URL สำหรับเชื่อมต่อกับระบบ SSO ของมหาวิทยาลัย
    window.location.href = "http://localhost:5000/auth/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 text-center">
        
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-10">
          ระบบจัดการข้อมูลสำหรับ Admin
        </h1>
        
        <div className="mb-12 flex justify-center">
          <img 
            src="/cis-logo.svg" 
            alt="CIS KMUTNB Logo" 
            className="h-32 w-auto object-contain"
            onError={(e) => { 
              e.target.src = "https://via.placeholder.com/200x200?text=CIS+LOGO"; 
            }}
          />
        </div>

        {/* ปุ่ม Login */}
        <button 
          onClick={handleSSOLogin}
          className="w-full bg-[#007bff] hover:bg-[#0069d9] text-white py-4 rounded-2xl font-bold transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-2 text-lg"
        >
          เข้าสู่ระบบด้วย KMUTNB SSO
        </button>

        <div className="mt-10 pt-6 border-t border-slate-50">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
            Authorized Personnel Only
          </p>
        </div>
        
      </div>
    </div>
  );
}