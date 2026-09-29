/**
 * When a given Tokaido Shinkansen run passes Mt. Fuji, and whether the sky
 * over that stretch is forecast to be clear at that moment.
 *
 * The site's existing visibility widget answers "is Fuji out today", which a
 * reader checks once. This answers "will I see it from *my* train", which a
 * reader checks again when the date gets closer — the difference between a
 * page visited once and a page visited three times.
 */

export type OriginId = "tokyo" | "kyoto" | "shin-osaka";

export type VisibilityLevel = "high" | "medium" | "low";

export type Origin = {
  id: OriginId;
  /** Minutes from this origin until the train reaches the Fuji stretch. */
  minutesToFuji: number;
  /** Travelling away from Tokyo, so Fuji is on the right-hand side. */
  westbound: boolean;
};

/*
 * Fuji is in view either side of Shin-Fuji station, roughly 40-45 minutes out
 * of Tokyo on a Nozomi. The eastbound figures are that same point measured
 * from the other end: Tokyo–Kyoto is about 2h13 and Tokyo–Shin-Osaka about
 * 2h27, so the stretch falls ~42 minutes before arrival in both cases.
 * Hikari and Kodama are slower; the UI says so rather than pretending to a
 * precision a timetable-free model does not have.
 */
export const ORIGINS: Record<OriginId, Origin> = {
  tokyo: { id: "tokyo", minutesToFuji: 42, westbound: true },
  kyoto: { id: "kyoto", minutesToFuji: 91, westbound: false },
  "shin-osaka": { id: "shin-osaka", minutesToFuji: 105, westbound: false },
};

/** The stretch is in view for roughly this long, centred on the estimate. */
export const WINDOW_MINUTES = 10;

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
  /** When the train reaches the Fuji stretch, local time. */
  fujiTime: string;
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
  const fujiTime = addMinutes(departure, spec.minutesToFuji);
  // A departure late enough to cross midnight lands the sighting on the next
  // day; without this the lookup would silently read the wrong day's sky.
  const rolled = Number(departure.slice(0, 2)) * 60 + Number(departure.slice(3)) + spec.minutesToFuji >= 1440;
  const fujiDate = rolled ? nextDay(date) : date;

  const key = hourKey(fujiDate, fujiTime);
  const index = forecast ? forecast.time.indexOf(key) : -1;
  const cloudPercent = index >= 0 ? forecast!.cloud[index] ?? null : null;
  const precipMm = index >= 0 ? forecast!.precip[index] ?? null : null;

  return {
    fujiTime,
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
  const spec = ORIGINS[origin];
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
  void spec;
  return best;
}
