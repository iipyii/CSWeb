import { PrismaClient } from "@prisma/client";
import fs from "fs";
import csv from "csv-parser";

const prisma = new PrismaClient();

async function seedLecturers() {
    const lecturers = [];

    return new Promise((resolve) => {
        fs.createReadStream("./data/lecturers.csv")
            .pipe(
                csv({
                    mapHeaders: ({ header }) =>
                        header.replace(/^\uFEFF/, "").trim()
                })
            )
            .on("data", (row) => {
                const code = row.lecturer_code?.trim();
                if (!code) return;

                lecturers.push({
                    lecturer_code: code,
                    fullname_th: row.fullname_th,
                    fullname_en: row.fullname_en,
                    position_th: row.position_th,
                    position_en: row.position_en,
                    email: row.email,
                    tel: row.tel,
                    education_th: row.education_th,
                    education_en: row.education_en,
                    image_path: row.image_path,
                });
            })
            .on("end", async () => {
                await prisma.lecturers.createMany({
                    data: lecturers,
                    skipDuplicates: true,
                });

                console.log("Lecturers seeded");
                resolve();
            });
    });
}

async function seedPublications() {

  const publications = [];

  const lecturers = await prisma.lecturers.findMany();

  const lecturerMap = {};
  lecturers.forEach(l => {
    lecturerMap[l.lecturer_code] = l.id;
  });

  return new Promise((resolve) => {
    fs.createReadStream("./data/publications.csv")
      .pipe(csv({
        mapHeaders: ({ header }) =>
          header.replace(/^\uFEFF/, "").trim()
      }))
      .on("data", (row) => {

        if (!row.title || row.title === "-") return;

        const lecturerId = lecturerMap[row.lecturer_code];

        if (!lecturerId) return;

        publications.push({
          lecturer_id: lecturerId,
          title: row.title,
          authors: row.authors || null,
          publication_type: row.publication_type || null,
          venue: row.venue || null,
          publication_year: row.publication_year
            ? Number(row.publication_year)
            : null,
          volume: row.volume || null,
          issue: row.issue || null,
          pages: row.pages || null,
          doi: row.doi || null,
          url: row.url || null,
          abstract: row.abstract || null
        });

      })
      .on("end", async () => {

        await prisma.research_publications.createMany({
          data: publications,
          skipDuplicates: true
        });

        console.log("Publications seeded");
        resolve();
      });
  });
}

async function seedStaff() {
  const staffList = [];

  return new Promise((resolve) => {
    fs.createReadStream("./data/staff.csv")
      .pipe(csv({
        mapHeaders: ({ header }) =>
          header.replace(/^\uFEFF/, "").trim()
      }))
      .on("data", (row) => {
        if (!row.fullname_th) return;

        staffList.push({
          staff_code: row.staff_code,
          fullname_th: row.fullname_th,
          fullname_en: row.fullname_en || null,
          position_th: row.position_th || null,
          position_en: row.position_en || null,
          email: row.email || null,
          image_path: row.image_path || null
        });
      })
      .on("end", async () => {
        await prisma.staff.createMany({
          data: staffList,
          skipDuplicates: true
        });

        console.log("Staff seeded");
        resolve();
      });
  });
}

async function main() {
    await seedLecturers();
    await seedPublications();
    await seedStaff();
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });