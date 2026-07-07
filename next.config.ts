import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Non-default locale prefixes (default "en" has no prefix).
const LOCALES = "fr|es|pt-BR|ko|ru|de|zh-TW|zh-CN";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // §3: shinkansen-seat-e cannibalized /guide (7.9 vs 6.9) — consolidate
      // into the guide's Seat E section.
      {
        source: "/shinkansen-seat-e",
        destination: "/guide#seat-e",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/shinkansen-seat-e`,
        destination: "/:locale/guide#seat-e",
        permanent: true,
      },
      // §3: two overlapping JR Pass comparison pages split ranking signals —
      // consolidate into /jr-pass-vs-single-ticket (unique cost-breakdown
      // content absorbed there).
      {
        source: "/shinkansen-ticket-vs-jr-pass-tokyo-kyoto-osaka",
        destination: "/jr-pass-vs-single-ticket",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/shinkansen-ticket-vs-jr-pass-tokyo-kyoto-osaka`,
        destination: "/:locale/jr-pass-vs-single-ticket",
        permanent: true,
      },
      // §3: airport-transfer pages ranked 26+ (Shibuya + Kansai routes) are
      // consolidated into the airport hub. KIX facts are absorbed as a quick
      // reference at #kansai-airport-routes; Shibuya is covered by the
      // Shinjuku routes one JR stop away.
      {
        source:
          "/airport-transfers/:slug(kansai-airport-to-kyoto|kansai-airport-to-namba|kansai-airport-to-umeda|osaka-to-kansai-airport|kyoto-to-kansai-airport)",
        destination: "/airport-transfers#kansai-airport-routes",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/airport-transfers/:slug(kansai-airport-to-kyoto|kansai-airport-to-namba|kansai-airport-to-umeda|osaka-to-kansai-airport|kyoto-to-kansai-airport)`,
        destination: "/:locale/airport-transfers#kansai-airport-routes",
        permanent: true,
      },
      {
        source: "/airport-transfers/:slug(narita-to-shibuya|haneda-to-shibuya)",
        destination: "/airport-transfers",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/airport-transfers/:slug(narita-to-shibuya|haneda-to-shibuya)`,
        destination: "/:locale/airport-transfers",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
