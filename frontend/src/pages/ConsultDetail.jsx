import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Mail,
  Search,
  Users,
  GraduationCap,
  UserRound,
} from "lucide-react";
import Footer from "../components/Footer";
import axios from "axios";

export default function ConsultDetail() {
  const { level, year } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  const levelName =
    level === "bachelor"
      ? "ปริญญาตรี"
      : level === "master"
      ? "ปริญญาโท"
      : "ปริญญาเอก";

  useEffect(() => {
    const buddhistYear = 2500 + Number(year);
    setLoading(true);

    axios
      .get(`http://localhost:5000/api/consult/year/${level}/${buddhistYear}`)
      .then((res) => {
        setAdvisors(res.data || []);
      })
      .catch((err) => {
        console.error("consult detail error:", err);
        setAdvisors([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [year, level]);

  const filteredAdvisorGroups = useMemo(() => {
    return advisors
      .map((advisor) => {
        const filteredStudents = [...(advisor.advisor_students || [])]
          .filter((item) => {
            const student = item.student;
            const keyword = searchTerm.trim().toLowerCase();

            if (!keyword) return true;

            return (
              student?.student_id?.toLowerCase().includes(keyword) ||
              student?.firstname?.toLowerCase().includes(keyword) ||
              student?.lastname?.toLowerCase().includes(keyword)
            );
          })
          .sort((a, b) =>
            (a.student?.student_id || "").localeCompare(b.student?.student_id || "")
          );

        return {
          ...advisor,
          filteredStudents,
        };
      })
      .filter((advisor) => advisor.filteredStudents.length > 0 || searchTerm.trim() === "");
  }, [advisors, searchTerm]);

  const totalStudents = useMemo(() => {
    return filteredAdvisorGroups.reduce(
      (sum, advisor) => sum + advisor.filteredStudents.length,
      0
    );
  }, [filteredAdvisorGroups]);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col text-left">
      {/* Header */}
      <section className="bg-[#3F51B5] text-white py-12 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-5 transition-colors text-sm"
          >
            <ChevronLeft size={18} />
            <span>ย้อนกลับ</span>
          </button>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm mb-5">
              <GraduationCap size={16} />
              <span>ข้อมูลอาจารย์ที่ปรึกษา</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              นักศึกษา ระดับ{levelName} รหัส {year}
            </h1>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              แสดงรายชื่ออาจารย์ที่ปรึกษาและนักศึกษาในรุ่นปีนี้
              พร้อมค้นหารายชื่อนักศึกษาในหน้าปัจจุบันได้ทันที
            </p>
          </div>
        </div>

        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] md:text-[7rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-6xl mx-auto w-full px-6 py-10 grow space-y-8">
        {/* Search Bar */}
        <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 md:px-8 py-6 border-b border-slate-100 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-slate-800 mb-1">
                  <Users size={20} className="text-[#3F51B5]" />
                  <h2 className="text-xl font-bold">ค้นหารายชื่อนักศึกษา</h2>
                </div>
                <p className="text-sm text-slate-500">
                  ค้นหาด้วยชื่อ นามสกุล หรือรหัสนักศึกษา ภายในรุ่นปีนี้
                </p>
              </div>

              {!loading && (
                <div className="text-sm text-slate-500">
                  พบทั้งหมด <span className="font-bold text-[#3F51B5]">{totalStudents}</span>{" "}
                  รายการ
                </div>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="relative w-full md:w-[420px]">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อนักศึกษาหรือรหัสนักศึกษา"
                className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-3.5 pl-12 pr-4 text-sm outline-none focus:border-[#3F51B5] focus:bg-white transition-all"
              />
            </div>
          </div>
        </section>

        {/* Content */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-10 text-center text-slate-500">
            กำลังโหลดข้อมูล...
          </div>
        ) : filteredAdvisorGroups.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Users className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">
              ไม่พบข้อมูลนักศึกษา
            </h3>
            <p className="text-sm text-slate-500">
              กรุณาลองค้นหาด้วยชื่อ นามสกุล หรือรหัสนักศึกษาอื่น
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredAdvisorGroups.map((advisor) => (
              <div
                key={advisor.id}
                className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Advisor Info */}
                  <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-6">
                    <div className="space-y-4">
                      <div className="w-full max-w-[240px] mx-auto lg:mx-0 aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                        <img
                          src={
                            advisor.lecturer?.image_path
                              ? `http://localhost:5000/uploads/lecturers/${advisor.lecturer.lecturer_code}.jpg`
                              : "/img/staff/default.jpg"
                          }
                          alt={advisor.lecturer?.fullname_th || "lecturer"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-[#3F51B5] px-3 py-1 text-xs font-medium">
                          <UserRound size={14} />
                          <span>อาจารย์ที่ปรึกษา</span>
                        </div>

                        <h3 className="text-base font-bold text-[#3F51B5] leading-relaxed">
                          {advisor.lecturer?.fullname_th || "-"}{" "}
                          {advisor.lecturer?.lecturer_code
                            ? `(${advisor.lecturer.lecturer_code})`
                            : ""}
                        </h3>

                        <p className="text-xs text-slate-500 flex items-start gap-2 break-all">
                          <Mail size={13} className="shrink-0 mt-0.5" />
                          <span>{advisor.lecturer?.email || "-"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Student Table */}
                  <div className="lg:col-span-9 p-0">
                    <div className="px-6 py-4 border-b border-slate-200 bg-[#EEF2FF]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-bold text-[#3F51B5]">
                          รายชื่อนักศึกษาในความดูแล
                        </h4>
                        <span className="text-sm text-slate-600">
                          จำนวน {advisor.filteredStudents.length} คน
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-sm">
                        <thead className="bg-white text-[#3F51B5] border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 text-center w-16">ลำดับ</th>
                            <th className="px-4 py-3 text-left">เลขประจำตัว</th>
                            <th className="px-4 py-3 text-left">คำนำหน้า</th>
                            <th className="px-4 py-3 text-left">ชื่อ</th>
                            <th className="px-4 py-3 text-left">นามสกุล</th>
                            <th className="px-4 py-3 text-center w-24">ห้อง</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {advisor.filteredStudents.map((item, index) => (
                            <tr
                              key={item.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-center font-bold text-slate-400">
                                {index + 1}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {item.student?.student_id || "-"}
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {item.student?.title || "-"}
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {item.student?.firstname || "-"}
                              </td>
                              <td className="px-4 py-3 font-semibold text-slate-800">
                                {item.student?.lastname || "-"}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center justify-center min-w-[42px] px-2 py-1 rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                                  {item.student?.room || "-"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}