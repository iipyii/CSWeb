import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const defaultContentTh = `การดำเนินกิจกรรมต่าง ๆ ล้วนต้องใช้ทรัพยากร พลังงาน และก่อให้เกิดผลกระทบต่อสิ่งแวดล้อมทั้งขยะและน้ำเสีย รวมถึงการปล่อยก๊าซเรือนกระจก สู่ชั้นบรรยากาศอันเป็นสาเหตุหลักของการเปลี่ยนแปลงสภาพภูมิอากาศ (Climate Change) และปรากฏการณ์โลกร้อน (Global Warming) ที่กำลังกลายเป็นวิกฤติด้านสิ่งแวดล้อมที่สำคัญ และผลกระทบอย่างกว้างขวางในการดำเนินชีวิตของคนทั่วโลก\n\nภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ เป็นหน่วยงานที่สนับสนุนและส่งเสริมการดำเนินงานด้านการจัดการสำนักงานสีเขียว (Green Office) โดยมีการกำหนดเป็นค่านิยมของสำนัก คือ ริเริ่มสร้างสรรค์ มุ่งมั่นพัฒนา รักษาสิ่งแวดล้อม เพื่อมุ่งเน้นปรับเปลี่ยนพฤติกรรมและกระตุ้นการมีส่วนร่วมของบุคลากรภายในส่วนงาน ลดการใช้พลังงานและทรัพยากร ลดการเกิดของเสีย และมีการดำเนินการที่เป็นมิตรกับสิ่งแวดล้อม มีการจัดซื้อจัดจ้างสินค้าและบริการที่เป็นมิตรกับสิ่งแวดล้อม (Green Procurement) เพื่อช่วยลดการปล่อยก๊าซเรือนกระจกออกสู่บรรยากาศ และตอบสนองตามนโยบายของมหาวิทยาลัย คือ เป็นมหาวิทยาลัยแห่งการจัดการอย่างยั่งยืน\n\nปัจจุบันเกณฑ์การประเมินสำนักงานสีเขียว (Green Office) ประกอบด้วย 6 หมวด ดังนี้ หมวดที่ 1 นโยบายวางแผนการดำเนินงานและการปรับปรุงอย่างต่อเนื่อง หมวดที่ 2 การสื่อสารและสร้างจิตสำนึก หมวดที่ 3 การใช้ทรัพยากรและพลังงาน หมวดที่ 4 การจัดการของเสีย หมวดที่ 5 สภาพแวดล้อมและความปลอดภัย และหมวดที่ 6 การจัดซื้อและจัดจ้างโดยมีการนำเกณฑ์ดังกล่าวมาใช้ในสำนักงาน เพื่อปรับเปลี่ยนพฤติกรรมในสำนักงานเพื่อลดการใช้พลังงานและริเริ่มกิจกรรมที่เป็นมิตรกับสิ่งแวดล้อม เช่น ลดปริมาณขยะโดยการลดการใช้ การใช้ซ้ำ การนำกลับมาใช้ใหม่ การลดและเลิกใช้สารเคมีอันตราย รองรับการจัดซื้อจัดจ้างสินค้าและบริการที่เป็นมิตรกับสิ่งแวดล้อม (Green Procurement) เป็นต้น ส่งผลให้เกิดการลดการปล่อย Green House Gases (GHG) ในทุกภาคส่วน และตลอดห่วงโซ่การผลิตและการบริโภค นำไปสู่การผลิตและบริโภคที่เป็นมิตรกับสิ่งแวดล้อมอย่างยั่งยืน`;

const defaultContentEn = `All organizational activities consume natural resources and energy while generating environmental burdens including solid waste, wastewater, and greenhouse gas emissions into the atmosphere. These emissions are primary drivers of climate change and global warming, which have escalated into critical planetary crises with profound implications for livelihoods worldwide.\n\nThe Department of Computer and Information Science, King Mongkut's University of Technology North Bangkok (KMUTNB), actively promotes and operates under Green Office standards. Guided by our foundational motto — "Initiative, Dedication to Progress, and Environmental Care" — we actively drive behavioral transformation and encourage all personnel to minimize energy and resource consumption, cut waste generation, adopt eco-friendly operational workflows, and implement Green Procurement policies. These collective actions support KMUTNB's institutional vision of becoming a sustainable university.\n\nGreen Office assessment guidelines encompass 6 foundational categories: Category 1: Policy, Planning, and Continual Improvement; Category 2: Communication and Awareness Building; Category 3: Resource and Energy Management; Category 4: Waste Management; Category 5: Environmental Quality and Occupational Safety; and Category 6: Green Procurement. Applying these assessment standards within the department fosters tangible workplace habits, promotes the 3Rs (Reduce, Reuse, Recycle), phases out toxic chemical usage, and optimizes green procurement practices. Together, these measures curtail greenhouse gas (GHG) emissions across the entire life cycle, advancing a resilient and sustainable future.`;

