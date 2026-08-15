"use client";

import { Icon } from "../shared/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { customers } from "@/lib/2ndlife/data";
import { useAppStore } from "@/lib/2ndlife/store";
import { formatZAR } from "@/lib/2ndlife/format";
import { toast } from "sonner";

export function Customer360View() {
  const { selectedCustomerId, setView, openConversation } = useAppStore();
  const customer = customers.find((c) => c.id === selectedCustomerId) ?? customers[0];

  return (
    <div className="space-y-5 animate-fade-up max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Button variant="ghost" size="sm" onClick={() => setView("customers")} className="text-muted-foreground -ml-2">
            ← Contacts
          </Button>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-ink flex items-center gap-3 flex-wrap">
              {customer.name}
              <Badge className="bg-amber-100 text-amber-800 text-xs font-semibold capitalize hover:bg-amber-100">
                {customer.status.replace("_", " ")}
              </Badge>
              {customer.whatsappValid && (
                <Badge className="bg-brand-100 text-brand-700 text-xs font-semibold hover:bg-brand-100">
                  <Icon name="chat" size={10} className="mr-1" /> WhatsApp valid
                </Badge>
              )}
              {customer.popiaConsent && (
                <Badge className="bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted">
                  <Icon name="shield" size={10} className="mr-1" /> POPIA consent on file
                </Badge>
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {customer.phone} · {customer.email} · Customer since {customer.since} · {customer.product}
            </p>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          label="Recovery score"
          value={`${customer.score}`}
          suffix="/100"
          delta="Explainable · deterministic"
          deltaColor="text-brand-600"
        />
        <KpiTile
          label="Estimated recovery"
          value={formatZAR(customer.estimatedValue)}
        />
        <KpiTile
          label="Previous value"
          value={formatZAR(customer.previousValue)}
        />
        <KpiTile
          label="Inactive"
          value={`${customer.inactiveMonths} mo`}
          delta="risk factor −8"
          deltaColor="text-amber-600"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Timeline + reasons */}
        <Card className="p-5">
          <Label>Timeline</Label>
          <ol className="border-l-2 border-border ml-2 space-y-4">
            {customer.timeline.map((ev, i) => (
              <li key={i} className="ml-4 relative">
                <span
                  className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                    ev.tone === "good"
                      ? "bg-brand-500"
                      : ev.tone === "warn"
                      ? "bg-amber-500"
                      : ev.tone === "bad"
                      ? "bg-destructive"
                      : "bg-brand-400"
                  }`}
                />
                <div className="font-semibold text-ink text-sm">{ev.title}</div>
                {ev.detail && (
                  <div className="text-xs text-muted-foreground">{ev.detail}</div>
                )}
                <div className="text-[10px] text-muted-foreground mt-0.5">{ev.when}</div>
              </li>
            ))}
          </ol>

          <div className="mt-5">
            <Label>Score reasons</Label>
            <div className="flex flex-wrap gap-1.5">
              {customer.reasons.map((r, i) => (
                <span
                  key={i}
                  className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${
                    r.tone === "pos"
                      ? "bg-brand-100 text-brand-700"
                      : r.tone === "neg"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Recommended action rail */}
        <div className="space-y-4">
          <Card className="p-5">
            <Label>Recommended action</Label>
            <p className="text-sm text-ink leading-relaxed mb-4">
              {customer.recommendedAction}
            </p>
            <Button
              className="w-full bg-brand-500 hover:bg-brand-600 text-white"
              onClick={() => {
                openConversation("con_001");
                toast.success("WhatsApp conversation started", {
                  description: `Recovery outreach to ${customer.name}`,
                });
              }}
            >
              <Icon name="chat" size={14} className="mr-1.5" /> Start WhatsApp conversation
            </Button>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => toast.info("Escalated to human queue", {
                description: "A team member will take over within 1 business hour.",
              })}
            >
              <Icon name="user" size={14} className="mr-1.5" /> Escalate to human
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/5"
                >
                  <Icon name="x" size={14} className="mr-1.5" /> Suppress customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suppress {customer.name}?</DialogTitle>
                  <DialogDescription>
                    Suppressed customers are excluded from all future campaigns. This action is reversible from Settings but audited. POPIA opt-out is honoured instantly.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant="destructive"
                      onClick={() => toast.success("Customer suppressed", {
                        description: `${customer.name} removed from all active campaigns.`,
                      })}
                    >
                      Suppress permanently
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>

          <Card className="p-4 bg-muted/30 border-border">
            <div className="flex items-start gap-2">
              <Icon name="shield" size={14} className="text-brand-600 mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-ink font-semibold">AI context minimization:</span> only name, product, lapse reason and approved offer band are shared with the model. Full record never leaves tenant storage.
                <br /><br />
                <span className="text-ink font-semibold">Opt-out:</span> active consent · honoured instantly on reply &quot;STOP&quot;.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
      {children}
    </div>
  );
}

function KpiTile({
  label,
  value,
  suffix,
  delta,
  deltaColor = "text-brand-600",
}: {
  label: string;
  value: string;
  suffix?: string;
  delta?: string;
  deltaColor?: string;
}) {
  return (
    <Card className="p-4">
      <div className="text-[11px] text-muted-foreground font-medium mb-1">{label}</div>
      <div className="text-xl lg:text-2xl font-extrabold text-ink tnum">
        {value}
        {suffix && <span className="text-xs text-muted-foreground font-medium ml-0.5">{suffix}</span>}
      </div>
      {delta && (
        <div className={`text-[11px] font-semibold mt-1 ${deltaColor}`}>{delta}</div>
      )}
    </Card>
  );
}
