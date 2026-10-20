import { prisma } from "../lib/prisma.js";
import fs from "fs";
import path from "path";

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
      orderBy: [
        { order_no: "asc" },
        { id: "asc" }
      ]
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
    const { name_th, name_en, slug, degreeId, year, curriculum_code, image_path, is_featured, date_tag, order_no } = req.body;
    if (!name_th || !name_th.trim() || !degreeId) {
      return res.status(400).json({ error: "กรุณาระบุชื่อหลักสูตร (ภาษาไทย) และระดับการศึกษา" });
    }

    const cleanSlug = slug && slug.trim() 
      ? slug.trim().toLowerCase() 
      : `prog-${Date.now()}`;

    // ตรวจสอบ Slug ซ้ำ
    const existingSlug = await prisma.programs.findFirst({
      where: { slug: cleanSlug },
      include: { degree: true }
    });
    if (existingSlug) {
      return res.status(400).json({ 
        error: `Slug "${cleanSlug}" ซ้ำกับหลักสูตร "${existingSlug.name_th}" (${existingSlug.degree?.name_th || ''}) กรุณาใช้ Slug อื่น` 
      });
    }

    const program = await prisma.programs.create({
      data: {
        name_th: name_th.trim(),
        name_en: name_en ? name_en.trim() : null,
        slug: cleanSlug,
        degreeId: parseInt(degreeId),
        image_path: image_path || null,
        is_featured: is_featured !== undefined ? Boolean(is_featured) : true,
        date_tag: date_tag ? date_tag.trim() : null,
        order_no: order_no !== undefined ? parseInt(order_no) : 0
      },
      include: { degree: true, versions: true }
    });

    // สร้างเวอร์ชันเริ่มต้นให้หลักสูตร (ปีปัจจุบัน 2569 หรือปีที่ระบุมา)
    const yr = year && !isNaN(parseInt(year)) ? parseInt(year) : 2569;
    const code = curriculum_code && curriculum_code.trim() 
      ? curriculum_code.trim().toUpperCase() 
      : `${cleanSlug.toUpperCase()}${String(yr).slice(-2)}`;

    try {
      const version = await prisma.program_versions.create({
        data: {
          programId: program.id,
          year: yr,
          curriculum_code: code
        }
      });

      // Auto link any subjects that match this curriculum_code
      try {
        await prisma.subjects.updateMany({
          where: { curriculum_code: code },
          data: { program_version_id: version.id }
        });
      } catch (e) {}
    } catch (verErr) {
      console.warn("Could not create initial version:", verErr);
    }

    const finalProgram = await prisma.programs.findUnique({
      where: { id: program.id },
      include: { degree: true, versions: { include: { sections: true } } }
    });

    res.status(201).json(finalProgram);
  } catch (error) {
    console.error("Create program error:", error);
    res.status(500).json({ error: "Failed to create program: " + error.message });
  }
};

