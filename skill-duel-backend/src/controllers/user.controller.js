import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /api/users/search?q=react
 * Matches against name, skillsTeaching, and skillsLearning (case-insensitive).
 * Excludes the requester and their password from results.
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json([]);

  const regex = new RegExp(q.trim(), "i");

  const users = await User.find({
    _id: { $ne: req.user._id },
    $or: [{ name: regex }, { skillsTeaching: regex }, { skillsLearning: regex }],
  })
    .select("name avatar role xp level skillsTeaching skillsLearning isOnline")
    .limit(20);

  res.json(users);
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name avatar role xp level skillsTeaching skillsLearning isOnline"
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

/**
 * Trims, de-duplicates (case-insensitive) and caps a skills list so the
 * matcher always gets clean data: max 10 skills, 40 characters each.
 */
const cleanSkills = (list) => {
  const seen = new Set();
  const out = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const skill = String(raw).trim().slice(0, 40);
    const key = skill.toLowerCase();
    if (skill && !seen.has(key)) {
      seen.add(key);
      out.push(skill);
    }
    if (out.length === 10) break;
  }
  return out;
};

/**
 * PUT /api/users/me
 * Lets the logged-in user update their own name, avatar, role, and skills.
 * Only fields present in the body are changed.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ["name", "avatar", "role", "skillsTeaching", "skillsLearning"];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.skillsTeaching) updates.skillsTeaching = cleanSkills(updates.skillsTeaching);
  if (updates.skillsLearning) updates.skillsLearning = cleanSkills(updates.skillsLearning);

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    xp: user.xp,
    level: user.level,
    role: user.role,
    skillsTeaching: user.skillsTeaching,
    skillsLearning: user.skillsLearning,
  });
});
