# Airport Transfer Affiliate Audit

This audit documents the current airport-transfer affiliate inventory used for the Klook + Omio provider-choice model. No affiliate URLs were changed as part of this audit.

## Usage Rule

- Klook is used for concrete booking or product-purchase CTAs.
- Omio is used for route comparison / transport search CTAs.
- Klook and Omio appear side-by-side only when the user intent is choosing or booking a transport route.
- Private airport transfer remains Klook-only unless a clearly matching Omio private-transfer URL is added later.
- Entries marked `MISSING_AFFILIATE_URL_DO_NOT_RENDER` must not render a CTA.

## Affiliate Inventory

| ID | Provider | Product | URL exists | Used on pages | Notes |
|---|---|---|---|---|---|
| nex | Klook | airport_train | Yes | Narita Express route options | Existing admin ID for Narita Express. Required alias `naritaExpress`; do not add duplicate URL. |
| skyliner | Klook | airport_train | Yes | Keisei Skyliner route options | Existing admin ID for `keiseiSkyliner`. |
| keiseiSkyliner | Klook | airport_train | Yes | Alias/admin ID for Keisei Skyliner | Added as an alias using the existing affiliate/deeplink URL for the same Klook activity target. |
| limousineBus | Klook | airport_bus | Yes | Narita/Haneda/Kansai airport bus options | Existing shared airport limousine bus URL currently points to the Narita Limousine Bus Klook target. |
| naritaLimousineBus | Klook | airport_bus | Yes | Alias/admin ID for Narita Limousine Bus | Added as an alias using the existing affiliate/deeplink URL for the same Klook activity target. |
| hanedaLimousineBus | Klook | airport_bus | Yes | Haneda airport bus options | Affiliate/deeplink URL configured in admin. |
| hanedaMonorail | Klook | airport_train | Yes | Tokyo Monorail route options | Existing admin ID for `tokyoMonorail`. |
| airportTransfer | Klook | airport_train | Legacy entry | Guide essentials / legacy N'EX | Existing URL points to Narita Express, so it is not used for private transfer CTAs. |
| airportPrivateTransfer | Klook | airport_private_transfer | Yes | Generic private transfer fallback | Affiliate/deeplink URL configured in admin. Prefer airport-specific IDs when possible. |
| naritaPrivateTransfer | Klook | airport_private_transfer | Yes | Narita private transfer options | Affiliate/deeplink URL configured in admin. |
| hanedaPrivateTransfer | Klook | airport_private_transfer | Yes | Haneda private transfer options | Affiliate/deeplink URL configured in admin. |
| jrHaruka | Klook | airport_train | Yes | Kansai Airport to/from Kyoto | Affiliate/deeplink URL configured in admin. |
| kixLimousineBus | Klook | airport_bus | Yes | Kansai Airport bus options | Affiliate/deeplink URL configured in admin. |
| nankaiRapit | Klook | airport_train | Yes | KIX to/from Namba | Affiliate/deeplink URL configured in admin. |
| icocaHaruka | Klook | airport_combo_pass | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered | No converted affiliate/deeplink URL found. |
| skylinerSubwayPass | Klook | airport_combo_pass | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered | No converted affiliate/deeplink URL found. |
| icCard | Klook | ic_card | MISSING_AFFILIATE_URL_DO_NOT_RENDER | IC-card notes only | No converted affiliate/deeplink URL found. Keep “No booking needed - use IC card”. |
| osakaAirportBus | Klook | airport_bus | MISSING_AFFILIATE_URL_DO_NOT_RENDER | KIX bus uses shared limousineBus if needed | No separate converted Osaka airport bus affiliate URL found. |
| klookTokyoTransport | Klook | transport | Yes | Fallback only | Affiliate/deeplink URL configured in admin. Use only when a specific product URL is unavailable. |
| klookAirportTransfers | Klook | airport_private_transfer | Yes | Fallback only | Affiliate/deeplink URL configured in admin. Use only when a specific airport transfer URL is unavailable. |
| omioJapanTrain | Omio | train_compare | Yes | Airport train comparison buttons and route comparison block | Existing Omio Japan train comparison URL. |
| omioJapanBus | Omio | route_compare | Yes | Airport bus comparison buttons when relevant | Existing Omio Japan bus comparison URL. |
| omioShinkansen | Omio | shinkansen_compare | Yes | Rail pages, not airport-specific | Existing Shinkansen comparison URL. |
| omioRouteCompare | Omio | route_compare | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered as separate ID | No separate affiliate/deeplink admin ID found; use existing Omio train/bus IDs where relevant. |
| omioJapanAirportTransfer | Omio | airport_route_compare | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered | Canonical target known (`https://www.omio.com/airport-japan-transfers`), but no converted affiliate/deeplink URL is configured. |
| omioTokyoAirportTransfer | Omio | airport_route_compare | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered | No converted Tokyo airport-transfer affiliate/deeplink URL found. |
| omioKansaiAirportTransfer | Omio | airport_route_compare | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered | No converted Kansai airport-transfer affiliate/deeplink URL found. |
| omioNaritaToTokyo | Omio | airport_route_compare | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered | No route-specific converted Omio URL found. |
| omioHanedaToTokyo | Omio | airport_route_compare | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered | No route-specific converted Omio URL found. |
| omioKansaiToKyoto | Omio | airport_route_compare | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered | No route-specific converted Omio URL found. |
| omioKansaiToOsaka | Omio | airport_route_compare | MISSING_AFFILIATE_URL_DO_NOT_RENDER | Not rendered | No route-specific converted Omio URL found. |
| omioJapanRailPass | Omio | route_compare | Yes | JR Pass comparison contexts only | Not used as an airport transfer provider. |

## Current Rendering Rules

- Route options with an existing matching Klook booking URL render a short `Klook` button.
- Train or airport-bus options with a relevant existing Omio comparison URL render a short `Omio` button beside Klook.
- Private transfer options render only `Klook`.
- Private transfer options do not render the legacy `airportTransfer` URL because that entry currently points to Narita Express, not a private-transfer product.
- Haneda/Kansai airport bus options use their own configured affiliate IDs and do not reuse the Narita Limousine Bus affiliate URL.
- Local train / IC-card options without a matching booking URL render the muted note only.
- The secondary “Not sure which transfer is best?” card renders only when an existing Omio URL is available.
