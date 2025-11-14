import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
  console.log('[AUTH MIDDLEWARE] Verifying token for route:', req.path);
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    console.log('[AUTH MIDDLEWARE] Error: No token provided');
    return res.status(401).json({ error: "No token provided" })
  }

  try {
    console.log('[AUTH MIDDLEWARE] Verifying JWT token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log('[AUTH MIDDLEWARE] Token verified for user ID:', decoded.userId);
    req.user = decoded
    next()
  } catch (err) {
    console.error('[AUTH MIDDLEWARE] Token verification failed:', err.message);
    return res.status(403).json({ error: "Invalid token" })
  }
}
