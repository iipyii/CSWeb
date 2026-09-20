import { prisma } from "../lib/prisma.js";
import * as XLSX from "xlsx";

export const getAllProjects = async (req, res) => {
  try {
    const { year, semester, search } = req.query;

    const where = {};
    if (year) {
      where.year = parseInt(year);
    }
    if (semester) {
      where.semester = parseInt(semester);
    }
    if (search) {
      where.OR = [
        { title_th: { contains: search, mode: "insensitive" } },
        { title_en: { contains: search, mode: "insensitive" } },
        { students_text: { contains: search, mode: "insensitive" } },
        { student: { firstname: { contains: search, mode: "insensitive" } } },
        { student: { lastname: { contains: search, mode: "insensitive" } } },
        { student: { student_id: { contains: search } } }
      ];
    }

    const projects = await prisma.projects.findMany({
      where,
      include: {
        student: { select: { id: true, firstname: true, lastname: true, student_id: true } },
        advisor: { select: { id: true, fullname_th: true, lecturer_code: true } },
        co_advisor: { select: { id: true, fullname_th: true, lecturer_code: true } }
      },
      orderBy: [
        { year: "desc" },
        { semester: "desc" },
        { id: "desc" }
      ]
    });
    res.json(projects);
  } catch (error) {
    console.error("Fetch projects error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.projects.findUnique({
      where: { id: parseInt(id) },
      include: {
        student: true,
        advisor: { select: { id: true, fullname_th: true, fullname_en: true, lecturer_code: true, email: true } },
        co_advisor: { select: { id: true, fullname_th: true, fullname_en: true, lecturer_code: true, email: true } }
      }
    });

    if (!project) {
      return res.status(404).json({ error: "ไม่พบข้อมูลโครงงาน" });
    }

    res.json(project);
  } catch (error) {
    console.error("Get project by id error:", error);
    res.status(500).json({ error: "Failed to get project" });
  }
};

export const createProject = async (req, res) => {
  try {
    const { 
      title_th, title_en, abstract, year, semester, image_path, 
      document_url, github_url, student1Id, student1Name, 
      student2Id, student2Name, students_text, studentsList,
      advisor_id, co_advisor_id, student_id 
    } = req.body;

    let targetStudentId = student_id ? parseInt(student_id) : null;
    let finalStudentsText = students_text;

    // ถ้ามี studentsList ส่งมา (แบบแยกช่อง รหัสนักศึกษา - ชื่อ-นามสกุล)
    if (Array.isArray(studentsList) && studentsList.length > 0) {
      const validStudents = studentsList.filter(s => (s.name && s.name.trim()) || (s.id && s.id.trim()));
      const formattedList = [];

      for (let i = 0; i < validStudents.length; i++) {
        const s = validStudents[i];
        const sId = (s.id || "").trim();
        const sName = (s.name || "").trim();
        const formatted = formatStudentItem(sName, sId);
        if (formatted) formattedList.push(formatted);

        // Upsert student ลงตาราง students
        if (sId) {
          const parts = sName.split(/\s+/);
          const firstname = parts[0] || "นักศึกษา";
          const lastname = parts.slice(1).join(" ") || "";
          try {
            const stu = await prisma.students.upsert({
              where: { student_id: String(sId) },
              update: {
                firstname: firstname || undefined,
                lastname: lastname || undefined
              },
              create: {
                student_id: String(sId),
                title: "นาย/นางสาว",
                firstname,
                lastname
              }
            });
            // คนแรกเชื่อมโยงเป็น student_id ของ project
            if (i === 0 && !targetStudentId) {
              targetStudentId = stu.id;
            }
          } catch (err) {
            console.error(`Failed to upsert student ${sId}:`, err);
          }
        }
      }
      finalStudentsText = formattedList.join("\n");
    } else {
      // Legacy fallback
      if (!targetStudentId && student1Id) {
        const parts = (student1Name || "").trim().split(/\s+/);
        const firstname = parts[0] || "นักศึกษา";
        const lastname = parts.slice(1).join(" ") || "";
        const stu = await prisma.students.upsert({
          where: { student_id: String(student1Id) },
          update: {
            firstname: firstname || undefined,
            lastname: lastname || undefined
          },
          create: {
            student_id: String(student1Id),
            title: "นาย/นางสาว",
            firstname,
            lastname
          }
        });
        targetStudentId = stu.id;
      }

      if (!finalStudentsText && (student1Name || student2Name)) {
        const sList = [];
        if (student1Name) {
          sList.push(student1Id ? `${student1Name.trim()} (${student1Id.trim()})` : student1Name.trim());
        }
        if (student2Name) {
          sList.push(student2Id ? `${student2Name.trim()} (${student2Id.trim()})` : student2Name.trim());
        }
        finalStudentsText = sList.join("\n");
      }
    }

    const newProject = await prisma.projects.create({
      data: {
        title_th,
        title_en: title_en || null,
        abstract: abstract || null,
        image_path: image_path || null,
        document_url: document_url || null,
        github_url: github_url || null,
        year: year ? parseInt(year) : null,
        semester: semester ? parseInt(semester) : 1,
        students_text: finalStudentsText || null,
        student_id: targetStudentId,
        advisor_id: advisor_id ? parseInt(advisor_id) : null,
        co_advisor_id: co_advisor_id ? parseInt(co_advisor_id) : null
      },
      include: {
        student: true,
        advisor: true,
        co_advisor: true
      }
    });

    res.status(201).json({ message: "สร้างโครงงานสำเร็จ", data: newProject });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title_th, title_en, abstract, year, semester, image_path, 
      document_url, github_url, student1Id, student1Name, 
      student2Id, student2Name, students_text, studentsList,
      advisor_id, co_advisor_id, student_id 
    } = req.body;

    let targetStudentId = student_id ? parseInt(student_id) : undefined;
    let finalStudentsText = students_text;

    if (Array.isArray(studentsList) && studentsList.length > 0) {
      const validStudents = studentsList.filter(s => (s.name && s.name.trim()) || (s.id && s.id.trim()));
      const formattedList = [];

      for (let i = 0; i < validStudents.length; i++) {
        const s = validStudents[i];
        const sId = (s.id || "").trim();
        const sName = (s.name || "").trim();
        const formatted = formatStudentItem(sName, sId);
        if (formatted) formattedList.push(formatted);

        if (sId) {
          const parts = sName.split(/\s+/);
          const firstname = parts[0] || "นักศึกษา";
          const lastname = parts.slice(1).join(" ") || "";
          try {
            const stu = await prisma.students.upsert({
              where: { student_id: String(sId) },
              update: {
                firstname: firstname || undefined,
                lastname: lastname || undefined
              },
              create: {
                student_id: String(sId),
                title: "นาย/นางสาว",
                firstname,
                lastname
              }
            });
            if (i === 0) {
              targetStudentId = stu.id;
            }
          } catch (err) {
            console.error(`Failed to upsert student ${sId}:`, err);
          }
        }
      }
      finalStudentsText = formattedList.join("\n");
    } else {
      if (student1Id) {
        const parts = (student1Name || "").trim().split(/\s+/);
        const firstname = parts[0] || "นักศึกษา";
        const lastname = parts.slice(1).join(" ") || "";
        const stu = await prisma.students.upsert({
          where: { student_id: String(student1Id) },
          update: {
            firstname: firstname || undefined,
            lastname: lastname || undefined
          },
          create: {
            student_id: String(student1Id),
            title: "นาย/นางสาว",
            firstname,
            lastname
          }
        });
        targetStudentId = stu.id;
      }

      if (finalStudentsText === undefined && (student1Name || student2Name)) {
        const sList = [];
        if (student1Name) {
          sList.push(student1Id ? `${student1Name.trim()} (${student1Id.trim()})` : student1Name.trim());
        }
        if (student2Name) {
          sList.push(student2Id ? `${student2Name.trim()} (${student2Id.trim()})` : student2Name.trim());
        }
        finalStudentsText = sList.join("\n");
      }
    }

    const updated = await prisma.projects.update({
      where: { id: parseInt(id) },
      data: {
        title_th: title_th || undefined,
        title_en: title_en !== undefined ? title_en : undefined,
        abstract: abstract !== undefined ? abstract : undefined,
        image_path: image_path !== undefined ? image_path : undefined,
        document_url: document_url !== undefined ? document_url : undefined,
        github_url: github_url !== undefined ? github_url : undefined,
        year: year ? parseInt(year) : undefined,
        semester: semester !== undefined ? parseInt(semester) : undefined,
        students_text: finalStudentsText !== undefined ? finalStudentsText : undefined,
        student_id: targetStudentId,
        advisor_id: advisor_id !== undefined ? (advisor_id ? parseInt(advisor_id) : null) : undefined,
        co_advisor_id: co_advisor_id !== undefined ? (co_advisor_id ? parseInt(co_advisor_id) : null) : undefined
      },
      include: {
        student: true,
        advisor: true,
        co_advisor: true
      }
    });

    res.json({ message: "แก้ไขโครงงานสำเร็จ", data: updated });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.projects.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "ลบโครงงานสำเร็จ" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

// Helper: Parse semester and year from string (e.g. "1-2566", "1/2566", "ภาคการศึกษาที่ 1/2566")
function parseSemesterAndYear(text) {
  if (!text) return { semester: null, year: null };
  const str = String(text).trim();

  // Match pattern like 1-2566, 1/2566, 1_2566
  const match1 = str.match(/([1-3])\s*[-/_\.]\s*([25]\d{3})/);
  if (match1) {
    return { semester: parseInt(match1[1]), year: parseInt(match1[2]) };
  }

  // Match pattern like 2566-1, 2566/1
  const match2 = str.match(/([25]\d{3})\s*[-/_\.]\s*([1-3])/);
  if (match2) {
    return { semester: parseInt(match2[2]), year: parseInt(match2[1]) };
  }

  // Match year alone e.g. "2566"
  const matchYear = str.match(/([25]\d{3})/);
  if (matchYear) {
    return { semester: 1, year: parseInt(matchYear[1]) };
  }

  return { semester: null, year: null };
}

// Helper: Format student name and ID
function formatStudentItem(name, id) {
  const cleanId = id !== undefined && id !== null ? String(id).trim() : '';
  let cleanName = name !== undefined && name !== null ? String(name).trim() : '';

  if (!cleanName && !cleanId) return null;
  cleanName = cleanName.replace(/\s+/g, ' ');

  if (cleanId && cleanName.includes(cleanId)) {
    return cleanName;
  }
  if (cleanName && cleanId) {
    return `${cleanName} (${cleanId})`;
  }
  if (cleanName) {
    return cleanName;
  }
  return cleanId;
}

// Helper: Add unique student to project
function addStudentToProject(proj, stuStr) {
  if (!stuStr) return;
  const trimmed = stuStr.trim();
  if (!trimmed) return;
  const exists = proj.students.some(s => {
    if (s === trimmed) return true;
    const id1 = s.match(/\d{10,13}/);
    const id2 = trimmed.match(/\d{10,13}/);
    if (id1 && id2 && id1[0] === id2[0]) return true;
    return false;
  });
  if (!exists) {
    proj.students.push(trimmed);
  }
}

// Helper: Analyze header row to detect columns
function analyzeHeaderRow(row) {
  const colMap = {
    index: -1,
    title: -1,
    studentId: -1,
    studentName: -1,
    students: -1,
    advisor: -1,
    coAdvisor: -1,
    multiStudents: []
  };

  const studentIdCols = [];
  const studentNameCols = [];

  row.forEach((cell, cIdx) => {
    if (cell === undefined || cell === null) return;
    const cellStr = String(cell).trim().toLowerCase().replace(/\s+/g, ' ');

    if (
      cellStr.includes('ผลสอบ') ||
      cellStr.includes('ผลการสอบ') ||
      cellStr.includes('ผลการประเมิน') ||
      cellStr.includes('สถานะ') ||
      cellStr.includes('คะแนน') ||
      cellStr.includes('หมายเหตุ') ||
      cellStr.includes('ห้องสอบ')
    ) {
      return;
    }

    if (
      cellStr === 'ลำดับ' || cellStr === 'ที่' || cellStr === 'no' || cellStr === 'no.' || cellStr === '#' || cellStr.startsWith('ลำดับ')
    ) {
      if (colMap.index === -1) colMap.index = cIdx;
      return;
    }

    if (
      (cellStr.includes('ชื่อหัวข้อ') || cellStr.includes('ชื่อโครงงาน') || cellStr.includes('หัวข้อโครงงาน') || cellStr === 'หัวข้อ' || cellStr.includes('project title') || cellStr.includes('topic')) &&
      !cellStr.includes('ภาคการศึกษา')
    ) {
      if (colMap.title === -1) colMap.title = cIdx;
      return;
    }

    // Check Student ID
    if (
      cellStr.includes('รหัส') &&
      (cellStr.includes('นักศึกษา') || cellStr.includes('นศ') || cellStr.includes('นิสิต') || cellStr.includes('ประจำตัว') || cellStr.includes('ผู้จัดทำ') || cellStr === 'รหัส')
    ) {
      studentIdCols.push(cIdx);
      if (colMap.studentId === -1) colMap.studentId = cIdx;
      return;
    }

    // Check Student Name
    if (
      (cellStr.includes('ชื่อ-นามสกุล') || cellStr.includes('ชื่อ - นามสกุล') || cellStr.includes('ชื่อ นามสกุล') || cellStr.includes('ชื่อ-สกุล') || cellStr.includes('ชื่อผู้จัดทำ') || cellStr.includes('ผู้จัดทำ') || (cellStr.includes('ชื่อ') && (cellStr.includes('นักศึกษา') || cellStr.includes('นศ'))) || cellStr === 'นักศึกษา' || cellStr === 'student name' || cellStr === 'student' || cellStr === 'students') &&
      !cellStr.includes('อาจารย์') && !cellStr.includes('ที่ปรึกษา') && !cellStr.includes('รหัส')
    ) {
      studentNameCols.push(cIdx);
      if (colMap.studentName === -1) colMap.studentName = cIdx;
      return;
    }

    if (
      cellStr.includes('ที่ปรึกษาหลัก') ||
      (cellStr.includes('ที่ปรึกษา') && !cellStr.includes('ร่วม') && !cellStr.includes('กรรมการ')) ||
      (cellStr.includes('advisor') && !cellStr.includes('co'))
    ) {
      if (colMap.advisor === -1) colMap.advisor = cIdx;
      return;
    }

    if (
      cellStr.includes('ที่ปรึกษาร่วม') ||
      (cellStr.includes('ร่วม') && (cellStr.includes('ปรึกษา') || cellStr.includes('อาจารย์'))) ||
      cellStr.includes('co-advisor') || cellStr.includes('coadvisor')
    ) {
      if (colMap.coAdvisor === -1) colMap.coAdvisor = cIdx;
      return;
    }
  });

  // If there are multiple student columns e.g. student 1, student 2
  if (studentNameCols.length > 1 || studentIdCols.length > 1) {
    const max = Math.max(studentNameCols.length, studentIdCols.length);
    for (let i = 0; i < max; i++) {
      colMap.multiStudents.push({
        idCol: studentIdCols[i] !== undefined ? studentIdCols[i] : -1,
        nameCol: studentNameCols[i] !== undefined ? studentNameCols[i] : -1
      });
    }
  }

  return colMap;
}

// Helper: Extract students from a row
function extractStudentsFromRow(row, colMap) {
  const result = [];

  if (colMap.multiStudents && colMap.multiStudents.length > 0) {
    for (const pair of colMap.multiStudents) {
      const rawId = pair.idCol !== -1 && pair.idCol !== undefined ? row[pair.idCol] : '';
      const rawName = pair.nameCol !== -1 && pair.nameCol !== undefined ? row[pair.nameCol] : '';
      const item = formatStudentItem(rawName, rawId);
      if (item) result.push(item);
    }
    if (result.length > 0) return result;
  }

  const rawId = colMap.studentId !== -1 ? row[colMap.studentId] : '';
  const rawName = colMap.studentName !== -1 ? row[colMap.studentName] : (colMap.students !== -1 ? row[colMap.students] : '');

  const idStr = rawId !== undefined && rawId !== null ? String(rawId).trim() : '';
  const nameStr = rawName !== undefined && rawName !== null ? String(rawName).trim() : '';

  if (!idStr && !nameStr) return result;

  const idLines = idStr.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const nameLines = nameStr.split(/\r?\n/).map(s => s.trim()).filter(Boolean);

  if (idLines.length > 1 || nameLines.length > 1) {
    const max = Math.max(idLines.length, nameLines.length);
    for (let i = 0; i < max; i++) {
      const item = formatStudentItem(nameLines[i] || '', idLines[i] || '');
      if (item) result.push(item);
    }
  } else {
    const item = formatStudentItem(nameStr, idStr);
    if (item) result.push(item);
  }

  return result;
}

// Helper: Populate merged cells in sheet so sub-cells inherit parent value
function populateMergedCells(sheet) {
  if (!sheet || !sheet['!merges'] || !sheet['!ref']) return;
  const range = XLSX.utils.decode_range(sheet['!ref']);
  sheet['!merges'].forEach(merge => {
    const startCellRef = XLSX.utils.encode_cell(merge.s);
    const startCell = sheet[startCellRef];
    if (!startCell) return;
    const maxR = Math.min(merge.e.r, range.e.r);
    const maxC = Math.min(merge.e.c, range.e.c);
    for (let R = merge.s.r; R <= maxR; ++R) {
      for (let C = merge.s.c; C <= maxC; ++C) {
        if (R === merge.s.r && C === merge.s.c) continue;
        const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
        if (!sheet[cellRef] || sheet[cellRef].v === undefined || sheet[cellRef].v === null || sheet[cellRef].v === '') {
          sheet[cellRef] = { ...startCell };
        }
      }
    }
  });
}

// 📥 Import Projects from Excel
export const importProjectsExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "กรุณาอัปโหลดไฟล์ Excel (.xlsx หรือ .xls)" });
    }

    // 1. อ่านไฟล์ Workbook
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ error: "ไม่พบ Sheet ข้อมูลในไฟล์ Excel" });
    }

    // 2. ดึงข้อมูลอาจารย์ทั้งหมดเพื่อทำ Map (รหัสย่อ และ ชื่อ-นามสกุล)
    const lecturers = await prisma.lecturers.findMany({
      select: { id: true, lecturer_code: true, fullname_th: true }
    });

    const lecturerCodeMap = new Map();
    const lecturerNameMap = new Map();

    lecturers.forEach((lec) => {
      if (lec.lecturer_code) {
        lecturerCodeMap.set(lec.lecturer_code.trim().toUpperCase(), lec.id);
      }
      if (lec.fullname_th) {
        lecturerNameMap.set(lec.fullname_th.trim(), lec.id);
      }
    });

    const findLecturerId = (text) => {
      if (!text) return null;
      const clean = String(text).trim();
      const upper = clean.toUpperCase();

      // ค้นหาจากรหัสย่อ (SWK, SRS, TSR, KSB, NJR ฯลฯ)
      if (lecturerCodeMap.has(upper)) {
        return lecturerCodeMap.get(upper);
      }

      // ค้นหาจากชื่อเต็มหรือส่วนหนึ่งของชื่อ
      for (const [name, id] of lecturerNameMap.entries()) {
        if (clean.includes(name) || name.includes(clean)) {
          return id;
        }
      }

      // ลองตัดคำนำหน้าออก (นาย, นาง, นางสาว, ดร., ผศ., รศ., ศ., อาจารย์, ผู้ช่วยศาสตราจารย์, รองศาสตราจารย์)
      const cleanName = clean.replace(/^(นาย|นาง|นางสาว|อาจารย์|ดร\.|ผศ\.|รศ\.|ศ\.|ผู้ช่วยศาสตราจารย์|รองศาสตราจารย์|ศาสตราจารย์|\s)+/g, "").trim();
      if (cleanName) {
        for (const [name, id] of lecturerNameMap.entries()) {
          if (name.includes(cleanName)) {
            return id;
          }
        }
      }

      return null;
    };

    let totalCreated = 0;
    let totalUpdated = 0;
    const sheetsProcessed = [];
    const errorDetails = [];
    const studentCache = new Map();

    // 3. วนลูปอ่านทุก Sheet
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) continue;

      // เติมข้อมูลเซลล์ที่ถูก Merge ให้ครบทุกเซลล์ย่อย
      populateMergedCells(sheet);

      // แปลงข้อมูล Sheet เป็น Array of Arrays
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      if (!rows || rows.length === 0) continue;

      // หา semester และ year จากชื่อ sheet
      let { semester: sheetSemester, year: sheetYear } = parseSemesterAndYear(sheetName);

      // ถ้าชื่อ sheet ไม่มี ให้หาจากหัวเอกสารแถวแรกๆ
      if (!sheetYear || !sheetSemester) {
        for (let i = 0; i < Math.min(6, rows.length); i++) {
          const rowText = (rows[i] || []).join(" ");
          const parsed = parseSemesterAndYear(rowText);
          if (parsed.year) {
            sheetYear = sheetYear || parsed.year;
            sheetSemester = sheetSemester || parsed.semester || 1;
            break;
          }
        }
      }

      // ค้นหาแถว Header
      let headerRowIdx = -1;
      let colMap = null;

      for (let r = 0; r < Math.min(10, rows.length); r++) {
        const row = rows[r];
        if (!Array.isArray(row)) continue;

        const nonEmptyCells = row.filter(cell => String(cell).trim() !== "");
        if (nonEmptyCells.length < 2) continue;

        const currentMap = analyzeHeaderRow(row);

        // ต้องพบ title และ (index หรือ student หรือ advisor)
        if (
          currentMap.title !== -1 &&
          (currentMap.studentId !== -1 || currentMap.studentName !== -1 || currentMap.advisor !== -1 || currentMap.index !== -1)
        ) {
          headerRowIdx = r;
          colMap = currentMap;
          break;
        }
      }

      // ถ้าไม่พบ Header ให้ใช้ค่าเริ่มต้น
      if (headerRowIdx === -1 || !colMap) {
        headerRowIdx = 1;
        colMap = { index: 0, title: 1, studentId: 2, studentName: 3, students: 3, advisor: 4, coAdvisor: 5, multiStudents: [] };
      }

      // 4. จัดกลุ่มแถวข้อมูลเป็นโครงงาน (รองรับโครงงานที่มีนักศึกษาหลายคนในหลายแถว หรือในเซลล์เดียว)
      const parsedProjects = [];
      let currentProj = null;

      for (let r = headerRowIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!Array.isArray(row) || row.length === 0) continue;

        const rawIndex = colMap.index !== -1 ? String(row[colMap.index] || "").trim() : "";
        const rawTitle = colMap.title !== -1 ? String(row[colMap.title] || "").trim() : "";

        // ตรวจสอบแถวว่างหรือแถวหมายเหตุ/สรุปผล
        const fullRowText = row.join(" ").trim();
        if (!fullRowText) continue;

        if (
          rawTitle.startsWith("หมายเหตุ") ||
          rawTitle.startsWith("รวมทั้งสิ้น") ||
          rawTitle.startsWith("สรุป") ||
          fullRowText.startsWith("หมายเหตุ") ||
          fullRowText.startsWith("รวมทั้งสิ้น")
        ) {
          continue;
        }

        const rowStudents = extractStudentsFromRow(row, colMap);

        // แถวนี้เป็นโครงงานใหม่เมื่อ:
        // 1. มีชื่อโครงงาน (rawTitle !== "")
        // และ:
        //    a) ยังไม่มีโครงงานปัจจุบัน (currentProj === null)
        //    b) ชื่อโครงงานไม่ตรงกับโครงงานปัจจุบัน
        //    c) มีลำดับใหม่ (rawIndex) ที่ไม่ตรงกับลำดับปัจจุบัน
        const isNewProject = rawTitle !== "" && (
          !currentProj ||
          (rawTitle !== currentProj.title && (rawIndex === "" || rawIndex !== currentProj.index)) ||
          (rawIndex !== "" && currentProj.index !== "" && rawIndex !== currentProj.index)
        );

        if (isNewProject) {
          // บันทึกโครงงานก่อนหน้า
          if (currentProj && currentProj.title) {
            parsedProjects.push(currentProj);
          }

          const rawAdvisor = colMap.advisor !== -1 ? row[colMap.advisor] : "";
          const rawCoAdvisor = colMap.coAdvisor !== -1 ? row[colMap.coAdvisor] : "";

          currentProj = {
            index: rawIndex,
            title: rawTitle,
            advisorId: findLecturerId(rawAdvisor),
            coAdvisorId: findLecturerId(rawCoAdvisor),
            students: []
          };

          rowStudents.forEach(s => addStudentToProject(currentProj, s));
        } else if (currentProj) {
          // เป็นแถวข้อมูลต่อของโครงงานปัจจุบัน (เช่น นักศึกษาคนที่ 2, 3)
          rowStudents.forEach(s => addStudentToProject(currentProj, s));

          // ถ้าที่ปรึกษาในแถวแรกว่าง ให้ลองเอาจากแถวนี้
          if (!currentProj.advisorId && colMap.advisor !== -1 && row[colMap.advisor]) {
            currentProj.advisorId = findLecturerId(row[colMap.advisor]);
          }
          if (!currentProj.coAdvisorId && colMap.coAdvisor !== -1 && row[colMap.coAdvisor]) {
            currentProj.coAdvisorId = findLecturerId(row[colMap.coAdvisor]);
          }
        }
      }

      // เพิ่มโครงงานสุดท้าย
      if (currentProj && currentProj.title) {
        parsedProjects.push(currentProj);
      }

      // 5. บันทึกลงฐานข้อมูล (In-memory lookup เพื่อความรวดเร็วระดับวินาที)
      const existingList = await prisma.projects.findMany({
        where: {
          year: sheetYear || 2568,
          semester: sheetSemester || 1
        },
        select: { id: true, title_th: true, student_id: true, advisor_id: true, co_advisor_id: true }
      });
      const normalizeTitle = (str) => (str || "").trim().replace(/\s+/g, " ").toLowerCase();
      const existingMap = new Map();
      existingList.forEach(p => {
        if (p.title_th) existingMap.set(normalizeTitle(p.title_th), p);
      });

      // จัดการ Batch นักศึกษาสำหรับ Sheet นี้
      const neededStudentIds = new Set();
      const studentMetaMap = new Map();

      for (const proj of parsedProjects) {
        if (proj.students.length > 0) {
          const firstStudentStr = proj.students[0];
          const idMatch = firstStudentStr.match(/(\d{10,13})/);
          if (idMatch) {
            const stuId = idMatch[1];
            neededStudentIds.add(stuId);
            if (!studentCache.has(stuId)) {
              const nameWithoutId = firstStudentStr.replace(/\(\d+\)/, "").trim();
              const parts = nameWithoutId.split(/\s+/);
              const firstname = parts[0] || "นักศึกษา";
              const lastname = parts.slice(1).join(" ") || "";
              studentMetaMap.set(stuId, { firstname, lastname });
            }
          }
        }
      }

      const idsToFetch = Array.from(neededStudentIds).filter(id => !studentCache.has(id));
      if (idsToFetch.length > 0) {
        try {
          const foundStudents = await prisma.students.findMany({
            where: { student_id: { in: idsToFetch } },
            select: { id: true, student_id: true }
          });
          foundStudents.forEach(s => studentCache.set(s.student_id, s.id));

          const uncreatedIds = idsToFetch.filter(id => !studentCache.has(id));
          if (uncreatedIds.length > 0) {
            const createData = uncreatedIds.map(id => {
              const meta = studentMetaMap.get(id) || { firstname: "นักศึกษา", lastname: "" };
              return {
                student_id: id,
                title: "นาย/นางสาว",
                firstname: meta.firstname,
                lastname: meta.lastname
              };
            });
            await prisma.students.createMany({
              data: createData,
              skipDuplicates: true
            });
            const newlyCreated = await prisma.students.findMany({
              where: { student_id: { in: uncreatedIds } },
              select: { id: true, student_id: true }
            });
            newlyCreated.forEach(s => studentCache.set(s.student_id, s.id));
          }
        } catch (e) {
          console.error("Batch load students error:", e);
        }
      }

      // บันทึก/อัปเดตโครงงานแบบ Concurrency Chunks (ทีละ 15 โครงงานพร้อมกัน)
      let sheetCount = 0;
      const CHUNK_SIZE = 15;

      for (let i = 0; i < parsedProjects.length; i += CHUNK_SIZE) {
        const chunk = parsedProjects.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk.map(async (proj) => {
          const studentsText = proj.students.join("\n");
          let targetStudentId = null;
          if (proj.students.length > 0) {
            const idMatch = proj.students[0].match(/(\d{10,13})/);
            if (idMatch && studentCache.has(idMatch[1])) {
              targetStudentId = studentCache.get(idMatch[1]);
            }
          }

          try {
            const normKey = normalizeTitle(proj.title);
            const existing = existingMap.get(normKey);

            if (existing) {
              await prisma.projects.update({
                where: { id: existing.id },
                data: {
                  students_text: studentsText || null,
                  student_id: targetStudentId || existing.student_id,
                  advisor_id: proj.advisorId !== null ? proj.advisorId : existing.advisor_id,
                  co_advisor_id: proj.coAdvisorId !== null ? proj.coAdvisorId : existing.co_advisor_id
                }
              });
              totalUpdated++;
            } else {
              const created = await prisma.projects.create({
                data: {
                  title_th: proj.title,
                  year: sheetYear || 2568,
                  semester: sheetSemester || 1,
                  students_text: studentsText || null,
                  student_id: targetStudentId,
                  advisor_id: proj.advisorId,
                  co_advisor_id: proj.coAdvisorId
                }
              });
              existingMap.set(normKey, created);
              totalCreated++;
            }
            sheetCount++;
          } catch (err) {
            console.error(`Error saving project "${proj.title}":`, err);
            errorDetails.push(`Sheet ${sheetName} หัวข้อ "${proj.title}": ${err.message}`);
          }
        }));
      }

      if (sheetCount > 0) {
        sheetsProcessed.push({
          sheetName,
          semester: sheetSemester || 1,
          year: sheetYear || 2568,
          count: sheetCount
        });
      }
    }

    const totalProcessed = totalCreated + totalUpdated;
    res.json({
      message: `ประมวลผลโครงงานสำเร็จทั้งหมด ${totalProcessed} รายการ (เพิ่มใหม่ ${totalCreated} รายการ, อัปเดต ${totalUpdated} รายการ)`,
      totalImported: totalProcessed,
      totalCreated,
      totalUpdated,
      sheets: sheetsProcessed,
      errors: errorDetails.length > 0 ? errorDetails : undefined
    });
  } catch (error) {
    console.error("Import projects excel error:", error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการประมวลผลไฟล์ Excel: " + error.message });
  }
};

