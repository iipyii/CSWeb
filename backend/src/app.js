import express from "express";
import cors from "cors";
import path from "path";
import usersRoutes from "./routes/users.routes.js";
import newsRoutes from "./routes/news.routes.js";
import faqRoutes from "./routes/faq.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import lecturersRoutes from "./routes/lecturers.routes.js";
import downloadsRoutes from "./routes/downloads.routes.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import programRoutes from "./routes/program.routes.js"
import programSectionRoutes from "./routes/programSection.routes.js"
import consultRoutes from "./routes/consult.routes.js";
import internshipsRoutes from "./routes/internships.routes.js";
import subjectcoursesRoutes from "./routes/subjectcourses.routes.js";
import searchRoutes from "./routes/search.routes.js";
import appearanceRoutes from './routes/appearance.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import curriculumRoutes from './routes/curriculum.routes.js';
import adminRoutes from './routes/admin.routes.js';
import subjectsRoutes from './routes/subjects.routes.js';
import handbookRoutes from './routes/handbook.routes.js';
import aboutRoutes from './routes/about.routes.js';
import personnelLinksRoutes from './routes/personnel-links.routes.js';
import studentGuidesRoutes from './routes/student-guides.routes.js';
import studentLinksRoutes from './routes/student-links.routes.js';


const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// if (process.env.NODE_ENV === "development") {
//   app.use((req, res, next) => {
//     req.user = {
//       id: 2,
//       email: "admin@csweb.com",
//       role: "admin",
//     };
//     next();
//   });
// }

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
app.use("/downloads", express.static(path.join(process.cwd(), "uploads/downloads")));

app.use("/api/news", newsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/lecturers", lecturersRoutes);
app.set("json spaces", 2);
app.use("/api/downloads", downloadsRoutes);
app.use("/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/program-sections", programSectionRoutes);
app.use("/api/consult", consultRoutes);
app.use("/api/internships", internshipsRoutes);
app.use("/api/courses", subjectcoursesRoutes);
app.use("/api/search", searchRoutes);
app.use('/api/appearance', appearanceRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/handbooks', handbookRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/personnel-links', personnelLinksRoutes);
app.use('/api/student-guides', studentGuidesRoutes);
app.use('/api/student-links', studentLinksRoutes);

export default app;

