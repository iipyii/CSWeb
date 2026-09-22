import * as XLSX from "xlsx";
import { prisma } from "../lib/prisma.js";

export const getAllConsultants = async (req, res) => {
  try {
    const { year, search } = req.query;

    const where = {};

    if (year && year !== "all" && !isNaN(parseInt(year))) {
      let parsedYear = parseInt(year);
      if (parsedYear > 0 && parsedYear < 100) {
        parsedYear += 2500;
      }
      const shortYear = String(parsedYear).slice(-2);
      where.OR = [
        {
          advisor_students: {
            some: {
              advisor: {
                year: parsedYear
              }
            }
          }
        },
        {
          year: parsedYear
        },
        {
          student_id: {
            startsWith: shortYear
          }
        }
      ];
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { student_id: { contains: q, mode: "insensitive" } },
            { firstname: { contains: q, mode: "insensitive" } },
            { lastname: { contains: q, mode: "insensitive" } },
            {
              advisor_students: {
                some: {
                  advisor: {
                    lecturer: {
                      fullname_th: { contains: q, mode: "insensitive" }
                    }
                  }
                }
              }
            }
          ]
        }
      ];
    }

    const students = await prisma.students.findMany({
      where,
      include: {
        advisor_students: {
          include: {
            advisor: {
              include: {
                lecturer: true
              }
            }
          }
        }
      },
      orderBy: { student_id: "asc" }
    });

    const formatted = students.map((s) => {
      const advGroup = s.advisor_students?.[0]?.advisor;
      const advLecturer = advGroup?.lecturer;
      const academicYear = advGroup?.year || s.year || (
        s.student_id?.length >= 2 ? parseInt(s.student_id.slice(0, 2)) + 2500 : null
      );
      const degreeLevel = advGroup?.level || (
        s.room?.toLowerCase().includes("m") ? "master" :
        s.room?.toLowerCase().includes("d") ? "doctor" : "bachelor"
      );

      return {
        id: s.id,
        student_id: s.student_id,
        title: s.title || '',
        firstname: s.firstname || '',
        lastname: s.lastname || '',
        name: `${s.title || ''}${s.firstname} ${s.lastname}`.trim(),
        room: s.room || "-",
        academic_year: academicYear,
        year: academicYear,
        level: degreeLevel,
        advisor: advLecturer?.fullname_th || "ยังไม่ได้ระบุ",
        advisor_code: advLecturer?.lecturer_code || "",
        advisor_id: advLecturer?.id || ""
      };
    });

    // ดึงรายการปีการศึกษาทั้งหมดที่มีในระบบ (ทั้งจาก advisors และ students)
    const [advisorYears, studentYears] = await Promise.all([
      prisma.advisors.findMany({
        distinct: ["year"],
        select: { year: true }
      }),
      prisma.students.findMany({
        distinct: ["year"],
        select: { year: true }
      })
    ]);

    const yearSet = new Set([
      ...advisorYears.map(y => y.year).filter(Boolean),
      ...studentYears.map(y => y.year).filter(Boolean),
      2569, 2568, 2567, 2566, 2565, 2564
    ]);

    const sortedYears = Array.from(yearSet).sort((a, b) => b - a);

    res.json({
      data: formatted,
      years: sortedYears
    });
  } catch (error) {
    console.error("Fetch all consultants error:", error);
    res.status(500).json({ error: "Failed to fetch consultants" });
  }
};

export const addStudentConsultant = async (req, res) => {
  try {
    const { student_id, name, year, advisor_id } = req.body;
    if (!student_id || !name) {
      return res.status(400).json({ error: "Student ID and name are required" });
    }

    const rawId = String(student_id).trim();
    let academicYear = parseInt(year);
    if (isNaN(academicYear)) {
      academicYear = rawId.length >= 2 ? parseInt(rawId.slice(0, 2)) + 2500 : 2568;
    } else if (academicYear > 0 && academicYear < 100) {
      academicYear += 2500;
    }

    let title = "นาย/นางสาว";
    let full = name.trim();
    if (full.startsWith("นาย ")) {
      title = "นาย";
      full = full.slice(4).trim();
    } else if (full.startsWith("นาย")) {
      title = "นาย";
      full = full.slice(3).trim();
    } else if (full.startsWith("นางสาว ")) {
      title = "นางสาว";
      full = full.slice(7).trim();
    } else if (full.startsWith("นางสาว")) {
      title = "นางสาว";
      full = full.slice(6).trim();
    }

    const parts = full.split(/\s+/);
    const firstname = parts[0] || "";
    const lastname = parts.slice(1).join(" ") || "";

    const student = await prisma.students.upsert({
      where: { student_id: rawId },
      update: {
        title,
        firstname,
        lastname,
        year: academicYear
      },
      create: {
        student_id: rawId,
        title,
        firstname,
        lastname,
        room: "-",
        year: academicYear
      }
    });

    if (advisor_id) {
      const advLecturerId = parseInt(advisor_id);
      if (!isNaN(advLecturerId)) {
        let advisor = await prisma.advisors.findFirst({
          where: {
            lecturerId: advLecturerId,
            year: academicYear
          }
        });
        if (!advisor) {
          advisor = await prisma.advisors.create({
            data: {
              lecturerId: advLecturerId,
              year: academicYear,
              level: "bachelor"
            }
          });
        }
        await prisma.advisor_students.upsert({
          where: {
            studentId_advisorId: {
              studentId: student.id,
              advisorId: advisor.id
            }
          },
          create: {
            studentId: student.id,
            advisorId: advisor.id
          },
          update: {}
        });
      }
    }

    res.status(201).json(student);
  } catch (error) {
    console.error("Add student consultant error:", error);
    res.status(500).json({ error: "Failed to add student" });
  }
};

