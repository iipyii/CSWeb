import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const baseDir = "./uploads/courses";

function scan(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scan(fullPath);
      continue;
    }

    if (!item.endsWith(".pdf")) continue;

    console.log("Processing:", fullPath);

    // --------- parse path ----------
    const parts = fullPath.split(path.sep);

    const degree = parts[2];
    const program = parts[3];
    const year = parts[4];

    // --------- parse section ----------
    const match = item.match(/\d+/);
    const section = match ? parseInt(match[0]) : 0;

    console.log({
      degree,
      program,
      year,
      section
    });

    // --------- extract text ----------
    const output = execSync(
      `python scripts/extract_pdf.py "${fullPath}"`
    ).toString();

    const sections = JSON.parse(output);

    console.log("Text extracted:", sections.length);
  }
}

scan(baseDir);