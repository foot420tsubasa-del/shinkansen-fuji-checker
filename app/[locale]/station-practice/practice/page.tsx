import type { Metadata } from "next";
import { PracticeClient } from "@/components/station-practice/gameplay/PracticeClient";

/*
 * Hidden internal-preview route (gameplay surface). Same protections as
 * the parent /station-practice page:
 *   - sitemap.ts intentionally does not list this path
 *   - robots.ts disallows /station-practice and /*​/station-practice
 *   - metadata below sets index/follow false, no hreflang alternates
 */
export const metadata: Metadata = {
  title: "Station Practice — gameplay (internal preview)",
  description:
    "Internal preview of the station-practice gameplay surface. Hidden — not linked from public navigation.",
  robots: { index: false, follow: false },
};

export default function StationPracticeGameplayPage() {
  return <PracticeClient />;
}
