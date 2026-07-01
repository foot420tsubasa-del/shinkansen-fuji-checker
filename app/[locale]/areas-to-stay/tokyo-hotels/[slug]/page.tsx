import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { ProviderButton, type ProviderId } from "@/components/ui/ProviderButton";
import { StickyMobileCta } from "@/components/affiliate/StickyMobileCta";
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
import {
  AreaConnectionCommandMap,
  type AreaConnectionCommandNode,
  type AreaConnectionMapConfig,
} from "../_components/AreaConnectionCommandMap";
import {
  AreaNearbyComparison,
  type ComparisonRow,
} from "../_components/AreaNearbyComparison";
import { AreaBottomCta } from "../_components/AreaBottomCta";
import { AreaNeighborhoodFeel } from "../_components/AreaNeighborhoodFeel";
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

  // ---- East Tokyo (remaining)
  ryogoku: [
    { targetSlug: "kuramae", reason: "Quieter calm East Tokyo base" },
    { targetSlug: "asakusa", reason: "More sightseeing and old-town energy" },
    { targetSlug: "oshiage", reason: "Stronger airport access via Asakusa Line" },
  ],
  "kiyosumi-shirakawa": [
    { targetSlug: "monzen-nakacho", reason: "Similar Fukagawa calm with metro access" },
    { targetSlug: "kuramae", reason: "More rail options and cafés" },
    { targetSlug: "ryogoku", reason: "Stronger JR connections" },
  ],
  "monzen-nakacho": [
    { targetSlug: "kiyosumi-shirakawa", reason: "Similar calm with more café streets" },
    { targetSlug: "toyosu", reason: "Bay-side base with wider sidewalks" },
    { targetSlug: "ryogoku", reason: "Stronger JR access" },
  ],
  asakusabashi: [
    { targetSlug: "bakurocho-higashinihombashi", reason: "Similar quiet wholesale base" },
    { targetSlug: "kuramae", reason: "Calmer river-side feel with more cafés" },
    { targetSlug: "ueno", reason: "Stronger Narita and rail access" },
  ],
  kinshicho: [
    { targetSlug: "oshiage", reason: "Stronger Skytree and airport logic" },
    { targetSlug: "kuramae", reason: "Calmer East Tokyo street feel" },
    { targetSlug: "ryogoku", reason: "Similar local energy with JR options" },
  ],

  // ---- Central Tokyo
  ningyocho: [
    { targetSlug: "nihombashi", reason: "More central rail and shopping" },
    { targetSlug: "kayabacho", reason: "Quieter business-side base" },
    { targetSlug: "asakusabashi", reason: "More local-feeling old-merchant streets" },
  ],
  hatchobori: [
    { targetSlug: "kayabacho", reason: "Similar quiet business district" },
    { targetSlug: "nihombashi", reason: "More central with stronger rail" },
    { targetSlug: "tokyo-station", reason: "Better for early Shinkansen" },
  ],
  kayabacho: [
    { targetSlug: "hatchobori", reason: "Similar calm business streets" },
    { targetSlug: "nihombashi", reason: "More central retail and dining" },
    { targetSlug: "monzen-nakacho", reason: "Similar calm with Fukagawa atmosphere" },
  ],
  nihombashi: [
    { targetSlug: "tokyo-station", reason: "Stronger Shinkansen and rail logistics" },
    { targetSlug: "ginza-yurakucho", reason: "More shopping and dining" },
    { targetSlug: "ningyocho", reason: "More local old-merchant atmosphere" },
  ],
  "ginza-yurakucho": [
    { targetSlug: "tokyo-station", reason: "Simpler early Shinkansen logistics" },
    { targetSlug: "shimbashi", reason: "More salaryman nightlife" },
    { targetSlug: "nihombashi", reason: "Calmer central base" },
  ],
  shimbashi: [
    { targetSlug: "ginza-yurakucho", reason: "More polished retail and dining" },
    { targetSlug: "hamamatsucho-daimon", reason: "Better Tokyo Monorail / Haneda access" },
    { targetSlug: "tokyo-station", reason: "Stronger Shinkansen and JR" },
  ],
  kanda: [
    { targetSlug: "akihabara", reason: "More energy and electronics access" },
    { targetSlug: "nihombashi", reason: "More polished central base" },
    { targetSlug: "ochanomizu", reason: "Calmer university-area streets" },
  ],
  akihabara: [
    { targetSlug: "ueno", reason: "Better Narita-side logistics" },
    { targetSlug: "kanda", reason: "Calmer JR-adjacent base" },
    { targetSlug: "bakurocho-higashinihombashi", reason: "Quieter wholesale streets nearby" },
  ],
  "bakurocho-higashinihombashi": [
    { targetSlug: "asakusabashi", reason: "Similar quiet wholesale district" },
    { targetSlug: "kayabacho", reason: "Quiet business base with stronger metro" },
    { targetSlug: "ningyocho", reason: "More local old-merchant streets" },
  ],
  "akasaka-mitsuke": [
    { targetSlug: "roppongi", reason: "More nightlife energy" },
    { targetSlug: "aoyama-omotesando", reason: "More retail and design" },
    { targetSlug: "ginza-yurakucho", reason: "More central shopping" },
  ],
  roppongi: [
    { targetSlug: "akasaka-mitsuke", reason: "Calmer business-side base" },
    { targetSlug: "aoyama-omotesando", reason: "More retail and gallery streets" },
    { targetSlug: "shibuya", reason: "Bigger nightlife hub" },
  ],

  // ---- South Central / South / West Tokyo
  "hamamatsucho-daimon": [
    { targetSlug: "shinagawa", reason: "Stronger Shinkansen and Haneda access" },
    { targetSlug: "shimbashi", reason: "More walkable salaryman nightlife" },
    { targetSlug: "tokyo-station", reason: "More central sightseeing" },
  ],
  gotanda: [
    { targetSlug: "meguro", reason: "Calmer streets and design feel" },
    { targetSlug: "shinagawa", reason: "Stronger Shinkansen and airport access" },
    { targetSlug: "ebisu", reason: "More polished retail and dining" },
  ],
  meguro: [
    { targetSlug: "ebisu", reason: "More polished cafés and retail" },
    { targetSlug: "gotanda", reason: "Similar mid-Yamanote base with more rail" },
    { targetSlug: "shibuya", reason: "Bigger entertainment hub" },
  ],
  ebisu: [
    { targetSlug: "meguro", reason: "Calmer side streets" },
    { targetSlug: "shibuya", reason: "Bigger transit hub and nightlife" },
    { targetSlug: "ginza-yurakucho", reason: "More polished central base" },
  ],
  yoyogi: [
    { targetSlug: "shinjuku", reason: "More hotel choice and transit options" },
    { targetSlug: "shibuya", reason: "Bigger entertainment hub" },
    { targetSlug: "aoyama-omotesando", reason: "More polished retail base" },
  ],
  "aoyama-omotesando": [
    { targetSlug: "shibuya", reason: "Bigger entertainment and rail hub" },
    { targetSlug: "akasaka-mitsuke", reason: "Calmer business-side base" },
    { targetSlug: "roppongi", reason: "More nightlife energy" },
  ],

  // ---- Central-North / Central-West
  ochanomizu: [
    { targetSlug: "iidabashi", reason: "Calmer canal-side base" },
    { targetSlug: "kanda", reason: "More energy near JR" },
    { targetSlug: "korakuen-kasuga", reason: "Quieter Bunkyo residential streets" },
  ],
  iidabashi: [
    { targetSlug: "korakuen-kasuga", reason: "Quieter Bunkyo residential base" },
    { targetSlug: "ochanomizu", reason: "Stronger JR access" },
    { targetSlug: "ikebukuro", reason: "Bigger transit hub for more flights" },
  ],
  "korakuen-kasuga": [
    { targetSlug: "iidabashi", reason: "Stronger JR and canal-side dining" },
    { targetSlug: "ochanomizu", reason: "More university-area energy" },
    { targetSlug: "ikebukuro", reason: "Bigger transit hub nearby" },
  ],

  // ---- Bay Area
  toyosu: [
    { targetSlug: "ariake-odaiba", reason: "More bay-side promenade space" },
    { targetSlug: "monzen-nakacho", reason: "Calmer Fukagawa-side base" },
    { targetSlug: "tokyo-station", reason: "More central sightseeing" },
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
  // Action-oriented, placement-specific labels: "Check hotels on …" near
  // the hero, "Compare hotels on …" at the bottom. Falls back to the bare
  // brand-name labels if the long keys are ever missing.
  const isBottom = placement === "tokyo_hotels_bottom";
  const bookingLabel = isBottom ? t("bottomCta.providerBooking") : t("hero.providerBooking");
  const tripLabel = isBottom ? t("bottomCta.providerTrip") : t("hero.providerTrip");

  const bookingLinks: AreaProviderLink[] = getHotelProviderLinks({
    areaId: slug,
    locale,
    placement,
  }).map((link) => ({
    provider: link.provider,
    href: link.href,
    trackingHref: link.trackingHref,
    label: bookingLabel,
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
            label: tripLabel,
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

  // ----- Quick decision (derived from existing editorial data; no new JSON)
  //   lead     → area.editorial.overallLabel (a natural per-area sentence)
  //   choose   → "Choose X if you want: <bestFor tags>."
  //   watch    → "Think twice if these matter: <watchOut tags>."
  // The bestFor / watchOut tags are the same editorial values shown in the
  // Best-for / Watch-out cards, so the quick decision stays consistent.
  const quickDecision = {
    lead: area.editorial.overallLabel,
    chooseLabel: t("quickDecision.chooseLabel"),
    choose: t("quickDecision.chooseTemplate", {
      area: area.displayName,
      reasons: goodFit.slice(0, 3).join(", "),
    }),
    watchLabel: t("quickDecision.watchLabel"),
    watch: t("quickDecision.watchTemplate", {
      area: area.displayName,
      cautions: watchBase.join(", "),
    }),
  };

  // ----- FAQPage JSON-LD (SEO rich results on the EN revenue pages).
  // Q&A is assembled from the same editorial data the visible page uses,
  // so schema content always matches what the reader sees.
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("faqSchema.isGoodQ", { area: area.displayName }),
        acceptedAnswer: {
          "@type": "Answer",
          text: t("faqSchema.isGoodA", {
            label: area.editorial.overallLabel,
            area: area.displayName,
            score: score.overallScore,
          }),
        },
      },
      {
        "@type": "Question",
        name: t("faqSchema.whoQ", { area: area.displayName }),
        acceptedAnswer: { "@type": "Answer", text: goodFit.join(", ") + "." },
      },
      {
        "@type": "Question",
        name: t("faqSchema.watchQ", { area: area.displayName }),
        acceptedAnswer: { "@type": "Answer", text: watchOut.join(" ") },
      },
    ],
  };

  // ----- Sticky mobile CTA: keep the Booking.com action reachable while
  // the reader scrolls the long score/access sections. Booking only —
  // one action, no Trip crowding, never borrowed URLs.
  const stickyBookingLink = heroLinks.find((link) => link.provider === "booking_travelpayouts") ?? null;

  // Build the interactive command-map data for every area.
  //
  // For Oshiage we keep the existing hand-curated translation block so its
  // editorial polish is preserved; every other area derives its 4 access
  // cards from area.accessProfiles (already curated per area).
  const isOshiage = supportedSlug === "oshiage";

  // Fixed Tokyo-side destination coordinates. Tokyo Station is the access
  // anchor for the "Tokyo Station access" card; Shinagawa is used for the
  // Shinkansen card so the two don't overlap on the map.
  const TOKYO_STATION_POS: { lat: number; lng: number } = { lat: 35.6812, lng: 139.7671 };
  const SHINAGAWA_POS: { lat: number; lng: number } = { lat: 35.6285, lng: 139.7387 };
  const NARITA_POS: { lat: number; lng: number } = { lat: 35.772, lng: 140.3929 };
  const HANEDA_POS: { lat: number; lng: number } = { lat: 35.5494, lng: 139.7798 };

  function paddedLevel(level: string | undefined): string {
    return (level ?? "Fair").toUpperCase();
  }

  // Oshiage retains its curated translation block; other areas use
  // accessProfiles data (level → chip, note → note).
  const commandNodes: AreaConnectionCommandNode[] = isOshiage
    ? [
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
      ]
    : [
        {
          key: "narita",
          label: t("access.narita"),
          chip: paddedLevel(area.accessProfiles.narita?.level),
          note: area.accessProfiles.narita?.note ?? "",
          position: "topLeft",
        },
        {
          key: "haneda",
          label: t("access.haneda"),
          chip: paddedLevel(area.accessProfiles.haneda?.level),
          note: area.accessProfiles.haneda?.note ?? "",
          position: "topRight",
        },
        {
          key: "tokyoStation",
          label: t("access.tokyoStationAccess"),
          chip: paddedLevel(area.accessProfiles.tokyoStationAccess?.level),
          note: area.accessProfiles.tokyoStationAccess?.note ?? "",
          position: "bottomLeft",
        },
        {
          key: "shinkansen",
          label: t("access.shinkansen"),
          chip: paddedLevel(area.accessProfiles.shinkansen?.level),
          note: area.accessProfiles.shinkansen?.note ?? "",
          position: "bottomRight",
        },
      ];

  // Compose the dynamic map config. For Oshiage we keep its existing 4-marker
  // layout (Narita / Haneda / Asakusa / Tokyo Station). Other areas use the
  // 4-card set above (Narita / Haneda / Tokyo Station / Shinkansen at Shinagawa).
  const centerPosition = area.coordinates
    ? { lat: area.coordinates.lat, lng: area.coordinates.lng }
    : TOKYO_STATION_POS;
  const commandMapDestinations: AreaConnectionMapConfig["destinations"] = isOshiage
    ? [
        { key: "narita", label: "Narita Airport", shortLabel: "N", position: NARITA_POS, tone: "airport" },
        { key: "haneda", label: "Haneda Airport", shortLabel: "H", position: HANEDA_POS, tone: "airport" },
        { key: "asakusa", label: "Asakusa", shortLabel: "A", position: { lat: 35.7148, lng: 139.7967 }, tone: "city" },
        { key: "tokyoStation", label: "Tokyo Station", shortLabel: "T", position: TOKYO_STATION_POS, tone: "city" },
      ]
    : [
        { key: "narita", label: t("access.narita"), shortLabel: "N", position: NARITA_POS, tone: "airport" },
        { key: "haneda", label: t("access.haneda"), shortLabel: "H", position: HANEDA_POS, tone: "airport" },
        { key: "tokyoStation", label: t("access.tokyoStationAccess"), shortLabel: "T", position: TOKYO_STATION_POS, tone: "city" },
        { key: "shinkansen", label: t("access.shinkansen"), shortLabel: "S", position: SHINAGAWA_POS, tone: "city" },
      ];

  // Midpoint between the area and Tokyo Station so both fit in the initial
  // view comfortably. Slightly biased toward the area so it stays prominent.
  const initialMapCenter = {
    lat: centerPosition.lat * 0.6 + TOKYO_STATION_POS.lat * 0.4,
    lng: centerPosition.lng * 0.6 + TOKYO_STATION_POS.lng * 0.4,
  };
  const commandMapConfig: AreaConnectionMapConfig = {
    centerKey: supportedSlug,
    centerPosition,
    centerShortLabel: area.displayName.charAt(0).toUpperCase(),
    initialMapCenter,
    defaultZoom: 13,
    destinations: commandMapDestinations,
  };

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
      <Script
        id={`faq-schema-tokyo-hotels-${supportedSlug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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

        {/* 1b. Quick decision — decision-first, before any score detail.
            Derived from existing editorial data (overallLabel + bestFor /
            watchOut tags). Mobile: single column, short, scannable. */}
        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#106b43]">
            {t("quickDecision.eyebrow")}
          </p>
          <p className="mt-2 text-base font-semibold leading-6 text-slate-950 md:text-lg">
            {quickDecision.lead}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#106b43]">
                {quickDecision.chooseLabel}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-700">{quickDecision.choose}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-amber-800">
                {quickDecision.watchLabel}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-700">{quickDecision.watch}</p>
            </div>
          </div>
        </section>

        {/* 1c. Good fit / Watch out — promoted above the score detail so the
            "should I stay here?" answer comes before the numbers. */}
        <AreaFitProfile
          eyebrow={t("fitProfile.eyebrow")}
          title={t("fitProfile.title")}
          goodFitTitle={t("fitProfile.goodFitTitle")}
          watchOutTitle={t("fitProfile.watchOutTitle")}
          goodFit={goodFit}
          watchOut={watchOut}
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

        {/* 5. "How this area connects" — interactive Google Maps command map
            with clickable destination markers + access cards. The same
            component handles all 36 areas; Oshiage keeps its curated
            translation block for the access cards. */}
        <AreaConnectionCommandMap
          eyebrow={t("accessSnapshot.eyebrow")}
          title={t("accessSnapshot.title")}
          intro={
            isOshiage
              ? t("accessSnapshot.commandMap.oshiage.intro")
              : t("accessSnapshot.intro")
          }
          centerLabel={
            isOshiage
              ? t("accessSnapshot.commandMap.oshiage.centerLabel")
              : area.displayName
          }
          centerSubLabel={
            isOshiage
              ? t("accessSnapshot.commandMap.oshiage.centerSubLabel")
              : t("accessSnapshot.centerSublabel")
          }
          qualitativeNote={t("accessSnapshot.qualitativeNote")}
          nodes={commandNodes}
          map={commandMapConfig}
        />

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

        {/* 6c. Neighborhood feel — editorial "what the street feels like after
            you leave the station" read. Placed after the score / access /
            comparison content and before the booking CTA so travellers
            understand the area before tapping a provider link. */}
        <AreaNeighborhoodFeel
          eyebrow={t("neighborhoodFeel.eyebrow")}
          title={t("neighborhoodFeel.title")}
          summary={area.neighborhoodFeel.summary}
          goodForTitle={t("neighborhoodFeel.goodForTitle")}
          watchOutTitle={t("neighborhoodFeel.watchOutTitle")}
          goodFor={area.neighborhoodFeel.goodFor}
          watchOutFor={area.neighborhoodFeel.watchOutFor}
        />

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

      {/* Mobile-only sticky Booking CTA — appears after the hero scrolls
          away so the booking action stays one thumb-tap away through the
          long score / access sections. Same link assembly + analytics as
          the hero row, with its own placement for measurement. */}
      {stickyBookingLink ? (
        <StickyMobileCta>
          <ProviderButton
            provider={stickyBookingLink.provider}
            href={stickyBookingLink.href}
            trackingHref={stickyBookingLink.trackingHref}
            placement="tokyo_hotels_sticky"
            pagePath={pagePath}
            locale={locale}
            linkId={stickyBookingLink.linkId}
            subId={stickyBookingLink.subId}
            category="hotel"
            product="hotel_area_search"
            area={area.displayName}
            areaId={area.id}
            city="Tokyo"
            fullWidth
          >
            {stickyBookingLink.label}
          </ProviderButton>
        </StickyMobileCta>
      ) : null}
    </main>
  );
}
