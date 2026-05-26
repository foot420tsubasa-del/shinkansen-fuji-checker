import type {
  ComputedStayAreaScore,
  NetworkComplexitySignal,
  RailNetworkType,
  StayAreaBase,
  StayAreaMatchLabel,
  StayAreaScoreKey,
  StayAreaScoreParts,
  StayAreaScores,
  StayAreaSignal,
  StayAreaSignalsFile,
  StayAreaScoresFile,
  StationUsabilityContribution,
  TerminalType,
} from "@/lib/stay-area/types";

/*
 * Scoring model — station-usability-focused.
 *
 * The overallScore for an area is a blend:
 *   - editorialBaseScore   55%
 *   - publicDataScore      35%
 *   - liveStatusScore      10%
 *
 * publicDataScore is the editorial baseline + bounded contributions from
 * the four "station usability" signals (passenger crowd, exit complexity,
 * line/operator count, transfer-hub penalty). The aggregate per-sub-score
 * delta is capped at +/- 10 so a single signal can't swing rankings wildly.
 *
 * Contribution tables (bucketed for stability):
 *
 *   passenger crowdPercentile:
 *     >= 0.90  → -6
 *     0.75..   → -4
 *     0.50..   → -2
 *     0.25..   → -1
 *     <  0.25  →  0
 *
 *   exitComplexityLevel:
 *     Simple        → +4
 *     Moderate      → +1
 *     Complex       → -3
 *     Mega station  → -6
 *
 *   line/operator complexity (derived into networkComplexitySignal):
 *     1–2 lines               → +2
 *     3–4 lines               →  0
 *     5–7 lines               → -3
 *     8+ lines                → -5
 *     3+ operators            → -2
 *     mega-terminal           → -4
 *     final contribution capped to +/- 7
 *
 *   transferHubLevel:
 *     Low        →  0
 *     Medium     → -2
 *     High       → -4
 *     Very High  → -6
 *
 * Per-sub-score routing (per spec):
 *   - crowdStress       = passenger (full) + transferHub (full) + lineOperator (light)
 *   - stationSimplicity = exit + lineOperator + transferHub + 0.5 * passenger
 *   - luggageFriendly   = 0.5 * exit  (light influence only)
 *   - lodgingChoice     = editorial only this pass
 *   - other sub-scores  = editorial only
 *
 * Phase 4 — exit / entrance complexity is now data-assisted: when the
 * `exitComplexitySignal` returns a successful match (Tokyo Metro's open
 * `/station/exit.json` feed), the exit bucket is re-derived from the live
 * open-exit count (<=4 Simple, 5–8 Moderate, 9–14 Complex, 15+ Mega
 * station) and used in place of the editorial level. Missing data is
 * never punished — we fall back to the editorial `exitComplexityLevel`.
 */

export const FINAL_BLEND = {
  editorial: 0.55,
  publicData: 0.35,
  liveStatus: 0.1,
} as const;

export const stayAreaScoreWeights: StayAreaScores = {
  stationSimplicity: 0.18,
  luggageFriendly: 0.18,
  airportAccess: 0.16,
  shinkansenAccess: 0.1,
  touristAccess: 0.09,
  localFeel: 0.09,
  crowdStress: 0.08,
  lodgingChoice: 0.07,
  confidence: 0.05,
};

const scoreKeys = Object.keys(stayAreaScoreWeights) as StayAreaScoreKey[];

const MAX_DELTA_PER_RUN = 4;       // overall-score ±4 cap vs previous snapshot
const SUB_SCORE_DELTA_CAP = 10;    // per-sub-score station-usability cap

function clamp(score: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, score));
}

function weightedSum(scores: StayAreaScores): number {
  return scoreKeys.reduce((acc, k) => acc + clamp(scores[k]) * stayAreaScoreWeights[k], 0);
}

// ----- Bucketed contribution tables ---------------------------------------

