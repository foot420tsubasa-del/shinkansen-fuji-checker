import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomeClient from "./HomeClient";
import { getAlternates } from "@/i18n/hreflang";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("homeTitle"),
    description: t("homeDesc"),
    alternates: getAlternates("", locale),
    openGraph: {
      title: t("homeTitle"),
      description: t("homeDesc"),
      siteName: "fujiseat",
      images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://fujiseat.com"}/og-home.png`, width: 1200, height: 630 }],
    },
    other: {
      "agd-partner-manual-verification": "",
    },
  };
}

export default function HomePage() {
  return <HomeClient />;
}
