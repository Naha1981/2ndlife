/**
 * 2ndLife — Mock dataset for the demo.
 * All numbers illustrative; production funnels must be monotonic.
 */

export type RecoveryStatus =
  | "new"
  | "qualified"
  | "queued"
  | "contacted"
  | "engaged"
  | "negotiating"
  | "converted"
  | "recovered"
  | "declined"
  | "unresponsive"
  | "failed"
  | "suppressed";

export type CustomerStatus = "lapsed" | "failed_debit" | "dormant" | "active" | "at_risk";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: CustomerStatus;
  since: string;
  product: string;
  monthlyPremium: number;
  score: number;
  estimatedValue: number;
  previousValue: number;
  inactiveMonths: number;
  whatsappValid: boolean;
  popiaConsent: boolean;
  reasons: { label: string; tone: "pos" | "neg" | "neutral" }[];
  timeline: TimelineEvent[];
  recommendedAction: string;
}

export interface TimelineEvent {
  title: string;
  detail?: string;
  when: string;
  tone: "good" | "warn" | "bad" | "info";
}

export interface Conversation {
  id: string;
  customerName: string;
  customerInitials: string;
  score: number;
  estimatedValue: number;
  recovered?: number;
  status: "engaged" | "awaiting_human" | "recovered" | "opted_out";
  lastActivity: string;
  intent?: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: "ai" | "customer" | "system";
  kind: "text" | "payment_request" | "payment_confirmed";
  body: string;
  amount?: number;
  at: string;
}

export interface Campaign {
  id: string;
  name: string;
  vertical: string;
  sent: number;
  engaged: number;
  payments: number;
  revenue: number;
  color: string;
  status: "active" | "completed" | "draft";
  createdAt: string;
}

export const kpis = {
  revenueRecovered: { value: 1248750, delta: 18.6, label: "Revenue Recovered" },
  customersReactivated: { value: 1842, delta: 12.4, label: "Customers Reactivated" },
  conversations: { value: 8642, delta: 15.7, label: "Conversations" },
  paymentsReceived: { value: 2156, delta: 20.1, label: "Payments Received" },
};

// Generate dates relative to today so "vs last 7 days" is truthful
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
}

export const revenueTrend = [
  { date: daysAgo(6), value: 142000 },
  { date: daysAgo(5), value: 168000 },
  { date: daysAgo(4), value: 154000 },
  { date: daysAgo(3), value: 236400 },
  { date: daysAgo(2), value: 198000 },
  { date: daysAgo(1), value: 221000 },
  { date: daysAgo(0), value: 268750 },
];

export const recoveryFunnel = [
  { stage: "Recovery Opportunities Uploaded", count: 10000, pct: 100, color: "#16a34a" },
  { stage: "Messages Sent", count: 8642, pct: 86.4, color: "#15803d" },
  { stage: "Engaged", count: 3748, pct: 43.4, color: "#34d399" },
  { stage: "Payments Made", count: 2156, pct: 24.9, color: "#f59e0b" },
  { stage: "Customers Reactivated", count: 1842, pct: 18.4, color: "#6ee7b7" },
];

export const totalRecovered = {
  value: 4782450,
  delta: 22.7,
  vs: "April 2025",
  sparkline: [1200000, 1450000, 1380000, 1820000, 2100000, 2480000, 3100000, 3650000, 4200000, 4782450],
};

export const recentActivity = [
  {
    id: "1",
    icon: "phone",
    title: "Payment received from Thabo M.",
    subtitle: "Policy FS-12345 reactivated",
    amount: 180,
    time: "2 minutes ago",
    tone: "good" as const,
  },
  {
    id: "2",
    icon: "chat",
    title: "New conversation started with Lerato K.",
    subtitle: "Campaign: August Win-back",
    time: "5 minutes ago",
    tone: "info" as const,
  },
  {
    id: "3",
    icon: "phone",
    title: "Payment received from Sipho D.",
    subtitle: "Policy FS-67890 reactivated",
    amount: 150,
    time: "12 minutes ago",
    tone: "good" as const,
  },
  {
    id: "4",
    icon: "upload",
    title: "Campaign 'May Reactivation' uploaded",
    subtitle: "10,000 policies imported",
    time: "1 hour ago",
    tone: "warn" as const,
  },
];

