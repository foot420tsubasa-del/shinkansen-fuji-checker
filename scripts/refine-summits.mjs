#!/usr/bin/env node
/**
 * Snap a route's summit targets to the highest point nearby on the GSI
 * elevation tiles, so the viewshed aims at the real top, not a hand-typed
 * coordinate.
 *
 *   node scripts/refine-summits.mjs <routeId> [radiusKm=2] [--apply]
 *
 * Prints each summit's typed and found position, height and shift. With
 * --apply it writes lat, lng and elevation back to data/scenic-routes.json.
 * Sea and valley targets are left alone. Elevation: 国土地理院 (GSI).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const [routeId, radiusArg] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const apply = process.argv.includes("--apply");
if (!routeId) {
  console.error("usage: node scripts/refine-summits.mjs <routeId> [radiusKm] [--apply]");
  process.exit(1);
}
const RADIUS_KM = Number(radiusArg ?? 2);
const Z = 14; // about 10 m a pixel
const CACHE = ".cache/gsi-dem";
mkdirSync(CACHE, { recursive: true });

const file = "data/scenic-routes.json";
const catalogue = JSON.parse(readFileSync(file, "utf8"));
const route = catalogue.routes.find((r) => r.id === routeId);
if (!route?.targets?.length) {
  console.error(`${routeId} has no targets`);
  process.exit(1);
}

const rad = (d) => (d * Math.PI) / 180;
const tiles = new Map();
async function tile(tx, ty) {
  const key = `${tx}/${ty}`;
  if (tiles.has(key)) return tiles.get(key);
  const f = `${CACHE}/${Z}-${tx}-${ty}.png`;
  let buf;
  if (existsSync(f)) buf = readFileSync(f);
  else {
    const res = await fetch(`https://cyberjapandata.gsi.go.jp/xyz/dem_png/${Z}/${tx}/${ty}.png`, { headers: { "User-Agent": "fujiseat-viewshed/1.0" } });
    if (!res.ok) {
      tiles.set(key, null);
      return null;
    }
    buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(f, buf);
  }
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const t = { data, ch: info.channels };
  tiles.set(key, t);
  return t;
}
async function height(lat, lng) {
  const n = 2 ** Z;
  const x = ((lng + 180) / 360) * n;
  const y = ((1 - Math.log(Math.tan(rad(lat)) + 1 / Math.cos(rad(lat))) / Math.PI) / 2) * n;
  const t = await tile(Math.floor(x), Math.floor(y));
  if (!t) return null;
  const i = (Math.floor((y % 1) * 256) * 256 + Math.floor((x % 1) * 256)) * t.ch;
  const v = t.data[i] * 65536 + t.data[i + 1] * 256 + t.data[i + 2];
  if (v === 8388608) return null;
  return (v < 8388608 ? v : v - 16777216) * 0.01;
}

const STEP_M = 40;
for (const target of route.targets) {
  if (target.type) continue; // sea / valley
  const dLat = STEP_M / 111320;
  const dLng = STEP_M / (111320 * Math.cos(rad(target.lat)));
  const steps = Math.ceil((RADIUS_KM * 1000) / STEP_M);
  let best = { h: -Infinity };
  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      if (i * i + j * j > steps * steps) continue;
      const lat = target.lat + i * dLat;
      const lng = target.lng + j * dLng;
      const h = await height(lat, lng);
      if (h !== null && h > best.h) best = { h, lat, lng };
    }
  }
  const shiftKm = Math.hypot((best.lat - target.lat) * 111.32, (best.lng - target.lng) * 111.32 * Math.cos(rad(target.lat)));
  const edge = shiftKm > RADIUS_KM * 0.9 ? "  ⚠ at the search edge — check the typed position" : "";
  console.log(
    `${target.name.padEnd(32)} typed ${target.lat.toFixed(4)},${target.lng.toFixed(4)} ${target.elevation ?? "?"} m → ${best.lat.toFixed(4)},${best.lng.toFixed(4)} ${Math.round(best.h)} m (moved ${shiftKm.toFixed(2)} km)${edge}`,
  );
  if (apply && !edge) {
    target.lat = Math.round(best.lat * 10000) / 10000;
    target.lng = Math.round(best.lng * 10000) / 10000;
    target.elevation = Math.round(best.h);
  }
}
if (apply) {
  writeFileSync(file, JSON.stringify(catalogue, null, 2) + "\n");
  console.log("written to", file);
}
