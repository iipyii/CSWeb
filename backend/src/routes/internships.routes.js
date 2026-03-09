import express from "express";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await prisma.internships.findMany();
  res.json(data);
});

export default router;