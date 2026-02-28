import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  userId: number;
  username: string;
  email: string;
  organizationId: number;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: "Access token required",
    });
    return;
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
}

export default authenticateToken;
