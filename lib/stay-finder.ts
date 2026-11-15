/**
 * Where to Stay finder: given the places a visitor wants to reach, which of the
 * 36 Tokyo station areas gets them to all of them with the fewest changes of
 * train, and of those, which station is easiest to live with.
 *
 * Deliberately transfer-based, not minute-based. The data knows which lines
 * stop at each area and at each destination, so "direct" is a fact; ride times
 * are not in the data yet, so the finder never shows a minute it would have to
 * make up. Ties between equally direct areas go to the station-usability
 * scores the area model already computes.
 */

export type FinderDestination = {
  id: string;
  label: string;
  /** The area that *is* this destination, reached on foot. */
  areaId: string | null;
  lines: string[];
  /** Lines that reach it on some through trains only. */
  partialLines: string[];
  coordinates: { lat: number; lng: number };
};

export type FinderArea = {
  id: string;
  name: string;
  lines: string[];
  coordinates: { lat: number; lng: number };
  scores: {
    stationSimplicity: number;
    luggageFriendly: number;
    shinkansenAccess: number;
    airportAccess: number;
    touristAccess: number;
  };
  /** Booking.com search for hotels around this station, or null. */
  hotelUrl: string | null;
};

export type FinderOption = "luggage" | "shinkansen" | "airport";

export type LegResult = {
  destinationId: string;
  label: string;
  kind: "walk" | "direct" | "partial" | "transfer";
  line: string | null;
};

export type AreaResult = {
  area: FinderArea;
  legs: LegResult[];
  directCount: number;
  score: number;
};

export function legFor(area: FinderArea, dest: FinderDestination): LegResult {
  const base = { destinationId: dest.id, label: dest.label };
  if (dest.areaId === area.id) return { ...base, kind: "walk", line: null };
  const direct = dest.lines.find((line) => area.lines.includes(line));
  if (direct) return { ...base, kind: "direct", line: direct };
  const partial = dest.partialLines.find((line) => area.lines.includes(line));
  if (partial) return { ...base, kind: "partial", line: partial };
  return { ...base, kind: "transfer", line: null };
}

/** Straight-line distance in km, a stand-in for ride time until the data has it. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const LEG_WEIGHT: Record<LegResult["kind"], number> = { walk: 1, direct: 1, partial: 0.6, transfer: 0 };

export function rankAreas(
  areas: FinderArea[],
  destinations: FinderDestination[],
  options: FinderOption[] = [],
): AreaResult[] {
  if (destinations.length === 0) return [];
  return areas
    .map((area) => {
      const legs = destinations.map((dest) => legFor(area, dest));
      const reach = legs.reduce((sum, leg) => sum + LEG_WEIGHT[leg.kind], 0);
      const s = area.scores;
      // Reach dominates: one more destination without a change outweighs any
      // difference in station comfort. Among equally direct areas, the nearer
      // and easier station wins, and the options tip the balance.
      const meanKm =
        destinations.reduce((sum, dest) => sum + distanceKm(area.coordinates, dest.coordinates), 0) /
        destinations.length;
      let score = reach * 100 + 0.5 * s.stationSimplicity + 0.25 * s.touristAccess - 4 * meanKm;
      if (options.includes("luggage")) score += 0.5 * s.luggageFriendly;
      if (options.includes("shinkansen")) score += 0.5 * s.shinkansenAccess;
      if (options.includes("airport")) score += 0.5 * s.airportAccess;
      const directCount = legs.filter((leg) => leg.kind === "walk" || leg.kind === "direct").length;
      return { area, legs, directCount, score };
    })
    .sort((a, b) => b.score - a.score);
}

/** True when even the best area needs a change of train somewhere. */
export function isTradeOff(best: AreaResult | undefined): boolean {
  return Boolean(best && best.directCount < best.legs.length);
}
