# Hotel URL audit (revenue-funnel spec, Phase 5)

Date: 2026-07-14. Scope: every hotel-intent URL group in the codebase.
**No redirects are implemented from this table** — it is the decision input
required before any P2 URL change, per the spec ("リダイレクト実装前に、監査表を出力すること").

## URL groups

| URL | Route file | Title (short) | Canonical | Robots | Sitemap | 主検索意図 | 内部リンク | Affiliate CTA | Redirect先(現状) | 重複候補 | 推奨対応 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/areas-to-stay/tokyo-hotels/[slug]` ×36 | (削除済み — next.config redirects) | — | — | — | 除外済み | エリア別ホテル一覧 | 0(全て張替済) | — | tokyo-station→before-shinkansen / shinjuku・ueno・asakusa→vsページ / 他32→Finder詳細 | — | **維持(301済・変更不要)** |
| `/areas-to-stay/tokyo-hotels`(ハブ) | `tokyo-hotels/page.tsx` | Compare Tokyo hotel areas | self | en index | 掲載 | Tokyo hotels by area | 多数 | なし(ナビ) | — | Finder(診断)とは意図が異なる | **維持**(ナビハブ。Finderへ301すると「一覧意図」を失う) |
| `/areas-to-stay/tokyo/{shinjuku,ueno,asakusa,tokyo-station,east-tokyo}` ×5 | `tokyo/[area]/page.tsx` | エリア滞在ガイド | self | en index | 掲載 | エリア滞在情報(編集記事) | 少 | Trip/Booking | — | Finder詳細(?area=)と部分重複 | **canonicalのまま維持・投資凍結**。内容は編集記事でFinder詳細(データ表示)と形式が異なり、301の「内容ほぼ同一」条件を満たさない。GSCで表示ゼロが2ヶ月続けば個別に再評価 |
| `/areas-to-stay/asakusa-vs-ueno` ほか比較7本 | `[slug]/page.tsx`(stay.ts) | X vs Y | self | en index | 掲載(dynamicPaths) | 比較意図 | 中 | Trip(redirect)+内部 | — | なし | **独立維持**(仕様: 比較記事をエリア記事へリダイレクトしない) |
| `/areas-to-stay/where-to-stay-before-shinkansen` | 同上 | Before Shinkansen (Tokyo) | self | en index | 掲載 | 前泊意図 | 多 | Trip(redirect) | — | tokyo-station-hotels-before-shinkansen と近接 | **維持**。`tokyo-station-hotels-before-shinkansen` は「駅特化」で意図が狭く別立て可 → 現状維持、GSCで共食いが観測されたら301候補 |
| `/areas-to-stay/tokyo-station-hotels-before-shinkansen` | 同上 | Tokyo Station hotels before Shinkansen | self | en index | 掲載 | 駅特化の前泊 | 少 | Trip | — | where-to-stay-before-shinkansen | **監視**(共食い時のみ301候補。現時点では検索意図がより狭く独立) |
| `/areas-to-stay/kyoto-before-shinkansen` `/osaka-before-shinkansen` | 同上 | 前泊(京都/大阪) | self | en index | 掲載 | 前泊意図(都市別) | 中 | Trip | — | なし | **維持**(新設・意図固有) |
| `/areas-to-stay/tokyo-stay-area-index`(Finder) | `tokyo-stay-area-index/page.tsx` | Tokyo Stay Finder | self | en index | 掲載 | 診断意図 | 全サイト | Booking+Trip(registry) | — | なし | **維持**(診断意図は比較・一覧と統合しない) |
| `/areas-to-stay/tokyo-first-time` | `[slug]`→TokyoFirstTimeHub | First-time Tokyo | self | en index | 掲載 | 初訪問の滞在 | 多 | Booking+Trip | — | shinjuku-vs-ueno-vs-asakusa と部分重複 | **維持**(ハブ意図 vs 比較意図で別) |
| `/local-tokyo/*` ×6 | `local-tokyo/` | ローカルエリア | self | en index | 掲載 | 静かなエリア情報 | 少 | 少 | — | なし | **維持・投資凍結**(仕様どおり。Finderの calmer 受け皿) |
| `/local-hotel-picks{,/tokyo,/kyoto,/osaka}` | `local-hotel-picks/` | 実名ホテル例 | self | en index | 掲載 | ホテル実例 | 中 | Trip(hotel単位) | — | なし | **維持** |

## 301条件チェックの結論

仕様の5条件(内容同一・意図同一・上位互換・内部リンク統一可・canonical残置理由なし)を
**全て満たす新規候補は現時点でゼロ**。旧 tokyo-hotels/* 36本は既に適切に301済み。
`/areas-to-stay/tokyo/*` 5本と `tokyo-station-hotels-before-shinkansen` は「監視」— GSCで
2ヶ月クリックゼロ+共食いが確認された場合のみ、個別に301を再提案する。

## 内部リンク正規URL統一の状況

- 予約意図CTA → 直接プロバイダ(`/api/trip-hotel-redirect?area=…&sub=…`)に統一済み(今回)
- 情報意図リンク → Finder詳細(`?area=…#selected-area`)に統一済み(フェーズ3b)
- Finderへ送っていた旧「See X hotels」導線は今回の改修で予約直行に分離済み
