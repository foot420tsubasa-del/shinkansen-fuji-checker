import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { HotelAreaKey, HotelLinkConfig } from "@/lib/hotel-links";

/*
 * Public, read-only link resolver for the Rail 3D pages
 * (/tokyo-rail-3d.html, /kansai-rail-3d.html).
 *
 * The static single-file tools must not hardcode affiliate URLs, so they
 * fetch this endpoint at runtime. Hotel URLs are resolved here from the
 * admin-managed master (data/hotel-links.json — read per request so admin
 * edits show up without a redeploy, same as the admin routes). Internal
 * guide URLs are plain site paths. Stations / lines with no entry simply
 * don't appear, and the tool hides the CTA.
 */

const DATA_PATH = path.join(process.cwd(), "data", "hotel-links.json");

type CtaLink = { href: string; external: boolean; provider?: "trip" };

/** Tokyo stations (Japanese names, as used in window.STATIONS) → Stay Finder area ids. */
const TOKYO_STATION_TO_AREA: Record<string, string> = {
  新宿: "shinjuku",
  東京: "tokyo-station",
  上野: "ueno",
  浅草: "asakusa",
  押上: "oshiage",
  蔵前: "kuramae",
  品川: "shinagawa",
  渋谷: "shibuya",
  池袋: "ikebukuro",
  秋葉原: "akihabara",
  銀座: "ginza-yurakucho",
  有楽町: "ginza-yurakucho",
  新橋: "shimbashi",
  日本橋: "nihombashi",
  浜松町: "hamamatsucho-daimon",
  大門: "hamamatsucho-daimon",
  恵比寿: "ebisu",
  目黒: "meguro",
  五反田: "gotanda",
  六本木: "roppongi",
  神田: "kanda",
  両国: "ryogoku",
  錦糸町: "kinshicho",
  人形町: "ningyocho",
  飯田橋: "iidabashi",
  御茶ノ水: "ochanomizu",
  豊洲: "toyosu",
  赤坂見附: "akasaka-mitsuke",
  表参道: "aoyama-omotesando",
  清澄白河: "kiyosumi-shirakawa",
  門前仲町: "monzen-nakacho",
  代々木: "yoyogi",
  後楽園: "korakuen-kasuga",
  八丁堀: "hatchobori",
  茅場町: "kayabacho",
  浅草橋: "asakusabashi",
  馬喰町: "bakurocho-higashinihombashi",
};

/** Kansai stations (Japanese names) → hotel-links.json keys (admin master). */
const KANSAI_STATION_TO_HOTEL_KEY: Record<string, HotelAreaKey> = {
  京都: "kyotoStation",
  祇園四条: "gionKawaramachi",
  河原町: "gionKawaramachi",
  京都河原町: "gionKawaramachi",
  なんば: "namba",
  難波: "namba",
  大阪難波: "namba",
  南海難波: "namba",
  梅田: "umeda",
  大阪: "umeda",
  大阪梅田: "umeda",
  新大阪: "shinOsaka",
};

/** Line ids (window.LINES) → internal "how to ride" guide URLs. Sparse on purpose. */
const TOKYO_LINE_GUIDES: Record<string, string> = {
  JY: "/how-to-navigate-japanese-train-stations",
  JC: "/how-to-navigate-japanese-train-stations",
  KS: "/airport-transfers",
  KK: "/airport-transfers",
};

const KANSAI_LINE_GUIDES: Record<string, string> = {
  NK: "/airport-transfers#kansai-airport-routes",
  M: "/areas-to-stay/osaka-before-shinkansen",
};

function finderHref(areaId: string) {
  return `/areas-to-stay/tokyo-stay-area-index?area=${areaId}#selected-area`;
}

function readHotelLinks(): Record<string, HotelLinkConfig> {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8")) as Record<string, HotelLinkConfig>;
}

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city") === "kansai" ? "kansai" : "tokyo";

  const stations: Record<string, CtaLink> = {};
  const lines: Record<string, CtaLink> = {};

  if (city === "tokyo") {
    for (const [name, areaId] of Object.entries(TOKYO_STATION_TO_AREA)) {
      stations[name] = { href: finderHref(areaId), external: false };
    }
    for (const [lineId, href] of Object.entries(TOKYO_LINE_GUIDES)) {
      lines[lineId] = { href, external: false };
    }
  } else {
    // Kansai hotel CTAs come from the admin link master. Trip.com only —
    // Agoda is intentionally not surfaced (site-wide policy).
    let hotelLinks: Record<string, HotelLinkConfig>;
    try {
      hotelLinks = readHotelLinks();
    } catch {
      hotelLinks = {};
    }
    for (const [name, key] of Object.entries(KANSAI_STATION_TO_HOTEL_KEY)) {
      const config = hotelLinks[key];
      const href = config?.tripUrl?.trim();
      if (!href) continue;
      stations[name] = { href, external: true, provider: "trip" };
    }
    for (const [lineId, href] of Object.entries(KANSAI_LINE_GUIDES)) {
      lines[lineId] = { href, external: false };
    }
  }

  return NextResponse.json(
    { city, stations, lines },
    {
      headers: {
        // Admin edits to the master should show up quickly, but the payload
        // is tiny and rarely changes — cache briefly at the edge.
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
