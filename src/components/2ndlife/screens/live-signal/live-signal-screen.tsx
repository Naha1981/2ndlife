"use client";

import { useState, useEffect, useCallback } from "react";
import { Icon } from "@/components/2ndlife/shared/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignalCategoryBadge } from "./signal-category-badge";
import { LiveSignalDemoBanner } from "./live-signal-demo-banner";
import { canPublishProof, proofBlockReason } from "@/modules/livesignal/proof-gate";
import { buildContextualHandoffMessage } from "@/modules/livesignal/ingest.service";
import { PACK_DEFAULT_MODE } from "@/modules/livesignal/room-mode";
import type {
  LiveSignalRow,
  LiveLeadRow,
  LiveRoomSummary,
  SignalCategory,
  SimulatedEvent,
} from "@/modules/livesignal/types";

// ─── Tab types ────────────────────────────────────────────────────────────────

type LiveSignalTab =
  | "live-now"
  | "signals"
  | "conversion"
  | "content"
  | "proof"
  | "setup";

const TABS: { id: LiveSignalTab; label: string; icon: string }[] = [
  { id: "live-now", label: "LIVE NOW", icon: "signal" },
  { id: "signals", label: "SIGNALS", icon: "chart" },
  { id: "conversion", label: "CONVERSION", icon: "phone" },
  { id: "content", label: "CONTENT OPPORTUNITIES", icon: "brain" },
  { id: "proof", label: "PROOF INBOX", icon: "shield" },
  { id: "setup", label: "SETUP", icon: "gear" },
];

// ─── Mock data for demo mode ──────────────────────────────────────────────────

const MOCK_ROOMS: LiveRoomSummary[] = [
  { id: "room_demo_1", tenantId: "t1", name: "Main Website", mode: "private", isActive: true, signalCount: 42, leadCount: 18, createdAt: new Date().toISOString() },
  { id: "room_demo_2", tenantId: "t1", name: "Product Pages", mode: "private", isActive: false, signalCount: 17, leadCount: 6, createdAt: new Date().toISOString() },
];

const MOCK_SIGNALS: LiveSignalRow[] = [
  { id: "sig_1", tenantId: "t1", roomId: "room_demo_1", category: "price", excerpt: "How much does the family cover cost per month?", promotedToRadar: true, occurrences: 4, createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "sig_2", tenantId: "t1", roomId: "room_demo_1", category: "urgency", excerpt: "Need this sorted today — it's an emergency", promotedToRadar: false, occurrences: 2, createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: "sig_3", tenantId: "t1", roomId: "room_demo_1", category: "financing", excerpt: "Do you have any payment plan or instalment option?", promotedToRadar: true, occurrences: 3, createdAt: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: "sig_4", tenantId: "t1", roomId: "room_demo_1", category: "value_objection", excerpt: "I've seen it slightly cheaper elsewhere, why choose you?", promotedToRadar: false, occurrences: 2, createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: "sig_5", tenantId: "t1", roomId: "room_demo_1", category: "social_validation", excerpt: "A friend told me about you — do you have any reviews?", promotedToRadar: false, occurrences: 1, createdAt: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: "sig_6", tenantId: "t1", roomId: "room_demo_1", category: "purchase_intent", excerpt: "I'd like to sign up today — where do I pay?", promotedToRadar: false, occurrences: 1, createdAt: new Date(Date.now() - 25 * 60000).toISOString() },
];

