import express from "express"
import { getProgramBySlugYear } from "../controllers/program.controller.js"

const router = express.Router()

router.get("/:slug/:year", getProgramBySlugYear)

export default router