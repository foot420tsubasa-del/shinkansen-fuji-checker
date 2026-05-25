#!/usr/bin/env node
/*
 * scripts/update-tokyo-stay-area-signals.mjs
 *
 * Public-source fetcher for the Tokyo Stay Area Index passenger / accessibility
 * signals. Two implemented sources this pass:
 *
 *   1. Toei Subway per-station passenger volume (CSV, CKAN open-data)
 *      Dataset:  catalog.data.metro.tokyo.lg.jp  ›  t000018d0000000030
 *      License:  CC-BY-4.0 (Tokyo Metropolitan Bureau of Transportation)
 *      Period:   FY2023 (Apr 2023 – Mar 2024)
 *      We fetch the four per-line CSV resources (Asakusa / Mita / Shinjuku /
 *      Oedo). Each has  駅名 / 一日平均乗車人員 / 一日平均降車人員  rows
 *      encoded in Shift-JIS (CP932). We sum 乗車 + 降車 per station and let
 *      the per-area aggregator add transfer-station contributions.
 *
 *   2. Tokyo Metro per-station passenger ranking (HTML, official corporate page)
 *      URL:      tokyometro.jp/.../transportation/passengers/index.html (PLURAL)
 *      Period:   detected from the table summary, typically "YYYY年度一日平均"
 *      We parse the `<table summary="駅別乗降人員順位表（…）">` table and
 *      extract  順位 / 路線 / 駅名 / 人員 / 前年比.  The count column is
 *      already boarding+alighting (一日平均乗降人員), so we use it as-is.
 *
 * Other sources (Toei barrier-free CSV catalog, Tokyo Metro barrier-free pages,
 * ODPT station info, police crime, GSI hazard, lodging facilities) are marked
 * skipped per spec — registered for future passes.
 *
 * Robustness:
 *   - Any source-level fetch or parse failure marks that source `failed` and
 *     keeps the previous JSON's signals for that area.
 *   - If a source requires credentials (ODPT) and the env var is absent, the
 *     source is `skipped`, not `failed`.
 *   - The build never breaks: an exception in any fetcher is caught locally.
 *
 * Output:
 *   data/generated/tokyo-stay-area-signals.json
 *   data/generated/tokyo-stay-area-source-status.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const FETCH_TIMEOUT_MS = 20_000;
const USER_AGENT =
  "fujiseat-stay-area-index/1.0 (+local-research; contact via fujiseat.com)";

// Toei open-data resource URLs (stable per CKAN catalog t000018d0000000030).
const TOEI_CSV_URLS = {
  asakusa: "https://www.opendata.metro.tokyo.lg.jp/kotsu/subway_passengers_asakusa.csv",
  mita: "https://www.opendata.metro.tokyo.lg.jp/kotsu/subway_passengers_mita.csv",
  shinjuku: "https://www.opendata.metro.tokyo.lg.jp/kotsu/subway_passengers_shinjyuku.csv",
  oedo: "https://www.opendata.metro.tokyo.lg.jp/kotsu/subway_passengers_oedo.csv",
};
const TOEI_LANDING = "https://www.kotsu.metro.tokyo.jp/subway/kanren/passengers.html";

const TOKYO_METRO_PASSENGER_URL =
  "https://www.tokyometro.jp/corporate/enterprise/passenger_rail/transportation/passengers/index.html";

// ---------- helpers ---------------------------------------------------------

function readJsonIfExists(p) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; }
}
function writeJson(p, value) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`);
}

async function fetchBuffer(url, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": USER_AGENT, accept: "text/csv,text/html,*/*" },
      signal: controller.signal,
      redirect: "follow",
    });
    const buf = Buffer.from(await res.arrayBuffer());
    return { ok: res.ok, status: res.status, buf };
  } finally {
    clearTimeout(timer);
  }
}

// ---------- station-name normalization (mirror of lib/stay-area/normalizers.ts)

