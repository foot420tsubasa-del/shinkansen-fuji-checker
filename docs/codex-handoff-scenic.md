fujiseat.com（/Users/hamaseitsubasa/shinkansen-fuji-checker、Next.js 16 + next-intl）の「景色ルート」ページを、残り3本作って公開してください。
1. 富良野・美瑛ノロッコ（id: furano-biei-flowers）
2. 釧網本線の流氷（id: senmo-drift-ice）
3. 只見線（id: tadami-river）

3本とも data/scenic-routes.json に status "candidate" で入っていて、画像（image）も設定済みです。
1本ずつ「作る → 確認 → コミット → push → 本番確認」の順で進めてください。Vercel は main への push で自動デプロイされます。

## 絶対に守ること
- 収益を止めないこと。/guide、/shinkansen-seat-letters、座席チェッカー→Klookの導線（guide_seat_result など）には触れない。
- /guide の Klook 文中リンク2本は 12/1 判定のお試し中なので、そのままにする。
- アフィリエイトURLを新しく作らない。data/affiliate-links.json に既にあるIDだけを使う（北海道向けの専用リンクは無いので、基本は jrPass）。
- Klook の k_site を手で書き換えない。
- 公式のURLや事実を推測で書かない。確認できないことは書かずに「未確認」として報告する。
- 切符の案内に金額を書かない（テストで落ちます）。商品の一言説明＋アフィリエイトボタン、公式は小さな「Official details」行だけにする。
- .env*、secrets/ は読まない・コミットしない。
- git は /Library/Developer/CommandLineTools/usr/bin/git を使う。python3 は使えないので、編集は node で行う。
- 画像は追加しない（設定済み）。PNG はコミットしない。

## 作り方（既存の11本と同じ流れ）
お手本は data/scenic-routes.json の次の3本です。
- kurobe-gorge：谷・季節運行・運行状況を notes に書く
- gono-coast：海・折り返し（reversals）
- tohoku-iwate：山
docs/ と、最近のコミット（git log -15）も先に読んでください。

1. **駅の位置**：OSM Overpass で駅ノードを取得し、stations（name, ja, lat, lng）を入れる。
2. **線路**：osm（name, bbox, 必要なら chain:true / joinM:800）を入れて、`node scripts/fetch-route-geometry.mjs <id>` を実行する。
   - 各駅の線路上 km と全長を、公式の営業距離と必ず比べる。
   - 平均化モードはカーブで短くなり、chain モードは別線に迷い込むことがある（上越で実際に起きた）。合う方を使う。
   - Overpass はよく拒否されるので、リトライする。広い bbox が通らないときは、一時エントリで区間に分けて取り、駅でつなぐ（東北で実施済み）。
3. **見る対象（targets）を決める**
   - 山：`node scripts/refine-summits.mjs <id> [半径km]` で国土地理院の最高地点に合わせてから `--apply`。「search edge」警告が出たら座標を見直す。
   - 海：type "sea"。
   - 谷：type "valley"（reach / minDrop、demZoom 14, observerHeight 3）。
4. **計算**：`node scripts/compute-viewshed.mjs <id>` で区間と左右を出し、views を作る（side は進行方向基準）。
   - 公開されている情報（公式、ガイド記事、鉄道ブログ）と左右を照合し、basis と verification に根拠を書く。
   - 照合できないものは「terrain model」とだけ書く。座席記号は確認できたときだけ書く。
5. **時刻**：timing.kind "timetable"。公式時刻表から、往復1本ずつ（できれば2種類）の全停車駅の時刻を写す。
   - timelineStations の km は列車の走る道のりの累積。trackKmOffset で線路 km とずらす。
   - 列車の停車駅は、すべて timelineStations に含める。
   - 途中で折り返す場合は reversals に駅名を入れる。
6. **ページの中身**：status "live"、slug、href、viewshed、page（title, description, h1, labelStations）、ticketGuide（verdict, options, sources, links）、faq、notes（運行状況・季節運行の注意）、chip、teaser。
7. **仕上げ**
   - `node scripts/scenic-seen.mjs` を実行する（seenKm を200m間隔で書き込む）。
   - components/scenic/RouteTimeline.tsx の VIEWSHED_LOADERS に1行足す。
   - 必要なら lib/scenic.ts の ALIASES に駅名の別表記を足す。
8. **テスト**：scripts/affiliate-checks.test.mjs に、ルート別のテストを1つ足す（例：Kurobe / Resort Shirakami のテスト）。
   - 左右・順番・往復で左右が反転すること・検索で live になること・注意書きを確認する。
   - JR以外の路線なら「JR Pass card」テストの私鉄リストに追加する。
   - 新しい公式ドメインを sources に使うなら official リストに追加する。
   - 既存テストの「coming soon」の例（Tokyo→Sapporo）が live になる場合は、別の例に替える。

## ルートごとの注意
- **ノロッコ号（富良野線）・流氷物語号（釧網本線）は季節運行**です。
  - 2027年の運転日・時刻が公式に出ていなければ、通年運行の普通列車の時刻表で timeline を作る。
  - 観光列車は notes に「季節運行・公式で日程確認」と書く。
  - 去年の時刻を今年のものとして書かない。
- **只見線は1日数本**です。会津若松〜小出の直通または主要列車を使い、本数が少ないことを notes に書く。
- **JR北海道・JR東日本の運行情報**
  - jreast.co.jp は自動取得を 403 で拒否する。JR東日本は timetables.jreast.co.jp/en/2611/... の列車ページを使う。
  - JR北海道は公式サイト（jrhokkaido.co.jp）の時刻表・運行情報を確認する。

## 確認（毎回）
1. `node --test scripts/affiliate-checks.test.mjs` がすべて通ること（いまは80件）。
2. `npx tsc --noEmit` が通ること。
3. `rm -rf .next/dev/types && npm run build` が成功すること。
4. 開発サーバーで /scenic/<slug> を開き、次を確かめる。
   - 画像・タイムライン・地図・FAQ・アフィリエイトのPR表記が出ていること。
   - スマホ幅（375px）で横にはみ出さないこと。
   - トップの検索（?from=&to=）で答えが出ること。ブラウザのタブが裏にあると requestAnimationFrame が動かないので、前面のタブで確認する。
5. push 後に本番を確認する。
   - /scenic/<slug> が 200 を返し、sitemap.xml に載っていること。
   - /guide と /?from=Tokyo&to=Kyoto が正常なこと。

## 報告（日本語で）
ルートごとに次を書いてください。
- 答え（どちら側か）と、その根拠・出典URL
- 使った時刻表の列車と出典、運行期間
- 未確認のこと
- 公開URL

最後に、残った課題をまとめてください。
