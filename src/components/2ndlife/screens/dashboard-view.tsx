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

export function DashboardView() {
  const { setView, openCustomer, openConversation } = useAppStore();
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // Real verified recovered revenue from the database
  const recoveredRevenue = stats?.revenueRecovered ?? 0;
  const revenueAtRiskValue = stats?.revenueAtRisk ?? mockAtRisk.value;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ─────── REVENUE OS KPI ROW ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <RevenueKpiCard
          icon="trend"
          iconBg="bg-brand-500/10"
          iconColor="text-brand-600"
          label="Revenue Generated"
          value={formatZAR(revenueGenerated.value)}
          delta={revenueGenerated.delta}
          deltaLabel="vs last 7 days"
          subtitle="New leads & bookings"
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
