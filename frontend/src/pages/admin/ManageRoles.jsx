import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Save, Search, UserCog, RefreshCw, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ManageRoles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    user: null,
    newRole: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/users");
      setUsers(res.data || []);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectRole = (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    setConfirmModal({
      isOpen: true,
      user: targetUser,
      newRole
    });
  };

  const handleConfirmRoleChange = async () => {
    if (!confirmModal.user || !confirmModal.newRole) return;
    const { user, newRole } = confirmModal;
    setConfirmModal({ isOpen: false, user: null, newRole: '' });

    try {
      setSavingId(user.id);
      await axios.put(`/api/users/${user.id}/role`, { role: newRole });
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      showToast(`เปลี่ยนบทบาทของ ${user.full_name} เป็น ${newRole === 'admin' ? 'Administrator' : 'Lecturer'} สำเร็จ`, 'success');
    } catch (error) {
      console.error("Failed to update role:", error);
      showToast("เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์", 'error');
    } finally {
      setSavingId(null);
    }
  };

  const handleCancelRoleChange = () => {
    setConfirmModal({ isOpen: false, user: null, newRole: '' });
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-[#3F51B5]" /> จัดการบทบาทและสิทธิ์ผู้ใช้งาน
          </h1>
          <p className="text-slate-500 text-sm">กำหนดขอบเขตการเข้าถึงระบบหลังบ้านสำหรับบุคลากร</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all text-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> รีเฟรชข้อมูล
        </button>
      </header>

      {/* 📊 ส่วนสรุปสิทธิ์ (Permission Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-[#3F51B5]"><Shield size={20}/></div>
            <h3 className="font-bold text-slate-800">สิทธิ์ Admin</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            สามารถเข้าถึงและแก้ไขข้อมูลได้ทุกส่วน รวมถึงการจัดการไฟล์ภาพลักษณ์, ผู้ใช้งาน, และข้อมูลหลักสูตร
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><UserCog size={20}/></div>
            <h3 className="font-bold text-slate-800">สิทธิ์ Lecturer</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            จำกัดการเข้าถึงเฉพาะส่วนของ "จัดการข่าวสาร" เพื่อประชาสัมพันธ์, "นักศึกษาในที่ปรึกษา" และ "ข้อมูลส่วนตัว" เพื่ออัปเดตประวัติการศึกษาและผลงานวิจัยเท่านั้น
          </p>
        </div>
      </div>

      {/* 🔍 User List Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อหรืออีเมลบุคลากร..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-5">รายชื่อบุคลากร</th>
                <th className="px-8 py-5">อีเมล</th>
                <th className="px-8 py-5">บทบาทปัจจุบัน</th>
                <th className="px-8 py-5">สถานะ</th>
                <th className="px-8 py-5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-[#3F51B5] font-bold">
                          {(user.full_name || "U").charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{user.full_name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">{user.email}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <select 
                          value={user.role}
                          disabled={savingId === user.id}
                          onChange={(e) => handleSelectRole(user, e.target.value)}
                          className={`text-xs font-bold px-4 py-2 rounded-xl outline-none border-none shadow-sm cursor-pointer disabled:opacity-50
                            ${user.role === 'admin' ? 'bg-[#3F51B5] text-white' : 'bg-white text-slate-600 border border-slate-100'}`}
                        >
                          <option value="admin">Administrator</option>
                          <option value="lecturer">Lecturer</option>
                        </select>
                        {savingId === user.id && <Loader2 size={16} className="animate-spin text-[#3F51B5]" />}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="flex items-center gap-1.5 text-green-500 text-xs font-bold uppercase tracking-wider">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> ออนไลน์
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-2">
                        <button className="p-2.5 text-slate-400 hover:text-[#3F51B5] transition-colors" title="Lock Account"><Lock size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-400 text-sm">
                    {loading ? "กำลังโหลดข้อมูล..." : "ไม่พบบุคลากรในระบบ"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔔 Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold border ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
                : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/20'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚠️ Role Change Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && confirmModal.user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelRoleChange}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 w-full max-w-md relative z-10 space-y-5 text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    ยืนยันการเปลี่ยนบทบาทผู้ใช้
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    เพื่อป้องกันการเลือกเปลี่ยนสิทธิ์โดยไม่ตั้งใจ
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">ผู้ใช้งาน:</span>
                  <span className="font-bold text-slate-800">{confirmModal.user.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">อีเมล:</span>
                  <span className="font-mono text-slate-700">{confirmModal.user.email}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">บทบาทเดิม</span>
                    <span className="font-bold text-slate-700">
                      {confirmModal.user.role === 'admin' ? 'Administrator' : 'Lecturer'}
                    </span>
                  </div>
                  <span className="text-slate-400">➔</span>
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-500 font-bold block">บทบาทใหม่</span>
                    <span className="font-bold text-[#3F51B5]">
                      {confirmModal.newRole === 'admin' ? 'Administrator' : 'Lecturer'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                <span>การเปลี่ยนบทบาทนี้จะมีผลทันทีต่อสิทธิ์การเข้าถึงเมนูและข้อมูลในระบบหลังบ้าน</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmRoleChange}
                  className="flex-1 py-3 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={16} /> ยืนยันการเปลี่ยนบทบาท
                </button>
                <button
                  type="button"
                  onClick={handleCancelRoleChange}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}