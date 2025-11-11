import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export const connectDB = async () => {
  try {
    const res = await pool.query("SELECT NOW()")
    console.log("Database connected:", res.rows[0])
  } catch (err) {
    console.error("Database connection error:", err)
    process.exit(1)
  }
}

export default pool
