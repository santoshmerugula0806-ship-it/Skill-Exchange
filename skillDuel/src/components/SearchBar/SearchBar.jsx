import React, { useState } from "react";
import { Search, User as UserIcon } from "lucide-react";
import api from "../../api/axios";

const suggestionChips = ["React", "Python", "DSA", "UI/UX", "Machine Learning"];

export default function SearchBar({ query, setQuery, onResults }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null); // null = not searched yet

  const runSearch = async (q) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users/search", { params: { q } });
      setResults(data);
      onResults?.(data);
    } catch (err) {
      setError(err.response?.data?.message || "Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runSearch(query);
  };

  const handleChipClick = (chip) => {
    setQuery(chip);
    runSearch(chip);
  };

  return (
    <div className="mt-5">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div
          className="flex flex-1 items-center gap-2.5 rounded-2xl border border-white/10
                     bg-white/[0.03] px-4 py-3 backdrop-blur-xl transition-colors
                     focus-within:border-emerald-500/50 focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
        >
          <Search size={17} className="shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search for a skill, person or topic..."
            className="w-full bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold
                     text-black transition-all duration-200 hover:bg-emerald-400
                     hover:shadow-[0_0_20px_-4px_rgba(16,185,129,0.8)] active:scale-95
                     disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Suggestion chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestionChips.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5
                       text-xs font-medium text-white/50 transition-all duration-200
                       hover:border-emerald-500/40 hover:text-emerald-400"
          >
            {chip}
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {/* Results */}
      {results !== null && !error && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
          {results.length === 0 ? (
            <p className="px-2 py-3 text-sm text-white/40">No matches found for "{query}".</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {results.map((u) => (
                <li key={u._id} className="flex items-center gap-3 px-2 py-2.5">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/40">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{u.name}</p>
                    <p className="truncate text-xs text-white/40">
                      {[...(u.skillsTeaching || []), ...(u.skillsLearning || [])]
                        .slice(0, 3)
                        .join(" · ") || u.role || "No skills listed"}
                    </p>
                  </div>
                  {u.isOnline && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" title="Online" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
