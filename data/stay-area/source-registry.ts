/*
 * Source registry for the Tokyo Stay Area Index public-data layer.
 *
 * Each entry documents an upstream source we either fetch locally
 * (status: "live" — best-effort fetch with fallback to previous JSON),
 * or have catalogued for future work (status: "registered" — included
 * in the registry but not fetched in this pass).
 *
 * `expectedUpdateCadence` is documented so the UI never claims "daily
 * updated" for an annual or irregular source. `requiredEnv` is set when
 * a source requires credentials (e.g. ODPT_CONSUMER_KEY); the fetcher
 * will skip with status="skipped" when the env var is missing.
 */

export type StayAreaSourceCategory =
  | "passenger"
  | "accessibility"
  | "station"
  | "crime"
  | "hazard"
  | "lodging";

export type StayAreaSourceCadence =
  | "daily"
  | "monthly"
  | "annual"
  | "irregular";

export type StayAreaSourceDefinition = {
  id: string;
  label: string;
  category: StayAreaSourceCategory;
  provider: string;
  url?: string;
  expectedUpdateCadence: StayAreaSourceCadence;
  /** Set when an env var must be present for the fetcher to run. */
  requiredEnv?: string[];
  /** Notes on commercial use, attribution, or licensing. */
  commercialUseNote?: string;
  /** "live" = attempted in scripts/update-tokyo-stay-area-signals.mjs.
   *  "registered" = documented but not fetched in this pass. */
  status: "live" | "registered";
  /**
   * Whether this source ever contributes to the area scoring blend. Police
   * and hazard sources stay false even when later activated — they belong to
   * the "context (not scored)" group in the UI.
   */
  usedInScore: boolean;
  note: string;
};

export const tokyoStayAreaSourceRegistry: StayAreaSourceDefinition[] = [
  {
    id: "tokyo-metro-passengers",
    label: "Tokyo Metro passenger ranking",
    category: "passenger",
    provider: "Tokyo Metro Co., Ltd.",
    url: "https://www.tokyometro.jp/corporate/enterprise/passenger_rail/transportation/passenger/index.html",
    expectedUpdateCadence: "annual",
    commercialUseNote:
      "Public passenger ranking page. Attribute to Tokyo Metro. Do not republish full datasets.",
    status: "live",
    usedInScore: true,
    note: "Per-station daily passenger ranking. Best-effort HTML parse.",
  },
  {
    id: "toei-passengers",
    label: "Toei Subway passenger volume",
    category: "passenger",
    provider: "Tokyo Metropolitan Bureau of Transportation",
    url: "https://www.kotsu.metro.tokyo.jp/subway/about/transport.html",
    expectedUpdateCadence: "annual",
    commercialUseNote:
      "Public Toei passenger statistics. Attribute to Tokyo Metropolitan Bureau of Transportation.",
    status: "live",
    usedInScore: true,
    note: "Per-station passenger volume. Best-effort HTML parse.",
  },
  {
    id: "toei-barrier-free",
    label: "Toei Subway accessibility / barrier-free CSV",
    category: "accessibility",
    provider: "Tokyo Metropolitan Bureau of Transportation",
    url: "https://catalog.data.metro.tokyo.lg.jp/dataset?keywords_or=%E3%83%90%E3%83%AA%E3%82%A2%E3%83%95%E3%83%AA%E3%83%BC&organization=t000022",
    expectedUpdateCadence: "irregular",
    commercialUseNote:
      "Tokyo Open Data Catalog. License attached per dataset; check before bulk redistribution.",
    status: "registered",
    usedInScore: true,
    note: "CSV catalog discovery is fragile from a script. Marked skipped this pass; revisit with a stable dataset id.",
  },
  {
    id: "tokyo-metro-station-exits",
    label: "Tokyo Metro per-station exit list",
    category: "station",
    provider: "Tokyo Metro Co., Ltd.",
    url: "https://www.tokyometro.jp/station/exit.json",
    expectedUpdateCadence: "irregular",
    commercialUseNote:
      "Public exit dataset embedded in tokyometro.jp station pages. Attribute to Tokyo Metro.",
    status: "live",
    usedInScore: true,
    note: "JSON feed: one record per station × exit_no × elevator × close. We count records with close === '0' as open exits.",
  },
  {
    id: "toei-station-exits",
    label: "Toei Subway per-station exit list",
    category: "station",
    provider: "Tokyo Metropolitan Bureau of Transportation",
    url: "https://www.kotsu.metro.tokyo.jp/subway/stations/",
    expectedUpdateCadence: "irregular",
    commercialUseNote:
      "Public Toei subway station pages. Attribute to Tokyo Metropolitan Bureau of Transportation.",
    status: "registered",
    usedInScore: true,
    note: "Toei station detail URLs currently return 404 when fetched from a script; revisit when a stable feed is published.",
  },
  {
    id: "tokyo-metro-barrier-free",
    label: "Tokyo Metro accessibility / barrier-free pages",
    category: "accessibility",
    provider: "Tokyo Metro Co., Ltd.",
    url: "https://www.tokyometro.jp/station/barrierfree/",
    expectedUpdateCadence: "irregular",
    commercialUseNote: "Attribute to Tokyo Metro. Per-station detail pages not parsed in this pass.",
    status: "registered",
    usedInScore: true,
    note: "Conservative source status only — exact elevator counts are not claimed in this pass.",
  },
  {
    id: "odpt-station-information",
    label: "ODPT station information",
    category: "station",
    provider: "Open Data Public Transportation Council",
    url: "https://developer.odpt.org/",
    expectedUpdateCadence: "irregular",
    requiredEnv: ["ODPT_CONSUMER_KEY"],
    commercialUseNote:
      "Requires a consumer key. Attribution to ODPT and individual operators required.",
    status: "registered",
    usedInScore: true,
    note: "Skipped automatically when ODPT_CONSUMER_KEY is not set.",
  },
  {
    id: "tokyo-police-crime",
    label: "Tokyo Metropolitan Police town-level crime statistics",
    category: "crime",
    provider: "Tokyo Metropolitan Police Department",
    url: "https://www.keishicho.metro.tokyo.lg.jp/about_mpd/jokyo_tokei/jokyo/ninchikensu.html",
    expectedUpdateCadence: "monthly",
    commercialUseNote:
      "Public reference. Do not present as a 'safety ranking'; do not label areas as safe or dangerous.",
    status: "registered",
    usedInScore: false,
    note: "Not displayed as a safety claim. Skipped in this pass.",
  },
  {
    id: "gsi-hazard-portal",
    label: "Hazard Map Portal (MLIT / GSI)",
    category: "hazard",
    provider: "Ministry of Land, Infrastructure, Transport and Tourism",
    url: "https://disaportal.gsi.go.jp/",
    expectedUpdateCadence: "irregular",
    commercialUseNote: "Public reference. Heavy GIS — out of scope for this pass.",
    status: "registered",
    usedInScore: false,
    note: "Catalogued only; no UI scare-factor rendering.",
  },
  {
    id: "tokyo-lodging-facilities",
    label: "Tokyo lodging business facility datasets",
    category: "lodging",
    provider: "Tokyo Metropolitan Government",
    url: "https://catalog.data.metro.tokyo.lg.jp/dataset?keywords_or=%E6%97%85%E9%A4%A8%E6%A5%AD",
    expectedUpdateCadence: "irregular",
    commercialUseNote:
      "Public dataset. For density signals only — not hotel quality or price.",
    status: "registered",
    usedInScore: false,
    note: "Registered only; not live yet and not used as live hotel inventory. Current lodging-density signal is editorial.",
  },
];
