# 数ヶ月スパンの深掘り分析 (2026-08-12)

データ源: GA4 Data API (プロパティ 534386847) + Search Console API (https://fujiseat.com/)。
CSVエクスポート不要になったため、以降は `node scripts/hotel-funnel-report.mjs` で更新可能。

## 1. 成長曲線 — サイトは「離陸済み」

| 月 | クリック | 表示 | CTR |
|---|--:|--:|--:|
| 2026-02 | 18 | 3,853 | 0.47% |
| 2026-03 | 53 | 10,411 | 0.51% |
| 2026-04 | 128 | 13,601 | 0.94% |
| 2026-05 | 405 | 44,588 | 0.91% |
| 2026-06 | 485 | 63,139 | 0.77% |
| 2026-07 | **832** | **71,332** | **1.17%** |
| 2026-08 (10日) | 257 | 23,917 | 1.07% |

- 表示は5ヶ月で **3,853 → 71,332 (18倍)**。8月も月次換算で7万超ペース。
- CTRは6月0.77% → 7月1.17%に改善(7月のタイトル改修・構造改善が効いている)。
- **結論: インデックス・順位は伸びている。ボトルネックは「表示 → クリック」の変換率**。

## 2. ページ別トレンド (直近90日 vs 前90日)

| ページ | 直近90d | 前90d | 評価 |
|---|---|---|---|
| /guide | 1,033c / 137,785i / **0.75%** / pos6.6 | 219c / 34,166i / pos6.9 | 表示4倍だがCTR横ばい。**最大の損失源** |
| /shinkansen-seat-letters | 111c / 10,432i / 1.06% / pos6.1 | 0 / 0 | 新規で第2の柱に成長 |
| /areas-to-stay/asakusa-vs-ueno | 63c / 6,409i / 0.98% / **pos8.5** | 1c / 234i / pos15.5 | 順位15.5→8.5。**あと一歩で1ページ目上位** |
| /es/guide | 90c / 6,327i / 1.42% / pos5.6 | 2c / 720i / pos8.4 | 急成長 |
| /fr/guide | 173c / 4,720i / **3.67%** / pos5.5 | 51c / 1,520i | CTR最優秀 |
| /de/guide | 52c / 3,034i / 1.71% / pos5.2 | 0 | 新規 |
| /ru/guide | 52c / 1,810i / 2.87% / pos5.2 | 0 | 新規 |
| /shinkansen-seat-e | 17c / 2,379i / 0.71% / pos7.5 | 0 | CTR要改善 |
| /areas-to-stay/ueno-vs-shinjuku | 14c / 1,195i / 1.17% / pos7.6 | 1c / 237i / pos15.6 | 順位大幅改善 |
| /areas-to-stay/tokyo-station-vs-shinjuku | 5c / 1,174i / **0.43%** / pos7.3 | 1c / 108i / pos11 | 順位7.3なのにCTR0.43%=タイトル問題 |
| /areas-to-stay/tokyo-hotel-room-size-guide | 1c / 550i / **0.18%** / pos8.8 | 0 | ほぼ全損 |
| /areas-to-stay/kyoto-station-vs-gion | 0c / 229i / pos8.9 | 0c / 32i | **pos8.9でクリック0** |

## 3. /guide のCTR問題 — 原因を特定

### デバイス別 (90日)
| デバイス | クリック | 表示 | CTR | 順位 |
|---|--:|--:|--:|--:|
| モバイル | 1,150 | 96,167 | 1.20% | 6.6 |
| **PC** | 670 | 92,821 | **0.72%** | 7.3 |

PC表示がモバイルとほぼ同数(9.3万)なのに **CTRが6割**。PCのスニペット(長いタイトルが切れる)が疑わしい。

### クエリ別に見ると「答えが合っていない」パターンが明白
| クエリ | 表示 | CTR | 順位 |
|---|--:|--:|--:|
| which side of shinkansen to see fuji from **osaka to tokyo** | 485 | **0.8%** | 8.0 |
| which side of shinkansen to see fuji from **kyoto to tokyo** | 317 | 3.5% | 5.0 |
| shinkansen **seat map** | 266 | 1.5% | 10.5 |
| ueno vs asakusa | 361 | 1.7% | 7.1 |
| shinkansen fuji view | 293 | 1.7% | 8.3 |
| where to sit ... tokyo to kyoto (ロングテール) | 23 | **17.4%** | 4.0 |

- 「東京発(Seat E / 右側)」を明示した現タイトルに対し、**逆方向クエリ(osaka/kyoto → tokyo)で0.8%**まで落ちる。ロングテールで意図が完全一致すると17%出る。
- つまりCTR不足は順位ではなく **「スニペットが自分の方向の答えに見えない」** ことが原因。
- 多言語版が2.9〜3.7%を出している事実がこれを裏付ける(英語タイトルだけが方向固定)。

### 期待値
/guide のPC CTRをモバイル並(1.2%)に、全体を1.8%に引き上げられれば **+1,400クリック/90日**。
Klook導線(guide_quick_answer)は既に placement 別トップなので、流入増がそのまま収益に乗る。

## 4. GA4 側の収益ファネル

| 月 | PV | セッション | cta_view | affiliate_click | cta_click | seat_check |
|---|--:|--:|--:|--:|--:|--:|
| 2026-04 | 300 | 161 | – | 3 | 0 | 0 |
| 2026-05 | 1,678 | 1,252 | – | 52 | 14 | 157 |
| 2026-06 | 1,532 | 1,341 | – | 30 | 19 | 157 |
| 2026-07 | 2,133 | 1,689 | 517 | 46 | 83 | 205 |
| 2026-08 (12日) | 917 | 693 | 320 | 11 | 40 | 71 |

- **affiliate_cta_view → affiliate_click の転換率: 7月 8.9% → 8月 3.4%**。CTA表示は増えているのにクリックが落ちている(要注視。8月は途中集計のため確定ではない)。
- seat_check_complete は月200件前後で安定 = ツールは機能している。導線としての seat checker → Klook の接続が最大の資産。
- 直近28日の placement 別: guide_quick_answer 12 / home_seat_result 8 / comparison_area_card 4 / plan_trip_activity_cards 4。

## 5. ホテルが伸びない理由(構造)

- ホテル関連の表示はサイト全体の 1.7% 程度にとどまる。入口は比較3ページのみで、Finder は検索に出ない。
- ただし **順位は明確に改善している**(asakusa-vs-ueno 15.5→8.5、ueno-vs-shinjuku 15.6→7.6)。あと1〜3ランクで1ページ目上位に届く位置。
- 一方でCTRが極端に低いページが残る: tokyo-station-vs-shinjuku 0.43%、room-size-guide 0.18%、kyoto-station-vs-gion 0%。**順位はあるのにタイトルで負けている**。
- 関西比較(kyoto-station-vs-gion 229i / shin-osaka-vs-namba 186i)は Booking.com 未登録 → admin にエントリ追加だけで収益化可能。

## 6. 次の実行順(推奨)

1. **/guide の英語タイトル・meta を方向ニュートラル化**(PC表示長も考慮) ← 最大効果
2. tokyo-station-vs-shinjuku / room-size-guide / kyoto-station-vs-gion のタイトル改修(順位はあるのでCTRだけの問題)
3. shinkansen-seat-letters / seat-e のCTR改善 + Klook CTA強化(予約直前intent)
4. 関西比較ページを admin で Booking.com 登録
5. affiliate_cta_view → click の低下要因をGA4で追跡(placement別の推移)

## 付記: コマンドセンター削除 (実施済み)

GA4 180日で **全言語合計35ビュー・関連イベント0件**、noindex のため検索流入なし。
JS 116KB (JapanTripCommandCenter.jsx 84KB + japanTripModel.js 21KB + CommandMap.jsx 11KB) を
削除し、ページ2本・OG画像・フッター/plan-your-trip/planner の導線・全9言語のi18nキー(各11個)を撤去。
静的ページ数 797 → 787。
