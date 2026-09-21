import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleSubjects = [
  // ==========================================
  // หลักสูตรวิทยาศาสตรบัณฑิต พ.ศ. 2569 (ใหม่ล่าสุด)
  // ==========================================
  {
    subject_code: "040613001",
    title_th: "การเขียนโปรแกรมคอมพิวเตอร์",
    title_en: "Computer Programming",
    prereq1: "ไม่มี",
    prereq2: null,
    credit: "3(2-2-5)",
    description_th: "แนวคิดพื้นฐานการเขียนโปรแกรม โครงสร้างภาษาและชนิดข้อมูล ตัวแปร นิพจน์ คำสั่งควบคุมและลูป ฟังก์ชันและพารามิเตอร์ อาร์เรย์ การจัดการไฟล์ การตรวจจับและจัดการข้อผิดพลาด การฝึกปฏิบัติเขียนโปรแกรมแก้ปัญหาเชิงคำนวณ",
    description_en: "Fundamental concepts of programming, language syntax, primitive types, variables, expressions, control structures, loops, functions, parameter passing, arrays, file I/O, exception handling, hands-on programming labs.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Software Engineering & Cloud"
  },
  {
    subject_code: "040613002",
    title_th: "การเขียนโปรแกรมเชิงวัตถุ",
    title_en: "Object-Oriented Programming",
    prereq1: "040613001",
    prereq2: null,
    credit: "3(2-2-5)",
    description_th: "หลักการเชิงวัตถุ คลาส อ็อบเจกต์ การห่อหุ้ม การสืบทอด พหุสัณฐาน อินเทอร์เฟซ คอลเลกชัน การเขียนโปรแกรมแบบ Event-driven การออกแบบโดยใช้รูปแบบการออกแบบ (Design Patterns) เบื้องต้น",
    description_en: "Object-oriented paradigm, classes, objects, encapsulation, inheritance, polymorphism, interfaces, collections framework, event-driven programming, introductory design patterns.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Software Engineering & Cloud"
  },
  {
    subject_code: "040613003",
    title_th: "โครงสร้างข้อมูลและขั้นตอนวิธี",
    title_en: "Data Structures and Algorithms",
    prereq1: "040613001",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "ชนิดข้อมูลนามธรรม ลิสต์แบบต่อโยง สแตก คิว ต้นไม้ ทวิภาค ฮีป กราฟ ขั้นตอนวิธีการเรียงลำดับและการค้นหา การวิเคราะห์ความซับซ้อนเชิงเวลาและพื้นที่ (Big-O Notation) การประยุกต์ใช้งานโครงสร้างข้อมูลในการแก้ปัญหาจริง",
    description_en: "Abstract data types, linked lists, stacks, queues, binary trees, heaps, graphs, sorting and searching algorithms, asymptotic time and space complexity analysis, practical applications.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Data Science & Artificial Intelligence"
  },
  {
    subject_code: "040613004",
    title_th: "สถาปัตยกรรมและระบบคอมพิวเตอร์",
    title_en: "Computer Architecture and Systems",
    prereq1: "ไม่มี",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "การแทนข้อมูลในคอมพิวเตอร์ ตรรกะดิจิทัล หน่วยประมวลผลกลาง สถาปัตยกรรมชุดคำสั่ง ภาษาแอสเซมบลี การจัดลำดับคำสั่งแบบไพป์ไลน์ ระบบความจำลำดับขั้น แคช อินพุตเอาต์พุต และระบบบัส",
    description_en: "Digital logic, data representation, instruction set architecture, CPU organization, pipelining, memory hierarchy, cache memory, I/O interfacing, bus systems.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "IoT & Intelligent Systems"
  },
  {
    subject_code: "040613005",
    title_th: "ระบบปฏิบัติการ",
    title_en: "Operating Systems",
    prereq1: "040613004",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "โครงสร้างและหน้าที่ของระบบปฏิบัติการ กระบวนการและเธรด การสลับบริบท การจัดตารางเวลาของซีพียู การทำงานประสานจังหวะ การเกิดภาวะชะงักงัน (Deadlock) การจัดการหน่วยความจำ ระบบเสมือน และระบบไฟล์",
    description_en: "Operating system concepts, processes and threads, context switching, CPU scheduling, concurrency, synchronization primitives, deadlocks, memory management, virtual memory, file systems.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Software Engineering & Cloud"
  },
  {
    subject_code: "040613006",
    title_th: "ระบบการจัดการฐานข้อมูล",
    title_en: "Database Management Systems",
    prereq1: "040613001",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "ทฤษฎีฐานข้อมูลสัมพันธ์ แบบจำลองเชิงแนวคิด แบบจำลองความสัมพันธ์ระหว่างเอนทิตี ภาษาเอสคิวแอล (SQL) การนอร์แมลไลเซชัน ทรานแซกชันและการควบคุมภาวะพร้อมกัน ระบบฐานข้อมูลแบบ NoSQL และการออกแบบฐานข้อมูลขนาดใหญ่",
    description_en: "Relational database theory, conceptual modeling, ER modeling, SQL querying, schema normalization, ACID transactions, concurrency control, NoSQL databases, scalable storage architectures.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Data Science & Artificial Intelligence"
  },
  {
    subject_code: "040613007",
    title_th: "การสื่อสารข้อมูลและระบบเครือข่ายคอมพิวเตอร์",
    title_en: "Data Communications and Computer Networks",
    prereq1: "ไม่มี",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "แบบจำลอง OSI และ TCP/IP สื่อสัญญาณส่งผ่าน โปรโตคอลระดับต่าง ๆ การส่งข้อมูลผ่านเครือข่ายแบบแพ็กเก็ต การหาเส้นทาง (Routing) ไอพีแอดเดรส IPv4 และ IPv6 สวิตชิ่ง และการวิเคราะห์แพ็กเก็ตเครือข่าย",
    description_en: "OSI reference model and TCP/IP stack, transmission media, layer protocols, packet switching, IP addressing (IPv4/IPv6), routing algorithms, network switching, and packet sniffing analysis.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Network & Cybersecurity"
  },
  {
    subject_code: "040613008",
    title_th: "วิศวกรรมซอฟต์แวร์",
    title_en: "Software Engineering",
    prereq1: "040613002",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "วงจรชีวิตการพัฒนาซอฟต์แวร์ ระเบียบวิธีพัฒนาแบบ Agile และ Scrum การรวบรวมและวิเคราะห์ความต้องการ การออกแบบสถาปัตยกรรมซอฟต์แวร์ UML การประกันคุณภาพและการทดสอบซอฟต์แวร์ การจัดการเวอร์ชันด้วย Git และการควบคุมการปล่อยซอฟต์แวร์",
    description_en: "Software development lifecycle, Agile and Scrum workflows, requirements engineering, software architecture, UML modeling, software testing, QA, Git version control, and release engineering.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Software Engineering & Cloud"
  },
  {
    subject_code: "040613009",
    title_th: "ปัญญาประดิษฐ์เบื้องต้น",
    title_en: "Introduction to Artificial Intelligence",
    prereq1: "040613003",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "ประวัติและภาพรวมของปัญญาประดิษฐ์ เทคนิคการค้นหาในปริภูมิสถานะ การค้นหาแบบพิกัดช่วย (Heuristic Search) ตัวแทนอัจฉริยะ การแทนความรู้และการอนุมาน ทฤษฎีความน่าจะเป็นและการตัดสินใจ โมเดลการเรียนรู้เบื้องต้น",
    description_en: "History and overview of artificial intelligence, state space searching, heuristic search methods, intelligent agents, knowledge representation, probabilistic reasoning, basic machine learning concepts.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Data Science & Artificial Intelligence"
  },
  {
    subject_code: "040613010",
    title_th: "ความมั่นคงปลอดภัยไซเบอร์เบื้องต้น",
    title_en: "Introduction to Cybersecurity",
    prereq1: "040613007",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "หลักการความมั่นคงปลอดภัยสารสนเทศ CIA Triad การเข้ารหัสลับและลายเซ็นดิจิทัล ช่องโหว่ความปลอดภัยทั่วไปและภัยคุกคามไซเบอร์ การพิสูจน์ตัวตนและการกำหนดสิทธิ์ นโยบายความปลอดภัยและกฎหมายที่เกี่ยวข้อง (PDPA)",
    description_en: "Cybersecurity principles, CIA triad, cryptographic algorithms, public key infrastructure, web and network vulnerabilities, threat modeling, authorization/authentication, security policy and privacy regulations.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Network & Cybersecurity"
  },
  {
    subject_code: "040613011",
    title_th: "คลาวด์คอมพิวติงและเดฟออปส์",
    title_en: "Cloud Computing and DevOps",
    prereq1: "040613005",
    prereq2: null,
    credit: "3(2-2-5)",
    description_th: "สถาปัตยกรรมคลาวด์ IaaS, PaaS, SaaS คอนเทนเนอร์ไรเซชันด้วย Docker การจัดการออเคสเตรชันด้วย Kubernetes ไปป์ไลน์ CI/CD การเขียน Infrastructure as Code (IaC) ระบบมอนิเตอร์และบันทึกประวัติการทำงานบนระบบคลาวด์",
    description_en: "Cloud architecture, IaaS/PaaS/SaaS models, containerization with Docker, Kubernetes orchestration, CI/CD pipeline automation, Infrastructure as Code, cloud monitoring and observability.",
    category: "หมวดวิชาเลือก",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Software Engineering & Cloud"
  },
  {
    subject_code: "040613012",
    title_th: "การเรียนรู้ของเครื่องและการทำเหมืองข้อมูล",
    title_en: "Machine Learning and Data Mining",
    prereq1: "040613009",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "การจัดเตรียมข้อมูล การเรียนรู้แบบมีผู้สอน การถดถอยและการจำแนกประเภท การเรียนรู้แบบไม่มีผู้สอน การจัดกลุ่มและการหารูปแบบความสัมพันธ์ โครงข่ายประสาทเทียมเบื้องต้น การประเมินประสิทธิภาพโมเดลและการนำไปใช้งานจริง",
    description_en: "Data preprocessing, supervised learning, regression, classification, unsupervised learning, clustering, association rules, introductory neural networks, model evaluation, and deployment.",
    category: "หมวดวิชาเลือก",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "Data Science & Artificial Intelligence"
  },
  {
    subject_code: "040613013",
    title_th: "อินเทอร์เน็ตของสรรพสิ่งและระบบสมองกลฝังตัว",
    title_en: "Internet of Things and Embedded Systems",
    prereq1: "040613004",
    prereq2: null,
    credit: "3(2-2-5)",
    description_th: "สถาปัตยกรรม IoT ไมโครคอนโทรลเลอร์ เซนเซอร์และแอคทูเอเตอร์ โปรโตคอลสื่อสาร MQTT, CoAP, BLE การประมวลผลที่ขอบเครือข่าย (Edge Computing) แพลตฟอร์มคลาวด์สำหรับ IoT และการประยุกต์ใช้งานในเมืองอัจฉริยะ",
    description_en: "IoT architectures, microcontrollers, sensor and actuator interfacing, communication protocols (MQTT, CoAP, BLE), edge computing, IoT cloud platforms, smart home and industrial applications.",
    category: "หมวดวิชาเลือก",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "IoT & Intelligent Systems"
  },
  {
    subject_code: "040613014",
    title_th: "โครงงานวิทยาการคอมพิวเตอร์ 1",
    title_en: "Computer Science Project I",
    prereq1: "040613008",
    prereq2: null,
    credit: "1(0-3-2)",
    description_th: "การศึกษาและวิเคราะห์หัวข้อโครงงานที่น่าสนใจ การเขียนข้อเสนอโครงงาน การออกแบบสถาปัตยกรรมระบบ การนำเสนอความก้าวหน้าและการสอบหัวข้อโครงงานต่อคณะกรรมการ",
    description_en: "Literature review, project formulation, proposal writing, system architectural design, project milestone tracking, and oral proposal defense before evaluation committee.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "ทั่วไป"
  },
  {
    subject_code: "040613015",
    title_th: "โครงงานวิทยาการคอมพิวเตอร์ 2",
    title_en: "Computer Science Project II",
    prereq1: "040613014",
    prereq2: null,
    credit: "2(0-6-3)",
    description_th: "การพัฒนาและทดสอบระบบตามข้อเสนอโครงงาน การจัดทำรายงานฉบับสมบูรณ์ การนำเสนอผลงานและสาธิตระบบต่อหน้าคณะกรรมการ การเผยแพร่ผลงานทางวิชาการหรือวิชาชีพ",
    description_en: "Implementation and testing of proposed systems, complete project documentation, project defense, live demonstration, and preparation of scholarly/technical publications.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS69",
    curriculum_year: 2569,
    degree_level: "bachelor",
    track: "ทั่วไป"
  },

  // ==========================================
  // หลักสูตรวิทยาศาสตรบัณฑิต พ.ศ. 2564 (CS64)
  // ==========================================
  {
    subject_code: "040603001",
    title_th: "การเขียนโปรแกรมคอมพิวเตอร์ 1",
    title_en: "Computer Programming I",
    prereq1: "ไม่มี",
    prereq2: null,
    credit: "3(2-2-5)",
    description_th: "หลักการเบื้องต้นของระบบคอมพิวเตอร์และขั้นตอนวิธี การแก้ปัญหาด้วยผังงานและรหัสเทียม การเขียนโปรแกรมภาษาโครงสร้าง ชนิดข้อมูลพื้นฐาน นิพจน์และตัวดำเนินการ คำสั่งเงื่อนไขและการทำซ้ำ",
    description_en: "Fundamental concepts of computer systems and algorithms, flowchart and pseudo-code, structured programming, basic types, operators, conditional branching, and looping structures.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS64",
    curriculum_year: 2564,
    degree_level: "bachelor",
    track: "Software Engineering & Cloud"
  },
  {
    subject_code: "040603002",
    title_th: "การเขียนโปรแกรมคอมพิวเตอร์ 2",
    title_en: "Computer Programming II",
    prereq1: "040603001",
    prereq2: null,
    credit: "3(2-2-5)",
    description_th: "การเขียนโปรแกรมเชิงวัตถุด้วยภาษาจาวาหรือภาษาเทียบเท่า คลาสและอ็อบเจกต์ การห่อหุ้ม การสืบทอด และการพ้องรูป การสร้างส่วนต่อประสานกับผู้ใช้แบบกราฟิก การจัดการเหตุการณ์",
    description_en: "Object-oriented programming using Java or equivalent language, classes and objects, encapsulation, inheritance, polymorphism, graphical user interfaces, event handling.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS64",
    curriculum_year: 2564,
    degree_level: "bachelor",
    track: "Software Engineering & Cloud"
  },
  {
    subject_code: "040603003",
    title_th: "โครงสร้างข้อมูล",
    title_en: "Data Structures",
    prereq1: "040603001",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "การจัดเก็บและการจัดการข้อมูล ลิสต์ อาร์เรย์ สแตก คิว ลิงก์ลิสต์ ทรี ฮีป กราฟ เทคนิคการค้นหาและการจัดเรียงข้อมูล การประเมินประสิทธิภาพของโครงสร้างข้อมูล",
    description_en: "Data representation and manipulation, lists, arrays, stacks, queues, linked lists, trees, heaps, graphs, searching and sorting techniques, performance evaluation.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS64",
    curriculum_year: 2564,
    degree_level: "bachelor",
    track: "Data Science & Artificial Intelligence"
  },
  {
    subject_code: "040603004",
    title_th: "การวิเคราะห์และออกแบบขั้นตอนวิธี",
    title_en: "Design and Analysis of Algorithms",
    prereq1: "040603003",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "เทคนิคการออกแบบขั้นตอนวิธี การแบ่งแยกและเอาชนะ วิธีแบบกำหนดการพลวัต วิธีแบบละโมบ การวิเคราะห์ความซับซ้อนเชิงเวลา ปัญหา NP-Complete และขั้นตอนวิธีเชิงประมาณ",
    description_en: "Algorithm design paradigms, divide and conquer, dynamic programming, greedy algorithms, asymptotic complexity, NP-complete problems, approximation algorithms.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS64",
    curriculum_year: 2564,
    degree_level: "bachelor",
    track: "Data Science & Artificial Intelligence"
  },
  {
    subject_code: "040603005",
    title_th: "ระบบจัดการฐานข้อมูล",
    title_en: "Database Management Systems",
    prereq1: "040603001",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "สถาปัตยกรรมระบบฐานข้อมูล แบบจำลองข้อมูลเชิงสัมพันธ์ พีชคณิตเชิงสัมพันธ์ ภาษาเอสคิวแอล การออกแบบฐานข้อมูล การทำนอร์มัลไลเซชัน การควบคุมความถูกต้องและการกู้คืนข้อมูล",
    description_en: "Database system architecture, relational data model, relational algebra, SQL language, database design, normalization, integrity constraints, and recovery techniques.",
    category: "หมวดวิชาเฉพาะด้านบังคับ",
    curriculum_code: "CS64",
    curriculum_year: 2564,
    degree_level: "bachelor",
    track: "Data Science & Artificial Intelligence"
  },

  // ==========================================
  // หลักสูตรวิทยาศาสตรมหาบัณฑิต พ.ศ. 2567 / 2562 (ปริญญาโท)
  // ==========================================
  {
    subject_code: "040623101",
    title_th: "ระเบียบวิธีวิจัยขั้นสูงทางวิทยาการคอมพิวเตอร์",
    title_en: "Advanced Research Methodologies in Computer Science",
    prereq1: "ไม่มี",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "กระบวนการวิจัยทางวิทยาการคอมพิวเตอร์ การกำหนดปัญหาและสมมติฐาน การทบทวนวรรณกรรมและการวิเคราะห์ผลงานวิจัย การออกแบบการทดลอง การเขียนบทความวิชาการและการนำเสนอในระดับนานาชาติ",
    description_en: "Computer science research process, hypothesis formulation, literature survey and synthesis, experimental design, research metrics, academic writing, and publication ethics.",
    category: "หมวดวิชาบังคับ",
    curriculum_code: "MS-CS67",
    curriculum_year: 2567,
    degree_level: "master",
    track: "ทั่วไป"
  },
  {
    subject_code: "040623201",
    title_th: "ปัญญาประดิษฐ์และการเรียนรู้ของเครื่องขั้นสูง",
    title_en: "Advanced Artificial Intelligence and Machine Learning",
    prereq1: "ไม่มี",
    prereq2: null,
    credit: "3(3-0-6)",
    description_th: "ทฤษฎีการเรียนรู้เชิงลึก โครงข่ายประสาทสังเคราะห์แบบคอนโวลูชัน ทรานส์ฟอร์เมอร์ โมเดลภาษาขนาดใหญ่ (LLMs) การเรียนรู้แบบเสริมกำลัง และการประยุกต์ใช้ในงานวิจัยล้ำสมัย",
    description_en: "Deep learning foundations, convolutional neural networks, transformer architectures, large language models (LLMs), reinforcement learning, and state-of-the-art research applications.",
    category: "หมวดวิชาเลือก",
    curriculum_code: "MS-CS67",
    curriculum_year: 2567,
    degree_level: "master",
    track: "Data Science & Artificial Intelligence"
  },

  // ==========================================
  // หลักสูตรปรัชญาดุษฎีบัณฑิต (ปริญญาเอก)
  // ==========================================
  {
    subject_code: "040633101",
    title_th: "สัมมนาทางวิทยาการคอมพิวเตอร์ขั้นสูง",
    title_en: "Doctoral Seminar in Advanced Computer Science",
    prereq1: "ไม่มี",
    prereq2: null,
    credit: "1(0-3-2)",
    description_th: "การศึกษา ค้นคว้า และวิพากษ์บทความวิจัยระดับแนวหน้าทางวิทยาการคอมพิวเตอร์ การนำเสนอและแลกเปลี่ยนความรู้ทางวิชาการ การพัฒนาทักษะการสร้างสรรค์องค์ความรู้ใหม่",
    description_en: "Investigation, presentation, and critical appraisal of cutting-edge computer science research literature, academic discussions, and development of novel knowledge frontiers.",
    category: "หมวดวิชาบังคับ",
    curriculum_code: "PhD-CS64",
    curriculum_year: 2564,
    degree_level: "doctor",
    track: "ทั่วไป"
  }
];

