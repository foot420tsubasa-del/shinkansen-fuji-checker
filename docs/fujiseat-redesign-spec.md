# fujiseat.com 再設計仕様書
## 「新幹線の座席サイト」から「日本旅行の移動×滞在の意思決定エンジン」へ

作成日: 2026-07-07 / 根拠データ: GSC 2025-11〜2026-07(全128ページ・1,000クエリ)

---

## 0. 再定義の原則(GSCデータから導出)

| 事実 | 含意 |
|---|---|
| 移動系ページは掲載順位7〜9位に入る(guide 6.9位、before-shinkansen 7.6位、vs比較 8〜10位) | Googleの信頼範囲は「鉄道・移動の意思決定」 |
| 汎用ホテル一覧ページは26〜43位で全滅(tokyo-hotels/* 約25ページ、2ヶ月でクリック0) | OTAと同じ土俵(在庫型ページ)では勝てない |
| 「XvsY」「〜before shinkansen」型はホテル文脈でもランクする | ホテル収益は「意思決定型」ページ経由でのみ取れる |
| EN guide CTR 0.64%(fr版は同順位で3.41%) | 最大の単一レバーはCTR改善。記事追加より先 |
| 直近30日 516クリック(+27% MoM)、秋冬が富士山シーズン | 土台は成長中。再設計は「破壊」ではなく「再配線」 |

**結論となる再定義:**
> fujiseat = 日本旅行の「移動にまつわる全決定」を1分で解決するサイト。
> どの座席か → どの列車か → どこに泊まるか(移動起点) → 空港からどう行くか。
> ホテルは「宿泊カテゴリ」としてではなく「移動計画の一部」として売る。

---

## 1. サイト名・ブランド

**推奨: ドメインもブランド名「fujiseat」も維持。サイト名(表示名)だけ拡張する。**

- 新サイト名: `fujiseat — Japan Rail Seats, Stays & Routes`
  (title接尾辞・OGP・フッターを統一)
- WebSite構造化データの `name` を上記に変更、`alternateName: "fujiseat"` を維持
- ツールはサブブランド化:
  - `Fuji Seat Checker`(既存)
  - `Tokyo Stay Finder`(旧 Hotel Area Finder。改名理由: hotelを名乗るとOTA比較され、Stayなら意思決定ツールとして独自)
  - `Route Planner`(既存planner)

**フルリネームを推奨しない理由:** ブランドクエリ(fujiseat / fuji seat で月15前後のクリック)とProduct Huntの被リンク・言及はこのドメイン唯一の外部資産。Googleのトピック認識はサイト名ではなくコンテンツ構造と内部リンクで変わるため、名前を捨てるコストに見合わない。

---

## 2. 新IA(情報設計)— 3つの決定ピラー + ツール層

```
fujiseat.com
│
├── ホーム(再設計: 「決定の流れ」型LP)
│    到着 → 空港移動 → 滞在拠点 → 新幹線 → 座席 の順に決定を提示
│
├── /rail/          ← ピラー1: 列車の決定(収益: Klook切符・JRパス)
│    ├── guide(既存。CTR改修が最優先タスク)
│    ├── ルート別: tokyo-to-kyoto / kyoto-to-tokyo(既存)
│    │            osaka-to-tokyo / tokyo-to-osaka(★新規。クエリ実績330+92表示あり未対応)
│    ├── seat-letters(既存) ※seat-eはguideへ301統合を検討(共食い解消)
│    ├── oversized-baggage-seat(★新規・最優先。特大荷物予約は訪日客最大の混乱点)
│    ├── nozomi-vs-hikari-vs-kodama(★新規。JRパス利用者の必須決定)
│    ├── reserved-vs-non-reserved(★新規)
│    ├── green-car-worth-it(★新規)
│    └── jr-pass-vs-single-ticket(既存2ページを1本に統合)
│
├── /stay/          ← ピラー2: 滞在拠点の決定(収益: Trip.com / Booking.com(Travelpayouts))
│    ├── Tokyo Stay Finder(ツール。診断クイズ型に改修 → §4)
│    ├── vs比較層(既存を維持・強化):
│    │    asakusa-vs-ueno / tokyo-station-vs-shinjuku / ueno-vs-shinjuku /
│    │    shinjuku-vs-ueno-vs-asakusa / kyoto-station-vs-gion /
│    │    namba-vs-umeda / shin-osaka-vs-namba
│    ├── before-shinkansen層(既存+展開):
│    │    where-to-stay-before-shinkansen(東京・既存)
│    │    kyoto-before-shinkansen / osaka-before-shinkansen(★新規、既存vsページと接続)
│    └── tokyo-hotels/* 約25ページ → 全て301(§3の統合マップ)
│
├── /transfer/      ← ピラー3: 空港移動の決定(収益: Klook送迎・Skyliner等)
│    ├── narita-late-arrival / haneda-late-arrival(既存・8〜9位。維持)
│    ├── narita→浅草/押上/上野(既存・9位前後。維持)
│    └── 26位以下のページ(shibuya系・関空系) → 空港別ハブ2本に301統合
│
├── /itineraries/   ← 動線束ね役(7-day既存7.4位。維持・plannerと接続)
├── /planner/ /command-center/(既存ツール。導線先として維持)
└── 多言語: fr → pt-BR → ko の順にstay層を展開(fr CTR 3.41%、fr vsページに既に98表示)
```

URL変更は最小限に。`/rail/` `/stay/` は論理グルーピング(パンくず・内部リンク・サイトマップ構造)であり、既存URLの物理移動は必須ではない。移動する場合は必ず301。

---

## 3. ページ統廃合マップ(301)

| 対象 | 行き先 | 理由 |
|---|---|---|
| tokyo-hotels/shinjuku ほかエリア別一覧 ~25本 | 対応するvsページ or Stay Finder | 26〜43位・クリック0。在庫型はOTAに勝てない |
| tokyo-hotels/tokyo-station | where-to-stay-before-shinkansen | 唯一移動文脈に転用可能。中身は吸収 |
| shinkansen-seat-e | guide(アンカー #seat-e) | guideと共食い(7.9位 vs 6.9位)。統合で本体を押し上げ |
| jr-pass-vs-single-ticket + shinkansen-ticket-vs-jr-pass | 1本に統合 | 重複。両方34位/9.8位で分散中 |
| airport-transfers の26位以下(shibuya系・kansai系) | 空港別ハブ(Narita/Haneda/KIX 各1本) | 個別ルートで戦わずハブで受ける |
| local-tokyo/*(kiyosumi-shirakawa等) | 維持・投資凍結 | 193表示あるが24位。Stay Finderの「calmer base」判定の受け皿としてのみ利用 |

---

## 4. Tokyo Stay Finder 改修仕様(このサイトの中核資産・捨てない)

**位置づけ: Finderはサイトの主役に昇格させる。** 座席チェッカーが「rail側の顔」なら、Finderは「stay側の顔」。改修の設計思想は「表面は外国人にも一問一答で単純明快、開くと意外なほど細かい実務情報、出口は必ず収益リンク」。

### 4-1. 入口: 4問クイズ(モバイル最優先。クリックの58%はモバイル)

1画面1問・大ボタン・タップのみ・所要20秒:

- Q1 🚄 Shinkansen departure? → Before 8am / Daytime / No shinkansen
- Q2 🧳 Luggage? → Large suitcase(s) / Carry-on only
- Q3 ✈️ Arriving at? → Narita / Haneda / Already in Tokyo
- Q4 🌙 Your evenings? → Nightlife & food / Quiet & local

### 4-2. 結果カード: 「単純明快」と「意外と細かい」の2層構造

**上層(即答・3秒で理解できる):**
> ✅ **Stay near Tokyo Station / Ginza**
> ・Every shinkansen line, zero transfer(早朝出発に最適)
> ・Flat 3-min walk from Yaesu exit — no stairs with luggage
> ・Narita Express direct 55 min

**下層(アコーディオンで開く実務ディテール。ここが差別化):**
- 🚪 どの改札・出口を使うか(八重洲 vs 丸の内で徒歩時間が変わる)
- 🛗 エレベーター直結ルート・コインロッカーの場所
- ⏰ 朝ラッシュに巻き込まれない出発目安時刻
- 💬 チェックイン前に荷物を預ける英語フレーズ
- 🗺 簡易エリアマップ(既存アセット流用)

**収益ブロック(結果カード内・スクロールなしで見える位置):**
1. `Compare hotels in this area →` エリアディープリンク(メインCTA・最大ボタン)。Trip.com と Travelpayouts経由Booking.com の2系統を既存adminページのリンク管理から出し分け
2. 実名ホテル 2〜3軒。各1行の「移動ロジック理由」付き:
   - 例「Hotel ○○ — Yaesu exit 3 min, flat route, elevator direct(大型荷物向き)」
   - ※理由がOTAレビューではなく移動動線なのがこのサイトにしか書けない部分
3. サブCTA: `Book your shinkansen ticket →` Klook(このユーザーは全員これから新幹線に乗る)

### 4-3. 配置: 独立ページ + 埋め込みの2形態

- フル版: /stay/finder(WebApplicationスキーマ)
- コンパクト版(Q1+Q2の2問→結果はフル版へ): guide全言語・全vsページ・before-shinkansen・7-day itinerary に埋め込み
- vsページ側の埋め込み文言例: 「Still not sure? Answer 2 questions →」

### 4-4. 計測

CTA別クリックイベント(Trip.comエリア / Booking(Travelpayouts)エリア / 実名ホテル / Klook)を計測。どの出口が成約するかでメインCTAのOTAと実名ホテルの入れ替えを月次運用。

### 4-5. スキーマ

各vsページにFAQPage、FinderにWebApplication、結果カードの実名ホテルには構造化データを付けない(ランキング誤認回避。既存の editorial travel-fit 注記は維持)。

---

## 5. 収益マッピング(テンプレート単位)

| ページ種別 | 一次CTA | 二次CTA | 想定単価 |
|---|---|---|---|
| rail系(guide/ルート/荷物/座席) | Klook 新幹線切符 | JRパス比較 | 数百円/成約 |
| stay系(vs/Finder/before-shinkansen) | Trip.com / Booking.com(Travelpayouts)エリア+実名ホテル | Klook切符(移動が近い人向け) | ¥500〜2,000/予約 |
| transfer系 | Klook送迎・Skyliner | eSIM | 数百円 |
| itinerary/planner | eSIM・保険(既存) | ホテル・切符の文脈リンク | 混合 |

数万円/月の算段: 秋冬ピークで月1,500〜2,500クリックを想定した場合、rail系だけでは単価不足。stay系で月10〜20予約(Finder経由CVR 1〜2%想定)を取れるかが分水嶺。

---

## 6. 実行順序(優先度順)

1. **EN guideのtitle/meta/H1改修 + FAQスキーマ**(CTR 0.64%→2%で流入3倍。工数最小・効果最大)
2. **osaka-to-tokyo / tokyo-to-osaka ルートページ新規作成**(需要実証済み・未対応)
3. **301統合の実施**(§3マップ。seat-e統合とJRパス統合を先に)
4. **Stay Finderのクイズ化+Trip.com/Booking出口実装(既存adminリンク管理を利用)、vsページへの埋め込み**
5. **oversized-baggage-seat 新規作成**(rail側の次の柱)
6. **サイト名・スキーマ・OGPの一括変更**(1〜4と同時デプロイでよい)
7. before-shinkansen の京都・大阪版 → fr言語展開 → 配信(Reddit回答・Stay Finderのミニローンチ)

---

## 7. やらないことリスト

- エリア別ホテル一覧ページの新規追加(データで否定済み)
- 「hotels near ○○ station」系キーワードの追跡
- 汎用観光ガイド(local-tokyoの拡張)への投資
- フルリネーム / ドメイン変更
- 日本語版の作成(流入の実態は訪日中の外国人の英語検索)
