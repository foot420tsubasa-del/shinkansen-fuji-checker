# fujiseat.com — サイトの方向性と作業ルール（AIエージェント向け）

このファイルは Codex などのAIエージェントが作業前に読むためのものです。最終更新：2026-11-19。
細かい運用ルールは CLAUDE.md、景色ルートの作り方は docs/codex-handoff-scenic.md にあります。

---

## 1. このサイトは何か

- **ひとことで言うと**：日本を電車で旅する海外旅行者に、「どちら側に座れば、何が、いつ見えるか」を正確に答えるサイトです。
- **出発点**：「富士山を見るなら新幹線は E席（東京→京都・大阪は右側）」に答える座席チェッカー（/guide、トップの検索）。
- **2026年11月から**：「景色から選ぶ」方向へ広げています。
  - 一覧は /scenic、各ルートは /scenic/<slug>。いまは新幹線・観光列車など14本。
  - 各ページで、路線・どちら側・出発から何分後・季節・切符・近くの宿まで分かるようにしています。
- **強み**
  - 答えを地形データ（国土地理院の標高、OSM の線路）と公式時刻表から計算していること。
  - 公開されている情報と照らし合わせて裏付けていること。
  - 推測で書かないこと。

## 2. 読者

- 日本旅行を計画中か、移動の直前の海外旅行者。主に米国、英語。サイトは9言語あります。
- スマホで読む人が多く、まず結論（どちら側か）を知りたい人たちです。
- 次に知りたいのは、いつ見えるか、切符をどこで買うか、どこに泊まるかです。
- 日本の鉄道に詳しくない前提で、専門用語を減らします。

## 3. 収益と、いちばん大事な制約

- **収益の中身**
  - 収益はアフィリエイトです。2026年11月時点で**月1,000円ほど、ほぼ全額が Klook（新幹線チケット）**です。
  - 最大の稼ぎ頭は、**/guide の座席チェッカー → Klook の予約導線**（placement `guide_seat_result`）。
- **最優先は、今の売上を止めないこと。** 収益導線を壊す可能性がある変更は、しない・先に確認する。
- **伸ばし方**
  - 収益を抑えているのは流入量です。ボタンを磨いても埋まる差ではありません。
  - 伸ばす本筋は、検索で読まれるページを増やし、サイト内のリンクでそこへ人を流すことです。

## 4. 決まっている方針

### 触らないもの（指示がない限り）
- /guide（分割・改名・作り直しは禁止）、/shinkansen-seat-letters、座席チェッカー → Klook の導線。
- /guide の Klook 文中リンク2本（`guide_quick_answer_text`、`guide_klook_text`）は**2026-12-01に判定するお試し中**。動かさない。
- トップページ（app/[locale]/page.tsx・HomeClient.tsx）とヘッダー・メニューは、**2026-11-29 のデザイン効果測定までは変更しない**。

### アフィリエイト
- **新しいアフィリエイトURLを作らない・推測しない。** 既存のデータ（data/affiliate-links.json など）にあるものだけを使う。
- 新しいURLが必要なら、枠だけ用意して人間に発行を頼む。
- URLの管理は Google スプレッドシート「URL管理」タブで行う。
  - データへの取り込みは `node scripts/links-sheet.mjs import`（確認したうえで `--apply`）。
  - Klook の k_site を手で書き換えない。
- **鉄道・パス・ツアーは Klook。**
- **ホテル**
  - 個別のホテルは **Booking.com だけ**（data/booking-hotel-urls.json）。アフィリエイトURLは後で発行してシートに貼る運用で、貼るまでは通常のURLで表示しています。
  - エリア単位のホテルボタンは **Klook のまま**。
  - **Trip.com と Agoda は使わない。**
- 切符の案内に**金額・最安比較・損益分岐の話を書かない**。商品の一言説明＋予約ボタン＋PR表記だけにする。公式ページは小さな「Official details」として載せる。
- アフィリエイトのリンクには必ず PR／手数料の注記を付け、`rel` は `AFFILIATE_REL` にする。
- 新しいボタンの置き場所を作ったら、新しい placement 名を足す（既存の名前に相乗りしない）。

