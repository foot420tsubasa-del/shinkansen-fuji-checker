/*
 * Tokyo Stay Area Index — type definitions.
 *
 * The data model has three layers:
 *   1. Editorial base (data/stay-area/tokyo-areas.base.json)
 *      Stable per-area scoring, copy, and metadata that we author by hand.
 *   2. Public-data signals (data/generated/tokyo-stay-area-signals.json)
 *      Locally fetched values from public/official sources (Tokyo Metro
 *      and Toei passenger ranking pages, etc.). Each signal carries a
 *      status so the page can label sources as success / skipped / failed.
 *   3. Computed scores (data/generated/tokyo-stay-area-scores.json)
 *      Final blended scores per area, with a `scoreParts` breakdown
 *      (editorial / publicData / liveStatus / sourceCoverage) so the UI
 *      can be transparent about how a number was produced.
 *
 * Scores are NOT an official ranking. They are editorial travel-fit
 * scores informed by public data signals where available.
 */

export type StayAreaScoreKey =
  | "stationSimplicity"
  | "luggageFriendly"
  | "airportAccess"
  | "shinkansenAccess"
  | "touristAccess"
  | "localFeel"
  | "crowdStress"
  | "lodgingChoice"
  | "confidence";

export type StayAreaScores = Record<StayAreaScoreKey, number>;

export type CrowdLevel =
  | "Low"
  | "Low-Medium"
  | "Medium"
  | "Medium-High"
  | "High"
  | "Very High";

export type Coordinates = { lat: number; lng: number };

/**
 * Editorial tags that describe station usability properties not (yet)
 * derivable from live public data. Used by the scoring layer to apply
 * exit / line-operator / transfer-hub contributions.
 */
export type ComplexityTag =
  | "compact-station"
  | "moderate-exits"
  | "many-exits"
  | "multi-operator"
  | "mega-terminal"
  | "underground-maze"
  | "transfer-hub"
  | "easy-surface-orientation"
  | "luggage-confusing"
  | "luggage-friendly"
  | "airport-direct"
  | "shinkansen-friendly"
  | "hotel-dense";

export type ExitComplexityLevel = "Simple" | "Moderate" | "Complex" | "Mega station";
export type TransferHubLevel = "Low" | "Medium" | "High" | "Very High";
export type StepFreeConfidence = "Known" | "Partial" | "Unknown";
export type LodgingDensityLevel = "Low" | "Medium" | "High" | "Very High";

export type StayAreaBase = {
  id: string;
  name: string;
  displayName: string;
  japaneseName: string;
  stationNames: string[];
  stationLines: string[];
  wardNames: string[];
  areaGroup: string;
  coordinates?: Coordinates;
  editorial: {
    overallLabel: string;
    bestFor: string[];
    watchOut: string[];
    dataSignals: string[];
    editorialNote: string;
    localFeelNote: string;
  };
  editorialScores: StayAreaScores;
  crowdLevel: CrowdLevel;
  /** Manual / editorial usability tags. See ComplexityTag for vocabulary. */
  complexityTags: ComplexityTag[];
  /** Manual exit / entrance complexity label. */
  exitComplexityLevel: ExitComplexityLevel;
  /** Manual transfer-hub level (how many lines / operators converge). */
  transferHubLevel: TransferHubLevel;
  /** Confidence in step-free / elevator routing data for this area. */
  stepFreeConfidence: StepFreeConfidence;
  /** Manual hotel-base density (does NOT rank individual hotels). */
  lodgingDensityLevel: LodgingDensityLevel;
  affiliateSearchLinks: {
    trip?: string;
    agoda?: string;
    klook?: string;
  };
};

// ----- Signals (public-data-driven layer) ---------------------------------

export type SignalStatus =
  | "success"
  | "partial"
  | "skipped"
  | "failed"
  | "optional";

export type PassengerSignal = {
  status: SignalStatus;
  /** Aggregated daily-or-period passenger count across matched stations / operators. */
  value: number | null;
  /** Operators that contributed to the aggregate. */
  operatorSources: Array<"tokyo-metro" | "toei" | "odpt">;
  /** Station names (Japanese-first) that matched within the area. */
  matchedStations: string[];
  /** 0..1 percentile across all areas with a non-null value. */
  crowdPercentile: number | null;
  /** Score contribution applied to crowdStress (negative = more stress). */
  scoreContribution: number | null;
  /** Source-cadence note from the upstream page if detected. */
  sourcePeriod?: string;
  message?: string;
};

