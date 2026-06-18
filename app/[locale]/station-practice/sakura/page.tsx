import type { Metadata } from "next";
import { SakuraMissionClient } from "@/components/station-practice/sakura/SakuraMissionClient";
import {
  sakuraMissions,
  sakuraWalk,
  type SakuraGoalKey,
} from "@/data/station-practice/sakura/nodes";

export const metadata: Metadata = {
  title: "Station Practice — Sakura Central free-walk navigation",
  description:
    "Walk a complex 7-floor Tokyo-style station, follow the Japanese signs, and find your own way — from a subway platform to a street exit or a JR transfer. Free-walk practice in 9 languages.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ goal?: string }>;
};

export default async function SakuraMissionPage({ searchParams }: Props) {
  const { goal } = await searchParams;
  const resolved: SakuraGoalKey =
    goal && goal in sakuraMissions ? (goal as SakuraGoalKey) : sakuraWalk.defaultGoal;
  return <SakuraMissionClient key={resolved} goal={resolved} />;
}
