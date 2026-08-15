"use client";

import { Icon } from "../shared/icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/2ndlife/store";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface DemandSignal {
  id: string;
  topic: string;
  source: string;
  frequency: number;
  commercialIntent: number;
  status: string;
  lastSeenAt: string;
  brief?: {
    id: string;
    hook: string;
    cta: string;
    formats: string[];
    objective: string;
  };
  questions?: Array<{ platform: string; text: string; occurrences: number }>;
}

interface DemandRadarData {
  emerging: DemandSignal[];
  opportunities: DemandSignal[];
  briefed: DemandSignal[];
}

export function DemandRadarView() {
  const [data, setData] = useState<DemandRadarData>({
    emerging: [],
    opportunities: [],
    briefed: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/v1/demand-radar");
        const json = await res.json();
        if (json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load demand radar:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold text-ink">Demand Radar & Marketing Brain</h1>
          <p className="text-sm text-muted-foreground">Loading demand signals…</p>
        </div>
        <Card className="p-8">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/4" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink">Demand Radar & Marketing Brain</h1>
        <p className="text-sm text-muted-foreground">
          Detects what the market wants · Turns demand signals into content briefs
        </p>
      </div>

      {/* AI Brain strip */}
      <Card className="p-4 bg-gradient-to-br from-brand-950 to-brand-900 border-brand-700/50 text-white">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Icon name="bulb" size={18} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm">Marketing Brain</span>
              <Badge className="bg-amber-100/20 text-amber-200 text-[10px] border border-amber-300/30">
                3-Question Rule Active
              </Badge>
            </div>
            <p className="text-xs text-brand-100 leading-relaxed">
              When a demand signal reaches 3+ occurrences, the Marketing Brain automatically
              upgrades it to an opportunity and generates a content brief with hook, CTA, and
              suggested formats. No manual triage required.
            </p>
          </div>
        </div>
      </Card>

      {/* Emerging Demand */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-ink">Emerging Demand</h3>
            <p className="text-xs text-muted-foreground">Signals with 2+ occurrences, not yet opportunities</p>
          </div>
          <Badge className="bg-muted text-muted-foreground text-[10px] font-semibold hover:bg-muted">
            {data.emerging.length} signals
          </Badge>
        </div>
        {data.emerging.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No emerging demand yet. Signals appear here when the same topic is detected 2+ times.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Topic</th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Source</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Frequency</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Intent</th>
                  <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.emerging.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-muted/50 transition">
                    <td className="py-3 px-2 font-medium text-ink">{s.topic}</td>
                    <td className="py-3 px-2">
                      <Badge className="bg-blue-50 text-blue-600 text-[10px] font-semibold hover:bg-blue-50 capitalize">
                        {s.source}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right tnum text-ink font-semibold">{s.frequency}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={`text-xs font-bold ${s.commercialIntent >= 70 ? "text-brand-600" : s.commercialIntent >= 40 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {s.commercialIntent}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Badge className="bg-muted text-muted-foreground text-[10px] font-semibold hover:bg-muted">
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Content Opportunities */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-ink">Content Opportunities</h3>
            <p className="text-xs text-muted-foreground">Signals that hit the 3-question threshold — briefs auto-generated</p>
          </div>
          <Badge className="bg-brand-100 text-brand-700 text-[10px] font-semibold hover:bg-brand-100">
            {data.opportunities.length} opportunities
          </Badge>
        </div>
        {data.opportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No content opportunities yet. They appear when a signal reaches 3+ occurrences.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.opportunities.map((opp) => (
              <Card key={opp.id} className="p-4 border-brand-200 hover:border-brand-400 transition">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-ink text-sm">{opp.topic}</h4>
                  <Badge className="bg-brand-100 text-brand-700 text-[10px] font-semibold hover:bg-brand-100">
                    {opp.frequency} occurrences
                  </Badge>
                </div>
                {opp.brief && (
                  <>
                    <div className="text-xs text-muted-foreground mb-2">
                      <span className="font-semibold text-ink">Hook:</span> {opp.brief.hook}
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      <span className="font-semibold text-ink">CTA:</span> {opp.brief.cta}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {opp.brief.formats.map((f) => (
                        <Badge
                          key={f}
                          variant="outline"
                          className="border-brand-300 text-brand-700 text-[10px] capitalize hover:bg-brand-50"
                        >
                          {f.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                    {opp.questions && opp.questions.length > 0 && (
                      <div className="text-[11px] text-muted-foreground mb-3 space-y-1">
                        {opp.questions.slice(0, 2).map((q, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span className="text-[9px] bg-muted px-1 rounded capitalize shrink-0 mt-0.5">{q.platform}</span>
                            <span className="italic">&ldquo;{q.text}&rdquo;</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 border-brand-300 text-brand-700 hover:bg-brand-50"
                      onClick={() => toast.success("Content brief created", {
                        description: `Brief for "${opp.topic}" is ready for review.`,
                      })}
                    >
                      <Icon name="plus" size={12} className="mr-1" /> Generate Content
                    </Button>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Briefed (published content) */}
      {data.briefed.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-ink">Briefed & Published</h3>
              <p className="text-xs text-muted-foreground">Content that has been approved and/or published</p>
            </div>
            <Badge className="bg-teal-50 text-teal-600 text-[10px] font-semibold hover:bg-teal-50">
              {data.briefed.length} briefed
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.briefed.map((b) => (
              <Card key={b.id} className="p-3 border-border">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-ink text-sm">{b.topic}</h4>
                  <Badge className={`text-[9px] font-semibold ${
                    b.brief.approvalStatus === "published"
                      ? "bg-brand-100 text-brand-700 hover:bg-brand-100"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                  }`}>
                    {b.brief.approvalStatus}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{b.brief.hook}</div>
                <div className="flex flex-wrap gap-1">
                  {b.brief.formats.map((f) => (
                    <span key={f} className="text-[9px] bg-muted px-1 py-0.5 rounded capitalize">{f.replace("_", " ")}</span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
