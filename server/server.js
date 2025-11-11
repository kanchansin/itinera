import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./src/config/database.js"
import authRoutes from "./src/routes/auth.js"
import tripRoutes from "./src/routes/trips.js"
import userRoutes from "./src/routes/users.js"
import destinationRoutes from "./src/routes/destinations.js"
import tripInteractionRoutes from "./src/routes/trip-interactions.js"
import aiRoutes from "./src/routes/ai.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

connectDB()

app.use("/api/auth", authRoutes)
app.use("/api/trips", tripRoutes)
app.use("/api/users", userRoutes)
app.use("/api/destinations", destinationRoutes)
app.use("/api/interactions", tripInteractionRoutes)
app.use("/api/ai", aiRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" })
})

app.listen(PORT, () => {
  console.log(`========================================`)
  console.log(`Server started successfully`)
  console.log(`Running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`========================================`)
})
