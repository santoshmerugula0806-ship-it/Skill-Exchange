import React from "react";
import { Link } from "react-router-dom";
import { Handshake, Loader2, X, AlertCircle, Info } from "lucide-react";

export default function ConnectButton({
  status,        // "idle" | "matching" | "connected"
  onConnect,
  onCancel,      // stops searching (only shown while matching)
  error,         // { code, message } | null
  notice,        // string | null
  onDismiss,
}) {
  const matching = status === "matching";

  return (
    <div className="flex flex-col items-center">
      {/* Error / info banner */}
      {(error || notice) && (
        <div
          role="alert"
          className={`mb-4 flex w-full max-w-xl items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {error ? (
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
          ) : (
            <Info size={16} className="mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <p>{error ? error.message : notice}</p>
            {error?.code === "NO_SKILLS" && (
              <Link
                to="/app/profile"
                className="mt-1 inline-block font-medium underline underline-offset-2 hover:text-white"
              >
                Go to your profile →
              </Link>
            )}
          </div>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="shrink-0 opacity-60 transition hover:opacity-100"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={onConnect}
          disabled={status !== "idle"}
          className="group flex items-center gap-2.5 rounded-full bg-emerald-500 px-9 py-3.5
                     text-base font-bold text-black transition-all duration-300
                     hover:scale-105 hover:shadow-[0_0_35px_-4px_rgba(16,185,129,0.9)]
                     disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {matching ? (
            <Loader2 size={19} className="animate-spin" />
          ) : (
            <Handshake size={19} className="transition-transform duration-300 group-hover:rotate-12" />
          )}
          {status === "connected" ? "Connected" : matching ? "Matching..." : "CONNECT"}
        </button>

        {/* STEP 4 — cancel while searching */}
        {matching && (
          <button
            onClick={onCancel}
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-base font-semibold
                       text-white/80 transition-colors hover:border-red-500/40 hover:text-red-300"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="mt-3 text-sm text-white/40">
        {matching
          ? "Looking for someone who teaches what you want to learn…"
          : "Click connect to find a partner and start exchanging skills!"}
      </p>
    </div>
  );
}
