import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import usersRoutes from "./routes/users.routes.js";

const app = express();

app.use(cors());
app.use(express.json());




app.use((req, res, next) => {
    req.user = { 
        id: 1, 
        email: "admin@csweb.com", 
        role: "lecturer", 
    };
    next();
});

app.use("/api/users", usersRoutes);

export default app;
