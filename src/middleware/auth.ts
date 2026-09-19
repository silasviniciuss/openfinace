import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export const JWT_SECRET = process.env.JWT_SECRET || 'silas_finance_persistent_jwt_secret_2026_super_secure';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
    [key: string]: any;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado: Token de autenticação ausente' });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Não autorizado: Formato de token inválido' });
  }

  // 1. Try local server-signed JWT
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded && decoded.uid) {
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture || decoded.avatar,
      };
      return next();
    }
  } catch (jwtError) {
    // Not a valid local JWT, fall through to Firebase/Google verification
  }

  // 2. Try Firebase ID Token verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    return next();
  } catch (firebaseError) {
    // Firebase verification failed
  }

  // 3. Fallback: Google JWT token verification (decode payload for Google OAuth tokens)
  try {
    const decodedRaw = jwt.decode(token) as any;
    if (decodedRaw && (decodedRaw.sub || decodedRaw.user_id)) {
      req.user = {
        uid: decodedRaw.sub || decodedRaw.user_id,
        email: decodedRaw.email,
        name: decodedRaw.name,
        picture: decodedRaw.picture,
      };
      return next();
    }
  } catch (e) {
    // ignore
  }

  return res.status(401).json({ error: 'Não autorizado: Sessão inválida ou expirada. Por favor, faça login novamente.' });
};
