"use client";

import { useAppStore } from "@/lib/2ndlife/store";
import { LandingPage } from "@/components/2ndlife/landing/landing-page";
import { FuneralInsurancePage } from "@/components/2ndlife/landing/funeral-insurance-page";
import { AppShell } from "@/components/2ndlife/app/app-shell";
import { DashboardView } from "@/components/2ndlife/screens/dashboard-view";
import { ImportWizardView } from "@/components/2ndlife/screens/import-wizard-view";
import { Customer360View } from "@/components/2ndlife/screens/customer-360-view";
import { ConversationsView } from "@/components/2ndlife/screens/conversations-view";
import { CampaignBuilderView } from "@/components/2ndlife/screens/campaign-builder-view";
import {
  CustomersView,
  CampaignsView,
  PaymentsView,
  ReportsView,
  IntegrationsView,
  SettingsView,
} from "@/components/2ndlife/screens/list-views";

export default function Home() {
  const view = useAppStore((s) => s.view);
  const marketingView = useAppStore((s) => s.marketingView);

  // Marketing pages render outside the app shell
  if (view === "landing") {
    if (marketingView === "funeral-insurance") {
      return <FuneralInsurancePage />;
    }
    return <LandingPage />;
  }

  // All other views render inside the app shell
  return (
    <AppShell>
      {view === "dashboard" && <DashboardView />}
      {view === "imports" && <ImportWizardView />}
      {view === "customer-detail" && <Customer360View />}
      {view === "conversations" && <ConversationsView />}
      {view === "campaigns-new" && <CampaignBuilderView />}
      {view === "customers" && <CustomersView />}
      {view === "campaigns" && <CampaignsView />}
      {view === "payments" && <PaymentsView />}
      {view === "reports" && <ReportsView />}
      {view === "integrations" && <IntegrationsView />}
      {view === "settings" && <SettingsView />}
      {view === "policies" && <CustomersView />}
    </AppShell>
  );
}
