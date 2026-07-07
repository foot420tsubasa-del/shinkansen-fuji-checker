import type { Metadata } from "next";
import { ArrowRight, Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { buttonClassName } from "@/components/ui/Button";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { getAlternates } from "@/i18n/hreflang";
import { tokyoStayAreasBase } from "@/data/stay-area/tokyo-areas.base";
import scoresJson from "@/data/generated/tokyo-stay-area-scores.json";
import type { StayAreaBase, StayAreaScoresFile } from "@/lib/stay-area/types";

const SUPPORTED_SLUGS = tokyoStayAreasBase.map((area) => area.id);

const PAGE_PATH = "/areas-to-stay/tokyo-hotels";

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

/**
 * Six headline Tokyo hotel areas — the commercial spine of the page. Each
 * links straight to its existing /areas-to-stay/tokyo-hotels/<slug> detail
 * page (the revenue surface where Booking.com + Trip.com live). labelKey
 * resolves to tokyoHotelsPage.index.lp.popular.<key>.
 */
const POPULAR_AREAS: ReadonlyArray<{ slug: string; labelKey: string }> = [
  { slug: "tokyo-station", labelKey: "tokyoStation" },
  { slug: "shinjuku", labelKey: "shinjuku" },
  { slug: "ueno", labelKey: "ueno" },
  { slug: "asakusa", labelKey: "asakusa" },
  { slug: "ginza-yurakucho", labelKey: "ginzaYurakucho" },
  { slug: "shinagawa", labelKey: "shinagawa" },
];

/**
 * "Choose by situation" — intent-based entry points. These intentionally
 * mix dedicated detail pages, existing stay guides, and the Finder so the
 * user lands on the most relevant surface for their situation. All hrefs
 * are existing routes; no new URLs are created.
 */
const SITUATION_CARDS: ReadonlyArray<{ href: string; labelKey: string }> = [
  { href: "/areas-to-stay/tokyo-first-time", labelKey: "firstTime" },
  { href: "/areas-to-stay/where-to-stay-before-shinkansen", labelKey: "beforeShinkansen" },
  { href: "/areas-to-stay/tokyo-stay-area-index?area=ueno#selected-area", labelKey: "fromNarita" },
  { href: "/areas-to-stay/tokyo-stay-area-index?area=shinagawa#selected-area", labelKey: "fromHaneda" },
  { href: "/areas-to-stay/tokyo-stay-area-index", labelKey: "familyLuggage" },
  { href: "/areas-to-stay/tokyo-stay-area-index", labelKey: "hateCrowds" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tokyoHotelsPage.index" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(PAGE_PATH, locale),
    openGraph: {
      title: t("lp.h1"),
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

        {/* ---------- Commercial LP hero ---------- */}
        <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">
            {t("index.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {t("index.lp.h1")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            {t("index.lp.lead")}
          </p>
        </section>

        {/* ---------- A. Popular Tokyo hotel areas ---------- */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-950 md:text-2xl">
            {t("index.lp.popularHeading")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_AREAS.map(({ slug, labelKey }) => {
              const area = areaFor(slug);
              if (!area) return null;
              const score = overallScoreFor(slug);
              const href = `/areas-to-stay/tokyo-stay-area-index?area=${slug}#selected-area`;
              return (
                <TrackedInternalLink
                  key={slug}
                  href={href}
                  sourcePage={PAGE_PATH}
                  placement="tokyo_hotels_index_popular_card"
                  label={area.displayName}
                  locale={locale}
                  className="group flex min-h-[150px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#2E7D5B] hover:bg-emerald-50"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-950">{area.displayName}</h3>
                      {score != null ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#D94A32] px-2.5 py-1 text-xs font-bold text-white">
                          {score}
                          <span className="text-[10px] opacity-80">{t("hero.fitBadgeOutOf")}</span>
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-5 text-slate-600">
                      {t(`index.lp.popular.${labelKey}`)}
                    </p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#246449]">
                    {t("index.lp.seeHotels")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </TrackedInternalLink>
              );
            })}
          </div>
        </section>

        {/* ---------- B. Choose by situation ---------- */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-950 md:text-2xl">
            {t("index.lp.situationHeading")}
          </h2>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {SITUATION_CARDS.map(({ href, labelKey }) => (
              <TrackedInternalLink
                key={labelKey}
                href={href}
                sourcePage={PAGE_PATH}
                placement="tokyo_hotels_index_situation_card"
                label={t(`index.lp.situation.${labelKey}`)}
                locale={locale}
                className="inline-flex min-h-[52px] items-center justify-between gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-[#2E7D5B] hover:bg-emerald-50"
              >
                <span>{t(`index.lp.situation.${labelKey}`)}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              </TrackedInternalLink>
            ))}
          </div>
        </section>

        {/* ---------- C. Finder helper (secondary) ---------- */}
        <section className="mt-8 rounded-2xl border border-[#d9e5f2] bg-[linear-gradient(135deg,#f8fcff,#fff)] p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[#145aa0]">
                <Compass className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm leading-6 text-slate-700">{t("index.lp.finderHelperText")}</p>
            </div>
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-stay-area-index"
              sourcePage={PAGE_PATH}
              placement="tokyo_hotels_index_finder_helper"
              label={t("index.lp.finderHelperCta")}
              locale={locale}
              className={`${buttonClassName({ variant: "hotelOutline", size: "md" })} shrink-0`}
            >
              {t("index.lp.finderHelperCta")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </TrackedInternalLink>
          </div>
        </section>

        {/* ---------- All 36 area pages (existing grid, reframed) ---------- */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-slate-950 md:text-2xl">
            {t("index.lp.allAreasHeading")}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {t("index.lp.allAreasDescription")}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {SUPPORTED_SLUGS.map((slug) => {
              const area = areaFor(slug);
              if (!area) return null;
              const score = overallScoreFor(slug);
              const href = `/areas-to-stay/tokyo-stay-area-index?area=${slug}#selected-area`;
              return (
                <TrackedInternalLink
                  key={slug}
                  href={href}
                  sourcePage={PAGE_PATH}
                  placement="tokyo_hotels_index_card"
                  label={area.displayName}
                  locale={locale}
                  className="group flex min-h-[160px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-[#2E7D5B] hover:bg-emerald-50"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">
                      {area.areaGroup}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">
                      {area.displayName}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-slate-600">
                      {area.editorial.overallLabel}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    {score != null ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#D94A32] px-3 py-1 text-xs font-bold text-white">
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
          </div>
        </section>

        <p className="mt-8 text-xs leading-5 text-slate-500">{t("legal.body")}</p>
      </Container>

      <SiteFooter />
    </main>
  );
}
