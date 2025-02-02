import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { username: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token provided" });
    return
  }

  try {
    // Verify the token using JWT secret from env
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.user = { username: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized: Invalid token" });
    return
  }
};
