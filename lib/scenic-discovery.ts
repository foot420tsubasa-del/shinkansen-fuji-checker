import discovery from "@/data/scenic-discovery.json";
import hub from "@/data/scenic-hub.json";
import overview from "@/data/scenic-overview.json";

type Region = keyof typeof discovery.regions;
type Highlight = { seasons: string[]; months: number[]; label: string; basis: string };
type RouteDiscovery = {
  regions: Region[];
  foliage?: number[];
  flowers?: number[];
  months?: number[];
  scenery?: string;
  extraViews?: string[];
  /** Highlights quoted from the route's own season text (data/scenic-routes.json). */
  highlights?: Highlight[];
  /** Enjoyable in any season the route runs. */
  anytime?: boolean;
  /** Months with no service at all (e.g. a line closed for winter). */
  noServiceMonths?: number[];
};
const routeData = discovery.routes as Record<string, RouteDiscovery>;
export const seasonMonths: Record<string, number[]> = { spring: [3, 4, 5], summer: [6, 7, 8], autumn: [9, 10, 11], winter: [12, 1, 2] };

/** Change the scenery while keeping the selected region and season. */
export function scenicQuickViewHref({ view, region, season }: { view?: string; region?: string; season?: string }) {
  const params = new URLSearchParams();
  if (view) params.set("view", view);
  if (region) params.set("region", region);
  if (season) params.set("season", season);
  const search = params.toString();
  return `/scenic${search ? `?${search}` : ""}#results`;
}

export const viewFilters = [...hub.viewFilters, { id: "autumn-colour", label: discovery.foliageLabel }];

/** "best": the season is one of the route's highlights; "good": enjoyable in any season and running then. */
export type SeasonFit = "best" | "good";

/**
 * Routes for the /scenic filters. With a season, a route counts only if it
 * runs then, and comes back as "best" (that season is a highlight in its own
 * season text) or "good" (enjoyable year-round). Views that are themselves
 * seasonal — snow, autumn colour, flowers — must fall in the season to count.
 * Best matches come first.
 */
export function scenicDiscoveryRoutes({ view, season, region }: { view?: string; season?: string; region?: string }) {
  const matches = overview.routes.flatMap((route) => {
    const data = routeData[route.id];
    const regions = data?.regions ?? [];
    if (region && !regions.some((id) => id === region)) return [];
    if (view === "autumn-colour" ? !data?.foliage : view && !route.categories.includes(view) && !data?.extraViews?.includes(view)) return [];
    const months = data?.months ?? route.months;
    const highlights = data?.highlights ?? [];
    const base = { ...route, months, regionNames: regions.map((id) => discovery.regions[id]), scenery: data?.scenery ?? route.season, highlights };
    if (!season) return [{ ...base, fit: undefined as SeasonFit | undefined, seasonHighlight: undefined as string | undefined }];

    const inSeason = seasonMonths[season] ?? [];
    const noService = data?.noServiceMonths ?? [];
    if (!inSeason.some((month) => !noService.includes(month))) return [];

    // Seasonal views: the view itself has to be on in that season.
    const seasonalMonths =
      view === "autumn-colour" ? data?.foliage ?? [] : view === "flowers-countryside" && data?.flowers ? data.flowers : view === "snow" ? months : null;
    if (seasonalMonths) {
      if (!inSeason.some((month) => seasonalMonths.includes(month))) return [];
      const highlight = highlights.find((h) => h.seasons.includes(season))?.label;
      return [{ ...base, fit: "best" as SeasonFit, seasonHighlight: highlight }];
    }

    const highlight = highlights.find((h) => h.seasons.includes(season));
    if (highlight) return [{ ...base, fit: "best" as SeasonFit, seasonHighlight: highlight.label }];
    if (data?.anytime) return [{ ...base, fit: "good" as SeasonFit, seasonHighlight: undefined }];
    return [];
  });
  return [...matches.filter((route) => route.fit !== "good"), ...matches.filter((route) => route.fit === "good")];
}

/** Month → the routes at their best that month (from the highlights), plus routes good in any month. */
export function scenicMonthRows(routes: ReturnType<typeof scenicDiscoveryRoutes>) {
  const rows = hub.months.map((label, index) => ({
    label,
    entries: routes.flatMap((route) =>
      (route.highlights ?? [])
        .filter((h) => h.months.includes(index + 1))
        .map((h) => ({ route, label: h.label })),
    ),
  }));
  const anyMonth = routes.filter((route) => routeData[route.id]?.anytime && !(route.highlights ?? []).length);
  return { rows, anyMonth };
}
