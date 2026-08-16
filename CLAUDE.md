# fujiseat.com — 作業ルール

## 進行の原則

- `git commit` / `git push` は**人間が明示的に指示したときだけ**実行する。実装が終わっただけでは commit しない。
- `.env*` の中身を出力・コミットしない。サービスアカウント鍵は `secrets/`（gitignore済み）。
- dev サーバーは `preview_start`（`.claude/launch.json` の `fujiseat-dev`）で起動する。Bash で `npm run dev` を叩かない。

## AI社員（専門エージェント）

`.claude/agents/` に5人。Agent ツールで呼び出す。

| 担当 | 呼び出す場面 |
|---|---|
| `fujiseat-analyst` | 数字を調べる（GA4 / GSC / Klook）。順位・CTR・収益の調査と効果測定 |
| `fujiseat-seo` | タイトル・meta・内部リンク・構造化データ |
| `fujiseat-revenue` | アフィリエイトCTAの設置・配置・計測、admin リンクマスタ |
| `fujiseat-editor` | 本文の執筆・改稿、9言語 i18n、図版・レイアウト・モバイル |
| `fujiseat-qa` | コミット前の検証、ブラウザでの実挙動確認 |

大きな施策は「analyst で調べる → seo / revenue / editor が実装 → qa で検証」の順で回す。

## 全員が守ること

### 収益導線
- **未検証のアフィリエイトURLを作らない。** admin のリンクマスタにあるものだけを使う。無ければ枠だけ用意して登録を依頼する。
- **ホテル系プロバイダ（Booking.com / Trip.com）のCTAは `ProviderButton` を使う。** 緑の塗りボタン（中立的な「hotel action」階層）や Klook のオレンジで出さない。
- **Klook は `ProviderButton` に非対応。** 代わりに次の2階調を守る。
  - 塗り `#D94A32` — 答えの直後の主要CTA（座席診断の結果、Quick Answer など）
  - 淡色 `orange-50` / `orange-200` — 一覧カード・二次選択肢
  - **どちらの場合もラベルに「Klook」を必ず入れる。** Booking.com と違いロゴバッジが無く、文字表記が唯一の識別子になる。
  - ダークテーマのページ（Station Practice など）はオレンジを持ち込まず、ラベルの明記だけで識別させる。
- Omio: ボタン化しない／Klook と並べない／ファーストビューに置かない／ガイド内は最大1本。
- ホテル予約意図はプロバイダ直行。Finder 経由にしない。
- 新しいCTA枠を作ったら `lib/affiliate/links.ts` に新しい `placement` を追加する（既存に相乗りさせない）。

### 分析
- 判断は**自然検索のみ**で行う。中国からの直接流入（全体の約35%、滞在5秒）が指標を歪める。
- GSC のページ別クエリは `dimensionFilterGroups` を使う。`dimensionFilter` はフィルタが効かない。
- アフィリエイトクリックは90日で約106件と母数が小さい。1〜2件差を根拠にしない。
- GA4 より提携先（Klook / Travelpayouts）の実データを優先する。

### 品質
- コミット前に `npx tsc --noEmit` / `npm run lint` / `npm run test:funnel` / `npm run build`。
- **変更はブラウザで実際に動かして確認する。** タイトルは出力HTMLを、CTAは実クリックのイベント発火を、レイアウトは375pxと1280pxの両方を見る。
- タイトル改修後 **2〜3週間は同じページを再度触らない**（効果測定が不可能になる）。
- 過去の判断が間違っていたと分かったら、隠さず訂正して報告する。

## 主要な場所

- 分析: `分析/reports/`（自動生成）、`分析/audits/`（手動）、`分析/raw/`（生データ・git管理外）
- レポート生成: `node scripts/hotel-funnel-report.mjs 28`
- リンクマスタ: `data/affiliate-links.json`、`data/hotel-affiliate-links.json`、`data/booking-hotel-destinations.json`
- 管理画面: `/admin`（ローカルはトークン不要）
