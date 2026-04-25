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
};

export const AFFILIATE_LINKS: Record<string, LinkConfig> = linkData as Record<string, LinkConfig>;

export function getAffUrl(linkId: string): string | null {
  const link = AFFILIATE_LINKS[linkId];
  if (!link) return null;
  if (link.directUrl.trim()) return link.directUrl;
  if (link.provider === "klook" && link.klookPath.trim()) {
    return klookAff(link.klookPath, link.adid);
  }
  return null;
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
export const ESIM_URL = requireAffUrl("esim");
export const AIRPORT_TRANSFER_URL = requireAffUrl("airportTransfer");
export const INSURANCE_URL = requireAffUrl("insurance");
export const CAR_RENTAL_URL = requireAffUrl("carRental");
export const KLOOK_URL = JR_PASS_URL;
