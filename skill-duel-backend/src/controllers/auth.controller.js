import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  const token = generateToken(user._id);
  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    xp: user.xp,
    level: user.level,
    skillsTeaching: user.skillsTeaching,
    skillsLearning: user.skillsLearning,
  });
});

export const signin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = generateToken(user._id);
  res.cookie("token", token, cookieOptions);

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    xp: user.xp,
    level: user.level,
    skillsTeaching: user.skillsTeaching,
    skillsLearning: user.skillsLearning,
  });
});

export const signout = asyncHandler(async (req, res) => {
  res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Signed out" });
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by the `protect` middleware
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    xp: req.user.xp,
    level: req.user.level,
    role: req.user.role,
    skillsTeaching: req.user.skillsTeaching,
    skillsLearning: req.user.skillsLearning,
  });
});
