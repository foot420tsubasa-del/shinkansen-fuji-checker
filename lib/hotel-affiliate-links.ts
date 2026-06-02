import hotelAffiliateLinkData from "@/data/hotel-affiliate-links.json";
import type { ProviderId } from "@/components/ui/ProviderButton";
import { getBookingHotelDestination, isActiveBookingHotelDestination } from "@/lib/booking-hotel-destinations";

export type HotelAffiliatePlacement = "top3" | "detail";
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
}: {
  areaId: string;
  locale: string;
  placement: HotelAffiliatePlacement;
}): HotelProviderLink[] {
  const matching = Object.entries(hotelAffiliateLinks).filter(([, entry]) => {
    if (!isReadyBookingLink(entry)) return false;
    if (entry.area_id !== areaId || entry.placement !== placement) return false;
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
      };
    })
    .filter((link) => link.href)
    .sort((a, b) => a.priority - b.priority || a.linkId.localeCompare(b.linkId));
}

export function getAllHotelAffiliateLinkConfigs() {
  return hotelAffiliateLinks;
}
