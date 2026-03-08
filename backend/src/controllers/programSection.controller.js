import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getSectionById = async (req, res) => {

  try {

    const id = parseInt(req.params.id)

    const section = await prisma.program_sections.findUnique({
      where: { id }
    })

    if (!section) {
      return res.status(404).json({ message: "section not found" })
    }

    res.json(section)

  } catch (err) {
    res.status(500).json(err)
  }

}