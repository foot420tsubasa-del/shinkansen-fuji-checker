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
      siteName: "fujiseat — Japan Rail Seats, Stays & Routes",
      images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://fujiseat.com"}/og-home.png`, width: 1200, height: 630 }],
    },
    other: {
      "agd-partner-manual-verification": "",
    },
  };
}

// §1: WebSite schema — the expanded site name for search engines, with the
// short brand kept as alternateName. Server-rendered as a plain <script>.
const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "fujiseat — Japan Rail Seats, Stays & Routes",
  alternateName: "fujiseat",
  url: "https://fujiseat.com",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <HomeClient />
    </>
  );
}
