# DESIGN.md — fujiseat Evolution

Version: v0.1
Status: Working design brief for Codex / Claude Code / manual implementation
Primary language: English UI first, with i18n-ready structure

---

## 1. Product Summary

**fujiseat** started as a focused utility for one high-intent problem:

> "Which Shinkansen seat should I book to see Mt. Fuji?"

That utility remains the entry point and signature feature.

The next evolution is:

> **A Japan travel utility hub for international travelers** that combines practical planning tools, comparison surfaces, and booking/affiliate modules without losing the clarity and hand-feel of the original seat checker.

This is **not** a generic travel blog and **not** a cluttered OTA clone.
It should feel like a **smart travel operations tool** built by someone who actually understands Japan travel friction.

---

## 2. Core Positioning

### Current perceived value
- Fast
- Useful
- Specific
- Trustworthy enough for a niche task
- Easy to understand in seconds

### Target perceived value after redesign
- Still fast and useful
- More premium and polished
- Helps users make multiple travel decisions, not just one
- Supports trip planning, comparison, and booking prep
- Naturally monetizes through context-aware affiliate placements

### One-line positioning
> Plan Japan smarter — from the best Mt. Fuji Shinkansen seat to where to stay, how to move, and what to book.

---

## 3. Design Goal

Create a site that preserves the current product's **clarity and usefulness**, while introducing a more structured, premium, dashboard-like planning experience.

The visual and UX goal is:

- keep the friendliness and immediacy of a useful travel tool
- add stronger information architecture
- create more opportunities for comparison and trip building
- support affiliate monetization without becoming spammy

The product should feel like:

- **more intentional than a blog**
- **lighter and more approachable than an enterprise dashboard**
- **more useful than a static affiliate guide**

---

## 4. Design Principles

### 4.1 Utility first
Every surface must help the user make a decision.
If a section exists only to "fill space," remove it.

### 4.2 One-screen comprehension
The homepage should communicate within a few seconds:
- what this tool does
- why it is different
- what the user can do next

### 4.3 Keep the original hand-feel
Do not over-corporatize the site.
Do not turn it into a cold, generic dashboard.
It should still feel tactile, useful, and specific.

### 4.4 Affiliate links must feel earned
Affiliate modules must appear as:
- next actions
- recommended options
- comparison choices
- trip picks

They must **not** feel like random ads injected into content.

### 4.5 The product should guide, not overwhelm
The interface can be information-dense, but the visual hierarchy must make it easy to scan.

### 4.6 Build around travel decisions, not article categories
Users do not think in taxonomy like:
- Guide
- Blog
- News

They think in jobs like:
- where should I stay?
- how do I get from airport to hotel?
- should I book a Fuji day tour?
- what seat should I book?

---

## 5. Product Scope

### 5.1 Core product areas
1. **Seat Checker**
   - Mt. Fuji side / seat recommendation for Tokaido Shinkansen
2. **Japan Planner**
   - lightweight trip-planning surface
3. **Areas to Stay**
   - neighborhood comparison and hotel-oriented decision support
4. **Airport Transfers**
   - airport-to-city route choice support
5. **Itineraries**
   - suggested route structures for first-time visitors and common trip lengths
6. **Essentials**
   - eSIM, train booking, luggage forwarding, tickets, tours
7. **Trip Picks**
   - saved or recommended travel items forming a lightweight booking tray

### 5.2 Non-goals
- not a full OTA
- not a user-generated review site
- not a full booking engine
- not a generic inspirational magazine
- not a super-heavy itinerary builder requiring account creation for basic use

---

## 6. Target Users

### Primary audience
International travelers planning Japan trips, especially:
- first-time Japan visitors
- independent travelers
- couples
- small families
- travelers moving between Tokyo / Fuji / Hakone / Kyoto / Osaka

### Secondary audience
- repeat visitors who want practical tools
- travelers comparing hotel areas and transit convenience
- users landing from search on specific transport questions

### Mindset
Users are often:
- excited
- slightly overwhelmed
- trying to avoid mistakes
- willing to buy if the suggestion feels helpful and trustworthy

---

## 7. UX Strategy

### 7.1 Existing strength to preserve
The current site likely works because it is:
- narrow in scope
- low-friction
- obvious

Do not lose this.

### 7.2 New UX target
The redesign should create a journey like this:

**Specific utility entry**
→ **broader planning surface**
→ **decision support**
→ **affiliate-ready next actions**

Example:
- user checks Mt. Fuji seat
- sees route context and suggested trip extension
- sees where to stay around Tokyo / Kyoto / Fuji
- sees transfer / ticket / eSIM recommendations
- saves or clicks trip picks

