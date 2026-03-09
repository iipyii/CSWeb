import { prisma } from "../lib/prisma.js";

export const getSectionById = async (req, res) => {

  try {

    const id = parseInt(req.params.id)

    const section = await prisma.program_sections.findUnique({
      where: { id }
    })

    if (!section) {
      return res.status(404).json({ message: "section not found" })
    }

    res.json(section)

  } catch (err) {
    res.status(500).json(err)
  }

}

export const searchCourses = async (req, res) => {
    try {
        // รับค่า year มาด้วย (ถ้ามี)
        const { keyword, year } = req.query;

        if (!keyword) {
            return res.json([]);
        }

        // 💡 สร้างเงื่อนไขการค้นหา
        let whereCondition = {
            content: {
                contains: String(keyword)
            }
        };

        // ถ้ามีการเลือกปีจากหน้าเว็บ ให้เจาะจงค้นหาเฉพาะปีนั้น
        if (year) {
            whereCondition.version = {
                year: parseInt(year)
            };
        }

        const results = await prisma.program_sections.findMany({
            where: whereCondition, // ใช้เงื่อนไขที่สร้างไว้
            select: {
                id: true,
                title: true,
                content: true,
                pdf_path: true,
                version: { 
                    select: { year: true }
                }
            },
            orderBy: {
                 version: { year: 'desc' }
            }
        });

        res.json(results);
        
    } catch (error) {
        console.error("💥 Prisma Error Details:\n", error.message);
        res.status(500).json({ error: "Prisma Validation Failed", details: error.message });
    }
};