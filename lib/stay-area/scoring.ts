import type {
  ComputedStayAreaScore,
  StayAreaBase,
  StayAreaScoreKey,
  StayAreaScores,
  StayAreaSignalsFile,
} from "@/lib/stay-area/types";

export const stayAreaScoreWeights: StayAreaScores = {
  stationSimplicity: 0.2,
  luggageFriendly: 0.2,
  airportAccess: 0.2,
  shinkansenAccess: 0.1,
  touristAccess: 0.1,
  localFeel: 0.1,
  crowdStress: 0.05,
  confidence: 0.05,
};

const scoreKeys = Object.keys(stayAreaScoreWeights) as StayAreaScoreKey[];

function clampScore(score: number) {
  return Math.max(0, Math.min(100, score));
}

function dynamicScoreForKey(key: StayAreaScoreKey, signals?: StayAreaSignalsFile["areas"][string]) {
  if (!signals) return null;
  if (key === "stationSimplicity") return signals.passengerSignal;
  if (key === "luggageFriendly") return signals.accessibilitySignal;
  if (key === "airportAccess") return signals.accessibilitySignal;
  if (key === "crowdStress") return signals.safetySignal;
  return null;
}

export function computeStayAreaScore(area: StayAreaBase, signals?: StayAreaSignalsFile["areas"][string]): ComputedStayAreaScore {
  const scores = scoreKeys.reduce((acc, key) => {
    const editorial = clampScore(area.editorialScores[key]);
    const dynamic = dynamicScoreForKey(key, signals);
    acc[key] = dynamic == null ? editorial : clampScore(editorial * 0.7 + clampScore(dynamic) * 0.3);
    return acc;
  }, {} as StayAreaScores);

  const overallScore = Math.round(
    scoreKeys.reduce((total, key) => total + scores[key] * stayAreaScoreWeights[key], 0),
  );

  return {
    id: area.id,
    overallScore,
    scores,
    confidence: {
      score: Math.round(scores.confidence),
      label: scores.confidence >= 85 ? "High" : scores.confidence >= 75 ? "Medium-high" : "Medium",
    },
    sourceFreshness: signals?.sourceFreshness ?? { level: "seed", label: "Local seed" },
  };
}

export function buildTokyoStayAreaScores(areas: StayAreaBase[], signalsFile: StayAreaSignalsFile) {
  return areas
    .map((area) => computeStayAreaScore(area, signalsFile.areas[area.id]))
    .sort((a, b) => b.overallScore - a.overallScore);
}
