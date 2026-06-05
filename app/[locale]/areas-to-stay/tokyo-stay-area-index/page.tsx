import type { Metadata } from "next";
import type { ComponentProps } from "react";
import {
  BarChart3,
  Building2,
  DoorOpen,
  Luggage,
  MapPin,
  Plane,
  Signpost,
  Train,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { FujiseatAreaLogic } from "@/components/content/FujiseatAreaLogic";
import { ProviderButton, type ProviderId } from "@/components/ui/ProviderButton";
import { getAlternates } from "@/i18n/hreflang";
import { tokyoStayAreasBase } from "@/data/stay-area/tokyo-areas.base";
import signalsJson from "@/data/generated/tokyo-stay-area-signals.json";
import scoresJson from "@/data/generated/tokyo-stay-area-scores.json";
import sourceStatusJson from "@/data/generated/tokyo-stay-area-source-status.json";
import { tokyoStayAreaSourceRegistry } from "@/data/stay-area/source-registry";
import { getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { getHotelProviderLinks, type HotelAffiliatePlacement } from "@/lib/hotel-affiliate-links";
import { getTranslations } from "next-intl/server";
import type {
  AccessRouteProfile,
  ComputedStayAreaScore,
  ExitComplexityLevel,
  LodgingDensityLevel,
  NetworkComplexitySignal,
  SignalsSourceEntry,
  StayAreaBase,
  StayAreaMatchLabel,
  StayAreaSignalsFile,
  StayAreaScoresFile,
  SourceStatusFile,
  StepFreeConfidence,
} from "@/lib/stay-area/types";
import {
  TrackedStayAreaContinueLink,
} from "./StayAreaIndexTracking";
import { TokyoHotelAreaFinder, type FinderArea } from "./TokyoHotelAreaFinder";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; area?: string }>;
};

type Translation = Awaited<ReturnType<typeof getTranslations>>;

const pagePath = "/areas-to-stay/tokyo-stay-area-index";

const hotelAreaKeyByStayAreaId: Partial<Record<string, HotelAreaKey>> = {
  oshiage: "oshiage",
  kuramae: "asakusa",
  asakusa: "asakusa",
  ueno: "ueno",
  ryogoku: "oshiage",
  "kiyosumi-shirakawa": "oshiage",
  "monzen-nakacho": "oshiage",
  ningyocho: "tokyoStation",
  hatchobori: "tokyoStation",
  kayabacho: "tokyoStation",
  nihombashi: "tokyoStation",
  "tokyo-station": "tokyoStation",
  "ginza-yurakucho": "tokyoStation",
  shimbashi: "tokyoStation",
  "hamamatsucho-daimon": "tokyoStation",
  shinagawa: "tokyoStation",
  kanda: "tokyoStation",
  akihabara: "ueno",
  asakusabashi: "asakusa",
  "bakurocho-higashinihombashi": "tokyoStation",
  kinshicho: "oshiage",
  shinjuku: "shinjuku",
  yoyogi: "shinjuku",
  shibuya: "shibuya",
};

const scoreLabels: Array<{ key: keyof ComputedStayAreaScore["scores"]; label: string }> = [
  { key: "stationSimplicity", label: "stationSimplicity" },
  { key: "luggageFriendly", label: "luggageFriendly" },
  { key: "airportAccess", label: "airportAccess" },
  { key: "shinkansenAccess", label: "shinkansenAccess" },
  { key: "touristAccess", label: "touristAccess" },
  { key: "localFeel", label: "localFeel" },
  { key: "crowdStress", label: "crowdStress" },
  { key: "lodgingChoice", label: "lodgingChoice" },
];

type FilterKey =
  | "all"
  | "narita-arrival"
  | "haneda-arrival"
  | "shinkansen"
  | "avoid-giant-stations";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "narita-arrival", label: "Narita arrival" },
  { key: "haneda-arrival", label: "Haneda arrival" },
  { key: "shinkansen", label: "Shinkansen" },
  { key: "avoid-giant-stations", label: "Avoid giant stations" },
];

const FILTER_BOOSTS: Record<FilterKey, Array<{ areaId: string; delta: number }>> = {
  "all": [],
  "narita-arrival": [],
  "haneda-arrival": [],
  "shinkansen": [],
  "avoid-giant-stations": [
    { areaId: "kuramae", delta: 10 },
    { areaId: "kayabacho", delta: 9 },
    { areaId: "kiyosumi-shirakawa", delta: 9 },
    { areaId: "monzen-nakacho", delta: 8 },
    { areaId: "ningyocho", delta: 8 },
    { areaId: "hatchobori", delta: 8 },
    { areaId: "asakusabashi", delta: 7 },
    { areaId: "ryogoku", delta: 6 },
    { areaId: "korakuen-kasuga", delta: 6 },
    { areaId: "ochanomizu", delta: 5 },
  ],
};

const signalsFile = signalsJson as StayAreaSignalsFile;
const scoresFile = scoresJson as StayAreaScoresFile;
const sourceStatusFile = sourceStatusJson as SourceStatusFile;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tokyoStayAreaIndex.meta" });
  return {
    title: t("title"),
    description: t("description"),
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(pagePath, locale),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      siteName: "fujiseat",
    },
  };
}

function areaById(id: string): StayAreaBase {
  const area = tokyoStayAreasBase.find((item) => item.id === id);
  if (!area) throw new Error(`Missing Tokyo stay area base data for ${id}`);
  return area;
}

