import { getHotelLink, type HotelAreaKey } from "@/lib/hotel-links";
import { getHotelPickLinkConfig } from "@/lib/hotel-pick-links";
import stayHotelPickData from "@/data/stay-hotel-picks.json";

export type ManagedStayHotelPick = {
  id: string;
  name: string;
  area: string;
  price: string;
  hotelKey: HotelAreaKey;
  tag?: string;
  tripUrl?: string;
  label?: string;
};

export type ResolvedStayHotelPick = {
  id?: string;
  name: string;
  area: string;
  price: string;
  link: string;
  hotelKey?: HotelAreaKey;
  tag?: string;
  provider?: "trip" | "klook" | "agoda";
  trackingHref?: string;
  label?: string;
};

const stayHotelPicks = stayHotelPickData as Record<string, ManagedStayHotelPick[]>;

export function getManagedStayHotelPicks(slug: string, fallback: ResolvedStayHotelPick[]): ResolvedStayHotelPick[] {
  const picks = stayHotelPicks[slug];
  if (!picks?.length) return fallback;

  return picks.map((pick) => {
    const shared = getHotelPickLinkConfig(pick.id);
    const hotelKey = shared?.hotelKey ?? pick.hotelKey;
    const tripUrl = shared?.tripUrl?.trim() || pick.tripUrl?.trim();
    const areaHotel = getHotelLink(hotelKey);
    return {
      id: pick.id,
      name: shared?.name ?? pick.name,
      area: pick.area,
      price: pick.price,
      hotelKey,
      tag: pick.tag || undefined,
      link: tripUrl || areaHotel.href,
      trackingHref: tripUrl || areaHotel.trackingHref,
      provider: tripUrl ? "trip" : areaHotel.provider,
      label: tripUrl ? shared?.label || pick.label || `Check ${pick.name} on Trip.com` : areaHotel.label,
    };
  });
}

export function getStayHotelPickConfig() {
  return stayHotelPicks;
}
