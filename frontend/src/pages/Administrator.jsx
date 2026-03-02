import React, { useState, useEffect } from 'react';import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import axios from 'axios';

// // ฟังก์ชันช่วยสร้าง URL Slug จากชื่ออาจารย์
// const createSlug = (name) => {
//   return name.replace(/\s+/g, '-').replace(/\./g, '');
// };

// // ข้อมูลผู้บริหาร
// const headOfDepartment = {
//   name: "รศ.ดร.ธนภัทร์ อนุศาสน์อมรกุล",
//   role: "หัวหน้าภาควิชาฯ",
//   image: "/img/staff/tanapat.jpg"
// };

// const deputyHead = {
//   name: "ผศ.ดร.ลือพล พิพานเมฆาภรณ์",
//   role: "รองหัวหน้าภาควิชาฯ",
//   image: "/img/staff/luepol.jpg"
// };

// const assistants = [
//   { name: "ผศ.ดร.นิกร สุทธิเสงี่ยม", role: "ผู้ช่วยหัวหน้าภาควิชา", dept: "ฝ่ายสารสนเทศและวิจัย", image: "/img/staff/nikorn.jpg" },
//   { name: "ผศ.ดร.คันธารัตน์ อเนกบุณย์", role: "ผู้ช่วยหัวหน้าภาควิชา", dept: "ฝ่ายกิจการนักศึกษา", image: "/img/staff/kantharat.jpg" },
//   { name: "ผศ.ดร.อภิสิทธิ์ รัตนาตรานุรักษ์", role: "ผู้ช่วยหัวหน้าภาควิชา", dept: "ฝ่ายประกันคุณภาพการศึกษาและบริหารความเสี่ยง", image: "/img/staff/apisit.jpg" },
//   { name: "ผศ.ดร.สรร รัตนสัญญา", role: "ผู้ช่วยหัวหน้าภาควิชา", dept: "ฝ่ายสหกิจศึกษาและบริการวิชาการ", image: "/img/staff/soros.jpg" }
// ];

