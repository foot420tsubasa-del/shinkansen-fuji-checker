/*
 * Revenue-funnel guardrail tests (spec Phase 10). Run: npm run test:funnel
 *
 * - lib/trip-dates.ts rules (no past dates, checkout > checkin, JST-safe)
 *   are tested by transpiling the actual TS source (no logic duplication).
 * - Guide / redirect rules are asserted at source level: exactly one Omio
 *   link, text-only styling, correct placements, no homepage fallback.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

async function importTsModule(path) {
  const source = readFileSync(path, "utf8");
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
}

// ---------- URL / date generation -------------------------------------------

const tripDates = await importTsModule("lib/trip-dates.ts");

test("default check-in is 30 days ahead and checkout is +1 day", () => {
  const now = new Date("2026-07-14T12:00:00Z");
  const { checkin, checkout } = tripDates.defaultTripDates(now);
  assert.equal(checkin, "2026/08/13");
  assert.equal(checkout, "2026/08/14");
});

test("UTC late-evening never produces a stale JST date", () => {
  // 23:30 UTC on the 14th is already the 15th in JST.
  const now = new Date("2026-07-14T23:30:00Z");
  const { checkin } = tripDates.defaultTripDates(now);
  assert.equal(checkin, "2026/08/14");
});

test("past check-in dates fall back to safe defaults", () => {
  const now = new Date("2026-07-14T12:00:00Z");
  const resolved = tripDates.resolveTripDates("2026/07/01", "2026/07/02", now);
  assert.equal(resolved.checkin, "2026/08/13");
});

test("check-out must be strictly after check-in", () => {
  const now = new Date("2026-07-14T12:00:00Z");
  const resolved = tripDates.resolveTripDates("2026/09/10", "2026/09/10", now);
  assert.equal(resolved.checkin, "2026/08/13");
  const ok = tripDates.resolveTripDates("2026/09/10", "2026/09/11", now);
  assert.equal(ok.checkin, "2026/09/10");
  assert.equal(ok.checkout, "2026/09/11");
});

test("malformed and impossible dates fall back", () => {
  const now = new Date("2026-07-14T12:00:00Z");
  assert.equal(tripDates.resolveTripDates("2026-09-10", "2026-09-11", now).checkin, "2026/08/13");
  assert.equal(tripDates.resolveTripDates("2026/02/31", "2026/03/01", now).checkin, "2026/08/13");
});

// ---------- redirect route ---------------------------------------------------

const redirectSrc = readFileSync("app/api/trip-hotel-redirect/route.ts", "utf8");

test("unknown areas never fall back to the homepage", () => {
  // The point is where an unknown area lands, not which page happens to be
  // the stay entry point: the Stay Finder was folded on 2026-09-29 and the
  // fallback moved to the hub it redirects to.
  const fallback = redirectSrc.match(/FALLBACK_PATH = "([^"]*)"/)?.[1];
  assert.ok(fallback, "the route must declare a fallback path");
  assert.ok(fallback.startsWith("/areas-to-stay"), `fallback must stay inside the stay section, got ${fallback}`);
  assert.notEqual(fallback, "/", "the homepage is not a stay-area fallback");
  assert.ok(!redirectSrc.includes('new URL("/", request.url)'));
});

test("redirect uses the shared JST-safe date resolver, not its own clock math", () => {
  assert.ok(redirectSrc.includes('from "@/lib/trip-dates"'));
  assert.ok(!/new Date\(\)/.test(redirectSrc));
});

// ---------- guide CTA rules --------------------------------------------------

const guideSrc = readFileSync("app/[locale]/guide/page.tsx", "utf8");

test("guide has exactly one Omio link", () => {
  const renders = guideSrc.match(/OMIO_SHINKANSEN_URL \?/g) ?? [];
  assert.equal(renders.length, 1, "expected exactly one conditional Omio render");
});

test("guide Omio is a text link with the multimodal wording, never a button", () => {
  const idx = guideSrc.indexOf('placement="guide_route_comparison_text"');
  assert.ok(idx > -1, "guide_route_comparison_text placement missing");
  const block = guideSrc.slice(idx - 1200, idx + 1200);
  assert.ok(block.includes('product="multimodal_route_comparison"'));
  assert.ok(block.includes("underline"), "Omio must be styled as a text link");
  assert.ok(!/rounded-(xl|2xl|\[12px\]) border.*bg-\[#D94A32\]/.test(block), "Omio must not use button chrome");
  assert.ok(!guideSrc.includes("Still comparing Shinkansen"), "banned Omio wording");
});

test("guide quick answer slot is Klook-only (no Omio in the top component)", () => {
  const start = guideSrc.indexOf("const renderTopBookingCtas");
  const end = guideSrc.indexOf("const renderAfterSeatNextSteps");
  const top = guideSrc.slice(start, end);
  assert.ok(top.includes("GuideKlookCta"));
  assert.ok(!top.includes("OMIO_SHINKANSEN_URL"), "no Omio link in the quick-answer slot");
});

test("required guide placements exist", () => {
  for (const placement of [
    "guide_quick_answer",
    "guide_how_to_book",
    "guide_mobile_sticky_after_checker",
    "guide_jr_pass_section",
    "guide_esim_checklist",
    "guide_route_comparison_text",
  ]) {
    const inGuide = guideSrc.includes(placement);
    const inComponents =
      readFileSync("components/affiliate/GuideKlookCta.tsx", "utf8").includes(placement) ||
      readFileSync("components/affiliate/GuideStickyCta.tsx", "utf8").includes(placement);
    assert.ok(inGuide || inComponents, `missing placement: ${placement}`);
  }
});

test("guide Klook CTAs carry the spec link ids", () => {
  assert.ok(
    readFileSync("components/affiliate/GuideKlookCta.tsx", "utf8").includes("guide_klook_quick_answer"),
  );
  assert.ok(guideSrc.includes("guide_klook_how_to_book"));
  assert.ok(
    readFileSync("components/affiliate/GuideStickyCta.tsx", "utf8").includes("guide_klook_mobile_sticky"),
  );
});

test("direction changes the quick-answer CTA copy", () => {
  const cta = readFileSync("components/affiliate/GuideKlookCta.tsx", "utf8");
  assert.ok(cta.includes("dirToKyoto"));
  assert.ok(cta.includes("dirToTokyo"));
  assert.ok(cta.includes('direction === "tokyo-osaka"'));
});

/* ── Fuji viewing window (lib/fuji-window.ts) ─────────────────────────────
 * Transpiled from the real source, so the timing model and the grading
 * thresholds cannot drift away from what the page shows readers. */