function hotelSearchForArea(area: StayAreaBase, locale: string, placement: HotelAffiliatePlacement) {
  const hotelAreaKey = hotelAreaKeyByStayAreaId[area.id];
  if (!hotelAreaKey) return null;
  const hotel = getHotelLink(hotelAreaKey);
  const config = getTripHotelConfig(hotelAreaKey);
  const tripHref = hotel.provider === "trip" ? hotel.href : config.tripUrl.trim();
  const tripTrackingHref = hotel.provider === "trip" ? hotel.trackingHref : config.tripUrl.trim();
  const bookingLinks = getHotelProviderLinks({ areaId: area.id, locale, placement });
  const providers = [
    ...bookingLinks,
    tripHref && tripHref !== "#"
      ? {
          provider: "trip" as ProviderId,
          href: tripHref,
          trackingHref: tripTrackingHref,
          label: "Search this area on Trip.com",
          linkId: `hotelArea.${hotelAreaKey}.trip`,
          priority: 20,
          placement,
        }
      : null,
  ].filter((provider): provider is {
    provider: ProviderId;
    href: string;
    trackingHref: string;
    label: string;
    linkId: string;
    subId?: string;
    priority: number;
    placement: Parameters<typeof ProviderButton>[0]["placement"];
  } => Boolean(provider)).sort((a, b) => a.priority - b.priority || a.linkId.localeCompare(b.linkId));

  if (providers.length === 0) return null;
  return {
    hotelAreaKey,
    areaName: config.areaName,
    selectedAreaName: area.displayName,
    city: config.city,
    providers,
  };
}

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

function stationRouteNote(areaId: string, t: Translation) {
  return stationRouteNoteAreaIds.has(areaId) ? t(`stationRouteNote.areas.${areaId}`) : null;
}

function hotelSearchForFinderArea(area: StayAreaBase, locale: string, placement: HotelAffiliatePlacement): FinderArea["hotel"] {
  const hotel = hotelSearchForArea(area, locale, placement);
  if (!hotel) return null;
  return {
    areaName: hotel.areaName,
    city: hotel.city,
    providers: hotel.providers,
  };
}

function parseFilter(value: string | undefined): FilterKey {
  const candidate = (value ?? "all") as FilterKey;
  return FILTERS.some((f) => f.key === candidate) ? candidate : "all";
}

function accessLevelFilterDelta(level: AccessRouteProfile["level"] | undefined): number {
  if (level === "Excellent") return 10;
  if (level === "Good") return 6;
  if (level === "Fair") return 2;
  return 0;
}

function shinkansenLevelFilterDelta(level: StayAreaBase["accessProfiles"]["shinkansen"]["level"] | undefined): number {
  if (level === "Excellent") return 10;
  if (level === "Good") return 6;
  if (level === "Fair") return 2;
  return 0;
}

function profileFilterDelta(area: StayAreaBase, filter: FilterKey): number {
  if (!area.accessProfiles) return 0;
  if (filter === "narita-arrival") return accessLevelFilterDelta(area.accessProfiles.narita?.level);
  if (filter === "haneda-arrival") return accessLevelFilterDelta(area.accessProfiles.haneda?.level);
  if (filter === "shinkansen") return shinkansenLevelFilterDelta(area.accessProfiles.shinkansen?.level);
  return 0;
}

function clampDisplayScore(score: number): number {
  return Math.max(45, Math.min(92, Math.round(score)));
}

function deriveDisplayFitScore({
  area,
  score,
  signal,
}: {
  area: StayAreaBase;
  score: ComputedStayAreaScore;
  signal: StayAreaSignalsFile["areas"][string] | undefined;
}): number {
  const network = signal?.networkComplexitySignal;
  const exit = exitComplexityDisplay(signal, area.exitComplexityLevel);
  let penalty = 0;
  let bonus = 0;

  if (network?.terminalType === "mega-terminal") penalty += 9;
  else if (network?.terminalType === "terminal") penalty += 3;

  if (exit.level === "Mega station") penalty += 5;
  else if (exit.level === "Complex") penalty += 2;

  if (score.scores.stationSimplicity < 35) penalty += 5;
  else if (score.scores.stationSimplicity < 50) penalty += 3;
  else if (score.scores.stationSimplicity < 65) penalty += 1;

  if (score.scores.crowdStress < 30) penalty += 5;
  else if (score.scores.crowdStress < 45) penalty += 3;
  else if (score.scores.crowdStress < 60) penalty += 1;

  if (area.lodgingDensityLevel === "Very High" && score.scores.stationSimplicity < 60) penalty += 2;
  if (score.overallScore >= 75 && score.scores.stationSimplicity < 65) penalty += 3;
  if (score.overallScore >= 75 && score.scores.crowdStress < 60) penalty += 2;
  if (score.scores.stationSimplicity >= 85 && score.scores.luggageFriendly >= 80 && score.scores.crowdStress >= 80) bonus += 2;

  return clampDisplayScore(score.overallScore - penalty + bonus);
}

function fitTier(displayScore: number, t?: Translation): { label: string; tone: ChipTone; className: string } {
  if (displayScore >= 85) {
    return {
      label: t ? t("tiers.excellent") : "Excellent fit",
      tone: "calm",
      className: "border-emerald-200 bg-emerald-50 text-[#106b43]",
    };
  }
  if (displayScore >= 75) {
    return {
      label: t ? t("tiers.strong") : "Strong fit",
      tone: "calm",
      className: "border-emerald-100 bg-emerald-50 text-[#106b43]",
    };
  }
  if (displayScore >= 65) {
    return {
      label: t ? t("tiers.good") : "Good with trade-offs",
      tone: "soft",
      className: "border-slate-200 bg-slate-50 text-slate-700",
    };
  }
  if (displayScore >= 55) {
    return {
      label: t ? t("tiers.situational") : "Situational",
      tone: "warn",
      className: "border-amber-100 bg-amber-50 text-amber-800",
    };
  }
  return {
    label: t ? t("tiers.hard") : "Hard for first-time / luggage-heavy trips",
    tone: "alert",
    className: "border-rose-100 bg-rose-50 text-rose-700",
  };
}

