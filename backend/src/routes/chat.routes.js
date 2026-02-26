import express from "express";
import { chatWithAI } from "../controllers/chat.controller.js";
console.log("CHAT ROUTE LOADED");
const router = express.Router();

router.post("/", chatWithAI);

export default router;