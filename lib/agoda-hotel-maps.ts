import agodaHotelMapData from "@/data/agoda-hotel-maps.json";

export type AgodaHotelMapStatus = "draft" | "active" | "disabled";

export type AgodaHotelMapConfig = {
  id: string;
  label: string;
  areaName: string;
  city: string;
  country: string;
  status: AgodaHotelMapStatus;
  placementDefault: string;
  embedCode: string;
  scriptUrl: string;
  iframeUrl: string;
  notes: string;
  lastChecked: string;
};

const agodaHotelMaps = agodaHotelMapData as Record<string, AgodaHotelMapConfig>;

export function getAgodaHotelMap(mapId: string): AgodaHotelMapConfig | null {
  return agodaHotelMaps[mapId] ?? null;
}

export function isActiveAgodaHotelMap(config: AgodaHotelMapConfig | null): config is AgodaHotelMapConfig {
  return Boolean(
    config &&
      config.status === "active" &&
      (config.embedCode.trim() || config.iframeUrl.trim() || config.scriptUrl.trim()),
  );
}

export function getActiveAgodaHotelMaps() {
  return Object.values(agodaHotelMaps).filter((config) => isActiveAgodaHotelMap(config));
}

export function getAgodaHotelMapKeys() {
  return Object.keys(agodaHotelMaps);
}

export function getAgodaHotelMapConfig() {
  return agodaHotelMaps;
}
