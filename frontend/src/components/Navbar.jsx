import { useState } from "react";
import { Link } from "react-router-dom"; // นำเข้า Link เพื่อใช้ระบบ Routing
import { Search, ChevronDown } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [lang, setLang] = useState("TH");

  // โครงสร้างข้อมูลเมนู ปรับปรุง href ให้ส่งพารามิเตอร์ level ไปยังหน้า CourseSections
  const navItems = [
    { label: "หน้าหลัก", href: "/" },
    { 
      label: "แนะนำภาควิชาฯ", 
      href: "#", 
      dropdown: [
        { label: "ประวัติภาควิชาฯ", href: "#" },
        { label: "วิสัยทัศน์ / พันธกิจ", href: "#" },
        { label: "โครงสร้างการบริหาร", href: "#" },
        { label: "ติดต่อภาควิชาฯ", href: "#" },
      ] 
    },
    { 
      label: "บุคลากร", 
      href: "#", 
      dropdown: [
        { label: "บุคลากรสายวิชาการ", href: "#" },
        { label: "บุคลากรสายสนับสนุน", href: "#" },
        { label: "ดาวน์โหลดเอกสารสำหรับบุคลากร", href: "#" },
        { label: "ลิงก์สำหรับบุคลากร", href: "#" },
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
                // เชื่อมโยงไปยัง bachelor (ภาคปกติ) และ cs-english (โครงการพิเศษ)
                { label: "ภาคปกติ", href: "/course-sections/bachelor" },
                { label: "โครงการพิเศษ/สองภาษา", href: "/course-sections/cs-english" },
              ]
            },
            { 
              label: "หลักสูตรปริญญาโท", 
              href: "#",
              nestedSubmenu: [
                // เชื่อมโยงไปยังสาขาเฉพาะทางของ ป.โท
                { label: "สาขาวิชาวิทยาการคอมพิวเตอร์", href: "/course-sections/cs-master" },
                { label: "สาขาวิชาวิศวกรรมซอฟต์แวร์", href: "/course-sections/se-master" },
              ]
            },
            // เชื่อมโยงไปยัง doctor (ป.เอก)
            { label: "หลักสูตรปริญญาเอก", href: "/course-sections/doctor" },
            { label: "คำอธิบายรายวิชา", href: "/course-description" },
          ]
        },
        { label: "ดาวน์โหลดเอกสารสำหรับนักศึกษา", href: "/student-downloads" },
        { label: "โครงงานนักศึกษา", href: "#" },
        { 
          label: "อาจารย์ที่ปรึกษา", 
          href: "#", 
          submenu: [
            { label: "ค้นหารายชื่อนักศึกษา", href: "#" },
          ]
        },
        { label: "การฝึกงานและสหกิจศึกษา", href: "#" },
        { label: "ปฏิทินการศึกษา", href: "#" },
        { label: "ขบวนวิชา", href: "#" },
        { label: "คู่มือนักศึกษา", href: "#" },
        { label: "ลิงก์สำหรับนักศึกษา", href: "#" },
      ] 
    },
    { label: "ข่าวสารและกิจกรรม", 
      href: "#", 
      dropdown: [
        { label: "ข่าวภาควิชาฯ", href: "#" },
        { label: "ข่าวคณะ/มหาวิทยาลัย", href: "#" },
        { label: "ข่าวทุนการศึกษา", href: "#" },
        { label: "ข่าวรับสมัคร/ประชาสัมพันธ์", href: "#" },
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
    { label: "CS Greenoffice", href: "#" },
    { label: "FAQ", href: "#" },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <Link to="/">
            <img src="/cis-logo.svg" alt="CIS KMUTNB" className={styles.logo} />
          </Link>
        </div>

        <div className={styles.navContent}>
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

          <nav className={styles.bottomRow}>
            <ul className={styles.menuList}>
              {navItems.map((item, idx) => (
                <li key={idx} className={styles.menuItem}>
                  {/* เปลี่ยนเป็น Link เพื่อใช้ระบบนำทางภายใน App */}
                  <Link to={item.href} className={styles.menuLink}>
                    {item.label}
                    {item.dropdown && <ChevronDown size={12} className={styles.caret} />}
                  </Link>
                  
                  {item.dropdown && (
                    <ul className={styles.dropdownMenu}>
                      {item.dropdown.map((sub, sIdx) => (
                        <li key={sIdx} className={styles.dropdownItem}>
                          <Link to={sub.href} className={styles.dropdownLink}>
                            {sub.label}
                            {sub.submenu && <ChevronDown size={12} className={styles.sideCaret} />}
                          </Link>
                          
                          {sub.submenu && (
                            <ul className={styles.subDropdownMenu}>
                              {sub.submenu.map((deepSub, dIdx) => (
                                <li key={dIdx} className={styles.nestedDropdownItem}>
                                  <Link to={deepSub.href} className={styles.dropdownLink}>
                                    {deepSub.label}
                                    {deepSub.nestedSubmenu && <ChevronDown size={12} className={styles.sideCaret} />}
                                  </Link>

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