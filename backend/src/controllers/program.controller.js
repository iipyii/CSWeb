import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getProgramBySlugYear = async (req, res) => {

  const { slug, year } = req.params

  try {

    const program = await prisma.programs.findFirst({
      where: { slug },
      include: {
        versions: {
          where: { year: parseInt(year) },
          include: {
            sections: {
              orderBy: { order_index: "asc" }
            }
          }
        }
      }
    })

    if (!program) {
      return res.status(404).json({ message: "program not found" })
    }

    res.json(program)

  } catch (err) {
    res.status(500).json(err)
  }

}