function passengerContribution(percentile: number | null): number {
  if (percentile == null) return 0;
  if (percentile >= 0.9) return -6;
  if (percentile >= 0.75) return -4;
  if (percentile >= 0.5) return -2;
  if (percentile >= 0.25) return -1;
  return 0;
}

function exitContribution(level: StayAreaBase["exitComplexityLevel"]): number {
  switch (level) {
    case "Simple": return +4;
    case "Moderate": return +1;
    case "Complex": return -3;
    case "Mega station": return -6;
    default: return 0;
  }
}

const operatorPatterns: Array<{ name: string; patterns: RegExp[] }> = [
  { name: "JR", patterns: [/^JR\b/i, /\bShinkansen\b/i, /\bNarita Express\b/i] },
  { name: "Tokyo Metro", patterns: [/^Tokyo Metro\b/i, /\bGinza Line\b/i, /\bMarunouchi Line\b/i, /\bHibiya Line\b/i, /\bTozai Line\b/i, /\bChiyoda Line\b/i, /\bYurakucho Line\b/i, /\bHanzomon Line\b/i, /\bNamboku Line\b/i, /\bFukutoshin Line\b/i] },
  { name: "Toei", patterns: [/^Toei\b/i, /\bAsakusa Line\b/i, /\bOedo Line\b/i, /\bMita Line\b/i, /\bShinjuku Line\b/i] },
  { name: "Keisei", patterns: [/^Keisei\b/i, /\bSkyliner\b/i] },
  { name: "Keikyu", patterns: [/^Keikyu\b/i] },
  { name: "Tobu", patterns: [/^Tobu\b/i] },
  { name: "Tokyu", patterns: [/^Tokyu\b/i] },
  { name: "Seibu", patterns: [/^Seibu\b/i] },
  { name: "Keio", patterns: [/^Keio\b/i] },
  { name: "Odakyu", patterns: [/^Odakyu\b/i] },
  { name: "Yurikamome", patterns: [/^Yurikamome\b/i] },
  { name: "Rinkai", patterns: [/^Rinkai\b/i] },
  { name: "Tokyo Monorail", patterns: [/^Tokyo Monorail\b/i] },
  { name: "Tsukuba Express", patterns: [/^Tsukuba Express\b/i] },
];

function inferOperator(line: string): string {
  const trimmed = String(line || "").trim();
  const match = operatorPatterns.find((entry) =>
    entry.patterns.some((pattern) => pattern.test(trimmed)),
  );
  return match?.name ?? "Other";
}

function deriveTerminalType(area: StayAreaBase, lineCount: number, operatorCount: number): TerminalType {
  if (area.complexityTags?.includes("mega-terminal")) return "mega-terminal";
  if (area.transferHubLevel === "High" || area.transferHubLevel === "Very High") return "terminal";
  if (lineCount >= 3 || operatorCount >= 2) return "interchange";
  return "local-station";
}

function deriveRailNetworkType(
  operatorGroups: string[],
  terminalType: TerminalType,
): RailNetworkType {
  const operators = new Set(operatorGroups);
  if (terminalType === "mega-terminal") return "multi-operator-hub";
  if (operators.has("Yurikamome") || operators.has("Rinkai")) return "waterfront-rail";
  if (
    operators.has("Keisei") ||
    operators.has("Keikyu") ||
    operators.has("Tokyo Monorail") ||
    operatorGroups.some((op) => op === "JR")
  ) {
    if (
      operators.has("Keisei") ||
      operators.has("Keikyu") ||
      operators.has("Tokyo Monorail")
    ) {
      return "airport-rail";
    }
  }
  if (operators.size >= 3) return "multi-operator-hub";
  if (operators.has("JR")) return "jr-heavy";
  if (
    operators.has("Tobu") ||
    operators.has("Tokyu") ||
    operators.has("Seibu") ||
    operators.has("Keio") ||
    operators.has("Odakyu") ||
    operators.has("Tsukuba Express")
  ) {
    return "private-rail";
  }
  return "subway-only";
}

