# GSC分析: Klook増収とホテル改善の狙い目 (2026-07-19)

データ: Search Console 過去12ヶ月 (分析/raw/gsc-2026-07-19/)。
全体: **1,568クリック / 184,665表示 / CTR 0.85% / 平均掲載順位 ~7**。

## 結論(優先度順)

| # | 施策 | 根拠 | 期待効果 |
|---|---|---|---|
| P1 | **/guide のタイトル・meta書き換え(CTR 0.7%→2%)** | 144,444表示・順位6.8でCTR 0.7%は異常に低い(順位6-7の相場は2-4%)。特にPC (CTR 0.61%) | +1,500〜1,900クリック/年 ≒ サイト全体2倍。Klook導線は整備済みなので直結 |
| P2 | **方向別クエリの取りこぼし解消(osaka/kyoto→tokyo)** | 「osaka to tokyo」389表示 CTR0.8%、「tokyo to kyoto」286表示 CTR0.3%。方向別ページ(/kyoto-to-tokyo-mt-fuji-seat 485i pos8.7 CTR0.4% ほか)が guide とカニバり気味 | 富士山系1.7万表示の回収率向上 |
| P3 | **/shinkansen-seat-letters (4,814i) と /shinkansen-seat-e (1,788i) のCTR+Klook強化** | 座席記号を調べる=予約直前intent。pos6でCTR 0.9%/0.6% | Klookクリックの第2の柱 |
| P4 | **ホテル: 比較ページの順位を9→5に引き上げ** | ホテル系はサイト表示の1.7%しかない。生きているのは asakusa-vs-ueno (3,837i pos9.0) / ueno-vs-shinjuku (865i pos11) / tokyo-station-vs-shinjuku (783i pos8.5) のみ | pos9→5でクリック5-10倍。Booking.com化済みなので収益直結 |
| P5 | **タイトル異常ページの修正** | tokyo-hotel-room-size-guide: 302i・**pos9.6でクリック0**。kyoto-station-vs-gion: 230i pos8.8 クリック0 | 低コストで拾えるクリック |
| P6 | 空港系: narita-to-shibuya (161i pos24.9) + hnd/nrt to shibuya系クエリ(~125i pos26-31) | 順位20台=強化で1ページ目圏内 | Klook空港送迎の受け皿 |

## 詳細

### 1. サイトはほぼ「富士山シート」一本足 — そして /guide が取りこぼしている

- seat/fuji view系クエリ: 688個 / 16,728表示 (表示ベースで**クエリの75%**)。/guide 単体で全表示の78%。
- /guide は966クリックで全クリックの62%。だがCTR 0.7%は掲載順位6.8に対して1/3以下の水準。
- 言語別guideは健全: fr 3.5% / ru 3.5% / ko 3.1% / pt-BR 2.6%。**英語(/guide)だけが異常に低い** → 英語タイトル/スニペットの問題。
  - 現タイトルは Tokyo→Kyoto方向(Seat E, Right Side)前提。逆方向クエリ(osaka/kyoto→tokyo では左側)でスニペットが「答えが合わない」ように見えてクリックされない可能性が高い。
  - 案: 方向を両方含める。例 `Mt. Fuji Side on the Shinkansen: Seat E (Tokyo→Kyoto) / Seat A (→Tokyo) — Free Checker`
- デバイス: PC CTR 0.61% vs モバイル 1.16%。PC表示が99,408と多いのにCTR半分 → PCでのタイトル表示(切り詰め)確認。

### 2. Klookの追加ポテンシャル

- **購入系クエリ(ticket buying / jr pass)はほぼ圏外**: jr pass系 pos40-53、表示計41。/jr-pass-vs-single-ticket は112i pos36.7。「買い方」クエリでの新規獲得は競合が強く短期では非効率。
- → 短期のKlook増収は「新規クエリ獲得」ではなく **既存の富士山シート流入の回収率(CTR)と、seat-letters/seat-e という予約直前ページの強化**が最短。
- 韓国語 신칸센 후지산系 ~170表示、/ko/guide CTR 3.1% — 多言語は既に効いている。zh-CN/guide は162i CTR0%で唯一弱い。

### 3. ホテルが伸びない構造的理由

- hotel/stay系クエリ: 176個で3,149表示・25クリックのみ。**入口は比較ページだけ**で、Finder(tokyo-stay-area-index)は検索にほぼ出ない(=Finderは回遊用と割り切る)。
- 伸びしろは「順位」: 比較3ページとも1ページ目下部(pos 8.5〜11)。ここから4-5位に上げるのが唯一のレバー。
  - 内部リンク: home / guide / 富士山シート記事群から asakusa-vs-ueno 等への導線を増やす
  - 7月に実施済みの asakusa-vs-ueno 強化 + Booking.com化の効果はこれからデータに出る
- 関西に芽: namba-vs-umeda 237i / kyoto-station-vs-gion 230i (pos8.8!) / shin-osaka-vs-namba 190i。関西比較ページはBooking未対応 → admin登録すれば収益化可能。
- 旧 /areas-to-stay/tokyo-hotels/* の表示(shinjuku 386i pos36等)は301済み・12ヶ月データの残骸。対応不要。
- 移動系クエリの誤マッチ: 「asakusa to ueno」136i pos23.8、「shin osaka to namba」系 ~60i — 滞在比較ページは答えになっていない。優先度低いが、transfers系ページで拾える余地。

### 4. 次のステップ

- GA4 MCP接続で「検索流入 × affiliate_click率」をページ単位で突合 → CTA改善対象の特定精度が上がる
- 実装候補: P1(guideタイトル)は文言承認後すぐ実施可能。P4の内部リンクとP5のタイトル修正も低リスク。
