"use client";

import { Icon } from "../shared/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  revenueGenerated,
  revenueAtRisk as mockAtRisk,
  leakage,
  aiBriefing,
  topCampaigns,
} from "@/lib/2ndlife/revenue-os-data";
import { formatZAR, formatNumber, formatPercent } from "@/lib/2ndlife/format";
import { useAppStore } from "@/lib/2ndlife/store";
import { useState, useEffect } from "react";

interface RevenueStats {
  revenueRecovered: number;
  revenueAtRisk: number;
  atRiskOpportunities: number;
  paymentStats: {
    confirmedAmount: number;
    confirmedCount: number;
    pendingAmount: number;
    pendingCount: number;
    failedAmount: number;
    failedCount: number;
    totalCount: number;
  };
  funnel: {
    uploaded: number;
    contacted: number;
    engaged: number;
    payments: number;
    recovered: number;
  };
  totalOpportunities: number;
  recoveredOpportunities: number;
}

const industryThemes: Record<
  string,
  {
    name: string;
    kpiLabel: string;
    kpiSub: string;
    badgeColor: string;
    services: Array<{ name: string; price: number }>;
    offers: Array<{ name: string; discount: string }>;
  }
> = {
  dentist: {
    name: "Dental & Medical Clinic",
    kpiLabel: "Patient Recalls",
    kpiSub: "Lapsed checkups & cleanings",
    badgeColor: "bg-sky-500/10 text-sky-700 border-sky-300",
    services: [
      { name: "Dental Cleaning & Polish", price: 650 },
      { name: "Root Canal Treatment", price: 2800 },
      { name: "Laser Teeth Whitening", price: 1400 },
    ],
    offers: [
      { name: "Recall Checkup + Free X-Ray", discount: "Save R350" },
      { name: "Family Smile Package", discount: "15% OFF" },
    ],
  },
  restaurant: {
    name: "Restaurant & Hospitality",
    kpiLabel: "Reservation Deposits",
    kpiSub: "No-show recovery & VIP bookings",
    badgeColor: "bg-amber-500/10 text-amber-700 border-amber-300",
    services: [
      { name: "Weekend Table Deposit", price: 200 },
      { name: "Chef's Tasting Menu for Two", price: 950 },
      { name: "Private Function Hire", price: 5000 },
    ],
    offers: [
      { name: "Complimentary Bottle of Wine on Return", discount: "Free Bottle" },
      { name: "10% Off Mid-Week Bookings", discount: "10% OFF" },
    ],
  },
  plumber: {
    name: "Plumbing & Trades",
    kpiLabel: "Emergency Callouts",
    kpiSub: "Signed quotes & 30-day invoices",
    badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-300",
    services: [
      { name: "Standard Callout & Diagnostic", price: 450 },
      { name: "Solar Geyser Installation", price: 8500 },
      { name: "High-Pressure Drain Clearing", price: 950 },
    ],
    offers: [
      { name: "50% Off First Callout Diagnostic", discount: "50% OFF" },
      { name: "Early Invoice Settlement Discount", discount: "5% OFF" },
    ],
  },
  salon: {
    name: "Hair & Beauty Salon",
    kpiLabel: "Lapsed Appointments",
    kpiSub: "60-day client rebooking cycles",
    badgeColor: "bg-pink-500/10 text-pink-700 border-pink-300",
    services: [
      { name: "Wash, Cut & Blowdry", price: 380 },
      { name: "Full Balayage & Treatment", price: 1350 },
      { name: "HydraGlow Facial", price: 750 },
    ],
    offers: [
      { name: "Welcome Back Deluxe Conditioning Mask", discount: "Free Gift" },
      { name: "20% Off Tuesday & Wednesday Rebookings", discount: "20% OFF" },
    ],
  },
  "funeral-insurance": {
    name: "Funeral & Micro-Insurance",
    kpiLabel: "Lapsed Policy Recovery",
    kpiSub: "Debit restarts & arrears settlement",
    badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-300",
    services: [
      { name: "Family Dignity Cover R50k", price: 185 },
      { name: "Senior Extended Member Plan", price: 95 },
      { name: "Arrears Reinstatement Plan", price: 370 },
    ],
    offers: [
      { name: "50% Arrears Waiver on Instant Restart", discount: "50% Arrears Waiver" },
      { name: "Immediate 0-Day Waiting Period on Reactivation", discount: "Zero Waiting Period" },
    ],
  },
  gym: {
    name: "Gym & Fitness Studio",
    kpiLabel: "Member Reactivations",
    kpiSub: "Failed debit & inactive member winbacks",
    badgeColor: "bg-orange-500/10 text-orange-700 border-orange-300",
    services: [
      { name: "All-Access Monthly Membership", price: 499 },
      { name: "10-Session Personal Training Pack", price: 2500 },
      { name: "HIIT & Pilates Class Pass", price: 650 },
    ],
    offers: [
      { name: "Rejoin with Zero Joining Fee + 1 Free Month", discount: "Save R750" },
      { name: "Bring a Friend Free for 30 Days", discount: "1+1 Free" },
    ],
  },
  retail: {
    name: "Retail & E-Commerce",
    kpiLabel: "Abandoned Carts",
    kpiSub: "WhatsApp checkout & VIP promotions",
    badgeColor: "bg-purple-500/10 text-purple-700 border-purple-300",
    services: [
      { name: "WhatsApp Cart Express Recovery", price: 450 },
      { name: "VIP Early Access Pass", price: 200 },
      { name: "Subscription Box Replenishment", price: 599 },
    ],
    offers: [
      { name: "15% Off Your Uncompleted Order", discount: "15% OFF" },
      { name: "Free Courier Delivery on R500+", discount: "Free Shipping" },
    ],
  },
  "b2b-services": {
    name: "B2B & Professional Services",
    kpiLabel: "Stale Quotes & Invoices",
    kpiSub: "Overdue invoices & proposal chasing",
    badgeColor: "bg-blue-500/10 text-blue-700 border-blue-300",
    services: [
      { name: "Monthly Advisory Retainer", price: 12000 },
      { name: "Compliance & Audit Review", price: 4500 },
      { name: "Implementation Sprint", price: 18000 },
    ],
    offers: [
      { name: "5% Prompt Payment Cash Discount", discount: "5% Cash Discount" },
      { name: "Stale Proposal Refresh + 10% Off", discount: "10% OFF" },
    ],
  },
};

