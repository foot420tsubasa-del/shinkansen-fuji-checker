import type { Metadata } from "next";
import { BranchingPracticeClient } from "@/components/station-practice/branching/BranchingPracticeClient";

/*
 * Hidden internal-preview route — branching image-navigation mode.
 *
 * Sibling of /station-practice/practice (2.5D MVP) and
 * /station-practice/practice-3d (R3F prototype). Same protections:
 *   - app/sitemap.ts intentionally does not list this path
 *   - app/robots.ts disallows /station-practice and /*​/station-practice
 *     recursively (so /station-practice/branching is already covered)
 *   - metadata below sets index/follow false, no hreflang alternates
 *   - parent layout (app/[locale]/station-practice/layout.tsx) provides
 *     Geist font + dark theme scoped to this route group
 */

export const metadata: Metadata = {
  title: "Station Practice — branching navigation (internal preview)",
  description:
    "Internal preview of the branching image-navigation practice mode. Hidden — not linked from public navigation.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ mission?: string }>;
};

export default async function StationPracticeBranchingPage({
  searchParams,
}: Props) {
  const { mission } = await searchParams;
  return <BranchingPracticeClient key={mission ?? "1"} missionId={mission} />;
}