/**
 * Step-free / elevator route signal derived from public barrier-free data.
 *
 * Phase 3 reads the Toei subway open-data barrier-free CSVs (per-line) and
 * looks at the `1ルート確保（エレベーター等）` column — `○` means at least
 * one step-free route to the platform is confirmed for that station. A
 * matched area summarizes its constituent stations' coverage.
 */
export type StepFreeSignal = {
  status: SignalStatus;
  /** Canonical station keys that matched in the source data. */
  matchedStations: string[];
  /** True if at least one matched station has a confirmed step-free route. */
  hasStepFreeRoute: boolean | null;
  /** Elevator/route coverage across matched stations. */
  elevatorSignal: "known" | "partial" | "unknown";
  /** Score contribution applied to luggageFriendly (positive = better). */
  scoreContribution: number | null;
  /** Sources that contributed to this signal. */
  sourceIds: Array<"tokyo-metro-barrier-free" | "toei-barrier-free">;
  message?: string;
};

export type OptionalSignal = {
  status: SignalStatus;
  message?: string;
};

export type SourceFreshness = {
  level:
    | "seed"
    | "public-data-local"
    | "partial-public-data"
    | "fallback";
  label: string;
};

export type StayAreaSignal = {
  matchedStations: string[];
  passengerSignal: PassengerSignal;
  stepFreeSignal: StepFreeSignal;
  safetySignal: OptionalSignal;
  floodNoteSignal: OptionalSignal;
  lodgingDensitySignal: OptionalSignal;
  sourceFreshness: SourceFreshness;
};

export type SignalsSourceEntry = {
  sourceId: string;
  label: string;
  status: SignalStatus;
  fetchedAt: string;
  /** Year, month, or period detected on the upstream page (e.g. "2024" or "2024-04"). */
  sourcePeriod?: string;
  records?: number;
  message?: string;
};

export type StayAreaSignalsFile = {
  generatedAt: string;
  mode: "local-seed" | "public-data-local";
  sources: SignalsSourceEntry[];
  areas: Record<string, StayAreaSignal>;
};

// ----- Computed scores layer ----------------------------------------------

export type StayAreaScoreParts = {
  editorialComponent: number;
  publicDataComponent: number;
  liveStatusComponent: number;
  /** 0..1 fraction of sources that returned `success`/`partial` for this area. */
  sourceCoverage: number;
};

/**
 * Per-sub-score contribution breakdown from the station-usability layer.
 * Each contribution is bounded; the aggregate (per sub-score) is capped at
 * +/- 10. Useful for UI breakdowns and debugging.
 */
export type StationUsabilityContribution = {
  passengerCrowd: number;
  exitComplexity: number;
  lineOperator: number;
  transferHub: number;
  /** Sum after individual caps but before the per-sub-score aggregate cap. */
  rawTotal: number;
  /** crowdStress aggregate (capped). */
  crowdStressDelta: number;
  /** stationSimplicity aggregate (capped). */
  stationSimplicityDelta: number;
  /** luggageFriendly aggregate (capped, light). */
  luggageFriendlyDelta: number;
};

export type StayAreaMatchLabel =
  | "public-data-matched"
  | "partial-public-data"
  | "editorial-fallback";

export type ComputedStayAreaScore = {
  id: string;
  overallScore: number;
  scores: StayAreaScores;
  confidence: {
    score: number;
    label: string;
  };
  sourceFreshness: SourceFreshness;
  scoreParts: StayAreaScoreParts;
  matchLabel: StayAreaMatchLabel;
  /** Bucketed contribution breakdown from the station-usability layer. */
  usabilityContribution: StationUsabilityContribution;
};

export type StayAreaScoresFile = {
  generatedAt: string;
  mode: "local-seed" | "public-data-local";
  areas: ComputedStayAreaScore[];
};

export type SourceStatusFile = {
  generatedAt: string;
  sources: SignalsSourceEntry[];
};
