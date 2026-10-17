import Match from "../models/Match.js";

/**
 * Pure relay for WebRTC handshake messages — the server never inspects
 * offer/answer SDP or ICE candidates, it just forwards them to the other
 * peer in the same match room. Audio/video never touches this server.
 *
 * Every event is only relayed if the sender is actually IN that room, so a
 * stranger can't inject offers into someone else's call or kick them out.
 */
const inRoom = (socket, matchId) => typeof matchId === "string" && socket.rooms.has(matchId);

export const registerSignalingHandlers = (io, socket) => {
  socket.on("offer", ({ matchId, offer }) => {
    if (inRoom(socket, matchId)) socket.to(matchId).emit("offer", offer);
  });

  socket.on("answer", ({ matchId, answer }) => {
    if (inRoom(socket, matchId)) socket.to(matchId).emit("answer", answer);
  });

  socket.on("ice-candidate", ({ matchId, candidate }) => {
    if (inRoom(socket, matchId)) socket.to(matchId).emit("ice-candidate", candidate);
  });

  // Used by the Chats page to open a (possibly old) conversation. Only the
  // two participants of a match may join its room.
  socket.on("join-match", async (matchId) => {
    try {
      const isParticipant = await Match.exists({ _id: matchId, users: socket.userId });
      if (isParticipant) socket.join(matchId);
    } catch {
      /* malformed id — ignore */
    }
  });

  socket.on("leave-match", (matchId) => {
    if (!inRoom(socket, matchId)) return;
    socket.to(matchId).emit("partner-left");
    socket.leave(matchId);
  });
};
