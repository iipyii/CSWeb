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
        advisor: {
          orderBy: { academic_year: "desc" },
          take: 1,
          include: {
            lecturer: true
          }
        }
      },
      orderBy: {
        firstname: "asc"
      }
    });

    const formatted = students.map((student) => {
      // ดึงข้อมูลอาจารย์ที่ปรึกษาล่าสุด (เรียงตามปีการศึกษามาแล้ว)
      const advisorRow = student.advisor?.[0];

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
        advisor: advisorRow ? {
          fullname_th: advisorRow.lecturer?.fullname_th || "ไม่ทราบชื่อ",
          lecturer_code: advisorRow.lecturer?.lecturer_code || "",
          email: advisorRow.lecturer?.email || "-"
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
        advisor: {
          orderBy: { academic_year: "desc" },
          include: {
            lecturer: true
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
    const advisorRows = await prisma.advisor.findMany({
      where: {
        academic_year: Number(year),
        level: level
      },
      include: {
        lecturer: true,
        student: true
      }
    });

    // จัดกลุ่ม assignment แถวเดี่ยวๆ กลับเป็นทรงเดิม: { lecturer, level, year, advisor_students: [{ student }] }
    const grouped = new Map();

    for (const row of advisorRows) {
      if (!grouped.has(row.lecturer_id)) {
        grouped.set(row.lecturer_id, {
          lecturer: row.lecturer,
          level: row.level,
          year: row.academic_year,
          advisor_students: []
        });
      }
      grouped.get(row.lecturer_id).advisor_students.push({ student: row.student });
    }

    const sortedAdvisors = Array.from(grouped.values()).map((advisor) => ({
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
