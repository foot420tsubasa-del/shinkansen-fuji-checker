# Airport Transfer Omio URL Audit

Omio is used as a route comparison layer. Production Omio CTAs must render only when the admin entry has a converted affiliate/deeplink URL and `urlStatus = ready`.

## Manual Affiliate URL Workflow

1. Build or find the best Omio target URL:
   - preferred: pre-filled search form URL
   - second-best: route-specific Omio page
   - fallback: Omio Japan Airport Transfer category page
2. If using Travelpayouts Omio search form links, use completed search-form URLs with `departure_fk`, `arrival_fk`, and optional `mcids_train` / `mcids_bus` only when known.
3. Do not guess `departure_fk` or `arrival_fk`. If IDs are unknown, set `urlStatus = needs_city_id`.
4. Convert the target URL through Travelpayouts Tools > Links or the current Omio affiliate/deeplink generator.
5. Paste the final affiliate URL into admin as `directUrl` / affiliate URL.
6. Set `urlStatus = ready`.
7. Only then should the Omio CTA render.

Admin help text:

> Use this field for the final Omio affiliate URL. Route-specific or search-prefilled links are preferred. If only a generic Omio category URL is available, mark as fallback_only. Do not render missing or unconverted Omio URLs.

## Current Omio URL Audit

| ID | Current URL | Used on pages | Specificity | Affiliate ready? | Admin status | Action | Notes |
|---|---|---|---|---|---|---|---|
| omioNaritaAirportToTokyo | missing | `/airport-transfers/narita-to-tokyo-station`, Narita fallback | missing | No | needs_city_id | needs_manual_affiliate_url | Add route-specific or pre-filled Narita Airport → Tokyo affiliate URL. |
| omioNaritaAirportToShinjuku | missing | `/airport-transfers/narita-to-shinjuku` | missing | No | needs_city_id | needs_manual_affiliate_url | If Shinjuku unsupported, use Tokyo fallback in comparison block only. |
| omioNaritaAirportToUeno | missing | `/airport-transfers/narita-to-ueno` | missing | No | needs_city_id | needs_manual_affiliate_url | Can support Asakusa fallback if direct Asakusa is unavailable. |
| omioNaritaAirportToAsakusa | missing | `/airport-transfers/narita-to-asakusa` | missing | No | needs_city_id | needs_manual_affiliate_url | If Asakusa unsupported, fallback to Tokyo or Ueno in comparison block only. |
| omioHanedaAirportToTokyo | missing | `/airport-transfers/haneda-to-tokyo-station`, Haneda fallback | missing | No | needs_city_id | needs_manual_affiliate_url | Add route-specific or pre-filled Haneda Airport → Tokyo affiliate URL. |
| omioHanedaAirportToShinjuku | missing | `/airport-transfers/haneda-to-shinjuku` | missing | No | needs_city_id | needs_manual_affiliate_url | If Shinjuku unsupported, use Tokyo fallback in comparison block only. |
| omioHanedaAirportToUeno | missing | `/airport-transfers/haneda-to-ueno` | missing | No | needs_city_id | needs_manual_affiliate_url | Add route-specific or pre-filled search affiliate URL. |
| omioHanedaAirportToAsakusa | missing | `/airport-transfers/haneda-to-asakusa` | missing | No | needs_city_id | needs_manual_affiliate_url | If Asakusa unsupported, use Tokyo fallback in comparison block only. |
| omioKansaiAirportToKyoto | missing | `/airport-transfers/kansai-airport-to-kyoto`, `/airport-transfers/kyoto-to-kansai-airport` | missing | No | needs_city_id | needs_manual_affiliate_url | Add KIX ↔ Kyoto route-specific affiliate URL. |
| omioKansaiAirportToOsaka | missing | `/airport-transfers/kansai-airport-to-umeda`, `/airport-transfers/osaka-to-kansai-airport` | missing | No | needs_city_id | needs_manual_affiliate_url | Use as Osaka fallback if Namba/Umeda unsupported. |
| omioKansaiAirportToNamba | missing | `/airport-transfers/kansai-airport-to-namba` | missing | No | needs_city_id | needs_manual_affiliate_url | If Namba unsupported, fallback to Osaka in comparison block only. |
| omioJapanAirportTransfer | missing | fallback comparison block only | country_category | No | needs_affiliate_conversion | needs_manual_affiliate_url | Target URL: `https://www.omio.com/airport-japan-transfers`. |
| omioJapanTrain | `https://omio.sjv.io/rEXxE5` | fallback comparison block only | country_category | Yes | ready | fallback_only | Keep for general Japan train comparison, not product-level airport buttons. |
| omioJapanBus | `https://omio.sjv.io/c/7293958/3786675/7385` | fallback comparison block only | country_category | Yes | ready | fallback_only | Keep for general Japan bus comparison. |
| omioShinkansen | `https://omio.sjv.io/DW3rWo` | Shinkansen pages | route_specific_page | Yes | ready | keep | Not airport-specific. |
| omioTokyoKyoto | `https://omio.sjv.io/c/7293958/3883919/7385` | Tokyo to Kyoto rail pages | route_specific_page | Yes | ready | keep | Not airport-specific. |
| omioTokyoOsaka | `https://omio.sjv.io/c/7293958/3786678/7385` | Tokyo to Osaka rail pages | route_specific_page | Yes | ready | keep | Not airport-specific. |

## Rendering Rules

- Option-level Omio buttons render only for route-specific IDs with `urlStatus = ready`.
- Generic Omio Japan train/bus links do not render beside product-specific Klook airport transfer buttons.
- Fallback Omio links can render only in the secondary “Not sure which transfer is best?” block.
- Private transfer remains Klook-only unless a specific valid Omio private-transfer affiliate URL is added later.
