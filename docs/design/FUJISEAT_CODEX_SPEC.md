# FUJISEAT_CODEX_SPEC.md

Version: v1.0  
Status: Implementation spec for Codex  
Primary output: Next.js / React implementation spec  
Language policy: **English-first UI, fully i18n-ready architecture**
Owner intent: evolve `fujiseat.com` from a single-purpose seat utility into a broader Japan travel utility + planning + affiliate conversion surface without losing the current hand-feel.

---

## 0. How Codex should use this spec

This document is written to be directly actionable.

**Implementation order**
1. Audit the current codebase and preserve working Seat Checker logic and existing guide content structure wherever possible.
2. Build or refactor a reusable design system and layout primitives first.
3. Implement **Phase 1 only** unless explicitly asked to proceed further.
4. Reuse existing assets, copy, and logic where they still fit the new architecture.
5. Do not over-design. Utility and clarity outrank novelty.

**What Codex should optimize for**
- Preserve the trust and immediacy of the current Seat Checker
- Make the homepage feel like a broader product, not a dead-end tool
- Create natural pathways into hotel / transfer / itinerary / essentials modules
- Keep affiliate placement contextual and useful
- Keep mobile usable and clean

**What Codex must not do**
- Do not turn the site into a generic SaaS dashboard
- Do not clone `palantir-for-family-trips` visually 1:1
- Do not introduce heavy account requirements for basic use
- Do not flood the UI with dark-mode panels
- Do not inject spammy CTA repetition or banner-like affiliate blocks
- Do not hardcode one-off styles page by page

---

## 1. Product summary

### Current product
`fujiseat.com` currently solves one sharp problem well:

> Which Shinkansen seat should I book to see Mt. Fuji?

That remains the signature feature.

### Target evolution
The new product should become:

> A Japan travel utility platform for international travelers, starting from the Mt. Fuji Seat Checker and expanding into travel decisions around itinerary, hotel areas, airport transfers, essentials, and bookable next steps.

This is:
- **not** a generic travel blog
- **not** a cluttered OTA clone
- **not** a full booking engine

This **is**:
- a travel decision-support tool
- a practical Japan planning surface
- a context-aware affiliate funnel
- a trusted, specific utility hub

### One-line positioning
> Plan Japan smarter — from the best Mt. Fuji Shinkansen seat to where to stay, how to move, and what to book.

---

## 2. Core UX thesis

Users should move through the product like this:

**specific utility entry**
→ **broader planning surface**
→ **decision support**
→ **contextual next actions**
→ **affiliate-ready booking choices**

Example:
- user lands on Seat Checker
- gets a clear result immediately
- sees related route / itinerary context
- sees where to stay or how to transfer
- sees relevant essentials or bookings
- optionally saves a lightweight trip summary

The site should feel like:
- more intentional than a blog
- lighter than an enterprise dashboard
- more useful than static affiliate content

---

## 3. Business / monetization intent

Affiliate monetization should come from decision moments, not ad clutter.

### High-priority monetizable surfaces
- eSIM
- Shinkansen booking / JR Pass comparison
- airport transfer options
- hotel area pages + hotel picks
- day trips / tours / essentials
- private car charter where relevant

### Monetization rule
Every affiliate module must feel like:
- a next step
- a relevant option
- a comparison choice
- a trip pick

Never feel like:
- a random injected ad
- an unrelated banner
- a repeated “book now” wall

### Session goal
One useful session should naturally expose **2–4 relevant monetizable actions**.

---

## 4. Target users

### Primary
International travelers planning Japan trips, especially:
- first-time visitors
- independent travelers
- couples
- small families
- travelers moving between Tokyo / Fuji / Hakone / Kyoto / Osaka

### Secondary
- repeat visitors who want practical utility
- search users with transport or hotel-area intent
- users who want clear, low-friction Japan travel answers

### User mindset
They are often:
- excited
- slightly overwhelmed
- trying not to make mistakes
- open to booking if guidance feels trustworthy

---

## 5. Scope

### In scope
1. Seat Checker
2. Japan Planner
3. Areas to Stay
4. Airport Transfers
5. Itineraries
6. Essentials
7. Trip Picks tray / rail
8. Guide pages with next-step modules
9. i18n-ready content architecture

### Out of scope for MVP
- full booking engine
- user review platform
- UGC
- full account-first trip builder
- deep personalization
- fully interactive map-heavy planner
- complex OTA search experiences

---

## 6. Product architecture

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
- Optional account entry (later phase)

