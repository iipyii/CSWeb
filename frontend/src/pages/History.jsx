import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import axios from 'axios';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const defaultTimelineTh = [
  {
    year: '2530',
    year_en: '1987',
    title: 'การเปิดรับนักศึกษาระดับปริญญาตรีรุ่นแรก',
    title_en: 'First Bachelor\'s Degree Admission',
    description: 'ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์ประยุกต์ เริ่มเปิดรับนักศึกษาระดับปริญญาตรี หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ประยุกต์ เพื่อผลิตบุคลากรทางด้านคอมพิวเตอร์เป็นรุ่นแรกของมหาวิทยาลัย',
    description_en: 'The Department of Mathematics, Faculty of Applied Science, began admitting undergraduate students into the Bachelor of Science in Applied Computer Science program to cultivate the university\'s first generation of computer specialists.'
  },
  {
    year: '2536',
    year_en: '1993',
    title: 'การจัดตั้งภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ',
    title_en: 'Establishment of the Department',
    description: 'เมื่อบุคลากรในด้านวิทยาการคอมพิวเตอร์มากขึ้น จึงได้แยกออกมาจากภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์ ก่อตั้งเป็นภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ และรับหลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ประยุกต์มาบริหารจัดการ และได้เปิดรับนักศึกษาในหลักสูตรดังต่อไปนี้เพิ่มเติม',
    description_en: 'With the growth of computing faculty, the department was formally separated from the Department of Mathematics and Computer Science to establish the Department of Computer and Information Science (CIS), managing the Bachelor of Science program and expanding its curricula.'
  },
  {
    year: '2537',
    year_en: '1994',
    title: 'หลักสูตรวิทยาศาสตรบัณฑิต (ต่อเนื่อง)',
    title_en: 'Bachelor of Science (Continuing Program)',
    description: 'เปิดรับนักศึกษาในหลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ต่อเนื่อง) และหยุดรับนักศึกษาในปีพุทธศักราช 2553',
    description_en: 'Admitted students into the Bachelor of Science in Computer Science (Continuing Program), which successfully fulfilled its mission until admissions concluded in 2010.'
  },
  {
    year: '2546',
    year_en: '2003',
    title: 'ขยายการศึกษาสู่ระดับบัณฑิตศึกษา',
    title_en: 'Expansion into Graduate Studies (M.Sc.)',
    description: 'เปิดรับนักศึกษาในหลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ และมีการปรับปรุงเรื่อยมา ล่าสุดปรับปรุงปีพุทธศักราช 2562',
    description_en: 'Launched the Master of Science program in Computer Science, continually modernized to align with global computing standards, with its latest revision in 2019.'
  },
  {
    year: '2554',
    year_en: '2011',
    title: 'เปิดหลักสูตรระดับปริญญาเอก',
    title_en: 'Inauguration of Doctoral Program (Ph.D.)',
    description: 'เปิดรับนักศึกษาในหลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ และปรับปรุงในปีพุทธศักราช 2559',
    description_en: 'Commenced admissions for the Doctor of Philosophy (Ph.D.) in Computer Science program to foster cutting-edge research, revised in 2016.'
  },
  {
    year: '2559',
    year_en: '2016',
    title: 'เปิดหลักสูตรวิศวกรรมซอฟต์แวร์',
    title_en: 'Software Engineering Master\'s Program',
    description: 'ปีพุทธศักราช 2559 ในภาคการศึกษาที่ 2 เปิดรับนักศึกษาในหลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์ ซึ่งเป็นหลักสูตรใหม่',
    description_en: 'Commenced admissions in semester 2/2016 for the newly established Master of Science in Software Engineering program.'
  },
  {
    year: 'ปัจจุบัน',
    year_en: 'Present',
    title: 'ความเป็นเลิศทางวิชาการและสหกิจศึกษา',
    title_en: 'Academic Excellence & Cooperative Education',
    description: 'ปัจจุบันภาควิชามีการเรียนการสอนใน 4 หลักสูตร สนับสนุนการเรียนการสอนให้มีความสามารถทั้งทฤษฎีและปฏิบัติ มีความร่วมมือกับหน่วยงานรัฐและเอกชน สนับสนุนการปฏิบัติงานสหกิจศึกษาทั้งในและต่างประเทศ',
    description_en: 'Currently offering 4 degree programs fostering strong theoretical foundations and practical expertise, with extensive public and industrial collaborations supporting both domestic and international cooperative education.'
  }
];

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

