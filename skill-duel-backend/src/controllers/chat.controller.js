import Message from "../models/Message.js";
import Match from "../models/Match.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /api/chats/:matchId/messages?page=1&limit=30
 * Returns messages oldest-to-newest for the requested page (so a chat UI
 * can just append each page to the top of the scroll view).
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

  const match = await Match.findById(matchId);
  if (!match) return res.status(404).json({ message: "Match not found" });

  const isParticipant = match.users.some((u) => u.equals(req.user._id));
  if (!isParticipant) return res.status(403).json({ message: "Not part of this session" });

  const total = await Message.countDocuments({ match: matchId });

  const messages = await Message.find({ match: matchId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("sender", "name avatar");

  res.json({
    messages: messages.reverse(), // oldest first within the page
    page,
    totalPages: Math.ceil(total / limit),
    total,
  });
});
