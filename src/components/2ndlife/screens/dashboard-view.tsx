"use client";

import { Icon } from "../shared/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  kpis,
  revenueTrend,
  recoveryFunnel,
  totalRecovered,
  recentActivity,
  topCampaigns,
  paymentMethods,
} from "@/lib/2ndlife/data";
import { formatZAR, formatNumber, formatPercent, formatZARCompact } from "@/lib/2ndlife/format";
import { useAppStore } from "@/lib/2ndlife/store";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export function DashboardView() {
  const { setView, openCustomer, openConversation } = useAppStore();

  return (
    <div className="space-y-6 animate-fade-up">
      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          iconBg="bg-brand-500/10"
          iconColor="text-brand-600"
          icon="trend"
          label="Revenue Recovered"
          value={formatZAR(kpis.revenueRecovered.value)}
          delta={kpis.revenueRecovered.delta}
        />
        <KpiCard
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          icon="users"
          label="Policies Reactivated"
          value={formatNumber(kpis.policiesReactivated.value)}
          delta={kpis.policiesReactivated.delta}
        />
        <KpiCard
          iconBg="bg-brand-500/10"
          iconColor="text-brand-600"
          icon="chat"
          label="Conversations"
          value={formatNumber(kpis.conversations.value)}
          delta={kpis.conversations.delta}
        />
        <KpiCard
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          icon="card"
          label="Payments Received"
          value={formatNumber(kpis.paymentsReceived.value)}
          delta={kpis.paymentsReceived.delta}
        />
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue line */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-ink">Revenue Recovered</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-xs h-7">Daily</Button>
              <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground">Weekly</Button>
              <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground">Monthly</Button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#5c6b64" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#5c6b64" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `R${v / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1220",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#fff", fontSize: "11px" }}
                  formatter={(v: number) => [formatZAR(v), "Recovered"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#16a34a"
                  strokeWidth={3}
                  fill="url(#revGradient)"
                  dot={{ fill: "#16a34a", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Total recovered dark card */}
        <Card className="bg-brand-950 border-0 text-white p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-brand-200/70 font-medium">Total Revenue Recovered</span>
            <Badge className="bg-white/10 text-white text-[10px] hover:bg-white/10">This Month</Badge>
          </div>
          <div className="text-3xl lg:text-4xl font-extrabold tnum mb-1">
            {formatZAR(totalRecovered.value)}
          </div>
          <div className="text-sm text-brand-400 font-semibold flex items-center gap-1 mb-3">
            <Icon name="trend" size={14} />
            {formatPercent(totalRecovered.delta)}% vs {totalRecovered.vs}
          </div>
          <div className="h-20 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={totalRecovered.sparkline.map((v, i) => ({ i, v }))}>
                <defs>
                  <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#sparkGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* FUNNEL + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-ink">Recovery Funnel</h3>
              <p className="text-xs text-muted-foreground">From lapsed policy to reactivation</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-brand-600 hover:text-brand-700">
              View report <Icon name="arrow" size={12} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {recoveryFunnel.map((f, i) => {
              const widthPct = i === 0 ? 100 : (f.count / recoveryFunnel[0].count) * 100;
              return (
                <div key={f.stage} className="flex items-center gap-4">
                  <div className="w-44 shrink-0 text-xs text-ink font-medium">{f.stage}</div>
                  <div className="flex-1 relative h-9 bg-muted rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg flex items-center px-3 transition-all"
                      style={{ width: `${widthPct}%`, backgroundColor: f.color }}
                    >
                      <span className="text-white text-xs font-bold tnum">
                        {formatNumber(f.count)}
                      </span>
                    </div>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold tnum">
                      {f.pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent activity */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-ink">Recent Activity</h3>
            <button className="text-xs text-brand-600 font-semibold hover:text-brand-700">
              View all
            </button>
          </div>
          <div className="space-y-4 max-h-[280px] overflow-y-auto scroll-thin">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    a.tone === "good"
                      ? "bg-brand-500/10"
                      : a.tone === "info"
                      ? "bg-blue-50"
                      : "bg-amber-50"
                  }`}
                >
                  <Icon
                    name={a.icon}
                    size={16}
                    className={
                      a.tone === "good"
                        ? "text-brand-600"
                        : a.tone === "info"
                        ? "text-blue-600"
                        : "text-amber-600"
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink leading-tight">{a.title}</div>
                  {a.subtitle && (
                    <div className="text-xs text-muted-foreground truncate">{a.subtitle}</div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-0.5">{a.time}</div>
                </div>
                {a.amount && (
                  <div className="text-sm font-bold text-brand-600 tnum">
                    {formatZAR(a.amount, { decimals: true })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* CAMPAIGNS TABLE + PAYMENT DONUT + QUICK ACTIONS */}
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
                  <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Payments</th>
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
                    <td className="py-3 px-2 text-right tnum text-muted-foreground">{formatNumber(c.payments)}</td>
                    <td className="py-3 px-2 text-right tnum font-bold text-ink">{formatZAR(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment donut */}
        <Card className="p-5">
          <h3 className="text-base font-bold text-ink mb-2">Payment Methods</h3>
          <p className="text-xs text-muted-foreground mb-3">Last 30 days</p>
          <div className="relative h-32 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={42}
                  outerRadius={58}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {paymentMethods.map((m) => (
                    <Cell key={m.label} fill={m.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1220",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  formatter={(v: number, n: string) => [`${v}%`, n]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[10px] text-muted-foreground">Total</div>
              <div className="text-lg font-extrabold text-ink tnum">2,156</div>
            </div>
          </div>
          <div className="space-y-1.5">
            {paymentMethods.map((m) => (
              <div key={m.label} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-ink flex-1">{m.label}</span>
                <span className="text-muted-foreground font-semibold tnum">{m.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* QUICK ACTIONS + AI INSIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-base font-bold text-ink mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction
              icon="upload"
              iconColor="text-brand-600"
              iconBg="bg-brand-500/10"
              label="Upload Lapsed Policies"
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
              label="Generate Report"
              onClick={() => setView("reports")}
            />
          </div>

          {/* Customer shortcut row */}
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
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { name: "Thabo Mokoena", score: 87, value: 4800, id: "cus_8412" },
                { name: "Sipho Dlamini", score: 91, value: 3600, id: "cus_8414" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCustomer(c.id)}
                  className="flex items-center gap-3 p-3 bg-muted/50 hover:bg-muted rounded-lg transition text-left"
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

        {/* AI insight strip */}
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-brand-50 border-amber-200/50">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Icon name="bulb" size={18} className="text-amber-600" />
            </div>
            <div>
              <div className="font-bold text-ink text-sm">AI Insight</div>
              <div className="text-[10px] text-muted-foreground">Generated 2 minutes ago</div>
            </div>
          </div>
          <p className="text-sm text-ink leading-relaxed mb-4">
            Your recovery rate is <span className="font-bold text-brand-600">18% higher</span> than the industry average.
            Customers contacted within 7 days of lapse are <span className="font-bold text-brand-600">3.2× more likely</span> to restart.
            Consider running a sweep on policies lapsed in the last 30 days.
          </p>
          <div className="space-y-2">
            <Button
              size="sm"
              className="bg-brand-500 hover:bg-brand-600 text-white w-full h-8"
              onClick={() => setView("imports")}
            >
              <Icon name="upload" size={12} className="mr-1" /> Import new batch
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-brand-700 border-brand-200"
              onClick={() => openConversation("con_002")}
            >
              <Icon name="chat" size={12} className="mr-1" /> Review awaiting human
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─────────── Pieces ─────────── */

function KpiCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  delta,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  delta: number;
}) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center mb-3`}>
        <Icon name={icon} size={18} className={iconColor} />
      </div>
      <div className="text-xs text-muted-foreground font-medium mb-1">{label}</div>
      <div className="text-2xl lg:text-3xl font-extrabold text-ink tnum leading-tight">{value}</div>
      <div className="text-xs font-semibold text-brand-600 flex items-center gap-1 mt-1">
        <Icon name="trend" size={12} />
        {formatPercent(delta)}% vs last 7 days
      </div>
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
