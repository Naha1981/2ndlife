"use client";

import { useState, useCallback } from "react";
import { Icon } from "../shared/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNumber, formatZAR } from "@/lib/2ndlife/format";
import { useAppStore } from "@/lib/2ndlife/store";
import { toast } from "sonner";

const STEPS = ["Upload", "Map columns", "Validate", "Preview", "Import"] as const;

interface PreviewResult {
  validRows: Array<{
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string | null;
    status: string;
    lifetimeValue: number | null;
  }>;
  duplicates: number;
  phonesNormalized: number;
  errors: Array<{ row: number; field: string; value: string; message: string }>;
  totalRows: number;
  stats: {
    valid: number;
    invalid: number;
    duplicatesInFile: number;
    duplicatesExisting: number;
  };
}

export function ImportWizardView() {
  const setView = useAppStore((s) => s.setView);
  const [step, setStep] = useState(0);
  const [csvText, setCsvText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [committed, setCommitted] = useState(false);

  const mapping = {
    firstName: "firstName",
    lastName: "lastName",
    phone: "phone",
    email: "email",
    status: "status",
    lifetimeValue: "lifetimeValue",
    monthsInactive: "monthsInactive",
  };

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      setFileName(file.name);
      setStep(1);
      toast.success(`File loaded: ${file.name}`, {
        description: `${text.split("\n").length - 1} rows detected`,
      });
    };
    reader.readAsText(file);
  }, []);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/imports/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText, mapping }),
      });
      const json = await res.json();
      if (json.data) {
        setPreview(json.data);
        setStep(3);
      } else {
        toast.error("Preview failed", { description: json.error?.message });
      }
    } catch (err) {
      toast.error("Preview failed", { description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    setCommitting(true);
    try {
      const res = await fetch("/api/v1/imports/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText, mapping, fileName }),
      });
      const json = await res.json();
      if (json.data) {
        setCommitted(true);
        setStep(4);
        toast.success("Import complete!", {
          description: `${json.data.created.customers} customers, ${json.data.created.opportunities} opportunities created`,
        });
      } else {
        toast.error("Import failed", { description: json.error?.message });
      }
    } catch (err) {
      toast.error("Import failed", { description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">New import</h1>
          <p className="text-sm text-muted-foreground">
            Upload any customer list — lapsed, dormant, leads, unpaid invoices · CSV
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
                    {loading && i === 2 ? (
                      <Icon name="spinner" size={14} className="animate-spin" />
                    ) : status === "done" ? (
                      <Icon name="check" size={14} />
                    ) : (
                      i + 1
                    )}
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

      {/* Step content */}
      {step === 0 && (
        <Card className="p-6 border-2 border-dashed border-brand-200 bg-brand-50/30 text-center">
          <Icon name="upload" size={32} className="text-brand-600 mx-auto mb-2" />
          <div className="font-bold text-ink text-sm mb-2">Upload your CSV file</div>
          <div className="text-xs text-muted-foreground mb-4">
            Expected columns: firstName, phone, email, status, lifetimeValue, monthsInactive
          </div>
          <label className="inline-block">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <Button className="bg-brand-500 hover:bg-brand-600 text-white cursor-pointer">
              <Icon name="upload" size={14} className="mr-1" /> Choose CSV file
            </Button>
          </label>
          <div className="mt-4 text-[11px] text-muted-foreground">
            Or try a sample:{" "}
            <button
              className="text-brand-600 underline"
              onClick={() => {
                const sample = `firstName,phone,email,status,lifetimeValue,monthsInactive
Thabo,+27721234567,thabo@test.co.za,lapsed,7200,8
Lerato,0781234567,lerato@test.co.za,failed_debit,4200,3
Sipho,0731234567,sipho@test.co.za,lapsed,5400,5
Palesa,0841234567,palesa@test.co.za,dormant,3600,12
Bad1,notanumber,bad1@test.co.za,lapsed,1000,5`;
                setCsvText(sample);
                setFileName("sample.csv");
                setStep(1);
              }}
            >
              Load sample CSV
            </button>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card className="p-5">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Column mapping
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your CSV columns are automatically mapped to 2ndLife fields. Verify the mapping below.
          </p>
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
                <tr className="border-b border-border/50"><td className="py-2.5 px-3 font-mono text-ink">firstName</td><td className="py-2.5 px-3 text-ink font-medium">First Name</td><td className="py-2.5 px-3 text-muted-foreground">Required</td></tr>
                <tr className="border-b border-border/50"><td className="py-2.5 px-3 font-mono text-ink">phone</td><td className="py-2.5 px-3 text-ink font-medium">Phone</td><td className="py-2.5 px-3 text-muted-foreground">SA normalize → E.164 (+27…)</td></tr>
                <tr className="border-b border-border/50"><td className="py-2.5 px-3 font-mono text-ink">email</td><td className="py-2.5 px-3 text-ink font-medium">Email</td><td className="py-2.5 px-3 text-muted-foreground">Zod email validation</td></tr>
                <tr className="border-b border-border/50"><td className="py-2.5 px-3 font-mono text-ink">status</td><td className="py-2.5 px-3 text-ink font-medium">Status</td><td className="py-2.5 px-3 text-muted-foreground">map: lapsed/failed_debit/dormant/active</td></tr>
                <tr className="border-b border-border/50"><td className="py-2.5 px-3 font-mono text-ink">lifetimeValue</td><td className="py-2.5 px-3 text-ink font-medium">Lifetime Value</td><td className="py-2.5 px-3 text-muted-foreground">ZAR, comma-safe parse</td></tr>
                <tr><td className="py-2.5 px-3 font-mono text-ink">monthsInactive</td><td className="py-2.5 px-3 text-ink font-medium">Months Inactive</td><td className="py-2.5 px-3 text-muted-foreground">Integer</td></tr>
              </tbody>
            </table>
          </Card>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button className="bg-brand-500 hover:bg-brand-600 text-white" onClick={() => setStep(2)}>
              Validate <Icon name="arrow" size={14} className="ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-5">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Validation
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Running real validation against your CSV. Bad rows go to errors, good rows stay valid.
          </p>
          <Button
            className="bg-brand-500 hover:bg-brand-600 text-white w-full"
            onClick={handlePreview}
            disabled={loading}
          >
            {loading ? (
              <><Icon name="spinner" size={14} className="mr-1 animate-spin" /> Validating…</>
            ) : (
              <><Icon name="check" size={14} className="mr-1" /> Run validation</>
            )}
          </Button>
        </Card>
      )}

      {step === 3 && preview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Validation stats */}
          <div className="space-y-5">
            <Card className="p-6 border-2 border-dashed border-brand-200 bg-brand-50/30">
              <Icon name="sheet" size={24} className="text-brand-600 mb-2" />
              <div className="font-bold text-ink text-sm">{fileName}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {preview.totalRows} rows · uploaded just now
              </div>
            </Card>

            <div>
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Validation results</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ValidationStat label="Valid rows" value={preview.stats.valid} color="text-brand-600" />
                <ValidationStat label="Duplicates" value={preview.duplicates} color="text-amber-600" />
                <ValidationStat label="Phones normalized" value={preview.phonesNormalized} color="text-ink" />
                <ValidationStat label="Errors" value={preview.errors.length} color="text-destructive" />
              </div>
              {preview.errors.length > 0 && (
                <Card className="p-3 mt-3 bg-amber-50 border-amber-200">
                  <div className="flex items-start gap-2 text-xs text-amber-800 mb-2">
                    <Icon name="warn" size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold">{preview.errors.length} rows have errors.</span>{" "}
                      Errors never block valid rows. Download the error report for details.
                    </div>
                  </div>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-brand-700 font-semibold">View error details</summary>
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto scroll-thin">
                      {preview.errors.map((e, i) => (
                        <div key={i} className="text-[11px] text-amber-800">
                          Row {e.row} · {e.field}: {e.message}
                        </div>
                      ))}
                    </div>
                  </details>
                </Card>
              )}
            </div>

            <Card className="p-4 bg-brand-50/40 border-brand-200">
              <div className="flex items-start gap-2">
                <Icon name="shield" size={16} className="text-brand-600 mt-0.5 shrink-0" />
                <div className="text-xs text-ink leading-relaxed">
                  <p className="font-semibold mb-1">POPIA & data integrity checks:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-1.5"><Icon name="check" size={11} className="text-brand-600" /> All phones normalized to E.164</li>
                    <li className="flex items-center gap-1.5"><Icon name="check" size={11} className="text-brand-600" /> WhatsApp-capable numbers flagged</li>
                    <li className="flex items-center gap-1.5"><Icon name="check" size={11} className="text-brand-600" /> Duplicates merged on phone number</li>
                    <li className="flex items-center gap-1.5"><Icon name="check" size={11} className="text-brand-600" /> Tenant-scoped — no cross-org leakage</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Preview table */}
          <div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Preview (normalized)</div>
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">Customer</th>
                    <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">Phone</th>
                    <th className="text-left font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">Status</th>
                    <th className="text-right font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-3 text-[10px]">LTV</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.validRows.slice(0, 8).map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2.5 px-3 font-medium text-ink">{row.firstName} {row.lastName}</td>
                      <td className="py-2.5 px-3 font-mono text-ink">{row.phone ?? "—"}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={row.status} /></td>
                      <td className="py-2.5 px-3 text-right font-bold text-ink tnum">{row.lifetimeValue ? formatZAR(row.lifetimeValue) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
              Showing {Math.min(8, preview.validRows.length)} of {preview.validRows.length} valid rows
            </p>

            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button
                className="bg-brand-500 hover:bg-brand-600 text-white"
                onClick={handleCommit}
                disabled={committing}
              >
                {committing ? (
                  <><Icon name="spinner" size={14} className="mr-1 animate-spin" /> Importing…</>
                ) : (
                  <><Icon name="check" size={14} className="mr-1" /> Import {preview.validRows.length} customers</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && committed && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="check" size={32} className="text-brand-600" />
          </div>
          <h2 className="text-xl font-bold text-ink mb-2">Import complete!</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your customers have been imported, scored, and added to recovery opportunities.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setView("customers")}>
              View customers
            </Button>
            <Button className="bg-brand-500 hover:bg-brand-600 text-white" onClick={() => setView("dashboard")}>
              Go to dashboard <Icon name="arrow" size={14} className="ml-1" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function ValidationStat({ label, value, color }: { label: string; value: number; color: string }) {
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
  const s = map[status] ?? map.active;
  return <Badge className={`text-[10px] font-semibold h-5 ${s.cls}`}>{s.label}</Badge>;
}