const fw = await importTsModule("lib/fuji-window.ts");

test("fuji window: Tokyo departures reach Fuji 42 minutes out, on the right", () => {
  const r = fw.resolveWindow("tokyo", "2026-10-14", "09:10", null);
  assert.equal(r.fujiTime, "09:52");
  assert.equal(r.fujiDate, "2026-10-14");
  assert.equal(r.side, "right");
});

test("fuji window: eastbound runs put Fuji on the left, later in the trip", () => {
  assert.equal(fw.resolveWindow("kyoto", "2026-10-14", "09:00", null).fujiTime, "10:31");
  assert.equal(fw.resolveWindow("shin-osaka", "2026-10-14", "09:00", null).fujiTime, "10:45");
  assert.equal(fw.resolveWindow("kyoto", "2026-10-14", "09:00", null).side, "left");
});

test("fuji window: a departure that crosses midnight moves to the next day", () => {
  const r = fw.resolveWindow("tokyo", "2026-10-14", "23:40", null);
  assert.equal(r.fujiTime, "00:22");
  assert.equal(r.fujiDate, "2026-10-15", "must read the next day's sky, not the same day's");
});

test("fuji window: grading matches the homepage widget, and rain overrides", () => {
  assert.equal(fw.gradeCloud(30), "high");
  assert.equal(fw.gradeCloud(31), "medium");
  assert.equal(fw.gradeCloud(70), "medium");
  assert.equal(fw.gradeCloud(71), "low");
  // Clear sky but raining at the Fuji stretch is not a sighting.
  assert.equal(fw.gradeHour(10, 0.5), "low");
  assert.equal(fw.gradeHour(10, 0.4), "high");
});

test("fuji window: reads the forecast hour the train actually passes", () => {
  const forecast = {
    time: ["2026-10-14T09:00", "2026-10-14T10:00", "2026-10-14T11:00"],
    cloud: [90, 20, 95],
    precip: [0, 0, 0],
  };
  // 09:30 + 42min = 10:12, which falls in the 10:00 hour.
  const r = fw.resolveWindow("tokyo", "2026-10-14", "09:30", forecast);
  assert.equal(r.fujiTime, "10:12");
  assert.equal(r.cloudPercent, 20);
  assert.equal(r.level, "high");
});

test("fuji window: offers a clearer departure only when one exists", () => {
  const time = [];
  const cloud = [];
  const precip = [];
  for (let h = 0; h < 24; h++) {
    time.push(`2026-10-14T${String(h).padStart(2, "0")}:00`);
    // Only the 10:00 hour is clear.
    cloud.push(h === 10 ? 5 : 95);
    precip.push(0);
  }
  const forecast = { time, cloud, precip };
  const picked = fw.resolveWindow("tokyo", "2026-10-14", "08:00", forecast);
  assert.equal(picked.level, "low");
  const better = fw.findBetterDeparture("tokyo", "2026-10-14", "08:00", forecast, picked.level);
  assert.ok(better, "a clear departure exists and should be offered");
  // The sighting is read at the hour it falls in, so reaching the clear 10:00
  // hour means leaving at 10:00 (10:42) — not 09:00, whose 09:42 is still 09.
  assert.equal(better.time, "10:00");
  assert.equal(better.cloudPercent, 5);

  // When the reader already has a clear run, do not nag them with another.
  assert.equal(fw.findBetterDeparture("tokyo", "2026-10-14", "10:00", forecast, "high"), null);
});

