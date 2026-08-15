import type { VerticalConfig } from "@/components/2ndlife/landing/vertical-page";

export const verticals: Record<string, VerticalConfig> = {
  "funeral-insurance": {
    slug: "funeral-insurance",
    flagship: true,
    eyebrow: "For Funeral Administrators & Micro-Insurers",
    headline: "Recover Lapsed",
    headlineAccent: "Funeral Policies",
    subhead:
      "Stop relying on manual call centers. 2ndLife uses empathetic AI to re-engage lapsed members and recover premiums instantly via WhatsApp.",
    problemTitle: "Every lapsed policy is revenue you've already earned.",
    problemSub: "Debit orders fail. People's circumstances change. But the need for cover doesn't.",
    problemConsequence: "The result?",
    problemBullets: [
      "Millions in lost premium",
      "High call centre costs",
      "Manual, time-consuming follow-ups",
      "Low reactivation rates",
    ],
    solutions: [
      {
        icon: "chat",
        title: "AI WhatsApp Conversations",
        desc: "Empathetic conversations that feel human. AI handles objections, explains arrears, and offers restructuring.",
      },
      {
        icon: "card",
        title: "Instant EFT via Ozow",
        desc: "Customers pay via Ozow Instant EFT right inside the WhatsApp chat. No debit orders, no friction.",
      },
      {
        icon: "brain",
        title: "Smart Prioritization",
        desc: "We score your lapsed book to find the members most likely to restart.",
      },
      {
        icon: "shield",
        title: "POPIA Compliant",
        desc: "Built for South African regulations. Context minimization ensures member data is secure.",
      },
    ],
    howItWorks: [
      { title: "Upload", desc: "Upload your lapsed policy list as a CSV." },
      { title: "Score", desc: "We rank and segment the best recovery opportunities." },
      { title: "Engage", desc: "AI starts empathetic WhatsApp conversations." },
      { title: "Collect", desc: "Customers pay via Ozow Instant EFT." },
      { title: "Reactivate", desc: "Policy reinstated. Revenue recovered." },
    ],
    ctaTitle: "Ready to reactivate your lapsed book?",
    ctaSub:
      "Join forward-thinking administrators who are recovering more, spending less, and growing stronger.",
  },

  subscriptions: {
    slug: "subscriptions",
    eyebrow: "For SaaS & Subscription Businesses",
    headline: "Win Back",
    headlineAccent: "Churned Subscribers",
    subhead:
      "Re-engage cancelled and churned customers with personalized, AI-driven win-back campaigns via WhatsApp and email.",
    problemTitle: "Every cancelled subscription is revenue walking out the door.",
    problemSub:
      "Credit cards expire. Trials end. Customers churn quietly. And your win-back emails get ignored.",
    problemConsequence: "The result?",
    problemBullets: [
      "Rising churn rates",
      "Wasted acquisition spend",
      "Low email open rates on win-back campaigns",
      "No visibility into churn reasons",
    ],
    solutions: [
      {
        icon: "chat",
        title: "Channel-Agnostic Reach",
        desc: "WhatsApp, email, SMS — we reach churned customers where they actually respond.",
      },
      {
        icon: "brain",
        title: "Churn Reason Intelligence",
        desc: "AI classifies why each customer churned and picks the right win-back offer.",
      },
      {
        icon: "card",
        title: "Frictionless Reactivation",
        desc: "One-click restart via Stripe, PayFast, or Ozow — no re-keying card details.",
      },
      {
        icon: "shield",
        title: "Respectful Cadence",
        desc: "Honor opt-outs instantly. Cap attempts per customer. Never burn goodwill.",
      },
    ],
    howItWorks: [
      { title: "Sync", desc: "Connect your Stripe, Recurly, or billing system." },
      { title: "Score", desc: "We rank churned customers by likelihood to return." },
      { title: "Engage", desc: "AI runs the win-back conversation." },
      { title: "Reactivate", desc: "Customer restarts with one click." },
      { title: "Measure", desc: "Track recovered MRR in real time." },
    ],
    ctaTitle: "Turn churn into recovered MRR.",
    ctaSub:
      "Join subscription businesses recovering 2–4x more churned customers than email-only win-backs.",
  },

  "financial-services": {
    slug: "financial-services",
    eyebrow: "For Financial Services & Advisors",
    headline: "Recover Missed",
    headlineAccent: "Renewals & Lapsed Clients",
    subhead:
      "Re-engage clients whose policies, investments, or advisory relationships have gone dormant — without adding headcount.",
    problemTitle: "Every lapsed client is lifetime value walking away.",
    problemSub:
      "Policies expire. Advisory fees lapse. Clients ghost. And manual outreach doesn't scale.",
    problemConsequence: "The result?",
    problemBullets: [
      "Lost advisory fees and AUM",
      "High cost of client acquisition",
      "Manual follow-up doesn't scale",
      "No visibility into lapsed book",
    ],
    solutions: [
      {
        icon: "chat",
        title: "Professional AI Outreach",
        desc: "Empathetic, compliant conversations appropriate for financial services clients.",
      },
      {
        icon: "brain",
        title: "Book-of-Business Scoring",
        desc: "Rank lapsed clients by lifetime value and re-engagement likelihood.",
      },
      {
        icon: "card",
        title: "Secure Payment Links",
        desc: "POPIA-compliant payment flows for fee restarts and arrears.",
      },
      {
        icon: "shield",
        title: "FSCA-Ready Audit Trail",
        desc: "Every interaction logged for compliance review.",
      },
    ],
    howItWorks: [
      { title: "Upload", desc: "Upload your lapsed client book." },
      { title: "Score", desc: "We rank by LTV and re-engagement likelihood." },
      { title: "Engage", desc: "AI runs compliant, professional outreach." },
      { title: "Reactivate", desc: "Client restarts or re-engages." },
      { title: "Report", desc: "Audit-ready compliance trail." },
    ],
    ctaTitle: "Recover your lapsed book of business.",
    ctaSub: "Join advisors and brokerages recovering client relationships at scale.",
  },

  education: {
    slug: "education",
    eyebrow: "For Schools, Universities & EdTech",
    headline: "Recover Lost",
    headlineAccent: "Enrollments & Tuition",
    subhead:
      "Re-engage prospective students who dropped out of admissions and recover unpaid tuition — without overwhelming your admin team.",
    problemTitle: "Every dropped applicant and unpaid fee is lost revenue.",
    problemSub:
      "Students drop out of the funnel. Tuition goes unpaid. Parents ghost admissions calls.",
    problemConsequence: "The result?",
    problemBullets: [
      "Lost enrollment revenue",
      "High cost of student acquisition",
      "Overloaded admissions teams",
      "Unpaid tuition chasing takes months",
    ],
    solutions: [
      {
        icon: "chat",
        title: "Student-Friendly AI",
        desc: "Empathetic WhatsApp conversations in the student's language (incl. Zulu, Xhosa, Afrikaans).",
      },
      {
        icon: "brain",
        title: "Admissions Funnel Scoring",
        desc: "Rank drop-offs by likelihood to re-enroll.",
      },
      {
        icon: "card",
        title: "Tuition Payment Links",
        desc: "Instant EFT and card options right in the chat.",
      },
      {
        icon: "shield",
        title: "POPIA-Compliant Parent Contact",
        desc: "Consent-aware outreach to guardians.",
      },
    ],
    howItWorks: [
      { title: "Upload", desc: "Upload your lapsed applicant or unpaid tuition list." },
      { title: "Score", desc: "We rank by re-enrollment likelihood." },
      { title: "Engage", desc: "AI reaches out on WhatsApp." },
      { title: "Collect", desc: "Tuition paid or deposit secured." },
      { title: "Enroll", desc: "Student returns to the program." },
    ],
    ctaTitle: "Fill more seats. Collect more tuition.",
    ctaSub:
      "Join institutions recovering enrollments and tuition fees without adding headcount.",
  },

  healthcare: {
    slug: "healthcare",
    eyebrow: "For Clinics, Dentists & Medical Practices",
    headline: "Recover Missed",
    headlineAccent: "Appointments & Copays",
    subhead:
      "Re-engage no-show patients and recover unpaid copays — without a single phone call from your front desk.",
    problemTitle: "Every no-show and unpaid copay is revenue lost.",
    problemSub:
      "Patients skip appointments. Copays go unpaid. And chasing them burns staff time.",
    problemConsequence: "The result?",
    problemBullets: [
      "Lost appointment revenue",
      "Unpaid copays piling up",
      "Overloaded front desk",
      "No time to chase patients",
    ],
    solutions: [
      {
        icon: "chat",
        title: "HIPAA/POPIA-Compliant AI",
        desc: "Empathetic outreach that respects patient privacy.",
      },
      {
        icon: "brain",
        title: "Patient Scoring",
        desc: "Rank no-shows by likelihood to reschedule.",
      },
      {
        icon: "card",
        title: "Instant Copay Collection",
        desc: "Pay copays or outstanding balances right in WhatsApp.",
      },
      {
        icon: "shield",
        title: "Audit Trail",
        desc: "Every patient interaction logged for compliance.",
      },
    ],
    howItWorks: [
      { title: "Upload", desc: "Upload no-shows and unpaid patient lists." },
      { title: "Score", desc: "We rank by reschedule likelihood." },
      { title: "Engage", desc: "AI reaches out on WhatsApp." },
      { title: "Collect", desc: "Copays and balances paid." },
      { title: "Reschedule", desc: "Patient returns to the schedule." },
    ],
    ctaTitle: "Fill the schedule. Collect the balance.",
    ctaSub:
      "Join practices recovering appointment revenue without adding front-desk headcount.",
  },

  retail: {
    slug: "retail",
    eyebrow: "For Retailers & E-Commerce",
    headline: "Win Back",
    headlineAccent: "Dormant Customers",
    subhead:
      "Re-engage customers who haven't shopped in months and recover abandoned carts — with AI that feels personal, not spammy.",
    problemTitle: "Every dormant customer is revenue you've already spent to acquire.",
    problemSub:
      "Carts get abandoned. Customers go cold. And generic 'we miss you' emails get ignored.",
    problemConsequence: "The result?",
    problemBullets: [
      "Wasted acquisition spend",
      "Low email open rates",
      "Abandoned carts sitting in limbo",
      "No insight into win-back ROI",
    ],
    solutions: [
      {
        icon: "chat",
        title: "Personalized WhatsApp",
        desc: "AI uses their past purchases to craft relevant win-back messages.",
      },
      {
        icon: "brain",
        title: "Customer Scoring",
        desc: "Rank dormant customers by win-back likelihood and predicted LTV.",
      },
      {
        icon: "card",
        title: "In-Chat Checkout",
        desc: "Recover carts with one-tap payment — no return-to-site friction.",
      },
      {
        icon: "shield",
        title: "Smart Opt-Out",
        desc: "Honor STOP instantly. Cap attempts. Never damage brand goodwill.",
      },
    ],
    howItWorks: [
      { title: "Sync", desc: "Connect Shopify, WooCommerce, or your POS." },
      { title: "Score", desc: "We rank dormant customers by win-back likelihood." },
      { title: "Engage", desc: "AI runs personalized WhatsApp outreach." },
      { title: "Collect", desc: "Cart recovered with in-chat checkout." },
      { title: "Retain", desc: "Customer returns to active status." },
    ],
    ctaTitle: "Turn dormant customers into active shoppers.",
    ctaSub:
      "Join retailers recovering 3–5x more abandoned carts than email-only campaigns.",
  },

  "b2b-services": {
    slug: "b2b-services",
    eyebrow: "For B2B Services & Agencies",
    headline: "Recover Stale",
    headlineAccent: "Quotes & Unpaid Invoices",
    subhead:
      "Re-engage prospects who got quotes but never signed, and chase unpaid invoices without burning your sales team's time.",
    problemTitle: "Every stale quote and unpaid invoice is revenue you already earned.",
    problemSub:
      "Proposals go unanswered. Invoices sit at 60+ days. And chasing them manually doesn't scale.",
    problemConsequence: "The result?",
    problemBullets: [
      "Stale proposals sitting in inboxes",
      "Cash flow tied up in 60+ day invoices",
      "Sales teams wasting time on chase calls",
      "No visibility into recovery pipeline",
    ],
    solutions: [
      {
        icon: "chat",
        title: "Professional AI Follow-Up",
        desc: "Polite, firm outreach that maintains the relationship while recovering revenue.",
      },
      {
        icon: "brain",
        title: "Quote & Invoice Scoring",
        desc: "Rank by deal size and likelihood to convert/pay.",
      },
      {
        icon: "card",
        title: "Instant Payment Options",
        desc: "EFT and card payment links right in the conversation.",
      },
      {
        icon: "shield",
        title: "Escalation Workflows",
        desc: "AI handles routine follow-up; humans handle complex negotiations.",
      },
    ],
    howItWorks: [
      { title: "Upload", desc: "Upload stale quotes and unpaid invoices." },
      { title: "Score", desc: "We rank by size and payment likelihood." },
      { title: "Engage", desc: "AI runs professional follow-up." },
      { title: "Collect", desc: "Invoice paid or quote signed." },
      { title: "Report", desc: "Recovery pipeline in real time." },
    ],
    ctaTitle: "Recover your stale pipeline.",
    ctaSub:
      "Join agencies and service firms recovering quotes and invoices without burning sales headcount.",
  },
};

export const verticalOrder = [
  "funeral-insurance",
  "subscriptions",
  "financial-services",
  "education",
  "healthcare",
  "retail",
  "b2b-services",
];

export const verticalLabels: Record<string, string> = {
  "funeral-insurance": "Funeral & Micro-Insurance",
  subscriptions: "Subscriptions",
  "financial-services": "Financial Services",
  education: "Education",
  healthcare: "Healthcare",
  retail: "Retail",
  "b2b-services": "B2B Services",
};
