import express from "express";
import { getBanners, createBanner, getSiteConfig, updateSiteConfig } from "../controllers/appearance.controller.js";

const router = express.Router();

router.get("/banners", getBanners);
router.post("/banners", createBanner);

router.get("/settings", getSiteConfig);
router.post("/settings", updateSiteConfig);

export default router;