### Recommended primary funnel
Home  
→ signature tool / planner  
→ itinerary / area / transfer decision pages  
→ essentials / trip picks / affiliate next actions

---

## 7. Route map (recommended initial routing)

Codex should implement route structure like this, adapting to existing codebase if needed.

### Core routes
- `/`
- `/seat-checker`
- `/planner`
- `/areas-to-stay`
- `/airport-transfers`
- `/itineraries`
- `/guide`

### Recommended sub-routes

#### Seat Checker
- `/seat-checker`
- `/guide/mt-fuji-seat`
- `/guide/mt-fuji-seat-faq`

#### Itineraries
- `/itineraries/tokyo-to-fuji-1day`
- `/itineraries/tokyo-to-hakone-1day`
- `/itineraries/tokyo-to-kyoto-by-shinkansen`
- `/itineraries/7-day-first-time-japan`
- `/itineraries/10-day-japan-classic`

#### Areas to Stay
- `/areas-to-stay/tokyo`
- `/areas-to-stay/kyoto`
- `/areas-to-stay/shinjuku-vs-ueno-vs-asakusa`
- `/areas-to-stay/kyoto-station-vs-gion`

#### Airport Transfers
- `/airport-transfers/narita-to-shinjuku`
- `/airport-transfers/narita-to-tokyo-station`
- `/airport-transfers/haneda-to-shinjuku`
- `/airport-transfers/haneda-to-asakusa`

#### Essentials
- `/essentials/esim`
- `/essentials/jr-pass-vs-single-ticket`
- `/essentials/luggage-forwarding`
- `/essentials/private-car-charter`

---

## 8. Homepage specification

## 8.1 Goal
The homepage must communicate within 5 seconds that:
1. the product still solves the Mt. Fuji seat problem
2. it now also helps with broader Japan trip planning

It must not feel like a single-tool dead end.

## 8.2 Homepage structure

### 1. Header / Nav
Include:
- logo
- top-level nav
- language switcher
- saved/trip picks icon
- optional account icon placeholder

Behavior:
- sticky after slight scroll is acceptable
- condensed height on scroll

### 2. Hero split layout
#### Left: Signature utility
A large hero card or hero copy block centered around:
- **Shinkansen Mt. Fuji Seat Checker**
- direction toggle
- primary CTA
- short explanation
- trust line

#### Right: Planner surface
A structured card titled:
- **Japan Trip Command Center** or **Japan Planner**

Include:
- arrival airport
- city sequence / destination choices
- trip length
- travel style
- lightweight route map / node visualization

This is not a full planner yet.
It should feel like a productized planning preview.

### 3. Areas to Stay row
A row of 3–4 destination / area decision cards.

Examples:
- Tokyo for first-time visitors
- Shinjuku vs Ueno vs Asakusa
- Kyoto Station vs Gion
- Kawaguchiko stay picks

Each card needs:
- short title
- user fit
- top tradeoff
- CTA

### 4. Itinerary row
A row of itinerary cards by trip length or travel job.

Examples:
- 1-day Fuji from Tokyo
- 1-day Hakone from Tokyo
- Tokyo to Kyoto by Shinkansen
- 7-day first-time Japan trip

### 5. Airport Transfer chooser
A compact chooser module.

Inputs:
- arrival airport
- destination area

Outputs:
- route cards comparing:
  - time
  - transfer count
  - luggage ease
  - rough price
  - “best for” label

### 6. Essentials modules
A grid of 4–6 cards:
- eSIM
- JR Pass vs single ticket
- luggage forwarding
- private car charter
- Fuji tour
- airport transfer add-on

### 7. Trust / value strip
Must include practical trust signals, not fake social proof.

Examples:
- Independently built
- Built for real Japan trip friction
- Practical guidance, not an OTA
- Partner links may earn a commission

### 8. Footer
Include:
- legal
- disclosure
- language links
- guide links
- sitemap essentials

### 9. Sticky Trip Picks
Desktop:
- sticky right rail or sticky tray
Mobile:
- collapsible bottom sheet / drawer / dock

---

## 9. Detailed page templates

## 9.1 Seat Checker page

### Purpose
- maintain authority
- solve the seat problem instantly
- transition into broader planning

### Required modules
1. direction selector
2. seat result card
3. short explanation of left/right side
4. standard seat vs Green Car seat note
5. weather / visibility context if available
6. route context mini module
7. next-step cards below result:
   - see itinerary
   - compare where to stay
   - compare train booking options
   - get eSIM

