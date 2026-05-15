import affiliateLinkData from "@/data/affiliate-links.json";
import hotelLinkData from "@/data/hotel-links.json";
import hotelPickLinkData from "@/data/hotel-pick-links.json";
import localHotelPickData from "@/data/local-hotel-picks.json";
import { getAffUrl } from "@/src/affiliateLinks";

export type AffiliateProvider = "klook" | "agoda" | "trip" | "omio" | "other";

export type AffiliateDestinationType =
  | "ticket"
  | "pass"
  | "hotel"
  | "esim"
  | "airport"
  | "activity"
  | "insurance"
  | "route_compare";

export type AffiliatePlacement =
  | "home_seat_result"
  | "home_essentials"
  | "guide_rail_decision"
  | "guide_checklist"
  | "guide_article_inline"
  | "plan_trip_hero"
  | "plan_trip_rail_showdown"
  | "plan_trip_hotel_cards"
  | "plan_trip_arrival_cards"
  | "plan_trip_activity_cards"
  | "planner_route_stack"
  | "jrpass_booking_options"
  | "stay_area_hotel_card"
  | "footer_essentials"
  | "guide_top"
  | "seat_result"
  | "stay_area"
  | "hotel_pick"
  | "itinerary_day_card"
  | "airport_transfer"
  | "local_tokyo"
  | "footer"
  | "next_steps"
  | "home_popular"
  | "home_after_seat"
  | "train_signs_quick_answer"
  | "train_signs_google_maps"
  | "train_signs_checklist"
  | "local_hotel_pick"
  | "local_hotel_pick_more_options"
  | "stay_quick_answer"
  | "stay_area_glance_card"
  | "stay_comparison_table"
  | "stay_area_detail_primary"
  | "stay_area_detail_hotel_example"
  | "stay_quick_recommendation"
  | "stay_hub_continue_planning"
  | "guide_booking_option"
  | "jr_pass_comparison"
  | "shinkansen_ticket"
  | "seat_guide_booking"
  | "train_route_comparison";

export const AFFILIATE_PLACEMENTS: Record<string, AffiliatePlacement> = {
  homeSeatResult: "home_seat_result",
  homeEssentials: "home_essentials",
  guideRailDecision: "guide_rail_decision",
  guideChecklist: "guide_checklist",
  guideArticleInline: "guide_article_inline",
  planTripHero: "plan_trip_hero",
  planTripRailShowdown: "plan_trip_rail_showdown",
  planTripHotelCards: "plan_trip_hotel_cards",
  planTripArrivalCards: "plan_trip_arrival_cards",
  planTripActivityCards: "plan_trip_activity_cards",
  plannerRouteStack: "planner_route_stack",
  jrpassBookingOptions: "jrpass_booking_options",
  stayAreaHotelCard: "stay_area_hotel_card",
  footerEssentials: "footer_essentials",
};

export type AffiliateRegistryEntry = {
  id: string;
  provider: AffiliateProvider;
  product: string;
  label: string;
  url: string;
  adid?: string;
  destinationType: AffiliateDestinationType;
  defaultPlacement: AffiliatePlacement;
  linkSource: string;
  notes?: string;
};

type ManagedAffiliateLink = {
  label: string;
  provider: string;
  adid: string;
  klookPath: string;
  directUrl: string;
  usedOn: string[];
};

type HotelAreaLink = {
  areaName: string;
  city: string;
  label: string;
  tripUrl: string;
  agodaUrl?: string;
  fallbackLinkId: string;
};

type HotelPickLink = {
  name: string;
  hotelKey: string;
  tripUrl: string;
  agodaUrl?: string;
  label: string;
};

type LocalHotelPick = {
  id: string;
  city: string;
  area: string;
  hotelName: string;
  agodaUrl: string;
  tripFallbackUrl: string;
  status: "active" | "draft" | "disabled";
};

