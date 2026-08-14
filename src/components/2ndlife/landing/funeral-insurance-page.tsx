"use client";

import { Logo } from "../shared/logo";
import { useAppStore } from "@/lib/2ndlife/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ArrowLeft,
  FileText,
  Brain,
  MessageSquare,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export function FuneralInsurancePage() {
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
            <a href="#company" className="hover:text-white transition">Contact</a>
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
              For Funeral Administrators &amp; Micro-Insurers
            </Badge>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight max-w-4xl">
              Recover Lapsed <span className="text-[#16a34a]">Funeral Policies</span> Automatically.
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl">
              Stop relying on manual call centers. 2ndLife uses empathetic AI to re-engage lapsed members and recover premiums instantly via WhatsApp.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={enterApp}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white"
              >
                See It In Action <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* ─────── PROBLEM ─────── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Every lapsed policy is revenue you&apos;ve already earned.</h2>
            <p className="text-lg text-[#5c6b64] mb-8">
              Debit orders fail. People&apos;s circumstances change. But the need for cover doesn&apos;t.
            </p>
            <p className="font-bold text-xl mb-6">The result?</p>
            <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              {[
                "Millions in lost premium",
                "High call centre costs",
                "Manual, time-consuming follow-ups",
                "Low reactivation rates",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-red-600">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-medium">{item}</span>
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
              We turn policy recovery into a workflow — empathetic, automated, and measurable.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-[#052e22] border-[#14604a] text-white">
                <CardContent className="p-6">
                  <MessageSquare className="w-8 h-8 text-[#16a34a] mb-4" />
                  <h3 className="text-xl font-bold mb-2">AI WhatsApp Conversations</h3>
                  <p className="text-gray-300">
                    Empathetic conversations that feel human. AI handles objections, explains arrears, and offers restructuring.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#052e22] border-[#14604a] text-white">
                <CardContent className="p-6">
                  <CreditCard className="w-8 h-8 text-[#f59e0b] mb-4" />
                  <h3 className="text-xl font-bold mb-2">Instant EFT via Ozow</h3>
                  <p className="text-gray-300">
                    Customers pay via Ozow Instant EFT right inside the WhatsApp chat. No debit orders, no friction.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#052e22] border-[#14604a] text-white">
                <CardContent className="p-6">
                  <Brain className="w-8 h-8 text-[#16a34a] mb-4" />
                  <h3 className="text-xl font-bold mb-2">Smart Prioritization</h3>
                  <p className="text-gray-300">
                    We score your lapsed book to find the members most likely to restart, saving your human team for complex cases.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-[#052e22] border-[#14604a] text-white">
                <CardContent className="p-6">
                  <ShieldCheck className="w-8 h-8 text-[#f59e0b] mb-4" />
                  <h3 className="text-xl font-bold mb-2">POPIA Compliant</h3>
                  <p className="text-gray-300">
                    Built for South African regulations. Context minimization ensures member data is secure and consent is honored instantly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ─────── HOW IT WORKS (Insurance Specific) ─────── */}
        <section id="how" className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">How Policy Recovery Works</h2>
            <div className="grid md:grid-cols-5 gap-6">
              {[
                { icon: FileText, title: "Upload", desc: "Upload your lapsed policy list as a CSV." },
                { icon: Brain, title: "Score", desc: "We rank and segment the best recovery opportunities." },
                { icon: MessageSquare, title: "Engage", desc: "AI starts empathetic WhatsApp conversations." },
                { icon: CreditCard, title: "Collect", desc: "Customers pay via Ozow Instant EFT." },
                { icon: ShieldCheck, title: "Reactivate", desc: "Policy reinstated. Revenue recovered." },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-[#e9f6ee] text-[#16a34a] flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                    {i + 1}
                  </div>
                  <step.icon className="w-6 h-6 mx-auto mb-2 text-[#0a3b2c]" />
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-[#5c6b64]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── TESTIMONIAL ─────── */}
        <section className="py-20 px-6 bg-[#f6f8f7]">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border-[#e4eae6] shadow-sm">
              <CardContent className="p-8 md:p-12 text-center">
                <p className="text-2xl font-medium italic mb-6 text-[#0b1220]">
                  &ldquo;2ndLife has transformed how we handle lapsed policies. In just 60 days, we recovered over R1.2 million in premium with a fraction of our call centre costs.&rdquo;
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#0a3b2c] flex items-center justify-center text-white font-bold">
                    SM
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Sibusiso M.</p>
                    <p className="text-sm text-[#5c6b64]">Operations Manager, Funeral Secure</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 border-t border-[#e4eae6] pt-8 mt-8">
                  <div>
                    <p className="text-3xl font-bold text-[#16a34a]">R1.2M+</p>
                    <p className="text-xs text-[#5c6b64]">Recovered in 60 days</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#16a34a]">38%</p>
                    <p className="text-xs text-[#5c6b64]">Reactivation Rate</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#16a34a]">70%</p>
                    <p className="text-xs text-[#5c6b64]">Lower Cost vs Call Centre</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─────── CTA ─────── */}
        <section id="company" className="bg-[#052e22] text-white py-20 px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to reactivate your lapsed book?</h2>
          <p className="text-gray-300 mb-8">
            Join forward-thinking administrators who are recovering more, spending less, and growing stronger.
          </p>
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
            We help funeral administrators recover lapsed policies, re-engage members, and unlock lost premium revenue.
          </p>
          <p>© 2025 NahaLabs (Pty) Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