### Page tone
- precise
- practical
- short
- non-fluffy

### Acceptance for this page
A user should understand the answer in seconds without scrolling through long prose.

---

## 9.2 Japan Planner page

### Purpose
Help the user sketch a realistic trip shape.

### Required inputs
- arrival airport
- city interests (Tokyo / Fuji / Hakone / Kyoto / Osaka)
- trip length
- travel style
- optional luggage concern
- optional family / couple flag

### Required outputs
- recommended city sequence
- estimated nights per stop
- suggested transfers
- suggested hotel areas
- relevant essentials
- optional save summary CTA

### UX rule
This must feel like a **planning tool**, not a long article.

### MVP limitation
Use rule-based recommendation logic first.
No need for AI generation in MVP.

---

## 9.3 Areas to Stay pages

### Purpose
Turn broad destination intent into hotel-area decisions.

### Template structure
1. page hero with summary answer
2. quick recommendation chips
3. comparison cards / comparison row
4. transport convenience section
5. vibe / tradeoffs section
6. hotel picks
7. use-case section
8. FAQs
9. next-step modules

### Comparison data points
- best for
- transport convenience
- atmosphere
- price level
- luggage convenience
- family friendliness
- late arrival convenience
- walking burden
- tradeoff summary

### Example pages
- Shinjuku vs Ueno vs Asakusa
- Kyoto Station vs Gion

---

## 9.4 Airport Transfers pages

### Purpose
Help the user choose airport-to-city routes confidently.

### Template structure
1. selector / route header
2. quick recommendation summary
3. comparison cards
4. route detail blocks
5. special cases
6. relevant essentials / hotel area links

### Comparison data points
- total time
- transfer count
- rough cost
- luggage ease
- late-night suitability
- family suitability
- best for first-time visitors

### Required special cases
- late arrivals
- large luggage
- family / stroller
- language confidence concerns

---

## 9.5 Itinerary pages

### Purpose
Offer practical trip shapes that connect naturally to monetizable modules.

### Required sections
1. quick fit summary
2. trip length and audience
3. route sequence
4. day-by-day summary
5. where to stay suggestions
6. transfer suggestions
7. essentials row
8. next-step CTA

### UX rule
Should be scannable and decision-oriented, not a giant wall of content.

---

## 9.6 Guide pages

### Purpose
Capture search intent while keeping users inside the product flow.

### Every guide page must include
- sticky summary box
- related planning module
- related hotel area module
- relevant transport or essentials links
- clear CTA to a next tool/page

### Rule
A guide page must never be the end of the product.

---

## 10. Sticky Trip Picks specification

### Purpose
This is the monetization bridge.

It should feel like:
- useful
- persistent
- light
- user-controlled

Not like:
- a hard-sell basket

### Desktop behavior
Sticky right rail on key pages:
- homepage
- seat checker
- planner
- itinerary pages
- hotel comparison pages

### Mobile behavior
- bottom drawer / collapsible sheet
- minimized summary state
- expandable detailed state

### MVP item types
- eSIM
- Shinkansen booking
- JR Pass comparison
- Tokyo stay
- Kyoto stay
- Fuji day trip
- airport transfer
- luggage forwarding
- insurance

### Required interactions
- add item
- remove item
- reorder optional
- see summary
- save trip summary
- CTA to external booking destination

### Required display fields per item
- title
- type
- short why-it-matters label
- rough price or price hint if available
- source / partner label (optional)

### Summary behavior
Show:
- number of items
- estimated combined relevance / optional rough price
- single CTA
- save summary action

---

## 11. Design system spec

## 11.1 Visual direction
The site should feel:
- clear
- practical
- premium but calm
- Japan-travel specific
- modern
- trustworthy

Avoid:
- loud OTA chaos
- enterprise backoffice feeling
- overly editorial luxury
- toy-like UI

## 11.2 Color tokens
Use CSS variables or Tailwind theme extension.

```css
--bg: #F7F8FA;
--surface: #FFFFFF;
--surface-alt: #F1F4F8;
--text: #0F172A;
--text-secondary: #475569;
--text-dim: #64748B;
--line: #E2E8F0;
--brand: #1D4ED8;
--brand-hover: #1E40AF;
--brand-soft: #DBEAFE;
--navy: #0B1F4D;
--navy-2: #102A66;
--success: #16A34A;
--warning: #D97706;
--danger: #DC2626;
--gold-accent: #F5C542;
```

