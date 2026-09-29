import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Non-default locale prefixes (default "en" has no prefix).
const LOCALES = "fr|es|pt-BR|ko|ru|de|zh-TW|zh-CN";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      /* Hotel pages folded 2026-09-29. Six months: 3 search clicks on 1,530
         impressions across all fourteen, 8 affiliate clicks, zero revenue —
         every one of those clicks went to Trip.com or Agoda, which the site
         dropped the same day. /local-hotel-picks was also the last place
         Trip.com links were still being rendered. Routes and data are left in
         place; deleting these entries brings them all back. */
      {
        source: "/local-hotel-picks",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/local-hotel-picks`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/local-hotel-picks/tokyo",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/local-hotel-picks/tokyo`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/local-hotel-picks/kyoto",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/local-hotel-picks/kyoto`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/local-hotel-picks/osaka",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/local-hotel-picks/osaka`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/areas-to-stay/tokyo-first-time",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/tokyo-first-time`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/areas-to-stay/kyoto-first-time",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/kyoto-first-time`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/areas-to-stay/osaka-first-time",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/osaka-first-time`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/areas-to-stay/kawaguchiko",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/kawaguchiko`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/areas-to-stay/where-to-stay-before-shinkansen",
        destination: "/areas-to-stay/asakusa-vs-ueno",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/where-to-stay-before-shinkansen`,
        destination: "/:locale/areas-to-stay/asakusa-vs-ueno",
        permanent: true,
      },
      {
        source: "/areas-to-stay/kyoto-station-vs-gion",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/kyoto-station-vs-gion`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/areas-to-stay/namba-vs-umeda",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/namba-vs-umeda`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/areas-to-stay/shin-osaka-vs-namba",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/shin-osaka-vs-namba`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      {
        source: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage",
        destination: "/areas-to-stay/asakusa-vs-ueno",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/where-to-stay-in-tokyo-with-luggage`,
        destination: "/:locale/areas-to-stay/asakusa-vs-ueno",
        permanent: true,
      },
      {
        source: "/areas-to-stay/tokyo-hotels",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/tokyo-hotels`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
      // Tokyo Stay Finder, folded 2026-09-29. Six months: 1 search click on
      // 116 impressions, 3 affiliate clicks, zero revenue. The tool itself
      // converted well — every one of the nine people who started it finished,
      // and a third of those clicked through — it simply had no distribution,
      // and it carries its own scoring pipeline to maintain. The route, the
      // component and data/stay-area/ are all left in place; deleting these
      // two lines brings it back.
      {
        source: "/areas-to-stay/tokyo-stay-area-index",
        destination: "/areas-to-stay",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/tokyo-stay-area-index`,
        destination: "/:locale/areas-to-stay",
        permanent: true,
      },
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
      // §3: the 36 tokyo-hotels/* inventory-style area pages (ranked 26-43,
      // zero clicks) are consolidated. Areas with a matching decision page go
      // there; everything else lands on the Stay Finder's detail view for the
      // same area. Specific rules must precede the catch-all.
      {
        source: "/areas-to-stay/tokyo-hotels/tokyo-station",
        destination: "/areas-to-stay/where-to-stay-before-shinkansen",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/tokyo-hotels/tokyo-station`,
        destination: "/:locale/areas-to-stay/where-to-stay-before-shinkansen",
        permanent: true,
      },
      {
        source: "/areas-to-stay/tokyo-hotels/shinjuku",
        destination: "/areas-to-stay/tokyo-station-vs-shinjuku",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/tokyo-hotels/shinjuku`,
        destination: "/:locale/areas-to-stay/tokyo-station-vs-shinjuku",
        permanent: true,
      },
      {
        source: "/areas-to-stay/tokyo-hotels/ueno",
        destination: "/areas-to-stay/ueno-vs-shinjuku",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/tokyo-hotels/ueno`,
        destination: "/:locale/areas-to-stay/ueno-vs-shinjuku",
        permanent: true,
      },
      {
        source: "/areas-to-stay/tokyo-hotels/asakusa",
        destination: "/areas-to-stay/asakusa-vs-ueno",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/tokyo-hotels/asakusa`,
        destination: "/:locale/areas-to-stay/asakusa-vs-ueno",
        permanent: true,
      },
      {
        source: "/areas-to-stay/tokyo-hotels/:slug",
        destination: "/areas-to-stay/tokyo-stay-area-index?area=:slug#selected-area",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALES})/areas-to-stay/tokyo-hotels/:slug`,
        destination: "/:locale/areas-to-stay/tokyo-stay-area-index?area=:slug#selected-area",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
