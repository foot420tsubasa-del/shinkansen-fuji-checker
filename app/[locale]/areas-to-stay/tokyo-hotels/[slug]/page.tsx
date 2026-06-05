import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { ProviderButton, type ProviderId } from "@/components/ui/ProviderButton";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { getAlternates } from "@/i18n/hreflang";
import { tokyoStayAreasBase } from "@/data/stay-area/tokyo-areas.base";
import scoresJson from "@/data/generated/tokyo-stay-area-scores.json";
import {
  getHotelProviderLinks,
  type HotelAffiliatePlacement,
} from "@/lib/hotel-affiliate-links";
import {
  getHotelLink,
  getTripHotelConfig,
  type HotelAreaKey,
} from "@/lib/hotel-links";
import type {
  ComputedStayAreaScore,
  StayAreaBase,
  StayAreaScoresFile,
} from "@/lib/stay-area/types";

/*
 * Phase 1 pilot: per-area Tokyo hotel-search landing pages.
 *
 *   /areas-to-stay/tokyo-hotels/asakusa
 *   /areas-to-stay/tokyo-hotels/ueno
 *   /areas-to-stay/tokyo-hotels/tokyo-station
 *
 * Server component. Content is generated from existing data
 * (tokyo-areas.base.json + tokyo-stay-area-scores.json + accessProfiles)
 * so the page works in any locale without per-locale editorial copy.
 * Structural strings come from messages.tokyoHotelsPage (duplicated EN copy
 * across all 9 locales; non-EN locales are noindex below).
 */

const PILOT_SLUGS = ["asakusa", "ueno", "tokyo-station"] as const;
type PilotSlug = (typeof PILOT_SLUGS)[number];

const hotelAreaKeyByPilot: Record<PilotSlug, HotelAreaKey> = {
  asakusa: "asakusa",
  ueno: "ueno",
  "tokyo-station": "tokyoStation",
};

/** sub_id suffixes per placement, per pilot. Booking sub_ids come from
 *  data/hotel-affiliate-links.json; Trip sub_ids are passed inline here so
 *  the click event carries `sub_id` as a stable identifier. */
const tripSubIdByPilot: Record<PilotSlug, { hero: string; bottom: string }> = {
  asakusa: {
    hero: "fs_hotels_asakusa_hero_trip",
    bottom: "fs_hotels_asakusa_bottom_trip",
  },
  ueno: {
    hero: "fs_hotels_ueno_hero_trip",
    bottom: "fs_hotels_ueno_bottom_trip",
  },
  "tokyo-station": {
    hero: "fs_hotels_tokyo_station_hero_trip",
    bottom: "fs_hotels_tokyo_station_bottom_trip",
  },
};

type NearbyAlternative = { targetSlug: string; reason: string };

const nearbyByPilot: Record<PilotSlug, NearbyAlternative[]> = {
  asakusa: [
    { targetSlug: "ueno", reason: "Better for museums and transport" },
    { targetSlug: "kuramae", reason: "Quieter local-feeling base" },
    { targetSlug: "tokyo-station", reason: "Better for Shinkansen access" },
  ],
  ueno: [
    { targetSlug: "asakusa", reason: "More traditional Tokyo atmosphere" },
    { targetSlug: "tokyo-station", reason: "Better for Shinkansen access" },
    { targetSlug: "akihabara", reason: "Better for electronics and central train access" },
  ],
  "tokyo-station": [
    { targetSlug: "ginza-yurakucho", reason: "Better for shopping and dining" },
    { targetSlug: "nihombashi", reason: "Calmer central base" },
    { targetSlug: "ueno", reason: "Better for museums and value" },
  ],
};

/** Map area id → display name so the nearby cards show a friendly label
 *  even for non-pilot targets (which link to the Finder query param). */
function areaDisplayName(id: string): string {
  const area = tokyoStayAreasBase.find((a) => a.id === id);
  return area?.displayName ?? id;
}

/**
 * Returns a search-friendly variant of the display name that does NOT
 * duplicate the word "Station" when the display name already contains it.
 *
 *   "Asakusa"                  → "Asakusa Station"
 *   "Tokyo Station / Marunouchi" → "Tokyo Station / Marunouchi"
 *
 * Used in the SEO `<title>` and the bottom-CTA body to keep both reading
 * naturally without breaking the "Hotels near X Station" SEO pattern for
 * areas whose display name is just a place name.
 */
