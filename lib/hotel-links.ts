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
  checkinType?: "dynamic_offset" | "fixed_date";
  lastChecked?: string;
};

const hotelLinks = hotelLinkData as Record<HotelAreaKey, HotelLinkConfig>;

export function getHotelLink(areaKey: HotelAreaKey) {
  const config = hotelLinks[areaKey];
  const tripUrl = config.tripUrl.trim();
  if (tripUrl) {
    const checkinType = config.checkinType ?? "dynamic_offset";
    return {
      ...config,
      href:
        checkinType === "dynamic_offset"
          ? `/api/trip-hotel-redirect?area=${encodeURIComponent(areaKey)}`
          : tripUrl,
      trackingHref: tripUrl,
      provider: "trip" as const,
      checkinType,
    };
  }

  return {
    ...config,
    href: getAffUrl(config.fallbackLinkId) ?? "#",
    trackingHref: getAffUrl(config.fallbackLinkId) ?? "#",
    provider: "klook" as const,
    label: `Compare ${config.areaName} hotels`,
    checkinType: "fixed_date" as const,
  };
}

export function getTripHotelConfig(areaKey: HotelAreaKey) {
  return hotelLinks[areaKey];
}
