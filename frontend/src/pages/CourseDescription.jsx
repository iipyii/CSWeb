import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Footer from "../components/Footer";

export default function CourseDescription() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. กำหนดข้อมูลหลักสูตรและปีที่เกี่ยวข้องแยกตามประเภท
  const curriculumData = {
    "bachelor-normal": {
      label: "ปริญญาตรี ภาคปกติ",
      years: ["2559", "2564"]
    },
    "bachelor-inter": {
      label: "ปริญญาตรี โครงการพิเศษ สองภาษา",
      years: ["2564"]
    },
    "master-cs": {
      label: "ปริญญาโท สาขาวิทยาการคอมพิวเตอร์",
      years: ["2562", "2567"]
    },
    "master-se": {
      label: "ปริญญาโท สาขาวิชาวิศวกรรมซอฟต์แวร์",
      years: ["2559"]
    },
    "doctor-cs": {
      label: "ปริญญาเอก สาขาวิชาวิทยาการคอมพิวเตอร์",
      years: ["2559", "2564"]
    }
  };

  useEffect(() => {
    setSelectedYear("");
  }, [selectedDegree]);

  const parseCourseContent = (rawData) => {
    // 💡 เปลี่ยนมาใช้ Map เพื่อกันข้อมูลรหัสวิชาซ้ำกัน
    let subjectMap = new Map();

    rawData.forEach((section) => {
      const year = section.version?.year?.toString() || "ไม่ระบุปี";
      let degree = "bachelor-normal"; 

      const courseBlocks = section.content.split(/(?=\b\d{9}\b)/);

      courseBlocks.forEach(block => {
        block = block.trim();
        if (!block.match(/^\d{9}/)) return; 

        try {
          const code = block.substring(0, 9);
          const creditMatch = block.match(/\d\(\d-\d-\d\)/);
          const credit = creditMatch ? creditMatch[0] : "ไม่ระบุหน่วยกิต";

          const firstLine = block.split('\n')[0];
          const titleTH = firstLine.replace(code, '').replace(credit, '').trim();

          const titleENMatch = block.match(/\((.*?)\)/);
          const titleEN = titleENMatch ? titleENMatch[1] : "";

          const prereqMatchTH = block.match(/วิชาบังคับก่อน\s*:\s*(.+)/);
          let prerequisite = prereqMatchTH ? prereqMatchTH[1].trim() : "ไม่มี";

          let descriptionTH = block;
          descriptionTH = descriptionTH.replace(firstLine, ''); 
          if (titleENMatch) descriptionTH = descriptionTH.replace(titleENMatch[0], ''); 
          if (prereqMatchTH) descriptionTH = descriptionTH.replace(prereqMatchTH[0], ''); 
          
          const prereqMatchEN = descriptionTH.match(/Prerequisite\s*:\s*(.+)/);
          if (prereqMatchEN) descriptionTH = descriptionTH.replace(prereqMatchEN[0], '');

          descriptionTH = descriptionTH.trim().replace(/\n/g, ' '); 

          // 🚨 ไฮไลต์ของงานนี้: ตรวจสอบตัวซ้ำ
          const existingSubject = subjectMap.get(code);
          
          // ถ้ายังไม่เคยมีวิชานี้ หรือ วิชานี้มีอยู่แล้วแต่ "คำอธิบายอันใหม่ยาวกว่า" (อันสั้นคือสารบัญ อันยาวคือคำอธิบายจริง)
          if (!existingSubject || descriptionTH.length > existingSubject.descriptionTH.length) {
              subjectMap.set(code, {
                code,
                degree,
                year,
                titleTH,
                titleEN,
                credit,
                prerequisite,
                descriptionTH: descriptionTH || "ไม่มีคำอธิบาย",
                descriptionEN: "" 
              });
          }
        } catch (e) {
            console.error("Error parsing block:", block, e);
        }
      });
    });

    // คืนค่าเป็น Array ออกไป
    return Array.from(subjectMap.values());
  };

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      // 💡 ส่ง year ต่อท้ายไปด้วย (ถ้าผู้ใช้มีการเลือกปีจาก Dropdown)
      let url = `http://localhost:5000/api/program-sections/search-courses?keyword=${searchTerm}`;
      if (selectedYear) {
          url += `&year=${selectedYear}`;
      }

      const response = await axios.get(url);
      const formattedData = parseCourseContent(response.data);
      setSubjects(formattedData);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      fetchCourses();
    }
  };

  const filteredSubjects = subjects.filter((item) => {
    const matchesSearch = 
      item.titleTH.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.code.includes(searchTerm);
    const matchesDegree = selectedDegree === "" || item.degree === selectedDegree;
    const matchesYear = selectedYear === "" || item.year === selectedYear;
    
    return matchesSearch && matchesDegree && matchesYear;
  });

  return (
    <div className="bg-[#f8fafc] font-['Prompt'] min-h-screen flex flex-col">
      <div className="max-w-[1200px] mx-auto w-full px-6 md:px-10 pt-16 pb-12 flex-grow text-left">
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center mb-10 border-l-[6px] border-[#3F51B5] pl-5"
        >
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight uppercase">
            คำอธิบายรายวิชา
          </h1>
        </motion.div>

        {/* 🔍 Search & Multi-Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-10 w-full max-w-[1100px]">
          
          <div className="md:col-span-5 relative group flex gap-2">
            <div className="relative w-full">
                <input
                type="text"
                placeholder="ค้นหารายวิชา หรือ รหัสวิชา (กด Enter เพื่อค้นหา)"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-[#3F51B5] focus:border-transparent transition-all outline-none text-sm text-slate-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchSubmit}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#3F51B5] transition-colors" size={16} />
            </div>
          </div>

          <div className="md:col-span-4 relative">
            <select 
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="w-full appearance-none pl-5 pr-10 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm outline-none text-sm text-slate-500 cursor-pointer focus:ring-2 focus:ring-[#3F51B5]"
            >
              <option value="">เลือกหลักสูตรทั้งหมด</option>
              {Object.keys(curriculumData).map((key) => (
                <option key={key} value={key}>{curriculumData[key].label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <div className="md:col-span-3 relative">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              disabled={!selectedDegree}
              className={`w-full appearance-none pl-5 pr-10 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm outline-none text-sm transition-all
                ${!selectedDegree 
                  ? "opacity-50 cursor-not-allowed bg-gray-50 text-slate-400" 
                  : "text-slate-500 cursor-pointer focus:ring-2 focus:ring-[#3F51B5]"
                }`}
            >
              <option value="">ปีหลักสูตร (ทั้งหมด)</option>
              {selectedDegree && curriculumData[selectedDegree].years.map((year) => (
                <option key={year} value={year}>พ.ศ. {year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* สถานะกำลังโหลด */}
        {isLoading && (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3F51B5]"></div>
            </div>
        )}

        {/* รายการรายวิชา */}
        {!isLoading && (
        <div className="space-y-8 mb-20 min-h-[400px]">
          <AnimatePresence mode="wait">
            {filteredSubjects.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {filteredSubjects.map((item, index) => (
                  <div key={`${item.code}-${index}`} className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="bg-[#ECEFFF] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                        <span className="text-base font-bold text-[#3F51B5] tracking-wider">{item.code}</span>
                        <div className="flex flex-col text-left">
                          <h2 className="text-lg font-bold text-slate-800 leading-tight">{item.titleTH}</h2>
                          {item.titleEN && <p className="text-slate-500 text-xs font-light uppercase italic">({item.titleEN})</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 md:mt-0">
                        <span className="px-3 py-1 bg-white/60 rounded-full text-slate-500 text-[10px] font-bold border border-slate-200">
                           {curriculumData[item.degree]?.label} (ปี {item.year})
                        </span>
                        <span className="px-4 py-1.5 bg-white rounded-full text-[#3F51B5] text-sm font-bold shadow-sm border border-blue-50 whitespace-nowrap">
                          {item.credit}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 text-sm">
                      <div className="flex flex-col md:flex-row md:gap-10">
                        <div>
                          <h3 className="text-slate-700 font-bold mb-1 underline underline-offset-4 decoration-[#3F51B5]/30">วิชาบังคับก่อน</h3>
                          <p className="text-slate-600">{item.prerequisite}</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <h3 className="text-slate-700 font-bold mb-1 underline underline-offset-4 decoration-[#3F51B5]/30">Prerequisite</h3>
                          <p className="text-slate-500 italic">{item.prerequisite === "ไม่มี" || item.prerequisite === "None" ? "None" : item.prerequisite}</p>
                        </div>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-gray-50 leading-relaxed text-left">
                        <p className="text-slate-600 indent-10">{item.descriptionTH}</p>
                        {item.descriptionEN && <p className="text-slate-500 indent-10 font-light italic">{item.descriptionEN}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="inline-block p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
                   <p className="text-slate-400 font-medium">ไม่พบข้อมูลรายวิชาที่ตรงกับเงื่อนไขการค้นหา</p>
                   <button 
                    onClick={() => {
                        setSearchTerm(""); 
                        setSelectedDegree(""); 
                        setSelectedYear("");
                        fetchCourses();
                    }}
                    className="mt-4 text-[#3F51B5] text-sm font-bold hover:underline"
                   >
                     ล้างตัวกรองทั้งหมด
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        )}
      </div>
      <Footer />
    </div>
  );
}