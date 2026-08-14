"use client";

import { create } from "zustand";

export type AppView =
  | "landing"
  | "dashboard"
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

export type MarketingView = "main" | "funeral-insurance";

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
  goToVertical: (v: MarketingView) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "landing",
  marketingView: "main",
  selectedCustomerId: null,
  selectedConversationId: null,
  setView: (view) => set({ view }),
  setMarketingView: (marketingView) =>
    set({ view: "landing", marketingView }),
  openCustomer: (id) => set({ view: "customer-detail", selectedCustomerId: id }),
  openConversation: (id) => set({ view: "conversations", selectedConversationId: id }),
  enterApp: () => set({ view: "dashboard" }),
  exitToLanding: () => set({ view: "landing", marketingView: "main" }),
  goToVertical: (v) => set({ view: "landing", marketingView: v }),
}));
