# 東京の「泊まること自体が目的になるホテル」特集の調査（2026-11-21）

**結論：まだ本番公開しない。**

公開の条件は「有効な提携リンクと、特別な客室を予約できる予約先が2件以上」。現時点で満たすのは MIMARU Tokyo Ueno East の1件だけ。残りのリンクは URL管理シートに登録した（§7）。

ページは別ブランチ `stays-tokyo-special` で用意した。2件目のリンクが発行されたら公開する。

## 1. 検索需要（米国・カナダ・豪州）

**月間検索数：すべて未確認。** Google キーワードプランナーと SEO ツールは使える環境がない。Google Trends は 429（アクセス過多）で取得できなかった。fujiseat の Search Console（関連語は表示0）は、市場全体の需要ではない。

下の表は、検索結果の上位の構成から読める「検索意図」と「参入の余地」の評価。需要の大きさを示すものではない。

| キーワード群 | 検索意図 | 予約意欲 | 上位に出ているサイト（2026-11-21） | 個人メディアの余地 | 収益化との相性 |
|---|---|---|---|---|---|
| hotels with Tokyo Tower view room | 特定の客室を探している | 高い | プリンス パークタワーの公式ページ（Tower View Room）、Agoda、Traveloka、tsunagu Japan、Michelin Guide、LIVE JAPAN、Tokyo Cheapo、楽天トラベル | 中。予約サイトと旅行メディアが混在している。客室タイプまで書いたページは少ない | 高い。Booking.com で「with Tokyo Tower View」の客室を選べる |
| hotels with Tokyo Skytree view | 同上 | 高い | 東武、Agoda、Expedia、Hotels.com、LIVE JAPAN（浅草の10軒） | 中 | 中。客室名と眺望の対応を、公式で確認する必要がある |
| Pokemon hotel Tokyo / MIMARU Pokemon room | 体験と予約 | 高い（家族） | MIMARU 公式、Time Out、Euronews、AOL、Lonely Planet、Unseen Japan | **中〜高**。ニュース記事が中心で、「東京のどの館で、どの客室タイプを選べばよいか」を比べたページは少ない | 高い。Booking.com で「Pokémon ROOM」を選べる（東京の5館すべて） |
| themed hotels in Tokyo for families / character hotels | 比較・情報収集 | 中 | AOL、Time Out、Klook ブログ（家族向けホテル12選）、MIMARU | 中 | 中 |
| sumo hotel Tokyo / sumo themed hotel | 情報収集 | 低〜中 | Tokyo Weekender、SoraNews24、相撲レストランの記事、Park Hotel Tokyo の部屋の告知 | 低。対象が少ない | 低い（下記） |
| unique / unusual hotels in Tokyo | 情報収集 | 低〜中 | Lonely Planet、Time Out、Hotels.com、tsunagu Japan、Expedia マガジン、qz | **低**。大手メディアが上位を占めている | 中 |

## 2. 競合（参考：thejapantravelguy.com/tokyo/hotels）

- 「Where to Stay in Tokyo」：16軒を4段階で紹介。各ホテル1行で、客室タイプの記載はない。更新日の表示も、写真の出典もない。予約サイトへのリンクは、抽出したテキストでは確認できなかった。
- 上位のニュース記事（Time Out、Euronews）：館の一覧と写真（MIMARU 提供）が中心。「Booking.com でどの客室を選ぶか」「通常の部屋とどう違うか」は書いていない。
- **fujiseat が出せる独自の価値**
  - 予約サイト上の**客室タイプ名**（例：「Pokémon ROOM」「… with Tokyo Tower View」）を確認し、それ以外の部屋では体験できないことを明記する。
  - 定員・家族向けの設備・特典の条件を、公式の記載に基づいて書く。
- 注意：競合のデザインや更新状況は判断材料にしていない。上位はメディアの力（Time Out、Lonely Planet）によるもの。

## 3. 候補ごとの確認結果

| テーマ | ホテル | 特別な客室（Booking.com の表記） | 公式で確認したこと | 提携リンク |
|---|---|---|---|---|
| ポケモン | MIMARU Tokyo Ueno East | **Pokémon ROOM**（シングル4台・4名・40㎡・キッチン付き） | <ul><li>ポケモンルームは東京の5館（池袋・錦糸町・上野East・銀座East・八丁堀）。</li><li>4〜6名、38〜60㎡。ロフト・二段ベッド・シングル4台のいずれか。</li><li>デザインは選べない。</li><li>特典は1予約1セット。</li><li>公式予約の客室コードは NewPOKE。</li></ul> | **発行済み** `booking.tpx.lv/BlB2MtgA` |
| ポケモン | MIMARU Tokyo 池袋・錦糸町・銀座East・八丁堀 | Pokémon ROOM（4館とも掲載あり） | 同上 | 未発行（シート193〜196行目） |
| 眺望 | The Prince Park Tower Tokyo | 「Corner King / Deluxe Twin / Panoramic Twin / Club King など **with Tokyo Tower View**」（12種類以上） | <ul><li>公式に「Tower View Rooms」のページがある。</li><li>フロア構成：Premium Club 29〜32F、Panoramic 19〜28F、Park 3〜18F。</li><li>住所は港区芝公園4-8-1。</li><li>最寄り駅は公式では未確認。</li></ul> | 未発行（シート192行目） |
| 眺望 | Lotte City Hotel Kinshicho | 「… Tower view Twin / Triple」 | 公式サイトが404で、「Tower」がスカイツリーか確認できない | **保留**（未登録） |
| 眺望 | Park Hotel Tokyo | 未確認 | 公式サイトが404。Booking.com の検索でも特定できなかった | 保留 |
| 相撲 | Stay SAKURA Tokyo 浅草 横綱 Hotel | Booking.com に掲載はあるが、ページ内に相撲の記載がない | 公式サイトが404。「元相撲部屋を改装」は Tokyo Weekender の記事のみ（公式で未確認） | **見送り** |

