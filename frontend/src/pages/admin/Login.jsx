import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');
  const { user, isAuthenticated, loginWithToken } = useAuth();
  const [legacyLoading, setLegacyLoading] = useState(false);
  const navigate = useNavigate();

  const handleSSOLogin = () => {
    // เชื่อมต่อไปยัง Endpoint OAuth2 ของ Backend เพื่อเริ่มกระบวนการ KMUTNB SSO
    window.location.href = "http://localhost:5000/auth/login";
  };

  const handleLegacyAdminLogin = async () => {
    try {
      setLegacyLoading(true);
      const res = await axios.post("http://localhost:5000/auth/legacy-admin");
      if (res.data?.token) {
        await loginWithToken(res.data.token);
        navigate("/admin");
      }
    } catch (err) {
      alert("ไม่สามารถเข้าสู่ระบบด้วยบัญชีผู้ดูแลเดิมได้: " + (err.response?.data?.error || err.message));
    } finally {
      setLegacyLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'access_denied':
        return 'การเข้าสู่ระบบถูกยกเลิกโดยผู้ใช้';
      case 'state_mismatch':
        return 'เกิดข้อผิดพลาดในการตรวจสอบความปลอดภัย (State Mismatch) กรุณาลองใหม่';
      case 'failed_to_obtain_token':
        return 'ไม่สามารถแลกเปลี่ยน Access Token กับเซิร์ฟเวอร์ KMUTNB SSO ได้';
      case 'failed_to_fetch_user_profile':
        return 'ไม่สามารถดึงข้อมูลโปรไฟล์ผู้ใช้จาก KMUTNB ได้';
      default:
        return code ? `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${code}` : null;
    }
  };

  const errorMessage = getErrorMessage(errorParam);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-md w-full border border-slate-100 text-center">
        
        <h1 className="text-xl md:text-2xl font-black text-slate-800 mb-2">
          ระบบจัดการข้อมูลหลังบ้าน
        </h1>
        <p className="text-xs text-slate-400 font-bold mb-8 uppercase tracking-wider">
          Department of Computer and Information Science
        </p>
        
        <div className="mb-8 flex justify-center">
          <img 
            src="/cis-logo.svg" 
            alt="CIS KMUTNB Logo" 
            className="h-28 w-auto object-contain"
            onError={(e) => { 
              e.target.src = "https://via.placeholder.com/200x200?text=CIS+LOGO"; 
            }}
          />
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-left">
            <ShieldAlert className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-xs font-bold text-rose-600 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {isAuthenticated && user ? (
          <div className="mb-6 p-5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-left">
            <p className="text-xs text-indigo-500 font-black uppercase tracking-wider">คุณเข้าสู่ระบบอยู่แล้ว</p>
            <p className="font-bold text-slate-800 text-sm mt-1">{user.full_name || user.username}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
            <button
              onClick={() => navigate('/admin')}
              className="mt-4 w-full bg-[#3F51B5] hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
            >
              ไปยังหน้าแดชบอร์ด <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* ปุ่ม Login ด้วย SSO */}
            <button 
              onClick={handleSSOLogin}
              className="w-full bg-[#3F51B5] hover:bg-indigo-700 active:scale-[0.98] text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100/70 flex items-center justify-center gap-3 text-base group"
            >
              <LogIn size={20} className="group-hover:translate-x-0.5 transition-transform" />
              เข้าสู่ระบบด้วย KMUTNB SSO
            </button>

            {/* ปุ่มเข้าสู่ระบบด้วยบัญชี Super Admin เดิม สำหรับการทดสอบและจัดการสิทธิ์ */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLegacyAdminLogin}
                disabled={legacyLoading}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-[#3F51B5] bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} className="text-[#3F51B5]" />
                {legacyLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ Super Admin เดิม (สำหรับตั้งค่าสิทธิ์)"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-50">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            สำหรับอาจารย์และบุคลากรภาควิชาฯ (KMUTNB ICIT Account)
          </p>
        </div>
        
      </div>
    </div>
  );
}