import bookingHotelDestinationData from "@/data/booking-hotel-destinations.json";

export type BookingHotelScope = "station" | "neighborhood" | "area_cluster" | "city_fallback";
export type BookingInventoryConfidence = "high" | "medium" | "low";
export type BookingUrlStatus = "active" | "needs_review" | "too_broad" | "too_narrow";

export type BookingHotelDestinationConfig = {
  area_id: string;
  label: string;
  booking_query_label: string;
  booking_scope: BookingHotelScope;
  destination_url: string;
  affiliate_url: string;
  inventory_confidence: BookingInventoryConfidence;
  url_status: BookingUrlStatus;
  last_checked_at: string;
  notes: string;
};

const bookingHotelDestinations = bookingHotelDestinationData as Record<string, BookingHotelDestinationConfig>;

export function getBookingHotelDestination(destinationRef: string) {
  const ref = destinationRef.trim();
  if (!ref) return null;
  return bookingHotelDestinations[ref] ?? null;
}

/**
 * One affiliate programme, 2026-09-29 — see lib/hotel-links.ts. Booking.com
 * took 12 clicks in six months and returned nothing. Every CTA asks this
 * question before rendering, so answering "no" withdraws them all without
 * touching a page, and data/booking-hotel-destinations.json is left intact.
 */
const KLOOK_ONLY = true;

export function isActiveBookingHotelDestination(destination: BookingHotelDestinationConfig | null) {
  if (KLOOK_ONLY) return false;
  return Boolean(destination && destination.url_status === "active" && destination.affiliate_url.trim());
}

export function getAllBookingHotelDestinations() {
  return bookingHotelDestinations;
}
