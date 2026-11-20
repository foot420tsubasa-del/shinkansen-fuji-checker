#!/usr/bin/env node
/**
 * Affiliate URLs <-> the "URL管理" tab of the management spreadsheet.
 *
 *   node scripts/links-sheet.mjs export            -> .cache/links-sheet.json (rows to write to the sheet)
 *   node scripts/links-sheet.mjs import <rows.json> [--apply]
 *
 * One row per URL, grouped by genre, from every data file the old /admin page
 * edited that holds a link. The sheet is read and written through the Google
 * Sheets connector; this script only maps rows to the data files and checks
 * them. `import` without --apply prints what would change and fails on
 * anything unsafe, so a typo in the sheet never reaches the site:
 *   - the ID and data-file columns must match an existing entry (new rows are
 *     allowed only for affiliate-links, with a fresh ID);
 *   - a URL that is live on the site cannot be blanked (status "削除" removes
 *     an affiliate-links entry on purpose);
 *   - Klook links must keep aid=104861, a numeric aff_adid and a klook.com
 *     k_site; the adid is taken from the URL;
 *   - every URL must be https.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";

export const HEADER = ["ジャンル", "名前（何のリンクか）", "提供元", "アフィリエイトURL", "商品・行き先（参考）", "使っている場所", "状態", "メモ", "ID（変更しない）", "データ元（変更しない）"];
const COL = Object.fromEntries(HEADER.map((h, i) => [h, i]));

const GENRES = [
  ["鉄道チケット（新幹線・特急）", /^(shinkansen|fujiExcursion|saganoTrain)/],
  ["鉄道パス・乗り放題", /^(jrPass|pass[A-Z]|hakone$|fujiKawaguchikoPass|enoshimaKamakuraFreepass|yurikamomeDayPass|osakaAmazingPass)/],
  ["空港アクセス", /^(airportTransfer|nex|skyliner|keiseiSkyliner|limousineBus|naritaLimousineBus|hanedaMonorail|hanedaLimousineBus|jrHaruka|kixLimousineBus|nankaiRapit|naritaPrivateTransfer|hanedaPrivateTransfer|airportPrivateTransfer|klookAirportTransfers|klookTokyoTransport)$/],
  ["観光・ツアー・体験", /^(city|foodTour|teamlab|tokyoTower|kimono|fushimi|universal|nara$|fujiDayTour|fujiOshino|fujiChureito|tour[A-Z]|hakoneRopeway|hakoneCruise|fujiPanoramicRopeway)/],
  ["通信・保険・車", /^(esim|simCard|insurance|carRental)$/],
  ["ホテル検索（Klook）", /^hotel/],
  ["ホテル検索（Agoda）", /^agoda/],
  ["比較サイト（Omio）", /^omio/],
];
/** Links still to be issued live at the bottom of the same tab (data/affiliate-wishlist.json). */
const WISHLIST_GENRE = "取得待ち（未発行）";
const WISHLIST_SRC = "取得待ち";
const GENRE_ORDER = [
  ...GENRES.map(([g]) => g),
  "ホテル：個別ホテル（Booking.com）",
  "ホテル：Booking.com エリア検索",
  "その他",
  WISHLIST_GENRE,
];
/** Japanese names for the sheet only (display; not read back on import). */
const JA_NAME = {
  "jrPass": "JRパス（全国7日間）",
  "shinkansenTicket": "新幹線チケット（東海道・汎用）",
  "shinkansenTokyoKyoto": "新幹線 東京→京都",
  "shinkansenKyotoTokyo": "新幹線 京都→東京",
  "shinkansenTokyoHiroshima": "新幹線 東京→広島",
  "shinkansenTokyoKanazawa": "北陸新幹線 東京→金沢",
  "shinkansenOsakaHiroshima": "新幹線 大阪→広島",
  "shinkansenTokyoSendai": "東北新幹線 東京→仙台",
  "fujiExcursion": "特急 富士回遊（新宿→河口湖）",
  "saganoTrain": "嵯峨野トロッコ列車",
  "passKansaiThru": "関西レールウェイパス",
  "passKansaiWide": "JR関西ワイドエリアパス",
  "passHokuriku": "北陸アーチパス",
  "passTokyoSubway": "東京メトロ・都営 24/48/72時間券",
  "hakone": "箱根フリーパス",
  "fujiKawaguchikoPass": "富士山エリアパス（河口湖周遊）",
  "enoshimaKamakuraFreepass": "江の島・鎌倉フリーパス（デジタル）",
  "yurikamomeDayPass": "ゆりかもめ 一日乗車券",
  "osakaAmazingPass": "大阪周遊パス（Osaka Amazing Pass）",
  "airportTransfer": "成田エクスプレス N'EX（共通）",
  "nex": "成田エクスプレス N'EX",
  "skyliner": "京成スカイライナー（成田→上野・日暮里）",
  "keiseiSkyliner": "京成スカイライナー（別名）",
  "limousineBus": "空港リムジンバス（共通）",
  "naritaLimousineBus": "成田空港リムジンバス",
  "hanedaMonorail": "東京モノレール（羽田）",
  "hanedaLimousineBus": "羽田空港リムジンバス",
  "jrHaruka": "JR特急はるか（関空）",
  "kixLimousineBus": "関空リムジンバス",
  "nankaiRapit": "南海ラピート（関空→なんば）",
  "naritaPrivateTransfer": "成田空港 専用車送迎",
  "hanedaPrivateTransfer": "羽田空港 専用車送迎",
  "airportPrivateTransfer": "空港 専用車送迎（共通）",
  "klookTokyoTransport": "東京の交通（Klook一覧）",
  "klookAirportTransfers": "空港送迎（Klook一覧）",
  "cityTokyo": "東京の観光・体験",
  "cityNikko": "日光 日帰り",
  "cityKyoto": "京都の観光・体験",
  "cityOsaka": "大阪の観光・体験",
  "cityHiroshima": "広島の観光・体験",
  "nara": "奈良 日帰り",
  "foodTourTokyo": "東京フードツアー",
  "foodTourKyoto": "京都 食べ歩き",
  "foodTourOsaka": "大阪 屋台・食べ歩き",
  "teamlabBorderless": "チームラボ ボーダレス",
  "tokyoTower": "東京タワー",
  "kimonoRentalKyoto": "京都 着物レンタル",
  "fushimiInariNaraTour": "伏見稲荷＋奈良 日帰りツアー",
  "universalStudiosJapan": "USJ（ユニバーサル・スタジオ・ジャパン）",
  "fujiDayTourTokyo": "富士山 日帰りツアー（東京発）",
  "tourSaganoRiverBoat": "嵯峨野トロッコ＋保津川下り（半日ツアー）",
  "tourSaganoRiverBoatAlt": "嵯峨野トロッコ＋保津川下り＋嵐山散策（別商品）",
  "tourKamakuraEnoden": "鎌倉・江ノ電 日帰りツアー",
  "tourKamakuraYokohama": "鎌倉・江ノ電・横浜ツアー（韓国語・中国語ガイド）",
  "tourKyotoSagano": "嵯峨野トロッコ＋京都観光ツアー",
  "tourFujiHakone": "富士山・箱根・芦ノ湖 日帰りツアー",
  "hakoneRopeway": "箱根ロープウェイ乗車券",
  "hakoneCruise": "箱根観光船（芦ノ湖）",
  "teamlabPlanets": "チームラボプラネッツ（豊洲）",
  "fujiPanoramicRopeway": "河口湖 富士山パノラマロープウェイ",
  "fujiOshinoHakkai": "忍野八海・富士五湖ツアー",
  "fujiChureitoPagoda": "忠霊塔・新倉山ツアー",
  "esim": "日本のeSIM",
  "simCard": "日本のプリペイドSIM（物理カード）",
  "insurance": "旅行保険（Klook Protect）",
  "carRental": "運転手付き貸切車（東京）",
  "hotelTokyo": "東京のホテル",
  "hotelShinjuku": "新宿のホテル",
  "hotelUeno": "上野のホテル",
  "hotelAsakusa": "浅草のホテル",
  "hotelKyoto": "京都のホテル",
  "hotelKyotoStation": "京都駅周辺のホテル",
  "hotelGion": "祇園のホテル",
  "hotelKawaguchiko": "河口湖のホテル",
  "hotelOsaka": "大阪のホテル",
  "hotelHiroshima": "広島のホテル",
  "hotelHakone": "箱根のホテル",
  "agodaTokyo": "東京のホテル（Agoda）",
  "agodaKyoto": "京都のホテル・旅館（Agoda）",
  "agodaOsaka": "大阪のホテル（Agoda）",
  "agodaKawaguchiko": "河口湖・富士山のホテル（Agoda）",
  "agodaHakone": "箱根の旅館（Agoda）",
  "omioShinkansen": "新幹線ルート比較",
  "omioTokyoKyoto": "東京→京都 比較",
  "omioTokyoOsaka": "東京→大阪 比較",
  "omioJapanRailPass": "JRパス比較",
  "omioJapanTrain": "日本の鉄道 比較",
  "omioJapanBus": "日本のバス 比較",
  "omioJapanAirportTransfer": "空港アクセス比較",
  "omioNaritaAirportToTokyo": "成田空港→東京駅 比較",
  "omioNaritaAirportToShinjuku": "成田空港→新宿 比較",
  "omioNaritaAirportToUeno": "成田空港→上野 比較",
  "omioNaritaAirportToAsakusa": "成田空港→浅草 比較",
  "omioHanedaAirportToTokyo": "羽田空港→東京駅 比較",
  "omioHanedaAirportToShinjuku": "羽田空港→新宿 比較",
  "omioHanedaAirportToUeno": "羽田空港→上野 比較",
  "omioHanedaAirportToAsakusa": "羽田空港→浅草 比較",
  "omioKansaiAirportToKyoto": "関空→京都 比較",
  "omioKansaiAirportToOsaka": "関空→大阪 比較",
  "omioKansaiAirportToNamba": "関空→なんば 比較"
};
const genreOf = (id) => (GENRES.find(([, re]) => re.test(id)) ?? ["その他"])[0];

