import { prisma } from "../lib/prisma.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: { id: true, email: true, full_name: true, role: true, created_at: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // เช่น "admin", "lecturer"
    
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: { role }
    });
    
    res.json({ message: "อัปเดตสิทธิ์สำเร็จ", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update role" });
  }
};