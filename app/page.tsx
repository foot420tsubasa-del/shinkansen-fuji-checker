// Root "/" is served by middleware → app/[locale]/page.tsx with locale "en".
// This file provides explicit metadata for crawlers that hit "/" directly.
import type { Metadata } from "next";
import { getAlternates } from "@/i18n/hreflang";

export const metadata: Metadata = {
  title: "Japan Trip Planner — Free Shinkansen Seat Checker, Stays & Itineraries",
  description: "Plan your Japan trip with one tool. Find the Mt. Fuji seat on the Shinkansen, compare Tokyo stay areas, airport transfers, and a 7-day itinerary. Built by a Japanese creator.",
  alternates: getAlternates("", "en"),
  other: {
    "agd-partner-manual-verification": "",
  },
};

// Should not be rendered in practice (middleware handles routing).
export default function RootPage() {
  return null;
}
