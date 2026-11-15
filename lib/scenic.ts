/**
 * The window-view template shared by every scenic route: what is visible,
 * on which side, over how much line, how big, in which season — and, given
 * a From/To pair and a train, at what minute.
 *
 * Data: data/scenic-routes.json. A route is "live" only when its sides and
 * sections rest on the terrain model (GSI elevation + OSM track) or on a
 * published source, and the page says which. Seat letters appear only where
 * verified (`seat` is null otherwise).
 */
import catalogue from "@/data/scenic-routes.json";
import { ORIGINS, type OriginId } from "@/lib/fuji-window";

export type Side = "left" | "right";
export type Direction = "forward" | "backward";
export type ViewTag = "fuji" | "mountain" | "snow" | "sea" | "countryside" | "city";

export type ScenicView = {
  id: string;
  name: string;
  targets: string[];
  tags: ViewTag[];
  /** Side when travelling in the route's forward direction. */
  side: { forward: Side };
  from: string;
  to: string;
  /** Along the route's track geometry (data/routes/<id>.json), not from Tokyo. */
  kmFrom: number;
  kmTo: number;
  sectionKm: number;
  /** Closest the summit comes while in view, km; null when not modelled. */
  nearestKm: number | null;
  /** Highest it stands above the horizon, degrees. */
  maxAngle: number | null;
  season: string;
  /** Only when verified. */
  seat: string | null;
  basis: string;
  main?: boolean;
};

export type TrainStop = [station: string, arrival: string | null, departure: string | null];
export type TrainPattern = {
  id: string;
  label: string;
  note: string;
  forward: { train: string; stops: TrainStop[] };
  backward: { train: string; stops: TrainStop[] };
};

/** `signal`: a passing loop or switchback with no passenger stop, kept for the km and left out of search. */
export type TimelineStation = { name: string; ja?: string; km?: number; order?: number; signal?: boolean };

export type ScenicRoute = {
  id: string;
  status: "live" | "verifying" | "candidate";
  slug?: string;
  href?: string;
  title: string;
  line: string;
  between: string[];
  teaser?: string;
  tags?: ViewTag[];
  near?: string[];
  image?: { src: string; width: number; height: number; alt: string; illustrative: boolean };
  stations?: { name: string; lat: number; lng: number }[];
  targets?: { id: string; name: string; lat: number; lng: number }[];
  views?: ScenicView[];
  viewshed?: string;
  trackKmOffset?: number | null;
  timelineStations?: TimelineStation[];
  directions?: Record<Direction, [string, string]>;
  timing?:
    | { kind: "timetable"; source: string; sourceUrl?: string; trains: TrainPattern[] }
    | { kind: "fuji-model"; source: string; origins: Record<Direction, string[]> };
  verification?: string;
  /** Booking link for the line; linkId "jrPass" only where the JR Pass covers it. */
  ticket?: { provider: string; linkId: string; note?: string } | null;
  /**
   * Stations where every train reverses (Mt. Fuji on the Fujikyu, the Hakone
   * switchbacks). Sides are always given for the direction of travel, so after
   * a reversal "left" is the other side of the car from where you sat down.
   */
  reversals?: string[];
  /** Plain-language caveats shown on the route page. */
  notes?: string[];
  page?: { title: string; description: string; h1: string; labelStations: string[] };
};

export const ROUTES = catalogue.routes as unknown as ScenicRoute[];
export const LIVE_ROUTES = ROUTES.filter((r) => r.status === "live" && r.timelineStations?.length);

export const flipSide = (side: Side): Side => (side === "left" ? "right" : "left");
export const sideFor = (view: ScenicView, direction: Direction): Side =>
  direction === "forward" ? view.side.forward : flipSide(view.side.forward);

// ── Stations and matching ─────────────────────────────────────────────────