export function deriveNetworkComplexitySignal(area: StayAreaBase): NetworkComplexitySignal {
  const lineCount = new Set((area.stationLines || []).map((line) => String(line).trim()).filter(Boolean)).size;
  const operatorGroups = Array.from(
    new Set((area.stationLines || []).map(inferOperator).filter((op) => op !== "Other")),
  ).sort();
  const operatorCount = operatorGroups.length;
  const terminalType = deriveTerminalType(area, lineCount, operatorCount);
  const railNetworkType = deriveRailNetworkType(operatorGroups, terminalType);
  let scoreContribution = lineCount <= 2 ? 2 : lineCount <= 4 ? 0 : lineCount <= 7 ? -3 : -5;
  if (operatorCount >= 3) scoreContribution -= 2;
  if (terminalType === "mega-terminal") scoreContribution -= 4;
  scoreContribution = clamp(scoreContribution, -7, 7);

  return {
    status: "success",
    lineCount,
    operatorCount,
    operatorGroups,
    railNetworkType,
    multiOperatorFlag: operatorCount >= 2,
    terminalType,
    scoreContribution,
    message: `${lineCount} unique line${lineCount === 1 ? "" : "s"} across ${operatorCount} operator group${operatorCount === 1 ? "" : "s"}; classified as ${railNetworkType} / ${terminalType}.`,
  };
}

/**
 * Resolve the exit-complexity level to use for scoring this area:
 * prefer the live signal's `derivedLevel` when status is success/partial,
 * otherwise fall back to the editorial `exitComplexityLevel`.
 *
 * Note: per spec we do NOT downgrade `stationSimplicity` when accessibility /
 * exit data is missing — we only use data when confidently matched.
 */
function resolveExitLevel(
  area: StayAreaBase,
  signal: StayAreaSignal | undefined,
): { level: StayAreaBase["exitComplexityLevel"]; fromData: boolean } {
  const sig = signal?.exitComplexitySignal;
  if (
    sig &&
    (sig.status === "success" || sig.status === "partial") &&
    sig.derivedLevel != null
  ) {
    return { level: sig.derivedLevel, fromData: true };
  }
  return { level: area.exitComplexityLevel, fromData: false };
}

function lineOperatorContribution(area: StayAreaBase, signal: StayAreaSignal | undefined): number {
  return signal?.networkComplexitySignal?.scoreContribution ?? deriveNetworkComplexitySignal(area).scoreContribution;
}

function transferHubContribution(level: StayAreaBase["transferHubLevel"]): number {
  switch (level) {
    case "Low": return 0;
    case "Medium": return -2;
    case "High": return -4;
    case "Very High": return -6;
    default: return 0;
  }
}

function accessLevelContribution(level: StayAreaBase["accessProfiles"]["narita"]["level"] | undefined): number {
  switch (level) {
    case "Excellent": return 3;
    case "Good": return 1;
    case "Fair": return 0;
    case "Weak": return -2;
    default: return 0;
  }
}

function deriveAccessProfileContribution(area: StayAreaBase): {
  airportAccessDelta: number;
  shinkansenAccessDelta: number;
} {
  const profiles = area.accessProfiles;
  if (!profiles) return { airportAccessDelta: 0, shinkansenAccessDelta: 0 };
  const airportSignals = [
    accessLevelContribution(profiles.narita?.level),
    accessLevelContribution(profiles.haneda?.level),
    accessLevelContribution(profiles.airportArrivalEase?.level),
  ];
  return {
    airportAccessDelta: clamp(
      Math.round(airportSignals.reduce((sum, value) => sum + value, 0) / airportSignals.length),
      -2,
      3,
    ),
    shinkansenAccessDelta: clamp(accessLevelContribution(profiles.shinkansen?.level), -2, 3),
  };
}

function lodgingDensityContribution(signal: StayAreaSignal | undefined, area: StayAreaBase): number {
  const level = signal?.lodgingDensitySignal?.densityLevel ?? area.lodgingDensityLevel;
  switch (level) {
    case "Very High": return 3;
    case "High": return 2;
    case "Medium": return 1;
    case "Low": return -1;
    default: return 0;
  }
}

