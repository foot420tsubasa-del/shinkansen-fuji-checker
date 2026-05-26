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
 *   3. Toei Subway barrier-free CSVs (Phase 3)
 *      Dataset:  catalog.data.metro.tokyo.lg.jp  ›  t000018d0000000028
 *      One row per station with column `1ルート確保（エレベーター等）`.
 *      `○` means at least one step-free route to the platform is confirmed.
 *
 *   4. Tokyo Metro station exit list (Phase 4)
 *      URL:      tokyometro.jp/station/exit.json
 *      One JSON record per station × exit_no × elevator × close. We count
 *      records with `close === "0"` as open exits and bucket the total
 *      (<=4 Simple, 5–8 Moderate, 9–14 Complex, 15+ Mega station).
 *
 * Toei does not publish a comparable per-station exit feed at this time —
 * the Toei station detail URLs return 404 from a script, so the
 * `toei-station-exits` source is registered-only.
 *
 * Other sources (Tokyo Metro barrier-free per-station pages, ODPT station
 * info, police crime, GSI hazard, lodging facilities) are marked skipped
 * per spec — registered for future passes.
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
// Toei barrier-free per-station CSVs (stable per CKAN catalog t000018d0000000028).
const TOEI_BARRIER_FREE_CSV_URLS = {
  asakusa: "https://www.opendata.metro.tokyo.lg.jp/kotsu/subway_barrierfree_asakusa.csv",
  mita: "https://www.opendata.metro.tokyo.lg.jp/kotsu/subway_barrierfree_mita.csv",
  shinjuku: "https://www.opendata.metro.tokyo.lg.jp/kotsu/subway_barrierfree_shinjyuku.csv",
  oedo: "https://www.opendata.metro.tokyo.lg.jp/kotsu/subway_barrierfree_oedo.csv",
};
const TOEI_LANDING = "https://www.kotsu.metro.tokyo.jp/subway/kanren/passengers.html";

const TOKYO_METRO_PASSENGER_URL =
  "https://www.tokyometro.jp/corporate/enterprise/passenger_rail/transportation/passengers/index.html";

// Tokyo Metro publishes a single JSON feed used by their station pages to
// render exit lists. One record per (station_base_name, exit_no, elevator,
// close, usage_limit, facilities). We count records with close === "0".
const TOKYO_METRO_EXITS_URL = "https://www.tokyometro.jp/station/exit.json";

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
  { canonical: "omotesando",             aliases: ["Omotesando", "表参道", "omote-sando"] },
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

// ---------- Toei barrier-free (CSV via CKAN open-data) --------------------

async function fetchToeiBarrierFreeLineCsv(slug, url) {
  const { ok, status, buf } = await fetchBuffer(url);
  if (!ok) throw new Error(`Toei barrier-free ${slug} HTTP ${status}`);
  const text = new TextDecoder("shift_jis").decode(buf);
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length);
  if (lines.length < 2) throw new Error(`Toei barrier-free ${slug} returned empty CSV`);

  // Schema (per row): 駅名, エスカレーター(地上↔改札), エレベーター(地上↔改札),
  //   エスカレーター(改札↔ホーム), エレベーター(改札↔ホーム),
  //   バリアフリートイレ, ホーム形式, 1ルート確保（エレベーター等）, 駅タイプ, 連絡先
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim());
    let station = cells[0];
    if (!station || /^計\d+駅$/u.test(station) || station === "計") continue;
    // Strip line-code prefix like "（A-01）", "（I-05）", "（S-12）", "（E-37）"
    station = station.replace(/^[（(][A-Z]-?\d+[)）]/u, "").trim();
    if (!station) continue;
    const oneRouteSecured = (cells[7] || "").trim();
    // "○" (with optional follow-up like "（※階段昇降機を含む）") counts as confirmed.
    const hasRoute = oneRouteSecured.startsWith("○");
    records.push({ rawStation: station, hasRoute });
  }
  return records;
}

