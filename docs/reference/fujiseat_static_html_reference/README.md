# fujiseat.com Static HTML UI Reference Pack

This folder is a static HTML design reference for rebuilding fujiseat.com closer to the latest mockups.

## Files

- `index.html` — Home
- `seat-checker.html` — Shinkansen Mt. Fuji Seat Checker
- `planner.html` — Trip Planner
- `quiet-tokyo.html` — Quiet Tokyo Hub
- `kiyosumi-shirakawa.html` — Neighborhood Guide example
- `stay-areas.html` — Tokyo Stay Areas comparison
- `essentials.html` — Japan Trip Essentials
- `command-center.html` — Trip Command Center
- `about.html` — About fujiseat.com
- `assets/styles.css` — shared CSS
- `assets/img/` — generated SVG image assets
- `reference-mockups/` — generated PNG mockups used as visual references

## Important factual rule

For standard Tokaido Shinkansen cars, the Fuji-side recommendation in this design is always **Seat E**, whether traveling Tokyo → Kyoto/Osaka or Kyoto/Osaka → Tokyo. Do not add A-seat as the Fuji-side recommendation.

## Intended use

Do not paste these files directly over the production app. Use them as a visual blueprint.

Recommended implementation flow:

1. Create a temporary route such as `/design/home` in the Next.js app.
2. Rebuild the static page visually using the HTML/CSS here as a guide.
3. Once the visual shell is close, connect existing production logic, i18n, SEO, affiliate links, and GA4 events.
4. Move one page at a time into the production route.

## Notes

- Hotel names, prices, ratings, and activity cards are placeholders for UI structure.
- Replace placeholder data with current production-safe data or affiliate program-approved links.
- The About page intentionally avoids a developer face photo.
- The site brand is written as `fujiseat.com`.
