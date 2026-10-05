import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';
import { ArrowRightCircle, Clock, Search, Tag, Newspaper } from 'lucide-react';
import { formatThaiDate } from '../utils/thaiText';
import { useLanguage } from '../context/LanguageContext';

const ALLOWED_TAGS = [
  'ข่าวภาควิชาฯ',
  'ข่าวคณะและมหาวิทยาลัย',
  'ข่าวทุนการศึกษา',
  'ข่าวรับสมัครงาน-ประชาสัมพันธ์'
];

export const formatNewsDate = (rawDate, lang) => {
  if (!rawDate) return "";
  if (lang === 'EN') {
    const d = new Date(rawDate);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return formatThaiDate(rawDate);
};

export const getCategoryLabel = (category, lang) => {
  if (lang === 'EN') {
    if (category === 'department') return 'Department News';
    if (category === 'faculty') return 'Faculty & University';
    if (category === 'scholarship') return 'Scholarships';
    return 'Job Opportunities & PR';
  }
  if (category === 'department') return 'ข่าวภาควิชาฯ';
  if (category === 'faculty') return 'ข่าวคณะและมหาวิทยาลัย';
  if (category === 'scholarship') return 'ข่าวทุนการศึกษา';
  return 'ข่าวรับสมัครงาน-ประชาสัมพันธ์';
};

// ฟังก์ชันแปลงค่าหมวดหมู่จาก URL Query Param ให้เป็นชื่อแท็บมาตรฐาน
const getTabFromParams = (params) => {
  const raw = params.get('tab') || params.get('category');
  if (!raw) return 'ล่าสุด';
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (decoded === 'department' || decoded === 'ข่าวภาควิชาฯ') return 'ข่าวภาควิชาฯ';
    if (decoded === 'faculty' || decoded === 'ข่าวคณะและมหาวิทยาลัย' || decoded === 'ข่าวคณะ/มหาวิทยาลัย') return 'ข่าวคณะและมหาวิทยาลัย';
    if (decoded === 'scholarship' || decoded === 'ข่าวทุนการศึกษา') return 'ข่าวทุนการศึกษา';
    if (decoded === 'job' || decoded === 'jobs' || decoded === 'employment' || decoded === 'ข่าวรับสมัครงาน-ประชาสัมพันธ์' || decoded === 'ข่าวรับสมัครงาน/ประชาสัมพันธ์') return 'ข่าวรับสมัครงาน-ประชาสัมพันธ์';
    if (ALLOWED_TAGS.includes(decoded)) return decoded;
  } catch (e) {
    console.error("Error parsing tab param:", e);
  }
  return 'ล่าสุด';
};

