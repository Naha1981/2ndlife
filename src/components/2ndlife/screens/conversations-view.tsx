"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../shared/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { conversations as initialConvs, type ChatMessage, type Conversation } from "@/lib/2ndlife/data";
import { useAppStore } from "@/lib/2ndlife/store";
import { formatZAR } from "@/lib/2ndlife/format";
import { toast } from "sonner";

const FILTERS = [
  { id: "all", label: "All", count: 128, cls: "bg-muted text-ink" },
  { id: "awaiting_human", label: "Awaiting human", count: 12, cls: "bg-amber-100 text-amber-800" },
  { id: "engaged", label: "Engaged", count: 43, cls: "bg-brand-100 text-brand-700" },
  { id: "opted_out", label: "Opted-out", count: 6, cls: "bg-red-100 text-red-700" },
] as const;

export function ConversationsView() {
  const { selectedConversationId } = useAppStore();
  const [convs, setConvs] = useState<Conversation[]>(initialConvs);
  const [activeId, setActiveId] = useState<string>(
    selectedConversationId ?? initialConvs[0].id
  );
  const [filter, setFilter] = useState<string>("all");

  const active = convs.find((c) => c.id === activeId) ?? convs[0];

  const filtered = convs.filter((c) => filter === "all" || c.status === filter);

  return (
    <div className="space-y-4 animate-fade-up h-[calc(100vh-7rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ink">AI Recovery Inbox</h1>
          <p className="text-sm text-muted-foreground">
            WhatsApp conversations · AI agent with human escalation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Icon name="filter" size={12} className="mr-1" /> Filter
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="search" size={12} className="mr-1" /> Search
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f.id ? "bg-brand-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === f.id ? "bg-white/20" : f.cls}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* 3-pane inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4 flex-1 min-h-0">
        {/* List */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-border bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Conversations
          </div>
          <div className="flex-1 overflow-y-auto scroll-thin">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-3 border-b border-border/50 transition ${
                  activeId === c.id
                    ? "bg-brand-50 border-l-[3px] border-l-brand-500"
                    : "hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-ink text-sm">{c.customerName}</div>
                  <span className="text-[10px] text-muted-foreground">{c.lastActivity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={c.status} />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  score {c.score} · {formatZAR(c.estimatedValue)}
                  {c.intent && ` · ${c.intent}`}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Thread */}
        <Card className="p-0 overflow-hidden flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
                {active.customerInitials}
              </div>
              <div>
                <div className="font-semibold text-ink text-sm">{active.customerName}</div>
                <div className="text-[11px] text-muted-foreground">
                  {active.intent ?? "Conversation in progress"}
                </div>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-800 text-[10px] font-semibold hover:bg-amber-100">
              {active.intent ? `intent: ${active.intent}` : "active"}
            </Badge>
          </div>

          <ChatThread conversation={active} onUpdate={(updated) => {
            setConvs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }} />
        </Card>

        {/* Context panel */}
        <div className="space-y-4 overflow-y-auto scroll-thin pr-1">
          <Card className="p-4">
            <Label>Opportunity</Label>
            <dl className="space-y-2 text-sm">
              <Row label="Category" value="Lapsed policy" />
              <Row label="Score" value={String(active.score)} bold />
              <Row label="Est. value" value={formatZAR(active.estimatedValue)} bold />
              <Row label="Recovered" value={active.recovered ? `${formatZAR(active.recovered)} (first premium)` : "—"} />
              <Row label="Status" value={active.status.replace("_", " ")} />
            </dl>
          </Card>

          <Card className="p-4">
            <Label>Guardrails</Label>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Prices &amp; offers sourced only from{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-[10px] text-ink">
                pricing.get_allowed_offer
              </code>
              . Payment confirmed only by verified Ozow webhook. AI cannot invent facts, delete data or bypass limits.
            </p>
            <Button variant="outline" size="sm" className="w-full text-xs h-8">
              <Icon name="user" size={12} className="mr-1" /> Take over conversation
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-8 mt-2 text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => toast.success("Opt-out recorded", {
                description: "STOP honoured · no further messages will be sent",
              })}
            >
              <Icon name="x" size={12} className="mr-1" /> Record opt-out
            </Button>
          </Card>

          <Card className="p-4 bg-brand-50/40 border-brand-200">
            <Label>AI Tool Calls (this session)</Label>
            <ul className="text-[11px] space-y-1.5">
              <li className="flex items-center gap-1.5 text-muted-foreground">
                <Icon name="checkCheck" size={11} className="text-brand-600" /> customer.get
              </li>
              <li className="flex items-center gap-1.5 text-muted-foreground">
                <Icon name="checkCheck" size={11} className="text-brand-600" /> recovery.get_opportunity
              </li>
              <li className="flex items-center gap-1.5 text-muted-foreground">
                <Icon name="checkCheck" size={11} className="text-brand-600" /> pricing.get_allowed_offer
              </li>
              <li className="flex items-center gap-1.5 text-muted-foreground">
                <Icon name="checkCheck" size={11} className="text-brand-600" /> payment.create_request
              </li>
              <li className="flex items-center gap-1.5 text-amber-600">
                <Icon name="spinner" size={11} className="animate-spin" /> payment.get_status
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Demo WhatsApp panel — mock mode only */}
      <DemoWhatsAppPanel customerName={active.customerName} customerPhone="+27721234567" />
    </div>
  );
}

/* ─────────── Demo WhatsApp Panel ─────────── */

function DemoWhatsAppPanel({
  customerName,
  customerPhone,
}: {
  customerName: string;
  customerPhone: string;
}) {
  const [phone, setPhone] = useState(customerPhone);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<
    Array<{ direction: "inbound" | "outbound" | "system"; body: string; time: string }>
  >([]);

  async function send() {
    if (!text.trim() || !phone.trim() || sending) return;
    setSending(true);
    const payload = {
      providerEventId: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      from: phone,
      text: text.trim(),
    };

    setLog((prev) => [
      ...prev,
      { direction: "inbound", body: text.trim(), time: new Date().toLocaleTimeString("en-ZA") },
    ]);

    try {
      const res = await fetch("/api/webhooks/evolution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.NEXT_PUBLIC_WEBHOOK_SECRET
            ? { "x-webhook-secret": process.env.NEXT_PUBLIC_WEBHOOK_SECRET }
            : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.duplicate) {
        setLog((prev) => [
          ...prev,
          { direction: "system", body: "⚠ Duplicate webhook — ignored (idempotency)", time: new Date().toLocaleTimeString("en-ZA") },
        ]);
      } else if (data.ignored) {
        setLog((prev) => [
          ...prev,
          { direction: "system", body: `Ignored: ${data.reason}`, time: new Date().toLocaleTimeString("en-ZA") },
        ]);
      } else if (data.ok) {
        setLog((prev) => [
          ...prev,
          { direction: "system", body: "✓ Webhook processed — AI reply sent via MockAdapter (check console)", time: new Date().toLocaleTimeString("en-ZA") },
        ]);
        toast.success("WhatsApp message processed", {
          description: "Inbound → agent → outbound. Check console for [mock-whatsapp] log.",
        });
      }
    } catch (err) {
      setLog((prev) => [
        ...prev,
        { direction: "system", body: `✗ Error: ${err instanceof Error ? err.message : "unknown"}`, time: new Date().toLocaleTimeString("en-ZA") },
      ]);
    } finally {
      setText("");
      setSending(false);
    }
  }

  return (
    <Card className="p-4 bg-amber-50 border-amber-200">
      <div className="flex items-center gap-2 mb-3">
        <Badge className="bg-amber-100 text-amber-800 text-[10px] font-semibold hover:bg-amber-100">
          DEMO MODE
        </Badge>
        <span className="text-xs font-semibold text-ink">Demo WhatsApp Phone</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          MockAdapter active — sends via webhook pipeline
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
        Simulate an inbound WhatsApp message from the customer&apos;s phone. The message goes through
        the full webhook pipeline: secret-gate → idempotency check → contact lookup → AI agent →
        outbound reply via MockAdapter.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto] gap-2 mb-3">
        <Input
          placeholder="+27721234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="text-sm h-9"
        />
        <Input
          placeholder="Type a message as the customer…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          className="text-sm h-9"
        />
        <Button
          size="sm"
          className="bg-brand-500 hover:bg-brand-600 text-white h-9"
          onClick={send}
          disabled={!text.trim() || !phone.trim() || sending}
        >
          {sending ? (
            <Icon name="spinner" size={14} className="animate-spin" />
          ) : (
            <>
              <Icon name="send" size={14} className="mr-1" /> Send
            </>
          )}
        </Button>
      </div>
      {log.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto scroll-thin bg-white rounded-lg p-2 border border-amber-200">
          {log.map((entry, i) => (
            <div
              key={i}
              className={`text-[11px] flex items-start gap-2 ${
                entry.direction === "system"
                  ? "text-muted-foreground italic"
                  : entry.direction === "inbound"
                  ? "text-ink"
                  : "text-brand-700"
              }`}
            >
              <span className="text-[9px] text-muted-foreground shrink-0 mt-0.5">{entry.time}</span>
              <span className="shrink-0">
                {entry.direction === "inbound" ? "📱→" : entry.direction === "outbound" ? "←🤖" : "⚙"}
              </span>
              <span>{entry.body}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ChatThread({
  conversation,
  onUpdate,
}: {
  conversation: Conversation;
  onUpdate: (c: Conversation) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(conversation.messages);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(conversation.messages);
  }, [conversation.id, conversation.messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  async function send() {
    if (!input.trim() || thinking) return;
    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: "customer",
      kind: "text",
      body: input.trim(),
      at: new Date().toISOString(),
    };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/2ndlife/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: conversation.customerName,
          messages: newMsgs.map((m) => ({ role: m.role, content: m.body })),
        }),
      });
      const data = await res.json();
      const aiReply: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: "ai",
        kind: "text",
        body: data.reply || "I understand. Let me check what options are available for you.",
        at: new Date().toISOString(),
      };
      const updated = [...newMsgs, aiReply];
      setMessages(updated);
      onUpdate({ ...conversation, messages: updated });
    } catch (e) {
      const fallback: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: "ai",
        kind: "text",
        body: "I understand. Let me check what options are available for you.",
        at: new Date().toISOString(),
      };
      setMessages([...newMsgs, fallback]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto scroll-thin p-4 space-y-2 bg-brand-50/20">
        {messages.map((m) => (
          <MessageBubble key={m.id} m={m} />
        ))}
        {thinking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <span className="ml-1">2ndLife AI is typing…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-3 bg-white">
        <div className="flex gap-2">
          <Input
            placeholder="Type a reply as the customer…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            className="text-sm h-9"
          />
          <Button
            size="sm"
            className="bg-brand-500 hover:bg-brand-600 text-white h-9"
            onClick={send}
            disabled={!input.trim() || thinking}
          >
            <Icon name="send" size={14} />
          </Button>
        </div>
        <div className="text-[10px] text-muted-foreground mt-1.5 px-1">
          Simulated customer reply · AI agent responds via Vercel AI SDK with guardrails active.
        </div>
      </div>
    </>
  );
}

function MessageBubble({ m }: { m: ChatMessage }) {
  if (m.role === "system") {
    return (
      <div
        className={`rounded-xl p-3 text-sm my-2 ${
          m.kind === "payment_confirmed"
            ? "bg-brand-50 border border-brand-200 text-ink"
            : "bg-muted text-muted-foreground"
        }`}
      >
        <div className="flex items-start gap-2">
          <Icon name={m.kind === "payment_confirmed" ? "checkCheck" : "info"} size={14} className="mt-0.5 shrink-0 text-brand-600" />
          <div className="flex-1">
            <div className="font-semibold text-ink text-xs mb-0.5">
              {m.kind === "payment_confirmed" ? "Payment Successful" : "System"}
            </div>
            <div className="text-xs">{m.body}</div>
          </div>
        </div>
      </div>
    );
  }

  const isAI = m.role === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[78%] rounded-xl p-3 text-sm ${
          isAI
            ? "bg-white border border-border rounded-bl-sm"
            : "bg-brand-500 text-white rounded-br-sm"
        }`}
      >
        {m.body}
        {m.kind === "payment_request" && m.amount && (
          <div className="mt-2 p-2 bg-brand-50 border border-brand-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold">Ozow Instant EFT</div>
              <div className="text-base font-extrabold text-ink tnum">
                {formatZAR(m.amount, { decimals: true })}
              </div>
            </div>
            <Icon name="card" size={20} className="text-brand-600" />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    engaged: { cls: "bg-brand-100 text-brand-700", label: "engaged" },
    awaiting_human: { cls: "bg-amber-100 text-amber-800", label: "awaiting human" },
    recovered: { cls: "bg-brand-100 text-brand-700", label: "recovered" },
    opted_out: { cls: "bg-red-100 text-red-700", label: "opted-out" },
  };
  const s = map[status] ?? map.engaged;
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={`text-ink ${bold ? "font-bold" : "font-medium"} text-sm`}>{value}</dd>
    </div>
  );
}
