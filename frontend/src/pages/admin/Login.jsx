import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, LogIn, ArrowRight, User, Lock, 
  Eye, EyeOff, Loader2, LogOut, KeyRound 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get('error');
  const { user, isAuthenticated, loginWithCredentials, logout } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setFormError('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setFormError('');
      const loggedInUser = await loginWithCredentials(username.trim(), password.trim());
      if (loggedInUser) {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormError(err.response?.data?.error || err.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = () => {
    // เชื่อมต่อไปยัง Endpoint OAuth2 ของ Backend เพื่อเริ่มกระบวนการ KMUTNB SSO
    window.location.href = '/auth/login';
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'access_denied':
        return 'การเข้าสู่ระบบถูกยกเลิกโดยผู้ใช้';
      case 'state_mismatch':
        return 'เกิดข้อผิดพลาดในการตรวจสอบความปลอดภัย (State Mismatch) กรุณาลองใหม่อีกครั้ง';
      case 'failed_to_obtain_token':
        return 'ไม่สามารถแลกเปลี่ยน Access Token กับเซิร์ฟเวอร์ KMUTNB SSO ได้';
      case 'failed_to_fetch_user_profile':
        return 'ไม่สามารถดึงข้อมูลโปรไฟล์ผู้ใช้จาก KMUTNB ได้';
      default:
        if (!code) return null;
        if (code.includes('สิทธิ์') || code.includes('อาจารย์') || code.includes('ไม่พบ') || code.startsWith('เกิดข้อผิดพลาด')) {
          return code;
        }
        return `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${code}`;
    }
  };

  const ssoErrorMessage = getErrorMessage(errorParam);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl max-w-md w-full border border-slate-100">
        
        {/* Header & Logo */}
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <img 
              src="/cis-logo.svg" 
              alt="CIS KMUTNB Logo" 
              className="h-24 w-auto object-contain"
              onError={(e) => { 
                e.target.src = "https://via.placeholder.com/200x200?text=CIS+KMUTNB"; 
              }}
            />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            ระบบจัดการข้อมูลหลังบ้าน
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-wider">
            Department of Computer and Information Science
          </p>
        </div>

        {/* SSO Error Banner */}
        {ssoErrorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-xs font-bold text-rose-600 leading-relaxed">{ssoErrorMessage}</p>
          </div>
        )}

        {/* Form Error Banner */}
        {formError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
            <ShieldAlert className="text-rose-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-xs font-bold text-rose-600 leading-relaxed">{formError}</p>
          </div>
        )}

        {isAuthenticated && user ? (
          /* Already Logged In Card */
          <div className="p-6 bg-indigo-50/70 border border-indigo-100 rounded-3xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-100/80 px-2.5 py-1 rounded-full">
                เข้าสู่ระบบอยู่แล้ว
              </span>
              <span className="text-xs font-bold text-slate-400 font-mono">
                Role: {user.role}
              </span>
            </div>

            <div>
              <p className="font-black text-slate-800 text-base">{user.full_name || user.username}</p>
              <p className="text-xs text-slate-500 mt-0.5">{user.email || user.username}</p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="w-full bg-[#3F51B5] hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100"
              >
                ไปยังหน้าแดชบอร์ด <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={logout}
                className="w-full bg-white hover:bg-slate-100 text-slate-600 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-200"
              >
                <LogOut size={14} /> ออกจากระบบ
              </button>
            </div>
          </div>
        ) : (
          /* Login Form (Admin / Staff) */
          <div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  ชื่อผู้ใช้หรืออีเมล (Username / Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-[#3F51B5] focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 ml-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านผู้ดูแลระบบ"
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 rounded-2xl border border-slate-200 focus:border-[#3F51B5] focus:ring-4 focus:ring-indigo-100 text-sm font-medium transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-[#3F51B5] hover:bg-indigo-700 active:scale-[0.99] text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>กำลังเข้าสู่ระบบ...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    <span>เข้าสู่ระบบผู้ดูแลระบบ (Admin Sign In)</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative px-3 bg-white text-slate-400 font-bold text-xs uppercase tracking-wider">
                หรือ
              </span>
            </div>

            {/* KMUTNB SSO Button */}
            <div>
              <button 
                type="button"
                onClick={handleSSOLogin}
                className="w-full bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-700 py-3.5 px-4 rounded-2xl font-bold transition-all border border-slate-200 hover:border-indigo-300 flex items-center justify-center gap-3 text-sm shadow-sm group"
              >
                <LogIn size={18} className="text-[#3F51B5] group-hover:translate-x-0.5 transition-transform" />
                <span>เข้าสู่ระบบด้วย KMUTNB SSO</span>
              </button>
              <p className="text-[11px] text-center text-slate-400 font-medium mt-2">
                สำหรับอาจารย์และบุคลากรภาควิชาฯ (KMUTNB ICIT Account)
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            หากลืมรหัสผ่านหรือต้องการความช่วยเหลือ กรุณาติดต่อผู้ดูแลระบบภาควิชาฯ
          </p>
        </div>

      </div>
    </div>
  );
}