async function fetchToeiBarrierFree() {
  const fetchedAt = new Date().toISOString();
  const lineSummary = {};
  const stationStepFree = {};
  let totalRecords = 0;
  let firstError = null;

  for (const [slug, url] of Object.entries(TOEI_BARRIER_FREE_CSV_URLS)) {
    try {
      const recs = await fetchToeiBarrierFreeLineCsv(slug, url);
      lineSummary[slug] = recs.length;
      totalRecords += recs.length;
      for (const r of recs) {
        const key = normalizeStationName(r.rawStation);
        if (!key) continue;
        const prior = stationStepFree[key] || { hasRoute: false, sources: new Set() };
        prior.hasRoute = prior.hasRoute || r.hasRoute;
        prior.sources.add(slug);
        stationStepFree[key] = prior;
      }
    } catch (err) {
      if (!firstError) firstError = err;
      lineSummary[slug] = `error: ${err?.message || String(err)}`;
    }
  }

  // Serializable shape.
  const stations = {};
  for (const [k, v] of Object.entries(stationStepFree)) {
    stations[k] = { hasRoute: v.hasRoute, sources: Array.from(v.sources) };
  }

  if (totalRecords === 0) {
    return {
      sourceId: "toei-barrier-free",
      label: "Toei Subway accessibility / barrier-free CSV",
      status: "failed",
      fetchedAt,
      records: 0,
      message: firstError
        ? `Toei barrier-free CSV fetch error: ${firstError.message}`
        : "Toei barrier-free CSV fetch returned 0 records.",
      stationStepFree: {},
    };
  }
  return {
    sourceId: "toei-barrier-free",
    label: "Toei Subway accessibility / barrier-free CSV",
    status: "success",
    fetchedAt,
    sourcePeriod: "Tokyo Open Data (CKAN t000018d0000000028, refreshed irregularly)",
    records: totalRecords,
    message: `Parsed ${totalRecords} station rows from Toei barrier-free CKAN CSVs: ${JSON.stringify(lineSummary)}.`,
    stationStepFree: stations,
  };
}

// ---------- Tokyo Metro per-station exits (JSON feed) --------------------

/**
 * Patterns we recognise as legitimate exit labels. The Tokyo Metro feed
 * already gives us a clean `exit_no` field — we accept records whose label
 * matches one of these shapes after trimming.
 *
 *   A1, B1a, C10, M14         → /^[A-Z]\d+[a-z]?$/
 *   1, 2, 5a, 5b              → /^\d{1,3}[a-z]?$/
 *   出口1, 出口2               → /^出口\d+$/
 *   1番出口, 12番出口          → /^\d{1,3}番出口$/
 *   正面口, 西口, 中央口        → /^(正面|中央|東|西|南|北|改札)口$/
 *   連絡通路直結                → exact string
 *   エレベーター専用出入口      → exact string
 */
const EXIT_LABEL_PATTERNS = [
  /^[A-Z]\d{1,3}[a-z]?$/,
  /^\d{1,3}[a-z]?$/,
  /^出口\d+$/u,
  /^\d{1,3}番出口$/u,
  /^(?:正面|中央|東|西|南|北|改札)口$/u,
];
const EXIT_LABEL_EXACT = new Set([
  "連絡通路直結",
  "エレベーター専用出入口",
]);

function isRecognisedExitLabel(label) {
  if (!label) return false;
  if (EXIT_LABEL_EXACT.has(label)) return true;
  return EXIT_LABEL_PATTERNS.some((re) => re.test(label));
}

function exitLevelFromCount(count) {
  if (count <= 4) return "Simple";
  if (count <= 8) return "Moderate";
  if (count <= 14) return "Complex";
  return "Mega station";
}