export const updateStudentConsultant = async (req, res) => {
  try {
    const { id } = req.params;
    const stuId = parseInt(id);
    const { student_id, name, title, firstname, lastname, room, year, level, advisor_id } = req.body;

    const existing = await prisma.students.findUnique({
      where: { id: stuId }
    });

    if (!existing) {
      return res.status(404).json({ error: "ไม่พบข้อมูลนักศึกษา" });
    }

    let rawId = student_id ? String(student_id).trim() : existing.student_id;
    let academicYear = parseInt(year);
    if (isNaN(academicYear)) {
      academicYear = existing.year || (rawId.length >= 2 ? parseInt(rawId.slice(0, 2)) + 2500 : 2568);
    } else if (academicYear > 0 && academicYear < 100) {
      academicYear += 2500;
    }

    let newTitle = title || existing.title || "นาย/นางสาว";
    let newFirstname = firstname !== undefined ? firstname : existing.firstname;
    let newLastname = lastname !== undefined ? lastname : existing.lastname;

    if (name && name.trim()) {
      let full = name.trim();
      if (full.startsWith("นาย ")) {
        newTitle = "นาย";
        full = full.slice(4).trim();
      } else if (full.startsWith("นาย")) {
        newTitle = "นาย";
        full = full.slice(3).trim();
      } else if (full.startsWith("นางสาว ")) {
        newTitle = "นางสาว";
        full = full.slice(7).trim();
      } else if (full.startsWith("นางสาว")) {
        newTitle = "นางสาว";
        full = full.slice(6).trim();
      }
      const parts = full.split(/\s+/);
      newFirstname = parts[0] || "";
      newLastname = parts.slice(1).join(" ") || "";
    }

    const updatedStudent = await prisma.students.update({
      where: { id: stuId },
      data: {
        student_id: rawId,
        title: newTitle,
        firstname: newFirstname,
        lastname: newLastname,
        room: room !== undefined ? room : existing.room,
        year: academicYear
      }
    });

    // อัปเดตอาจารย์ที่ปรึกษา
    if (advisor_id !== undefined) {
      await prisma.advisor_students.deleteMany({
        where: { studentId: stuId }
      });

      if (advisor_id && advisor_id !== "") {
        const advLecturerId = parseInt(advisor_id);
        if (!isNaN(advLecturerId)) {
          const advLevel = level || "bachelor";
          let advisor = await prisma.advisors.findFirst({
            where: {
              lecturerId: advLecturerId,
              year: academicYear,
              level: advLevel
            }
          });

          if (!advisor) {
            advisor = await prisma.advisors.create({
              data: {
                lecturerId: advLecturerId,
                year: academicYear,
                level: advLevel
              }
            });
          }

          await prisma.advisor_students.create({
            data: {
              studentId: stuId,
              advisorId: advisor.id
            }
          });
        }
      }
    }

    res.json({ success: true, message: "อัปเดตข้อมูลนักศึกษาสำเร็จ", student: updatedStudent });
  } catch (error) {
    console.error("Update student consultant error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล: " + error.message });
  }
};

export const deleteStudentConsultant = async (req, res) => {
  try {
    const { id } = req.params;
    const stuId = parseInt(id);

    await prisma.advisor_students.deleteMany({
      where: { studentId: stuId }
    });

    await prisma.students.delete({
      where: { id: stuId }
    });

    res.json({ message: "ลบนักศึกษาสำเร็จ" });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ error: "Failed to delete student" });
  }
};

