import type { UseCaseConfig } from "@/components/2ndlife/landing/use-case-page";

export const useCases: Record<string, UseCaseConfig> = {
  "win-backs": {
    slug: "win-backs",
    eyebrow: "Use Case · Win-Backs",
    headline: "Recover Customers",
    headlineAccent: "Who Walked Away",
    subhead:
      "Re-engage lapsed, churned, or cancelled customers with AI-driven win-back campaigns that actually convert.",
    seoKeywords: [
      "win back lapsed customers",
      "customer reactivation",
      "churn win-back SaaS",
      "customer retention AI",
    ],
    challenges: [
      "Generic win-back emails get <2% conversion",
      "High cost of reacquiring a lost customer",
      "No visibility into who's worth chasing",
      "Manual outreach doesn't scale past 1,000 customers",
    ],
    outcomes: [
      "3–5x higher win-back rates than email-only",
      "Score-based prioritization focuses effort on highest-LTV customers",
      "AI handles the conversation; humans handle escalations",
      "Measurable recovered revenue per campaign",
    ],
    industries: [
      "Subscriptions",
      "Retail",
      "Insurance",
      "Financial Services",
      "Education",
    ],
    ctaTitle: "Turn lost customers into recovered revenue.",
    ctaSub: "See how 2ndLife win-backs outperform email campaigns by 300%+.",
  },

  renewals: {
    slug: "renewals",
    eyebrow: "Use Case · Renewals",
    headline: "Save Every",
    headlineAccent: "Missed Renewal",
    subhead:
      "Prevent and recover missed renewals before they become lost revenue — with proactive, AI-driven outreach.",
    seoKeywords: [
      "missed renewals",
      "policy renewal automation",
      "subscription renewal recovery",
      "retention AI",
    ],
    challenges: [
      "Renewals slip through the cracks",
      "Manual renewal reminders feel spammy",
      "Customers ghost renewal calls",
      "No visibility into at-risk renewals until it's too late",
    ],
    outcomes: [
      "Catch at-risk renewals 30+ days before expiry",
      "AI handles renewal conversations at scale",
      "In-chat payment for immediate reinstatement",
      "Renewal rate lifted 15–25% on average",
    ],
    industries: ["Insurance", "Subscriptions", "Financial Services", "Healthcare"],
    ctaTitle: "Never miss another renewal.",
    ctaSub: "Join businesses recovering renewals before they lapse.",
  },

  invoices: {
    slug: "invoices",
    eyebrow: "Use Case · Unpaid Invoices",
    headline: "Collect Every",
    headlineAccent: "Unpaid Invoice",
    subhead:
      "Chase overdue invoices professionally and consistently — without burning your accounts team's time.",
    seoKeywords: [
      "invoice collection automation",
      "accounts receivable AI",
      "debt recovery SaaS",
      "invoice chasing",
    ],
    challenges: [
      "Invoices sit at 30/60/90+ days",
      "Manual chasing is awkward and time-consuming",
      "Cash flow tied up in receivables",
      "No consistent follow-up cadence",
    ],
    outcomes: [
      "Professional, firm-but-respectful AI follow-up",
      "Score-based prioritization by invoice size and payment likelihood",
      "In-chat payment links for immediate settlement",
      "30–50% reduction in days-sales-outstanding",
    ],
    industries: ["B2B Services", "Agencies", "Wholesale", "Professional Services"],
    ctaTitle: "Turn receivables into cash.",
    ctaSub: "Join businesses collecting overdue invoices 2x faster.",
  },

  quotes: {
    slug: "quotes",
    eyebrow: "Use Case · Stale Quotes",
    headline: "Close Every",
    headlineAccent: "Stale Quote",
    subhead:
      "Re-engage prospects whose quotes went unanswered — before they choose a competitor.",
    seoKeywords: [
      "quote follow-up automation",
      "stale proposals",
      "sales pipeline recovery",
      "proposal AI",
    ],
    challenges: [
      "Proposals sit in prospects' inboxes",
      "Sales reps deprioritize follow-up for 'new' leads",
      "No visibility into which quotes are worth chasing",
      "Deals lost to competitors who followed up faster",
    ],
    outcomes: [
      "AI follows up within 48 hours of quote sent",
      "Score-based prioritization by deal size and engagement",
      "Handles objections and books next steps",
      "15–30% lift in stale quote conversion",
    ],
    industries: [
      "B2B Services",
      "Agencies",
      "SaaS",
      "Professional Services",
      "Insurance",
    ],
    ctaTitle: "Close the deals you've already quoted.",
    ctaSub: "Join sales teams recovering 2–3x more stale quotes.",
  },

  "failed-payments": {
    slug: "failed-payments",
    eyebrow: "Use Case · Failed Payments",
    headline: "Save Every",
    headlineAccent: "Failed Payment",
    subhead:
      "Recover failed debit orders, expired cards, and payment errors before the customer walks away.",
    seoKeywords: [
      "dunning automation",
      "failed payment recovery",
      "debit order recovery",
      "payment retry AI",
    ],
    challenges: [
      "Debit orders fail silently",
      "Cards expire without notice",
      "Customers churn over payment friction",
      "Manual retry is expensive and slow",
    ],
    outcomes: [
      "Immediate WhatsApp notification on failed payment",
      "AI offers alternative payment methods (Instant EFT, new card)",
      "One-tap restart of payment arrangement",
      "60–80% of failed payments recovered within 24 hours",
    ],
    industries: ["Subscriptions", "Insurance", "Financial Services", "Retail"],
    ctaTitle: "Turn failed payments into recovered revenue.",
    ctaSub: "Join businesses recovering 70%+ of failed payments automatically.",
  },
};

export const useCaseOrder = [
  "win-backs",
  "renewals",
  "invoices",
  "quotes",
  "failed-payments",
];

export const useCaseLabels: Record<string, string> = {
  "win-backs": "Win-Backs",
  renewals: "Renewals",
  invoices: "Unpaid Invoices",
  quotes: "Stale Quotes",
  "failed-payments": "Failed Payments",
};
