import { prisma } from "../lib/prisma.js";
import { XMLParser } from "fast-xml-parser";

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
        const { keyword, year } = req.query;
        if (!keyword) return res.json([]);

        let whereCondition = { xml_data: { not: null } }; // ดึงเฉพาะอันที่มี XML
        if (year) {
            whereCondition.version = { year: parseInt(year) };
        }

        const dbResults = await prisma.program_sections.findMany({
            where: whereCondition,
            select: {
                id: true,
                title: true,
                pdf_path: true,
                xml_data: true, // ดึง XML ก้อนนี้มา
                version: { select: { year: true } }
            }
        });

        const parser = new XMLParser();
        let finalResults = [];

        dbResults.forEach((section) => {
            // 💡 1. แปลง XML กลับมาเป็น Object ที่ใช้งานง่าย
            const jsonObj = parser.parse(section.xml_data);
            
            // เข้าถึงรายวิชา (เช็กกรณีที่มีวิชาเดียว หรือหลายวิชา)
            let courses = jsonObj.curriculum?.course;
            if (!courses) return;
            if (!Array.isArray(courses)) courses = [courses];

            // 💡 2. กรองหาคำที่ต้องการอย่างแม่นยำ!
            courses.forEach(course => {
                const searchKeyword = keyword.toLowerCase();
                
                // ค้นหาเฉพาะใน ชื่อวิชา, รหัสวิชา หรือ คำอธิบาย เท่านั้น (ไม่มั่วไปเจอสารบัญ)
                const isMatch = 
                    String(course.course_code).includes(searchKeyword) ||
                    String(course.title_th).toLowerCase().includes(searchKeyword) ||
                    String(course.description).toLowerCase().includes(searchKeyword);

                if (isMatch) {
                    finalResults.push({
                        id: section.id,
                        code: String(course.course_code),
                        year: section.version?.year || "ไม่ระบุปี",
                        titleTH: String(course.title_th),
                        titleEN: course.title_en ? String(course.title_en) : "",
                        credit: String(course.credit),
                        prerequisite: String(course.prerequisite),
                        descriptionTH: String(course.description),
                        pdf_path: section.pdf_path,
                    });
                }
            });
        });

        res.json(finalResults);
        
    } catch (error) {
        console.error("XML Search Error:", error);
        res.status(500).json({ error: "Search Failed", details: error.message });
    }
};