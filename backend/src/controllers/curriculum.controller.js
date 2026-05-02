import { prisma } from "../lib/prisma.js";

// ดึงข้อมูลหลักสูตรทั้งหมด
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await prisma.programs.findMany({
      include: {
        degree: true, // ดึงระดับปริญญามาด้วย (เช่น ป.ตรี, ป.โท)
        versions: true // ดึงเวอร์ชันปีหลักสูตรมาด้วย (เช่น หลักสูตรปี 60, 65)
      }
    });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch programs" });
  }
};

// ...สามารถเพิ่ม createProgram, updateProgram ได้ในอนาคต