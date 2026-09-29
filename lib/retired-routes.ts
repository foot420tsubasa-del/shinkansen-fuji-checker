/**
 * Paths taken out of the search index, in one place so the decision is
 * reversible by deleting a line.
 *
 * Six months of Search Console (2026-04-01 to 09-26, English URLs): 121 pages
 * carried 2,768 clicks, and the top sixteen carried 99% of them. Everything
 * listed here sat below that line — most of it at zero clicks for the whole
 * period. Keeping it in the index costs crawl attention and makes the site
 * read as thin without returning anything.
 *
 * This is noindex, not deletion. Every page still renders, still works, and
 * still earns from anyone who navigates to it (/plan-your-trip, for one, has
 * no search traffic but does produce affiliate clicks). Only the invitation
 * to rank is withdrawn. The route files, translations and data are untouched.
 */
export const RETIRED_PATHS: readonly string[] = [
  "/airport-transfers",
  "/airport-transfers/haneda-late-arrival",
  "/airport-transfers/haneda-to-asakusa",
  "/airport-transfers/haneda-to-shinjuku",
  "/airport-transfers/haneda-to-tokyo-station",
  "/airport-transfers/haneda-to-ueno",
  "/airport-transfers/narita-late-arrival",
  "/airport-transfers/narita-to-asakusa",
  "/airport-transfers/narita-to-oshiage",
  "/airport-transfers/narita-to-shinjuku",
  "/airport-transfers/narita-to-tokyo-station",
  "/airport-transfers/narita-to-ueno",
  "/areas-to-stay/kawaguchiko",
  "/areas-to-stay/kyoto-before-shinkansen",
  "/areas-to-stay/kyoto-first-time",
  "/areas-to-stay/kyoto-station-vs-gion",
  "/areas-to-stay/namba-vs-umeda",
  "/areas-to-stay/osaka-before-shinkansen",
  "/areas-to-stay/osaka-first-time",
  "/areas-to-stay/shin-osaka-vs-namba",
  "/areas-to-stay/tokyo-first-time",
  "/areas-to-stay/tokyo-hotels",
  "/areas-to-stay/tokyo-station-hotels-before-shinkansen",
  "/areas-to-stay/tokyo/asakusa",
  "/areas-to-stay/tokyo/east-tokyo",
  "/areas-to-stay/tokyo/shinjuku",
  "/areas-to-stay/tokyo/tokyo-station",
  "/areas-to-stay/tokyo/ueno",
  "/areas-to-stay/where-to-stay-before-shinkansen",
  "/areas-to-stay/where-to-stay-in-tokyo-with-luggage",
  "/how-to-navigate-japanese-train-stations",
  "/itineraries",
  "/itineraries/10-day-japan-with-fuji",
  "/itineraries/10-day-with-fuji",
  "/itineraries/14-day-deep-japan",
  "/itineraries/14-day-japan-golden-route",
  "/itineraries/5-day-express-japan",
  "/itineraries/7-day-first-time-japan",
  "/itineraries/tokyo-kyoto-osaka-without-jr-pass",
  "/jr-pass-vs-single-ticket",
  "/local-hotel-picks",
  "/local-hotel-picks/kyoto",
  "/local-hotel-picks/osaka",
  "/local-hotel-picks/tokyo",
  "/local-tokyo/kiyosumi-shirakawa",
  "/local-tokyo/kuramae",
  "/local-tokyo/monzen-nakacho",
  "/local-tokyo/oshiage",
  "/local-tokyo/ryogoku",
  "/local-tokyo/suitengumae-ningyocho",
  "/nozomi-vs-hikari-vs-kodama",
  "/osaka-to-tokyo-mt-fuji-seat",
  "/plan-your-trip",
  "/planner",
  "/shinkansen-oversized-baggage-seat",
  "/shinkansen-reserved-vs-non-reserved",
  "/tokyo-to-kyoto-shinkansen-ticket",
  "/tokyo-to-osaka-mt-fuji-seat",
];

const RETIRED = new Set(RETIRED_PATHS);

/**
 * True when a path is retired, ignoring any locale prefix and trailing slash,
 * so /fr/itineraries and /itineraries/ are both caught.
 */
export function isRetiredPath(pathname: string, locales: readonly string[]): boolean {
  let p = pathname.replace(/\/+$/, "") || "/";
  for (const locale of locales) {
    if (p === `/${locale}`) return RETIRED.has("/");
    if (p.startsWith(`/${locale}/`)) {
      p = p.slice(locale.length + 1);
      break;
    }
  }
  return RETIRED.has(p || "/");
}
