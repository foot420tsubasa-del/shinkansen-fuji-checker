import { NextResponse } from "next/server";
import hotelLinkData from "@/data/hotel-links.json";
import type { HotelAreaKey, HotelLinkConfig } from "@/lib/hotel-links";

const hotelLinks = hotelLinkData as Record<HotelAreaKey, HotelLinkConfig>;
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

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

function formatTripDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

function defaultTripDates() {
  const checkin = new Date();
  checkin.setDate(checkin.getDate() + 45);
  const checkout = new Date(checkin);
  checkout.setDate(checkout.getDate() + 1);
  return {
    checkin: formatTripDate(checkin),
    checkout: formatTripDate(checkout),
  };
}

function validTripDate(value: string | null) {
  return value && /^\d{4}\/\d{2}\/\d{2}$/.test(value) ? value : null;
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
    return redirectNoStore(new URL("/", request.url));
  }

  const defaults = defaultTripDates();
  const checkin = validTripDate(url.searchParams.get("checkin")) ?? defaults.checkin;
  const checkout = validTripDate(url.searchParams.get("checkout")) ?? defaults.checkout;

  const resolved = await resolveTripUrl(config.tripUrl);
  if (!resolved) {
    return redirectNoStore(config.tripUrl);
  }

  const target = new URL(resolved);
  // Preserve Trip.com affiliate params from the resolved LinkHub URL; only replace hotel stay dates.
  target.searchParams.set("checkin", checkin);
  target.searchParams.set("checkout", checkout);

  return redirectNoStore(target.toString());
}
