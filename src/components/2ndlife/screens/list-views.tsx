"use client";

import { Icon } from "../shared/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customers, topCampaigns } from "@/lib/2ndlife/data";
import { useAppStore } from "@/lib/2ndlife/store";
import { formatZAR, formatNumber } from "@/lib/2ndlife/format";
import { toast } from "sonner";

/* ─────────── Customers ─────────── */
export function CustomersView() {
  const openCustomer = useAppStore((s) => s.openCustomer);
  return (
    <div className="space-y-5 animate-fade-up">
      <Header
        title="Contacts"
        subtitle="Customer records with recovery scores"
        action={
          <>
            <Button variant="outline" size="sm">
              <Icon name="upload" size={14} className="mr-1.5" /> Import CSV
            </Button>
            <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white">
              <Icon name="plus" size={14} className="mr-1.5" /> Add contact
            </Button>
          </>
        }
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, phone, or email…" className="pl-9 h-9" />
        </div>
        <Button variant="outline" size="sm" className="h-9">
          <Icon name="filter" size={14} className="mr-1" /> Filters
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Customer", "Phone", "Status", "Score", "Est. value", "Inactive", "Last activity", ""].map((h) => (
                <th key={h} className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                onClick={() => openCustomer(c.id)}
                className="border-b border-border/50 hover:bg-muted/40 transition cursor-pointer"
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
                      {c.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-ink">{c.name}</div>
                      <div className="text-[10px] text-muted-foreground">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 font-mono text-xs text-ink">{c.phone}</td>
                <td className="py-3 px-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="py-3 px-3">
                  <span className="font-bold text-ink tnum">{c.score}</span>
                  <span className="text-[10px] text-muted-foreground">/100</span>
                </td>
                <td className="py-3 px-3 font-semibold text-ink tnum">{formatZAR(c.estimatedValue)}</td>
                <td className="py-3 px-3 text-muted-foreground">{c.inactiveMonths} mo</td>
                <td className="py-3 px-3 text-muted-foreground text-xs">May 12, 2025</td>
                <td className="py-3 px-3 text-right">
                  <Icon name="arrowUpRight" size={14} className="text-muted-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─────────── Campaigns ─────────── */
export function CampaignsView() {
  const setView = useAppStore((s) => s.setView);
  return (
    <div className="space-y-5 animate-fade-up">
      <Header
        title="Campaigns"
        subtitle="WhatsApp recovery campaigns"
        action={
          <Button
            size="sm"
            className="bg-brand-500 hover:bg-brand-600 text-white"
            onClick={() => setView("campaigns-new")}
          >
            <Icon name="plus" size={14} className="mr-1.5" /> New campaign
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topCampaigns.map((c) => (
          <Card key={c.id} className="p-5 hover:shadow-md transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <h3 className="font-bold text-ink">{c.name}</h3>
              </div>
              <Badge className="bg-brand-100 text-brand-700 text-[10px] font-semibold capitalize hover:bg-brand-100">
                {c.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{c.vertical} · created {c.createdAt}</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Stat label="Sent" value={formatNumber(c.sent)} />
              <Stat label="Engaged" value={formatNumber(c.engaged)} />
              <Stat label="Payments" value={formatNumber(c.payments)} />
              <Stat label="Revenue" value={formatZAR(c.revenue)} highlight />
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground">
                Conversion <span className="font-bold text-brand-600">{((c.payments / c.sent) * 100).toFixed(1)}%</span>
              </div>
              <Button variant="ghost" size="sm" className="text-xs text-brand-600 h-7">
                View report <Icon name="arrow" size={11} className="ml-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Payments ─────────── */
export function PaymentsView() {
  const payments = [
    { id: "pay_001", customer: "Thabo Mokoena", amount: 150, method: "Ozow Instant EFT", status: "confirmed", when: "2m ago", policy: "FS-12345" },
    { id: "pay_002", customer: "Sipho Dlamini", amount: 150, method: "Ozow Instant EFT", status: "confirmed", when: "12m ago", policy: "FS-67890" },
    { id: "pay_003", customer: "Lerato Khumalo", amount: 195, method: "Ozow Instant EFT", status: "pending", when: "9m ago", policy: "FS-23456" },
    { id: "pay_004", customer: "Palesa Radebe", amount: 200, method: "Card Payment", status: "failed", when: "1h ago", policy: "FS-34567" },
    { id: "pay_005", customer: "Bongani Nkosi", amount: 120, method: "Ozow Instant EFT", status: "confirmed", when: "2h ago", policy: "FS-45678" },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <Header
        title="Payments"
        subtitle="Verified payments via Ozow Instant EFT"
        action={
          <Button variant="outline" size="sm">
            <Icon name="download" size={14} className="mr-1.5" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total collected" value={formatZAR(1248750)} delta="+18.6% vs last 7 days" />
        <StatCard label="Confirmed today" value="42" delta="+8 vs yesterday" />
        <StatCard label="Pending" value="6" delta="awaiting webhook" deltaColor="text-amber-600" />
        <StatCard label="Failed" value="3" delta="retry scheduled" deltaColor="text-destructive" />
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Payment ID", "Customer", "Policy", "Method", "Amount", "Status", "When", ""].map((h) => (
                <th key={h} className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-muted/40 transition cursor-pointer">
                <td className="py-3 px-3 font-mono text-xs text-ink">{p.id}</td>
                <td className="py-3 px-3 font-medium text-ink">{p.customer}</td>
                <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{p.policy}</td>
                <td className="py-3 px-3 text-xs text-ink">{p.method}</td>
                <td className="py-3 px-3 font-bold text-ink tnum">{formatZAR(p.amount, { decimals: true })}</td>
                <td className="py-3 px-3">
                  <PaymentStatus status={p.status} />
                </td>
                <td className="py-3 px-3 text-xs text-muted-foreground">{p.when}</td>
                <td className="py-3 px-3 text-right">
                  <Icon name="more" size={14} className="text-muted-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─────────── Reports ─────────── */
export function ReportsView() {
  const reports = [
    { name: "Revenue Recovery Summary", period: "May 2025", size: "2.4 MB", format: "PDF" },
    { name: "Campaign Performance", period: "Q1 2025", size: "1.8 MB", format: "XLSX" },
    { name: "AI Agent Activity", period: "May 2025", size: "3.1 MB", format: "PDF" },
    { name: "POPIA Compliance Audit", period: "Q1 2025", size: "920 KB", format: "PDF" },
    { name: "Customer Engagement", period: "Last 30 days", size: "1.2 MB", format: "CSV" },
  ];
  return (
    <div className="space-y-5 animate-fade-up">
      <Header
        title="Reports"
        subtitle="Generated reports & exports"
        action={
          <Button size="sm" className="bg-brand-500 hover:bg-brand-600 text-white">
            <Icon name="plus" size={14} className="mr-1.5" /> Generate report
          </Button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Card key={r.name} className="p-5 hover:shadow-md transition cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <Icon name="sheet" size={18} className="text-brand-600" />
              </div>
              <Badge className="bg-muted text-muted-foreground text-[10px] font-semibold hover:bg-muted">
                {r.format}
              </Badge>
            </div>
            <h3 className="font-bold text-ink mb-1">{r.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{r.period} · {r.size}</p>
            <Button variant="outline" size="sm" className="w-full text-xs h-8">
              <Icon name="download" size={12} className="mr-1" /> Download
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Integrations ─────────── */
export function IntegrationsView() {
  const integrations = [
    { name: "Ozow", desc: "Instant EFT payments in WhatsApp", icon: "card", connected: true, color: "bg-brand-500/10 text-brand-600" },
    { name: "Evolution API", desc: "WhatsApp Business messaging", icon: "chat", connected: true, color: "bg-brand-500/10 text-brand-600" },
    { name: "Clerk", desc: "Authentication & user management", icon: "lock", connected: true, color: "bg-blue-50 text-blue-600" },
    { name: "Neon PostgreSQL", desc: "Multi-tenant database", icon: "database", connected: true, color: "bg-teal-50 text-teal-600" },
    { name: "Upstash Redis", desc: "Rate limiting & caching", icon: "zap", connected: false, color: "bg-amber-50 text-amber-600" },
    { name: "Vercel Blob", desc: "File storage for imports", icon: "upload", connected: false, color: "bg-muted text-muted-foreground" },
  ];
  return (
    <div className="space-y-5 animate-fade-up">
      <Header title="Integrations" subtitle="Connected services & API keys" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((i) => (
          <Card key={i.name} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i.color}`}>
                <Icon name={i.icon} size={18} />
              </div>
              {i.connected ? (
                <Badge className="bg-brand-100 text-brand-700 text-[10px] font-semibold hover:bg-brand-100">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mr-1" /> Connected
                </Badge>
              ) : (
                <Badge className="bg-muted text-muted-foreground text-[10px] font-semibold hover:bg-muted">
                  Not connected
                </Badge>
              )}
            </div>
            <h3 className="font-bold text-ink mb-1">{i.name}</h3>
            <p className="text-xs text-muted-foreground mb-4">{i.desc}</p>
            <Button
              variant={i.connected ? "outline" : "default"}
              size="sm"
              className={`w-full text-xs h-8 ${i.connected ? "" : "bg-brand-500 hover:bg-brand-600 text-white"}`}
              onClick={() => toast.info(i.connected ? `Configure ${i.name}` : `Connect ${i.name}`)}
            >
              {i.connected ? "Configure" : "Connect"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Settings ─────────── */
export function SettingsView() {
  const sections = [
    { title: "Organization", desc: "Name, vertical, business hours", icon: "building" },
    { title: "Team & roles", desc: "Members, owners, admins", icon: "users" },
    { title: "Billing", desc: "Plan, usage, invoices", icon: "card" },
    { title: "Compliance", desc: "POPIA consent, retention, opt-out", icon: "shield" },
    { title: "API keys", desc: "Webhooks, MCP tokens, secrets", icon: "lock" },
    { title: "Notifications", desc: "Email, WhatsApp, in-app alerts", icon: "bell" },
  ];
  return (
    <div className="space-y-5 animate-fade-up">
      <Header title="Settings" subtitle="Organization configuration" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Card key={s.title} className="p-5 hover:shadow-md transition cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <Icon name={s.icon} size={18} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-ink mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <Icon name="arrowUpRight" size={14} className="text-muted-foreground shrink-0" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Shared pieces ─────────── */
function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`text-sm font-bold tnum ${highlight ? "text-brand-600" : "text-ink"}`}>{value}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  deltaColor = "text-brand-600",
}: {
  label: string;
  value: string;
  delta?: string;
  deltaColor?: string;
}) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
      <div className="text-xl lg:text-2xl font-extrabold text-ink tnum">{value}</div>
      {delta && <div className={`text-[11px] font-semibold mt-1 ${deltaColor}`}>{delta}</div>}
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    lapsed: { cls: "bg-amber-100 text-amber-800", label: "Lapsed" },
    failed_debit: { cls: "bg-red-100 text-red-700", label: "Failed debit" },
    dormant: { cls: "bg-muted text-muted-foreground", label: "Dormant" },
    active: { cls: "bg-brand-100 text-brand-700", label: "Active" },
    at_risk: { cls: "bg-orange-100 text-orange-700", label: "At risk" },
  };
  const s = map[status] ?? map.dormant;
  return (
    <Badge className={`text-[10px] font-semibold h-5 ${s.cls}`}>{s.label}</Badge>
  );
}

function PaymentStatus({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    confirmed: { cls: "bg-brand-100 text-brand-700", label: "Confirmed" },
    pending: { cls: "bg-amber-100 text-amber-800", label: "Pending" },
    failed: { cls: "bg-red-100 text-red-700", label: "Failed" },
  };
  const s = map[status] ?? map.pending;
  return (
    <Badge className={`text-[10px] font-semibold h-5 ${s.cls}`}>{s.label}</Badge>
  );
}
