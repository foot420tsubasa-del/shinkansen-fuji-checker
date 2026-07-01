import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { tokyoStayAreasBase } from "@/data/stay-area/tokyo-areas.base";
import { publicItineraryPages } from "@/lib/content/itineraries";
import { stayPages } from "@/lib/content/stay";
import { transferPages } from "@/lib/content/transfers";

const siteUrl = "https://fujiseat.com";

const tokyoHotelAreaPaths = tokyoStayAreasBase.map((area) => `/areas-to-stay/tokyo-hotels/${area.id}`);

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
  "/local-hotel-picks",
  "/local-hotel-picks/tokyo",
  "/local-hotel-picks/kyoto",
  "/local-hotel-picks/osaka",
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
  "/shinkansen-seat-e",
  "/tokyo-to-kyoto-mt-fuji-seat",
  "/kyoto-to-tokyo-mt-fuji-seat",
  "/shinkansen-seat-letters",
  "/shinkansen-seat-guides",
  "/jr-pass-vs-single-ticket",
  "/tokyo-to-kyoto-shinkansen-ticket",
  "/shinkansen-ticket-vs-jr-pass-tokyo-kyoto-osaka",
  "/areas-to-stay/tokyo-stay-area-index",
  "/areas-to-stay/tokyo-hotel-room-size-guide",
  "/areas-to-stay/where-to-stay-in-tokyo-with-luggage",
  "/areas-to-stay/tokyo/shinjuku",
  "/areas-to-stay/tokyo/ueno",
  "/areas-to-stay/tokyo/asakusa",
  "/areas-to-stay/tokyo/tokyo-station",
  "/areas-to-stay/tokyo/east-tokyo",
  "/areas-to-stay/tokyo-hotels",
  ...tokyoHotelAreaPaths,
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
  const entries = [
    ...translatedPaths.map((path, index) => makeEntry(path, index === 0 ? 1 : 0.8)),
    ...englishOnlyContentPaths.map((path) => makeEntry(path, 0.8, false)),
    ...dynamicPaths.map((path) => makeEntry(path, 0.7, false)),
  ];
  return Array.from(new Map(entries.map((entry) => [entry.url, entry])).values());
}
