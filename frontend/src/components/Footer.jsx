import React from 'react';
import { MapPin, Phone, Facebook, ChevronUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#3F51B5] text-white pt-12 pb-6">
      <div className="max-w-[1440px] mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* ส่วนที่ 1: ชื่อหน่วยงาน */}
          <div>
            <h3 className="text-lg font-bold mb-4 leading-tight">
              ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ
            </h3>
            <p className="text-sm opacity-80 mb-2">คณะวิทยาศาสตร์ประยุกต์</p>
            <p className="text-sm opacity-80">
              มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
            </p>
          </div>

          {/* ส่วนที่ 2: เมนูลัด */}
          <div>
            <h3 className="text-lg font-bold mb-4">เมนูลัด</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 underline decoration-white/30 transition-all">
                  คู่มือนักศึกษา
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 underline decoration-white/30 transition-all">
                  Link สำหรับนักศึกษา
                </a>
              </li>
              <li>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 underline decoration-white/30 transition-all">
                  Link สำหรับบุคลากร
                </a>
              </li>
            </ul>
          </div>

          {/* ส่วนที่ 3: ติดต่อเรา */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-4">ติดต่อเรา</h3>
            <div className="flex items-start space-x-3">
              <MapPin size={18} className="mt-1 shrink-0" />
              <p className="text-sm opacity-80 leading-relaxed">
                ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ<br />
                คณะวิทยาศาสตร์ประยุกต์<br />
                มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ
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
              <a href="#" className="text-sm opacity-80 hover:opacity-100">
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