# 公開記録（効果測定用）

11/29 の効果測定で変更の影響を切り分けられるよう、公開日時と内容を記録します。日時は日本時間で、本番（main）への push の時刻です。

| 日時（JST） | コミット | 対象ページ | 内容 | トップへの影響 |
|---|---|---|---|---|
| 2026-11-19 | 2d3e303, 95dfe2d | /scenic、/scenic/* | 季節の「見頃／通年」の区別、地図・月別表の連動、座席の質問、答えを画像より前に | なし |
| 2026-11-20 | 916f247, 8c46cad, 131906c | /shinkansen-seat-letters（自由席の号車）、トップの検索結果カード（未対応の理由）、/scenic/*（時刻の注記）、計測 | 表記ゆれ対応・未対応の理由・新しい計測イベント | 検索結果カードの文言のみ。レイアウトは変更なし |
| 2026-11-20（本記録の公開分） | 下記の「Plan this ride」 | /scenic/enoden、/scenic/sagano、/scenic/yurikamome | 「Plan this ride」（乗車駅・行き方・所要時間・運賃・予約・運行日・購入先）を追加。タイムラインの左右表示をスマホで1段下に配置 | トップの検索結果に出るタイムライン（東海道以外の路線）の、スマホでの表示だけが変わる。東海道（富士山）の結果とKlookの導線は変更なし |
| 2026-11-20（富士山ビューの宿） | 本記録の次のコミット | 新規 /stays/mt-fuji-view。/scenic/fujikyu（宿3件）、/scenic/tokaido-shinkansen・/guide（英語のみ）・/scenic（富士急カード）・トップ（英語のみ）にリンクを1つずつ | 富士山が見える宿の紹介と、既存ホテル12件の Booking.com アフィリエイトURLへの切り替え | トップは景色ギャラリーの下に英語のテキストリンク1行。検索と富士山の結果、Klook の導線は変更なし |
| 2026-11-20（デザイン改善） | 本記録のコミット群 | 全ページのヘッダー、トップ、/scenic、/scenic/*（14路線）、/stays/mt-fuji-view、/airport-transfers/*（Omio削除） | ヘッダーに Scenic Routes を追加し、現在地を表示。トップは検索前に富士山の答えと E 席の座席図を表示し、予約ボタンは控えめに。景色は6路線と「全14路線」への導線。下部は3カードに統合。一覧はクイック絞り込みと簡潔なカード、月別表は折りたたみ。路線ページは要約カードの重複を除き、順番を「タイムライン → Plan this ride → 切符」に。宿カードは文字中心に | **トップのレイアウトを変更（ユーザー許可）**。11/29 の比較ではこの日以降を別期間として扱う。/guide の座席判定と Klook の導線は変更なし |
| 2026-11-20（/guide の事実修正） | cdfbeb8 | /guide（全9言語） | 座席記号を JR東海の表現（普通車E・グリーン車D）に統一。Klook の座席は「指定席で希望を出せるが E席は保証されない」に。時間帯は自前の雲量データに合わせた（時間より季節）。見出し構造・title・URL・予約リンク・placement は変更なし | なし。12/01 の Klook 文中リンクの判定では、`guide_klook_text` の直前の説明文がこの日に変わったことに注意 |
| 2026-11-21（東京→関西→広島） | d6d565f | 新規 /scenic/golden-route、/scenic/miyajima-ferry（英語のみ）。/scenic の見出し下にリンク1本、サイトマップ | 旅程別の景色の入口と、宮島 JR フェリーの大鳥居の側。新しい placement `golden_route_ticket`（新幹線3区間の Klook） | なし。トップ・/guide は変更なし |
| 2026-11-21（OGP画像） | 本記録の前のコミット | 29ファイル（/scenic・/scenic/*・/kyoto-to-tokyo-mt-fuji-seat ほか）。トップ・/guide・/shinkansen-seat-letters・東京の宿検索は対象外 | `<head>` の og:image と twitter:image を共通画像で補い、Twitter Card を `summary_large_image` に。title・description・本文・リンクは変更なし（[SEO監査](./seo-audit-2026-11-21.md)） | なし |
| 2026-11-21（SEO文言） | 本記録の前のコミット | /shinkansen-seat-letters（英語の title・H1・description）、/areas-to-stay/tokyo-station-vs-shinjuku（英語の description） | 座席表（seat map）の検索の意図に title を合わせた。東京駅と新宿は別の駅で、中央線快速で約14分と冒頭に追記。座席チェッカー・Klook の導線・placement・翻訳は変更なし（[SEO監査 §7](./seo-audit-2026-11-21.md)） | なし。12/01 の判定は `/guide` で絞り込むので影響しない |
| 2026-11-21（クレカのタッチ乗車） | 本記録の前のコミット | 新規 /credit-card-tap-to-ride-japan（英語のみ）。/how-to-buy-suica（英語のみのカード1枚）、/how-to-navigate-japanese-train-stations（本文1文と関連リンク1行）、サイトマップ | 改札でクレカが使える会社・使えない会社、出られないときの対処、Suica・クレカ・JR Pass の違い。アフィリエイトなし（[記録](./credit-card-tap-2026-11-21.md)） | なし。トップ・/guide は変更なし |
| 2026-11-21（クレカ記事の訂正） | 本記録の前のコミット | /credit-card-tap-to-ride-japan | JR東日本は「改札でのタッチ不可、切符はクレカで購入可」に訂正。メトロからJRへ直通した場合の2段階の精算を明記。終了した受付番号の案内を削除（[記録 §6](./credit-card-tap-2026-11-21.md)） | なし |
| 2026-11-21（クレカ記事の英語・押上） | 本記録の前のコミット | /credit-card-tap-to-ride-japan | 平易な米国英語に書き換え。浅草→押上→成田空港の例と FAQ を1問追加。アフィリエイトなし（[記録 §7](./credit-card-tap-2026-11-21.md)） | なし |

## 座席CTAの文言修正と計測準備（2026-11-21）

- mainへの公開操作開始は **2026-11-21 03:36:20 JST**。計測はVercelの本番反映時刻を境に分け、11月21日は前後の比較から外す。
- トップの検索後に表示する `home_seat_result` と共通座席チェッカーの `guide_seat_result` の文言を9言語で変更。対象はトップ、`/guide`、`/kyoto-to-tokyo-mt-fuji-seat`、`/osaka-to-tokyo-mt-fuji-seat`、`/tokyo-to-kyoto-mt-fuji-seat`、`/when-to-see-mt-fuji-shinkansen`、`/shinkansen-seat-guides`、`/shinkansen-seat-letters`。
- 切符の予約先、Klook広告ID・リンクID、GA4のイベント名・配置・従来の計測ラベルは維持。文言変更が両座席結果枠のクリック率に影響し得る。`/guide` の `guide_quick_answer_text` と `guide_klook_text` は従来の文言・リンクで継続。
- `/scenic/golden-route` の章間リンクと東京の宿泊比較3記事も改善。宿泊比較の「Ueno」ボタンは既存の上野検索先に訂正。
- [11月29日・12月1日の効果測定](./ux-measurement-2026-11.md) に日別の比較期間、広告ID、販売・確定報酬明細、計測上の制約を記載。
