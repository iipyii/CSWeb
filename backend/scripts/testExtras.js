import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const extraFiles = [
  { path: "uploads/courses/bachelor/regular/2554/bsc54-3.pdf", code: "CS54", year: 2554, degree: "bachelor" },
  { path: "uploads/courses/doctor/computersci/2559/course_edit_phd2559.pdf", code: "PhD-CS59", year: 2559, degree: "doctor" }
];

async function testExtras() {
  for (const f of extraFiles) {
    if (fs.existsSync(f.path)) {
      const dataBuffer = fs.readFileSync(f.path);
      const parser = new PDFParse({ data: dataBuffer });
      const res = await parser.getText();
      console.log(`[EXTRA ${f.code}] Length: ${res.text.length} chars`);
    }
  }
}

testExtras().catch(console.error);
