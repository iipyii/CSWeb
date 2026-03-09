import express from "express";

import { globalSearch } from "../controllers/search.controller.js";

const router = express.Router();


// http://localhost:5000/api/search?q=คำค้นหา
router.get("/", globalSearch);

export default router;