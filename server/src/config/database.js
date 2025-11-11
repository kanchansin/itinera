import admin from "firebase-admin"
import dotenv from "dotenv"

dotenv.config()

let db

export const connectDB = async () => {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: "3a7afaead83aa8850ce3bf561f2d453002d4f962",
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: "107145288276419029769",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40travel-app-108.iam.gserviceaccount.com",
      universe_domain: "googleapis.com",
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || undefined,
    })

    db = admin.firestore()
    console.log("Firestore connected successfully at", new Date().toISOString())
  } catch (err) {
    console.error("Firestore connection error:", err)
    process.exit(1)
  }
}

export const getDB = () => {
  if (!db) {
    throw new Error("Firestore not initialized. Call connectDB first.")
  }
  return db
}

export default db
