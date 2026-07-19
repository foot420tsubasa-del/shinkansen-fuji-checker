# 分析 (Analytics workspace)

fujiseat.com の検索・収益分析をここに集約する。

## 構成

- `raw/` — **git管理外**(.gitignore)。GA4 / GSC の生エクスポート置き場。
  - `raw/gsc-YYYY-MM-DD/` — Search Console のパフォーマンスエクスポート一式
    (クエリ.csv / ページ.csv / 国.csv / デバイス.csv など)
  - `raw/ga4/` — GA4 のCSVエクスポート
- `*.md` — 分析結果・監査レポート(git管理)。ファイル名に日付を入れる。

## 運用ルール

- 新しい GSC エクスポートは `raw/gsc-<日付>/` にフォルダごと入れる
  (`https___fujiseat.com_-...` のままにしない)。
- `node scripts/hotel-funnel-report.mjs` はこのフォルダに
  `hotel-funnel-<日付>.md` を出力する。
