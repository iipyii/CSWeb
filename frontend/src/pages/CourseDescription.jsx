import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";

export default function CourseDescription() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

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

  // 2. ข้อมูลรายวิชาตัวอย่าง
  const subjects = [
    {
      code: "040613100",
      degree: "bachelor-normal",
      year: "2565",
      titleTH: "พื้นฐานวิทยาการคอมพิวเตอร์และประเด็นทางวิชาชีพ",
      titleEN: "Fundamental of Computer Science and Professional Issue",
      credit: "3(3-0-6)",
      prerequisite: "ไม่มี",
      descriptionTH: "องค์ประกอบพื้นฐานของคอมพิวเตอร์ ระบบจำนวน ระบบเครือข่าย ระบบปฏิบัติการคอมพิวเตอร์ ระบบฐานข้อมูล การประมวลผลแบบคลาวด์ การเขียนผังงานและรหัสจำลอง กระบวนทัศน์การโปรแกรม อาชีพในสายคอมพิวเตอร์ นโยบายสิทธิความเป็นส่วนตัว",
      descriptionEN: "Fundamental component of computer system; number system; network system; operating system; database system; cloud computing; flowchart and pseudocode; programming paradigm; computer career; privacy policy."
    },
    {
      code: "040623101",
      degree: "master-cs",
      year: "2567",
      titleTH: "ระเบียบวิธีวิจัยทางวิทยาการคอมพิวเตอร์",
      titleEN: "Research Methodology in Computer Science",
      credit: "3(3-0-9)",
      prerequisite: "ไม่มี",
      descriptionTH: "กระบวนการวิจัย การทบทวนวรรณกรรม การออกแบบการวิจัย การวิเคราะห์ข้อมูล และการเขียนบทความวิจัย",
      descriptionEN: "Research process; literature review; research design; data analysis; and research paper writing."
    }
  ];

  // 3. ล้างค่าปีหลักสูตรเมื่อมีการเปลี่ยนระดับปริญญา
  useEffect(() => {
    setSelectedYear("");
  }, [selectedDegree]);

  // 4. Logic การกรองข้อมูล
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
          
          {/* ช่องค้นหา */}
          <div className="md:col-span-5 relative group">
            <input
              type="text"
              placeholder="ค้นหารายวิชา หรือ รหัสวิชา"
              className="w-full pl-5 pr-10 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-[#3F51B5] focus:border-transparent transition-all outline-none text-sm text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#3F51B5] transition-colors" size={16} />
          </div>

<<<<<<< HEAD
          {/* ✅ แก้ไขส่วนนี้เป็นรายการปริญญาต่างๆ */}
          <div className="relative flex-1">
            <select className="w-full appearance-none pl-5 pr-10 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm outline-none text-sm text-slate-500 cursor-pointer focus:ring-2 focus:ring-[#3F51B5]">
              <option value="">เลือกหลักสูตร</option>
              <option value="bachelor">หลักสูตรปริญญาตรี</option>
              <option value="master">หลักสูตรปริญญาโท</option>
              <option value="doctor">หลักสูตรปริญญาเอก</option>
=======
          {/* เลือกหลักสูตร (Degree) */}
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

          {/* เลือกปีหลักสูตร (Dynamic Based on Degree) */}
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
>>>>>>> 319160892d9a4f6280c33d62c8585bacca217257
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* รายการรายวิชา */}
        <div className="space-y-8 mb-20 min-h-[400px]">
          <AnimatePresence mode="wait">
            {filteredSubjects.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {filteredSubjects.map((item) => (
                  <div key={item.code} className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="bg-[#ECEFFF] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                        <span className="text-base font-bold text-[#3F51B5] tracking-wider">{item.code}</span>
                        <div className="flex flex-col text-left">
                          <h2 className="text-lg font-bold text-slate-800 leading-tight">{item.titleTH}</h2>
                          <p className="text-slate-500 text-xs font-light uppercase italic">({item.titleEN})</p>
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
                          <p className="text-slate-500 italic">{item.prerequisite === "ไม่มี" ? "None" : item.prerequisite}</p>
                        </div>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-gray-50 leading-relaxed text-left">
                        <p className="text-slate-600 indent-10">{item.descriptionTH}</p>
                        <p className="text-slate-500 indent-10 font-light italic">{item.descriptionEN}</p>
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
                    onClick={() => {setSearchTerm(""); setSelectedDegree(""); setSelectedYear("");}}
                    className="mt-4 text-[#3F51B5] text-sm font-bold hover:underline"
                   >
                     ล้างตัวกรองทั้งหมด
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}