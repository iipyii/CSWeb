import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "csweb_db",
  port: process.env.DB_PORT || 5433,
});

pool.on("connect", () => {
  console.log("✅ PostgreSQL connected");
});

export default pool;
