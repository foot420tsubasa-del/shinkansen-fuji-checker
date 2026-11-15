#!/usr/bin/env node
/**
 * Fetch a scenic route's track from OpenStreetMap and save it as a single
 * ordered line, the shape FujiViewMap draws.
 *
 *   node scripts/fetch-route-geometry.mjs <routeId> [binKm]
 *
 * Reads the route's osm.name and osm.bbox from data/scenic-routes.json, asks
 * Overpass for every rail, light-rail, narrow-gauge, monorail or tram way with that name inside the box, and
 * merges the pieces (both tracks, every bridge and tunnel) into one line by
 * projecting each point onto the route's main axis and averaging per bin.
 * Good for lines that run one way across the box; a switchback line such as
 * the Hakone Tozan needs a smaller box per leg. Always look at the result.
 *
 * Output: data/routes/<routeId>.json, ODbL-attributed. Map data must show
 * "© OpenStreetMap contributors" wherever it is drawn.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const [routeId, binArg] = process.argv.slice(2);
if (!routeId) {
  console.error("usage: node scripts/fetch-route-geometry.mjs <routeId> [binKm]");
  process.exit(1);
}
const catalogue = JSON.parse(readFileSync("data/scenic-routes.json", "utf8"));
const route = catalogue.routes.find((r) => r.id === routeId);
if (!route?.osm) {
  console.error(`no osm settings for ${routeId} in data/scenic-routes.json`);
  process.exit(1);
}
const binKm = Number(binArg ?? 0.4);
const [s, w, n, e] = route.osm.bbox;
const query = `[out:json][timeout:180];way["railway"~"^(rail|light_rail|narrow_gauge|monorail|tram)$"]["name"~"${route.osm.name}"](${s},${w},${n},${e});out geom;`;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

let data = null;
for (const url of ENDPOINTS) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "fujiseat-route-build/1.0" },
      body: `data=${encodeURIComponent(query)}`,
    });
    const text = await res.text();
    if (text.startsWith("{")) {
      data = JSON.parse(text);
      break;
    }
    console.warn(`${url}: ${text.slice(0, 60).replace(/\s+/g, " ")}`);
  } catch (err) {
    console.warn(`${url}: ${err.message}`);
  }
}
if (!data) {
  console.error("every Overpass server refused; try again later");
  process.exit(1);
}
const ways = data.elements.filter((el) => el.type === "way" && el.geometry?.length);
if (!ways.length) {
  console.error(`no ways named ${route.osm.name} in the box — check osm.name and osm.bbox`);
  process.exit(1);
}

const pts = ways.flatMap((way) => way.geometry.map((p) => ({ lat: p.lat, lng: p.lon, tunnel: way.tags?.tunnel === "yes" })));
const kx = Math.cos((((s + n) / 2) * Math.PI) / 180) * 111.32;
const ky = 110.57;
const xy = (p) => [p.lng * kx, p.lat * ky];

/*
 * Distance along the route for each point. With route.stations (in running
 * order) every point is placed on its nearest station-to-station leg, which
 * follows a line that doubles back (Nagano → Joetsu → the coast). Without
 * them, points are projected on the main axis — fine for a line that runs
 * one way across the box.
 */
let alongOf;
if (route.stations?.length >= 2) {
  const legs = route.stations.slice(1).map((st, i) => {
    const [ax, ay] = xy(route.stations[i]);
    const [bx, by] = xy(st);
    return { ax, ay, bx, by, len: Math.hypot(bx - ax, by - ay) };
  });
  const offsets = legs.reduce((acc, leg, i) => [...acc, acc[i] + leg.len], [0]);
  alongOf = (p) => {
    const [px, py] = xy(p);
    let best = { d: Infinity, along: 0 };
    legs.forEach((leg, i) => {
      const ux = (leg.bx - leg.ax) / leg.len;
      const uy = (leg.by - leg.ay) / leg.len;
      const t = Math.max(0, Math.min(leg.len, (px - leg.ax) * ux + (py - leg.ay) * uy));
      const d = Math.hypot(leg.ax + ux * t - px, leg.ay + uy * t - py);
      if (d < best.d) best = { d, along: offsets[i] + t };
    });
    return best.along;
  };
} else {
  let a = pts[0];
  let b = pts[0];
  let far = 0;
  for (const p of pts) {
    const [px, py] = xy(p);
    const [ox, oy] = xy(pts[0]);
    const d = (px - ox) ** 2 + (py - oy) ** 2;
    if (d > far) { far = d; a = p; }
  }
  far = 0;
  for (const p of pts) {
    const [px, py] = xy(p);
    const [ox, oy] = xy(a);
    const d = (px - ox) ** 2 + (py - oy) ** 2;
    if (d > far) { far = d; b = p; }
  }
  const [ax, ay] = xy(a);
  const [bx, by] = xy(b);
  const len = Math.hypot(bx - ax, by - ay);
  alongOf = (p) => {
    const [px, py] = xy(p);
    return (px - ax) * ((bx - ax) / len) + (py - ay) * ((by - ay) / len);
  };
}

const bins = new Map();
for (const p of pts) {
  const k = Math.round(alongOf(p) / binKm);
  const bin = bins.get(k) ?? { lat: 0, lng: 0, n: 0, t: 0 };
  bin.lat += p.lat;
  bin.lng += p.lng;
  bin.n += 1;
  if (p.tunnel) bin.t += 1;
  bins.set(k, bin);
}
const line = [...bins.entries()]
  .sort((x, y) => x[0] - y[0])
  .map(([, bin]) => ({
    lat: +(bin.lat / bin.n).toFixed(4),
    lng: +(bin.lng / bin.n).toFixed(4),
    tunnel: bin.t / bin.n > 0.5,
  }));

mkdirSync("data/routes", { recursive: true });
const out = {
  _source: `Track geometry: OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright). Ways tagged railway=rail, name ~ ${route.osm.name}, fetched ${new Date().toISOString().slice(0, 10)} via Overpass, merged along the main axis in ${binKm} km bins. Draft until checked by eye.`,
  routeId,
  line,
};
writeFileSync(`data/routes/${routeId}.json`, JSON.stringify(out));
console.log(`${routeId}: ${ways.length} ways → ${line.length} points, ${line.filter((p) => p.tunnel).length} in tunnels → data/routes/${routeId}.json`);
