fujiseat.com（/Users/hamaseitsubasa/shinkansen-fuji-checker、Next.js 16 App Router + next-intl）で、景色ルートページ（/scenic と /scenic/<slug>、14本）について、次の2つをやって公開してください。
- A. 既存の記事・ページから関連する景色ページへのリンクを張る
- B. 近くに泊まれる宿のリンクを、既存のアフィリエイトデータがあるルートにだけ足す

## A. 既存ページ → 景色ページへのリンク
1. **候補を洗い出す**：サイト内のページを走査し、景色ルートと本当に関係する場所を一覧にする。
   - 対象：/areas-to-stay 配下、/blog、/how-to-buy-suica 配下、/airport-transfers 配下、各種ガイド記事など。
   - 例：河口湖・富士五湖 → /scenic/fujikyu、箱根 → /scenic/hakone-tozan、嵐山・嵯峨・京都 → /scenic/sagano、お台場・豊洲 → /scenic/yurikamome、鎌倉・江ノ島 → /scenic/enoden、金沢 → /scenic/hokuriku-shinkansen、仙台・盛岡・青森 → /scenic/tohoku-shinkansen、越後湯沢・新潟 → /scenic/joetsu-shinkansen。
   - 関係が薄い場所には張らない。1ページあたり最大2本まで。
2. **入れ方**：本文の流れに合う短い一文＋テキストリンク（例：「Riding the Hakone Tozan? See which side the valley is on →」）。ボタンや大きなカードにしない。
3. 9言語あるページは、その言語の文で入れる。翻訳が難しい言語は英語のままにせず、その言語ではリンクを入れない（報告に書く）。
4. 既存の SEO（タイトル・meta・構造化データ・canonical・hreflang）は変えない。

## B. 景色ページに「近くに泊まる」ブロック
1. 使ってよいのは、**すでにあるデータだけ**です。
   - data/hotel-links.json（Trip.com、エリア別）
   - data/booking-hotel-destinations.json（Booking.com/Travelpayouts、エリア検索）
   - data/stay-hotel-picks、data/hotel-pick-links.json（個別ホテル）
   - **新しいアフィリエイトURLは作らない。Agoda は使わない**（サイトでは表示しない設定）。
2. **ルートと宿のエリアが本当に合うときだけ出す**。合うデータがないルート（東北・上越・黒部・五能線・富良野・釧網・只見・江ノ電など）には出さない。
   - 例：fujikyu ↔ kawaguchiko、hakone-tozan ↔ hakone、sagano ↔ kyotoStation / gion（嵐山のエリアデータが無ければ「京都に泊まって日帰り」と正直に書く）、yurikamome ↔ ariake-odaiba / toyosu。
   - 対応表は data ファイルに置く（例：data/scenic-stays.json）。ページに直書きしない。
3. **見た目**：切符ブロックの下に小さく置く。見出し＋1〜2行の説明＋リンク1〜2個。既存の宿 CTA 部品（components/affiliate の HotelCTA / ProviderChoiceCTA など）と、/areas-to-stay の Stay Finder の書き方・計測に合わせる。
4. **計測**：新しい placement 名（例：`scenic_route_stay`）を lib/affiliate の型に追加し、既存と同じイベントでクリックを送る。
5. **表示**
   - アフィリエイトのリンクには、必ず既存と同じ PR／手数料の注記を付ける。
   - rel は既存の AFFILIATE_REL を使う。
   - 金額や「最安」などの値段の話は書かない。

## 絶対に守ること
- /guide、/shinkansen-seat-letters、座席チェッカー → Klook の導線（guide_seat_result など）、/guide の Klook お試しリンク（12/1 判定）に触れない。
- トップページ（app/[locale]/page.tsx・HomeClient.tsx）とヘッダー・メニューは**変更しない**（11/29 の効果測定のため）。
- 既存の切符ブロック（TicketGuide、SearchTicketCard、ScenicPassCard）の中身・順番・計測を変えない。
- Klook の k_site を手で書き換えない。事実を推測で書かない。
- .env*、secrets/ は読まない・コミットしない。画像は追加しない。
- git は /Library/Developer/CommandLineTools/usr/bin/git を使う。python3 は使えないので、編集は node で行う。

## テスト（scripts/affiliate-checks.test.mjs に追加）
- 景色ページの宿リンクが、すべて既存データ内の URL であること。Agoda の URL が無いこと。
- 宿ブロックがあるルートには、PR 注記と `scenic_route_stay` の計測があること。
- data/scenic-stays.json のルート ID とエリア ID が、どちらも存在すること。
- 既存ページに足した /scenic/... へのリンク先が、すべて live の slug であること。
- /guide・HomeClient.tsx・ヘッダーに差分が無いこと。

## 確認（毎回）
1. `node --test scripts/affiliate-checks.test.mjs` がすべて通ること（いまは87件）。
2. `npx tsc --noEmit` が通ること。
3. `rm -rf .next/dev/types && npm run build` が成功すること。
4. 開発サーバーで、宿ブロックのあるルート全部と、リンクを足したページを数ページ開いて確かめる。
   - 表示、リンク先、PR 注記があること。
   - スマホ幅（375px）で横にはみ出さないこと。
   - クリック時に計測イベントが出ること。
5. main に push したあと、本番で次を確認する。
   - 変更したページが 200 を返すこと。
   - /guide と /?from=Tokyo&to=Kyoto が正常なこと。

## 報告（日本語で）
- A：リンクを足したページの一覧（ページ → 景色ページ、言語）と、足さなかった候補・理由
- B：宿ブロックを出したルートと使ったデータ（エリア ID・提供元）、出さなかったルートと理由
- 新しい placement 名と、計測の確認結果
- 迷ったところ、未確認のこと
