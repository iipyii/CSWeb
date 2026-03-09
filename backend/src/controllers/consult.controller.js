import { prisma } from "../lib/prisma.js";

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
              { student_id: { contains: q } } // ตรวจสอบว่าใน DB เป็น String
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
      // ดึงข้อมูลกลุ่มที่ปรึกษาอันแรกที่พบ
      const advisorGroup = student.advisor_students?.[0]?.advisor;

      return {
        id: student.id,
        student_id: student.student_id,
        title: student.title || "",
        firstname: student.firstname,
        lastname: student.lastname,
        room: student.room || "-",
        level: student.level,
        // ปรับให้ชื่อฟิลด์ตรงกับที่ Frontend เรียกใช้
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

// ฟังก์ชัน getConsultByYear และอื่นๆ คงเดิมแต่ตรวจสอบชื่อฟิลด์ level/year

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