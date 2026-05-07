import fs from "fs";
import path from "path";
import stayAreaMapsData from "@/data/stay-area-maps.json";
import { DEFAULT_STAY_AREA_MAP_DISCLAIMER } from "@/lib/stay-area-map-constants";

export { DEFAULT_STAY_AREA_MAP_DISCLAIMER };

export type StayAreaMapStatus = "active" | "draft" | "disabled";

export type StayAreaMapConfig = {
  id: string;
  src: string;
  title?: string;
  alt: string;
  caption?: string;
  disclaimer?: string;
  status: StayAreaMapStatus;
  lastChecked: string;
};

const maps = stayAreaMapsData as Record<string, StayAreaMapConfig>;

export type StayAreaMapKey = keyof typeof stayAreaMapsData;

function publicAssetExists(src: string) {
  if (!src.startsWith("/")) return true;
  const filePath = path.join(process.cwd(), "public", src);
  return fs.existsSync(filePath);
}

export function getStayAreaMap(mapId: string): StayAreaMapConfig | null {
  return maps[mapId] ?? null;
}

export function getStayAreaMapKeys() {
  return Object.keys(maps);
}

export function isRenderableStayAreaMap(config: StayAreaMapConfig | null): config is StayAreaMapConfig {
  return Boolean(config && config.status === "active" && config.alt.trim() && config.src.trim() && publicAssetExists(config.src));
}

export function getRenderableStayAreaMap(mapId: string): StayAreaMapConfig | null {
  const config = getStayAreaMap(mapId);
  return isRenderableStayAreaMap(config) ? config : null;
}

export function getActiveStayAreaMaps() {
  return Object.values(maps).filter((config) => isRenderableStayAreaMap(config));
}
