import { prisma } from "../lib/prisma.js";



export const getProgramBySlugYear = async (req, res) => {

  const { slug, year } = req.params

  try {

    const program = await prisma.programs.findFirst({
      where: { slug },
      include: {
        curriculums: {
          where: { year: parseInt(year) },
          include: {
            courses: {
              where: { is_active: true },
              orderBy: { order_index: "asc" }
            }
          }
        }
      }
    })

    if (!program) {
      return res.status(404).json({ message: "program not found" })
    }

    // เก็บ response shape เดิม (versions[].sections[]) ไว้ให้ frontend ไม่ต้องแก้
    const { curriculums, ...rest } = program
    res.json({
      ...rest,
      versions: curriculums.map(({ courses, ...c }) => ({ ...c, sections: courses }))
    })

  } catch (err) {
    res.status(500).json(err)
  }

}