// 📤 Download Project Excel Template
export const downloadProjectTemplate = async (req, res) => {
  try {
    const wb = XLSX.utils.book_new();

    // ข้อมูลตัวอย่างสำหรับ Sheet 1-2566 (รองรับทั้งแบบแถวแยกและคอลัมน์รหัส)
    const sampleData1 = [
      ["ผลสอบหัวข้อโครงงานพิเศษ ภาคการศึกษาที่ 1/2566"],
      ["ลำดับ", "ชื่อหัวข้อ", "รหัสนักศึกษา", "ชื่อ-นามสกุล", "ที่ปรึกษาหลัก", "ที่ปรึกษาร่วม"],
      [1, "มูไปด้วยกัน โมดูล 1 : ระบบจัดการการท่องเที่ยว", "6504062610001", "นายภัทรกร กิตติวรปัญญา", "SWK", ""],
      ["", "", "6504062610002", "นายกฤติน พรหม สิรินิมิต", "", ""],
      [2, "ระบบแปลอักษรล้านนาจากใบลานเป็นอักษรไทย", "6504062620003", "นางสาวจุฑามณี ทัพทวี", "SRS", ""],
      ["", "", "6504062620004", "นายสุทธิพงษ์ สระแก้ว", "", ""],
      [3, "การพัฒนาเว็บแอปพลิเคชันสำหรับคลินิก", "6504062630005", "นางสาวศิริญญา คอนพังโคน", "TSR", "NJR"],
      ["", "", "6504062630006", "นางสาวศิริขวัญ ว่องวงศ์", "", ""]
    ];

    // ข้อมูลตัวอย่างสำหรับ Sheet 2-2566
    const sampleData2 = [
      ["ผลสอบหัวข้อโครงงานพิเศษ ภาคการศึกษาที่ 2/2566"],
      ["ลำดับ", "ชื่อหัวข้อ", "รหัสนักศึกษา", "ชื่อ-นามสกุล", "ที่ปรึกษาหลัก", "ที่ปรึกษาร่วม"],
      [1, "ระบบวิเคราะห์พฤติกรรมการเข้าชมเว็บไซต์ภาควิชา", "6504062640007", "นายสมคิด ขยันยิ่ง", "SWK", "TSR"],
      ["", "", "6504062640008", "นายวิชัย ใจสู้", "", ""],
      [2, "โมบายแอปพลิเคชันค้นหาเอกสารหลักสูตร", "6504062650009", "นางสาววารุณี มีสุข", "SRS", ""]
    ];

    const ws1 = XLSX.utils.aoa_to_sheet(sampleData1);
    const ws2 = XLSX.utils.aoa_to_sheet(sampleData2);

    // Merge เซลล์ตัวอย่าง
    ws1["!merges"] = [
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
      { s: { r: 2, c: 4 }, e: { r: 3, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 3, c: 5 } },
      { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } },
      { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } },
      { s: { r: 4, c: 4 }, e: { r: 5, c: 4 } },
      { s: { r: 4, c: 5 }, e: { r: 5, c: 5 } },
      { s: { r: 6, c: 0 }, e: { r: 7, c: 0 } },
      { s: { r: 6, c: 1 }, e: { r: 7, c: 1 } },
      { s: { r: 6, c: 4 }, e: { r: 7, c: 4 } },
      { s: { r: 6, c: 5 }, e: { r: 7, c: 5 } }
    ];

    ws2["!merges"] = [
      { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
      { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
      { s: { r: 2, c: 4 }, e: { r: 3, c: 4 } },
      { s: { r: 2, c: 5 }, e: { r: 3, c: 5 } }
    ];

    // กำหนดความกว้างคอลัมน์
    ws1["!cols"] = [
      { wch: 8 },  // ลำดับ
      { wch: 55 }, // ชื่อหัวข้อ
      { wch: 18 }, // รหัสนักศึกษา
      { wch: 30 }, // ชื่อ-นามสกุล
      { wch: 15 }, // ที่ปรึกษาหลัก
      { wch: 15 }  // ที่ปรึกษาร่วม
    ];

    ws2["!cols"] = ws1["!cols"];

    XLSX.utils.book_append_sheet(wb, ws1, "1-2566");
    XLSX.utils.book_append_sheet(wb, ws2, "2-2566");

    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", 'attachment; filename="student_projects_template.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (error) {
    console.error("Download template error:", error);
    res.status(500).json({ error: "Failed to generate Excel template" });
  }
};