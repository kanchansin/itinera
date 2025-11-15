import jwt from "jsonwebtoken"
import admin from "firebase-admin"

export const verifyToken = (req, res, next) => {
  console.log('[AUTH MIDDLEWARE] Verifying token for route:', req.path);
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('[AUTH MIDDLEWARE] Error: No authorization header');
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    console.log('[AUTH MIDDLEWARE] Error: No token in authorization header');
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    console.log('[AUTH MIDDLEWARE] Verifying JWT token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH MIDDLEWARE] Token verified for user ID:', decoded.userId);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE] Token verification failed:', err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
}

export const verifyFirebaseToken = async (req, res, next) => {
  console.log('[FIREBASE MIDDLEWARE] Verifying Firebase token for route:', req.path);
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.log('[FIREBASE MIDDLEWARE] Error: No authorization header');
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    console.log('[FIREBASE MIDDLEWARE] Error: No token in authorization header');
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    console.log('[FIREBASE MIDDLEWARE] Verifying Firebase ID token');
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('[FIREBASE MIDDLEWARE] Token verified for Firebase UID:', decodedToken.uid);
    req.user = { userId: decodedToken.uid, firebaseUid: decodedToken.uid };
    next();
  } catch (err) {
    console.error('[FIREBASE MIDDLEWARE] Token verification failed:', err.message);
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
}