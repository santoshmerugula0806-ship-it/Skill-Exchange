import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";

/**
 * Verifies the httpOnly JWT cookie set at signin/signup and attaches the
 * full user document (minus password) to req.user for downstream handlers.
 */
export const protect = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User no longer exists" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
