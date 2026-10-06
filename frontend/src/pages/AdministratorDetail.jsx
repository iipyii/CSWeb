import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, GraduationCap, BookOpen, ChevronLeft } from 'lucide-react';
import axios from "axios";
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function AdministratorDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/lecturers/${code}`)
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [code]);

  if (loading) return <p className="text-center mt-20">{lang === 'EN' ? 'Loading...' : 'กำลังโหลด...'}</p>;
  if (!profile) return <p className="text-center mt-20">{lang === 'EN' ? 'Personnel not found' : 'ไม่พบข้อมูลบุคลากร'}</p>;

  // 🔥 แยกวุฒิการศึกษาตามบรรทัด
  const educationList = profile.education_th
  ? profile.education_th
      .replace(/"/g, "")                 // ลบ "
      .split(/(?=ปริญญา)/g)             // แยกทุกครั้งที่เจอคำว่า ปริญญา
      .map(e => e.trim())
      .filter(e => e !== "")
  : [];

  const displayName = lang === 'EN' && profile.fullname_en ? profile.fullname_en : profile.fullname_th;
  const displaySubName = lang === 'EN' ? profile.fullname_th : profile.fullname_en;
  const displayPosition = lang === 'EN' ? (profile.position_en || profile.position_th) : profile.position_th;

  return (
    <div className="bg-white min-h-screen text-slate-700">
      <main className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-20">

        {/* Navigation - ปุ่มย้อนกลับ */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-[#3F51B5] transition-colors mb-12 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">
            {lang === 'EN' ? 'Back to Personnel' : 'ย้อนกลับหน้าบุคลากร'}
          </span>
        </button>

        <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">

          {/* ส่วนข้อมูลด้านซ้าย (รูปภาพและช่องทางการติดต่อ) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-1/3 md:sticky md:top-24"
          >
            <div className="rounded-[2rem] overflow-hidden shadow-2xl mb-8 border-[10px] border-slate-50 bg-slate-100 aspect-[3/4]">
              <img
                src={profile.image_path
                  ? `${profile.image_path}`
                  : "/img/staff/default-avatar.jpg"}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "/img/staff/default-avatar.jpg"; }}
              />
            </div>

            <div className="space-y-4 px-2">
              <div className="flex items-center gap-4 text-sm group">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#3F51B5] group-hover:bg-[#3F51B5] group-hover:text-white transition-colors">
                  <Mail size={18} />
                </div>
                <a href={`mailto:${profile.email}`} className="inline-flex items-center min-h-[44px] px-2 -mx-2 text-slate-600 hover:text-[#3F51B5] hover:underline transition-colors break-all">
                  {profile.email}
                </a>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={18} />
                </div>
                <span className="text-slate-600">{profile.tel}</span>
              </div>
            </div>
          </motion.div>

          {/* ส่วนข้อมูลด้านขวา (ประวัติและผลงานวิชาการ) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-2/3"
          >
            <div className="mb-12 border-b border-slate-100 pb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 leading-tight">
                {displayName}
                {" "}({profile.lecturer_code})
              </h1>
              {displaySubName && (
                <p className="mb-4 text-lg md:text-xl text-[#3F51B5] font-light italic leading-relaxed">
                  {displaySubName}
                </p>
              )}

              <p className="mb-4 font-medium text-gray-600 flex flex-col">
                {displayPosition}
              </p>
            </div>

            {/* ส่วนวุฒิการศึกษา */}
            <section className="mb-16">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-[#3F51B5] rounded-full"></div>
                <GraduationCap className="text-[#3F51B5]" /> {lang === 'EN' ? 'Education' : 'วุฒิการศึกษา'}
              </h2>
              <ul className="space-y-4">
                {educationList.map((edu, index) => (
                  <li key={index} className="flex gap-4 items-start text-slate-600">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0"></span>
                    <span className="text-base md:text-lg font-light leading-relaxed">{edu}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ส่วนผลงานทางวิชาการ */}
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-[#3F51B5] rounded-full"></div>
                <BookOpen className="text-[#3F51B5]" /> {lang === 'EN' ? 'Academic Publications' : 'ผลงานทางวิชาการ'}
              </h2>
              <div className="space-y-10">
                <div>
                  <ul className="space-y-8">
                    {/* {profile.publications?.map((pub, index) => (
                      <li key={index} className="relative pl-8 border-l border-slate-100 pb-2">
                        <div className="absolute left-[-5.5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-100 border-2 border-white"></div>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-light italic">
                          {pub}
                        </p>
                      </li>
                    ))} */}
                    {profile.research_publications?.map((pub) => (
                      <li key={pub.id} className="relative pl-8 border-l border-slate-100 pb-2">
                        <div className="absolute left-[-5.5px] top-0 w-2.5 h-2.5 rounded-full bg-blue-100 border-2 border-white"></div>

                        <p className="text-slate-600 text-sm md:text-base leading-relaxed font-light italic">
                          {pub.authors}. <strong>{pub.title}</strong>. {pub.venue}, {pub.publication_year}.
                        </p>

                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>


  );
}