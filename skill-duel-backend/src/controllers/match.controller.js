import Match from "../models/Match.js";
import User from "../models/User.js";
import Badge from "../models/Badge.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

const XP_PER_SESSION = 25;
const levelForXp = (xp) => Math.floor(xp / 100) + 1;

// name -> sessionCount threshold. Matches the badges seeded by seed.js.
const BADGE_MILESTONES = {
  "First Duel": 1,
  "10 Sessions": 10,
  "50 Sessions": 50,
};

/**
 * Awards XP, recalculates level, and grants any badge whose session-count
 * milestone the user just reached. Runs once per user per ended match.
 */
const grantSessionRewards = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return;

  user.xp += XP_PER_SESSION;
  user.level = levelForXp(user.xp);

  // Only sessions that actually earned rewards count toward milestones.
  const completedSessions = await Match.countDocuments({
    users: userId,
    status: "ended",
    rewarded: true,
  });

  for (const [name, threshold] of Object.entries(BADGE_MILESTONES)) {
    if (completedSessions >= threshold) {
      const badge = await Badge.findOne({ name });
      if (badge && !user.badges.includes(badge._id)) {
        user.badges.push(badge._id);
      }
    }
  }

  await user.save();
};

export const getMatches = asyncHandler(async (req, res) => {
  const matches = await Match.find({ users: req.user._id })
    .populate("users", "name avatar")
    .sort({ createdAt: -1 });
  res.json(matches);
});

export const getMatchById = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id).populate("users", "name avatar role");
  if (!match) return res.status(404).json({ message: "Match not found" });

  const isParticipant = match.users.some((u) => u._id.equals(req.user._id));
  if (!isParticipant) return res.status(403).json({ message: "Not part of this session" });

  res.json(match);
});

/**
 * POST /api/matches/:id/end
 * Ends a session. Both users' clients call this at nearly the same moment
 * (one hangs up, the other receives "partner-left"), so the status flip is a
 * single atomic update: exactly one request "wins" and pays out; the other
 * gets alreadyEnded: true. Sessions shorter than MIN_SESSION_SECONDS end
 * normally but earn nothing.
 */
export const endMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id);
  if (!match) return res.status(404).json({ message: "Match not found" });

  const isParticipant = match.users.some((u) => u.equals(req.user._id));
  if (!isParticipant) return res.status(403).json({ message: "Not part of this session" });

  const now = new Date();
  const seconds = (now - (match.startedAt ?? match.createdAt)) / 1000;
  const rewarded = seconds >= env.MIN_SESSION_SECONDS;

  const claimed = await Match.findOneAndUpdate(
    { _id: match._id, status: { $ne: "ended" } },
    { status: "ended", endedAt: now, rewarded },
    { new: true }
  );

  if (!claimed) {
    return res.json({
      message: "Session already ended",
      match,
      alreadyEnded: true,
      rewarded: match.rewarded,
      xpAwarded: 0,
      minSessionSeconds: env.MIN_SESSION_SECONDS,
    });
  }

  if (rewarded) {
    await Promise.all(claimed.users.map((userId) => grantSessionRewards(userId)));
  }

  res.json({
    message: "Session ended",
    match: claimed,
    alreadyEnded: false,
    rewarded,
    xpAwarded: rewarded ? XP_PER_SESSION : 0,
    minSessionSeconds: env.MIN_SESSION_SECONDS,
  });
});
