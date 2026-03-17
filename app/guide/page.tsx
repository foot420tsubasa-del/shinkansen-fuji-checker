// "/guide" is served by middleware → app/[locale]/guide/page.tsx with locale "en".
// This file provides explicit metadata for crawlers that hit "/guide" directly.
import type { Metadata } from "next";
import { getAlternates } from "@/i18n/hreflang";

export const metadata: Metadata = {
  alternates: getAlternates("/guide", "en"),
};

// Should not be rendered in practice (middleware handles routing).
export default function GuideFallbackPage() {
  return null;
}