const managedLinks = affiliateLinkData as Record<string, ManagedAffiliateLink>;
const hotelLinks = hotelLinkData as Record<string, HotelAreaLink>;
const hotelPickLinks = hotelPickLinkData as Record<string, HotelPickLink>;
const localHotelPicks = localHotelPickData as Record<string, LocalHotelPick>;

function providerFromConfig(provider: string): AffiliateProvider {
  if (provider === "klook" || provider === "agoda" || provider === "trip" || provider === "omio") {
    return provider;
  }
  return "other";
}

function destinationTypeForLink(id: string, link: ManagedAffiliateLink): AffiliateDestinationType {
  const text = `${id} ${link.label} ${link.usedOn.join(" ")}`.toLowerCase();
  if (text.includes("omio") || text.includes("route comparison") || text.includes("bus")) return "route_compare";
  if (text.includes("jr pass")) return "pass";
  if (text.includes("shinkansen") || text.includes("ticket") || text.includes("rail")) return "ticket";
  if (text.includes("esim")) return "esim";
  if (text.includes("airport") || text.includes("narita") || text.includes("haneda") || text.includes("transfer")) return "airport";
  if (text.includes("insurance")) return "insurance";
  if (text.includes("hotel")) return "hotel";
  return "activity";
}

function productForLink(id: string, link: ManagedAffiliateLink, destinationType: AffiliateDestinationType) {
  if (id.startsWith("omio")) return "route_compare";
  if (destinationType === "ticket") return "shinkansen_ticket";
  if (destinationType === "pass") return "jr_pass";
  if (destinationType === "esim") return "esim";
  if (destinationType === "airport") return "airport_transfer";
  if (destinationType === "insurance") return "travel_insurance";
  if (destinationType === "hotel") return "hotel";
  return "activity";
}

function defaultPlacementForLink(id: string, destinationType: AffiliateDestinationType): AffiliatePlacement {
  if (id.startsWith("omio")) return "train_route_comparison";
  if (destinationType === "ticket") return "shinkansen_ticket";
  if (destinationType === "pass") return "jr_pass_comparison";
  if (destinationType === "hotel") return "stay_area_hotel_card";
  if (destinationType === "airport") return "airport_transfer";
  if (destinationType === "esim") return "home_essentials";
  return "guide_article_inline";
}

function normalizeUrl(url: string | null | undefined) {
  return (url ?? "").trim();
}

function buildManagedAffiliateEntries(): AffiliateRegistryEntry[] {
  return Object.entries(managedLinks)
    .map<AffiliateRegistryEntry | null>(([id, link]) => {
      const url = normalizeUrl(getAffUrl(id));
      if (!url) return null;
      const destinationType = destinationTypeForLink(id, link);
      return {
        id,
        provider: providerFromConfig(link.provider),
        product: productForLink(id, link, destinationType),
        label: link.label,
        url,
        adid: link.adid || undefined,
        destinationType,
        defaultPlacement: defaultPlacementForLink(id, destinationType),
        linkSource: "data/affiliate-links.json",
      } satisfies AffiliateRegistryEntry;
    })
    .filter((entry): entry is AffiliateRegistryEntry => Boolean(entry));
}

function buildHotelAreaEntries(): AffiliateRegistryEntry[] {
  return Object.entries(hotelLinks).flatMap(([areaKey, link]) => {
    const entries: AffiliateRegistryEntry[] = [];
    const tripUrl = normalizeUrl(link.tripUrl);
    const agodaUrl = normalizeUrl(link.agodaUrl);
    if (tripUrl) {
      entries.push({
        id: `hotelArea.${areaKey}.trip`,
        provider: "trip",
        product: "hotel_area_search",
        label: link.label,
        url: tripUrl,
        destinationType: "hotel",
        defaultPlacement: "stay_area_hotel_card",
        linkSource: "data/hotel-links.json",
        notes: `${link.city} / ${link.areaName}`,
      });
    }
    if (agodaUrl) {
      entries.push({
        id: `hotelArea.${areaKey}.agoda`,
        provider: "agoda",
        product: "hotel_area_search",
        label: link.label,
        url: agodaUrl,
        destinationType: "hotel",
        defaultPlacement: "stay_area_hotel_card",
        linkSource: "data/hotel-links.json",
        notes: `${link.city} / ${link.areaName}`,
      });
    }
    return entries;
  });
}

