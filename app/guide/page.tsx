// "/guide" is served by middleware → app/[locale]/guide/page.tsx with locale "en".
// This file provides explicit metadata for crawlers that hit "/guide" directly.
import type { Metadata } from "next";
import { getAlternates } from "@/i18n/hreflang";

export const metadata: Metadata = {
  title: "Which Shinkansen Seat to See Mt. Fuji? Seat E Guide for Tokyo to Kyoto",
  description:
    "Find the Mt. Fuji side of the Shinkansen before booking. For Tokyo to Kyoto or Osaka, choose the right side and Seat E in standard cars. Includes seat checker, timing, JR Pass notes, and booking tips.",
  alternates: getAlternates("/guide", "en"),
};

// Should not be rendered in practice (middleware handles routing).
export default function GuideFallbackPage() {
  return null;
}
