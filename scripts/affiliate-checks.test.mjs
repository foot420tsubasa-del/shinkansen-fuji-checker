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
  assert.ok(redirectSrc.includes('FALLBACK_PATH = "/areas-to-stay/tokyo-stay-area-index"'));
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