### 事実の扱い
- 運行・時刻・料金・停車駅・切符でパスが使えるかは、**公式情報で確認してから書く**。確認できないことは書かずに「未確認」として報告する。
- 左右の答え
  - 地形モデルだけで出した答えは「terrain model」と書く。
  - 公開されている情報と一致したときだけ、その出典を書く。
  - 座席記号（A席・E席など）は、確認できたときだけ出す。
- 季節運行・運行終了・期間限定の区間は、そのページの notes に書く。去年の時刻を今年のものとして書かない。
- 時刻表は毎年3月に変わるので、見直しが要る。

### 見た目・文章
- 結論を先に書く。文章は短くし、図・地図・写真で見せる。
- AIで作った画像には「Illustrative image」と表示する。画像は WebP で300KB以下（PNG はコミットしない）。
- 見た目は既存の部品（色・角丸・カード・文字）に合わせ、新しいデザインを作り込まない。
- ホテル（Booking.com）のボタンは `ProviderButton`。Klook のボタンは、ラベルに必ず「Klook」と入れる。
- 文言・データはデータファイルに置き、ページ内に直書きしない。

## 5. これからの優先順位

1. **売上を守る**：/guide の導線と Klook。
2. **流入を増やす**
   - 景色ページと /scenic を検索で読まれるようにする。
   - 既存の記事から景色ページへリンクを張る。
   - 11/29 の測定のあと、トップ・メニューから /scenic への入口を足す。
3. **ホテルの収益化**
   - Booking.com のアフィリエイトURLが発行されたら反映する。
   - 景色ページの宿ブロック（`scenic_route_stay`）の効果を測る。
4. **景色ルートの信頼性**：地形モデルだけのルートを、公開されている情報で裏付ける。
5. **あとでやる構想**：景色のよいホテル・レストラン、線路の「映え度」マップ、券売機・Suica の画像ガイド、SNS。

## 6. 動く前に数える

このサイトの失敗の多くは「データを見る前に動いた」ことから起きています。

- ボタンや商品を置く前に、そのページの表示回数と順位を見る。
- ページを消す・転送する前に、順位を見る。
- 「壊れている」と結論する前に、計測やコードの誤りを疑う。
- 判断は自然検索の数字で行う。アフィリエイトのクリックは数が少ないので、1〜2件の差を根拠にしない。

## 7. 作業の進め方

- 確認の手順
  1. `node --test scripts/affiliate-checks.test.mjs`
  2. `npx tsc --noEmit`
  3. `npm run lint`
  4. `rm -rf .next/dev/types && npm run build`
  5. ブラウザで実際に動かす（375px と 1280px）。
- git は `/Library/Developer/CommandLineTools/usr/bin/git` を使う。python3 は使えないので、編集は node で行う。
- `.env*` と `secrets/` は読まない・出さない・コミットしない。
- commit / push は、作業の指示に含まれているときだけ行う。main への push は本番公開（Vercel）になる。push したら本番でページが200を返すことを確かめる。
- 報告は日本語で書く。根拠の出典URL・未確認のこと・本番での確認結果を含める。

## 8. 予定

| 日付 | 内容 |
|---|---|
| 2026-11-29 | デザイン変更の効果測定（トップの座席結果のクリック、座席診断 → 予約の割合）。問題なければトップ・メニューから /scenic へ導線を足す |
| 2026-12-01 | /guide の Klook 文中リンクを判定。CTR が1%未満か、`guide_seat_result` のクリックが前の2週間より減っていれば外す |
| Booking.com 発行後 | シートにアフィリエイトURLを貼って反映する |
| 2027-03 | 時刻表の改正に合わせて各ルートの時刻を見直す。嵯峨野は新しい車両になる（3/1） |
| 2027-06 | のぞみ・みずほの指定席料金の改定（7/1 購入分から）を運賃の記載に反映する |

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
