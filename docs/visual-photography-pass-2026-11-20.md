# 景観写真・アクセシビリティ（2026-11-20）

公開前の基準は `66fb4fdbf4a87daf247d3040dea84bebc0d919be`。共通ヘッダーの「Check Seat」を36pxから44pxにし、白文字と背景色の比を4.22:1から5.04:1に改善した。ボタンの行き先、計測、ナビゲーションの順序と高さは維持した。キーボードのフォーカスには外枠を表示する。[WCAG 最低コントラスト](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)・[44 CSS px の基準](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)

## 掲載した実写

元ファイルを1枚ずつ取得し、撮影記録・出所・解像度と画像そのものを照合した。CC0・CC BY・CC BY-SA はいずれも本用途で商用掲載と加工が可能。CC BY/BY-SA の写真は撮影者・元ファイル・ライセンス・加工の表示を付ける。BY-SA のWebPは写真の元ライセンスと同じ条件で提供する。CC0にも任意で出所を表示する。ファイルは縮小し、画面の比率に合わせたトリミングは表示時に行う。[Commons 再利用条件](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/en)

| 対象 | 実写の内容・撮影位置 | 撮影者・ライセンス | 原寸 → WebP | 配置 |
| --- | --- | --- | --- | --- |
| 新富士 | 静岡県富士市付近の東海道新幹線車内からの富士山。2018年撮影、Flickrライセンス確認済み | jessedyck、CC0 1.0 | 5551×3701 → 1600×1067、120KB | 東海道新幹線詳細・一覧・トップの景観欄。[原本](https://commons.wikimedia.org/wiki/File:View_of_Mount_Fuji_from_Tokaido_Shinkansen_2018-04-10.jpg) |
| 江ノ電 | 七里ヶ浜〜稲村ヶ崎の10形、湘南の海と富士山。線路の外から撮影 | Kirin7739、CC BY 4.0 | 2592×1801 → 1600×1112、142KB | 江ノ電詳細・一覧・トップの景観欄。[原本](https://commons.wikimedia.org/wiki/File:Enoden_Type_10_with_Shonan_Sea_and_Mt.Fuji.jpg) |
| 嵯峨野 | 嵯峨野観光鉄道の車内から撮影した保津川と保津峡駅。2016年撮影、Flickrライセンス確認済み | pang yu liu、CC BY-SA 2.0 | 7854×5238 → 1280×854、256KB | 嵯峨野詳細・一覧・トップの景観欄。[原本](https://commons.wikimedia.org/wiki/File:Hozukyo_Station_seen_from_Sagano_Scenic_Railway_train_2016-08-26.jpg) |
| 河口湖 | 2025年秋に撮影した湖と富士山。Flickrライセンス確認済み | lumoplank、CC0 1.0 | 4883×3435 → 1600×1125、127KB | 富士急行線の目的地の景色として詳細・一覧・トップの景観欄、宿泊ページのメイン画像。客室別カードには使わない。[原本](https://commons.wikimedia.org/wiki/File:Kawaguchiko,_Part_III_-_Kawaguchiko6782.jpg) |
| 只見線 | 福島県三島町の第一只見川橋梁を渡る車両。2019年に車外の展望場所から撮影 | MaedaAkihiko、CC BY-SA 4.0 | 5472×3648 → 1280×853、272KB | 只見線詳細と一覧。[原本](https://commons.wikimedia.org/wiki/File:Tadami-Line-First-Bridge-Autumn.jpg) |
| 釧網本線 | 北浜駅の展望台から、流氷と旧「流氷ノロッコ号」。2009年、現行「流氷物語号」とは別の列車 | 欅 (Keyaki)、CC BY-SA 3.0 | 3648×2736 → 1600×1200、79KB | 釧網本線詳細と一覧。どちらにも撮影年と旧列車名を表示。[原本](https://commons.wikimedia.org/wiki/File:Ryuhyo_norokko_in_Kitahama_station.jpg) |
| 黒部峡谷 | 新山彦橋を渡る黒部峡谷鉄道の車両と川。車外から撮影 | tsuda、CC BY-SA 2.0 | 1200×1600 → 1120×1493、276KB | 黒部峡谷鉄道の詳細・一覧・トップの景観欄。[原本](https://commons.wikimedia.org/wiki/File:Kurobe_Gorge_Railway1.jpg) |

詳細と河口湖の宿泊ページは16:9、景観一覧は既存の16:10を使用。Next.js Image の `sizes` と固定アスペクト比で表示サイズを先に確保する。写真の上に新しい文字ラベルを重ねず、クレジットは下に置く。未差し替えの景観画像は Illustrative 表記を維持する。

## 追加素材の権利

| 対象 | 確認した素材 | 掲載に必要な確認 |
| --- | --- | --- |
| Mizno Hotel | 公式サイトの客室・湖と富士山の眺望。[公式サイト](https://mzn.jp/en/) | 広報から元データ、客室タイプ、撮影場所、クレジット、商用観光記事での掲載と切り抜きの書面許可。 |
| 秀峰閣湖月 | 公式客室ページと宿のフォトアルバム。[客室](https://www.kogetu.com/room)・[フォトアルバム](https://www.kogetu.com/photoalbum/) | 投稿写真は撮影者も確認。ホテル撮影の客室画像と、宿泊者投稿への許可を区別する。 |
| ラビスタ富士河口湖 | 公式客室ページと画像の提供案内を含む過去のプレスリリース。[客室](https://dormy-hotels.com/resort/hotels/la_kawaguchiko/rooms/)・[共立のリリース](https://www.kyoritsugroup.co.jp/cms/wp-content/uploads/2021/07/%E3%80%90%E5%85%B1%E7%AB%8B%E3%83%AA%E3%83%AA%E3%83%BC%E3%82%B9%E3%80%91%E3%83%A9%E3%83%93%E3%82%B9%E3%82%BF%E5%AF%8C%E5%A3%AB%E6%B2%B3%E5%8F%A3%E6%B9%96%E3%81%A7%E3%83%95%E3%82%A1%E3%82%B9%E3%83%86%E3%82%A3%E3%83%B3%E3%82%B0%E3%83%97%E3%83%A9%E3%83%B3%E3%82%92%E8%B2%A9%E5%A3%B2_20210720.pdf) | 現行のアフィリエイト記事への転載・トリミング許可、元ファイル寸法と眺望がある正確な客室タイプ。 |
| 鉄道事業者の公式画像 | JR東海・JR北海道のウェブ写真、江ノ電のメディア窓口、嵯峨野の公式案内。[JR東海](https://jr-central.co.jp/policy/index.html)・[JR北海道](https://www.jrhokkaido.co.jp/other/goriyou.html)・[江ノ電](https://enoden.co.jp/media/)・[嵯峨野](https://www.sagano-kanko.co.jp/) | サイト閲覧、取材・撮影の受付、素材の転載は別の条件。個別素材の商用掲載・改変の許諾が必要。 |
| 観光の写真ライブラリー | JNTOの各地の一覧と山梨公式のギャラリー。FIND/47の只見川第一橋梁の候補は元の配布ページが削除済み。[JNTO](https://faq.japan-travel.jnto.go.jp/en/japan-photo-and-video-library/)・[山梨](https://www.yamanashi-kankou.jp/search/gallery.php)・[FIND/47](https://find47.jp/ja/i/pYNjw) | 各素材の商用・改変条件を確認する。只見線では、撮影者が直接公開し現在も条件を確認できる別の実写を採用した。 |

ホテル3軒の掲載許諾は確認できなかった。個別カードは従来の文字中心で、Booking.comの商品画像や追加の仮画像は使っていない。

## 予約先の照合

登録済みのBooking.com個別ホテル42件に対し、重複を除いた40本の成果報酬URLを実際にたどった。全40本がデータに対応する個別ホテルのパスへ転送された。Mizno Hotel、秀峰閣湖月、ラビスタ富士河口湖もそれぞれ別の正しいURLに到達した。Booking.comのHTTP 202は転送先の確認と区別し、予約フォームの成否には数えない。

Klookは登録67本でドメイン、追跡IDと `k_site` を照合。主要7本をリダイレクトまで追い、全7本が登録済みの商品・路線パスに到達した。HTTP取得では新幹線一覧、東京↔京都、富士回遊が200。嵯峨野、江ノ電フリーパス、JR PassはKlook側から403を返した。別のウェブ取得では嵯峨野とJR Passの商品名を確認し、江ノ電フリーパスはURLまで確認した。予約リンクやパラメータの変更はない。[嵯峨野](https://www.klook.com/en-US/activity/17066-sagano-romantic-train-ticket-kyoto/)・[JR Pass](https://www.klook.com/en-US/activity/1420-7-day-whole-japan-rail-pass-jr-pass/)

## 検証の記録

回帰テスト111件、型チェック、lint、Webpack本番ビルドに成功。Chromeで実写8画面（景観7路線と宿泊のメイン画像）の読み込み・比率・クレジット、景観一覧の実写7枚・Illustrative 7枚、トップの写真クレジット5件を確認した。ヘッダーは360・390・768・1280pxと9言語の360pxで確認し、キーボードでフォーカス枠が表示された。比較画像と予約先の検証記録は `.cache/visual-photo-pass/` に保存する。
