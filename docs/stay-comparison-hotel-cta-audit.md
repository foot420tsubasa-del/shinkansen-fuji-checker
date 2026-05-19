Stay comparison hotel CTA audit

Scope
- /areas-to-stay/asakusa-vs-ueno
- /areas-to-stay/tokyo-station-vs-shinjuku
- /areas-to-stay/ueno-vs-shinjuku
- /areas-to-stay/shinjuku-vs-ueno-vs-asakusa
- /areas-to-stay/kyoto-station-vs-gion
- /areas-to-stay/namba-vs-umeda
- /areas-to-stay/shin-osaka-vs-namba

Data sources inspected
- data/hotel-links.json
- data/hotel-pick-links.json
- data/local-hotel-picks.json
- data/affiliate-links.json
- data/stay-hotel-picks.json
- lib/affiliate/links.ts
- lib/hotel-links.ts
- lib/hotel-pick-links.ts
- lib/stay-hotel-picks.ts
- components/content/HotelPicks.tsx
- components/affiliate/HotelCTA.tsx

Implementation decision
- Stay comparison hotel pick buttons now use placement stay_comparison_hotel_pick.
- Hotel pick CTAs now support short provider buttons: Trip.com and Agoda.
- Agoda renders only when a hotel-specific agodaUrl exists in data/hotel-pick-links.json or the stay pick data.
- No Agoda area search URL is attached to a hotel-specific card.
- No placeholder Agoda button is rendered.

/areas-to-stay/asakusa-vs-ueno
- Gate Hotel Kaminarimon: Trip.com link id hotelPick.gate-hotel-kaminarimon.trip, URL status ready. Agoda link id hotelPick.gate-hotel-kaminarimon.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Richmond Hotel Asakusa: Trip.com link id hotelPick.richmond-hotel-asakusa.trip, URL status ready. Agoda link id hotelPick.richmond-hotel-asakusa.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Nohga Hotel Ueno Tokyo: Trip.com link id hotelPick.nohga-hotel-ueno-tokyo.trip, URL status ready. Agoda link id hotelPick.nohga-hotel-ueno-tokyo.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- MIMARU Tokyo Ueno East: Trip.com link id hotelPick.mimaru-tokyo-ueno.trip, URL status ready. Agoda link id hotelPick.mimaru-tokyo-ueno.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.

/areas-to-stay/tokyo-station-vs-shinjuku
- Hotel Metropolitan Tokyo Marunouchi: Trip.com link id hotelPick.hotel-metropolitan-tokyo.trip, URL status ready. Agoda link id hotelPick.hotel-metropolitan-tokyo.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Hotel Gracery Shinjuku: Trip.com link id hotelPick.hotel-gracery-shinjuku.trip, URL status ready. Agoda link id hotelPick.hotel-gracery-shinjuku.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Tokyu Stay Shinjuku Eastside: Trip.com link id hotelPick.tokyu-stay-shinjuku-eastside.trip, URL status ready. Agoda link id hotelPick.tokyu-stay-shinjuku-eastside.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.

/areas-to-stay/ueno-vs-shinjuku
- Nohga Hotel Ueno Tokyo: Trip.com link id hotelPick.nohga-hotel-ueno-tokyo.trip, URL status ready. Agoda link id hotelPick.nohga-hotel-ueno-tokyo.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Dormy Inn Ueno Okachimachi: Trip.com link id hotelPick.dormy-inn-ueno-okachimachi.trip, URL status ready. Agoda link id hotelPick.dormy-inn-ueno-okachimachi.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Hotel Gracery Shinjuku: Trip.com link id hotelPick.hotel-gracery-shinjuku.trip, URL status ready. Agoda link id hotelPick.hotel-gracery-shinjuku.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Tokyu Stay Shinjuku Eastside: Trip.com link id hotelPick.tokyu-stay-shinjuku-eastside.trip, URL status ready. Agoda link id hotelPick.tokyu-stay-shinjuku-eastside.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.

/areas-to-stay/shinjuku-vs-ueno-vs-asakusa
- Tokyu Stay Shinjuku Eastside: Trip.com link id hotelPick.tokyu-stay-shinjuku-eastside.trip, URL status ready. Agoda link id hotelPick.tokyu-stay-shinjuku-eastside.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Nohga Hotel Ueno Tokyo: Trip.com link id hotelPick.nohga-hotel-ueno-tokyo.trip, URL status ready. Agoda link id hotelPick.nohga-hotel-ueno-tokyo.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Gate Hotel Kaminarimon: Trip.com link id hotelPick.gate-hotel-kaminarimon.trip, URL status ready. Agoda link id hotelPick.gate-hotel-kaminarimon.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.

/areas-to-stay/kyoto-station-vs-gion
- Hotel Granvia Kyoto: Trip.com link id hotelPick.hotel-granvia-kyoto.trip, URL status ready. Agoda link id hotelPick.hotel-granvia-kyoto.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Daiwa Roynet Hotel Kyoto Hachijoguchi: Trip.com link id hotelPick.daiwa-roynet-kyoto-station.trip, URL status ready. Agoda link id hotelPick.daiwa-roynet-kyoto-station.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Sowaka Gion: Trip.com link id hotelPick.sowaka-gion.trip, URL status ready. Agoda link id hotelPick.sowaka-gion.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Hotel The Celestine Gion: Trip.com link id hotelPick.hotel-the-celestine-gion.trip, URL status ready. Agoda link id hotelPick.hotel-the-celestine-gion.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.

/areas-to-stay/namba-vs-umeda
- Cross Hotel Osaka: Trip.com link id hotelPick.cross-hotel-osaka.trip, URL status ready. Agoda link id hotelPick.cross-hotel-osaka.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Hotel Monterey Grasmere: Trip.com link id hotelPick.hotel-monterey-grasmere.trip, URL status ready. Agoda link id hotelPick.hotel-monterey-grasmere.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Hotel Granvia Osaka: Trip.com link id hotelPick.hotel-granvia-osaka.trip, URL status ready. Agoda link id hotelPick.hotel-granvia-osaka.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Hotel Hankyu International: Trip.com link id hotelPick.hotel-hankyu-international.trip, URL status ready. Agoda link id hotelPick.hotel-hankyu-international.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.

/areas-to-stay/shin-osaka-vs-namba
- Remm Shin-Osaka: Trip.com link id hotelPick.remm-shin-osaka.trip, URL status ready. Agoda link id hotelPick.remm-shin-osaka.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Courtyard by Marriott Shin-Osaka: Trip.com link id hotelPick.courtyard-marriott-shin-osaka.trip, URL status ready. Agoda link id hotelPick.courtyard-marriott-shin-osaka.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Cross Hotel Osaka: Trip.com link id hotelPick.cross-hotel-osaka.trip, URL status ready. Agoda link id hotelPick.cross-hotel-osaka.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.
- Hotel Monterey Grasmere: Trip.com link id hotelPick.hotel-monterey-grasmere.trip, URL status ready. Agoda link id hotelPick.hotel-monterey-grasmere.agoda, URL status missing. Agoda type none. Decision skip_missing_agoda.

Links needing human decision
- Add hotel-specific Agoda affiliate URLs for any card that should show an Agoda provider button.
- Do not paste Agoda area search URLs into hotel-specific pick records unless the public card copy is changed to area-level wording.

QA notes
- Trip.com URLs were not changed.
- Agoda buttons are guarded by a real hotel-specific agodaUrl.
- Empty Agoda URLs do not render.
- No fixed hotel prices were added.
- Hotel picks remain practical examples, not rankings.
- Tracking event name remains affiliate_click.
