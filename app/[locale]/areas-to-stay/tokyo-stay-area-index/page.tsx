import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Building2,
  DoorOpen,
  Luggage,
  MapPin,
  Plane,
  ShieldCheck,
  Signpost,
  Train,
  Users,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { FujiseatAreaLogic } from "@/components/content/FujiseatAreaLogic";
import { ProviderButton, type ProviderId } from "@/components/ui/ProviderButton";
import { getAlternates } from "@/i18n/hreflang";
import { tokyoStayAreasBase } from "@/data/stay-area/tokyo-areas.base";
import signalsJson from "@/data/generated/tokyo-stay-area-signals.json";
import scoresJson from "@/data/generated/tokyo-stay-area-scores.json";
import sourceStatusJson from "@/data/generated/tokyo-stay-area-source-status.json";
import { tokyoStayAreaSourceRegistry } from "@/data/stay-area/source-registry";
import { getAgodaHotelAreaUrl, getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
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
  TrackedStayAreaDetailLink,
  TrackedStayAreaFilterLink,
} from "./StayAreaIndexTracking";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string; area?: string }>;
};

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
  { key: "stationSimplicity", label: "Station simplicity" },
  { key: "luggageFriendly", label: "Luggage-friendly" },
  { key: "airportAccess", label: "Airport access" },
  { key: "shinkansenAccess", label: "Shinkansen access" },
  { key: "touristAccess", label: "Tourist access" },
  { key: "localFeel", label: "Local feel" },
  { key: "crowdStress", label: "Less crowd stress" },
  { key: "lodgingChoice", label: "Lodging choice density" },
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

const FRESHNESS_HEADLINE = "Passenger-data-informed local refresh";
const FRESHNESS_SUBLINE =
  "Passenger volume, Toei step-free / elevator data, and Tokyo Metro per-station exit counts refresh when public sources update.";
const FRESHNESS_TAIL = "Tokyo Metro accessibility, Toei exit lists, and lodging-density sources are not yet live.";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Tokyo Hotel Area Finder: Compare Station Areas Before Booking Hotels",
    description:
      "Compare 36 Tokyo station areas by luggage-friendliness, airport access, station complexity, Shinkansen fit, and hotel choice density before booking hotels.",
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates(pagePath, locale),
    openGraph: {
      title: "Tokyo Hotel Area Finder",
      description:
        "Compare Tokyo station areas before booking hotels using fujiseat's station-area logic.",
      siteName: "fujiseat",
    },
  };
}

function areaById(id: string): StayAreaBase {
  const area = tokyoStayAreasBase.find((item) => item.id === id);
  if (!area) throw new Error(`Missing Tokyo stay area base data for ${id}`);
  return area;
}

