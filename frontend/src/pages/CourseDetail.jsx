// src/pages/CourseDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "../components/Footer";

const idMap = {
  "cs-normal-2564": { slug: "regular", year: 2564 },
  "cs-normal-2559": { slug: "regular", year: 2559 },
  "cs-old-2554": { slug: "regular", year: 2554 },

  "cs-english-2564": { slug: "csb", year: 2564 },

  "cs-master-2567": { slug: "ComputerScience", year: 2567 },
  "cs-master-2562": { slug: "ComputerScience", year: 2562 },

  "se-master-2559": { slug: "SoftwareEngineering", year: 2559 },

  "cs-phd-2564": { slug: "computersci", year: 2564 },
  "cs-phd-edit-2559": { slug: "computersci", year: 2559 },
};

const sectionTitles = {
  1: "หมวดที่ 1 ข้อมูลทั่วไป",
  2: "หมวดที่ 2 ข้อมูลเฉพาะของหลักสูตร",
  3: "หมวดที่ 3 ระบบการจัดการศึกษา การดำเนินการและโครงสร้างของหลักสูตร",
  4: "หมวดที่ 4 ผลการเรียนรู้ กลยุทธ์การสอนและการประเมินผล",
  5: "หมวดที่ 5 หลักเกณฑ์ในการประเมินผลนักศึกษา",
  6: "หมวดที่ 6 การพัฒนาคณาจารย์",
  7: "หมวดที่ 7 การประกันคุณภาพหลักสูตร",
  8: "หมวดที่ 8 การประเมินและปรับปรุงการดำเนินการของหลักสูตร",
  99: "แผนภูมิแสดงความต่อเนื่องของการศึกษาในหลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
  999: "คำอธิบายรายวิชา",
  88: "การปรับปรุงแก้ไขหลักสูตร",
  11: "ข้อมูลทั่วไป",
  22: "การจัดการเรียนการสอน",
  33: "ประกาศ มจพ เรื่อง หลักเกณฑ์การเบิกจ่ายเงินรายได้สำหรับหลักสูตรพิเศษระดับปริญญาตรี",
  111: "องค์ประกอบที่ 1 ชื่อปริญญา และสาขาวิชา",
  222: "องค์ประกอบที่ 2 ปรัชญา วัตถุประสงค์ ผลลัพธ์การเรียนรู้",
  333: "องค์ประกอบที่ 3 โครงสร้างหลักสูตร รายวิชาและหน่วยกิต",
  444: "องค์ประกอบที่ 4 การจัดกระบวนการเรียนรู้",
  555: "องค์ประกอบที่ 5 ความพร้อมและศักยภาพในการบริหารจัดการหลักสูตรซึ่งรวมถึงคณะจารย์และที่ปรึกษาวิทยานิพนธ์",
  666: "องค์ประกอบที่ 6 คุณสมบัติของผู้เข้าศึกษา",
  777: "องค์ประกอบที่ 7 การประเมินผลการเรียนและเกณฑ์การสำเร็จการศึกษา",
  888: "องค์ประกอบที่ 8 การประกันคุณภาพหลักสูตร",
  900: "องค์ประกอบที่ 9 ระบบกลไกในการพัฒนาหลักสูตร",
  990: "ภาคผนวก",
}


export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  useEffect(() => {

    const data = idMap[id]

    if (!data) return

    fetch(`http://localhost:5000/api/programs/${data.slug}/${data.year}`)
      .then(res => res.json())
      .then(data => setProgram(data))

  }, [id])

  const currentData = program;


  if (!currentData) {
    return (
      <div className="bg-[#f8fafc] min-h-screen flex flex-col items-center justify-center p-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          ไม่พบข้อมูลหลักสูตร (ID: {id})
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#183153] text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-slate-700 transition-colors"
        >
          กลับไปหน้าก่อนหน้า
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      {/* Banner Header สีน้ำเงินเข้ม */}
      <div className="bg-[#183153] text-white py-8 shadow-lg">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10">
          <h1 className="text-3xl font-medium mb-3 tracking-tight">
            รายละเอียดหลักสูตร
          </h1>

          {/* Breadcrumbs ที่แสดงผลต่อเนื่องจากหน้า CourseSections */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-light opacity-90">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              หน้าหลัก
            </Link>
            <ChevronRight size={14} className="opacity-40" />

            <Link
              to={`/course-sections/${currentData.level || "bachelor"}`}
              className="hover:text-blue-400 transition-colors"
            >
              หลักสูตร
            </Link>
            <ChevronRight size={14} className="opacity-40" />

            {/* แสดงชื่อสาขาตาม level ที่ระบุไว้ในฐานข้อมูล */}
            <span className="">
              {(() => {
                const level = currentData.level;
                if (level === "cs-master") return "สาขาวิชาวิทยาการคอมพิวเตอร์";
                if (level === "se-master") return "สาขาวิชาวิศวกรรมซอฟต์แวร์";
                if (level === "cs-english") return "สาขาวิชาวิทยาการคอมพิวเตอร์ (โครงการพิเศษ สองภาษา)";
                if (level === "doctor") return "สาขาวิชาวิทยาการคอมพิวเตอร์";
                return "สาขาวิชาวิทยาการคอมพิวเตอร์ (ภาคปกติ)";
              })()}
            </span>

            <ChevronRight size={14} className="opacity-40" />
            <span className="text-slate-300 font-medium">{currentData.year}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-12 flex-grow w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#3F51B5] font-bold mb-8 group transition-all"
        >
          <div className="bg-white p-1.5 rounded-full shadow-sm mr-3 border border-gray-100 group-hover:shadow-md transition-all">
            <ChevronLeft size={18} />
          </div>
          ย้อนกลับ
        </button>

        {/* Card แสดงรายการหมวดหมู่ */}
        <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-[#183153] mb-2 leading-tight">
            {currentData.title}
          </h2>
          {currentData.subtitle && (
            <p className="text-slate-500 mb-10 text-lg">{currentData.subtitle}</p>
          )}

          <div className="grid grid-cols-1 gap-4">
            {currentData?.versions?.[0]?.sections.map((section) => (
              <div
                key={section.id}
                onClick={() => navigate(`/course-section/${section.id}`)}
                className="cursor-pointer flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl transition-all group hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-1.5 h-8 rounded-full bg-[#3F51B5]" />
                  <span className="text-lg font-medium text-slate-700 group-hover:text-[#183153] transition-colors">
                    {sectionTitles[section.order_index] || section.title}
                  </span>
                </div>

                <div className="text-slate-300 group-hover:text-[#183153] transition-all transform group-hover:scale-110">
                  <Eye size={22} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}