import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

async function run() {
  const filePath = "uploads/courses/bachelor/regular/2564/course_bachelor3.pdf";
  const dataBuffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  
  const text = result.text;
  const match = text.indexOf("คำอธิบายรายวิชา");
  console.log("Match 'คำอธิบายรายวิชา' at:", match);
  if (match !== -1) {
    console.log(text.slice(match, match + 3000));
  } else {
    // Search for pattern like "040613201" after page 15
    const idx2 = text.lastIndexOf("040613201");
    console.log("Last occurrence of 040613201 at:", idx2);
    if (idx2 !== -1) {
      console.log(text.slice(idx2 - 100, idx2 + 2000));
    }
  }
}

run().catch(console.error);
