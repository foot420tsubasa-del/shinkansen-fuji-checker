export type StayAreaScoreKey =
  | "stationSimplicity"
  | "luggageFriendly"
  | "airportAccess"
  | "shinkansenAccess"
  | "touristAccess"
  | "localFeel"
  | "crowdStress"
  | "confidence";

export type StayAreaScores = Record<StayAreaScoreKey, number>;

export type CrowdLevel = "Low" | "Low-Medium" | "Medium" | "Medium-High" | "High" | "Very High";

export type StayAreaBase = {
  id: string;
  name: string;
  displayName: string;
  japaneseName: string;
  stationNames: string[];
  stationLines: string[];
  wardNames: string[];
  areaGroup: string;
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
  affiliateSearchLinks: {
    trip?: string;
    agoda?: string;
    klook?: string;
  };
};

export type StayAreaSignal = {
  passengerSignal: number | null;
  accessibilitySignal: number | null;
  safetySignal: number | null;
  floodNoteSignal: number | null;
  lodgingDensitySignal: number | null;
  sourceFreshness: {
    level: "seed" | "partial" | "fresh" | "stale";
    label: string;
  };
};

export type StayAreaSignalsFile = {
  generatedAt: string;
  mode: "local-seed" | "public-data";
  sources: Array<{
    sourceId: string;
    label: string;
    status: "success" | "skipped" | "error";
    fetchedAt: string;
    message: string;
  }>;
  areas: Record<string, StayAreaSignal>;
};

export type ComputedStayAreaScore = {
  id: string;
  overallScore: number;
  scores: StayAreaScores;
  confidence: {
    score: number;
    label: string;
  };
  sourceFreshness: StayAreaSignal["sourceFreshness"];
};