const NORMALIZE_PAIRS = [
  { canonical: "oshiage",                aliases: ["Oshiage", "押上", "押上(スカイツリー前)", "押上〈スカイツリー前〉", "Tokyo Skytree", "とうきょうスカイツリー"] },
  { canonical: "tokyo",                  aliases: ["Tokyo", "Tokyo Station", "東京", "東京駅"] },
  { canonical: "marunouchi",             aliases: ["Marunouchi", "丸の内", "丸ノ内"] },
  { canonical: "yaesu",                  aliases: ["Yaesu", "八重洲"] },
  { canonical: "otemachi",               aliases: ["Otemachi", "大手町"] },
  { canonical: "nijubashimae",           aliases: ["Nijubashimae", "二重橋前"] },
  { canonical: "shinjuku",               aliases: ["Shinjuku", "新宿", "新宿駅", "新宿西口"] },
  { canonical: "shinjuku-sanchome",      aliases: ["Shinjuku-sanchome", "新宿三丁目"] },
  { canonical: "shibuya",                aliases: ["Shibuya", "渋谷", "渋谷駅"] },
  { canonical: "ginza",                  aliases: ["Ginza", "銀座", "銀座駅"] },
  { canonical: "yurakucho",              aliases: ["Yurakucho", "有楽町"] },
  { canonical: "hibiya",                 aliases: ["Hibiya", "日比谷"] },
  { canonical: "higashi-ginza",          aliases: ["Higashi-ginza", "東銀座"] },
  { canonical: "ueno",                   aliases: ["Ueno", "上野", "Keisei Ueno", "京成上野"] },
  { canonical: "ueno-okachimachi",       aliases: ["Ueno-okachimachi", "上野御徒町"] },
  { canonical: "asakusa",                aliases: ["Asakusa", "浅草"] },
  { canonical: "kuramae",                aliases: ["Kuramae", "蔵前"] },
  { canonical: "tawaramachi",            aliases: ["Tawaramachi", "田原町"] },
  { canonical: "ryogoku",                aliases: ["Ryogoku", "両国"] },
  { canonical: "kiyosumi-shirakawa",     aliases: ["Kiyosumi-shirakawa", "清澄白河"] },
  { canonical: "monzen-nakacho",         aliases: ["Monzen-nakacho", "門前仲町"] },
  { canonical: "ningyocho",              aliases: ["Ningyocho", "人形町"] },
  { canonical: "suitengumae",            aliases: ["Suitengumae", "水天宮前"] },
  { canonical: "nihombashi",             aliases: ["Nihombashi", "Nihonbashi", "日本橋"] },
  { canonical: "mitsukoshimae",          aliases: ["Mitsukoshimae", "三越前"] },
  { canonical: "hatchobori",             aliases: ["Hatchobori", "八丁堀"] },
  { canonical: "kayabacho",              aliases: ["Kayabacho", "茅場町"] },
  { canonical: "kyobashi",               aliases: ["Kyobashi", "京橋"] },
  { canonical: "shimbashi",              aliases: ["Shimbashi", "Shinbashi", "新橋"] },
  { canonical: "hamamatsucho",           aliases: ["Hamamatsucho", "浜松町"] },
  { canonical: "daimon",                 aliases: ["Daimon", "大門"] },
  { canonical: "mita",                   aliases: ["Mita", "三田"] },
  { canonical: "shinagawa",              aliases: ["Shinagawa", "品川"] },
  { canonical: "gotanda",                aliases: ["Gotanda", "五反田"] },
  { canonical: "meguro",                 aliases: ["Meguro", "目黒"] },
  { canonical: "ebisu",                  aliases: ["Ebisu", "恵比寿"] },
  { canonical: "yoyogi",                 aliases: ["Yoyogi", "代々木"] },
  { canonical: "ikebukuro",              aliases: ["Ikebukuro", "池袋"] },
  { canonical: "akihabara",              aliases: ["Akihabara", "秋葉原"] },
  { canonical: "suehirocho",             aliases: ["Suehirocho", "末広町"] },
  { canonical: "kanda",                  aliases: ["Kanda", "神田"] },
  { canonical: "jimbocho",               aliases: ["Jimbocho", "神保町"] },
  { canonical: "asakusabashi",           aliases: ["Asakusabashi", "浅草橋"] },
  { canonical: "higashi-nihombashi",     aliases: ["Higashi-Nihombashi", "東日本橋"] },
  { canonical: "bakurocho",              aliases: ["Bakurocho", "馬喰町"] },
  { canonical: "bakuro-yokoyama",        aliases: ["Bakuro-yokoyama", "馬喰横山"] },
  { canonical: "kinshicho",              aliases: ["Kinshicho", "錦糸町"] },
  { canonical: "kuramae",                aliases: ["Kuramae", "蔵前"] },
  { canonical: "akasaka",                aliases: ["Akasaka", "赤坂"] },
  { canonical: "akasaka-mitsuke",        aliases: ["Akasaka-mitsuke", "赤坂見附"] },
  { canonical: "roppongi",               aliases: ["Roppongi", "六本木"] },
  { canonical: "omotesando",             aliases: ["Omotesando", "表参道"] },
  { canonical: "aoyama-itchome",         aliases: ["Aoyama-itchome", "青山一丁目"] },
  { canonical: "gaiemmae",               aliases: ["Gaiemmae", "外苑前"] },
  { canonical: "ochanomizu",             aliases: ["Ochanomizu", "御茶ノ水", "お茶の水"] },
  { canonical: "shin-ochanomizu",        aliases: ["Shin-ochanomizu", "新御茶ノ水"] },
  { canonical: "iidabashi",              aliases: ["Iidabashi", "飯田橋"] },
  { canonical: "kasuga",                 aliases: ["Kasuga", "春日"] },
  { canonical: "korakuen",               aliases: ["Korakuen", "後楽園"] },
  { canonical: "toyosu",                 aliases: ["Toyosu", "豊洲"] },
  { canonical: "ariake",                 aliases: ["Ariake", "有明"] },
  { canonical: "odaiba",                 aliases: ["Odaiba", "Daiba", "お台場", "台場"] },
  { canonical: "tokyo-skytree",          aliases: ["Tokyo Skytree", "とうきょうスカイツリー"] },
  { canonical: "tokyo-big-sight",        aliases: ["Tokyo Big Sight", "東京ビッグサイト"] },
];

