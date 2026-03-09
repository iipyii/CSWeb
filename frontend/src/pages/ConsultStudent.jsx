import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, GraduationCap, Mail, Filter, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";

export default function ConsultStudent() {
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const studentCategories = [
    {
      level: "bachelor",
      levelTh: "ระดับปริญญาตรี",
      years: ["68", "67", "66", "65", "64", "63", "62", "61", "60", "59", "58"],
    },
    {
      level: "master",
      levelTh: "ระดับปริญญาโท",
      years: ["68", "67", "66", "65", "64", "63", "62", "61", "60", "59"],
    },
    {
      level: "doctor",
      levelTh: "ระดับปริญญาเอก",
      years: ["68", "66", "62", "60", "59"],
    },
  ];

  const levelLabel = (level) => {
    if (level === "bachelor") return "ปริญญาตรี";
    if (level === "master") return "ปริญญาโท";
    if (level === "doctor") return "ปริญญาเอก";
    return "-";
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (keyword.trim() === "") {
        setResults([]);
        return;
      }

      setLoading(true);

      axios.get("http://localhost:5000/api/consult/search", {
  params: {
    q: keyword.trim(),
    level: levelFilter,
  },
})
        .then((res) => {
          setResults(res.data || []);
        })
        .catch((err) => {
          console.error(err);
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [keyword, levelFilter]);

  const groupedResults = useMemo(() => {
    return results.reduce((acc, item) => {
      const key = `${item.level}-${item.admission_year}`;
      if (!acc[key]) {
        acc[key] = {
          level: item.level,
          admission_year: item.admission_year,
          students: [],
        };
      }
      acc[key].students.push(item);
      return acc;
    }, {});
  }, [results]);

  return (
    <div className="bg-white font-['Prompt'] min-h-screen flex flex-col text-left">
      {/* Header */}
      <section className="bg-[#3F51B5] text-white py-10 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              อาจารย์ที่ปรึกษา
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-3xl leading-relaxed">
              ค้นหาจากชื่อ นามสกุล หรือรหัสนักศึกษา
            </p>
          </motion.div>
        </div>

        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-grow space-y-10">
        {/* Search Section */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Search className="text-[#3F51B5]" size={20} />
            <h2 className="text-xl font-bold text-slate-800">ค้นหารายชื่อนักศึกษา</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="พิมพ์ชื่อ นามสกุล หรือรหัสนักศึกษา"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none focus:border-[#3F51B5] focus:bg-white transition-all"
              />
            </div>

            <div className="relative">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none focus:border-[#3F51B5] focus:bg-white transition-all"
              >
                <option value="all">ทุกระดับการศึกษา</option>
                <option value="bachelor">ปริญญาตรี</option>
                <option value="master">ปริญญาโท</option>
                <option value="doctor">ปริญญาเอก</option>
              </select>
            </div>
          </div>

        
        </section>

        {/* Search Results */}
        <section className="space-y-6">
          {keyword.trim() !== "" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <Users size={18} className="text-[#3F51B5]" />
                <span>
                  ผลการค้นหา {loading ? "" : `(${results.length} รายการ)`}
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="border border-slate-200 rounded-2xl p-8 text-center text-slate-500 bg-slate-50">
              กำลังค้นหาข้อมูล...
            </div>
          )}

          {!loading && keyword.trim() !== "" && results.length === 0 && (
            <div className="border border-slate-200 rounded-2xl p-8 text-center text-slate-500 bg-slate-50">
              ไม่พบข้อมูลนักศึกษาที่ค้นหา
            </div>
          )}

          {!loading &&
            Object.values(groupedResults).map((group, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="bg-[#EEF2FF] px-5 py-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-[#3F51B5] font-bold">
                    <GraduationCap size={18} />
                    <span>
                      ระดับ{levelLabel(group.level)} • รหัส {String(group.admission_year).slice(-2)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {group.students.map((student, idx) => (
                    <div
                      key={idx}
                      className="p-5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        <div className="lg:col-span-4">
                          <p className="text-xs text-slate-400 mb-1">นักศึกษา</p>
                          <h3 className="font-bold text-slate-800 text-base">
                            {student.title}
                            {student.firstname} {student.lastname}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            รหัสนักศึกษา {student.student_id}
                          </p>
                        </div>

                        <div className="lg:col-span-2">
                          <p className="text-xs text-slate-400 mb-1">ห้อง</p>
                          <p className="text-sm font-medium text-slate-700">
                            {student.room || "-"}
                          </p>
                        </div>

                        <div className="lg:col-span-4">
                          <p className="text-xs text-slate-400 mb-1">อาจารย์ที่ปรึกษา</p>
                          <p className="text-sm font-semibold text-[#3F51B5]">
                            {student.advisor?.fullname_th || "-"}{" "}
                            {student.advisor?.lecturer_code
                              ? `(${student.advisor.lecturer_code})`
                              : ""}
                          </p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 break-all">
                            <Mail size={12} />
                            {student.advisor?.email || "-"}
                          </p>
                        </div>

                        <div className="lg:col-span-2 flex lg:justify-end">
                          <Link
                            to={`/consult-detail/${student.level}/${String(
                              student.admission_year
                            ).slice(-2)}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-[#3F51B5] hover:text-[#2f3f9f] transition-colors"
                          >
                            ดูกลุ่มอาจารย์
                            <ExternalLink size={16} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </section>

        {/* Browse by year */}
        <section className="pt-4">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              เลือกดูตามระดับและรหัสนักศึกษา
            </h2>
            <p className="text-sm text-slate-500">
              สำหรับการเปิดดูข้อมูลแบบแยกตามรุ่นปี
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {studentCategories.map((cat, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white"
              >
                <div className="bg-[#3F51B5] text-white py-4 px-5 text-center font-bold">
                  {cat.levelTh}
                </div>

                <div className="p-4 flex flex-wrap gap-3">
                  {cat.years.map((year, yIdx) => (
                    <Link
                      key={yIdx}
                      to={`/consult-detail/${cat.level}/${year}`}
                      className="px-4 py-2 rounded-full text-sm border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-[#3F51B5] hover:text-[#3F51B5] transition-all"
                    >
                      รหัส {year}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}