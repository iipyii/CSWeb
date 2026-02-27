import express from "express";
import { getAllUsers } from "../controllers/users.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", checkRole(["admin"]), getAllUsers);

export default router;