const ALIAS_TO_CANONICAL = (() => {
  const m = new Map();
  for (const { canonical, aliases } of NORMALIZE_PAIRS) {
    m.set(canonical, canonical);
    for (const alias of aliases) {
      m.set(stripStationDecorations(alias).toLowerCase(), canonical);
    }
  }
  return m;
})();

function stripStationDecorations(raw) {
  if (!raw) return "";
  return String(raw)
    .replace(/[（(〈［\[][^\)）〉］\]]*[)）〉］\]]/g, "")
    .replace(/駅\s*$/u, "")
    .replace(/^都営|^メトロ|^京成|^東武|^西武|^京王|^小田急|^JR\s*/iu, "")
    .trim();
}

function normalizeStationName(raw) {
  if (!raw) return null;
  const stripped = stripStationDecorations(raw);
  return (
    ALIAS_TO_CANONICAL.get(stripped) ||
    ALIAS_TO_CANONICAL.get(stripped.toLowerCase()) ||
    ALIAS_TO_CANONICAL.get(stripped.toLowerCase().replace(/[\s_]/g, "-")) ||
    null
  );
}

function areaCanonicalKeys(stationNames) {
  const out = new Set();
  for (const s of stationNames || []) {
    const k = normalizeStationName(s);
    if (k) out.add(k);
  }
  return Array.from(out);
}

// ---------- HTML helpers ---------------------------------------------------

function stripTags(s) {
  return String(s)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTableByPattern(html, pattern) {
  const re = /<table[^>]*summary="([^"]*)"[^>]*>([\s\S]*?)<\/table>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (pattern.test(m[1])) return { summary: m[1], inner: m[2] };
  }
  return null;
}