---

## 8. Information Architecture

### Top-level navigation
- Seat Checker
- Japan Planner
- Areas to Stay
- Airport Transfers
- Itineraries
- Guide

### Supporting utilities
- Language switcher
- Favorites / saved items
- Account (optional later)

### Recommended homepage structure
1. Header / Nav
2. Hero split layout
   - left: Seat Checker
   - right: Japan Trip Command Center
3. Where to Stay row
4. Itinerary row
5. Airport Transfer chooser
6. Essentials modules
7. Trust / value strip
8. Footer / newsletter / legal
9. Sticky Trip Picks on desktop

---

## 9. Homepage Design

## 9.1 Overall intent
The homepage should feel like the product has evolved from a single-purpose free tool into a travel planning surface.

It must still keep the original signature utility highly visible.

## 9.2 Above-the-fold layout
### Left column: signature tool
A visually strong hero card for:
- **Shinkansen Mt. Fuji Seat Checker**
- direction toggle
- primary CTA
- short explanation
- trust/help line

This is the most important anchor because it connects the site to its original credibility.

### Right column: planning surface
A structured card titled:
- **Japan Trip Command Center**

Includes:
- arrival airport selector
- city selection
- trip length
- travel style
- lightweight route map or city node visualization

This signals that the site is now broader than the original utility.

### Desktop behavior
- two-column primary layout
- sticky right rail for trip picks

### Mobile behavior
- stack vertically
- Seat Checker first
- Planner second
- Trip Picks collapsible or bottom sheet style

---

## 10. Key Page Templates

## 10.1 Seat Checker page
Purpose:
- maintain product authority
- solve the seat problem fast
- introduce broader journey options

Must include:
- direction selection
- result card
- seat recommendation with clarity
- short route explanation
- weather / visibility context if available
- next actions below result:
  - see Tokyo → Kyoto itinerary
  - compare Tokyo hotel areas
  - book eSIM
  - compare train booking options

Tone:
- precise
- practical
- not fluffy

## 10.2 Japan Planner page
Purpose:
- help users sketch a realistic trip shape
- connect multiple monetizable modules naturally

Must include:
- city selection
- recommended sequence / route
- estimated nights by city
- suggested transfer edges
- suggested hotel areas
- essential booking blocks
- save trip CTA

Should feel like:
- a planning tool, not a content wall

## 10.3 Areas to Stay page
Purpose:
- turn broad city intent into hotel-area decisions
- support hotel affiliate clicks

Structure:
1. quick recommendation summary
2. comparison cards / table
3. transport convenience
4. vibe / tradeoffs
5. sample hotel picks
6. nearby use cases
7. FAQs

Examples:
- Shinjuku vs Ueno vs Asakusa
- Kyoto Station vs Gion

## 10.4 Airport Transfers page
Purpose:
- help the user choose a route from airport to destination
- support transport-related monetization

Must include:
- airport selector
- destination selector
- route comparison cards
- time, transfer count, luggage convenience, rough cost
- late arrival / family / large luggage considerations

## 10.5 Itineraries page
Purpose:
- provide realistic trip structures
- connect hotels, transport, tickets, tours

Must include:
- itinerary cards by trip length / audience
- city sequence
- daily summaries
- upgrade paths to planner or hotel pages

## 10.6 Guide page
Purpose:
- capture search intent and explain details
- must not dead-end

Guide pages must always contain:
- sticky summary box
- related planning module
- related hotel area module
- relevant transfer / booking / essentials links
- clear next action CTA

A guide page should never feel like the end of the product.

---

## 11. Conversion Design

### Primary conversion philosophy
Affiliate links should appear where the user is already making a decision.

### Strong insertion points
- after seat result
- inside hotel area cards
- inside transfer recommendation modules
- inside itinerary side panels
- inside essentials blocks
- sticky trip picks tray

### Avoid
- spammy banner walls
- multiple identical CTA buttons in one viewport
- generic "book now" with no context

### Recommended CTA patterns
- See hotels
- Compare routes
- Book eSIM
- See tours
- View trip summary
- Save trip

### Best monetization shape
The site should support **bundle-like intent**:
- eSIM
- hotel stay
- train booking
- day trip / attraction
- airport transfer

One user session should ideally expose 2–4 relevant monetizable actions.

---

## 12. Visual Direction

## 12.1 Brand traits
The interface should feel:
- clear
- dependable
- polished
- modern
- Japan-travel specific
- slightly premium
- calm, not loud

