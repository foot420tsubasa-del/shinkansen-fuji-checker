import bookingHotelData from "@/data/booking-hotel-urls.json";

/**
 * Hotels go to Booking.com only (user decision, 2026-11-18). Each recommended
 * hotel has its Booking.com hotel page in data/booking-hotel-urls.json. The
 * affiliate link is issued later: once `affiliateUrl` is filled in (via the
 * URL管理 sheet), it replaces the plain page URL everywhere automatically.
 *
 * Keys are the hotel-pick ids (data/hotel-pick-links.json, stay-hotel-picks)
 * and `local:<id>` for data/local-hotel-picks.json.
 */
type BookingHotelEntry = {
  name: string;
  bookingUrl: string;
  affiliateUrl: string;
  checked: string;
  note?: string;
};

const hotels = (bookingHotelData as { hotels: Record<string, BookingHotelEntry> }).hotels;

export type BookingHotelLink = {
  href: string;
  name: string;
  /** True once the Booking.com affiliate link has been issued for this hotel. */
  affiliate: boolean;
  linkId: string;
  label: string;
};

export function getBookingHotelLink(id: string): BookingHotelLink | null {
  const entry = hotels[id];
  if (!entry) return null;
  const affiliateUrl = entry.affiliateUrl?.trim() ?? "";
  const href = affiliateUrl || entry.bookingUrl?.trim() || "";
  if (!href) return null;
  return {
    href,
    name: entry.name,
    affiliate: Boolean(affiliateUrl),
    linkId: `bookingHotel.${id}`,
    label: "Check on Booking.com",
  };
}

export function getAllBookingHotels() {
  return hotels;
}

/** Booking.com's own search page for a place with no area link of ours (Hakone, Kawaguchiko). */
export function bookingSearchUrl(place: string) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(place)}`;
}
