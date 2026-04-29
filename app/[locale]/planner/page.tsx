import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { PlannerClient } from "./PlannerClient";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Trip Planner | fujiseat",
    description: "Plan your Japan trip — choose a route, set a departure date, and track your pre-departure checklist. Lightweight planner with weather, currency, and emergency info.",
    openGraph: {
      title: "Trip Planner | fujiseat",
      description: "Plan your Japan trip with route templates, weather, currency converter, and pre-departure checklist.",
      siteName: "fujiseat",
      images: [{ url: "https://fujiseat.com/og-planner.png", width: 1200, height: 630 }],
    },
    alternates: getAlternates("/planner", locale),
  };
}

export default function PlannerPage() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-6 md:py-10">
        <PlannerClient />
      </Container>
    </main>
  );
}
