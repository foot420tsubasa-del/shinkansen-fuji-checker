# Analytics Setup

Recommended GA4 events to mark or monitor for fujiseat.com.

## Key Events

- `affiliate_click`: outbound partner clicks. Use dimensions `event_category` and `event_label` to see placement and destination.
- `template_select`: planner route template selection.
- `checklist_complete`: planner checklist item completion.

## Suggested Conversions

- Mark `affiliate_click` as a key event in GA4.
- Create comparisons by `event_category`: `checklist`, `bookings-sidebar`, `planner-footer`, `guide`, `trip-picks`, `next-actions`, `seat-result`.
- Watch `template_select` to see which route templates drive downstream partner clicks.

## Search Console / SEO Checks

- Submit `https://fujiseat.com/sitemap.xml`.
- Verify `https://fujiseat.com/robots.txt` returns 200.
- Monitor indexed pages by language. Non-English utility pages that are still mostly English should stay `noindex` until fully translated.

## Notes

- Affiliate links should use `rel="sponsored nofollow noopener noreferrer"`.
- Keep tracking anonymous. Do not collect email addresses unless the product direction changes.

## 車窓検索・景色ルートの計測（2026-11-20 追加）

既存の GA4（gtag）だけを使います。新しいサービス・同意バナー・Cookie は追加していません。自由入力された文字は送りません。駅名は、こちらの駅リストにある名前に一致したときだけ送り、それ以外は `unresolved` にします。

| イベント | いつ | 主なパラメータ |
|---|---|---|
| `route_search` | トップの From/To 検索 1回につき1件。共有URL（`?from=&to=`）で開いた場合も含む | `result`（`live` / `unsupported` / `invalid`）、`route_id`、`reason`（`no-view-between` / `different-lines` / `unmapped` / `unresolved` / `same_station`）、`from_station`、`to_station`、`source`（`form` / `link`）、`locale` |
| `scenic_filter_apply` | `/scenic` を絞り込み付きで開いたとき（GETフォームのため、検索1回で1回） | `view`、`region`、`season`（指定なしは `any`）、`results`、`best`（季節指定時の「見頃」件数） |
| `scenic_route_view` | `/scenic/<slug>` を開いたとき | `route_id`、`from_hub`（`/scenic` から来たか）、`locale` |
| `affiliate_click`（既存） | 予約・アフィリエイトリンクのクリック | `placement`、`provider`、`link_id` など |

### GA4 での確認方法

1. 管理 → カスタム定義 → カスタムディメンション（イベントスコープ）に、次を登録します：`result`、`reason`、`route_id`、`from_station`、`to_station`、`source`、`view`、`region`、`season`、`from_hub`。登録するまでレポートに出ません。登録後のデータから使えます。
2. 動作確認は URL に `?ga_debug=1` を付けて開き、GA4 の DebugView で見ます。
3. 主な見方（探索レポート）
   - 検索の成功率：`route_search` を `result` 別に。
   - 失敗の理由：`result = unsupported` を `reason` 別に。
   - 未対応の区間：`from_station` × `to_station`。
   - 絞り込みの使われ方：`scenic_filter_apply` を `view`・`region`・`season` 別に。
   - 一覧から詳細へ：`scenic_route_view` の `from_hub = true` の割合。
   - 予約まで：`affiliate_click` を `placement` 別に（`scenic_route_ticket`、`scenic_route_stay`、`guide_seat_result` など）。

### 11/29 の効果測定との関係

- **過去と比べられるもの**（以前から計測している）
  - `cta_click`（`placement = route_search`。ラベルに `出発→到着|route_id or unsupported` が入る）
  - `seat_check_complete`
  - `affiliate_click`
  - `cta_click`（`placement = home_scenic_discovery`）
  - 通常のページビュー
  - `cta_click` の `route_search` は、比較を続けられるよう残しています。
- **今回から計測を始めたもの**（過去の比較はできない）
  - `route_search`、`scenic_filter_apply`、`scenic_route_view`
  - 11/29 の判定には使わず、それ以降の基準値として使います。

### GA4 カスタムディメンションの登録（優先順）

2026-11-20 時点で、GA4 の管理画面には手を入れていません。そのため、これらはまだ**未登録**です。登録はイベントスコープで行い、登録した日以降のデータに使えます。

1. `result`（route_search）：検索の成功率。最優先
2. `reason`（route_search）：未対応の理由
3. `route_id`（route_search、scenic_route_view）：どの路線が見られ、答えられているか
4. `placement`（affiliate_click）：予約リンクの位置ごとの比較。すでに登録済みなら不要
5. `from_hub`（scenic_route_view）：一覧から詳細ページへ進んだか
6. `view`、`season`、`region`（scenic_filter_apply）：絞り込みの使われ方
7. `from_station`、`to_station`（route_search）：未対応区間の需要。値が多いので最後

確認方法：URL に `?ga_debug=1` を付けて開き、DebugView でイベントとパラメータが届くことを確かめます。登録後24〜48時間で、標準レポートと探索に出ます。