## 4. 収益性

**報酬条件：未確認。** Travelpayouts 経由の Booking.com の料率、計算の基準（宿泊額か、Booking.com の手数料に対する割合か）、キャンセル時の扱い、承認の条件は、Travelpayouts の管理画面で確認する必要がある。公開されている一般的な料率は使っていない。

- 過去の実績：Booking.com のリンクは2026-11-15〜20に導入したばかりで、成果はまだない（ローカルにデータなし）。
- 価格の参考（Booking.com、2027年3月10〜12日の2泊、税込、2026-11-21に閲覧）
  - MIMARU Ueno East「Pokémon ROOM」：大人2・子ども2で **US$802**（2泊）。無料キャンセルは1週間前まで。
  - Prince Park Tower「… with Tokyo Tower View」：大人2名で **US$690〜983**（2泊）。
- **計算例（仮定。予測ではない）**
  - 仮定：報酬 = 宿泊額 × r。r は未確認なので、2% / 4% の2通りで計算した。キャンセル・未承認で20%が減ると仮定した。
  - 1件 US$800 の場合：US$800 × 0.8 × r = 1件あたり約 US$13（r=2%）〜 US$26（r=4%）。約2,000〜4,000円。
  - 月3万円 → 約8〜15件。月10万円 → 約25〜50件。
  - 必要な訪問数（仮定：予約リンクのクリック率10%、クリックからの成約率2%）
    - 月3万円：8〜15件 ÷ (0.10 × 0.02) ＝ **月4,000〜7,500訪問**
    - 月10万円：**月12,500〜25,000訪問**
  - 現在の fujiseat で最も表示の多い /guide でも、米国・カナダ・豪州の検索流入は90日で80クリック程度。この特集だけで月10万円は、現実的な見込みではない。

## 5. サイト構造

| 案 | UX | SEO | 既存の導線 | 工数 | 判断 |
|---|---|---|---|---|---|
| A：Where to stay 内で分岐（Choose your area / Find a special hotel） | 宿を探している人の流れに合う | /areas-to-stay の評価を活かせる | 既存の診断を壊さない | 小 | **採用** |
| B：ナビゲーションを Stays に整理 | 分かりやすい | 中立 | ヘッダーの変更は全ページに影響する | 中 | 掲載ホテルが増えてから |
| C：トップに入口 | 見つけやすい | なし | **11/29 のトップ計測と衝突する** | 小 | 11/29 の判定後に、1行のリンクとして追加 |

## 6. 用意したページ（未公開・ブランチ `stays-tokyo-special`）

- `/stays/tokyo-special`：「Pokémon Rooms in Tokyo」と「Rooms Facing Tokyo Tower」の2章。相撲は外した。
- 各ホテル：予約サイト上の客室名、定員、公式の注意点、公式サイトへのリンク。
- Booking.com のボタンは、**提携リンクが発行済みのホテルだけ**に表示する。GA4 の placement は `tokyo_special_stay`、`link_id` は `bookingHotel.<id>`。

## 7. 発行が必要なリンク（URL管理シート 192〜196行目）

| 行 | ホテル | 優先度 |
|---|---|---|
| 192 | The Prince Park Tower Tokyo | P1（これで公開条件を満たす） |
| 193 | MIMARU Tokyo Ikebukuro | P1 |
| 194 | MIMARU Tokyo Kinshicho | P1 |
| 195 | MIMARU Tokyo Ginza East | P1 |
| 196 | MIMARU Tokyo Hatchobori | P1 |

発行方法：Travelpayouts の Booking.com リンク生成ツールに、「商品・行き先（参考）」列の Booking.com の URL を入れて変換し、「アフィリエイトURL」列に貼る。

## 8. 最終判断

- **追加投資**：小さく始める。まず2テーマ・6軒で公開し、8週間の表示・クリック・予約を見る。
- **優先テーマ**
  1. **ポケモン（MIMARU）**：家族客で、宿泊額が大きく、予約サイトで客室タイプを選べる。上位はニュース記事が中心で、比較ページの余地がある。
  2. **東京タワービュー（プリンス パークタワー）**：客室タイプが明確で、宿泊額も大きい。
  3. 相撲は見送り。
