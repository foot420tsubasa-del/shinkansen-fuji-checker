// Builds data/fuji-clear-sky-odds.json: how often the sky over the Fuji
// stretch of the Tokaido line was clear, by month and hour of day.
//
// The forecast tool can only see ten days ahead, and most readers book weeks
// out. This is the same question asked of the past instead of the future: for
// every hour of every day in the window below, was the sky over Shin-Fuji
// clear by the forecast tool's own definition (lib/fuji-window.ts gradeHour:
// cloud cover <= 30% and under 0.5mm of rain)? The share of days that passed,
// per month and hour, is the figure published.
//
// It is reanalysis cloud cover (ERA5 via Open-Meteo's archive API), not
// anyone's sighting log, and the site says so wherever the number appears.
//
//   node scripts/build-fuji-clear-sky-odds.mjs
//
import fs from "node:fs";

const LAT = 35.15; // same point as app/api/fuji-window/route.ts
const LON = 138.68;
const START = "2016-01-01";
const END = "2025-12-31";
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const url = new URL("https://archive-api.open-meteo.com/v1/archive");
url.searchParams.set("latitude", String(LAT));
url.searchParams.set("longitude", String(LON));
url.searchParams.set("start_date", START);
url.searchParams.set("end_date", END);
url.searchParams.set("hourly", "cloud_cover,precipitation");
url.searchParams.set("timezone", "Asia/Tokyo");

const res = await fetch(url);
if (!res.ok) throw new Error(`archive API ${res.status}: ${await res.text()}`);
const json = await res.json();
const { time, cloud_cover: cloud, precipitation: precip } = json.hourly;

// [month 0-11][hour] -> { clear, total }
const cells = Array.from({ length: 12 }, () => Object.fromEntries(HOURS.map((h) => [h, { clear: 0, total: 0 }])));
const byYearMonth8 = {}; // validation aid: "2025-01" -> { clear, total } at 08:00

for (let i = 0; i < time.length; i++) {
  const c = cloud[i];
  if (typeof c !== "number") continue;
  const month = Number(time[i].slice(5, 7)) - 1;
  const hour = Number(time[i].slice(11, 13));
  if (!HOURS.includes(hour)) continue;
  const clear = c <= 30 && (precip[i] ?? 0) < 0.5;
  cells[month][hour].total++;
  if (clear) cells[month][hour].clear++;
  if (hour === 8) {
    const k = time[i].slice(0, 7);
    (byYearMonth8[k] ??= { clear: 0, total: 0 }).total++;
    if (clear) byYearMonth8[k].clear++;
  }
}

const odds = cells.map((row) => Object.fromEntries(HOURS.map((h) => [h, Math.round((row[h].clear / row[h].total) * 100)])));

// What the site publishes: one figure per month, pooled over the morning hours
// most Fuji-minded readers ride in. The hour-by-hour cut stays in the file for
// anyone checking the work but is deliberately not shown: checked against a
// published 2025 sighting log, reanalysis cloud cover reproduces the seasons
// (clear winters, hidden summers) but not the well-documented slide from
// morning to afternoon — it rates a January 16:00 as good as a January 08:00,
// and the mountain says otherwise. Publishing that grid would teach readers
// something false.
const MORNING = [7, 8, 9, 10];
const morning = cells.map((row) => {
  const clear = MORNING.reduce((a, h) => a + row[h].clear, 0);
  const total = MORNING.reduce((a, h) => a + row[h].total, 0);
  return Math.round((clear / total) * 100);
});

const out = {
  generatedBy: "scripts/build-fuji-clear-sky-odds.mjs",
  source: "ERA5 reanalysis via Open-Meteo archive API (CC BY 4.0)",
  point: { latitude: LAT, longitude: LON, label: "near Shin-Fuji" },
  period: { start: START, end: END },
  definition: "Share of days with cloud cover <= 30% and precipitation < 0.5mm in that hour (the forecast tool's 'high' grade).",
  // morning[monthIndex] = percent of 07:00-10:00 hours that were clear. Published.
  morningHours: MORNING,
  morning,
  hours: HOURS,
  // odds[monthIndex][hour] = percent of days that hour was clear. Not published;
  // see the note above `morning` in the generator.
  odds,
};
fs.writeFileSync("data/fuji-clear-sky-odds.json", JSON.stringify(out, null, 2) + "\n");

const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
console.log("morning:", morning.join(" "));
console.log("hours :", HOURS.map((h) => String(h).padStart(3)).join(""));
odds.forEach((row, m) => console.log(M[m], "  :", HOURS.map((h) => String(row[h]).padStart(3)).join("")));
console.log("\n2025, 08:00, clear share by month (to sanity-check against a published sighting log):");
for (const m of M.keys()) {
  const v = byYearMonth8[`2025-${String(m + 1).padStart(2, "0")}`];
  console.log(` ${M[m]} ${v.clear}/${v.total} = ${Math.round((v.clear / v.total) * 100)}%`);
}
