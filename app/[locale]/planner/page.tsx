import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { PlannerClient } from "./PlannerClient";
import { getAlternates } from "@/i18n/hreflang";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "planner.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "fujiseat",
      images: [{ url: "https://fujiseat.com/og-planner.png", width: 1200, height: 630 }],
    },
    alternates: getAlternates("/planner", locale),
  };
}

export default function PlannerPage() {
  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-6 md:py-10">
        <PlannerClient />
      </Container>
    </main>
  );
}
