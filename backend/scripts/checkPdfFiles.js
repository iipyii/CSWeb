import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

const files = [
  {
    path: "uploads/courses/bachelor/regular/2564/course_bachelor3.pdf",
    code: "CS64",
    year: 2564,
    degree: "bachelor"
  },
  {
    path: "uploads/courses/bachelor/regular/2559/course_bachelor_cs59_3.pdf",
    code: "CS59",
    year: 2559,
    degree: "bachelor"
  },
  {
    path: "uploads/courses/master/ComputerScience/2567/course_ms_cs67_3.pdf",
    code: "MS-CS67",
    year: 2567,
    degree: "master"
  },
  {
    path: "uploads/courses/master/ComputerScience/2562/course_ms_cs3.pdf",
    code: "MS-CS62",
    year: 2562,
    degree: "master"
  },
  {
    path: "uploads/courses/master/SoftwareEngineering/2559/course_se3.pdf",
    code: "MS-SE59",
    year: 2559,
    degree: "master"
  },
  {
    path: "uploads/courses/doctor/computersci/2564/course-phd3.pdf",
    code: "PhD-CS64",
    year: 2564,
    degree: "doctor"
  }
];

async function checkFiles() {
  for (const f of files) {
    if (fs.existsSync(f.path)) {
      const dataBuffer = fs.readFileSync(f.path);
      const parser = new PDFParse({ data: dataBuffer });
      const res = await parser.getText();
      console.log(`[${f.code}] ${f.path} -> Length: ${res.text.length} chars`);
    } else {
      console.log(`[MISSING] ${f.path}`);
    }
  }
}

checkFiles().catch(console.error);
