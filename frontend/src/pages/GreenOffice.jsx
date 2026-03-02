import React from 'react';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

// รูปภาพจากสื่อประชาสัมพันธ์
const campaignImages = [
  { title: "CS Cleaning office day", url: "https://cs.kmutnb.ac.th/img/greenoffice/cleaning_day.jpg" },
  { title: "CS แยกขยะ: \"คิดก่อนทิ้ง แยกก่อนโยน\"", url: "https://cs.kmutnb.ac.th/img/greenoffice/trash_separate.jpg" },
  { title: "7 นโยบายสิ่งแวดล้อม สำนักงานสีเขียว (Green Office)", url: "https://cs.kmutnb.ac.th/img/greenoffice/7policies.jpg" },
  { title: "เป้าหมายสิ่งแวดล้อมของภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ", url: "https://cs.kmutnb.ac.th/img/greenoffice/goal.jpg" },
  { title: "CS รณรงค์เลิกบุหรี่", url: "https://cs.kmutnb.ac.th/img/greenoffice/no_smoking.jpg" },
  { title: "ห้ามสูบบุหรี่ฝ่าฝืนมีโทษปรับตามกฎหมาย", url: "https://cs.kmutnb.ac.th/img/greenoffice/no_smoking_sign.jpg" },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function GreenOffice() {
  return (
    <div className="bg-white font-['Prompt'] min-h-screen text-slate-700 overflow-x-hidden">
      
      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        
        {/* ส่วน Banner Image */}
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeInUp}
          className="mb-12 w-full rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100"
        >
          <img 
            src="/img/greenoffice/green-office.png"
            className="w-full h-auto object-cover block"
            alt="CS Go Green Banner"
            onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?q=80&w=2026&auto=format&fit=crop"; 
            }}
          />
        </motion.div>

        {/* ส่วนเนื้อหาหลัก */}
        <div className="mb-20">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp}
            className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm"
          >
            {/* นำ Target Icon ออกแล้ว เหลือเพียงข้อความหัวข้อ */}
            <h2 className="text-2xl md:text-2xl font-bold mb-8 text-[#3F51B5]">
              CS Green Office :
            </h2>
            <div className="grid grid-cols-1 gap-8 text-emerald-700 font-light leading-relaxed text-base md:text-lg">
              <p>
                การดำเนินกิจกรรมต่าง ๆ ล้วนต้องใช้ทรัพยากร พลังงาน และก่อให้เกิดผลกระทบต่อสิ่งแวดล้อมทั้งขยะและน้ำเสีย รวมถึงการปล่อยก๊าซเรือนกระจก สู่ชั้นบรรยากาศอันเป็นสาเหตุหลักของการเปลี่ยนแปลงสภาพภูมิอากาศ (Climate Change) และปรากฏการณ์โลกร้อน (Global Warming) ที่กำลังกลายเป็นวิกฤติด้านสิ่งแวดล้อมที่สำคัญ และผลกระทบอย่างกว้างขวางในการดำเนินชีวิตของคนทั่วโลก
              </p>
              <p>
                ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ เป็นหน่วยงานที่สนับสนุนและส่งเสริมการดำเนินงานด้านการจัดการสำนักงานสีเขียว (Green Office) โดยมีการกำหนดเป็นค่านิยมของสำนัก คือ <span className="font-bold italic">ริเริ่มสร้างสรรค์ มุ่งมั่นพัฒนา รักษาสิ่งแวดล้อม</span> เพื่อมุ่งเน้นปรับเปลี่ยนพฤติกรรมและกระตุ้นการมีส่วนร่วมของบุคลากรภายในส่วนงาน ลดการใช้พลังงานและทรัพยากร ลดการเกิดของเสีย และมีการดำเนินการที่เป็นมิตรกับสิ่งแวดล้อม มีการจัดซื้อจัดจ้างสินค้าและบริการที่เป็นมิตรกับสิ่งแวดล้อม (Green Procurement) เพื่อช่วยลดการปล่อยก๊าซเรือนกระจกออกสู่บรรยากาศ และตอบสนองตามนโยบายของมหาวิทยาลัย คือ เป็นมหาวิทยาลัยแห่งการจัดการอย่างยั่งยืน
              </p>
              <p>
                ปัจจุบันเกณฑ์การประเมินสำนักงานสีเขียว (Green Office) ประกอบด้วย 6 หมวด ดังนี้ หมวดที่ 1 นโยบายวางแผนการดำเนินงานและการปรับปรุงอย่างต่อเนื่อง หมวดที่ 2 การสื่อสารและสร้างจิตสำนึก หมวดที่ 3 การใช้ทรัพยากรและพลังงาน หมวดที่ 4 การจัดการของเสีย หมวดที่ 5 สภาพแวดล้อมและความปลอดภัย และหมวดที่ 6 การจัดซื้อและจัดจ้างโดยมีการนำเกณฑ์ดังกล่าวมาใช้ในสำนักงาน เพื่อปรับเปลี่ยนพฤติกรรมในสำนักงานเพื่อลดการใช้พลังงานและริเริ่มกิจกรรมที่เป็นมิตรกับสิ่งแวดล้อม เช่น ลดปริมาณขยะโดยการลดการใช้ การใช้ซ้ำ การนำกลับมาใช้ใหม่ การลดและเลิกใช้สารเคมีอันตราย รองรับการจัดซื้อจัดจ้างสินค้าและบริการที่เป็นมิตรกับสิ่งแวดล้อม (Green Procurement) เป็นต้น ส่งผลให้เกิดการลดการปล่อย Green House Gases (GHG) ในทุกภาคส่วน และตลอดห่วงโซ่การผลิตและการบริโภค นำไปสู่การผลิตและบริโภคที่เป็นมิตรกับสิ่งแวดล้อมอย่างยั่งยืน
              </p>
            </div>
          </motion.div>
        </div>

        {/* ส่วนสื่อประชาสัมพันธ์ */}
        <section className="mb-10">
          <div className="flex items-center gap-4 mb-16">
             <div className="h-px flex-1 bg-slate-200"></div>
             <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-xl md:text-2xl font-bold text-center text-[#3F51B5] uppercase tracking-widest whitespace-nowrap">
               CS รณรงค์ลดโลกร้อนและรักษาสิ่งแวดล้อม
             </motion.h2>
             <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {campaignImages.map((img, idx) => (
              <motion.div 
                key={idx} 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={fadeInUp} 
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-md border border-slate-100 mb-4 bg-slate-100 flex items-center justify-center">
                    <img 
                        src={img.url} 
                        className="w-full h-full object-cover" 
                        alt={img.title} 
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                    <div className="hidden text-slate-400 italic text-xs p-4 text-center">
                        {img.title}
                    </div>
                </div>
                <p className="text-center text-[13px] font-bold text-slate-500 uppercase tracking-tighter line-clamp-2 px-2 leading-relaxed">
                  {img.title}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}