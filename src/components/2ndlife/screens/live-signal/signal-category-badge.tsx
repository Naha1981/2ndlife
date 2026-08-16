"use client";

import type { SignalCategory } from "@/modules/livesignal/types";

const CATEGORY_CONFIG: Record<
  SignalCategory,
  { label: string; color: string; bg: string; dot: string }
> = {
  price: {
    label: "Price",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
  },
  availability: {
    label: "Availability",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
  },
  urgency: {
    label: "Urgency",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
  financing: {
    label: "Financing",
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
    dot: "bg-violet-400",
  },
  value_objection: {
    label: "Value Objection",
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    dot: "bg-orange-400",
  },
  social_validation: {
    label: "Social Proof",
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-200",
    dot: "bg-teal-400",
  },
  logistics: {
    label: "Logistics",
    color: "text-slate-700",
    bg: "bg-slate-50 border-slate-200",
    dot: "bg-slate-400",
  },
  purchase_intent: {
    label: "Purchase Intent",
    color: "text-brand-700",
    bg: "bg-brand-50 border-brand-200",
    dot: "bg-brand-500",
  },
};

interface SignalCategoryBadgeProps {
  category: SignalCategory;
  size?: "sm" | "md";
  showDot?: boolean;
}

export function SignalCategoryBadge({
  category,
  size = "md",
  showDot = true,
}: SignalCategoryBadgeProps) {
  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.purchase_intent;
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const px = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-0.5";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${textSize} ${px} ${cfg.color} ${cfg.bg}`}
    >
      {showDot && (
        <span className={`rounded-full shrink-0 ${dotSize} ${cfg.dot}`} />
      )}
      {cfg.label}
    </span>
  );
}

export { CATEGORY_CONFIG };
