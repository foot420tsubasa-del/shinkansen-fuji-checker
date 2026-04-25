import type { Metadata } from "next";
import { PlanYourTripHub } from "@/components/travel/PlanYourTripHub";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Japan Trip Essentials After Choosing Your Shinkansen Seat | fujiseat",
    description:
      "You checked your Fuji-side Shinkansen seat. Now prepare the rest of your Japan trip with rail, arrival, hotel, luggage, Mt. Fuji, and city activity essentials.",
    alternates: getAlternates("/plan-your-trip", locale),
    openGraph: {
      title: "Japan Trip Essentials After Choosing Your Shinkansen Seat",
      description:
        "You checked your Fuji-side Shinkansen seat. Now prepare the rest of your Japan trip.",
      siteName: "fujiseat",
    },
  };
}

export default function PlanYourTripPage() {
  return <PlanYourTripHub />;
}
