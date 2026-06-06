import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import type { ProviderId } from "@/components/ui/ProviderButton";
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
import { AreaHeroSummary } from "../_components/AreaHeroSummary";
import { AreaPrimaryScoreGraph } from "../_components/AreaPrimaryScoreGraph";
import {
  AreaDetailedScoreBreakdown,
  type ScoreBreakdownGroup,
} from "../_components/AreaDetailedScoreBreakdown";
import {
  AreaFeatureHighlights,
  type FeatureHighlight,
  type FeatureIconKey,
} from "../_components/AreaFeatureHighlights";
import { AreaFitProfile } from "../_components/AreaFitProfile";
import { AreaAccessSnapshot, type AccessNode } from "../_components/AreaAccessSnapshot";
import {
  AreaConnectionCommandMap,
  type AreaConnectionCommandNode,
} from "../_components/AreaConnectionCommandMap";
import {
  AreaNearbyComparison,
  type ComparisonRow,
} from "../_components/AreaNearbyComparison";
import { AreaBottomCta } from "../_components/AreaBottomCta";
import type { AreaProviderLink } from "../_components/types";
import { getAreaVisualAssets } from "@/lib/hotel-area-visuals";

/*
 * Server component. Visual area-hotel-page template. Content is generated
 * from existing data — tokyo-areas.base.json (editorial + accessProfiles) +
 * tokyo-stay-area-scores.json (computed scores). Structural strings come
 * from messages.tokyoHotelsPage; English copy is duplicated across all 9
 * locales (non-EN are noindex per the existing convention).
 */

const SUPPORTED_SLUGS = tokyoStayAreasBase.map((area) => area.id);
type SupportedSlug = string;

/**
 * Slugs that have a verified Trip.com per-area URL in lib/hotel-links.ts.
 * Areas absent from this map will render Booking-only — by design.
 */
const hotelAreaKeyBySlug: Partial<Record<SupportedSlug, HotelAreaKey>> = {
  oshiage: "oshiage",
  asakusa: "asakusa",
  ueno: "ueno",
  "tokyo-station": "tokyoStation",
  shinjuku: "shinjuku",
  shibuya: "shibuya",
};

/** sub_id suffixes per placement, per Trip-enabled area. */
const tripSubIdBySlug: Partial<Record<SupportedSlug, { hero: string; bottom: string }>> = {
  oshiage: {
    hero: "fs_hotels_oshiage_hero_trip",
    bottom: "fs_hotels_oshiage_bottom_trip",
  },
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
  shinjuku: {
    hero: "fs_hotels_shinjuku_hero_trip",
    bottom: "fs_hotels_shinjuku_bottom_trip",
  },
  shibuya: {
    hero: "fs_hotels_shibuya_hero_trip",
    bottom: "fs_hotels_shibuya_bottom_trip",
  },
};

const stationRouteNoteAreaIds = new Set([
  "asakusa",
  "oshiage",
  "kuramae",
  "kiyosumi-shirakawa",
  "roppongi",
  "shinjuku",
  "shibuya",
  "tokyo-station",
  "ueno",
  "ginza-yurakucho",
  "hamamatsucho-daimon",
  "shinagawa",
  "ikebukuro",
  "akihabara",
  "nihombashi",
]);

type NearbyAlternative = { targetSlug: string; reason?: string };

/**
 * Hand-curated nearby pairs for areas where editorial nuance matters.
 * Other areas fall back to `defaultNearbyAlternatives()` (same areaGroup).
 */
