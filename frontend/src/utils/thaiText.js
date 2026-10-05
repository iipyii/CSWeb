/**
 * Utility function to clean up Thai text extraction artifacts:
 * - Fixes tone marks / vowels broken with spaces (e.g. "เครือข่ าย" -> "เครือข่าย", "ข้ อมูล" -> "ข้อมูล", "อีสปอร์ ต" -> "อีสปอร์ต")
 * - Fixes decomposed SARA AM (e.g. "ส าหรับ" -> "สำหรับ", "ประจ าวัน" -> "ประจำวัน", "จ านวน" -> "จำนวน", "ด าเนินการ" -> "ดำเนินการ")
 * - Replaces non-standard PUA code points and Windows-874 / Mac encoding glitches
 * - Normalizes common computer science terms (e.g. "คอมพิวเตอร์", "ซอฟต์แวร์", "กราฟิกส์")
 */
export function cleanThaiDisplay(str) {
  if (!str || typeof str !== "string") return str || "";

  let s = str
    // Replace Win-874 / Mac broken single-byte characters
    .replace(/[\x9B\u009B›]/g, "่")
    .replace(/[\x9C\u009Cœ\x9A\u009Aš]/g, "้")
    .replace(/[\x9D\u009D\x8E\u008E]/g, "์")
    .replace(/[\x9E\u009Ež]/g, "ั")
    .replace(/[\x9F\u009FŸ]/g, "็")
    .replace(/[\x85\u0085—]/g, "ึ")
    .replace(/[\x98\u0098˜]/g, "ื")
    .replace(/[\x84\u0084\x95\u0095•]/g, "ิ")
    // Replace Unicode Private Use Area (PUA) Thai glyphs
    .replace(/\uF701/g, "ิ")
    .replace(/\uF702/g, "ี")
    .replace(/\uF703/g, "ึ")
    .replace(/\uF704/g, "ื")
    .replace(/\uF705/g, "่")
    .replace(/\uF706/g, "้")
    .replace(/\uF709/g, "์")
    .replace(/\uF70A/g, "่")
    .replace(/\uF70B/g, "้")
    .replace(/\uF70C/g, "๊")
    .replace(/\uF70D/g, "๋")
    .replace(/\uF70E/g, "์")
    .replace(/\uF70F/g, "ํ")
    .replace(/\uF710/g, "ั")
    .replace(/\uF711/g, "่")
    .replace(/\uF712/g, "็")
    .replace(/\uF713/g, "้")
    .replace(/\uF714/g, "๊")
    .replace(/\uF715/g, "ั")
    .replace(/\uF716/g, "็")
    .replace(/\uF717/g, "์")
    .replace(/\uF718/g, "ิ")
    .replace(/\uF719/g, "ี")
    .replace(/\uF71A/g, "ึ")
    // Normalize SARA AM decomposed into NIKHAHIT + SARA AA
    .replace(/ํ[ ]*า/g, "ำ")
    .replace(/\u0E4D\u0E32/g, "ำ");

  // Remove spaces before upper/lower vowels & tone marks
  s = s.replace(/([ก-ฮ])\s+([่้๊๋์ิีึืุูั็])/g, "$1$2");

  // Remove spaces between tone marks / vowels and following Thai consonants/vowels
  s = s.replace(/([่้๊๋์ิีึืุูั็])\s+([ก-ฮะ-ูเ-ไ])/g, "$1$2");
  s = s.replace(/([่้๊๋์ิีึืุูั็])\s+([ก-ฮะ-ูเ-ไ])/g, "$1$2");

  // Fix broken SARA AM: Consonant + space + า -> Consonant + ำ
  s = s.replace(/([ก-ฮ])\s+า(?![a-zA-Z0-9])/g, "$1ำ");

  // Fix SARA AM with tone marks: "น้ า" -> "น้ำ", "ต่ า" -> "ต่ำ"
  s = s.replace(/([ก-ฮ])([่้๊๋])\s+า(?![a-zA-Z0-9])/g, "$1$2ำ");

  // Normalize common technical terms and academic typos
  s = s
    .replace(/ซอฟต[ ]*แวร[ ]*/g, "ซอฟต์แวร์")
    .replace(/คอมพิวเตอร[ ]*/g, "คอมพิวเตอร์")
    .replace(/อินเทอร[ ]*เน็ต/g, "อินเทอร์เน็ต")
    .replace(/ปัญญาประดิษฐ[ ]*/g, "ปัญญาประดิษฐ์")
    .replace(/คณิตศาสตร[ ]*/g, "คณิตศาสตร์")
    .replace(/วิทยาศาสตร[ ]*/g, "วิทยาศาสตร์")
    .replace(/ศาสตร[ ]*/g, "ศาสตร์")
    .replace(/ประยุกต[ ]*/g, "ประยุกต์")
    .replace(/วิเคราะห[ ]*/g, "วิเคราะห์")
    .replace(/โครงงานพิกษ/g, "โครงงานพิเศษ")
    .replace(/กราฟ[ •\x95]*กส[ ]*/g, "กราฟิกส์")
    .replace(/ฟ[ •\x95]*สิกส[ ]*/g, "ฟิสิกส์")
    .replace(/เวิลด[ ]*/g, "เวิลด์")
    .replace(/คลาวด[ ]*/g, "คลาวด์")
    .replace(/ไซเบอร[ ]*/g, "ไซเบอร์")
    .replace(/แพลตฟอร[ ]*ม/g, "แพลตฟอร์ม")
    .replace(/เซิร[ ]*ฟเวอร[ ]*/g, "เซิร์ฟเวอร์")
    .replace(/ไดรฟ[ ]*/g, "ไดรฟ์")
    .replace(/อิเล็กทรอนิกส[ ]*/g, "อิเล็กทรอนิกส์")
    .replace(/รีจิสเตอร[ ]*/g, "รีจิสเตอร์")
    .replace(/แดชบอร[ ]*ด/g, "แดชบอร์ด")
    .replace(/อีเวนท[ ]*/g, "อีเวนต์")
    .replace(/โมบายล[ ]*/g, "โมบายล์")
    .replace(/แอปพลิเคช[ ]*น/g, "แอปพลิเคชัน")
    .replace(/สตาร[ ]*ตอัพ/g, "สตาร์ตอัป")
    .replace(/สตาร[ ]*ทอัพ/g, "สตาร์ทอัพ")
    .replace(/สาหรับการคณนา/g, "สำหรับการคณนา")
    .replace(/([์ิีึืุูั็่้๊๋])\1+/g, "$1")
    .replace(/\s*\*+\s*/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

  return s;
}

/**
 * ฟังก์ชันแปลงวันที่ให้เป็นรูปแบบภาษาไทยอย่างถูกต้อง
 * รองรับทั้ง Date object, ISO string, และ date-only string (YYYY-MM-DD)
 * โดยแก้ปัญหา timezone shift ของคอลัมน์ date-only (เช่น start_date)
 */
export function formatThaiDate(dateInput, formatType = 'long') {
  if (!dateInput) return '-';

  // 1. ถ้ามี date-only string หรือ ISO string ที่ส่งมาจาก Prisma สำหรับ @db.Date (เช่น "2026-10-17T00:00:00.000Z" หรือ "2026-10-17")
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const datePart = dateInput.split('T')[0];
    const [yearStr, monthStr, dayStr] = datePart.split('-');
    const year = parseInt(yearStr, 10) + 543;
    const monthIndex = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const thaiMonthsLong = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiMonthsShort = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    if (monthIndex >= 0 && monthIndex < 12 && !isNaN(day) && !isNaN(year)) {
      const hasTime = dateInput.includes('T') && !dateInput.endsWith('T00:00:00.000Z') && !dateInput.endsWith('T00:00:00Z');
      if (!hasTime) {
        const month = formatType === 'short' ? thaiMonthsShort[monthIndex] : thaiMonthsLong[monthIndex];
        return `${day} ${month} ${year}`;
      }
    }
  }

  // 2. สำหรับ Timestamp ทั่วไป (เช่น created_at) แปลงตามเวลา Asia/Bangkok
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: formatType === 'short' ? 'short' : 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok'
  });
}
