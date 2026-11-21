# アクティビティハブ /things-to-do（2026-11-21）

英語版のみのページです（英語以外は noindex）。文面と出典は `data/things-to-do.json` にあります。

## 1. 商品の確認結果

施設の情報は、各施設の公式サイトで2026-11-21に確認しました。Klook の商品ページは、セキュリティ認証のため直接読めませんでした。認証は回避していません。Klook 側の内容は、検索結果の要約と既存の発行済みリンクで確認しています。

| 商品 | Klook activity | 既存の広告ID | 公式で確認したこと | Klook 側 |
|---|---|---|---|---|
| teamLab Planets | 25300 | **1581383**（発行済み・転送先は11/21に確認済み） | 豊洲。新豊洲駅から徒歩3分。日時指定で、価格は日によって変わる。売り切れあり。裸足で、膝まで水がある部屋がある。ショートパンツの無料貸出あり。**2027年末まで** | 検索ではメインの商品ページを確認。ID 25300 そのものは検索で見つからなかった |
| teamLab Borderless | 20707 | **1263775** | 麻布台ヒルズ。神谷町駅から徒歩2分。Entrance Pass（時間指定）と Flexible Pass（日付指定）。再入場不可。地図がない | 検索で ID 20707 の商品ページを確認（2種類のパス） |
| USJ スタジオ・パス | 46604 | **1263782** | <ul><li>スタジオ・パスで入場する（日付指定、価格は日によって変わる、再入場不可）。</li><li>エクスプレス・パスは入場券ではない（公式：「入場券をお持ちの方は」）。</li><li>転売サイトやオークションで買ったチケットは無効になる。</li><li>**Klook は USJ 公式の旅行会社一覧に載っている**。</li></ul> | 検索で ID 46604 の Studio Pass を確認 |
| teamLab Biovortex 京都 | 167098 | **なし** | 2025-10-07に開業。京都駅の八条東口から徒歩7分。Entrance / Flexible Pass。再入場不可 | — |
| 東京ディズニーリゾート | 695 | **なし** | <ul><li>1デーパスポートは「来園日とパーク」を指定する。価格は日によって変わる。</li><li>舞浜駅（JR京葉線）。所在地は千葉県浦安市舞浜。</li><li>公式サイトに転売対策の注意あり。</li></ul> | — |

## 2. 報酬率と収益性

| 商品 | 販売価格 | 報酬率 | 1件あたりの想定報酬 | 送客との相性 | 採用 |
|---|---|---|---|---|---|
| teamLab Planets | 日によって変わる（公式で大人 ¥3,600〜） | 未確認 | 未確認 | 中（東京に泊まる人向け） | 採用 |
| teamLab Borderless | 日によって変わる | 未確認 | 未確認 | 中 | 採用 |
| USJ スタジオ・パス | 日によって変わる | 未確認 | 未確認 | 中（大阪・ゴールデンルート向け） | 採用 |
| teamLab Biovortex | 日によって変わる | 未確認 | 未確認 | 高（京都駅前で、新幹線の読者と相性がよい） | 保留（広告IDなし） |
| 東京ディズニーリゾート | 日によって変わる（公式で大人 ¥8,900〜） | 未確認 | 未確認 | 低〜中 | 保留（広告IDなし） |

- Klook の明細に、この5商品の予約もクリックもない。報酬率は管理画面で確認が必要。
- 実績のある料率は、ツアーの5%（2026-09、1件）と鉄道の約1.3%だけ。他社ネットワークの公開料率は使っていない。
- **検索需要**：fujiseat の Search Console（180日）で、teamlab・disney・usj・things to do 系の表示は合計28、クリック0。
- **競合**：Klook 自身のブログ（teamLab Planets vs Borderless など）を含め、競合は強い。
- **見込み**：送客は、既存ページ（東京の宿、ゴールデンルート）からの内部リンクが中心になる。収益は「小さく始めて計測する」段階。

## 3. 導線と計測

- `affiliate_click`
  - `category=activity`、`provider=klook`、`product=attraction_ticket`、`placement=things_to_do_ticket`
  - 商品は `link_id`（teamlabPlanets / teamlabBorderless / universalStudiosJapan）と `adid` で区別する。`city`（tokyo / osaka）も付く。
- `rel="sponsored nofollow noopener noreferrer"`。各ボタンの下に PR 表記。
- 内部リンク（英語のみ）：
  - `/areas-to-stay` の末尾 → `/things-to-do#tokyo`
  - `/scenic/golden-route` の末尾 → `/things-to-do#kyoto`
- トップ・/guide・/plan-your-trip（9言語、収益カードあり）・座席の回答画面には追加していない。

## 4. 写真

施設の写真は使っていない。teamLab の作品は著作物で、ディズニーと USJ にはキャラクターと商標の問題があるため。都市の写真は、既存のライセンス確認済みのものを再利用し、出典を表示している（CC BY 4.0、CC BY-SA 4.0、CC BY-SA 2.0）。

## 5. 次にやること

- **Klook で発行してほしいリンク**：teamLab Biovortex 京都（activity 167098）、東京ディズニーリゾート 1デーパスポート（activity 695）。
- Klook の管理画面で、上の5商品の報酬率と除外条件を確認する。
- 公開8週間後に、表示・クリック・`things_to_do_ticket` のクリックと予約を確認する。個別記事を作るかはその後に判断する。候補は「teamLab Planets vs Borderless」。

## 6. 仕上げ（2026-11-21）

### 既存ページからの導線

