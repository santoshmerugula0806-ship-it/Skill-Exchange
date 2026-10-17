import React, { useMemo, useState } from "react";
import { X, Check, Loader2, AlertCircle } from "lucide-react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const FALLBACK_AVATAR = "https://i.pravatar.cc/100?img=12";
const MAX_SKILLS = 10;
const SUGGESTIONS = ["React", "Node.js", "Python", "JavaScript", "UI/UX", "DSA", "SQL", "Machine Learning"];

const toForm = (user) => ({
  name: user?.name ?? "",
  role: user?.role ?? "",
  avatar: user?.avatar ?? "",
  skillsTeaching: user?.skillsTeaching ?? [],
  skillsLearning: user?.skillsLearning ?? [],
});

/** Chip-style input: Enter or comma adds a skill, Backspace removes the last. */
function TagInput({ label, hint, tags, onChange, tone }) {
  const [draft, setDraft] = useState("");

  const addMany = (values) => {
    const next = [...tags];
    for (const raw of values) {
      const value = raw.trim().slice(0, 40);
      if (!value || next.length >= MAX_SKILLS) continue;
      if (next.some((t) => t.toLowerCase() === value.toLowerCase())) continue;
      next.push(value);
    }
    if (next.length !== tags.length) onChange(next);
  };

  const commitDraft = () => {
    addMany([draft]);
    setDraft("");
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.includes(",")) {
      addMany(value.split(","));
      setDraft("");
    } else {
      setDraft(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // don't submit the form
      commitDraft();
    } else if (e.key === "Backspace" && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  const chip =
    tone === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : "border-purple-500/30 bg-purple-500/10 text-purple-300";

  const suggestions = SUGGESTIONS.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  ).slice(0, 5);

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-sm font-medium text-white">{label}</label>
        <span className="text-xs text-white/30">
          {tags.length}/{MAX_SKILLS}
        </span>
      </div>
      <p className="mb-2 text-xs text-white/40">{hint}</p>

      <div
        className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03]
                   px-3 py-2.5 transition-colors focus-within:border-emerald-500/50"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${chip}`}
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="opacity-60 transition hover:opacity-100"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          disabled={tags.length >= MAX_SKILLS}
          placeholder={tags.length ? "Add another…" : "Type a skill and press Enter"}
          className="min-w-[140px] flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>

      {suggestions.length > 0 && tags.length < MAX_SKILLS && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addMany([s])}
              className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/40
                         transition hover:border-emerald-500/40 hover:text-emerald-400"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState(() => toForm(user));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }

  const saved = useMemo(() => toForm(user), [user]);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const missingSkills = !form.skillsTeaching.length || !form.skillsLearning.length;

  const update = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await api.put("/users/me", {
        ...form,
        name: form.name.trim(),
        role: form.role.trim(),
        avatar: form.avatar.trim(),
      });
      setUser(data);
      setForm(toForm(data));
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Couldn't save your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white " +
    "placeholder:text-white/30 transition-colors focus:border-emerald-500/50 focus:outline-none";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="min-h-screen px-5 py-6 md:ml-[240px] md:px-8 lg:px-10">
        <Navbar />

        <div className="mx-auto mt-8 max-w-2xl space-y-5">
          {/* Summary */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <img
              src={form.avatar || FALLBACK_AVATAR}
              alt={form.name || "Your avatar"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_AVATAR;
              }}
              className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-500/40"
            />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">{user?.name}</h2>
              <p className="text-sm text-white/40">
                Level {user?.level ?? 1} · {(user?.xp ?? 0).toLocaleString()} XP
              </p>
            </div>
          </div>

          {missingSkills && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              Add at least one skill you teach and one you want to learn — CONNECT needs both to find you a partner.
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => update("name")(e.target.value)}
                  maxLength={60}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Title / role</label>
                <input
                  value={form.role}
                  onChange={(e) => update("role")(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Frontend Developer"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Avatar URL</label>
              <input
                value={form.avatar}
                onChange={(e) => update("avatar")(e.target.value)}
                placeholder="https://… (leave empty for the default)"
                className={inputClass}
              />
            </div>

            <TagInput
              label="Skills I can teach"
              hint="Partners who want to learn these can be matched with you."
              tags={form.skillsTeaching}
              onChange={update("skillsTeaching")}
              tone="emerald"
            />

            <TagInput
              label="Skills I want to learn"
              hint="You'll be matched with people who teach these."
              tags={form.skillsLearning}
              onChange={update("skillsLearning")}
              tone="purple"
            />

            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="min-h-[20px] text-sm" aria-live="polite">
                {message?.type === "success" && (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Check size={15} /> {message.text}
                  </span>
                )}
                {message?.type === "error" && <span className="text-red-400">{message.text}</span>}
              </div>
              <button
                type="submit"
                disabled={!dirty || saving}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold
                           text-black transition-all hover:bg-emerald-400
                           disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
