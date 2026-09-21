# 分析 (Analytics workspace)

fujiseat.com の検索・収益分析をここに集約する。

## 構成

- `raw/` — **git管理外**(.gitignore)。GA4 / GSC / Klook の生エクスポート置き場。
  - `raw/gsc-YYYY-MM-DD/` — Search Console のパフォーマンスエクスポート一式
    (クエリ.csv / ページ.csv / 国.csv / デバイス.csv など)
  - `raw/ga4/` — GA4 のCSVエクスポート
  - `raw/klook/` — Klook アフィリエイト管理画面の `ads_performance*.csv`
- `audits/` — 手書きの分析・効果判定レポート(git管理)。ファイル名に日付を入れる。
- `reports/` — スクリプトが生成するレポート(git管理)。

## 運用ルール

- 新しい GSC エクスポートは `raw/gsc-<日付>/` にフォルダごと入れる
  (`https___fujiseat.com_-...` のままにしない)。
- Klook の `ads_performance (n).csv` は **必ず改名してから** `raw/klook/` へ移す。
  `(n)` はダウンロード順の連番で、集計期間を一切表さないため。
  命名は集計期間そのもの:
  - 月をまたがない → `klook-YYYY-MM.csv`
  - 複数月 → `klook-YYYY-MM_MM.csv` (例 `klook-2026-05_07.csv`)
  - 月の途中まで → `klook-YYYY-MM-DD_MM-DD.csv` (例 `klook-2026-08-01_09-09.csv`)
- Klook の **ticket report**（`YYYY-MM-DD_YYYY-MM-DD_ticket_report.csv`）は
  予約1件ごとの明細で、ads_performance とは別物。`klook-tickets-YYYY-MM.csv` に改名して
  同じ `raw/klook/` へ。**何が実際に売れたか**はこちらにしか無いため、
  収益を分析するときは必ず両方を突き合わせる。
- `node scripts/hotel-funnel-report.mjs` は `reports/` に
  `hotel-funnel-<日付>.md` を出力する。