function applyFilterBoost(scores: ComputedStayAreaScore[], filter: FilterKey) {
  if (filter === "all") return scores;
  const boostMap = new Map(FILTER_BOOSTS[filter].map((b) => [b.areaId, b.delta] as const));
  return scores
    .map((s) => {
      const delta = filter === "narita-arrival" || filter === "haneda-arrival" || filter === "shinkansen"
        ? profileFilterDelta(areaById(s.id), filter)
        : boostMap.get(s.id) ?? 0;
      return delta
        ? { ...s, overallScore: Math.max(0, Math.min(100, s.overallScore + delta)) }
        : s;
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}

function localizedIndexHref(locale: string, suffix = ""): string {
  const localizedPath = `/${locale === "en" ? "" : `${locale}/`}${pagePath.replace(/^\//, "")}`;
  return `${localizedPath}${suffix}`;
}

function finderAreaDetailHref(locale: string, areaId: string): string {
  const params = new URLSearchParams();
  params.set("area", areaId);
  return localizedIndexHref(locale, `?${params.toString()}#selected-area`);
}

function formatLastChecked(iso: string): string {
  try { return new Date(iso).toISOString().slice(0, 10); } catch { return iso; }
}

function statusLabel(status: SignalsSourceEntry["status"]): string {
  if (status === "success") return "Success";
  if (status === "partial") return "Partial";
  if (status === "skipped") return "Skipped";
  if (status === "optional") return "Optional";
  return "Failed";
}

function displayStatus(label: string, t: Translation): string {
  if (label === "Success") return t("status.success");
  if (label === "Partial") return t("status.partial");
  if (label === "Skipped") return t("status.skipped");
  if (label === "Optional") return t("status.optional");
  if (label === "Not live yet") return t("status.notLiveYet");
  if (label === "Editorial signal") return t("status.editorialSignal");
  if (label === "Active") return t("status.active");
  if (label === "Next") return t("status.next");
  if (label === "Editorial fallback") return t("status.editorialFallback");
  return label;
}

function crowdLabelKey(label: ReturnType<typeof crowdLevelFromPercentile>["label"]): "low" | "medium" | "high" | "veryHigh" | "unknown" {
  if (label === "Very High") return "veryHigh";
  return label.toLowerCase() as "low" | "medium" | "high" | "unknown";
}

function stepFreeLabelKey(label: ReturnType<typeof stepFreeDisplay>["label"]): "known" | "partial" | "notLiveYet" {
  if (label === "Not live yet") return "notLiveYet";
  return label.toLowerCase() as "known" | "partial";
}

function matchLabelTone(label: StayAreaMatchLabel, t?: Translation): { text: string; cls: string } {
  if (label === "public-data-matched")
    return { text: t ? t("matchLabels.publicDataMatched") : "Public data matched", cls: "bg-emerald-50 text-[#106b43] border-emerald-100" };
  if (label === "partial-public-data")
    return { text: t ? t("matchLabels.partialPublicData") : "Partial public data", cls: "bg-amber-50 text-amber-800 border-amber-100" };
  return { text: t ? t("matchLabels.editorialFallback") : "Editorial fallback", cls: "bg-slate-100 text-slate-600 border-slate-200" };
}

// ---------- station-usability chip helpers --------------------------------

type ChipTone = "soft" | "calm" | "warn" | "alert";

function chipToneClass(tone: ChipTone): string {
  switch (tone) {
    case "soft": return "border-slate-200 bg-slate-50 text-slate-700";
    case "calm": return "border-emerald-100 bg-emerald-50 text-[#106b43]";
    case "warn": return "border-amber-100 bg-amber-50 text-amber-800";
    case "alert": return "border-rose-100 bg-rose-50 text-rose-700";
  }
}

function crowdLevelFromPercentile(percentile: number | null | undefined): {
  label: "Low" | "Medium" | "High" | "Very High" | "Unknown";
  tone: ChipTone;
} {
  if (percentile == null) return { label: "Unknown", tone: "soft" };
  if (percentile >= 0.75) return { label: "Very High", tone: "alert" };
  if (percentile >= 0.5) return { label: "High", tone: "warn" };
  if (percentile >= 0.25) return { label: "Medium", tone: "soft" };
  return { label: "Low", tone: "calm" };
}
/**
 * Resolve the exit-complexity level + provenance for display. Prefers
 * the live `exitComplexitySignal.derivedLevel` when status is success or
 * partial; otherwise falls back to the editorial `exitComplexityLevel`.
 * Missing data is shown as "Editorial fallback" rather than "Unknown".
 */
function exitComplexityDisplay(
  signal: StayAreaSignalsFile["areas"][string] | undefined,
  fallback: ExitComplexityLevel,
): {
  level: ExitComplexityLevel;
  fromData: boolean;
  exitCount: number | null;
  coverage: number;
} {
  const sig = signal?.exitComplexitySignal;
  if (
    sig &&
    (sig.status === "success" || sig.status === "partial") &&
    sig.derivedLevel != null
  ) {
    return {
      level: sig.derivedLevel,
      fromData: true,
      exitCount: sig.exitCount,
      coverage: sig.sourceCoverage,
    };
  }
  return { level: fallback, fromData: false, exitCount: null, coverage: 0 };
}
/**
 * Display the step-free signal as a row chip / detail row.
 * Reads the live signal when available; falls back to editorial
 * stepFreeConfidence. Missing data is shown as "Not live yet" (not
 * "Unknown") so travellers don't misread it as a problem with the area.
 */
function stepFreeDisplay(
  signal: StayAreaSignalsFile["areas"][string] | undefined,
  fallback: StepFreeConfidence,
): { label: "Known" | "Partial" | "Not live yet"; tone: ChipTone } {
  const sf = signal?.stepFreeSignal;
  if (sf?.status === "success" && sf.elevatorSignal === "known") {
    return { label: "Known", tone: "calm" };
  }
  if (sf?.status === "partial" || sf?.elevatorSignal === "partial") {
    return { label: "Partial", tone: "warn" };
  }
  if (fallback === "Known") return { label: "Known", tone: "calm" };
  if (fallback === "Partial") return { label: "Partial", tone: "warn" };
  return { label: "Not live yet", tone: "soft" };
}
function hotelChoiceShortLabelKey(level: LodgingDensityLevel): "veryDense" | "many" | "some" | "limited" {
  switch (level) {
    case "Very High": return "veryDense";
    case "High": return "many";
    case "Medium": return "some";
    case "Low": return "limited";
  }
}

function areaGroupLabel(areaGroup: string, t: Translation): string {
  const key = areaGroup
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return t(`areaGroups.${key}`);
}

function fitReasonKeys(area: StayAreaBase, score: ComputedStayAreaScore): string[] {
  const reasons: string[] = [];
  if (score.scores.airportAccess >= 82) reasons.push("airportAccess");
  if (score.scores.luggageFriendly >= 82) reasons.push("luggage");
  if (score.scores.shinkansenAccess >= 82) reasons.push("shinkansen");
  if (score.scores.stationSimplicity >= 78) reasons.push("stationSimplicity");
  if (score.scores.localFeel >= 80) reasons.push("localFeel");
  if (score.scores.touristAccess >= 82) reasons.push("sightseeing");
  if (area.lodgingDensityLevel === "Very High" || area.lodgingDensityLevel === "High") reasons.push("hotelChoice");
  if (reasons.length === 0) reasons.push("balancedBase");
  return [...new Set(reasons)].slice(0, 4);
}

function watchOutKeys(area: StayAreaBase, score: ComputedStayAreaScore): string[] {
  const items: string[] = [];
  if (score.scores.stationSimplicity < 55) items.push("stationComplexity");
  if (score.scores.crowdStress < 55) items.push("crowds");
  if (score.scores.airportAccess < 65) items.push("airportTransfers");
  if (score.scores.shinkansenAccess < 65) items.push("shinkansen");
  if (area.lodgingDensityLevel === "Low") items.push("limitedHotels");
  if (score.scores.localFeel < 60) items.push("businesslike");
  if (items.length === 0) items.push("exactHotelLocation");
  return [...new Set(items)].slice(0, 4);
}

function areaSummary(area: StayAreaBase, score: ComputedStayAreaScore, t: Translation): string {
  const group = areaGroupLabel(area.areaGroup, t);
  if (score.scores.luggageFriendly >= 82 && score.scores.airportAccess >= 80) {
    return t("areaCopy.summaryAirportLuggage", { area: area.displayName, group });
  }
  if (score.scores.shinkansenAccess >= 84) {
    return t("areaCopy.summaryRail", { area: area.displayName, group });
  }
  if (score.scores.localFeel >= 80) {
    return t("areaCopy.summaryLocal", { area: area.displayName, group });
  }
  return t("areaCopy.summaryDefault", { area: area.displayName, group });
}

function areaWhy(area: StayAreaBase, score: ComputedStayAreaScore, t: Translation): string {
  const reasons = fitReasonKeys(area, score).map((key) => t(`areaCopy.reasons.${key}`)).join(", ");
  return t("areaCopy.why", { area: area.displayName, reasons });
}

function translatedFitReasons(area: StayAreaBase, score: ComputedStayAreaScore, t: Translation): string[] {
  return fitReasonKeys(area, score).map((key) => t(`areaCopy.reasons.${key}`));
}

function translatedWatchOuts(area: StayAreaBase, score: ComputedStayAreaScore, t: Translation): string[] {
  return watchOutKeys(area, score).map((key) => t(`areaCopy.watchOut.${key}`));
}

function accessLevelLabel(level: AccessRouteProfile["level"], t: Translation): string {
  return t(`accessLevels.${level.toLowerCase()}`);
}

function exitLevelLabel(level: ExitComplexityLevel, t: Translation): string {
  if (level === "Mega station") return t("exitLevels.megaStation");
  return t(`exitLevels.${level.toLowerCase()}`);
}

function transferLevelLabel(level: StayAreaBase["transferHubLevel"], t: Translation): string {
  if (level === "Very High") return t("transferLevels.veryHigh");
  return t(`transferLevels.${level.toLowerCase()}`);
}

function terminalTypeLabel(value: NetworkComplexitySignal["terminalType"], t: Translation): string {
  return t(`terminalTypes.${value.replace(/-/g, "")}`);
}

function networkComplexityDisplayLabel(signal: NetworkComplexitySignal, t: Translation): string {
  if (signal.terminalType === "mega-terminal") return t("networkLabels.multiOperatorMegaTerminal");
  if (signal.railNetworkType === "airport-rail") return t("networkLabels.airportRail", { terminal: terminalTypeLabel(signal.terminalType, t) });
  if (
    signal.operatorGroups.includes("Tokyo Metro") &&
    signal.lineCount >= 5 &&
    signal.terminalType !== "local-station"
  ) {
    return t("networkLabels.subwayHeavyTransfer");
  }
  return t("networkLabels.general", { terminal: terminalTypeLabel(signal.terminalType, t) });
}

function sourceLabel(sourceId: string, t: Translation): string {
  const key = sourceId.replace(/-/g, "");
  return t(`sourceLabels.${key}`);
}

function cadenceLabel(cadence: string, t: Translation): string {
  return t(`cadences.${cadence}`);
}

function networkComplexityFallback(
  area: StayAreaBase,
  contribution: ComputedStayAreaScore["usabilityContribution"],
): NetworkComplexitySignal {
  const lineCount = new Set((area.stationLines || []).filter(Boolean)).size;
  return {
    status: "success",
    lineCount,
    operatorCount: 0,
    operatorGroups: [],
    railNetworkType: "subway-only",
    multiOperatorFlag: false,
    terminalType: area.complexityTags.includes("mega-terminal")
      ? "mega-terminal"
      : area.transferHubLevel === "High" || area.transferHubLevel === "Very High"
        ? "terminal"
        : lineCount >= 3
          ? "interchange"
          : "local-station",
    scoreContribution: contribution.lineOperator,
    message: "Derived from curated station line data.",
  };
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span>{Math.round(value)}/100</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#168a56]" style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function StationUsabilityRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 text-xs last:border-b-0">
      <div className="min-w-0">
        <p className="font-semibold text-slate-700">{label}</p>
        {hint ? <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{hint}</p> : null}
      </div>
      <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
}

function StationUsabilityPanel({
  area,
  signal,
  contribution,
  t,
}: {
  area: StayAreaBase;
  signal: StayAreaSignalsFile["areas"][string] | undefined;
  contribution: ComputedStayAreaScore["usabilityContribution"];
  t: Translation;
}) {
  const percentile = signal?.passengerSignal?.crowdPercentile ?? null;
  const passengerStatus = signal?.passengerSignal?.status;
  const crowd = crowdLevelFromPercentile(percentile);

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-[#106b43]">
        <Users className="h-4 w-4" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950">{t("stationUsability.title")}</h3>
      </div>
      <div className="mt-2 grid">
        <StationUsabilityRow
          label={t("stationUsability.passenger")}
          value={
            percentile == null
              ? t("common.unknown")
              : t("stationUsability.passengerValue", { percentile: (percentile * 100).toFixed(0), crowd: t(`crowd.${crowdLabelKey(crowd.label)}`) })
          }
          hint={
            signal?.passengerSignal?.value
              ? t("stationUsability.passengerAggregated", { count: signal.passengerSignal.value.toLocaleString(), sources: (signal.passengerSignal.operatorSources ?? []).join(", ") })
              : passengerStatus === "skipped"
                ? t("stationUsability.sourceSkipped")
                : t("stationUsability.noPassengerData")
          }
        />
        {(() => {
          const ex = exitComplexityDisplay(signal, area.exitComplexityLevel);
          const detail =
            ex.fromData && ex.exitCount != null
              ? t("stationUsability.exitDataHint", {
                  exits: ex.exitCount,
                  coverage: ex.coverage < 1 ? t("stationUsability.partialCoverage", { coverage: Math.round(ex.coverage * 100) }) : "",
                })
              : t("stationUsability.exitFallbackHint");
          return (
            <StationUsabilityRow
                label={t("stationUsability.exit")}
                value={exitLevelLabel(ex.level, t)}
                hint={`${detail} · ${t("stationUsability.contribution", { value: `${contribution.exitComplexity >= 0 ? "+" : ""}${contribution.exitComplexity}` })}`}
            />
          );
        })()}
        {(() => {
          const network =
            signal?.networkComplexitySignal ?? networkComplexityFallback(area, contribution);
          return (
            <>
              <StationUsabilityRow
                label={t("stationUsability.linesOperators")}
                value={t("stationUsability.linesOperatorsValue", { lines: network.lineCount, operators: network.operatorCount })}
                hint={
                  network.operatorGroups.length > 0
                    ? t("stationUsability.operatorGroups", { groups: network.operatorGroups.join(", ") })
                    : t("stationUsability.operatorGroupsInferred")
                }
              />
              <StationUsabilityRow
                label={t("stationUsability.terminalType")}
                value={terminalTypeLabel(network.terminalType, t)}
                hint={t("stationUsability.multiOperator", { value: network.multiOperatorFlag ? t("common.yes") : t("common.no") })}
              />
              <StationUsabilityRow
                label={t("stationUsability.networkComplexity")}
                value={networkComplexityDisplayLabel(network, t)}
                hint={`${t("stationUsability.contribution", { value: `${network.scoreContribution >= 0 ? "+" : ""}${network.scoreContribution}` })}. ${t("stationUsability.networkDerivedHint")}`}
              />
            </>
          );
        })()}
        <StationUsabilityRow
          label={t("stationUsability.transferPenalty")}
          value={transferLevelLabel(area.transferHubLevel, t)}
          hint={t("stationUsability.contribution", { value: `${contribution.transferHub >= 0 ? "+" : ""}${contribution.transferHub}` })}
        />
        {(() => {
          const sf = signal?.stepFreeSignal;
          const display = stepFreeDisplay(signal, area.stepFreeConfidence);
          let hint = t("stationUsability.stepFreeDefaultHint");
          if (sf?.status === "success" || sf?.status === "partial") {
            hint = t("stationUsability.stepFreeSources", { message: sf.message ?? "", sources: sf.sourceIds.join(", ") || "—" });
          } else if (area.stepFreeConfidence !== "Unknown") {
            hint = t("stationUsability.stepFreeEditorialHint");
          }
          return <StationUsabilityRow label={t("stationUsability.stepFree")} value={t(`stepFree.${stepFreeLabelKey(display.label)}`)} hint={hint} />;
        })()}
        <StationUsabilityRow
          label={t("stationUsability.hotelChoice")}
          value={signal?.lodgingDensitySignal?.hotelChoiceLabel ?? t(`hotelChoice.${hotelChoiceShortLabelKey(area.lodgingDensityLevel)}`)}
          hint={
            signal?.lodgingDensitySignal?.message ??
            t("stationUsability.hotelChoiceHint")
          }
        />
      </div>
    </div>
  );
}

function AirportShinkansenAccessPanel({ area, t }: { area: StayAreaBase; t: Translation }) {
  const profiles = area.accessProfiles;
  if (!profiles) return null;
  return (
    <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
      <div className="flex items-center gap-2 text-orange-700">
        <Plane className="h-4 w-4" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950">{t("access.title")}</h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        {t("access.body")}
      </p>
      <div className="mt-2 grid">
        <StationUsabilityRow
          label="Narita"
          value={t("access.transferValue", { level: accessLevelLabel(profiles.narita.level, t), count: profiles.narita.transferCountLabel })}
          hint={t("access.naritaHint")}
        />
        <StationUsabilityRow
          label="Haneda"
          value={t("access.transferValue", { level: accessLevelLabel(profiles.haneda.level, t), count: profiles.haneda.transferCountLabel })}
          hint={t("access.hanedaHint")}
        />
        <StationUsabilityRow
          label="Shinkansen"
          value={t("access.shinkansenValue", { level: accessLevelLabel(profiles.shinkansen.level, t), station: profiles.shinkansen.bestStation })}
          hint={t("access.shinkansenHint")}
        />
      </div>
    </div>
  );
}

function SelectedAreaHotelSearch({
  area,
  locale,
  t,
}: {
  area: StayAreaBase;
  locale: string;
  t: Translation;
}) {
  const hotel = hotelSearchForArea(area, locale, "detail");
  if (!hotel) return null;
  const isBroadAreaFallback = hotel.selectedAreaName !== hotel.areaName;
  const heading = isBroadAreaFallback
    ? t("hotelSearch.headingNear", { area: hotel.selectedAreaName })
    : t("hotelSearch.headingAround", { area: hotel.areaName });

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#106b43]">
        <Building2 className="h-4 w-4" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950">{heading}</h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        {isBroadAreaFallback
          ? t("hotelSearch.fallbackNote", { selected: hotel.selectedAreaName, area: hotel.areaName })
          : t("hotelSearch.note")}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {hotel.providers.map((provider) => (
          <ProviderButton
            key={provider.linkId}
            provider={provider.provider}
            href={provider.href}
            trackingHref={provider.trackingHref}
            placement={provider.placement}
            pagePath={pagePath}
            locale={locale}
            linkId={provider.linkId}
            product="hotel"
            area={hotel.areaName}
            areaId={area.id}
            city={hotel.city}
            subId={provider.subId}
            fullWidth
            className="min-h-11 rounded-xl text-sm"
          >
            {t(`hotelSearch.providers.${provider.provider}`)}
          </ProviderButton>
        ))}
      </div>
      <div className="mt-2 grid gap-2">
        <TrackedStayAreaContinueLink
          href="/local-hotel-picks#hotel-examples-matrix"
          sourcePage={pagePath}
          placement="finder_local_examples_click"
          label={t("hotelSearch.examples")}
          locale={locale}
          areaId={area.id}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          {t("hotelSearch.examples")}
        </TrackedStayAreaContinueLink>
      </div>
    </div>
  );
}

