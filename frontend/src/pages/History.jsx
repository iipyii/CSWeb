import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Footer from '../components/Footer';

const timelineData = [
  {
    year: '2530',
    title: 'การเปิดรับนักศึกษาระดับปริญญาตรีรุ่นแรก',
    description: 'ภาควิชาคณิตศาสตร์ คณะวิทยาศาสตร์ประยุกต์ เริ่มเปิดรับนักศึกษาระดับปริญญาตรี หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ประยุกต์ เพื่อผลิตบุคลากรทางด้านคอมพิวเตอร์เป็นรุ่นแรกของมหาวิทยาลัย',
  },
  {
    year: '2536',
    title: 'การจัดตั้งภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ',
    description: 'เมื่อบุคลากรในด้านวิทยาการคอมพิวเตอร์มากขึ้น จึงได้แยกออกมาจากภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์ ก่อตั้งเป็นภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ และรับหลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ประยุกต์มาบริหารจัดการ และได้เปิดรับนักศึกษาในหลักสูตรดังต่อไปนี้เพิ่มเติม',
  },
  {
    year: '2537',
    title: 'หลักสูตรวิทยาศาสตรบัณฑิต',
    description: 'เปิดรับนักศึกษาในหลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (ต่อเนื่อง) และหยุดรับนักศึกษาในปีพุทธศักราช 2553',
  },
  {
    year: '2546',
    title: 'ขยายการศึกษาสู่ระดับบัณฑิตศึกษา',
    description: 'เปิดรับนักศึกษาในหลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ และมีการปรับปรุงเรื่อยมา ล่าสุดปรับปรุงปีพุทธศักราช 2562',
  },
  {
    year: '2554',
    title: 'เปิดหลักสูตรระดับปริญญาเอก',
    description: 'เปิดรับนักศึกษาในหลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ และปรับปรุงในปีพุทธศักราช 2559',
  },
  {
    year: '2559',
    title: 'เปิดหลักสูตรวิศวกรรมซอฟต์แวร์',
    description: 'ปีพุทธศักราช 2559 ในภาคการศึกษาที่ 2 เปิดรับนักศึกษาในหลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์ ซึ่งเป็นหลักสูตรใหม่',
  },
  {
    year: 'ปัจจุบัน',
    title: 'ความเป็นเลิศทางวิชาการและสหกิจศึกษา',
    description: 'ปัจจุบันภาควิชามีการเรียนการสอนใน 4 หลักสูตร สนับสนุนการเรียนการสอนให้มีความสามารถทั้งทฤษฎีและปฏิบัติ มีความร่วมมือกับหน่วยงานรัฐและเอกชน สนับสนุนการปฏิบัติงานสหกิจศึกษาทั้งในและต่างประเทศ',
  }
];

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

export default function History() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-white font-['Prompt'] min-h-screen text-slate-700 overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-[#3F51B5] z-50 origin-[0%]"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ประวัติความเป็นมา</h1>
            <div className="w-12 h-1 bg-white/30 mb-5"></div>
          </motion.div>
        </div>
        <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
          <h2 className="text-[5rem] font-bold">CIS</h2>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        
        <div className="max-w-3xl mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >

            <p className="text-slate-800 mb-0 leading-relaxed font-light text-base md:text-lg">
              ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ ก่อตั้งขึ้นในปีพุทธศักราช 2536<br/>
              โดยแยกออกมาจาก ภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์<br/>
              คณะวิทยาศาสตร์ประยุกต์ซึ่งเดิมคือภาควิชาคณิตศาสตร์ คณะครุศาสตร์อุตสาหกรรม
            </p>
          </motion.div>
        </div>

        {/* Vertical Timeline Section */}
        <div className="relative max-w-4xl mx-auto">
         

          {/* เส้นแนวตั้งหลัก (ชิดซ้าย) */}
          <div className="absolute left-4 md:left-8 top-0 w-[2px] h-full bg-slate-100"></div>

          <div className="space-y-12">
            {timelineData.map((item, index) => (
              <motion.div 
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={itemVariants}
                className="relative pl-12 md:pl-20"
              >
                {/* จุดวงกลมบนเส้นแนวตั้ง */}
                <div className="absolute left-[11px] md:left-[27px] top-2 flex items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    className="w-3 h-3 rounded-full bg-[#3F51B5] border-2 border-white shadow-sm z-10"
                  />
                  <motion.div 
                    initial={{ scale: 0, opacity: 0.5 }}
                    whileInView={{ scale: 2.5, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute w-3 h-3 rounded-full bg-[#3F51B5] z-0"
                  />
                </div>

                {/* เนื้อหาประวัติ */}
                <motion.div 
                  whileHover={{ x: 10 }}
                  className="group cursor-default"
                >
                  <div className="inline-block px-3 py-1 bg-slate-50 border border-slate-100 rounded text-[#3F51B5] font-bold text-sm mb-3 group-hover:bg-[#3F51B5] group-hover:text-white transition-all duration-300">
                    พ.ศ. {item.year}
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#3F51B5] transition-colors duration-300">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 font-light leading-relaxed text-sm md:text-base max-w-2xl">
                    {item.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}