function areaWithStationSuffix(displayName: string): string {
  return /\bStation\b/i.test(displayName) ? displayName : `${displayName} Station`;
}

function nearbyHref(targetSlug: string): string {
  if ((PILOT_SLUGS as readonly string[]).includes(targetSlug)) {
    return `/areas-to-stay/tokyo-hotels/${targetSlug}`;
  }
  // Phase 1: non-pilot targets land on the Finder with the area pre-selected.
  return `/areas-to-stay/tokyo-stay-area-index?area=${encodeURIComponent(targetSlug)}`;
}

// ---------- score → label helpers (UI-only, no methodology terms) -----------

type ScoreTone = "very-good" | "good" | "mixed" | "check";

function scoreTone(value: number): ScoreTone {
  if (value >= 85) return "very-good";
  if (value >= 70) return "good";
  if (value >= 55) return "mixed";
  return "check";
}

function scoreToneClass(tone: ScoreTone): string {
  switch (tone) {
    case "very-good":
      return "border-emerald-200 bg-emerald-50 text-[#106b43]";
    case "good":
      return "border-emerald-100 bg-emerald-50/60 text-[#106b43]";
    case "mixed":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "check":
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}

function lodgingDensityKey(level: StayAreaBase["lodgingDensityLevel"]): "veryHigh" | "high" | "medium" | "low" {
  if (level === "Very High") return "veryHigh";
  if (level === "High") return "high";
  if (level === "Medium") return "medium";
  return "low";
}

function lodgingDensityTone(level: StayAreaBase["lodgingDensityLevel"]): ScoreTone {
  if (level === "Very High" || level === "High") return "very-good";
  if (level === "Medium") return "mixed";
  return "check";
}

// ---------- types + props ---------------------------------------------------

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

type Translation = Awaited<ReturnType<typeof getTranslations>>;

const scoresFile = scoresJson as StayAreaScoresFile;

function resolvePilot(slug: string): PilotSlug | null {
  return (PILOT_SLUGS as readonly string[]).includes(slug) ? (slug as PilotSlug) : null;
}

function areaForPilot(slug: PilotSlug): StayAreaBase {
  const area = tokyoStayAreasBase.find((a) => a.id === slug);
  if (!area) throw new Error(`Missing Tokyo stay area base data for ${slug}`);
  return area;
}

function scoreForPilot(slug: PilotSlug): ComputedStayAreaScore {
  const score = scoresFile.areas.find((s) => s.id === slug);
  if (!score) throw new Error(`Missing computed stay-area score for ${slug}`);
  return score;
}

// ---------- metadata + static params ---------------------------------------

export function generateStaticParams() {
  return PILOT_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const pilot = resolvePilot(slug);
  if (!pilot) return {};
  const area = areaForPilot(pilot);
  const t = await getTranslations({ locale, namespace: "tokyoHotelsPage.meta" });
  const path = `/areas-to-stay/tokyo-hotels/${pilot}`;
  const areaWithStation = areaWithStationSuffix(area.displayName);
  const title = t("titleTemplate", { area: area.displayName, areaWithStation });
  const description = t("descriptionTemplate", { area: area.displayName, areaWithStation });
  return {
    title,
    description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(path, locale),
    openGraph: {
      title,
      description,
      siteName: t("ogSiteName"),
    },
  };
}

// ---------- hotel provider link assembly ------------------------------------

type ProviderLink = {
  provider: ProviderId;
  href: string;
  trackingHref: string;
  label: string;
  linkId: string;
  subId?: string;
  priority: number;
};

function assembleProviderLinks(
  pilot: PilotSlug,
  locale: string,
  placement: HotelAffiliatePlacement,
  t: Translation,
): ProviderLink[] {
  const bookingLinks = getHotelProviderLinks({
    areaId: pilot,
    locale,
    placement,
  }).map<ProviderLink>((link) => ({
    provider: link.provider,
    href: link.href,
    trackingHref: link.trackingHref,
    label: t("hero.bookingButton"),
    linkId: link.linkId,
    subId: link.subId,
    priority: link.priority,
  }));

  const hotelAreaKey = hotelAreaKeyByPilot[pilot];
  const hotel = getHotelLink(hotelAreaKey);
  const config = getTripHotelConfig(hotelAreaKey);
  const tripHref = hotel.provider === "trip" ? hotel.href : config.tripUrl.trim();
  const tripTrackingHref = hotel.provider === "trip" ? hotel.trackingHref : config.tripUrl.trim();
  const tripSubIdSlot = placement === "tokyo_hotels_hero" ? "hero" : "bottom";
  const tripSubId = tripSubIdByPilot[pilot][tripSubIdSlot];

  const tripLink: ProviderLink | null =
    tripHref && tripHref !== "#"
      ? {
          provider: "trip",
          href: tripHref,
          trackingHref: tripTrackingHref,
          label: t("hero.tripButton"),
          linkId: `hotelArea.${hotelAreaKey}.trip`,
          subId: tripSubId,
          priority: 20,
        }
      : null;

  return [...bookingLinks, ...(tripLink ? [tripLink] : [])].sort(
    (a, b) => a.priority - b.priority || a.linkId.localeCompare(b.linkId),
  );
}

// ---------- presentational helpers ------------------------------------------

function FitBadge({ score, label, outOf }: { score: number; label: string; outOf: string }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl bg-[#ff7a00] px-4 py-3 text-white shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-90">{label}</span>
      <span className="text-2xl font-black leading-none">
        {score}
        <span className="text-xs font-bold opacity-90">{outOf}</span>
      </span>
    </div>
  );
}

function ScoreCard({
  title,
  toneLabel,
  tone,
  hint,
}: {
  title: string;
  toneLabel: string;
  tone: ScoreTone;
  hint?: string;
}) {
  return (
    <div className={["rounded-2xl border p-4 shadow-sm", scoreToneClass(tone)].join(" ")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] opacity-80">{title}</p>
      <p className="mt-1 text-sm font-bold">{toneLabel}</p>
      {hint ? <p className="mt-1 text-[11px] leading-4 opacity-80">{hint}</p> : null}
    </div>
  );
}

function AccessRow({
  title,
  level,
  note,
}: {
  title: string;
  level?: string;
  note?: string;
}) {
  if (!note) return null;
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{title}</p>
        {level ? (
          <span className="rounded-full border border-emerald-100 bg-white px-2 py-0.5 text-[10px] font-semibold text-[#106b43]">
            {level}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-700">{note}</p>
    </div>
  );
}

// ---------- page ------------------------------------------------------------

export default async function TokyoHotelsAreaPage({ params }: Props) {
  const { locale, slug } = await params;
  const pilot = resolvePilot(slug);
  if (!pilot) notFound();

  const area = areaForPilot(pilot);
  const score = scoreForPilot(pilot);
  const t = await getTranslations({ locale, namespace: "tokyoHotelsPage" });
  const pagePath = `/areas-to-stay/tokyo-hotels/${pilot}`;

  // Cross-namespace lookup for the per-area station route disambiguation note.
  const tStationNote = await getTranslations({
    locale,
    namespace: "tokyoStayAreaIndex.stationRouteNote.areas",
  });
  let stationNote: string | null = null;
  try {
    stationNote = tStationNote(pilot);
  } catch {
    stationNote = null;
  }

  // ----- score-card toneLabels (translated)
  const scoreLabel = (n: number): string => {
    const tone = scoreTone(n);
    if (tone === "very-good") return t("scoreLabels.veryGood");
    if (tone === "good") return t("scoreLabels.good");
    if (tone === "mixed") return t("scoreLabels.mixed");
    return t("scoreLabels.checkCarefully");
  };

  const quietAtNightScore = score.scores.crowdStress;
  // Surface the street-luggage-stress note as a hint on the existing
  // Luggage friendly card *only* when the editorial level is high or
  // very_high — keeps the card minimal for calm/medium areas.
  const elevatedStreetStress =
    area.streetLuggageStressLevel === "high" ||
    area.streetLuggageStressLevel === "very_high";
  const luggageHint = elevatedStreetStress ? area.streetLuggageStressNote : undefined;
  const fitScoreCards: Array<{ titleKey: string; value: number; hint?: string }> = [
    { titleKey: "scoreCards.airportAccess", value: score.scores.airportAccess },
    { titleKey: "scoreCards.luggageFriendly", value: score.scores.luggageFriendly, hint: luggageHint },
    { titleKey: "scoreCards.quietAtNight", value: quietAtNightScore },
    { titleKey: "scoreCards.shinkansenDayFit", value: score.scores.shinkansenAccess },
  ];

  const lodgingKey = lodgingDensityKey(area.lodgingDensityLevel);
  const lodgingLabel = t(`lodgingDensity.${lodgingKey}`);
  const lodgingTone = lodgingDensityTone(area.lodgingDensityLevel);

  // SEO + bottom-CTA-friendly variant: "{area} Station" unless the display
  // name already contains "Station" (e.g. "Tokyo Station / Marunouchi").
  const areaWithStation = areaWithStationSuffix(area.displayName);

  // ----- hero + bottom CTAs
  const heroLinks = assembleProviderLinks(pilot, locale, "tokyo_hotels_hero", t);
  const bottomLinks = assembleProviderLinks(pilot, locale, "tokyo_hotels_bottom", t);

  // ----- best-for / watch-out / before-you-book content
  const bestFor = area.editorial.bestFor.slice(0, 3);
  const whoFor = area.editorial.bestFor.slice(0, 3);
  // Cap Before-you-book at 3 cards. Preferred order:
  //   1) first editorial watch-out
  //   2) walking-distance / station-entrance caution (always)
  //   3) station-route disambiguation note OR second editorial watch-out
  const watchOut = area.editorial.watchOut;
  const beforeYouBookItems: string[] = [];
  if (watchOut[0]) beforeYouBookItems.push(watchOut[0]);
  beforeYouBookItems.push(
    t("beforeBook.walkingDistanceCaution", { area: area.displayName }),
  );
  if (stationNote) {
    beforeYouBookItems.push(stationNote);
  } else if (watchOut[1]) {
    beforeYouBookItems.push(watchOut[1]);
  }

  // ----- access notes
  const accessRows: Array<{ title: string; level?: string; note?: string }> = [
    {
      title: t("access.narita"),
      level: area.accessProfiles.narita?.level,
      note: area.accessProfiles.narita?.note,
    },
    {
      title: t("access.haneda"),
      level: area.accessProfiles.haneda?.level,
      note: area.accessProfiles.haneda?.note,
    },
    {
      title: t("access.airportEase"),
      level: area.accessProfiles.airportArrivalEase?.level,
      note: area.accessProfiles.airportArrivalEase?.note,
    },
    {
      title: t("access.shinkansen"),
      level: area.accessProfiles.shinkansen?.level,
      note: area.accessProfiles.shinkansen?.note,
    },
    {
      title: t("access.tokyoStationAccess"),
      level: area.accessProfiles.tokyoStationAccess?.level,
      note: area.accessProfiles.tokyoStationAccess?.note,
    },
  ];

  const nearbyAlternatives = nearbyByPilot[pilot];

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: t("breadcrumb.home"), href: "/" },
            { label: t("breadcrumb.areasToStay"), href: "/areas-to-stay" },
            { label: t("breadcrumb.category"), href: "/areas-to-stay/tokyo-hotels" },
            { label: area.displayName },
          ]}
        />

        {/* A. Hero */}
        <section className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {t("hero.titleTemplate", { area: area.displayName, areaWithStation })}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            {t("hero.introTemplate", { area: area.displayName })}
          </p>

          <div className="mt-5">
            <FitBadge
              score={score.overallScore}
              label={t("hero.fitBadgeLabel")}
              outOf={t("hero.fitBadgeOutOf")}
            />
            <p className="mt-2 text-[11px] leading-4 text-slate-500">
              {t("hero.confidencePrefix")}: {score.confidence.label} ·{" "}
              {t("hero.freshnessPrefix")}: {score.sourceFreshness.label}
            </p>
          </div>

          {heroLinks.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:max-w-xl">
              {heroLinks.map((link) => (
                <ProviderButton
                  key={`hero-${link.linkId}`}
                  provider={link.provider}
                  href={link.href}
                  trackingHref={link.trackingHref}
                  placement="tokyo_hotels_hero"
                  pagePath={pagePath}
                  locale={locale}
                  linkId={link.linkId}
                  subId={link.subId}
                  category="hotel"
                  product="hotel_area_search"
                  area={area.displayName}
                  areaId={area.id}
                  city="Tokyo"
                  fullWidth
                >
                  {link.label}
                </ProviderButton>
              ))}
            </div>
          ) : null}

          <p className="mt-3 text-xs leading-5 text-slate-500">{t("hero.trustNote")}</p>
        </section>

        {/* C. At-a-glance */}
        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
            {t("glance.eyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{t("glance.title")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            {area.editorial.overallLabel}
          </p>
          {bestFor.length > 0 ? (
            <>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {t("glance.bestForTitle")}
              </p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-3">
                {bestFor.map((item) => (
                  <li
                    key={item}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs leading-5 text-[#106b43]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>

        {/* D. Quick fit score cards */}
        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
            {t("scoreCards.eyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{t("scoreCards.title")}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {fitScoreCards.map(({ titleKey, value, hint }) => (
              <ScoreCard
                key={titleKey}
                title={t(titleKey)}
                toneLabel={scoreLabel(value)}
                tone={scoreTone(value)}
                hint={hint}
              />
            ))}
            <ScoreCard
              title={t("scoreCards.hotelChoice")}
              toneLabel={lodgingLabel}
              tone={lodgingTone}
            />
          </div>
        </section>

        {/* E. Who this area is for */}
        {whoFor.length > 0 ? (
          <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
              {t("whoFor.eyebrow")}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{t("whoFor.title")}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {whoFor.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm leading-6 text-[#106b43]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* F. Before you book */}
        <section className="mt-6 rounded-[22px] border border-amber-100 bg-amber-50/40 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-800">
            {t("beforeBook.eyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{t("beforeBook.title")}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {beforeYouBookItems.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-amber-100 bg-white p-3 text-xs leading-5 text-amber-900"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* G. Access notes */}
        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
            {t("access.eyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{t("access.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {accessRows.map((row) => (
              <AccessRow key={row.title} title={row.title} level={row.level} note={row.note} />
            ))}
          </div>
        </section>

        {/* H. Nearby alternatives */}
        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
            {t("nearby.eyebrow")}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{t("nearby.title")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t("nearby.intro")}</p>
          <div className="mt-4 grid gap-3">
            {nearbyAlternatives.map((alt) => {
              const href = nearbyHref(alt.targetSlug);
              const name = areaDisplayName(alt.targetSlug);
              const isPilotTarget = (PILOT_SLUGS as readonly string[]).includes(alt.targetSlug);
              return isPilotTarget ? (
                <TrackedInternalLink
                  key={alt.targetSlug}
                  href={href}
                  sourcePage={pagePath}
                  placement="tokyo_hotels_nearby"
                  label={`Nearby: ${name}`}
                  locale={locale}
                  className="group flex min-h-[100px] flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm transition-colors hover:border-[#168a56] hover:bg-emerald-50"
                >
                  <span className="text-sm font-semibold text-slate-950">{name}</span>
                  <span className="mt-2 text-xs leading-5 text-slate-600">{alt.reason}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#106b43]">
                    →
                  </span>
                </TrackedInternalLink>
              ) : (
                <TrackedInternalLink
                  key={alt.targetSlug}
                  href={href}
                  sourcePage={pagePath}
                  placement="tokyo_hotels_nearby"
                  label={`Nearby: ${name}`}
                  locale={locale}
                  className="block border-b border-slate-100 py-2 text-sm text-slate-600 underline underline-offset-4 transition-colors last:border-b-0 hover:text-[#106b43]"
                >
                  <span className="font-semibold text-slate-700">{name}</span>
                  <span className="ml-2 text-xs text-slate-500">{alt.reason}</span>
                </TrackedInternalLink>
              );
            })}
          </div>
        </section>

        {/* I. Bottom CTA */}
        <section className="mt-6 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("bottomCta.title")}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            {t("bottomCta.bodyTemplate", { area: area.displayName, areaWithStation })}
          </p>
          {bottomLinks.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:max-w-xl">
              {bottomLinks.map((link) => (
                <ProviderButton
                  key={`bottom-${link.linkId}`}
                  provider={link.provider}
                  href={link.href}
                  trackingHref={link.trackingHref}
                  placement="tokyo_hotels_bottom"
                  pagePath={pagePath}
                  locale={locale}
                  linkId={link.linkId}
                  subId={link.subId}
                  category="hotel"
                  product="hotel_area_search"
                  area={area.displayName}
                  areaId={area.id}
                  city="Tokyo"
                  fullWidth
                >
                  {link.label}
                </ProviderButton>
              ))}
            </div>
          ) : null}
          <p className="mt-4">
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-stay-area-index"
              sourcePage={pagePath}
              placement="tokyo_hotels_back_to_finder"
              label={t("bottomCta.backLink")}
              locale={locale}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#106b43] underline underline-offset-4 hover:no-underline"
            >
              {t("bottomCta.backLink")}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </TrackedInternalLink>
          </p>
        </section>

        {/* J. Legal */}
        <p className="mt-6 text-xs leading-5 text-slate-500">{t("legal.body")}</p>
      </Container>

      <SiteFooter />
    </main>
  );
}