Avoid feeling:
- generic startup SaaS
- enterprise admin dashboard
- chaotic OTA marketplace
- over-luxury / editorial-only

## 12.2 Visual language
Mix of:
- clean white or off-white surfaces
- deep navy / indigo accent areas
- subtle travel imagery
- rounded card system
- restrained iconography
- high legibility

## 12.3 Contrast model
Base UI should be light.
Use dark navy accent cards for:
- signature utility
- sticky trip picks
- major CTA clusters

This creates emphasis without making the whole site heavy.

---

## 13. Design System Foundations

## 13.1 Color palette
Suggested tokens:

- `--bg`: #F7F8FA
- `--surface`: #FFFFFF
- `--surface-alt`: #F1F4F8
- `--text`: #0F172A
- `--text-secondary`: #475569
- `--text-dim`: #64748B
- `--line`: #E2E8F0
- `--brand`: #1D4ED8
- `--brand-hover`: #1E40AF
- `--brand-soft`: #DBEAFE
- `--navy`: #0B1F4D
- `--navy-2`: #102A66
- `--success`: #16A34A
- `--warning`: #D97706
- `--danger`: #DC2626
- `--gold-accent`: #F5C542` (use sparingly)

Color usage rules:
- brand blue = primary CTA / interactive highlights
- navy = anchored premium cards and sticky modules
- gold = one high-priority summary CTA only
- avoid rainbow dashboards

## 13.2 Typography
Use a clean, modern sans-serif.
Examples:
- Inter
- Geist
- system stack if needed

Type scale guidance:
- Hero heading: 40–52px desktop
- Section title: 24–32px
- Card title: 18–22px
- Body: 14–16px
- Small meta text: 12–13px

Typography rules:
- prioritize clarity over stylistic flair
- keep line length relatively tight
- avoid too many weights

## 13.3 Radius
Rounded but not toy-like.
Suggested:
- card radius: 20–24px
- button radius: 12–14px
- pill radius: full

## 13.4 Shadows
Use soft, layered shadows.
Avoid harsh, high-blur shadows.

## 13.5 Spacing
Adopt an 8px system.
Generous spacing between sections.
Tighter spacing within data-rich cards.

---

## 14. Layout Rules

### Max width
- desktop content width: 1280–1440px
- centered with strong outer margins

### Grid
- homepage main: 12 columns desktop
- hero split: 5 / 7 or 6 / 6 depending on actual density
- sticky right rail can live outside main content width or inside a 3-col subgrid

### Vertical rhythm
- large sections should breathe
- card groups should visually cluster by function

### Sticky behaviors
Desktop:
- Trip Picks can be sticky
- long guides may have a sticky summary or mini-TOC

Mobile:
- do not force large sticky sidebars
- use bottom bar / collapsible drawer if needed

---

## 15. Component Guidelines

## 15.1 Header
Must feel light and premium.
Include:
- logo
- nav
- language selector
- saved/favorites icon
- optional profile/account

Behavior:
- sticky on desktop after slight scroll is acceptable
- compact height when scrolled

## 15.2 Hero card
Use strong contrast.
Should visually anchor the whole site.
Potential use of train window + Mt. Fuji imagery is allowed, but do not let imagery reduce legibility.

## 15.3 Planner filters
Use clean select-style controls.
Should feel productized, not form-heavy.

## 15.4 Map / route card
Should be explanatory, not GIS-heavy.
Simple node graph over stylized Japan map is enough.

## 15.5 Comparison cards
For hotel areas, transfer options, essentials.
Must have:
- concise title
- who it's for
- top tradeoff
- rough price or range when useful
- clear CTA

## 15.6 Sticky Trip Picks tray
Critical monetization component.
This should feel useful, not salesy.

Possible items:
- eSIM
- Tokyo stay
- Kyoto stay
- Shinkansen booking
- Fuji tour

Must include:
- removable items
- estimated total or summary
- save trip action
- single summary CTA

## 15.7 Trust strip
Can include:
- practical info
- independently built
- updated info
- no hidden fees / partner disclosure

Should not feel like fake social proof.

---

## 16. Content and Copy Guidelines

### Tone
- practical
- calm
- travel-smart
- helpful
- slightly opinionated when useful
- concise

### Avoid
- hype language
- vague luxury copy
- overly cute travel-blog tone
- heavy corporate jargon

### Good copy examples
- Best for first-time visitors
- Easy airport access
- Great if you want traditional atmosphere
- Better for large luggage
- Good value for 3 nights
- Most convenient transfer

