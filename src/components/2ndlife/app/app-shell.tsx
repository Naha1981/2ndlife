"use client";

import { Logo } from "../shared/logo";
import { Icon } from "../shared/icon";
import { useAppStore, type AppView } from "@/lib/2ndlife/store";
import { navItems, recentActivity } from "@/lib/2ndlife/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatZAR } from "@/lib/2ndlife/format";

const viewToNav: Record<AppView, string> = {
  landing: "dashboard",
  dashboard: "dashboard",
  "demand-radar": "demand-radar",
  campaigns: "campaigns",
  "campaigns-new": "campaigns",
  conversations: "conversations",
  customers: "customers",
  "customer-detail": "customers",
  imports: "imports",
  payments: "payments",
  reports: "reports",
  integrations: "integrations",
  settings: "settings",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { view, setView, exitToLanding } = useAppStore();
  const activeNav = viewToNav[view];

  return (
    <div className="min-h-screen bg-background flex">
      {/* ─────── SIDEBAR ─────── */}
      <aside className="w-[260px] bg-brand-900 text-brand-100 flex flex-col shrink-0 sticky top-0 h-screen overflow-hidden">
        {/* Logo */}
        <div className="px-4 pt-5 pb-3 cursor-pointer shrink-0" onClick={exitToLanding}>
          <Logo variant="light" height={40} />
        </div>
        {/* Nav — internal scroll */}
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto scroll-thin min-h-0">
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as AppView)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                  active
                    ? "bg-brand-500 text-white font-semibold shadow-sm"
                    : "text-brand-100/80 hover:bg-brand-800 hover:text-white"
                }`}
              >
                <Icon name={item.icon} size={16} className={active ? "text-white" : "text-brand-100/60 group-hover:text-white"} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge
                    className={`text-[10px] font-bold h-5 px-1.5 ${
                      active
                        ? "bg-white text-brand-700"
                        : "bg-brand-500 text-white"
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer — pinned inside sidebar */}
        <div className="px-3 pb-3 shrink-0">
          <div className="bg-brand-950/60 border border-brand-700/50 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-40">
              <Icon name="refresh" size={48} className="text-brand-500" />
            </div>
            <p className="text-sm font-bold text-white leading-snug relative">
              Your revenue deserves a second life.
            </p>
            <p className="text-[11px] text-brand-200/70 mt-1 leading-snug relative">
              We turn lapsed customers into loyal customers.
            </p>
          </div>
          <div className="text-[10px] text-brand-200/50 px-2 pt-2">
            © 2025 2ndLife by NahaLabs
            <br />
            All rights reserved.
          </div>
        </div>
      </aside>

      {/* ─────── MAIN ─────── */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function AppHeader() {
  const { setView } = useAppStore();

  return (
    <header className="h-16 bg-white border-b border-border sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-lg lg:text-xl font-bold text-ink leading-tight truncate">
            Welcome back, Nomsa! <span className="inline-block">👋</span>
          </h1>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Here&apos;s what&apos;s happening with your revenue recovery today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {/* Tenant — plain text (no switching exists) */}
        <div className="hidden lg:flex items-center gap-2 px-2">
          <Icon name="building" size={16} className="text-brand-600" />
          <span className="text-sm font-medium text-ink">Funeral Secure Admin</span>
        </div>

        {/* Search — navigates to Contacts */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-2 text-muted-foreground"
          onClick={() => setView("customers")}
        >
          <Icon name="search" size={14} />
          <span className="text-xs hidden lg:inline">Search customers…</span>
        </Button>

        {/* Notifications — popover with recent activity */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 hover:bg-muted rounded-lg transition cursor-pointer">
              <Icon name="bell" size={18} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {recentActivity.length}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="px-3 py-2 border-b border-border">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Recent Activity
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto scroll-thin">
              {recentActivity.map((a) => (
                <div key={a.id} className="flex gap-2.5 px-3 py-2.5 border-b border-border/50 hover:bg-muted/50 transition">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      a.tone === "good"
                        ? "bg-brand-500/10"
                        : a.tone === "info"
                        ? "bg-blue-50"
                        : "bg-amber-50"
                    }`}
                  >
                    <Icon
                      name={a.icon}
                      size={14}
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
                    <div className="text-xs font-medium text-ink leading-tight">{a.title}</div>
                    {a.subtitle && <div className="text-[10px] text-muted-foreground truncate">{a.subtitle}</div>}
                    <div className="text-[10px] text-muted-foreground mt-0.5">{a.time}</div>
                  </div>
                  {a.amount && (
                    <div className="text-xs font-bold text-brand-600 tnum">
                      {formatZAR(a.amount, { decimals: true })}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setView("reports")}
              className="w-full text-center text-xs text-brand-600 font-semibold py-2 hover:bg-muted/50 transition"
            >
              View all activity →
            </button>
          </PopoverContent>
        </Popover>

        {/* New campaign — navigates to builder */}
        <Button
          size="sm"
          className="bg-brand-500 hover:bg-brand-600 text-white hidden md:flex"
          onClick={() => setView("campaigns-new")}
        >
          <Icon name="plus" size={14} className="mr-1" /> <span className="hidden lg:inline">New Campaign</span>
          <span className="lg:hidden">New</span>
        </Button>

        {/* Date range — plain text label, not a button */}
        <div className="hidden xl:flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
          <Icon name="calendar" size={14} />
          <span>Last 7 days</span>
        </div>

        {/* User — plain info, no dropdown */}
        <div className="flex items-center gap-2 pl-2 lg:pl-3 border-l border-border">
          <Avatar className="w-8 h-8 lg:w-9 lg:h-9 border-2 border-border">
            <AvatarFallback className="bg-brand-500 text-white text-xs font-semibold">
              ND
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-ink leading-tight">Nomsa Dlamini</div>
            <div className="text-[11px] text-muted-foreground">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}
