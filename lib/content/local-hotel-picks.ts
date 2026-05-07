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
  agodaUrl: string;
  tripFallbackUrl: string;
  officialUrl: string;
  status: LocalHotelPickStatus;
  lastChecked: string;
};

const picks = localHotelPicksData as Record<string, LocalHotelPick>;

export function getAllLocalHotelPicks(): LocalHotelPick[] {
  return Object.values(picks).filter((p) => p.status === "active");
}

export function getLocalHotelPicksByCity(city: string): LocalHotelPick[] {
  return getAllLocalHotelPicks().filter((p) => p.city === city);
}

export const LOCAL_HOTEL_PICK_CITIES = ["Tokyo", "Kyoto", "Osaka"] as const;
