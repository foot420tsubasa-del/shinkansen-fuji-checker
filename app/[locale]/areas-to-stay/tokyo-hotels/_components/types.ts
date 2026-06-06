import type { StayAreaBase } from "@/lib/stay-area/types";
import type { ProviderId } from "@/components/ui/ProviderButton";

/**
 * Minimal score view used by the visual area-hotel-page components.
 * Surface a stable subset of the existing computed score so callers
 * don't reach into the larger ComputedStayAreaScore shape directly.
 */
export type AreaScoreView = {
  overallScore: number;
  scores: StayAreaBase["editorialScores"];
  confidenceLabel: string;
  sourceFreshnessLabel: string;
};

export type AreaProviderLink = {
  provider: ProviderId;
  href: string;
  trackingHref: string;
  label: string;
  linkId: string;
  subId?: string;
  priority: number;
};

/**
 * Headline qualitative label for the overall hotel-base fit. Pure function
 * of the score value; UI uses this for the small badge on the hero score card.
 */
export function fitHeadlineLabel(overallScore: number): "topPick" | "strongFit" | "goodFit" | "mixedFit" | "checkCarefully" {
  if (overallScore >= 85) return "topPick";
  if (overallScore >= 75) return "strongFit";
  if (overallScore >= 65) return "goodFit";
  if (overallScore >= 55) return "mixedFit";
  return "checkCarefully";
}
