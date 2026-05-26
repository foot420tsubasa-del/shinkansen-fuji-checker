#!/usr/bin/env node
/*
 * scripts/build-tokyo-stay-area-scores.mjs
 *
 * Snapshot writer for the Tokyo Stay Area Index — mirrors the scoring
 * logic in lib/stay-area/scoring.ts (keep them in sync when tuning).
 *
 * Inputs:
 *   data/stay-area/tokyo-areas.base.json
 *   data/generated/tokyo-stay-area-signals.json
 *   data/generated/tokyo-stay-area-scores.json   (prev snapshot, ±4 cap)
 *
 * Output:
 *   data/generated/tokyo-stay-area-scores.json
 *
 * Scoring model:
 *   - Final = 55% editorial + 35% public-data + 10% live-status.
 *   - Public-data layer adjusts crowdStress / stationSimplicity / luggageFriendly
 *     via four bucketed contributions (passenger / exit / line-operator /
 *     transfer hub). Each per-sub-score aggregate capped at ±10.
 *   - Overall score capped at ±4 vs previous snapshot, unless
 *     FORCE_SCORE_UPDATE=true is set.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const FORCE_SCORE_UPDATE = process.env.FORCE_SCORE_UPDATE === "true";

const FINAL_BLEND = { editorial: 0.55, publicData: 0.35, liveStatus: 0.1 };
const SCORE_WEIGHTS = {
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
const SCORE_KEYS = Object.keys(SCORE_WEIGHTS);
const MAX_DELTA_PER_RUN = 4;
const SUB_SCORE_DELTA_CAP = 10;

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}
function weightedSum(scores) {
  return SCORE_KEYS.reduce((acc, k) => acc + clamp(scores[k] ?? 0) * SCORE_WEIGHTS[k], 0);
}
function readJsonIfExists(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}

// ---------- bucketed contribution tables (must match scoring.ts) ----------

function passengerContribution(percentile) {
  if (percentile == null) return 0;
  if (percentile >= 0.9) return -6;
  if (percentile >= 0.75) return -4;
  if (percentile >= 0.5) return -2;
  if (percentile >= 0.25) return -1;
  return 0;
}
function exitContribution(level) {
  switch (level) {
    case "Simple": return +4;
    case "Moderate": return +1;
    case "Complex": return -3;
    case "Mega station": return -6;
    default: return 0;
  }
}

const OPERATOR_PATTERNS = [
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

function inferOperator(line) {
  const trimmed = String(line || "").trim();
  return OPERATOR_PATTERNS.find((entry) => entry.patterns.some((pattern) => pattern.test(trimmed)))?.name ?? "Other";
}

function deriveTerminalType(area, lineCount, operatorCount) {
  if ((area.complexityTags || []).includes("mega-terminal")) return "mega-terminal";
  if (area.transferHubLevel === "High" || area.transferHubLevel === "Very High") return "terminal";
  if (lineCount >= 3 || operatorCount >= 2) return "interchange";
  return "local-station";
}

function deriveRailNetworkType(operatorGroups, terminalType) {
  const operators = new Set(operatorGroups);
  if (terminalType === "mega-terminal") return "multi-operator-hub";
  if (operators.has("Yurikamome") || operators.has("Rinkai")) return "waterfront-rail";
  if (operators.has("Keisei") || operators.has("Keikyu") || operators.has("Tokyo Monorail")) return "airport-rail";
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

function deriveNetworkComplexitySignal(area) {
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
 * Prefer the live signal's bucketed `derivedLevel` when status is
 * success/partial; otherwise fall back to editorial `exitComplexityLevel`.
 * Missing data is never punished.
 */
function resolveExitLevel(area, signal) {
  const sig = signal?.exitComplexitySignal;
  if (
    sig &&
    (sig.status === "success" || sig.status === "partial") &&
    sig.derivedLevel != null
  ) {
    return sig.derivedLevel;
  }
  return area.exitComplexityLevel;
}
function lineOperatorContribution(area, signal) {
  return signal?.networkComplexitySignal?.scoreContribution ?? deriveNetworkComplexitySignal(area).scoreContribution;
}
function transferHubContribution(level) {
  switch (level) {
    case "Low": return 0;
    case "Medium": return -2;
    case "High": return -4;
    case "Very High": return -6;
    default: return 0;
  }
}

function stepFreeContribution(signal) {
  const sf = signal?.stepFreeSignal;
  if (!sf || sf.status === "failed" || sf.status === "skipped") return 0;
  if (sf.elevatorSignal === "known" && sf.hasStepFreeRoute === true) return 3;
  if (sf.elevatorSignal === "partial") return 1;
  return 0;
}

function deriveUsabilityContribution(area, signal) {
  const passenger = passengerContribution(signal?.passengerSignal?.crowdPercentile ?? null);
  const exit = exitContribution(resolveExitLevel(area, signal));
  const lineOp = lineOperatorContribution(area, signal);
  const hub = transferHubContribution(area.transferHubLevel);
  const stepFree = stepFreeContribution(signal);
  const crowdNetwork = Math.round(lineOp * 0.35);

  return {
    passengerCrowd: passenger,
    exitComplexity: exit,
    lineOperator: lineOp,
    transferHub: hub,
    rawTotal: passenger + exit + lineOp + hub,
    crowdStressDelta: clamp(passenger + hub + crowdNetwork, -SUB_SCORE_DELTA_CAP, SUB_SCORE_DELTA_CAP),
    stationSimplicityDelta: clamp(exit + lineOp + hub + 0.5 * passenger, -SUB_SCORE_DELTA_CAP, SUB_SCORE_DELTA_CAP),
    luggageFriendlyDelta: clamp(0.5 * exit + stepFree, -SUB_SCORE_DELTA_CAP, SUB_SCORE_DELTA_CAP),
  };
}