/* ── Retired routes (lib/retired-routes.ts) ───────────────────────────────
 * The list is the only thing standing between a page and the index, so the
 * pages that actually earn must never drift onto it by accident. */

const retired = await importTsModule("lib/retired-routes.ts");
const LOCALES = ["en", "fr", "es", "pt-BR", "ko", "ru", "de", "zh-TW", "zh-CN"];

test("retired routes: the pages carrying the traffic are never retired", () => {
  // Six-month clicks, 2026-04-01 to 09-26. Between them these are 99% of the
  // site; retiring one would take the business off the index.
  for (const path of [
    "/", // 57 clicks
    "/guide", // 1,916
    "/shinkansen-seat-letters", // 469
    "/areas-to-stay/asakusa-vs-ueno", // 103
    "/how-to-read-japanese-train-signs", // 70
    "/areas-to-stay/ueno-vs-shinjuku", // 37
    "/kyoto-to-tokyo-mt-fuji-seat", // 27
  ]) {
    assert.equal(retired.isRetiredPath(path, LOCALES), false, `must stay indexable: ${path}`);
  }
});

test("retired routes: a locale prefix does not hide a retired path", () => {
  assert.equal(retired.isRetiredPath("/itineraries", LOCALES), true);
  for (const locale of ["fr", "ru", "zh-TW", "pt-BR"]) {
    assert.equal(
      retired.isRetiredPath(`/${locale}/itineraries`, LOCALES),
      true,
      `${locale} must be retired too`,
    );
  }
  // A trailing slash is the same page.
  assert.equal(retired.isRetiredPath("/itineraries/", LOCALES), true);
  // A locale root is not the same thing as a retired child.
  assert.equal(retired.isRetiredPath("/fr", LOCALES), false);
});

test("retired routes: the sitemap offers nothing that is retired", () => {
  const src = readFileSync("app/sitemap.ts", "utf8");
  assert.ok(src.includes("RETIRED_PATHS"), "sitemap must consult the retired list");
  const listed = [
    ...(src.match(/const englishOnlyContentPaths = \[([\s\S]*?)\n\];/)?.[1] ?? "").matchAll(/"([^"]*)"/g),
  ].map((m) => m[1]);
  for (const path of listed) {
    if (!retired.isRetiredPath(path || "/", LOCALES)) continue;
    // Retired entries may stay in the source array; the filter removes them.
    assert.ok(src.includes("live(englishOnlyContentPaths)"), "retired paths must be filtered out");
    break;
  }
});

test("retired routes: the areas-to-stay hub stays indexable", () => {
  // It is the entry point to the comparison pages, which are the site's
  // third-biggest source of clicks. A bulk rename once swept it onto the
  // retired list by accident; this is the tripwire for that.
  assert.equal(retired.isRetiredPath("/areas-to-stay", LOCALES), false);
});

test("sitemap offers no URL that redirects away", () => {
  const sitemapSrc = readFileSync("app/sitemap.ts", "utf8");
  // dynamicPaths is generated from lib/content, so a folded slug reaches the
  // sitemap without ever appearing in the literal arrays — that is how eight
  // redirecting URLs got back in once already.
  const dynamicSlugs = [
    ...[...readFileSync("lib/content/stay.ts", "utf8").matchAll(/^\s+slug: "([^"]+)"/gm)].map((m) => `/areas-to-stay/${m[1]}`),
    ...[...readFileSync("lib/content/itineraries.ts", "utf8").matchAll(/^\s+slug: "([^"]+)"/gm)].map((m) => `/itineraries/${m[1]}`),
    ...[...readFileSync("lib/content/transfers.ts", "utf8").matchAll(/^\s+slug: "([^"]+)"/gm)].map((m) => `/airport-transfers/${m[1]}`),
  ];
  const listed = [
    ...(sitemapSrc.match(/const englishOnlyContentPaths = \[([\s\S]*?)\n\];/)?.[1] ?? "").matchAll(/"([^"]*)"/g),
    ...(sitemapSrc.match(/const translatedPaths = \[([\s\S]*?)\n\];/)?.[1] ?? "").matchAll(/"([^"]*)"/g),
  ].map((m) => m[1]);
  const excluded = new Set([
    ...[...readFileSync("lib/retired-routes.ts", "utf8").matchAll(/^  "([^"]+)",$/gm)].map((m) => m[1]),
  ]);
  for (const path of dynamicSlugs) {
    if (excluded.has(path)) continue;
    listed.push(path);
  }
  const redirected = [...readFileSync("next.config.ts", "utf8").matchAll(/source: "(\/[a-z0-9/-]+)"/g)]
    .map((m) => m[1])
    .filter((p) => !p.includes(":locale"));
  for (const path of redirected) {
    assert.ok(!listed.includes(path), `sitemap still offers the redirected ${path}`);
  }
});