function extractRowsFromTable(tableInner) {
  const out = [];
  const trRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  const cellRe = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/g;
  let m;
  while ((m = trRe.exec(tableInner)) !== null) {
    const cells = [];
    let c;
    while ((c = cellRe.exec(m[1])) !== null) cells.push(stripTags(c[1]));
    if (cells.length) out.push(cells);
  }
  return out;
}

function detectAdYearFromText(text) {
  const ad = String(text).match(/(20\d\d)\s*年(?:度)?/);
  if (ad) return ad[1];
  const reiwa = String(text).match(/令和\s*(\d+)\s*年/);
  if (reiwa) return String(2018 + Number(reiwa[1]));
  return null;
}

// ---------- Toei (CSV via CKAN open-data) ----------------------------------

async function fetchToeiLineCsv(slug, url) {
  const { ok, status, buf } = await fetchBuffer(url);
  if (!ok) throw new Error(`Toei ${slug} HTTP ${status}`);
  // CSVs are CP932 / Shift-JIS encoded.
  const text = new TextDecoder("shift_jis").decode(buf);
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length < 2) throw new Error(`Toei ${slug} returned empty CSV`);
  const records = [];
  // Row 0 is header, the trailing row is 計N駅,..., - skip both.
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim());
    const station = cells[0];
    if (!station || /^計\d+駅$/u.test(station) || station === "計") continue;
    const boarding = Number((cells[1] || "").replace(/[^\d]/g, ""));
    const alighting = Number((cells[2] || "").replace(/[^\d]/g, ""));
    if (!boarding && !alighting) continue;
    records.push({ rawStation: station, value: boarding + alighting });
  }
  return records;
}

async function fetchToei() {
  const fetchedAt = new Date().toISOString();
  const lineSummary = {};
  const stationCounts = {};
  let totalRecords = 0;
  let firstError = null;

  for (const [slug, url] of Object.entries(TOEI_CSV_URLS)) {
    try {
      const recs = await fetchToeiLineCsv(slug, url);
      lineSummary[slug] = recs.length;
      totalRecords += recs.length;
      for (const r of recs) {
        const key = normalizeStationName(r.rawStation);
        if (!key) continue;
        // Sum across lines (a station served by two Toei lines naturally
        // gets a higher 'crowd' signal — that matches reality).
        stationCounts[key] = (stationCounts[key] || 0) + r.value;
      }
    } catch (err) {
      if (!firstError) firstError = err;
      lineSummary[slug] = `error: ${err?.message || String(err)}`;
    }
  }

  const matched = Object.keys(stationCounts).length;
  if (totalRecords === 0) {
    return {
      sourceId: "toei-passengers",
      label: "Toei Subway passenger volume",
      status: "failed",
      fetchedAt,
      records: 0,
      message:
        firstError?.message
          ? `Toei CSV fetch error: ${firstError.message}`
          : "Toei CSV fetch returned 0 records.",
      stationCounts: {},
    };
  }

  return {
    sourceId: "toei-passengers",
    label: "Toei Subway passenger volume",
    status: matched > 0 ? "success" : "partial",
    fetchedAt,
    sourcePeriod: "FY2023 (Apr 2023 – Mar 2024)",
    records: totalRecords,
    message: `Parsed ${totalRecords} station rows (${matched} canonical matches) from Toei CKAN CSVs: ${JSON.stringify(lineSummary)}.`,
    stationCounts,
  };
}

// ---------- Tokyo Metro (HTML table on the corporate page) -----------------

