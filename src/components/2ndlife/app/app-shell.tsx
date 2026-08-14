"use client";

import { Logo } from "../shared/logo";
import { Icon } from "../shared/icon";
import { useAppStore, type AppView } from "@/lib/2ndlife/store";
import { navItems } from "@/lib/2ndlife/data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const viewToNav: Record<AppView, string> = {
  landing: "dashboard",
  dashboard: "dashboard",
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
      <aside className="w-[260px] bg-brand-900 text-brand-100 flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="px-4 pt-5 pb-3 cursor-pointer" onClick={exitToLanding}>
          <Logo variant="light" size="md" />
        </div>
        <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto scroll-thin">
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

        {/* Promo card */}
        <div className="px-3 pb-3">
          <div className="bg-brand-950/60 border border-brand-700/50 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-40">
              <Icon name="refresh" size={48} className="text-brand-500" />
            </div>
            <p className="text-sm font-bold text-white leading-snug relative">
              Your revenue deserves a second life.
            </p>
            <p className="text-[11px] text-brand-200/70 mt-1 leading-snug relative">
              We turn lapsed policies into loyal customers.
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
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

function AppHeader() {
  const { setView } = useAppStore();
  return (
    <header className="h-16 bg-white border-b border-border sticky top-0 z-30 px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-muted rounded-lg transition lg:hidden">
          <Icon name="menu" size={20} />
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink leading-tight">
            Welcome back, Nomsa! <span className="inline-block">👋</span>
          </h1>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your revenue recovery today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Org selector */}
        <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 hover:bg-muted rounded-lg transition border border-transparent hover:border-border">
          <Icon name="building" size={16} className="text-brand-600" />
          <span className="text-sm font-medium text-ink">Funeral Secure Admin</span>
          <Icon name="chevron" size={14} className="text-muted-foreground" />
        </button>

        {/* Search */}
        <Button
          variant="outline"
          size="sm"
          className="hidden md:flex gap-2 text-muted-foreground"
          onClick={() => setView("customers")}
        >
          <Icon name="search" size={14} />
          <span className="text-xs">Search customers…</span>
        </Button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-muted rounded-lg transition">
          <Icon name="bell" size={18} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* New campaign */}
        <Button
          size="sm"
          className="bg-brand-500 hover:bg-brand-600 text-white hidden md:flex"
          onClick={() => setView("campaigns-new")}
        >
          <Icon name="plus" size={14} className="mr-1" /> New Campaign
        </Button>

        {/* Date picker */}
        <button className="hidden xl:flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition text-sm">
          <Icon name="calendar" size={14} className="text-muted-foreground" />
          <span className="text-ink font-medium">May 12 – May 18, 2025</span>
          <Icon name="chevron" size={12} className="text-muted-foreground" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <Avatar className="w-9 h-9 border-2 border-border">
            <AvatarFallback className="bg-brand-500 text-white text-xs font-semibold">
              ND
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <div className="text-sm font-semibold text-ink leading-tight">Nomsa Dlamini</div>
            <div className="text-[11px] text-muted-foreground">Administrator</div>
          </div>
          <Icon name="chevron" size={14} className="text-muted-foreground hidden md:block" />
        </div>
      </div>
    </header>
  );
}
