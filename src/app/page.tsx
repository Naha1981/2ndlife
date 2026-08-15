"use client";

import { useAppStore } from "@/lib/2ndlife/store";
import { LandingPage } from "@/components/2ndlife/landing/landing-page";
import { VerticalPage } from "@/components/2ndlife/landing/vertical-page";
import { UseCasePage } from "@/components/2ndlife/landing/use-case-page";
import { PricingPage } from "@/components/2ndlife/landing/pricing-page";
import { CompanyPage } from "@/components/2ndlife/landing/company-page";
import { LegalPopiaPage, LegalPrivacyPage } from "@/components/2ndlife/landing/legal-pages";
import { verticals } from "@/lib/2ndlife/verticals";
import { useCases } from "@/lib/2ndlife/use-cases";
import { AppShell } from "@/components/2ndlife/app/app-shell";
import { DashboardView } from "@/components/2ndlife/screens/dashboard-view";
import { ImportWizardView } from "@/components/2ndlife/screens/import-wizard-view";
import { Customer360View } from "@/components/2ndlife/screens/customer-360-view";
import { ConversationsView } from "@/components/2ndlife/screens/conversations-view";
import { CampaignBuilderView } from "@/components/2ndlife/screens/campaign-builder-view";
import { DemandRadarView } from "@/components/2ndlife/screens/demand-radar-view";
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
    // Vertical pages: vertical:<slug>
    if (marketingView.startsWith("vertical:")) {
      const slug = marketingView.slice("vertical:".length);
      const config = verticals[slug];
      if (config) return <VerticalPage config={config} />;
      return <LandingPage />;
    }

    // Use case pages: use-case:<slug>
    if (marketingView.startsWith("use-case:")) {
      const slug = marketingView.slice("use-case:".length);
      const config = useCases[slug];
      if (config) return <UseCasePage config={config} />;
      return <LandingPage />;
    }

    // Pricing page
    if (marketingView === "pricing") {
      return <PricingPage />;
    }

    // Company page (also handles "company#contact" — CompanyPage scrolls internally)
    if (marketingView === "company" || marketingView === "company#contact") {
      return <CompanyPage />;
    }

    // Legal pages
    if (marketingView === "legal-popia") {
      return <LegalPopiaPage />;
    }
    if (marketingView === "legal-privacy") {
      return <LegalPrivacyPage />;
    }

    // Default: horizontal landing page
    return <LandingPage />;
  }

  // App views render inside the app shell
  return (
    <AppShell>
      {view === "dashboard" && <DashboardView />}
      {view === "demand-radar" && <DemandRadarView />}
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
