import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dir = "data/consult";

// async function importFile(filePath) {

//     const rows = [];

//     return new Promise((resolve) => {

//     fs.createReadStream(filePath)
//         .pipe(csv({
//             mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '') 
//         }))
//         .on("data", (data) => rows.push(data))
//         .on("end", async () => {

//             const lecturers = await prisma.lecturers.findMany();

//             const lecturerMap = {};

//             for (const l of lecturers) {
//                 lecturerMap[l.email] = l.id;
//             }
//             for (const r of rows) {

//                 const year = Number(String(r.year).trim());
//                 const level = String(r.level || "").trim();
//                 const email = String(r.advisor_email || "").trim();

//                 const lecturerId = lecturerMap[email];

//                 if (!lecturerId) {
//                     console.log("lecturer not found:", email);
//                     continue;
//                 }

//                 const advisor = await prisma.advisors.upsert({
//                     where: {
//                         lecturerId_year_level: {
//                             lecturerId: lecturerId,
//                             year,
//                             level
//                         }
//                     },
//                     update: {},
//                     create: {
//                         lecturerId: lecturerId,
//                         year,
//                         level
//                     }
//                 });

//                 const student = await prisma.students.upsert({
//                     where: { student_id: r.student_id },
//                     update: {},
//                     create: {
//                         student_id: r.student_id,
//                         title: r.title,
//                         firstname: r.firstname,
//                         lastname: r.lastname,
//                         room: r.room
//                     }
//                 });

//                 await prisma.advisor_students.upsert({
//                     where: {
//                         studentId_advisorId: {
//                             studentId: student.id,
//                             advisorId: advisor.id
//                         }
//                     },
//                     update: {},
//                     create: {
//                         studentId: student.id,
//                         advisorId: advisor.id
//                     }
//                 });

//             }

//             console.log("imported:", filePath);
//             resolve();

//         });
//     });
// }

// async function run() {

//   const files = fs.readdirSync(dir);

//   for (const file of files) {

//     if (!file.endsWith(".csv")) continue;

//     const filePath = path.join(dir, file);

//     await importFile(filePath);

//   }

//   console.log("ALL CONSULT DATA IMPORTED");
//   process.exit();

// }

// run();

async function importFile(filePath) {

    const rows = [];

    await new Promise((resolve) => {

        fs.createReadStream(filePath)
            .pipe(csv({
                mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, "")
            }))
            .on("data", (data) => rows.push(data))
            .on("end", resolve);

    });

    const lecturers = await prisma.lecturers.findMany();

    const lecturerMap = {};
    for (const l of lecturers) {
        lecturerMap[l.email] = l.id;
    }

    const studentData = [];
    const advisorSet = new Map();

    for (const r of rows) {

        const year = Number(r.year);
        const level = r.level.trim();
        const email = r.advisor_email.trim();

        const lecturerId = lecturerMap[email];
        if (!lecturerId) continue;

        studentData.push({
            student_id: r.student_id,
            title: r.title,
            firstname: r.firstname,
            lastname: r.lastname,
            room: r.room
        });

        const key = `${lecturerId}-${year}-${level}`;

        advisorSet.set(key, {
            lecturerId,
            year,
            level
        });

    }

    const advisorData = Array.from(advisorSet.values());

    // batch insert
    await prisma.students.createMany({
        data: studentData,
        skipDuplicates: true
    });

    await prisma.advisors.createMany({
        data: advisorData,
        skipDuplicates: true
    });

    const students = await prisma.students.findMany({
        where: {
            student_id: { in: studentData.map(s => s.student_id) }
        }
    });

    const advisors = await prisma.advisors.findMany({
        where: {
            OR: advisorData.map(a => ({
                lecturerId: a.lecturerId,
                year: a.year,
                level: a.level
            }))
        }
    });

    const studentMap = {};
    students.forEach(s => studentMap[s.student_id] = s.id);

    const advisorMap = {};
    advisors.forEach(a => {
        advisorMap[`${a.lecturerId}-${a.year}-${a.level}`] = a.id;
    });

    const relations = [];

    for (const r of rows) {

        const year = Number(r.year);
        const level = r.level.trim();
        const email = r.advisor_email.trim();

        const lecturerId = lecturerMap[email];

        const studentId = studentMap[r.student_id];
        const advisorId = advisorMap[`${lecturerId}-${year}-${level}`];

        if (studentId && advisorId) {
            relations.push({
                studentId,
                advisorId
            });
        }

    }

    await prisma.advisor_students.createMany({
        data: relations,
        skipDuplicates: true
    });

    console.log("imported:", filePath);

}

async function run() {

    const files = fs.readdirSync(dir);

    for (const file of files) {

        if (!file.endsWith(".csv")) continue;

        const filePath = path.join(dir, file);

        await importFile(filePath);

    }

    console.log("ALL CONSULT DATA IMPORTED");
    process.exit();

}

run();