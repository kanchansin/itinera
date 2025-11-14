import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import { connectDB } from "./src/config/database.js"
import authRoutes from "./src/routes/auth.js"
import tripRoutes from "./src/routes/trips.js"
import userRoutes from "./src/routes/users.js"
import destinationRoutes from "./src/routes/destinations.js"
import tripInteractionRoutes from "./src/routes/trip-interactions.js"
import aiRoutes from "./src/routes/ai.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

console.log('[STARTUP] Loading environment from:', path.join(__dirname, '.env'))
console.log('[STARTUP] FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID)
console.log('[STARTUP] JWT_SECRET exists:', !!process.env.JWT_SECRET)

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  if (Object.keys(req.body).length > 0) {
    console.log("Request body:", JSON.stringify(req.body, null, 2))
  }
  next()
})

async function startServer() {
  try {
    await connectDB()
    
    app.use("/api/auth", authRoutes)
    app.use("/api/trips", tripRoutes)
    app.use("/api/users", userRoutes)
    app.use("/api/destinations", destinationRoutes)
    app.use("/api/interactions", tripInteractionRoutes)
    app.use("/api/ai", aiRoutes)

    app.get("/api/health", (req, res) => {
      console.log('[HEALTH] Health check requested')
      res.json({ status: "Server is running", timestamp: new Date().toISOString() })
    })

    app.use((err, req, res, next) => {
      console.error('[ERROR] Unhandled error:', err.message)
      console.error('[ERROR] Stack:', err.stack)
      res.status(500).json({ 
        error: err.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      })
    })

    app.listen(PORT, () => {
      console.log(`========================================`)
      console.log(`Server started successfully`)
      console.log(`Running on http://localhost:${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
      console.log(`JWT_SECRET configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`)
      console.log(`Firebase configured: ${process.env.FIREBASE_PROJECT_ID ? 'Yes' : 'No'}`)
      console.log(`========================================`)
    })
  } catch (err) {
    console.error('[SERVER] Failed to start server:', err.message)
    console.error('[SERVER] Full error:', err)
    process.exit(1)
  }
}

startServer()
