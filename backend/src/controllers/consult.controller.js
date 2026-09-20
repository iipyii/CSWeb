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

  if (!q) return res.json([]);

  try {
    const students = await prisma.students.findMany({
      where: {
        AND: [
          {
            OR: [
              { firstname: { contains: q, mode: "insensitive" } },
              { lastname: { contains: q, mode: "insensitive" } },
              { student_id: { contains: q } }
            ]
          },
          level !== "all" ? { level: level } : {}
        ]
      },
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
      orderBy: {
        firstname: "asc"
      }
    });

    const formatted = students.map((student) => {
      const advisorGroup = student.advisor_students?.[0]?.advisor;

      return {
        id: student.id,
        student_id: student.student_id,
        title: student.title || "",
        firstname: student.firstname,
        lastname: student.lastname,
        room: student.room || "-",
        level: student.level,
        admission_year: student.year, 
        advisor: advisorGroup ? {
          fullname_th: advisorGroup.lecturer?.fullname_th || "ไม่ทราบชื่อ",
          lecturer_code: advisorGroup.lecturer?.lecturer_code || "",
          email: advisorGroup.lecturer?.email || "-"
        } : null
      };
    });

    res.json(formatted);
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