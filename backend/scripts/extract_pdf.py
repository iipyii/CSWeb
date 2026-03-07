from pdfminer.high_level import extract_text
import json
import re
import sys

pdf_path = sys.argv[1]

text = extract_text(pdf_path)
# รวมบรรทัด
text = text.replace("\n", " ")

# ลบ page break
text = text.replace("\f", " ")

# normalize หมวดที่
text = re.sub(r"หมวด\s*ที\s*่", "หมวดที่", text)

# แก้คำที่แยก เช่น "จ านวน"
text = re.sub(r"([ก-ฮ])\s+([ก-ฮ])", r"\1\2", text)

# ลบช่องว่างระหว่างตัวอักษรกับวรรณยุกต์ไทย
text = re.sub(r"\s+([่้๊๋็])", r"\1", text)

# ลบช่องว่างเกิน
text = re.sub(r"\s+", " ", text)

sections = re.split(r"หมวดที่\s*(\d+)", text)

result = []

for i in range(1, len(sections), 2):
    section_no = sections[i]
    content = sections[i+1]

    result.append({
        "section_no": int(section_no),
        "content": content.strip()
    })

print(json.dumps(result, ensure_ascii=False))