import { prisma } from "../lib/prisma.js";
import path from "path";
import fs from "fs";

// Default Fallback Data
export const defaultOrganization = {
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

export const defaultHistory = {
  header_text: `ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ ก่อตั้งขึ้นในปีพุทธศักราช 2536\nโดยแยกออกมาจาก ภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์\nคณะวิทยาศาสตร์ประยุกต์ซึ่งเดิมคือภาควิชาคณิตศาสตร์ คณะครุศาสตร์อุตสาหกรรม`,
  timeline: [
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
  ]
};

export const defaultContact = {
  name: "ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ",
  faculty: "คณะวิทยาศาสตร์ประยุกต์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
  address: "1518 ถนนประชาราษฎร์ 1 แขวงวงศ์สว่าง เขตบางซื่อ กรุงเทพฯ 10800",
  phone: "02-555-2000 ต่อ 4601, 4602 (ในเวลาราชการ)",
  office_hours: "จันทร์ - ศุกร์ | 08:30 - 16:30 น.",
  facebook: "CIS KMUTNB",
  facebookUrl: "https://www.facebook.com/profile.php?id=100057122843991#",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3874.331163158434!2d100.51184657589574!3d13.819129595749764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b9f7158782f%3A0xc3f832729a8a783!2sDepartment%20of%20Computer%20and%20Information%20Science%20(CIS)%2C%20KMUTNB!5e0!3m2!1sen!2sth!4v1708600000000!5m2!1sen!2sth"
};

export const defaultGreenOffice = {
  banner_image: "/img/greenoffice/green-office.png",
  title: "CS Green Office :",
  content: `การดำเนินกิจกรรมต่าง ๆ ล้วนต้องใช้ทรัพยากร พลังงาน และก่อให้เกิดผลกระทบต่อสิ่งแวดล้อมทั้งขยะและน้ำเสีย รวมถึงการปล่อยก๊าซเรือนกระจก สู่ชั้นบรรยากาศอันเป็นสาเหตุหลักของการเปลี่ยนแปลงสภาพภูมิอากาศ (Climate Change) และปรากฏการณ์โลกร้อน (Global Warming) ที่กำลังกลายเป็นวิกฤติด้านสิ่งแวดล้อมที่สำคัญ และผลกระทบอย่างกว้างขวางในการดำเนินชีวิตของคนทั่วโลก\n\nภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ เป็นหน่วยงานที่สนับสนุนและส่งเสริมการดำเนินงานด้านการจัดการสำนักงานสีเขียว (Green Office) โดยมีการกำหนดเป็นค่านิยมของสำนัก คือ ริเริ่มสร้างสรรค์ มุ่งมั่นพัฒนา รักษาสิ่งแวดล้อม เพื่อมุ่งเน้นปรับเปลี่ยนพฤติกรรมและกระตุ้นการมีส่วนร่วมของบุคลากรภายในส่วนงาน ลดการใช้พลังงานและทรัพยากร ลดการเกิดของเสีย และมีการดำเนินการที่เป็นมิตรกับสิ่งแวดล้อม มีการจัดซื้อจัดจ้างสินค้าและบริการที่เป็นมิตรกับสิ่งแวดล้อม (Green Procurement) เพื่อช่วยลดการปล่อยก๊าซเรือนกระจกออกสู่บรรยากาศ และตอบสนองตามนโยบายของมหาวิทยาลัย คือ เป็นมหาวิทยาลัยแห่งการจัดการอย่างยั่งยืน\n\nปัจจุบันเกณฑ์การประเมินสำนักงานสีเขียว (Green Office) ประกอบด้วย 6 หมวด ดังนี้ หมวดที่ 1 นโยบายวางแผนการดำเนินงานและการปรับปรุงอย่างต่อเนื่อง หมวดที่ 2 การสื่อสารและสร้างจิตสำนึก หมวดที่ 3 การใช้ทรัพยากรและพลังงาน หมวดที่ 4 การจัดการของเสีย หมวดที่ 5 สภาพแวดล้อมและความปลอดภัย และหมวดที่ 6 การจัดซื้อและจัดจ้างโดยมีการนำเกณฑ์ดังกล่าวมาใช้ในสำนักงาน เพื่อปรับเปลี่ยนพฤติกรรมในสำนักงานเพื่อลดการใช้พลังงานและริเริ่มกิจกรรมที่เป็นมิตรกับสิ่งแวดล้อม เช่น ลดปริมาณขยะโดยการลดการใช้ การใช้ซ้ำ การนำกลับมาใช้ใหม่ การลดและเลิกใช้สารเคมีอันตราย รองรับการจัดซื้อจัดจ้างสินค้าและบริการที่เป็นมิตรกับสิ่งแวดล้อม (Green Procurement) เป็นต้น ส่งผลให้เกิดการลดการปล่อย Green House Gases (GHG) ในทุกภาคส่วน และตลอดห่วงโซ่การผลิตและการบริโภค นำไปสู่การผลิตและบริโภคที่เป็นมิตรกับสิ่งแวดล้อมอย่างยั่งยืน`,
  section_title: "CS รณรงค์ลดโลกร้อนและรักษาสิ่งแวดล้อม",
  campaign_images: [
    { title: "CS Cleaning office day", url: "https://cs.kmutnb.ac.th/img/greenoffice/cleaning_day.jpg" },
    { title: "CS แยกขยะ: \"คิดก่อนทิ้ง แยกก่อนโยน\"", url: "https://cs.kmutnb.ac.th/img/greenoffice/trash_separate.jpg" },
    { title: "7 นโยบายสิ่งแวดล้อม สำนักงานสีเขียว (Green Office)", url: "https://cs.kmutnb.ac.th/img/greenoffice/7policies.jpg" },
    { title: "เป้าหมายสิ่งแวดล้อมของภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ", url: "https://cs.kmutnb.ac.th/img/greenoffice/goal.jpg" },
    { title: "CS รณรงค์เลิกบุหรี่", url: "https://cs.kmutnb.ac.th/img/greenoffice/no_smoking.jpg" },
    { title: "ห้ามสูบบุหรี่ฝ่าฝืนมีโทษปรับตามกฎหมาย", url: "https://cs.kmutnb.ac.th/img/greenoffice/no_smoking_sign.jpg" }
  ]
};

// ======================= 1. Organization =======================
export const getOrganization = async (req, res) => {
  try {
    const config = await prisma.site_config.findUnique({
      where: { config_key: "about_organization" }
    });

    if (!config || !config.config_value) {
      return res.json({ data: defaultOrganization });
    }

    try {
      const parsed = JSON.parse(config.config_value);
      return res.json({ data: parsed });
    } catch (e) {
      return res.json({ data: defaultOrganization });
    }
  } catch (error) {
    console.error("Get organization error:", error);
    res.status(500).json({ error: "Failed to fetch organization data" });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "ข้อมูลองค์กรไม่ถูกต้อง" });
    }

    const updated = await prisma.site_config.upsert({
      where: { config_key: "about_organization" },
      update: {
        config_value: JSON.stringify(data),
        description: "Organization chart and executive board"
      },
      create: {
        config_key: "about_organization",
        config_value: JSON.stringify(data),
        description: "Organization chart and executive board"
      }
    });

    res.json({ message: "บันทึกข้อมูลโครงสร้างองค์กรสำเร็จ", data });
  } catch (error) {
    console.error("Update organization error:", error);
    res.status(500).json({ error: "Failed to update organization data" });
  }
};