function StationRouteNoteCard({ area, t }: { area: StayAreaBase; t: Translation }) {
  const note = stationRouteNote(area.id, t);
  if (!note) return null;

  return (
    <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
      <div className="flex items-center gap-2 text-sky-800">
        <Signpost className="h-4 w-4" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950">{t("stationRouteNote.title")}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{note}</p>
    </div>
  );
}

function AreaDetailPanel({
  area,
  score,
  signal,
  displayScore,
  locale,
  t,
}: {
  area: StayAreaBase;
  score: ComputedStayAreaScore;
  signal: StayAreaSignalsFile["areas"][string] | undefined;
  displayScore: number;
  locale: string;
  t: Translation;
}) {
  const tone = matchLabelTone(score.matchLabel, t);
  const tier = fitTier(displayScore, t);
  return (
    <section id="selected-area" className="scroll-mt-24 rounded-[24px] border border-orange-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-4 ring-orange-50 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">{t("selected.eyebrow")}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{area.displayName}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {area.japaneseName} · {areaGroupLabel(area.areaGroup, t)}
          </p>
        </div>
        <div className="rounded-2xl bg-[#ff7a00] px-4 py-3 text-center text-white shadow-sm">
          <p className="text-2xl font-black leading-none">{displayScore}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em]">/100</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tier.className}`}>
          {tier.label}
        </span>
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tone.cls}`}>
          {tone.text}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-700">{areaSummary(area, score, t)}</p>

      <div className="mt-5 grid gap-2">
        {scoreLabels.map(({ key, label }) => (
          <ScoreBar key={key} label={t(`scoreLabels.${label}`)} value={score.scores[key]} />
        ))}
      </div>

      <StationUsabilityPanel area={area} signal={signal} contribution={score.usabilityContribution} t={t} />
      <AirportShinkansenAccessPanel area={area} t={t} />
      <StationRouteNoteCard area={area} t={t} />
      <SelectedAreaHotelSearch area={area} locale={locale} t={t} />

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{t("selected.bestFor")}</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-700">
            {translatedFitReasons(area, score, t).map((item) => (<li key={item}>· {item}</li>))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{t("selected.watchOut")}</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-700">
            {translatedWatchOuts(area, score, t).map((item) => (<li key={item}>· {item}</li>))}
          </ul>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <h3 className="text-sm font-semibold text-slate-950">{t("selected.why")}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{areaWhy(area, score, t)}</p>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        {t("selected.confidence", { label: score.confidence.label, score: score.confidence.score, freshness: score.sourceFreshness.label })}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {t("selected.displayScoreNote", { score: score.overallScore })}
      </p>
    </section>
  );
}

// ---------- Station usability signals dashboard tiles ---------------------

type SignalTileProps = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  status: string;
  statusTone: ChipTone;
  body: string;
};

function SignalTile({ icon: Icon, title, status, statusTone, body }: SignalTileProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[#106b43]">
          <Icon className="h-4 w-4" aria-hidden />
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${chipToneClass(statusTone)}`}>
          {status}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{body}</p>
    </div>
  );
}

