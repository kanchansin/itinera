import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./src/config/database.js"
import authRoutes from "./src/routes/auth.js"
import tripRoutes from "./src/routes/trips.js"
import userRoutes from "./src/routes/users.js"
import destinationRoutes from "./src/routes/destinations.js"
import tripInteractionRoutes from "./src/routes/trip-interactions.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Database Connection
connectDB()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/trips", tripRoutes)
app.use("/api/users", userRoutes)
app.use("/api/destinations", destinationRoutes)
app.use("/api/interactions", tripInteractionRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
