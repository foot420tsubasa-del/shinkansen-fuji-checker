# Codex Prompt

Please use this folder as a visual reference pack for rebuilding fujiseat.com UI.

Goal:
Recreate the visual quality, spacing, card system, typography, header, footer, hero layouts, tables, and dashboard sections shown in these static HTML pages and the `reference-mockups/` images, while preserving the production app's existing behavior.

Critical constraints:

- This is not a minor CSS polish task. Treat it as a UI shell rebuild.
- Do not remove existing production logic, routes, SEO metadata, affiliate links, GA4 events, or i18n.
- First create temporary `/design/*` routes or isolated components for visual reproduction.
- Once the visual shell is close, connect existing logic page by page.
- For the Seat Checker, standard-car Fuji-side recommendation is always Seat E in either direction.
- Never implement A-seat as Fuji-side guidance.
- Keep the brand text as `fujiseat.com`.
- Do not show the developer's face on the Home or About page.
- Treat hotel names/prices/ratings in these static files as placeholders unless production has verified data.

Suggested order:

1. Design tokens and base components: Header, Footer, Hero, Card, CTA, Section, Table, RouteStrip.
2. Home static shell.
3. Seat Checker static shell, then connect existing seat logic and affiliate CTAs.
4. Essentials page shell, then reconnect affiliate tracking.
5. Stay Areas page shell, then connect approved hotel links.
6. Quiet Tokyo and Kiyosumi guide.
7. Planner.
8. Command Center.
9. About.

For each page:

- List changed files before implementation.
- Keep existing production behavior unless explicitly replaced.
- Run build/lint after changes.
- Report any differences from the reference mockup that remain.