export const searchStudent = async (req, res) => {
  const q = req.query.q?.trim() || "";
  const level = req.query.level?.trim() || "all";

  if (!q) return res.json({ results: [], matched_advisor: null, total: 0 });

  try {
    const tokens = q.split(/\s+/).filter(Boolean);

    const tokenConditions = tokens.map((token) => {
      const cleanToken = token.replace(/^(นาย|นางสาว|นาง|น\.ส\.|อ\.|ดร\.)/, "");
      return {
        OR: [
          { student_id: { contains: token, mode: "insensitive" } },
          { firstname: { contains: token, mode: "insensitive" } },
          { lastname: { contains: token, mode: "insensitive" } },
          { title: { contains: token, mode: "insensitive" } },
          { room: { contains: token, mode: "insensitive" } },
          ...(cleanToken && cleanToken !== token ? [
            { firstname: { contains: cleanToken, mode: "insensitive" } },
            { lastname: { contains: cleanToken, mode: "insensitive" } }
          ] : []),
          {
            advisor_students: {
              some: {
                advisor: {
                  lecturer: {
                    OR: [
                      { fullname_th: { contains: token, mode: "insensitive" } },
                      { fullname_en: { contains: token, mode: "insensitive" } },
                      { lecturer_code: { contains: token, mode: "insensitive" } }
                    ]
                  }
                }
              }
            }
          }
        ]
      };
    });

    const where = {
      AND: [
        ...tokenConditions,
        level !== "all" ? {
          advisor_students: {
            some: {
              advisor: {
                level: level
              }
            }
          }
        } : {}
      ]
    };

    const [students, matchedAdvisor] = await Promise.all([
      prisma.students.findMany({
        where,
        include: {
          advisor_students: {
            include: {
              advisor: {
                include: {
                  lecturer: true
                }
              }
            }
          }
        },
        orderBy: [
          { student_id: "asc" }
        ],
        take: 200
      }),
      prisma.lecturers.findFirst({
        where: {
          OR: [
            { fullname_th: { contains: q, mode: "insensitive" } },
            { fullname_en: { contains: q, mode: "insensitive" } },
            { lecturer_code: { equals: q, mode: "insensitive" } }
          ]
        },
        select: {
          id: true,
          lecturer_code: true,
          fullname_th: true,
          fullname_en: true,
          position_th: true,
          email: true,
          tel: true,
          image_path: true
        }
      })
    ]);

    const formatted = students.map((student) => {
      const advisorGroup = student.advisor_students?.[0]?.advisor;
      const studentLevel = advisorGroup?.level || (
        student.room?.toLowerCase().includes("m") ? "master" :
        student.room?.toLowerCase().includes("d") ? "doctor" : "bachelor"
      );
      const admissionYear = advisorGroup?.year || student.year || (
        student.student_id ? parseInt(student.student_id.slice(0, 2)) + 2500 : null
      );

      return {
        id: student.id,
        student_id: student.student_id,
        title: student.title || "",
        firstname: student.firstname,
        lastname: student.lastname,
        room: student.room || "-",
        level: studentLevel,
        admission_year: admissionYear, 
        advisor: advisorGroup ? {
          fullname_th: advisorGroup.lecturer?.fullname_th || "ไม่ทราบชื่อ",
          lecturer_code: advisorGroup.lecturer?.lecturer_code || "",
          email: advisorGroup.lecturer?.email || "-"
        } : null
      };
    });

    res.json({
      results: formatted,
      matched_advisor: matchedAdvisor,
      total: formatted.length
    });
  } catch (error) {
    console.error("Search API Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
};

/* ---------------- student detail ---------------- */
export const getStudent = async (req, res) => {
  const { student_id } = req.params;

  try {
    const student = await prisma.students.findUnique({
      where: { student_id },
      include: {
        advisor_students: {
          include: {
            advisor: {
              include: {
                lecturer: true
              }
            }
          }
        }
      }
    });

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "get student failed" });
  }
};

/* ---------------- consult by year ---------------- */
export const getConsultByYear = async (req, res) => {
  const { level, year } = req.params;

  try {
    const advisors = await prisma.advisors.findMany({
      where: {
        year: Number(year),
        level: level
      },
      include: {
        lecturer: true,
        advisor_students: {
          include: {
            student: true
          }
        }
      }
    });

    const sortedAdvisors = advisors.map((advisor) => ({
      ...advisor,
      advisor_students: advisor.advisor_students.sort((a, b) =>
        a.student.student_id.localeCompare(b.student.student_id)
      )
    }));

    res.json(sortedAdvisors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "get consult by year failed" });
  }
};

