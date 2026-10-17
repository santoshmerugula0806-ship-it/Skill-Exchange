import { useEffect, useRef, useState } from "react";
import { getSocket } from "../socket/socket";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { getLocalMedia, describeMediaError } from "../utils/media";

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/**
 * Owns the whole call lifecycle: matching, WebRTC, errors and ending.
 *
 * Everything the socket listeners touch lives in refs (not state), because the
 * listeners are registered once and would otherwise see stale values.
 *
 * Socket events used:
 *   emit:   find-partner · cancel-matching · leave-match · offer · answer · ice-candidate
 *   listen: match-found · matching-error · offer · answer · ice-candidate · partner-left
 */
export default function useCall() {
  const { user, setUser } = useAuth();

  const [status, setStatus] = useState("idle"); // "idle" | "matching" | "connected"
  const [partner, setPartner] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [error, setError] = useState(null); // { code, message }
  const [notice, setNotice] = useState(null); // string

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const matchIdRef = useRef(null);
  const statusRef = useRef("idle");
  const userRef = useRef(user);
  userRef.current = user;

  // STEP 2 — signaling that arrives before our peer connection exists is parked here
  const pendingOfferRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const updateStatus = (next) => {
    statusRef.current = next;
    setStatus(next);
  };

  // ───────────────────────── cleanup helpers ─────────────────────────

  /** Release the camera/mic and close the peer connection. */
  const teardown = () => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pendingOfferRef.current = null;
    pendingCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setPartner(null);
    setMicOn(true);
    setCameraOn(true);
  };

  /** Re-read the user after a session so XP / level update everywhere. Returns the XP gained. */
  const refreshUser = async () => {
    const before = userRef.current?.xp ?? 0;
    const { data } = await api.get("/auth/me");
    setUser(data);
    return data.xp - before;
  };

  /**
   * End a call normally. Tells the server so XP/badges are awarded (only if the
   * session was long enough — the server decides) and tells the partner.
   */
  const endCall = ({ notifyPartner = true, prefix = "" } = {}) => {
    const matchId = matchIdRef.current;
    matchIdRef.current = null;
    teardown();
    updateStatus("idle");
    if (!matchId) return;

    if (notifyPartner) socketRef.current?.emit("leave-match", matchId);

    api
      .post(`/matches/${matchId}/end`)
      .then(({ data }) => {
        if (data.alreadyEnded) {
          // The other user's request paid out first — pick up the new XP shortly.
          setNotice(prefix || null);
          setTimeout(() => {
            refreshUser()
              .then((gained) => {
                if (gained > 0) setNotice(`${prefix} +${gained} XP earned!`.trim());
              })
              .catch(() => {});
          }, 1500);
          return null;
        }
        setNotice(
          data.rewarded
            ? `${prefix} +${data.xpAwarded} XP earned!`.trim()
            : `${prefix} No XP this time — sessions under ${data.minSessionSeconds} seconds don't count.`.trim()
        );
        return refreshUser();
      })
      .catch((err) => console.error("Failed to end session:", err));
  };

  /** A call that could not start (e.g. camera blocked): leave without a "session". */
  const failCall = (errorInfo) => {
    const matchId = matchIdRef.current;
    matchIdRef.current = null;
    teardown();
    updateStatus("idle");
    setError(errorInfo);
    if (matchId) socketRef.current?.emit("leave-match", matchId);
  };

  // ───────────────────────── WebRTC ─────────────────────────

  const flushCandidates = async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const queued = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding queued ICE candidate:", err);
      }
    }
  };

  const handleOffer = async (offer) => {
    const pc = pcRef.current;
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    await flushCandidates();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current?.emit("answer", { matchId: matchIdRef.current, answer });
  };

  /** Returns true if the call is up, false if it was cancelled while setting up. */
  const startCall = async (matchId, initiator) => {
    // STEP 3 — may throw; the caller turns that into a friendly error
    const { stream, audioOnly } = await getLocalMedia();

    // The call may have ended while the permission prompt was open.
    if (matchIdRef.current !== matchId) {
      stream.getTracks().forEach((t) => t.stop());
      return false;
    }

    localStreamRef.current = stream;
    setLocalStream(stream);
    if (audioOnly) {
      setCameraOn(false);
      setNotice("Your camera isn't available, so you joined with audio only.");
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    // No camera? Still be able to *receive* the partner's video.
    if (!stream.getVideoTracks().length) pc.addTransceiver("video", { direction: "recvonly" });

    pc.ontrack = (event) => setRemoteStream(event.streams[0]);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", { matchId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" && pcRef.current === pc) {
        endCall();
        setError({
          code: "CONNECTION_FAILED",
          message:
            "Couldn't open a direct video connection. This can happen on strict networks — a TURN server isn't configured yet.",
        });
      }
    };

    // STEP 2 — an offer may have arrived while we were waiting for the camera
    if (pendingOfferRef.current) {
      const offer = pendingOfferRef.current;
      pendingOfferRef.current = null;
      await handleOffer(offer);
    }

    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (pcRef.current !== pc) return false;
      socketRef.current?.emit("offer", { matchId, offer });
    }

    return true;
  };

  // ───────────────────────── socket wiring ─────────────────────────

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    socket.connect();

    const onMatchFound = async ({ matchId, partner: partnerData, initiator }) => {
      // STEP 4 — the user pressed Cancel just as the server paired them
      if (statusRef.current !== "matching") {
        socket.emit("leave-match", matchId);
        return;
      }

      matchIdRef.current = matchId;
      setPartner(partnerData);
      setNotice(null);

      try {
        const started = await startCall(matchId, initiator);
        if (started) updateStatus("connected");
      } catch (err) {
        console.error("Could not start the call:", err);
        failCall(describeMediaError(err));
      }
    };

    const onMatchingError = ({ code, message }) => {
      updateStatus("idle");
      setError({ code, message });
    };

    const onOffer = async (offer) => {
      try {
        if (!pcRef.current) {
          pendingOfferRef.current = offer; // handled as soon as startCall creates the connection
          return;
        }
        await handleOffer(offer);
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    };

    const onAnswer = async (answer) => {
      try {
        if (!pcRef.current) return;
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        await flushCandidates();
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    };

    const onIceCandidate = async (candidate) => {
      const pc = pcRef.current;
      if (!pc || !pc.remoteDescription) {
        pendingCandidatesRef.current.push(candidate); // too early — apply after the offer/answer
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    };

    const onPartnerLeft = () => {
      if (!matchIdRef.current) return;
      endCall({ notifyPartner: false, prefix: "Your partner left the session." });
    };

    const onConnectError = (err) => {
      if (err?.message === "Unauthorized") {
        setError({ code: "AUTH", message: "Your session expired. Please sign in again." });
      }
    };

    socket.on("match-found", onMatchFound);
    socket.on("matching-error", onMatchingError);
    socket.on("offer", onOffer);
    socket.on("answer", onAnswer);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("partner-left", onPartnerLeft);
    socket.on("connect_error", onConnectError);

    return () => {
      // Leaving the page mid-call must release the camera and end the session.
      const matchId = matchIdRef.current;
      matchIdRef.current = null;
      teardown();
      if (matchId) {
        socket.emit("leave-match", matchId);
        api.post(`/matches/${matchId}/end`).catch(() => {});
      }

      socket.off("match-found", onMatchFound);
      socket.off("matching-error", onMatchingError);
      socket.off("offer", onOffer);
      socket.off("answer", onAnswer);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("partner-left", onPartnerLeft);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mic / camera buttons flip the real tracks, not just the UI state.
  useEffect(() => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = micOn));
  }, [micOn, localStream]);

  useEffect(() => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = cameraOn));
  }, [cameraOn, localStream]);

  // ───────────────────────── actions for the UI ─────────────────────────

  const connect = () => {
    setError(null);
    setNotice(null);

    // Quick client-side check; the server enforces the same rule.
    if (!user?.skillsTeaching?.length || !user?.skillsLearning?.length) {
      setError({
        code: "NO_SKILLS",
        message:
          "Add at least one skill you can teach and one you want to learn in your profile before connecting.",
      });
      return;
    }
    if (!socketRef.current?.connected) {
      setError({
        code: "SOCKET",
        message: "Can't reach the server right now. Check that the backend is running, then try again.",
      });
      return;
    }

    updateStatus("matching");
    socketRef.current.emit("find-partner");
  };

  // STEP 4 — stop searching
  const cancelMatching = () => {
    if (statusRef.current !== "matching") return;
    socketRef.current?.emit("cancel-matching");
    updateStatus("idle");
  };

  const toggleMic = () => setMicOn((on) => !on);

  const toggleCamera = () => {
    if (!localStreamRef.current?.getVideoTracks().length) {
      setNotice("No camera is available for this call.");
      return;
    }
    setCameraOn((on) => !on);
  };

  const dismiss = () => {
    setError(null);
    setNotice(null);
  };

  return {
    status,
    partner,
    localStream,
    remoteStream,
    micOn,
    cameraOn,
    error,
    notice,
    connect,
    cancelMatching,
    endCall: () => endCall(),
    toggleMic,
    toggleCamera,
    dismiss,
  };
}
