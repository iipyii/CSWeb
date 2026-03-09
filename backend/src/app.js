import express from "express";
import cors from "cors";

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

app.use("/api/news", newsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/lecturers", lecturersRoutes);
app.use('/uploads', express.static('uploads'));
app.set("json spaces", 2);
app.use("/api/downloads", downloadsRoutes);
app.use("/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/programs", programRoutes)
app.use("/api/program-sections", programSectionRoutes)
app.use("/api/consult", consultRoutes);
app.use("/api/internships", internshipsRoutes);
app.use("/api/courses", subjectcoursesRoutes);
app.use("/downloads", express.static("uploads/downloads"));

export default app;
