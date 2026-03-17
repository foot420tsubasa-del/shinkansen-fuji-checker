// Root "/" is served by middleware → app/[locale]/page.tsx with locale "en".
// This file provides explicit metadata for crawlers that hit "/" directly.
import type { Metadata } from "next";
import { getAlternates } from "@/i18n/hreflang";

export const metadata: Metadata = {
  alternates: getAlternates("", "en"),
};

// Should not be rendered in practice (middleware handles routing).
export default function RootPage() {
  return null;
}
