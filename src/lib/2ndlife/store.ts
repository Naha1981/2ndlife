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

interface AppState {
  view: AppView;
  selectedCustomerId: string | null;
  selectedConversationId: string | null;
  setView: (v: AppView) => void;
  openCustomer: (id: string) => void;
  openConversation: (id: string) => void;
  enterApp: () => void;
  exitToLanding: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: "landing",
  selectedCustomerId: null,
  selectedConversationId: null,
  setView: (view) => set({ view }),
  openCustomer: (id) => set({ view: "customer-detail", selectedCustomerId: id }),
  openConversation: (id) => set({ view: "conversations", selectedConversationId: id }),
  enterApp: () => set({ view: "dashboard" }),
  exitToLanding: () => set({ view: "landing" }),
}));
