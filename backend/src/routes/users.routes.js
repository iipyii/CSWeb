import express from "express";
import { getAllUsers, createUser, updateUserRole, deleteUser } from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;