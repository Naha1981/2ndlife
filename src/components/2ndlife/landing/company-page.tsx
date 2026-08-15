"use client";

import { Logo } from "../shared/logo";
import { useAppStore } from "@/lib/2ndlife/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, CheckCircle2, Menu, MapPin, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

export function CompanyPage() {
  const { enterApp, setMarketingView, marketingView } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // If navigated with #contact, scroll to the contact section
  useEffect(() => {
    if (marketingView === "company#contact") {
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [marketingView]);

  const goToView = (view: string) => {
    setMarketingView(view);
    setMobileOpen(false);
    window.scrollTo({ top: 0 });
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      company: formData.get("company"),
      message: formData.get("message"),
    };
    // Log the payload (production: POST /api/v1/contact)
    console.log("[2ndlife] contact form submitted:", payload);
    setSubmitted(true);
    toast.success("Message sent!", {
      description: "We'll get back to you within 1 business day.",
    });
  }

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
            <button onClick={() => goToView("pricing")} className="hover:text-white transition">Pricing</button>
            <button onClick={() => goToView("company")} className="hover:text-white transition text-white font-semibold">Company</button>
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
                  <button onClick={() => goToView("company")} className="text-left px-3 py-2.5 rounded-lg hover:bg-white/10 text-sm font-semibold text-white">Company</button>
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
          <div className="max-w-4xl mx-auto">
            <Badge className="bg-[#16a34a]/20 text-[#16a34a] border-none mb-6">About 2ndLife</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Revenue recovery, built in South Africa.
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 max-w-3xl leading-relaxed">
              2ndLife is built by NahaLabs (Pty) Ltd. We believe the fastest way to grow
              a business is to recover the revenue it already earned — lapsed customers, stale
              quotes, unpaid invoices — with empathetic AI and verified payments.
            </p>
          </div>
        </section>

        {/* ─────── MISSION ─────── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our mission</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Empathy first", desc: "Recovery isn't about pressure — it's about understanding why customers left and offering a path back that respects their circumstances." },
                { title: "Verified results", desc: "Revenue is only recovered when a verified payment webhook confirms it. No estimates, no projections, no empty claims." },
                { title: "Built for SA", desc: "POPIA-compliant by design. Ozow Instant EFT. WhatsApp-first. Made for South African businesses and their realities." },
              ].map((item) => (
                <Card key={item.title} className="border-[#e4eae6]">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-[#0b1220] mb-2">{item.title}</h3>
                    <p className="text-sm text-[#5c6b64] leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─────── CONTACT FORM (#contact) ─────── */}
        <section id="contact" className="py-20 px-6 bg-white scroll-mt-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-2 text-center">Get in touch</h2>
            <p className="text-center text-[#5c6b64] mb-8">
              Want to see 2ndLife on your own data? Send us a message — we&apos;ll set up a free demo.
            </p>

            {submitted ? (
              <Card className="border-[#16a34a] border-2 bg-[#e9f6ee]">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="w-12 h-12 text-[#16a34a] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#0b1220] mb-2">Message sent!</h3>
                  <p className="text-sm text-[#5c6b64] mb-4">
                    Thanks for reaching out. We&apos;ll get back to you within 1 business day.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                    className="border-[#16a34a] text-[#16a34a] hover:bg-[#e9f6ee]"
                  >
                    Send another message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#e4eae6]">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" required placeholder="Your full name" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="email">Work email</Label>
                      <Input id="email" name="email" type="email" required placeholder="you@company.co.za" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input id="company" name="company" required placeholder="Your company name" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        placeholder="Tell us about your recovery challenge…"
                        className="mt-1 min-h-[100px]"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white h-11">
                      Send message <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <p className="text-[11px] text-[#5c6b64] text-center">
                      By submitting, you agree to our POPIA-compliant data handling. We never sell your data.
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Contact details */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm text-[#5c6b64]">
                <Mail className="w-4 h-4 text-[#16a34a]" />
                <span>hello@nahalabs.co.za</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#5c6b64]">
                <MapPin className="w-4 h-4 text-[#16a34a]" />
                <span>Johannesburg, South Africa</span>
              </div>
            </div>
          </div>
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
