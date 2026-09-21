import * as XLSX from "xlsx";
import { prisma } from "../lib/prisma.js";

export const getAllConsultants = async (req, res) => {
  try {
    const { year, search } = req.query;

    const where = {};

    if (year && year !== "all" && !isNaN(parseInt(year))) {
      const parsedYear = parseInt(year);
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
            startsWith: String(parsedYear).slice(-2)
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
      orderBy: { student_id: "asc" },
      take: 1000
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
        name: `${s.title || ''}${s.firstname} ${s.lastname}`.trim(),
        room: s.room || "-",
        academic_year: academicYear,
        year: academicYear,
        level: degreeLevel,
        advisor: advLecturer?.fullname_th || "ยังไม่ได้ระบุ",
        advisor_code: advLecturer?.lecturer_code || ""
      };
    });

    // ดึงรายการปีการศึกษาทั้งหมดที่มีในระบบ
    const distinctYears = await prisma.advisors.findMany({
      distinct: ["year"],
      select: { year: true },
      orderBy: { year: "desc" }
    });

    res.json({
      data: formatted,
      years: distinctYears.map(y => y.year).filter(Boolean)
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

    const defaultYear = req.body.default_year ? parseInt(req.body.default_year) : null;
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

      for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
        const row = rawRows[r].map(cell => String(cell).trim().toLowerCase());
        const idIdx = row.findIndex(c => c.includes("รหัส") || c.includes("student id") || c.includes("studentid"));
        const nameIdx = row.findIndex(c => c.includes("ชื่อ") || c.includes("name"));
        if (idIdx !== -1 && nameIdx !== -1) {
          headerRowIdx = r;
          break;
        }
      }

      if (headerRowIdx === -1) {
        headerRowIdx = 0;
      }

      const headerRow = rawRows[headerRowIdx].map(c => String(c).trim());

      headerRow.forEach((col, idx) => {
        const lower = col.toLowerCase();
        if (lower.includes("รหัสประจำตัว") || lower.includes("รหัสนักศึกษา") || lower.includes("student id") || lower.includes("studentid")) {
          colIdxMap.student_id = idx;
        } else if (lower === "คำนำหน้า" || lower === "คำนำหน้านาม" || lower === "title") {
          colIdxMap.title = idx;
        } else if (lower === "ชื่อ" || lower === "firstname" || lower === "first name") {
          colIdxMap.firstname = idx;
        } else if (lower === "นามสกุล" || lower === "lastname" || lower === "last name") {
          colIdxMap.lastname = idx;
        } else if (lower.includes("ชื่อ-นามสกุล") || lower.includes("ชื่อ - นามสกุล") || lower.includes("ชื่อ นามสกุล") || lower.includes("fullname")) {
          colIdxMap.fullname = idx;
        } else if (lower.includes("ห้อง") || lower.includes("ตอนเรียน") || lower.includes("room") || lower.includes("sec") || lower.includes("กลุ่ม")) {
          colIdxMap.room = idx;
        } else if (lower.includes("ปีการศึกษา") || lower.includes("รุ่น") || lower.includes("academic year") || lower === "ปี") {
          colIdxMap.year = idx;
        } else if (lower.includes("ระดับ") || lower.includes("level") || lower.includes("degree")) {
          colIdxMap.level = idx;
        } else if (lower.includes("อาจารย์") || lower.includes("ที่ปรึกษา") || lower.includes("advisor")) {
          colIdxMap.advisor = idx;
        }
      });

      if (colIdxMap.student_id === -1) continue;

      for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
        const row = rawRows[r];
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

        if (!academicYear) academicYear = sheetYear || defaultYear || (parseInt(rawId.slice(0, 2)) + 2500);

        let level = colIdxMap.level !== -1 ? String(row[colIdxMap.level] || "").trim().toLowerCase() : defaultLevel;
        if (level.includes("ตรี") || level.includes("bachelor")) level = "bachelor";
        else if (level.includes("โท") || level.includes("master")) level = "master";
        else if (level.includes("เอก") || level.includes("doctor")) level = "doctor";
        else level = "bachelor";

        const advisorText = colIdxMap.advisor !== -1 ? String(row[colIdxMap.advisor] || "").trim() : "";
        const lecturerId = advisorText ? findLecturerId(advisorText) : null;

        totalProcessed++;

        try {
          const existing = await prisma.students.findUnique({
            where: { student_id: rawId }
          });

          let student;
          if (existing) {
            student = await prisma.students.update({
              where: { student_id: rawId },
              data: {
                title: title || existing.title,
                firstname: firstname || existing.firstname,
                lastname: lastname || existing.lastname,
                room: room !== "-" ? room : existing.room,
                year: academicYear || existing.year
              }
            });
            updatedCount++;
          } else {
            student = await prisma.students.create({
              data: {
                student_id: rawId,
                title: title || "นาย/นางสาว",
                firstname: firstname,
                lastname: lastname || "",
                room: room || "-",
                year: academicYear
              }
            });
            createdCount++;
          }

          if (lecturerId && academicYear) {
            let advisor = await prisma.advisors.findFirst({
              where: {
                lecturerId: lecturerId,
                year: academicYear,
                level: level
              }
            });

            if (!advisor) {
              advisor = await prisma.advisors.create({
                data: {
                  lecturerId: lecturerId,
                  year: academicYear,
                  level: level
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
        } catch (err) {
          console.error(`Error importing row ${r} (${rawId}):`, err.message);
          errors.push(`แถวที่ ${r + 1} (${rawId}): ${err.message}`);
        }
      }
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