// ----- Per-sub-score delta wiring -----------------------------------------

/**
 * Step-free / elevator route contribution. Positive-only by design — we
 * only credit when a public source confidently confirms a step-free route;
 * unknown / missing is never punished.
 */
function stepFreeContribution(signal: StayAreaSignal | undefined): number {
  const sf = signal?.stepFreeSignal;
  if (!sf || sf.status === "failed" || sf.status === "skipped") return 0;
  if (sf.elevatorSignal === "known" && sf.hasStepFreeRoute === true) return 3;
  if (sf.elevatorSignal === "partial") return 1;
  return 0;
}

function deriveUsabilityContribution(
  area: StayAreaBase,
  signal: StayAreaSignal | undefined,
): StationUsabilityContribution {
  const passenger = passengerContribution(signal?.passengerSignal?.crowdPercentile ?? null);
  const exitLevel = resolveExitLevel(area, signal);
  const exit = exitContribution(exitLevel.level);
  const lineOp = lineOperatorContribution(area, signal);
  const hub = transferHubContribution(area.transferHubLevel);
  const stepFree = stepFreeContribution(signal);
  const crowdNetwork = Math.round(lineOp * 0.35);

  // Per-sub-score aggregates, each clamped to +/- SUB_SCORE_DELTA_CAP.
  const crowdStressDelta = clamp(passenger + hub + crowdNetwork, -SUB_SCORE_DELTA_CAP, SUB_SCORE_DELTA_CAP);
  const stationSimplicityDelta = clamp(
    exit + lineOp + hub + 0.5 * passenger,
    -SUB_SCORE_DELTA_CAP,
    SUB_SCORE_DELTA_CAP,
  );
  // Light influence from exit complexity + the (positive-only) step-free signal.
  const luggageFriendlyDelta = clamp(
    0.5 * exit + stepFree,
    -SUB_SCORE_DELTA_CAP,
    SUB_SCORE_DELTA_CAP,
  );

  return {
    passengerCrowd: passenger,
    exitComplexity: exit,
    lineOperator: lineOp,
    transferHub: hub,
    rawTotal: passenger + exit + lineOp + hub,
    crowdStressDelta,
    stationSimplicityDelta,
    luggageFriendlyDelta,
  };
}

function applyUsabilityToScores(
  editorial: StayAreaScores,
  contribution: StationUsabilityContribution,
  accessContribution: { airportAccessDelta: number; shinkansenAccessDelta: number },
  lodgingContribution: number,
): StayAreaScores {
  return {
    ...editorial,
    crowdStress: clamp(editorial.crowdStress + contribution.crowdStressDelta),
    stationSimplicity: clamp(editorial.stationSimplicity + contribution.stationSimplicityDelta),
    luggageFriendly: clamp(editorial.luggageFriendly + contribution.luggageFriendlyDelta),
    airportAccess: clamp(editorial.airportAccess + accessContribution.airportAccessDelta),
    shinkansenAccess: clamp(editorial.shinkansenAccess + accessContribution.shinkansenAccessDelta),
    lodgingChoice: clamp(editorial.lodgingChoice + lodgingContribution),
  };
}

// ----- Match labels + coverage --------------------------------------------

function deriveMatchLabel(signal: StayAreaSignal | undefined): StayAreaMatchLabel {
  if (!signal) return "editorial-fallback";
  const passengerOk =
    signal.passengerSignal?.status === "success" ||
    signal.passengerSignal?.status === "partial";
  const stepFreeOk =
    signal.stepFreeSignal?.status === "success" ||
    signal.stepFreeSignal?.status === "partial";
  if (passengerOk && stepFreeOk) return "public-data-matched";
  if (passengerOk || stepFreeOk) return "partial-public-data";
  return "editorial-fallback";
}

