"use client";

import { Logo } from "../shared/logo";
import { useAppStore } from "@/lib/2ndlife/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  CheckCircle2,
  ArrowRight,
  Upload,
  Brain,
  MessageSquare,
  CreditCard,
  BarChart3,
  ChevronDown,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { verticalOrder, verticalLabels, verticals } from "@/lib/2ndlife/verticals";
import { useCaseOrder, useCaseLabels } from "@/lib/2ndlife/use-cases";

export function LandingPage() {
  const { enterApp, setMarketingView } = useAppStore();
  const [industryOpen, setIndustryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Navigate to a section on the home view.
   * If we're not on home, switch first, then scroll after render.
   */
  const goToSection = useCallback(
    (sectionId: string) => {
      setMarketingView("main");
      setMobileOpen(false);
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    [setMarketingView]
  );

  const goToView = useCallback(
    (view: string) => {
      setMarketingView(view);
      setMobileOpen(false);
      window.scrollTo({ top: 0 });
    },
    [setMarketingView]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f7] text-[#0b1220] overflow-x-hidden">
      {/* ─────── NAV ─────── */}
      <header className="bg-[#052e22] text-white sticky top-0 z-50 border-b border-[#0a3b2c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => goToView("main")} className="shrink-0">
            <Logo variant="light" height={36} className="lg:!hidden" />
            <Logo variant="light" height={44} className="hidden lg:!block" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7 text-sm text-gray-300">
            <button onClick={() => goToSection("product")} className="hover:text-white transition">
              Product
            </button>
            {/* By Industry dropdown */}
            <div className="relative">
              <button
                onClick={() => setIndustryOpen((o) => !o)}
                onBlur={() => setTimeout(() => setIndustryOpen(false), 150)}
                className="hover:text-white transition flex items-center gap-1"
              >
                By Industry <ChevronDown size={14} className={`transition ${industryOpen ? "rotate-180" : ""}`} />
              </button>
              {industryOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#e4eae6] py-2 z-50 max-h-[80vh] overflow-y-auto">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#5c6b64] uppercase tracking-wider sticky top-0 bg-white">
                    By Industry
                  </div>
                  {verticalOrder.map((slug) => {
                    const cfg = verticals[slug];
                    return (
                      <button
                        key={slug}
                        onClick={() => {
                          goToView(`vertical:${slug}`);
                          setIndustryOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#e9f6ee] transition flex items-center justify-between group"
                      >
                        <span className="text-sm text-[#0b1220] font-medium">{verticalLabels[slug]}</span>
                        {cfg.flagship && (
                          <Badge className="bg-[#16a34a] text-white text-[9px] h-4 px-1.5">Flagship</Badge>
                        )}
                      </button>
                    );
                  })}
                  <div className="border-t border-[#e4eae6] mt-1 pt-1 sticky bottom-0 bg-white">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-[#5c6b64] uppercase tracking-wider">
                      By Use Case
                    </div>
                    {useCaseOrder.map((slug) => (
                      <button
                        key={slug}
                        onClick={() => {
                          goToView(`use-case:${slug}`);
                          setIndustryOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#e9f6ee] transition"
                      >
                        <span className="text-sm text-[#0b1220] font-medium">{useCaseLabels[slug]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => goToView("pricing")} className="hover:text-white transition">
              Pricing
            </button>
            <button onClick={() => goToView("company")} className="hover:text-white transition">
              Company
            </button>
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-gray-300 hover:text-white transition font-medium px-2 py-1 hidden sm:block"
            >
              Login
            </Link>
            <Button
              asChild
              className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full px-4 sm:px-5 h-9 sm:h-10 font-semibold shadow-sm text-xs sm:text-sm cursor-pointer"
            >
              <Link href="/sign-up">
                Get Started <ArrowRight className="ml-1 w-3.5 h-3.5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={enterApp}
              className="border-emerald-700/80 bg-transparent text-gray-200 hover:bg-white/10 hover:text-white rounded-full px-3.5 h-9 sm:h-10 font-medium text-xs hidden md:flex"
            >
              Book Demo
            </Button>

            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition">
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" aria-describedby={undefined} className="w-[300px] bg-[#052e22] border-[#0a3b2c] text-white overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-white">
                    <Logo variant="light" height={32} />
                  </SheetTitle>
                  <SheetDescription className="sr-only">Navigation menu</SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  <button
                    onClick={() => goToSection("product")}
                    className="text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition text-sm font-medium"
                  >
                    Product
                  </button>
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">
                    By Industry
                  </div>
                  {verticalOrder.map((slug) => (
                    <button
                      key={slug}
                      onClick={() => goToView(`vertical:${slug}`)}
                      className="text-left px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm flex items-center justify-between"
                    >
                      {verticalLabels[slug]}
                      {verticals[slug].flagship && <span className="text-[10px] text-[#16a34a]">★</span>}
                    </button>
                  ))}
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">
                    By Use Case
                  </div>
                  {useCaseOrder.map((slug) => (
                    <button
                      key={slug}
                      onClick={() => goToView(`use-case:${slug}`)}
                      className="text-left px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm"
                    >
                      {useCaseLabels[slug]}
                    </button>
                  ))}
                  <div className="border-t border-[#0a3b2c] mt-2 pt-2">
                    <button
                      onClick={() => goToView("pricing")}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition text-sm font-medium"
                    >
                      Pricing
                    </button>
                    <button
                      onClick={() => goToView("company")}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 transition text-sm font-medium"
                    >
                      Company
                    </button>
                    <button
                      onClick={() => goToView("legal-popia")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm text-gray-300"
                    >
                      POPIA
                    </button>
                    <button
                      onClick={() => goToView("legal-privacy")}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition text-sm text-gray-300"
                    >
                      Privacy
                    </button>
                  </div>
                  <div className="border-t border-[#0a3b2c] mt-2 pt-3 px-1 space-y-2">
                    <Button
                      asChild
                      className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold"
                    >
                      <Link href="/sign-up">
                        Get Started Free <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      onClick={() => {
                        enterApp();
                        setMobileOpen(false);
                      }}
                      variant="outline"
                      className="w-full border-gray-600 bg-transparent text-white hover:bg-white/10"
                    >
                      Book a Demo
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ─────── HERO ─────── */}
        <section className="bg-[#052e22] text-white py-20 lg:py-24 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <Badge className="bg-[#16a34a]/20 text-[#16a34a] border-none mb-6">
              Revenue Recovery Intelligence
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Give Your Revenue a <span className="text-[#16a34a]">Second Life.</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              2ndLife finds the revenue hiding in your existing systems and helps you recover it — automatically.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {["Detect lost customers", "Prioritize what matters", "Engage at the right time", "Recover more revenue"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-200">
                  <CheckCircle2 className="w-4 h-4 text-[#16a34a]" /> {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-8 shadow-xl shadow-emerald-950/40 cursor-pointer"
              >
                <Link href="/sign-up">
                  Start Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={enterApp}
                className="bg-transparent border-gray-600 text-white hover:bg-white/10"
              >
                Book a Demo
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => goToSection("how-it-works")}
                className="text-gray-300 hover:text-white hover:bg-white/5"
              >
                See How It Works
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-8">Secure. Compliant. Built for South African Businesses.</p>
          </div>
        </section>

        {/* ─────── TRUST STRIP ─────── */}
        <section className="border-b border-[#e4eae6] py-8 bg-white">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm text-[#5c6b64] mb-6">
              Proven in SA&apos;s toughest recovery market — funeral insurance. Built for every recurring-revenue business.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale">
              {["Funeral Secure", "Ubuntu Life", "Careway", "SA Comfort", "Umoja"].map((logo) => (
                <span key={logo} className="text-lg font-bold text-gray-500">{logo}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── PROBLEM ─────── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Every lost customer is revenue you&apos;ve already earned.</h2>
            <p className="text-lg text-[#5c6b64] mb-8">
              Debit orders fail. Trials end. Quotes go cold. Invoices go unpaid. The intent was real — the follow-up wasn&apos;t.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              {["Millions in lost revenue", "High manual follow-up costs", "Time-consuming processes", "Low win-back rates"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-red-600">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── SOLUTION (#product) ─────── */}
        <section id="product" className="bg-[#0a3b2c] text-white py-20 px-6 scroll-mt-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">2ndLife Changes That.</h2>
            <p className="text-gray-300 mb-12 text-center">We turn recovery into a workflow — empathetic, automated, and measurable.</p>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-[#052e22] border-[#14604a] text-white">
                <CardContent className="p-6">
                  <MessageSquare className="w-8 h-8 text-[#16a34a] mb-4" />
                  <h3 className="text-xl font-bold mb-2">AI WhatsApp Conversations</h3>
                  <p className="text-gray-300">Empathetic, smart conversations that re-engage customers and handle objections — at scale, 24/7.</p>
                </CardContent>
              </Card>
              <Card className="bg-[#052e22] border-[#14604a] text-white">
                <CardContent className="p-6">
                  <CreditCard className="w-8 h-8 text-[#f59e0b] mb-4" />
                  <h3 className="text-xl font-bold mb-2">Instant Payments</h3>
                  <p className="text-gray-300">Customers pay via Ozow or Stripe right inside the chat. No debit orders, no card-on-file friction.</p>
                </CardContent>
              </Card>
              <Card className="bg-[#052e22] border-[#14604a] text-white">
                <CardContent className="p-6">
                  <Brain className="w-8 h-8 text-[#16a34a] mb-4" />
                  <h3 className="text-xl font-bold mb-2">Smart Workflows</h3>
                  <p className="text-gray-300">Algorithms that prioritize what recovers. Focus your human team only on high-value escalations.</p>
                </CardContent>
              </Card>
              <Card className="bg-[#052e22] border-[#14604a] text-white">
                <CardContent className="p-6">
                  <BarChart3 className="w-8 h-8 text-[#f59e0b] mb-4" />
                  <h3 className="text-xl font-bold mb-2">Actionable Insights</h3>
                  <p className="text-gray-300">Know exactly what&apos;s working, what&apos;s not, and where to focus next. Reports that actually help you decide.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ─────── HOW IT WORKS (#how-it-works) ─────── */}
        <section id="how-it-works" className="py-20 px-6 bg-white scroll-mt-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">How 2ndLife Works</h2>
            <div className="grid md:grid-cols-5 gap-6">
              {[
                { icon: Upload, title: "Upload", desc: "Upload your list: lapsed customers, stale quotes, failed payments." },
                { icon: Brain, title: "Score", desc: "We rank and segment the best opportunities." },
                { icon: MessageSquare, title: "Engage", desc: "AI starts empathetic WhatsApp conversations." },
                { icon: CreditCard, title: "Collect", desc: "Customers pay via Instant EFT or Card." },
                { icon: CheckCircle2, title: "Win Back", desc: "Customer won back. Payment verified. Revenue recovered." },
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

        {/* ─────── TESTIMONIAL (#proof) ─────── */}
        <section id="proof" className="py-20 px-6 bg-[#f6f8f7] scroll-mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-4 gap-2">
              <Badge variant="outline" className="border-[#16a34a] text-[#16a34a]">Flagship Case Study</Badge>
              <Badge variant="outline" className="border-[#e4eae6] text-[#5c6b64]">Funeral Insurance</Badge>
            </div>
            <div className="text-center mb-2 text-sm text-[#5c6b64]">
              Also built for: Subscriptions · Financial Services · Education · Healthcare · Retail · B2B
            </div>
            <Card className="bg-white border-[#e4eae6] shadow-sm">
              <CardContent className="p-8 md:p-12 text-center">
                <p className="text-xl md:text-2xl font-medium italic mb-6 text-[#0b1220]">
                  &ldquo;2ndLife has transformed how we handle lapsed policies. In just 60 days, we recovered over R1.2 million in premium with a fraction of our call centre costs.&rdquo;
                </p>
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-[#0a3b2c] flex items-center justify-center text-white font-bold">SM</div>
                  <div className="text-left">
                    <p className="font-bold">Sibusiso M.</p>
                    <p className="text-sm text-[#5c6b64]">Operations Manager, Funeral Secure</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-[#e4eae6] pt-8">
                  <div>
                    <p className="text-xl md:text-3xl font-bold text-[#16a34a]">R1.2M+</p>
                    <p className="text-[10px] sm:text-xs text-[#5c6b64]">Recovered in 60 days</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-3xl font-bold text-[#16a34a]">38%</p>
                    <p className="text-[10px] sm:text-xs text-[#5c6b64]">Reactivation Rate</p>
                  </div>
                  <div>
                    <p className="text-xl md:text-3xl font-bold text-[#16a34a]">70%</p>
                    <p className="text-[10px] sm:text-xs text-[#5c6b64]">Lower Cost vs Call Centre</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => goToView("vertical:funeral-insurance")}
                    className="border-[#16a34a] text-[#16a34a] hover:bg-[#e9f6ee]"
                  >
                    Read the full funeral insurance case study <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ─────── CTA ─────── */}
        <section className="bg-[#052e22] text-white py-20 px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to give your revenue a second life?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join forward-thinking businesses recovering lapsed customers, winning back abandoned carts, and collecting overdue invoices.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-8 shadow-xl shadow-emerald-950/40 cursor-pointer"
            >
              <Link href="/sign-up">
                Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={enterApp}
              className="bg-transparent border-gray-600 text-white hover:bg-white/10"
            >
              Book Your Free Demo
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-6">No setup fees · No long-term contracts · 14-day free trial</p>
        </section>
      </main>

      {/* ─────── FOOTER ─────── */}
      <footer className="bg-[#031f17] text-gray-400 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Logo variant="light" height={40} />
              <p className="mt-3 text-xs leading-relaxed">
                We help businesses recover the revenue hiding in their systems — lapsed customers, stale leads, unpaid invoices, missed renewals and more.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">By Industry</h4>
              <ul className="space-y-2 text-sm">
                {verticalOrder.map((slug) => (
                  <li key={slug}>
                    <button
                      onClick={() => goToView(`vertical:${slug}`)}
                      className="hover:text-white transition text-left flex items-center gap-1.5"
                    >
                      {verticalLabels[slug]}
                      {verticals[slug].flagship && (
                        <span className="text-[10px] text-[#16a34a]">★</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">By Use Case</h4>
              <ul className="space-y-2 text-sm">
                {useCaseOrder.map((slug) => (
                  <li key={slug}>
                    <button
                      onClick={() => goToView(`use-case:${slug}`)}
                      className="hover:text-white transition text-left"
                    >
                      {useCaseLabels[slug]}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => goToView("company")} className="hover:text-white transition text-left">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => goToView("company#contact")} className="hover:text-white transition text-left">
                    Contact
                  </button>
                </li>
                <li>
                  <button onClick={() => goToView("legal-popia")} className="hover:text-white transition text-left">
                    POPIA
                  </button>
                </li>
                <li>
                  <button onClick={() => goToView("legal-privacy")} className="hover:text-white transition text-left">
                    Privacy
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#0a3b2c] pt-6 text-center text-sm">
            <p>© 2025 NahaLabs (Pty) Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
