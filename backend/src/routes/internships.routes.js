import express from "express";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Default evaluation criteria
const defaultEvaluation = [
  { title: "ระเบียบวินัย", score: 20 },
  { title: "พฤติกรรมในการปฏิบัติงาน", score: 20 },
  { title: "ผลงาน", score: 20 },
  { title: "วิธีการปฏิบัติงาน", score: 20 },
  { title: "มนุษย์สัมพันธ์", score: 20 }
];

// Default external links
const defaultLinks = {
  docsUrl: "https://drive.google.com/drive/mobile/folders/1FgrgA1v6hOujVkCUFFtfEHV5cOmofhGK?usp=drive_link",
  placesUrl: "https://docs.google.com/spreadsheets/d/1tguBraKR6NkJRQJkZuBtu5KsPsW5CDj8taq536B1t1Y/htmlview"
};

// GET all internship items
router.get("/", async (req, res) => {
  try {
    const data = await prisma.internships.findMany({
      orderBy: { id: "asc" }
    });
    res.json(data);
  } catch (error) {
    console.error("Fetch internships error:", error);
    res.status(500).json({ error: "Failed to fetch internship records" });
  }
});

// GET external links & evaluation config
router.get("/config", async (req, res) => {
  try {
    const [linksConfig, evalConfig] = await Promise.all([
      prisma.site_config.findUnique({ where: { config_key: "internship_links" } }),
      prisma.site_config.findUnique({ where: { config_key: "internship_evaluation" } })
    ]);

    let links = defaultLinks;
    if (linksConfig && linksConfig.config_value) {
      try { links = JSON.parse(linksConfig.config_value); } catch (e) {}
    }

    let evaluation = {
      items: defaultEvaluation,
      note: "นิสิตจะไม่ผ่านการฝึกงานในกรณีดังต่อไปนี้: คะแนนประเมินรวมจากสถานประกอบการทั้งหมด ได้น้อยกว่า 70 คะแนน"
    };
    if (evalConfig && evalConfig.config_value) {
      try { 
        const parsed = JSON.parse(evalConfig.config_value);
        if (parsed.items) evaluation.items = parsed.items;
        if (parsed.note) evaluation.note = parsed.note;
      } catch (e) {}
    }

    res.json({ links, evaluation });
  } catch (error) {
    console.error("Fetch internship config error:", error);
    res.status(500).json({ error: "Failed to fetch internship configuration" });
  }
});

// POST save external links
router.post("/links", verifyToken, checkRole(["admin", "lecturer"]), async (req, res) => {
  try {
    const { docsUrl, placesUrl } = req.body;
    const configData = { docsUrl: docsUrl || "", placesUrl: placesUrl || "" };

    await prisma.site_config.upsert({
      where: { config_key: "internship_links" },
      update: { config_value: JSON.stringify(configData), description: "Internship external drive and sheets links" },
      create: { config_key: "internship_links", config_value: JSON.stringify(configData), description: "Internship external drive and sheets links" }
    });

    res.json({ message: "บันทึกลิงก์เอกสารการฝึกงานสำเร็จ", links: configData });
  } catch (error) {
    console.error("Update internship links error:", error);
    res.status(500).json({ error: "Failed to update internship links" });
  }
});

// POST save evaluation criteria
router.post("/evaluation", verifyToken, checkRole(["admin", "lecturer"]), async (req, res) => {
  try {
    const { items, note } = req.body;
    const configData = {
      items: Array.isArray(items) ? items : defaultEvaluation,
      note: note || "นิสิตจะไม่ผ่านการฝึกงานในกรณีดังต่อไปนี้: คะแนนประเมินรวมจากสถานประกอบการทั้งหมด ได้น้อยกว่า 70 คะแนน"
    };

    await prisma.site_config.upsert({
      where: { config_key: "internship_evaluation" },
      update: { config_value: JSON.stringify(configData), description: "Internship evaluation criteria and score threshold" },
      create: { config_key: "internship_evaluation", config_value: JSON.stringify(configData), description: "Internship evaluation criteria and score threshold" }
    });

    res.json({ message: "บันทึกเกณฑ์การประเมินสำเร็จ", evaluation: configData });
  } catch (error) {
    console.error("Update internship evaluation error:", error);
    res.status(500).json({ error: "Failed to update internship evaluation" });
  }
});

// POST create single item
router.post("/item", verifyToken, checkRole(["admin", "lecturer"]), async (req, res) => {
  try {
    const { section, title, content } = req.body;
    if (!section || !content) {
      return res.status(400).json({ error: "กรุณากรอกข้อมูลหมวดหมู่และเนื้อหาให้ครบถ้วน" });
    }

    const item = await prisma.internships.create({
      data: {
        section: section.trim(),
        title: title ? title.trim() : "",
        content: content.trim()
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Create internship item error:", error);
    res.status(500).json({ error: "Failed to create internship item" });
  }
});

// PUT update single item
router.put("/item/:id", verifyToken, checkRole(["admin", "lecturer"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { section, title, content } = req.body;

    const item = await prisma.internships.update({
      where: { id: parseInt(id) },
      data: {
        section: section ? section.trim() : undefined,
        title: title !== undefined ? title.trim() : undefined,
        content: content ? content.trim() : undefined
      }
    });

    res.json(item);
  } catch (error) {
    console.error("Update internship item error:", error);
    res.status(500).json({ error: "Failed to update internship item" });
  }
});

// DELETE single item
router.delete("/item/:id", verifyToken, checkRole(["admin", "lecturer"]), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.internships.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "ลบข้อมูลสำเร็จ" });
  } catch (error) {
    console.error("Delete internship item error:", error);
    res.status(500).json({ error: "Failed to delete internship item" });
  }
});

export default router;