- **独立サイトにする価値**：現時点ではない。需要を数字で確認できておらず、fujiseat の鉄道・宿泊の読者からの送客が主になるため、fujiseat 内で育てる。

## 9. 11軒に拡大して公開（2026-11-21）

ユーザーの依頼「ポケモンばかりでなく、最低10軒」に対応した。採用の条件は次の2つ。
- Booking.com で、特別な客室が**客室タイプ名**として販売されている（読者が選べる）。
- 特徴を公式サイトで確認できる。公式を確認できなかったものは、ページにその旨を書いた。

| テーマ | ホテル | Booking.com の客室タイプ名 | 公式での確認 | 提携リンク |
|---|---|---|---|---|
| スカイツリー | 浅草ビューホテル | 「… with Skytree Side」、「Executive Deluxe King with View Bath and Skytree Side」 | 公式に「Sky Tree View Side」 | 未発行 |
| スカイツリー | 東武ホテルレバント東京 | 「… with Tokyo Sky Tree View」（ほかの部屋は「No Tower View」と表記） | 公式（日本語）に「スカイツリーが目の前に見える部屋」。JR錦糸町駅北口から約3分 | 未発行 |
| スカイツリー | 京成リッチモンドホテル東京押上 | 「(Skytree View) …」 | 公式サイトが見つからず（ページに明記） | 未発行 |
| スカイツリー | ホテル イースト21東京 | 「Deluxe Family Room with Sky Tree View」（大人2〜4名） | 公式サイトがメンテナンス中（ページに明記） | 未発行 |
| 東京タワー | ザ・プリンス パークタワー東京 | 「… with Tokyo Tower View」（12種類以上） | 公式の Tower View Rooms | 未発行 |
| 東京タワー | パークホテル東京 | 「… Tokyo Tower Side」（26階以上） | 公式：客室は26〜34階、汐留駅から徒歩1分 | 未発行 |
| 東京タワー | ザ・東京エディション虎ノ門 | 「Premier Tower View King … Tokyo Tower view」 | 公式が 403 で確認できず（ページに明記） | 未発行 |
| テーマ | MIMARU ポケモンルーム（東京5館） | 「Pokémon ROOM」 | 公式 LP | **上野East のみ発行済み** |
| テーマ | ホテルグレイスリー新宿 | 「Standard Twin on the Highest Floor (Godzilla Floor)」 | 公式（日本語）：最上階30階は35室の「ゴジラフロア」。ゴジラルーム（1室）とゴジラビュールーム（6室）は公式サイトで予約。JR新宿駅東口から徒歩5分 | **発行済み** |
| テーマ | 変なホテル東京 西葛西 | 「Concept Twin Room - Dinosaur」 | 公式（日本語）：恐竜ロボットのチェックイン、恐竜ルームは2室で大人3名まで、ディズニー方面への無料送迎バスあり、西葛西駅から徒歩3分 | 未発行 |
| デザイン | パークホテル東京 アーティストルーム | 「Artist Queen / King / Single」 | 公式：50室以上。アーティストが壁に直接描いた部屋。作品は当日の割り当てで、希望を3つまで出せる | 未発行（上と同じホテル） |
| デザイン | 三井ガーデンホテル銀座プレミア | 「… with View Bath」 | 公式に「View Bath」の部屋と16階のロビー | 未発行 |

**見送ったもの**
- ザ・ゲートホテル雷門、リッチモンドホテルプレミア浅草インターナショナル、東京プリンスホテル、プリンス さくらタワー、マンダリン オリエンタル：客室タイプ名に眺望の記載がなかった。
- remm 六本木：「Tower View」が東京タワーを指すか確認できなかった。
- ロッテシティホテル錦糸町：「Tower view」がスカイツリーを指すか確認できなかった。
- Stay SAKURA 横綱（相撲）：公式サイトで確認できなかった。

**公開の条件**：MIMARU 上野East とホテルグレイスリー新宿の2軒で、発行済みのリンクと、選べる特別な客室がそろったので公開した。Booking.com のボタンは、リンクが発行済みのホテルにだけ表示する。

**リンクの遷移先**：グレイスリーの tpx リンクは、Booking.com の東京の検索結果に、そのホテルを先頭に表示する形で開く（ホテルの個別ページではない）。そのため、「ホテルをタップしてから客室タイプを選ぶ」と本文に明記した。

**計測を汚した可能性**：表示確認のテスト中に、ナビゲーションの抑止がうまく働かず、グレイスリーと MIMARU のリンクを実際に開いた可能性がある（最大2クリック、予約なし）。2026-11-21 の Travelpayouts のクリックを集計するときは、この分を除く。

**追加で発行が必要なリンク**：URL管理シートの192〜204行目（13軒）。
