import express from "express";
import {
  getActiveFAQ,
  getAllFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from "../controllers/faq.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", getActiveFAQ);
router.get("/all", checkRole(["admin"]), getAllFAQ);
router.post("/", checkRole(["admin"]), createFAQ);
router.put("/:id", checkRole(["admin"]), updateFAQ);
router.delete("/:id", checkRole(["admin"]), deleteFAQ);

export default router;