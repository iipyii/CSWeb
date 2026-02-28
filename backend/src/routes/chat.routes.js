import express from "express";
import { chatWithAI } from "../controllers/chat.controller.js";
import { updateFaqVectors } from '../controllers/chat.controller.js';

const router = express.Router();

router.post("/", chatWithAI);
router.post('/update-vectors', updateFaqVectors);

export default router;