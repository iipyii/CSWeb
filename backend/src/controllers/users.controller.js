import { prisma } from "../lib/prisma.js";

export const getAllUsers = async (req, res) => {
    try {
    const users = await prisma.users.findMany({
      orderBy: {
        id: "asc",
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }  
};