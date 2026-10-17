import React from "react";
import { Zap, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const FALLBACK_AVATAR = "https://i.pravatar.cc/100?img=12";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-end gap-3">
      {/* XP pill */}
      <div
        className="flex items-center gap-1.5 rounded-full border border-emerald-500/40
                   bg-emerald-500/5 px-3.5 py-1.5 text-sm font-semibold text-emerald-400
                   shadow-[0_0_16px_-6px_rgba(16,185,129,0.7)]"
      >
        <Zap size={15} fill="currentColor" strokeWidth={0} />
        {(user?.xp ?? 0).toLocaleString()} XP
      </div>

      {/* Notifications */}
      <button
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full
                   border border-white/10 bg-white/[0.03] text-white/60 backdrop-blur-xl
                   transition-colors hover:text-emerald-400"
      >
        <Bell size={16} />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
      </button>

      {/* Avatar + dropdown */}
      <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2.5 backdrop-blur-xl transition-colors hover:border-white/20">
        <div className="relative">
          <img
            src={user?.avatar || FALLBACK_AVATAR}
            alt={user?.name || "User"}
            className="h-7 w-7 rounded-full object-cover"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0f0f10]" />
        </div>
        <ChevronDown size={14} className="text-white/40" />
      </button>
    </div>
  );
}
