import { prisma } from "../lib/prisma.js";

export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.json({ news: [], lecturers: [], courses: [] });
        }

        const keyword = String(q).trim();
        console.log(`🔍 ค้นหาแบบ Global Search ด้วยคำว่า: "${keyword}"`);

        // ค้นหา 3 ตารางพร้อมกันแบบปลอดภัย (ถ้าตารางไหน error จะส่ง array ว่างกลับมาแทนการพัง)
        const [newsResults, lecturerResults, courseResults] = await Promise.all([
            // 1. หาข่าว (หาจาก title)
            prisma.news.findMany({
                where: { title: { contains: keyword } },
                select: { id: true, title: true },
                take: 5 
            }).catch((err) => {
                console.warn("⚠️ ค้นหาตาราง news ไม่สำเร็จ (อาจยังไม่มีตาราง):", err.message);
                return [];
            }),

            // 2. หาอาจารย์ (หาจาก fullname_th)
            prisma.lecturers.findMany({
                where: { fullname_th: { contains: keyword } },
                select: { id: true, fullname_th: true, email: true },
                take: 5
            }).catch((err) => {
                console.warn("⚠️ ค้นหาตาราง lecturers ไม่สำเร็จ:", err.message);
                return [];
            }),

            // 3. หาวิชา (👉 แก้เป็นค้นหาจาก content ตาม Database ของคุณ)
            prisma.program_sections.findMany({
                where: { content: { contains: keyword } }, 
                select: { id: true, title: true, version: { select: { year: true } } },
                take: 5
            }).catch((err) => {
                console.warn("⚠️ ค้นหาตาราง program_sections ไม่สำเร็จ:", err.message);
                return [];
            })
        ]);

        console.log("✅ ค้นหาสำเร็จ! เจอข่าว:", newsResults.length, "เจออาจารย์:", lecturerResults.length, "เจอกลุ่มวิชา:", courseResults.length);

        res.json({
            news: newsResults,
            lecturers: lecturerResults,
            courses: courseResults
        });

    } catch (error) {
        console.error("💥 Global Search Error:", error);
        res.status(500).json({ error: "Search failed", details: error.message });
    }
};