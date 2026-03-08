import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FileText } from "lucide-react";

export default function CourseSectionContent() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [section, setSection] = useState(null);

  useEffect(() => {

    fetch(`http://localhost:5000/api/program-sections/${id}`)
      .then(res => res.json())
      .then(data => setSection(data))
      .catch(err => console.error(err));

  }, [id]);

  if (!section) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-slate-500 text-lg">กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen font-['Prompt']">

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#3F51B5] font-bold mb-8 group"
        >
          <ChevronLeft size={20} className="mr-2" />
          กลับ
        </button>

        {/* card */}
        <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-10">

          <h1 className="text-2xl font-bold text-[#183153] mb-6">
            {section.title}
          </h1>

          {/* content */}
          <div className="prose max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
            {section.content}
          </div>

          {/* pdf button */}
          <div className="mt-10">
            <a
              href={`http://localhost:5000/uploads/${section.pdf_path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#3F51B5] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#2f3ea3] transition"
            >
              <FileText size={18} />
              เปิดไฟล์ PDF ต้นฉบับ
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}