const nearbyBySlug: Partial<Record<SupportedSlug, NearbyAlternative[]>> = {
  asakusa: [
    { targetSlug: "ueno", reason: "Better for museums and transport" },
    { targetSlug: "kuramae", reason: "Quieter local-feeling base" },
    { targetSlug: "tokyo-station", reason: "Better for Shinkansen access" },
  ],
  ueno: [
    { targetSlug: "asakusa", reason: "More traditional Tokyo atmosphere" },
    { targetSlug: "tokyo-station", reason: "Better for Shinkansen access" },
    { targetSlug: "akihabara", reason: "Better for electronics and central rail" },
  ],
  "tokyo-station": [
    { targetSlug: "ginza-yurakucho", reason: "Better for shopping and dining" },
    { targetSlug: "nihombashi", reason: "Calmer central base" },
    { targetSlug: "ueno", reason: "Better for museums and value" },
  ],
  oshiage: [
    { targetSlug: "asakusa", reason: "More traditional Tokyo atmosphere" },
    { targetSlug: "kuramae", reason: "Quieter East Tokyo base" },
    { targetSlug: "ueno", reason: "Stronger rail and museums" },
  ],
  kuramae: [
    { targetSlug: "asakusa", reason: "More classic sightseeing" },
    { targetSlug: "ueno", reason: "Better rail coverage" },
    { targetSlug: "oshiage", reason: "Stronger airport and Skytree logic" },
  ],
  shinjuku: [
    { targetSlug: "shibuya", reason: "Another big-city nightlife base" },
    { targetSlug: "ueno", reason: "More practical Narita-side base" },
    { targetSlug: "tokyo-station", reason: "Simpler for early Shinkansen" },
  ],
  shibuya: [
    { targetSlug: "shinjuku", reason: "More hotel choice and rail coverage" },
    { targetSlug: "shinagawa", reason: "Better for Haneda and Shinkansen" },
    { targetSlug: "ginza-yurakucho", reason: "More polished central base" },
  ],
  shinagawa: [
    { targetSlug: "hamamatsucho-daimon", reason: "More direct Tokyo Monorail logic" },
    { targetSlug: "shibuya", reason: "More nightlife and youth-Tokyo energy" },
    { targetSlug: "tokyo-station", reason: "More central Shinkansen departure point" },
  ],
  ikebukuro: [
    { targetSlug: "shinjuku", reason: "Bigger transit hub with more choice" },
    { targetSlug: "ueno", reason: "Better Narita-side logistics" },
    { targetSlug: "korakuen-kasuga", reason: "Calmer Bunkyo-side base" },
  ],
  "ariake-odaiba": [
    { targetSlug: "toyosu", reason: "Closer bay-side base with strong rail" },
    { targetSlug: "shinagawa", reason: "Better for Haneda and Shinkansen" },
    { targetSlug: "tokyo-station", reason: "Better for central sightseeing" },
  ],
};

// ---------- pure helpers ----------------------------------------------------

function areaDisplayName(id: string): string {
  const area = tokyoStayAreasBase.find((a) => a.id === id);
  return area?.displayName ?? id;
}

function areaWithStationSuffix(displayName: string): string {
  return /\bStation\b/i.test(displayName) ? displayName : `${displayName} Station`;
}

function nearbyHref(targetSlug: string): string {
  if ((SUPPORTED_SLUGS as readonly string[]).includes(targetSlug)) {
    return `/areas-to-stay/tokyo-hotels/${targetSlug}`;
  }
  return `/areas-to-stay/tokyo-stay-area-index?area=${encodeURIComponent(targetSlug)}`;
}

const scoresFile = scoresJson as StayAreaScoresFile;

function resolveSupportedSlug(slug: string): SupportedSlug | null {
  return (SUPPORTED_SLUGS as readonly string[]).includes(slug) ? slug : null;
}

function areaForSlug(slug: SupportedSlug): StayAreaBase {
  const area = tokyoStayAreasBase.find((a) => a.id === slug);
  if (!area) throw new Error(`Missing Tokyo stay area base data for ${slug}`);
  return area;
}

function scoreForSlug(slug: SupportedSlug): ComputedStayAreaScore {
  const score = scoresFile.areas.find((s) => s.id === slug);
  if (!score) throw new Error(`Missing computed stay-area score for ${slug}`);
  return score;
}

function scoreLookup(slug: string): ComputedStayAreaScore | undefined {
  return scoresFile.areas.find((s) => s.id === slug);
}

