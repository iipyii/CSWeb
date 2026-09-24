import { prisma } from "../lib/prisma.js";

// ดึงข้อมูลหลักสูตรทั้งหมด พร้อมเวอร์ชันและหมวดต่างๆ
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await prisma.programs.findMany({
      include: {
        degree: true,
        versions: {
          include: {
            sections: {
              orderBy: { section_no: "asc" }
            }
          },
          orderBy: { year: "desc" }
        }
      },
      orderBy: { id: "asc" }
    });
    res.json(programs);
  } catch (error) {
    console.error("Fetch programs error:", error);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
};

// ดึงข้อมูลหลักสูตรตาม ID
export const getProgramById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const program = await prisma.programs.findUnique({
      where: { id },
      include: {
        degree: true,
        versions: {
          include: {
            sections: {
              orderBy: { section_no: "asc" }
            }
          },
          orderBy: { year: "desc" }
        }
      }
    });

    if (!program) {
      return res.status(404).json({ error: "ไม่พบหลักสูตรนี้" });
    }

    res.json(program);
  } catch (error) {
    console.error("Get program by id error:", error);
    res.status(500).json({ error: "Failed to get program" });
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

    if (year && !isNaN(parseInt(year))) {
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
      include: { 
        degree: true, 
        versions: {
          include: { sections: true }
        }
      }
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

// เพิ่มเวอร์ชันปีใหม่ให้หลักสูตร
export const addProgramVersion = async (req, res) => {
  try {
    const { programId, year } = req.body;
    if (!programId || !year) {
      return res.status(400).json({ error: "Program ID and Year are required" });
    }

    const progId = parseInt(programId);
    const yr = parseInt(year);

    const existing = await prisma.program_versions.findFirst({
      where: { programId: progId, year: yr }
    });

    if (existing) {
      return res.status(400).json({ error: `หลักสูตรนี้มีเวอร์ชันปี ${yr} อยู่แล้ว` });
    }

    const version = await prisma.program_versions.create({
      data: {
        programId: progId,
        year: yr
      },
      include: { sections: true }
    });

    res.status(201).json(version);
  } catch (error) {
    console.error("Add program version error:", error);
    res.status(500).json({ error: "Failed to add version" });
  }
};

// ลบเวอร์ชันปี
export const deleteProgramVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const vId = parseInt(versionId);

    await prisma.program_sections.deleteMany({
      where: { versionId: vId }
    });

    await prisma.program_versions.delete({
      where: { id: vId }
    });

    res.json({ message: "ลบเวอร์ชันหลักสูตรสำเร็จ" });
  } catch (error) {
    console.error("Delete version error:", error);
    res.status(500).json({ error: "Failed to delete version" });
  }
};

// อัปโหลดไฟล์ PDF สำหรับหมวด มคอ.2 (หมวด 1 - หมวด 9)
export const uploadSectionPdf = async (req, res) => {
  try {
    const { versionId, section_no, title } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์ PDF" });
    }

    const vId = parseInt(versionId);
    const sNo = parseInt(section_no);
    const pdfPath = `/uploads/courses/${req.file.filename}`;

    const defaultTitles = {
      1: "หมวดที่ 1 ข้อมูลทั่วไป",
      2: "หมวดที่ 2 ข้อมูลเฉพาะของหลักสูตร",
      3: "หมวดที่ 3 ระบบการจัดการศึกษา โครงสร้าง และรายวิชา",
      4: "หมวดที่ 4 ผลการเรียนรู้และกลยุทธ์การสอน",
      5: "หมวดที่ 5 หลักเกณฑ์ในการประเมินผล",
      6: "หมวดที่ 6 การพัฒนาคณาจารย์",
      7: "หมวดที่ 7 การประกันคุณภาพหลักสูตร",
      8: "หมวดที่ 8 การประเมินและปรับปรุงการดำเนินการ",
      9: "หมวดที่ 9 เอกสารแนบ / ภาคผนวก"
    };

    const sectionTitle = title || defaultTitles[sNo] || `หมวดที่ ${sNo}`;

    // Upsert section
    const existing = await prisma.program_sections.findFirst({
      where: { versionId: vId, section_no: sNo }
    });

    let savedSection;
    if (existing) {
      savedSection = await prisma.program_sections.update({
        where: { id: existing.id },
        data: {
          title: sectionTitle,
          pdf_path: pdfPath,
          order_index: sNo
        }
      });
    } else {
      savedSection = await prisma.program_sections.create({
        data: {
          versionId: vId,
          section_no: sNo,
          title: sectionTitle,
          content: "",
          order_index: sNo,
          pdf_path: pdfPath
        }
      });
    }

    res.json({ message: "อัปโหลดไฟล์ PDF หมวดหลักสูตรสำเร็จ", section: savedSection });
  } catch (error) {
    console.error("Upload section PDF error:", error);
    res.status(500).json({ error: "Failed to upload section PDF" });
  }
};

// ลบไฟล์ PDF ของหมวด
export const deleteSectionPdf = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const sId = parseInt(sectionId);

    await prisma.program_sections.update({
      where: { id: sId },
      data: { pdf_path: null }
    });

    res.json({ message: "ลบไฟล์ PDF สำเร็จ" });
  } catch (error) {
    console.error("Delete section PDF error:", error);
    res.status(500).json({ error: "Failed to delete section PDF" });
  }
};