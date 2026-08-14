"use client";

import { Logo } from "../shared/logo";
import { useAppStore } from "@/lib/2ndlife/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  Menu,
} from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

const TIERS = [
  {
    name: "Starter",
    price: "R0",
    period: "/month",
    billing: "10% of recovered revenue",
    features: [
      "Up to 2,500 active contacts/month",
      "AI WhatsApp conversations",
      "Ozow Instant EFT",
      "Core dashboard",
      "Email support",
    ],
    cta: "Book a Demo",
    highlight: false,
  },
  {
    name: "Growth",
    price: "R2,495",
    period: "/month",
    billing: "+ 7% of recovered revenue",
    features: [
      "Up to 10,000 contacts",
      "Everything in Starter",
      "Campaign analytics & exports",
      "CRM/billing imports",
      "Priority support",
    ],
    cta: "Book a Demo",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    billing: "Talk to our team",
    features: [
      "Unlimited contacts",
      "Dedicated success manager",
      "Custom vertical configurations",
      "SLA + POPIA DPA",
      "Onboarding & training",
    ],
    cta: "Talk to Sales",
    highlight: false,
  },
];

const FAQ = [
  {
    q: "What counts as recovered revenue?",
    a: "Only verified payments — money that actually landed in your bank account via a confirmed payment webhook. No estimates, no projections.",
  },
  {
    q: "What if nothing is recovered?",
    a: "On Starter you pay nothing. If we don't recover revenue, you don't pay a percentage. The platform is still yours to use.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — no long-term contracts. Cancel anytime, no penalties, no lock-in. We earn your business every month.",
  },
  {
    q: "Is my data safe?",
    a: "POPIA-compliant by design. Context minimization ensures AI receives only task-relevant fields. Full audit trail on every action.",
  },
];

export function PricingPage() {
  const { enterApp, setMarketingView } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const goToView = (view: string) => {
    setMarketingView(view);
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f7] text-[#0b1220]">
      {/* ─────── NAV ─────── */}
      <header className="bg-[#052e22] text-white sticky top-0 z-50 border-b border-[#0a3b2c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => goToView("main")}>
            <Logo variant="light" height={40} />
          </button>
          <nav className="hidden lg:flex items-center gap-7 text-sm text-gray-300">
            <button onClick={() => goToView("main")} className="hover:text-white transition">Product</button>
            <button onClick={() => goToView("main")} className="hover:text-white transition">By Industry</button>
            <button onClick={() => goToView("pricing")} className="hover:text-white transition text-white font-semibold">Pricing</button>
            <button onClick={() => goToView("company")} className="hover:text-white transition">Company</button>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={enterApp} className="text-sm text-gray-300 hover:text-white transition hidden sm:block">
              Login
            </button>
            <Button onClick={enterApp} className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full px-5 h-10 font-semibold">
              Book a Demo <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition">
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" aria-describedby={undefined} className="w-[280px] bg-[#052e22] border-[#0a3b2c] text-white">
                <SheetHeader>
                  <SheetTitle className="text-white"><Logo variant="light" height={32} /></SheetTitle>
                  <SheetDescription className="sr-only">Navigation menu</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  <button onClick={() => goToView("main")} className="text-left px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm">Product</button>
                  <button onClick={() => goToView("pricing")} className="text-left px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm font-semibold text-white">Pricing</button>
                  <button onClick={() => goToView("company")} className="text-left px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm">Company</button>
                  <button onClick={() => goToView("legal-popia")} className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-gray-300">POPIA</button>
                  <button onClick={() => goToView("legal-privacy")} className="text-left px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-gray-300">Privacy</button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─────── HERO ─────── */}
        <section className="bg-[#052e22] text-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-[#16a34a]/20 text-[#16a34a] border-none mb-6">Pricing</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Pay for results, not promises.
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              No setup fees. No long-term contracts. Every plan starts with a free demo on your own data.
            </p>
          </div>
        </section>

        {/* ─────── TIERS ─────── */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <Card
                key={tier.name}
                className={`relative flex flex-col ${
                  tier.highlight
                    ? "border-[#16a34a] border-2 shadow-lg scale-105"
                    : "border-[#e4eae6]"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#16a34a] text-white text-xs font-bold px-3 py-1">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-[#0b1220] mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-extrabold text-[#0b1220]">{tier.price}</span>
                    <span className="text-sm text-[#5c6b64]">{tier.period}</span>
                  </div>
                  <p className="text-sm text-[#16a34a] font-semibold mb-4">{tier.billing}</p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-[#0b1220]">
                        <Check className="w-4 h-4 text-[#16a34a] flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={enterApp}
                    className={`w-full ${
                      tier.highlight
                        ? "bg-[#16a34a] hover:bg-[#15803d] text-white"
                        : "bg-white border border-[#e4eae6] text-[#0b1220] hover:bg-[#f6f8f7]"
                    }`}
                  >
                    {tier.cta} <ArrowRight className="ml-1.5 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─────── HOW IT WORKS STRIP ─────── */}
        <section className="bg-[#0a3b2c] text-white py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              How pay-only-for-results works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: 1, title: "We recover", desc: "AI engages your lapsed customers and collects payment via verified webhooks." },
                { n: 2, title: "You pay a percentage", desc: "Only on revenue that actually lands in your bank — not promises, not projections." },
                { n: 3, title: "Only when money lands", desc: "Verified payment webhook confirms recovery. No verification = no fee." },
              ].map((step) => (
                <div key={step.n} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[#16a34a] text-white font-bold flex items-center justify-center mx-auto mb-3">
                    {step.n}
                  </div>
                  <h3 className="font-bold mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-300">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── FAQ ─────── */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently asked questions</h2>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <Card key={item.q} className="border-[#e4eae6]">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-[#0b1220] mb-2 text-sm">{item.q}</h3>
                    <p className="text-sm text-[#5c6b64] leading-relaxed">{item.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── CTA ─────── */}
        <section className="bg-[#052e22] text-white py-20 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start with a free demo on your data.</h2>
          <p className="text-gray-300 mb-8">See exactly how much revenue 2ndLife can recover for you — before you pay anything.</p>
          <Button onClick={enterApp} size="lg" className="bg-[#16a34a] hover:bg-[#15803d] text-white">
            Book Your Free Demo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </section>
      </main>

      {/* ─────── FOOTER ─────── */}
      <footer className="bg-[#031f17] text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <Logo variant="light" height={32} className="mx-auto mb-4" />
          <p className="mb-4">
            We help businesses recover the revenue hiding in their systems — lapsed customers, stale leads, unpaid invoices, missed renewals and more.
          </p>
          <p>© 2025 NahaLabs (Pty) Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
