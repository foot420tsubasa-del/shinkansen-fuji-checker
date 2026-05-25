/*
 * Station-name normalization for the Tokyo Stay Area Index.
 *
 * Public sources (Tokyo Metro, Toei) use varying romanization, with extra
 * kanji decorations (e.g. "押上〈スカイツリー前〉"), and our editorial area
 * data uses canonical English names. This module converts both directions
 * to a normalized key so a fetched record like "押上〈スカイツリー前〉"
 * matches the editorial entry whose `stationNames` contains "Oshiage" or
 * "押上". Used by the .mjs refresh scripts and importable from anywhere.
 *
 * Only the wayfinding canonical name matters for matching — operator
 * brand decorations and parenthetical subtitles are stripped.
 */

const NORMALIZE_PAIRS: Array<{ canonical: string; aliases: string[] }> = [
  { canonical: "oshiage",                aliases: ["Oshiage", "押上", "押上(スカイツリー前)", "押上〈スカイツリー前〉", "押上駅", "Tokyo Skytree", "とうきょうスカイツリー"] },
  { canonical: "tokyo",                  aliases: ["Tokyo", "Tokyo Station", "東京", "東京駅"] },
  { canonical: "marunouchi",             aliases: ["Marunouchi", "丸の内", "丸ノ内"] },
  { canonical: "yaesu",                  aliases: ["Yaesu", "八重洲"] },
  { canonical: "shinjuku",               aliases: ["Shinjuku", "新宿", "新宿駅"] },
  { canonical: "shibuya",                aliases: ["Shibuya", "渋谷", "渋谷駅"] },
  { canonical: "ginza",                  aliases: ["Ginza", "銀座", "銀座駅"] },
  { canonical: "yurakucho",              aliases: ["Yurakucho", "Yūrakuchō", "有楽町"] },
  { canonical: "hibiya",                 aliases: ["Hibiya", "日比谷"] },
  { canonical: "ueno",                   aliases: ["Ueno", "上野", "上野駅", "Keisei Ueno", "京成上野"] },
  { canonical: "asakusa",                aliases: ["Asakusa", "浅草", "浅草駅"] },
  { canonical: "kuramae",                aliases: ["Kuramae", "蔵前"] },
  { canonical: "tawaramachi",            aliases: ["Tawaramachi", "田原町"] },
  { canonical: "ryogoku",                aliases: ["Ryogoku", "Ryōgoku", "両国"] },
  { canonical: "kiyosumi-shirakawa",     aliases: ["Kiyosumi-shirakawa", "Kiyosumi-Shirakawa", "清澄白河"] },
  { canonical: "monzen-nakacho",         aliases: ["Monzen-nakacho", "Monzen-Nakacho", "Monzennakacho", "門前仲町"] },
  { canonical: "ningyocho",              aliases: ["Ningyocho", "Ningyōchō", "人形町"] },
  { canonical: "nihombashi",             aliases: ["Nihombashi", "Nihonbashi", "日本橋"] },
  { canonical: "hatchobori",             aliases: ["Hatchobori", "Hatchōbori", "八丁堀"] },
  { canonical: "kayabacho",              aliases: ["Kayabacho", "Kayabachō", "茅場町"] },
  { canonical: "kyobashi",               aliases: ["Kyobashi", "Kyōbashi", "京橋"] },
  { canonical: "shimbashi",              aliases: ["Shimbashi", "Shinbashi", "新橋"] },
  { canonical: "hamamatsucho",           aliases: ["Hamamatsucho", "Hamamatsuchō", "浜松町"] },
  { canonical: "daimon",                 aliases: ["Daimon", "大門"] },
  { canonical: "shinagawa",              aliases: ["Shinagawa", "品川", "品川駅"] },
  { canonical: "gotanda",                aliases: ["Gotanda", "五反田"] },
  { canonical: "meguro",                 aliases: ["Meguro", "目黒"] },
  { canonical: "ebisu",                  aliases: ["Ebisu", "恵比寿"] },
  { canonical: "yoyogi",                 aliases: ["Yoyogi", "代々木"] },
  { canonical: "ikebukuro",              aliases: ["Ikebukuro", "池袋"] },
  { canonical: "akihabara",              aliases: ["Akihabara", "秋葉原"] },
  { canonical: "kanda",                  aliases: ["Kanda", "神田"] },
  { canonical: "asakusabashi",           aliases: ["Asakusabashi", "浅草橋"] },
  { canonical: "higashi-nihombashi",     aliases: ["Higashi-Nihombashi", "Higashi-Nihonbashi", "東日本橋"] },
  { canonical: "bakurocho",              aliases: ["Bakurocho", "Bakurochō", "馬喰町"] },
  { canonical: "bakuro-yokoyama",        aliases: ["Bakuro-yokoyama", "Bakuro-Yokoyama", "馬喰横山"] },
  { canonical: "kinshicho",              aliases: ["Kinshicho", "Kinshichō", "錦糸町"] },
  { canonical: "akasaka",                aliases: ["Akasaka", "赤坂"] },
  { canonical: "akasaka-mitsuke",        aliases: ["Akasaka-mitsuke", "Akasaka-Mitsuke", "赤坂見附"] },
  { canonical: "roppongi",               aliases: ["Roppongi", "六本木"] },
  { canonical: "omotesando",             aliases: ["Omotesando", "Omotesandō", "表参道"] },
  { canonical: "aoyama-itchome",         aliases: ["Aoyama-itchome", "Aoyama-Itchome", "Aoyama-Itchōme", "青山一丁目"] },
  { canonical: "gaiemmae",               aliases: ["Gaiemmae", "外苑前"] },
  { canonical: "ochanomizu",             aliases: ["Ochanomizu", "Ochanomizu", "御茶ノ水", "お茶の水"] },
  { canonical: "shin-ochanomizu",        aliases: ["Shin-ochanomizu", "Shin-Ochanomizu", "新御茶ノ水"] },
  { canonical: "iidabashi",              aliases: ["Iidabashi", "飯田橋"] },
  { canonical: "kasuga",                 aliases: ["Kasuga", "春日"] },
  { canonical: "korakuen",               aliases: ["Korakuen", "Kōrakuen", "後楽園"] },
  { canonical: "toyosu",                 aliases: ["Toyosu", "豊洲"] },
  { canonical: "ariake",                 aliases: ["Ariake", "有明"] },
  { canonical: "odaiba",                 aliases: ["Odaiba", "Daiba", "お台場", "台場"] },
  { canonical: "tokyo-skytree",          aliases: ["Tokyo Skytree", "とうきょうスカイツリー", "Tokyo-Skytree"] },
];