/** Places outside the live routes, so a search for them lands on "coming soon", not on nothing. */
const OTHER_PLACES = [
  "Shinjuku", "Shibuya", "Ikebukuro", "Yokohama", "Kamakura", "Fujisawa", "Enoshima", "Hakone", "Hakone-Yumoto", "Gora",
  "Kawaguchiko", "Otsuki", "Nikko", "Sendai", "Morioka", "Niigata", "Echigo-Yuzawa",
  "Nara", "Arashiyama", "Kameoka", "Takayama", "Matsumoto", "Odaiba", "Toyosu",
  "Sapporo", "Hakodate", "Aomori", "Akita", "Furano", "Biei", "Abashiri", "Unazuki", "Fukui", "Tsuruga",
];

const ALIASES: Record<string, string> = {
  "shin osaka": "Shin-Osaka",
  osaka: "Shin-Osaka",
  "shin yokohama": "Shin-Yokohama",
  "shin fuji": "Shin-Fuji",
  kurobe: "Kurobe-Unazukionsen",
  "kurobe unazukionsen": "Kurobe-Unazukionsen",
  "joetsu myoko": "Joetsu-Myoko",
  "shin takaoka": "Shin-Takaoka",
  "annaka haruna": "Annaka-Haruna",
  kobe: "Shin-Kobe",
  "shin kobe": "Shin-Kobe",
  fukuoka: "Hakata",
};

export type StationOption = { name: string; ja?: string; routes: string[] };

export function stationOptions(): StationOption[] {
  const map = new Map<string, StationOption>();
  for (const route of LIVE_ROUTES) {
    for (const st of route.timelineStations ?? []) {
      if (st.signal) continue;
      const entry = map.get(st.name) ?? { name: st.name, ja: st.ja, routes: [] };
      entry.routes.push(route.id);
      map.set(st.name, entry);
    }
  }
  for (const place of OTHER_PLACES) if (!map.has(place)) map.set(place, { name: place, routes: [] });
  return [...map.values()];
}

const norm = (s: string) => s.toLowerCase().replace(/[‐-―−-]/g, " ").replace(/\s+/g, " ").trim();

export function resolveStation(input: string): string | null {
  const q = norm(input);
  if (!q) return null;
  if (ALIASES[q]) return ALIASES[q];
  const options = stationOptions();
  const exact = options.find((o) => norm(o.name) === q || (o.ja && o.ja === input.trim()));
  return exact ? exact.name : null;
}

export function suggestStations(input: string, limit = 6): StationOption[] {
  const q = norm(input);
  const options = stationOptions();
  if (!q) return options.filter((o) => o.routes.length).slice(0, limit);
  const scored = options
    .map((o) => {
      const n = norm(o.name);
      const score = n.startsWith(q) ? 0 : n.includes(q) ? 1 : o.ja && o.ja.includes(input.trim()) ? 1 : 9;
      return { o, score: score + (o.routes.length ? 0 : 0.5) };
    })
    .filter((x) => x.score < 9)
    .sort((a, b) => a.score - b.score || a.o.name.localeCompare(b.o.name));
  return scored.slice(0, limit).map((x) => x.o);
}

export type RouteMatch =
  | { kind: "live"; route: ScenicRoute; direction: Direction; from: string; to: string }
  | { kind: "unsupported"; from: string; to: string; comingSoon: ScenicRoute[]; nearbyLive: ScenicRoute[] };

function position(route: ScenicRoute, name: string): number | null {
  const st = route.timelineStations?.find((s) => s.name === name && !s.signal);
  if (!st) return null;
  return st.km ?? st.order ?? null;
}

export function matchRoute(from: string, to: string): RouteMatch {
  for (const route of LIVE_ROUTES) {
    const a = position(route, from);
    const b = position(route, to);
    if (a === null || b === null || a === b) continue;
    return { kind: "live", route, direction: b > a ? "forward" : "backward", from, to };
  }
  const words = [from, to].map(norm);
  const related = ROUTES.filter(
    (r) => r.status !== "live" && (r.near ?? []).some((n) => words.some((w) => norm(n) === w || w.includes(norm(n)))),
  );
  const fallback = ROUTES.filter((r) => r.status !== "live" && r.image);
  // A mapped line that serves one end of the trip (Tokyo → Kamakura: the Enoden).
  const nearbyLive = LIVE_ROUTES.filter((r) => position(r, from) !== null || position(r, to) !== null);
  return {
    kind: "unsupported",
    from,
    to,
    nearbyLive,
    comingSoon: (related.length ? related : fallback).filter((r) => !nearbyLive.includes(r)).slice(0, nearbyLive.length ? 2 : 3),
  };
}

