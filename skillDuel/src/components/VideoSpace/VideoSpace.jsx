import React, { useRef, useEffect } from "react";
import {
  Handshake,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  SignalHigh,
  BadgeCheck,
  Loader2,
} from "lucide-react";

export default function VideoSpace({
  status,        // "idle" | "matching" | "connected"
  partner,       // { name, avatar, verified, role, teaching, learning } | null
  localStream,   // MediaStream | null
  remoteStream,  // MediaStream | null
  onEndCall,
  micOn,
  setMicOn,
  cameraOn,
  setCameraOn,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);


  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream || null;
  }, [localStream, status, cameraOn]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream || null;
  }, [remoteStream, status]);

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-2xl border
                 border-white/10 bg-gradient-to-br from-[#111214] via-[#0d1210] to-[#0a0a0a]"
    >
      {status === "connected" ? (
        <>
          {/* Remote partner video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover bg-[#0d0d0f]"
          />

          {/* Online status pill */}
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-black/50 px-3 py-1 text-xs font-medium text-emerald-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Online
          </div>

          {/* Your floating video */}
          <div className="absolute right-4 top-4 flex h-20 w-32 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#151515] shadow-lg sm:h-24 sm:w-40">
            {cameraOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a] text-white/30 text-xs">
                Camera off
              </div>
            )}
            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
              You
            </span>
            {!micOn && (
              <span className="absolute right-1.5 top-1.5 rounded-full bg-red-500/90 p-1">
                <MicOff size={10} className="text-white" />
              </span>
            )}
          </div>

          {/* Bottom-left overlay: partner info */}
          <div className="absolute bottom-4 left-4 max-w-[70%] rounded-xl border border-white/10 bg-black/50 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white">{partner?.name || "Partner"}</p>
              {partner?.verified && <BadgeCheck size={14} className="text-emerald-400" />}
            </div>
            <p className="mt-0.5 text-xs text-white/40">{partner?.role || ""}</p>
            <p className="mt-1.5 text-xs text-white/60">
              Teaching: <span className="font-medium text-emerald-400">{partner?.teaching || "—"}</span>
            </p>
            <p className="text-xs text-white/60">
              Learning: <span className="font-medium text-purple-400">{partner?.learning || "—"}</span>
            </p>
          </div>

          {/* Signal strength */}
          <div className="absolute bottom-4 right-4 rounded-lg border border-white/10 bg-black/50 p-1.5 backdrop-blur-md">
            <SignalHigh size={16} className="text-emerald-400" />
          </div>

          {/* Call controls */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
            <ControlButton
              active={micOn}
              onClick={() => setMicOn((m) => !m)}
              onIcon={<Mic size={18} />}
              offIcon={<MicOff size={18} />}
            />
            <ControlButton
              active={cameraOn}
              onClick={() => setCameraOn((c) => !c)}
              onIcon={<Video size={18} />}
              offIcon={<VideoOff size={18} />}
            />
            <button
              onClick={onEndCall}
              aria-label="End call"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/90
                         text-white shadow-[0_0_0_1px_rgba(239,68,68,0.4)] transition-all duration-200
                         hover:bg-red-500 hover:shadow-[0_0_20px_-2px_rgba(239,68,68,0.8)] active:scale-95"
            >
              <PhoneOff size={18} />
            </button>
          </div>
        </>
      ) : status === "matching" ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/60">
          <Loader2 size={30} className="animate-spin text-emerald-400" />
          <p className="animate-pulse text-sm font-medium">Finding a partner...</p>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white/30">
          <Handshake size={34} strokeWidth={1.5} />
          <p className="text-sm">No active session</p>
        </div>
      )}
    </div>
  );
}

function ControlButton({ active, onClick, onIcon, offIcon }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md
                  transition-all duration-200 active:scale-95
        ${
          active
            ? "border-white/15 bg-white/10 text-white hover:shadow-[0_0_18px_-4px_rgba(255,255,255,0.4)]"
            : "border-red-500/40 bg-red-500/10 text-red-400 hover:shadow-[0_0_18px_-4px_rgba(239,68,68,0.6)]"
        }`}
    >
      {active ? onIcon : offIcon}
    </button>
  );
}
