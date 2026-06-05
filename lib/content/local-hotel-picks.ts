import localHotelPicksData from "@/data/local-hotel-picks.json";

export type LocalHotelPickStatus = "active" | "draft" | "disabled";

export type LocalHotelPick = {
  id: string;
  city: string;
  area: string;
  hotelName: string;
  bestFor: string;
  localReason: string;
  notIdealFor: string;
  tags: string[];
  tripFallbackUrl: string;
  officialUrl: string;
  status: LocalHotelPickStatus;
  lastChecked: string;
};

type RawLocalHotelPick = LocalHotelPick & {
  agodaUrl?: string;
};

const picks = localHotelPicksData as Record<string, RawLocalHotelPick>;

function toPublicPick(pick: RawLocalHotelPick): LocalHotelPick {
  const publicPick = { ...pick };
  delete publicPick.agodaUrl;
  return publicPick;
}

export const LOCAL_HOTEL_PICK_CITIES = ["Tokyo", "Kyoto", "Osaka"] as const;

export type LocalHotelPickCity = (typeof LOCAL_HOTEL_PICK_CITIES)[number];

const localHotelPickCityBySlug: Record<string, LocalHotelPickCity> = {
  tokyo: "Tokyo",
  kyoto: "Kyoto",
  osaka: "Osaka",
};

export function normalizeLocalHotelPickCity(city: string): LocalHotelPickCity | null {
  const normalized = city.trim().toLowerCase();
  return localHotelPickCityBySlug[normalized] ?? null;
}

export function getAllLocalHotelPicks(): LocalHotelPick[] {
  return Object.values(picks)
    .filter((p) => p.status === "active")
    .map(toPublicPick);
}

export function getLocalHotelPicksByCity(city: string): LocalHotelPick[] {
  const normalizedCity = normalizeLocalHotelPickCity(city) ?? city;
  return getAllLocalHotelPicks().filter((p) => p.city === normalizedCity);
}

export function getHotelPicksByCity(city: string): LocalHotelPick[] {
  return getLocalHotelPicksByCity(city);
}
