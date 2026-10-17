import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { registerMatchingHandlers } from "./matching.socket.js";
import { registerSignalingHandlers } from "./signaling.socket.js";
import { registerChatHandlers } from "./chat.socket.js";

/**
 * Verifies the same httpOnly JWT cookie used by REST auth, during the
 * socket handshake, so every socket event handler can trust socket.userId
 * without re-checking auth per event.
 */
const authenticateSocket = async (socket) => {
  const rawCookie = socket.handshake.headers.cookie;
  if (!rawCookie) return null;

  const parsed = cookie.parse(rawCookie);
  const token = parsed.token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

export const registerSockets = (io) => {
  io.use(async (socket, next) => {
    const userId = await authenticateSocket(socket);
    if (!userId) return next(new Error("Unauthorized"));
    socket.userId = userId;
    next();
  });

  io.on("connection", async (socket) => {
    console.log(`Socket connected: ${socket.userId}`);

    await User.findByIdAndUpdate(socket.userId, { isOnline: true });

    registerMatchingHandlers(io, socket);
    registerSignalingHandlers(io, socket);
    registerChatHandlers(io, socket);

    // Closing the tab / losing the connection: tell whoever is in a call with
    // this user, otherwise their partner would be stuck on a frozen video.
    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) socket.to(room).emit("partner-left");
      }
    });

    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.userId}`);
      await User.findByIdAndUpdate(socket.userId, { isOnline: false });
      // Queue cleanup on disconnect is handled inside matching.socket.js
    });
  });
};