export const topCampaigns: Campaign[] = [
  {
    id: "c1",
    name: "May Reactivation",
    vertical: "Funeral Insurance",
    sent: 10000,
    engaged: 4320,
    payments: 1256,
    revenue: 678240,
    color: "#16a34a",
    status: "completed",
    createdAt: "2025-05-01",
  },
  {
    id: "c2",
    name: "April Follow-up",
    vertical: "Funeral Insurance",
    sent: 8000,
    engaged: 3210,
    payments: 890,
    revenue: 456780,
    color: "#1976D2",
    status: "completed",
    createdAt: "2025-04-01",
  },
  {
    id: "c3",
    name: "Mar Win-back",
    vertical: "Funeral Insurance",
    sent: 7500,
    engaged: 2890,
    payments: 745,
    revenue: 345120,
    color: "#f59e0b",
    status: "completed",
    createdAt: "2025-03-01",
  },
];

export const paymentMethods = [
  { label: "Ozow Instant EFT", value: 78.3, color: "#16a34a" },
  { label: "Card Payments", value: 15.4, color: "#1976D2" },
  { label: "Manual EFT", value: 4.8, color: "#f59e0b" },
  { label: "Other", value: 1.5, color: "#BDBDBD" },
];

export const customers: Customer[] = [
  {
    id: "cus_8412",
    name: "Thabo Mokoena",
    phone: "+27721234567",
    email: "thabo.mokoena@example.co.za",
    status: "lapsed",
    since: "Mar 2022",
    product: "Funeral cover R150/mo",
    monthlyPremium: 150,
    score: 87,
    estimatedValue: 4800,
    previousValue: 7200,
    inactiveMonths: 8,
    whatsappValid: true,
    popiaConsent: true,
    reasons: [
      { label: "+ previously paid", tone: "pos" },
      { label: "+ high historical value", tone: "pos" },
      { label: "+ valid WhatsApp", tone: "pos" },
      { label: "+ offer available", tone: "pos" },
      { label: "− inactive 8 months", tone: "neg" },
    ],
    timeline: [
      { title: "Quote created", detail: "R150/mo funeral cover", when: "Mar 2022", tone: "info" },
      { title: "Payments normal", detail: "22 on-time payments · R3,300 lifetime", when: "Apr 2022 – Dec 2024", tone: "good" },
      { title: "Debit order failed", detail: "reason: insufficient funds", when: "Jan 2025", tone: "bad" },
      { title: "Policy lapsed", detail: "no arrears owed", when: "Feb 2025", tone: "warn" },
      { title: "WhatsApp sent", detail: "campaign 'May Reactivation'", when: "May 12", tone: "info" },
      { title: "Customer replied", detail: "objection: price", when: "May 12", tone: "info" },
      { title: "AI conversation", detail: "intent detected: restart, price-sensitive", when: "May 12", tone: "info" },
      { title: "Payment requested", detail: "R150.00 via Ozow · awaiting confirmation", when: "May 12", tone: "warn" },
    ],
    recommendedAction:
      "Present approved lower-cost restart offer (R150/mo, no arrears). Empathetic tone; escalate after 2 objections.",
  },
  {
    id: "cus_8413",
    name: "Lerato Khumalo",
    phone: "+27821234567",
    email: "lerato.k@example.co.za",
    status: "failed_debit",
    since: "Jul 2021",
    product: "Funeral cover R195/mo",
    monthlyPremium: 195,
    score: 72,
    estimatedValue: 1950,
    previousValue: 4200,
    inactiveMonths: 3,
    whatsappValid: true,
    popiaConsent: true,
    reasons: [
      { label: "+ valid WhatsApp", tone: "pos" },
      { label: "+ recent activity", tone: "pos" },
      { label: "− affordability flag", tone: "neg" },
    ],
    timeline: [
      { title: "Policy started", when: "Jul 2021", tone: "info" },
      { title: "Debit order failed", detail: "insufficient funds", when: "May 2025", tone: "bad" },
      { title: "AI conversation started", when: "10m ago", tone: "info" },
    ],
    recommendedAction:
      "Offer flexible payment date or split payment. Escalate to human if 2+ objections.",
  },
  {
    id: "cus_8414",
    name: "Sipho Dlamini",
    phone: "+27731234567",
    email: "sipho.d@example.co.za",
    status: "lapsed",
    since: "Jan 2020",
    product: "Funeral cover R120/mo",
    monthlyPremium: 120,
    score: 91,
    estimatedValue: 3600,
    previousValue: 5400,
    inactiveMonths: 5,
    whatsappValid: true,
    popiaConsent: true,
    reasons: [
      { label: "+ long customer history", tone: "pos" },
      { label: "+ high payment success", tone: "pos" },
      { label: "+ valid WhatsApp", tone: "pos" },
      { label: "+ offer available", tone: "pos" },
    ],
    timeline: [
      { title: "Policy started", when: "Jan 2020", tone: "info" },
      { title: "5 years of payments", detail: "60 on-time payments", when: "Jan 2020 – Dec 2024", tone: "good" },
      { title: "Policy lapsed", detail: "no arrears owed", when: "May 2025", tone: "warn" },
      { title: "Recovered", detail: "R150 paid via Ozow", when: "12m ago", tone: "good" },
    ],
    recommendedAction: "Reinstate immediately — high-confidence recovery. Offer thank-you discount on next month.",
  },
  {
    id: "cus_8415",
    name: "Palesa Radebe",
    phone: "+27841234567",
    email: "palesa.r@example.co.za",
    status: "dormant",
    since: "Feb 2023",
    product: "Funeral cover R200/mo",
    monthlyPremium: 200,
    score: 64,
    estimatedValue: 2400,
    previousValue: 3600,
    inactiveMonths: 12,
    whatsappValid: true,
    popiaConsent: true,
    reasons: [
      { label: "+ valid WhatsApp", tone: "pos" },
      { label: "− long inactivity", tone: "neg" },
      { label: "− no recent engagement", tone: "neg" },
    ],
    timeline: [
      { title: "Policy started", when: "Feb 2023", tone: "info" },
      { title: "Last payment", when: "Aug 2024", tone: "info" },
      { title: "Marked dormant", when: "Sep 2024", tone: "warn" },
    ],
    recommendedAction: "Soft reactivation campaign — check-in message with no payment ask first.",
  },
];

