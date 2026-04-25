import type { Metadata } from "next";
import JapanTripCommandCenter from "@/src/JapanTripCommandCenter";

export const metadata: Metadata = {
  title: "Japan Trip Command Center — fujiseat.com",
  description:
    "Explore your Japan route with an interactive command center, route map, checklists, weather, booking essentials, and city tips.",
};

export default function CommandCenterPage() {
  return <JapanTripCommandCenter />;
}
