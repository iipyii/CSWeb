import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import styles from "./Navbar.module.css";

// เมนูมือถือ: รองรับ item.dropdown / sub.submenu / deepSub.nestedSubmenu แบบ recursive
function MobileNavItem({ item, onNavigate }) {
  const children = item.dropdown || item.submenu || item.nestedSubmenu;

  if (!children) {
    return (
      <Link to={item.href} className={styles.mobileLink} onClick={onNavigate}>
        {item.label}
      </Link>
    );
  }

  return (
    <details className={styles.mobileDetails}>
      <summary className={children === item.dropdown ? styles.mobileSummary : styles.mobileSubSummary}>
        {item.label}
      </summary>
      <ul className={styles.mobileSubList}>
        {children.map((child, idx) => (
          <li key={idx}>
            <MobileNavItem item={child} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [logoUrl, setLogoUrl] = useState("/cis-logo.svg");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/appearance/settings");
        const logo = res.data?.configMap?.site_logo;
        if (logo && logo.trim() !== "") {
          setLogoUrl(logo.startsWith("http") ? logo : `http://localhost:5000${logo}`);
        } else {
          setLogoUrl("/cis-logo.svg");
        }
      } catch (err) {
        console.error("Failed to load site logo:", err);
      }
    };

    fetchLogo();

    const handleLogoUpdate = (e) => {
      if (e.detail?.site_logo !== undefined) {
        const logo = e.detail.site_logo;
        if (logo && logo.trim() !== "") {
          setLogoUrl(logo.startsWith("http") ? logo : `http://localhost:5000${logo}`);
        } else {
          setLogoUrl("/cis-logo.svg");
        }
      } else {
        fetchLogo();
      }
    };

    window.addEventListener("site_config_updated", handleLogoUpdate);
    return () => window.removeEventListener("site_config_updated", handleLogoUpdate);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileOpen(false);
    }
  };

  const navItems = [
    { label: t("nav_home"), href: "/" },
    { 
      label: t("nav_about"), 
      href: "#", 
      dropdown: [
        { label: t("nav_history"), href: "/history" }, 
        { label: t("nav_organization"), href: "/organization" },
        { label: t("nav_contact"), href: "/contact" },
      ] 
    },
    { 
      label: t("nav_personnel"), 
      href: "#", 
      dropdown: [
        { label: t("nav_lecturers"), href: "/administrator" },
        { label: t("nav_staff"), href: "/staff" },
        { label: t("nav_staff_download"), href: "/staff-download" },
        { label: t("nav_personnel_links"), href: "/personnel-links" },
      ] 
    },
    { 
      label: t("nav_students"), 
      href: "#", 
      dropdown: [
        { 
          label: t("nav_curriculum"), 
          href: "#",
          submenu: [
            { 
              label: t("nav_bachelor"), 
              href: "#",
              nestedSubmenu: [
                { label: t("nav_bachelor_regular"), href: "/course-sections/bachelor" },
                { label: t("nav_bachelor_inter"), href: "/course-sections/cs-english" },
              ]
            },
            { 
              label: t("nav_master"), 
              href: "#",
              nestedSubmenu: [
                { label: t("nav_master_cs"), href: "/course-sections/cs-master" },
                { label: t("nav_master_se"), href: "/course-sections/se-master" },
              ]
            },
            { label: t("nav_doctor"), href: "/course-sections/doctor" },
            { label: t("nav_course_desc"), href: "/course-description" },
          ]
        },
        { label: t("nav_student_download"), href: "/student-downloads" },
        { label: t("nav_student_projects"), href: "/student-projects" },
        { 
          label: t("nav_consult_student"), 
          href: "#", 
          submenu: [
            { label: "ค้นหารายชื่อนักศึกษา", href: "/consult-student/:code" },
          ]
        },
        { label: t("nav_internship"), href: "/internship" },
        { label: t("nav_calendar"), href: 'https://acdserv.kmutnb.ac.th/academic-calendar', isExternal: true },
        { label: t("nav_subject_courses"), href: "/subject-courses" },
        { label: t("nav_student_guide"), href: "/student-guide" },
        { label: t("nav_student_links"), href: "/student-links" },
      ] 
    },
    { 
      label: t("nav_news"), 
      href: "/news",
      dropdown: [
        { label: t("nav_news_dept"), href: "/news?tab=ข่าวภาควิชาฯ" },
        { label: t("nav_news_faculty"), href: "/news?tab=ข่าวคณะและมหาวิทยาลัย" },
        { label: t("nav_news_scholarship"), href: "/news?tab=ข่าวทุนการศึกษา" },
        { label: t("nav_news_jobs"), href: "/news?tab=ข่าวรับสมัครงาน-ประชาสัมพันธ์" },
      ] 
    },
    { 
      label: t("nav_regulations"), 
      href: "#", 
      dropdown: [
        { label: t("nav_reg_finance"), href: "/finance-regulations" },
        { label: t("nav_reg_academic"), href: "/academic-regulations" },
        { label: t("nav_reg_personnel"), href: "/personnel-regulations" },
        { label: t("nav_reg_graduate"), href: "/graduate-regulations" },
        { label: t("nav_reg_student_affairs"), href: "/student-affairs-regulations" },
        { label: t("nav_reg_coop"), href: "/coop-regulations" },
        { label: t("nav_reg_scholarship"), href: "/scholarship-regulations" },
      ] 
    },
    { label: t("nav_green_office"), href: "/green-office" },
    { label: t("nav_faq"), href: "/faq" },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <Link to="/">
            <img 
              src={logoUrl} 
              alt="CIS KMUTNB" 
              className={styles.logo} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/cis-logo.svg";
              }}
            />
          </Link>
        </div>

        <div className={styles.navContent}>
          {/* Top Row: Search & Lang */}
          <div className={styles.topRow}>
            <div className={styles.searchBar}>
              <Search size={14} className={styles.searchIcon} />
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder={t("search_placeholder")} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
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

        {/* Hamburger: แสดงเฉพาะจอเล็ก */}
        <button
          type="button"
          className={styles.hamburgerBtn}
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label={isMobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Panel */}
      {isMobileOpen && (
        <div className={styles.mobilePanel}>
          <div className={styles.mobileSearchBar}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className={styles.mobileLangSwitcher}>
            <button
              className={`${styles.langBtn} ${lang === "TH" ? styles.active : ""}`}
              onClick={() => setLang("TH")}
            >TH</button>
            <button
              className={`${styles.langBtn} ${lang === "EN" ? styles.active : ""}`}
              onClick={() => setLang("EN")}
            >EN</button>
          </div>

          <ul className={styles.mobileMenuList}>
            {navItems.map((item, idx) => (
              <li key={idx} className={styles.mobileMenuItem}>
                <MobileNavItem item={item} onNavigate={() => setIsMobileOpen(false)} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}