import hotelAffiliateLinkData from "@/data/hotel-affiliate-links.json";
import type { ProviderId } from "@/components/ui/ProviderButton";
import type { AffiliatePlacement } from "@/lib/affiliate/links";
import { getBookingHotelDestination, isActiveBookingHotelDestination } from "@/lib/booking-hotel-destinations";

export type HotelAffiliatePlacement =
  | "top3"
  | "detail"
  | "tokyo_first_time_card"
  | "before_shinkansen_card"
  | "airport_page_first_night_cta"
  | "comparison_area_cta"
  | "tokyo_hotels_hero"
  | "tokyo_hotels_bottom"
  | "plan_trip_hotel_cards";
export type HotelAffiliateProvider = "booking_travelpayouts";
export type HotelAffiliateLocale = string | "all";

export type HotelAffiliateLinkConfig = {
  provider: HotelAffiliateProvider;
  area_id: string;
  locale: HotelAffiliateLocale;
  placement: HotelAffiliatePlacement;
  destination_ref?: string;
  destination_url: string;
  affiliate_url: string;
  page_group?: string;
  sub_id: string;
  enabled: boolean;
  priority: number;
  last_checked_at: string;
  notes: string;
};

export type HotelProviderLink = {
  provider: ProviderId;
  href: string;
  trackingHref: string;
  label: string;
  linkId: string;
  subId?: string;
  priority: number;
  placement: AffiliatePlacement;
};

const hotelAffiliateLinks = hotelAffiliateLinkData as Record<string, HotelAffiliateLinkConfig>;

function isReadyBookingLink(entry: HotelAffiliateLinkConfig) {
  if (entry.enabled !== true || entry.provider !== "booking_travelpayouts") return false;
  if (entry.destination_ref?.trim()) {
    return isActiveBookingHotelDestination(getBookingHotelDestination(entry.destination_ref));
  }
  return entry.affiliate_url.trim().length > 0;
}

function getBookingAffiliateUrl(entry: HotelAffiliateLinkConfig) {
  if (entry.destination_ref?.trim()) {
    const destination = getBookingHotelDestination(entry.destination_ref);
    if (!isActiveBookingHotelDestination(destination)) return "";
    return destination?.affiliate_url.trim() ?? "";
  }
  return entry.affiliate_url.trim();
}

function withTravelpayoutsSubId(href: string, subId: string) {
  const cleanHref = href.trim();
  const cleanSubId = subId.trim();
  if (!cleanHref || !cleanSubId) return cleanHref;
  try {
    const url = new URL(cleanHref);
    url.searchParams.set("sub_id", cleanSubId);
    return url.toString();
  } catch {
    const [base, hash = ""] = cleanHref.split("#");
    const separator = base.includes("?") ? "&" : "?";
    const withoutExistingSubId = base
      .replace(/([?&])sub_id=[^&#]*&?/g, "$1")
      .replace(/[?&]$/, "");
    const nextSeparator = withoutExistingSubId.includes("?") ? "&" : separator;
    return `${withoutExistingSubId}${nextSeparator}sub_id=${encodeURIComponent(cleanSubId)}${hash ? `#${hash}` : ""}`;
  }
}

export function suggestedTravelpayoutsSubId({
  page,
  placement,
  areaId,
  locale,
}: {
  page: string;
  placement: HotelAffiliatePlacement;
  areaId: string;
  locale: string;
}) {
  return `fs_${page}_${placement}_${areaId}_${locale}`;
}

export function getHotelProviderLinks({
  areaId,
  locale,
  placement,
  pageGroup,
}: {
  areaId: string;
  locale: string;
  placement: HotelAffiliatePlacement;
  pageGroup?: string;
}): HotelProviderLink[] {
  const matching = Object.entries(hotelAffiliateLinks).filter(([, entry]) => {
    if (!isReadyBookingLink(entry)) return false;
    if (entry.area_id !== areaId || entry.placement !== placement) return false;
    if (pageGroup && entry.page_group !== pageGroup) return false;
    if (!pageGroup && entry.page_group) return false;
    return entry.locale === locale || entry.locale === "all";
  });

  const localeSpecific = matching.filter(([, entry]) => entry.locale === locale);
  const fallback = matching.filter(([, entry]) => entry.locale === "all");
  const source = localeSpecific.length > 0 ? localeSpecific : fallback;

  return source
    .map(([id, entry]) => {
      const subId = entry.sub_id.trim() || undefined;
      const href = withTravelpayoutsSubId(getBookingAffiliateUrl(entry), subId ?? "");
      return {
        provider: entry.provider,
        href,
        trackingHref: href,
        label: "Booking.com",
        linkId: id,
        subId,
        priority: entry.priority,
        placement: entry.placement,
      };
    })
    .filter((link) => link.href)
    .sort((a, b) => a.priority - b.priority || a.linkId.localeCompare(b.linkId));
}

export function getAllHotelAffiliateLinkConfigs() {
  return hotelAffiliateLinks;
}
