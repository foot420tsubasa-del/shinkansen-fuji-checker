import { getAffUrl } from "@/src/affiliateLinks";
import hotelLinkData from "@/data/hotel-links.json";

export type HotelAreaKey =
  | "shinjuku"
  | "ueno"
  | "asakusa"
  | "tokyoStation"
  | "shibuya"
  | "oshiage"
  | "kyotoStation"
  | "gionKawaramachi"
  | "namba"
  | "umeda"
  | "shinOsaka"
  | "kawaguchiko"
  | "hakone"
  | "hiroshima";

export type HotelLinkConfig = {
  areaName: string;
  city: string;
  label: string;
  tripUrl: string;
  fallbackLinkId: string;
};

const hotelLinks = hotelLinkData as Record<HotelAreaKey, HotelLinkConfig>;

export function getHotelLink(areaKey: HotelAreaKey) {
  const config = hotelLinks[areaKey];
  const tripUrl = config.tripUrl.trim();
  if (tripUrl) {
    return {
      ...config,
      href: tripUrl,
      provider: "trip" as const,
    };
  }

  return {
    ...config,
    href: getAffUrl(config.fallbackLinkId) ?? "#",
    provider: "klook" as const,
    label: `Compare ${config.areaName} hotels`,
  };
}

export function getTripHotelConfig(areaKey: HotelAreaKey) {
  return hotelLinks[areaKey];
}
