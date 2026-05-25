export type StayAreaSourceDefinition = {
  sourceId: string;
  label: string;
  owner: string;
  signalType: "passenger" | "accessibility" | "station" | "crime" | "hazard" | "lodging";
  updateMode: "manual-reference";
  note: string;
  url?: string;
};

export const tokyoStayAreaSourceRegistry: StayAreaSourceDefinition[] = [
  {
    sourceId: "tokyo-metro-passenger-volume",
    label: "Tokyo Metro passenger volume",
    owner: "Tokyo Metro",
    signalType: "passenger",
    updateMode: "manual-reference",
    note: "Future signal source for station crowd and passenger-volume context.",
  },
  {
    sourceId: "toei-subway-passenger-volume",
    label: "Toei Subway passenger volume",
    owner: "Tokyo Metropolitan Bureau of Transportation",
    signalType: "passenger",
    updateMode: "manual-reference",
    note: "Future signal source for Toei station crowd context.",
  },
  {
    sourceId: "tokyo-metro-barrier-free",
    label: "Tokyo Metro accessibility / barrier-free information",
    owner: "Tokyo Metro",
    signalType: "accessibility",
    updateMode: "manual-reference",
    note: "Future signal source for elevator and luggage-friendly station checks.",
  },
  {
    sourceId: "toei-subway-barrier-free",
    label: "Toei Subway accessibility / barrier-free information",
    owner: "Tokyo Metropolitan Bureau of Transportation",
    signalType: "accessibility",
    updateMode: "manual-reference",
    note: "Future signal source for Toei accessibility checks.",
  },
  {
    sourceId: "odpt-station-information",
    label: "ODPT station information",
    owner: "Open Data Public Transportation Council",
    signalType: "station",
    updateMode: "manual-reference",
    note: "Future signal source for station metadata and line coverage.",
  },
  {
    sourceId: "tokyo-police-crime-statistics",
    label: "Tokyo Metropolitan Police crime statistics",
    owner: "Tokyo Metropolitan Police Department",
    signalType: "crime",
    updateMode: "manual-reference",
    note: "Future public-data reference. Do not present this MVP as a safety ranking.",
  },
  {
    sourceId: "hazard-map-portal",
    label: "Hazard Map Portal",
    owner: "Ministry of Land, Infrastructure, Transport and Tourism",
    signalType: "hazard",
    updateMode: "manual-reference",
    note: "Future context source for hazard notes. Not fetched in this MVP.",
  },
  {
    sourceId: "tokyo-lodging-business-facilities",
    label: "Tokyo lodging business facility datasets",
    owner: "Tokyo Metropolitan Government",
    signalType: "lodging",
    updateMode: "manual-reference",
    note: "Future signal source for lodging density context, not hotel quality or price.",
  },
];
