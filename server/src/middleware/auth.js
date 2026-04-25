import jwt from 'jsonwebtoken';
import prisma from '../db.js';

// Verifies the JWT and attaches the live user record to req.user.
// We re-fetch from the DB on every request (instead of trusting the JWT payload alone)
// so that a deleted or role-changed user is denied immediately without waiting for token expiry.
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT secret is not configured' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, secret);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach a minimal user object — never expose the password hash to route handlers
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    return next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Factory middleware — returns a route guard that allows only users whose role
// is in allowedRoles. Must run after authenticate() so req.user is populated.
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}

// Convenience wrapper around requireRole for the common admin-only case
export function authorizeAdmin(req, res, next) {
  return requireRole('ADMIN')(req, res, next);
}