### Color rules
- Light base UI overall
- Brand blue for primary CTA
- Navy only for anchor surfaces / premium emphasis
- Gold only for one high-priority summary if used
- Avoid rainbow dashboard sprawl

## 11.3 Typography
Preferred:
- Inter
- Geist
- system stack fallback

### Type scale
- Hero H1: 40–52px desktop
- Section title: 24–32px
- Card title: 18–22px
- Body: 14–16px
- Small meta: 12–13px

### Typography rules
- prioritize clarity
- keep line length tight
- avoid excessive weight variety

## 11.4 Radius
- card: 20–24px
- button: 12–14px
- pills: full

## 11.5 Shadows
Soft layered shadows only.
Avoid harsh floating-card gimmicks.

## 11.6 Spacing
Use 8px spacing system.
Generous section spacing, tighter intra-card spacing.

---

## 12. Layout rules

### Width
- desktop max width: 1280–1440px
- centered content
- clean outer gutters

### Grid
- 12-column desktop base
- hero split: 5/7 or 6/6
- mobile stack vertically

### Section rhythm
Large sections should breathe.
Cards within a functional cluster should visually belong together.

### Sticky behavior
Desktop:
- trip picks can be sticky
- guide summaries can be sticky

Mobile:
- avoid large fixed side modules
- use bottom sheet or collapsible tray

---

## 13. Component list (required reusable components)

Codex should create reusable primitives before or during Phase 1.

### Layout primitives
- `PageShell`
- `SiteHeader`
- `SiteFooter`
- `SectionContainer`
- `SectionHeader`
- `CardShell`
- `StickyRail`
- `StickyBottomSheet`

### Interactive primitives
- `PrimaryButton`
- `SecondaryButton`
- `GhostButton`
- `PillBadge`
- `SelectField`
- `SegmentedControl`
- `TogglePillGroup`
- `InputRow`
- `Disclosure`
- `InfoTooltip`

### Domain components
- `HeroSeatChecker`
- `SeatResultCard`
- `WeatherVisibilityChip`
- `TripCommandCenter`
- `JapanRouteMap`
- `AreaStayCard`
- `AreaComparisonRow`
- `ItineraryCard`
- `AirportTransferChooser`
- `TransferOptionCard`
- `EssentialsGrid`
- `EssentialCard`
- `TripPicksRail`
- `TripPickItem`
- `TripPicksSummary`
- `TrustStrip`
- `GuideNextActions`
- `StickySummaryBox`

### Content helpers
- `DecisionMetaRow`
- `BestForTag`
- `TradeoffNote`
- `PriceHint`
- `PartnerDisclosureInline`

---

## 14. Content model / data structures

Use static data / local JSON / typed objects first.
Do not block MVP on CMS complexity.

### 14.1 Seat checker data
Needs:
- route direction
- standard seat recommendation
- Green Car recommendation
- explanation copy
- visibility / weather state

Suggested type:
```ts
type SeatRecommendation = {
  direction: "tokyo-to-kyoto" | "kyoto-to-tokyo";
  standardWindowSeat: string;
  greenCarWindowSeat: string;
  mountainSide: "left" | "right";
  explanation: string;
};
```

### 14.2 Area comparison data
```ts
type AreaCard = {
  slug: string;
  city: string;
  title: string;
  bestFor: string[];
  vibe: string;
  transportConvenience: "high" | "medium" | "low";
  priceLevel: "budget" | "mid" | "premium";
  luggageEase: "easy" | "ok" | "hard";
  tradeoff: string;
  hotelPicks?: HotelPick[];
};
```

### 14.3 Transfer option data
```ts
type TransferOption = {
  slug: string;
  airport: "narita" | "haneda";
  destination: string;
  title: string;
  durationMinutes: number;
  transferCount: number;
  roughCostYen: number;
  luggageEase: "easy" | "medium" | "hard";
  lateArrivalSuitability: "good" | "ok" | "poor";
  familySuitability: "good" | "ok" | "poor";
  bestFor: string;
  tradeoff: string;
};
```

### 14.4 Itinerary data
```ts
type ItineraryCardData = {
  slug: string;
  title: string;
  durationDays: number;
  bestFor: string[];
  sequence: string[];
  summary: string;
  relatedAreas: string[];
  relatedTransfers: string[];
  relatedEssentials: string[];
};
```

