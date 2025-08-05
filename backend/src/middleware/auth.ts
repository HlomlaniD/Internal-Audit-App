import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../config/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Get user from database to ensure they still exist and are active
    const user = await db('users')
      .select('id', 'email', 'role', 'first_name', 'last_name', 'status')
      .where('id', decoded.userId)
      .first();

    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions for this resource',
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
};