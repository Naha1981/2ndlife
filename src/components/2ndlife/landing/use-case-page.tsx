"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/2ndlife/store";
import { Logo } from "../shared/logo";

export interface UseCaseConfig {
  slug: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subhead: string;
  seoKeywords: string[];
  challenges: string[];
  outcomes: string[];
  industries: string[];
  ctaTitle: string;
  ctaSub: string;
}

export function UseCasePage({ config }: { config: UseCaseConfig }) {
  const { enterApp, setMarketingView } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f7] text-[#0b1220]">
      {/* ─────── NAV ─────── */}
      <header className="bg-[#052e22] text-white sticky top-0 z-50 border-b border-[#0a3b2c]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => setMarketingView("main")}>
            <Logo variant="light" height={40} />
          </button>
          <nav className="hidden lg:flex items-center gap-7 text-sm text-gray-300">
            <button onClick={() => setMarketingView("main")} className="hover:text-white transition">
              Platform
            </button>
            <button onClick={() => setMarketingView("main")} className="hover:text-white transition">
              By Industry
            </button>
            <a href="#challenges" className="hover:text-white transition">Challenges</a>
            <a href="#cta" className="hover:text-white transition">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={enterApp}
              className="text-sm text-gray-300 hover:text-white transition hidden sm:block"
            >
              Login
            </button>
            <Button
              onClick={enterApp}
              className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full px-5 h-10 font-semibold shadow-sm"
            >
              Book a Demo <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─────── HERO ─────── */}
        <section className="bg-[#052e22] text-white py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setMarketingView("main")}
              className="text-[#16a34a] text-sm mb-8 inline-block hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to 2ndLife Platform
            </button>
            <Badge className="bg-[#16a34a]/20 text-[#16a34a] border-none mb-6">
              {config.eyebrow}
            </Badge>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight max-w-4xl">
              {config.headline} <span className="text-[#16a34a]">{config.headlineAccent}</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl">{config.subhead}</p>
            <Button
              size="lg"
              onClick={enterApp}
              className="bg-[#16a34a] hover:bg-[#15803d] text-white"
            >
              See It In Action <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            {/* SEO keywords as subtle chips */}
            <div className="mt-6 flex flex-wrap gap-2">
              {config.seoKeywords.map((k) => (
                <span key={k} className="text-[11px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                  {k}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── CHALLENGES ─────── */}
        <section id="challenges" className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">The challenge</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {config.challenges.map((c) => (
                <div key={c} className="flex items-start gap-3 text-red-600">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="font-medium">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── OUTCOMES ─────── */}
        <section className="bg-[#0a3b2c] text-white py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">The outcome with 2ndLife</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {config.outcomes.map((o) => (
                <div key={o} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
                  <span>{o}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── INDUSTRIES ─────── */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Built for every industry</h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {config.industries.map((ind) => (
                <Badge
                  key={ind}
                  variant="outline"
                  className="border-[#16a34a]/40 text-[#0a3b2c] text-sm px-3 py-1"
                >
                  {ind}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── CTA ─────── */}
        <section id="cta" className="bg-[#052e22] text-white py-20 px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">{config.ctaTitle}</h2>
          <p className="text-gray-300 mb-8">{config.ctaSub}</p>
          <Button
            size="lg"
            onClick={enterApp}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white"
          >
            Book Your Free Demo
          </Button>
          <div className="mt-6">
            <button
              onClick={() => setMarketingView("main")}
              className="text-sm text-gray-400 hover:text-white transition inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" /> Back to 2ndLife Platform
            </button>
          </div>
        </section>
      </main>

      {/* ─────── FOOTER ─────── */}
      <footer className="bg-[#031f17] text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p className="mb-4">
            We help businesses recover the revenue hiding in their systems — lapsed customers, stale
            leads, unpaid invoices, missed renewals and more.
          </p>
          <p>© 2025 NahaLabs (Pty) Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
