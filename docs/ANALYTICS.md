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
