import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AppDatabase } from '../db/database.js';
import { UserRecord, UserRole } from '../db/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supplyright_fintechathon_2026_super_secret_jwt_key_998877';

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  companyName: string;
  walletAddress: string;
}

export function generateToken(user: UserRecord): string {
  const payload: AuthTokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    companyName: user.company_name,
    walletAddress: user.wallet_address
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Guest/unauthenticated, individual route can enforce
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (payload) {
    req.user = payload;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    // Judge has global access
    if (req.user.role === 'JUDGE' || allowedRoles.includes(req.user.role)) {
      return next();
    }
    res.status(403).json({
      error: `Access denied. Action requires one of roles: ${allowedRoles.join(', ')}. Active role is ${req.user.role}.`
    });
  };
}
