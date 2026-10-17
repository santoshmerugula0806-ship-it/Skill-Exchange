import Match from "../models/Match.js";
import User from "../models/User.js";
import {
  toSkillMap,
  hasSkills,
  findComplement,
  findAnyone,
  describeExchange,
} from "./matching.logic.js";

// In-memory queue: userId -> { userId, socket, user, teaching, learning }
// Fine for a single Node process; swap for Redis if you run several instances.
const queue = new Map();
const timers = new Map(); // userId -> fallback timeout handle

const FALLBACK_TIMEOUT_MS = 15000;

const leaveQueue = (userId) => {
  clearTimeout(timers.get(userId));
  timers.delete(userId);
  queue.delete(userId);
};

// Only the socket that queued the user may remove them (a second open tab
// closing must not cancel the first tab's search).
const leaveQueueIfOwner = (socket) => {
  if (queue.get(socket.userId)?.socket === socket) leaveQueue(socket.userId);
};

const partnerPayload = (user, side) => ({
  id: user._id,
  name: user.name,
  avatar: user.avatar,
  role: user.role,
  verified: false,
  teaching: side.teaches,
  learning: side.learns,
});

/**
 * Creates the Match, puts both sockets in its room, and tells each side about
 * the other. Both users are removed from the queue synchronously first, so
 * nobody can be paired twice.
 */
const pairUsers = async (a, b) => {
  leaveQueue(a.userId);
  leaveQueue(b.userId);

  try {
    const exchange = describeExchange(a, b);

    const match = await Match.create({
      users: [a.userId, b.userId],
      status: "active",
      teachSkill: exchange.a.teaches,
      learnSkill: exchange.a.learns,
      startedAt: new Date(),
    });
    const matchId = match._id.toString();

    a.socket.join(matchId);
    b.socket.join(matchId);

    a.socket.emit("match-found", {
      matchId,
      partner: partnerPayload(b.user, exchange.b),
      initiator: true, // a creates the WebRTC offer
    });
    b.socket.emit("match-found", {
      matchId,
      partner: partnerPayload(a.user, exchange.a),
      initiator: false,
    });
  } catch (err) {
    console.error("Failed to pair users:", err.message);
    const failure = { code: "SERVER", message: "Something went wrong while matching. Please try again." };
    a.socket.emit("matching-error", failure);
    b.socket.emit("matching-error", failure);
  }
};

export const registerMatchingHandlers = (io, socket) => {
  // Skills come from the database, never from the client payload.
  socket.on("find-partner", async () => {
    const userId = socket.userId;
    try {
      leaveQueue(userId); // clicking twice restarts cleanly

      const user = await User.findById(userId);
      if (!user) return;

      const me = {
        userId,
        socket,
        user,
        teaching: toSkillMap(user.skillsTeaching),
        learning: toSkillMap(user.skillsLearning),
      };

      if (!hasSkills(me)) {
        socket.emit("matching-error", {
          code: "NO_SKILLS",
          message:
            "Add at least one skill you can teach and one you want to learn in your profile before connecting.",
        });
        return;
      }

      const complement = findComplement(queue, me);
      if (complement) {
        await pairUsers(me, complement);
        return;
      }

      // Nobody complementary yet: wait, then fall back to anyone who's waiting.
      queue.set(userId, me);
      timers.set(
        userId,
        setTimeout(async () => {
          try {
            const self = queue.get(userId);
            if (!self) return;
            const other = findAnyone(queue, self);
            if (other) await pairUsers(self, other);
          } catch (err) {
            console.error("Fallback pairing failed:", err.message);
          }
        }, FALLBACK_TIMEOUT_MS)
      );
    } catch (err) {
      console.error("find-partner failed:", err.message);
      leaveQueue(userId);
      socket.emit("matching-error", {
        code: "SERVER",
        message: "Something went wrong while matching. Please try again.",
      });
    }
  });

  socket.on("cancel-matching", () => leaveQueueIfOwner(socket));
  socket.on("disconnect", () => leaveQueueIfOwner(socket));
};