function hotelSearchForArea(area: StayAreaBase) {
  const hotelAreaKey = hotelAreaKeyByStayAreaId[area.id];
  if (!hotelAreaKey) return null;
  const hotel = getHotelLink(hotelAreaKey);
  const config = getTripHotelConfig(hotelAreaKey);
  const tripHref = hotel.provider === "trip" ? hotel.href : config.tripUrl.trim();
  const tripTrackingHref = hotel.provider === "trip" ? hotel.trackingHref : config.tripUrl.trim();
  const agodaLink = getAgodaHotelAreaUrl(hotelAreaKey);
  const providers = [
    tripHref && tripHref !== "#"
      ? {
          provider: "trip" as ProviderId,
          href: tripHref,
          trackingHref: tripTrackingHref,
          label: "Search this area on Trip.com",
          linkId: `hotelArea.${hotelAreaKey}.trip`,
        }
      : null,
    agodaLink && agodaLink.href !== "#"
      ? {
          provider: "agoda" as ProviderId,
          href: agodaLink.href,
          trackingHref: agodaLink.trackingHref,
          label: "Search this area on Agoda",
          linkId: agodaLink.linkId,
        }
      : null,
  ].filter((provider): provider is {
    provider: ProviderId;
    href: string;
    trackingHref: string;
    label: string;
    linkId: string;
  } => Boolean(provider));

  if (providers.length === 0) return null;
  return {
    hotelAreaKey,
    areaName: config.areaName,
    selectedAreaName: area.displayName,
    city: config.city,
    providers,
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

function fitTier(displayScore: number): { label: string; tone: ChipTone; className: string } {
  if (displayScore >= 85) {
    return {
      label: "Excellent fit",
      tone: "calm",
      className: "border-emerald-200 bg-emerald-50 text-[#106b43]",
    };
  }
  if (displayScore >= 75) {
    return {
      label: "Strong fit",
      tone: "calm",
      className: "border-emerald-100 bg-emerald-50 text-[#106b43]",
    };
  }
  if (displayScore >= 65) {
    return {
      label: "Good with trade-offs",
      tone: "soft",
      className: "border-slate-200 bg-slate-50 text-slate-700",
    };
  }
  if (displayScore >= 55) {
    return {
      label: "Situational",
      tone: "warn",
      className: "border-amber-100 bg-amber-50 text-amber-800",
    };
  }
  return {
    label: "Hard for first-time / luggage-heavy trips",
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

function filterHref(locale: string, filter: FilterKey): string {
  return localizedIndexHref(locale, filter === "all" ? "#ranked-areas" : `?filter=${filter}#ranked-areas`);
}

function areaDetailHref(locale: string, filter: FilterKey, areaId: string): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
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

function matchLabelTone(label: StayAreaMatchLabel): { text: string; cls: string } {
  if (label === "public-data-matched")
    return { text: "Public data matched", cls: "bg-emerald-50 text-[#106b43] border-emerald-100" };
  if (label === "partial-public-data")
    return { text: "Partial public data", cls: "bg-amber-50 text-amber-800 border-amber-100" };
  return { text: "Editorial fallback", cls: "bg-slate-100 text-slate-600 border-slate-200" };
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
function complexityChipTone(level: ExitComplexityLevel): ChipTone {
  if (level === "Mega station") return "alert";
  if (level === "Complex") return "warn";
  if (level === "Moderate") return "soft";
  return "calm";
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
function lodgingChipTone(level: LodgingDensityLevel): ChipTone {
  if (level === "Very High" || level === "High") return "calm";
  if (level === "Medium") return "soft";
  return "warn";
}

function hotelChoiceShortLabel(level: LodgingDensityLevel): string {
  switch (level) {
    case "Very High": return "Very dense";
    case "High": return "Many";
    case "Medium": return "Some";
    case "Low": return "Limited";
  }
}

function formatHyphenLabel(value: string): string {
  return value.replace(/-/g, " ");
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

function networkComplexityLabel(signal: NetworkComplexitySignal): string {
  if (signal.terminalType === "mega-terminal") return "multi-operator mega-terminal";
  if (signal.railNetworkType === "airport-rail") return `airport-rail ${formatHyphenLabel(signal.terminalType)}`;
  if (
    signal.operatorGroups.includes("Tokyo Metro") &&
    signal.lineCount >= 5 &&
    signal.terminalType !== "local-station"
  ) {
    return "subway-heavy transfer complex";
  }
  return `${formatHyphenLabel(signal.railNetworkType)} ${formatHyphenLabel(signal.terminalType)}`;
}

function activeAccessBadge(area: StayAreaBase, filter: FilterKey): string | null {
  const profiles = area.accessProfiles;
  if (!profiles) return null;
  if (filter === "narita-arrival" && (profiles.narita.level === "Excellent" || profiles.narita.level === "Good")) {
    return profiles.narita.level === "Excellent" ? "Strong Narita access" : "Good Narita access";
  }
  if (filter === "haneda-arrival" && (profiles.haneda.level === "Excellent" || profiles.haneda.level === "Good")) {
    return profiles.haneda.level === "Excellent" ? "Strong Haneda access" : "Good Haneda arrival";
  }
  if (filter === "shinkansen" && (profiles.shinkansen.level === "Excellent" || profiles.shinkansen.level === "Good")) {
    return "Shinkansen-friendly";
  }
  return null;
}

function Chip({
  label,
  value,
  tone,
  hideOnMobile,
}: {
  label: string;
  value: string;
  tone: ChipTone;
  hideOnMobile?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        chipToneClass(tone),
        hideOnMobile ? "hidden md:inline-flex" : "",
      ].join(" ")}
    >
      <span className="text-[9px] uppercase tracking-[0.1em] opacity-70">{label}</span>
      <span>{value}</span>
    </span>
  );
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
}: {
  area: StayAreaBase;
  signal: StayAreaSignalsFile["areas"][string] | undefined;
  contribution: ComputedStayAreaScore["usabilityContribution"];
}) {
  const percentile = signal?.passengerSignal?.crowdPercentile ?? null;
  const passengerStatus = signal?.passengerSignal?.status;
  const crowd = crowdLevelFromPercentile(percentile);

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-[#106b43]">
        <Users className="h-4 w-4" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950">Station usability</h3>
      </div>
      <div className="mt-2 grid">
        <StationUsabilityRow
          label="Passenger volume percentile"
          value={
            percentile == null
              ? "Unknown"
              : `${(percentile * 100).toFixed(0)}th · ${crowd.label}`
          }
          hint={
            signal?.passengerSignal?.value
              ? `Aggregated ${signal.passengerSignal.value.toLocaleString()} (${(signal.passengerSignal.operatorSources ?? []).join(", ")})`
              : passengerStatus === "skipped"
                ? "Source skipped this run."
                : "No passenger data matched this area."
          }
        />
        {(() => {
          const ex = exitComplexityDisplay(signal, area.exitComplexityLevel);
          const detail =
            ex.fromData && ex.exitCount != null
              ? `${ex.exitCount} exits detected${ex.coverage < 1 ? ` (partial — ${Math.round(ex.coverage * 100)}% station coverage)` : ""}. Tokyo Metro live exit feed.`
              : "Editorial fallback (no live exit feed matched this area).";
          return (
            <StationUsabilityRow
              label="Exit / entrance complexity"
              value={ex.level}
              hint={`${detail} · Contribution: ${contribution.exitComplexity >= 0 ? "+" : ""}${contribution.exitComplexity}`}
            />
          );
        })()}
        {(() => {
          const network =
            signal?.networkComplexitySignal ?? networkComplexityFallback(area, contribution);
          return (
            <>
              <StationUsabilityRow
                label="Lines / operators"
                value={`${network.lineCount} lines · ${network.operatorCount} operators`}
                hint={
                  network.operatorGroups.length > 0
                    ? `Operator groups: ${network.operatorGroups.join(", ")}.`
                    : "Operator groups are inferred from curated line names."
                }
              />
              <StationUsabilityRow
                label="Terminal type"
                value={formatHyphenLabel(network.terminalType)}
                hint={`Multi-operator: ${network.multiOperatorFlag ? "yes" : "no"}.`}
              />
              <StationUsabilityRow
                label="Network complexity"
                value={networkComplexityLabel(network)}
                hint={`Contribution: ${network.scoreContribution >= 0 ? "+" : ""}${network.scoreContribution}. ${network.message}`}
              />
            </>
          );
        })()}
        <StationUsabilityRow
          label="Transfer hub penalty"
          value={area.transferHubLevel}
          hint={`Contribution: ${contribution.transferHub >= 0 ? "+" : ""}${contribution.transferHub}`}
        />
        {(() => {
          const sf = signal?.stepFreeSignal;
          const display = stepFreeDisplay(signal, area.stepFreeConfidence);
          let hint = "Step-free route data is used only when a public source is confidently matched. Missing data is not treated as a negative signal.";
          if (sf?.status === "success" || sf?.status === "partial") {
            hint = `${sf.message ?? ""} Sources: ${sf.sourceIds.join(", ") || "—"}.`;
          } else if (area.stepFreeConfidence !== "Unknown") {
            hint = "Editorial confidence label (no live source matched this area).";
          }
          return <StationUsabilityRow label="Step-free / elevator route" value={display.label} hint={hint} />;
        })()}
        <StationUsabilityRow
          label="Hotel choice density"
          value={signal?.lodgingDensitySignal?.hotelChoiceLabel ?? hotelChoiceShortLabel(area.lodgingDensityLevel)}
          hint={
            signal?.lodgingDensitySignal?.message ??
            "Editorial hotel-choice-density signal only. This does not rank individual hotels or show live availability."
          }
        />
      </div>
    </div>
  );
}

function AirportShinkansenAccessPanel({ area }: { area: StayAreaBase }) {
  const profiles = area.accessProfiles;
  if (!profiles) return null;
  return (
    <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
      <div className="flex items-center gap-2 text-orange-700">
        <Plane className="h-4 w-4" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950">Airport / Shinkansen access</h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        Route logic, not live timetable data. Check current trains before travel.
      </p>
      <div className="mt-2 grid">
        <StationUsabilityRow
          label="Narita"
          value={`${profiles.narita.level} · ${profiles.narita.transferCountLabel} transfers`}
          hint={profiles.narita.note}
        />
        <StationUsabilityRow
          label="Haneda"
          value={`${profiles.haneda.level} · ${profiles.haneda.transferCountLabel} transfers`}
          hint={profiles.haneda.note}
        />
        <StationUsabilityRow
          label="Shinkansen"
          value={`${profiles.shinkansen.level} · ${profiles.shinkansen.bestStation}`}
          hint={profiles.shinkansen.note}
        />
      </div>
    </div>
  );
}

function SelectedAreaHotelSearch({
  area,
  locale,
}: {
  area: StayAreaBase;
  locale: string;
}) {
  const hotel = hotelSearchForArea(area);
  if (!hotel) return null;
  const isBroadAreaFallback = hotel.selectedAreaName !== hotel.areaName;
  const heading = isBroadAreaFallback
    ? `Compare hotels near ${hotel.selectedAreaName}`
    : `Compare hotels around ${hotel.areaName}`;

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#106b43]">
        <Building2 className="h-4 w-4" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-slate-950">{heading}</h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        {isBroadAreaFallback
          ? `Broad area search only. No dedicated ${hotel.selectedAreaName} hotel URL is set yet, so this opens the nearest existing broad search area: ${hotel.areaName}. Check exact station distance, room size, bed setup, and latest price on the provider site.`
          : "Broad area search only. Check exact station distance, room size, bed setup, and latest price on the provider site."}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {hotel.providers.map((provider) => (
          <ProviderButton
            key={provider.linkId}
            provider={provider.provider}
            href={provider.href}
            trackingHref={provider.trackingHref}
            placement="stay_area_hotel_card"
            pagePath={pagePath}
            locale={locale}
            linkId={provider.linkId}
            product="hotel"
            area={hotel.areaName}
            city={hotel.city}
            fullWidth
            className="min-h-11 rounded-xl text-sm"
          >
            {provider.label}
          </ProviderButton>
        ))}
      </div>
      <div className="mt-2 grid gap-2">
        <TrackedStayAreaContinueLink
          href="/local-hotel-picks#hotel-examples-matrix"
          sourcePage={pagePath}
          placement="tokyo_stay_area_index_selected_hotel_search"
          label="See local hotel examples"
          locale={locale}
          areaId={area.id}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          See local hotel examples
        </TrackedStayAreaContinueLink>
      </div>
    </div>
  );
}

function AreaDetailPanel({
  area,
  score,
  signal,
  displayScore,
  locale,
}: {
  area: StayAreaBase;
  score: ComputedStayAreaScore;
  signal: StayAreaSignalsFile["areas"][string] | undefined;
  displayScore: number;
  locale: string;
}) {
  const tone = matchLabelTone(score.matchLabel);
  const tier = fitTier(displayScore);
  return (
    <section id="selected-area" className="scroll-mt-24 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Selected area</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">{area.displayName}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {area.japaneseName} · {area.areaGroup}
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
      <p className="mt-4 text-sm leading-6 text-slate-700">{area.editorial.overallLabel}</p>

      <SelectedAreaHotelSearch area={area} locale={locale} />

      <div className="mt-5 grid gap-2">
        {scoreLabels.map(({ key, label }) => (
          <ScoreBar key={key} label={label} value={score.scores[key]} />
        ))}
      </div>

      <StationUsabilityPanel area={area} signal={signal} contribution={score.usabilityContribution} />
      <AirportShinkansenAccessPanel area={area} />

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Best for</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-700">
            {area.editorial.bestFor.map((item) => (<li key={item}>· {item}</li>))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Watch out</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-700">
            {area.editorial.watchOut.map((item) => (<li key={item}>· {item}</li>))}
          </ul>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <h3 className="text-sm font-semibold text-slate-950">Why this area ranks high</h3>
        <p className="mt-2 text-sm leading-6 text-slate-700">{area.editorial.editorialNote}</p>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">
        Confidence: {score.confidence.label} ({score.confidence.score}/100) · Data freshness: {score.sourceFreshness.label}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        Display fit score adjusts the raw blended score ({score.overallScore}) for station complexity and crowd trade-offs.
      </p>
    </section>
  );
}

function AreaRankRow({
  rank,
  area,
  score,
  signal,
  activeFilter,
  href,
  displayScore,
}: {
  rank: number;
  area: StayAreaBase;
  score: ComputedStayAreaScore;
  signal: StayAreaSignalsFile["areas"][string] | undefined;
  activeFilter: FilterKey;
  href: string;
  displayScore: number;
}) {
  const crowd = crowdLevelFromPercentile(signal?.passengerSignal?.crowdPercentile ?? null);
  const accessBadge = activeAccessBadge(area, activeFilter);
  const exit = exitComplexityDisplay(signal, area.exitComplexityLevel);
  const tier = fitTier(displayScore);
  return (
    <TrackedStayAreaDetailLink
      href={href}
      className="block rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
      areaId={area.id}
      areaName={area.displayName}
      overallScore={displayScore}
      rankPosition={rank}
      matchLabel={score.matchLabel}
      crowdLevel={crowd.label}
      complexityLevel={exit.level}
      pagePath={pagePath}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
            {rank}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-950">{area.displayName}</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {area.stationNames.slice(0, 3).join(" / ")} · {area.areaGroup}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Chip label="Fit" value={tier.label} tone={tier.tone} />
              <Chip label="Crowd" value={crowd.label} tone={crowd.tone} />
              {accessBadge ? <Chip label="Priority" value={accessBadge} tone="calm" /> : null}
              <Chip
                label="Complexity"
                value={exit.level}
                tone={complexityChipTone(exit.level)}
              />
              {(() => {
                const sf = stepFreeDisplay(signal, area.stepFreeConfidence);
                return (
                  <Chip label="Luggage route" value={sf.label} tone={sf.tone} hideOnMobile />
                );
              })()}
              <Chip
                label="Hotel choice"
                value={hotelChoiceShortLabel(area.lodgingDensityLevel)}
                tone={lodgingChipTone(area.lodgingDensityLevel)}
                hideOnMobile
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-3 md:text-center">
          <Metric label="Fit score" value={displayScore} strong />
          <Metric label="Station" value={score.scores.stationSimplicity} />
          <Metric label="Luggage" value={score.scores.luggageFriendly} />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{area.editorial.overallLabel}</p>
      {area.editorial.bestFor.length > 0 && (
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Best for: {area.editorial.bestFor.slice(0, 3).join(" · ")}
        </p>
      )}
    </TrackedStayAreaDetailLink>
  );
}

function Metric({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={["rounded-2xl border px-3 py-2", strong ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-slate-50 text-slate-600"].join(" ")}>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.08em]">{label}</span>
      <span className="mt-0.5 block text-sm font-black">{Math.round(value)}</span>
    </div>
  );
}

function FeaturedAreaCard({ area, score }: { area: StayAreaBase; score: ComputedStayAreaScore }) {
  return (
    <article className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{area.displayName}</h3>
          <p className="mt-1 text-xs text-slate-500">{area.areaGroup}</p>
        </div>
        <span className="rounded-full bg-[#ff7a00] px-3 py-1 text-sm font-bold text-white">{score.overallScore}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{area.editorial.localFeelNote}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {area.editorial.bestFor.slice(0, 3).map((item) => (
          <span key={item} className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#106b43]">
            {item}
          </span>
        ))}
      </div>
    </article>
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
  // succeeded and any areas matched → success / partial; otherwise next.
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
  const activeFilter = parseFilter(filter);

  const baselineScores = scoresFile.areas;
  const computedScores = applyFilterBoost(baselineScores, activeFilter);
  const scoreById = new Map(baselineScores.map((s) => [s.id, s] as const));
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
  const featuredIds = ["oshiage", "kuramae", "ueno"];
  const generatedScoreCount = scoresFile.areas.length;
  const lastChecked = formatLastChecked(sourceStatusFile.generatedAt);

  const core = deriveCoreSignals(sourceStatusFile.sources, signalsFile);
  const passengerSummary =
    core.tokyoMetroPax?.status === "success" && core.toeiPax?.status === "success"
      ? `Tokyo Metro ${core.tokyoMetroPax.records ?? "?"} + Toei ${core.toeiPax.records ?? "?"} records`
      : `Tokyo Metro: ${statusLabel(core.tokyoMetroPax?.status ?? "skipped").toLowerCase()} · Toei: ${statusLabel(core.toeiPax?.status ?? "skipped").toLowerCase()}`;

  const contextSources = sourceStatusFile.sources.filter((s) =>
    ["tokyo-police-crime", "gsi-hazard-portal"].includes(s.sourceId),
  );

  const matchedCount = baselineScores.filter((s) => s.matchLabel === "public-data-matched").length;
  const partialCount = baselineScores.filter((s) => s.matchLabel === "partial-public-data").length;
  const fallbackCount = baselineScores.filter((s) => s.matchLabel === "editorial-fallback").length;

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Areas to stay", href: "/areas-to-stay" },
            { label: "Tokyo Hotel Area Finder" },
          ]}
        />

        <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-orange-700">
            Tokyo hotel area finder
          </p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">Tokyo Hotel Area Finder</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                Compare 36 Tokyo station areas before booking hotels. The finder uses fujiseat&apos;s station-area logic
                to help you weigh luggage stress, airport arrival, Shinkansen days, station complexity, quieter nights,
                and broad hotel choice before opening booking sites.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Station complexity",
                  "Luggage stress",
                  "Airport access",
                  "Shinkansen fit",
                  "Hotel choice density",
                ].map((signal) => (
                  <span key={signal} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    {signal}
                  </span>
                ))}
              </div>
              <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-500">
                Scores are editorial travel-fit scores informed by public data signals where available. They are not
                official ratings, hotel rankings, or guarantees of price, comfort, availability, or route conditions.
              </p>
              <p className="mt-4 text-sm font-semibold text-[#106b43]">
                {FRESHNESS_HEADLINE} · Last source check: {lastChecked}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {FRESHNESS_SUBLINE} {FRESHNESS_TAIL}
              </p>
            </div>
            <a
              href="#ranked-areas"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff7a00] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#e66700]"
            >
              Find hotel-area fit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="mt-6 rounded-[22px] border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-700">Start by travel situation</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Choose the hotel-area problem first</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
            Pick the situation closest to your trip. Filters re-rank the same area data; guide links help when the
            question needs more context than a score.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/areas-to-stay/tokyo-first-time", title: "First time in Tokyo", body: "Compare famous bases and calmer nearby areas.", label: "Tokyo first-time guide" },
              { href: filterHref(locale, "narita-arrival"), title: "Narita arrival", body: "Highlight areas that fit Narita-side arrival logic.", label: "Filter Narita arrival" },
              { href: filterHref(locale, "haneda-arrival"), title: "Haneda arrival", body: "Highlight areas that work better with Haneda.", label: "Filter Haneda arrival" },
              { href: filterHref(locale, "shinkansen"), title: "Early Shinkansen", body: "Prioritize Tokyo / Shinagawa / Ueno rail logistics.", label: "Filter Shinkansen fit" },
              { href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", title: "Large luggage", body: "Use room size, elevators, and walking distance logic.", label: "Luggage guide" },
              { href: filterHref(locale, "avoid-giant-stations"), title: "Avoid giant stations", body: "Lift calmer bases with lower station-complexity stress.", label: "Filter calmer bases" },
              { href: "/local-tokyo", title: "Local Tokyo / quieter base", body: "Use local neighborhood guides after narrowing the area.", label: "Local Tokyo" },
              { href: "/local-hotel-picks#hotel-examples-matrix", title: "Need hotel examples", body: "View examples after choosing the broad station area.", label: "Hotel examples" },
            ].map((item) => (
              <TrackedStayAreaContinueLink
                key={item.title}
                href={item.href}
                sourcePage={pagePath}
                placement="tokyo_stay_area_index_situation"
                label={item.label}
                locale={locale}
                areaId={selected.area.id}
                className="group rounded-2xl border border-orange-100 bg-white p-4 text-left shadow-sm transition-colors hover:bg-orange-50"
              >
                <span className="block text-sm font-semibold text-slate-950 group-hover:text-[#c45500]">{item.title}</span>
                <span className="mt-1.5 block text-xs leading-5 text-slate-600">{item.body}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#c45500]">
                  {item.label}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </TrackedStayAreaContinueLink>
            ))}
          </div>
        </section>

        <FujiseatAreaLogic
          sourcePage={pagePath}
          placement="tokyo_stay_area_index_area_logic"
          locale={locale}
          className="mt-6"
          showFinderLink={false}
        />

        <section className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-slate-950">Travel priority filters</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Choose one priority to highlight areas that fit that situation. This changes the order, not the underlying area data.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ key, label }) => {
              const isActive = key === activeFilter;
              const filtered = applyFilterBoost(baselineScores, key)
                .map((score) => {
                  const areaItem = areaById(score.id);
                  const signal = signalsFile.areas[score.id];
                  return {
                    score,
                    displayScore: deriveDisplayFitScore({ area: areaItem, score, signal }),
                  };
                })
                .sort((a, b) => b.displayScore - a.displayScore || b.score.overallScore - a.score.overallScore);
              const top = filtered[0];
              return (
                <TrackedStayAreaFilterLink
                  key={key}
                  href={filterHref(locale, key)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-[#106b43]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:text-[#106b43]",
                  ].join(" ")}
                  ariaCurrent={isActive ? "true" : undefined}
                  filterId={key}
                  filterLabel={label}
                  pagePath={pagePath}
                  resultCount={filtered.length}
                  topAreaIdAfterFilter={top?.score.id ?? ""}
                  topAreaScoreAfterFilter={top?.displayScore ?? 0}
                >
                  {label}
                </TrackedStayAreaFilterLink>
              );
            })}
          </div>
        </section>

        {/* ============= Station usability signals (replaces "Source status") ============== */}
        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-[#106b43]">
            <BarChart3 className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-950">Station usability signals</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Seven signals drive the score. Passenger volume, Toei step-free / elevator coverage, and Tokyo Metro
            per-station exit counts are live; line / operator complexity and transfer-hub penalty come from
            area data; airport / Shinkansen access uses route logic; lodging density is an editorial hotel-choice signal.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SignalTile
              icon={Users}
              title="Passenger volume"
              status={core.passengerStatus.label}
              statusTone={core.passengerStatus.tone}
              body={passengerSummary}
            />
            <SignalTile
              icon={DoorOpen}
              title="Exit / entrance complexity"
              status={core.exitStatus.label}
              statusTone={core.exitStatus.tone}
              body={
                core.exitMatchedAreas > 0
                  ? `Tokyo Metro exit feed parsed — ${core.exitMatchedAreas} of ${generatedScoreCount} areas now use a live open-exit count (bucketed: ≤4 Simple, 5–8 Moderate, 9–14 Complex, 15+ Mega station). Areas without Tokyo Metro coverage use the editorial level.`
                  : "Editorial tags (Simple / Moderate / Complex / Mega station). Affects station simplicity and lightly affects luggage friendliness."
              }
            />
            <SignalTile
              icon={Train}
              title="Line / operator complexity"
              status="Active from area data"
              statusTone="calm"
              body="Derived from curated stationLines[], operator groups, transfer-hub level, and mega-terminal tags. This is an active local signal, not a failed or skipped public fetch."
            />
            <SignalTile
              icon={Luggage}
              title="Step-free / elevator route"
              status={core.stepFree.label}
              statusTone={core.stepFree.tone}
              body={
                core.stepFreeAreas > 0
                  ? `Toei barrier-free CSVs parsed — ${core.stepFreeAreas} of ${generatedScoreCount} areas have a confirmed step-free route. Missing data is not penalised. Tokyo Metro per-station detail pages are not yet parsed.`
                  : "Step-free route data is used only when a public source is confidently matched. Missing data is not treated as a negative signal."
              }
            />
            <SignalTile
              icon={Signpost}
              title="Transfer hub penalty"
              status="Active"
              statusTone="calm"
              body="Editorial transfer-hub level (Low → Very High). Strongly affects station simplicity and crowd stress for mega hubs."
            />
            <SignalTile
              icon={Plane}
              title="Airport / Shinkansen access"
              status="Route logic"
              statusTone="calm"
              body="Curated accessProfiles explain Narita, Haneda, Tokyo Station, Shinagawa, and Shinkansen fit. No live timetable data is implied."
            />
            <SignalTile
              icon={Building2}
              title="Hotel choice density"
              status={core.lodgingStatus.label}
              statusTone={core.lodgingStatus.tone}
              body="Editorial hotel-choice signal from lodgingDensityLevel. It explains whether nearby hotel search is likely limited, some, many, or very dense. Not live availability and not a hotel ranking."
            />
          </div>

          {/* ============== Context (not scored) ============== */}
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Context (not scored)</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Catalogued for reference. These signals do NOT contribute to the station-area score. We do not label
              areas as safe or dangerous.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {contextSources.map((src) => (
                <SignalTile
                  key={src.sourceId}
                  icon={ShieldCheck}
                  title={src.label}
                  status="Not used in score"
                  statusTone="soft"
                  body={src.message || "Catalogued only. Not displayed as a safety or hazard claim."}
                />
              ))}
            </div>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Coverage across {generatedScoreCount} station areas — public data matched: {matchedCount} · partial: {partialCount} · editorial fallback: {fallbackCount}.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div id="ranked-areas" className="scroll-mt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Decision list</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Station-area fit and trade-offs</h2>
              </div>
              <p className="hidden text-xs font-semibold text-slate-500 md:block">
                {generatedScoreCount} areas · filter: {FILTERS.find((f) => f.key === activeFilter)?.label}
              </p>
            </div>
            <div className="mt-4 grid gap-3">
              {rankedAreas.map(({ area, score, signal, displayScore }, index) => (
                <AreaRankRow
                  key={area.id}
                  rank={index + 1}
                  area={area}
                  score={score}
                  signal={signal}
                  activeFilter={activeFilter}
                  href={areaDetailHref(locale, activeFilter, area.id)}
                  displayScore={displayScore}
                />
              ))}
            </div>
          </div>
          <AreaDetailPanel
            area={selected.area}
            score={selected.score}
            signal={selected.signal}
            displayScore={selected.displayScore}
            locale={locale}
          />
        </section>

        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">Featured area cards</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Good starting points for many travelers</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {featuredIds.map((id) => (
              <FeaturedAreaCard key={id} area={areaById(id)} score={scoreById.get(id) ?? selected.score} />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#106b43]">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-950">How scores work</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <p>This compares station areas, not individual hotels.</p>
              <p>
                Scores blend a 55% editorial travel-fit baseline, 35% station-usability adjustments
                (passenger crowd, exit / entrance complexity, line / operator count, transfer-hub penalty),
                and 10% live status. Each per-sub-score adjustment is capped at ±10.
              </p>
              <p>
                Step-free route confidence is read from Toei&apos;s public barrier-free CSVs where matched, and adds a
                small positive nudge to luggage-friendliness. Exit / entrance complexity is read from Tokyo
                Metro&apos;s public per-station exit feed where matched (open exits are counted and bucketed); areas
                without Tokyo Metro coverage use the editorial level. Missing data is never punished. Hotel choice
                density is editorial and does not evaluate individual hotels. Scores are not official ratings and
                do not rank safety, hotel quality, price, or availability.
              </p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <InfoCard icon={Users} title="Crowd" body="Passenger-data-informed; high volume lowers crowd-stress." />
              <InfoCard icon={DoorOpen} title="Complexity" body="Exit / entrance complexity from Tokyo Metro's exit feed where matched, editorial otherwise." />
              <InfoCard icon={Train} title="Lines" body="More lines / operators lower station simplicity." />
              <InfoCard icon={Signpost} title="Transfer" body="Transfer-hub penalty hits mega interchanges." />
            </div>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[#106b43]">
              <MapPin className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-950">Data freshness / source note</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              fujiseat.com scores are editorial travel-fit scores informed by passenger data. They are not official
              ratings and do not guarantee safety, comfort, hotel quality, price, or availability.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Current mode: <span className="font-semibold">{signalsFile.mode}</span>. Last source check: {lastChecked}.
            </p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Source registry</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600">
                {tokyoStayAreaSourceRegistry.map((source) => (
                  <li key={source.id}>
                    · {source.label}{" "}
                    <span className="text-slate-400">
                      ({source.expectedUpdateCadence}, {source.status === "live" ? "fetched locally" : "registered only"}
                      {source.usedInScore ? "" : " · not used in score"})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Continue planning</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <TrackedStayAreaContinueLink
              href="/areas-to-stay/tokyo-first-time"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label="Where to stay in Tokyo for first-time visitors"
              locale={locale}
              areaId={selected.area.id}
              className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-semibold text-[#106b43] shadow-sm transition-colors hover:bg-emerald-50"
            >
              Where to stay in Tokyo →
            </TrackedStayAreaContinueLink>
            <TrackedStayAreaContinueLink
              href="/airport-transfers"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label="Airport transfer hub"
              locale={locale}
              areaId={selected.area.id}
              className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-semibold text-[#106b43] shadow-sm transition-colors hover:bg-emerald-50"
            >
              Match airport transfer →
            </TrackedStayAreaContinueLink>
            <TrackedStayAreaContinueLink
              href="/areas-to-stay/where-to-stay-before-shinkansen"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label="Tokyo hotel base before Shinkansen"
              locale={locale}
              areaId={selected.area.id}
              className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-semibold text-[#106b43] shadow-sm transition-colors hover:bg-emerald-50"
            >
              Shinkansen hotel base →
            </TrackedStayAreaContinueLink>
            <TrackedStayAreaContinueLink
              href="/areas-to-stay/where-to-stay-in-tokyo-with-luggage"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label="Tokyo hotel area with luggage"
              locale={locale}
              areaId={selected.area.id}
              className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-semibold text-[#106b43] shadow-sm transition-colors hover:bg-emerald-50"
            >
              Luggage-friendly Tokyo base →
            </TrackedStayAreaContinueLink>
            <TrackedStayAreaContinueLink
              href="/local-hotel-picks#hotel-examples-matrix"
              sourcePage={pagePath}
              placement="tokyo_stay_area_index_continue"
              label="Local hotel examples"
              locale={locale}
              areaId={selected.area.id}
              className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-semibold text-[#106b43] shadow-sm transition-colors hover:bg-emerald-50"
            >
              See local hotel examples →
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
