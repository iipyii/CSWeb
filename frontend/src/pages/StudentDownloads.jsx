import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, ChevronDown } from "lucide-react";
import Footer from "../components/Footer";

export default function StudentDownloads() {
  const [openSection, setOpenSection] = useState("project");

  const downloadData = [
    {
      id: "project",
      title: "โครงงานพิเศษ, ปริญญานิพนธ์",
      files: [
        { name: "คพ.01 - แบบฟอร์มเสนอหัวข้อโครงงานพิเศษ", doc: "#", pdf: "#" },
        { name: "คพ.02 - แบบฟอร์มขอสอบโครงงานพิเศษ 1", doc: "#", pdf: "#" },
        { name: "คพ.03 - แบบฟอร์มขอสอบปริญญานิพนธ์", doc: "#", pdf: "#" },
        { name: "คพ.04 - หนังสือรับรองการทดสอบโครงงานพิเศษ", doc: "#", pdf: "#" },
        { name: "ใบตรวจปริญญานิพนธ์", doc: "#", pdf: "#" },
      ]
    },
    {
      id: "internship",
      title: "การฝึกงานและสหกิจศึกษา",
      files: [
        { name: "แบบฟอร์มขอฝึกงาน", doc: "#", pdf: "#" },
        { name: "บันทึกแจ้งผลการตอบรับนิสิตฝึกงาน", doc: "#", pdf: "#" },
      ]
    },
    {
      id: "graduate",
      title: "ระดับบัณฑิตศึกษา",
      files: [
        { name: "คำร้องขอสอบวิทยานิพนธ์", doc: "#", pdf: "#" },
      ]
    }
  ];

  return (
    <div className="bg-[#f8fafc] font-['Prompt'] min-h-screen flex flex-col">
      {/* ส่วนเนื้อหาหลักที่ปรับปรุงใหม่ */}
      <div className="max-w-[1200px] mx-auto w-full px-10 pt-16 pb-12 flex-grow">
        
        {/* ✅ เปลี่ยนจาก Banner เป็นหัวข้อแบบเส้นข้างสีน้ำเงิน */}
        <div className="flex items-center mb-12 border-l-[6px] border-[#3F51B5] pl-5">
          <h1 className="text-3xl font-bold text-[#1e293b] tracking-tight uppercase">
            แบบฟอร์มดาวน์โหลดสำหรับนักศึกษา
          </h1>
        </div>

        {/* Accordion List */}
        <div className="space-y-6">
          {downloadData.map((section) => (
            <div key={section.id} className="bg-white rounded-[28px] overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-gray-50">
              <button 
                onClick={() => setOpenSection(openSection === section.id ? "" : section.id)}
                className="w-full px-10 py-7 flex items-center justify-between hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center space-x-5">
                  <div className={`p-3 rounded-2xl transition-all duration-300 ${openSection === section.id ? 'bg-[#3F51B5] text-white' : 'bg-slate-100 text-[#3F51B5]'}`}>
                    <FileText size={24} />
                  </div>
                  <span className={`text-xl font-bold tracking-wide transition-colors ${openSection === section.id ? 'text-[#3F51B5]' : 'text-slate-700'}`}>
                    {section.title}
                  </span>
                </div>
                <div className={`transition-transform duration-500 ${openSection === section.id ? 'rotate-180' : ''}`}>
                  <ChevronDown size={24} className="text-slate-300" />
                </div>
              </button>

              {openSection === section.id && (
                <div className="px-10 pb-8 animate-in slide-in-from-top duration-500">
                  <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-sm font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-8 py-4 w-16 text-center">ลำดับ</th>
                          <th className="px-4 py-4">ชื่อเอกสาร</th>
                          <th className="px-8 py-4 text-center w-64">ไฟล์</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {section.files.map((file, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-8 py-5 text-slate-400 font-medium text-center">{idx + 1}</td>
                            <td className="px-4 py-5 text-slate-700 font-medium">{file.name}</td>
                            <td className="px-8 py-5">
                              <div className="flex items-center justify-center space-x-3">
                                <a href={file.doc} className="flex items-center px-4 py-2 bg-[#4CAF50] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-green-600 transition-all hover:-translate-y-0.5 uppercase">
                                  .doc
                                </a>
                                <a href={file.pdf} className="flex items-center px-4 py-2 bg-[#00bcd4] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-cyan-600 transition-all hover:-translate-y-0.5 uppercase">
                                  .pdf
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}