const campaignTitleEnMap = {
  "CS Cleaning office day": "CS Office Cleaning Day",
  "CS แยกขยะ: \"คิดก่อนทิ้ง แยกก่อนโยน\"": 'CS Waste Separation: "Think Before You Throw"',
  "7 นโยบายสิ่งแวดล้อม สำนักงานสีเขียว (Green Office)": "7 Environmental Policies for Green Office",
  "เป้าหมายสิ่งแวดล้อมของภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ": "CIS Department Environmental Objectives",
  "CS รณรงค์เลิกบุหรี่": "CS Anti-Smoking Campaign",
  "ห้ามสูบบุหรี่ฝ่าฝืนมีโทษปรับตามกฎหมาย": "No Smoking Area (Subject to Legal Fines)",
};

const defaultData = {
  banner_image: "/img/greenoffice/green-office.png",
  title: "CS Green Office :",
  title_en: "CS Green Office :",
  content: defaultContentTh,
  content_en: defaultContentEn,
  section_title: "CS รณรงค์ลดโลกร้อนและรักษาสิ่งแวดล้อม",
  section_title_en: "CS Climate Action & Environmental Stewardship",
  campaign_images: [
    { title: "CS Cleaning office day", url: "https://cs.kmutnb.ac.th/img/greenoffice/cleaning_day.jpg" },
    { title: "CS แยกขยะ: \"คิดก่อนทิ้ง แยกก่อนโยน\"", url: "https://cs.kmutnb.ac.th/img/greenoffice/trash_separate.jpg" },
    { title: "7 นโยบายสิ่งแวดล้อม สำนักงานสีเขียว (Green Office)", url: "https://cs.kmutnb.ac.th/img/greenoffice/7policies.jpg" },
    { title: "เป้าหมายสิ่งแวดล้อมของภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ", url: "https://cs.kmutnb.ac.th/img/greenoffice/goal.jpg" },
    { title: "CS รณรงค์เลิกบุหรี่", url: "https://cs.kmutnb.ac.th/img/greenoffice/no_smoking.jpg" },
    { title: "ห้ามสูบบุหรี่ฝ่าฝืนมีโทษปรับตามกฎหมาย", url: "https://cs.kmutnb.ac.th/img/greenoffice/no_smoking_sign.jpg" },
  ]
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function GreenOffice() {
  const { lang } = useLanguage();
  const [data, setData] = useState(defaultData);

  useEffect(() => {
    const fetchGreenOffice = async () => {
      try {
        const res = await axios.get('/api/about/green-office');
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load green office data:', err);
      }
    };
    fetchGreenOffice();
  }, []);

  const bannerSrc = data.banner_image || defaultData.banner_image;
  
  const rawContent = lang === 'EN' 
    ? (data.content_en || defaultContentEn)
    : (data.content || defaultContentTh);
  const paragraphs = rawContent.split('\n\n').filter(Boolean);

  const sectionTitle = lang === 'EN'
    ? (data.section_title_en || "CS Climate Action & Environmental Stewardship")
    : (data.section_title || "CS รณรงค์ลดโลกร้อนและรักษาสิ่งแวดล้อม");

  const campaignImages = data.campaign_images || defaultData.campaign_images;

  const getCampaignTitle = (img) => {
    if (lang === 'EN') {
      if (img.title_en) return img.title_en;
      if (campaignTitleEnMap[img.title]) return campaignTitleEnMap[img.title];
    }
    return img.title;
  };

  return (
    <div className="bg-white min-h-screen text-slate-700 overflow-x-hidden">
      
      <main className="max-w-5xl mx-auto px-6 md:px-10 py-12 md:py-20">
        
        {/* Banner Image */}
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={fadeInUp}
          className="mb-12 w-full rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100"
        >
          <img 
            src={bannerSrc}
            className="w-full h-auto object-cover block"
            alt="CS Go Green Banner"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?q=80&w=2026&auto=format&fit=crop"; 
            }}
          />
        </motion.div>

        {/* Content Section */}
        <div className="mb-20">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp}
            className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm"
          >
            <h2 className="text-2xl md:text-2xl font-bold mb-8 text-[#3F51B5]">
              {data.title || "CS Green Office :"}
            </h2>
            <div className="grid grid-cols-1 gap-8 text-emerald-700 font-light leading-relaxed text-base md:text-lg">
              {paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Campaign Media Section */}
        <section className="mb-10">
          <div className="flex items-center gap-4 mb-16">
             <div className="h-px flex-1 bg-slate-200"></div>
             <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-xl md:text-2xl font-bold text-center text-[#3F51B5] uppercase tracking-widest whitespace-nowrap">
               {sectionTitle}
             </motion.h2>
             <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaignImages.map((img, idx) => {
              const localizedTitle = getCampaignTitle(img);
              return (
                <motion.div 
                  key={idx} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={fadeInUp} 
                  transition={{ delay: idx * 0.1 }}
                  className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-50 flex items-center justify-center p-3">
                    <img 
                      src={img.url} 
                      className="w-full h-full object-contain max-w-full max-h-full block transition-transform duration-300 group-hover:scale-105" 
                      alt={localizedTitle} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'block';
                        }
                      }}
                    />
                    <div className="hidden text-slate-400 italic text-xs p-4 text-center">
                      {localizedTitle}
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-white flex-1 flex items-center justify-center">
                    <p className="text-center text-sm font-bold text-slate-700 leading-snug line-clamp-2 px-1">
                      {localizedTitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}