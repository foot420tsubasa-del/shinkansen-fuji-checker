import type { Metadata } from "next";
import { PlanYourTripHub } from "@/components/travel/PlanYourTripHub";
import { getAlternates } from "@/i18n/hreflang";
import { SiteHeader } from "../components/SiteHeader";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "planYourTrip.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: getAlternates("/plan-your-trip", locale),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "fujiseat",
      images: [{ url: "https://fujiseat.com/og-plan-your-trip.png", width: 1200, height: 630 }],
    },
  };
}

export default function PlanYourTripPage() {
  return (
    <>
      <SiteHeader />
      <PlanYourTripHub />
    </>
  );
}
