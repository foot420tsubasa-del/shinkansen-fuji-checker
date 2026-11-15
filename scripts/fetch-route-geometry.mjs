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
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

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
// osm.chain: follow the track graph station to station (shared OSM nodes),
// for lines that double back on themselves — switchbacks, where averaging the
// two legs would draw a track that is not there.
const chain = Boolean(route.osm.chain);
const query = chain
  ? `[out:json][timeout:180];way["railway"~"^(rail|light_rail|narrow_gauge|monorail|tram)$"]["name"~"${route.osm.name}"](${s},${w},${n},${e});out body;>;out skel qt;`
  : `[out:json][timeout:180];way["railway"~"^(rail|light_rail|narrow_gauge|monorail|tram)$"]["name"~"${route.osm.name}"](${s},${w},${n},${e});out geom;`;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

// The raw answer is cached (.cache is gitignored), so a rerun does not need Overpass.
const cacheFile = `.cache/overpass-${routeId}-${chain ? "chain" : "geom"}.json`;
let data = existsSync(cacheFile) && !process.env.REFETCH ? JSON.parse(readFileSync(cacheFile, "utf8")) : null;
for (const url of data ? [] : ENDPOINTS) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "fujiseat-route-build/1.0" },
      body: `data=${encodeURIComponent(query)}`,
    });
    const text = await res.text();
    if (text.startsWith("{")) {
      data = JSON.parse(text);
      mkdirSync(".cache", { recursive: true });
      writeFileSync(cacheFile, text);
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
if (chain) {
  writeChained(data);
  process.exit(0);
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

/**
 * Chain mode: shortest path over the track graph from each station to the
 * next (stations in running order), so the line runs where the rails do,
 * reversals included, then resampled every 25 m. A switchback shows up as a
 * point where the line turns back on itself — the direction of travel flips
 * there, as it does on the train.
 */
function writeChained(osm) {
  const nodes = new Map(osm.elements.filter((el) => el.type === "node").map((el) => [el.id, { lat: el.lat, lng: el.lon }]));
  const ways = osm.elements.filter((el) => el.type === "way" && el.nodes?.length);
  if (!ways.length || !route.stations?.length) {
    console.error("chain mode needs ways and route.stations");
    process.exit(1);
  }
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dist = (a, b) => {
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  const adj = new Map();
  const tunnelEdge = new Set();
  const link = (a, b, tunnel) => {
    const d = dist(nodes.get(a), nodes.get(b));
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a).push([b, d]);
    adj.get(b).push([a, d]);
    if (tunnel) tunnelEdge.add(`${a}-${b}`).add(`${b}-${a}`);
  };
  for (const way of ways) {
    const tunnel = way.tags?.tunnel === "yes" || way.tags?.layer < 0;
    for (let i = 1; i < way.nodes.length; i++) if (nodes.has(way.nodes[i - 1]) && nodes.has(way.nodes[i])) link(way.nodes[i - 1], way.nodes[i], tunnel);
  }
  // Named ways can stop short of an unnamed bridge or tunnel. Join each dead
  // end to the nearest node of another way within osm.joinM (200 m unless set);
  // a gap longer than 60 m is taken to be a tunnel, so no view is claimed there.
  const parent = new Map([...adj.keys()].map((id) => [id, id]));
  const root = (id) => (parent.get(id) === id ? id : (parent.set(id, root(parent.get(id))), parent.get(id)));
  for (const [id, links] of adj) for (const [v] of links) parent.set(root(id), root(v));
  for (const [id, links] of [...adj.entries()]) {
    if (links.length !== 1) continue;
    let best = null;
    let bd = route.osm.joinM ?? 200;
    for (const other of adj.keys()) {
      if (root(other) === root(id)) continue;
      const d = dist(nodes.get(id), nodes.get(other));
      if (d < bd) {
        bd = d;
        best = other;
      }
    }
    if (best !== null) {
      link(id, best, bd > 60);
      parent.set(root(id), root(best));
    }
  }
  const nearest = (p) => {
    let best = null;
    let bd = Infinity;
    for (const id of adj.keys()) {
      const d = dist(nodes.get(id), p);
      if (d < bd) {
        bd = d;
        best = id;
      }
    }
    return best;
  };
  const path = (from, to) => {
    const dd = new Map([[from, 0]]);
    const prev = new Map();
    const done = new Set();
    const queue = [[0, from]];
    while (queue.length) {
      queue.sort((x, y) => x[0] - y[0]);
      const [d, u] = queue.shift();
      if (done.has(u)) continue;
      done.add(u);
      if (u === to) break;
      for (const [v, w] of adj.get(u)) {
        if (d + w < (dd.get(v) ?? Infinity)) {
          dd.set(v, d + w);
          prev.set(v, u);
          queue.push([d + w, v]);
        }
      }
    }
    if (!dd.has(to)) throw new Error("no track between two stations — widen osm.bbox or check osm.name");
    const out = [to];
    while (out[0] !== from) out.unshift(prev.get(out[0]));
    return out;
  };
  const stops = route.stations.map(nearest);
  let ids = [stops[0]];
  for (let i = 1; i < stops.length; i++) ids = ids.concat(path(stops[i - 1], stops[i]).slice(1));
  // Resample every 25 m along the path.
  const STEP = 25;
  const line = [];
  const stationKm = {};
  let along = 0;
  let next = 0;
  for (let i = 0; i < ids.length; i++) {
    const p = nodes.get(ids[i]);
    if (i > 0) {
      const a = nodes.get(ids[i - 1]);
      const seg = dist(a, p);
      const tunnel = tunnelEdge.has(`${ids[i - 1]}-${ids[i]}`);
      while (next <= along + seg && seg > 0) {
        const t = (next - along) / seg;
        line.push({ lat: +(a.lat + (p.lat - a.lat) * t).toFixed(5), lng: +(a.lng + (p.lng - a.lng) * t).toFixed(5), tunnel });
        next += STEP;
      }
      along += seg;
    }
    const k = stops.indexOf(ids[i]);
    if (k >= 0 && stationKm[route.stations[k].name] === undefined) stationKm[route.stations[k].name] = +(along / 1000).toFixed(2);
  }
  mkdirSync("data/routes", { recursive: true });
  writeFileSync(
    `data/routes/${routeId}.json`,
    JSON.stringify({
      _source: `Track geometry: OpenStreetMap contributors, ODbL 1.0 (https://www.openstreetmap.org/copyright). Ways tagged railway, name ~ ${route.osm.name}, fetched ${new Date().toISOString().slice(0, 10)} via Overpass, followed along the track graph station to station and resampled every ${STEP} m. Draft until checked by eye.`,
      routeId,
      stationKm,
      line,
    }),
  );
  console.log(`${routeId}: ${ways.length} ways → ${line.length} points (${(along / 1000).toFixed(2)} km), ${line.filter((p) => p.tunnel).length} in tunnels`);
  console.log(stationKm);
}
