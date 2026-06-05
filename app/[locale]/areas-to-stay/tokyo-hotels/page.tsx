import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { getAlternates } from "@/i18n/hreflang";
import { tokyoStayAreasBase } from "@/data/stay-area/tokyo-areas.base";
import scoresJson from "@/data/generated/tokyo-stay-area-scores.json";
import type { StayAreaBase, StayAreaScoresFile } from "@/lib/stay-area/types";

const SUPPORTED_SLUGS = [
  "asakusa",
  "ueno",
  "tokyo-station",
  "ginza-yurakucho",
  "nihombashi",
  "shinjuku",
  "shibuya",
  "hamamatsucho-daimon",
  "shinagawa",
  "kuramae",
] as const;

type Props = {
  params: Promise<{ locale: string }>;
};

const scoresFile = scoresJson as StayAreaScoresFile;

function areaFor(slug: string): StayAreaBase | undefined {
  return tokyoStayAreasBase.find((a) => a.id === slug);
}

function overallScoreFor(slug: string): number | null {
  return scoresFile.areas.find((s) => s.id === slug)?.overallScore ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tokyoHotelsPage.index" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/areas-to-stay/tokyo-hotels", locale),
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      siteName: "fujiseat",
    },
  };
}

export default async function TokyoHotelsIndexPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tokyoHotelsPage" });

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), href: "/" },
            { label: t("breadcrumb.areasToStay"), href: "/areas-to-stay" },
            { label: t("index.breadcrumb") },
          ]}
        />

        <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">
            {t("index.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {t("index.title")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            {t("index.intro")}
          </p>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-3">
          {SUPPORTED_SLUGS.map((slug) => {
            const area = areaFor(slug);
            if (!area) return null;
            const score = overallScoreFor(slug);
            const href = `/areas-to-stay/tokyo-hotels/${slug}`;
            return (
              <TrackedInternalLink
                key={slug}
                href={href}
                sourcePage="/areas-to-stay/tokyo-hotels"
                placement="tokyo_hotels_index_card"
                label={area.displayName}
                locale={locale}
                className="group flex min-h-[160px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#168a56] hover:bg-emerald-50"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">
                    {area.areaGroup}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-950">
                    {area.displayName}
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {area.editorial.overallLabel}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  {score != null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#ff7a00] px-3 py-1 text-xs font-bold text-white">
                      {t("hero.fitBadgeLabel")} {score}
                      <span className="text-[10px] opacity-80">{t("hero.fitBadgeOutOf")}</span>
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#106b43]">
                    {t("index.cardOpenLabel")}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </TrackedInternalLink>
            );
          })}
        </section>

        <p className="mt-6">
          <TrackedInternalLink
            href="/areas-to-stay/tokyo-stay-area-index"
            sourcePage="/areas-to-stay/tokyo-hotels"
            placement="tokyo_hotels_index_back_to_finder"
            label={t("index.finderLinkLabel")}
            locale={locale}
            className="text-sm font-semibold text-slate-600 underline underline-offset-4 transition-colors hover:text-[#106b43]"
          >
            {t("index.finderLinkLabel")}
          </TrackedInternalLink>
        </p>

        <p className="mt-6 text-xs leading-5 text-slate-500">{t("legal.body")}</p>
      </Container>

      <SiteFooter />
    </main>
  );
}