/** Routes that carry a view with this tag, for a chip chosen before a route. */
export function routesForTag(tag: ViewTag): { live: ScenicRoute[]; soon: ScenicRoute[] } {
  const has = (r: ScenicRoute) => (r.tags ?? []).includes(tag) || (r.views ?? []).some((v) => v.tags.includes(tag));
  return { live: LIVE_ROUTES.filter(has), soon: ROUTES.filter((r) => r.status !== "live" && has(r)) };
}

// ── Time along the line ───────────────────────────────────────────────────

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fmtClock = (minutes: number) => {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};
export const fmtOffset = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes));
  return `+${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
};

export function trainsServing(route: ScenicRoute, direction: Direction, from: string, to: string): TrainPattern[] {
  if (route.timing?.kind !== "timetable") return [];
  return route.timing.trains.filter((t) => {
    const names = t[direction].stops.map((s) => s[0]);
    return names.includes(from) && names.includes(to);
  });
}

/**
 * Minutes after the train leaves `from`, as a function of distance from Tokyo
 * (km). Stops pin the time; between stops it is spread by distance. Dwell
 * at a stop counts towards the next stretch.
 */
function clockFor(route: ScenicRoute, train: TrainPattern, direction: Direction, from: string) {
  const kmOf = (name: string) => route.timelineStations!.find((s) => s.name === name)!.km!;
  const anchors: { km: number; arr: number; dep: number }[] = train[direction].stops.map(([name, arr, dep]) => ({
    km: kmOf(name),
    arr: toMin(arr ?? dep!),
    dep: toMin(dep ?? arr!),
  }));
  const start = anchors.find((a) => a.km === kmOf(from))!.dep;
  return (km: number): number => {
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i];
      const b = anchors[i + 1];
      const lo = Math.min(a.km, b.km);
      const hi = Math.max(a.km, b.km);
      if (km >= lo && km <= hi) {
        const t = (km - a.km) / (b.km - a.km);
        return a.dep + (b.arr - a.dep) * t - start;
      }
    }
    return NaN;
  };
}

export type ViewshedPoint = { km: number; tunnel: boolean; see: Record<string, { side: string; angle: number; km: number }> };

export type TimelineItem = {
  view: ScenicView;
  side: Side;
  /** Minutes after departing `from`. */
  start: number;
  end: number;
  visibleMinutes: number;
  /**
   * Reversals passed between boarding and the view, in order. An odd number
   * means the view is out of the windows opposite the side you sat on.
   */
  reversedAt: string[];
};

/**
 * Reversal stations the train passes after leaving `fromKm` and up to `toKm`,
 * in order. Boarding at a reversal station does not count; a view that starts
 * right at one does.
 */
function reversalsBetween(route: ScenicRoute, fromKm: number, toKm: number): string[] {
  const passed = (km: number) => (toKm >= fromKm ? km > fromKm && km <= toKm : km < fromKm && km >= toKm);
  const list = (route.reversals ?? [])
    .map((name) => ({ name, km: route.timelineStations?.find((s) => s.name === name)?.km }))
    .filter((r): r is { name: string; km: number } => typeof r.km === "number" && passed(r.km))
    .sort((a, b) => a.km - b.km)
    .map((r) => r.name);
  return toKm >= fromKm ? list : list.reverse();
}

/** Reversals a train makes between boarding at `from` and the start of `view`. */
export function reversalsBefore(route: ScenicRoute, view: ScenicView, direction: Direction, from: string): string[] {
  const fromKm = route.timelineStations?.find((s) => s.name === from)?.km ?? 0;
  const offset = route.trackKmOffset ?? 0;
  const viewKm = direction === "forward" ? view.kmFrom + offset : view.kmTo + offset;
  return reversalsBetween(route, fromKm, viewKm);
}

/** The side of the car as it faced when you boarded: the side of travel, flipped once per reversal passed. */
export function seatedSide(side: Side, reversedAt: string[]): Side {
  return reversedAt.length % 2 ? flipSide(side) : side;
}

/**
 * The views between `from` and `to`, in the order they come, with the minute
 * each starts and how many minutes it is actually in sight (tunnels and
 * hills taken out, per the terrain model).
 */
export function timeline(
  route: ScenicRoute,
  direction: Direction,
  from: string,
  to: string,
  points: ViewshedPoint[],
  trainId?: string,
): { items: TimelineItem[]; train: TrainPattern | null } {
  if (!route.views?.length) return { items: [], train: null };

  if (route.timing?.kind === "fuji-model") {
    const origin = from.toLowerCase().replace(/ /g, "-") as OriginId;
    const spec = ORIGINS[origin];
    const main = route.views.find((v) => v.main);
    if (!spec || !main) return { items: [], train: null };
    return {
      train: null,
      items: [{ view: main, side: sideFor(main, direction), start: spec.first, end: spec.last, visibleMinutes: spec.last - spec.first, reversedAt: [] }],
    };
  }

  const trains = trainsServing(route, direction, from, to);
  const train = trains.find((t) => t.id === trainId) ?? trains[0];
  if (!train) return { items: [], train: null };
  const offset = route.trackKmOffset ?? 0;
  const at = clockFor(route, train, direction, from);
  const kmOf = (name: string) => route.timelineStations!.find((s) => s.name === name)!.km!;
  const lo = Math.min(kmOf(from), kmOf(to));
  const hi = Math.max(kmOf(from), kmOf(to));

  const items: TimelineItem[] = [];
  for (const view of route.views) {
    const side = sideFor(view, direction);
    // Visible stretches of this view inside the journey, from the model.
    const seen = points.filter(
      (p) =>
        !p.tunnel &&
        p.km + offset >= lo &&
        p.km + offset <= hi &&
        p.km >= view.kmFrom &&
        p.km <= view.kmTo &&
        view.targets.some((t) => p.see[t] && p.see[t].side === view.side.forward),
    );
    if (!seen.length) continue;
    const times = seen.map((p) => at(p.km + offset)).filter((t) => Number.isFinite(t));
    if (!times.length) continue;
    // Minutes in sight: add up the run time between neighbouring track
    // points that are both in view (tunnels and hills drop out), so the result
    // does not depend on how densely the line was sampled.
    const inView = (q: ViewshedPoint) =>
      !q.tunnel && view.targets.some((t) => q.see[t] && q.see[t].side === view.side.forward);
    const ordered = points.filter((q) => q.km + offset >= lo && q.km + offset <= hi);
    let visible = 0;
    for (let i = 1; i < ordered.length; i++) {
      const a = ordered[i - 1];
      const b = ordered[i];
      if (b.km < view.kmFrom || a.km > view.kmTo || !inView(a) || !inView(b)) continue;
      const dt = Math.abs(at(b.km + offset) - at(a.km + offset));
      if (Number.isFinite(dt)) visible += dt;
    }
    items.push({
      view,
      side,
      start: Math.min(...times),
      end: Math.max(...times),
      visibleMinutes: Math.max(1, Math.round(visible)),
      reversedAt: reversalsBefore(route, view, direction, from),
    });
  }
  items.sort((a, b) => a.start - b.start);
  return { items, train };
}

/** Departure time of the reference train at `from`, as the default. */
export function referenceDeparture(route: ScenicRoute, train: TrainPattern | null, direction: Direction, from: string): string {
  if (!train) return "09:00";
  const stop = train[direction].stops.find((s) => s[0] === from);
  return stop?.[2] ?? stop?.[1] ?? "09:00";
}

export const addClock = (hhmm: string, minutes: number) => fmtClock(toMin(hhmm) + minutes);