async function fetchTokyoMetroStationExits() {
  const fetchedAt = new Date().toISOString();
  try {
    const { ok, status, buf } = await fetchBuffer(TOKYO_METRO_EXITS_URL);
    if (!ok) {
      return {
        sourceId: "tokyo-metro-station-exits",
        label: "Tokyo Metro per-station exit list",
        status: "failed",
        fetchedAt,
        records: 0,
        message: `Tokyo Metro exit.json HTTP ${status}.`,
        stationExits: {},
      };
    }
    const text = buf.toString("utf8");
    // The feed is JSON but is loaded as text with surrounding whitespace and
    // sometimes a leading BOM; trim before parsing.
    const json = JSON.parse(text.replace(/^﻿/, "").trim());
    if (!Array.isArray(json)) {
      return {
        sourceId: "tokyo-metro-station-exits",
        label: "Tokyo Metro per-station exit list",
        status: "failed",
        fetchedAt,
        records: 0,
        message: "Tokyo Metro exit.json did not return an array.",
        stationExits: {},
      };
    }

    // Aggregate per station: count open exits with non-empty exit_no, and
    // collect a deduplicated list of recognisable labels.
    const byStation = new Map();
    let totalRows = 0;
    for (const r of json) {
      totalRows += 1;
      const slug = String(r?.station_base_name || "").trim();
      const exitNo = String(r?.exit_no || "").trim();
      if (!slug || !exitNo) continue;
      if (String(r?.close || "0") !== "0") continue;

      const canonical = normalizeStationName(slug);
      if (!canonical) continue;

      const prior =
        byStation.get(canonical) ?? {
          exitCount: 0,
          elevatorCount: 0,
          labels: new Set(),
          tmSlugs: new Set(),
        };
      prior.exitCount += 1;
      if (String(r?.elevator || "0") === "1") prior.elevatorCount += 1;
      if (isRecognisedExitLabel(exitNo)) prior.labels.add(exitNo);
      prior.tmSlugs.add(slug);
      byStation.set(canonical, prior);
    }

    const stationExits = {};
    for (const [canonical, v] of byStation) {
      stationExits[canonical] = {
        exitCount: v.exitCount,
        elevatorCount: v.elevatorCount,
        labels: Array.from(v.labels).sort(),
        tmSlugs: Array.from(v.tmSlugs),
      };
    }

    if (Object.keys(stationExits).length === 0) {
      return {
        sourceId: "tokyo-metro-station-exits",
        label: "Tokyo Metro per-station exit list",
        status: "failed",
        fetchedAt,
        records: 0,
        message: `Tokyo Metro exit.json parsed ${totalRows} rows but matched 0 canonical stations.`,
        stationExits: {},
      };
    }

    return {
      sourceId: "tokyo-metro-station-exits",
      label: "Tokyo Metro per-station exit list",
      status: "success",
      fetchedAt,
      sourcePeriod: "Tokyo Metro live exit feed (refreshed irregularly per station revision_date)",
      records: totalRows,
      message: `Parsed ${totalRows} exit records across ${Object.keys(stationExits).length} canonical stations from tokyometro.jp/station/exit.json.`,
      stationExits,
    };
  } catch (err) {
    return {
      sourceId: "tokyo-metro-station-exits",
      label: "Tokyo Metro per-station exit list",
      status: "failed",
      fetchedAt,
      records: 0,
      message: `Tokyo Metro exit fetch error: ${err?.message || String(err)}`,
      stationExits: {},
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

// ---------- curated line/operator complexity ------------------------------

const OPERATOR_PATTERNS = [
  { name: "JR", patterns: [/^JR\b/i, /\bShinkansen\b/i, /\bNarita Express\b/i] },
  { name: "Tokyo Metro", patterns: [/^Tokyo Metro\b/i, /\bGinza Line\b/i, /\bMarunouchi Line\b/i, /\bHibiya Line\b/i, /\bTozai Line\b/i, /\bChiyoda Line\b/i, /\bYurakucho Line\b/i, /\bHanzomon Line\b/i, /\bNamboku Line\b/i, /\bFukutoshin Line\b/i] },
  { name: "Toei", patterns: [/^Toei\b/i, /\bAsakusa Line\b/i, /\bOedo Line\b/i, /\bMita Line\b/i, /\bShinjuku Line\b/i] },
  { name: "Keisei", patterns: [/^Keisei\b/i, /\bSkyliner\b/i] },
  { name: "Keikyu", patterns: [/^Keikyu\b/i] },
  { name: "Tobu", patterns: [/^Tobu\b/i] },
  { name: "Tokyu", patterns: [/^Tokyu\b/i] },
  { name: "Seibu", patterns: [/^Seibu\b/i] },
  { name: "Keio", patterns: [/^Keio\b/i] },
  { name: "Odakyu", patterns: [/^Odakyu\b/i] },
  { name: "Yurikamome", patterns: [/^Yurikamome\b/i] },
  { name: "Rinkai", patterns: [/^Rinkai\b/i] },
  { name: "Tokyo Monorail", patterns: [/^Tokyo Monorail\b/i] },
  { name: "Tsukuba Express", patterns: [/^Tsukuba Express\b/i] },
];

function inferOperatorFromLine(line) {
  const trimmed = String(line || "").trim();
  return OPERATOR_PATTERNS.find((entry) => entry.patterns.some((pattern) => pattern.test(trimmed)))?.name ?? "Other";
}

function deriveTerminalType(area, lineCount, operatorCount) {
  if ((area.complexityTags || []).includes("mega-terminal")) return "mega-terminal";
  if (area.transferHubLevel === "High" || area.transferHubLevel === "Very High") return "terminal";
  if (lineCount >= 3 || operatorCount >= 2) return "interchange";
  return "local-station";
}

function deriveRailNetworkType(operatorGroups, terminalType) {
  const operators = new Set(operatorGroups);
  if (terminalType === "mega-terminal") return "multi-operator-hub";
  if (operators.has("Yurikamome") || operators.has("Rinkai")) return "waterfront-rail";
  if (operators.has("Keisei") || operators.has("Keikyu") || operators.has("Tokyo Monorail")) return "airport-rail";
  if (operators.size >= 3) return "multi-operator-hub";
  if (operators.has("JR")) return "jr-heavy";
  if (
    operators.has("Tobu") ||
    operators.has("Tokyu") ||
    operators.has("Seibu") ||
    operators.has("Keio") ||
    operators.has("Odakyu") ||
    operators.has("Tsukuba Express")
  ) {
    return "private-rail";
  }
  return "subway-only";
}

function deriveNetworkComplexitySignal(area) {
  const lineCount = new Set((area.stationLines || []).map((line) => String(line).trim()).filter(Boolean)).size;
  const operatorGroups = Array.from(
    new Set((area.stationLines || []).map(inferOperatorFromLine).filter((op) => op !== "Other")),
  ).sort();
  const operatorCount = operatorGroups.length;
  const terminalType = deriveTerminalType(area, lineCount, operatorCount);
  const railNetworkType = deriveRailNetworkType(operatorGroups, terminalType);
  let scoreContribution = lineCount <= 2 ? 2 : lineCount <= 4 ? 0 : lineCount <= 7 ? -3 : -5;
  if (operatorCount >= 3) scoreContribution -= 2;
  if (terminalType === "mega-terminal") scoreContribution -= 4;
  scoreContribution = Math.max(-7, Math.min(7, scoreContribution));

  return {
    status: "success",
    lineCount,
    operatorCount,
    operatorGroups,
    railNetworkType,
    multiOperatorFlag: operatorCount >= 2,
    terminalType,
    scoreContribution,
    message: `${lineCount} unique line${lineCount === 1 ? "" : "s"} across ${operatorCount} operator group${operatorCount === 1 ? "" : "s"}; classified as ${railNetworkType} / ${terminalType}.`,
  };
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

  const [toei, tokyoMetro, toeiBarrierFree, tokyoMetroExits] = await Promise.all([
    fetchToei(),
    fetchTokyoMetro(),
    fetchToeiBarrierFree(),
    fetchTokyoMetroStationExits(),
  ]);

  // Tokyo Metro barrier-free page is JS-rendered (~263 B from a script
  // request). Skip cleanly with a clear note; revisit if a stable API
  // endpoint is published.
  const tokyoMetroBarrierFree = skippedSource(
    "tokyo-metro-barrier-free",
    "Tokyo Metro accessibility / barrier-free pages",
    "Page is client-rendered from a script request; per-station detail pages not parsed in this pass.",
  );
  const toeiStationExits = skippedSource(
    "toei-station-exits",
    "Toei Subway per-station exit list",
    "Toei station detail URLs return 404 from a script; no comparable feed exists yet. Skipped cleanly.",
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
  const lineOperatorComplexity = {
    sourceId: "line-operator-complexity",
    label: "Line / operator complexity",
    status: "success",
    fetchedAt: new Date().toISOString(),
    records: areasBase.length,
    message: "Active from curated area data: derived from stationLines[], complexity tags, and transfer-hub level.",
  };

  const sources = [
    tokyoMetro,
    toei,
    toeiBarrierFree,
    tokyoMetroExits,
    lineOperatorComplexity,
    toeiStationExits,
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

  // ----- bucket Toei barrier-free coverage per area -------------------------
  const areaStepFree = new Map();
  for (const area of areasBase) {
    const keys = areaCanonicalKeys(area.stationNames);
    const matched = [];
    let routeYes = 0;
    for (const k of keys) {
      const v = toeiBarrierFree.stationStepFree?.[k];
      if (!v) continue;
      matched.push(k);
      if (v.hasRoute) routeYes += 1;
    }
    if (matched.length === 0) {
      areaStepFree.set(area.id, {
        status: toeiBarrierFree.status === "failed" ? "failed" : "skipped",
        matchedStations: [],
        hasStepFreeRoute: null,
        elevatorSignal: "unknown",
        scoreContribution: null,
        sourceIds: [],
        message:
          toeiBarrierFree.status === "failed"
            ? "Toei barrier-free fetch failed; no per-area data this run."
            : "No matching Toei stations for this area (other operators not parsed yet).",
      });
      continue;
    }
    if (routeYes === matched.length) {
      areaStepFree.set(area.id, {
        status: "success",
        matchedStations: matched,
        hasStepFreeRoute: true,
        elevatorSignal: "known",
        scoreContribution: 3,
        sourceIds: ["toei-barrier-free"],
        message: `All ${matched.length} matched Toei station${matched.length === 1 ? "" : "s"} report a confirmed step-free route (1ルート確保).`,
      });
    } else if (routeYes > 0) {
      areaStepFree.set(area.id, {
        status: "partial",
        matchedStations: matched,
        hasStepFreeRoute: true,
        elevatorSignal: "partial",
        scoreContribution: 1,
        sourceIds: ["toei-barrier-free"],
        message: `${routeYes} of ${matched.length} matched Toei stations report a step-free route.`,
      });
    } else {
      areaStepFree.set(area.id, {
        status: "partial",
        matchedStations: matched,
        hasStepFreeRoute: false,
        elevatorSignal: "partial",
        scoreContribution: 0,
        sourceIds: ["toei-barrier-free"],
        message: `Matched ${matched.length} Toei station${matched.length === 1 ? "" : "s"}, none with a confirmed step-free route.`,
      });
    }
  }

  // ----- bucket Tokyo Metro exits per area ---------------------------------
  // We aggregate open-exit counts across matched canonical stations within
  // each area, dedupe label strings, and bucket the total into the editorial
  // ExitComplexityLevel. Toei-only areas (no TM station) fall back to the
  // editorial level — they are marked `skipped` (not penalised).
  const areaExits = new Map();
  for (const area of areasBase) {
    const keys = areaCanonicalKeys(area.stationNames);
    const matched = [];
    const labels = new Set();
    let exitCount = 0;
    const sourceIds = new Set();
    for (const k of keys) {
      const v = tokyoMetroExits.stationExits?.[k];
      if (!v) continue;
      matched.push(k);
      exitCount += v.exitCount || 0;
      for (const l of v.labels || []) labels.add(l);
      sourceIds.add("tokyo-metro-station-exits");
    }
    const coverage = keys.length > 0 ? Number((matched.length / keys.length).toFixed(2)) : 0;

    if (matched.length === 0) {
      areaExits.set(area.id, {
        status: tokyoMetroExits.status === "failed" ? "failed" : "skipped",
        matchedStations: [],
        exitCount: null,
        entranceCount: null,
        detectedExitLabels: [],
        sourceIds: [],
        sourceCoverage: 0,
        scoreContribution: null,
        derivedLevel: null,
        message:
          tokyoMetroExits.status === "failed"
            ? "Tokyo Metro exit feed failed; falling back to editorial exit complexity."
            : "No Tokyo Metro station matched this area; using editorial exit-complexity level.",
      });
      continue;
    }

    const derivedLevel = exitLevelFromCount(exitCount);
    const scoreContribution = (() => {
      switch (derivedLevel) {
        case "Simple": return 4;
        case "Moderate": return 1;
        case "Complex": return -3;
        case "Mega station": return -6;
        default: return 0;
      }
    })();

    const status = matched.length === keys.length ? "success" : "partial";
    areaExits.set(area.id, {
      status,
      matchedStations: matched,
      exitCount,
      entranceCount: exitCount,
      detectedExitLabels: Array.from(labels).sort(),
      sourceIds: Array.from(sourceIds),
      sourceCoverage: coverage,
      scoreContribution,
      derivedLevel,
      message:
        status === "success"
          ? `${exitCount} open exits across ${matched.length} matched Tokyo Metro station${matched.length === 1 ? "" : "s"} (${matched.join(", ")}). Bucketed as ${derivedLevel}.`
          : `${exitCount} open exits across ${matched.length} of ${keys.length} stations matched (Tokyo Metro coverage only). Bucketed as ${derivedLevel}; Toei-side exits not included.`,
    });
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

    const stepFreeSignal = areaStepFree.get(area.id) ?? {
      status: "skipped",
      matchedStations: [],
      hasStepFreeRoute: null,
      elevatorSignal: "unknown",
      scoreContribution: null,
      sourceIds: [],
      message: "No step-free data computed for this area.",
    };
    const stepFreeOk = stepFreeSignal.status === "success" || stepFreeSignal.status === "partial";

    const exitComplexitySignal = areaExits.get(area.id) ?? {
      status: "skipped",
      matchedStations: [],
      exitCount: null,
      entranceCount: null,
      detectedExitLabels: [],
      sourceIds: [],
      sourceCoverage: 0,
      scoreContribution: null,
      derivedLevel: null,
      message: "No exit-complexity data computed for this area.",
    };
    const exitOk =
      exitComplexitySignal.status === "success" || exitComplexitySignal.status === "partial";
    const networkComplexitySignal = deriveNetworkComplexitySignal(area);

    let sourceFreshness;
    if (bothPassengerOk && hasMatch && stepFreeOk && exitOk) {
      sourceFreshness = { level: "public-data-local", label: "Public sources checked locally" };
    } else if (anyPassengerOk && hasMatch) {
      sourceFreshness = { level: "partial-public-data", label: "Public data: partially matched" };
    } else if (anyPassengerOk || stepFreeOk || exitOk) {
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
      stepFreeSignal,
      exitComplexitySignal,
      networkComplexitySignal,
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
    delete copy.stationStepFree;
    delete copy.stationExits;
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
  const stepFreeMatched = Array.from(areaStepFree.values()).filter(
    (v) => v.status === "success" || v.status === "partial",
  ).length;
  console.log(
    `[stay-area:update-signals] Areas matched with passenger data: ${
      Array.from(areaPassenger.values()).filter((v) => v.value != null).length
    } / ${areasBase.length}`,
  );
  console.log(
    `[stay-area:update-signals] Areas matched with step-free data: ${stepFreeMatched} / ${areasBase.length}`,
  );
  const exitMatched = Array.from(areaExits.values()).filter(
    (v) => v.status === "success" || v.status === "partial",
  ).length;
  console.log(
    `[stay-area:update-signals] Areas matched with exit-complexity data: ${exitMatched} / ${areasBase.length}`,
  );
  console.log(`[stay-area:update-signals] Wrote signals + source-status JSON at ${generatedAt}.`);
}

main().catch((err) => {
  console.error("[stay-area:update-signals] Unrecoverable error:", err);
  process.exit(1);
});
