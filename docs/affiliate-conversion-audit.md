# Affiliate Conversion Registry Audit

This audit documents the current centralized affiliate structure. Runtime links are managed by `data/affiliate-links.json`, hotel area links by `data/hotel-links.json`, individual stay-page hotel picks by `data/hotel-pick-links.json`, and curated local hotel picks by `data/local-hotel-picks.json`.

`lib/affiliate/links.ts` combines these sources into a traceable registry for analytics enrichment. It does not replace the existing admin JSON flow.

| Page | Placement | Provider | Product | ADID | Link source | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Home seat result | `seat_result` / `home_after_seat` | Klook | Shinkansen ticket / JR Pass / eSIM | `1265303`, `1165791`, `1166001` | `data/affiliate-links.json` | Existing seat-result CTAs remain unchanged. |
| Home essentials | `home_essentials` | Klook | eSIM / airport transfer / insurance | varies by link ID | `data/affiliate-links.json` | Registry enriches clicks by URL where possible. |
| `/guide` | `guide_booking_option` / `guide_top` | Klook | Shinkansen ticket / JR Pass / eSIM | `1265303`, `1165791`, `1166001` | `data/affiliate-links.json` | Existing tracked links remain in place. |
| `/plan-your-trip` | `plan_trip_*` / existing placements | Klook / Trip.com | train / hotel / eSIM / airport / activity | varies | `data/affiliate-links.json`, `data/hotel-links.json` | Existing reduced CTA hierarchy remains unchanged. |
| `/planner` | `planner_route_stack` / existing placements | Klook | rail / eSIM / insurance | varies | `data/affiliate-links.json` | Existing planner tracking remains unchanged. |
| `/jr-pass-vs-single-ticket` | `jr_pass_comparison` | Klook / Omio | JR Pass / route comparison | `1165791`, Omio direct | `data/affiliate-links.json` | Omio appears only when a direct URL is configured. |
| `/tokyo-to-kyoto-shinkansen-ticket` | `shinkansen_ticket` / `train_route_comparison` | Klook / Omio | Shinkansen ticket / route comparison | `1265303`, Omio direct | `data/affiliate-links.json` | Klook stays primary; Omio is route comparison. |
| Stay detail pages | `stay_quick_recommendation` / `stay_area_hotel_card` | Trip.com / Agoda / Klook fallback | hotel area search | n/a or legacy Klook adid | `data/hotel-links.json` | Trip.com dynamic redirect uses Trip URL as tracking href. |
| Stay hotel picks | `hotel_pick` | Trip.com / Agoda | hotel pick | n/a | `data/hotel-pick-links.json` | Registry covers individual Trip.com/Agoda URLs. |
| `/local-hotel-picks` | `local_hotel_pick` | Agoda / Trip.com | local hotel pick | n/a | `data/local-hotel-picks.json` | Provider buttons remain managed by existing JSON fields. |
| Footer / next steps | `footer` / `next_steps` | Klook | essentials | varies | `data/affiliate-links.json` | Existing event names remain unchanged. |

## Registered Product Groups

- Klook Shinkansen single ticket: `shinkansenTicket`
- Klook JR Pass: `jrPass` with ADID `1165791`
- Klook eSIM: `esim`
- Klook airport transfer: `airportTransfer`, plus transfer-specific links such as `nex`, `skyliner`, `limousineBus`, `hanedaMonorail`
- Klook travel insurance: `insurance`
- Klook activities: city and activity IDs such as `cityTokyo`, `cityKyoto`, `teamlabBorderless`, `universalStudiosJapan`
- Trip.com hotel area links: generated registry IDs like `hotelArea.shinjuku.trip`
- Trip.com individual hotel pick links: generated registry IDs like `hotelPick.hotel-gracery-shinjuku.trip`
- Agoda curated local hotel picks: generated registry IDs like `localHotelPick.<id>.agoda`
- Omio route comparison links: `omioShinkansen`, `omioTokyoKyoto`, `omioTokyoOsaka`, `omioJapanRailPass`, `omioJapanTrain`, `omioJapanBus`

## Omio URL Status

All Omio IDs currently present in `data/affiliate-links.json` have `directUrl` values. No TODO placeholder URL was added.
