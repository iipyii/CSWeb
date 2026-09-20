import express from "express";
import {
  getActiveFAQ,
  getAllFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ
} from "../controllers/faq.controller.js";

const router = express.Router();

router.get("/", getActiveFAQ);
router.get("/all", getAllFAQ);
router.post("/", createFAQ);
router.put("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

export default router;