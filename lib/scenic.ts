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
  /**
   * Verified seat advice that depends on the direction of travel (seats that
   * do not turn round, like the Sagano box seats): short, for a badge.
   */
  seatByDirection?: Record<Direction, string>;
  basis: string;
  main?: boolean;
  /** Track km where the model has this view in sight (scripts/scenic-seen.mjs), for route search. */
  seenKm?: number[];
};

export type TicketLink =
  | { kind: "affiliate"; linkId: string; label: string; product: string }
  | { kind: "official"; url: string; label: string };

export type TicketGuideData = {
  /** The answer in one line. */
  verdict: string;
  /** "If you … → buy …" rows. */
  options: { who: string; buy: string; price?: string }[];
  /** Month the sources were read, when the guide states prices (none since 2026-11-17). */
  checked?: string;
  sources: { label: string; url: string }[];
  links: TicketLink[];
  /** Internal site page with a fuller comparison, if any. */
  more?: { href: string; label: string };
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
  /** Which ticket or pass to buy, from the operators' own pages (TicketGuide). */
  ticketGuide?: TicketGuideData;
  /** Extra questions for the route page FAQ, beyond the generated side questions. */
  faq?: { q: string; a: string }[];
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
  "Shinjuku", "Shibuya", "Ikebukuro", "Yokohama", "Enoshima",
  "Nikko", "Sendai", "Morioka", "Niigata", "Echigo-Yuzawa",
  "Nara", "Takayama", "Matsumoto",
  "Sapporo", "Hakodate", "Akita", "Furano", "Biei", "Abashiri", "Unazuki", "Fukui", "Tsuruga",
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
  hakone: "Hakone-Yumoto",
  yumoto: "Hakone-Yumoto",
  chokokunomori: "Chokoku-no-Mori",
  "chokoku no mori": "Chokoku-no-Mori",
  "hakone open air museum": "Chokoku-no-Mori",
  arashiyama: "Torokko Saga",
  "saga arashiyama": "Torokko Saga",
  sagano: "Torokko Saga",
  kameoka: "Torokko Kameoka",
  "kameoka torokko": "Torokko Kameoka",
  hozukyo: "Torokko Hozukyo",
  odaiba: "Odaiba-kaihinkoen",
  "odaiba kaihinkoen": "Odaiba-kaihinkoen",
  "big sight": "Tokyo Big Sight",
  "tokyo bigsight": "Tokyo Big Sight",
  "toyosu market": "Shijo-mae",
  "shijo mae": "Shijo-mae",
  "cruise terminal": "Tokyo International Cruise Terminal",
  "shin toyosu": "Shin-Toyosu",
  "shibaura futo": "Shibaura-futo",
  "ariake tennis no mori": "Ariake-Tennis-no-mori",
  aomori: "Shin-Aomori",
  "shin aomori": "Shin-Aomori",
  "shin shirakawa": "Shin-Shirakawa",
  "shiroishi zao": "Shiroishi-Zao",
  "kurikoma kogen": "Kurikoma-Kogen",
  "mizusawa esashi": "Mizusawa-Esashi",
  "shin hanamaki": "Shin-Hanamaki",
  hanamaki: "Shin-Hanamaki",
  "iwate numakunai": "Iwate-Numakunai",
  "shichinohe towada": "Shichinohe-Towada",
  "echigo yuzawa": "Echigo-Yuzawa",
  yuzawa: "Echigo-Yuzawa",
  "gala yuzawa": "Echigo-Yuzawa",
  "jomo kogen": "Jomo-Kogen",
  "tsubame sanjo": "Tsubame-Sanjo",
  tsubamesanjo: "Tsubame-Sanjo",
  "unazuki onsen": "Unazuki",
  "kurobe gorge": "Unazuki",
  "akita shirakami": "Akita-Shirakami",
  "wespa tsubakiyama": "Wespa-Tsubakiyama",
  "higashi noshiro": "Higashi-Noshiro",
  "juniko": "Juniko",
  "senjojiki": "Senjojiki",
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

/**
 * A spelling-insensitive key: accents and macrons dropped (Kyōto), "station" /
 * "sta." / "eki" dropped, spaces and hyphens removed (Shinosaka), and the
 * long-vowel spellings folded (Kyouto, Tookyoo, Toukyou → kyoto / tokyo).
 */
export function stationKey(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(station|sta\.?|eki)\b/g, " ")
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9fff]/g, "")
    .replace(/ou/g, "o")
    .replace(/oo/g, "o")
    .replace(/uu/g, "u");
}

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/** True where a side rests on the terrain model alone: no published source matched it, and no seat was verified. */
export function isModelOnlyBasis(basis: string): boolean {
  return !/match|seat verified/i.test(basis);
}

