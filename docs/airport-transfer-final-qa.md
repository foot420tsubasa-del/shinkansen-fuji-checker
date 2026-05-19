# Airport Transfer CTA Final QA Checklist

Use this checklist when changing airport transfer option data, affiliate registry entries, or CTA rendering.

- Taxi options must not render Klook.
- Normal taxi options must use: "No advance booking needed - use taxi stand".
- Private transfer must be separate from Taxi.
- IC-card-only train options must not render Klook.
- JR Kansai Airport Rapid must be IC card / no booking.
- Nankai Airport Express must be IC card / no booking.
- Keikyu / Keisei local and direct local routes must be IC card / no booking.
- Nankai Rapi:t link only appears on Nankai Rapi:t options.
- Keisei Skyliner link only appears on Keisei Skyliner options.
- JR Haruka link only appears on JR Haruka options.
- Narita Express link only appears on Narita Express options.
- Airport Limousine Bus links only appear on Airport Limousine Bus options.
- "Book or compare" appears only when Omio is rendered at option level.
- Omio option-level appears only on route-specific/search-prefilled links.
- Generic Omio fallback appears only in the comparison block.
- Private transfer does not render Omio.
- Normal taxi does not render Omio.
- IC-card-only local trains do not render Omio option-level.
- No duplicated CTA labels such as "Get eSIM Get eSIM".
- No visible raw markdown artifacts such as "##" or "###".
- No card body text is collapsed into a CTA button area.
- Tracking event names remain unchanged.
- No placeholder Omio links render.
