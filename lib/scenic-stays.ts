import bookingDestinationData from "@/data/booking-hotel-destinations.json";
import scenicStayData from "@/data/scenic-stays.json";
import type { AffiliateProvider } from "@/lib/affiliate/links";
import { getBookingHotelLink } from "@/lib/booking-hotels";
import { getAreaHotelChoice, type HotelAreaKey } from "@/lib/hotel-links";

// Hotels: a recommended hotel's Booking.com page (booking-hotel), or a
// Booking.com area search (booking-hotel-destinations). Areas with neither use
// the site's area hotel link, which stays on Klook (klook-area). No Trip.com,
// no Agoda (2026-11-18).
type StaySource = "booking-hotel" | "booking-hotel-destinations" | "klook-area";

type StayReference = {
  source: StaySource;
  id: string;
};

type StayRouteConfig = {
  title: string;
  description: string;
  links: StayReference[];
};

type BookingDestination = {
  area_id: string;
  label: string;
  affiliate_url: string;
  url_status: string;
};

export type ResolvedScenicStayLink = {
  id: string;
  label: string;
  href: string;
  provider: AffiliateProvider;
  areaId: string;
  city?: string;
};

export type ResolvedScenicStay = {
  title: string;
  description: string;
  disclosure: string;
  links: ResolvedScenicStayLink[];
};

const stayRoutes = scenicStayData.routes as Record<string, StayRouteConfig>;
const bookingDestinations = bookingDestinationData as Record<string, BookingDestination>;

function resolveReference(reference: StayReference): ResolvedScenicStayLink | null {
  if (reference.source === "booking-hotel") {
    const hotel = getBookingHotelLink(reference.id);
    if (!hotel) return null;
    return {
      id: hotel.linkId,
      label: `${hotel.name} on Booking.com`,
      href: hotel.href,
      provider: "booking_travelpayouts",
      areaId: reference.id,
    };
  }
  if (reference.source === "klook-area") {
    const area = getAreaHotelChoice(reference.id as HotelAreaKey);
    if (!area) return null;
    return {
      id: area.linkId,
      label: area.label,
      href: area.href,
      provider: area.provider,
      areaId: reference.id,
    };
  }

  const area = bookingDestinations[reference.id];
  if (!area?.affiliate_url || area.url_status !== "active" || /agoda/i.test(area.affiliate_url)) return null;
  return {
    id: reference.id,
    label: `Compare ${area.label} stays on Booking.com`,
    href: area.affiliate_url,
    provider: "booking_travelpayouts",
    areaId: area.area_id,
  };
}

export function getScenicStay(routeId: string): ResolvedScenicStay | null {
  const config = stayRoutes[routeId];
  if (!config) return null;
  const links = config.links.map(resolveReference).filter((link): link is ResolvedScenicStayLink => Boolean(link));
  if (links.length === 0) return null;
  return {
    title: config.title,
    description: config.description,
    disclosure: scenicStayData.disclosure,
    links,
  };
}

export const SCENIC_STAY_ROUTE_IDS = Object.keys(stayRoutes);
