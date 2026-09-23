import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Facebook, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

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
              {t('footer_dept_name')}
            </h3>
            <p className="text-sm opacity-80 mb-2">{t('footer_faculty_name')}</p>
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
                {t('footer_dept_name')}<br />
                {t('footer_faculty_name')}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Phone size={18} className="shrink-0" />
              <p className="text-sm opacity-80">
                02-555-2000 ต่อ 4601, 4602 (ในเวลาราชการ)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Facebook size={18} className="shrink-0" />
              <a 
                href="https://www.facebook.com/profile.php?id=100057122843991#" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm opacity-80 hover:opacity-100"
              >
                CIS KMUTNB
              </a>
            </div>
          </div>
        </div>

        {/* เส้นคั่นกลาง */}
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center text-[13px] opacity-70 font-light">
          <p>© 2026 Department of Computer and Information Sciences, Faculty of Applied Science (KMUTNB)</p>
          <button 
            onClick={scrollToTop}
            className="flex items-center space-x-1 hover:text-white transition-colors mt-4 md:mt-0"
          >
            <span>Back to top</span>
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}