const sampleHandbooks = [
  {
    category: "ระเบียบการศึกษา",
    topic: "เกณฑ์การคิดคะแนนและระดับคะแนนเฉลี่ยสะสม (GPA)",
    content: "ระดับคะแนนแบ่งเป็น A(4.0), B+(3.5), B(3.0), C+(2.5), C(2.0), D+(1.5), D(1.0) และ F(0.0) โดยนักศึกษาระดับปริญญาตรีต้องรักษาระดับคะแนนเฉลี่ยสะสม (GPAX) ไม่ต่ำกว่า 2.00 ตลอดหลักสูตรเพื่อสำเร็จการศึกษา หากต่ำกว่า 1.75 ในภาคการศึกษาใดจะติดสถานะวิทยาทัณฑ์ (Probation)",
    applicable_years: "ทุกชั้นปี",
    degree_level: "bachelor"
  },
  {
    category: "ระเบียบการศึกษา",
    topic: "เกณฑ์การพ้นสภาพนักศึกษา (Retire)",
    content: "นักศึกษาจะพ้นสภาพการเป็นนักศึกษาเมื่อ: 1) ได้รับคะแนนเฉลี่ยสะสม (GPAX) ต่ำกว่า 1.50 หลังสิ้นสุดภาคการศึกษาที่ 2 เป็นต้นไป หรือ 2) ได้รับ GPAX ต่ำกว่า 1.75 ติดต่อกันสองภาคการศึกษาปกติ หรือ 3) ใช้ระยะเวลาศึกษาเกินสองเท่าของแผนการศึกษาตามหลักสูตร (ปริญญาตรี 4 ปี ไม่เกิน 8 ปีการศึกษา)",
    applicable_years: "ทุกชั้นปี",
    degree_level: "all"
  },
  {
    category: "การลงทะเบียน",
    topic: "กำหนดการเพิ่ม-ถอนรายวิชา และจำนวนหน่วยกิตต่อภาคการศึกษา",
    content: "นักศึกษาภาคปกติสามารถลงทะเบียนเรียนในภาคการศึกษาปกติได้ไม่น้อยกว่า 9 หน่วยกิต และไม่เกิน 22 หน่วยกิต (ภาคฤดูร้อนไม่เกิน 9 หน่วยกิต) การเพิ่มหรือถอนรายวิชาโดยไม่บันทึกอักษร W สามารถทำได้ภายใน 2 สัปดาห์แรกของการเปิดภาคการศึกษา หลังจากนั้นจนถึงสัปดาห์ที่ 12 จะเป็นการถอนที่ได้รับอักษร W",
    applicable_years: "ทุกชั้นปี",
    degree_level: "all"
  },
  {
    category: "การฝึกงานและสหกิจศึกษา",
    topic: "เกณฑ์และคุณสมบัติสำหรับการเข้ารับการฝึกงานภาคฤดูร้อน",
    content: "นักศึกษาที่จะเข้ารับการฝึกงานต้องมีคุณสมบัติ: 1) สอบผ่านรายวิชาบังคับตามโครงสร้างหลักสูตรกำหนด และมีหน่วยกิตสะสมไม่น้อยกว่า 90 หน่วยกิต (ปกติอยู่ชั้นปีที่ 3 ภาคฤดูร้อน) 2) มีระยะเวลาการฝึกงานไม่น้อยกว่า 320 ชั่วโมง (ประมาณ 8 สัปดาห์) ในหน่วยงานหรือบริษัทที่ภาควิชาให้ความเห็นชอบ 3) ส่งรายงานและผ่านการประเมินผลจากสถานประกอบการและอาจารย์นิเทศก์",
    applicable_years: "ปี 3",
    degree_level: "bachelor"
  },
  {
    category: "เกณฑ์สำเร็จการศึกษา",
    topic: "เกณฑ์การสำเร็จการศึกษาและเกณฑ์ทดสอบภาษาอังกฤษ (KMUTNB-TEP)",
    content: "นักศึกษาจะสำเร็จการศึกษาได้เมื่อ: 1) ศึกษารายวิชาครบถ้วนตามโครงสร้างหลักสูตร และได้ GPAX ไม่ต่ำกว่า 2.00 2) ผ่านเกณฑ์การทดสอบความรู้ภาษาอังกฤษตามที่มหาวิทยาลัยกำหนด เช่น KMUTNB-TEP ไม่น้อยกว่าเกณฑ์ที่คณะวิทยาศาสตร์ประยุกต์กำหนด หรือผลสอบมาตรฐานเช่น TOEIC, TOEFL, IELTS ที่ยังไม่หมดอายุ 3) เข้าร่วมกิจกรรมพัฒนานักศึกษาครบตามชั่วโมงที่มหาวิทยาลัยกำหนด",
    applicable_years: "ปี 4",
    degree_level: "all"
  },
  {
    category: "อาจารย์ที่ปรึกษา",
    topic: "บทบาทของอาจารย์ที่ปรึกษาและขั้นตอนการขอคำปรึกษา",
    content: "อาจารย์ที่ปรึกษามีหน้าที่ให้คำปรึกษาด้านแผนการลงทะเบียนเรียน การวางแผนชีวิตการศึกษา การแก้ไขปัญหาผลการเรียน และการติดตามการศึกษา นักศึกษาสามารถตรวจสอบรายชื่ออาจารย์ที่ปรึกษาประจำตัวได้ที่เมนู 'บริการนักศึกษา -> อาจารย์ที่ปรึกษา' หรือหน้า http://localhost:5173/consult-student และควรเข้าพบอาจารย์ที่ปรึกษาอย่างน้อยภาคการศึกษาละ 1 ครั้งเพื่อขออนุมัติแผนการเรียน",
    applicable_years: "ทุกชั้นปี",
    degree_level: "all"
  },
  {
    category: "ทุนการศึกษาและสวัสดิการ",
    topic: "ทุนการศึกษาและสวัสดิการพยาบาลสำหรับนักศึกษา",
    content: "ภาควิชาและมหาวิทยาลัยมีทุนการศึกษาหลายประเภท เช่น ทุนขาดแคลนทุนทรัพย์ ทุนเรียนดี และทุนผู้ช่วยสอน/ช่วยวิจัย นักศึกษาสามารถติดตามประกาศรับสมัครได้จากหน้าข่าวสารทุนการศึกษา นอกจากนี้ นักศึกษาทุกคนจะได้รับความคุ้มครองจากประกันอุบัติเหตุ และสามารถเข้ารับการรักษาพยาบาลเบื้องต้นได้ที่ห้องพยาบาลของมหาวิทยาลัยโดยไม่เสียค่าใช้จ่าย",
    applicable_years: "ทุกชั้นปี",
    degree_level: "all"
  }
];

async function seed() {
  console.log("🌱 Seeding subjects and student handbooks...");

  // ล้างข้อมูลเดิมถ้ามี เพื่อใส่ข้อมูลใหม่แบบมีโครงสร้าง
  await prisma.subjects.deleteMany();
  await prisma.student_handbooks.deleteMany();

  // ใส่ข้อมูลรายวิชา
  for (const s of sampleSubjects) {
    await prisma.subjects.create({ data: s });
  }
  console.log(`✅ Seeded ${sampleSubjects.length} subjects successfully.`);

  // ใส่ข้อมูลคู่มือนักศึกษา
  for (const h of sampleHandbooks) {
    await prisma.student_handbooks.create({ data: h });
  }
  console.log(`✅ Seeded ${sampleHandbooks.length} handbook articles successfully.`);
}

seed()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