function StationSignalTiles({
  core,
  passengerSummary,
  generatedScoreCount,
  t,
}: {
  core: ReturnType<typeof deriveCoreSignals>;
  passengerSummary: string;
  generatedScoreCount: number;
  t: Translation;
}) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <SignalTile
        icon={Users}
        title={t("signalTiles.passenger.title")}
        status={displayStatus(core.passengerStatus.label, t)}
        statusTone={core.passengerStatus.tone}
        body={passengerSummary}
      />
      <SignalTile
        icon={DoorOpen}
        title={t("signalTiles.exit.title")}
        status={displayStatus(core.exitStatus.label, t)}
        statusTone={core.exitStatus.tone}
        body={
          core.exitMatchedAreas > 0
            ? t("signalTiles.exit.bodyMatched", { matched: core.exitMatchedAreas, count: generatedScoreCount })
            : t("signalTiles.exit.bodyFallback")
        }
      />
      <SignalTile
        icon={Train}
        title={t("signalTiles.lines.title")}
        status={t("status.activeFromAreaData")}
        statusTone="calm"
        body={t("signalTiles.lines.body")}
      />
      <SignalTile
        icon={Luggage}
        title={t("signalTiles.stepFree.title")}
        status={displayStatus(core.stepFree.label, t)}
        statusTone={core.stepFree.tone}
        body={
          core.stepFreeAreas > 0
            ? t("signalTiles.stepFree.bodyMatched", { matched: core.stepFreeAreas, count: generatedScoreCount })
            : t("signalTiles.stepFree.bodyFallback")
        }
      />
      <SignalTile
        icon={Plane}
        title={t("signalTiles.access.title")}
        status={t("status.routeLogic")}
        statusTone="calm"
        body={t("signalTiles.access.body")}
      />
      <SignalTile
        icon={Building2}
        title={t("signalTiles.hotelChoice.title")}
        status={displayStatus(core.lodgingStatus.label, t)}
        statusTone={core.lodgingStatus.tone}
        body={t("signalTiles.hotelChoice.body")}
      />
    </div>
  );
}

