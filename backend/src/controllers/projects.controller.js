import { prisma } from "../lib/prisma.js";

export const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.projects.findMany({
      include: {
        project_members: {
          include: {
            student: { select: { firstname: true, lastname: true, student_id: true } }
          }
        },
        advisor: { select: { fullname_th: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title_th, title_en, abstract, year, image_path, document_url, github_url, student_id, student_ids, advisor_id } = req.body;

    const memberIds = Array.isArray(student_ids)
      ? student_ids
      : student_id
        ? [student_id]
        : [];

    const newProject = await prisma.projects.create({
      data: {
        title_th, title_en, abstract, image_path, document_url, github_url,
        year: parseInt(year),
        advisor_id: parseInt(advisor_id),
        project_members: {
          create: memberIds.map((id) => ({ student_id: parseInt(id) }))
        }
      }
    });
    res.status(201).json({ message: "สร้างโปรเจกต์สำเร็จ", data: newProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create project" });
  }
};
