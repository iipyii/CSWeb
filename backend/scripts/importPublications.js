import fs from "fs";
import csv from "csv-parser";
import { prisma } from "../src/lib/prisma.js";

const results = [];

fs.createReadStream("./publications.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", async () => {
    console.log(`CSV rows: ${results.length}`);

    for (const row of results) {
      const lecturerCode = row.lecturer_code.trim();

      // หา lecturer จาก code
      let lecturer = await prisma.lecturers.findUnique({
        where: { lecturer_code: lecturerCode },
      });

      // ถ้ายังไม่มี lecturer ให้สร้างใหม่
      if (!lecturer) {
        lecturer = await prisma.lecturers.create({
          data: {
            lecturer_code: lecturerCode,
            fullname_th: lecturerCode, // แก้ทีหลังได้
          },
        });

        console.log(`Created lecturer: ${lecturerCode}`);
      }

      // เพิ่ม publication
      await prisma.research_publications.create({
        data: {
          lecturer_id: lecturer.id,
          title: row.title,
          authors: row.authors,
          publication_type: row.publication_type,
          venue: row.venue,
          publication_year: row.publication_year
            ? parseInt(row.publication_year)
            : null,
          volume: row.volume,
          issue: row.issue,
          pages: row.pages,
          doi: row.doi,
          url: row.url,
          abstract: row.abstract,
        },
      });

      console.log(`Imported: ${row.title}`);
    }

    console.log("Import finished 🎉");
    await prisma.$disconnect();
  });