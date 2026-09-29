// app/api/fuji-window/route.ts
//
// Ten days of hourly sky over the stretch of the Tokaido line where Mt. Fuji
// is in view. The existing /api/fuji-visibility answers "today, roughly";
// this one has to answer "the 09:52 on the 14th", so it returns the raw hours
// and lets the client pick the one that matters.

import { NextResponse } from "next/server";

// Near Shin-Fuji, the same point the today-widget samples.
const LAT = 35.15;
const LON = 138.68;
const FORECAST_DAYS = 10;

export type FujiWindowResponse = {
  time: string[];
  cloud: number[];
  precip: number[];
  updatedAt: string;
  source: string;
};

// Open-Meteo publishes hourly; re-fetching more often than that only adds
// load without adding information.
export const revalidate = 3600;

export async function GET() {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(LAT));
    url.searchParams.set("longitude", String(LON));
    url.searchParams.set("hourly", "cloudcover,precipitation");
    url.searchParams.set("forecast_days", String(FORECAST_DAYS));
    url.searchParams.set("timezone", "Asia/Tokyo");

    const res = await fetch(url.toString(), { next: { revalidate } });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch weather" }, { status: 502 });
    }

    const json = await res.json();
    const time: unknown = json?.hourly?.time;
    const cloud: unknown = json?.hourly?.cloudcover;
    const precip: unknown = json?.hourly?.precipitation;

    if (!Array.isArray(time) || !Array.isArray(cloud) || !time.length) {
      return NextResponse.json({ error: "No hourly data" }, { status: 502 });
    }

    const payload: FujiWindowResponse = {
      // Open-Meteo returns "2026-10-14T09:00" in the requested timezone.
      time: time as string[],
      cloud: (cloud as Array<number | null>).map((v) => (typeof v === "number" ? v : 0)),
      // precipitation can be absent on some responses; treat a gap as dry
      // rather than dropping the whole forecast.
      precip: Array.isArray(precip)
        ? (precip as Array<number | null>).map((v) => (typeof v === "number" ? v : 0))
        : (time as string[]).map(() => 0),
      updatedAt: new Date().toISOString(),
      source: "open-meteo.com",
    };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error fetching weather" }, { status: 500 });
  }
}
