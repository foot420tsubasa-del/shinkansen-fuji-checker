#!/usr/bin/env node
/**
 * Write each view's in-sight points into data/scenic-routes.json:
 *
 *   node scripts/scenic-seen.mjs
 *
 * For every live timetable route, `views[].seenKm` lists the track km (along
 * data/routes/<id>.json) where the terrain model has that view on its side,
 * out of tunnels — the same test the timeline uses. Route search (lib/scenic.ts)
 * reads it to answer only trips that actually pass a view, without loading
 * the viewshed files. Rerun after compute-viewshed.mjs; the test suite checks
 * the two agree.
 */
import { readFileSync, writeFileSync } from "node:fs";

// One point every 200 m is plenty to tell whether a trip passes a view, and
// keeps the catalogue (bundled into the homepage) small on finely sampled lines.
// The first and last in-sight points are always kept. The test uses the same rule.
export const SEEN_STEP_KM = 0.2;
export function thin(kms) {
  const kept = [];
  for (const km of kms) if (!kept.length || km - kept[kept.length - 1] >= SEEN_STEP_KM - 1e-9) kept.push(km);
  if (kms.length && kept[kept.length - 1] !== kms[kms.length - 1]) kept.push(kms[kms.length - 1]);
  return kept;
}

const file = "data/scenic-routes.json";
if (import.meta.url === `file://${process.argv[1]}`) main();

function main() {
const catalogue = JSON.parse(readFileSync(file, "utf8"));
for (const route of catalogue.routes) {
  if (route.status !== "live" || route.timing?.kind !== "timetable" || !route.viewshed) continue;
  const points = JSON.parse(readFileSync(route.viewshed, "utf8")).points;
  for (const view of route.views ?? []) {
    view.seenKm = points
      .filter((p) => !p.tunnel && p.km >= view.kmFrom && p.km <= view.kmTo && view.targets.some((t) => p.see[t]?.side === view.side.forward))
      .map((p) => p.km);
    view.seenKm = thin(view.seenKm);
    console.log(`${route.id}/${view.id}: ${view.seenKm.length} points in sight`);
  }
}
writeFileSync(file, JSON.stringify(catalogue, null, 2) + "\n");
}