export function DashboardView() {
  const { setView, openCustomer, openConversation } = useAppStore();
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndustry, setActiveIndustry] = useState("funeral-insurance");
  const [customServices, setCustomServices] = useState<Array<{ name: string; price: number }>>([]);
  const [customOffers, setCustomOffers] = useState<Array<{ name: string; discount: string }>>([]);
  const [whatsAppNumber, setWhatsAppNumber] = useState("+27 82 123 4567");
  const [activeTab, setActiveTab] = useState<"overview" | "whatsapp" | "services" | "offers">("overview");

  // New item inputs
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");
  const [newOfferName, setNewOfferName] = useState("");
  const [newOfferDiscount, setNewOfferDiscount] = useState("");

  useEffect(() => {
    // Check if user has stored onboarding tenant
    try {
      const stored = localStorage.getItem("2ndlife_active_tenant");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.industry && industryThemes[parsed.industry]) {
          setActiveIndustry(parsed.industry);
        }
        if (parsed.whatsAppAccountId) {
          setWhatsAppNumber(parsed.whatsAppAccountId);
        }
      }
    } catch {}

    async function loadStats() {
      try {
        const res = await fetch("/api/v1/revenue-stats");
        const json = await res.json();
        if (json.data) {
          setStats(json.data);
        }
      } catch (err) {
        console.error("Failed to load revenue stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const currentTheme = industryThemes[activeIndustry] || industryThemes["funeral-insurance"];
  const displayServices = customServices.length > 0 ? customServices : currentTheme.services;
  const displayOffers = customOffers.length > 0 ? customOffers : currentTheme.offers;

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    const price = parseFloat(newServicePrice) || 0;
    setCustomServices([...displayServices, { name: newServiceName.trim(), price }]);
    setNewServiceName("");
    setNewServicePrice("");
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferName.trim()) return;
    setCustomOffers([...displayOffers, { name: newOfferName.trim(), discount: newOfferDiscount.trim() || "Active Promo" }]);
    setNewOfferName("");
    setNewOfferDiscount("");
  };

  // Real verified recovered revenue from the database
  const recoveredRevenue = stats?.revenueRecovered ?? 0;
  const revenueAtRiskValue = stats?.revenueAtRisk ?? mockAtRisk.value;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ─────── INDUSTRY PACK SELECTION & MANAGEMENT HEADER ─────── */}
      <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Industry OS:
            </span>
            <select
              value={activeIndustry}
              onChange={(e) => {
                setActiveIndustry(e.target.value);
                setCustomServices([]);
                setCustomOffers([]);
              }}
              className="text-sm font-bold bg-muted px-3 py-1.5 rounded-lg border border-border text-ink cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {Object.entries(industryThemes).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
            <Badge className={`text-xs border ${currentTheme.badgeColor}`}>
              {currentTheme.kpiLabel} Focus
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Customizing automated WhatsApp prompts, pricing catalog, and win-back offers for{" "}
            <span className="font-semibold text-ink">{currentTheme.name}</span>.
          </p>
        </div>

        {/* Dashboard Sub-navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-white text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "whatsapp"
                ? "bg-white text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            <Icon name="chat" size={12} className="text-brand-600" />
            Connect WhatsApp
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "services"
                ? "bg-white text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            My Services ({displayServices.length})
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "offers"
                ? "bg-white text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            My Offers ({displayOffers.length})
          </button>
        </div>
      </div>

      {/* ─────── TAB CONTENT: CONNECT WHATSAPP ─────── */}
      {activeTab === "whatsapp" && (
        <Card className="p-6 bg-white border-border shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                <Icon name="chat" size={18} className="text-brand-600" />
                WhatsApp Operator Connection
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your connected business number and Baileys cloud operator.
              </p>
            </div>
            <Badge className="bg-brand-500/10 text-brand-700 border-brand-300">
              OPERATOR READY
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">Connected Business WhatsApp</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={whatsAppNumber}
                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                    placeholder="+27 82 000 0000"
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Button size="sm" className="bg-brand-600 hover:bg-brand-700 text-white">
                    Save Number
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Inbound customer texts to this number will trigger automated recovery workflows.
                </p>
              </div>

              <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">Cloud Operator URL:</span>
                  <span className="font-mono text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    my-naha-wa-operator.onrender.com
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">Security Protocol:</span>
                  <span className="text-ink">HMAC-SHA256 v2 Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">Session Storage:</span>
                  <span className="text-emerald-700 font-semibold">PostgreSQL Persistent State</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-brand-950 text-white rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Icon name="phone" size={16} className="text-brand-400" />
                  <h4 className="font-bold text-sm">Pair New Phone (QR Scan)</h4>
                </div>
                <p className="text-xs text-brand-200/80">
                  Scan the pairing QR with WhatsApp on your phone under Settings → Linked Devices.
                </p>
              </div>
              <div className="p-4 bg-black/40 border border-brand-800/80 rounded-xl text-center">
                <p className="text-xs text-brand-300 font-medium">
                  WhatsApp Account is currently active and bound to 2ndLife.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => alert("WhatsApp session is active. Re-pairing available via /accounts/main-wa/qr.")}
                className="w-full border-brand-700 bg-brand-900/60 text-white hover:bg-brand-800"
              >
                Request Fresh QR Code
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ─────── TAB CONTENT: MY SERVICES ─────── */}
      {activeTab === "services" && (
        <Card className="p-6 bg-white border-border shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-ink">My Services & Pricing Catalog</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI uses these services and prices when answering customer inquiries and generating payment links.
              </p>
            </div>
            <Badge className="bg-brand-500/10 text-brand-700 border-brand-300">
              {displayServices.length} Items Configured
            </Badge>
          </div>

          {/* Service items list */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayServices.map((svc, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-muted/40 border border-border rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-ink">{svc.name}</p>
                  <p className="text-xs text-brand-600 font-bold tnum mt-0.5">
                    {svc.price > 0 ? formatZAR(svc.price, { decimals: true }) : "Custom Quote"}
                  </p>
                </div>
                <button
                  onClick={() => setCustomServices(displayServices.filter((_, i) => i !== idx))}
                  className="text-xs text-muted-foreground hover:text-red-600 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add new service form */}
          <form onSubmit={handleAddService} className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="Service Name (e.g. Tooth Extraction, Full Service)"
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="number"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              placeholder="Price in ZAR (e.g. 850)"
              className="w-full sm:w-40 px-3 py-2 border border-border rounded-lg text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shrink-0">
              Add Service
            </Button>
          </form>
        </Card>
      )}

      {/* ─────── TAB CONTENT: MY OFFERS ─────── */}
      {activeTab === "offers" && (
        <Card className="p-6 bg-white border-border shadow-sm space-y-6">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold text-ink">Win-Back Offers & Recovery Incentives</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI offers these incentives to lapsed customers and abandoned carts when handling price objections.
              </p>
            </div>
            <Badge className="bg-amber-500/10 text-amber-700 border-amber-300">
              {displayOffers.length} Active Offers
            </Badge>
          </div>

          {/* Offers list */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displayOffers.map((off, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-amber-50/40 border border-amber-200/80 rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-ink">{off.name}</p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    {off.discount}
                  </span>
                </div>
                <button
                  onClick={() => setCustomOffers(displayOffers.filter((_, i) => i !== idx))}
                  className="text-xs text-muted-foreground hover:text-red-600 p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add new offer form */}
          <form onSubmit={handleAddOffer} className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newOfferName}
              onChange={(e) => setNewOfferName(e.target.value)}
              placeholder="Offer Name (e.g. 50% Arrears Waiver, Free First Diagnostic)"
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              value={newOfferDiscount}
              onChange={(e) => setNewOfferDiscount(e.target.value)}
              placeholder="Discount Tag (e.g. 20% OFF, Free Bottle)"
              className="w-full sm:w-48 px-3 py-2 border border-border rounded-lg text-sm bg-muted/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white font-semibold shrink-0">
              Add Offer
            </Button>
          </form>
        </Card>
      )}

      {/* ─────── REVENUE OS KPI ROW ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueKpiCard
          icon="trend"
          iconBg="bg-brand-500/10"
          iconColor="text-brand-600"
          label={currentTheme.kpiLabel}
          value={formatZAR(revenueGenerated.value)}
          delta={revenueGenerated.delta}
          deltaLabel="vs last 7 days"
          subtitle={currentTheme.kpiSub}
        />
        <RevenueKpiCard
          icon="refresh"
          iconBg="bg-brand-500/10"
          iconColor="text-brand-600"
          label="Revenue Recovered"
          value={loading ? "…" : formatZAR(recoveredRevenue)}
          delta={22.7}
          deltaLabel="vs last 7 days"
          subtitle="Verified via webhook ✓"
        />
        <RevenueKpiCard
          icon="warn"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          label="Revenue at Risk"
          value={formatZAR(revenueAtRiskValue)}
          delta={mockAtRisk.delta}
          deltaLabel="vs last 7 days"
          deltaDirection="up"
          subtitle="Dormant + failed payments"
        />
        <RevenueKpiCard
          icon="info"
          iconBg="bg-red-50"
          iconColor="text-red-600"
          label="Money Left on the Table"
          value={formatZAR(leakage.total)}
          subtitle="Total revenue leakage"
          delta={leakage.delta}
          deltaLabel="vs last 7 days"
          deltaDirection="down"
        />
      </div>

      {/* ─────── AI BUSINESS BRIEFING ─────── */}
      <Card className="p-5 bg-gradient-to-br from-brand-950 to-brand-900 border-brand-700/50 text-white">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Icon name="bulb" size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold">What should I know today?</h3>
              <Badge className="bg-amber-100/20 text-amber-200 text-[10px] border border-amber-300/30">
                AI Business Briefing
              </Badge>
            </div>
            <p className="text-[11px] text-brand-200/70">
              Generated {aiBriefing.generatedAt} · based on last 24h of activity
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {aiBriefing.insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${insight.tone === "positive" ? "bg-brand-400" : insight.tone === "warning" ? "bg-amber-400" : "bg-blue-400"}`} />
              <p className="text-sm text-brand-100 leading-relaxed">{insight.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-brand-700/50 flex flex-wrap gap-2">
          {aiBriefing.recommendations.map((rec, i) => (
            <Button
              key={i}
              size="sm"
              variant="outline"
              className="bg-white/5 border-brand-600 text-white hover:bg-white/10 text-xs h-8"
              onClick={() => {
                if (rec.action === "customers") setView("customers");
                else if (rec.action === "conversations") setView("conversations");
                else if (rec.action === "campaigns") setView("campaigns-new");
                else if (rec.action === "imports") setView("imports");
              }}
            >
              <Icon name={rec.icon} size={12} className="mr-1" /> {rec.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* ─────── LEAKAGE BREAKDOWN ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-ink">Money Left on the Table</h3>
              <p className="text-xs text-muted-foreground">Revenue leakage by stage</p>
            </div>
            <Badge className="bg-red-50 text-red-600 text-[10px] font-semibold hover:bg-red-50">
              {formatZAR(leakage.total)} at risk
            </Badge>
          </div>
          <div className="space-y-3">
            {leakage.breakdown.map((item) => {
              const widthPct = (item.amount / leakage.total) * 100;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-xs text-ink font-medium">{item.label}</div>
                  <div className="flex-1 relative h-8 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg flex items-center px-3 transition-all"
                      style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                    >
                      <span className="text-white text-xs font-bold tnum">
                        {formatZAR(item.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 shrink-0 text-xs text-muted-foreground font-semibold tnum text-right">
                    {item.count}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total leakage this period</span>
            <span className="text-lg font-extrabold text-red-600 tnum">{formatZAR(leakage.total)}</span>
          </div>
        </Card>

        {/* Recovery Funnel */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-ink">Recovery Funnel</h3>
              <p className="text-xs text-muted-foreground">From opportunity to reactivation</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-brand-600 hover:text-brand-700"
              onClick={() => setView("reports")}
            >
              View report <Icon name="arrow" size={12} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {(() => {
              const f = stats?.funnel;
              const funnelData = f ? [
                { stage: "Recovery Opportunities", count: f.uploaded, pct: 100, color: "#16a34a" },
                { stage: "Contacted", count: f.contacted, pct: f.uploaded > 0 ? Math.round((f.contacted / f.uploaded) * 100) : 0, color: "#15803d" },
                { stage: "Engaged", count: f.engaged, pct: f.uploaded > 0 ? Math.round((f.engaged / f.uploaded) * 100) : 0, color: "#34d399" },
                { stage: "Payments Verified", count: f.payments, pct: f.uploaded > 0 ? Math.round((f.payments / f.uploaded) * 100) : 0, color: "#f59e0b" },
                { stage: "Customers Reactivated", count: f.recovered, pct: f.uploaded > 0 ? Math.round((f.recovered / f.uploaded) * 100) : 0, color: "#6ee7b7" },
              ] : [];
              return funnelData.map((item, i) => {
                const widthPct = i === 0 ? 100 : (item.count / funnelData[0].count) * 100;
                return (
                  <div key={item.stage} className="flex items-center gap-4">
                    <div className="w-44 shrink-0 text-xs text-ink font-medium">{item.stage}</div>
                    <div className="flex-1 relative h-9 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-lg flex items-center px-3 transition-all"
                        style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                      >
                        <span className="text-white text-xs font-bold tnum">
                          {formatNumber(item.count)}
                        </span>
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold tnum">
                        {item.pct}%
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </Card>
      </div>

      {/* ─────── CAMPAIGNS + QUICK ACTIONS ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-ink">Top Performing Campaigns</h3>
            <button
              onClick={() => setView("campaigns")}
              className="text-xs text-brand-600 font-semibold hover:text-brand-700"
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Campaign</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Sent</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Engaged</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Recovered</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/50 transition cursor-pointer">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-semibold text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right tnum text-muted-foreground">{formatNumber(c.sent)}</td>
                    <td className="py-3 px-2 text-right tnum text-muted-foreground">{formatNumber(c.engaged)}</td>
                    <td className="py-3 px-2 text-right tnum text-muted-foreground">{formatNumber(c.recovered)}</td>
                    <td className="py-3 px-2 text-right tnum font-bold text-ink">{formatZAR(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-5">
          <h3 className="text-base font-bold text-ink mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              icon="upload"
              iconColor="text-brand-600"
              iconBg="bg-brand-500/10"
              label="Upload Customer List"
              onClick={() => setView("imports")}
            />
            <QuickAction
              icon="plus"
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
              label="Create Campaign"
              onClick={() => setView("campaigns-new")}
            />
            <QuickAction
              icon="chat"
              iconColor="text-brand-600"
              iconBg="bg-brand-500/10"
              label="View Conversations"
              onClick={() => setView("conversations")}
            />
            <QuickAction
              icon="chart"
              iconColor="text-teal-600"
              iconBg="bg-teal-50"
              label="View Reports"
              onClick={() => setView("reports")}
            />
          </div>

          {/* Priority Recovery */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-ink">Priority Recovery Opportunities</h4>
              <button
                onClick={() => setView("customers")}
                className="text-xs text-brand-600 font-semibold hover:text-brand-700"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {[
                { name: "Thabo Mokoena", score: 87, value: 4800, id: "cus_8412" },
                { name: "Sipho Dlamini", score: 91, value: 3600, id: "cus_8414" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCustomer(c.id)}
                  className="w-full flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
                    {c.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink text-sm truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Score <span className="font-bold text-brand-600">{c.score}</span> · {formatZAR(c.value)}
                    </div>
                  </div>
                  <Icon name="arrowUpRight" size={14} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─────────── Pieces ─────────── */

function RevenueKpiCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  delta,
  deltaLabel,
  subtitle,
  deltaDirection = "up",
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  subtitle?: string;
  deltaDirection?: "up" | "down";
}) {
  const isPositiveDelta = deltaDirection === "up" ? (delta ?? 0) > 0 : (delta ?? 0) < 0;
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon name={icon} size={18} className={iconColor} />
        </div>
        {subtitle && (
          <span className="text-[10px] text-muted-foreground font-medium">{subtitle}</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
      <div className="text-2xl lg:text-3xl font-extrabold text-ink tnum leading-tight">{value}</div>
      {delta !== undefined && (
        <div className={`text-xs font-semibold flex items-center gap-1 mt-1 ${isPositiveDelta ? "text-brand-600" : "text-red-600"}`}>
          <Icon name="trend" size={12} />
          {formatPercent(delta)} {deltaLabel}
        </div>
      )}
    </Card>
  );
}

function QuickAction({
  icon,
  iconBg,
  iconColor,
  label,
  onClick,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 border border-border rounded-xl hover:border-brand-300 hover:bg-brand-50/40 transition group"
    >
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center group-hover:scale-110 transition`}>
        <Icon name={icon} size={20} className={iconColor} />
      </div>
      <span className="text-xs font-medium text-ink text-center leading-tight">{label}</span>
    </button>
  );
}
