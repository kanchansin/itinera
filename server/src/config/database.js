import admin from "firebase-admin"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '../../.env')

dotenv.config({ path: envPath })
console.log('[DATABASE CONFIG] Loading env from:', envPath)

let db = null
let isConnecting = false
let connectPromise = null

export const connectDB = async () => {
  if (db) {
    console.log("[DATABASE] Already connected to Firestore")
    return db
  }
  
  if (isConnecting) {
    console.log("[DATABASE] Connection in progress, waiting...")
    return connectPromise
  }
  
  isConnecting = true
  connectPromise = new Promise((resolve, reject) => {
    try {
      console.log("[DATABASE] Initializing Firebase connection...")
      console.log("[DATABASE] Project ID:", process.env.FIREBASE_PROJECT_ID)
      console.log("[DATABASE] Client Email:", process.env.FIREBASE_CLIENT_EMAIL)
      
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY is not set in environment variables")
      }
      
      if (privateKey.startsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      
      privateKey = privateKey.replace(/\\n/g, "\n");
      
      console.log("[DATABASE] Private key loaded:", privateKey ? "Yes" : "No")
      
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: "3a7afaead83aa8850ce3bf561f2d453002d4f962",
        private_key: privateKey,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: "107145288276419029769",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40travel-app-108.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
      }

      console.log("[DATABASE] Service account object created")
      console.log("[DATABASE] Checking required fields...")
      if (!serviceAccount.project_id) throw new Error("project_id is missing")
      if (!serviceAccount.private_key) throw new Error("private_key is missing")
      if (!serviceAccount.client_email) throw new Error("client_email is missing")
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
      })

      db = admin.firestore()
      console.log("[DATABASE] Firebase initialized successfully")
      console.log("[DATABASE] Firestore connected at", new Date().toISOString())
      resolve(db)
    } catch (err) {
      console.error("[DATABASE] Connection error:", err.message)
      console.error("[DATABASE] Full error:", err)
      isConnecting = false
      reject(err)
    }
  })
  
  return connectPromise
}

export const getDB = () => {
  if (!db) {
    throw new Error("Firestore not initialized. Call connectDB first.")
  }
  return db
}

export default db
