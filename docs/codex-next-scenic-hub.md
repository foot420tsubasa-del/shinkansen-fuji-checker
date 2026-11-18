fujiseat.com（/Users/hamaseitsubasa/shinkansen-fuji-checker、Next.js 16 App Router + next-intl）に、景色ルートの一覧ページ /scenic を作って公開してください。いまは景色ルートが14本 live ですが、/scenic は 404 です。各ルートページの「SCENIC ROUTES」の見出しからも行き先がありません。

## 目的
「景色を選ぶ → 路線・どちら側・いつ・切符が分かる」の入口を作ること。検索からの入口、サイト内リンクの受け皿にもする。

## 作るもの（/[locale]/scenic）
1. **見出しと短い導入**（英語。既存の /scenic/[slug] と同じ言語・トーン）。「Japan's scenic train routes: which side to sit on」のように、どちら側に座るかが分かる、という点を前面に出す。
2. **絞り込み**
   - 景色の種類：Mt. Fuji / Mountains / Sea / Gorge・river / Snow / Flowers・countryside / City at night。
   - 季節：Spring / Summer / Autumn / Winter。
   - 実データの tags・view・season を使い、どれにも当てはまらないカードを作らない。
   - JavaScript なしでも全件が見えること。
3. **ルートカード（14本）**
   - 画像（route.image。illustrative なら「Illustrative image」表記を残す）
   - タイトル、路線名、地域
   - 一言の答え：route.teaser、または side から作る
   - 季節の目安
   - 運行の注意：notes に季節運行・終了・期間限定があれば短く出す。例：ノロッコ号は2026/9/23で運行終了、黒部は11/30まで。
   - /scenic/<slug> へのリンク
4. **日本地図**
   - 14本の線路を1枚の地図に描き、クリックでそのルートへ行けるようにする。
   - data/routes/<id>.json の線路は大きいので、スクリプトで1路線100〜200点程度に間引いた軽いファイルを作り、それを使う。例：scripts/build-scenic-overview.mjs → data/scenic-overview.json。
   - 地図タイルや描画は既存の RouteViewMap / FujiViewMap と同じ仕組みに合わせる。
   - 「© OpenStreetMap contributors」の表記を必ず入れる。
   - 地図はページの読み込みを重くしないこと。遅延読み込みで、スマホでも軽くする。
5. **月別の早見表**
   - 「何月に何が見頃か」を各ルートの season から作る。
   - 例：流氷は2月ごろ、紅葉は10〜11月、ラベンダーは7月、雪の山は冬〜春。
   - データにない時期は書かない。
6. **FAQ（2〜3問）と構造化データ**：ItemList（14本）と、必要なら FAQPage。
7. **既存ページとのつなぎ**
   - 各 /scenic/[slug] の「SCENIC ROUTES」見出しを /scenic へのリンクにする。
   - sitemap に /scenic を追加する。
   - hreflang / canonical は既存の /scenic/[slug] の扱いに合わせる。

## 絶対に守ること
- トップページ（app/[locale]/page.tsx・HomeClient.tsx）とヘッダー・メニューは**変更しない**。11/29 にデザイン変更の効果測定があるため、/scenic への入口をトップやメニューに足すのはその後にする（報告に「後でやること」として書く）。
- /guide、/shinkansen-seat-letters、座席チェッカー→Klook の導線（guide_seat_result など）、/guide の Klook お試しリンクに触れない。
- 一覧ページにアフィリエイトのボタンは置かない（各ルートページに任せる）。新しいアフィリエイトURLも作らない。
- 金額を書かない。事実を推測で書かない。文言はすべて data/scenic-routes.json の内容から作り、データにないことは書かない。
- データはデータファイルに置き、ページ内に直書きしない。
- デザインは既存の /scenic/[slug] と同じ見た目の部品（色・角丸・カード・文字）に合わせる。新しいデザインを作り込まない。
- 画像は追加しない（既存の route.image だけ使う）。PNG はコミットしない。
- .env*、secrets/ は読まない・コミットしない。
- git は /Library/Developer/CommandLineTools/usr/bin/git を使う。python3 は使えないので、編集は node で行う。

## テスト（scripts/affiliate-checks.test.mjs に追加）
- /scenic が live の全ルートを1回ずつ載せていること。candidate は載せない。
- 各カードのリンク先 slug が存在すること。
- 地図用の間引きファイルが、live の全ルートを含み、1ルートあたり点数が上限以下であること。
- ページとそのファイルに、アフィリエイトのリンクや金額（yen、¥）が無いこと。
- HomeClient.tsx とヘッダーのファイルに差分が無いこと（git diff で確認するテストでも、目視の報告でもよい）。

## 確認（毎回）
1. `node --test scripts/affiliate-checks.test.mjs` がすべて通ること（いまは83件）。
2. `npx tsc --noEmit` が通ること。
3. `rm -rf .next/dev/types && npm run build` が成功すること。
4. 開発サーバーで /scenic を開き、次を確かめる。
   - 絞り込みが動くこと。
   - 地図からリンクで移動できること。
   - スマホ幅（375px）で横にはみ出さないこと。
   - コンソールにエラーが出ないこと。ただし、開発時だけの Travelpayouts の "config is not valid" は既存のものなので無視してよい。
   - ページの重さ（初回に読み込む JS と画像）を報告する。
5. main に push したあと、本番で次を確認する。
   - /scenic が 200 を返し、sitemap.xml に載っていること。
   - 14本の /scenic/<slug> が 200 を返すこと。
   - /guide と /?from=Tokyo&to=Kyoto が正常なこと。

## 報告（日本語で）
- 作ったもの（画面の説明、スクリーンショットがあれば添付）
- 絞り込み・月別早見表の分類を、どのデータから作ったか
- 地図用ファイルのサイズと、ページの重さ
- 迷ったところ・データ不足で書かなかったこと
- 11/29 以降にやること（トップ・メニューから /scenic への導線など）の提案