function applyUsabilityToScores(editorial, c) {
  return {
    ...editorial,
    crowdStress: clamp(editorial.crowdStress + c.crowdStressDelta),
    stationSimplicity: clamp(editorial.stationSimplicity + c.stationSimplicityDelta),
    luggageFriendly: clamp(editorial.luggageFriendly + c.luggageFriendlyDelta),
  };
}

function deriveSourceCoverage(signal) {
  if (!signal) return 0;
  const xs = [
    signal.passengerSignal,
    signal.stepFreeSignal,
    signal.exitComplexitySignal,
    signal.networkComplexitySignal,
    signal.safetySignal,
    signal.floodNoteSignal,
    signal.lodgingDensitySignal,
  ];
  const ok = xs.filter((s) => s?.status === "success" || s?.status === "partial").length;
  return ok / 7;
}

function applyConfidenceFromCoverage(scores, coverage) {
  const delta = coverage >= 0.5 ? 6 : coverage > 0 ? 3 : -3;
  return { ...scores, confidence: clamp(scores.confidence + delta) };
}

function deriveMatchLabel(signal) {
  if (!signal) return "editorial-fallback";
  const ok = (s) => s?.status === "success" || s?.status === "partial";
  if (ok(signal.passengerSignal) && ok(signal.stepFreeSignal)) return "public-data-matched";
  if (ok(signal.passengerSignal) || ok(signal.stepFreeSignal)) return "partial-public-data";
  return "editorial-fallback";
}

function computeStayAreaScore(area, signal, previousScore) {
  const editorial = SCORE_KEYS.reduce((acc, k) => {
    acc[k] = clamp(area.editorialScores[k] ?? 0);
    return acc;
  }, {});

  const usabilityContribution = deriveUsabilityContribution(area, signal);
  const adjusted = applyUsabilityToScores(editorial, usabilityContribution);
  const coverage = deriveSourceCoverage(signal);
  const withConfidence = applyConfidenceFromCoverage(adjusted, coverage);

  const editorialComponent = weightedSum(editorial);
  const publicDataComponent = weightedSum(withConfidence);
  const liveStatusComponent = editorialComponent + (coverage - 0.5) * 4;

  const blended =
    editorialComponent * FINAL_BLEND.editorial +
    publicDataComponent * FINAL_BLEND.publicData +
    liveStatusComponent * FINAL_BLEND.liveStatus;

  let overallScore = Math.round(clamp(blended));
  if (previousScore && !FORCE_SCORE_UPDATE) {
    const lo = previousScore.overallScore - MAX_DELTA_PER_RUN;
    const hi = previousScore.overallScore + MAX_DELTA_PER_RUN;
    overallScore = Math.round(clamp(overallScore, lo, hi));
  }

  const confidenceScore = Math.round(withConfidence.confidence);
  const confidenceLabel =
    confidenceScore >= 85 ? "High" : confidenceScore >= 75 ? "Medium-high" : "Medium";

  return {
    id: area.id,
    overallScore,
    scores: withConfidence,
    confidence: { score: confidenceScore, label: confidenceLabel },
    sourceFreshness: signal?.sourceFreshness ?? { level: "seed", label: "Local seed" },
    scoreParts: {
      editorialComponent: Math.round(editorialComponent),
      publicDataComponent: Math.round(publicDataComponent),
      liveStatusComponent: Math.round(liveStatusComponent),
      sourceCoverage: Number(coverage.toFixed(2)),
    },
    matchLabel: deriveMatchLabel(signal),
    usabilityContribution,
  };
}

function main() {
  const areasBasePath = path.join(repoRoot, "data/stay-area/tokyo-areas.base.json");
  const signalsPath = path.join(repoRoot, "data/generated/tokyo-stay-area-signals.json");
  const scoresPath = path.join(repoRoot, "data/generated/tokyo-stay-area-scores.json");

  const areas = JSON.parse(fs.readFileSync(areasBasePath, "utf8"));
  const signalsFile = JSON.parse(fs.readFileSync(signalsPath, "utf8"));
  const previousScores = readJsonIfExists(scoresPath);
  const previousById = new Map((previousScores?.areas ?? []).map((s) => [s.id, s]));

  const scored = areas
    .map((area) => computeStayAreaScore(area, signalsFile.areas?.[area.id], previousById.get(area.id)))
    .sort((a, b) => b.overallScore - a.overallScore);

  const generatedAt = new Date().toISOString();
  const out = { generatedAt, mode: signalsFile.mode, areas: scored };
  fs.mkdirSync(path.dirname(scoresPath), { recursive: true });
  fs.writeFileSync(scoresPath, `${JSON.stringify(out, null, 2)}\n`);

  const summary = scored.slice(0, 5).map(
    (s, i) => `  ${String(i + 1).padStart(2, " ")}. ${s.id.padEnd(34)} ${s.overallScore} (${s.matchLabel})`,
  );
  console.log(`[stay-area:build-scores] Wrote ${scored.length} scored areas at ${generatedAt}.`);
  console.log("[stay-area:build-scores] Top 5:");
  console.log(summary.join("\n"));
  if (FORCE_SCORE_UPDATE) {
    console.log("[stay-area:build-scores] FORCE_SCORE_UPDATE=true — ±4 cap bypassed.");
  }
}

main();
