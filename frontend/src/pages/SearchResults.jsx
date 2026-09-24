import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Compass, FolderGit2, BookOpen, Users, Newspaper, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Footer from '../components/Footer';

export default function SearchResults() {
  const query = new URLSearchParams(useLocation().search).get('q') || "";
  const { t } = useLanguage();

  const [results, setResults] = useState({ 
    menus: [], 
    projects: [], 
    news: [], 
    lecturers: [], 
    courses: [], 
    downloads: [] 
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
        setResults({
          menus: response.data.menus || [],
          projects: response.data.projects || [],
          news: response.data.news || [],
          lecturers: response.data.lecturers || [],
          courses: response.data.courses || [],
          downloads: response.data.downloads || []
        });
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  const hasResults = 
    (results.menus?.length > 0) ||
    (results.projects?.length > 0) ||
    (results.news?.length > 0) ||
    (results.lecturers?.length > 0) ||
    (results.courses?.length > 0) ||
    (results.downloads?.length > 0);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col justify-between">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-12 w-full flex-grow">
        
        {/* Header / Query badge */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            Search
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {t('search_title')} <span className="text-indigo-600">"{query}"</span>
          </h1>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-slate-500 text-sm">กำลังค้นหาข้อมูล...</p>
          </div>
        ) : !hasResults && query ? (
          /* Empty State */
          <div className="bg-white p-16 md:p-24 rounded-2xl text-center shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Compass size={32} />
            </div>
            <p className="text-xl font-medium text-slate-700 mb-2">{t('search_no_results')}</p>
            <p className="text-sm text-slate-400">ลองค้นหาด้วยคำสำคัญอื่น เช่น "โครงงาน", "หลักสูตร", "อาจารย์", หรือ "ทุนการศึกษา"</p>
          </div>
        ) : (
          <div className="space-y-12">

            {/* 🔗 1. หมวดหมู่เมนู / ทางลัดหน้าเว็บ */}
            {results.menus?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 border-b-2 border-indigo-100 pb-3 mb-6">
                  <Compass className="text-indigo-600" size={22} />
                  <h2 className="text-xl font-bold text-gray-800">
                    {t('search_menu_section')}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 ml-2">
                    {results.menus.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.menus.map((m, idx) => (
                    m.isExternal ? (
                      <a 
                        key={`menu-${idx}`} 
                        href={m.url || m.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-white p-5 rounded-2xl shadow-xs hover:shadow-md border border-slate-100 hover:border-indigo-400 transition-all group flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">{t('menu')} / ลิงก์ภายนอก</span>
                          <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mt-1">{m.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">{m.category}</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                      </a>
                    ) : (
                      <Link 
                        key={`menu-${idx}`} 
                        to={m.url || m.path}
                        className="bg-white p-5 rounded-2xl shadow-xs hover:shadow-md border border-slate-100 hover:border-indigo-400 transition-all group flex items-center justify-between"
                      >
                        <div>
                          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider">{t('menu')}</span>
                          <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mt-1">{m.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">{m.category}</p>
                        </div>
                        <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                      </Link>
                    )
                  ))}
                </div>
              </section>
            )}

            {/* 📁 2. หมวดโครงงานนักศึกษา */}
            {results.projects?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 border-b-2 border-indigo-100 pb-3 mb-6">
                  <FolderGit2 className="text-indigo-600" size={22} />
                  <h2 className="text-xl font-bold text-gray-800">
                    {t('search_projects_section')}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 ml-2">
                    {results.projects.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.projects.map((p) => (
                    <Link 
                      key={`proj-${p.id}`} 
                      to={`/student-projects/${p.id}`}
                      className="bg-white p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-400 border border-slate-100 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                            {t('project')}
                          </span>
                          {(p.year || p.academic_year) && (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              ปี {p.year || p.academic_year} {p.semester ? `(ภาค ${p.semester})` : ''}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {p.title_th}
                        </h3>
                        {p.title_en && (
                          <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">{p.title_en}</p>
                        )}
                        {p.abstract && (
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2 font-light">{p.abstract}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-500 flex items-center justify-between">
                        <span className="truncate">
                          {p.advisor?.fullname_th ? `ที่ปรึกษา: ${p.advisor.fullname_th}` : 'คลิกเพื่อดูรายละเอียดโครงงาน'}
                        </span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 📚 3. หมวดคำอธิบายรายวิชา */}
            {results.courses?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 border-b-2 border-indigo-100 pb-3 mb-6">
                  <BookOpen className="text-indigo-600" size={22} />
                  <h2 className="text-xl font-bold text-gray-800">
                    {t('search_courses_section')}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 ml-2">
                    {results.courses.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.courses.map(course => (
                    <Link 
                      to={`/course-description?q=${encodeURIComponent(course.subject_code || course.title_th || course.title || '')}`} 
                      key={`course-${course.id}`} 
                      className="bg-white p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-400 border border-slate-100 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">
                            {course.subject_code || 'รายวิชา'}
                          </span>
                          {course.credit && (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {course.credit} หน่วยกิต
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {course.title_th || course.title || course.title_en}
                        </h3>
                        {course.title_en && course.title_th && (
                          <p className="text-xs text-slate-400 italic mt-1 line-clamp-1">{course.title_en}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-500 flex items-center justify-between">
                        <span className="text-slate-400">
                          {course.category || (course.curriculum_year ? `หลักสูตรปี ${course.curriculum_year}` : 'ดูคำอธิบายรายวิชา')}
                        </span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 👥 4. หมวดบุคลากร / อาจารย์ */}
            {results.lecturers?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 border-b-2 border-indigo-100 pb-3 mb-6">
                  <Users className="text-indigo-600" size={22} />
                  <h2 className="text-xl font-bold text-gray-800">
                    {t('search_lecturers_section')}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 ml-2">
                    {results.lecturers.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.lecturers.map(person => (
                    <Link 
                      to={person.lecturer_code ? `/administrator/${person.lecturer_code}` : `/administrator`} 
                      key={`person-${person.id}`} 
                      className="bg-white p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-400 border border-slate-100 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                            {t('nav_personnel')}
                          </span>
                          {person.lecturer_code && (
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                              {person.lecturer_code}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                          {person.fullname_th}
                        </h3>
                        {person.fullname_en && (
                          <p className="text-xs text-slate-400 mt-0.5">{person.fullname_en}</p>
                        )}
                        {person.email && (
                          <p className="text-slate-500 text-xs mt-2 font-mono">{person.email}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400 flex items-center justify-between">
                        <span>{person.position_th || 'ดูประวัติและผลงานวิจัย'}</span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 📰 5. หมวดข่าวสาร */}
            {results.news?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 border-b-2 border-indigo-100 pb-3 mb-6">
                  <Newspaper className="text-indigo-600" size={22} />
                  <h2 className="text-xl font-bold text-gray-800">
                    {t('search_news_section')}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 ml-2">
                    {results.news.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.news.map(item => (
                    <Link 
                      to={`/news/${item.id}`} 
                      key={`news-${item.id}`} 
                      className="bg-white p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-400 border border-slate-100 transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                          {item.category || t('nav_news')}
                        </span>
                        <h3 className="text-base font-bold mt-2.5 text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400 flex items-center justify-between">
                        <span>{item.created_at ? new Date(item.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'อ่านข่าวสาร'}</span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 📄 6. หมวดเอกสารดาวน์โหลด */}
            {results.downloads?.length > 0 && (
              <section>
                <div className="flex items-center gap-2 border-b-2 border-indigo-100 pb-3 mb-6">
                  <FileText className="text-indigo-600" size={22} />
                  <h2 className="text-xl font-bold text-gray-800">
                    {t('search_downloads_section')}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 ml-2">
                    {results.downloads.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.downloads.map(doc => {
                    const downloadHref = doc.file_url || (doc.file_path ? `http://localhost:5000/uploads/downloads/${doc.file_path}` : `http://localhost:5000/api/downloads/download/${doc.id}`);
                    return (
                      <a 
                        href={downloadHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={`doc-${doc.id}`} 
                        className="bg-white p-6 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-400 border border-slate-100 transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                              {t('download')}
                            </span>
                            {doc.audience && (
                              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {doc.audience === 'staff' ? 'สำหรับบุคลากร' : 'สำหรับนักศึกษา'}
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {doc.title}
                          </h3>
                          {doc.category && (
                            <p className="text-xs text-slate-400 mt-2 font-medium">หมวดหมู่: {doc.category}</p>
                          )}
                          {doc.file_name && (
                            <p className="text-xs text-slate-400 font-mono mt-1 truncate">📄 {doc.file_name}</p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 text-xs font-bold text-[#3F51B5] group-hover:text-indigo-700 flex items-center justify-between">
                          <span>คลิกเพื่อเปิด / ดาวน์โหลดไฟล์</span>
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}