### 14.5 Trip picks data
```ts
type TripPick = {
  id: string;
  type:
    | "hotel"
    | "train"
    | "jr-pass"
    | "esim"
    | "insurance"
    | "tour"
    | "transfer"
    | "luggage";
  title: string;
  reasonLabel: string;
  priceHint?: string;
  href: string;
  partner?: string;
};
```

---

## 15. i18n requirements

The site must remain i18n-ready.

### Requirements
- no hardcoded mixed-language strings inside deep components
- use message keys / dictionary structure
- preserve current multilingual direction if already implemented
- ensure layout can handle longer translated strings
- CTA widths must not assume English-only length

### MVP language strategy
Keep English UI primary if current site already does so, but structure everything so Japanese / other locales can be layered without rewrite.

---

## 16. Copy rules

### Tone
- practical
- calm
- specific
- helpful
- concise
- slightly opinionated when useful

### Avoid
- hype language
- vague luxury copy
- cute blog voice
- admin-dashboard jargon

### Good copy examples
- Best for first-time visitors
- Easy airport access
- Better for large luggage
- Good value for 3 nights
- Most convenient transfer
- Best if you want traditional atmosphere

### Headline rule
Page headlines should answer a job, not just a content category.

Examples:
- Where to stay in Tokyo for first-time visitors
- Narita to Shinjuku: best transfer options
- 7-day first-time Japan itinerary

---

## 17. Affiliate / disclosure rules

### Rules
- disclose partner links clearly but lightly
- use inline disclosure or footer disclosure where appropriate
- partner surfaces must be relevant to current decision context
- avoid duplicated CTA spam in the same viewport

### Strong insertion points
- after seat result
- inside area cards
- inside transfer comparison cards
- inside itinerary sidebars
- inside essentials blocks
- inside trip picks tray

### Weak / avoid patterns
- random banners
- unrelated products
- repeated identical “book now” buttons
- ads above decision content

---

## 18. Accessibility requirements

Minimum acceptable standard:
- semantic headings
- visible focus states
- keyboard-accessible controls
- touch-friendly tap targets
- strong text contrast
- proper button vs link semantics
- alt text for key imagery
- no color-only meaning for key decisions

Accessibility cannot be sacrificed for aesthetics.

---

## 19. Mobile specification

### Mobile priorities
1. Seat Checker
2. planner summary
3. recommended next actions
4. top essentials
5. trip picks access

### Mobile rules
- stack hero vertically
- Seat Checker first
- Planner second
- reduce map complexity
- transform wide comparison rows into swipe cards / stacked cards
- make trip picks a collapsible bottom block
- keep CTAs thumb reachable

### Mobile danger zones
- too many hero cards above the fold
- giant sticky side panels
- dense comparison tables without progressive disclosure

---

## 20. Technical implementation notes

### Assumed stack
- Next.js
- React
- Tailwind CSS
- TypeScript preferred
- reusable design primitives
- shadcn-like primitives OK if already present or useful

### Architectural requirements
- centralize tokens
- centralize button variants
- centralize card shells
- centralize section layout
- no inconsistent style duplication across pages

### Suggested directory structure
Adapt to existing codebase, but aim for something like:

```txt
/src
  /app
    /(site)
      page.tsx
      seat-checker/page.tsx
      planner/page.tsx
      areas-to-stay/page.tsx
      airport-transfers/page.tsx
      itineraries/page.tsx
      guide/page.tsx
  /components
    /layout
    /ui
    /domain
  /data
    seat-checker.ts
    areas.ts
    transfers.ts
    itineraries.ts
    essentials.ts
  /lib
    i18n.ts
    trip-picks.ts
    utils.ts
  /styles
    tokens.css
```

### State guidance
For MVP:
- local component state
- `localStorage` for Trip Picks persistence if useful
- no backend dependency required for basic experience

### Performance guidance
- keep modules lightweight
- use static data first
- optimize images
- avoid heavy map libraries for MVP
- use simple map illustration or node graph where possible

---

## 21. Recommended implementation phases

## Phase 1 — required now
1. redesign homepage
2. create design tokens + reusable primitives
3. build hero split:
   - Seat Checker
   - Japan Planner preview / command center
4. add Areas to Stay row
5. add Itinerary row
6. add Airport Transfer chooser module
7. add Essentials row
8. add Trust strip
9. add sticky Trip Picks
10. retrofit Seat Checker page with stronger next-step modules

### Phase 1 done means
A new visitor immediately understands the broader product and can move from tool → planning → booking actions.

