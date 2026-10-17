import React from "react";
import { Award } from "lucide-react";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";

export default function Badges() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <main className="min-h-screen px-5 py-6 md:ml-[240px] md:px-8 lg:px-10">
        <Navbar />
        <div className="mt-8 flex min-h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">
          <Award size={28} className="text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">No badges earned yet</h2>
          <p className="max-w-sm text-sm text-white/40">
            Complete skill exchanges to unlock badges — they'll show up here as you grow.
          </p>
        </div>
      </main>
    </div>
  );
}
