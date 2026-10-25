import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, ChevronRight, Lock, BarChart3, Sliders, Info, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const COOKIE_CONSENT_KEY = 'cis_cookie_consent';

export default function CookieConsent() {
  const { language } = useLanguage();
  const isEn = language === 'EN';

  // สถานะแสดง Banner / Modal
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'pdpa'

  // การตั้งค่าคุกกี้แต่ละประเภท
  const [preferences, setPreferences] = useState({
    necessary: true, // บังคับเสมอ
    analytics: true,
    functional: true
  });

  // ตรวจสอบ consent เดิมเมื่อโหลดหน้าเว็บ
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!saved) {
        // รอ 700ms เพื่อให้หน้าเว็บโหลดเสร็จก่อนค่อย fade in ขึ้นมาอย่างนุ่มนวล
        const timer = setTimeout(() => setShowBanner(true), 700);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setPreferences({
            necessary: true,
            analytics: parsed.analytics !== false,
            functional: parsed.functional !== false
          });
        }
      }
    } catch (e) {
      setShowBanner(true);
    }
  }, []);

  // ดักฟัง event เมื่อมีการคลิกเปิดตั้งค่าคุกกี้จากภายนอก เช่น Footer
  useEffect(() => {
    const handleOpenModal = (e) => {
      if (e?.detail?.tab) {
        setActiveTab(e.detail.tab);
      }
      setShowModal(true);
    };

    window.addEventListener('open_cookie_consent', handleOpenModal);
    return () => window.removeEventListener('open_cookie_consent', handleOpenModal);
  }, []);

  // ฟังก์ชันบันทึกความยินยอม
  const saveConsent = (analyticsVal, functionalVal) => {
    const consentData = {
      accepted: true,
      necessary: true,
      analytics: !!analyticsVal,
      functional: !!functionalVal,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
    } catch (e) {}

    setPreferences({
      necessary: true,
      analytics: !!analyticsVal,
      functional: !!functionalVal
    });

    setShowBanner(false);
    setShowModal(false);

    // ส่ง event ให้ระบบอื่นรับรู้ (เช่น การ track visit)
    window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: consentData }));
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleRejectNonEssential = () => {
    saveConsent(false, false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences.analytics, preferences.functional);
  };

  return (
    <>
      {/* 1. Cookie & PDPA Banner ด้านล่างหน้าจอ */}
      {showBanner && !showModal && (
        <div 
          className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
          role="dialog"
          aria-live="polite"
        >
          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-2xl rounded-2xl p-5 md:p-6 text-slate-800">
            <div className="flex items-start gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900">
                    {isEn ? "Cookie Consent & Privacy (PDPA)" : "นโยบายการใช้คุกกี้และความเป็นส่วนตัว (PDPA)"}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    <ShieldCheck className="w-3 h-3" />
                    {isEn ? "PDPA Compliant" : "คุ้มครองตาม PDPA"}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {isEn ? (
                    <>
                      This website uses cookies to improve your user experience and analyze traffic in compliance with the Personal Data Protection Act (PDPA). You can accept all cookies, customize preferences, or read our policy.
                    </>
                  ) : (
                    <>
                      เว็บไซต์ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ มจพ. มีการใช้งานคุกกี้ (Cookies) เพื่อพัฒนาประสบการณ์การใช้งานและวิเคราะห์สถิติผู้เข้าชมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) ท่านสามารถเลือกยอมรับ ปรับแต่ง หรืออ่านนโยบายได้
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pl-0 md:pl-13">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('pdpa');
                  setShowModal(true);
                }}
                className="text-orange-600 hover:text-orange-700 underline font-medium cursor-pointer inline-flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                {isEn ? "Read Privacy Policy" : "อ่านนโยบายคุ้มครองข้อมูลส่วนบุคคล"}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setShowModal(true);
                }}
                className="text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer inline-flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                {isEn ? "Cookie Preferences" : "ตั้งค่าคุกกี้"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3.5 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition cursor-pointer text-center"
              >
                {isEn ? "Reject Non-Essential" : "ใช้เฉพาะที่จำเป็น"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setShowModal(true);
                }}
                className="px-3.5 py-2 text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 rounded-xl transition cursor-pointer text-center"
              >
                {isEn ? "Preferences" : "ตั้งค่าคุกกี้"}
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-4 py-2 text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20 active:scale-95 rounded-xl transition cursor-pointer text-center"
              >
                {isEn ? "Accept All" : "ยอมรับทั้งหมด"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Cookie Badge เพื่อเปิดตั้งค่าได้ตลอดเวลา (มุมซ้ายล่าง) */}
      {!showBanner && (
        <button
          type="button"
          onClick={() => {
            setActiveTab('settings');
            setShowModal(true);
          }}
          className="fixed bottom-4 left-4 z-40 p-2.5 bg-white/90 hover:bg-white text-slate-600 hover:text-orange-600 shadow-lg border border-slate-200/80 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-105 group cursor-pointer"
          title={isEn ? "Cookie & PDPA Settings" : "ตั้งค่าคุกกี้และความเป็นส่วนตัว (PDPA)"}
          aria-label="Cookie & PDPA Settings"
        >
          <Cookie className="w-5 h-5 text-orange-500 group-hover:rotate-12 transition-transform" />
          <span className="sr-only">ตั้งค่าคุกกี้</span>
        </button>
      )}

      {/* 3. Modal รายละเอียดการตั้งค่าคุกกี้ & นโยบายความเป็นส่วนตัว (PDPA) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {isEn ? "Privacy Center & Cookie Settings" : "ศูนย์การคุ้มครองข้อมูลส่วนบุคคลและตั้งค่าคุกกี้"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isEn ? "Department of Computer and Information Sciences (KMUTNB)" : "ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ มจพ."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 bg-white px-5 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                {isEn ? "Cookie Preferences" : "การตั้งค่าคุกกี้"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pdpa')}
                className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
                  activeTab === 'pdpa'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-4 h-4" />
                {isEn ? "PDPA Privacy Policy" : "นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)"}
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4 text-slate-700 text-sm">
              {activeTab === 'settings' ? (
                <>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    {isEn
                      ? "You can choose which cookies you want to allow on this site. Essential cookies are required for the website to function properly and cannot be disabled."
                      : "ท่านสามารถเลือกประเภทคุกกี้ที่ท่านอนุญาตให้ใช้งานบนเว็บไซต์นี้ได้ โดยคุกกี้ที่จำเป็นอย่างยิ่งจะถูกเปิดใช้งานตลอดเวลาเพื่อความมั่นคงปลอดภัยและการทำงานปกติของระบบ"}
                  </p>

                  <div className="space-y-3 pt-2">
                    {/* 1. Necessary */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {isEn ? "Strictly Necessary Cookies" : "คุกกี้ที่จำเป็นอย่างยิ่ง (Strictly Necessary)"}
                            </span>
                            <span className="text-[11px] font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                              {isEn ? "Always Active" : "เปิดใช้งานตลอดเวลา"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {isEn
                              ? "Essential for core functionalities such as security, network management, session handling, and accessibility. The website cannot function without these cookies."
                              : "จำเป็นอย่างยิ่งต่อการทำงานหลักของเว็บไซต์ เช่น ความปลอดภัย การนำทางในหน้าเว็บ และการบันทึกสถานะการยินยอม เว็บไซต์จะไม่สามารถทำงานได้อย่างถูกต้องหากไม่มีคุกกี้กลุ่มนี้"}
                          </p>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center shrink-0">
                        <input
                          type="checkbox"
                          checked={true}
                          disabled
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-80 cursor-not-allowed"></div>
                      </div>
                    </div>

                    {/* 2. Analytics */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <BarChart3 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {isEn ? "Analytics & Performance Cookies" : "คุกกี้เพื่อการวิเคราะห์และวัดผล (Analytics)"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {isEn
                              ? "Allows us to count visits and traffic sources to measure and improve the performance of our website. All information these cookies collect is aggregated and anonymous."
                              : "ช่วยให้เราทราบจำนวนผู้เข้าชม พฤติกรรมการสืบค้น และหน้าเว็บที่ได้รับความนิยม เพื่อนำข้อมูลทางสถิติไปพัฒนาปรับปรุงประสิทธิภาพเว็บไซต์ ข้อมูลทั้งหมดจะถูกรวบรวมแบบไม่ระบุตัวตน"}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>

                    {/* 3. Functional */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Sliders className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {isEn ? "Functional Cookies" : "คุกกี้เพื่อการทำงานและปรับแต่ง (Functional)"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {isEn
                              ? "Enables the website to provide enhanced functionality, such as remembering your chosen language (TH/EN) or personalization settings."
                              : "ช่วยจดจำค่าที่คุณเลือก เช่น ภาษาที่ใช้งาน (ภาษาไทยหรืออังกฤษ) หรือการตั้งค่าการแสดงผล เพื่ออำนวยความสะดวกในการกลับมาเข้าชมซ้ำ"}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={preferences.functional}
                          onChange={(e) => setPreferences(prev => ({ ...prev, functional: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                /* PDPA Policy Tab */
                <div className="space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed">
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-orange-900">
                    <h4 className="font-bold text-sm text-orange-950 mb-1">
                      {isEn ? "KMUTNB Department of CS - PDPA Policy" : "นโยบายคุ้มครองข้อมูลส่วนบุคคล ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ"}
                    </h4>
                    <p className="text-xs text-orange-800">
                      {isEn
                        ? "According to the Personal Data Protection Act B.E. 2562 (2019)"
                        : "ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)"}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-semibold text-slate-900 text-sm mb-1">
                        {isEn ? "1. Purposes of Data Collection" : "1. วัตถุประสงค์ในการเก็บรวบรวมข้อมูล"}
                      </h5>
                      <p>
                        {isEn
                          ? "We collect technical visit data, search logs, and inquiries submitted via contact forms or the AI Chatbot to provide academic information, improve user experience, and ensure system security."
                          : "ภาควิชาฯ มีการประมวลผลข้อมูลการเข้าชมเว็บไซต์ สถิติการใช้งาน และข้อมูลการติดต่อสอบถาม เพื่อให้บริการข้อมูลข่าวสารทางวิชาการ หลักสูตร โครงงาน และปรับปรุงความเสถียรของระบบงาน"}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-slate-900 text-sm mb-1">
                        {isEn ? "2. Data We Collect" : "2. ข้อมูลส่วนบุคคลที่เราจัดเก็บ"}
                      </h5>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>
                          {isEn
                            ? "Technical info: IP Address, Browser Type, Operating System, Access Time, Pageviews."
                            : "ข้อมูลทางเทคนิค: ไอพีแอดเดรส (IP Address), ชนิดของเบราว์เซอร์, ระบบปฏิบัติการ, วันเวลาและหน้าที่เข้าชม"}
                        </li>
                        <li>
                          {isEn
                            ? "Usage data: Search keywords, language preference, and Chatbot interaction history."
                            : "ข้อมูลการใช้งาน: คำค้นหาที่สืบค้น, การตั้งค่าภาษา (TH/EN), และประวัติการสอบถาม AI Chatbot"}
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold text-slate-900 text-sm mb-1">
                        {isEn ? "3. Data Subject Rights" : "3. สิทธิของเจ้าของข้อมูลส่วนบุคคล"}
                      </h5>
                      <p>
                        {isEn
                          ? "Under the PDPA, you have the right to access, rectify, erase, object to processing, and withdraw consent at any time through our Cookie Preferences panel or by contacting our department."
                          : "ตามกฎหมาย PDPA ท่านมีสิทธิในการขอเข้าถึง ขอรับสำเนา ขอแก้ไข หรือขอให้ลบข้อมูลส่วนบุคคล รวมถึงการเพิกถอนความยินยอมในการใช้งานคุกกี้ได้ตลอดเวลา"}
                      </p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-slate-900 text-sm mb-1">
                        {isEn ? "4. Contact Us" : "4. ข้อมูลติดต่อผู้ควบคุมข้อมูล"}
                      </h5>
                      <p>
                        {isEn
                          ? "Department of Computer and Information Sciences, Faculty of Applied Science, KMUTNB. Tel: 02-555-2000 ext. 4601, 4602."
                          : "ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ โทร. 02-555-2000 ต่อ 4601, 4602"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="w-full sm:w-auto px-4 py-2 text-xs md:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer text-center"
              >
                {isEn ? "Reject Non-Essential" : "ปฏิเสธทั้งหมด (ใช้เฉพาะจำเป็น)"}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {activeTab === 'settings' && (
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs md:text-sm font-medium text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl transition cursor-pointer text-center"
                  >
                    {isEn ? "Save Preferences" : "บันทึกการตั้งค่า"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs md:text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/20 rounded-xl transition cursor-pointer text-center"
                >
                  {isEn ? "Accept All" : "ยอมรับทั้งหมด"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
