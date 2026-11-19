# 景色ページの配信・座席案内 QA（2026-11-19）

## 修正前の本番配信

本番は GitHub の deployment `7912463674`、コミット `bbc1fa53e7498d25b21989f061041e9075172243`。Vercel の [デプロイ画面](https://vercel.com/tsubasa-hamases-projects/shinkansen-fuji-checker/5HBVUmSorX38T6FVs6bLD4J7x3j5) と GitHub の deployment status が一致した。レスポンスの `x-vercel-id` はリクエスト識別子。

各5 URLを通常2回、キャッシュ回避用クエリと `Cache-Control: no-cache`、`www` 経由、モバイル Safari UA、Googlebot UAの6条件で取得した。最終レスポンス30件が HTTP 200、`Age: 0`、`x-vercel-cache: MISS`、`Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`。`www` は307で正規ホストへ転送された。

| URL | キャッシュ回避用クエリ以外の HTML SHA-256 先頭10桁 |
| --- | --- |
| `/scenic` | `cf27e8dc6b` |
| `/scenic?season=winter` | `0beca99983` |
| `/scenic?view=sea` | `c8960eeff8` |
| `/scenic/enoden` | `cc21f990be` |
| `/scenic/hakone-tozan` | `2cdf6a101a` |

キャッシュ回避用クエリ追加時は Next.js のページデータにクエリが入るため本文同等でもハッシュが変わる。箱根の旧FAQ `Which seat letter should I book?` は `a451662` にあり、`95dfe2d` で更新された。HTTP取得、ブラウザ、別のWeb取得経路では更新後の `Can I reserve a seat?` が一致した。申告時のレスポンスヘッダーや取得時刻がなく、当時の混在は未再現。地理的に離れた複数の回線での直接取得は未実施。

一覧はサーバーで `searchParams` を評価する。詳細と一覧は本番ビルドで動的ルートとして出力されており、該当ページに明示的な ISR 設定や、プロキシ・Next.js 設定でのキャッシュ上書きはない。観測したヘッダーは [Vercel の CDN キャッシュ仕様](https://vercel.com/docs/caching/cdn-cache) と一致し、配信設定の修正は行わなかった。

## 公開中14路線の点検

| 路線 | 結果・根拠 |
| --- | --- |
| 箱根登山電車 | 3回の折り返しと通常列車の自由席を公式で確認。景色の側は地形モデル。箱根湯本・強羅から出発時に左の窓を選ぶ案内は、掲載する谷の2区間に限定した。[折り返し](https://www.hakonenavi.jp/hakone-tozan/)・[通常列車の座席](https://www.hakonenavi.jp/hakone-tozan/ajisai/about/)・[予約制の臨時列車の例](https://www.hakonenavi.jp/groupnews/16482/) |
| 富士急行線 | 富士山駅の折り返し前後で窓側が変わることを両方向に表示。各停の自由席と富士回遊の指定席・座席未指定券を区別した。[駅時刻表](https://www.fujikyu-railway.jp/station/timetable.php?no=16)・[富士回遊](https://www.fujikyu-railway.jp/fujikaiyuu/) |
| 五能線 | 海沿いの区間は秋田の出発時点で右窓、青森では左窓。進行方向基準の側と全車指定席の説明を照合。[列車時刻表](https://timetables.jreast.co.jp/2611/train/020/022861.html)・[JR東日本の案内](https://media.jreast.co.jp/articles/5766) |
| 江ノ電 | 一律にロングシートと読める本文・FAQ・根拠欄を修正。700形には海側にクロスシートがある。[700形](https://www.enoden.co.jp/type700/) |
| 嵯峨野 | A/D席の案内に2026年車両の適用範囲を記載。2027年3月1日の新型車両の座席は確認が必要。[FAQ](https://www.sagano-kanko.co.jp/faq/)・[現行車両引退](https://www.sagano-kanko.co.jp/news/5197/)・[新型車両](https://www.sagano-kanko.co.jp/news/4796/) |
| 富良野線 | 2027年7月1日開始予定の「青い星」の運転日・時刻発表を追記。普通列車と全車グリーン車指定席の観光列車を区別。[JR北海道の運行計画](https://www.jrhokkaido.co.jp/CM/Info/press/pdf/20261028_KO_aoihoshi.pdf) |
| 釧網本線 | 通常ダイヤに使う普通列車と2027年の全車指定席「流氷物語号」を区別。[JR北海道発表4ページ目](https://www.jrhokkaido.co.jp/travel/sl/pdf/20261022_newsrelease.pdf#page=4) |
| 黒部峡谷鉄道 | 車両を予約し車内の席は自由。現行ページの車両案内と2026年運行期間を維持。[車両](https://www.kurotetu.co.jp/about_troko/)・[FAQ](https://www.kurotetu.co.jp/qa/) |
| ゆりかもめ | ロングシート中心と展望席の案内を車両資料と照合。[車両案内](https://www.yurikamome.co.jp/mechanism/vehicle/) |
| 東海道・北陸・東北・上越新幹線 | 東海道の普通車 E・グリーン車 D は維持。他の3路線は列車・座席区分をまたぐ座席記号を追加しなかった。[JR東海ツアーズ](https://travel.jr-central.co.jp/plan/tokushu/shinkansen/seat/)・[JR東日本 E5系](https://www.jreast.co.jp/train/shinkan/e5.html)・[JR東日本のグランクラス](https://www.jreast.co.jp/granclass/seat.html) |
| 只見線 | 普通列車を対象とした既存の案内を維持。全区間や全編成に共通する座席記号は掲載していない。[JR東日本の車両資料](https://www.jreast.co.jp/sendai/upload-images/2019/11/201911281.pdf) |

路線内の見え方と出発時の窓側は既存の線路・地形モデルから算出した。箱根の景観方向について鉄道事業者による裏付けは確認できていない。FAQの画面表示と FAQPage JSON-LD は同じ質問・回答から生成する。タイトル・description・canonical・H1、トップ、切符・宿の導線と計測は差分対象外。

## 公開前の確認

回帰テストを含む101件と lint が成功。本番ビルドは Webpack で成功した。ローカルの既定 Turbopack はこの実行環境のポート制限で停止した。ブラウザで変更した7路線を1280pxで確認し、FAQと JSON-LD は全件一致した。375pxで箱根のFAQを開き、左右の説明とページ全幅を確認した。公開前の復旧先は上記 `bbc1fa53` の Vercel デプロイ。