function defaultNearbyAlternatives(slug: SupportedSlug): NearbyAlternative[] {
  const area = areaForSlug(slug);
  const sameGroup = tokyoStayAreasBase
    .filter((c) => c.id !== slug && c.areaGroup === area.areaGroup)
    .map((c) => ({
      targetSlug: c.id,
      reason: c.editorial.overallLabel,
      score: scoreLookup(c.id)?.overallScore ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
  const fallback = tokyoStayAreasBase
    .filter((c) => c.id !== slug && c.areaGroup !== area.areaGroup)
    .map((c) => ({
      targetSlug: c.id,
      reason: c.editorial.overallLabel,
      score: scoreLookup(c.id)?.overallScore ?? 0,
    }))
    .sort((a, b) => b.score - a.score);
  return [...sameGroup, ...fallback]
    .slice(0, 3)
    .map(({ targetSlug, reason }) => ({ targetSlug, reason }));
}

// ---------- feature derivation ----------------------------------------------

/**
 * Derive 4 "At a glance" features from existing area + score data. Order is
 * stable; if fewer than 4 trigger, top up with a balanced fallback. No
 * hardcoded per-slug copy — content comes from message templates filled with
 * the area display name + level data already on the area record.
 */
function deriveFeatures(
  area: StayAreaBase,
  score: ComputedStayAreaScore,
  t: Awaited<ReturnType<typeof getTranslations>>,
): FeatureHighlight[] {
  const candidates: Array<{ key: string; iconKey: FeatureIconKey; score: number; title: string; body: string }> = [];

  if (score.scores.airportAccess >= 78) {
    candidates.push({
      key: "airport",
      iconKey: "airport",
      score: score.scores.airportAccess,
      title: t("featureLabels.airport.title"),
      body: t("featureLabels.airport.body"),
    });
  }
  if (score.scores.luggageFriendly >= 78) {
    candidates.push({
      key: "luggage",
      iconKey: "luggage",
      score: score.scores.luggageFriendly,
      title: t("featureLabels.luggage.title"),
      body: t("featureLabels.luggage.body"),
    });
  }
  if (score.scores.shinkansenAccess >= 80) {
    candidates.push({
      key: "shinkansen",
      iconKey: "trains",
      score: score.scores.shinkansenAccess,
      title: t("featureLabels.shinkansen.title"),
      body: t("featureLabels.shinkansen.body"),
    });
  }
  if (score.scores.stationSimplicity >= 78) {
    candidates.push({
      key: "station",
      iconKey: "station",
      score: score.scores.stationSimplicity,
      title: t("featureLabels.station.title"),
      body: t("featureLabels.station.body"),
    });
  }
  if (score.scores.localFeel >= 78) {
    candidates.push({
      key: "local",
      iconKey: "local",
      score: score.scores.localFeel,
      title: t("featureLabels.local.title"),
      body: t("featureLabels.local.body"),
    });
  }
  if (score.scores.crowdStress >= 75) {
    candidates.push({
      key: "quiet",
      iconKey: "quiet",
      score: score.scores.crowdStress,
      title: t("featureLabels.quiet.title"),
      body: t("featureLabels.quiet.body"),
    });
  }
  if (score.scores.touristAccess >= 80) {
    candidates.push({
      key: "sights",
      iconKey: "sights",
      score: score.scores.touristAccess,
      title: t("featureLabels.sights.title"),
      body: t("featureLabels.sights.body"),
    });
  }
  if (area.lodgingDensityLevel === "Very High" || area.lodgingDensityLevel === "High") {
    candidates.push({
      key: "hotels",
      iconKey: "hotels",
      score: 80,
      title: t("featureLabels.hotels.title"),
      body: t("featureLabels.hotels.body"),
    });
  }

  // Order by triggering score desc and take 4
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, 4);

  // If fewer than 4, top up with balanced fallbacks
  if (top.length < 4) {
    const used = new Set(top.map((f) => f.key));
    const fallbacks: typeof candidates = [
      { key: "balanced", iconKey: "group", score: 0, title: t("featureLabels.balanced.title"), body: t("featureLabels.balanced.body") },
      { key: "hotels", iconKey: "hotels", score: 0, title: t("featureLabels.hotels.title"), body: t("featureLabels.hotels.body") },
      { key: "sights", iconKey: "sights", score: 0, title: t("featureLabels.sights.title"), body: t("featureLabels.sights.body") },
      { key: "quiet", iconKey: "quiet", score: 0, title: t("featureLabels.quiet.title"), body: t("featureLabels.quiet.body") },
    ];
    for (const fb of fallbacks) {
      if (top.length >= 4) break;
      if (!used.has(fb.key)) {
        top.push(fb);
        used.add(fb.key);
      }
    }
  }

  return top.map(({ key, iconKey, title, body }) => ({ key, iconKey, title, body }));
}

// ---------- metadata + static params ---------------------------------------

export function generateStaticParams() {
  return SUPPORTED_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supportedSlug = resolveSupportedSlug(slug);
  if (!supportedSlug) return {};
  const area = areaForSlug(supportedSlug);
  const t = await getTranslations({ locale, namespace: "tokyoHotelsPage.meta" });
  const path = `/areas-to-stay/tokyo-hotels/${supportedSlug}`;
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

type Props = { params: Promise<{ locale: string; slug: string }> };
type Translation = Awaited<ReturnType<typeof getTranslations>>;

// ---------- hotel provider link assembly ------------------------------------

function assembleProviderLinks(
  slug: SupportedSlug,
  locale: string,
  placement: HotelAffiliatePlacement,
  t: Translation,
): AreaProviderLink[] {
  const bookingLinks: AreaProviderLink[] = getHotelProviderLinks({
    areaId: slug,
    locale,
    placement,
  }).map((link) => ({
    provider: link.provider,
    href: link.href,
    trackingHref: link.trackingHref,
    label: t("hero.bookingButton"),
    linkId: link.linkId,
    subId: link.subId,
    priority: link.priority,
  }));

  const hotelAreaKey = hotelAreaKeyBySlug[slug];
  const tripSubIds = tripSubIdBySlug[slug];
  let tripLink: AreaProviderLink | null = null;
  if (hotelAreaKey && tripSubIds) {
    const hotel = getHotelLink(hotelAreaKey);
    const config = getTripHotelConfig(hotelAreaKey);
    const tripHref = hotel.provider === "trip" ? hotel.href : config.tripUrl.trim();
    const tripTrackingHref = hotel.provider === "trip" ? hotel.trackingHref : config.tripUrl.trim();
    const slot = placement === "tokyo_hotels_hero" ? "hero" : "bottom";
    tripLink =
      tripHref && tripHref !== "#"
        ? {
            provider: "trip" as ProviderId,
            href: tripHref,
            trackingHref: tripTrackingHref,
            label: t("hero.tripButton"),
            linkId: `hotelArea.${hotelAreaKey}.trip`,
            subId: tripSubIds[slot],
            priority: 20,
          }
        : null;
  }

  return [...bookingLinks, ...(tripLink ? [tripLink] : [])].sort(
    (a, b) => a.priority - b.priority || a.linkId.localeCompare(b.linkId),
  );
}

// ---------- page ------------------------------------------------------------

export default async function TokyoHotelsAreaPage({ params }: Props) {
  const { locale, slug } = await params;
  const supportedSlug = resolveSupportedSlug(slug);
  if (!supportedSlug) notFound();

  const area = areaForSlug(supportedSlug);
  const score = scoreForSlug(supportedSlug);
  const t = await getTranslations({ locale, namespace: "tokyoHotelsPage" });
  const tStationRouteNote = await getTranslations({
    locale,
    namespace: "tokyoStayAreaIndex.stationRouteNote",
  });
  const pagePath = `/areas-to-stay/tokyo-hotels/${supportedSlug}`;
  const stationNote = stationRouteNoteAreaIds.has(supportedSlug)
    ? tStationRouteNote(`areas.${supportedSlug}`)
    : null;
  const areaWithStation = areaWithStationSuffix(area.displayName);

  // ----- per-area optional visual assets
  // Files live at /public/images/hotel-areas/<slug>/<slot>.{png,jpg,jpeg,webp}.
  // Missing files → null → components render their in-code fallback UIs.
  const visualAssets = getAreaVisualAssets(supportedSlug);

  // ----- hero + bottom provider links
  const heroLinks = assembleProviderLinks(supportedSlug, locale, "tokyo_hotels_hero", t);
  const bottomLinks = assembleProviderLinks(supportedSlug, locale, "tokyo_hotels_bottom", t);

  // ----- Primary 4 score bars
  const primaryBars = [
    { key: "airportAccess", label: t("primaryGraph.airportAccess"), value: score.scores.airportAccess },
    { key: "luggageFriendly", label: t("primaryGraph.luggageFriendly"), value: score.scores.luggageFriendly },
    { key: "stationSimplicity", label: t("primaryGraph.stationSimplicity"), value: score.scores.stationSimplicity },
    { key: "localFeel", label: t("primaryGraph.localFeel"), value: score.scores.localFeel },
  ];

  // ----- Detailed breakdown (3 buckets, every sub-score grouped)
  const detailedGroups: ScoreBreakdownGroup[] = [
    {
      key: "access",
      title: t("detailedBreakdown.groups.access"),
      metrics: [
        { key: "airport", label: t("primaryGraph.airportAccess"), value: score.scores.airportAccess },
        { key: "shinkansen", label: t("detailedBreakdown.metrics.shinkansenAccess"), value: score.scores.shinkansenAccess },
        { key: "tourist", label: t("detailedBreakdown.metrics.touristAccess"), value: score.scores.touristAccess },
      ],
    },
    {
      key: "ease",
      title: t("detailedBreakdown.groups.ease"),
      metrics: [
        { key: "station", label: t("primaryGraph.stationSimplicity"), value: score.scores.stationSimplicity },
        { key: "luggage", label: t("primaryGraph.luggageFriendly"), value: score.scores.luggageFriendly },
        { key: "stationStress", label: t("detailedBreakdown.metrics.stationStress"), value: score.scores.crowdStress },
      ],
    },
    {
      key: "stayFeel",
      title: t("detailedBreakdown.groups.stayFeel"),
      metrics: [
        { key: "localFeel", label: t("primaryGraph.localFeel"), value: score.scores.localFeel },
        { key: "hotelChoice", label: t("detailedBreakdown.metrics.hotelChoice"), value: score.scores.lodgingChoice },
      ],
    },
  ];

  // ----- At a glance features
  const features = deriveFeatures(area, score, t);

  // ----- Good fit / Watch out columns (existing editorial + walking-distance caution)
  const goodFit = area.editorial.bestFor.slice(0, 4);
  const watchBase = area.editorial.watchOut.slice(0, 2);
  const watchOut: string[] = [
    ...watchBase,
    t("beforeBook.walkingDistanceCaution", { area: area.displayName }),
  ];

  // ----- Access snapshot nodes
  const nodes: AccessNode[] = [
    {
      key: "narita",
      label: t("access.narita"),
      level: area.accessProfiles.narita?.level ?? "Fair",
      note: area.accessProfiles.narita?.note,
    },
    {
      key: "haneda",
      label: t("access.haneda"),
      level: area.accessProfiles.haneda?.level ?? "Fair",
      note: area.accessProfiles.haneda?.note,
    },
    {
      key: "shinkansen",
      label: t("access.shinkansen"),
      level: area.accessProfiles.shinkansen?.level ?? "Fair",
      note: area.accessProfiles.shinkansen?.note,
    },
    {
      key: "tokyoStation",
      label: t("access.tokyoStationAccess"),
      level: area.accessProfiles.tokyoStationAccess?.level ?? "Fair",
      note: area.accessProfiles.tokyoStationAccess?.note,
    },
  ];
  const oshiageCommandNodes: AreaConnectionCommandNode[] = [
    {
      key: "narita",
      label: t("accessSnapshot.commandMap.oshiage.nodes.narita.label"),
      chip: t("accessSnapshot.commandMap.oshiage.nodes.narita.chip"),
      note: t("accessSnapshot.commandMap.oshiage.nodes.narita.note"),
      position: "topLeft",
    },
    {
      key: "haneda",
      label: t("accessSnapshot.commandMap.oshiage.nodes.haneda.label"),
      chip: t("accessSnapshot.commandMap.oshiage.nodes.haneda.chip"),
      note: t("accessSnapshot.commandMap.oshiage.nodes.haneda.note"),
      position: "topRight",
    },
    {
      key: "asakusa",
      label: t("accessSnapshot.commandMap.oshiage.nodes.asakusa.label"),
      chip: t("accessSnapshot.commandMap.oshiage.nodes.asakusa.chip"),
      note: t("accessSnapshot.commandMap.oshiage.nodes.asakusa.note"),
      position: "bottomLeft",
    },
    {
      key: "tokyoStation",
      label: t("accessSnapshot.commandMap.oshiage.nodes.tokyoStation.label"),
      chip: t("accessSnapshot.commandMap.oshiage.nodes.tokyoStation.chip"),
      note: t("accessSnapshot.commandMap.oshiage.nodes.tokyoStation.note"),
      position: "bottomRight",
    },
  ];

  // ----- Nearby comparison
  const nearbyAlternatives = nearbyBySlug[supportedSlug] ?? defaultNearbyAlternatives(supportedSlug);
  const comparisonMetricLabels = [
    { key: "overall", label: t("nearby.metrics.overall") },
    { key: "airport", label: t("nearby.metrics.airport") },
    { key: "luggage", label: t("nearby.metrics.luggage") },
    { key: "station", label: t("nearby.metrics.station") },
    { key: "localFeel", label: t("nearby.metrics.localFeel") },
  ];
  const currentRow: ComparisonRow = {
    key: supportedSlug,
    name: area.displayName,
    href: pagePath,
    hasOwnPage: true,
    metrics: {
      overall: score.overallScore,
      airport: score.scores.airportAccess,
      luggage: score.scores.luggageFriendly,
      station: score.scores.stationSimplicity,
      localFeel: score.scores.localFeel,
    },
  };
  const alternativeRows: ComparisonRow[] = nearbyAlternatives.flatMap((alt) => {
    const altScore = scoreLookup(alt.targetSlug);
    if (!altScore) return [];
    return [
      {
        key: alt.targetSlug,
        name: areaDisplayName(alt.targetSlug),
        reason: alt.reason,
        href: nearbyHref(alt.targetSlug),
        hasOwnPage: (SUPPORTED_SLUGS as readonly string[]).includes(alt.targetSlug),
        metrics: {
          overall: altScore.overallScore,
          airport: altScore.scores.airportAccess,
          luggage: altScore.scores.luggageFriendly,
          station: altScore.scores.stationSimplicity,
          localFeel: altScore.scores.localFeel,
        },
      },
    ];
  });

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

        <div className="mt-4">
          <TrackedInternalLink
            href="/areas-to-stay/tokyo-stay-area-index"
            sourcePage={pagePath}
            placement="tokyo_hotels_top_back_to_finder"
            label={t("bottomCta.backLink")}
            locale={locale}
            className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0b214a] shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2"
          >
            {t("bottomCta.backLink")}
          </TrackedInternalLink>
        </div>

        {/* 1. Hero */}
        <AreaHeroSummary
          eyebrow={t("eyebrow")}
          title={t("hero.titleTemplate", { area: area.displayName, areaWithStation })}
          intro={t("hero.introTemplate", { area: area.displayName })}
          trustNote={t("hero.trustNote")}
          fitBadgeLabel={t("hero.fitBadgeLabel")}
          fitBadgeOutOf={t("hero.fitBadgeOutOf")}
          fitHeadlineLabels={{
            topPick: t("hero.headline.topPick"),
            strongFit: t("hero.headline.strongFit"),
            goodFit: t("hero.headline.goodFit"),
            mixedFit: t("hero.headline.mixedFit"),
            checkCarefully: t("hero.headline.checkCarefully"),
          }}
          fitScoreNote={t("hero.fitScoreNote")}
          score={{
            overallScore: score.overallScore,
            scores: score.scores,
            confidenceLabel: `${t("hero.confidencePrefix")}: ${score.confidence.label}`,
            sourceFreshnessLabel: `${t("hero.freshnessPrefix")}: ${score.sourceFreshness.label}`,
          }}
          pagePath={pagePath}
          locale={locale}
          area={{ displayName: area.displayName, areaId: area.id }}
          city="Tokyo"
          providers={heroLinks}
        />

        {/* 2. Primary score graph */}
        <AreaPrimaryScoreGraph
          eyebrow={t("primaryGraph.eyebrow")}
          title={t("primaryGraph.title")}
          intro={t("primaryGraph.intro")}
          bars={primaryBars}
        />

        {/* 2b. Detailed breakdown */}
        <AreaDetailedScoreBreakdown
          eyebrow={t("detailedBreakdown.eyebrow")}
          title={t("detailedBreakdown.title")}
          intro={t("detailedBreakdown.intro")}
          groups={detailedGroups}
        />

        {/* 3. At-a-glance features (optional area-vibe image banner) */}
        <AreaFeatureHighlights
          eyebrow={t("featureLabels.eyebrow")}
          title={t("featureLabels.title")}
          intro={area.editorial.overallLabel}
          features={features}
          image={{
            src: visualAssets["area-vibe"],
            alt: t("visuals.areaVibe.alt", { area: area.displayName }),
            caption: t("visuals.areaVibe.caption", { area: area.displayName }),
          }}
        />

        {/* 4. Good fit / Watch out */}
        <AreaFitProfile
          eyebrow={t("fitProfile.eyebrow")}
          title={t("fitProfile.title")}
          goodFitTitle={t("fitProfile.goodFitTitle")}
          watchOutTitle={t("fitProfile.watchOutTitle")}
          goodFit={goodFit}
          watchOut={watchOut}
        />

        {/* 5. Access snapshot. Oshiage uses the code-rendered command map experiment; other areas keep image/fallback behavior. */}
        {supportedSlug === "oshiage" ? (
          <AreaConnectionCommandMap
            eyebrow={t("accessSnapshot.eyebrow")}
            title={t("accessSnapshot.title")}
            intro={t("accessSnapshot.commandMap.oshiage.intro")}
            centerLabel={t("accessSnapshot.commandMap.oshiage.centerLabel")}
            centerSubLabel={t("accessSnapshot.commandMap.oshiage.centerSubLabel")}
            qualitativeNote={t("accessSnapshot.qualitativeNote")}
            nodes={oshiageCommandNodes}
          />
        ) : (
          <AreaAccessSnapshot
            eyebrow={t("accessSnapshot.eyebrow")}
            title={t("accessSnapshot.title")}
            intro={t("accessSnapshot.intro")}
            centerLabel={area.displayName}
            centerSublabel={t("accessSnapshot.centerSublabel")}
            nodes={nodes}
            qualitativeNote={t("accessSnapshot.qualitativeNote")}
            image={{
              src: visualAssets["how-this-area-connects"],
              alt: t("visuals.howThisAreaConnects.alt", { area: area.displayName }),
              caption: t("visuals.howThisAreaConnects.caption", { area: area.displayName }),
            }}
          />
        )}

        {/* 6. Nearby alternatives comparison (optional comparison image banner) */}
        {alternativeRows.length > 0 ? (
          <AreaNearbyComparison
            eyebrow={t("nearby.eyebrow")}
            title={t("nearby.title")}
            intro={t("nearby.intro")}
            currentAreaName={area.displayName}
            currentHref={pagePath}
            currentRow={currentRow}
            alternatives={alternativeRows}
            metricLabels={comparisonMetricLabels}
            openLabel={t("nearby.openLabel")}
            sourcePage={pagePath}
            locale={locale}
            image={{
              src: visualAssets["nearby-alternatives"],
              alt: t("visuals.nearbyAlternatives.alt", { area: area.displayName }),
              caption: t("visuals.nearbyAlternatives.caption", { area: area.displayName }),
            }}
          />
        ) : null}

        {/* 6b. Station-name disambiguation note (only when authored) */}
        {stationNote ? (
          <section className="mt-6 rounded-[22px] border border-sky-100 bg-sky-50/80 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-950">{tStationRouteNote("title")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{stationNote}</p>
          </section>
        ) : null}

        {/* 7. Bottom CTA */}
        <AreaBottomCta
          title={t("bottomCta.title")}
          body={t("bottomCta.bodyTemplate", { area: area.displayName, areaWithStation })}
          backLabel={t("bottomCta.backLink")}
          providers={bottomLinks}
          pagePath={pagePath}
          locale={locale}
          area={{ displayName: area.displayName, areaId: area.id }}
          city="Tokyo"
        />

        {/* 8. Legal */}
        <p className="mt-6 text-xs leading-5 text-slate-500">{t("legal.body")}</p>
      </Container>

      <SiteFooter />
    </main>
  );
}
