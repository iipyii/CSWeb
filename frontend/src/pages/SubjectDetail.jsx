import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  FileText, 
  GraduationCap, 
  Users, 
  BookOpenCheck,
  ArrowUpRight,
  Inbox
} from 'lucide-react';
import Footer from '../components/Footer';

export default function SubjectDetail() {
  const { year, term } = useParams();
  const navigate = useNavigate();

  // 📂 รวมข้อมูลทุกปีการศึกษาไว้ที่นี่
  const allCourseData = {
    // ✨ อัปเดตข้อมูลปี 2/2568 ให้ครบถ้วนตามโครงสร้างภาควิชา
    "2568-2": [
      {
        id: "CS",
        title: "วิทยาการคอมพิวเตอร์ (CS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CS1 RA/RB/RC/DA/DB)", file: "cs_1_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CS2 RA/RB/RC/DA/DB)", file: "cs_2_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CS3 RA/RB/RC/DA/DB)", file: "cs_3_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4-5 ห้อง (CS4 RA/RB/RC/DA/DB)", file: "cs_4_2568_2.pdf" },
        ]
      },
      {
        id: "CSB",
        title: "วิทยาการคอมพิวเตอร์และธุรกิจ (CSB)",
        icon: <BookOpenCheck size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CSB 1)", file: "csb_1_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CSB 2)", file: "csb_2_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CSB 3)", file: "csb_3_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4-5 ห้อง (CSB 4-5)", file: "csb_4_2568_2.pdf" },
        ]
      },
      {
        id: "MCS",
        title: "ระดับบัณฑิตศึกษา (MCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 1 ห้อง (MCS 1) รหัส 68", file: "mcs_1_68_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 2 ห้อง (S-MCS 1) รหัส 68", file: "smcs_1_68_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 2 , 3-5 ห้อง (MCS 2) ภาคปกติ (รหัส 67), ภาคพิเศษ แผน ก (รหัส 62-66)", file: "mcs_2_mixed_2568_2.pdf" },
        ]
      },
      {
        id: "DCS",
        title: "ระดับปริญญาเอก (DCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 1 ห้อง (DCS แบบ 1.1) (หลักสูตร 64046513) ภาคปกติ (รหัส 67)", file: "dcs_1_1_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 1 ห้อง (DCS 1) (หลักสูตร 64046513) ภาคปกติ แบบ 2.1 (รหัส 68)", file: "dcs_1_2_1_2568_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 2 (DCS 2) (หลักสูตร 64046513) ภาคปกติ (รหัส 66), ปีที่ 3-5 ห้อง (DCS 3-5) (หลักสูตร 59040653) ภาคปกติ (รหัส 60-62)", file: "dcs_senior_2568_2.pdf" },
        ]
      },
    ],

    // ข้อมูลปี 1/2568
    "2568-1": [
      {
        id: "CS",
        title: "วิทยาการคอมพิวเตอร์ (CS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CS1 RA/RB/RC/DA/DB)", file: "cs_1_2568_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CS2 RA/RB/RC/DA/DB)", file: "cs_2_2568_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CS3 RA/RB/RC/DA/DB)", file: "cs_3_2568_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CS4 RA/RB/RC/DA/DB)", file: "cs_4_2568_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 5 ห้อง (CS5 RA/RB/RC/DA/DB)", file: "cs_5_2568_1.pdf" },
        ]
      },
      {
        id: "CSB",
        title: "วิทยาการคอมพิวเตอร์และธุรกิจ (CSB)",
        icon: <BookOpenCheck size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CSB 1)", file: "csb_1_2568_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CSB 2)", file: "csb_2_2568_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CSB 3)", file: "csb_3_2568_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CSB 4)", file: "csb_4_2568_1.pdf" },
        ]
      },
      {
        id: "MCS",
        title: "ระดับบัณฑิตศึกษา (MCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 1 ห้อง (MCS 1) รหัส 68", file: "mcs_1_68_2568_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 2 ห้อง (MCS 2) รหัส 67", file: "mcs_2_68_2568_1.pdf" },
         
        ]
      },
      {
        id: "DCS",
        title: "ระดับปริญญาเอก (DCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 1 ห้อง (DCS 1) รหัส 68", file: "dcs_1_2568_1.pdf" },
        ]
      },
      {
        id: "SERVICE",
        title: "บริการวิชาการนอกภาค",
        icon: <Users size={20} />,
        subjects: [
          { label: "รายวิชาที่ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ เปิดบริการแก่นักศึกษานอกภาควิชา", file: "service_2568_1.pdf" },
        ]
      }
    ],

    // ข้อมูลปี 2/2567 
    "2567-2": [
      {
        id: "CS",
        title: "วิทยาการคอมพิวเตอร์ (CS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CS1 RA/RB/RC/DA/DB)", file: "cs_1_2567_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CS2 RA/RB/RC/DA/DB)", file: "cs_2_2567_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CS3 RA/RB/RC/DA/DB)", file: "cs_3_2567_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CS4 RA/RB/RC/DA/DB)", file: "cs_4_2567_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 5 ห้อง (CS5 RA/RB/RC/DA/DB)", file: "cs_5_2567_2.pdf" },
        ]
      },
      {
        id: "CSB",
        title: "วิทยาการคอมพิวเตอร์และธุรกิจ (CSB)",
        icon: <BookOpenCheck size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CSB 1)", file: "csb_1_2567_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CSB 2)", file: "csb_2_2567_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CSB 3)", file: "csb_3_2567_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CSB 4)", file: "csb_4_2567_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 5 ห้อง (CSB 5)", file: "csb_5_2567_2.pdf" },
        ]
      },
      {
        id: "MCS",
        title: "ระดับบัณฑิตศึกษา (MCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 1 ห้อง (MCS RA รอบเช้า) รหัส 67", file: "mcs_1_67_2567_2.pdf" },         
        ]
      },
      {
        id: "SERVICE",
        title: "บริการวิชาการนอกภาค",
        icon: <Users size={20} />,
        subjects: [
          { label: "รายวิชาที่ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ เปิดบริการแก่นักศึกษานอกภาควิชา", file: "service_2567_2.pdf" },
        ]
      }
    ],

    // ข้อมูลปี 1/2567 
    "2567-1": [
      {
        id: "CS",
        title: "วิทยาการคอมพิวเตอร์ (CS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CS1 RA/RB/RC/DA/DB)", file: "cs_1_2567_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CS2 RA/RB/RC/DA/DB)", file: "cs_2_2567_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CS3 RA/RB/RC/DA/DB)", file: "cs_3_2567_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CS4 RA/RB/RC/DA/DB)", file: "cs_4_2567_1.pdf" },
        ]
      },
      {
        id: "CSB",
        title: "วิทยาการคอมพิวเตอร์และธุรกิจ (CSB)",
        icon: <BookOpenCheck size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CSB 1)", file: "csb_1_2567_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CSB 2)", file: "csb_2_2567_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CSB 3)", file: "csb_3_2567_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CSB 4)", file: "csb_4_2567_1.pdf" },
        ]
      },
      {
        id: "MCS",
        title: "ระดับบัณฑิตศึกษา (MCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่1 (MCS 1) หลักสูตร (รหัส 67)", file: "mcs_1_67_2567_1.pdf" },  
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่2 (S-MCS 2) ภาคพิเศษ (รหัส 66)", file: "s_mcs_2_66_2567_1.pdf" },        
        ]
      },
    ],

    // ข้อมูลปี 2/2566
    "2566-2": [
      {
        id: "CS",
        title: "วิทยาการคอมพิวเตอร์ (CS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CS1 RA/RB/RC/DA/DB)", file: "cs_1_2566_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CS2 RA/RB/RC/DA/DB)", file: "cs_2_2566_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CS3 RA/RB/RC/DA/DB)", file: "cs_3_2566_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CS4 RA/RB/RC/DA/DB)", file: "cs_4_2566_2.pdf" },
        ]
      },
      {
        id: "CSB",
        title: "วิทยาการคอมพิวเตอร์และธุรกิจ (CSB)",
        icon: <BookOpenCheck size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CSB 1)", file: "csb_1_2566_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CSB 2)", file: "csb_2_2566_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CSB 3)", file: "csb_3_2566_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CSB 4)", file: "csb_4_2566_2.pdf" },
        ]
      },
      {
        id: "MCS",
        title: "ระดับบัณฑิตศึกษา (MCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 1 ห้อง (MCS 1) รหัส 66", file: "mcs_1_66_2566_2.pdf" },  
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 1 ห้อง (S-MCS2) รหัส 65", file: "s_mcs_2_65_2566_2.pdf" },        
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 3-6", file: "mcs_3-6_2566_2.pdf" },  
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 4", file: "mcs_4_2566_2.pdf" },        
        ]
      },
      {
        id: "DCS",
        title: "ระดับปริญญาเอก (DCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 1 ห้อง (DCS 1)", file: "dcs_1_2566_2.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 3-5 (DCS 3-5)", file: "dcs_3-5_2566_2.pdf" },
        ]
      },
      {
        id: "SERVICE",
        title: "บริการวิชาการนอกภาค",
        icon: <Users size={20} />,
        subjects: [
          { label: "รายวิชาที่ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ เปิดบริการแก่นักศึกษานอกภาควิชา", file: "service_2566_2.pdf" },
        ]
      }
    ],

    // ข้อมูลปี 1/2566
    "2566-1": [
      {
        id: "CS",
        title: "วิทยาการคอมพิวเตอร์ (CS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CS1 RA/RB/RC/DA/DB)", file: "cs_1_2566_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CS2 RA/RB/RC/DA/DB)", file: "cs_2_2566_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CS3 RA/RB/RC/DA/DB)", file: "cs_3_2566_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CS4 RA/RB/RC/DA/DB)", file: "cs_4_2566_1.pdf" },
        ]
      },
      {
        id: "CSB",
        title: "วิทยาการคอมพิวเตอร์และธุรกิจ (CSB)",
        icon: <BookOpenCheck size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 1 ห้อง (CSB 1)", file: "csb_1_2566_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 2 ห้อง (CSB 2)", file: "csb_2_2566_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 3 ห้อง (CSB 3)", file: "csb_3_2566_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ชั้นปีที่ 4 ห้อง (CSB 4)", file: "csb_4_2566_1.pdf" },
        ]
      },
      {
        id: "MCS",
        title: "ระดับบัณฑิตศึกษา (MCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 1 ห้อง (MCS 1) รหัส 66", file: "mcs_1_66_2566_1.pdf" },  
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 1 ห้อง (S-MCS2) รหัส 65", file: "s_mcs_2_65_2566_1.pdf" },    
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 2 รหัส 65", file: "mcs_2_65_2566_1.pdf" },      
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 3-5", file: "mcs_3-5_2566_1.pdf" },  
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ปีที่ 4", file: "mcs_4_2566_1.pdf" },        
        ]
      },
      {
        id: "DCS",
        title: "ระดับปริญญาเอก (DCS)",
        icon: <GraduationCap size={20} />,
        subjects: [
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 1 ห้อง (DCS 1)", file: "dcs_1_2566_1.pdf" },
          { label: "สาขาวิชาวิทยาการคอมพิวเตอร์ ปีที่ 3-5 (DCS 3-5)", file: "dcs_3-5_2566_1.pdf" },
        ]
      },
      {
        id: "SERVICE",
        title: "บริการวิชาการนอกภาค",
        icon: <Users size={20} />,
        subjects: [
          { label: "รายวิชาที่ภาควิชาวิทยาการคอมพิวเตอร์และสารสนเทศ เปิดบริการแก่นักศึกษานอกภาควิชา", file: "service_2566_1.pdf" },
        ]
      }
    ],
  };

  // 🔍 เลือกดึงข้อมูลตามพารามิเตอร์ URL
  const currentKey = `${year}-${term}`;
  const subjectGroups = allCourseData[currentKey] || [];

  return (
    <div className="bg-[#F8FAFC] font-['Prompt'] min-h-screen flex flex-col text-left">
      
      {/* 🏛️ Header Section */}
      <section className="bg-[#3F51B5] text-white py-8 px-6 relative overflow-hidden">
                    <div className="max-w-5xl mx-auto relative z-10">
                      <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                      >
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">ขบวนวิชา</h1>
                        <div className="w-12 h-1 bg-white/30 mb-5"></div>
                      </motion.div>
                    </div>
                    <div className="absolute right-[0%] bottom-[5%] opacity-5 select-none pointer-events-none">
                      <h2 className="text-[5rem] font-bold">CIS</h2>
                    </div>
                  </section>

      {/* 📚 Main Content Grid */}
      <main className="max-w-6xl mx-auto w-full px-6 py-12 flex-grow">
        {subjectGroups.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-12">
            {subjectGroups.map((group, idx) => (
              <motion.div 
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="space-y-5"
              >
                {/* Group Header */}
                <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-3">
                  <div className="p-2 bg-[#3F51B5] text-white rounded-lg shadow-sm">
                    {group.icon}
                  </div>
                  <h2 className="text-[#3F51B5] font-bold text-lg tracking-tight">
                    {group.title}
                  </h2>
                </div>

                {/* Subject List */}
                <div className="grid gap-3">
                  {group.subjects.map((sub, sIdx) => (
                    <a 
                      key={sIdx}
                      href={`/files/courses/${year}/${term}/${sub.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-[#3F51B5]/30 hover:bg-indigo-50/30 transition-all group"
                    >
                      <div className="flex items-center gap-4 flex-1 pr-4">
                        <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-[#3F51B5] rounded-xl transition-colors">
                          <FileText size={20} />
                        </div>
                        <span className="text-[14.5px] font-bold text-slate-600 group-hover:text-slate-800 leading-tight">
                          {sub.label}
                        </span>
                      </div>
                      <div className="flex items-center shrink-0">
                        <ArrowUpRight size={20} className="text-slate-300 group-hover:text-[#3F51B5] transition-all" />
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-4"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
              <Inbox size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-700">ไม่พบข้อมูลขบวนวิชา</h3>
              <p className="text-slate-400 text-sm mt-1">ยังไม่มีการเพิ่มข้อมูลสำหรับปีการศึกษา {term}/{year} เข้าสู่ระบบ</p>
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="mt-4 px-6 py-2 bg-[#3F51B5] text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
            >
              กลับไปหน้าก่อนหน้า
            </button>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}