// ======================= 2. History =======================
export const getHistory = async (req, res) => {
  try {
    const config = await prisma.site_config.findUnique({
      where: { config_key: "about_history" }
    });

    if (!config || !config.config_value) {
      return res.json({ data: defaultHistory });
    }

    try {
      const parsed = JSON.parse(config.config_value);
      return res.json({ data: parsed });
    } catch (e) {
      return res.json({ data: defaultHistory });
    }
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Failed to fetch history data" });
  }
};

export const updateHistory = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "ข้อมูลประวัติความเป็นมาไม่ถูกต้อง" });
    }

    const updated = await prisma.site_config.upsert({
      where: { config_key: "about_history" },
      update: {
        config_value: JSON.stringify(data),
        description: "Department history and timeline events"
      },
      create: {
        config_key: "about_history",
        config_value: JSON.stringify(data),
        description: "Department history and timeline events"
      }
    });

    res.json({ message: "บันทึกข้อมูลประวัติความเป็นมาสำเร็จ", data });
  } catch (error) {
    console.error("Update history error:", error);
    res.status(500).json({ error: "Failed to update history data" });
  }
};

// ======================= 3. Contact =======================
export const getContact = async (req, res) => {
  try {
    const config = await prisma.site_config.findUnique({
      where: { config_key: "about_contact" }
    });

    if (!config || !config.config_value) {
      return res.json({ data: defaultContact });
    }

    try {
      const parsed = JSON.parse(config.config_value);
      return res.json({ data: parsed });
    } catch (e) {
      return res.json({ data: defaultContact });
    }
  } catch (error) {
    console.error("Get contact error:", error);
    res.status(500).json({ error: "Failed to fetch contact data" });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "ข้อมูลการติดต่อไม่ถูกต้อง" });
    }

    const updated = await prisma.site_config.upsert({
      where: { config_key: "about_contact" },
      update: {
        config_value: JSON.stringify(data),
        description: "Department contact info, address, and maps"
      },
      create: {
        config_key: "about_contact",
        config_value: JSON.stringify(data),
        description: "Department contact info, address, and maps"
      }
    });

    res.json({ message: "บันทึกข้อมูลการติดต่อสำเร็จ", data });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({ error: "Failed to update contact data" });
  }
};

// ======================= 4. Green Office =======================
export const getGreenOffice = async (req, res) => {
  try {
    const config = await prisma.site_config.findUnique({
      where: { config_key: "about_green_office" }
    });

    if (!config || !config.config_value) {
      return res.json({ data: defaultGreenOffice });
    }

    try {
      const parsed = JSON.parse(config.config_value);
      return res.json({ data: parsed });
    } catch (e) {
      return res.json({ data: defaultGreenOffice });
    }
  } catch (error) {
    console.error("Get green office error:", error);
    res.status(500).json({ error: "Failed to fetch green office data" });
  }
};

export const updateGreenOffice = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: "ข้อมูลสำนักงานสีเขียวไม่ถูกต้อง" });
    }

    await prisma.site_config.upsert({
      where: { config_key: "about_green_office" },
      update: {
        config_value: JSON.stringify(data),
        description: "Green Office info, policies, and campaign posters"
      },
      create: {
        config_key: "about_green_office",
        config_value: JSON.stringify(data),
        description: "Green Office info, policies, and campaign posters"
      }
    });

    res.json({ message: "บันทึกข้อมูลสำนักงานสีเขียวสำเร็จ", data });
  } catch (error) {
    console.error("Update green office error:", error);
    res.status(500).json({ error: "Failed to update green office data" });
  }
};

// ======================= 5. Image Upload =======================
export const uploadAboutImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์รูปภาพ" });
    }

    const imagePath = `/uploads/about/${req.file.filename}`;
    res.json({ message: "อัปโหลดรูปภาพสำเร็จ", imagePath });
  } catch (error) {
    console.error("Upload about image error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
};
