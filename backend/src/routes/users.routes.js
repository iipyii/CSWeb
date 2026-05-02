import express from "express";
import { getAllUsers, updateUserRole } from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.put("/:id/role", updateUserRole); // เปลี่ยน Role

export default router;