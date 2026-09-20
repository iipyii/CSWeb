import express from "express";
import { 
  chatWithAI, 
  updateFaqVectors, 
  getChatSettings, 
  updateChatSettings 
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", chatWithAI);
router.post('/update-vectors', updateFaqVectors);
router.get("/settings", getChatSettings);
router.post("/settings", updateChatSettings);

export default router;