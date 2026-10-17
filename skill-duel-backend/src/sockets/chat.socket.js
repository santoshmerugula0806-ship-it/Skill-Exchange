import Message from "../models/Message.js";
import Match from "../models/Match.js";

/**
 * Handles real-time chat within an active match room. Persists every
 * message so the REST history endpoint (GET /api/chats/:matchId/messages)
 * stays in sync with what was broadcast live.
 */
export const registerChatHandlers = (io, socket) => {
  socket.on("send-message", async ({ matchId, text }) => {
    const userId = socket.userId;
    if (!userId || !text?.trim() || !matchId) return;

    try {
      const match = await Match.findById(matchId);
      if (!match) return;

      const isParticipant = match.users.some((u) => u.equals(userId));
      if (!isParticipant) return;

      const message = await Message.create({
        match: matchId,
        sender: userId,
        text: text.trim(),
      });

      const populated = await message.populate("sender", "name avatar");

      io.to(matchId).emit("new-message", {
        _id: populated._id,
        text: populated.text,
        sender: populated.sender,
        createdAt: populated.createdAt,
      });
    } catch (err) {
      console.error("Failed to save/broadcast message:", err.message);
    }
  });
};
