import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ClipboardCheck, 
  Calendar, 
  Info, 
  FileText, 
  CheckCircle2, 
  Eye, 
  MapPin 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Internship() {
  const navigate = useNavigate();

  // 📅 ข้อมูลปฏิทินกิจกรรมการฝึกงานปี 2568
  const schedule = [
    { event: "นักศึกษาติดต่อกับหน่วยงานด้วยตนเอง (คนละ 1 หน่วยงานเท่านั้น)", date: "บัดนี้ - 13 มีนาคม 2569" },
    { event: "กรอกคำร้องขอฝึกงาน (คพ.05) และส่งคำร้องที่สำนักงานภาควิชาฯ (ดาวน์โหลดคำร้องได้ที่เว็บไซต์ภาควิชา)", date: "บัดนี้ - 13 มีนาคม 2569" },
    { event: "วันปิดภาคการศึกษาที่ 2/2568", date: "30 มีนาคม 2569" },
    { event: "รับเอกสารส่งตัวเข้าฝึกงาน", date: "รอประกาศแจ้งอีกครั้ง" },
    { event: "ช่วงเวลาการออกฝึกงานภาคฤดูร้อน ปีการศึกษา 2568", date: "1 เมษายน 2569 - 21 มิถุนายน 2569" },
    { event: "วันเปิดภาคการศึกษาที่ 1/2569", date: "22 มิถุนายน 2569" }
  ];

  // 🛠️ ลำดับกระบวนการฝึกงาน 9 ขั้นตอน
  const steps = [
    { title: "ติดต่อ", desc: "นักศึกษาติดต่อสถานที่ฝึกงาน (คณะละ 1 สถานที่เท่านั้น)" },
    { title: "กรอก", desc: "กรอกคำร้องขอฝึกงาน คพ.05 (ดาวน์โหลดคำร้องได้ที่เว็บไซต์ของภาควิชาฯ)" },
    { title: "ยื่น", desc: "ยื่น คพ.05 และเอกสารแสดงผลการเรียน ส่งที่สำนักงานภาควิชาฯ (เอกสารแสดงผลการเรียนปริ้นท์ได้จากระบบลงทะเบียน)" },
    { title: "รอรับ", desc: "เจ้าหน้าที่ออกหนังสือขอความอนุเคราะห์ฝึกงาน (นักศึกษารอรับเอกสารได้ทันที)" },
    { title: "ยื่น", desc: "นักศึกษานำหนังสือขอความอนุเคราะห์ฝึกงาน + แบบตอบรับ ไปยื่นให้กับสถานประกอบการด้วยตนเอง" },
    { title: "ส่ง", desc: "นักศึกษานำแบบตอบรับเข้าฝึกงานจากหน่วยงานมาส่งให้กับภาควิชาฯ *หากหน่วยงานปฏิเสธ ให้เริ่มขั้นตอนที่ 1 ใหม่" },
    { title: "รับ", desc: "นักศึกษารับเอกสารส่งตัว" },
    { title: "เข้าฝึก", desc: "เข้ารับการฝึกงานตามระยะเวลาที่กำหนด (ไม่ต่ำกว่า 40 วันทำการหรือ 240 ชั่วโมง ไม่นับวันหยุดราชการ ขาด สาย ลา)" },
    { title: "ส่ง", desc: "หลังฝึกงานเสร็จ ส่งใบประเมินการฝึกงาน, ใบลงเวลา, สมุดบันทึกการฝึกงาน (ส่งที่สำนักงานภาควิชาฯ ภายใน 2 สัปดาห์หลังจากนักศึกษาฝึกงานเสร็จ)" }
  ];

  return (
    <div className="bg-white font-['Prompt'] min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
              <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ขั้นตอนการฝึกงาน</h1>
                  <div className="w-12 h-1 bg-white/30 mb-5"></div>
                </motion.div>
              </div>
              <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                <h2 className="text-[5rem] font-bold">CIS</h2>
              </div>
            </section>

      <main className="max-w-6xl mx-auto w-full px-6 py-16 flex-grow space-y-16">
        
        {/* 📋 ส่วนที่ 1: คุณสมบัติและเกณฑ์คะแนน */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-6">
              <ClipboardCheck className="text-[#3F51B5]" /> คุณสมบัตินักศึกษาฝึกงาน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>เป็นนักศึกษาชั้นปีที่ 3 ขึ้นไป</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>มีหน่วยกิตรวมทุกรายวิชา จำนวน 81 หน่วยกิตขึ้นไป ณ วันที่ยื่นเอกสาร</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <p>หากจำนวนหน่วยกิตไม่ถึงเกณฑ์ที่กำหนด ให้นักศึกษาฝึกงานในรอบถัดไป</p>
              </div>
              <div className="lg:col-span-2 bg-slate-50 p-1 rounded-3xl border border-slate-100"></div>
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-1">
              <ClipboardCheck className="text-[#3F51B5]" /> เกณฑ์การฝึกงาน
            </h2>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2">
                <p>ฝึกงานไม่ต่ำกว่า 240 ชั่วโมง หรือ 40 วันทำการขึ้นไป</p>
              </div>
              <div className="lg:col-span-2 bg-slate-50 p-1 rounded-3xl border border-slate-100"></div>
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-1">
              <ClipboardCheck className="text-[#3F51B5]" /> *หมายเหตุ
            </h2>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2">
                <p>บริษัท จำกัด ฝึกงานได้ 2 คน/แผนก/ฝ่าย/ทีม</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2">
                <p>บริษัท จำกัด (มหาชน) ฝึกงานได้ 3 คน/แผนก/ฝ่าย/ทีม</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2">
                <p>หน่วยงานราชการ ฝึกงานได้ 2 คน/แผนก/ฝ่าย/ทีม</p>
              </div>
            </div>
          </div>

          <div className="bg-[#3F51B5] text-white p-8 rounded-3xl shadow-xl shadow-indigo-100 relative overflow-hidden text-left">
            <h2 className="flex items-center gap-3 text-xl font-bold mb-6">
              <Info size={20} /> เกณฑ์การประเมิน
            </h2>
            <div className="space-y-4 text-sm relative z-10">
              {[
                { title: "ระเบียบวินัย", score: 20 },
                { title: "พฤติกรรมในการปฏิบัติงาน", score: 20 },
                { title: "ผลงาน", score: 20 },
                { title: "วิธีการปฏิบัติงาน", score: 20 },
                { title: "มนุษย์สัมพันธ์", score: 20 }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between border-b border-white/10 pb-2">
                  <span>{item.title}</span>
                  <span className="font-bold">{item.score} คะแนน</span>
                </div>
              ))}
              <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-[11px] leading-relaxed">
                <strong>นิสิตจะไม่ผ่านการฝึกงานในกรณีดังต่อไปนี้:</strong><br/>
                คะแนนประเมินรวมจากสถานประกอบการทั้งหมด ได้น้อยกว่า 70 คะแนน
              </div>
            </div>
          </div>
        </div>

        {/* 📅 ส่วนที่ 2: ปฏิทินกิจกรรม */}
        <div className="space-y-6 text-left">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800">
            <Calendar className="text-[#3F51B5]" /> กำหนดการประจำปีการศึกษา 2568
          </h2>
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">รายละเอียดกิจกรรม</th>
                  <th className="px-6 py-4 text-center w-64">ช่วงเวลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedule.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-700">{item.event}</td>
                    <td className="px-6 py-4 text-center text-[#3F51B5] font-semibold">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🚀 ส่วนที่ 3: ลำดับขั้นตอน 9 ขั้นตอน */}
        <div className="space-y-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800">
              <FileText className="text-[#3F51B5]" /> ลำดับขั้นตอนการดำเนินการฝึกงาน
            </h2>
            
            <div className="flex flex-wrap gap-3">
              <a 
                href="https://drive.google.com/drive/mobile/folders/1FgrgA1v6hOujVkCUFFtfEHV5cOmofhGK?usp=drive_link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3F51B5] transition-all shadow-lg"
              >
                <Eye size={16} /> ดูเอกสารประกอบการฝึกงาน
              </a>

              <a 
                href="https://docs.google.com/spreadsheets/d/1tguBraKR6NkJRQJkZuBtu5KsPsW5CDj8taq536B1t1Y/htmlview" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-300 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3F51B5] transition-all shadow-lg"
              >
                <MapPin size={16} /> ตรวจสอบสถานที่ฝึกงาน
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 pt-4">
            {steps.map((step, idx) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={idx} 
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group flex flex-col"
              >
                <div className="absolute -top-5 left-6 bg-[#3F51B5] text-white w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <h4 className="text-[#3F51B5] font-bold text-lg mb-2 mt-2">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}