const PROVIDER_JA = { klook: "Klook", agoda: "Agoda", trip: "Trip.com", omio: "Omio", booking_travelpayouts: "Booking.com（Travelpayouts）", other: "その他" };
const load = (f) => JSON.parse(readFileSync(`data/${f}.json`, "utf8"));
const save = (f, d) => {
  const raw = readFileSync(`data/${f}.json`, "utf8");
  const indent = (raw.match(/\n( +)"/) || [, "  "])[1].length;
  writeFileSync(`data/${f}.json`, JSON.stringify(d, null, indent) + "\n");
};
const klookTarget = (url) => {
  const m = String(url).match(/k_site=([^&]+)/);
  if (!m) return "";
  try {
    return decodeURIComponent(m[1]).replace(/^https:\/\/www\.klook\.com\/(en-US\/)?/, "klook: ").replace(/[?#].*$/, "");
  } catch {
    return "";
  }
};
/** Where each link id is used in the code, as page names a person recognises. */
function usageIndex() {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const f = `${dir}/${name}`;
      if (statSync(f).isDirectory()) walk(f);
      else if (/\.(tsx?|json)$/.test(name) && !/affiliate-links\.json$/.test(f)) files.push(f);
    }
  };
  for (const d of ["app", "components", "lib", "src", "data"]) if (existsSync(d)) walk(d);
  // Pages only; shared components and libraries count as "via shared parts".
  const place = (f) => {
    if (/^app\/\[locale\]\/(page|HomeClient)\.tsx$/.test(f)) return "トップ";
    if (f.startsWith("app/[locale]/components/") || f.startsWith("app/[locale]/admin/")) return null;
    const m = f.match(/^app\/\[locale\]\/(.+)\/[^/]+\.tsx$/);
    if (m) return "/" + m[1].replace(/\[[^\]]+\]/g, "…");
    if (f === "data/scenic-routes.json") return "景色ページ";
    return null;
  };
  const text = files.map((f) => [f, readFileSync(f, "utf8")]);
  return (id) => {
    const re = new RegExp(`["'\`]${id}["'\`]`);
    const hits = text.filter(([, t]) => re.test(t)).map(([f]) => place(f));
    const pages = [...new Set(hits.filter(Boolean))];
    return pages.length ? pages.join("、") : hits.length ? "共通部品経由" : "";
  };
}

// Agoda is not used on the site (the CTAs filter it out), so its links stay
// out of the sheet; the data files keep them untouched.
const isAgoda = (id, v) => /^agoda/.test(id) || v.provider === "agoda";

/** Every URL field the old admin page edited, one row each. */
function buildRows() {
  const rows = [];
  const usedIn = usageIndex();
  const push = (r) => rows.push(HEADER.map((h) => r[h] ?? ""));

  for (const [id, v] of Object.entries(load("affiliate-links"))) {
    if (isAgoda(id, v)) continue;
    const url = v.directUrl || v.affiliateUrl || "";
    push({
      ジャンル: genreOf(id),
      "名前（何のリンクか）": JA_NAME[id] ?? v.label ?? id,
      提供元: PROVIDER_JA[v.provider] ?? v.provider ?? "",
      アフィリエイトURL: url,
      "商品・行き先（参考）": klookTarget(url) || (v.klookPath ? `klook: ${v.klookPath}` : ""),
      使っている場所: usedIn(id) || "（未使用）",
      状態: url ? "公開中" : "未発行",
      メモ: (v.notes ?? "").replace(/ — (この商品でKlookのリンクを発行し|対象商品: ).*$/, ""),
      "ID（変更しない）": id,
      "データ元（変更しない）": "affiliate-links",
    });
  }
  for (const [key, v] of Object.entries(load("booking-hotel-destinations"))) {
    push({
      ジャンル: "ホテル：Booking.com エリア検索",
      "名前（何のリンクか）": v.label || key,
      提供元: "Booking.com（Travelpayouts）",
      アフィリエイトURL: v.affiliate_url,
      "商品・行き先（参考）": v.booking_query_label || v.area_id || "",
      使っている場所: "Where to Stay（Stay Finder）",
      状態: v.url_status === "active" && v.affiliate_url ? "公開中" : v.url_status || "未発行",
      メモ: v.notes || "",
      "ID（変更しない）": `${key}#affiliate_url`,
      "データ元（変更しない）": "booking-hotel-destinations",
    });
  }
  // Hotels go to Booking.com only (2026-11-18). Trip.com links are no longer
  // shown anywhere, so they are left out of the sheet (the data files keep
  // them). Each recommended hotel's Booking.com page is listed here; paste the
  // Booking.com affiliate link into the URL column when it is issued and the
  // site switches that hotel over to it.
  for (const [key, v] of Object.entries(load("booking-hotel-urls").hotels)) {
    const local = key.startsWith("local:");
    push({
      ジャンル: "ホテル：個別ホテル（Booking.com）",
      "名前（何のリンクか）": v.name,
      提供元: "Booking.com",
      アフィリエイトURL: v.affiliateUrl,
      "商品・行き先（参考）": v.bookingUrl || "",
      使っている場所: local ? "ローカルおすすめ宿" : "ホテル紹介（個別）",
      状態: !v.bookingUrl ? "Booking.com に掲載なし" : v.affiliateUrl ? "公開中" : "未発行（通常URLで表示中）",
      メモ: v.note || "",
      "ID（変更しない）": `${key}#affiliateUrl`,
      "データ元（変更しない）": "booking-hotel-urls",
    });
  }
  // Not issued yet: one row each, so the tab is the single list of every link.
  if (existsSync("data/affiliate-wishlist.json")) {
    for (const [id, v] of Object.entries(load("affiliate-wishlist").items)) {
      push({
        ジャンル: WISHLIST_GENRE,
        "名前（何のリンクか）": `[${v.priority}] ${v.name}`,
        提供元: v.provider,
        アフィリエイトURL: "",
        "商品・行き先（参考）": v.normalUrl || "",
        使っている場所: `予定: ${v.placeOn}`,
        状態: v.status,
        メモ: [v.purpose, v.caution && `注意: ${v.caution}`, v.method && `取得方法: ${v.method}`, v.checked && `確認日: ${v.checked}`].filter(Boolean).join(" ／ "),
        "ID（変更しない）": id,
        "データ元（変更しない）": WISHLIST_SRC,
      });
    }
  }
  const order = (g) => (GENRE_ORDER.indexOf(g) + 1 || 99);
  rows.sort((a, b) => order(a[0]) - order(b[0]) || String(a[1]).localeCompare(String(b[1]), "ja"));
  return rows;
}

/** Locate the object and field a row points at. */
function locate(data, file, id) {
  if (file === "affiliate-links") return { obj: data[id], field: data[id]?.directUrl !== undefined ? "directUrl" : "directUrl" };
  const [path, field] = id.split("#");
  if (file === "booking-hotel-urls") return { obj: data.hotels?.[path], field };
  if (file === "stay-hotel-picks") {
    const [group, pickId] = path.split("/");
    return { obj: (data[group] ?? []).find((x) => x.id === pickId), field };
  }
  return { obj: data[path], field };
}

function checkUrl(url, provider) {
  if (!/^https:\/\/\S+$/.test(url)) return "https で始まる1つのURLにしてください";
  if (provider === "Booking.com" && !/^https:\/\/([a-z0-9-]+\.)*(booking\.com|tpx\.lv|travelpayouts\.com|tp\.media)\//.test(url))
    return "Booking.com のアフィリエイトリンク（booking.com / tpx.lv など）を貼ってください";
  if (/affiliate\.klook\.com/.test(url) || provider === "Klook") {
    const m = url.match(/^https:\/\/affiliate\.klook\.com\/redirect\?aid=104861&aff_adid=(\d+)&k_site=(https%3A%2F%2Fwww\.klook\.com%2F\S+)$/);
    if (!m) return "Klook のリンクは affiliate.klook.com/redirect?aid=104861&aff_adid=<数字>&k_site=https%3A%2F%2Fwww.klook.com%2F… の形にしてください（k_site は手で書き換えない）";
  }
  return null;
}

function importRows(file, apply) {
  const input = JSON.parse(readFileSync(file, "utf8"));
  const values = Array.isArray(input) ? input : input.values;
  const [header, ...rows] = values;
  if (HEADER.some((h, i) => header?.[i] !== h)) throw new Error(`見出し行が違います: ${JSON.stringify(header)}`);
  const files = {};
  const get = (f) => (files[f] ??= load(f));
  const errors = [];
  const changes = [];
  const seen = new Set();
  const waiting = [];
  rows.forEach((r, i) => {
    const line = i + 2;
    const cell = (h) => String(r[COL[h]] ?? "").trim();
    const id = cell("ID（変更しない）");
    const src = cell("データ元（変更しない）");
    if (!id && !src && !cell("アフィリエイトURL")) return; // blank row
    if (src === WISHLIST_SRC) {
      // Never written to the site: an issued link here needs a page to go on.
      if (cell("アフィリエイトURL")) waiting.push(`${line}行目: [${id}] ${cell("名前（何のリンクか）")} — 発行済み。掲載先に組み込む作業が必要です`);
      return;
    }
    const key = `${src}:${id}`;
    if (seen.has(key)) return errors.push(`${line}行目: ID「${id}」が重複しています`);
    seen.add(key);
    const url = cell("アフィリエイトURL");
    const status = cell("状態");
    let data;
    try {
      data = get(src);
    } catch {
      return errors.push(`${line}行目: データ元「${src}」がありません`);
    }
    const { obj, field } = locate(data, src, id);
    if (!obj) {
      if (src !== "affiliate-links") return errors.push(`${line}行目: 「${id}」は${src}にありません（ID・データ元は変更しないでください）`);
      if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(id)) return errors.push(`${line}行目: 新しいIDは英数字（例 kyotoBusPass）にしてください`);
      const bad = url && checkUrl(url, cell("提供元"));
      if (!url || bad) return errors.push(`${line}行目: 新しいリンク「${id}」: ${bad || "URLが空です"}`);
      const adid = (url.match(/aff_adid=(\d+)/) || [])[1] || "";
      changes.push({ line, what: `追加 ${id}`, run: () => (data[id] = { label: cell("名前（何のリンクか）") || id, provider: /klook/.test(url) ? "klook" : "other", adid, klookPath: "", directUrl: url, usedOn: [], notes: cell("メモ") }) });
      return;
    }
    if (src === "affiliate-links" && status === "削除") {
      changes.push({ line, what: `削除 ${id}`, run: () => delete data[id] });
      return;
    }
    const before = String(obj[field] ?? "");
    if (url === before) return;
    if (!url && before) return errors.push(`${line}行目: 「${id}」は公開中のURLです。空にはできません（止めるときは状態を「削除」に）`);
    const bad = checkUrl(url, cell("提供元"));
    if (bad) return errors.push(`${line}行目: 「${id}」: ${bad}`);
    if (src === "affiliate-links" && obj.provider === "klook") {
      const oldSite = (before.match(/k_site=([^&]+)/) || [])[1];
      const newSite = (url.match(/k_site=([^&]+)/) || [])[1];
      const oldAdid = obj.adid;
      const newAdid = (url.match(/aff_adid=(\d+)/) || [])[1];
      if (before && oldSite !== newSite && oldAdid === newAdid) errors.push(`${line}行目: 「${id}」: adid が同じまま k_site だけが変わっています。Klook で新しく発行したリンクを貼ってください`);
      changes.push({ line, what: `更新 ${id}（adid ${oldAdid || "-"} → ${newAdid}）`, run: () => Object.assign(obj, { directUrl: url, adid: newAdid }) });
      return;
    }
    changes.push({ line, what: `更新 ${src} ${id}`, run: () => (obj[field] = url) });
  });
  if (errors.length) {
    console.error(`取り込みを中止しました（${errors.length}件）:\n- ` + errors.join("\n- "));
    process.exit(1);
  }
  if (waiting.length) console.log("取得待ちの行に貼られたリンク（自動では反映しません）:\n- " + waiting.join("\n- "));
  console.log(changes.length ? changes.map((c) => `${c.line}行目: ${c.what}`).join("\n") : "変更はありません");
  if (apply && changes.length) {
    for (const c of changes) c.run();
    for (const [f, d] of Object.entries(files)) save(f, d);
    console.log(`${changes.length}件をデータに反映しました`);
  } else if (changes.length) console.log("（確認のみ。反映するには --apply）");
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "export") {
  const rows = buildRows();
  mkdirSync(".cache", { recursive: true });
  writeFileSync(".cache/links-sheet.json", JSON.stringify({ values: [HEADER, ...rows] }));
  const byGenre = {};
  for (const r of rows) byGenre[r[0]] = (byGenre[r[0]] ?? 0) + 1;
  console.log(`${rows.length} rows -> .cache/links-sheet.json`);
  console.table(byGenre);
} else if (cmd === "import" && arg) {
  if (!existsSync(arg)) throw new Error(`${arg} がありません`);
  importRows(arg, process.argv.includes("--apply"));
} else {
  console.error("usage: node scripts/links-sheet.mjs export | import <rows.json> [--apply]");
  process.exit(1);
}
