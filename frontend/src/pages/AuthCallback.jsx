import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('processing'); // processing | success | error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(decodeURIComponent(error));
        return;
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('ไม่พบข้อมูล Token ยืนยันตัวตนจากเซิร์ฟเวอร์');
        return;
      }

      try {
        const userData = await loginWithToken(token);
        if (userData) {
          setStatus('success');
          setTimeout(() => {
            navigate('/admin', { replace: true });
          }, 800);
        } else {
          setStatus('error');
          setErrorMessage('ไม่สามารถดึงข้อมูลผู้ใช้งานได้ กรุณาลองใหม่อีกครั้ง');
        }
      } catch (err) {
        console.error('SSO Callback Processing Error:', err);
        setStatus('error');
        setErrorMessage('เกิดข้อผิดพลาดในการประมวลผลการเข้าสู่ระบบ');
      }
    };

    processCallback();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-md w-full border border-slate-100 flex flex-col items-center">
        
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-[#3F51B5] flex items-center justify-center mb-6 shadow-sm">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              กำลังยืนยันตัวตน...
            </h2>
            <p className="text-sm text-slate-500">
              ระบบกำลังเชื่อมต่อและตรวจสอบข้อมูลจาก KMUTNB SSO กรุณารอสักครู่
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              เข้าสู่ระบบสำเร็จ!
            </h2>
            <p className="text-sm text-slate-500">
              กำลังนำท่านเข้าสู่ระบบจัดการหลังบ้าน...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 shadow-sm">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              เข้าสู่ระบบไม่สำเร็จ
            </h2>
            <p className="text-sm text-rose-500 mb-6 bg-rose-50/60 p-3 rounded-2xl border border-rose-100 w-full">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full py-3 bg-[#3F51B5] text-white rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm shadow-md"
            >
              กลับไปยังหน้าเข้าสู่ระบบ
            </button>
          </>
        )}

      </div>
    </div>
  );
}
