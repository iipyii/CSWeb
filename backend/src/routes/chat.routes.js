import express from "express";
import { chatWithAI } from "../controllers/chat.controller.js";
import { updateFaqVectors } from '../controllers/chat.controller.js';


console.log("CHAT ROUTE LOADED");
const router = express.Router();

router.post("/", chatWithAI);
router.get('/update-vectors', updateFaqVectors);

export default router;