import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import axios from "axios";

const downloadData = [
  {
    category: "งานการเงิน",
    items: [
      { id: 1, title: "แบบรายงานเดินทางไปปฏิบัติงานต่างประเทศ", formats: ["DOC", "PDF"] },
      { id: 2, title: "ใบเบิกค่าใช้จ่ายเดินทางไปราชการ (ในประเทศ)-ส่วน-1", formats: ["DOC", "PDF"] },
      { id: 3, title: "ใบสำคัญรับเงิน", formats: ["XLS"] },
      { id: 4, title: "หลักฐานการจ่ายเงินค่าใช้จ่ายเดินทางไปราชการ (ตปท-ในประเทศ)-ส่วน-2-และ-3", formats: ["XLS"] },
    ]
  },
  {
    category: "งานบุคคล",
    items: [
      { id: 5, title: "บันทึกข้อความ ลาพักผ่อนไปต่างประเทศ", formats: ["DOC", "PDF"] },
      { id: 6, title: "ใบลาพักผ่อนไปต่างประเทศ", formats: ["PDF"] },
      { id: 7, title: "แบบใบลาไปช่วยเหลือภริยาที่คลอดบุตร", formats: ["PDF"] },
      { id: 8, title: "แบบใบลาติดตามคู่สมรส", formats: ["PDF"] },
      { id: 9, title: "ใบลากิจส่วนตัวไปต่างประเทศ", formats: ["PDF"] },
      { id: 10, title: "แบบใบลาไปปฏิบัติงานในองค์การระหว่างประเทศ", formats: ["PDF"] },
      { id: 11, title: "แบบใบลาอุปสมบท", formats: ["PDF"] },
      { id: 12, title: "แบบใบลาไปประกอบพิธีฮัจย์ ณ เมืองเมกกะ ประเทศซาอุดิอาระเบีย", formats: ["PDF"] },
      { id: 13, title: "แบบใบลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน", formats: ["PDF"] },
      { id: 14, title: "แบบใบลาไปฟื้นฟูสมรรถภาพด้านอาชีพ", formats: ["PDF"] },
      { id: 15, title: "แบบรายงานลาเข้ารับการตรวจเลือก หรือเข้ารับการเตรียมพล", formats: ["PDF"] },
      { id: 16, title: "แบบรายงานผลเกี่ยวกับการลาไปปฏิบัติงานในองค์การระหว่างประเทศ", formats: ["PDF"] },
      { id: 17, title: "แบบฟอร์มปรับคุณวุฒิ", formats: ["PDF"] },
      { id: 18, title: "แบบฟอร์มเขียนรายงานการฝึกอบรม ประชุม สัมมนาและฟังการบรรยาย ภายในประเทศ", formats: ["DOC", "PDF"] },
      { id: 19, title: "แนวปฏิบัติในการกรอกแบบ ก.พ.อ.03 และการนำเสนอผลงานทางวิชาการ", formats: ["PDF"] },
      { id: 20, title: "แบบสรุปการประเมินผลการปฏิบัติงานของบุคลากรสายสนับสนุนวิชาการ", formats: ["DOC", "PDF"] },
      { id: 21, title: "สัญญาจ้างพนักงานมหาวิทยาลัย (1 ปี และ 3 ปี)", formats: ["PDF"] },
      { id: 22, title: "สัญญาจ้างพนักงานมหาวิทยาลัย (ทดลองงาน)", formats: ["PDF"] },
      { id: 23, title: "สัญญาจ้างพนักงานมหาวิทยาลัย (ลักษณะประจำ)", formats: ["PDF"] },
      { id: 24, title: "แบบประวัติและผลงานเพื่อต่อสัญญาจ้างพนักงานมหาวิทยาลัย (สายสนับสนุนวิชาการ)", formats: ["DOC", "PDF"] },
      { id: 25, title: "แบบประวัติและผลงานเพื่อต่อสัญญาจ้างพนักงานมหาวิทยาลัย (สายวิชาการ)", formats: ["DOC", "PDF"] },
      { id: 26, title: "คำขอมีบัตรประจำตัว-จนท.ของรัฐอิเล็กทรอนิกส์", formats: ["PDF"] },
      { id: 27, title: "ตัวอย่างภาพถ่ายสำหรับทำบัตรประจำตัวพนักงานมหาวิทยาลัย", formats: ["PDF"] },
      { id: 28, title: "แบบคำขอหนังสือรับรองเงินเดือน", formats: ["DOC", "PDF"] },
      { id: 29, title: "แบบฟอร์มการขอหนังสือรับรอง", formats: ["DOC", "PDF"] },
      { id: 30, title: "หนังสือขอลาออกจากราชการ", formats: ["DOC", "PDF"] },
    ]
  },
  {
    category: "งานวิชาการ",
    items: [
      { id: 31, title: "บันทึกขอแก้ไขเกรด", formats: ["DOC", "PDF"] },
      { id: 32, title: "แบบฟอร์มเปลี่ยนคะแนนI", formats: ["DOC", "PDF"] },
      { id: 33, title: "แบบฟอร์มเปลี่ยนคะแนน IP", formats: ["DOC", "PDF"] },
      { id: 34, title: "แบบฟอร์มการส่งเกรดสำหรับนักศึกษาที่ไม่มีรายชื่อในฐานข้อมูล", formats: ["DOC", "PDF"] },
      { id: 35, title: "แบบฟอร์มบันทึกข้อความ ขอเปลี่ยนแปลงกรรมการคุมสอบ", formats: ["DOC", "PDF"] },
    ]
  },
  {
    category: "งานหลักสูตร",
    items: [
      {
        id: 36, title: "Link เอกสารดาวน์โหลดสำหรับอาจารย์ เจ้าหน้าที่ (กองบริการการศึกษา)", url: "https://acdserv.kmutnb.ac.th/downloads-for-teachers-staff"
      },
    ]
  }
];
export default function StaffDownloads() {
  const [openSections, setOpenSections] = useState([0]);
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/downloads/staff")
      .then((res) => {
        setDownloads(res.data);
      })
      .catch((err) => {
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
  const grouped = downloads.reduce((acc, item) => {

    if (!acc[item.category]) {
      acc[item.category] = [];
    }

    acc[item.category].push(item);

    return acc;

  }, {});
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">แบบฟอร์มดาวน์โหลดสำหรับบุคลากร</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-5xl mx-auto w-full px-6 py-12 flex-grow">
        {Object.entries(grouped).map(([category, items], sIdx) => {
          const isOpen = openSections.includes(sIdx);
          return (
            <div key={sIdx} className="mb-6">
              <button onClick={() => toggleSection(sIdx)} className="w-full flex items-center gap-2 mb-2 pb-3 border-b-2 border-[#3F51B5]/10 group transition-all text-left">
                <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronRight size={22} className="text-[#3F51B5]" />
                </motion.div>
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-[#3F51B5] transition-colors">{category}</h2>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                    <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8 mt-2">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left">
                          <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400">
                            <tr>
                              <th className="px-6 py-4 text-xs font-bold w-16 text-center uppercase tracking-wider">ลำดับ</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">ชื่อรายการเอกสาร</th>
                              <th className="px-6 py-4 text-xs font-bold text-center w-40 uppercase tracking-wider">ไฟล์</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {items.map((item, iIdx) => (
                              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 text-center text-slate-400 text-sm">{iIdx + 1}</td>
                                <td className="px-6 py-5 text-slate-700 text-[15px] group-hover:text-[#3F51B5] transition-colors">{item.title}</td>
                                <td className="px-6 py-5 text-center">
                                  <div className="flex justify-center gap-1.5">

                                      <a
                                        href={`http://localhost:5000${item.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 border
                                          ${item.file_type === 'pdf'
                                            ? 'text-rose-600 border-rose-100 bg-rose-50 hover:bg-rose-600 hover:text-white'
                                            : item.file_type === 'docx'
                                            ? 'text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-600 hover:text-white'
                                            : 'text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-600 hover:text-white'
                                          }`}
                                      >
                                        {item.file_type?.toUpperCase()}
                                      </a>

                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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