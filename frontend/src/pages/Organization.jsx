import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const orgData = {
  head: {
    name: 'รศ.ดร.ธนภัทร์ อนุศาสน์อมรกุล',
    role: 'หัวหน้าภาควิชาฯ',
    image: '/img/lecturers/TNA.jpg'
  },
  deputy: {
    name: 'ผศ.ดร.ลือพล พิพานเมฆาภรณ์',
    role: 'รองหัวหน้าภาควิชาฯ',
    image: '/img/lecturers/LPP.jpg'
  },

  assistants: [
    { 
      name: 'ผศ.ดร.นิกร สุทธิเสงี่ยม', 
      role: 'ผู้ช่วยหัวหน้าภาควิชา', 
      detail: 'ฝ่ายสารสนเทศและวิจัย',
      image: '/img/lecturers/NKS.jpg'
    },
    { 
      name: 'ผศ.ดร.คันธารัตน์ อเนกบุณย์', 
      role: 'ผู้ช่วยหัวหน้าภาควิชา', 
      detail: 'ฝ่ายกิจการนักศึกษา',
      image: '/img/lecturers/KAB.jpg' 
    },
    { 
      name: 'ผศ.ดร.อภิสิทธิ์ รัตนาตรานุรักษ์', 
      role: 'ผู้ช่วยหัวหน้าภาควิชา', 
      detail: 'ประกันคุณภาพการศึกษาและบริหารความเสี่ยง',
      image: '/img/lecturers/ART.jpg'
    },
    { 
      name: 'ผศ.ดร.สรร รัตนสัญญา', 
      role: 'ผู้ช่วยหัวหน้าภาควิชา', 
      detail: 'ฝ่ายสหกิจศึกษาและบริการวิชาการ',
      image: '/img/lecturers/SRS.jpg'
    }
  ]
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function Organization() {
  return (
    <div className="bg-white min-h-screen text-slate-700">
      {/* Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-center md:text-left">โครงสร้างการบริหารภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ</h1>
            <div className="w-12 h-1 bg-white/30 mb-4 mx-auto md:mx-0"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-20">
        
        {/* ระดับที่ 1: หัวหน้าภาควิชา */}
        <div className="flex justify-center mb-16 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full max-w-sm"
          >
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#3F51B5]"></div>
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-slate-50 shadow-md">
                {/* ลบ grayscale ออกเพื่อให้เป็นรูปสีปกติ */}
                <img src={orgData.head.image} alt={orgData.head.name} className="w-full h-full object-cover transition-all duration-500" />
              </div>
              <h3 className="text-[#3F51B5] font-bold text-lg mb-1">{orgData.head.name}</h3>
              <p className="text-slate-500 text-sm font-medium">{orgData.head.role}</p>
            </div>
          </motion.div>
        </div>

        {/* เส้นเชื่อมลงมา (Vertical Line) */}
        <div className="hidden md:block w-px h-12 bg-slate-200 mx-auto -mt-16 mb-8"></div>

        {/* ระดับที่ 2: รองหัวหน้าภาควิชา */}
        <div className="flex justify-center mb-16 relative">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full max-w-sm"
          >
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[#3F51B5]"></div>
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-6 border-4 border-slate-50 shadow-md">
                {/* ลบ grayscale ออกเพื่อให้เป็นรูปสีปกติ */}
                <img src={orgData.deputy.image} alt={orgData.deputy.name} className="w-full h-full object-cover transition-all duration-500" />
              </div>
              <h3 className="text-[#3F51B5] font-bold text-lg mb-1">{orgData.deputy.name}</h3>
              <p className="text-slate-500 text-sm font-medium">{orgData.deputy.role}</p>
            </div>
          </motion.div>
        </div>

        {/* ส่วนกรรมการบริหาร (Section Divider) */}
        <div className="flex flex-col items-center mb-20">
          <div className="w-px h-12 bg-slate-200"></div>
          <div className="bg-slate-800 text-white px-8 py-2 rounded-md text-xs font-bold uppercase tracking-[0.2em] shadow-md">
            กรรมการบริหาร
          </div>
          <div className="w-px h-12 bg-slate-200"></div>
          <div className="hidden lg:block w-[75%] h-px bg-slate-200 -mt-px"></div>
        </div>

        {/* ระดับที่ 3: ผู้ช่วยหัวหน้าภาควิชา (4 ท่าน) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {orgData.assistants.map((item, idx) => (
            <motion.div 
              key={idx}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className="hidden lg:block absolute top-[-48px] left-1/2 -translate-x-1/2 w-px h-12 bg-slate-200"></div>
              
              <div className="bg-white rounded-xl shadow-md border border-slate-50 p-6 text-center hover:shadow-xl transition-all duration-300 group h-full">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-4 border-2 border-slate-100 shadow-sm">
                  {/* ลบ grayscale ออกเพื่อให้เป็นรูปสีปกติ */}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-all duration-500" />
                </div>
                <h4 className="text-slate-800 font-bold text-sm mb-2 group-hover:text-[#3F51B5] transition-colors">{item.name}</h4>
                <div className="space-y-1">
                  <p className="text-[#3F51B5] text-[10px] font-bold uppercase tracking-tighter leading-tight">{item.role}</p>
                  <p className="text-slate-400 text-[10px] font-light italic leading-tight">{item.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  );
}