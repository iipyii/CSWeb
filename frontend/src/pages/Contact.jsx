import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Facebook, Clock, Globe } from 'lucide-react';
import axios from 'axios';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const defaultContactInfoTh = {
  name: "ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ",
  name_en: "Department of Computer and Information Science",
  faculty: "คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
  faculty_en: "Faculty of Applied Science, King Mongkut's University of Technology North Bangkok",
  address: "1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800",
  address_en: "1518 Pracharat 1 Rd., Wongsawang, Bangsue, Bangkok 10800, Thailand",
  phone: "02-555-2000 ต่อ 4601, 4602 (ในเวลาราชการ)",
  phone_en: "02-555-2000 ext. 4601, 4602 (Official Hours)",
  officeHours: "จันทร์ - ศุกร์ | 08:30 - 16:30 น.",
  officeHours_en: "Monday - Friday | 08:30 AM - 04:30 PM",
  facebook: "CIS KMUTNB",
  facebookUrl: "https://www.facebook.com/profile.php?id=100057122843991#",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3874.331163158434!2d100.51184657589574!3d13.819129595749764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b9f7158782f%3A0xc3f832729a8a783!2sDepartment%20of%20Computer%20and%20Information%20Science%20(CIS)%2C%20KMUTNB!5e0!3m2!1sen!2sth!4v1708600000000!5m2!1sen!2sth"
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 80, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

export default function Contact() {
  const { lang, t } = useLanguage();
  const [contactInfo, setContactInfo] = useState(defaultContactInfoTh);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const res = await axios.get('/api/about/contact');
        if (res.data?.data) {
          setContactInfo(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.error('Failed to load contact data:', err);
      }
    };
    fetchContact();
  }, []);

  const displayName = lang === 'EN' ? (contactInfo.name_en || defaultContactInfoTh.name_en) : contactInfo.name;
  const displayFaculty = lang === 'EN' ? (contactInfo.faculty_en || defaultContactInfoTh.faculty_en) : contactInfo.faculty;
  const displayAddress = lang === 'EN' ? (contactInfo.address_en || defaultContactInfoTh.address_en) : contactInfo.address;
  const displayPhone = lang === 'EN' ? (contactInfo.phone_en || defaultContactInfoTh.phone_en) : contactInfo.phone;
  const displayOfficeHours = lang === 'EN' ? (contactInfo.officeHours_en || defaultContactInfoTh.officeHours_en) : (contactInfo.officeHours || "จันทร์ - ศุกร์ | 08:30 - 16:30 น.");

  return (
    <div className="bg-slate-50 min-h-screen text-slate-700">
      
      {/* Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t('contact_title')}</h1>
            <div className="w-12 h-1 bg-white/30 mb-5 mx-auto md:mx-0"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 -mt-12 pb-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ข้อมูลการติดต่อ (คอลัมน์ซ้าย) */}
          <div className="md:col-span-1 space-y-6">
            <motion.div 
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
            >
              <div className="w-16 h-16 mb-6">
                 <img src="/cis-logo.svg" alt="CIS Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{displayName}</h2>
              <p className="text-slate-500 text-xs font-light mb-8 leading-relaxed">{displayFaculty}</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#3F51B5] group-hover:bg-[#3F51B5] group-hover:text-white transition-colors duration-300">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{t('contact_address')}</p>
                    <p className="text-sm leading-relaxed text-slate-600">{displayAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#3F51B5] group-hover:bg-[#3F51B5] group-hover:text-white transition-colors duration-300">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{t('contact_phone')}</p>
                    <p className="text-sm text-slate-600">{displayPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-[#3F51B5] group-hover:bg-[#3F51B5] group-hover:text-white transition-colors duration-300">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{t('contact_hours')}</p>
                    <p className="text-sm text-slate-600">{displayOfficeHours}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ลิงก์ Facebook */}
            <motion.a 
              href={contactInfo.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="block bg-[#1877F2] text-white p-6 rounded-2xl shadow-lg shadow-blue-200 group transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Facebook size={24} className="text-blue-200"  />
                  </div>
                  <div>
                    <p className="text-xs text-white font-light">{t('contact_facebook')}</p>
                    <p className="font-bold text-lg leading-none text-white">{contactInfo.facebook}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-[#1877F2] transition-colors">
                  <Globe size={14} className="text-white group-hover:text-[#1877F2]" />
                </div>
              </div>
            </motion.a>
          </div>

          {/* แผนที่ (คอลัมน์ขวา) */}
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="md:col-span-2 bg-white p-3 rounded-2xl shadow-lg border border-slate-100"
          >
            <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-inner relative group">
              <iframe 
                src={contactInfo.mapUrl}
                className="w-full h-full border-0 grayscale-[0.2] contrast-[1.1] group-hover:grayscale-0 transition-all duration-700"
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="CIS KMUTNB Location"
              ></iframe>
            </div>
            <div className="mt-4 flex items-center justify-between px-2">
               <span className="text-[10px] text-slate-400 italic">{t('contact_map_tip')}</span>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}