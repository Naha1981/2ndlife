"use client";

import { Logo } from "../shared/logo";
import { Icon } from "../shared/icon";
import { useAppStore } from "@/lib/2ndlife/store";
import { clientLogos, features, steps } from "@/lib/2ndlife/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function LandingPage() {
  const enterApp = useAppStore((s) => s.enterApp);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ─────── NAV ─────── */}
      <header className="bg-brand-950 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <Logo variant="light" size="md" />
          <nav className="hidden lg:flex items-center gap-7 text-sm text-brand-100/90">
            <a href="#product" className="hover:text-white transition">Product</a>
            <a href="#solution" className="hover:text-white transition">Solutions</a>
            <a href="#features" className="hover:text-white transition">By Industry</a>
            <a href="#how" className="hover:text-white transition">Pricing</a>
            <a href="#resources" className="hover:text-white transition">Resources</a>
            <a href="#company" className="hover:text-white transition">Company</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={enterApp}
              className="text-sm text-brand-100/90 hover:text-white transition hidden sm:block"
            >
              Login
            </button>
            <Button
              onClick={enterApp}
              className="bg-brand-500 hover:bg-brand-600 text-white rounded-full px-5 h-10 font-semibold shadow-sm"
            >
              Book a Demo <Icon name="arrow" size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* ─────── HERO ─────── */}
      <section className="bg-brand-950 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(22,163,74,0.6) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(52,211,153,0.4) 0%, transparent 40%)",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center relative">
          <div className="animate-fade-up">
            <Badge className="bg-brand-500/15 text-brand-200 border border-brand-500/30 mb-6 backdrop-blur-sm">
              <Icon name="spark" size={12} className="mr-1" /> Revenue Recovery Intelligence
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
              Give Your Revenue{" "}
              <span className="text-brand-400">a Second Life.</span>
            </h1>
            <p className="text-lg lg:text-xl text-brand-100/80 mb-8 max-w-xl leading-relaxed">
              2ndLife finds the revenue hiding in your existing systems and helps you recover it — automatically.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Detect lost opportunities",
                "Prioritize what matters",
                "Engage at the right time",
                "Recover more revenue",
              ].map((b) => (
                <li key={b} className="flex items-center gap-3 text-brand-100">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500">
                    <Icon name="check" size={12} className="text-white" />
                  </span>
                  <span className="text-base">{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={enterApp}
                size="lg"
                className="bg-brand-500 hover:bg-brand-600 text-white rounded-full px-7 h-12 font-semibold shadow-lg shadow-brand-500/25"
              >
                Book a Demo <Icon name="arrow" size={18} className="ml-1" />
              </Button>
              <Button
                onClick={enterApp}
                size="lg"
                variant="outline"
                className="bg-transparent border-brand-400/40 text-brand-100 hover:bg-brand-900 hover:text-white rounded-full px-7 h-12"
              >
                See How It Works <Icon name="arrow" size={18} className="ml-1" />
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-8 text-xs text-brand-200/70">
              <Icon name="lock" size={14} />
              <span>Secure. Compliant. Built for South African Businesses.</span>
            </div>
          </div>

          {/* Hero dashboard mockup */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-brand-700/40 bg-white">
              <HeroDashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─────── CLIENT LOGO STRIP ─────── */}
      <section className="py-12 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold mb-8">
            Trusted by leading insurers and administrators
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {clientLogos.map((name) => (
              <div
                key={name}
                className="text-xl font-bold text-muted-foreground/60 hover:text-muted-foreground transition grayscale"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────── PROBLEM / SOLUTION ─────── */}
      <section id="solution" className="py-20 bg-brand-50/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Problem */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4 leading-tight">
                Every lapsed policy is revenue you&apos;ve{" "}
                <span className="text-brand-600">already earned.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Debit orders fail. People&apos;s circumstances change. But the need for cover doesn&apos;t.
              </p>
              <Card className="p-6 bg-white border-destructive/20">
                <p className="font-semibold text-ink mb-4">The result?</p>
                <ul className="space-y-3">
                  {[
                    "Millions in lost premium",
                    "High call centre costs",
                    "Manual, time-consuming follow-ups",
                    "Low reactivation rates",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm text-ink">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive/10 mt-0.5">
                        <Icon name="x" size={12} className="text-destructive" />
                      </span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Solution */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-ink mb-4 leading-tight">
                <span className="text-brand-600">2ndLife</span> Changes That.
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                We turn recovery into a workflow — empathetic, automated, and measurable.
              </p>
              <Card className="p-6 bg-white border-brand-500/20">
                <ul className="space-y-3 mb-6">
                  {[
                    "AI-powered WhatsApp conversations that feel human",
                    "Instant EFT payments via Ozow (no debit orders needed)",
                    "Smart workflows that prioritize what recovers",
                    "Recover more. Spend less. Grow sustainably.",
                  ].map((s) => (
                    <li key={s} className="flex items-start gap-3 text-sm text-ink">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500/10 mt-0.5">
                        <Icon name="check" size={12} className="text-brand-600" />
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={enterApp}
                  className="bg-brand-500 hover:bg-brand-600 text-white rounded-full w-full h-11"
                >
                  See 2ndLife in Action <Icon name="arrow" size={16} className="ml-1" />
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ─────── FEATURES ─────── */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-center text-ink mb-4 leading-tight">
            Everything you need to{" "}
            <span className="text-brand-600">recover revenue—smarter.</span>
          </h2>
          <p className="text-center text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
            From the first lapsed policy to the verified payment, 2ndLife handles every step.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {features.map((f, i) => (
              <Card
                key={f.title}
                className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-border bg-white"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center mb-4">
                  <Icon name={f.icon} size={22} className="text-brand-600" />
                </div>
                <h3 className="font-bold text-ink mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─────── HOW IT WORKS ─────── */}
      <section id="how" className="py-20 bg-brand-50/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-center text-ink mb-12">
            How <span className="text-brand-600">2ndLife</span> Works
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-3">
            {steps.map((s, i) => (
              <div key={s.n} className="text-center relative">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-lg shadow-md">
                    {s.n}
                  </div>
                </div>
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-border flex items-center justify-center mb-3 shadow-sm">
                  <Icon name={s.icon} size={26} className="text-brand-600" />
                </div>
                <h3 className="font-bold text-ink text-base mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[55%] right-[-45%] h-px bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────── TESTIMONIAL ─────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-brand-950 rounded-2xl overflow-hidden grid lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <div className="text-brand-400 text-6xl font-serif leading-none mb-4">&ldquo;</div>
              <p className="text-white text-xl lg:text-2xl font-medium leading-relaxed mb-8">
                2ndLife has transformed how we handle lapsed policies. In just 60 days, we recovered over{" "}
                <span className="text-brand-400 font-bold">R1.2 million</span> in premium with a fraction of our call centre costs.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-700 flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div>
                  <div className="text-white font-semibold">Sibusiso M.</div>
                  <div className="text-brand-200/70 text-sm">Operations Manager, Funeral Secure</div>
                </div>
              </div>
            </div>
            <div className="bg-brand-900 p-8 lg:p-12 flex flex-col justify-center gap-8">
              {[
                { v: "R1.2M+", l: "Recovered in 60 days" },
                { v: "38%", l: "Reactivation Rate" },
                { v: "70%", l: "Lower Cost vs Call Centre" },
              ].map((s) => (
                <div key={s.l} className="flex items-baseline gap-6">
                  <div className="text-brand-400 text-5xl lg:text-6xl font-extrabold tnum">{s.v}</div>
                  <div className="text-brand-100/80 text-sm flex-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────── PRE-FOOTER CTA ─────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="bg-brand-500 rounded-2xl overflow-hidden grid lg:grid-cols-2">
            <div className="p-8 lg:p-12 text-white">
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">
                Ready to give your revenue a second life?
              </h2>
              <p className="text-white/85 text-lg mb-6 leading-relaxed">
                Join forward-thinking insurers who are recovering more, spending less, and growing stronger.
              </p>
              <Button
                onClick={enterApp}
                className="bg-white text-brand-700 hover:bg-brand-50 rounded-full h-12 px-7 font-semibold shadow-lg"
              >
                Book Your Free Demo <Icon name="arrow" size={18} className="ml-1" />
              </Button>
              <ul className="mt-6 space-y-2">
                {["No setup fees", "No long-term contracts", "Pay only for results"].map((b) => (
                  <li key={b} className="flex items-center gap-2 text-white/90 text-sm">
                    <Icon name="check" size={14} /> {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-600 p-8 lg:p-12 flex items-center">
              <ChatDemoCard />
            </div>
          </div>
        </div>
      </section>

      {/* ─────── FOOTER ─────── */}
      <footer id="company" className="bg-brand-950 text-brand-100/70 mt-auto">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 md:col-span-3 lg:col-span-1">
              <Logo variant="light" size="md" showTagline={false} />
              <p className="mt-3 text-sm leading-relaxed">
                We help insurers recover lapsed policies, re-engage customers, and unlock lost revenue.
              </p>
              <div className="flex gap-3 mt-4">
                <div className="w-8 h-8 rounded border border-brand-700 flex items-center justify-center hover:bg-brand-900 cursor-pointer transition">
                  <span className="text-xs font-bold">in</span>
                </div>
                <div className="w-8 h-8 rounded border border-brand-700 flex items-center justify-center hover:bg-brand-900 cursor-pointer transition">
                  <span className="text-xs font-bold">𝕏</span>
                </div>
                <div className="w-8 h-8 rounded border border-brand-700 flex items-center justify-center hover:bg-brand-900 cursor-pointer transition">
                  <Icon name="play" size={12} />
                </div>
              </div>
            </div>
            {[
              { h: "Product", items: ["Features", "Integrations", "Pricing", "Security"] },
              { h: "Solutions", items: ["For Insurers", "For Administrators", "By Use Case", "Success Stories"] },
              { h: "Resources", items: ["Blog", "Guides", "Webinars", "Help Center"] },
              { h: "Company", items: ["About Us", "Careers", "Partners", "Contact Us"] },
            ].map((col) => (
              <div key={col.h}>
                <h4 className="text-white font-semibold text-sm mb-3">{col.h}</h4>
                <ul className="space-y-2 text-sm">
                  {col.items.map((it) => (
                    <li key={it}>
                      <a href="#" className="hover:text-white transition">{it}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-brand-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div>© 2025 NahaLabs (Pty) Ltd. All rights reserved.</div>
            <div className="flex gap-5">
              <a href="#" className="hover:text-white transition">POPIA Compliant</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────── Inline sub-components ─────────── */

function HeroDashboardPreview() {
  return (
    <div className="bg-white">
      {/* Mini sidebar */}
      <div className="flex">
        <div className="w-[120px] bg-brand-900 p-3 hidden sm:block">
          <div className="text-white font-bold text-sm mb-3">2ndLife</div>
          <div className="space-y-1">
            {["Dashboard", "Campaigns", "Conversations", "Payments", "Policies", "Contacts", "Reports", "Settings"].map((it, i) => (
              <div
                key={it}
                className={`text-[10px] px-2 py-1 rounded ${
                  i === 0 ? "bg-brand-500 text-white font-semibold" : "text-brand-100/70"
                }`}
              >
                {it}
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 bg-brand-50/40">
          <div className="mb-3">
            <div className="text-base font-bold text-ink">Welcome back, Nomsa! 👋</div>
            <div className="text-[10px] text-muted-foreground">Here&apos;s your recovery snapshot.</div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
            {[
              { l: "Revenue Recovered", v: "R1,248,750", d: "+18.6%" },
              { l: "Policies Reactivated", v: "3,842", d: "+12.4%" },
              { l: "Conversations", v: "8,642", d: "+15.7%" },
              { l: "Payments Received", v: "2,156", d: "+20.1%" },
            ].map((k) => (
              <div key={k.l} className="bg-white rounded-md p-2 border border-border">
                <div className="text-[8px] text-muted-foreground">{k.l}</div>
                <div className="text-xs font-bold text-ink tnum">{k.v}</div>
                <div className="text-[8px] text-brand-600 font-semibold">{k.d}</div>
              </div>
            ))}
          </div>
          {/* Mini chart */}
          <div className="bg-white rounded-md p-3 border border-border">
            <div className="text-[10px] font-semibold text-ink mb-2">Revenue Recovered</div>
            <div className="flex items-end gap-1 h-12">
              {[40, 55, 48, 75, 62, 70, 90].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-brand-600 to-brand-400 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatDemoCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-2xl w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white">
          <Icon name="bot" size={18} />
        </div>
        <div>
          <div className="font-semibold text-ink text-sm">2ndLife AI</div>
          <div className="text-[10px] text-brand-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" /> Online
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="bg-brand-50 rounded-xl rounded-tl-sm p-3 text-sm text-ink max-w-[85%]">
          Hi Thando, your cover lapsed in Jan. You don&apos;t owe arrears. Want to restart for R150/mo?
        </div>
        <div className="bg-brand-500 text-white rounded-xl rounded-tr-sm p-3 text-sm max-w-[85%] ml-auto">
          Yes, let&apos;s do it!
        </div>
        <div className="bg-brand-50 rounded-xl p-3 max-w-[85%] flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
            <Icon name="check" size={14} className="text-white" />
          </span>
          <div className="text-sm">
            <div className="font-semibold text-ink">Payment Successful</div>
            <div className="text-xs text-muted-foreground">R150.00 paid via Ozow</div>
          </div>
        </div>
      </div>
    </div>
  );
}
