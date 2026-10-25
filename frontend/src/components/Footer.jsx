import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Facebook, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const [contactInfo, setContactInfo] = useState({
    name: "ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ",
    faculty: "คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    address: "1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800",
    phone: "02-555-2000 ต่อ 4601, 4602 (ในเวลาราชการ)",
    facebook: "CIS KMUTNB",
    facebookUrl: "https://www.facebook.com/profile.php?id=100057122843991#"
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await axios.get('/api/about/contact');
        if (res.data?.data) {
          const d = res.data.data;
          setContactInfo(prev => ({
            ...prev,
            name: d.name || prev.name,
            faculty: d.faculty || prev.faculty,
            address: d.address || prev.address,
            phone: d.phone || prev.phone,
            facebook: d.facebook || prev.facebook,
            facebookUrl: d.facebookUrl || d.facebook_url || prev.facebookUrl
          }));
        }
      } catch (err) {
        // use fallback defaults
      }
    };

    fetchContact();

    const handleUpdate = () => fetchContact();
    window.addEventListener('site_config_updated', handleUpdate);
    return () => window.removeEventListener('site_config_updated', handleUpdate);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-secondary text-white pt-12 pb-6">
      <div className="max-w-[1440px] mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* ส่วนที่ 1: ชื่อหน่วยงาน */}
          <div>
            <h3 className="text-lg font-bold mb-4 leading-tight">
              {contactInfo.name || t('footer_dept_name')}
            </h3>
            <p className="text-sm opacity-80 mb-2">{contactInfo.faculty || t('footer_faculty_name')}</p>
          </div>

          {/* ส่วนที่ 2: เมนูลัด */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer_quick_links')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/student-guide" className="text-sm opacity-80 hover:opacity-100 underline decoration-white/30 transition-all">
                  {t('nav_student_guide')}
                </Link>
              </li>
              <li>
                <Link to="/student-links" className="text-sm opacity-80 hover:opacity-100 underline decoration-white/30 transition-all">
                  {t('nav_student_links')}
                </Link>
              </li>
              <li>
                <Link to="/personnel-links" className="text-sm opacity-80 hover:opacity-100 underline decoration-white/30 transition-all">
                  {t('nav_personnel_links')}
                </Link>
              </li>
              <li>
                <Link to="/student-projects" className="text-sm opacity-80 hover:opacity-100 underline decoration-white/30 transition-all">
                  {t('nav_student_projects')}
                </Link>
              </li>
            </ul>
          </div>

          {/* ส่วนที่ 3: ติดต่อเรา */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">{t('footer_contact_info')}</h3>
            <div className="flex items-start space-x-3">
              <MapPin size={18} className="mt-1 shrink-0" />
              <p className="text-sm opacity-80 leading-relaxed">
                {contactInfo.name || t('footer_dept_name')}<br />
                {contactInfo.address ? contactInfo.address : (contactInfo.faculty || t('footer_faculty_name'))}
              </p>
            </div>
            {contactInfo.phone && (
              <div className="flex items-center space-x-3">
                <Phone size={18} className="shrink-0" />
                <p className="text-sm opacity-80">
                  {contactInfo.phone}
                </p>
              </div>
            )}
            {contactInfo.facebookUrl && (
              <div className="flex items-center space-x-3">
                <Facebook size={18} className="shrink-0" />
                <a 
                  href={contactInfo.facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm opacity-80 hover:opacity-100"
                >
                  {contactInfo.facebook || 'CIS KMUTNB'}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* เส้นคั่นกลาง */}
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center text-[13px] opacity-80 gap-3 font-light">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© 2026 Department of Computer and Information Sciences, Faculty of Applied Science (KMUTNB)</p>
            <div className="flex items-center gap-3 text-xs opacity-90">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open_cookie_consent', { detail: { tab: 'pdpa' } }))}
                className="hover:underline hover:text-orange-300 transition cursor-pointer"
              >
                {t('pdpa_policy') || 'นโยบายความเป็นส่วนตัว (PDPA)'}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open_cookie_consent', { detail: { tab: 'settings' } }))}
                className="hover:underline hover:text-orange-300 transition cursor-pointer"
              >
                {t('cookie_settings') || 'การตั้งค่าคุกกี้ (Cookies)'}
              </button>
            </div>
          </div>
          <button 
            onClick={scrollToTop}
            className="flex items-center space-x-1 hover:text-white transition-colors mt-2 md:mt-0"
          >
            <span>Back to top</span>
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}