import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SignOut() {
  const { signout } = useAuth();
  const [done, setDone] = useState(false);

  // Visiting this route performs the actual sign-out — matches Sidebar's
  // logout icon linking here via NavLink.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await signout();
      if (!cancelled) setDone(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 overflow-hidden">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-800 bg-[#0d0d0d]/60 p-8 text-center backdrop-blur">

        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          {done ? <LogOut size={22} /> : <Loader2 size={22} className="animate-spin" />}
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {done ? "You've been signed out" : "Signing you out..."}
        </h2>
        <p className="text-gray-400 mb-8">
          Thanks for exchanging skills today. Come back anytime to keep learning and teaching.
        </p>

        {done && (
          <div className="flex flex-col gap-3">
            <Link
              to="/signin"
              className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold transition hover:bg-emerald-600"
            >
              Sign back in
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-gray-700 px-5 py-3 font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
