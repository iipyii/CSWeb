import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // สั่งให้หน้าจอเลื่อนไปที่ตำแหน่งบนสุด (0, 0) แบบทันที
    window.scrollTo(0, 0);
  }, [pathname]); // ทำงานทุกครั้งที่ pathname (URL) เปลี่ยนแปลง

  return null;
}