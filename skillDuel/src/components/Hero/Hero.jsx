import React, { lazy, Suspense } from "react";
import { Link } from "react-router-dom";

const Spline = lazy(() => import("@splinetool/react-spline"));

export default function Hero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* Interactive Background */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="absolute inset-0 bg-[#050505]" />}>
          <Spline
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
            className="w-full h-full"
          />
        </Suspense>
        <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-8 py-6">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-lg font-bold">
            S
          </div>

          <h1 className="text-2xl font-bold">
            Skill<span className="text-emerald-400">Duel</span>
          </h1>
        </div>

        {/* Navigation */}
        <ul className="hidden lg:flex items-center gap-8 text-gray-300">
          <li className="cursor-pointer hover:text-white transition">Home</li>
          <li className="cursor-pointer hover:text-white transition">Explore Skills</li>
          <li className="cursor-pointer hover:text-white transition">How It Works</li>
          <li className="cursor-pointer hover:text-white transition">Community</li>
          <li className="cursor-pointer hover:text-white transition">About</li>
          <li className="cursor-pointer hover:text-white transition">Contact</li>
        </ul>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/signin" className="text-gray-300 hover:text-white transition">
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-lg bg-emerald-500 px-5 py-2 font-medium transition hover:bg-emerald-600"
          >
            Join Now
          </Link>
        </div>

      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 text-center mt-24">

        {/* Badge */}
        <div className="mb-8 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 text-sm text-emerald-400">
           Connect • Learn • Teach • Grow
        </div>

        {/* Heading */}
        <h1 className="max-w-5xl text-5xl font-bold leading-tight md:text-7xl">
          Exchange Skills.
          <br />
          <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Build Your Future.
          </span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-400">
          Skill Duel is a collaborative learning platform where people exchange
          skills instead of paying for expensive courses. Teach what you know,
          learn what you love, connect with passionate learners, and grow
          together through real-world knowledge sharing.
        </p>

        {/* Search Bar */}
        <div className="mt-12 flex w-full max-w-2xl flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="What skill do you want to learn?"
            className="flex-1 rounded-lg border border-gray-700 bg-[#151515] px-5 py-4 outline-none transition focus:border-emerald-500"
          />
          <button className="rounded-lg bg-emerald-500 px-8 font-semibold transition hover:bg-emerald-600">
            Find Skills
          </button>
        </div>

        <p className="mt-4 text-gray-500">
          Join thousands of learners worldwide.
        </p>

        {/* Popular Skills */}
        <div className="mt-20">
          <p className="text-sm uppercase tracking-[6px] text-gray-500">
            Popular Skills
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <span className="rounded-full border border-gray-700 bg-[#111111] px-5 py-2 text-gray-300"> Web Development</span>
            <span className="rounded-full border border-gray-700 bg-[#111111] px-5 py-2 text-gray-300"> UI / UX Design</span>
            <span className="rounded-full border border-gray-700 bg-[#111111] px-5 py-2 text-gray-300"> Data Analytics</span>
            <span className="rounded-full border border-gray-700 bg-[#111111] px-5 py-2 text-gray-300"> AI & ML</span>
            <span className="rounded-full border border-gray-700 bg-[#111111] px-5 py-2 text-gray-300"> English</span>
            <span className="rounded-full border border-gray-700 bg-[#111111] px-5 py-2 text-gray-300"> Photography</span>
            <span className="rounded-full border border-gray-700 bg-[#111111] px-5 py-2 text-gray-300"> Music</span>
            <span className="rounded-full border border-gray-700 bg-[#111111] px-5 py-2 text-gray-300"> Fitness</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid w-full max-w-4xl grid-cols-2 gap-8 rounded-2xl border border-gray-800 bg-[#0d0d0d]/60 p-8 backdrop-blur lg:grid-cols-4">
          <div>
            <h2 className="text-3xl font-bold text-emerald-400">10K+</h2>
            <p className="mt-2 text-gray-400">Active Learners</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-emerald-400">500+</h2>
            <p className="mt-2 text-gray-400">Skills Available</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-emerald-400">3K+</h2>
            <p className="mt-2 text-gray-400">Mentors</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-emerald-400">50+</h2>
            <p className="mt-2 text-gray-400">Countries</p>
          </div>
        </div>

      </section>

    </div>

  );
}
