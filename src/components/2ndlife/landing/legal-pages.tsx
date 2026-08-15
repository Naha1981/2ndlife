"use client";

import { Logo } from "../shared/logo";
import { useAppStore } from "@/lib/2ndlife/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Check, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

/**
 * Shared layout for legal pages (POPIA, Privacy).
 * Single Authority: one header + footer for all legal pages.
 */
function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
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
            <button onClick={() => goToView("pricing")} className="hover:text-white transition">Pricing</button>
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
                  <button onClick={() => goToView("pricing")} className="text-left px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm">Pricing</button>
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
        <section className="bg-[#052e22] text-white py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => goToView("main")}
              className="text-[#16a34a] text-sm mb-6 inline-flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to 2ndLife Platform
            </button>
            <Badge className="bg-[#16a34a]/20 text-[#16a34a] border-none mb-4">Legal</Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">{title}</h1>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">{children}</div>
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

/* ─────────── POPIA Page ─────────── */

const POPIA_BULLETS = [
  {
    title: "Consent & opt-out honored instantly",
    desc: "Customers can opt out at any time via STOP in WhatsApp or email. Opt-outs are processed immediately — no delay, no grace period, no exceptions.",
  },
  {
    title: "Purpose limitation",
    desc: "We only process personal information for the specific purpose of revenue recovery. No secondary use, no profiling, no selling.",
  },
  {
    title: "Data minimization",
    desc: "The AI receives only task-relevant fields (name, product, lapse reason, approved offer band). Full customer records never leave your tenant storage.",
  },
  {
    title: "Retention limits",
    desc: "Customer data is retained only for the duration of your active engagement plus a configurable cool-off period. Deletion is irreversible and audited.",
  },
  {
    title: "Right to access & deletion",
    desc: "Data subjects can request access to or deletion of their personal information at any time. We fulfill requests within 30 days, free of charge.",
  },
  {
    title: "We act as operator under your POPIA agreement",
    desc: "2ndLife is the operator (processor); you are the responsible party (controller). We process data only on your documented instructions and sign a POPIA Data Processing Agreement (DPA).",
  },
];

export function LegalPopiaPage() {
  return (
    <LegalLayout title="POPIA Compliance">
      <p className="text-lg text-[#5c6b64] mb-8 leading-relaxed">
        2ndLife is designed POPIA-first. The Protection of Personal Information Act (POPIA)
        is not a checkbox — it shapes how every feature works, from AI context minimization
        to instant opt-out handling.
      </p>
      <div className="space-y-4">
        {POPIA_BULLETS.map((b) => (
          <Card key={b.title} className="border-[#e4eae6]">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#16a34a] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#0b1220] mb-1">{b.title}</h3>
                  <p className="text-sm text-[#5c6b64] leading-relaxed">{b.desc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 p-4 bg-[#e9f6ee] border border-[#16a34a]/30 rounded-lg">
        <p className="text-sm text-[#0b1220]">
          <strong>Need a DPA?</strong> Contact us at{" "}
          <a href="mailto:privacy@nahalabs.co.za" className="text-[#16a34a] font-semibold underline">
            privacy@nahalabs.co.za
          </a>{" "}
          and we&apos;ll set up a POPIA Data Processing Agreement for your tenant.
        </p>
      </div>
    </LegalLayout>
  );
}

/* ─────────── Privacy Page ─────────── */

export function LegalPrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-[#0b1220] mb-2">What we collect</h2>
          <p className="text-sm text-[#5c6b64] leading-relaxed">
            We collect the personal information you provide when creating an account (name,
            email, company), the customer data you import for recovery campaigns (contacts,
            transaction history), and usage data (interactions with the platform, API calls,
            audit events). We do not collect browsing data from third-party sites.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#0b1220] mb-2">How we use it</h2>
          <p className="text-sm text-[#5c6b64] leading-relaxed">
            We use your data solely to provide the 2ndLife revenue recovery service: scoring
            opportunities, running AI-assisted WhatsApp conversations, processing payments,
            and generating analytics. AI context is minimized — the model receives only
            task-relevant fields, never your full customer records. We never use your data
            to train AI models.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#0b1220] mb-2">Cookies</h2>
          <p className="text-sm text-[#5c6b64] leading-relaxed">
            We use essential cookies for authentication and session management. We do not use
            third-party tracking cookies, advertising pixels, or analytics that profile users.
            You can disable non-essential cookies without affecting functionality.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#0b1220] mb-2">No data selling</h2>
          <p className="text-sm text-[#5c6b64] leading-relaxed">
            We never sell, rent, or share your personal information or customer data with
            third parties for marketing or advertising purposes. We only share data with
            subprocessors (e.g. Ozow for payments, Evolution API for WhatsApp messaging) as
            strictly necessary to provide the service, under written agreements that bind
            them to the same POPIA standards.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#0b1220] mb-2">Your rights</h2>
          <p className="text-sm text-[#5c6b64] leading-relaxed">
            You have the right to access, correct, or delete your personal information. You
            can export your data at any time from Settings. To exercise these rights or ask
            questions about this policy, contact us:
          </p>
          <div className="mt-3 p-4 bg-[#e9f6ee] border border-[#16a34a]/30 rounded-lg">
            <p className="text-sm text-[#0b1220]">
              <strong>Email:</strong>{" "}
              <a href="mailto:privacy@nahalabs.co.za" className="text-[#16a34a] font-semibold underline">
                privacy@nahalabs.co.za
              </a>
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#e4eae6]">
          <p className="text-xs text-[#5c6b64]">
            This policy was last updated on 14 August 2025. We may update this policy from
            time to time; material changes will be notified via email.
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