const ALIAS_TO_CANONICAL = (() => {
  const m = new Map<string, string>();
  for (const { canonical, aliases } of NORMALIZE_PAIRS) {
    m.set(canonical, canonical);
    for (const alias of aliases) {
      m.set(stripStationDecorations(alias).toLowerCase(), canonical);
    }
  }
  return m;
})();

/**
 * Remove common Japanese station-name decorations:
 *   - the suffix "駅"
 *   - parenthetical subtitles like "〈スカイツリー前〉" or "(スカイツリー前)"
 *   - operator brand subtitles "京成" / "都営" / "メトロ" prefixes
 *   - whitespace
 */
export function stripStationDecorations(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/[（(〈［\[][^\)）〉］\]]*[)）〉］\]]/g, "") // parenthetical subtitles
    .replace(/駅\s*$/u, "") // trailing 駅
    .replace(/^都営|^メトロ|^京成|^東武|^西武|^京王|^小田急|^JR\s*/iu, "") // operator prefix
    .trim();
}

/**
 * Normalize any input (Japanese or English, with or without decorations)
 * to a canonical wayfinding name key. Returns null when no alias matches.
 */
export function normalizeStationName(raw: string): string | null {
  if (!raw) return null;
  const stripped = stripStationDecorations(raw);
  const direct = ALIAS_TO_CANONICAL.get(stripped) ?? ALIAS_TO_CANONICAL.get(stripped.toLowerCase());
  if (direct) return direct;
  // tolerate hyphen/space variations
  const norm = stripped.toLowerCase().replace(/[\s_]/g, "-");
  return ALIAS_TO_CANONICAL.get(norm) ?? null;
}

/**
 * Given an editorial area's `stationNames` array, return the set of
 * canonical keys that area covers. Used to bucket passenger / accessibility
 * records into per-area aggregates.
 */
export function areaCanonicalKeys(stationNames: string[]): string[] {
  const out = new Set<string>();
  for (const s of stationNames) {
    const k = normalizeStationName(s);
    if (k) out.add(k);
  }
  return Array.from(out);
}
