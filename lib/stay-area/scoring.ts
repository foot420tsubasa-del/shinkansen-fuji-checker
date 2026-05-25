import type {
  ComputedStayAreaScore,
  StayAreaBase,
  StayAreaMatchLabel,
  StayAreaScoreKey,
  StayAreaScoreParts,
  StayAreaScores,
  StayAreaSignal,
  StayAreaSignalsFile,
  StayAreaScoresFile,
  StationUsabilityContribution,
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
 *   line/operator count (derived from area.stationLines.length, with a
 *   multi-operator mega-terminal flag override):
 *     1–2 lines               → +2
 *     3–4 lines               →  0
 *     5–7 lines               → -3
 *     8+ lines OR mega multi-operator hub → -5
 *
 *   transferHubLevel:
 *     Low        →  0
 *     Medium     → -2
 *     High       → -4
 *     Very High  → -6
 *
 * Per-sub-score routing (per spec):
 *   - crowdStress       = passenger (full) + transferHub (full)
 *   - stationSimplicity = exit + lineOperator + transferHub + 0.5 * passenger
 *   - luggageFriendly   = 0.5 * exit  (light influence only)
 *   - lodgingChoice     = editorial only this pass
 *   - other sub-scores  = editorial only
 *
 * Step-free / accessibility is intentionally NOT applied yet — the
 * `stepFreeConfidence` is "Unknown" for all areas while no public data
 * source is parsing barrier-free CSVs. Once a real source lands, we'll
 * add a small luggage-route delta gated on `confidence !== "Unknown"`.
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

function lineOperatorContribution(area: StayAreaBase): number {
  const lineCount = (area.stationLines || []).length;
  const isMegaMultiOp =
    area.complexityTags?.includes("mega-terminal") &&
    area.complexityTags?.includes("multi-operator");
  if (lineCount >= 8 || isMegaMultiOp) return -5;
  if (lineCount >= 5) return -3;
  if (lineCount >= 3) return 0;
  return +2;
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
  const exit = exitContribution(area.exitComplexityLevel);
  const lineOp = lineOperatorContribution(area);
  const hub = transferHubContribution(area.transferHubLevel);
  const stepFree = stepFreeContribution(signal);

  // Per-sub-score aggregates, each clamped to +/- SUB_SCORE_DELTA_CAP.
  const crowdStressDelta = clamp(passenger + hub, -SUB_SCORE_DELTA_CAP, SUB_SCORE_DELTA_CAP);
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
): StayAreaScores {
  return {
    ...editorial,
    crowdStress: clamp(editorial.crowdStress + contribution.crowdStressDelta),
    stationSimplicity: clamp(editorial.stationSimplicity + contribution.stationSimplicityDelta),
    luggageFriendly: clamp(editorial.luggageFriendly + contribution.luggageFriendlyDelta),
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
    signal.safetySignal,
    signal.floodNoteSignal,
    signal.lodgingDensitySignal,
  ].filter((s) => s.status === "success" || s.status === "partial").length;
  return ok / 5;
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
  const adjusted = applyUsabilityToScores(editorial, usabilityContribution);
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
