import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/admin/guard";
import { getAiEnabled } from "@/lib/admin/settings";
import { db } from "@/lib/db";
import { AiToggle } from "@/components/admin/ai-toggle";
import { ShieldCheck, Building2, Users, CreditCard, Sparkles, Activity, MessageSquare, Database } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    await requireSuperAdmin();
  } catch (e) {
    redirect("/");
  }

  // Fetch platform data
  let tenantCount = 0;
  let customerCount = 0;
  let conversationCount = 0;
  let paymentTotal = 0;
  let paymentCount = 0;
  let tenants: Array<{ id: string; name: string; industry: string; createdAt: Date }> = [];
  let aiEnabled = false;

  try {
    aiEnabled = await getAiEnabled();
    const [tCount, cCount, convCount, payments, tenantList] = await Promise.all([
      db.tenant.count().catch(() => 0),
      db.customer.count().catch(() => 0),
      db.conversation.count().catch(() => 0),
      db.payment.findMany({ where: { status: "confirmed" }, select: { amount: true } }).catch(() => []),
      db.tenant.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, industry: true, createdAt: true },
      }).catch(() => []),
    ]);

    tenantCount = tCount;
    customerCount = cCount;
    conversationCount = convCount;
    paymentCount = payments.length;
    paymentTotal = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    tenants = tenantList;
  } catch (err) {
    console.error("[AdminPage] Error loading metrics:", err);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Super Admin Console
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800/60 text-emerald-400">
                    RESTRICTED ACCESS
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Global system overview, master kill-switches, and platform metrics.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-slate-200 border border-slate-800 bg-slate-900/80 px-3.5 py-2 rounded-xl transition"
            >
              ← Back to App
            </Link>
          </div>
        </header>

        {/* AI Master Switch Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Global AI Controls
          </h2>
          <AiToggle />
        </section>

        {/* Quick Stats Grid */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Total Tenants</span>
                <Building2 className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{tenantCount}</div>
              <p className="text-[11px] text-slate-500">Active business organizations</p>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Customers Tracked</span>
                <Users className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{customerCount}</div>
              <p className="text-[11px] text-slate-500">Across all tenant catalogs</p>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Conversations</span>
                <MessageSquare className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{conversationCount}</div>
              <p className="text-[11px] text-slate-500">WhatsApp & AI interactions</p>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Recovered Revenue</span>
                <CreditCard className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 tracking-tight">
                R {paymentTotal.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500">{paymentCount} confirmed transactions</p>
            </div>
          </div>
        </section>

        {/* Recent Tenants List */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            Registered Tenants
          </h2>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
            {tenants.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No tenants found in database.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {tenants.map((t) => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-900/90 transition">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: {t.id}</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="inline-block text-[11px] font-medium px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-slate-300">
                        {t.industry}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Joined {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