function deriveCoreSignals(
  sources: SignalsSourceEntry[],
  signals: StayAreaSignalsFile,
) {
  const get = (id: string) => sources.find((s) => s.sourceId === id);
  const tokyoMetroPax = get("tokyo-metro-passengers");
  const toeiPax = get("toei-passengers");
  const tmBarrier = get("tokyo-metro-barrier-free");
  const toeiBarrier = get("toei-barrier-free");
  const tmExits = get("tokyo-metro-station-exits");
  const toeiExits = get("toei-station-exits");
  const lodging = get("tokyo-lodging-facilities");

  const passengerStatus =
    tokyoMetroPax?.status === "success" && toeiPax?.status === "success"
      ? { label: "Success", tone: "calm" as ChipTone }
      : tokyoMetroPax?.status === "success" || toeiPax?.status === "success"
        ? { label: "Partial", tone: "warn" as ChipTone }
        : { label: "Skipped", tone: "soft" as ChipTone };

  // Step-free status reflects both the upstream sources AND how many areas
  // actually have stepFreeSignal coverage. If at least one operator source
  // succeeded and any areas matched: success / partial; otherwise next.
  const stepFreeAreas = Object.values(signals.areas).filter(
    (a) => a.stepFreeSignal?.status === "success" || a.stepFreeSignal?.status === "partial",
  ).length;
  const anyBarrierSourceOk =
    tmBarrier?.status === "success" || toeiBarrier?.status === "success";
  const bothBarrierSourcesOk =
    tmBarrier?.status === "success" && toeiBarrier?.status === "success";
  const stepFree = !anyBarrierSourceOk
    ? { label: "Not live yet", tone: "soft" as ChipTone }
    : bothBarrierSourcesOk && stepFreeAreas > 0
      ? { label: "Success", tone: "calm" as ChipTone }
      : stepFreeAreas > 0
        ? { label: "Partial", tone: "warn" as ChipTone }
        : { label: "Not live yet", tone: "soft" as ChipTone };

  const lodgingStatus =
    Object.values(signals.areas).some((a) => a.lodgingDensitySignal?.status === "editorial")
      ? { label: "Editorial signal", tone: "calm" as ChipTone }
      : lodging?.status === "success"
        ? { label: "Active", tone: "calm" as ChipTone }
        : { label: "Next", tone: "soft" as ChipTone };

  // Exit-complexity status reflects both the upstream Tokyo Metro feed and
  // how many areas actually had matched stations. Toei has no comparable
  // feed yet — full success requires both, partial allows one.
  const exitMatchedAreas = Object.values(signals.areas).filter(
    (a) => a.exitComplexitySignal?.status === "success" || a.exitComplexitySignal?.status === "partial",
  ).length;
  const tmExitsOk = tmExits?.status === "success";
  const toeiExitsOk = toeiExits?.status === "success";
  const exitStatus = !tmExitsOk && !toeiExitsOk
    ? { label: "Editorial fallback", tone: "soft" as ChipTone }
    : tmExitsOk && toeiExitsOk && exitMatchedAreas > 0
      ? { label: "Success", tone: "calm" as ChipTone }
      : exitMatchedAreas > 0
        ? { label: "Partial", tone: "warn" as ChipTone }
        : { label: "Editorial fallback", tone: "soft" as ChipTone };

  return {
    passengerStatus,
    stepFree,
    stepFreeAreas,
    exitStatus,
    exitMatchedAreas,
    tmExits,
    lodgingStatus,
    tokyoMetroPax,
    toeiPax,
  };
}

export default async function TokyoStayAreaIndexPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { filter, area } = await searchParams;
  const t = await getTranslations({ locale, namespace: "tokyoStayAreaIndex" });
  const activeFilter = parseFilter(filter);

  const baselineScores = scoresFile.areas;
  const computedScores = applyFilterBoost(baselineScores, activeFilter);
  const rankedAreas = computedScores
    .map((score) => {
      const areaItem = areaById(score.id);
      const signal = signalsFile.areas[score.id];
      return {
        area: areaItem,
        score,
        signal,
        displayScore: deriveDisplayFitScore({ area: areaItem, score, signal }),
      };
    })
    .sort((a, b) => b.displayScore - a.displayScore || b.score.overallScore - a.score.overallScore);
  const selected = rankedAreas.find((item) => item.area.id === area) ?? rankedAreas[0];
  const selectedFromQuery = Boolean(area && rankedAreas.some((item) => item.area.id === area));
  const finderAreas: FinderArea[] = rankedAreas.map(({ area: areaItem, score, displayScore }) => ({
    id: areaItem.id,
    displayName: areaItem.displayName,
    japaneseName: areaItem.japaneseName,
    areaGroup: areaGroupLabel(areaItem.areaGroup, t),
    stationNames: areaItem.stationNames,
    displayScore,
    rawScore: score.overallScore,
    detailHref: finderAreaDetailHref(locale, areaItem.id),
    summary: areaSummary(areaItem, score, t),
    stationRouteNote: stationRouteNote(areaItem.id, t),
    bestFor: translatedFitReasons(areaItem, score, t),
    watchOut: translatedWatchOuts(areaItem, score, t),
    tags: translatedFitReasons(areaItem, score, t).slice(0, 4),
    detailHotel: hotelSearchForFinderArea(areaItem, locale, "detail"),
    scores: {
      stationSimplicity: score.scores.stationSimplicity,
      luggageFriendly: score.scores.luggageFriendly,
      airportAccess: score.scores.airportAccess,
      shinkansenAccess: score.scores.shinkansenAccess,
      touristAccess: score.scores.touristAccess,
      localFeel: score.scores.localFeel,
      crowdStress: score.scores.crowdStress,
      lodgingChoice: score.scores.lodgingChoice,
    },
    hotel: hotelSearchForFinderArea(areaItem, locale, "top3"),
  }));
  const finderCopy = t.raw("finder") as ComponentProps<typeof TokyoHotelAreaFinder>["copy"];
  const generatedScoreCount = scoresFile.areas.length;
  const lastChecked = formatLastChecked(sourceStatusFile.generatedAt);

  const core = deriveCoreSignals(sourceStatusFile.sources, signalsFile);
  const passengerSummary =
    core.tokyoMetroPax?.status === "success" && core.toeiPax?.status === "success"
      ? t("dataNote.passengerSummarySuccess", { metro: core.tokyoMetroPax.records ?? "?", toei: core.toeiPax.records ?? "?" })
      : t("dataNote.passengerSummaryFallback", {
          metro: displayStatus(statusLabel(core.tokyoMetroPax?.status ?? "skipped"), t),
          toei: displayStatus(statusLabel(core.toeiPax?.status ?? "skipped"), t),
        });

  const matchedCount = baselineScores.filter((s) => s.matchLabel === "public-data-matched").length;
  const partialCount = baselineScores.filter((s) => s.matchLabel === "partial-public-data").length;
  const fallbackCount = baselineScores.filter((s) => s.matchLabel === "editorial-fallback").length;

  return (
    <main className="min-h-screen bg-[#fffaf2] text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.07)] md:p-8">
          <p className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#106b43]">
            {t("hero.eyebrow")}
          </p>
          <div className="mt-5">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">{t("hero.title")}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                {t("hero.body")}
              </p>
              <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-500">
                {t("hero.disclaimer")}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <TrackedStayAreaContinueLink
                  href="#finder"
                  sourcePage={pagePath}
                  placement="finder_start_click"
                  label={t("hero.startCta")}
                  locale={locale}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#106b43] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#0b5736]"
                >
                  {t("hero.startCta")}
                </TrackedStayAreaContinueLink>
                <TrackedStayAreaContinueLink
                  href="/local-hotel-picks#hotel-examples-matrix"
                  sourcePage={pagePath}
                  placement="finder_local_examples_click"
                  label={t("hero.localExamplesCta")}
                  locale={locale}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {t("hero.localExamplesCta")}
                </TrackedStayAreaContinueLink>
              </div>
            </div>
          </div>
        </section>

        <TokyoHotelAreaFinder
          areas={finderAreas}
          locale={locale}
          pagePath={pagePath}
          copy={finderCopy}
        />

        {selectedFromQuery ? (
          <section className="mt-8">
            <AreaDetailPanel
              area={selected.area}
              score={selected.score}
              signal={selected.signal}
              displayScore={selected.displayScore}
              locale={locale}
              t={t}
            />
          </section>
        ) : null}

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <details className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center gap-2 text-[#106b43]">
                <BarChart3 className="h-5 w-5" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">{t("methodology.title")}</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("methodology.summary")}</p>
            </summary>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
              <p>{t("methodology.p1")}</p>
              <p>{t("methodology.p2")}</p>
              <p>{t("methodology.p3")}</p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <InfoCard icon={Users} title={t("methodology.cards.crowd.title")} body={t("methodology.cards.crowd.body")} />
              <InfoCard icon={DoorOpen} title={t("methodology.cards.complexity.title")} body={t("methodology.cards.complexity.body")} />
              <InfoCard icon={Train} title={t("methodology.cards.lines.title")} body={t("methodology.cards.lines.body")} />
              <InfoCard icon={Signpost} title={t("methodology.cards.transfer.title")} body={t("methodology.cards.transfer.body")} />
            </div>
            <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
              <h3 className="text-sm font-semibold text-slate-950">{t("stationRouteNote.commonTitle")}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">{t("stationRouteNote.commonBody")}</p>
            </div>
            <details className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-950">{t("methodology.detailsTitle")}</summary>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {t("methodology.detailsBody")}
              </p>
              <StationSignalTiles
                core={core}
                passengerSummary={passengerSummary}
                generatedScoreCount={generatedScoreCount}
                t={t}
              />
              <p className="mt-4 text-xs leading-5 text-slate-500">
                {t("methodology.coverage", { count: generatedScoreCount, matched: matchedCount, partial: partialCount, fallback: fallbackCount })}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {t("methodology.internalDatasets")}
              </p>
            </details>
          </details>

          <details className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center gap-2 text-[#106b43]">
                <MapPin className="h-5 w-5" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-slate-950">{t("dataNote.title")}</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("dataNote.summary")}</p>
            </summary>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              {t("dataNote.body")}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {t.rich("dataNote.currentMode", {
                mode: signalsFile.mode,
                date: lastChecked,
                strong: (chunks) => <span className="font-semibold">{chunks}</span>,
              })}
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{t("dataNote.registryTitle")}</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
                {tokyoStayAreaSourceRegistry
                  .filter((source) => source.usedInScore)
                  .map((source) => (
                  <li key={source.id}>
                    · {sourceLabel(source.id, t)}{" "}
                    <span className="text-slate-400">
                      ({cadenceLabel(source.expectedUpdateCadence, t)}, {source.status === "live" ? t("dataNote.fetchedLocally") : t("dataNote.registeredOnly")})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-slate-500">
                {t("dataNote.otherDatasets")}
              </p>
            </div>
          </details>
        </section>

        <FujiseatAreaLogic
          sourcePage={pagePath}
          placement="tokyo_stay_area_index_area_logic"
          locale={locale}
          className="mt-6"
          showFinderLink={false}
        />

        <section className="mt-10 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("continue.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <TrackedStayAreaContinueLink
              href="/areas-to-stay/tokyo-first-time"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label={t("continue.links.firstTime")}
              locale={locale}
              areaId={selected.area.id}
              className="rounded-2xl border border-[#106b43] bg-[#168a56] p-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {t("continue.links.firstTime")}
            </TrackedStayAreaContinueLink>
            <TrackedStayAreaContinueLink
              href="/areas-to-stay/where-to-stay-before-shinkansen"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label={t("continue.links.shinkansen")}
              locale={locale}
              areaId={selected.area.id}
              className="rounded-2xl border border-[#106b43] bg-[#168a56] p-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {t("continue.links.shinkansen")}
            </TrackedStayAreaContinueLink>
            <TrackedStayAreaContinueLink
              href="/airport-transfers"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label={t("continue.links.airport")}
              locale={locale}
              areaId={selected.area.id}
              className="rounded-2xl border border-[#106b43] bg-[#168a56] p-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {t("continue.links.airport")}
            </TrackedStayAreaContinueLink>
            <TrackedStayAreaContinueLink
              href="/local-hotel-picks#hotel-examples-matrix"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label={t("continue.links.examples")}
              locale={locale}
              areaId={selected.area.id}
              className="rounded-2xl border border-[#106b43] bg-[#168a56] p-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {t("continue.links.examples")}
            </TrackedStayAreaContinueLink>
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: typeof Luggage; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#106b43]" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-slate-600">{body}</p>
    </div>
  );
}
