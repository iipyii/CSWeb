import React, { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import Footer from "../components/Footer";

export default function CourseDescription() {
  const [searchTerm, setSearchTerm] = useState("");

  const subjects = [
    {
      code: "040613100",
      titleTH: "พื้นฐานวิทยาการคอมพิวเตอร์และประเด็นทางวิชาชีพ",
      titleEN: "Fundamental of Computer Science and Professional Issue",
      credit: "3(3-0-6)",
      prerequisite: "ไม่มี",
      descriptionTH: "องค์ประกอบพื้นฐานของคอมพิวเตอร์ ระบบจำนวน ระบบเครือข่าย ระบบปฏิบัติการคอมพิวเตอร์ ระบบฐานข้อมูล การประมวลผลแบบคลาวด์ การเขียนผังงานและรหัสจำลอง กระบวนทัศน์การโปรแกรม อาชีพในสายคอมพิวเตอร์ นโยบายสิทธิความเป็นส่วนตัว",
      descriptionEN: "Fundamental component of computer system; number system; network system; operating system; database system; cloud computing; flowchart and pseudocode; programming paradigm; computer career; privacy policy."
    },
    {
      code: "040613103",
      titleTH: "คณิตศาสตร์ดิสครีตสำหรับวิทยาการคอมพิวเตอร์",
      titleEN: "Discrete Mathematics for Computer Science",
      credit: "3(3-0-6)",
      prerequisite: "ไม่มี",
      descriptionTH: "เซตและการพิสูจน์ ตรรกะ ความสัมพันธ์ ฟังก์ชัน ขั้นตอนวิธี ความสัมพันธ์แบบเวียนเกิด ทฤษฎีกราฟ",
      descriptionEN: "Set and proof; logic; relation; function; algorithm; recurrence relation; graph theory."
    }
  ];

  return (
    <div className="bg-[#f8fafc] font-['Prompt'] min-h-screen flex flex-col">
      {/* ส่วนเนื้อหาหลัก */}
      <div className="max-w-[1200px] mx-auto w-full px-10 pt-16 pb-12 flex-grow">
        
        {/* หัวข้อคำอธิบายรายวิชาแบบมีเส้นข้าง */}
        <div className="flex items-center mb-10 border-l-[6px] border-[#3F51B5] pl-5">
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight uppercase">
            คำอธิบายรายวิชา
          </h1>
        </div>

        {/* Search & Filter Bar ขนาดกะทัดรัด */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-[800px]">
          <div className="relative flex-[2] group">
            <input
              type="text"
              placeholder="ค้นหารายวิชา หรือ รหัสวิชา"
              className="w-full pl-5 pr-10 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-[#3F51B5] focus:border-transparent transition-all outline-none text-sm text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#3F51B5] transition-colors" size={16} />
          </div>

          {/* ✅ แก้ไขส่วนนี้เป็นรายการปริญญาต่างๆ */}
          <div className="relative flex-1">
            <select className="w-full appearance-none pl-5 pr-10 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm outline-none text-sm text-slate-500 cursor-pointer focus:ring-2 focus:ring-[#3F51B5]">
              <option value="">เลือกรหลักสูตร</option>
              <option value="bachelor">หลักสูตรปริญญาตรี</option>
              <option value="master">หลักสูตรปริญญาโท</option>
              <option value="doctor">หลักสูตรปริญญาเอก</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* รายการรายวิชา */}
        <div className="space-y-8 mb-20">
          {subjects.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300">
              
              {/* Card Header */}
              <div className="bg-[#ECEFFF] px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                  <span className="text-base font-bold text-[#3F51B5] tracking-wider">{item.code}</span>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 leading-tight">{item.titleTH}</h2>
                    <p className="text-slate-500 text-xs font-light">({item.titleEN})</p>
                  </div>
                </div>
                <span className="mt-3 md:mt-0 px-3 py-1 bg-white rounded-full text-[#3F51B5] text-sm font-bold shadow-sm border border-blue-50 whitespace-nowrap">
                  {item.credit}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 text-sm">
                <div>
                  <h3 className="text-slate-700 font-bold mb-1">วิชาบังคับก่อน : {item.prerequisite}</h3>
                  <p className="text-slate-400 text-s ">Prerequisite : None</p>
                </div>
                <div className="space-y-3 pt-2 border-t border-gray-50 leading-relaxed">
                  <p className="text-slate-600 indent-10">{item.descriptionTH}</p>
                  <p className="text-slate-500 indent-10 font-light">{item.descriptionEN}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}