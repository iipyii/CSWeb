import express from "express";
import multer from "multer";
import { 
  getAllProjects, 
  getProjectById,
  createProject, 
  updateProject, 
  deleteProject,
  importProjectsExcel,
  downloadProjectTemplate
} from "../controllers/projects.controller.js";

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.get("/template", downloadProjectTemplate);
router.post("/import-excel", upload.single("file"), importProjectsExcel);
router.get("/", getAllProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;