/* ---------------- get all advisors summary for directory ---------------- */
export const getAdvisorsSummary = async (req, res) => {
  try {
    const lecturers = await prisma.lecturers.findMany({
      orderBy: { fullname_th: "asc" },
      select: {
        id: true,
        lecturer_code: true,
        fullname_th: true,
        fullname_en: true,
        position_th: true,
        email: true,
        tel: true,
        image_path: true,
        advisors: {
          include: {
            _count: {
              select: { advisor_students: true }
            }
          }
        }
      }
    });

    const result = lecturers.map(lec => {
      const studentCount = (lec.advisors || []).reduce((sum, a) => sum + (a._count?.advisor_students || 0), 0);
      return {
        id: lec.id,
        lecturer_code: lec.lecturer_code || String(lec.id),
        fullname_th: lec.fullname_th,
        fullname_en: lec.fullname_en,
        position_th: lec.position_th,
        email: lec.email,
        tel: lec.tel,
        image_path: lec.image_path,
        advised_student_count: studentCount
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching advisors summary:", error);
    res.status(500).json({ error: "Failed to fetch advisors" });
  }
};

/* ---------------- get advised students by advisor code ---------------- */
export const getStudentsByAdvisorCode = async (req, res) => {
  const { code } = req.params;
  const q = req.query.q?.trim() || "";

  if (!code || code === ":code" || code === "all") {
    return res.status(400).json({ error: "รหัสอาจารย์ไม่ถูกต้อง" });
  }

  try {
    // 1. ค้นหาอาจารย์จาก lecturer_code, id, หรือชื่อ
    const lecturer = await prisma.lecturers.findFirst({
      where: {
        OR: [
          { lecturer_code: { equals: code, mode: "insensitive" } },
          ...(!isNaN(parseInt(code)) ? [{ id: parseInt(code) }] : []),
          { fullname_th: { contains: code, mode: "insensitive" } },
          { fullname_en: { contains: code, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        lecturer_code: true,
        fullname_th: true,
        fullname_en: true,
        position_th: true,
        email: true,
        tel: true,
        image_path: true
      }
    });

    if (!lecturer) {
      return res.status(404).json({ error: "ไม่พบข้อมูลอาจารย์ที่ปรึกษา" });
    }

    // 2. ดึงกลุ่ม advisors ของอาจารย์ท่านนี้
    const advisorGroups = await prisma.advisors.findMany({
      where: { lecturerId: lecturer.id },
      include: {
        advisor_students: {
          include: {
            student: true
          }
        }
      }
    });

    // 3. รวบรวมนักศึกษาทั้งหมดในความดูแล
    let allAdvisedStudents = [];
    const seenStudentIds = new Set();

    for (const group of advisorGroups) {
      for (const item of group.advisor_students) {
        if (!item.student || seenStudentIds.has(item.student.id)) continue;
        seenStudentIds.add(item.student.id);

        allAdvisedStudents.push({
          id: item.student.id,
          student_id: item.student.student_id,
          title: item.student.title || "",
          firstname: item.student.firstname,
          lastname: item.student.lastname,
          name: `${item.student.title || ''}${item.student.firstname} ${item.student.lastname}`.trim(),
          room: item.student.room || "-",
          year: item.student.year || group.year,
          level: group.level || "bachelor",
          advisor_level: group.level,
          advisor_year: group.year
        });
      }
    }

    // 4. ถ้ามี keyword ค้นหา ให้กรองเฉพาะนักศึกษาในความดูแลของท่านนี้
    if (q) {
      const keyword = q.toLowerCase();
      allAdvisedStudents = allAdvisedStudents.filter(s =>
        s.student_id.toLowerCase().includes(keyword) ||
        s.firstname.toLowerCase().includes(keyword) ||
        s.lastname.toLowerCase().includes(keyword) ||
        s.name.toLowerCase().includes(keyword) ||
        (s.room && s.room.toLowerCase().includes(keyword))
      );
    }

    // จัดเรียงตาม student_id
    allAdvisedStudents.sort((a, b) => a.student_id.localeCompare(b.student_id));

    res.json({
      advisor: lecturer,
      total_students: seenStudentIds.size,
      students: allAdvisedStudents
    });
  } catch (error) {
    console.error("Error fetching advisor students:", error);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลนักศึกษาในความดูแลได้" });
  }
};

/* ---------------- 📥 Import Students & Consultants from Excel ---------------- */
export const importConsultantsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์ Excel (.xlsx หรือ .xls)" });
    }

    let defaultYear = req.body.default_year ? parseInt(req.body.default_year) : null;
    if (defaultYear && defaultYear > 0 && defaultYear < 100) {
      defaultYear += 2500;
    }
    const defaultLevel = req.body.default_level || "bachelor";

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ error: "ไม่พบ Sheet ในไฟล์ Excel" });
    }

    // 1. Map อาจารย์ทั้งหมด
    const lecturers = await prisma.lecturers.findMany({
      select: { id: true, lecturer_code: true, fullname_th: true, fullname_en: true }
    });

    const lecturerCodeMap = new Map();
    const lecturerNameMap = new Map();

    lecturers.forEach((lec) => {
      if (lec.lecturer_code) {
        lecturerCodeMap.set(lec.lecturer_code.trim().toUpperCase(), lec.id);
      }
      if (lec.fullname_th) {
        lecturerNameMap.set(lec.fullname_th.trim(), lec.id);
      }
    });

    const findLecturerId = (text) => {
      if (!text) return null;
      const clean = String(text).trim();
      const upper = clean.toUpperCase();

      if (lecturerCodeMap.has(upper)) return lecturerCodeMap.get(upper);

      for (const [name, id] of lecturerNameMap.entries()) {
        if (clean.includes(name) || name.includes(clean)) return id;
      }

      const cleanName = clean.replace(/^(นาย|นาง|นางสาว|อาจารย์|ดร\.|ผศ\.|รศ\.|ศ\.|ผู้ช่วยศาสตราจารย์|รองศาสตราจารย์|ศาสตราจารย์|\s)+/g, "").trim();
      if (cleanName) {
        for (const [name, id] of lecturerNameMap.entries()) {
          if (name.includes(cleanName)) return id;
        }
      }
      return null;
    };

    let totalProcessed = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const errors = [];
    const parsedStudents = [];

    // วนลูปทุก Sheet ใน Workbook
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet || !sheet['!ref']) continue;

      let sheetYear = null;
      const matchYear = sheetName.match(/25\d{2}/);
      if (matchYear) {
        sheetYear = parseInt(matchYear[0]);
      } else {
        const matchShortYear = sheetName.match(/\b\d{2}\b/);
        if (matchShortYear) {
          sheetYear = parseInt(matchShortYear[0]) + 2500;
        }
      }

      const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (rawRows.length < 2) continue;

      let headerRowIdx = -1;
      let colIdxMap = {
        student_id: -1,
        title: -1,
        firstname: -1,
        lastname: -1,
        fullname: -1,
        room: -1,
        year: -1,
        level: -1,
        advisor: -1
      };

      let bestScore = 0;
      let bestRowIdx = -1;
      let bestColMap = null;

      // ค้นหาแถวที่เป็น Header จริง โดยให้คะแนนตามคอลัมน์ที่ตรงกับรูปแบบ
      for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
        const row = rawRows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        const currentMap = {
          student_id: -1,
          title: -1,
          firstname: -1,
          lastname: -1,
          fullname: -1,
          room: -1,
          year: -1,
          level: -1,
          advisor: -1
        };

        let score = 0;

        row.forEach((cell, idx) => {
          const col = String(cell || "").trim();
          const lower = col.toLowerCase();
          if (!col) return;

          // ตรวจสอบคอลัมน์รหัสนักศึกษา (ต้องไม่ใช่คำอธิบายทั่วไปหรือรหัสอาจารย์)
          if (
            lower.includes("รหัสนักศึกษา") || 
            lower.includes("รหัสประจำตัว") || 
            lower.includes("student id") || 
            lower.includes("studentid") ||
            (lower.includes("รหัส") && !lower.includes("อาจารย์") && !lower.includes("ที่ปรึกษา") && col.length <= 15)
          ) {
            currentMap.student_id = idx;
            score += 5;
          } else if (lower === "คำนำหน้า" || lower === "คำนำหน้านาม" || lower === "title") {
            currentMap.title = idx;
            score += 2;
          } else if (lower === "ชื่อ" || lower === "firstname" || lower === "first name" || lower === "ชื่อจริง") {
            currentMap.firstname = idx;
            score += 3;
          } else if (lower === "นามสกุล" || lower === "lastname" || lower === "last name") {
            currentMap.lastname = idx;
            score += 3;
          } else if (lower.includes("ชื่อ-นามสกุล") || lower.includes("ชื่อ - นามสกุล") || lower.includes("ชื่อ นามสกุล") || lower.includes("fullname")) {
            currentMap.fullname = idx;
            score += 4;
          } else if (lower.includes("ห้อง") || lower.includes("ตอนเรียน") || lower.includes("room") || lower.includes("sec") || lower.includes("กลุ่ม")) {
            currentMap.room = idx;
            score += 2;
          } else if (lower.includes("ปีการศึกษา") || lower.includes("รุ่น") || lower.includes("academic year") || lower === "ปี") {
            currentMap.year = idx;
            score += 2;
          } else if (lower.includes("ระดับ") || lower.includes("level") || lower.includes("degree")) {
            currentMap.level = idx;
            score += 2;
          } else if (lower.includes("อาจารย์") || lower.includes("ที่ปรึกษา") || lower.includes("advisor")) {
            currentMap.advisor = idx;
            score += 3;
          }
        });

        // แถวที่นับเป็น Header ต้องมีคอลัมน์ student_id และได้คะแนนรวม >= 5
        if (currentMap.student_id !== -1 && score > bestScore) {
          bestScore = score;
          bestRowIdx = r;
          bestColMap = currentMap;
        }
      }

      if (bestRowIdx !== -1 && bestColMap) {
        headerRowIdx = bestRowIdx;
        colIdxMap = bestColMap;
      } else {
        // Fallback กรณีไม่มีหัวตารางชัดเจน แต่แถวแรกเป็นรหัสนักศึกษาเลย
        const firstRow = rawRows[0] || [];
        const possibleId = String(firstRow[0] || "").trim().replace(/[^0-9]/g, "");
        if (possibleId.length >= 9) {
          headerRowIdx = -1;
          colIdxMap.student_id = 0;
          colIdxMap.title = 1;
          colIdxMap.firstname = 2;
          colIdxMap.lastname = 3;
          colIdxMap.room = 4;
          colIdxMap.year = 5;
          colIdxMap.level = 6;
          colIdxMap.advisor = 7;
        }
      }

      if (colIdxMap.student_id === -1) {
        console.warn(`[importConsultantsExcel] Sheet "${sheetName}" has no identifiable student_id column. Skipping.`);
        continue;
      }

      for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
        const row = rawRows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        const rawId = String(row[colIdxMap.student_id] || "").trim().replace(/[^0-9]/g, "");
        if (!rawId || rawId.length < 9) continue;

        let title = colIdxMap.title !== -1 ? String(row[colIdxMap.title] || "").trim() : "";
        let firstname = colIdxMap.firstname !== -1 ? String(row[colIdxMap.firstname] || "").trim() : "";
        let lastname = colIdxMap.lastname !== -1 ? String(row[colIdxMap.lastname] || "").trim() : "";

        if (colIdxMap.fullname !== -1 && (!firstname || !lastname)) {
          let full = String(row[colIdxMap.fullname] || "").trim();
          if (full.startsWith("นาย ")) {
            title = "นาย";
            full = full.slice(4).trim();
          } else if (full.startsWith("นาย")) {
            title = "นาย";
            full = full.slice(3).trim();
          } else if (full.startsWith("นางสาว ")) {
            title = "นางสาว";
            full = full.slice(7).trim();
          } else if (full.startsWith("นางสาว")) {
            title = "นางสาว";
            full = full.slice(6).trim();
          } else if (full.startsWith("น.ส. ")) {
            title = "นางสาว";
            full = full.slice(5).trim();
          } else if (full.startsWith("น.ส.")) {
            title = "นางสาว";
            full = full.slice(4).trim();
          }

          const parts = full.split(/\s+/);
          firstname = parts[0] || "";
          lastname = parts.slice(1).join(" ") || "";
        }

        if (!title) {
          if (firstname.startsWith("นาย")) {
            title = "นาย";
            firstname = firstname.slice(3).trim();
          } else if (firstname.startsWith("นางสาว")) {
            title = "นางสาว";
            firstname = firstname.slice(6).trim();
          } else {
            title = "นาย/นางสาว";
          }
        }

        const room = colIdxMap.room !== -1 ? String(row[colIdxMap.room] || "").trim() : "-";
        
        let academicYear = null;
        if (colIdxMap.year !== -1 && row[colIdxMap.year]) {
          const yNum = parseInt(String(row[colIdxMap.year]).replace(/[^0-9]/g, ""));
          if (yNum > 2500) academicYear = yNum;
          else if (yNum > 50 && yNum < 100) academicYear = yNum + 2500;
        }

        // ค้นหาปีการศึกษาในช่องอื่นๆ ในแถวหากยังไม่ได้ปี
        if (!academicYear) {
          for (let c = 0; c < row.length; c++) {
            const cellVal = String(row[c] || "").trim();
            if (/^25\d{2}$/.test(cellVal)) {
              academicYear = parseInt(cellVal);
              break;
            }
          }
        }

        // Fallback จาก sheetYear, defaultYear, หรือ 2 หลักแรกของรหัสนักศึกษา (เช่น 69 -> 2569)
        if (!academicYear) {
          academicYear = sheetYear || defaultYear || (parseInt(rawId.slice(0, 2)) + 2500);
        }

        let level = colIdxMap.level !== -1 ? String(row[colIdxMap.level] || "").trim().toLowerCase() : "";
        if (level.includes("ตรี") || level.includes("bachelor")) level = "bachelor";
        else if (level.includes("โท") || level.includes("master")) level = "master";
        else if (level.includes("เอก") || level.includes("doctor")) level = "doctor";
        else {
          for (let c = 0; c < row.length; c++) {
            const cellVal = String(row[c] || "").trim().toLowerCase();
            if (cellVal.includes("ตรี") || cellVal.includes("bachelor")) { level = "bachelor"; break; }
            if (cellVal.includes("โท") || cellVal.includes("master")) { level = "master"; break; }
            if (cellVal.includes("เอก") || cellVal.includes("doctor")) { level = "doctor"; break; }
          }
          if (!level) level = defaultLevel || "bachelor";
        }

        let advisorText = colIdxMap.advisor !== -1 ? String(row[colIdxMap.advisor] || "").trim() : "";
        let lecturerId = advisorText ? findLecturerId(advisorText) : null;
        if (!lecturerId) {
          for (let c = 0; c < row.length; c++) {
            if (c === colIdxMap.student_id || c === colIdxMap.firstname || c === colIdxMap.lastname) continue;
            const cellText = String(row[c] || "").trim();
            if (cellText) {
              const matched = findLecturerId(cellText);
              if (matched) {
                lecturerId = matched;
                break;
              }
            }
          }
        }

        parsedStudents.push({
          rawId,
          title,
          firstname,
          lastname,
          room,
          academicYear,
          level,
          lecturerId,
          rowIndex: r + 1
        });
      }
    }

    if (parsedStudents.length === 0) {
      return res.json({
        success: true,
        message: "ไม่พบข้อมูลนักศึกษาในไฟล์ Excel",
        total: 0,
        created: 0,
        updated: 0,
        errors: []
      });
    }

    // 2. ดึงข้อมูลนักศึกษาที่มีอยู่แล้วทั้งหมดในไฟล์นี้ด้วย Query เดียว (ลด Network Roundtrips)
    const allIds = parsedStudents.map(s => s.rawId);
    const existingList = await prisma.students.findMany({
      where: { student_id: { in: allIds } }
    });
    const existingMap = new Map(existingList.map(s => [s.student_id, s]));

    // 3. ดึงและแคชอาจารย์ที่ปรึกษาตามปีการศึกษาและระดับที่เกี่ยวข้อง
    const yearsSet = new Set(parsedStudents.map(s => s.academicYear).filter(Boolean));
    const existingAdvisors = await prisma.advisors.findMany({
      where: { year: { in: Array.from(yearsSet) } }
    });
    const advisorMap = new Map();
    existingAdvisors.forEach(a => {
      advisorMap.set(`${a.lecturerId}_${a.year}_${a.level}`, a);
    });

    // 4. สร้างกลุ่ม Advisor ที่ยังไม่มีในระบบล่วงหน้า (ทำครั้งเดียวต่อกลุ่ม)
    for (const item of parsedStudents) {
      if (item.lecturerId && item.academicYear) {
        const key = `${item.lecturerId}_${item.academicYear}_${item.level}`;
        if (!advisorMap.has(key)) {
          try {
            const adv = await prisma.advisors.create({
              data: {
                lecturerId: item.lecturerId,
                year: item.academicYear,
                level: item.level
              }
            });
            advisorMap.set(key, adv);
          } catch (e) {
            // ถ้าสร้างชนกันในเวลาเดียวกัน ให้ลองดึงซ้ำ
            const adv = await prisma.advisors.findFirst({
              where: {
                lecturerId: item.lecturerId,
                year: item.academicYear,
                level: item.level
              }
            });
            if (adv) advisorMap.set(key, adv);
          }
        }
      }
    }

    // 5. บันทึกและอัปเดตข้อมูลนักศึกษาเป็นชุด (Concurrent Chunks ละ 20 รายการ)
    const CHUNK_SIZE = 20;
    for (let i = 0; i < parsedStudents.length; i += CHUNK_SIZE) {
      const chunk = parsedStudents.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (item) => {
          totalProcessed++;
          try {
            const existing = existingMap.get(item.rawId);
            let student;
            if (existing) {
              student = await prisma.students.update({
                where: { student_id: item.rawId },
                data: {
                  title: item.title || existing.title,
                  firstname: item.firstname || existing.firstname,
                  lastname: item.lastname || existing.lastname,
                  room: item.room !== "-" ? item.room : existing.room,
                  year: item.academicYear || existing.year
                }
              });
              updatedCount++;
            } else {
              student = await prisma.students.create({
                data: {
                  student_id: item.rawId,
                  title: item.title || "นาย/นางสาว",
                  firstname: item.firstname,
                  lastname: item.lastname || "",
                  room: item.room || "-",
                  year: item.academicYear
                }
              });
              createdCount++;
            }

            if (item.lecturerId && item.academicYear) {
              const key = `${item.lecturerId}_${item.academicYear}_${item.level}`;
              const adv = advisorMap.get(key);
              if (adv) {
                await prisma.advisor_students.upsert({
                  where: {
                    studentId_advisorId: {
                      studentId: student.id,
                      advisorId: adv.id
                    }
                  },
                  create: {
                    studentId: student.id,
                    advisorId: adv.id
                  },
                  update: {}
                });
              }
            }
          } catch (err) {
            console.error(`Error importing row ${item.rowIndex} (${item.rawId}):`, err.message);
            errors.push(`แถวที่ ${item.rowIndex} (${item.rawId}): ${err.message}`);
          }
        })
      );
    }

    res.json({
      success: true,
      message: `นำเข้าข้อมูลเสร็จสิ้น: ทั้งหมด ${totalProcessed} คน (เพิ่มใหม่ ${createdCount} คน, อัปเดต ${updatedCount} คน)`,
      total: totalProcessed,
      created: createdCount,
      updated: updatedCount,
      errors: errors.slice(0, 10)
    });
  } catch (error) {
    console.error("Import consultants error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการนำเข้าไฟล์ Excel: " + error.message });
  }
};

