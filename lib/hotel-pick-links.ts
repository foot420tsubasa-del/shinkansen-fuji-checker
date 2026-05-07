import hotelPickLinkData from "@/data/hotel-pick-links.json";
import type { HotelAreaKey } from "@/lib/hotel-links";

export type HotelPickLinkConfig = {
  name: string;
  hotelKey: HotelAreaKey;
  primaryProvider?: "agoda" | "trip";
  agodaUrl?: string;
  tripUrl: string;
  label: string;
  lastChecked?: string;
};

const hotelPickLinks = hotelPickLinkData as Record<string, HotelPickLinkConfig>;

export function getHotelPickLinkConfig(id: string): HotelPickLinkConfig | undefined {
  return hotelPickLinks[id];
}

export function getAllHotelPickLinkConfigs() {
  return hotelPickLinks;
}