async function fetchTokyoMetro() {
  const fetchedAt = new Date().toISOString();
  try {
    const { ok, status, buf } = await fetchBuffer(TOKYO_METRO_PASSENGER_URL);
    if (!ok) {
      return {
        sourceId: "tokyo-metro-passengers",
        label: "Tokyo Metro passenger ranking",
        status: "failed",
        fetchedAt,
        records: 0,
        message: `Tokyo Metro page HTTP ${status}.`,
        stationCounts: {},
      };
    }
    const html = buf.toString("utf8");
    const table = extractTableByPattern(html, /駅別乗降人員順位表/);
    if (!table) {
      // HTML layout shifted. Skip rather than fail when ODPT_CONSUMER_KEY is
      // absent, because the documented credentialed source (ODPT) is the
      // fallback path. With a key set, mark failed so the user investigates.
      if (!process.env.ODPT_CONSUMER_KEY) {
        return {
          sourceId: "tokyo-metro-passengers",
          label: "Tokyo Metro passenger ranking",
          status: "skipped",
          fetchedAt,
          message:
            "Tokyo Metro HTML ranking table not found; ODPT_CONSUMER_KEY not set, so skipping cleanly. Set ODPT_CONSUMER_KEY to enable an ODPT-credentialed fallback in a later pass.",
          stationCounts: {},
        };
      }
      return {
        sourceId: "tokyo-metro-passengers",
        label: "Tokyo Metro passenger ranking",
        status: "failed",
        fetchedAt,
        message:
          "Tokyo Metro HTML ranking table not found; ODPT_CONSUMER_KEY is set but no ODPT fetcher is implemented in this pass.",
        stationCounts: {},
      };
    }
    const rows = extractRowsFromTable(table.inner);
    const sourcePeriod = detectAdYearFromText(table.summary);
    const stationCounts = {};
    let parsed = 0;
    for (const row of rows) {
      // Expected: [rank, line, station, passengerCount, yoy].
      if (row.length < 4) continue;
      const rank = Number(String(row[0]).replace(/[^\d]/g, ""));
      if (!Number.isFinite(rank) || rank <= 0) continue;
      const station = row[2];
      const count = Number(String(row[3]).replace(/[^\d]/g, ""));
      if (!station || !count) continue;
      const key = normalizeStationName(station);
      if (!key) continue;
      // Tokyo Metro's 人員 column is already boarding+alighting per day.
      stationCounts[key] = Math.max(stationCounts[key] || 0, count);
      parsed += 1;
    }
    if (parsed === 0) {
      return {
        sourceId: "tokyo-metro-passengers",
        label: "Tokyo Metro passenger ranking",
        status: "failed",
        fetchedAt,
        records: 0,
        message: "Tokyo Metro table found but 0 station rows parsed (layout may have changed).",
        stationCounts: {},
      };
    }
    return {
      sourceId: "tokyo-metro-passengers",
      label: "Tokyo Metro passenger ranking",
      status: "success",
      fetchedAt,
      sourcePeriod: sourcePeriod ? `FY${sourcePeriod}` : "FY2024",
      records: parsed,
      message: `Parsed ${parsed} station rows from Tokyo Metro 駅別乗降人員順位表.`,
      stationCounts,
    };
  } catch (err) {
    return {
      sourceId: "tokyo-metro-passengers",
      label: "Tokyo Metro passenger ranking",
      status: "failed",
      fetchedAt,
      records: 0,
      message: `Tokyo Metro fetch error: ${err?.message || String(err)}`,
      stationCounts: {},
    };
  }
}

// ---------- Optional / registered-only sources -----------------------------

function skippedSource(sourceId, label, message) {
  return {
    sourceId,
    label,
    status: "skipped",
    fetchedAt: new Date().toISOString(),
    message,
    stationCounts: {},
  };
}

function odptSource() {
  return process.env.ODPT_CONSUMER_KEY
    ? skippedSource(
        "odpt-station-information",
        "ODPT station information",
        "ODPT_CONSUMER_KEY is set but ODPT fetcher is not implemented in this pass.",
      )
    : skippedSource(
        "odpt-station-information",
        "ODPT station information",
        "ODPT_CONSUMER_KEY not set; skipping gracefully.",
      );
}

// ---------- main -----------------------------------------------------------

