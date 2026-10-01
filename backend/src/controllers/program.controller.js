import { prisma } from "../lib/prisma.js";

// Legacy id to slug/year map for backwards compatibility
const legacyMap = {
  "cs-normal-2569": { slug: "regular", year: 2569, title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์", subtitle: "(หลักสูตรปรับปรุง พ.ศ. 2569)", level: "bachelor" },
  "cs-normal-2564": { slug: "regular", year: 2564, title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์", subtitle: "(หลักสูตรปรับปรุง พ.ศ. 2564)", level: "bachelor" },
  "cs-normal-2559": { slug: "regular", year: 2559, title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์", subtitle: "(หลักสูตรปรับปรุง พ.ศ. 2559)", level: "bachelor" },
  "cs-old-2554": { slug: "regular", year: 2554, title: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์", subtitle: "(หลักสูตรปรับปรุง พ.ศ. 2554)", level: "bachelor" },
  "cs-english-2564": { slug: "csb", year: 2564, title: "โครงการพิเศษ สองภาษา CSB", subtitle: "พ.ศ. 2564", level: "cs-english" },
  "cs-master-2567": { slug: "ComputerScience", year: 2567, title: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์", subtitle: "(หลักสูตรปรับปรุง พ.ศ. 2567)", level: "cs-master" },
  "cs-master-2562": { slug: "ComputerScience", year: 2562, title: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์", subtitle: "(หลักสูตรปรับปรุง พ.ศ. 2562)", level: "cs-master", isMain: true },
  "cs-master-edit-2562": { slug: "ComputerScience", year: 2562, title: "การปรับปรุงแก้ไขหลักสูตร", subtitle: "(หลักสูตรวิทยาศาสตรมหาบัณฑิตปี 2562)", level: "cs-master", isEdit: true },
  "se-master-2559": { slug: "SoftwareEngineering", year: 2559, title: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมซอฟต์แวร์", subtitle: "(หลักสูตรใหม่ พ.ศ. 2559)", level: "se-master", isMain: true },
  "se-master-edit-2559": { slug: "SoftwareEngineering", year: 2559, title: "การปรับปรุงแก้ไขหลักสูตรวิทยาศาสตรมหาบัณฑิตปี 2559", subtitle: "", level: "se-master", isEdit: true },
  "cs-phd-2564": { slug: "computersci", year: 2564, title: "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์", subtitle: "(หลักสูตรปรับปรุง พ.ศ. 2564)", level: "doctor" },
  "cs-phd-edit-2559": { slug: "computersci", year: 2559, title: "การปรับปรุงแก้ไขหลักสูตร ปรัชญาดุษฎีบัณฑิตปี 2559", subtitle: "", level: "doctor", isEdit: true },
};

export const getProgramBySlugYear = async (req, res) => {
  const { slug, year } = req.params;

  try {
    const program = await prisma.programs.findFirst({
      where: { slug },
      include: {
        degree: true,
        versions: {
          where: { year: parseInt(year) },
          include: {
            sections: {
              orderBy: { order_index: "asc" }
            }
          }
        }
      }
    });

    if (!program) {
      return res.status(404).json({ message: "program not found" });
    }

    res.json(program);
  } catch (err) {
    console.error("Get program by slug year error:", err);
    res.status(500).json(err);
  }
};

export const getProgramDetail = async (req, res) => {
  const { identifier } = req.params;

  try {
    // 1. If identifier is a numeric version ID
    if (/^\d+$/.test(identifier)) {
      const versionId = parseInt(identifier);
      const version = await prisma.program_versions.findUnique({
        where: { id: versionId },
        include: {
          program: { include: { degree: true } },
          sections: { orderBy: { order_index: "asc" } }
        }
      });

      if (!version) {
        return res.status(404).json({ error: "Program version not found" });
      }

      const p = version.program;
      return res.json({
        id: p.id,
        name_th: p.name_th,
        slug: p.slug,
        level: p.degree?.slug || "bachelor",
        year: version.year,
        title: p.name_th,
        subtitle: `พ.ศ. ${version.year}`,
        versions: [{
          id: version.id,
          year: version.year,
          pdf_url: version.pdf_url,
          sections: version.sections
        }]
      });
    }

    let slug = null;
    let year = null;
    let isEdit = false;
    let isMain = false;
    let customTitle = null;
    let customSubtitle = null;
    let customLevel = null;

    // 2. Check if in legacyMap
    if (legacyMap[identifier]) {
      const cfg = legacyMap[identifier];
      slug = cfg.slug;
      year = cfg.year;
      isEdit = Boolean(cfg.isEdit);
      isMain = Boolean(cfg.isMain);
      customTitle = cfg.title;
      customSubtitle = cfg.subtitle;
      customLevel = cfg.level;
    } else {
      // 3. Try parsing slug-year or slug-edit-year
      const editMatch = identifier.match(/^(.+)-edit-(\d{4})$/);
      if (editMatch) {
        slug = editMatch[1];
        year = parseInt(editMatch[2]);
        isEdit = true;
      } else {
        const standardMatch = identifier.match(/^(.+)-(\d{4})$/);
        if (standardMatch) {
          slug = standardMatch[1];
          year = parseInt(standardMatch[2]);
        }
      }
    }

    if (!slug || !year) {
      return res.status(404).json({ error: "Invalid course identifier" });
    }

    const program = await prisma.programs.findFirst({
      where: { slug },
      include: {
        degree: true,
        versions: {
          where: { year },
          include: {
            sections: {
              orderBy: { order_index: "asc" }
            }
          }
        }
      }
    });

    if (!program || !program.versions || program.versions.length === 0) {
      return res.status(404).json({ error: "Course not found in database" });
    }

    const version = program.versions[0];
    const rawSections = version.sections || [];
    let filteredSections = rawSections;

    if (isEdit) {
      filteredSections = rawSections.filter(s => s.order_index === 88);
      if (filteredSections.length === 0) filteredSections = rawSections;
    } else if (isMain) {
      filteredSections = rawSections.filter(s => s.order_index !== 88);
    }

    res.json({
      ...program,
      title: customTitle || program.name_th,
      subtitle: customSubtitle !== null ? customSubtitle : `(พ.ศ. ${version.year})`,
      level: customLevel || program.degree?.slug || "bachelor",
      year: version.year,
      versions: [
        {
          ...version,
          sections: filteredSections
        }
      ]
    });
  } catch (error) {
    console.error("Resolve program detail error:", error);
    res.status(500).json({ error: "Failed to resolve program detail" });
  }
};