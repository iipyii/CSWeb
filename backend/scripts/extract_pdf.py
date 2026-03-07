from pdfminer.high_level import extract_text
import json
import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = sys.argv[1]

text = extract_text(pdf_path)

# clean text
text = text.replace("\n", " ")
text = text.replace("\f", " ")

text = re.sub(r"หมวด\s*ที\s*่", "หมวดที่", text)
text = re.sub(r"([ก-ฮ])\s+([ก-ฮ])", r"\1\2", text)
text = re.sub(r"\s+([่้๊๋็])", r"\1", text)

# แก้คำที่พบบ่อย
fix_words = {
    "จ านวน": "จำนวน",
    "ด าเนิน": "ดำเนิน",
    "ส าหรับ": "สำหรับ",
    "ค า": "คำ",
    "จ าเป็น": "จำเป็น",
    "อ านาจ": "อำนาจ",
    "ก าหนด": "กำหนด",
    "ท า": "ทำ"
}

for k,v in fix_words.items():
    text = text.replace(k,v)
    
text = re.sub(r"\s+", " ", text)

text = re.sub(r"(หมวดที่\s*\d+)", r"\n\n\1", text)
text = re.sub(r"(\d+\.)", r"\n\1", text)
# เพิ่มบรรทัดก่อนหัวข้อใหญ่
text = re.sub(r"(หมวดที่\s*\d+)", r"\n\n\1\n", text)

# ขึ้นบรรทัดก่อนเลขข้อ
text = re.sub(r"\s(\d+\.)", r"\n\1", text)

# รวม whitespace
text = re.sub(r"[ \t]+", " ", text)

result = {
    "content": text.strip()
}

print(json.dumps(result, ensure_ascii=False))