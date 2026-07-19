#!/usr/bin/env node
/**
 * Hotel-funnel insight report for fujiseat.com.
 *
 * Pulls GA4 (Data API) + Google Search Console (Search Analytics API) for the
 * last N days, focuses on the HOTEL funnel (traffic → affiliate_click, the
 * Tokyo hotel-area finder steps, and hotel-intent search queries), and writes a
 * prioritized, human-readable `分析/hotel-funnel-<date>.md` plus updates
 * `分析/hotel-funnel-latest.md`.
 *
 * It is read-only against Google and never prints credentials.
 *
 * ── One-time setup ────────────────────────────────────────────────────────
 *   1. GCP project → enable "Google Analytics Data API" + "Search Console API".
 *   2. Create a service account, download its JSON key.
 *   3. In GA4 (property 534386847) → Admin → Property Access Management,
 *      add the service-account email as "Viewer".
 *   4. In Search Console (fujiseat.com) → Settings → Users and permissions,
 *      add the service-account email as a user (Restricted is enough).
 *   5. Export the env vars below (e.g. in a local .env you do NOT commit):
 *        GOOGLE_APPLICATION_CREDENTIALS=/abs/path/service-account.json
 *        GA4_PROPERTY_ID=534386847
 *        GSC_SITE_URL=sc-domain:fujiseat.com   (or https://fujiseat.com/)
 *   6. Run:  node scripts/hotel-funnel-report.mjs [days]   (default 28)
 *
 * The output is intentionally just data + heuristic suggestions. For a deeper
 * read, paste the generated markdown into Claude and ask for next steps.
 */
import fs from "node:fs";
import path from "node:path";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { GoogleAuth } from "google-auth-library";

const DAYS = Number(process.argv[2] || 28);
const PROPERTY = process.env.GA4_PROPERTY_ID;
const SITE = process.env.GSC_SITE_URL;

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Missing GOOGLE_APPLICATION_CREDENTIALS (path to the service-account JSON key). See the header of this file for setup.");
  process.exit(1);
}
if (!PROPERTY) {
  console.error("Missing GA4_PROPERTY_ID (e.g. 534386847).");
  process.exit(1);
}

const isHotelPath = (p) =>
  /hotel|areas-to-stay|stay|where-to-stay|ryokan/i.test(p || "");
const isHotelQuery = (q) =>
  /hotel|ホテル|stay|ryokan|旅館|宿|where to stay|accommodation|booking/i.test(q || "");
const pct = (num, den) => (den > 0 ? (100 * num) / den : 0);
const fmtPct = (x) => `${x.toFixed(1)}%`;

// ── GA4 ──────────────────────────────────────────────────────────────────────
const analytics = new BetaAnalyticsDataClient();
const dateRanges = [{ startDate: `${DAYS}daysAgo`, endDate: "today" }];

async function ga4PagesWithAffiliate() {
  // Per page: views + affiliate_click count (eventName/pagePath are standard
  // dimensions, so this works without any custom dimensions registered).
  const [views] = await analytics.runReport({
    property: `properties/${PROPERTY}`,
    dateRanges,
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "sessions" }],
    limit: 1000,
  });
  const [evt] = await analytics.runReport({
    property: `properties/${PROPERTY}`,
    dateRanges,
    dimensions: [{ name: "pagePath" }, { name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    dimensionFilter: {
      filter: {
        fieldName: "eventName",
        inListFilter: { values: ["affiliate_click", "cta_click", "internal_link_click"] },
      },
    },
    limit: 5000,
  });

  const pages = new Map();
  for (const r of views.rows || []) {
    const p = r.dimensionValues[0].value;
    pages.set(p, {
      path: p,
      views: Number(r.metricValues[0].value),
      sessions: Number(r.metricValues[1].value),
      affiliate_click: 0,
      cta_click: 0,
      internal_link_click: 0,
    });
  }
  for (const r of evt.rows || []) {
    const p = r.dimensionValues[0].value;
    const name = r.dimensionValues[1].value;
    const c = Number(r.metricValues[0].value);
    const row = pages.get(p) || {
      path: p, views: 0, sessions: 0, affiliate_click: 0, cta_click: 0, internal_link_click: 0,
    };
    row[name] = (row[name] || 0) + c;
    pages.set(p, row);
  }
  return [...pages.values()];
}

async function ga4EventTotals() {
  const [res] = await analytics.runReport({
    property: `properties/${PROPERTY}`,
    dateRanges,
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }],
    limit: 500,
  });
  const m = {};
  for (const r of res.rows || []) m[r.dimensionValues[0].value] = Number(r.metricValues[0].value);
  return m;
}

