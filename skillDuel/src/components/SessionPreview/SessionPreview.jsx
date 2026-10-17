import React from "react";
import { Users, Atom, Server, Video, Code2, Share2, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const features = [
  { icon: Video, label: "Live Video Call" },
  { icon: Code2, label: "Code Together" },
  { icon: Share2, label: "Share Knowledge" },
  { icon: TrendingUp, label: "Grow Together" },
];

export default function SessionPreview() {
  const { user } = useAuth();
  const youTeach = user?.skillsTeaching?.[0] || "Not set yet";
  const youLearn = user?.skillsLearning?.[0] || "Not set yet";

  return (
    <div
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-5
                 backdrop-blur-xl lg:w-80"
    >
      <div className="mb-5 flex items-center gap-2">
        <Users size={17} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">Session Preview</h3>
      </div>

      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-white/40">
            You Teach
          </p>
          <SkillBadge icon={Atom} name={youTeach} tone="emerald" />
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-white/40">
            You Learn
          </p>
          <SkillBadge icon={Server} name={youLearn} tone="purple" />
        </div>
      </div>

      <div className="my-5 h-px bg-white/10" />

      <ul className="space-y-3">
        {features.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 text-sm text-white/60">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <Icon size={14} />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillBadge({ icon: Icon, name, tone }) {
  const toneClasses =
    tone === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : "border-purple-500/30 bg-purple-500/10 text-purple-400";

  return (
    <div
      className={`flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${toneClasses}`}
    >
      <Icon size={15} />
      {name}
    </div>
  );
}
