import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate("/app");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 overflow-hidden">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-800 bg-[#0d0d0d]/60 p-8 backdrop-blur">

        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-lg font-bold">
            S
          </div>
          <h1 className="text-2xl font-bold">
            Skill<span className="text-emerald-400">Duel</span>
          </h1>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Create your account</h2>
        <p className="text-gray-400 text-center mb-8">
          Join thousands exchanging skills for free.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Full name"
            className="rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 outline-none transition focus:border-emerald-500"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email address"
            className="rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 outline-none transition focus:border-emerald-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Password (min. 6 characters)"
            className="rounded-lg border border-gray-700 bg-[#151515] px-4 py-3 outline-none transition focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold transition hover:bg-emerald-600 mt-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/signin" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
