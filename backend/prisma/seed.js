import { PrismaClient } from "@prisma/client";
import fs from "fs";
import csv from "csv-parser";

const prisma = new PrismaClient();

async function seedLecturers() {
  const lecturers = [];

  return new Promise((resolve) => {
    fs.createReadStream("./data/lecturers.csv")
      .pipe(csv())
      .on("data", (row) => {
        lecturers.push({
          lecturer_id: row.lecturer_id,
          fullname_th: row.fullname_th,
          fullname_en: row.fullname_en,
          position: row.position,
          email: row.email,
          tel: row.tel,
        });
      })
      .on("end", async () => {
        await prisma.lecturer.createMany({
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

  return new Promise((resolve) => {
    fs.createReadStream("./data/publications.csv")
      .pipe(csv())
      .on("data", (row) => {
        publications.push({
          title: row.title,
          year: Number(row.year),
          lecturer_id: row.lecturer_id,
        });
      })
      .on("end", async () => {
        await prisma.publication.createMany({
          data: publications,
          skipDuplicates: true,
        });

        console.log("Publications seeded");
        resolve();
      });
  });
}

async function main() {
  await seedLecturers();
  await seedPublications();
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });