import { prisma } from "../lib/prisma.js";

export const getAllConsultants = async (req, res) => {
  try {
    const students = await prisma.students.findMany({
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
      take: 150
    });

    const formatted = students.map((s) => {
      const adv = s.advisor_students?.[0]?.advisor?.lecturer;
      return {
        id: s.id,
        student_id: s.student_id,
        name: `${s.title || ''}${s.firstname} ${s.lastname}`.trim(),
        level: s.year ? `ปี ${s.year}` : (s.room || "ปี 3"),
        advisor: adv?.fullname_th || "ยังไม่ได้ระบุ",
        advisor_code: adv?.lecturer_code || ""
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Fetch all consultants error:", error);
    res.status(500).json({ error: "Failed to fetch consultants" });
  }
};

export const addStudentConsultant = async (req, res) => {
  try {
    const { student_id, name, level, advisor_id } = req.body;
    if (!student_id || !name) {
      return res.status(400).json({ error: "Student ID and name are required" });
    }

    const parts = name.trim().split(/\s+/);
    const firstname = parts[0];
    const lastname = parts.slice(1).join(" ") || "";

    const student = await prisma.students.upsert({
      where: { student_id: String(student_id) },
      update: {
        firstname,
        lastname,
        room: level || undefined
      },
      create: {
        student_id: String(student_id),
        title: "นาย/นางสาว",
        firstname,
        lastname,
        room: level || "ปี 3"
      }
    });

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