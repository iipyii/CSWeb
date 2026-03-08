import express from "express"
import { getSectionById } from "../controllers/programSection.controller.js"

const router = express.Router()

router.get("/:id", getSectionById)

export default router