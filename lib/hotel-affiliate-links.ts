import hotelAffiliateLinkData from "@/data/hotel-affiliate-links.json";
import type { ProviderId } from "@/components/ui/ProviderButton";

export type HotelAffiliatePlacement = "top3" | "detail";
export type HotelAffiliateProvider = "booking_travelpayouts";
export type HotelAffiliateLocale = string | "all";

export type HotelAffiliateLinkConfig = {
  provider: HotelAffiliateProvider;
  area_id: string;
  locale: HotelAffiliateLocale;
  placement: HotelAffiliatePlacement;
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
  return (
    entry.enabled === true &&
    entry.provider === "booking_travelpayouts" &&
    entry.affiliate_url.trim().length > 0
  );
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
    .map(([id, entry]) => ({
      provider: entry.provider,
      href: entry.affiliate_url.trim(),
      trackingHref: entry.affiliate_url.trim(),
      label: "Booking.com",
      linkId: id,
      subId: entry.sub_id.trim() || undefined,
      priority: entry.priority,
    }))
    .sort((a, b) => a.priority - b.priority || a.linkId.localeCompare(b.linkId));
}

export function getAllHotelAffiliateLinkConfigs() {
  return hotelAffiliateLinks;
}
