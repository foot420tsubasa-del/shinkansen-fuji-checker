#!/usr/bin/env node
/**
 * Build the small dataset used by /scenic.
 *
 * Route geometry is sampled to at most 140 points per line. The Japan outline
 * comes from Natural Earth 5.1.2 (public domain); after the first build it is
 * reused from the committed output so routine route updates work offline.
 * Pass --refresh-outline to download the pinned source again.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const CATALOGUE = "data/scenic-routes.json";
const OUTPUT = "data/scenic-overview.json";
const MAX_POINTS = 140;
const OUTLINE_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_10m_admin_0_countries.geojson";

const catalogue = JSON.parse(readFileSync(CATALOGUE, "utf8"));
const previous = existsSync(OUTPUT) ? JSON.parse(readFileSync(OUTPUT, "utf8")) : null;

const routes = catalogue.routes.filter((route) => route.status === "live").map((route) => {
  const geometryFile = route.geometry ?? `data/routes/${route.id}.json`;
  const geometry = JSON.parse(readFileSync(geometryFile, "utf8"));
  if (!geometry.line?.length) throw new Error(`${route.id}: no line in ${geometryFile}`);
  if (!route.slug || !route.image || !route.season || !route.teaser) throw new Error(`${route.id}: incomplete live route`);

  const months = seasonMonths(route.season);
  const categories = viewCategories(route);
  if (!categories.length) throw new Error(`${route.id}: no overview category`);
  if (!months.length) throw new Error(`${route.id}: season cannot be classified: ${route.season}`);

  return {
    id: route.id,
    slug: route.slug,
    title: route.title,
    line: route.line,
    region: route.between.join(" → "),
    teaser: route.teaser,
    season: route.season,
    notice: operatingNotice(route.notes ?? []),
    image: route.image,
    categories,
    months,
    seasons: seasonFilters(months),
    points: sample(geometry.line, MAX_POINTS).map(({ lat, lng }) => [round(lng), round(lat)]),
  };
});

const refresh = process.argv.includes("--refresh-outline");
const outline = !refresh && previous?.outline?.length ? previous.outline : await fetchJapanOutline();

const output = {
  _source: `Route tracks: OpenStreetMap contributors, ODbL 1.0. Japan outline: Natural Earth 5.1.2, public domain (${OUTLINE_URL}).`,
  maxPoints: MAX_POINTS,
  outline,
  routes,
};

writeFileSync(OUTPUT, `${JSON.stringify(output)}\n`);
console.log(`${OUTPUT}: ${routes.length} routes, ${routes.reduce((sum, route) => sum + route.points.length, 0)} track points, ${outline.reduce((sum, ring) => sum + ring.length, 0)} outline points`);

function round(value) {
  return Number(value.toFixed(5));
}

function sample(points, limit) {
  if (points.length <= limit) return points;
  return Array.from({ length: limit }, (_, index) => points[Math.round((index * (points.length - 1)) / (limit - 1))]);
}

function viewCategories(route) {
  const values = new Set([...(route.tags ?? []), ...(route.view ?? [])]);
  return [
    values.has("fuji") && "fuji",
    values.has("mountain") && "mountains",
    values.has("sea") && "sea",
    values.has("gorge") && "gorge-river",
    values.has("snow") && "snow",
    (values.has("seasonal-flowers") || values.has("countryside")) && "flowers-countryside",
    (values.has("city") || values.has("night")) && "city-night",
  ].filter(Boolean);
}

function seasonMonths(season) {
  const text = season.toLowerCase();
  const months = new Set();
  const add = (...values) => values.forEach((value) => months.add(value));
  const all = () => add(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);

  if (/all year|year-round|any season/.test(text)) all();
  if (/november to may/.test(text)) add(11, 12, 1, 2, 3, 4, 5);
  if (/march to (?:late )?december/.test(text)) add(3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
  if (/spring to november/.test(text)) add(3, 4, 5, 6, 7, 8, 9, 10, 11);
  if (/december to february/.test(text)) add(12, 1, 2);
  if (/june[–-]july/.test(text)) add(6, 7);
  if (/july to (?:early )?september/.test(text)) add(7, 8, 9);
  if (/october to (?:mid-)?november/.test(text)) add(10, 11);
  if (/november to (?:early )?december/.test(text)) add(11, 12);
  if (text.includes("spring")) add(3, 4, 5);
  if (text.includes("summer")) add(6, 7, 8);
  if (/autumn|fall/.test(text)) add(9, 10, 11);
  if (text.includes("winter")) add(12, 1, 2);

  const names = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
  names.forEach((name, index) => {
    if (text.includes(name)) months.add(index + 1);
  });
  return [...months].sort((a, b) => a - b);
}

function seasonFilters(months) {
  const has = (...values) => values.some((value) => months.includes(value));
  return [has(3, 4, 5) && "spring", has(6, 7, 8) && "summer", has(9, 10, 11) && "autumn", has(12, 1, 2) && "winter"].filter(Boolean);
}

function operatingNotice(notes) {
  const match = notes.find((note) => /final run|trains?.*run until|seasonal, not|only on set dates/i.test(note));
  if (!match) return null;
  return (match.match(/[^.!?]+[.!?]+/g) ?? [match]).slice(0, 2).join(" ").replace(/\s+/g, " ").trim();
}

async function fetchJapanOutline() {
  const response = await fetch(OUTLINE_URL, { headers: { "User-Agent": "fujiseat-scenic-overview/1.0" } });
  if (!response.ok) throw new Error(`Natural Earth: HTTP ${response.status}`);
  const geojson = await response.json();
  const japan = geojson.features.find((feature) => feature.properties?.ADMIN === "Japan");
  if (!japan) throw new Error("Japan was not found in Natural Earth data");
  const polygons = japan.geometry.type === "Polygon" ? [japan.geometry.coordinates] : japan.geometry.coordinates;
  return polygons
    .map((polygon) => polygon[0])
    .filter((ring) => polygonArea(ring) > 0.008)
    .map((ring) => simplify(ring, 0.025).map(([lng, lat]) => [round(lng), round(lat)]));
}

function polygonArea(ring) {
  let area = 0;
  for (let index = 0; index < ring.length - 1; index++) area += ring[index][0] * ring[index + 1][1] - ring[index + 1][0] * ring[index][1];
  return Math.abs(area / 2);
}

function simplify(points, tolerance) {
  if (points.length <= 2) return points;
  const sqTolerance = tolerance * tolerance;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDistance = 0;
    let split = 0;
    for (let index = first + 1; index < last; index++) {
      const distance = segmentDistanceSquared(points[index], points[first], points[last]);
      if (distance > maxDistance) {
        maxDistance = distance;
        split = index;
      }
    }
    if (maxDistance > sqTolerance) {
      keep[split] = 1;
      stack.push([first, split], [split, last]);
    }
  }
  return points.filter((_, index) => keep[index]);
}

function segmentDistanceSquared([x, y], [ax, ay], [bx, by]) {
  let dx = bx - ax;
  let dy = by - ay;
  if (dx || dy) {
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
    ax += dx * t;
    ay += dy * t;
  }
  dx = x - ax;
  dy = y - ay;
  return dx * dx + dy * dy;
}
