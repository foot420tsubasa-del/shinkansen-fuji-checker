import type { Metadata } from "next";
import { BranchingPracticeClient } from "@/components/station-practice/branching/BranchingPracticeClient";

export const metadata: Metadata = {
  title: "Station Practice — Japanese station navigation mission",
  description:
    "Practice a short Japanese station navigation mission with exits, transfer gates, signs, and wrong-route recovery.",
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
