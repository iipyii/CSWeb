import express from "express";
import { getAllUsers, createUser, updateUserRole, deleteUser } from "../controllers/users.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถจัดการผู้ใช้งานและสิทธิ์ได้
router.use(verifyToken, checkRole(["admin"]));

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;