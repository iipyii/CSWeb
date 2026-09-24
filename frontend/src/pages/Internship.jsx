import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ClipboardCheck,
  Calendar,
  Info,
  FileText,
  CheckCircle2,
  Eye,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import axios from "axios";

export default function Internship() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [config, setConfig] = useState({
    links: {
      docsUrl: "https://drive.google.com/drive/mobile/folders/1FgrgA1v6hOujVkCUFFtfEHV5cOmofhGK?usp=drive_link",
      placesUrl: "https://docs.google.com/spreadsheets/d/1tguBraKR6NkJRQJkZuBtu5KsPsW5CDj8taq536B1t1Y/htmlview"
    },
    evaluation: {
      items: [
        { title: "ระเบียบวินัย", score: 20 },
        { title: "พฤติกรรมในการปฏิบัติงาน", score: 20 },
        { title: "ผลงาน", score: 20 },
        { title: "วิธีการปฏิบัติงาน", score: 20 },
        { title: "มนุษย์สัมพันธ์", score: 20 }
      ],
      note: "นิสิตจะไม่ผ่านการฝึกงานในกรณีดังต่อไปนี้: คะแนนประเมินรวมจากสถานประกอบการทั้งหมด ได้น้อยกว่า 70 คะแนน"
    }
  });

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:5000/api/internships"),
      axios.get("http://localhost:5000/api/internships/config")
    ]).then(([itemsRes, configRes]) => {
      if (itemsRes.data) setInternships(itemsRes.data);
      if (configRes.data) {
        setConfig({
          links: configRes.data.links || config.links,
          evaluation: configRes.data.evaluation || config.evaluation
        });
      }
    }).catch(err => {
      console.error("Fetch internship data error:", err);
    });
  }, []);

  const qualification = internships.filter(i => i.section === "qualification");
  const criteria = internships.filter(i => i.section === "criteria");
  const notes = internships.filter(i => i.section === "note");
  const schedule = internships.filter(i => i.section === "schedule");
  const steps = internships.filter(i => i.section === "process");

  return (
    <div className="bg-white min-h-screen flex flex-col text-left">

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

      <main className="max-w-6xl mx-auto w-full px-6 md:px-10 py-16 flex-grow space-y-16">

        {/* 📋 ส่วนที่ 1: คุณสมบัติและเกณฑ์คะแนน */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-6">
              <ClipboardCheck className="text-[#3F51B5]" /> คุณสมบัตินักศึกษาฝึกงาน
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">

              {qualification.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2"
                >
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    {item.title && <div className="text-xs font-bold text-[#3F51B5] mb-1">{item.title}</div>}
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}

              <div className="lg:col-span-2 bg-slate-50 p-1 rounded-3xl border border-slate-100"></div>
              <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-1">
                <ClipboardCheck className="text-[#3F51B5]" /> เกณฑ์การฝึกงาน
              </h2>
              {criteria.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2"
                >
                  <div>
                    {item.title && <div className="text-xs font-bold text-[#3F51B5] mb-1">{item.title}</div>}
                    <p>{item.content}</p>
                  </div>
                </div>
              ))}
              
              {notes.length > 0 && (
                <>
                  <div className="lg:col-span-2 bg-slate-50 p-1 rounded-3xl border border-slate-100"></div>
                  <h2 className="flex items-center gap-3 text-xl font-bold text-slate-800 mb-1">
                    <ClipboardCheck className="text-[#3F51B5]" /> *หมายเหตุ
                  </h2>
                  {notes.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-2xl border border-slate-200 flex items-start gap-3 md:col-span-2"
                    >
                      <div>
                        {item.title && <div className="text-xs font-bold text-amber-700 mb-1">{item.title}</div>}
                        <p>{item.content}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="bg-[#3F51B5] text-white p-8 rounded-3xl shadow-xl shadow-indigo-100 relative overflow-hidden text-left">
            <h2 className="flex items-center gap-3 text-xl font-bold mb-6">
              <Info size={20} /> เกณฑ์การประเมิน
            </h2>
            <div className="space-y-4 text-sm relative z-10">
              {config.evaluation.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between border-b border-white/10 pb-2">
                  <span>{item.title}</span>
                  <span className="font-bold">{item.score} คะแนน</span>
                </div>
              ))}
              {config.evaluation.note && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-[11px] leading-relaxed">
                  {config.evaluation.note}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 📅 ส่วนที่ 2: ปฏิทินกิจกรรม */}
        <div className="space-y-6 text-left">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800">
            <Calendar className="text-[#3F51B5]" /> กำหนดการประจำปีการศึกษา
          </h2>
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">กำหนดการ</th>
                    <th className="px-6 py-4 text-center w-64">รายละเอียดและช่วงเวลา</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-slate-400 text-xs">
                        ยังไม่มีข้อมูลกำหนดการ
                      </td>
                    </tr>
                  ) : (
                    schedule.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-slate-700">{item.title}</td>
                        <td className="px-6 py-4 text-center text-[#3F51B5] font-semibold">
                          {item.content}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 🚀 ส่วนที่ 3: ลำดับขั้นตอน */}
        <div className="space-y-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800">
              <FileText className="text-[#3F51B5]" /> ลำดับขั้นตอนการดำเนินการฝึกงาน
            </h2>

            <div className="flex flex-wrap gap-3">
              {config.links.docsUrl && (
                <a
                  href={config.links.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3F51B5] hover:text-white transition-all shadow-md"
                >
                  <Eye size={16} /> ดูเอกสารประกอบการฝึกงาน
                </a>
              )}

              {config.links.placesUrl && (
                <a
                  href={config.links.placesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-slate-300 text-slate-800 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3F51B5] hover:text-white transition-all shadow-md"
                >
                  <MapPin size={16} /> ตรวจสอบสถานที่ฝึกงาน
                </a>
              )}
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
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                  {step.content}
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