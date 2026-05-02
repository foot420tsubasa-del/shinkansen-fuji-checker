import type { Metadata } from "next";
import JapanTripCommandCenter from "@/src/JapanTripCommandCenter";

export const metadata: Metadata = {
  title: "Japan Trip Command Center — fujiseat.com",
  description:
    "Explore your Japan route with an interactive command center, route map, checklists, weather, booking essentials, and city tips.",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Japan Trip Command Center",
    description: "Interactive command center with route map, checklists, weather, and booking essentials.",
    siteName: "fujiseat",
    images: [{ url: "https://fujiseat.com/og-command-center.png", width: 1200, height: 630 }],
  },
};

export default function CommandCenterPage() {
  return <JapanTripCommandCenter />;
}
