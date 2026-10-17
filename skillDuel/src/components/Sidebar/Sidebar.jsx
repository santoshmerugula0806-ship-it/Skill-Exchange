import React from "react";
import { NavLink } from "react-router-dom";
import {
  Handshake,
  Home,
  MessageSquare,
  Code2,
  Award,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { id: "main", label: "Main", path: "/app", icon: Home },
  { id: "chats", label: "Chats", path: "/app/chats", icon: MessageSquare },
  { id: "coding", label: "Coding Space", path: "/app/coding-space", icon: Code2 },
  { id: "badges", label: "Badges", path: "/app/badges", icon: Award },
  { id: "profile", label: "Profile", path: "/app/profile", icon: User },
];

const FALLBACK_AVATAR = "https://i.pravatar.cc/100?img=12";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside
      className="fixed left-0 top-0 hidden h-screen w-[240px] flex-col
                 border-r border-white/5 bg-[#0a0a0a] px-4 py-6 md:flex"
    >
      {/* Brand */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl
                     bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
        >
          <Handshake size={20} strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-white">SKILL DUEL</p>
          <p className="text-[10px] font-medium tracking-wider text-white/40">
            EXCHANGE SKILLS, GROW TOGETHER
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1.5">
        {navItems.map(({ id, label, path, icon: Icon }) => (
          <NavLink
            key={id}
            to={path}
            end={path === "/app"}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
               font-medium transition-all duration-200
               ${
                 isActive
                   ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.4),0_0_20px_-4px_rgba(16,185,129,0.5)]"
                   : "text-white/50 hover:bg-white/5 hover:text-white/90"
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  strokeWidth={2}
                  className={isActive ? "text-emerald-400" : "text-white/40 group-hover:text-white/80"}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User mini-card */}
      <div
        className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10
                   bg-white/[0.03] p-3 backdrop-blur-xl"
      >
        <div className="relative">
          <img
            src={user?.avatar || FALLBACK_AVATAR}
            alt={user?.name || "User"}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/40"
          />
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0a0a]" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold text-white">{user?.name || "..."}</p>
          <p className="text-xs text-white/40">Level {user?.level ?? 1}</p>
        </div>
        <NavLink
          to="/signout"
          aria-label="Sign out"
          className="text-white/40 transition-colors hover:text-red-400"
        >
          <LogOut size={17} />
        </NavLink>
      </div>
    </aside>
  );
}