const MOCK_LEADS: LiveLeadRow[] = [
  { id: "lead_1", tenantId: "t1", roomId: "room_demo_1", sessionId: "visitor-d4f2", signalIds: ["sig_1", "sig_3"], handoffSent: true, handoffAt: new Date(Date.now() - 10 * 60000).toISOString(), consentStatus: "granted", createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: "lead_2", tenantId: "t1", roomId: "room_demo_1", sessionId: "visitor-b7c1", signalIds: ["sig_2", "sig_4"], handoffSent: false, handoffAt: null, consentStatus: "pending", createdAt: new Date(Date.now() - 20 * 60000).toISOString() },
  { id: "lead_3", tenantId: "t1", roomId: "room_demo_1", sessionId: "visitor-a9e3", signalIds: ["sig_6"], handoffSent: false, handoffAt: null, consentStatus: "denied", createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function LiveSignalScreen() {
  const [activeTab, setActiveTab] = useState<LiveSignalTab>("live-now");
  const [liveSignals, setLiveSignals] = useState<LiveSignalRow[]>(MOCK_SIGNALS);
  const [visitorCount, setVisitorCount] = useState(3);
  const [simEvents, setSimEvents] = useState<SimulatedEvent[]>([]);

  // Simulate live visitor count pulsing in demo mode
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount((v) => Math.max(1, v + Math.floor(Math.random() * 3) - 1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSimEvent = useCallback((ev: SimulatedEvent) => {
    if (ev.type === "signal" && ev.category && ev.excerpt) {
      const newSignal: LiveSignalRow = {
        id: `sim_${Date.now()}`,
        tenantId: "t1",
        roomId: "room_demo_1",
        category: ev.category as SignalCategory,
        excerpt: ev.excerpt,
        promotedToRadar: false,
        occurrences: 1,
        createdAt: new Date().toISOString(),
      };
      setLiveSignals((prev) => [newSignal, ...prev]);
    }
  }, []);

  return (
    <div className="space-y-5">
      {/* ─── Page header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h1 className="text-xl font-bold text-ink">LiveSignal</h1>
            <Badge className="bg-brand-100 text-brand-700 border border-brand-200 text-[10px] font-bold">
              PHASE A
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time visitor intent intelligence — convert signals into revenue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-red-700">{visitorCount} active now</span>
          </div>
        </div>
      </div>

      {/* ─── Stat cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Signals Today", value: liveSignals.length.toString(), icon: "signal", color: "text-brand-600 bg-brand-50" },
          { label: "Leads Captured", value: MOCK_LEADS.length.toString(), icon: "users", color: "text-blue-600 bg-blue-50" },
          { label: "Promoted to Radar", value: liveSignals.filter(s => s.promotedToRadar).length.toString(), icon: "chart", color: "text-violet-600 bg-violet-50" },
          { label: "Handoffs Sent", value: MOCK_LEADS.filter(l => l.handoffSent).length.toString(), icon: "chat", color: "text-green-600 bg-green-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-xl p-3.5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${stat.color}`}>
              <Icon name={stat.icon} size={16} />
            </div>
            <div>
              <div className="text-xl font-bold text-ink leading-none">{stat.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Tab navigation ─── */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex overflow-x-auto scroll-thin border-b border-border">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`livesignal-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-700 bg-brand-50/50"
                  : "border-transparent text-muted-foreground hover:text-ink hover:bg-muted/30"
              }`}
            >
              <Icon name={tab.icon} size={12} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── Tab content ─── */}
        <div className="p-4">
          {activeTab === "live-now" && (
            <LiveNowTab
              rooms={MOCK_ROOMS}
              signals={liveSignals}
              visitorCount={visitorCount}
              onSimEvent={handleSimEvent}
            />
          )}
          {activeTab === "signals" && <SignalsTab signals={liveSignals} />}
          {activeTab === "conversion" && <ConversionTab leads={MOCK_LEADS} signals={liveSignals} />}
          {activeTab === "content" && <ContentTab signals={liveSignals.filter((s) => s.promotedToRadar)} />}
          {activeTab === "proof" && <ProofTab leads={MOCK_LEADS} signals={liveSignals} />}
          {activeTab === "setup" && <SetupTab rooms={MOCK_ROOMS} />}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: LIVE NOW ────────────────────────────────────────────────────────────

function LiveNowTab({
  rooms,
  signals,
  visitorCount,
  onSimEvent,
}: {
  rooms: LiveRoomSummary[];
  signals: LiveSignalRow[];
  visitorCount: number;
  onSimEvent: (e: SimulatedEvent) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Demo harness */}
      <LiveSignalDemoBanner packSlug="funeral-insurance" onEvent={onSimEvent} />

      {/* Active rooms */}
      <div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Active Rooms
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {rooms.map((room) => (
            <div key={room.id} className="border border-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${room.isActive ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
                <div>
                  <div className="text-sm font-semibold text-ink">{room.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {room.signalCount} signals · {room.leadCount} leads · {room.mode}
                  </div>
                </div>
              </div>
              <Badge className={`text-[10px] ${room.isActive ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                {room.isActive ? "LIVE" : "OFFLINE"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Recent signal stream */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Live Signal Stream
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block" />
            {visitorCount} visitors
          </div>
        </div>
        <div className="space-y-2">
          {signals.slice(0, 8).map((sig) => (
            <div
              key={sig.id}
              className="flex items-start gap-3 bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition"
            >
              <SignalCategoryBadge category={sig.category as SignalCategory} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-ink leading-snug truncate">"{sig.excerpt}"</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {sig.occurrences >= 3 && (
                  <span className="text-[10px] bg-violet-100 text-violet-700 rounded-full px-1.5 py-0.5 font-semibold">
                    ✦ Radar
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground">{timeAgo(sig.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: SIGNALS ─────────────────────────────────────────────────────────────

function SignalsTab({ signals }: { signals: LiveSignalRow[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">{signals.length} signals captured</h3>
        <div className="text-xs text-muted-foreground">Showing all · sorted by recency</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-muted-foreground font-semibold pb-2 pr-4">Category</th>
              <th className="text-left text-muted-foreground font-semibold pb-2 pr-4">Excerpt</th>
              <th className="text-left text-muted-foreground font-semibold pb-2 pr-4">Hits</th>
              <th className="text-left text-muted-foreground font-semibold pb-2 pr-4">Radar</th>
              <th className="text-left text-muted-foreground font-semibold pb-2">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {signals.map((sig) => (
              <tr key={sig.id} className="hover:bg-muted/30 transition">
                <td className="py-2.5 pr-4">
                  <SignalCategoryBadge category={sig.category as SignalCategory} size="sm" />
                </td>
                <td className="py-2.5 pr-4 max-w-xs">
                  <p className="text-ink truncate">"{sig.excerpt}"</p>
                </td>
                <td className="py-2.5 pr-4 font-semibold text-ink">{sig.occurrences}×</td>
                <td className="py-2.5 pr-4">
                  {sig.promotedToRadar ? (
                    <span className="text-violet-700 font-semibold">✦ Yes</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2.5 text-muted-foreground">{timeAgo(sig.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: CONVERSION ─────────────────────────────────────────────────────────

function ConversionTab({ leads, signals }: { leads: LiveLeadRow[]; signals: LiveSignalRow[] }) {
  const signalMap = Object.fromEntries(signals.map((s) => [s.id, s]));

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-ink">{leads.length} leads captured</h3>
      <div className="space-y-3">
        {leads.map((lead) => {
          const leadSignals = lead.signalIds.map((id) => signalMap[id]).filter(Boolean);
          const topSignal = leadSignals[0];
          const handoffMsg = topSignal
            ? buildContextualHandoffMessage(topSignal.excerpt, topSignal.category)
            : null;

          return (
            <div key={lead.id} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <Icon name="users" size={14} className="text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      Anonymous visitor · {lead.sessionId}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {leadSignals.length} signal{leadSignals.length !== 1 ? "s" : ""} ·{" "}
                      {timeAgo(lead.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      lead.consentStatus === "granted"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : lead.consentStatus === "denied"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {lead.consentStatus.toUpperCase()}
                  </span>
                  {lead.handoffSent && (
                    <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
                      WA SENT
                    </span>
                  )}
                </div>
              </div>

              {/* Signal pills */}
              <div className="flex gap-1.5 flex-wrap">
                {leadSignals.map((s) => (
                  <SignalCategoryBadge key={s.id} category={s.category as SignalCategory} size="sm" />
                ))}
              </div>

              {/* Contextual handoff preview (verification row 8) */}
              {handoffMsg && !lead.handoffSent && lead.consentStatus === "granted" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-[10px] text-green-800 font-semibold mb-1">Contextual WhatsApp message (ready to send):</p>
                  <p className="text-xs text-green-900 italic">"{handoffMsg}"</p>
                </div>
              )}

              {/* Handoff sent confirmation */}
              {lead.handoffSent && lead.handoffAt && (
                <div className="flex items-center gap-1.5 text-xs text-green-700">
                  <Icon name="check" size={12} />
                  Contextual WhatsApp sent {timeAgo(lead.handoffAt)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: CONTENT OPPORTUNITIES ───────────────────────────────────────────────

function ContentTab({ signals }: { signals: LiveSignalRow[] }) {
  if (signals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon name="chart" size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No signals promoted yet</p>
        <p className="text-xs mt-1">Signals with 3+ occurrences are auto-promoted to the Demand Radar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-bold text-ink">{signals.length} promoted to Demand Radar</h3>
        <Badge className="bg-violet-100 text-violet-700 border-violet-200 text-[10px]">
          source: livesignal
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground">
        These signals appeared 3+ times and have been promoted to your Demand Radar as content opportunities.
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        {signals.map((sig) => (
          <div key={sig.id} className="border border-violet-200 bg-violet-50/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <SignalCategoryBadge category={sig.category as SignalCategory} />
              <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                ✦ {sig.occurrences}× seen
              </span>
            </div>
            <p className="text-xs text-ink">"{sig.excerpt}"</p>
            <div className="text-[10px] text-muted-foreground">
              Content idea: Address this question in a reel, FAQ post, or WhatsApp campaign
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: PROOF INBOX ─────────────────────────────────────────────────────────

function ProofTab({ leads, signals }: { leads: LiveLeadRow[]; signals: LiveSignalRow[] }) {
  const signalMap = Object.fromEntries(signals.map((s) => [s.id, s]));
  const grantedLeads = leads.filter((l) => l.consentStatus === "granted");
  const pendingLeads = leads.filter((l) => l.consentStatus === "pending");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-ink">Proof Inbox</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Only sessions with explicit visitor consent can be published as social proof.
        </p>
      </div>

      {/* Pending consent — blocked */}
      {pendingLeads.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Awaiting Consent ({pendingLeads.length})
          </h4>
          {pendingLeads.map((lead) => {
            const blocked = !canPublishProof(lead);
            const reason = proofBlockReason(lead);
            const leadSignals = lead.signalIds.map((id) => signalMap[id]).filter(Boolean);
            return (
              <div key={lead.id} className="border border-amber-200 bg-amber-50/30 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-ink">Session {lead.sessionId}</span>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {leadSignals.map((s) => (
                        <SignalCategoryBadge key={s.id} category={s.category as SignalCategory} size="sm" />
                      ))}
                    </div>
                  </div>
                  {/* Proof gate — blocked (verification row 7) */}
                  <Button
                    size="sm"
                    disabled={blocked}
                    className="text-xs bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                    id={`proof-publish-btn-${lead.id}`}
                  >
                    <Icon name="shield" size={12} className="mr-1" />
                    Publish Proof
                  </Button>
                </div>
                {reason && (
                  <div className="flex items-start gap-1.5 bg-amber-100 rounded-lg px-3 py-2">
                    <Icon name="warn" size={12} className="text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800">{reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Granted — can publish */}
      {grantedLeads.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Consent Granted — Ready to Publish ({grantedLeads.length})
          </h4>
          {grantedLeads.map((lead) => {
            const leadSignals = lead.signalIds.map((id) => signalMap[id]).filter(Boolean);
            return (
              <div key={lead.id} className="border border-green-200 bg-green-50/30 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-ink">Session {lead.sessionId}</span>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {leadSignals.map((s) => (
                        <SignalCategoryBadge key={s.id} category={s.category as SignalCategory} size="sm" />
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="text-xs bg-green-600 hover:bg-green-700 text-white"
                    id={`proof-publish-granted-btn-${lead.id}`}
                  >
                    <Icon name="shield" size={12} className="mr-1" />
                    Publish Proof
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: SETUP ───────────────────────────────────────────────────────────────

function SetupTab({ rooms }: { rooms: LiveRoomSummary[] }) {
  return (
    <div className="space-y-5">
      {/* Webhook config */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-ink">Webhook Configuration</h3>
        <p className="text-xs text-muted-foreground">
          Point your widget or integration to this signed webhook endpoint.
        </p>
        <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-green-400 space-y-1">
          <div><span className="text-slate-400">Endpoint:</span> /api/webhooks/livesignal</div>
          <div><span className="text-slate-400">Method:</span> POST</div>
          <div><span className="text-slate-400">Auth:</span> X-LiveSignal-Signature (HMAC-SHA256)</div>
          <div><span className="text-slate-400">Idempotency:</span> X-Idempotency-Key (required)</div>
        </div>
      </div>

      {/* Room management */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-ink">Rooms</h3>
        <div className="space-y-2">
          {rooms.map((room) => (
            <div key={room.id} className="border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-ink">{room.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Mode: <span className="font-semibold text-ink">{room.mode}</span> ·{" "}
                    {room.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${PACK_DEFAULT_MODE["funeral-insurance"] === "private" ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-teal-100 text-teal-700 border-teal-200"}`}>
                    {room.mode.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button size="sm" variant="outline" className="text-xs" id="livesignal-add-room-btn">
          <Icon name="plus" size={12} className="mr-1" />
          Add Room
        </Button>
      </div>

      {/* Phase B gate notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-2.5">
          <Icon name="warn" size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-800">Phase B (WebRTC Widget) — Blocked</p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              Real-time transcript streaming requires Phase B verification. Complete the 15-row
              verification table to unlock. Community room mode will also be available in Phase B.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
