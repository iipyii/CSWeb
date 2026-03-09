import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight} from 'lucide-react';
import Footer from '../components/Footer';
import axios from "axios";

const downloadData = [
  {
    category: "โครงงานพิเศษ, ปริญญานิพนธ์",
    items: [
      { id: 1, title: "คพ.01 - แบบฟอร์มเสนอหัวข้อโครงงานพิเศษ", formats: ["DOC", "PDF"] },
      { id: 2, title: "คพ.02 - แบบฟอร์มขอสอบโครงงานพิเศษ 1", formats: ["DOC", "PDF"] },
      { id: 3, title: "คพ.03 - แบบฟอร์มขอสอบปริญญานิพนธ์", formats: ["DOC", "PDF"] },
      { id: 4, title: "คพ.04 - หนังสือรับรองการทดสอบโครงงานพิเศษ", formats: ["DOC", "PDF"] },
      { id: 5, title: "ใบตรวจปริญญานิพนธ์", formats: ["DOC", "PDF"] },
      { id: 6, title: "สมุดบันทึกการให้คำปรึกษาโครงงานพิเศษ (LogBook)", formats: ["DOC", "PDF"] },
      { id: 7, title: "สมุดบันทึกการให้คำปรึกษาโครงงานพิเศษ-v0.1", formats: ["DOC", "PDF"] },
      { id: 8, title: "บันทึกการยืนยันขอบเขตโครงงานกับอาจารย์ที่ปรึกษา", formats: ["DOC", "PDF"] },
      { id: 9, title: "Template ใบรับรองปริญญานิพนธ์ (กรรมการ 3 ท่าน)", formats: ["DOC"] },
      { id: 10, title: "Template ใบรับรองปริญญานิพนธ์ (กรรมการ 4 ท่าน)", formats: ["DOC"] },
      { id: 11, title: "Template ใบรับรองปริญญานิพนธ์ (สหกิจศึกษา) (กรรมการ 3 ท่าน )", formats: ["DOC"] },
      { id: 12, title: "Template ใบรับรองปริญญานิพนธ์ (สหกิจศึกษา) (กรรมการ 4 ท่าน )", formats: ["DOC"] },
    ]
  },
  {
    category: "โครงการสองภาษา(CSB)",
    items: [
      { id: 13, title: "ใบตรวจปริญญานิพนธ์ CSB", formats: ["DOC", "PDF"] },
      { id: 14, title: "CSB-A แบบฟอร์มแต่งตั้งอาจารย์ที่ปรึกษา", formats: ["DOC", "PDF"] },
      { id: 15, title: "CSB-01 แบบฟอร์มเสนอหัวข้อโครงงานพิเศษ", formats: ["PDF"] },
      { id: 16, title: "CSB-02 แบบฟอร์มขอสอบก้าวหน้า", formats: ["PDF"] },
      { id: 17, title: "CSB-03 แบบฟอร์มขอสอบป้องกัน", formats: ["DOC", "PDF"]},
      { id: 18, title: "CSB-04 หนังสือรับรองการทดสอบโครงงานพิเศษ", formats: ["DOC", "PDF"]},
      { id: 19, title: "CSB-06 รายงานผลการสอบก้าวหน้าปริญญานิพนธ์วิชาโครงงานพิเศษ", formats: ["DOC", "PDF"] },
      { id: 20, title: "CSB-07 รายงานผลการสอบป้องกันปริญญานิพนธ์วิชาโครงงานพิเศษ", formats: ["DOC", "PDF"]  },
      { id: 21, title: "CSB-08 เอกสารแสดงผลการเรียน", formats: ["PDF"] },
      { id: 22, title: "CSB-09 แบบฟอร์มคำร้องขอเสนอผลการสอบภาษาอังกฤษ", formats: ["PDF"] },
      { id: 23, title: "CSB-10 แบบฟอร์มคำร้องขอเสนอผลการวัดระดับภาษาอังกฤษจากสถาบันทดสอบแทนการทดสอบวัดสมิทธิภาพทางภาษาอังกฤษ", formats: ["PDF"] },
      { id: 24, title: "CSB scorlaship A ทุนเรียนดี/ทุนขาดแคลน", formats: ["DOC", "PDF"]   },
      { id: 25, title: "เอกสารสำคัญการรับเงินด้วยวิธีจ่ายผ่านบัตร", formats: ["PDF"] },
      { id: 26, title: "Template ใบรับรองปริญญานิพนธ์ (กรรมการ 3 ท่าน)", formats: ["DOC"]},
      { id: 27, title: "Template ใบรับรองปริญญานิพนธ์ (กรรมการ 4 ท่าน)", formats: ["DOC"] },
    ]
  },
  {
    category: "การฝึกงาน",
    items: [
      { id: 28, title: "คพ.05 - หนังสือขอความอนุเคราะห์รับนักศึกษาฝึกงาน", formats: ["DOC", "PDF"] },
      { id: 29, title: "แบบประเมินผลฝึกงาน", formats: ["DOC", "PDF"] },
      { id: 30, title: "ใบลงเวลาฝึกงาน", formats: ["DOC", "PDF"] },
      { id: 31, title: "สมุดบันทึกการฝึกงาน", formats: ["DOC", "PDF"] },
      { id: 32, title: "หนังสือรับรองการฝึกงาน", url: "https://zenu7gjyuz3f2z3izcqmzq.on.drv.tw/internship_Certificate/internship_Certificate.html" },
    ]
  },
  {
    category: "ระดับบัณฑิตศึกษา",
    items: [
      { id: 33, title: "บ.001 คำร้องขอเสนอโครงการวิทยานิพนธ์และแต่งตั้งอาจารย์ที่ปรึกษาวิทยานิพนธ์", formats: ["PDF"] },
      { id: 34, title: "บ.002 คำร้องขออนุมัติเปลี่ยนแปลงอาจารย์ที่ปรึกษาวิทยานิพนธ์-สารนิพนธ์-การค้นคว้าอิสระ", formats: ["PDF"] },
      { id: 35, title: "บ.003 คำร้องขอสอบหัวข้อ-ความก้าวหน้า", formats: ["PDF"] },
      { id: 36, title: "บ.004 คำร้องขอสอบป้องกันวิทยานิพนธ์-สารนิพนธ์-การค้นคว้าอิสระ", formats: ["PDF"] },
      { id: 37, title: "บ.005 คำร้องขอสอบประมวลความรู้-ขอสอบวัดคุณสมบัติ", formats: ["PDF"] },
      { id: 38, title: "บ.006 คำร้องขอส่งโครงการวิทยานิพนธ์-สารนิพนธ์-การค้นคว้าอิสระ ฉบับแก้ไข", formats: ["PDF"] },
      { id: 39, title: "บ.007 คำร้องขอหนังสือขยายเวลาเพื่อลาศึกษา-ส่งตัวกลับเข้าปฏิบัติงาน", formats: ["PDF"] },
      { id: 40, title: "บ.008 คำร้องขอลาพักการศึกษา-ขอกลับเข้าศึกษา", formats: ["PDF"] },
      { id: 41, title: "บ.009 คำร้องขอส่งผลงานที่ได้นำเสนอ-ตีพิมพ์", formats: ["PDF"] },
      { id: 42, title: "บ.010 คำร้องขอรับทุนสนับสนุนการเผยแพร่ผลงานทางวิชาการระดับนานาชาติ", formats: ["PDF"] },
      { id: 43, title: "บ.011 คำร้องขอรับทุนสนับสนุนการเผยแพร่ผลงานทางวิชาการ (แผน ข)", formats: ["PDF"] },
      { id: 44, title: "บ.013 คำร้องเสนอผลการตรวจสอบการคัดลอกหรือลอกเลียนผลงานทางวิชาการ", formats: ["PDF"] },
      { id: 45, title: "บ.014 คำร้องขอเสนอผลการสอบภาษาต่างประเทศ", formats: ["PDF"] },
      { id: 46, title: "บ.015 คำร้องขอลาออก (กรณีไม่สำเร็จการศึกษา)", formats: ["PDF"] },
      { id: 47, title: "บ.016 คำร้องขอรายงานนักศึกษาเดินทางไปทำกิจกรรมทางวิชาการ ณ ต่างประเทศ", formats: ["PDF"] },
      { id: 48, title: "บ.101 แบบฟอร์มเสนอโครงการวิทยานิพนธ์-สารนิพนธ์-การค้นคว้าอิสระ", formats: ["PDF"] },
      { id: 49, title: "บ.102 โครงการย่อ-บทคัดย่อ", formats: ["PDF"] },
      { id: 50, title: "บ.103 ประวัติอาจารย์บัณฑิตศึกษา", formats: ["PDF"] },
      { id: 51, title: "บ.201 คำร้องขอผ่อนผันการขึ้นทะเบียนนักศึกษาใหม่", formats: ["PDF"] },
      { id: 52, title: "บ.202 คำร้องขอหนังสือรับรองผลการสอบคัดเลือกเข้าศึกษาต่อ", formats: ["PDF"] },
      { id: 53, title: "บ.203 คำร้องขอเป็นนักศึกษาพิเศษ", formats: ["PDF"] },
      { id: 54, title: "บ.204 คำร้องขออนุมัติผลการสำเร็จการศึกษา", formats: ["PDF"] },
      { id: 55, title: "บ.205 คำร้องขอเปลี่ยนแผนการศึกษา-สาขาวิชา-แขนงวิชา", formats: ["PDF"] },
      { id: 56, title: "บ.206 คำร้องขอคืนสภาพการเป็นนักศึกษา", formats: ["PDF"] },
      { id: 56, title: "บ.207 คำร้องทั่วไป", formats: ["PDF"] },
    ]
  },
  {
    category: "สำหรับนักศึกษาปัจจุบัน (ยังไม่สำเร็จการศึกษา)",
    items: [
      { id: 57, title: "ใบมอบฉันทะการลงทะเบียนวิชาเรียน", formats: ["DOC", "PDF"] },
      { id: 58, title: "คำร้องขั้นตอนการโอนรายวิชาของนักศึกษาภายในมหาวิทยาลัย ระดับ ปวช. และปริญญาตรี", formats: ["PDF"] },
      { id: 59, title: "คำร้องขอทำบัตรประจำตัวนักศึกษา(ธ.กรุงเทพ)", formats: ["PDF"] },
      { id: 60, title: "บัตรถอนวิชาเรียน", formats: ["PDF"] },
      { id: 61, title: "บัตรเปลี่ยนตอนวิชาเรียน", formats: ["PDF"]},
    ]
  },
  {
    category: "สำหรับผู้สำเร็จการศึกษา-พ้นสภาพการเป็นนักศึกษา-ลาออกศึกษาต่อที่อื่น",
    items: [
      { id: 62, title: "คำร้องขอลาออก", formats: ["PDF"] },
      { id: 63, title: "คำร้องขอเอกสารการศึกษา", formats: ["PDF"] },
      { id: 64, title: "คำร้องขอรับเงินประกันทรัพย์สินเสียหาย", formats: ["PDF"] },
    ]
  },
  

];export default function StaffDownloads() {
  const [openSections, setOpenSections] = useState([0]);
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {

  axios
    .get("http://localhost:5000/api/downloads/student")
    .then(res => {
      setDownloads(res.data);
    })
    .catch(err => {
      console.error(err);
    });

}, []);
  const toggleSection = (index) => {
    if (openSections.includes(index)) {
      setOpenSections(openSections.filter(i => i !== index));
    } else {
      setOpenSections([...openSections, index]);
    }
  };

  return (
    <div className="bg-slate-50 font-['Prompt'] min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">แบบฟอร์มดาวน์โหลดสำหรับนักศึกษา</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-grow">
        {downloadData.map((section, sIdx) => {
          const isOpen = openSections.includes(sIdx);
          return (
            <div key={sIdx} className="mb-6">
              <button onClick={() => toggleSection(sIdx)} className="w-full flex items-center gap-2 mb-2 pb-3 border-b-2 border-[#3F51B5]/10 group transition-all text-left">
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={22} className="text-[#3F51B5]" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-[#3F51B5] transition-colors">{section.category}</h2>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8 mt-2">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400">
                          <tr>
                            <th className="px-6 py-4 text-xs font-bold w-16 text-center uppercase tracking-wider">ลำดับ</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ชื่อรายการเอกสาร</th>
                            <th className="px-6 py-4 text-xs font-bold text-center w-40 uppercase tracking-wider">ไฟล์</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {section.items.map((item, iIdx) => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-5 text-center text-slate-400 text-sm">{iIdx + 1}</td>
                              <td className="px-6 py-5 text-slate-700 text-[15px] group-hover:text-[#3F51B5] transition-colors">{item.title}</td>
                              <td className="px-6 py-5 text-center">
                                <div className="flex justify-center gap-1.5">
                                  {item.url ? (
                                    <a 
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-8 py-2 bg-[#F3B664] hover:bg-[#e0a14d] text-white rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm inline-block"
                                    >
                                      Link
                                    </a>
                                  ) : (
                                    item.formats.map((format) => (
                                      <button
                                        key={format}
                                        className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 border
                                          ${format === 'PDF' ? 'text-rose-600 border-rose-100 bg-rose-50 hover:bg-rose-600 hover:text-white' : 
                                            format === 'DOC' ? 'text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-600 hover:text-white' : 
                                            'text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-600 hover:text-white'}
                                        `}
                                      >
                                        {format}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </main>
      <Footer />
    </div>
  );
}