export const conversations: Conversation[] = [
  {
    id: "con_001",
    customerName: "Thabo Mokoena",
    customerInitials: "TM",
    score: 87,
    estimatedValue: 4800,
    recovered: 150,
    status: "engaged",
    lastActivity: "2m ago",
    intent: "restart · price-sensitive",
    messages: [
      {
        id: "m1",
        role: "ai",
        kind: "text",
        body: "Hi Thabo, your cover lapsed in Jan. You don't owe arrears. Want to restart for R150/mo?",
        at: "2025-05-12T09:01:00",
      },
      {
        id: "m2",
        role: "customer",
        kind: "text",
        body: "I stopped because it was too expensive.",
        at: "2025-05-12T09:03:00",
      },
      {
        id: "m3",
        role: "ai",
        kind: "text",
        body: "I understand. We may be able to look at a lower-cost option. Would you like me to check what is available?",
        at: "2025-05-12T09:03:30",
      },
      {
        id: "m4",
        role: "customer",
        kind: "text",
        body: "Yes, let's do it!",
        at: "2025-05-12T09:04:00",
      },
      {
        id: "m5",
        role: "ai",
        kind: "payment_request",
        body: "Great — here is your secure payment request:",
        amount: 150,
        at: "2025-05-12T09:04:30",
      },
      {
        id: "m6",
        role: "system",
        kind: "payment_confirmed",
        body: "Payment Successful · R150.00 paid via Ozow · policy FS-12345 reactivated · webhook verified",
        amount: 150,
        at: "2025-05-12T09:06:00",
      },
    ],
  },
  {
    id: "con_002",
    customerName: "Lerato Khumalo",
    customerInitials: "LK",
    score: 72,
    estimatedValue: 1950,
    status: "awaiting_human",
    lastActivity: "9m ago",
    intent: "affordability objection",
    messages: [
      {
        id: "m1",
        role: "ai",
        kind: "text",
        body: "Hi Lerato, we noticed your last debit didn't go through. Want to set up a new payment date?",
        at: "2025-05-12T08:50:00",
      },
      {
        id: "m2",
        role: "customer",
        kind: "text",
        body: "Money was tight this month. Can I pay next week?",
        at: "2025-05-12T08:51:00",
      },
      {
        id: "m3",
        role: "ai",
        kind: "text",
        body: "Of course. I can move your payment to next Friday — no penalties. Shall I do that?",
        at: "2025-05-12T08:51:30",
      },
      {
        id: "m4",
        role: "customer",
        kind: "text",
        body: "Actually I'm not sure I can afford the R195 anymore. Is there a cheaper option?",
        at: "2025-05-12T08:53:00",
      },
    ],
  },
  {
    id: "con_003",
    customerName: "Sipho Dlamini",
    customerInitials: "SD",
    score: 91,
    estimatedValue: 3600,
    recovered: 150,
    status: "recovered",
    lastActivity: "12m ago",
    messages: [
      {
        id: "m1",
        role: "ai",
        kind: "text",
        body: "Hi Sipho, your cover lapsed. Want to restart for R120/mo?",
        at: "2025-05-12T08:40:00",
      },
      {
        id: "m2",
        role: "customer",
        kind: "text",
        body: "Yes please.",
        at: "2025-05-12T08:41:00",
      },
      {
        id: "m3",
        role: "system",
        kind: "payment_confirmed",
        body: "Payment Successful · R150.00 paid via Ozow · policy FS-67890 reactivated",
        amount: 150,
        at: "2025-05-12T08:43:00",
      },
    ],
  },
  {
    id: "con_004",
    customerName: "Palesa Radebe",
    customerInitials: "PR",
    score: 64,
    estimatedValue: 2400,
    status: "opted_out",
    lastActivity: "1h ago",
    messages: [
      {
        id: "m1",
        role: "ai",
        kind: "text",
        body: "Hi Palesa, we'd love to have you back. Can I share some options?",
        at: "2025-05-12T07:30:00",
      },
      {
        id: "m2",
        role: "customer",
        kind: "text",
        body: "STOP",
        at: "2025-05-12T07:31:00",
      },
      {
        id: "m3",
        role: "system",
        kind: "text",
        body: "Opt-out recorded · no further messages will be sent · POPIA compliant",
        at: "2025-05-12T07:31:05",
      },
    ],
  },
];

