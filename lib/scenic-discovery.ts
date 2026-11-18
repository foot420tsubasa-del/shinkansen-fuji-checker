import discovery from "@/data/scenic-discovery.json";
import hub from "@/data/scenic-hub.json";
import overview from "@/data/scenic-overview.json";

type Region = keyof typeof discovery.regions;
type RouteDiscovery = { regions: Region[]; foliage?: number[]; flowers?: number[]; months?: number[]; scenery?: string; extraViews?: string[] };
const routeData = discovery.routes as Record<string, RouteDiscovery>;
const seasonMonths: Record<string, number[]> = { spring: [3, 4, 5], summer: [6, 7, 8], autumn: [9, 10, 11], winter: [12, 1, 2] };

export const viewFilters = [...hub.viewFilters, { id: "autumn-colour", label: discovery.foliageLabel }];

export function scenicDiscoveryRoutes({ view, season, region }: { view?: string; season?: string; region?: string }) {
  return overview.routes.flatMap((route) => {
    const data = routeData[route.id];
    const regions = data?.regions ?? [];
    if (region && !regions.some((id) => id === region)) return [];
    if (view === "autumn-colour" ? !data?.foliage : view && !route.categories.includes(view) && !data?.extraViews?.includes(view)) return [];
    const months = data?.months ?? route.months;
    const matchingMonths = view === "autumn-colour"
      ? data.foliage ?? []
      : view === "flowers-countryside" && data?.flowers
        ? data.flowers
        : months;
    if (season && !(seasonMonths[season] ?? []).some((month) => matchingMonths.includes(month))) return [];
    return [{ ...route, months, regionNames: regions.map((id) => discovery.regions[id]), scenery: data?.scenery ?? route.season }];
  });
}
