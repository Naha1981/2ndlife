"use client";

import { useState } from "react";
import { Icon } from "../shared/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber, formatZAR } from "@/lib/2ndlife/format";
import { useAppStore } from "@/lib/2ndlife/store";
import { customers } from "@/lib/2ndlife/data";

const STEPS = ["Upload", "Map columns", "Validate", "Preview", "Import"] as const;

const mappingRows = [
  { csv: "phone", field: "Phone", rule: "SA normalize → E.164 (+27…)", transform: "phone_za" },
  { csv: "email", field: "Email", rule: "Zod email validation", transform: "email" },
  { csv: "amount", field: "Amount", rule: "ZAR, comma-safe parse", transform: "zar" },
  { csv: "status", field: "Status", rule: "map: \"lapsed\"/\"failed_debit\"", transform: "status_map" },
  { csv: "last_activity", field: "Last Activity", rule: "ISO date", transform: "iso_date" },
];

const previewRows = customers.slice(0, 4);

export function ImportWizardView() {
  const [step, setStep] = useState(2); // Validate
  const setView = useAppStore((s) => s.setView);

  return (
    <div className="space-y-5 animate-fade-up max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">New import</h1>
          <p className="text-sm text-muted-foreground">
            Lapsed policies · Funeral insurance vertical · CSV
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setView("imports")}>
          ← Back to imports
        </Button>
      </div>

      {/* Stepper */}
      <Card className="p-5">
        <div className="flex items-center gap-3 flex-wrap">
          {STEPS.map((s, i) => {
            const status = i < step ? "done" : i === step ? "current" : "todo";
            return (
              <div key={s} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      status === "done"
                        ? "bg-brand-100 text-brand-700"
                        : status === "current"
                        ? "bg-brand-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {status === "done" ? <Icon name="check" size={14} /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      status === "current" ? "text-ink" : "text-muted-foreground"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 ${status === "done" ? "bg-brand-300" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT — mapping + validation */}
        <div className="space-y-5">
          {/* Dropzone */}
          <Card className="p-6 border-2 border-dashed border-brand-200 bg-brand-50/30 text-center">
            <Icon name="upload" size={32} className="text-brand-600 mx-auto mb-2" />
            <div className="font-bold text-ink text-sm">
              lapsed_policies_may.csv
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              10,000 rows · 2.1 MB · uploaded 09:41
            </div>
            <Button variant="ghost" size="sm" className="mt-2 text-xs">
              Replace file
            </Button>
          </Card>

          {/* Column mapping */}
          <div>
            <Label>Column mapping</Label>
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">CSV column</th>
                    <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">2ndLife field</th>
                    <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {mappingRows.map((r) => (
                    <tr key={r.csv} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-mono text-ink">{r.csv}</td>
                      <td className="py-2.5 px-3 text-ink font-medium">{r.field}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.rule}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="py-2.5 px-3 text-xs text-muted-foreground italic">
                      +6 more mapped (customer_id, names, product, expiry_date, payment_status)
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>

          {/* Validation KPIs */}
          <div>
            <Label>Validation</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ValidationStat label="Valid rows" value={9412} color="text-brand-600" />
              <ValidationStat label="Duplicates merged" value={388} color="text-ink" />
              <ValidationStat label="Phones normalized" value={142} color="text-ink" />
              <ValidationStat label="Errors" value={58} color="text-destructive" />
            </div>
            <Card className="p-3 mt-3 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-2 text-xs text-amber-800">
                <Icon name="warn" size={14} className="mt-0.5 shrink-0" />
                <div>
                  58 rows missing phone → excluded with row-level report (download).{" "}
                  <span className="font-semibold">Errors never block valid rows.</span>{" "}
                  <button className="text-brand-700 font-semibold underline">Download error report</button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT — preview */}
        <div className="space-y-5">
          <div>
            <Label>Preview (normalized)</Label>
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">Customer</th>
                    <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">Phone</th>
                    <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">Status</th>
                    <th className="text-right font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-medium text-ink">{c.name}</td>
                      <td className="py-2.5 px-3 font-mono text-ink">{c.phone}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-ink tnum">
                        {formatZAR(c.estimatedValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
              Showing 4 of 9,412 valid rows · all phone numbers normalized to E.164
            </p>
          </div>

          {/* Validation rule preview */}
          <Card className="p-4 bg-brand-50/40 border-brand-200">
            <div className="flex items-start gap-2">
              <Icon name="shield" size={16} className="text-brand-600 mt-0.5 shrink-0" />
              <div className="text-xs text-ink leading-relaxed">
                <p className="font-semibold mb-1">POPIA & data integrity checks passed:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={11} className="text-brand-600" /> All records have valid consent flags
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={11} className="text-brand-600" /> Phones flagged WhatsApp-capable via lookup
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={11} className="text-brand-600" /> Duplicate keys merged on customer_id
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Icon name="check" size={11} className="text-brand-600" /> Tenant-scoped — no cross-org leakage
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </Button>
            <Button
              className="bg-brand-500 hover:bg-brand-600 text-white"
              onClick={() => {
                setStep((s) => Math.min(STEPS.length - 1, s + 1));
                setTimeout(() => setView("customers"), 800);
              }}
            >
              Continue to preview <Icon name="arrow" size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </div>
  );
}

function ValidationStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="p-3">
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className={`text-xl font-extrabold tnum ${color}`}>{formatNumber(value)}</div>
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
    <Badge className={`text-[10px] font-semibold h-5 ${s.cls}`}>
      {s.label}
    </Badge>
  );
}
