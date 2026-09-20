import { prisma } from "../lib/prisma.js";

// ดึงข้อมูลหลักสูตรทั้งหมด
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await prisma.programs.findMany({
      include: {
        degree: true,
        versions: true
      },
      orderBy: { id: "asc" }
    });
    res.json(programs);
  } catch (error) {
    console.error("Fetch programs error:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
};

// ดึงระดับการศึกษา
export const getDegrees = async (req, res) => {
  try {
    const degrees = await prisma.degrees.findMany({
      orderBy: { id: "asc" }
    });
    res.json(degrees);
  } catch (error) {
    console.error("Fetch degrees error:", error);
    res.status(500).json({ error: "Failed to fetch degrees" });
  }
};

// เพิ่มหลักสูตรใหม่
export const createProgram = async (req, res) => {
  try {
    const { name_th, slug, degreeId, year } = req.body;
    if (!name_th || !degreeId) {
      return res.status(400).json({ error: "Name and Degree are required" });
    }

    const program = await prisma.programs.create({
      data: {
        name_th,
        slug: slug || `prog-${Date.now()}`,
        degreeId: parseInt(degreeId)
      },
      include: { degree: true, versions: true }
    });

    if (year) {
      await prisma.program_versions.create({
        data: {
          programId: program.id,
          year: parseInt(year)
        }
      });
    }

    res.status(201).json(program);
  } catch (error) {
    console.error("Create program error:", error);
    res.status(500).json({ error: "Failed to create program" });
  }
};

// แก้ไขหลักสูตร
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_th, slug, degreeId } = req.body;

    const updated = await prisma.programs.update({
      where: { id: parseInt(id) },
      data: {
        name_th,
        slug: slug || undefined,
        degreeId: degreeId ? parseInt(degreeId) : undefined
      },
      include: { degree: true, versions: true }
    });

    res.json(updated);
  } catch (error) {
    console.error("Update program error:", error);
    res.status(500).json({ error: "Failed to update program" });
  }
};

// ลบหลักสูตร
export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const progId = parseInt(id);

    // ลบ sections และ versions ที่เกี่ยวข้องก่อน
    const versions = await prisma.program_versions.findMany({
      where: { programId: progId }
    });

    for (const v of versions) {
      await prisma.program_sections.deleteMany({
        where: { versionId: v.id }
      });
    }

    await prisma.program_versions.deleteMany({
      where: { programId: progId }
    });

    await prisma.programs.delete({
      where: { id: progId }
    });

    res.json({ message: "ลบหลักสูตรสำเร็จ" });
  } catch (error) {
    console.error("Delete program error:", error);
    res.status(500).json({ error: "Failed to delete program" });
  }
};