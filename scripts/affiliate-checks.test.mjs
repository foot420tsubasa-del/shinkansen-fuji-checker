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
import { execSync } from "node:child_process";
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

test("the guide's quick-answer booking slot stays withdrawn", () => {
  // This asserted the slot was Klook-only and carried no Omio link. The slot
  // itself was withdrawn on 2026-11-06 for taking 1,214 impressions at 0.41%,
  // so the Omio half is moot here — Omio still appears elsewhere in the guide
  // source, rendering nothing under KLOOK_ONLY, and the test above keeps it
  // styled as a text link if it ever comes back.
  assert.ok(!guideSrc.includes("<GuideKlookCta"), "the quick-answer slot stays withdrawn");
});

test("required guide placements exist", () => {
  for (const placement of [
    // guide_quick_answer was here until 2026-11-06; the slot it named is gone,
    // and "pre-interaction booking CTAs stay withdrawn" now guards its absence.
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

test("seat-check copy: the shared module matches the guide's own strings", () => {
  // The guide still reads these from its inline per-locale UI object; the module
  // was lifted from it verbatim so the other booking pages could carry the
  // checker. A translation fixed in one place must not diverge in the other.
  const guide = readFileSync("app/[locale]/guide/page.tsx", "utf8");
  const shared = readFileSync("lib/copy/seat-check.ts", "utf8");
  const PAIRS = [
    ["seatCheckEyebrow", "eyebrow"],
    ["seatCheckQuestion", "question"],
    ["seatCheckResult", "result"],
    ["seatCheckGreenCar", "greenCar"],
    ["seatCheckBook", "book"],
    ["seatCheckJrPassLink", "jrPassLink"],
  ];
  for (const [guideKey, sharedKey] of PAIRS) {
    const inGuide = [...guide.matchAll(new RegExp(`${guideKey}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g"))].map((m) => m[1]);
    const inShared = [...shared.matchAll(new RegExp(`^    ${sharedKey}: "((?:[^"\\\\]|\\\\.)*)",$`, "gm"))].map((m) => m[1]);
    assert.ok(inGuide.length >= 9, `${guideKey}: expected 9 locales in the guide, found ${inGuide.length}`);
    assert.equal(inShared.length, 9, `${sharedKey}: expected 9 locales in the module, found ${inShared.length}`);
    for (const value of inShared) {
      assert.ok(
        inGuide.includes(value),
        `${sharedKey} has a string the guide does not: ${JSON.stringify(value)}`,
      );
    }
  }
});

test("return leg: the link that booked nothing is not served", () => {
  // October: Kyoto->Tokyo took 22 clicks and booked none, Tokyo->Kyoto booked 3
  // of 20. Resolving the return leg to its own route link sent readers to the
  // one slot on the site with no revenue at all; null hands them the generic
  // ticket link, which did convert.
  const src = readFileSync("src/affiliateLinks.ts", "utf8");
  const body = src.match(/export function getDirectionTicketLink\(([\s\S]*?)\n\}/)?.[1] ?? "";
  assert.ok(body, "getDirectionTicketLink must exist");
  assert.ok(
    !body.includes("shinkansenKyotoTokyo"),
    "the return leg must not resolve to shinkansenKyotoTokyo again without new data",
  );
  assert.ok(body.includes("shinkansenTokyoKyoto"), "the outbound leg must still resolve");
});

test("pre-interaction booking CTAs stay withdrawn", () => {
  // Over 10/01-11/05 these six slots took 1,839 impressions for 8 clicks
  // (0.43%) while the result-moment CTAs took 1,131 for 35 (3.09%). They were
  // removed on 2026-11-06; re-adding one needs a reason recorded first.
  const WITHDRAWN = [
    ["app/[locale]/guide/page.tsx", "guide_quick_answer"],
    ["app/[locale]/shinkansen-seat-letters/page.tsx", "seat_letters_booking"],
    ["app/[locale]/shinkansen-seat-guides/page.tsx", "seat_guides_booking"],
    ["app/[locale]/kyoto-to-tokyo-mt-fuji-seat/page.tsx", "direction_kyoto_tokyo_booking"],
    ["app/[locale]/tokyo-to-kyoto-mt-fuji-seat/page.tsx", "direction_tokyo_kyoto_booking"],
    ["app/[locale]/osaka-to-tokyo-mt-fuji-seat/page.tsx", "direction_osaka_tokyo_booking"],
  ];
  for (const [file, placement] of WITHDRAWN) {
    const src = readFileSync(file, "utf8");
    assert.ok(
      !src.includes(`placement="${placement}"`) && !src.includes(`placement: "${placement}"`),
      `${file} mounts the withdrawn ${placement} again`,
    );
  }
});

test("the surviving direction pages carry the seat checker instead", () => {
  // Removing a dead CTA must not leave the page with no path to a booking: the
  // checker replaces it, so the page gains a 3.80% result moment.
  // shinkansen-seat-guides was in this list until it was folded on 2026-11-06;
  // its route still exists but 301s, so asserting on it would prove nothing.
  for (const file of [
    "app/[locale]/kyoto-to-tokyo-mt-fuji-seat/page.tsx",
    "app/[locale]/tokyo-to-kyoto-mt-fuji-seat/page.tsx",
    "app/[locale]/osaka-to-tokyo-mt-fuji-seat/page.tsx",
  ]) {
    const src = readFileSync(file, "utf8");
    assert.ok(src.includes("<GuideSeatCheck"), `${file} must mount the seat checker`);
    assert.ok(src.includes("seatCheckCopy(locale)"), `${file} must use the shared copy`);
  }
});

test("forecast tour: shown on every verdict, and counted on every verdict", () => {
  // Gated on a clouded-in run it drew 42 impressions against 210 checks in 34
  // days with no clicks — too rare to tell a bad offer from a starved one.
  const src = readFileSync("components/travel/FujiWindowForecast.tsx", "utf8");
  assert.ok(
    !src.includes('result.level === "low" && tourHref'),
    "the tour must not be gated on the cloudy verdict again",
  );
  // The impression and the click must carry the same label, or the rate is not
  // divisible by verdict.
  const labels = [...src.matchAll(/label: `fuji_window_tour:\$\{result\.level\}`/g)];
  assert.equal(labels.length, 2, "both the impression and the click must label the verdict");
  assert.ok(src.includes("copy.clearAlt"), "a non-cloudy verdict needs its own wording");
});

test("return-leg tour: offered only on the return leg, and labelled there", () => {
  const src = readFileSync("components/travel/GuideSeatCheck.tsx", "utf8");
  assert.ok(
    src.includes('direction === "osaka-tokyo" ? getAffUrl("fujiDayTourTokyo") : null'),
    "the tour must be scoped to the return leg, where the ticket booked nothing",
  );
  // The impression is fired from `next`, not from state that has not landed.
  assert.ok(
    src.includes('next === "osaka-tokyo" && getAffUrl("fujiDayTourTokyo")'),
    "the impression must read the chosen direction, not the stale state",
  );
  assert.ok(src.includes('placement: "seat_result_return_tour"'), "needs its own placement");
});

test("adsense: ads.txt declares the publisher and nothing else", () => {
  // Without it AdSense reports the site as unauthorised inventory.
  const txt = readFileSync("public/ads.txt", "utf8").trim();
  const lines = txt.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  assert.equal(lines.length, 1, "one seller line is all this site needs");
  const [domain, pub, rel, tagId] = lines[0].split(",").map((s) => s.trim());
  assert.equal(domain, "google.com");
  assert.equal(pub, "pub-5844175658360101", "must match the meta tag in app/layout.tsx");
  assert.equal(rel, "DIRECT");
  assert.equal(tagId, "f08c47fec0942fa0", "Google's own TAG id");
});

test("adsense: the publisher id is the same in ads.txt and in the code", () => {
  // The meta tag now reads the same constant the script tag does, so only two
  // places state the id: lib/ads.ts and public/ads.txt. A mismatch between
  // them fails verification silently.
  const code = readFileSync("lib/ads.ts", "utf8").match(/ADSENSE_CLIENT_ID = "ca-(pub-\d+)"/)?.[1];
  const ads = readFileSync("public/ads.txt", "utf8").match(/(pub-\d+)/)?.[1];
  assert.ok(code, "lib/ads.ts must declare the publisher id");
  assert.equal(ads, code, "ads.txt and lib/ads.ts disagree on the publisher id");
  const layout = readFileSync("app/layout.tsx", "utf8");
  assert.ok(layout.includes("ADSENSE_CLIENT_ID"), "the meta tag must use the same constant");
});

test("adsense: the tag is loaded once, site-wide, not from the ad unit", () => {
  // Loading it from AdSlot left it absent from every page without an ad unit —
  // including /guide, 69% of traffic — where the consent message needs it.
  const slot = readFileSync("components/ads/AdSlot.tsx", "utf8");
  assert.ok(!slot.includes("adsbygoogle.js"), "AdSlot must not load the tag itself");
  const layout = readFileSync("app/[locale]/layout.tsx", "utf8");
  assert.ok(layout.includes("<AdsenseScript />"), "the locale layout must load it");
  const script = readFileSync("components/ads/AdsenseScript.tsx", "utf8");
  assert.ok(script.includes("isAdsenseEnabled"), "it must stay behind the flag");
  // The flag itself lives in code, not in the Vercel console: two deploys
  // meant to turn it on shipped without it and nothing in the repo said why.
  const ads = readFileSync("lib/ads.ts", "utf8");
  // Matches the usage, not the comment that records why it was removed.
  assert.ok(
    !/process\.env\.NEXT_PUBLIC_ADSENSE_ENABLED/.test(ads),
    "the on/off switch must not go back to an environment variable",
  );
  assert.ok(/const ADSENSE_ENABLED = (true|false);/.test(ads), "it must be a readable constant");
});

test("adsense: no ad unit sits on a retired page", () => {
  // AdSense policy applies wherever the code appears, not only where Google
  // indexes it. Carrying ads on a page judged not worth indexing risks the
  // account for no upside — this is how the luggage guide was caught.
  const retiredSrc = readFileSync("lib/retired-routes.ts", "utf8");
  const retired = [...retiredSrc.matchAll(/^  "([^"]+)",$/gm)].map((m) => m[1]);
  const withAds = execSync(
    "grep -rl '<AdSlot' 'app' || true",
    { encoding: "utf8" },
  ).trim().split("\n").filter(Boolean);
  for (const file of withAds) {
    // app/[locale]/some/path/page.tsx -> /some/path
    const route = "/" + file.replace(/^app\/\[locale\]\//, "").replace(/\/page\.tsx$/, "");
    assert.ok(
      !retired.includes(route),
      `${route} is retired but still carries an ad unit (${file})`,
    );
  }
});

test("adsense: the privacy policy discloses advertising", () => {
  // Required before serving ads, and separately required of a CMP's disclosures.
  const src = readFileSync("app/[locale]/privacy/page.tsx", "utf8");
  assert.ok(/title: "Advertising"/.test(src), "there must be an Advertising section");
  assert.ok(/AdSense/.test(src), "it must name the ad network");
  assert.ok(/EEA/.test(src) && /consent/i.test(src), "it must describe the consent message");
});

test("adsense: the middleware lets /ads.txt through", () => {
  // next-intl's matcher swallowed it at first and /ads.txt answered 404 while
  // the file sat correctly in public/ — AdSense would have read the site as
  // unauthorised inventory with nothing in the repo looking wrong.
  const matcher = readFileSync("proxy.ts", "utf8").match(/matcher: \[([\s\S]*?)\]/)?.[1] ?? "";
  for (const file of ["robots\\\\.txt", "sitemap\\\\.xml", "ads\\\\.txt"]) {
    assert.ok(
      matcher.includes(file),
      `${file.replace(/\\\\/g, "")} must be excluded from the locale middleware`,
    );
  }
});
