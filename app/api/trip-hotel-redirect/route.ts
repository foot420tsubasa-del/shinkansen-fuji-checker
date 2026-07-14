import { NextResponse } from "next/server";
import hotelLinkData from "@/data/hotel-links.json";
import type { HotelAreaKey, HotelLinkConfig } from "@/lib/hotel-links";
import { resolveTripDates } from "@/lib/trip-dates";

/*
 * Trip.com hotel-search redirect.
 *
 * Revenue-funnel spec (Phase 4) guarantees:
 * - Stay dates are computed on every request (JST-safe, +30 days) — never at
 *   build time, and never in the past. Caller-supplied dates are validated
 *   (format, future, check-out after check-in) or replaced with defaults.
 * - Unknown / missing areas fall back to a safe internal hotel-decision page,
 *   never the generic homepage.
 * - Affiliate parameters on the resolved LinkHub URL (Allianceid, SID,
 *   trip_sub*) are preserved; only the stay dates are replaced. An optional
 *   `sub` query param is recorded into trip_sub2 (only when that slot is
 *   empty) so area / source page / placement can be distinguished in
 *   provider reporting.
 * - Any URL resolution failure falls back to the registered short link
 *   rather than returning a 500.
 */

const hotelLinks = hotelLinkData as Record<HotelAreaKey, HotelLinkConfig>;
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

/** Safe internal fallback for unknown areas — a hotel-decision page, not "/". */
const FALLBACK_PATH = "/areas-to-stay/tokyo-stay-area-index";

/** Keep sub ids within the provider's expected shape. */
function sanitizeSubId(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.trim().slice(0, 60);
  return /^[a-zA-Z0-9_-]+$/.test(cleaned) ? cleaned : null;
}

function redirectNoStore(url: string | URL) {
  return NextResponse.redirect(url, {
    status: 302,
    headers: NO_STORE_HEADERS,
  });
}

function isHotelAreaKey(value: string | null): value is HotelAreaKey {
  return Boolean(value && Object.prototype.hasOwnProperty.call(hotelLinks, value));
}

function isTripUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "trip.com" || url.hostname.endsWith(".trip.com"));
  } catch {
    return false;
  }
}

async function resolveTripUrl(shortUrl: string) {
  if (!isTripUrl(shortUrl)) return null;
  try {
    const res = await fetch(shortUrl, { redirect: "manual", cache: "no-store" });
    const location = res.headers.get("location");
    const resolved = location ? new URL(location, shortUrl).toString() : null;
    return resolved && isTripUrl(resolved) ? resolved : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const area = url.searchParams.get("area");
  const config = isHotelAreaKey(area) ? hotelLinks[area] : null;

  if (!config?.tripUrl) {
    // Unknown or unregistered area: send to the internal stay-decision page.
    return redirectNoStore(new URL(FALLBACK_PATH, request.url));
  }

  const { checkin, checkout } = resolveTripDates(
    url.searchParams.get("checkin"),
    url.searchParams.get("checkout"),
  );
  const subId = sanitizeSubId(url.searchParams.get("sub"));

  const resolved = await resolveTripUrl(config.tripUrl);
  if (!resolved) {
    // Resolution failed — the registered short link still lands on the right
    // area search with affiliate attribution, so fall back instead of 500.
    return redirectNoStore(config.tripUrl);
  }

  let target: URL;
  try {
    target = new URL(resolved);
  } catch {
    return redirectNoStore(config.tripUrl);
  }
  // Preserve Trip.com affiliate params from the resolved LinkHub URL
  // (Allianceid / SID / trip_sub1 / locale / currency / area keyword);
  // only replace the stay dates and, when free, record the placement sub id.
  target.searchParams.set("checkin", checkin);
  target.searchParams.set("checkout", checkout);
  if (subId && !target.searchParams.get("trip_sub2")) {
    target.searchParams.set("trip_sub2", subId);
  }

  return redirectNoStore(target.toString());
}
