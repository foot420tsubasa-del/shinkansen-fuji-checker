import data from "@/data/fuji-clear-sky-odds.json";

/**
 * How often mornings over the Fuji stretch of the Tokaido line are clear, by
 * month — the long-range companion to the ten-day forecast.
 *
 * Built by scripts/build-fuji-clear-sky-odds.mjs from ten years of reanalysis
 * cloud cover, graded with the forecast tool's own definition of clear. It is
 * a guide to the season, not a record of sightings, and every place that shows
 * it has to say so.
 */
export const CLEAR_MORNING_ODDS: readonly number[] = data.morning;

export const ODDS_PERIOD = { start: data.period.start.slice(0, 4), end: data.period.end.slice(0, 4) };

/** Percent of clear mornings for a 0-based month index. */
export function clearMorningOdds(monthIndex: number): number {
  return CLEAR_MORNING_ODDS[((monthIndex % 12) + 12) % 12];
}

/** Below this, a reader is more likely than not to be looking at cloud. */
export const LOW_ODDS_THRESHOLD = 25;
