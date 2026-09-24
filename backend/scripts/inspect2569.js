import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

async function check2569Middle() {
  const filePath = "uploads/courses/bachelor/regular/2569/course_bachelor3_2569.pdf";
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const res = await parser.getText();
  
  const text = res.text;
  console.log("=== Around index 25000 (approx page 20) ===");
  console.log(text.slice(25000, 28000));
}

check2569Middle().catch(console.error);
