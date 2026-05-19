import linkData from "../data/affiliate-links.json";

const AID = "104861";

export function klookAff(path: string, adid = "1165791", utm?: { source?: string; medium?: string; campaign?: string }): string {
  const base = `https://affiliate.klook.com/redirect?aid=${AID}&aff_adid=${adid}&k_site=https%3A%2F%2Fwww.klook.com%2Fen-US%2F${encodeURIComponent(path)}`;
  if (!utm) return base;
  const params = new URLSearchParams();
  if (utm.source) params.set("utm_source", utm.source);
  if (utm.medium) params.set("utm_medium", utm.medium);
  if (utm.campaign) params.set("utm_campaign", utm.campaign);
  return `${base}&${params.toString()}`;
}

export const UTM_COMMAND_CENTER = { source: "fujiseat", medium: "command-center", campaign: "trip-planner" } as const;
export const UTM_GUIDE = { source: "fujiseat", medium: "guide", campaign: "fuji-guide" } as const;
export const UTM_HOME = { source: "fujiseat", medium: "homepage", campaign: "seat-checker" } as const;

export type LinkConfig = {
  label: string;
  provider: string;
  adid: string;
  klookPath: string;
  directUrl: string;
  usedOn: string[];
  product?: string;
  routeFrom?: string;
  routeTo?: string;
  routeType?: string;
  targetUrl?: string;
  affiliateUrl?: string;
  urlStatus?: "ready" | "needs_affiliate_conversion" | "needs_city_id" | "fallback_only" | "do_not_render";
  urlSpecificity?: "route_search_prefilled" | "route_specific_page" | "country_category" | "generic_homepage" | "missing";
  destinationType?: string;
  defaultPlacement?: string;
  linkSource?: string;
  city?: string;
  country?: string;
  adminTitle?: string;
  adminDescription?: string;
  adminNotes?: string;
};

export const AFFILIATE_LINKS: Record<string, LinkConfig> = linkData as Record<string, LinkConfig>;

export function getAffUrl(linkId: string): string | null {
  const link = AFFILIATE_LINKS[linkId];
  if (!link) return null;
  if (link.directUrl.trim()) return link.directUrl;
  if (link.affiliateUrl?.trim()) return link.affiliateUrl;
  if (link.provider === "klook" && link.klookPath.trim()) {
    return klookAff(link.klookPath, link.adid);
  }
  return null;
}

export function getReadyAffUrl(linkId: string, options: { allowFallback?: boolean } = {}): string | null {
  const link = AFFILIATE_LINKS[linkId];
  if (!link) return null;
  const status = link.urlStatus;
  if (status && status !== "ready" && !(options.allowFallback && status === "fallback_only")) return null;
  return getAffUrl(linkId);
}

export function getAffiliateConfig(linkId: string): LinkConfig | undefined {
  return AFFILIATE_LINKS[linkId];
}

export function requireAffUrl(linkId: string): string {
  const url = getAffUrl(linkId);
  if (!url) {
    throw new Error(`Affiliate link "${linkId}" is not configured with a usable URL.`);
  }
  return url;
}

export function getAffLabel(linkId: string): string {
  return AFFILIATE_LINKS[linkId]?.label ?? linkId;
}

export function hasAffUrl(linkId: string): boolean {
  return getAffUrl(linkId) !== null;
}

export const JR_PASS_URL = requireAffUrl("jrPass");
export const SHINKANSEN_TICKET_URL = requireAffUrl("shinkansenTicket");
export const ESIM_URL = requireAffUrl("esim");
export const AIRPORT_TRANSFER_URL = requireAffUrl("airportTransfer");
export const INSURANCE_URL = requireAffUrl("insurance");
export const CAR_RENTAL_URL = requireAffUrl("carRental");
export const KLOOK_URL = SHINKANSEN_TICKET_URL;
export const OMIO_SHINKANSEN_URL = getAffUrl("omioShinkansen");
export const OMIO_TOKYO_KYOTO_URL = getAffUrl("omioTokyoKyoto");
export const OMIO_TOKYO_OSAKA_URL = getAffUrl("omioTokyoOsaka");
export const OMIO_JAPAN_RAIL_PASS_URL = getAffUrl("omioJapanRailPass");
export const OMIO_JAPAN_TRAIN_URL = getAffUrl("omioJapanTrain");
export const OMIO_JAPAN_BUS_URL = getAffUrl("omioJapanBus");
