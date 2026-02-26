import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import usersRoutes from "./routes/users.routes.js";
import newsRoutes from "./routes/news.routes.js";
import faqRoutes from "./routes/faq.routes.js";

const app = express();

app.use(cors());
app.use(express.json());




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


export default app;
