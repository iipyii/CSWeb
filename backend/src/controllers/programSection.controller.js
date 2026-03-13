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

        
        let whereCondition = { xml_data: { not: null } };
        if (year) {
            whereCondition.version = { year: parseInt(year) };
        }

        const dbResults = await prisma.program_sections.findMany({
            where: whereCondition,
            select: {
                id: true,
                title: true,
                pdf_path: true,
                xml_data: true,
                version: { select: { year: true } }
            }
        });

        const parser = new XMLParser();
        let finalResults = [];

        dbResults.forEach((section) => {
            if (!section.xml_data) return;
            
            
            const jsonObj = parser.parse(section.xml_data);
            let courses = jsonObj.curriculum?.course;
            
            if (!courses) return;
            if (!Array.isArray(courses)) courses = [courses]; 

            
            let degree = "bachelor-normal";
            const lowerTitle = (section.title || "").toLowerCase();
            if (lowerTitle.includes("csb") || lowerTitle.includes("english")) degree = "bachelor-inter";
            else if (lowerTitle.includes("master") && lowerTitle.includes("se")) degree = "master-se";
            else if (lowerTitle.includes("master")) degree = "master-cs";
            else if (lowerTitle.includes("doctor")) degree = "doctor-cs";

            
            courses.forEach(course => {
                const searchKeyword = keyword.toLowerCase();
                const code = String(course.course_code || "");
                const titleTH = String(course.title_th || "").toLowerCase();
                
                const titleEN = String(course.title_en || "").toLowerCase(); 
                const desc = String(course.description || "").toLowerCase();

                
                if (
                    code.includes(searchKeyword) || 
                    titleTH.includes(searchKeyword) || 
                    titleEN.includes(searchKeyword) || 
                    desc.includes(searchKeyword)
                ) {
                    finalResults.push({
                        id: section.id,
                        code: code,
                        year: section.version?.year?.toString() || "ไม่ระบุปี",
                        degree: degree,
                        titleTH: String(course.title_th || ""),
                        titleEN: String(course.title_en || ""),
                        credit: String(course.credit || "ไม่ระบุหน่วยกิต"),
                        prerequisiteTH: String(course.prerequisite_th || "ไม่มี"),
                        prerequisiteEN: String(course.prerequisite_en || "None"),
                        descriptionTH: String(course.description_th || ""),
                        descriptionEN: String(course.description_en || ""),
                        pdf_path: section.pdf_path
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