"use client";

import { useState } from "react";
import { Icon } from "../shared/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/2ndlife/store";
import { toast } from "sonner";

const AUDIENCE_CHIPS = [
  "inactive > 90 days",
  "score ≥ 70",
  "WhatsApp valid",
  "not suppressed",
];

const REVIEW_CHECKS = [
  { id: "audience", label: "Audience qualified", done: true },
  { id: "suppression", label: "Suppression applied (6)", done: true },
  { id: "template", label: "Template approved", done: true },
  { id: "limits", label: "Rate limits set", done: true },
  { id: "idempotency", label: "Webhook idempotency", done: true },
];

export function CampaignBuilderView() {
  const setView = useAppStore((s) => s.setView);
  const [name, setName] = useState("August Win-back");
  const [sendCap, setSendCap] = useState(200);
  const [retries, setRetries] = useState(2);
  const [escalate, setEscalate] = useState(2);
  const [stopRate, setStopRate] = useState(2);
  const [dryRunPassed, setDryRunPassed] = useState(false);
  const [running, setRunning] = useState(false);

  function runDryRun() {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      setDryRunPassed(true);
      toast.success("Dry-run passed", {
        description: "All checks green · Launch unlocked",
      });
    }, 1500);
  }

  function launch() {
    if (!dryRunPassed) return;
    toast.success("Campaign launched", {
      description: "Messages will start sending within business hours (Mon–Fri 09:00–17:00 SAST).",
    });
    setTimeout(() => setView("campaigns"), 1200);
  }

  return (
    <div className="animate-fade-up max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-ink">New campaign</h1>
          <p className="text-sm text-muted-foreground">
            Funeral insurance vertical · WhatsApp channel
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setView("campaigns")}>
          ← Back to campaigns
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* LEFT — form sections */}
        <div className="space-y-4">
          {/* 1. Details */}
          <Card className="p-5">
            <SectionLabel n={1}>Details</SectionLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Chip>vertical: funeral-insurance (config package)</Chip>
              <Chip>channel: WhatsApp</Chip>
              <Chip>ai-agent: empathetic-recovery</Chip>
            </div>
          </Card>

          {/* 2. Audience */}
          <Card className="p-5">
            <SectionLabel n={2}>Audience</SectionLabel>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {AUDIENCE_CHIPS.map((c) => (
                <Chip key={c} removable>{c}</Chip>
              ))}
              <button className="text-xs text-brand-600 font-semibold hover:text-brand-700 px-2 py-1 border border-dashed border-brand-300 rounded-md">
                + Add filter
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-brand-50/40 rounded-lg border border-brand-200/60">
                <div className="text-[11px] text-muted-foreground">Qualified audience</div>
                <div className="text-2xl font-extrabold text-ink tnum">1,842</div>
                <div className="text-[10px] text-brand-600 font-semibold">after suppression</div>
              </div>
              <div className="p-4 bg-brand-50/40 rounded-lg border border-brand-200/60">
                <div className="text-[11px] text-muted-foreground">Est. recoverable</div>
                <div className="text-2xl font-extrabold text-ink tnum">R3.2M</div>
                <div className="text-[10px] text-brand-600 font-semibold">based on score × value</div>
              </div>
            </div>
          </Card>

          {/* 3. Channel & message */}
          <Card className="p-5">
            <SectionLabel n={3}>Channel &amp; message</SectionLabel>
            <div className="bg-white border border-border rounded-xl rounded-tl-sm p-4 text-sm text-ink">
              Empathetic reactivation template · acknowledges lapse reason · presents approved
              offer only · STOP honoured instantly
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Template ID: <code className="text-ink font-mono">tpl_reactivation_v3</code>
              </div>
              <Button variant="outline" size="sm" className="text-xs h-7">
                <Icon name="chat" size={11} className="mr-1" /> Preview template
              </Button>
            </div>
          </Card>

          {/* 4. Limits & hours + 5. Offers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <SectionLabel n={4}>Limits &amp; hours</SectionLabel>
              <SettingRow label="Send cap">
                <Input
                  type="number"
                  value={sendCap}
                  onChange={(e) => setSendCap(Number(e.target.value))}
                  className="h-8 w-24 text-right text-sm"
                />
                <span className="text-xs text-muted-foreground ml-2">msgs/hour</span>
              </SettingRow>
              <SettingRow label="Business hours">
                <span className="text-sm font-semibold text-ink">Mon–Fri 09:00–17:00 SAST</span>
              </SettingRow>
              <SettingRow label="Retries">
                <Input
                  type="number"
                  value={retries}
                  onChange={(e) => setRetries(Number(e.target.value))}
                  className="h-8 w-16 text-right text-sm"
                />
                <span className="text-xs text-muted-foreground ml-2">48h apart</span>
              </SettingRow>
            </Card>

            <Card className="p-5">
              <SectionLabel n={5}>Offers &amp; escalation</SectionLabel>
              <SettingRow label="Offer band">
                <span className="text-sm font-semibold text-ink">R150/mo restart, no arrears</span>
              </SettingRow>
              <SettingRow label="Escalate">
                <span className="text-sm font-semibold text-ink">after {escalate} objections</span>
              </SettingRow>
              <SettingRow label="Auto-stop">
                <span className="text-sm font-semibold text-ink">opt-out rate &gt; {stopRate}%</span>
              </SettingRow>
            </Card>
          </div>

          {/* Suppression toggles */}
          <Card className="p-5">
            <SectionLabel n={6}>Suppression rules</SectionLabel>
            <div className="space-y-3">
              <ToggleRow label="Exclude opted-out customers" desc="POPIA compliance — mandatory" defaultChecked />
              <ToggleRow label="Exclude disputed accounts" desc="Active complaints or billing disputes" defaultChecked />
              <ToggleRow label="Exclude recently contacted (7d)" desc="Prevent duplicate outreach" defaultChecked />
              <ToggleRow label="Exclude active recovery conversations" desc="Already in AI agent queue" defaultChecked />
            </div>
          </Card>
        </div>

        {/* RIGHT — sticky review */}
        <div>
          <Card className="p-5 sticky top-20">
            <SectionLabel n={7}>Review</SectionLabel>
            <div className="mb-4">
              <Badge className={`text-xs font-semibold ${dryRunPassed ? "bg-brand-100 text-brand-700 hover:bg-brand-100" : "bg-muted text-muted-foreground hover:bg-muted"}`}>
                {dryRunPassed ? "dry-run: PASSED" : "dry-run: ON (required)"}
              </Badge>
            </div>
            <ul className="space-y-2 mb-4">
              {REVIEW_CHECKS.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center ${c.done ? "bg-brand-500" : "bg-muted"}`}>
                    <Icon name="check" size={10} className="text-white" />
                  </span>
                  <span className="text-ink flex-1">{c.label}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Audience size</span>
                <span className="font-bold text-ink tnum">1,842</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Est. messages</span>
                <span className="font-bold text-ink tnum">~1,842</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Est. duration</span>
                <span className="font-bold text-ink">~9 hours</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Est. recovery</span>
                <span className="font-bold text-brand-600 tnum">R3.2M</span>
              </div>
            </div>

            <div className="space-y-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full h-10"
                onClick={runDryRun}
                disabled={running}
              >
                {running ? (
                  <>
                    <Icon name="spinner" size={14} className="mr-1.5 animate-spin" /> Running dry-run…
                  </>
                ) : (
                  <>
                    <Icon name="play" size={14} className="mr-1.5" /> Run dry-run
                  </>
                )}
              </Button>
              <Button
                className="w-full h-10"
                onClick={launch}
                disabled={!dryRunPassed}
                style={{
                  backgroundColor: dryRunPassed ? "#16a34a" : "#9ca3af",
                  color: "#fff",
                }}
              >
                <Icon name="zap" size={14} className="mr-1.5" /> Launch campaign
              </Button>
              <p className="text-[11px] text-muted-foreground text-center leading-tight">
                Launch unlocks only after a passing dry-run. No real WhatsApp messages are sent until then.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] mr-2 align-middle">
        {n}
      </span>
      <span className="align-middle">{children}</span>
    </div>
  );
}

function Chip({
  children,
  removable,
}: {
  children: React.ReactNode;
  removable?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-xs text-ink font-medium">
      {children}
      {removable && (
        <button className="text-muted-foreground hover:text-destructive">
          <Icon name="x" size={10} />
        </button>
      )}
    </span>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  defaultChecked,
}: {
  label: string;
  desc: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
