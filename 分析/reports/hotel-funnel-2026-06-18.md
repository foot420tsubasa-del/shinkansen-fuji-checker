# Hotel funnel — fujiseat.com (manual analysis)

_Window: 2026-05-19 → 06-17 (last 28 days). Sources: GA4 "Pages and screens" CSV, GSC Queries + Pages CSV._

> Conversion data (GA4 affiliate_click, **5 days** 2026-06-14→18, by provider ×
> category): **7 total clicks** — 5 train (Klook), **2 hotel** (Booking 1, Trip 1).
> ≈ 12 hotel clicks/month. This confirms the diagnosis: hotel conversion is tiny
> because **hotel pages barely get traffic**, not because CTAs fail.
> Still missing: affiliate_click broken down by **page_path / placement** (and a
> 28-day window) to see *which* page/CTA produces the hotel clicks. Pull that
> next time to optimize specific CTAs.

## TL;DR
Hotel revenue ≈ 0 is **a traffic problem, not a conversion problem.** Hotel
pages get almost no visits because (a) the site's huge search asset — the
Shinkansen seat **/guide** — barely funnels readers to hotel content, and
(b) most hotel pages rank on Google page 3–5. Fix the funnel from /guide first;
it's the only page with real volume.

## The one number that matters
| Page | Clicks | Impressions | CTR | Avg pos |
|---|--:|--:|--:|--:|
| **/guide (seat guide)** | **307** | **45,924** | **0.67%** | 6.88 |
| /areas-to-stay/asakusa-vs-ueno | 10 | 1,142 | 0.88% | 10.05 |
| /areas-to-stay/tokyo-station-vs-shinjuku | 1 | 172 | 0.58% | 10.99 |
| /areas-to-stay/tokyo-hotels (hub) | 1 | 12 | 8.3% | 4.83 |
| /areas-to-stay/tokyo-hotels/shinjuku | 0 | 219 | 0% | **36.05** |
| /areas-to-stay/tokyo-hotels/tokyo-station | 0 | 170 | 0% | **43.69** |

`/guide` is ~90% of all search clicks and impressions. GA4 agrees: the seat
guide page = 517 views (the #1 page); every hotel page is in the single digits
to low tens. **All hotel upside flows from routing /guide traffic + lifting the
few hotel pages that already sit on page 1.**

## Demand that exists (GSC queries)
- **"ueno or asakusa / asakusa vs ueno / where to stay" cluster** — many queries,
  ~60–105 impressions each, ranking **pos ~8** (page 1 bottom), already getting a
  few clicks. This is the strongest hotel-intent you actually rank for.
- **"hotels near tokyo station" (67 imp), "hotels near shinjuku station" (51),
  "hotels near hamamatsucho" (47)** — real demand, but your pages rank **pos 36–43**
  (page 4–5) → zero clicks. Long-term SEO, not a quick win.

## Recommendations — highest leverage first

### 1. Bridge /guide → hotels (fastest, do this first)
`/guide` is the firehose. Add a contextual hotel module on the seat guide:
e.g. after the seat advice, _"Staying in Tokyo the night before your Shinkansen?
→ Best Tokyo hotel areas by trip style"_ linking to
`/areas-to-stay/tokyo-first-time` (pos 2.6 — already ranks well) and the hotel-area
finder. This converts traffic you already have. Track it with an
`internal_link_click` (placement `guide_to_hotels`) so next month you can measure it.

### 2. Lift /guide CTR (0.67% → target 1.5%+)
At position ~7 with **45,924 impressions**, 0.67% CTR is low (pos-7 is usually
3–8%). Rewrite the `<title>` + meta description to be more clickable (lead with
"Seat E, right side", add Tokyo→Kyoto/Osaka, a benefit). Lifting CTR to ~1.5%
≈ **+350 clicks/month** of top-of-funnel — pair with #1 so some flow to hotels.

### 3. Push the 3 hotel comparison pages from pos ~10 → 5–7 (hotel SEO quick win)
These already sit on page 1 and match real demand:
- `/areas-to-stay/asakusa-vs-ueno` (pos 10.0, **1,142 imp** — biggest)
- `/areas-to-stay/tokyo-station-vs-shinjuku` (pos 11.0, 172 imp)
- `/areas-to-stay/shinjuku-vs-ueno-vs-asakusa` (pos 10.4, 99 imp)
Actions: add internal links to them from `/guide` and from each other; tighten
titles to match query phrasing ("Ueno or Asakusa: where to stay in Tokyo?");
make sure each has a clear hotel CTA above the fold. Moving asakusa-vs-ueno from
pos 10 → 6 alone could ~3–5× its clicks.

### 4. Hotel hub `/areas-to-stay/tokyo-hotels` ranks pos 4.83 but gets ~12 imp
Good rank, tiny demand → it's not the query people search. Point internal links
at the comparison/where-to-stay pages (which have demand) rather than the hub.

### 5. Defer: the `/areas-to-stay/tokyo-hotels/[station]` detail pages
shinjuku/tokyo-station/hamamatsucho etc. have impressions but rank pos 36–44.
Worth strengthening later via internal links from #1–#3, but don't expect quick
revenue here.

## Honest framing
Total search clicks are ~300/month, ~90% to one seat guide. Hotel affiliate is a
**side-monetization of the seat-guide audience**, not (yet) a standalone channel.
The realistic play: ride the seat-guide traffic and bridge it into hotel-area
content (#1, #2), and nudge the 3 page-1 comparison pages up (#3). Revisit with
the GA4 Events export so we can measure hotel `affiliate_click` per page.
