/**
 * When a given Tokaido Shinkansen run passes Mt. Fuji, and whether the sky
 * over that stretch is forecast to be clear at that moment.
 *
 * The site's existing visibility widget answers "is Fuji out today", which a
 * reader checks once. This answers "will I see it from *my* train", which a
 * reader checks again when the date gets closer — the difference between a
 * page visited once and a page visited three times.
 */

export type OriginId =
  | "tokyo"
  | "shinagawa"
  | "shin-yokohama"
  | "nagoya"
  | "kyoto"
  | "shin-osaka";

export type VisibilityLevel = "high" | "medium" | "low";

export type Origin = {
  id: OriginId;
  /** Minutes after departure that Fuji first comes into view. */
  first: number;
  /** Minutes after departure that the train passes Shin-Fuji, where Fuji is largest. */
  peak: number;
  /** Minutes after departure that the view closes. */
  last: number;
  /** Travelling away from Tokyo, so Fuji is on the right-hand side. */
  westbound: boolean;
};

/*
 * Estimates for a Nozomi, which is what most readers ride and which passes
 * Shin-Fuji without a published time. Recalibrated 2026-11-13: the earlier
 * model put the whole sighting at a single 42 minutes out of Tokyo, which is
 * closer to where the view opens than to where it is best.
 *
 * Westbound the view opens once the train clears the Izu hills past Mishima,
 * about 40 minutes out of Tokyo, is largest passing Shin-Fuji at about 45, and
 * closes after the Fuji River bridge at about 48. Shinagawa and Shin-Yokohama
 * are the same train 7 and 18 minutes later.
 *
 * Eastbound it runs in reverse — bridge first, then Shin-Fuji, then a longer
 * fade toward Mishima — and Shin-Fuji falls about 45 minutes before Tokyo:
 * 51 minutes out of Nagoya (about 1h36 to Tokyo), 88 out of Kyoto (about 2h13)
 * and 103 out of Shin-Osaka (about 2h28).
 *
 * Hikari and Kodama stop more and run later; the UI says so rather than
 * pretending to a precision a timetable-free model does not have.
 */
export const ORIGINS: Record<OriginId, Origin> = {
  tokyo: { id: "tokyo", first: 40, peak: 45, last: 48, westbound: true },
  shinagawa: { id: "shinagawa", first: 33, peak: 38, last: 41, westbound: true },
  "shin-yokohama": { id: "shin-yokohama", first: 22, peak: 27, last: 30, westbound: true },
  nagoya: { id: "nagoya", first: 48, peak: 51, last: 56, westbound: false },
  kyoto: { id: "kyoto", first: 85, peak: 88, last: 93, westbound: false },
  "shin-osaka": { id: "shin-osaka", first: 100, peak: 103, last: 108, westbound: false },
};

/** Which origins belong to which leg, in the order the UI offers them. */
export const ORIGINS_BY_DIRECTION: Record<"tokyo-osaka" | "osaka-tokyo", OriginId[]> = {
  "tokyo-osaka": ["tokyo", "shinagawa", "shin-yokohama"],
  "osaka-tokyo": ["kyoto", "shin-osaka", "nagoya"],
};

/**
 * Same thresholds as the homepage visibility strip, so the two never disagree
 * about the same sky.
 */
export function gradeCloud(cloudPercent: number): VisibilityLevel {
  if (cloudPercent <= 30) return "high";
  if (cloudPercent <= 70) return "medium";
  return "low";
}

/** Rain at the Fuji stretch overrides a merely cloudy reading. */
export function gradeHour(cloudPercent: number, precipMm: number): VisibilityLevel {
  if (precipMm >= 0.5) return "low";
  return gradeCloud(cloudPercent);
}

export function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const total = ((h * 60 + m + minutes) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Local ISO hour key ("2026-10-14T09:00") — matches Open-Meteo's hourly time. */
export function hourKey(date: string, hhmm: string): string {
  return `${date}T${hhmm.slice(0, 2)}:00`;
}

export type HourlyForecast = {
  /** "2026-10-14T09:00" in Asia/Tokyo. */
  time: string[];
  cloud: number[];
  precip: number[];
};

export type WindowResult = {
  /** When Fuji first comes into view, local time. */
  firstTime: string;
  /** When the train passes Shin-Fuji and Fuji is largest, local time. */
  fujiTime: string;
  /** When the view closes, local time. */
  lastTime: string;
  /** The day that time falls on — a late departure can roll past midnight. */
  fujiDate: string;
  cloudPercent: number | null;
  precipMm: number | null;
  level: VisibilityLevel | null;
  /** Fuji is on the right leaving Tokyo, on the left heading back. */
  side: "right" | "left";
};

export function resolveWindow(
  origin: OriginId,
  date: string,
  departure: string,
  forecast: HourlyForecast | null,
): WindowResult {
  const spec = ORIGINS[origin];
  const fujiTime = addMinutes(departure, spec.peak);
  // A departure late enough to cross midnight lands the sighting on the next
  // day; without this the lookup would silently read the wrong day's sky.
  const rolled = Number(departure.slice(0, 2)) * 60 + Number(departure.slice(3)) + spec.peak >= 1440;
  const fujiDate = rolled ? nextDay(date) : date;

  const key = hourKey(fujiDate, fujiTime);
  const index = forecast ? forecast.time.indexOf(key) : -1;
  const cloudPercent = index >= 0 ? forecast!.cloud[index] ?? null : null;
  const precipMm = index >= 0 ? forecast!.precip[index] ?? null : null;

  return {
    firstTime: addMinutes(departure, spec.first),
    fujiTime,
    lastTime: addMinutes(departure, spec.last),
    fujiDate,
    cloudPercent,
    precipMm,
    level: cloudPercent === null ? null : gradeHour(cloudPercent, precipMm ?? 0),
    side: spec.westbound ? "right" : "left",
  };
}

export function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export type Alternative = { time: string; cloudPercent: number; level: VisibilityLevel };

/**
 * The clearest departure on the same day, so a reader looking at a cloudy run
 * has somewhere to go instead of closing the tab. Only offered when it is
 * meaningfully better than what they picked.
 */
export function findBetterDeparture(
  origin: OriginId,
  date: string,
  departure: string,
  forecast: HourlyForecast | null,
  current: VisibilityLevel | null,
): Alternative | null {
  if (!forecast || current === "high") return null;
  let best: Alternative | null = null;

  // Tokaido departures run roughly 06:00-21:00.
  for (let hour = 6; hour <= 21; hour++) {
    const dep = `${String(hour).padStart(2, "0")}:00`;
    if (dep === departure) continue;
    const r = resolveWindow(origin, date, dep, forecast);
    if (r.cloudPercent === null || r.level === null) continue;
    if (r.level !== "high") continue;
    if (!best || r.cloudPercent < best.cloudPercent) {
      best = { time: dep, cloudPercent: r.cloudPercent, level: r.level };
    }
  }
  return best;
}
