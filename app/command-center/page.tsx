// "/command-center" is served by middleware → app/[locale]/command-center/page.tsx with locale "en".
// This file provides explicit metadata for crawlers that hit "/command-center" directly.
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Japan Trip Command Center — fujiseat.com",
  description:
    "Explore your Japan route with an interactive command center, route map, checklists, weather, booking essentials, and city tips.",
};

export default function CommandCenterFallbackPage() {
  redirect("/planner");
}