| ページ | 判断 |
|---|---|
| /areas-to-stay | 末尾に東京へのリンクがある（前回）。京都の欄に「Biovortex は京都駅から徒歩7分」、大阪の欄に「USJ に行くなら先に買うもの」を追加（英語のみ） |
| /plan-your-trip | Activities の説明文の下にテキストリンクを1本追加（英語のみ）。既存の Klook 都市カード（`plan_trip_activity_cards`）は変更なし |
| /itineraries | 追加なし。旅程ページには、すでに USJ と teamLab Borderless の Klook ボタンがあり、noindex でもある |
| /scenic/golden-route | 末尾にリンクがある（前回）。追加なし |
| 京都・大阪の宿の比較ページ | 301で /areas-to-stay にまとめ済みなので、上の京都・大阪の欄で対応 |

### 施設の写真・公式の販促素材
- Klook Affiliate Portal の公開ページには「widgets, search boxes, banners」があると書かれている。ただし、素材ごとの利用条件と報酬率はログインしないと見られない。今回はログインしていないので**未確認**。
- 権利が確認できた施設写真はない。teamLab は作品の著作権、ディズニーと USJ はキャラクターと商標の問題がある。**現状（都市の写真）のまま**にした。

### 3商品の報酬条件
- 広告IDと商品URL（k_site）は一致している：1581383 → activity 25300、1263775 → 20707、1263782 → 46604。
- 報酬対象かどうか・報酬率・除外条件は**未確認**（管理画面へのログインが必要）。

### Biovortex とディズニー、どちらから広告IDを発行するか
**先に Biovortex**。理由：
- 京都駅から徒歩7分で、新幹線・ゴールデンルートの読者の動線上にある。
- 公式の情報がページにすでにある。
- 第三者のレビューで、Klook は「authorised reseller」とされ、売り切れが多い（＝事前予約の需要がある）。

ディズニーは後回し。舞浜（千葉）で鉄道コンテンツとのつながりが弱く、競合は Klook・Trip.com・ファンサイトと非常に強い。

### SEO と送客
- **自然検索**：「Planets vs Borderless」「Disneyland vs DisneySea」「USJ の Express Pass に入場は含まれるか」は、Klook のブログ、Tokyo Cheapo、japan-guide、多数のブログが上位にいる。新しいページが上位に入る見込みは低い。28表示は fujiseat の実績で、市場全体の需要ではない。
- **既存の流入から送る（主力）**：/areas-to-stay、/plan-your-trip、/scenic/golden-route からの内部リンク。
- 本文に追加したこと：「1館しか行けないなら、Planets は2027年末で終了、Borderless は常設」（公式の情報）。

## 7. 最終UXチェックとリンク発行の記録（2026-11-21）

### URL管理シートへの記載
- 取得待ち（未発行）として2行追加（`data/affiliate-wishlist.json` と同じ内容）。
  - 190行目：[P1] teamLab Biovortex 京都（Klook activity 167098）
  - 191行目：[P2] 東京ディズニー 1デーパスポート（activity 695）
- 37・38・178行目（USJ・Borderless・Planets）の「使っている場所」に /things-to-do を追記。

### /plan-your-trip
| 項目 | Before | After |
|---|---|---|
| Klook 都市カードの画像 | `<img loading="lazy">` で原寸（1448〜1672px、106〜317KB）を配信。背景がないため、スマホでは読み込み中の数秒間、カードの上半分が空白に見えた（本番の375pxで、表示位置に入ってから2.5秒後も読み込み未完了。数秒後には表示された）。読み込み失敗ではなく、CSS の問題でも Klook 側の仕様でもない | next/image で、カードの大きさに合わせた画像を配信（スマホ375pxで750w、1440pxで340px幅）。読み込み中は薄い灰色の背景を表示。画像ファイルは同じものを使用 |
| ホテルの説明の重複 | 「Do not book hotels before these route decisions」と「Do not book hotels before the route shape is clear」の2つの枠に、同じ本文があった。2つ目は英語の固定文で、英語以外の8言語でも英語のまま表示されていた | 1つの枠にまとめた（翻訳された見出しと本文 ＋ 既存の Stay Finder ボタン）。placement `plan_trip_hotel_base_next_step` はそのまま |
| 英語のボタン名の重複 | 「Compare Tokyo stay areas」が2つ並び、どちらも /areas-to-stay へのリンクだった | 2つ目を「Try the Tokyo Stay Finder」に（他の言語ではすでに「エリアファインダー」の意味で翻訳されていた）。URL と placement `plan_trip_stay_hub_finder` は維持。GA4 の label はこの文言に変わる |

アフィリエイトのリンク、広告ID、placement は変更していない。

### アクティビティ関連の制作はここで区切る
次は計測の段階（評価方法は §6）。

## 8. Biovortex とディズニーのリンクを反映（2026-11-21）

- URL管理シートの190・191行目に貼られた発行済みURLを反映した。形式を確認済み：aid=104861、広告IDは数字、k_site は商品と一致。
  - teamLab Biovortex 京都：広告ID **1584870** → activity 167098（`link_id=teamlabBiovortex`、city=kyoto）
  - 東京ディズニー 1デーパスポート：広告ID **1584871** → activity 695（`link_id=tokyoDisney1Day`、city=tokyo）
- ディズニーの購入先：TDR 公式の購入ページは「一部の旅行会社」とだけ書いており、Klook の名前はない。そのため、ページでは Klook を「公認」とは書いていない。テストでも確認する。
- Biovortex の紹介文の「newest」（最新館）は確認できない表現なので、「2025年10月開業」に変更した。
- 報酬率・除外条件は未確認のまま。
- `/things-to-do` の Klook ボタンは5本（placement `things_to_do_ticket`）。