const DEFAULT_INTRO_TH = 'ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ ก่อตั้งขึ้นในปีพุทธศักราช 2536\nโดยแยกออกมาจาก ภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์\nคณะวิทยาศาสตร์ประยุกต์ซึ่งเดิมคือภาควิชาคณิตศาสตร์ คณะครุศาสตร์อุตสาหกรรม';
const DEFAULT_INTRO_EN = 'The Department of Computer and Information Science was established in 1993,\noriginating from the Department of Mathematics and Computer Science,\nFaculty of Applied Science (formerly the Department of Mathematics, Faculty of Technical Education).';

export default function History() {
  const { lang, t } = useLanguage();
  const [historyIntroTh, setHistoryIntroTh] = useState(DEFAULT_INTRO_TH);
  const [historyIntroEn, setHistoryIntroEn] = useState(DEFAULT_INTRO_EN);
  const [timelineData, setTimelineData] = useState(defaultTimelineTh);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/about/history');
        if (res.data?.data) {
          const intro = res.data.data.header_text || res.data.data.intro;
          if (intro !== undefined && intro !== null) {
            setHistoryIntroTh(intro);
          }
          if (res.data.data.intro_en || res.data.data.header_text_en) {
            setHistoryIntroEn(res.data.data.intro_en || res.data.data.header_text_en);
          }
          if (res.data.data.timeline && Array.isArray(res.data.data.timeline)) {
            setTimelineData(res.data.data.timeline);
          }
        }
      } catch (err) {
        console.error('Failed to load history data:', err);
      }
    };
    fetchHistory();
  }, []);

  const displayIntro = lang === 'EN' ? historyIntroEn : historyIntroTh;

  return (
    <div className="bg-white min-h-screen text-slate-700 overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#3F51B5] z-50 origin-[0%]"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t('history_title')}</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 md:px-10 py-20">
        
        <div className="max-w-3xl mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-slate-800 mb-0 leading-relaxed font-light text-base md:text-lg whitespace-pre-line">
              {displayIntro}
            </p>
          </motion.div>
        </div>

        {/* Vertical Timeline Section */}
        <div className="relative max-w-4xl mx-auto">
          {/* เส้นแนวตั้งหลัก (ชิดซ้าย) */}
          <div className="absolute left-4 md:left-8 top-0 w-[2px] h-full bg-slate-100"></div>

          <div className="space-y-12">
            {timelineData.map((item, index) => {
              const displayTitle = (lang === 'EN' && (item.title_en || defaultTimelineTh[index]?.title_en))
                ? (item.title_en || defaultTimelineTh[index]?.title_en)
                : item.title;

              const displayDescription = (lang === 'EN' && (item.description_en || defaultTimelineTh[index]?.description_en))
                ? (item.description_en || defaultTimelineTh[index]?.description_en)
                : item.description;

              let displayYear = item.year;
              if (lang === 'EN') {
                if (item.year_en) {
                  displayYear = item.year_en;
                } else if (item.year.toLowerCase().includes('ปัจจุบัน')) {
                  displayYear = 'Present';
                } else {
                  const num = parseInt(item.year, 10);
                  displayYear = !isNaN(num) && num > 2400 ? String(num - 543) : item.year;
                }
              } else {
                displayYear = (item.year.toLowerCase().includes('ปัจจุบัน') || item.year.toLowerCase().includes('present'))
                  ? item.year 
                  : `${t('history_year_prefix')} ${item.year}`;
              }

              return (
                <motion.div 
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={itemVariants}
                  className="relative pl-12 md:pl-20"
                >
                  {/* จุดวงกลมบนเส้นแนวตั้ง */}
                  <div className="absolute left-[11px] md:left-[27px] top-2 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      className="w-3 h-3 rounded-full bg-[#3F51B5] border-2 border-white shadow-sm z-10"
                    />
                    <motion.div 
                      initial={{ scale: 0, opacity: 0.5 }}
                      whileInView={{ scale: 2.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute w-3 h-3 rounded-full bg-[#3F51B5] z-0"
                    />
                  </div>

                  {/* เนื้อหาประวัติ */}
                  <motion.div 
                    whileHover={{ x: 10 }}
                    className="group cursor-default"
                  >
                    <div className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded text-[#3F51B5] font-bold text-sm mb-3 group-hover:bg-[#3F51B5] group-hover:text-white transition-all duration-300">
                      {displayYear}
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#3F51B5] transition-colors duration-300">
                      {displayTitle}
                    </h4>
                    <p className="text-slate-500 font-light leading-relaxed text-sm md:text-base max-w-2xl">
                      {displayDescription}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}