import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, History, PhoneCall, Plus, Trash2, Save, 
  UploadCloud, ExternalLink, RefreshCw, Loader2, CheckCircle2, 
  AlertCircle, ArrowUp, ArrowDown, MapPin, Facebook, Clock, User
} from 'lucide-react';

export default function ManageAbout() {
  const [activeTab, setActiveTab] = useState('organization'); // 'organization' | 'history' | 'contact'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  // Organization Data State
  const [orgData, setOrgData] = useState({
    head: { name: '', role: 'หัวหน้าภาควิชาฯ', image: '' },
    deputy: { name: '', role: 'รองหัวหน้าภาควิชาฯ', image: '' },
    assistants: []
  });

  // History Data State
  const [historyData, setHistoryData] = useState({
    header_text: '',
    timeline: []
  });

  // Contact Data State
  const [contactData, setContactData] = useState({
    name: '',
    faculty: '',
    address: '',
    phone: '',
    office_hours: '',
    facebook: '',
    facebookUrl: '',
    mapUrl: ''
  });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: '', message: '' });
    }, 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resOrg, resHist, resContact] = await Promise.all([
        axios.get('http://localhost:5000/api/about/organization'),
        axios.get('http://localhost:5000/api/about/history'),
        axios.get('http://localhost:5000/api/about/contact')
      ]);

      if (resOrg.data?.data) setOrgData(resOrg.data.data);
      if (resHist.data?.data) setHistoryData(resHist.data.data);
      if (resContact.data?.data) setContactData(resContact.data.data);
    } catch (err) {
      console.error('Failed to load about data:', err);
      showAlert('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Upload handler for profile images
  const handleImageUpload = async (e, callback) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      showAlert('info', 'กำลังอัปโหลดรูปภาพ...');
      const res = await axios.post('http://localhost:5000/api/about/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.imagePath) {
        callback(res.data.imagePath);
        showAlert('success', 'อัปโหลดรูปภาพสำเร็จ');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      showAlert('error', 'อัปโหลดรูปภาพไม่สำเร็จ รองรับเฉพาะไฟล์รูปภาพ');
    }
  };

  // Save Handlers
  const handleSaveOrganization = async () => {
    try {
      setSaving(true);
      await axios.post('http://localhost:5000/api/about/organization', { data: orgData });
      showAlert('success', 'บันทึกข้อมูลโครงสร้างองค์กรเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Save organization failed:', err);
      showAlert('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHistory = async () => {
    try {
      setSaving(true);
      await axios.post('http://localhost:5000/api/about/history', { data: historyData });
      showAlert('success', 'บันทึกข้อมูลประวัติความเป็นมาเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Save history failed:', err);
      showAlert('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async () => {
    try {
      setSaving(true);
      await axios.post('http://localhost:5000/api/about/contact', { data: contactData });
      showAlert('success', 'บันทึกข้อมูลการติดต่อเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Save contact failed:', err);
      showAlert('error', 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  // Assistant management
  const handleAddAssistant = () => {
    setOrgData(prev => ({
      ...prev,
      assistants: [
        ...prev.assistants,
        { name: '', role: 'ผู้ช่วยหัวหน้าภาควิชา', detail: 'ฝ่าย...', image: '' }
      ]
    }));
  };

  const handleRemoveAssistant = (index) => {
    setOrgData(prev => ({
      ...prev,
      assistants: prev.assistants.filter((_, i) => i !== index)
    }));
  };

  const handleAssistantChange = (index, field, value) => {
    const updated = [...orgData.assistants];
    updated[index] = { ...updated[index], [field]: value };
    setOrgData(prev => ({ ...prev, assistants: updated }));
  };

  // Timeline management
  const handleAddTimeline = () => {
    setHistoryData(prev => ({
      ...prev,
      timeline: [
        ...prev.timeline,
        { year: '25xx', title: 'หัวข้อเหตุการณ์', description: 'รายละเอียดเหตุการณ์...' }
      ]
    }));
  };

  const handleRemoveTimeline = (index) => {
    setHistoryData(prev => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index)
    }));
  };

  const handleTimelineChange = (index, field, value) => {
    const updated = [...historyData.timeline];
    updated[index] = { ...updated[index], [field]: value };
    setHistoryData(prev => ({ ...prev, timeline: updated }));
  };

  const handleMoveTimeline = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= historyData.timeline.length) return;
    const updated = [...historyData.timeline];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setHistoryData(prev => ({ ...prev, timeline: updated }));
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* 🌟 Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
            <Building2 className="text-[#3F51B5]" size={28} />
            จัดการข้อมูลแนะนำภาควิชาฯ
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            แก้ไขโครงสร้างองค์กร ประวัติความเป็นมา และข้อมูลการติดต่อภาควิชาฯ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="รีเฟรชข้อมูล"
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl transition-all border border-slate-200 shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          {activeTab === 'organization' && (
            <a
              href="/organization"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all"
            >
              <ExternalLink size={14} /> ดูหน้าเว็บจริง
            </a>
          )}
          {activeTab === 'history' && (
            <a
              href="/history"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all"
            >
              <ExternalLink size={14} /> ดูหน้าเว็บจริง
            </a>
          )}
          {activeTab === 'contact' && (
            <a
              href="/contact"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all"
            >
              <ExternalLink size={14} /> ดูหน้าเว็บจริง
            </a>
          )}
        </div>
      </header>

      {/* 🔔 Notification Alert */}
      <AnimatePresence>
        {alertInfo.show && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-sm ${
              alertInfo.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              alertInfo.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {alertInfo.type === 'success' && <CheckCircle2 size={20} className="text-emerald-600" />}
            {alertInfo.type === 'error' && <AlertCircle size={20} className="text-rose-600" />}
            {alertInfo.type === 'info' && <Loader2 size={20} className="text-blue-600 animate-spin" />}
            <span>{alertInfo.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧭 Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-2">
        <button
          onClick={() => setActiveTab('organization')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'organization'
              ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <Building2 size={18} /> โครงสร้างการบริหาร
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'history'
              ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <History size={18} /> ประวัติความเป็นมา
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'contact'
              ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-100'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/60'
          }`}
        >
          <PhoneCall size={18} /> ข้อมูลการติดต่อ
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#3F51B5] mr-2" />
          <span className="text-slate-500 font-medium text-sm">กำลังโหลดข้อมูล...</span>
        </div>
      ) : (
        <div>
          {/* ========================================================================= */}
          {/* 🏛️ TAB 1: ORGANIZATION STRUCTURE */}
          {/* ========================================================================= */}
          {activeTab === 'organization' && (
            <div className="space-y-6">
              {/* 1. หัวหน้าภาควิชา */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <User className="text-[#3F51B5]" size={20} />
                    ระดับที่ 1: หัวหน้าภาควิชา
                  </h2>
                  <span className="text-xs bg-indigo-50 text-[#3F51B5] px-3 py-1 rounded-full font-bold">Top Executive</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50 relative group">
                      {orgData.head?.image ? (
                        <img 
                          src={orgData.head.image.startsWith('http') || orgData.head.image.startsWith('/uploads') ? `http://localhost:5000${orgData.head.image.replace('http://localhost:5000', '')}` : orgData.head.image} 
                          alt={orgData.head?.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">No Photo</div>
                      )}
                    </div>

                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
                      <UploadCloud size={14} /> อัปโหลดรูปภาพ
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, (path) => setOrgData(prev => ({ ...prev, head: { ...prev.head, image: path } })))} 
                      />
                    </label>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ชื่อ-นามสกุล (พร้อมคำนำหน้า / ตำแหน่งทางวิชาการ)</label>
                      <input 
                        type="text"
                        value={orgData.head?.name || ''}
                        onChange={(e) => setOrgData(prev => ({ ...prev, head: { ...prev.head, name: e.target.value } }))}
                        placeholder="เช่น รศ.ดร.ธนภัทร์ อนุศาสน์อมรกุล"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-bold text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ตำแหน่งบริหาร</label>
                        <input 
                          type="text"
                          value={orgData.head?.role || ''}
                          onChange={(e) => setOrgData(prev => ({ ...prev, head: { ...prev.head, role: e.target.value } }))}
                          placeholder="หัวหน้าภาควิชาฯ"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-xs font-medium text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Image URL หรือ Path</label>
                        <input 
                          type="text"
                          value={orgData.head?.image || ''}
                          onChange={(e) => setOrgData(prev => ({ ...prev, head: { ...prev.head, image: e.target.value } }))}
                          placeholder="/img/lecturers/TNA.jpg"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-xs font-mono text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. รองหัวหน้าภาควิชา */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <User className="text-[#3F51B5]" size={20} />
                    ระดับที่ 2: รองหัวหน้าภาควิชา
                  </h2>
                  <span className="text-xs bg-indigo-50 text-[#3F51B5] px-3 py-1 rounded-full font-bold">Deputy Head</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50 relative group">
                      {orgData.deputy?.image ? (
                        <img 
                          src={orgData.deputy.image.startsWith('http') || orgData.deputy.image.startsWith('/uploads') ? `http://localhost:5000${orgData.deputy.image.replace('http://localhost:5000', '')}` : orgData.deputy.image} 
                          alt={orgData.deputy?.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">No Photo</div>
                      )}
                    </div>

                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
                      <UploadCloud size={14} /> อัปโหลดรูปภาพ
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, (path) => setOrgData(prev => ({ ...prev, deputy: { ...prev.deputy, image: path } })))} 
                      />
                    </label>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ชื่อ-นามสกุล</label>
                      <input 
                        type="text"
                        value={orgData.deputy?.name || ''}
                        onChange={(e) => setOrgData(prev => ({ ...prev, deputy: { ...prev.deputy, name: e.target.value } }))}
                        placeholder="เช่น ผศ.ดร.ลือพล พิพานเมฆาภรณ์"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm font-bold text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ตำแหน่งบริหาร</label>
                        <input 
                          type="text"
                          value={orgData.deputy?.role || ''}
                          onChange={(e) => setOrgData(prev => ({ ...prev, deputy: { ...prev.deputy, role: e.target.value } }))}
                          placeholder="รองหัวหน้าภาควิชาฯ"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-xs font-medium text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Image URL หรือ Path</label>
                        <input 
                          type="text"
                          value={orgData.deputy?.image || ''}
                          onChange={(e) => setOrgData(prev => ({ ...prev, deputy: { ...prev.deputy, image: e.target.value } }))}
                          placeholder="/img/lecturers/LPP.jpg"
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-xs font-mono text-slate-700"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ผู้ช่วยหัวหน้าภาควิชา / กรรมการบริหาร */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <User className="text-[#3F51B5]" size={20} />
                      ระดับที่ 3: กรรมการบริหาร / ผู้ช่วยหัวหน้าภาควิชา ({orgData.assistants?.length || 0} ท่าน)
                    </h2>
                    <p className="text-xs text-slate-400">เพิ่ม ลบ หรือแก้ไขฝ่ายงานและข้อมูลผู้ช่วยหัวหน้าภาควิชา</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAssistant}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#3F51B5] border border-indigo-200 rounded-xl font-bold text-xs transition-all shadow-sm"
                  >
                    <Plus size={16} /> เพิ่มกรรมการบริหาร
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orgData.assistants?.map((item, idx) => (
                    <div key={idx} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">ลำดับที่ {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssistant(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบรายการนี้"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow bg-white shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image.startsWith('http') || item.image.startsWith('/uploads') ? `http://localhost:5000${item.image.replace('http://localhost:5000', '')}` : item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">No Photo</div>
                          )}
                        </div>

                        <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg shadow-2xs">
                          <UploadCloud size={13} /> อัปโหลดรูป
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, (path) => handleAssistantChange(idx, 'image', path))} 
                          />
                        </label>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => handleAssistantChange(idx, 'name', e.target.value)}
                          placeholder="ชื่อ-นามสกุล เช่น ผศ.ดร.นิกร สุทธิเสงี่ยม"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#3F51B5]/20"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={item.role || ''}
                            onChange={(e) => handleAssistantChange(idx, 'role', e.target.value)}
                            placeholder="ตำแหน่ง เช่น ผู้ช่วยหัวหน้าภาควิชา"
                            className="p-2 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 outline-none"
                          />
                          <input
                            type="text"
                            value={item.detail || ''}
                            onChange={(e) => handleAssistantChange(idx, 'detail', e.target.value)}
                            placeholder="ฝ่ายงาน เช่น ฝ่ายสารสนเทศและวิจัย"
                            className="p-2 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-700 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Bar */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveOrganization}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-4 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all text-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  บันทึกข้อมูลโครงสร้างการบริหาร
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 📜 TAB 2: HISTORY & TIMELINE */}
          {/* ========================================================================= */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* ข้อความบทนำประวัติศาสตร์ */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <History className="text-[#3F51B5]" size={20} />
                  ข้อความบทนำ (Introduction Paragraph)
                </h2>
                <textarea
                  rows={4}
                  value={historyData.header_text || ''}
                  onChange={(e) => setHistoryData(prev => ({ ...prev, header_text: e.target.value }))}
                  placeholder="ข้อความเกริ่นนำประวัติการก่อตั้งภาควิชา..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#3F51B5]/20 text-sm text-slate-700 leading-relaxed font-normal"
                />
              </div>

              {/* รายการเหตุการณ์ไทม์ไลน์ */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">
                      เหตุการณ์ตามลำดับเวลา (Timeline Events)
                    </h2>
                    <p className="text-xs text-slate-400">เพิ่ม ลบ หรือปรับลำดับเหตุการณ์ประวัติความเป็นมา</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTimeline}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#3F51B5] border border-indigo-200 rounded-xl font-bold text-xs transition-all shadow-sm"
                  >
                    <Plus size={16} /> เพิ่มเหตุการณ์
                  </button>
                </div>

                <div className="space-y-4">
                  {historyData.timeline?.map((item, idx) => (
                    <div key={idx} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-[#3F51B5] text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-500">เหตุการณ์ลำดับที่ {idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveTimeline(idx, -1)}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                            title="ย้ายขึ้น"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveTimeline(idx, 1)}
                            disabled={idx === historyData.timeline.length - 1}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                            title="ย้ายลง"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveTimeline(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                            title="ลบเหตุการณ์นี้"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">ปี พ.ศ. / ช่วงเวลา</label>
                          <input
                            type="text"
                            value={item.year || ''}
                            onChange={(e) => handleTimelineChange(idx, 'year', e.target.value)}
                            placeholder="เช่น 2530 หรือ ปัจจุบัน"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#3F51B5] outline-none"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">หัวข้อเหตุการณ์</label>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => handleTimelineChange(idx, 'title', e.target.value)}
                            placeholder="เช่น การเปิดรับนักศึกษาระดับปริญญาตรีรุ่นแรก"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">รายละเอียดเหตุการณ์</label>
                        <textarea
                          rows={3}
                          value={item.description || ''}
                          onChange={(e) => handleTimelineChange(idx, 'description', e.target.value)}
                          placeholder="รายละเอียดของประวัติความเป็นมาในช่วงเวลานั้น..."
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Bar */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveHistory}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-4 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all text-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  บันทึกข้อมูลประวัติความเป็นมา
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 📍 TAB 3: CONTACT & LOCATION */}
          {/* ========================================================================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-5">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <PhoneCall className="text-[#3F51B5]" size={20} />
                  ข้อมูลการติดต่อและการตั้งค่าแผนที่
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">ชื่อภาควิชา</label>
                    <input
                      type="text"
                      value={contactData.name || ''}
                      onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">คณะ / มหาวิทยาลัย</label>
                    <input
                      type="text"
                      value={contactData.faculty || ''}
                      onChange={(e) => setContactData(prev => ({ ...prev, faculty: e.target.value }))}
                      placeholder="คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#3F51B5]" /> ที่อยู่ (Address)
                  </label>
                  <textarea
                    rows={2}
                    value={contactData.address || ''}
                    onChange={(e) => setContactData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1.5">
                      <PhoneCall size={14} className="text-[#3F51B5]" /> หมายเลขโทรศัพท์
                    </label>
                    <input
                      type="text"
                      value={contactData.phone || ''}
                      onChange={(e) => setContactData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="02-555-2000 ต่อ 4601, 4602"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1.5">
                      <Clock size={14} className="text-[#3F51B5]" /> เวลาทำการ (Office Hours)
                    </label>
                    <input
                      type="text"
                      value={contactData.office_hours || ''}
                      onChange={(e) => setContactData(prev => ({ ...prev, office_hours: e.target.value }))}
                      placeholder="จันทร์ - ศุกร์ | 08:30 - 16:30 น."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1.5">
                      <Facebook size={14} className="text-blue-600" /> ชื่อ Facebook Page
                    </label>
                    <input
                      type="text"
                      value={contactData.facebook || ''}
                      onChange={(e) => setContactData(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="CIS KMUTNB"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1.5">
                      <Facebook size={14} className="text-blue-600" /> ลิงก์ Facebook URL
                    </label>
                    <input
                      type="text"
                      value={contactData.facebookUrl || ''}
                      onChange={(e) => setContactData(prev => ({ ...prev, facebookUrl: e.target.value }))}
                      placeholder="https://www.facebook.com/profile.php?id=100057122843991#"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#3F51B5]" /> ลิงก์ Google Maps Embed URL (iframe src)
                  </label>
                  <textarea
                    rows={3}
                    value={contactData.mapUrl || ''}
                    onChange={(e) => setContactData(prev => ({ ...prev, mapUrl: e.target.value }))}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 outline-none"
                  />
                </div>

                {contactData.mapUrl && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-400">ตัวอย่างการแสดงผลแผนที่ (Live Preview):</span>
                    <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                      <iframe
                        src={contactData.mapUrl}
                        className="w-full h-full border-0"
                        allowFullScreen=""
                        loading="lazy"
                        title="Map Preview"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Save Bar */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveContact}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-4 bg-[#3F51B5] hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all text-sm disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  บันทึกข้อมูลการติดต่อ
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
