import baseData from "@/data/stay-area/tokyo-areas.base.json";
import scoreData from "@/data/generated/tokyo-stay-area-scores.json";
import finderData from "@/data/stay-finder-destinations.json";
import { getBookingHotelDestination } from "@/lib/booking-hotel-destinations";
import type { FinderArea, FinderDestination } from "@/lib/stay-finder";

type BaseArea = {
  id: string;
  name: string;
  displayName?: string;
  stationLines: string[];
  coordinates: { lat: number; lng: number };
};
type ScoredArea = { id: string; scores: FinderArea["scores"] };

/**
 * The slim per-area records the finder needs, built on the server so the
 * client bundle carries 36 small objects rather than the whole area model.
 *
 * Hotel links are the Booking.com searches made for the old hotel-area finder
 * (data/booking-hotel-destinations.json). They are read here directly rather
 * than through isActiveBookingHotelDestination: that gate keeps Booking off the
 * comparison pages while their Klook test runs, and the finder is a separate,
 * separately tracked placement (stay_finder_result).
 */
export function getFinderAreas(): FinderArea[] {
  const base = ((baseData as unknown as { areas?: BaseArea[] }).areas ?? (baseData as unknown as BaseArea[]));
  const scores = new Map((scoreData as unknown as { areas: ScoredArea[] }).areas.map((a) => [a.id, a.scores]));
  const extra = finderData.areaExtraLines as Record<string, string[]>;
  const exclude = (finderData as { areaExcludeLines?: Record<string, string[]> }).areaExcludeLines ?? {};
  return base
    .filter((area) => scores.has(area.id))
    .map((area) => {
      const booking = getBookingHotelDestination(`booking_${area.id}`);
      const s = scores.get(area.id)!;
      return {
        id: area.id,
        name: area.displayName ?? area.name,
        lines: [...area.stationLines, ...(extra[area.id] ?? [])].filter(
          (line) => !(exclude[area.id] ?? []).includes(line),
        ),
        coordinates: area.coordinates,
        scores: {
          stationSimplicity: s.stationSimplicity,
          luggageFriendly: s.luggageFriendly,
          shinkansenAccess: s.shinkansenAccess,
          airportAccess: s.airportAccess,
          touristAccess: s.touristAccess,
        },
        hotelUrl: booking && booking.url_status === "active" && booking.affiliate_url ? booking.affiliate_url : null,
      };
    });
}

export function getFinderDestinations(): FinderDestination[] {
  return finderData.destinations as FinderDestination[];
}

export function getFinderLineNotes(): Record<string, string> {
  return (finderData as { lineNotes?: Record<string, string> }).lineNotes ?? {};
}

/** The combinations answered in plain text below the tool, for search and AI. */
export const POPULAR_COMBOS: string[][] = [
  ["shinjuku", "asakusa"],
  ["shibuya", "harajuku", "asakusa"],
  ["disney", "shibuya"],
  ["akihabara", "narita"],
];
