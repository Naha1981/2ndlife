"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/2ndlife/shared/logo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  HeartPulse,
  Utensils,
  Wrench,
  Sparkles,
  Shield,
  Dumbbell,
  ShoppingBag,
  Briefcase,
  Layers,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Phone,
  Building2,
} from "lucide-react";
import { useAppStore } from "@/lib/2ndlife/store";

interface IndustryCard {
  id: string;
  name: string;
  category: string;
  icon: any;
  accent: string;
  bgAccent: string;
  sampleUse: string;
  suggestedServices: string[];
}

const industryPacks: IndustryCard[] = [
  {
    id: "dentist",
    name: "Dental & Medical Clinic",
    category: "Healthcare",
    icon: HeartPulse,
    accent: "text-sky-400",
    bgAccent: "bg-sky-500/10 border-sky-500/30",
    sampleUse: "Patient recalls, missed hygiene check-ups, and co-payment collections.",
    suggestedServices: ["Dental Cleaning (R650)", "Root Canal (R2,800)", "Teeth Whitening (R1,400)"],
  },
  {
    id: "restaurant",
    name: "Restaurant & Hospitality",
    category: "Food & Beverage",
    icon: Utensils,
    accent: "text-amber-400",
    bgAccent: "bg-amber-500/10 border-amber-500/30",
    sampleUse: "No-show deposit recovery, VIP reservations, and catering quotes.",
    suggestedServices: ["Table Booking Deposit (R200)", "Private Tasting Menu (R850)", "Event Catering"],
  },
  {
    id: "plumber",
    name: "Plumbing & Trades",
    category: "Home Services",
    icon: Wrench,
    accent: "text-emerald-400",
    bgAccent: "bg-emerald-500/10 border-emerald-500/30",
    sampleUse: "Emergency dispatch quotes, geyser replacement approvals, and invoice follow-ups.",
    suggestedServices: ["Callout & Inspection (R450)", "Geyser Replacement (R7,500)", "Leak Detection (R850)"],
  },
  {
    id: "salon",
    name: "Hair & Beauty Salon",
    category: "Personal Care",
    icon: Sparkles,
    accent: "text-pink-400",
    bgAccent: "bg-pink-500/10 border-pink-500/30",
    sampleUse: "Lapsed client rebooking, deposit protection, and maintenance reminders.",
    suggestedServices: ["Cut & Style (R350)", "Full Highlights (R1,200)", "HydraFacial (R750)"],
  },
  {
    id: "funeral-insurance",
    name: "Funeral & Micro-Insurance",
    category: "Insurance & FinTech",
    icon: Shield,
    accent: "text-emerald-400",
    bgAccent: "bg-emerald-500/10 border-emerald-500/30",
    sampleUse: "Lapsed policy restarts, premium arrears collection, and debit order renewals.",
    suggestedServices: ["Family Cover R50k (R185/mo)", "Individual Plan (R95/mo)", "Arrears Settlement"],
  },
  {
    id: "gym",
    name: "Gym & Fitness Studio",
    category: "Health & Fitness",
    icon: Dumbbell,
    accent: "text-orange-400",
    bgAccent: "bg-orange-500/10 border-orange-500/30",
    sampleUse: "Failed monthly debit win-backs, seasonal reactivation, and personal training upsells.",
    suggestedServices: ["Monthly Gym Access (R499/mo)", "10x PT Sessions (R2,500)", "Class Pass"],
  },
  {
    id: "retail",
    name: "Retail & E-Commerce",
    category: "Commerce",
    icon: ShoppingBag,
    accent: "text-purple-400",
    bgAccent: "bg-purple-500/10 border-purple-500/30",
    sampleUse: "Abandoned WhatsApp cart checkout, dormant customer promos, and VIP presales.",
    suggestedServices: ["Abandoned Cart Recovery", "WhatsApp Express Checkout", "Seasonal Promo Re-engagement"],
  },
  {
    id: "b2b-services",
    name: "B2B & Professional Services",
    category: "Corporate",
    icon: Briefcase,
    accent: "text-blue-400",
    bgAccent: "bg-blue-500/10 border-blue-500/30",
    sampleUse: "Stale proposal re-engagement, 60-day unpaid invoice collection, and contract renewals.",
    suggestedServices: ["Consulting Retainer (R12,000)", "Audit Fee (R4,500)", "Overdue Invoice Settlement"],
  },
  {
    id: "subscriptions",
    name: "SaaS & Digital Subscriptions",
    category: "Technology",
    icon: Layers,
    accent: "text-teal-400",
    bgAccent: "bg-teal-500/10 border-teal-500/30",
    sampleUse: "Card expiry updates, involuntary churn prevention, and annual discount upgrades.",
    suggestedServices: ["Pro Subscription ($29/mo)", "Enterprise License", "Annual Plan Reactivation"],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { enterApp } = useAppStore();
  const [selectedIndustry, setSelectedIndustry] = useState<string>("funeral-insurance");
  const [businessName, setBusinessName] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError("Please enter your business or organization name");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          industryPack: selectedIndustry,
          whatsAppNumber: whatsAppNumber.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to initialize organization");
      }

      const result = await res.json();
      if (result.tenant?.id) {
        localStorage.setItem("2ndlife_active_tenant", JSON.stringify(result.tenant));
      }

      enterApp();
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to complete onboarding");
      setSubmitting(false);
    }
  };

  const currentPack = industryPacks.find((p) => p.id === selectedIndustry) || industryPacks[0];

  return (
    <div className="min-h-screen bg-[#052e22] text-white flex flex-col justify-between p-6 md:p-12 relative overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950 font-sans">
      {/* Background ambient glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full space-y-10 z-10">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Logo variant="light" height={44} />
          <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs">
            STEP 1 OF 1 · INSTANT REVENUE ONBOARDING
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white max-w-2xl">
            What kind of business do you run?
          </h1>
          <p className="text-sm md:text-base text-gray-300 max-w-xl">
            Pick your industry pack. 2ndLife will automatically configure your AI prompts, recovery workflows, and payment triggers.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Industry Cards Grid */}
          <div className="space-y-3">
            <Label className="text-xs uppercase tracking-wider text-gray-300 font-bold">
              Choose your Industry Pack
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {industryPacks.map((pack) => {
                const IconComponent = pack.icon;
                const isSelected = selectedIndustry === pack.id;
                return (
                  <button
                    key={pack.id}
                    type="button"
                    onClick={() => setSelectedIndustry(pack.id)}
                    className={`p-5 rounded-2xl text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between border ${
                      isSelected
                        ? "bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/40 shadow-2xl shadow-emerald-950"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 text-gray-300"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${pack.bgAccent}`}
                        >
                          <IconComponent className={`w-5 h-5 ${pack.accent}`} />
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> SELECTED
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white leading-tight">
                          {pack.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                          {pack.sampleUse}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <p className="text-[10px] text-gray-500 font-medium">Ready-made templates:</p>
                      <p className="text-[11px] text-emerald-400/90 truncate font-mono mt-0.5">
                        {pack.suggestedServices[0]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business Details Input Box */}
          <div className="p-6 md:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-6 shadow-2xl backdrop-blur-md">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Organization Details
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Configuring workflow tailored for:{" "}
                <span className="text-emerald-300 font-semibold">{currentPack.name}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-xs font-semibold text-gray-200">
                  Business / Trading Name <span className="text-emerald-400">*</span>
                </Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Ubuntu Life, Sandton Dental Studio, Prime Plumbing"
                  required
                  className="bg-slate-950 border-slate-700 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsAppNumber" className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  WhatsApp Business Number <span className="text-gray-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="whatsAppNumber"
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  placeholder="e.g. +27 82 123 4567"
                  className="bg-slate-950 border-slate-700 text-white placeholder:text-gray-500 h-12 rounded-xl focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400">
                You can change templates and connect WhatsApp later in your dashboard.
              </p>
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 h-12 rounded-xl font-bold transition shadow-lg shadow-emerald-950 cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Launching Revenue OS...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Launch My Dashboard <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <footer className="mt-12 text-center text-xs text-emerald-200/40 z-10">
        © 2025 2ndLife by NahaLabs · South African Revenue Recovery Intelligence
      </footer>
    </div>
  );
}
