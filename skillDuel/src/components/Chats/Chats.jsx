import React, { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../socket/socket";

export default function Chats() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  // Load the user's match history on mount.
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const { data } = await api.get("/matches");
        setMatches(data);
      } catch (err) {
        console.error("Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMatches();
  }, []);

  // Load message history whenever the selected thread changes, and join
  // that match's socket room so send/receive works live.
  useEffect(() => {
    if (!selectedMatch) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();
    socket.emit("join-match", selectedMatch._id);

    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/chats/${selectedMatch._id}/messages`);
        setMessages(data.messages);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };
    loadMessages();

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [selectedMatch]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!draft.trim() || !selectedMatch) return;
    const socket = getSocket();
    socket.emit("send-message", { matchId: selectedMatch._id, text: draft.trim() });
    setDraft("");
  };

  const partnerFor = (match) => match.users.find((u) => u._id !== user?.id);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="min-h-screen px-5 py-6 md:ml-[240px] md:px-8 lg:px-10">
        <Navbar />

        <div className="mt-8 flex h-[70vh] gap-4">
          {/* Thread list */}
          <div className="w-72 shrink-0 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            {loading ? (
              <p className="p-4 text-sm text-white/40">Loading conversations...</p>
            ) : matches.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                <MessageSquare size={22} className="text-emerald-400" />
                <p className="text-sm text-white/40">
                  No conversations yet. Connect with a partner to start one.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {matches.map((match) => {
                  const partner = partnerFor(match);
                  const active = selectedMatch?._id === match._id;
                  return (
                    <li key={match._id}>
                      <button
                        onClick={() => setSelectedMatch(match)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                          active ? "bg-emerald-500/10" : "hover:bg-white/5"
                        }`}
                      >
                        <img
                          src={partner?.avatar || "https://i.pravatar.cc/100"}
                          alt={partner?.name || "Partner"}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {partner?.name || "Unknown"}
                          </p>
                          <p className="truncate text-xs text-white/40">
                            {match.teachSkill} · {match.status}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Message thread */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            {!selectedMatch ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <MessageSquare size={22} className="text-white/20" />
                <p className="text-sm text-white/30">Select a conversation to view messages</p>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((msg) => {
                    const mine = msg.sender?._id === user?.id || msg.sender === user?.id;
                    return (
                      <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                            mine
                              ? "bg-emerald-500 text-black"
                              : "border border-white/10 bg-white/5 text-white"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>

                <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/10 p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-emerald-500/50 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-black transition hover:bg-emerald-400"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