async function ga4PlacementBreakdown() {
  // Best-effort: requires a registered custom dimension `placement`.
  try {
    const [res] = await analytics.runReport({
      property: `properties/${PROPERTY}`,
      dateRanges,
      dimensions: [{ name: "customEvent:placement" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: { fieldName: "eventName", stringFilter: { value: "affiliate_click" } },
      },
      limit: 200,
    });
    return (res.rows || []).map((r) => ({
      placement: r.dimensionValues[0].value,
      clicks: Number(r.metricValues[0].value),
    })).filter((r) => r.placement && r.placement !== "(not set)");
  } catch (e) {
    return { error: e.message };
  }
}

// ── GSC ──────────────────────────────────────────────────────────────────────
async function gscQueries() {
  if (!SITE) return { skipped: "GSC_SITE_URL not set" };
  const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
  const client = await auth.getClient();
  const token = (await client.getAccessToken()).token;
  const end = new Date();
  const start = new Date(end.getTime() - DAYS * 86400000);
  const iso = (d) => d.toISOString().slice(0, 10);
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
  const body = {
    startDate: iso(start), endDate: iso(end),
    dimensions: ["query"], rowLimit: 500,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return { error: `${res.status} ${await res.text()}` };
  const json = await res.json();
  return (json.rows || []).map((r) => ({
    query: r.keys[0], clicks: r.clicks, impressions: r.impressions,
    ctr: r.ctr * 100, position: r.position,
  }));
}

// ── Report ────────────────────────────────────────────────────────────────────
function buildMarkdown({ pages, events, placements, queries }) {
  const L = [];
  const today = new Date().toISOString().slice(0, 10);
  L.push(`# Hotel funnel report — fujiseat.com`);
  L.push(`\n_Last ${DAYS} days · generated ${today}_\n`);

  // Hotel pages: traffic vs affiliate CTR
  const hotelPages = pages.filter((p) => isHotelPath(p.path) && p.views >= 20)
    .sort((a, b) => b.views - a.views);
  const ctrs = hotelPages.filter((p) => p.views > 0).map((p) => pct(p.affiliate_click, p.views));
  const medianCtr = ctrs.length ? ctrs.sort((a, b) => a - b)[Math.floor(ctrs.length / 2)] : 0;

  L.push(`## 1. Hotel pages — views vs affiliate clicks`);
  L.push(`Median affiliate-click rate across hotel pages: **${fmtPct(medianCtr)}**\n`);
  L.push(`| Page | Views | Affiliate clicks | Click rate | Flag |`);
  L.push(`|---|--:|--:|--:|---|`);
  for (const p of hotelPages.slice(0, 25)) {
    const ctr = pct(p.affiliate_click, p.views);
    const flag = p.views >= 50 && ctr < medianCtr * 0.6 ? "⚠️ high traffic, low CTR" : "";
    L.push(`| ${p.path} | ${p.views} | ${p.affiliate_click} | ${fmtPct(ctr)} | ${flag} |`);
  }

  // Finder funnel
  L.push(`\n## 2. Tokyo hotel-area finder funnel`);
  const f = (k) => events[k] || 0;
  const steps = [
    ["finder_start", f("finder_start")],
    ["finder_step_answered", f("finder_step_answered")],
    ["finder_results_view", f("finder_results_view")],
    ["finder_area_details_click", f("finder_area_details_click")],
    ["finder_result_hotel_page", f("finder_result_hotel_page")],
  ];
  L.push(`| Step | Count | vs start |`);
  L.push(`|---|--:|--:|`);
  const startN = steps[0][1];
  for (const [name, n] of steps) L.push(`| ${name} | ${n} | ${startN ? fmtPct(pct(n, startN)) : "—"} |`);

  // Affiliate by placement
  L.push(`\n## 3. Affiliate clicks by placement`);
  if (Array.isArray(placements)) {
    placements.sort((a, b) => b.clicks - a.clicks);
    L.push(`| Placement | Clicks |`);
    L.push(`|---|--:|`);
    for (const r of placements.slice(0, 20)) L.push(`| ${r.placement} | ${r.clicks} |`);
    if (!placements.length) L.push(`_No placement data (0 affiliate clicks in range)._`);
  } else {
    L.push(`_Placement breakdown needs a registered custom dimension \`placement\` in GA4 (Admin → Custom definitions). ${placements?.error ? "Error: " + placements.error : ""}_`);
  }

  // GSC quick wins
  L.push(`\n## 4. Search Console — hotel-intent quick wins`);
  if (Array.isArray(queries)) {
    const wins = queries
      .filter((q) => isHotelQuery(q.query) && q.impressions >= 30 && q.position >= 5 && q.position <= 20)
      .sort((a, b) => b.impressions - a.impressions);
    L.push(`Hotel-intent queries ranking 5–20 with real impressions (push these onto page 1):\n`);
    L.push(`| Query | Impressions | Clicks | CTR | Avg position |`);
    L.push(`|---|--:|--:|--:|--:|`);
    for (const q of wins.slice(0, 25)) {
      L.push(`| ${q.query} | ${q.impressions} | ${q.clicks} | ${fmtPct(q.ctr)} | ${q.position.toFixed(1)} |`);
    }
    if (!wins.length) L.push(`_No hotel-intent queries in the 5–20 band this period._`);
  } else {
    L.push(`_GSC skipped: ${queries?.skipped || queries?.error || "no data"}._`);
  }

  // Heuristic next steps
  L.push(`\n## 5. Suggested next steps (heuristic)`);
  const recs = [];
  const worst = hotelPages.filter((p) => p.views >= 50).map((p) => ({ ...p, ctr: pct(p.affiliate_click, p.views) }))
    .sort((a, b) => a.ctr - b.ctr)[0];
  if (worst) recs.push(`**CTA:** \`${worst.path}\` gets ${worst.views} views but only ${fmtPct(worst.ctr)} affiliate-click rate — add/raise a clearer hotel CTA (sticky bar, in-content provider button) and re-check.`);
  if (startN && pct(f("finder_results_view"), startN) < 60) recs.push(`**Finder drop-off:** only ${fmtPct(pct(f("finder_results_view"), startN))} of finder starts reach results — shorten the steps or clarify progress.`);
  if (startN && f("finder_results_view") && pct(f("finder_area_details_click"), f("finder_results_view")) < 40) recs.push(`**Finder → hotel:** few results lead to an area/hotel click — make result cards more clickable and surface a hotel CTA right on the results.`);
  if (Array.isArray(queries)) {
    const topWin = queries.filter((q) => isHotelQuery(q.query) && q.impressions >= 50 && q.position >= 6 && q.position <= 20)
      .sort((a, b) => b.impressions - a.impressions)[0];
    if (topWin) recs.push(`**SEO:** "${topWin.query}" ranks #${topWin.position.toFixed(0)} with ${topWin.impressions} impressions — strengthen the matching hotel page (title/H1, internal links, fresher content) to climb to page 1.`);
  }
  if (!recs.length) recs.push(`Not enough data this period to flag a clear action — widen the window: \`node scripts/hotel-funnel-report.mjs 90\`.`);
  recs.forEach((r, i) => L.push(`${i + 1}. ${r}`));

  L.push(`\n---\n_Read-only snapshot. For a deeper read, paste this file into Claude and ask for prioritized funnel fixes._`);
  return L.join("\n") + "\n";
}

async function main() {
  console.log(`Pulling GA4 + GSC for the last ${DAYS} days…`);
  const [pages, events, placements, queries] = await Promise.all([
    ga4PagesWithAffiliate(),
    ga4EventTotals(),
    ga4PlacementBreakdown(),
    gscQueries(),
  ]);
  const md = buildMarkdown({ pages, events, placements, queries });
  const dir = "分析";
  fs.mkdirSync(dir, { recursive: true });
  const dated = path.join(dir, `hotel-funnel-${new Date().toISOString().slice(0, 10)}.md`);
  fs.writeFileSync(dated, md);
  fs.writeFileSync(path.join(dir, "hotel-funnel-latest.md"), md);
  console.log(`Wrote ${dated} and 分析/hotel-funnel-latest.md`);
}

main().catch((e) => {
  console.error("Report failed:", e.message);
  process.exit(1);
});