export const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "home", badge: null },
  { id: "demand-radar", label: "Demand & Content", icon: "chart", badge: null },
  { id: "campaigns", label: "Campaigns", icon: "send", badge: null },
  { id: "conversations", label: "Conversations", icon: "chat", badge: "128" },
  { id: "payments", label: "Payments", icon: "card", badge: "42" },
  { id: "policies", label: "Policies", icon: "file", badge: null },
  { id: "customers", label: "Contacts", icon: "users", badge: null },
  { id: "imports", label: "Imports", icon: "upload", badge: null },
  { id: "reports", label: "Reports", icon: "chart", badge: null },
  { id: "integrations", label: "Integrations", icon: "plug", badge: null },
  { id: "settings", label: "Settings", icon: "gear", badge: null },
] as const;

export const clientLogos = [
  "Funeral Secure",
  "Ubuntu Life",
  "Careway",
  "SA Comfort",
  "Umoja",
];

export const features = [
  {
    icon: "upload",
    title: "Upload & Score",
    body: "Upload lapsed policies CSV. 2ndLife scores and prioritizes the best recovery opportunities — automatically.",
  },
  {
    icon: "chat",
    title: "AI WhatsApp Conversations",
    body: "Empathetic, smart conversations that re-engage customers and handle objections — at scale, 24/7.",
  },
  {
    icon: "card",
    title: "Instant Payments",
    body: "Customers pay via Ozow Instant EFT right inside the WhatsApp chat. No debit orders, no friction.",
  },
  {
    icon: "refresh",
    title: "Real-time Updates",
    body: "Payments and reactivations sync instantly with your dashboard. Always know what's working.",
  },
  {
    icon: "chart",
    title: "Actionable Insights",
    body: "Know exactly what's working, what's not, and where to focus next. Reports that actually help you decide.",
  },
];

export const steps = [
  { n: 1, title: "Upload", body: "Upload your lapsed policy list as a CSV.", icon: "upload" },
  { n: 2, title: "Score & Prioritize", body: "We rank and segment the best opportunities.", icon: "target" },
  { n: 3, title: "Engage", body: "AI starts empathetic WhatsApp conversations.", icon: "chat" },
  { n: 4, title: "Collect", body: "Customers pay via Ozow Instant EFT.", icon: "card" },
  { n: 5, title: "Reactivate", body: "Policy reinstated. Revenue recovered. You grow.", icon: "check" },
];
