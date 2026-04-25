export const AFFILIATE_REL = "sponsored nofollow noopener noreferrer";
export const EXTERNAL_REL = "noopener noreferrer";

const affiliateHosts = [
  "affiliate.klook.com",
  "klook.com",
  "www.klook.com",
  "booking.com",
  "www.booking.com",
  "agoda.com",
  "www.agoda.com",
];

export function isAffiliateUrl(href: string) {
  try {
    const url = new URL(href);
    return affiliateHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

export function relForExternalLink(href: string) {
  if (!href.startsWith("http")) return undefined;
  return isAffiliateUrl(href) ? AFFILIATE_REL : EXTERNAL_REL;
}
