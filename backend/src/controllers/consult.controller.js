import { prisma } from "../lib/prisma.js";


/* ---------------- search student ---------------- */

export const searchStudent = async (req, res) => {

    const q = req.query.q;

    if (!q) {
        return res.json([]);
    }

    try {

        const students = await prisma.students.findMany({
            where: {
                OR: [
                    { firstname: { contains: q } },
                    { lastname: { contains: q } },
                    { student_id: { contains: q } }
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
            }
        });

        res.json(students);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "search failed" });

    }

};

/* ---------------- student detail ---------------- */

export const getStudent = async (req, res) => {

    const { student_id } = req.params;

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

};

/* ---------------- consult by year ---------------- */

export const getConsultByYear = async (req, res) => {

    const { level, year } = req.params;

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
        },
        // orderBy: {
        //     student_id: "asc"
        // }
    });

    res.json(advisors);

};