import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { publicItineraryPages } from "@/lib/content/itineraries";
import { stayPages } from "@/lib/content/stay";
import { transferPages } from "@/lib/content/transfers";
import { FOLDED_PATHS, RETIRED_PATHS } from "@/lib/retired-routes";

const siteUrl = "https://fujiseat.com";

const translatedPaths = [
  "",
  "/guide",
  "/about",
  "/plan-your-trip",
  "/planner",
];

const englishOnlyContentPaths = [
  "/itineraries",
  "/areas-to-stay",
  "/airport-transfers",
  "/local-tokyo",
  "/local-tokyo/kiyosumi-shirakawa",
  "/local-tokyo/kuramae",
  "/local-tokyo/monzen-nakacho",
  "/local-tokyo/ryogoku",
  "/local-tokyo/oshiage",
  "/local-tokyo/suitengumae-ningyocho",
  "/privacy",
  "/terms",
  "/how-to-read-japanese-train-signs",
  "/how-to-navigate-japanese-train-stations",
  "/how-to-buy-suica",
  "/tokyo-to-kyoto-mt-fuji-seat",
  "/kyoto-to-tokyo-mt-fuji-seat",
  "/tokyo-to-osaka-mt-fuji-seat",
  "/osaka-to-tokyo-mt-fuji-seat",
  "/shinkansen-seat-letters",
  "/shinkansen-seat-guides",
  "/jr-pass-vs-single-ticket",
  "/shinkansen-oversized-baggage-seat",
  "/nozomi-vs-hikari-vs-kodama",
  "/shinkansen-reserved-vs-non-reserved",
  "/shinkansen-green-car-worth-it",
  "/tokyo-rail-3d.html",
  "/kansai-rail-3d.html",
  "/tokyo-to-kyoto-shinkansen-ticket",
  "/areas-to-stay/tokyo-hotel-room-size-guide",
  "/areas-to-stay/tokyo/shinjuku",
  "/areas-to-stay/tokyo/ueno",
  "/areas-to-stay/tokyo/asakusa",
  "/areas-to-stay/tokyo/tokyo-station",
  "/areas-to-stay/tokyo/east-tokyo",
];

const dynamicPaths = [
  ...publicItineraryPages.map((page) => `/itineraries/${page.slug}`),
  ...stayPages.map((page) => `/areas-to-stay/${page.slug}`),
  ...transferPages.map((page) => `/airport-transfers/${page.slug}`),
];

function localizedUrl(path: string, locale: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${siteUrl}${prefix}${path}`;
}

function makeEntry(path: string, priority: number, includeAlternates = true): MetadataRoute.Sitemap[number] {
  const entry: MetadataRoute.Sitemap[number] = {
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority,
  };
  if (includeAlternates) {
    entry.alternates = {
      languages: Object.fromEntries([
        ...routing.locales.map((locale) => [locale, localizedUrl(path, locale)]),
        ["x-default", localizedUrl(path, routing.defaultLocale)],
      ]),
    };
  }
  return entry;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Retired pages stay reachable but are no longer offered to crawlers; see
  // lib/retired-routes.ts for why each one is on the list.
  const retired = new Set<string>([...RETIRED_PATHS, ...FOLDED_PATHS]);
  const live = (paths: string[]) => paths.filter((path) => !retired.has(path || "/"));

  const entries = [
    ...live(translatedPaths).map((path, index) => makeEntry(path, index === 0 ? 1 : 0.8)),
    ...live(englishOnlyContentPaths).map((path) => makeEntry(path, 0.8, false)),
    ...live(dynamicPaths).map((path) => makeEntry(path, 0.7, false)),
  ];
  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}
