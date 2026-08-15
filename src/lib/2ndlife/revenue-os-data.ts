/**
 * 2ndLife Revenue OS — Dashboard data
 * Reflects the "Money Left on the Table" Revenue OS vision.
 * All numbers illustrative for demo; production funnels must be monotonic.
 */

// Generate dates relative to today so "vs last 7 days" is truthful
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
}

function timeAgo(): string {
  return new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

export const revenueGenerated = {
  value: 128400,
  delta: 14.2,
};

export const revenueRecovered = {
  value: 37800,
  delta: 22.7,
};

export const revenueAtRisk = {
  value: 61200,
  delta: 8.3, // up = bad (more at risk)
};

export const leakage = {
  total: 53100,
  delta: -5.4, // down = good (less leakage)
  breakdown: [
    { label: "Slow response", amount: 18400, count: 23, color: "#f59e0b" },
    { label: "Unanswered leads", amount: 11200, count: 14, color: "#dc2626" },
    { label: "No-shows", amount: 7800, count: 9, color: "#ef4444" },
    { label: "Abandoned quotes", amount: 15700, count: 18, color: "#b91c1c" },
  ],
};

export const aiBriefing = {
  generatedAt: timeAgo(),
  insights: [
    {
      tone: "positive" as const,
      text: "Your Sandton campaign is producing 31% more enquiries. 7 people asked about pricing in the last 24h.",
    },
    {
      tone: "warning" as const,
      text: "R18,400 in revenue is leaking from slow response times — 23 leads waited over 2 hours for a reply.",
    },
    {
      tone: "positive" as const,
      text: "Recovery Engine recovered R37,800 this week — 22.7% above last week. Thabo M. and Sipho D. are high-confidence restarts.",
    },
    {
      tone: "warning" as const,
      text: "9 customers no-showed this week — R7,800 at risk. I recommend sending WhatsApp confirmations 2h before appointments.",
    },
  ],
  recommendations: [
    { label: "Target dormant customers", icon: "users", action: "customers" as const },
    { label: "Review unanswered leads", icon: "chat", action: "conversations" as const },
    { label: "Launch win-back campaign", icon: "plus", action: "campaigns" as const },
    { label: "Import new list", icon: "upload", action: "imports" as const },
  ],
};

export const recoveryFunnel = [
  { stage: "Recovery Opportunities Uploaded", count: 10000, pct: 100, color: "#16a34a" },
  { stage: "Messages Sent", count: 8642, pct: 86.4, color: "#15803d" },
  { stage: "Engaged", count: 3748, pct: 43.4, color: "#34d399" },
  { stage: "Payments Made", count: 2156, pct: 24.9, color: "#f59e0b" },
  { stage: "Customers Reactivated", count: 1842, pct: 18.4, color: "#6ee7b7" },
];

export const topCampaigns = [
  {
    id: "c1",
    name: "May Reactivation",
    sent: 10000,
    engaged: 4320,
    recovered: 1256,
    revenue: 678240,
    color: "#16a34a",
  },
  {
    id: "c2",
    name: "April Follow-up",
    sent: 8000,
    engaged: 3210,
    recovered: 890,
    revenue: 456780,
    color: "#1976D2",
  },
  {
    id: "c3",
    name: "Mar Win-back",
    sent: 7500,
    engaged: 2890,
    recovered: 745,
    revenue: 345120,
    color: "#f59e0b",
  },
];
