# Current Status and Roadmap

## 現状

このリポジトリは Next.js App Router ベースの多言語 Japan travel site です。現在のホームは `/app/[locale]/HomeClient.tsx` が中心で、Seat Checker、旅程導線、東京拠点比較、Local Tokyo、Essentials、footer までを1ページにまとめています。

デザイン参照は `/app/[locale]/design/home` に残してあり、本番ホームにはその参照ページで使った `public/design-home-assets/` の PNG を image2 用の仮画像として入れています。正式画像が入ったら `image2Placeholder()` の参照先を置き換えるだけで差し替えられる状態です。

## 整理したフォルダ

- `docs/design/`: デザイン仕様、Codex 用プロンプト、実装仕様メモ
- `docs/reference/fujiseat_static_html_reference/`: 旧静的HTML参照
- `docs/reference/command-center-source/`: Command Center の取り込み元コード
- `public/design-home-assets/`: 現在ホームで使う image2 仮画像
- `public/reference-ui-assets/`: 旧SVG系の参照アセット

## UI の整理方針

ボタン色は3系統に寄せています。

- Primary: 濃紺背景、白文字。主要CTA用
- Secondary: 白背景、濃紺文字。補助CTA用
- Tertiary: 淡い青背景、濃紺文字。Popular Links など軽い導線用

色の拡散を避けるため、ホーム側は `buttonPrimary`、`buttonSecondary`、`buttonTertiary` の定数で統一しています。Local Tokyo カードも同じ思想で `buttonPrimary` / `buttonSecondary` に寄せています。

## コンテンツ整理

東京拠点は、ユーザーが自然に比較する軸で整理しました。

- Shinjuku: 初回・夜・買い物・交通の強さ
- Shibuya: 若い文化、食、夜、渋谷らしさ。ただし混雑と新幹線日の弱さあり
- Ueno: 価格、成田アクセス、文化施設
- Asakusa: 伝統的な東東京
- Tokyo Station: 新幹線・銀座・移動効率
- Kiyosumi-Shirakawa / East Tokyo: 落ち着いたローカル拠点

Local Tokyo のおすすめには Oshiage を追加しました。押上は Skytree、隅田川、東東京の落ち着いた滞在候補として扱い、渋谷・新宿の代替ではなく「静かな東東京」枠として見せています。

## 今後の実装優先度

1. ホーム UI の確定
   - image2 の正式画像に差し替え
   - `/design/home` と本番ホームの差分をさらに縮める
   - モバイル表示でヒーロー、カード、ボタンの収まりを確認
   - CTA の意味を揃える。外部アフィリエイトはオレンジ、内部ページ遷移は緑で統一する
   - 「Compare」と書くリンクは、実際に比較UIや比較表がある場合だけ使う。単なる購入・確認リンクは `JR Pass` など短いラベルにする

2. コンテンツ構造の分離
   - `HomeClient.tsx` 内の `featureCards`、`routeCards`、`tokyoBaseChoices`、`localLensPicks` を `lib/content/home.ts` に移す
   - 表示コンポーネントとコンテンツ定義を分け、翻訳対応を進めやすくする

3. Local Tokyo の拡張
   - Oshiage、Kuramae、Monzen-Nakacho、Ryogoku の個別ページを追加
   - 画像、半日ルート、向いている旅行者、避けるべきケースを統一フォーマット化

4. 東京拠点比較の強化
   - Shibuya を含めた `/areas-to-stay/tokyo-first-time` の本文更新
   - 「初回」「家族」「夜重視」「新幹線重視」「静かに滞在」の比較表を追加

5. Command Center の棚卸し
   - `src/JapanTripCommandCenter.jsx` は大きい単一コンポーネントなので、後続で分割候補を洗い出す
   - `docs/reference/command-center-source/` は参照元として残し、実装は `src/` 側に集約する

6. Seat Checker 周辺の次タスク
   - `After checking your seat` は行動を4つ程度に絞る。現状は `Shinkansen ticket`、`JR Pass`、`Read guide`、`Plan trip`
   - Klook CTA と `After checking your seat` が重複して見えるため、どちらを主CTAにするか整理する
   - `SeatResultCard.tsx` と `SeatCheckerPanel.tsx` はまだUIが大きく、モバイルで縦に伸びやすい。次回はカード分割またはコンパクト表示を検討する
   - `Free tool` バッジは説明ではなく状態ラベルなので、ヒーローの高さを圧迫しない小さな表示に留める

## 注意点

- 現在の `HomeClient.tsx` は見た目とコンテンツ定義が混ざっているため、次の大きな変更前に分割した方が保守しやすいです。
- `public/reference-ui-assets/` の SVG は旧デザインの名残です。使い続けるものと削除候補を次回整理できます。
- 多言語サイトですが、今回追加したホーム文言は英語直書きが残っています。UI が固まった後に messages 配下へ移すのが安全です。
