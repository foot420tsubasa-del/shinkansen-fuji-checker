import bookingDestinationData from "@/data/booking-hotel-destinations.json";
import hotelLinkData from "@/data/hotel-links.json";
import scenicStayData from "@/data/scenic-stays.json";
import type { AffiliateProvider } from "@/lib/affiliate/links";

type StaySource = "hotel-links" | "booking-hotel-destinations";

type StayReference = {
  source: StaySource;
  id: string;
};

type StayRouteConfig = {
  title: string;
  description: string;
  links: StayReference[];
};

type HotelAreaLink = {
  areaName: string;
  city: string;
  label: string;
  tripUrl: string;
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
const hotelAreas = hotelLinkData as Record<string, HotelAreaLink>;
const bookingDestinations = bookingDestinationData as Record<string, BookingDestination>;

function resolveReference(reference: StayReference): ResolvedScenicStayLink | null {
  if (reference.source === "hotel-links") {
    const area = hotelAreas[reference.id];
    if (!area?.tripUrl || /agoda/i.test(area.tripUrl)) return null;
    return {
      id: reference.id,
      label: area.label,
      href: area.tripUrl,
      provider: "trip",
      areaId: reference.id,
      city: area.city,
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
