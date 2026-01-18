import { useMemo, useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [lang, setLang] = useState("TH");
  const [query, setQuery] = useState("");

  const navItems = useMemo(
    () => [
      { label: "หน้าหลัก", href: "/" },
      { label: "แนะนำภาควิชาฯ", href: "#", dropdown: true },
      { label: "บุคลากร", href: "#", dropdown: true },
      { label: "นักศึกษา", href: "#", dropdown: true },
      { label: "ข่าวสารและกิจกรรม", href: "#", dropdown: true },
      { label: "ระเบียบ/ประกาศ", href: "#", dropdown: true },
      { label: "CS Greenoffice", href: "#" },
      { label: "FAQ", href: "#" },
    ],
    []
  );

  const onSearch = (e) => {
    e.preventDefault();
    console.log("search:", query, "lang:", lang);
  };

  return (
    <header className={`${styles.container} ${styles.navbar}`}>
      <div className={styles.inner}>
        {/* ===== TOP ROW: logo + search + lang ===== */}
        <div className={styles.topRow}>
          <a href="/" className={styles.left}>
            <img src="/cis-logo.svg" alt="CIS KMUTNB" className={styles.logo} />
          </a>

          <div className={styles.right}>
            <form className={styles.search} onSubmit={onSearch}>
              <span className={styles.searchIcon}>🔎</span>
              <input
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "TH" ? "ค้นหา" : "Search"}
              />
            </form>

            <div className={styles.lang}>
              <button
                type="button"
                onClick={() => setLang("TH")}
                className={`${styles.langBtn} ${
                  lang === "TH" ? styles.langBtnActive : ""
                }`}
              >
                TH
              </button>
              <button
                type="button"
                onClick={() => setLang("EN")}
                className={`${styles.langBtn} ${
                  lang === "EN" ? styles.langBtnActive : ""
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM ROW: menu ===== */}
        <nav className={styles.bottomRow} aria-label="main navigation">
          <ul className={styles.menu}>
            {navItems.map((it) => (
              <li key={it.label}>
                <a href={it.href} className={styles.item}>
                  <span>{it.label}</span>
                  {it.dropdown && <span className={styles.caret}>▾</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}




