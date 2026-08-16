"use client";

import { create } from "zustand";

export type AppView =
  | "landing"
  | "dashboard"
  | "demand-radar"
  | "live-signal"
  | "campaigns"
  | "campaigns-new"
  | "conversations"
  | "customers"
  | "customer-detail"
  | "imports"
  | "payments"
  | "reports"
  | "integrations"
  | "settings";


/**
 * Marketing view state — supports:
 * - "main"                          → horizontal platform landing
 * - "vertical:<slug>"               → vertical landing page (funeral-insurance, subscriptions, etc.)
 * - "use-case:<slug>"               → use case landing page (win-backs, renewals, invoices, quotes, failed-payments)
 */
export type MarketingView = string;

interface AppState {
  view: AppView;
  marketingView: MarketingView;
  selectedCustomerId: string | null;
  selectedConversationId: string | null;
  setView: (v: AppView) => void;
  setMarketingView: (v: MarketingView) => void;
  openCustomer: (id: string) => void;
  openConversation: (id: string) => void;
  enterApp: () => void;
  exitToLanding: () => void;
  goToVertical: (slug: string) => void;
  goToUseCase: (slug: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "landing",
  marketingView: "main",
  selectedCustomerId: null,
  selectedConversationId: null,
  setView: (view) => set({ view }),
  setMarketingView: (marketingView) => set({ view: "landing", marketingView }),
  openCustomer: (id) => set({ view: "customer-detail", selectedCustomerId: id }),
  openConversation: (id) => set({ view: "conversations", selectedConversationId: id }),
  enterApp: () => set({ view: "dashboard" }),
  exitToLanding: () => set({ view: "landing", marketingView: "main" }),
  goToVertical: (slug) => set({ view: "landing", marketingView: `vertical:${slug}` }),
  goToUseCase: (slug) => set({ view: "landing", marketingView: `use-case:${slug}` }),
}));
