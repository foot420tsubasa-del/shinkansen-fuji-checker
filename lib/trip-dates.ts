/*
 * Hotel stay-date helpers for provider URLs (Trip.com redirect).
 *
 * Rules (revenue-funnel spec, Phase 4):
 * - Dates are computed per request, never at build time.
 * - Default check-in is +30 days from "today in Japan" (JST), check-out one
 *   day later, so a UTC server clock can never produce a date that is
 *   already "yesterday" for the traveler or the provider.
 * - Caller-supplied dates are only accepted when properly formatted, not in
 *   the past, and check-out is strictly after check-in; otherwise the safe
 *   defaults are used.
 */

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight-normalized "today" in Japan Standard Time, as a UTC timestamp. */
export function jstToday(now: Date = new Date()): Date {
  const jst = new Date(now.getTime() + JST_OFFSET_MS);
  return new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()));
}

export function formatTripDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

export function defaultTripDates(now: Date = new Date()): { checkin: string; checkout: string } {
  const base = jstToday(now);
  const checkin = new Date(base.getTime() + 30 * DAY_MS);
  const checkout = new Date(checkin.getTime() + DAY_MS);
  return { checkin: formatTripDate(checkin), checkout: formatTripDate(checkout) };
}

function parseTripDate(value: string | null): Date | null {
  if (!value || !/^\d{4}\/\d{2}\/\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("/").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  // Reject impossible dates like 2026/02/31 that Date would silently roll over.
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date;
}

/**
 * Resolve the stay dates for a provider URL. Falls back to the safe defaults
 * whenever the requested dates are malformed, in the past (JST), or not in
 * check-in < check-out order.
 */
export function resolveTripDates(
  requestedCheckin: string | null,
  requestedCheckout: string | null,
  now: Date = new Date(),
): { checkin: string; checkout: string } {
  const defaults = defaultTripDates(now);
  const inDate = parseTripDate(requestedCheckin);
  const outDate = parseTripDate(requestedCheckout);
  if (!inDate || !outDate) return defaults;
  const today = jstToday(now);
  if (inDate.getTime() <= today.getTime()) return defaults;
  if (outDate.getTime() <= inDate.getTime()) return defaults;
  return { checkin: formatTripDate(inDate), checkout: formatTripDate(outDate) };
}
