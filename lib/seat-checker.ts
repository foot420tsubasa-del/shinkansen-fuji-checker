export type DirectionId = "tokyo-osaka" | "osaka-tokyo";

export type VisibilityLevel = "high" | "medium" | "low";

export type FujiVisibility = {
  visibility: VisibilityLevel;
  cloudPercent: number;
  message: string;
};

export type SeatRecommendation = {
  direction: DirectionId;
  standardWindowSeat: string;
  fallbackSeat: string;
  greenCarWindowSeat: string;
  sideLabel: "right" | "left";
  routeLabelKey: "dirToOsaka" | "dirToTokyo";
};

export const directions: Array<{
  id: DirectionId;
  labelKey: "dirToOsaka" | "dirToTokyo";
}> = [
  { id: "tokyo-osaka", labelKey: "dirToOsaka" },
  { id: "osaka-tokyo", labelKey: "dirToTokyo" },
];

export function getSeatRecommendation(direction: DirectionId): SeatRecommendation {
  if (direction === "osaka-tokyo") {
    return {
      direction,
      standardWindowSeat: "E",
      fallbackSeat: "D",
      greenCarWindowSeat: "D",
      sideLabel: "left",
      routeLabelKey: "dirToTokyo",
    };
  }

  return {
    direction,
    standardWindowSeat: "E",
    fallbackSeat: "D",
    greenCarWindowSeat: "D",
    sideLabel: "right",
    routeLabelKey: "dirToOsaka",
  };
}