export default function News() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [newsData, setNewsData] = useState([]);

  const [activeTab, setActiveTab] = useState(() => getTabFromParams(searchParams));
  const navigate = useNavigate();

  // ✨ ซิงค์ activeTab ทันทีเมื่อ URL Query Param มีการเปลี่ยนแปลง (เช่น กดเลือกจากเมนูย่อยของ Navbar)
  useEffect(() => {
    setActiveTab(getTabFromParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        const res = await axios.get("/api/news");
        const todayBkk = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date());

        const formattedNews = res.data
          .filter(item => {
            if (item.status !== 'active') return false;
            if (item.start_date) {
              const startStr = String(item.start_date).split('T')[0];
              if (startStr > todayBkk) return false;
            }
            return true;
          })
          .map(item => ({
            id: item.id,
            title: item.title,
            title_en: item.title_en,
            content: item.content,
            content_en: item.content_en,
            summary: item.summary,
            summary_en: item.summary_en,
            description: item.summary || (item.content ? item.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : ''),
            description_en: item.summary_en || (item.content_en ? item.content_en.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : ''),
            isLatest: true,
            isPinned: item.is_urgent,
            image: item.image ? (item.image.startsWith('http') ? item.image : item.image) : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800",
            rawDate: item.start_date || item.created_at,
            date: formatThaiDate(item.start_date || item.created_at),
            category: item.category,
            tag: item.category === 'department' ? 'ข่าวภาควิชาฯ' :
              item.category === 'faculty' ? 'ข่าวคณะและมหาวิทยาลัย' :
                item.category === 'scholarship' ? 'ข่าวทุนการศึกษา' : 'ข่าวรับสมัครงาน-ประชาสัมพันธ์'
          }));
        setNewsData(formattedNews);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchAllNews();
  }, []);

  // ✨ ฟังก์ชันเปลี่ยน Tab พร้อมอัปเดต URL
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'ล่าสุด') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabName });
    }
  };

  // 📝 ข้อมูลข่าวสาร (คงเดิม)
  // const newsData = [
  //   {
  //     id: 1,
  //     tag: 'ข่าวภาควิชาฯ',
  //     isLatest: true,
  //     isPinned: false,
  //     title: 'ภาควิชาขอแสดงความยินดีกับอาจารย์ที่ได้รับ Best Paper Award ในการประชุมวิชาการระดับนานาชาติ The 2026 14th',
  //     date: '6 มีนาคม 2569',
  //     description: 'ขอแสดงความยินดีกับคณาจารย์ผู้สร้างชื่อเสียงให้กับภาควิชาในเวทีระดับนานาชาติด้วยผลงานวิจัยยอดเยี่ยม...',
  //     image: 'https://scontent.fbkk5-6.fna.fbcdn.net/v/t39.30808-6/645638951_1458812212699526_4878319680973014599_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=13d280&_nc_ohc=24W3rW6U6nUQ7kNvwGVXLk6&_nc_oc=Adny-7UX0ytLS3pkVFInInlJM6A8_yZvGq9E8JPTqHuI5rqAyyRhkrSE2Adm8JUeFtxKWmwaBeU7XCyL2lXCIUoH&_nc_zt=23&_nc_ht=scontent.fbkk5-6.fna&_nc_gid=ImuAvhgRX7iON2hONso7yA&_nc_ss=8&oh=00_AfwmY3hXAndogDyOqa81ILq7D0w1zO-_UrH1wB93u_kgrg&oe=69B4109D',
  //   },
  //   {
  //     id: 2,
  //     tag: 'ข่าวรับสมัครงาน-ประชาสัมพันธ์',
  //     isLatest: true,
  //     isPinned: true,
  //     title: 'กิจกรรมประกวดคลิปสั้น Green Creator ทิ้ง เทิร์น ให้โลกจำ ค้นหา Content Creator รุ่นใหม่',
  //     date: '19 สิงหาคม 2568',
  //     description: 'เชิญชวนนักศึกษาเข้าร่วมประกวดสร้างสรรค์คอนเทนต์รักษ์โลก พร้อมชิงรางวัลมากมาย...',
  //     image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop',
  //   },
  //   {
  //     id: 3,
  //     tag: 'ข่าวทุนการศึกษา',
  //     isLatest: true,
  //     isPinned: true,
  //     title: 'ประกาศ เรื่องการให้ทุนการศึกษาประเภทลดหย่อนค่าเล่าเรียน ประจำภาคเรียนที่ 2 ปีการศึกษา 2568',
  //     date: '4 พฤศจิกายน 2568',
  //     description: 'รายละเอียดการสมัครและเกณฑ์การคัดเลือกนักศึกษาเพื่อรับทุนลดหย่อนค่าเล่าเรียน...',
  //     image: 'https://scontent.fbkk5-5.fna.fbcdn.net/v/t39.30808-6/600332207_1392804229300325_5930956469706326122_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=13d280&_nc_ohc=nelY3RxZWq0Q7kNvwHq-Ruu&_nc_oc=Adn8mEn0LlAuq1zXukF1XSqS3N2HRQ4lhAT_oIAU94CJEGEqkrHZfNGboEWho15aeE2JdogGGcF_yoQu2A8avaaF&_nc_zt=23&_nc_ht=scontent.fbkk5-5.fna&_nc_gid=_Q6DFBBGioGLpG9C_1E6VA&_nc_ss=8&oh=00_AfxByXxJjqD3R8-D_OksGqkaz6dOY4bI1KQQHITjXOzMmQ&oe=69B432C2',
  //   },
  //   {
  //     id: 4,
  //     tag: 'ข่าวรับสมัครงาน-ประชาสัมพันธ์',
  //     isLatest: false,
  //     isPinned: false,
  //     title: 'บริษัทโทรคมนาคมแห่งชาติ จำกัด (มหาชน) เปิดรับสมัครงาน จำนวน 82 อัตรา',
  //     date: '12 สิงหาคม 2568',
  //     description: 'โอกาสร่วมงานกับหน่วยงานรัฐวิสาหกิจชั้นนำ เปิดรับหลายตำแหน่งสำหรับนักศึกษาจบใหม่...',
  //     image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=2070&auto=format&fit=crop',
  //   },
  // ];

  const tabs = useMemo(() => {
    if (lang === 'EN') {
      return [
        { key: 'ล่าสุด', label: 'Latest' },
        { key: 'ข่าวภาควิชาฯ', label: 'Department' },
        { key: 'ข่าวคณะและมหาวิทยาลัย', label: 'Faculty & University' },
        { key: 'ข่าวทุนการศึกษา', label: 'Scholarships' },
        { key: 'ข่าวรับสมัครงาน-ประชาสัมพันธ์', label: 'Jobs & PR' },
      ];
    }
    return [
      { key: 'ล่าสุด', label: 'ล่าสุด' },
      { key: 'ข่าวภาควิชาฯ', label: 'ข่าวภาควิชาฯ' },
      { key: 'ข่าวคณะและมหาวิทยาลัย', label: 'ข่าวคณะและมหาวิทยาลัย' },
      { key: 'ข่าวทุนการศึกษา', label: 'ข่าวทุนการศึกษา' },
      { key: 'ข่าวรับสมัครงาน-ประชาสัมพันธ์', label: 'ข่าวรับสมัครงาน-ประชาสัมพันธ์' },
    ];
  }, [lang]);

  // 🔍 Logic การกรองและเรียงลำดับ (Sorting) พร้อมระบบปักหมุด
  const filteredNews = useMemo(() => {
    const filtered = newsData.filter((news) => {
      const matchesTab = activeTab === 'ล่าสุด'
        ? news.isLatest === true
        : news.tag === activeTab;

      const currentTitle = (lang === 'EN' && news.title_en) ? news.title_en : news.title;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = currentTitle.toLowerCase().includes(searchLower) || news.title.toLowerCase().includes(searchLower);
      return matchesTab && matchesSearch;
    });

    // ✨ เรียงลำดับ: ข่าวปักหมุดขึ้นก่อน ตามด้วยวันที่เผยแพร่ล่าสุด (start_date หรือ created_at)
    return [...filtered].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
      const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
      return timeB - timeA;
    });
  }, [activeTab, searchQuery, newsData, lang]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-left text-slate-800">

      {/* 🏛️ Official Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              {lang === 'EN' ? 'News & Announcements' : 'ข่าวสาร CIS'}
            </h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto w-full px-6 md:px-10 py-12 flex-grow">

        {/* 🔍 Navigation (Tabs) & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide w-full md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)} // ✨ ใช้ฟังก์ชันที่อัปเดต URL ด้วย
                className={`px-7 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer
                  ${activeTab === tab.key
                    ? 'bg-[#3F51B5] text-white shadow-lg shadow-indigo-100'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3F51B5] transition-colors" size={20} />
            <input
              type="text"
              placeholder={lang === 'EN' ? "Search news..." : "ค้นหาข่าว..."}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border border-slate-100 focus:outline-none focus:ring-4 focus:ring-[#3F51B5]/5 bg-white shadow-sm transition-all text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 📰 News Grid Section */}
        <AnimatePresence mode="wait">
          {filteredNews.length > 0 ? (
            <motion.div
              key={activeTab + searchQuery + lang}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20"
            >
              {filteredNews.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -12 }}
                  className={`bg-white rounded-[32px] overflow-hidden shadow-sm transition-all duration-500 flex flex-col group
                    ${item.isPinned ? 'border-2 border-[#3F51B5]/20 shadow-indigo-50' : 'border border-slate-100'}`}
                >
                  <div className="relative aspect-[3/2] w-full overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>

                    <div className="absolute top-6 left-6 bg-[#3F51B5] text-white text-[10px] px-4 py-2 rounded-xl font-bold shadow-xl flex items-center backdrop-blur-md border border-white/20">
                      <Tag size={12} className="mr-2" /> {getCategoryLabel(item.category, lang)}
                    </div>

                    {item.isPinned && (
                      <div className="absolute top-6 right-6 bg-white/90 text-[#3F51B5] text-[10px] px-3 py-1.5 rounded-lg font-bold shadow-sm backdrop-blur-sm uppercase tracking-widest border border-[#3F51B5]/10">
                        Pinned
                      </div>
                    )}
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center text-slate-400 text-xs mb-4 font-bold tracking-wide uppercase">
                      <Clock size={14} className="mr-2 text-[#3F51B5]/60" />
                      {lang === 'EN' ? `Published : ${formatNewsDate(item.rawDate, 'EN')}` : `ประกาศเมื่อ : ${item.date}`}
                      {lang === 'EN' && !item.title_en && (
                        <span className="ml-2 px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          TH only
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-[1.5] mb-4 group-hover:text-[#3F51B5] transition-colors line-clamp-2">
                      {lang === 'EN' && item.title_en ? item.title_en : item.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-normal opacity-80">
                      {lang === 'EN' && item.description_en ? item.description_en : item.description}
                    </p>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                      <button
                        onClick={() => navigate(`/news/${item.id}`)} className="text-[#3F51B5] text-sm font-bold flex items-center gap-2 group/btn active:scale-95 transition-all">
                        {lang === 'EN' ? 'Read More' : 'อ่านรายละเอียดเพิ่มเติม'}
                        <ArrowRightCircle size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-40 bg-white rounded-[40px] border border-dashed border-slate-200"
            >
              <div className="p-10 inline-block bg-slate-50 rounded-full mb-6">
                <Newspaper className="text-slate-300" size={48} />
              </div>
              <p className="text-slate-500 text-xl font-medium">
                {lang === 'EN' ? 'No news found matching your search.' : 'ไม่พบข้อมูลข่าวสารที่คุณกำลังค้นหา'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}