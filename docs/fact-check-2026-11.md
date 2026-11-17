# fujiseat.com 交通・旅行情報ファクトチェック報告（2026年11月17日）

公開環境へのデプロイは行っていない。URL、SEOタイトル（不正確な時間を含んでいた1件を除く）、内部リンク、構造化データの構造、アフィリエイトURL、ページデザインは維持し、事実記述とFAQ回答を中心に修正した。

## 1. 発見・修正した誤情報

| 対象URL | 修正前 | 正しい情報・修正内容 | 公式根拠 |
|---|---|---|---|
| `/guide`（全9言語） | HikariとKodamaが新富士に停車 | 新富士に通常停車するのはKodama。NozomiとHikariは通常通過し、一部Hikariは三島に停車する旨へ修正 | [JR東海ツアーズ 停車駅一覧](https://travel.jr-central.co.jp/plan/tokushu/shinkansen/station/)、[JR東海 静岡旅](https://recommend.jr-central.co.jp/shizuoka-tabi/articles/01/) |
| `/guide`、富士山座席記事、ブログ、FAQ（全9言語） | 富士山が「30～60秒」または「約8分」見えると断定 | 複数区間で断続的に見える可能性と、新富士付近の開けた撮影機会を分離。観測根拠のない固定の総時間を削除し、時刻モデルは「乗車中に準備するための概算」と明示 | [JR東海ツアーズ 座席・撮影タイミング](https://travel.jr-central.co.jp/plan/tokushu/shinkansen/seat/) |
| `/guide`（全9言語） | 4～7号車が特に見晴らしがよい | 公式根拠を確認できないため削除。号車番号ではなく座席側が重要で、遮蔽物は区間ごとに変わると修正 | [JR東海ツアーズ 座席案内](https://travel.jr-central.co.jp/plan/tokushu/shinkansen/seat/) |
| `/blog/seat-e-sold-out`、`/shinkansen-reserved-vs-non-reserved` | Nozomi自由席は1～3号車 | 通常のNozomi自由席は1～2号車。Hikariは通常1～5号車、Kodamaは通常1～6・13～16号車（編成変更あり）。指定繁忙期のNozomiは全席指定と追記 | [JR東海 英文Shinkansen Guide](https://global.jr-central.co.jp/en/goldenroute/shinkansen/)、[JR東海 全席指定案内](https://global.jr-central.co.jp/en/nozomi/)、[JR東海 2026年度対象期間](https://jr-central.co.jp/news/release/_pdf/000043969.pdf) |
| `/airport-transfers/narita-to-ueno`、関連する宿泊地比較（全9言語） | Skylinerで成田～上野36分 | 36分は空港第2ビル～日暮里の最短。京成上野までは最短41分として分離 | [京成電鉄 Skyliner](https://new-www.keisei.co.jp/keisei/tetudou/skyliner/jp/skyliner/)、[京成電鉄 時刻表](https://www.keisei.co.jp/keisei/tetudou/skyliner/us/traffic/skyliner_1123.php) |
| `/airport-transfers/narita-to-tokyo-station` | Skyliner最終が21:30頃 | 現行・改正時刻表では21:30以降も運行。日付ごとに公式時刻表を確認する表現へ修正 | [京成電鉄 時刻表](https://www.keisei.co.jp/keisei/tetudou/skyliner/us/traffic/skyliner_1123.php) |
| `/airport-transfers/narita-to-asakusa`、`/narita-to-oshiage`、`/narita-late-arrival` | Access Expressが23時頃まで浅草・押上へ直通するように読める | Access Expressの最終出発と直通最終を分離。2026年11月21日（土休日）・24日（平日）改正後、空港第1ターミナル発の浅草線直通最終は平日21:09、土休日20:35で、後続は京成上野または京成高砂止まりと明記 | [京成電鉄 2026年ダイヤ改正](https://new-www.keisei.co.jp/news/detail.php?CN=8045)、[成田空港駅公式時刻表](https://keisei.ekitan.com/naritaacs/timetable/station/682-7/d1) |
| `/airport-transfers/narita-to-asakusa` など | SkylinerはAccess Expressより早く終了 | 根拠と反するため削除。改正時刻表では空港第1ターミナル発の最終Skylinerは23:00 | [京成電鉄 時刻表](https://www.keisei.co.jp/keisei/tetudou/skyliner/us/traffic/skyliner_1123.php) |
| 宿泊地比較ページ（全9言語） | 新宿～東京駅10分 | JR中央線快速の乗車時間を約14～15分へ修正し、駅構内移動時間は別に必要と明示 | [JR東日本 新宿駅](https://www.jreast.co.jp/en/estation/stations/866.html)、[JNTO掲載アクセス例](https://www.japan.travel/en/experiences-in-japan/3978/) |
| `/how-to-buy-suica`、配下の短編ガイド | 羽田のJR/京成駅でSuicaを購入可能 | 羽田空港にJR駅はない。Welcome Suicaは羽田空港第3ターミナル駅（東京モノレール）の指定券売機・JR EAST Travel Service Centerで販売。第1・第2ターミナルは販売場所として案内されていない旨へ修正 | [JR東日本 Welcome Suica購入場所](https://www.jreast.co.jp/en/multi/welcomesuica/purchase.html)、[JR東日本 通常Suica販売場所FAQ](https://jreastfaq.jreast.co.jp/faq/show/1072?category_id=30&site_domain=default) |
| `/how-to-buy-suica`、配下の短編ガイド | 通常Suicaは無期限 | 短期の観光用有効期限はないが、最後の対象利用から10年間利用がない場合は使用不可となる旨へ修正 | [JR東日本 Suica 10年未利用FAQ](https://jreastfaq.jreast.co.jp/faq/show/1048?category_id=31&site_domain=default) |
| `/guide`、FAQ、CTA（全9言語） | Klookで座席表からE席を選べる・E席を予約できる | Klookでは高速鉄道の座席は通常自動割当。商品によって窓側などの希望を出せても確約ではないため「希望」と「確定座席」を分離。既存アフィリエイトリンクは維持 | [Klook 高速鉄道座席FAQ](https://www.klook.com/faq/category-73-question-1061/)、[Klook Shinkansen案内](https://www.klook.com/japan-rail/shinkansen/) |
| `/jr-pass-vs-single-ticket`、`/tokyo-to-kyoto-shinkansen-ticket` | 東京～京都のNozomi指定席が13,320円 | 13,320円は自由席。通常期のNozomi普通車指定席は14,170円として分離し、季節で指定席料金が変わる旨を追記 | [JR東海 主要区間運賃表](https://global.jr-central.co.jp/en/info/fare/_pdf/nozomi.pdf) |
| `/guide`、`/jr-pass-vs-single-ticket`（全9言語の関連文言） | 「長距離2回以上ならJR Passがお得」 | 回数だけでは判断できないため削除。旅程ごとの運賃合計と、購入経路別のPass価格・対象列車を比較するよう修正 | [JAPAN RAIL PASS 価格](https://japanrailpass.net/en/purchase/price/index.html) |
| `/jr-pass-vs-single-ticket` | JR Pass価格は7日50,000円のみ、Nozomiは対象外という単純説明 | 普通車は公式予約サイトで50,000/80,000/100,000円、海外指定販売店で53,000/84,000/105,000円（7/14/21日）。Nozomi・Mizuhoは都度専用追加券が必要で、Passと併用する条件を追記 | [JAPAN RAIL PASS 価格](https://japanrailpass.net/en/purchase/price/index.html)、[NOZOMI MIZUHO Ticket](https://japanrailpass.net/en/use/special-ticket/) |

## 2. 修正したファイル

- 共通事実データ: `lib/content/transport-facts.ts`（新規）。Skylinerの「日暮里36分／京成上野41分」、Access Express改正、東京～京都運賃、JR Pass購入経路別価格を集約。
- 新幹線・富士山: `app/[locale]/guide/page.tsx`、`data/blog/posts.ts`、`app/[locale]/nozomi-vs-hikari-vs-kodama/page.tsx`、`app/[locale]/shinkansen-reserved-vs-non-reserved/page.tsx`、`app/[locale]/tokyo-to-kyoto-mt-fuji-seat/page.tsx`、`app/[locale]/tokyo-to-osaka-mt-fuji-seat/page.tsx`、`app/[locale]/osaka-to-tokyo-mt-fuji-seat/page.tsx`、`app/[locale]/when-to-see-mt-fuji-shinkansen/page.tsx`。
- 空港・宿泊地アクセス: `lib/content/transfers.ts`、`lib/content/stay.ts`。
- Suica: `app/[locale]/how-to-buy-suica/page.tsx`、`data/suica-guides.ts`。
- JR Pass・運賃: `app/[locale]/jr-pass-vs-single-ticket/page.tsx`、`app/[locale]/tokyo-to-kyoto-shinkansen-ticket/page.tsx`。
- 全9言語: `messages/en.json`、`fr.json`、`es.json`、`pt-BR.json`、`de.json`、`ru.json`、`ko.json`、`zh-CN.json`、`zh-TW.json`。号車、見える時間、Klook、Hikari停車、Skyliner、新宿～東京駅の同期修正。

## 3. 修正不要と判断した項目

- 普通車の富士山側がE席、Green CarがD席という案内はJR東海の座席図と整合しているため維持。
- Welcome Suicaの「購入日から28日有効」「デポジットなし」「残額払い戻しなし」は現行公式案内と整合しているため維持。
- 特大荷物は3辺合計160cm超～250cm以下で対応座席の予約が必要、未予約時1,000円、250cm超は持込不可という既存説明はJR東海公式と整合しているため維持。[JR東海 特大荷物](https://global.jr-central.co.jp/en/info/oversized-baggage/)
- JR Pass公式予約サイトの普通車7日50,000円自体は正しい。誤りではなく、海外指定販売店53,000円との差が欠けていたため補足した。
- JR Pass利用者向けNozomi/Mizuho追加券の東京～京都・新大阪4,960円（普通車）は公式表と整合しているため、金額を維持し「乗車ごと」「Passとの併用」を明確化した。

## 4. 未確認・要継続調査

- 富士山の「最初に見える時刻」「完全に見えなくなる時刻」は、運行列車、天候、遮蔽物、対向列車で変わり、公式の実測値は確認できなかった。サイト内の40/45/48分モデルは公開駅間時刻からの概算として残したが、ユーザー向け表示は準備目安に変更し、固定の可視時間としては扱っていない。
- 京成の最終列車は曜日・改正・臨時変更で変動する。2026年11月21日・24日改正を反映したが、旅行日当日の公式時刻表確認を必須とする表現にしている。
- Klookの選択UIは商品・在庫・地域で変わり得る。公式FAQに基づき「自動割当・希望非保証」を基準にしたが、個別商品の当日UIまでは固定できない。
- 運賃、Pass価格、販売場所は改定されるため、共通データと本報告の確認日は2026年11月17日。次回改定時に公式情報との再照合が必要。

## 5. テスト結果

- `node`による全9言語JSONパース: 成功。
- `npx tsc --noEmit`: 成功。
- `npm run build`: 成功。941ページ生成、型検査・静的生成とも完了。既存のEdge Runtime非推奨警告のみ。
- `npm run test:funnel`: 76件すべて成功。アフィリエイトリンク、主要導線、退役URL、サイトマップ、座席チェッカー、翻訳ICUを含む。
- `npm run lint`: エラー0。既存の`TokyoHotelAreaFinder.tsx`のReact Hook依存配列警告1件のみ。
- `npm run check:translations`: 実行完了。JSON/ICU破損なし。既存の不足キー・未翻訳警告は残存（今回の交通情報修正とは別件）。
- 専用の`check-internal-links.mjs`はリポジトリに存在せず実行不可。代わりにビルドと`test:funnel`内の退役URL・サイトマップ・主要リンク検査を確認した。