// const facultyMembers = [
//   { name: "ผศ.นนทกร สถิตานนท์", role: "รองคณบดีฝ่ายกิจการนักศึกษาและศิษย์เก่าสัมพันธ์", image: "/img/staff/nontakorn.jpg" },
//   { name: "รศ.ดร.กฤดาภัทร สีหารี", role: "อาจารย์ประจำ", image: "/img/staff/kridaohat.jpg" },
//   { name: "รศ.ดร.กอบเกียรติ สระอุบล", role: "อาจารย์ประจำ", image: "/img/staff/kobkiat.jpg" },
//   { name: "รศ.ดร.ปรวัฒน์ วิสูตรศักดิ์", role: "อาจารย์ประจำ", image: "/img/staff/prawat.jpg" },
//   { name: "รศ.ดร.เบญจพร ลิ้มธรรมาภรณ์", role: "อาจารย์ประจำ", image: "/img/staff/benjaporn.jpg" },
//   { name: "ผศ.ดร.อัครา ประโยชน์", role: "อาจารย์ประจำ", image: "/img/staff/akara.jpg" },
//   { name: "ผศ.ดร.สุวัจชัย กมลสันติโรจน์", role: "อาจารย์ประจำ", image: "/img/staff/suwatchai.jpg" },
//   { name: "อาจารย์ ปรัชญาพร เลี้ยงสุทธิสกนธ์", role: "อาจารย์ประจำ", image: "/img/staff/parinyaporn.jpg" },
//   { name: "อาจารย์ ณัฐวุฒิ สร้อยดอกสน", role: "รองคณบดีฝ่ายกิจการนักศึกษาและศิษย์เก่าสัมพันธ์", dept: "สำนักคอมพิวเตอร์และเทคโนโลยีสารสนเทศ", image: "/img/staff/nontakorn.jpg" },
//   { name: "อาจารย์ อนุสรณ์ วงษ์สนิท", role: "อาจารย์ประจำ", image: "/img/staff/kridaohat.jpg" },
//   { name: "รศ.ดร.เฉียบวุฒิ รัตนวิไลสกุล", role: "อาจารย์ประจำ", image: "/img/staff/kobkiat.jpg" },
//   { name: "อาจารย์ ดร.ยนต์ชนก เขาแก้ว", role: "อาจารย์ประจำ", image: "/img/staff/prawat.jpg" },
//   { name: "ผศ.สถิตย์ ประสมพันธ์", role: "อาจารย์ประจำ", image: "/img/staff/benjaporn.jpg" },
//   { name: "อาจารย์ เอิญ สุริยะฉาย", role: "อาจารย์ประจำ", image: "/img/staff/akara.jpg" },
//   { name: "ผศ.ดร.ธรรศฏภณ สุระศักดิ์", role: "อาจารย์ประจำ", image: "/img/staff/suwatchai.jpg" },
//   { name: "อาจารย์ ดร.ณัฐกิตติ์ จิตรเอื้อตระกูล", role: "อาจารย์ประจำ", image: "/img/staff/parinyaporn.jpg" }
// ];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Administrator() {
   const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/api/lecturers")
      .then(res => {
        setLecturers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  // 🔥 แบ่งกลุ่มจากตำแหน่ง
  const head = lecturers.find(l => l.position_en === "Head of Department");
  const deputy = lecturers.find(l => l.position_en === "Associate Head of Department");

  const assistants = lecturers.filter(l =>
    l.position_en?.includes("Assistant to the Head")
  );

  const faculty = lecturers.filter(l =>
    !l.position_en?.includes("Head") &&
    !l.position_en?.includes("Assistant")
  );

  return (
    <div className="bg-slate-50 font-['Prompt'] min-h-screen text-slate-700">
      
      {/* Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">บุคลากรสายวิชาการ</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {/* คณะผู้บริหาร (Executive Section) */}
        <section className="mb-24 text-center">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#3F51B5]">ผู้บริหารภาควิชา</h2>
            <div className="w-16 h-1 bg-[#3F51B5] mx-auto mt-4"></div>
          </div>
          
          {/* แถวที่ 1: หัวหน้าภาควิชา */}
          {head && (
            <div className="flex justify-center mb-16">
              <Link to={`/administrator/${head.lecturer_code}`} className="w-72 block group">
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible">
                  <div className="relative aspect-[3/4] mb-6 rounded-3xl overflow-hidden shadow-xl border-4 border-[#3F51B5]/20 bg-white transition-transform group-hover:-translate-y-2">
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <img
                        src={`http://localhost:5000${head.image_path}`}
                        alt={head.fullname_th}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => e.target.style.display='none'}
                      />
                      <User size={80} className="text-slate-400 absolute" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 group-hover:text-[#3F51B5]">
                    {head.name_th}
                  </h3>
                  <p className="text-[#3F51B5] font-bold text-sm uppercase tracking-wide">
                    {head.position_th}
                  </p>
                </motion.div>
              </Link>
            </div>
          )}

          {/* แถวที่ 2: รองหัวหน้าภาควิชา */}
          {deputy && (
            <div className="flex justify-center mb-20">
              <Link to={`/administrator/${deputy.lecturer_code}`} className="w-64 block group">
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible">
                  <div className="relative aspect-[3/4] mb-6 rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-white transition-transform group-hover:-translate-y-2">
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                      <img
                        src={`http://localhost:5000${deputy.image_path}`}
                        alt={deputy.fullname_th}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <User size={70} className="text-slate-400 absolute" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-[#3F51B5]">
                    {deputy.fullname_th}
                  </h3>
                  <p className="text-[#3F51B5] font-medium text-sm">
                    {deputy.position_th}
                  </p>
                </motion.div>
              </Link>
            </div>
          )}

           {/* Assistants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {assistants.map((staff) => (
              <Link key={staff.lecturer_code}
                to={`/administrator/${staff.lecturer_code}`}
                className="group block">
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible">
                  <div className="relative aspect-[3/4] mb-6 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white group-hover:shadow-xl group-hover:-translate-y-2">
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <img
                        src={`http://localhost:5000${staff.image_path}`}
                        alt={staff.fullname_th}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <User size={50} className="text-slate-300 absolute" />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1 group-hover:text-[#3F51B5]">
                    {staff.fullname_th}
                  </h4>
                  <p className="text-[11px] text-[#3F51B5] font-black uppercase tracking-tighter">
                    {staff.position_th}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        {/* คณาจารย์ (Faculty Section) */}
        <section className="text-center">
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#3F51B5]">คณาจารย์</h2>
            <div className="w-16 h-1 bg-[#3F51B5] mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {faculty.map((staff) => (
              <Link key={staff.lecturer_code}
                to={`/administrator/${staff.lecturer_code}`}
                className="group block text-center">
                <motion.div variants={fadeInUp} initial="hidden" whileInView="visible">
                  <div className="relative aspect-[3/4] mb-6 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-white group-hover:shadow-lg group-hover:-translate-y-2">
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                      <img
                        src={`http://localhost:5000${staff.image_path}`}
                        alt={staff.fullname_th}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <User size={50} className="text-slate-200 absolute" />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1 text-sm group-hover:text-[#3F51B5]">
                    {staff.fullname_th}
                  </h4>
                  <p className="text-[11px] text-[#3F51B5] font-medium">
                    {staff.position_th || "อาจารย์ประจำ"}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}