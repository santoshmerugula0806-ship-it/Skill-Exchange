import Badge from "../models/Badge.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllBadges = asyncHandler(async (req, res) => {
  const badges = await Badge.find().sort({ name: 1 });
  res.json(badges);
});

export const getMyBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("badges");
  res.json(user.badges);
});
