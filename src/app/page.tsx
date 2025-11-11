"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FactsCarousel from "@/components/facts-carousel";

export default function WelcomePage() {
  const accent = "#309c3e";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071821] via-[#072026] to-[#061419] text-slate-100">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-md overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <img src="/images/logo_project.svg" alt="ChronoDietAI Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-lg font-semibold">ChronoDietAI</div>
            <div className="text-xs text-slate-400">Personalized nutrition, simplified</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <Link href="#features" className="hover:text-white">Features</Link>
          <Link href="/diet-dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/profile" className="hover:text-white">Profile</Link>
          <Button asChild size="sm">
            <Link href="/profile" style={{ background: accent, color: '#fff' }} className="px-3 py-1.5 rounded">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-12">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight" style={{ color: '#e6f6ec' }}>
              Smarter nutrition that fits your day.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl">
              ChronoDietAI helps you plan meals, track calories, and respect medical restrictions — all
              with gentle, science-backed nudges. Start with a quick profile and get a plan tailored
              to your schedule.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Button asChild>
                <Link href="/profile" style={{ background: accent, color: '#fff' }} className="px-6 py-3 rounded-md text-base font-medium">Get Started</Link>
              </Button>
              <a href="#features" className="px-6 py-3 rounded-md border border-slate-700 text-slate-200 hover:border-slate-500 text-base">Learn more</a>
            </div>

            
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]">
              <FactsCarousel />
            </div>
          </div>
        </section>

        <section id="features" className="py-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-100">What ChronoDietAI offers</h2>
          <p className="text-slate-400 mt-3 max-w-2xl text-lg">A calm, focused dashboard with AI-driven meal planning, tracking, and personalized coaching.</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-lg bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
              <div className="text-xl md:text-2xl font-semibold">Personalized Meal Plans</div>
              <div className="text-base text-slate-300 mt-3">AI-generated daily meal plans tailored to your profile, preferences, and goals.</div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/diet-plan" className="px-4 py-2 rounded bg-[#309c3e] text-white font-medium">Create plan</Link>
                </Button>
              </div>
            </div>

            <div className="p-8 rounded-lg bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
              <div className="text-xl md:text-2xl font-semibold">Tracking & Metrics</div>
              <div className="text-base text-slate-300 mt-3">Track calories, macros, meals, and progress over time with downloadable PDFs.</div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/diet-dashboard" className="px-4 py-2 rounded border border-[rgba(255,255,255,0.04)] text-slate-100">View dashboard</Link>
                </Button>
              </div>
            </div>

            <div className="p-8 rounded-lg bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
              <div className="text-xl md:text-2xl font-semibold">Medical-safe Filters</div>
              <div className="text-base text-slate-300 mt-3">Plans that respect chronic conditions (diabetes, hypertension, PCOS, etc.) and dietary restrictions.</div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/profile" className="px-4 py-2 rounded border border-[rgba(255,255,255,0.04)] text-slate-100">Set restrictions</Link>
                </Button>
              </div>
            </div>

            <div className="p-8 rounded-lg bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.02)]">
              <div className="text-xl md:text-2xl font-semibold">AI Insights & Coaching</div>
              <div className="text-base text-slate-300 mt-3">Actionable tips, habit nudges, and personalized suggestions to keep you on track.</div>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/diet-plan" className="px-4 py-2 rounded border border-[rgba(255,255,255,0.04)] text-slate-100">See insights</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 py-8 border-t border-[rgba(255,255,255,0.03)]">
        <div className="max-w-6xl mx-auto px-6 text-sm text-slate-400 flex items-center justify-between">
          <div>© {new Date().getFullYear()} ChronoDietAI</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
