"use client";

import { useState, useEffect } from "react";
import { Loader2, Power, AlertTriangle, CheckCircle2 } from "lucide-react";

export function AiToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai-switch")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch switch status");
        return res.json();
      })
      .then((data) => {
        setEnabled(Boolean(data.on));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Could not load AI switch state");
        setLoading(false);
      });
  }, []);

  const handleToggle = async () => {
    if (enabled === null || updating) return;
    const nextState = !enabled;
    setUpdating(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/ai-switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: nextState }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update AI switch");
      }

      const data = await res.json();
      setEnabled(Boolean(data.on));
    } catch (err: any) {
      setError(err.message || "Failed to update switch");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
        <span className="text-sm font-medium">Checking AI Master Switch status...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight">AI Master Switch</h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                enabled
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              {enabled ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" /> ACTIVE
                </>
              ) : (
                <>
                  <Power className="w-3 h-3 mr-1" /> OFF
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {enabled
              ? "All inbound messages will enqueue AI jobs and generate automated responses."
              : "AI generation is completely paused. Messages will be stored in database safely without AI execution."}
          </p>
        </div>

        <button
          onClick={handleToggle}
          disabled={updating}
          className={`relative inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            enabled
              ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20 hover:shadow-rose-700/30 active:scale-98"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 hover:shadow-emerald-700/30 active:scale-98"
          }`}
        >
          {updating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </span>
          ) : enabled ? (
            <span className="flex items-center gap-2">
              <Power className="w-4 h-4" />
              Turn AI OFF
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Power className="w-4 h-4" />
              Turn AI ON
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/50 border border-rose-800/50 rounded-xl text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