function deriveSourceCoverage(signal: StayAreaSignal | undefined): number {
  if (!signal) return 0;
  const ok = [
    signal.passengerSignal,
    signal.stepFreeSignal,
    signal.exitComplexitySignal,
    signal.networkComplexitySignal,
    signal.safetySignal,
    signal.floodNoteSignal,
    signal.lodgingDensitySignal,
  ].filter((s) => s.status === "success" || s.status === "partial").length;
  return ok / 7;
}

function applyConfidenceFromCoverage(
  scores: StayAreaScores,
  sourceCoverage: number,
): StayAreaScores {
  const delta = sourceCoverage >= 0.5 ? 6 : sourceCoverage > 0 ? 3 : -3;
  return { ...scores, confidence: clamp(scores.confidence + delta) };
}

// ----- Public API ---------------------------------------------------------

export function computeStayAreaScore(
  area: StayAreaBase,
  signal: StayAreaSignal | undefined,
  previousScore: ComputedStayAreaScore | undefined,
  options: { forceScoreUpdate?: boolean } = {},
): ComputedStayAreaScore {
  const editorial = scoreKeys.reduce((acc, k) => {
    acc[k] = clamp(area.editorialScores[k]);
    return acc;
  }, {} as StayAreaScores);

  const usabilityContribution = deriveUsabilityContribution(area, signal);
  const accessContribution = deriveAccessProfileContribution(area);
  const lodgingContribution = lodgingDensityContribution(signal, area);
  const adjusted = applyUsabilityToScores(
    editorial,
    usabilityContribution,
    accessContribution,
    lodgingContribution,
  );
  const sourceCoverage = deriveSourceCoverage(signal);
  const withConfidence = applyConfidenceFromCoverage(adjusted, sourceCoverage);

  const editorialComponent = weightedSum(editorial);
  const publicDataComponent = weightedSum(withConfidence);
  // liveStatusComponent: lift modestly when sources contributed; anchored at editorialComponent.
  const liveStatusComponent = editorialComponent + (sourceCoverage - 0.5) * 4;

  const blended =
    editorialComponent * FINAL_BLEND.editorial +
    publicDataComponent * FINAL_BLEND.publicData +
    liveStatusComponent * FINAL_BLEND.liveStatus;

  let overallScore = Math.round(clamp(blended));

  if (previousScore && !options.forceScoreUpdate) {
    const lo = previousScore.overallScore - MAX_DELTA_PER_RUN;
    const hi = previousScore.overallScore + MAX_DELTA_PER_RUN;
    overallScore = Math.round(clamp(overallScore, lo, hi));
  }

  const scoreParts: StayAreaScoreParts = {
    editorialComponent: Math.round(editorialComponent),
    publicDataComponent: Math.round(publicDataComponent),
    liveStatusComponent: Math.round(liveStatusComponent),
    sourceCoverage: Number(sourceCoverage.toFixed(2)),
  };

  const confidenceScore = Math.round(withConfidence.confidence);
  const confidenceLabel =
    confidenceScore >= 85 ? "High" : confidenceScore >= 75 ? "Medium-high" : "Medium";

  return {
    id: area.id,
    overallScore,
    scores: withConfidence,
    confidence: { score: confidenceScore, label: confidenceLabel },
    sourceFreshness: signal?.sourceFreshness ?? { level: "seed", label: "Local seed" },
    scoreParts,
    matchLabel: deriveMatchLabel(signal),
    usabilityContribution,
  };
}

export function buildTokyoStayAreaScores(
  areas: StayAreaBase[],
  signalsFile: StayAreaSignalsFile,
  previous?: StayAreaScoresFile,
  options: { forceScoreUpdate?: boolean } = {},
): ComputedStayAreaScore[] {
  const previousById = new Map(
    (previous?.areas ?? []).map((s) => [s.id, s] as const),
  );
  return areas
    .map((area) =>
      computeStayAreaScore(area, signalsFile.areas[area.id], previousById.get(area.id), options),
    )
    .sort((a, b) => b.overallScore - a.overallScore);
}