function buildHotelPickEntries(): AffiliateRegistryEntry[] {
  return Object.entries(hotelPickLinks).flatMap(([pickKey, link]) => {
    const entries: AffiliateRegistryEntry[] = [];
    const tripUrl = normalizeUrl(link.tripUrl);
    const agodaUrl = normalizeUrl(link.agodaUrl);
    if (tripUrl) {
      entries.push({
        id: `hotelPick.${pickKey}.trip`,
        provider: "trip",
        product: "hotel_pick",
        label: link.label,
        url: tripUrl,
        destinationType: "hotel",
        defaultPlacement: "hotel_pick",
        linkSource: "data/hotel-pick-links.json",
        notes: link.name,
      });
    }
    if (agodaUrl) {
      entries.push({
        id: `hotelPick.${pickKey}.agoda`,
        provider: "agoda",
        product: "hotel_pick",
        label: link.label,
        url: agodaUrl,
        destinationType: "hotel",
        defaultPlacement: "hotel_pick",
        linkSource: "data/hotel-pick-links.json",
        notes: link.name,
      });
    }
    return entries;
  });
}

function buildLocalHotelPickEntries(): AffiliateRegistryEntry[] {
  return Object.values(localHotelPicks).flatMap((pick) => {
    if (pick.status !== "active") return [];
    const entries: AffiliateRegistryEntry[] = [];
    const tripUrl = normalizeUrl(pick.tripFallbackUrl);
    const agodaUrl = normalizeUrl(pick.agodaUrl);
    if (tripUrl) {
      entries.push({
        id: `localHotelPick.${pick.id}.trip`,
        provider: "trip",
        product: "local_hotel_pick",
        label: `Check ${pick.hotelName} on Trip.com`,
        url: tripUrl,
        destinationType: "hotel",
        defaultPlacement: "local_hotel_pick",
        linkSource: "data/local-hotel-picks.json",
        notes: `${pick.city} / ${pick.area}`,
      });
    }
    if (agodaUrl) {
      entries.push({
        id: `localHotelPick.${pick.id}.agoda`,
        provider: "agoda",
        product: "local_hotel_pick",
        label: `Check ${pick.hotelName} on Agoda`,
        url: agodaUrl,
        destinationType: "hotel",
        defaultPlacement: "local_hotel_pick",
        linkSource: "data/local-hotel-picks.json",
        notes: `${pick.city} / ${pick.area}`,
      });
    }
    return entries;
  });
}

export const AFFILIATE_LINK_REGISTRY: AffiliateRegistryEntry[] = [
  ...buildManagedAffiliateEntries(),
  ...buildHotelAreaEntries(),
  ...buildHotelPickEntries(),
  ...buildLocalHotelPickEntries(),
];

export function getAffiliateLinkById(id: string) {
  return AFFILIATE_LINK_REGISTRY.find((entry) => entry.id === id);
}

export function getAffiliateLinkByUrl(url: string) {
  const normalized = normalizeUrl(url);
  if (!normalized) return undefined;
  return AFFILIATE_LINK_REGISTRY.find((entry) => entry.url === normalized);
}

export function resolveAffiliateClickMetadata(params: {
  linkId?: string;
  href: string;
  provider?: AffiliateProvider;
  label?: string;
}) {
  const entry = params.linkId ? getAffiliateLinkById(params.linkId) : getAffiliateLinkByUrl(params.href);
  return {
    link_id: params.linkId ?? entry?.id,
    provider: params.provider ?? entry?.provider,
    product: entry?.product,
    adid: entry?.adid,
    destination_type: entry?.destinationType,
    link_source: entry?.linkSource,
    default_placement: entry?.defaultPlacement,
    label: params.label ?? entry?.label,
  };
}
