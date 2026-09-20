import { prisma } from "../lib/prisma.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      select: { id: true, email: true, full_name: true, role: true, created_at: true },
      orderBy: { id: "asc" }
    });
    res.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, full_name, role } = req.body;
    if (!email || !full_name) {
      return res.status(400).json({ error: "Email and full name are required" });
    }

    const newUser = await prisma.users.create({
      data: {
        email,
        full_name,
        role: role || "lecturer"
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // e.g. "admin", "lecturer"
    
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: { role }
    });
    
    res.json({ message: "อัปเดตสิทธิ์สำเร็จ", user: updatedUser });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.users.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "ลบผู้ใช้สำเร็จ" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};