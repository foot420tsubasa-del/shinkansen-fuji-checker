import { getHotelLink, type HotelAreaKey } from "@/lib/hotel-links";
import { getHotelPickLinkConfig } from "@/lib/hotel-pick-links";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import stayHotelPickData from "@/data/stay-hotel-picks.json";

export type ManagedStayHotelPick = {
  id: string;
  name: string;
  area: string;
  price: string;
  hotelKey: HotelAreaKey;
  tag?: string;
  primaryProvider?: "agoda" | "trip";
  agodaUrl?: string;
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
  provider?: "trip" | "klook" | "booking_travelpayouts";
  trackingHref?: string;
  label?: string;
  providerLinks?: Array<{
    provider: "booking_travelpayouts";
    href: string;
    trackingHref?: string;
    label: string;
    linkId: string;
  }>;
};

type StayHotelPickProviderLink = NonNullable<ResolvedStayHotelPick["providerLinks"]>[number];

const stayHotelPicks = stayHotelPickData as Record<string, ManagedStayHotelPick[]>;

export function getManagedStayHotelPicks(slug: string, fallback: ResolvedStayHotelPick[]): ResolvedStayHotelPick[] {
  const picks = stayHotelPicks[slug];
  if (!picks?.length) return fallback;

  return picks.map((pick) => {
    const shared = getHotelPickLinkConfig(pick.id);
    const hotelKey = shared?.hotelKey ?? pick.hotelKey;
    // Hotels go to their Booking.com page (2026-11-18); see lib/booking-hotels.ts.
    const booking = getBookingHotelLink(pick.id);
    const areaHotel = getHotelLink(hotelKey);
    const providerLinks: StayHotelPickProviderLink[] = [];
    if (booking) {
      providerLinks.push({
        provider: "booking_travelpayouts",
        href: booking.href,
        trackingHref: booking.href,
        label: "Booking.com",
        linkId: booking.linkId,
      });
    }
    const specificUrl = booking?.href;
    const specificProvider = specificUrl ? ("booking_travelpayouts" as const) : undefined;
    const providerLabel = "Booking.com";
    const specificLabel = `Check ${shared?.name ?? pick.name} on ${providerLabel}`;
    return {
      id: pick.id,
      name: shared?.name ?? pick.name,
      area: pick.area,
      price: pick.price,
      hotelKey,
      tag: pick.tag || undefined,
      link: specificUrl || areaHotel.href,
      trackingHref: specificUrl || areaHotel.trackingHref,
      provider: specificProvider ?? (areaHotel.provider === "trip" || areaHotel.provider === "klook" ? areaHotel.provider : undefined),
      label: specificUrl ? specificLabel : areaHotel.label,
      providerLinks: providerLinks.length ? providerLinks : undefined,
    };
  });
}

export function getStayHotelPickConfig() {
  return stayHotelPicks;
}
