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

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    req.user = { 
        id: 2, 
        email: "admin@csweb.com", 
        role: "admin", 
    };
    next();
});

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

export default app;