export function resolveStation(input: string): string | null {
  const q = norm(input);
  if (!q) return null;
  if (ALIASES[q]) return ALIASES[q];
  const options = stationOptions();
  const exact = options.find((o) => norm(o.name) === q || (o.ja && o.ja === input.trim()));
  if (exact) return exact.name;
  const key = stationKey(input);
  if (!key) return null;
  for (const [alias, name] of Object.entries(ALIASES)) if (stationKey(alias) === key) return name;
  const byKey = options.filter((o) => stationKey(o.name) === key);
  return byKey.length === 1 ? byKey[0].name : null;
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
  if (scored.length) return scored.slice(0, limit).map((x) => x.o);
  const key = stationKey(input);
  if (key.length < 3) return [];
  const resolved = resolveStation(input);
  if (resolved) return options.filter((o) => o.name === resolved);
  const max = key.length <= 5 ? 1 : 2;
  return options
    .map((o) => ({ o, d: editDistance(key, stationKey(o.name), max) }))
    .filter((x) => x.d <= max)
    .sort((a, b) => a.d - b.d || Number(!b.o.routes.length) - Number(!a.o.routes.length) || a.o.name.localeCompare(b.o.name))
    .slice(0, limit)
    .map((x) => x.o);
}

/**
 * Why a trip has no answer, from the mapped data only:
 * - "no-view-between": both stations are on one mapped line, but no view we
 *   mapped lies between them (Nagoya → Kyoto).
 * - "different-lines": each station is on a mapped line, but not the same one
 *   — the trip needs a change of train, and we map one line at a time.
 * - "unmapped": at least one station is not on any mapped line.
 */
export type UnsupportedReason =
  | { kind: "no-view-between"; route: ScenicRoute }
  | { kind: "different-lines"; routes: ScenicRoute[] }
  | { kind: "unmapped" };

export function unsupportedReason(from: string, to: string): UnsupportedReason {
  const shared = LIVE_ROUTES.find((r) => {
    const a = position(r, from);
    const b = position(r, to);
    return a !== null && b !== null && a !== b;
  });
  if (shared) return { kind: "no-view-between", route: shared };
  const onFrom = LIVE_ROUTES.filter((r) => position(r, from) !== null);
  const onTo = LIVE_ROUTES.filter((r) => position(r, to) !== null);
  if (onFrom.length && onTo.length) return { kind: "different-lines", routes: [...new Set([...onTo, ...onFrom])].slice(0, 3) }; // the line at the destination first
  return { kind: "unmapped" };
}

export type RouteMatch =
  | { kind: "live"; route: ScenicRoute; direction: Direction; from: string; to: string }
  | { kind: "unsupported"; from: string; to: string; comingSoon: ScenicRoute[]; nearbyLive: ScenicRoute[] };

function position(route: ScenicRoute, name: string): number | null {
  const st = route.timelineStations?.find((s) => s.name === name && !s.signal);
  if (!st) return null;
  return st.km ?? st.order ?? null;
}

/**
 * Whether this exact trip is one the route's answer was built for. Both
 * stations being on the line is not enough (2026-11-16: Shin-Osaka →
 * Hiroshima matched the Tokaido line and showed the Mt. Fuji answer, timed
 * from Tokyo, for a train that never passes Fuji):
 * - Fuji model (Tokaido): boarding at a station the model times from, and
 *   getting off at one on the far side of Fuji — Tokyo, Shinagawa or
 *   Shin-Yokohama to Nagoya, Kyoto or Shin-Osaka, and back.
 * - Timetable routes: a train in the timetable calls at both stations, and
 *   the trip passes a point where the model has a view in sight.
 */
