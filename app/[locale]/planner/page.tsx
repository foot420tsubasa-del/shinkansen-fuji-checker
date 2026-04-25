import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PlannerClient } from "./PlannerClient";

export const metadata: Metadata = {
  title: "Trip Planner | fujiseat",
  description: "Plan your Japan trip — choose a route, set a departure date, and track your pre-departure checklist. Lightweight planner with weather, currency, and emergency info.",
  openGraph: {
    title: "Trip Planner | fujiseat",
    description: "Plan your Japan trip with route templates, weather, currency converter, and pre-departure checklist.",
    siteName: "fujiseat",
  },
};

export default function PlannerPage() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
      <Container className="py-6 md:py-10">
        <PlannerClient />
      </Container>
    </main>
  );
}
