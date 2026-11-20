# Codex independent review: Golden Route and Miyajima ferry (2026-11-21)

You are an independent reviewer. Do NOT edit, create, commit or push any file in this repository. Read only. Write your whole report as your final message, in Japanese.

Pages (production):
- https://fujiseat.com/scenic
- https://fujiseat.com/scenic/golden-route
- https://fujiseat.com/scenic/miyajima-ferry
- https://fujiseat.com/guide

Code and data: `app/[locale]/scenic/golden-route/page.tsx`, `app/[locale]/scenic/miyajima-ferry/page.tsx`, `data/golden-route.json`, `data/scenic-photo-credits.json`, `app/sitemap.ts`, `docs/golden-route-2026-11-21.md`. Commits d6d565f, 530bded.

Readers: independent travellers from the US, Canada and Australia, mostly on phones.

## A. UX and design
If you can run a headless browser (e.g. Playwright or Chrome headless already installed on this machine), capture each page at 375, 390, 768, 1280 and 1440 px wide into /tmp/codex-review/. If you cannot, say so and review from the HTML and code instead; do not pretend you saw screenshots.
Judge: photo appeal, polish, readability, consistency with the rest of the site, where to click, clarity of route/map info, whether it makes people want to plan, any distrust of ads/affiliate links, phone experience. For every problem give page, width, (screenshot path if any) and the concrete reason. Subjective verdicts ("cheap", "too much text") are welcome but must say what causes them.

## B. Accuracy (check against official pages; prefer the Japanese official page and note its update date if EN and JA differ)
- Miyajima JR ferry: right side facing forward for the Great Torii — https://jr-miyajimaferry.co.jp/route
- Great Torii sailing hours — https://jr-miyajimaferry.co.jp/timetable
- Fare and Miyajima Visitor Tax — https://jr-miyajimaferry.co.jp/fare , https://www.city.hatsukaichi.hiroshima.jp/soshiki/110/59551.html
- JR Pass acceptance — https://jr-miyajimaferry.co.jp/en/
- etSETOra operating days and booking — https://www.jr-odekake.net/railroad/kankoutrain/etsetora/ and /reservation/
- Shin-Osaka → Hiroshima journey time (the page says about 1 h 25 min by Mizuho to about 1 h 50 min by Hikari)
- Whether the page clearly separates views from your own Shinkansen from detours that need another train or ferry
- Hiroshima City 2025 foreign visitor count (~2.56 million?) from an official Hiroshima City source; report the figure and URL or say it could not be confirmed.
Record every mismatch with the fact, the time you checked and the URL.

## C. SEO and implementation
canonical, hreflang, sitemap.xml entries, noindex on non-English locales (current policy: scenic pages are English-only and other locales are noindex), internal links, image sizes (must be WebP ≤ 300 KB), photo licence credits, broken links, structured data, and any effect on existing pages. Use curl for HTML. The 114 existing tests already pass; focus on what they do not cover.

## D. Booking links
Judge whether the three Klook links on /scenic/golden-route (Tokyo→Kyoto, Osaka→Hiroshima, Tokyo→Hiroshima) match what a traveller on this route needs, and whether any wording is misleading. Do NOT open or request affiliate.klook.com or booking.tpx.lv URLs (that records tracking clicks); judge from the HTML and data only.

## Output
Sections A–D. Classify each finding as Critical (factual error, booking impact, broken link, serious display bug), Improvement (clear benefit to understanding or trust), or Optional (taste). Say explicitly what is fine and needs no change.
