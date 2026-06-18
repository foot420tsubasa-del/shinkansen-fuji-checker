import type { Metadata } from "next";
import { SakuraMissionClient } from "@/components/station-practice/sakura/SakuraMissionClient";

export const metadata: Metadata = {
  title: "Station Practice — Sakura Central node navigation",
  description:
    "Walk a complex Tokyo-style station from a subway platform up to a street exit, reading Japanese signs at every junction. Multi-floor node-navigation practice in 9 languages.",
  robots: { index: false, follow: false },
};

export default function SakuraMissionPage() {
  return <SakuraMissionClient />;
}