async function main() {
  const areasBase = JSON.parse(
    fs.readFileSync(path.join(repoRoot, "data/stay-area/tokyo-areas.base.json"), "utf8"),
  );
  const previousSignalsPath = path.join(repoRoot, "data/generated/tokyo-stay-area-signals.json");
  const previousSignals = readJsonIfExists(previousSignalsPath);

  console.log(`[stay-area:update-signals] Loading ${areasBase.length} editorial areas.`);
  console.log(`[stay-area:update-signals] Toei landing reference: ${TOEI_LANDING}`);

  const [toei, tokyoMetro] = await Promise.all([fetchToei(), fetchTokyoMetro()]);

  // Accessibility & optional sources stay skipped this pass.
  const toeiBarrierFree = skippedSource(
    "toei-barrier-free",
    "Toei Subway accessibility / barrier-free CSV",
    "CSV catalog discovery not stable from a script in this pass.",
  );
  const tokyoMetroBarrierFree = skippedSource(
    "tokyo-metro-barrier-free",
    "Tokyo Metro accessibility / barrier-free pages",
    "Conservative source status only — per-station details not parsed in this pass.",
  );
  const odpt = odptSource();
  const policeCrime = skippedSource(
    "tokyo-police-crime",
    "Tokyo Metropolitan Police town-level crime statistics",
    "Not displayed as a safety claim; skipped in this pass.",
  );
  const hazard = skippedSource(
    "gsi-hazard-portal",
    "Hazard Map Portal (MLIT / GSI)",
    "Heavy GIS — catalogued only, no UI rendering this pass.",
  );
  const lodging = skippedSource(
    "tokyo-lodging-facilities",
    "Tokyo lodging business facility datasets",
    "Catalogued only; ward-level CSV URLs change frequently.",
  );

  const sources = [
    tokyoMetro,
    toei,
    toeiBarrierFree,
    tokyoMetroBarrierFree,
    odpt,
    policeCrime,
    hazard,
    lodging,
  ];

  // ----- bucket passenger counts into per-area aggregates --------------------
  const combinedCounts = new Map();
  for (const [key, value] of Object.entries(tokyoMetro.stationCounts || {})) {
    combinedCounts.set(key, (combinedCounts.get(key) || 0) + value);
  }
  for (const [key, value] of Object.entries(toei.stationCounts || {})) {
    combinedCounts.set(key, (combinedCounts.get(key) || 0) + value);
  }

  const areaPassenger = new Map();
  for (const area of areasBase) {
    const keys = areaCanonicalKeys(area.stationNames);
    const matched = [];
    const operatorSources = new Set();
    let total = 0;
    for (const k of keys) {
      const v = combinedCounts.get(k);
      if (v > 0) {
        total += v;
        matched.push(k);
        if (tokyoMetro.stationCounts?.[k]) operatorSources.add("tokyo-metro");
        if (toei.stationCounts?.[k]) operatorSources.add("toei");
      }
    }
    areaPassenger.set(area.id, {
      matchedStations: matched,
      value: total > 0 ? total : null,
      operatorSources: Array.from(operatorSources),
    });
  }

  // Compute crowd percentile across areas with a non-null value.
  const passengerValues = Array.from(areaPassenger.values())
    .map((x) => x.value)
    .filter((v) => v != null && v > 0)
    .sort((a, b) => a - b);

  function percentileOf(value) {
    if (value == null || passengerValues.length === 0) return null;
    const idx = passengerValues.findIndex((v) => v >= value);
    if (idx < 0) return 1;
    return Number((idx / passengerValues.length).toFixed(2));
  }

  // ----- per-area signal records -------------------------------------------
  const tokyoMetroOk = tokyoMetro.status === "success" || tokyoMetro.status === "partial";
  const toeiOk = toei.status === "success" || toei.status === "partial";
  const anyPassengerOk = tokyoMetroOk || toeiOk;
  const bothPassengerOk = tokyoMetroOk && toeiOk;

  const areas = {};
  for (const area of areasBase) {
    const pData = areaPassenger.get(area.id);
    const hasMatch = pData?.value != null && pData.value > 0;
    const percentile = hasMatch ? percentileOf(pData.value) : null;

    // Bucketed crowd contribution — mirrors lib/stay-area/scoring.ts
    // `passengerContribution()`. Stored here for visibility in signals.json;
    // scoring layer re-derives the same value from crowdPercentile.
    const scoreContribution = (() => {
      if (percentile == null) return null;
      if (percentile >= 0.9) return -6;
      if (percentile >= 0.75) return -4;
      if (percentile >= 0.5) return -2;
      if (percentile >= 0.25) return -1;
      return 0;
    })();

    let passengerStatus;
    if (hasMatch) {
      passengerStatus = bothPassengerOk ? "success" : "partial";
    } else if (anyPassengerOk) {
      passengerStatus = "partial";
    } else if (tokyoMetro.status === "skipped" && toei.status === "skipped") {
      passengerStatus = "skipped";
    } else {
      passengerStatus = "failed";
    }

    const previousArea = previousSignals?.areas?.[area.id];
    const safetySignal = previousArea?.safetySignal ?? { status: "skipped", message: "Optional source not fetched in this pass." };
    const floodNoteSignal = previousArea?.floodNoteSignal ?? { status: "skipped", message: "Optional source not fetched in this pass." };
    const lodgingDensitySignal = previousArea?.lodgingDensitySignal ?? { status: "skipped", message: "Optional source not fetched in this pass." };

    const accessibilitySignal = {
      status: "skipped",
      rawFacilityCount: null,
      elevatorOrStepFreeSignal: null,
      operatorSources: [],
      scoreContribution: null,
      message: "Accessibility CSV parsing skipped in this pass; conservative source status only.",
    };

    let sourceFreshness;
    if (bothPassengerOk && hasMatch) {
      sourceFreshness = { level: "public-data-local", label: "Public sources checked locally" };
    } else if (anyPassengerOk && hasMatch) {
      sourceFreshness = { level: "partial-public-data", label: "Public data: partially matched" };
    } else if (anyPassengerOk) {
      sourceFreshness = { level: "partial-public-data", label: "Public data: partially matched" };
    } else {
      sourceFreshness = { level: "fallback", label: "Editorial fallback (public sources unavailable)" };
    }

    areas[area.id] = {
      matchedStations: pData?.matchedStations ?? [],
      passengerSignal: {
        status: passengerStatus,
        value: hasMatch ? pData.value : null,
        operatorSources: pData?.operatorSources ?? [],
        matchedStations: pData?.matchedStations ?? [],
        crowdPercentile: percentile,
        scoreContribution,
        sourcePeriod: toei.sourcePeriod || tokyoMetro.sourcePeriod || undefined,
      },
      accessibilitySignal,
      safetySignal,
      floodNoteSignal,
      lodgingDensitySignal,
      sourceFreshness,
    };
  }

  // ----- compose the file shape ---------------------------------------------
  const generatedAt = new Date().toISOString();
  const publicSources = sources.map((src) => {
    const copy = { ...src };
    delete copy.stationCounts;
    return copy;
  });

  const signalsFile = {
    generatedAt,
    mode: "public-data-local",
    sources: publicSources,
    areas,
  };

  const sourceStatusFile = { generatedAt, sources: publicSources };

  writeJson(path.join(repoRoot, "data/generated/tokyo-stay-area-signals.json"), signalsFile);
  writeJson(path.join(repoRoot, "data/generated/tokyo-stay-area-source-status.json"), sourceStatusFile);

  const summary = sources.map((s) => `  ${s.sourceId.padEnd(28)} ${s.status.padEnd(8)} ${s.records ? `(${s.records} records)` : ""}`);
  console.log("[stay-area:update-signals] Source summary:");
  console.log(summary.join("\n"));
  console.log(
    `[stay-area:update-signals] Areas matched with passenger data: ${
      Array.from(areaPassenger.values()).filter((v) => v.value != null).length
    } / ${areasBase.length}`,
  );
  console.log(`[stay-area:update-signals] Wrote signals + source-status JSON at ${generatedAt}.`);
}

main().catch((err) => {
  console.error("[stay-area:update-signals] Unrecoverable error:", err);
  process.exit(1);
});
