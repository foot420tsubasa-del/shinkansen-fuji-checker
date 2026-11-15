#!/usr/bin/env node
/**
 * Which mountains a train passenger can see, where, and on which side.
 *
 *   node scripts/compute-viewshed.mjs <routeId>
 *
 * Reads the ordered track from data/routes/<routeId>.json (made by
 * fetch-route-geometry.mjs, in running order from the first station listed in
 * data/scenic-routes.json) and the route's `targets` (summits). For every
 * open-air point on the line it casts a sight line to each summit over the
 * Geospatial Information Authority of Japan's elevation tiles (DEM10B, zoom
 * 12, about 38 m per pixel), allowing for the curve of the earth and normal
 * refraction, and records whether the summit clears the terrain, which side
 * of the train it is on, and how high it stands above the horizon.
 *
 * Output: data/routes/<routeId>-viewshed.json, with the visible sections per
 * summit. This is a model, not a sighting log: it ignores trees, buildings,
 * noise barriers and weather. Check every section against real footage
 * before a side goes on the site.
 *
 * Elevation: 国土地理院 (GSI) — attribution required wherever results are shown.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const routeId = process.argv[2];
if (!routeId) {
  console.error("usage: node scripts/compute-viewshed.mjs <routeId>");
  process.exit(1);
}
const route = JSON.parse(readFileSync("data/scenic-routes.json", "utf8")).routes.find((r) => r.id === routeId);
const track = JSON.parse(readFileSync(`data/routes/${routeId}.json`, "utf8"));
if (!route?.targets?.length || !route.stations?.length) {
  console.error(`${routeId} needs stations and targets in data/scenic-routes.json`);
  process.exit(1);
}

const Z = 12;
const CACHE = ".cache/gsi-dem";
mkdirSync(CACHE, { recursive: true });
const R = 6371000;
const REFRACTION = 0.13;
const OBSERVER_ABOVE_GROUND = 12; // viaducts and embankments; a window seat is a few metres up
const STEP = 150; // metres between terrain samples on a sight line
const MAX_KM = 160;

const rad = (d) => (d * Math.PI) / 180;
function distM(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function bearing(a, b) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat));
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng));
  return (Math.atan2(y, x) * 180) / Math.PI;
}

// ── GSI elevation tiles ─────────────────────────────────────────────────────
function tileOf(lat, lng) {
  const n = 2 ** Z;
  const x = ((lng + 180) / 360) * n;
  const y = ((1 - Math.log(Math.tan(rad(lat)) + 1 / Math.cos(rad(lat))) / Math.PI) / 2) * n;
  return { tx: Math.floor(x), ty: Math.floor(y), px: Math.floor((x % 1) * 256), py: Math.floor((y % 1) * 256) };
}
const tiles = new Map();
async function loadTile(tx, ty) {
  const key = `${tx}/${ty}`;
  if (tiles.has(key)) return tiles.get(key);
  const file = `${CACHE}/${Z}-${tx}-${ty}.png`;
  let buf;
  if (existsSync(file)) buf = readFileSync(file);
  else {
    const res = await fetch(`https://cyberjapandata.gsi.go.jp/xyz/dem_png/${Z}/${tx}/${ty}.png`, {
      headers: { "User-Agent": "fujiseat-viewshed/1.0" },
    });
    if (res.status === 404) {
      tiles.set(key, null); // sea: no tile
      return null;
    }
    if (!res.ok) throw new Error(`GSI ${res.status} for ${key}`);
    buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(file, buf);
  }
  const { data } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const h = new Float32Array(256 * 256);
  for (let i = 0; i < 256 * 256; i++) {
    const v = data[i * 3] * 65536 + data[i * 3 + 1] * 256 + data[i * 3 + 2];
    h[i] = v === 8388608 ? 0 : v < 8388608 ? v * 0.01 : (v - 16777216) * 0.01;
  }
  tiles.set(key, h);
  return h;
}
function elevationSync(lat, lng) {
  const { tx, ty, px, py } = tileOf(lat, lng);
  const h = tiles.get(`${tx}/${ty}`);
  return h ? Math.max(0, h[py * 256 + px]) : 0;
}

// ── Track: fill unnamed gaps (long tunnels) and stop at the last station ───
const last = route.stations[route.stations.length - 1];
let line = track.line;
let cut = line.length - 1;
let best = Infinity;
line.forEach((p, i) => {
  const d = distM(p, last);
  if (d < best) {
    best = d;
    cut = i;
  }
});
line = line.slice(0, cut + 1);
const filled = [];
for (let i = 0; i < line.length; i++) {
  if (i > 0) {
    const gap = distM(line[i - 1], line[i]);
    // A hole in the OpenStreetMap names is almost always an unnamed tunnel.
    if (gap > 1000) {
      const n = Math.floor(gap / 500);
      for (let k = 1; k < n; k++) {
        const t = k / n;
        filled.push({
          lat: line[i - 1].lat + (line[i].lat - line[i - 1].lat) * t,
          lng: line[i - 1].lng + (line[i].lng - line[i - 1].lng) * t,
          tunnel: true,
          inferred: true,
        });
      }
    }
  }
  filled.push(line[i]);
}

// ── Which tiles are needed: every sight line, sampled ───────────────────────
const needed = new Set();
const rays = [];
for (let i = 0; i < filled.length; i++) {
  const p = filled[i];
  if (p.tunnel) continue;
  for (const target of route.targets) {
    const d = distM(p, target);
    if (d > MAX_KM * 1000) continue;
    rays.push({ i, target, d });
    for (let s = 0; s <= d; s += STEP) {
      const t = s / d;
      const { tx, ty } = tileOf(p.lat + (target.lat - p.lat) * t, p.lng + (target.lng - p.lng) * t);
      needed.add(`${tx}/${ty}`);
    }
  }
}
console.log(`${filled.length} track points, ${rays.length} sight lines, ${needed.size} elevation tiles`);
const list = [...needed];
for (let k = 0; k < list.length; k += 6) {
  await Promise.all(list.slice(k, k + 6).map((key) => loadTile(...key.split("/").map(Number))));
  if (k % 60 === 0) process.stdout.write(`\r  tiles ${Math.min(k + 6, list.length)}/${list.length}`);
}
console.log("");

// ── Cast the sight lines ────────────────────────────────────────────────────
const drop = (s) => ((s * s) / (2 * R)) * (1 - REFRACTION);
const results = filled.map((p) => ({ lat: p.lat, lng: p.lng, tunnel: Boolean(p.tunnel), see: {} }));
for (const { i, target, d } of rays) {
  const p = filled[i];
  const eye = elevationSync(p.lat, p.lng) + OBSERVER_ABOVE_GROUND;
  const top = target.elevation - drop(d);
  let clear = true;
  for (let s = STEP; s < d - 400; s += STEP) {
    const t = s / d;
    const ground = elevationSync(p.lat + (target.lat - p.lat) * t, p.lng + (target.lng - p.lng) * t) - drop(s);
    const sight = eye + (top - eye) * t;
    if (ground > sight) {
      clear = false;
      break;
    }
  }
  if (!clear) continue;
  const angle = (Math.atan2(top - eye, d) * 180) / Math.PI;
  if (angle < 0.4) continue; // a speck on the horizon is not a view
  const a = filled[Math.max(0, i - 2)];
  const b = filled[Math.min(filled.length - 1, i + 2)];
  let rel = bearing(p, target) - bearing(a, b);
  rel = ((rel + 540) % 360) - 180;
  const side = Math.abs(rel) < 12 ? "ahead" : Math.abs(rel) > 168 ? "behind" : rel > 0 ? "right" : "left";
  results[i].see[target.id] = { side, angle: +angle.toFixed(2), km: +(d / 1000).toFixed(1) };
}

// ── Sections: runs of visibility per summit, small breaks bridged ──────────
const along = [0];
for (let i = 1; i < results.length; i++) along.push(along[i - 1] + distM(results[i - 1], results[i]) / 1000);
const nearestStation = (p) =>
  route.stations.reduce((acc, st) => (distM(p, st) < distM(p, acc) ? st : acc), route.stations[0]).name;
const sections = [];
for (const target of route.targets) {
  let run = null;
  const close = () => {
    if (run && run.km >= 1.5) {
      const sides = Object.entries(run.sides).sort((x, y) => y[1] - x[1]);
      sections.push({
        target: target.id,
        name: target.name,
        fromKm: +along[run.start].toFixed(1),
        toKm: +along[run.end].toFixed(1),
        km: +run.km.toFixed(1),
        near: [nearestStation(results[run.start]), nearestStation(results[run.end])],
        side: sides[0][0],
        sideShare: +(sides[0][1] / run.n).toFixed(2),
        maxAngle: run.maxAngle,
      });
    }
    run = null;
  };
  for (let i = 0; i < results.length; i++) {
    const v = results[i].see[target.id];
    if (v) {
      if (run && along[i] - along[run.end] <= 1.2) {
        run.end = i;
      } else {
        close();
        run = { start: i, end: i, sides: {}, n: 0, maxAngle: 0 };
      }
      run.sides[v.side] = (run.sides[v.side] ?? 0) + 1;
      run.n += 1;
      run.maxAngle = Math.max(run.maxAngle, v.angle);
      run.km = along[run.end] - along[run.start];
    }
  }
  close();
}
sections.sort((x, y) => x.fromKm - y.fromKm);

writeFileSync(
  `data/routes/${routeId}-viewshed.json`,
  JSON.stringify({
    _source:
      "Model: sight lines over GSI DEM10B elevation tiles (国土地理院, zoom 12), earth curvature with refraction k=0.13, observer 12 m above ground, summit must stand at least 0.4° above the horizon. Ignores trees, buildings, noise barriers and weather. Track: OpenStreetMap contributors (ODbL). Direction of travel: " +
      `${route.stations[0].name} → ${route.stations[route.stations.length - 1].name}.`,
    computed: new Date().toISOString().slice(0, 10),
    direction: [route.stations[0].name, route.stations[route.stations.length - 1].name],
    sections,
    points: results.map((r, i) => ({ ...r, km: +along[i].toFixed(2) })),
  }),
);
console.log(`\n${route.stations[0].name} → ${route.stations[route.stations.length - 1].name}`);
for (const s of sections) {
  console.log(
    `${s.name.padEnd(24)} km ${String(s.fromKm).padStart(6)}–${String(s.toKm).padEnd(6)} (${s.km} km) ${s.side.padEnd(6)} ${Math.round(s.sideShare * 100)}%  max ${s.maxAngle}°  near ${s.near.join(" → ")}`,
  );
}