// แก้ไขหลักสูตร
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const pId = parseInt(id);
    const { name_th, name_en, slug, degreeId, image_path, is_featured, date_tag, order_no } = req.body;

    if (name_th !== undefined && !name_th.trim()) {
      return res.status(400).json({ error: "กรุณาระบุชื่อหลักสูตร (ภาษาไทย)" });
    }

    // ตรวจสอบ Slug ซ้ำถ้ามีการเปลี่ยน
    if (slug && slug.trim()) {
      const cleanSlug = slug.trim().toLowerCase();
      const existingSlug = await prisma.programs.findFirst({
        where: { 
          slug: cleanSlug,
          NOT: { id: pId }
        },
        include: { degree: true }
      });
      if (existingSlug) {
        return res.status(400).json({ 
          error: `Slug "${cleanSlug}" ซ้ำกับหลักสูตร "${existingSlug.name_th}" (${existingSlug.degree?.name_th || ''}) กรุณาใช้ Slug อื่น` 
        });
      }
    }

    const updated = await prisma.programs.update({
      where: { id: pId },
      data: {
        name_th: name_th ? name_th.trim() : undefined,
        name_en: name_en !== undefined ? (name_en ? name_en.trim() : null) : undefined,
        slug: slug ? slug.trim().toLowerCase() : undefined,
        degreeId: degreeId ? parseInt(degreeId) : undefined,
        image_path: image_path !== undefined ? image_path : undefined,
        is_featured: is_featured !== undefined ? Boolean(is_featured) : undefined,
        date_tag: date_tag !== undefined ? (date_tag ? date_tag.trim() : null) : undefined,
        order_no: order_no !== undefined ? parseInt(order_no) : undefined
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
    res.status(500).json({ error: "Failed to update program: " + error.message });
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
    const { programId, year, curriculum_code } = req.body;
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

    const prog = await prisma.programs.findUnique({ where: { id: progId } });
    const code = curriculum_code && curriculum_code.trim()
      ? curriculum_code.trim()
      : `${(prog?.slug || 'CS').toUpperCase()}${String(yr).slice(-2)}`;

    const version = await prisma.program_versions.create({
      data: {
        programId: progId,
        year: yr,
        curriculum_code: code
      },
      include: { sections: true }
    });

    // Auto link subjects with matching curriculum_code
    try {
      await prisma.subjects.updateMany({
        where: { curriculum_code: code },
        data: { program_version_id: version.id }
      });
    } catch (e) {}

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

// แก้ไขเวอร์ชันปีหลักสูตร (ปี พ.ศ. และ curriculum_code)
export const updateProgramVersion = async (req, res) => {
  try {
    const { versionId } = req.params;
    const { year, curriculum_code } = req.body;
    const vId = parseInt(versionId);

    const oldVersion = await prisma.program_versions.findUnique({
      where: { id: vId }
    });
    if (!oldVersion) {
      return res.status(404).json({ error: "ไม่พบเวอร์ชันหลักสูตรนี้" });
    }

    const yr = year ? parseInt(year) : oldVersion.year;
    const code = curriculum_code !== undefined ? (curriculum_code ? curriculum_code.trim().toUpperCase() : null) : oldVersion.curriculum_code;

    // ตรวจสอบปีซ้ำในหลักสูตรเดียวกัน
    if (year && yr !== oldVersion.year) {
      const duplicateYear = await prisma.program_versions.findFirst({
        where: {
          programId: oldVersion.programId,
          year: yr,
          NOT: { id: vId }
        }
      });
      if (duplicateYear) {
        return res.status(400).json({ error: `ปีหลักสูตร พ.ศ. ${yr} มีอยู่แล้วในหลักสูตรนี้` });
      }
    }

    const updated = await prisma.program_versions.update({
      where: { id: vId },
      data: {
        year: yr,
        curriculum_code: code
      },
      include: { sections: true }
    });

    // ถ้ามีการเปลี่ยนรหัสหลักสูตร ให้ผูกวิชาที่มีรหัสตรงกันให้อัตโนมัติ
    if (code && code !== oldVersion.curriculum_code) {
      try {
        await prisma.subjects.updateMany({
          where: { curriculum_code: code },
          data: { program_version_id: updated.id }
        });
      } catch (e) {}
    }

    res.json(updated);
  } catch (error) {
    console.error("Update version error:", error);
    res.status(500).json({ error: "Failed to update version: " + error.message });
  }
};

// เพิ่มหมวดใหม่ให้กับเวอร์ชันหลักสูตร
export const createSection = async (req, res) => {
  try {
    const { versionId, section_no, title, order_index } = req.body;
    if (!versionId || !title) {
      return res.status(400).json({ error: "กรุณาระบุเวอร์ชันหลักสูตรและชื่อหมวด" });
    }

    const vId = parseInt(versionId);
    let sNo = section_no ? parseInt(section_no) : null;
    let ord = order_index !== undefined && order_index !== "" ? parseInt(order_index) : null;

    if (!sNo) {
      const maxSec = await prisma.program_sections.findFirst({
        where: { versionId: vId },
        orderBy: { section_no: "desc" }
      });
      sNo = maxSec ? maxSec.section_no + 1 : 1;
    }

    if (ord === null) {
      ord = sNo;
    }

    const file = req.file || (req.files && req.files[0]);
    const pdfPath = file ? `/uploads/courses/${file.filename}` : null;

    const newSection = await prisma.program_sections.create({
      data: {
        versionId: vId,
        section_no: sNo,
        title: title.trim(),
        content: "",
        order_index: ord,
        pdf_path: pdfPath
      }
    });

    res.status(201).json({ message: "เพิ่มหมวดหลักสูตรสำเร็จ", section: newSection });
  } catch (error) {
    console.error("Create section error:", error);
    res.status(500).json({ error: "Failed to create section" });
  }
};

// แก้ไขข้อมูลหมวด (ชื่อหมวด, หมายเลขหมวด, ลำดับ)
export const updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { title, section_no, order_index } = req.body;

    const sId = parseInt(sectionId);
    const existing = await prisma.program_sections.findUnique({
      where: { id: sId }
    });

    if (!existing) {
      return res.status(404).json({ error: "ไม่พบหมวดหลักสูตรนี้" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (section_no !== undefined && section_no !== "") updateData.section_no = parseInt(section_no);
    if (order_index !== undefined && order_index !== "") updateData.order_index = parseInt(order_index);

    const file = req.file || (req.files && req.files[0]);
    if (file) {
      updateData.pdf_path = `/uploads/courses/${file.filename}`;
    }

    const updated = await prisma.program_sections.update({
      where: { id: sId },
      data: updateData
    });

    res.json({ message: "แก้ไขหมวดหลักสูตรสำเร็จ", section: updated });
  } catch (error) {
    console.error("Update section error:", error);
    res.status(500).json({ error: "Failed to update section" });
  }
};

// ลบหมวดหลักสูตร
export const deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const sId = parseInt(sectionId);

    const existing = await prisma.program_sections.findUnique({
      where: { id: sId }
    });

    if (!existing) {
      return res.status(404).json({ error: "ไม่พบหมวดหลักสูตรนี้" });
    }

    if (existing.pdf_path && existing.pdf_path.startsWith("/uploads/courses/")) {
      const fullPath = path.join(process.cwd(), existing.pdf_path);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch {}
      }
    }

    await prisma.program_sections.delete({
      where: { id: sId }
    });

    res.json({ message: "ลบหมวดหลักสูตรเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Delete section error:", error);
    res.status(500).json({ error: "Failed to delete section" });
  }
};

// สร้างหมวดมาตรฐาน มคอ.2 (หมวด 1 - หมวด 9) อัตโนมัติสำหรับเวอร์ชันที่ยังไม่มีหมวด
export const seedStandardSections = async (req, res) => {
  try {
    const { versionId } = req.body;
    if (!versionId) return res.status(400).json({ error: "versionId is required" });
    const vId = parseInt(versionId);

    const standardSections = [
      { no: 1, title: 'หมวดที่ 1 ข้อมูลทั่วไป' },
      { no: 2, title: 'หมวดที่ 2 ข้อมูลเฉพาะของหลักสูตร' },
      { no: 3, title: 'หมวดที่ 3 ระบบการจัดการศึกษา โครงสร้าง และรายวิชา' },
      { no: 4, title: 'หมวดที่ 4 ผลการเรียนรู้และกลยุทธ์การสอน' },
      { no: 5, title: 'หมวดที่ 5 หลักเกณฑ์ในการประเมินผล' },
      { no: 6, title: 'หมวดที่ 6 การพัฒนาคณาจารย์' },
      { no: 7, title: 'หมวดที่ 7 การประกันคุณภาพหลักสูตร' },
      { no: 8, title: 'หมวดที่ 8 การประเมินและปรับปรุงการดำเนินการ' },
      { no: 9, title: 'หมวดที่ 9 เอกสารแนบ / ภาคผนวก' },
    ];

    for (const sec of standardSections) {
      const exists = await prisma.program_sections.findFirst({
        where: { versionId: vId, section_no: sec.no }
      });
      if (!exists) {
        await prisma.program_sections.create({
          data: {
            versionId: vId,
            section_no: sec.no,
            title: sec.title,
            content: "",
            order_index: sec.no,
            pdf_path: null
          }
        });
      }
    }

    const updatedSections = await prisma.program_sections.findMany({
      where: { versionId: vId },
      orderBy: { order_index: "asc" }
    });

    res.json({ message: "เพิ่มหมวดมาตรฐานสำเร็จ", sections: updatedSections });
  } catch (error) {
    console.error("Seed standard sections error:", error);
    res.status(500).json({ error: "Failed to seed standard sections" });
  }
};

// อัปโหลดไฟล์ PDF สำหรับหมวด มคอ.2
export const uploadSectionPdf = async (req, res) => {
  try {
    const { sectionId, versionId, section_no, title } = req.body;
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ error: "กรุณาเลือกไฟล์ PDF" });
    }

    const pdfPath = `/uploads/courses/${file.filename}`;

    // ถ้าส่ง sectionId มาโดยตรง
    if (sectionId) {
      const sId = parseInt(sectionId);
      const updateData = { pdf_path: pdfPath };
      if (title && title.trim()) updateData.title = title.trim();

      const updated = await prisma.program_sections.update({
        where: { id: sId },
        data: updateData
      });
      return res.json({ message: "อัปโหลดไฟล์ PDF สำเร็จ", section: updated });
    }

    // ถ้าไม่มี sectionId ให้ค้นหาหรือสร้างจาก versionId + section_no
    if (!versionId || !section_no) {
      return res.status(400).json({ error: "กรุณาระบุข้อมูลหมวดให้ครบถ้วน" });
    }

    const vId = parseInt(versionId);
    const sNo = parseInt(section_no);

    const existing = await prisma.program_sections.findFirst({
      where: { versionId: vId, section_no: sNo }
    });

    let savedSection;
    if (existing) {
      savedSection = await prisma.program_sections.update({
        where: { id: existing.id },
        data: {
          title: title ? title.trim() : existing.title,
          pdf_path: pdfPath
        }
      });
    } else {
      savedSection = await prisma.program_sections.create({
        data: {
          versionId: vId,
          section_no: sNo,
          title: title ? title.trim() : `หมวดที่ ${sNo}`,
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

    const existing = await prisma.program_sections.findUnique({
      where: { id: sId }
    });

    if (existing?.pdf_path && existing.pdf_path.startsWith("/uploads/courses/")) {
      const fullPath = path.join(process.cwd(), existing.pdf_path);
      if (fs.existsSync(fullPath)) {
        try { fs.unlinkSync(fullPath); } catch {}
      }
    }

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