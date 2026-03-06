import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [lang, setLang] = useState("TH");

  const navItems = [
    { label: "หน้าหลัก", href: "/" },
    { 
      label: "แนะนำภาควิชาฯ", 
      href: "#", 
      dropdown: [
        { label: "ประวัติภาควิชาฯ", href: "/history" }, 
        { label: "โครงสร้างการบริหาร", href: "/organization" },
        { label: "ติดต่อภาควิชาฯ", href: "/contact" },
      ] 
    },
    { 
      label: "บุคลากร", 
      href: "#", 
      dropdown: [
        { label: "บุคลากรสายวิชาการ", href: "/administrator" },
        { label: "บุคลากรสายสนับสนุน", href: "/staff" },
        { label: "ดาวน์โหลดเอกสารสำหรับบุคลากร", href: "/staff-download" },
        { label: "ลิงก์สำหรับบุคลากร", href: "/personnel-links" },
      ] 
    },
    { 
      label: "นักศึกษา", 
      href: "#", 
      dropdown: [
        { 
          label: "หลักสูตร", 
          href: "#",
          submenu: [
            { 
              label: "หลักสูตรปริญญาตรี", 
              href: "#",
              nestedSubmenu: [
                { label: "ภาคปกติ", href: "/course-sections/bachelor" },
                { label: "โครงการพิเศษ/สองภาษา", href: "/course-sections/cs-english" },
              ]
            },
            { 
              label: "หลักสูตรปริญญาโท", 
              href: "#",
              nestedSubmenu: [
                { label: "สาขาวิชาวิทยาการคอมพิวเตอร์", href: "/course-sections/cs-master" },
                { label: "สาขาวิชาวิศวกรรมซอฟต์แวร์", href: "/course-sections/se-master" },
              ]
            },
            { label: "หลักสูตรปริญญาเอก", href: "/course-sections/doctor" },
            { label: "คำอธิบายรายวิชา", href: "/course-description" },
          ]
        },
        { label: "ดาวน์โหลดเอกสารสำหรับนักศึกษา", href: "/student-downloads" },
        { label: "โครงงานนักศึกษา", href: "/student-projects" },
        { 
          label: "อาจารย์ที่ปรึกษา", 
          href: "#", 
          submenu: [
            { label: "ค้นหารายชื่อนักศึกษา", href: "/consult-student/:code" },
          ]
        },
        { label: "การฝึกงาน", href: "/internship" },
        { label: "ปฏิทินการศึกษา", href: 'https://acdserv.kmutnb.ac.th/academic-calendar', isExternal: true },
        { label: "ขบวนวิชา", href: "/subject-courses" },
        { label: "คู่มือนักศึกษา", href: "#" },
        { label: "ลิงก์สำหรับนักศึกษา", href: "/student-links" },
      ] 
    },
    { label: "ข่าวสารและกิจกรรม", 
      href: "/news", // เชื่อมไปหน้า News หลัก
      dropdown: [
        { label: "ข่าวทั้งหมด", href: "/news" },
        { label: "ข่าวภาควิชาฯ", href: "/news" },
        { label: "ข่าวคณะ/มหาวิทยาลัย", href: "/news" },
        { label: "ข่าวทุนการศึกษา", href: "/news" },
      ] 
    },
    { label: "ระเบียบ/ประกาศ", 
      href: "#", 
      dropdown: [
        { label: "งานการเงิน", href: "#" },
        { label: "งานวิชาการ", href: "#" },
        { label: "งานบุคคล", href: "#" },
        { label: "ระดับบัณฑิตศึกษา", href: "#" },
        { label: "งานกิจการนักศึกษา", href: "#" },
        { label: "สหกิจศึกษา", href: "#" },
        { label: "งานทุนการศึกษา", href: "#" },
      ] 
    },
    { label: "CS Greenoffice", href: "/green-office" },
    { label: "FAQ", href: "#" },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <Link to="/">
            <img src="/cis-logo.svg" alt="CIS KMUTNB" className={styles.logo} />
          </Link>
        </div>

        <div className={styles.navContent}>
          {/* Top Row: Search & Lang */}
          <div className={styles.topRow}>
            <div className={styles.searchBar}>
              <Search size={14} className={styles.searchIcon} />
              <input type="text" className={styles.searchInput} placeholder="ค้นหา" />
            </div>
            <div className={styles.langSwitcher}>
              <button 
                className={`${styles.langBtn} ${lang === "TH" ? styles.active : ""}`}
                onClick={() => setLang("TH")}
              >TH</button>
              <button 
                className={`${styles.langBtn} ${lang === "EN" ? styles.active : ""}`}
                onClick={() => setLang("EN")}
              >EN</button>
            </div>
          </div>

          {/* Bottom Row: Main Navigation */}
          <nav className={styles.bottomRow}>
            <ul className={styles.menuList}>
              {navItems.map((item, idx) => (
                <li key={idx} className={styles.menuItem}>
                  <Link to={item.href} className={styles.menuLink}>
                    {item.label}
                    {item.dropdown && <ChevronDown size={12} className={styles.caret} />}
                  </Link>
                  
                  {/* First Level Dropdown */}
                  {item.dropdown && (
                    <ul className={styles.dropdownMenu}>
                      {item.dropdown.map((sub, sIdx) => (
                        <li key={sIdx} className={styles.dropdownItem}>
                          <Link to={sub.href} className={styles.dropdownLink}>
                            {sub.label}
                            {sub.submenu && <ChevronDown size={12} className={styles.sideCaret} />}
                          </Link>
                          
                          {/* Second Level Dropdown (Submenu) */}
                          {sub.submenu && (
                            <ul className={styles.subDropdownMenu}>
                              {sub.submenu.map((deepSub, dIdx) => (
                                <li key={dIdx} className={styles.nestedDropdownItem}>
                                  <Link to={deepSub.href} className={styles.dropdownLink}>
                                    {deepSub.label}
                                    {deepSub.nestedSubmenu && <ChevronDown size={12} className={styles.sideCaret} />}
                                  </Link>

                                  {/* Third Level Dropdown (Nested Submenu) */}
                                  {deepSub.nestedSubmenu && (
                                    <ul className={styles.nestedSubMenu}>
                                      {deepSub.nestedSubmenu.map((lastSub, lIdx) => (
                                        <li key={lIdx}>
                                          <Link to={lastSub.href} className={styles.dropdownLink}>
                                            {lastSub.label}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}