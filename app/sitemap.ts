import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { itineraryPages } from "@/lib/content/itineraries";
import { stayPages } from "@/lib/content/stay";
import { transferPages } from "@/lib/content/transfers";

const siteUrl = "https://fujiseat.com";

const translatedPaths = [
  "",
  "/guide",
  "/planner",
  "/command-center",
];

const englishOnlyContentPaths = [
  "/itineraries",
  "/areas-to-stay",
  "/airport-transfers",
];

const dynamicPaths = [
  ...itineraryPages.map((page) => `/itineraries/${page.slug}`),
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
  return [
    ...translatedPaths.map((path, index) => makeEntry(path, index === 0 ? 1 : 0.8)),
    ...englishOnlyContentPaths.map((path) => makeEntry(path, 0.8, false)),
    ...dynamicPaths.map((path) => makeEntry(path, 0.7, false)),
  ];
}
