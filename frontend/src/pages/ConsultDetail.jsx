import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Search, Users } from 'lucide-react';
import Footer from '../components/Footer';
import axios from "axios";

export default function ConsultDetail() {
  const { level, year } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [advisors, setAdvisors] = useState([]);

  // const advisorInfo = [
  //   {
  //     id: 1,
  //     name: "ผู้ช่วยศาสตราจารย์ ดร.นิกร สุทธิเสงี่ยม (NKS)",
  //     email: "nikorn.s@sci.kmutnb.ac.th",
  //     image: "/img/staff/nikorn.jpg",
  //     students: [
  //       { id: 1, code: "6804062610011", title: "นาย", firstName: "ธนวิช", lastName: "จิบเอี่ยม", room: "RA" },
  //       { id: 2, code: "6804062610029", title: "นาย", firstName: "พงศ์ชยุติม์", lastName: "มานะวงศ์กวิน", room: "RA" },
  //       { id: 3, code: "6804062610037", title: "นาย", firstName: "ปัณณวัฒน์", lastName: "เดชประสิทธิ์", room: "RA" },
  //       { id: 4, code: "6804062610045", title: "นาย", firstName: "กฤตภาส", lastName: "ควรเพิ่มสิน", room: "RA" },
  //       { id: 5, code: "6804062610053", title: "นาย", firstName: "จิรพัฒน์", lastName: "พรมเกตุ", room: "RA" },
  //       { id: 6, code: "6804062610061", title: "นาย", firstName: "กษิดิ์เดช", lastName: "นันทวิรักษ์", room: "RA" },
  //       { id: 7, code: "6804062610070", title: "นางสาว", firstName: "กันตพร", lastName: "จันทราภิรมย์", room: "RA" },
  //       { id: 8, code: "6804062610088", title: "นาย", firstName: "ปวริศร์", lastName: "พ่วงแพ", room: "RA" },
  //     ]
  //   },
  //   {
  //     id: 2,
  //     name: "ผู้ช่วยศาสตราจารย์ ดร.เฉียบวุฒิ รัตนวิไลสกุล (CHR)",
  //     email: "chaibwoot.r@sci.kmutnb.ac.th",
  //     image: "/img/staff/chaibwoot.jpg",
  //     students: [
  //       { id: 1, code: "6804062610096", title: "นาย", firstName: "ธนดล", lastName: "ชัยเดช", room: "RA" },
  //       { id: 2, code: "6804062610100", title: "นางสาว", firstName: "วิรดา", lastName: "มาตรา", room: "RA" },
  //       { id: 3, code: "6804062610118", title: "นาย", firstName: "นันท์นลิน", lastName: "จันทร์เอี่ยม", room: "RA" },
  //       { id: 4, code: "6804062610126", title: "นาย", firstName: "กฤษณะ", lastName: "เอื้อราษฎร์", room: "RA" },
  //       { id: 5, code: "6804062610134", title: "นาย", firstName: "พีรพัฒน์", lastName: "ศรีแสวงทรัพย์", room: "RA" },
  //       { id: 6, code: "6804062610142", title: "นาย", firstName: "ณัฏฐพล", lastName: "จันทร์เพ็ง", room: "RA" },
  //       { id: 7, code: "6804062610151", title: "นาย", firstName: "ณัฐวุฒิ", lastName: "หงษ์มณี", room: "RA" },
  //       { id: 8, code: "6804062610169", title: "นาย", firstName: "คาเมรอน", lastName: "แม็คอินทอช", room: "RA" },
  //     ]
  //   }
  // ];

  const levelName = level === 'bachelor' ? 'ปริญญาตรี' : level === 'master' ? 'ปริญญาโท' : 'ปริญญาเอก';
  useEffect(() => {

    const buddhistYear = 2500 + Number(year);

    axios
      .get(`http://localhost:5000/api/consult/year/${level}/${buddhistYear}`)
      .then(res => {
        setAdvisors(res.data);
      })
      .catch(err => {
        console.error(err);
      });

  }, [year]);

  return (
    <div className="bg-white font-['Prompt'] min-h-screen flex flex-col text-left">

      {/* 🟦 Header Section - พร้อมลายน้ำ CIS */}
      <section className="bg-[#3F51B5] text-white py-10 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors text-sm"
          >
          </button>

          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-white/20 rounded-full"></div>
            <h1 className="text-2xl font-bold tracking-tight">
              นักศึกษา ระดับ{levelName} รหัส {year}
            </h1>
          </div>
        </div>

        {/* CIS Watermark */}
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-6xl mx-auto w-full px-6 py-12 grow space-y-12">

        {/* 🔍 Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <Users size={20} className="text-[#3F51B5]" />
            <span>ค้นหารายชื่อนักศึกษา</span>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ค้นหาชื่อนักศึกษาหรือรหัสนักศึกษา"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-10 text-sm outline-none focus:border-[#3F51B5] transition-all"
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            />
          </div>
        </div>

        {/* 📋 Advisor Groups */}
        <div className="space-y-20">
          {advisors.map((advisor) => {
            const filteredStudents = advisor.advisor_students.filter(s =>
              s.student.student_id.includes(searchTerm) ||
              s.student.firstname.toLowerCase().includes(searchTerm) ||
              s.student.firstname.toLowerCase().includes(searchTerm)
            );

            if (filteredStudents.length === 0 && searchTerm !== "") return null;

            return (
              <div key={advisor.id} className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">

                {/* ข้อมูลอาจารย์ด้านซ้าย */}
                <div className="md:col-span-1 space-y-4">
                  <div className="w-full aspect-3/4 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                    <img
                      src={
                        advisor.lecturer?.image_path
                          ? `http://localhost:5000/uploads/lecturers/${advisor.lecturer.lecturer_code}.jpg`
                          : "/img/staff/default.jpg"}
                      alt={advisor.lecturer?.fullname_th}
                      className="w-full h-full object-cover" />
                  </div>
                  <div className="px-1 text-left">
                    <h3 className="text-sm font-bold text-[#3F51B5] leading-snug">{advisor.lecturer.fullname_th}{" "}({advisor.lecturer.lecturer_code})</h3>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5 break-all">
                      <Mail size={12} className="shrink-0" /> {advisor.lecturer.email}
                    </p>
                  </div>
                </div>

                {/* ตารางนักศึกษาด้านขวา */}
                <div className="md:col-span-3">
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-[#EEF2FF] text-[#3F51B5] font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-center w-16">ลำดับ</th>
                          <th className="px-4 py-3">เลขประจำตัว</th>
                          <th className="px-4 py-3">คำนำหน้า</th>
                          <th className="px-4 py-3">ชื่อ</th>
                          <th className="px-4 py-3">นามสกุล</th>
                          <th className="px-4 py-3 text-center w-20">ห้อง</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((student, index) => (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-center font-bold text-slate-400">{index + 1}</td>
                            <td className="px-4 py-3 text-slate-700">{student.student.student_id}</td>
                            <td className="px-4 py-3 text-slate-600">{student.student.title}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{student.student.firstname}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{student.student.lastname}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[11px] font-black text-slate-400">{student.student.room}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}