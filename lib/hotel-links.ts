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
  primaryProvider?: "agoda" | "trip";
  agodaUrl?: string;
  tripUrl: string;
  fallbackProvider?: "trip" | "agoda" | "klook";
  fallbackLinkId: string;
  checkinType?: "dynamic_offset" | "fixed_date";
  lastChecked?: string;
};

const hotelLinks = hotelLinkData as Record<HotelAreaKey, HotelLinkConfig>;

const agodaCityLinkIdByCity: Partial<Record<HotelLinkConfig["city"], string>> = {
  Tokyo: "agodaTokyo",
  Kyoto: "agodaKyoto",
  Osaka: "agodaOsaka",
  Kawaguchiko: "agodaKawaguchiko",
  Hakone: "agodaHakone",
};

function agodaLabel(config: HotelLinkConfig) {
  if (config.label.includes("Agoda")) return config.label;
  return `Compare ${config.areaName} hotels on Agoda`;
}

export function getAgodaHotelAreaUrl(areaKey: HotelAreaKey) {
  const config = hotelLinks[areaKey];
  const explicitAgodaUrl = config.agodaUrl?.trim();

  if (explicitAgodaUrl) {
    return {
      href: explicitAgodaUrl,
      trackingHref: explicitAgodaUrl,
      linkId: `hotelArea.${areaKey}.agoda`,
    };
  }

  const fallbackLinkId = agodaCityLinkIdByCity[config.city];
  const fallbackUrl = fallbackLinkId ? getAffUrl(fallbackLinkId) : undefined;

  if (!fallbackUrl) return null;

  return {
    href: fallbackUrl,
    trackingHref: fallbackUrl,
    linkId: fallbackLinkId,
  };
}

export function getHotelLink(areaKey: HotelAreaKey) {
  const config = hotelLinks[areaKey];
  const agodaUrl = config.agodaUrl?.trim() ?? "";
  const tripUrl = config.tripUrl.trim();
  const primaryProvider = config.primaryProvider;

  if ((primaryProvider === "agoda" && agodaUrl) || (!primaryProvider && agodaUrl)) {
    return {
      ...config,
      label: agodaLabel(config),
      href: agodaUrl,
      trackingHref: agodaUrl,
      provider: "agoda" as const,
      checkinType: config.checkinType ?? "fixed_date",
    };
  }

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

  if (config.fallbackProvider === "agoda" && agodaUrl) {
    return {
      ...config,
      label: agodaLabel(config),
      href: agodaUrl,
      trackingHref: agodaUrl,
      provider: "agoda" as const,
      checkinType: config.checkinType ?? "fixed_date",
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