### Page headline style
Headlines should answer a job, not just a category.
Examples:
- Where to stay in Tokyo for first-time visitors
- Narita to Shinjuku: best transfer options
- 7-day first-time Japan itinerary

---

## 17. Motion and Interaction

Use motion sparingly.

Recommended:
- subtle hover lift on cards
- smooth button state changes
- route/map micro-animations if lightweight
- collapsible tray transitions

Avoid:
- flashy dashboard motion
- excessive parallax
- animation that delays understanding

---

## 18. Mobile Design Strategy

Mobile is not just a scaled-down desktop.

### Mobile priorities
1. Seat Checker utility
2. planner summary
3. top recommendations
4. essential bookings
5. save trip / summary access

### Mobile adjustments
- stack sections vertically
- convert wide comparison rows into swipe cards or segmented lists
- make trip picks a bottom sheet or collapsible block
- reduce map complexity
- keep CTAs thumb-reachable

### Mobile danger zones
- too many cards above the fold
- giant sticky modules
- poor hierarchy inside dense comparison sections

---

## 19. Accessibility

Minimum standards:
- strong text contrast
- keyboard navigability
- visible focus states
- semantic headings
- proper button/link differentiation
- alt text for key imagery
- interactive controls large enough for touch

Do not sacrifice readability for aesthetics.

---

## 20. Technical Implementation Guidance

### Preferred stack assumptions
- Next.js / React
- Tailwind CSS
- componentized layout
- possible shadcn-style primitives if useful

### Implementation priorities
1. establish design tokens
2. standardize card/button/input styles
3. rework homepage layout
4. introduce sticky Trip Picks
5. create reusable comparison card patterns
6. retrofit guide pages with next-step modules

### Important technical note
Do **not** hardcode design inconsistently across pages.
Create reusable primitives for:
- section container
- section header
- card shell
- CTA button variants
- pill badges
- info rows
- sticky summary blocks

### Suggested semantic component structure
- `SiteHeader`
- `HeroSeatChecker`
- `TripCommandCenter`
- `JapanRouteMap`
- `AreaStayCard`
- `AreaComparisonRow`
- `ItineraryCard`
- `AirportTransferChooser`
- `EssentialsGrid`
- `TripPicksRail`
- `TrustStrip`
- `GuideNextActions`

---

## 21. What Must Stay from the Current Product

These qualities are strategically important and should be preserved:

- the site feels like a real tool, not just content marketing
- the seat checker is immediately understandable
- the experience is fast and low-friction
- the product feels built from actual traveler pain points
- the UI has tactile usefulness, not sterile abstraction

If a redesign improves aesthetics but loses these qualities, it is a bad redesign.

---

## 22. What Must Change

These areas likely need redesign or extension:

- the product currently feels too narrow
- users may read a guide and exit
- monetization likely relies on too few surfaces
- trip planning pathways are not yet explicit enough
- hotel / itinerary / transfer decision support is underdeveloped
- broader product value is not clear enough above the fold

---

## 23. Recommended MVP Redesign Scope

### Phase 1
- redesign homepage
- add Japan Planner surface
- add Areas to Stay row
- add Airport Transfer module
- add Essentials row
- add sticky Trip Picks

### Phase 2
- redesign guide pages with next-step modules
- create city/area comparison templates
- add itinerary template pages

### Phase 3
- saved trips
- lightweight personalization
- better planner persistence
- account and return flow

---

## 24. Acceptance Criteria

The redesign is successful if:

1. A new visitor understands in under 5 seconds that the product helps with both:
   - the Mt. Fuji seat decision
   - broader Japan trip planning

2. The homepage no longer feels like a single-tool dead end.

3. Users can naturally move from utility to planning to booking-related actions.

4. Affiliate modules feel contextual and useful.

5. The UI feels premium and coherent, but not over-designed.

6. The site still feels fast, practical, and specific.

7. Mobile remains usable and clear.

---

## 25. Prompting Guidance for Codex / Claude Code

When implementing, prioritize:
- clarity of product value
- preservation of current hand-feel
- strong visual hierarchy
- reusable components
- conversion-aware information architecture

Do not:
- blindly clone Palantir-for-family-trips aesthetics
- turn the product into a generic dashboard
- overuse dark mode everywhere
- add gratuitous visual complexity
- prioritize "impressive UI" over decision support

Implementation should feel like:
> fujiseat matured into a premium Japan travel utility platform.

---

## 26. Final Design Intent

This product should feel like the traveler found a rare thing on the internet:

- specific enough to trust
- polished enough to keep using
- broad enough to help plan a real trip
- commercial enough to make money
- useful enough that the monetization feels fair

That balance is the whole point.
