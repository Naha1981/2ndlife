"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Brain,
  MessageSquare,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/2ndlife/store";
import { Logo } from "../shared/logo";

export type SolutionIcon = "chat" | "card" | "brain" | "shield" | "chart";

export interface VerticalConfig {
  slug: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  subhead: string;
  problemTitle: string;
  problemSub: string;
  problemConsequence: string;
  problemBullets: string[];
  solutions: { icon: SolutionIcon; title: string; desc: string }[];
  howItWorks: { title: string; desc: string }[];
  ctaTitle: string;
  ctaSub: string;
  flagship?: boolean;
}

const iconMap: Record<SolutionIcon, LucideIcon> = {
  chat: MessageSquare,
  card: CreditCard,
  brain: Brain,
  shield: ShieldCheck,
  chart: BarChart3,
};

export function VerticalPage({ config }: { config: VerticalConfig }) {
  const { enterApp, setMarketingView } = useAppStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f7] text-[#0b1220]">
      {/* ─────── NAV ─────── */}
      <header className="bg-[#052e22] text-white sticky top-0 z-50 border-b border-[#0a3b2c]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => setMarketingView("main")}>
            <Logo variant="light" size="md" />
          </button>
          <nav className="hidden lg:flex items-center gap-7 text-sm text-gray-300">
            <button onClick={() => setMarketingView("main")} className="hover:text-white transition">
              Platform
            </button>
            <button onClick={() => setMarketingView("main")} className="hover:text-white transition">
              By Industry
            </button>
            <a href="#how" className="hover:text-white transition">How It Works</a>
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
              {config.flagship && <span className="ml-1">★ Flagship</span>}
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
          </div>
        </section>

        {/* ─────── PROBLEM ─────── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">{config.problemTitle}</h2>
            <p className="text-lg text-[#5c6b64] mb-8">{config.problemSub}</p>
            <p className="font-bold text-xl mb-6">{config.problemConsequence}</p>
            <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              {config.problemBullets.map((b) => (
                <div key={b} className="flex items-center gap-3 text-red-600">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── SOLUTION ─────── */}
        <section className="bg-[#0a3b2c] text-white py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-2 text-center">2ndLife Changes That.</h2>
            <p className="text-gray-300 mb-12 text-center">
              We turn recovery into a workflow — empathetic, automated, and measurable.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {config.solutions.map((s) => {
                const Icon = iconMap[s.icon];
                return (
                  <Card key={s.title} className="bg-[#052e22] border-[#14604a] text-white">
                    <CardContent className="p-6">
                      <Icon className="w-8 h-8 text-[#16a34a] mb-4" />
                      <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                      <p className="text-gray-300">{s.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─────── HOW IT WORKS ─────── */}
        <section id="how" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">How It Works</h2>
            <div className="grid md:grid-cols-5 gap-6">
              {config.howItWorks.map((step, i) => (
                <div key={step.title} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#e9f6ee] text-[#16a34a] flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                    {i + 1}
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[#5c6b64]">{step.desc}</p>
                </div>
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