function servesTrip(route: ScenicRoute, direction: Direction, from: string, to: string): boolean {
  const timing = route.timing;
  if (timing?.kind === "fuji-model") {
    const opposite: Direction = direction === "forward" ? "backward" : "forward";
    return timing.origins[direction].includes(from) && timing.origins[opposite].includes(to);
  }
  if (timing?.kind === "timetable") {
    if (!trainsServing(route, direction, from, to).length) return false;
    const a = position(route, from)!;
    const b = position(route, to)!;
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const offset = route.trackKmOffset ?? 0;
    // A point the model has in sight between the two stations — the same
    // test the timeline makes, so a match always has something to show.
    return (route.views ?? []).some((v) => (v.seenKm ?? []).some((km) => km + offset >= lo && km + offset <= hi));
  }
  return false;
}

export function matchRoute(from: string, to: string): RouteMatch {
  // Exact matches only. No default route, no first route, no "nearest" route:
  // anything a live route was not built for is unsupported.
  for (const route of LIVE_ROUTES) {
    const a = position(route, from);
    const b = position(route, to);
    if (a === null || b === null || a === b) continue;
    const direction: Direction = b > a ? "forward" : "backward";
    if (servesTrip(route, direction, from, to)) return { kind: "live", route, direction, from, to };
  }
  const words = [from, to].map(norm);
  const nearMatch = (r: ScenicRoute) => (r.near ?? []).some((n) => words.some((w) => norm(n) === w || w.includes(norm(n))));
  const related = ROUTES.filter((r) => r.status !== "live" && nearMatch(r));
  const fallback = ROUTES.filter((r) => r.status !== "live");
  // A mapped line that the trip leads to (Tokyo → Kamakura: the Enoden), by
  // the places it is known for — not every line that merely passes a station.
  const nearbyLive = LIVE_ROUTES.filter(nearMatch);
  return {
    kind: "unsupported",
    from,
    to,
    nearbyLive,
    comingSoon: (related.length ? related : fallback).slice(0, nearbyLive.length ? 2 : 3),
  };
}

/** The mapped Tokaido part of a longer trip on the same railway corridor. */
export function mappedTokaidoLeg(from: string, to: string): [string, string] | null {
  const route = LIVE_ROUTES.find(({ id }) => id === "tokaido-fuji");
  if (!route || route.timing?.kind !== "fuji-model") return null;
  const boundary = position(route, "Shin-Osaka");
  if (boundary === null) return null;
  const beyond = (station: string) => (position(route, station) ?? -1) > boundary;
  const east = route.timing.origins.forward;
  if (east.includes(from) && beyond(to)) return [from, "Shin-Osaka"];
  if (beyond(from) && east.includes(to)) return ["Shin-Osaka", to];
  return null;
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

/** Orient the named section and clip it to the rider's own stops when needed. */
export function viewingSection(route: ScenicRoute, view: ScenicView, direction: Direction, from: string, to: string) {
  const [start, end] = direction === "forward" ? [view.from, view.to] : [view.to, view.from];
  if (route.timing?.kind !== "timetable") return [start, end] as const;
  const fromKm = position(route, from);
  const toKm = position(route, to);
  const offset = route.trackKmOffset ?? 0;
  const lower = view.kmFrom + offset;
  const upper = view.kmTo + offset;
  const clippedStart = fromKm !== null && (direction === "forward" ? fromKm > lower : fromKm < upper);
  const clippedEnd = toKm !== null && (direction === "forward" ? toKm < upper : toKm > lower);
  return [clippedStart ? from : start, clippedEnd ? to : end] as const;
}

export function primaryTripView(items: TimelineItem[]) {
  return items.find(({ view }) => view.main)
    ?? items.reduce<TimelineItem | undefined>((best, item) => !best || item.visibleMinutes > best.visibleMinutes ? item : best, undefined);
}

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
  // Where the view starts for this rider: not before the station they board at.
  const viewKm = direction === "forward" ? Math.max(view.kmFrom + offset, fromKm) : Math.min(view.kmTo + offset, fromKm);
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
