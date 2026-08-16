"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/2ndlife/shared/icon";
import { SignalCategoryBadge } from "./signal-category-badge";
import { getAllDemoScripts, generateDemoActivity } from "@/modules/livesignal/demo-harness";
import type { SimulatedEvent } from "@/modules/livesignal/types";

interface DemoBannerProps {
  packSlug?: string;
  onEvent?: (event: SimulatedEvent) => void;
}

export function LiveSignalDemoBanner({ packSlug = "funeral-insurance", onEvent }: DemoBannerProps) {
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<(SimulatedEvent & { id: number })[]>([]);
  const [selectedPack, setSelectedPack] = useState(packSlug);
  const scripts = getAllDemoScripts();

  const runSimulation = useCallback(async () => {
    setRunning(true);
    setEvents([]);
    const script = generateDemoActivity(selectedPack);

    for (let i = 0; i < script.length; i++) {
      const ev = script[i];
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          setEvents((prev) => [...prev, { ...ev, id: i }]);
          onEvent?.(ev);
          resolve();
        }, ev.delayMs);
      });
    }
    setRunning(false);
  }, [selectedPack, onEvent]);

  const reset = useCallback(() => {
    setEvents([]);
    setRunning(false);
  }, []);

  const eventIcon: Record<SimulatedEvent["type"], string> = {
    signal: "signal",
    lead_created: "users",
    handoff_queued: "chat",
    proof_submitted: "check",
  };

  const eventColor: Record<SimulatedEvent["type"], string> = {
    signal: "text-brand-600 bg-brand-50",
    lead_created: "text-blue-600 bg-blue-50",
    handoff_queued: "text-green-600 bg-green-50",
    proof_submitted: "text-violet-600 bg-violet-50",
  };

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
          <Icon name="refresh" size={16} className="text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-amber-900">Demo Mode</span>
            <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
              Simulated — not real visitor data
            </span>
          </div>
          <p className="text-xs text-amber-700 mt-0.5">
            Simulate visitor activity to preview how LiveSignal works in your business.
          </p>
        </div>
      </div>

      {/* Pack selector + button */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={selectedPack}
          onChange={(e) => { setSelectedPack(e.target.value); setEvents([]); }}
          disabled={running}
          className="text-xs border border-amber-300 bg-white rounded-lg px-2 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {scripts.map((s) => (
            <option key={s.packSlug} value={s.packSlug}>
              {s.packLabel}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          onClick={running ? reset : runSimulation}
          className={`text-xs ${
            running
              ? "bg-amber-200 text-amber-800 hover:bg-amber-300"
              : "bg-amber-600 hover:bg-amber-700 text-white"
          }`}
          id="livesignal-simulate-btn"
        >
          <Icon name={running ? "x" : "refresh"} size={12} className="mr-1" />
          {running ? "Stop simulation" : "Simulate visitor activity"}
        </Button>

        {events.length > 0 && !running && (
          <button
            onClick={reset}
            className="text-xs text-amber-600 hover:text-amber-800 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Live event feed */}
      {events.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto scroll-thin">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-start gap-2 animate-in slide-in-from-left-2 duration-300"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${eventColor[ev.type]}`}
              >
                <Icon name={eventIcon[ev.type]} size={11} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ev.category && (
                    <SignalCategoryBadge category={ev.category} size="sm" />
                  )}
                  <span className="text-xs text-ink leading-snug">{ev.label}</span>
                </div>
                {ev.excerpt && (
                  <p className="text-[10px] text-muted-foreground italic mt-0.5 truncate">
                    "{ev.excerpt}"
                  </p>
                )}
              </div>
            </div>
          ))}
          {running && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              Simulation running…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
