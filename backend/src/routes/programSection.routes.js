import express from "express"
import { getSectionById } from "../controllers/programSection.controller.js"
import { searchCourses } from "../controllers/programSection.controller.js"

const router = express.Router()

router.get("/search-courses", searchCourses)

router.get("/:id", getSectionById)

export default router