## Phase 2 — next
1. redesign guide pages with sticky summary + next-step modules
2. create area comparison page templates
3. create itinerary template pages
4. create airport transfer detail templates
5. deepen essentials pages

## Phase 3 — later
1. saved trips
2. lightweight personalization
3. better planner persistence
4. account / return flow

---

## 22. Concrete homepage module spec

To reduce ambiguity for Codex, implement the homepage in this exact order:

### Module A — Header
- sticky, light, premium
- logo left
- nav center/right
- language + saved icon on right
- compact on scroll

### Module B — Hero
#### Left block
- title
- short supporting copy
- Seat Checker CTA
- secondary CTA to planner / itineraries
- trust/help line

#### Right block
- Japan Planner preview card
- arrival airport selector
- destination nodes
- trip length
- travel style
- route visualization
- add-to-trip-picks action optional

### Module C — Areas to Stay
- 3–4 cards
- no giant prose
- each card with concise tradeoff and CTA

### Module D — Itinerary row
- cards with duration / audience / route summary
- CTA to full itinerary

### Module E — Airport Transfer chooser
- compact interactive module
- compare 2–4 options visually

### Module F — Essentials row
- small but strong cards
- priority items: eSIM, JR Pass vs ticket, luggage forwarding, Fuji trip, insurance if used

### Module G — Trust strip
- plainspoken
- partner disclosure
- practical tool framing

### Module H — Footer
- useful links + disclosure + legal

### Module I — Sticky Trip Picks
- visible but not dominant
- contextual, removable items
- single summary CTA

---

## 23. Acceptance criteria

The redesign is successful only if all of these are true:

1. A new visitor understands in under 5 seconds that the site helps with:
   - the Mt. Fuji seat decision
   - broader Japan trip planning

2. The homepage no longer feels like a single-tool dead end.

3. Users can move naturally from utility to planning to booking-related actions.

4. Affiliate modules feel contextual and useful.

5. The UI feels premium and coherent, but not overdesigned.

6. The seat checker remains obvious, fast, and trustworthy.

7. Mobile remains clear and usable.

8. Design consistency is enforced through reusable components, not page-by-page styling.

---

## 24. QA checklist for Codex

Before considering the task complete, verify:

### Product / UX
- [ ] Seat Checker is still the clearest anchor on the site
- [ ] Homepage communicates broader product scope immediately
- [ ] Planner preview does not overwhelm the page
- [ ] Areas / itinerary / transfer modules are scannable
- [ ] Trip Picks feels helpful, not salesy

### Visual
- [ ] Tokens are implemented centrally
- [ ] Cards feel consistent across modules
- [ ] CTA hierarchy is clear
- [ ] Navy is used selectively, not everywhere
- [ ] No section feels like a random template import

### Responsive
- [ ] Hero stacks well on mobile
- [ ] Trip Picks has a usable mobile behavior
- [ ] Comparison surfaces do not break on small screens
- [ ] CTAs remain thumb-friendly

### Technical
- [ ] Reusable components are created
- [ ] No hardcoded scattered style duplication
- [ ] Static data powers MVP modules cleanly
- [ ] Components are typed if TypeScript is available
- [ ] Existing working seat logic was preserved or safely ported

### Conversion
- [ ] At least 2–4 contextual monetizable actions appear naturally in key flows
- [ ] Disclosure exists where necessary
- [ ] No spammy banner behavior exists

---

## 25. Codex task framing (use this as the implementation brief)

**Task:**  
Refactor and expand the current `fujiseat` site into a premium, utility-first Japan travel planning surface.

**Priority:**  
Implement **Phase 1 only**.

**Must preserve:**  
- the current Seat Checker clarity
- fast comprehension
- tactile, useful product feel
- trust built from specificity

**Must add:**  
- stronger homepage information architecture
- planner preview / command-center-lite surface
- Areas to Stay row
- Itinerary row
- Airport Transfer chooser
- Essentials row
- sticky Trip Picks
- stronger next-step modules on Seat Checker page

**Must avoid:**  
- generic dashboard feel
- heavy dark mode usage
- bloated content walls
- spammy affiliate styling
- inconsistent one-off component styling

**Implementation standard:**  
Use reusable components, strong hierarchy, and context-aware conversion logic.

---

## 26. Final design intent

The final product should feel like this:

> The traveler found a rare tool on the internet: specific enough to trust, polished enough to keep using, broad enough to plan a real Japan trip, and commercial enough that the monetization feels fair.

That balance is the point.