/* ---------------- 📤 Download Consultants Template ---------------- */
export const downloadConsultantsTemplate = async (req, res) => {
  try {
    const wb = XLSX.utils.book_new();

    const sampleData = [
      ["รายชื่อนักศึกษาและอาจารย์ที่ปรึกษา (สามารถระบุชื่ออาจารย์ หรือ รหัสย่ออาจารย์ได้)"],
      ["รหัสนักศึกษา", "คำนำหน้า", "ชื่อ", "นามสกุล", "ห้อง", "ปีการศึกษา", "ระดับการศึกษา", "อาจารย์ที่ปรึกษา (ชื่อ หรือ รหัสย่อ)"],
      ["6804062610011", "นาย", "สมชาย", "ใจดี", "RA", 2568, "ปริญญาตรี", "รศ.ดร.กฤดาภัทร สีหารี (GDP)"],
      ["6804062610029", "นางสาว", "สมหญิง", "รักเรียน", "RA", 2568, "ปริญญาตรี", "TNA"],
      ["6804062610037", "นาย", "กิตติศักดิ์", "มั่นคง", "RB", 2568, "ปริญญาตรี", "NKS"],
      ["6704062620015", "นางสาว", "ชนกานต์", "ปรีชา", "CSB", 2567, "ปริญญาตรี", "SWK"],
      ["6604062630042", "นาย", "ธนพล", "พงษ์สุวรรณ", "RA", 2566, "ปริญญาตรี", "LPP"]
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(sampleData);
    ws1["!cols"] = [
      { wch: 18 }, // รหัสนักศึกษา
      { wch: 12 }, // คำนำหน้า
      { wch: 20 }, // ชื่อ
      { wch: 22 }, // นามสกุล
      { wch: 10 }, // ห้อง
      { wch: 14 }, // ปีการศึกษา
      { wch: 16 }, // ระดับการศึกษา
      { wch: 35 }  // อาจารย์ที่ปรึกษา
    ];

    const lecturers = await prisma.lecturers.findMany({
      orderBy: { lecturer_code: "asc" },
      select: { lecturer_code: true, fullname_th: true, email: true }
    });

    const lecturerRows = [
      ["รหัสอาจารย์ (Code)", "ชื่อ-นามสกุลอาจารย์", "อีเมล"],
      ...lecturers.map(l => [l.lecturer_code || "-", l.fullname_th, l.email || "-"])
    ];

    const ws2 = XLSX.utils.aoa_to_sheet(lecturerRows);
    ws2["!cols"] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 35 }
    ];

    XLSX.utils.book_append_sheet(wb, ws1, "รายชื่อนักศึกษา");
    XLSX.utils.book_append_sheet(wb, ws2, "รายชื่อและรหัสอาจารย์");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", 'attachment; filename="student_consultants_template.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    console.error("Download template error:", error);
    res.status(500).json({ error: "Failed to generate Excel template" });
  }
};