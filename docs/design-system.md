# fujiseat design rules (2026-11-20)

Minimal, calm, visual. One main action per screen, photos where the view is the point, and quiet text links for everything else. These rules describe what the homepage, /scenic, the route pages and /stays now follow; older pages move to them as they are touched.

## Colour
- `ink` (#0b1220) for text, dark answer cards and secondary buttons.
- `fuji` (#d94a32) is the accent: the header's Check Seat, eyebrows on route pages, and at most one filled button per screen.
- Side badges: RIGHT `#d94a32`, LEFT `#2f6fd6`. Use them only for which side to sit on.
- Slate for body text (`slate-600/700`) and borders (`slate-200`).
- Amber only for a real constraint (a service gap, or a hotel where not every room has the view). Use a thin left rule or a small chip, never a large filled box.

## Type
- Page H1: `text-[34px] md:text-[44–60px] font-extrabold tracking-[-0.03em]`. The homepage hero uses the display face.
- Section H2: `text-2xl md:text-[32px] font-extrabold tracking-[-0.02em]`, with an optional one-line sub in `text-[15px] text-slate-600`.
- Card title: 17–22px extrabold. Eyebrow: `text-xs font-bold uppercase tracking-[0.08–0.1em]`.
- Body text is at least 15px. Notes and sources may be 11–13px.

## Layout
- Containers: homepage 1180px, /scenic 1160px, /stays 1120px, route pages 1000px. Side gutter 20px (`px-5`).
- Space between sections: `pt-14 md:pt-16` on the homepage, `mt-10` to `mt-12` inside articles.
- Card grids: one column on phones and three from `lg`. Horizontal swipe rows only for photo galleries.

## Components
- **Card**: `rounded-[22px] border border-slate-200 bg-white`, a soft shadow, and a full-height flex column so buttons line up.
- **Buttons**
  - Primary (filled `fuji`): one per screen.
  - Secondary: white with an `ink` border, or filled `ink`.
  - Text link: bold, underlined, with an arrow.
  - Every button is at least 44px tall (`min-h-11`), and labels wrap rather than truncate.
- **Provider button**: Booking.com uses `ProviderButton provider="booking_travelpayouts"` with the label "View rooms on Booking.com". Klook keeps its existing CTAs.
- **Chips / filters**: rounded-full, at least 44px tall. The active chip is filled `ink` and carries `aria-current`.
- **Disclosure**: put secondary detail (per-view tables, the month table, FAQs) in `<details>` with a "+" that turns into "×".
- **Images**: AI images always carry "Illustrative"; a route page says "not a photo from this train". Hotel photos come only from `hotel.photo` in data, with credit, once cleared.
- **Navigation**: the header order is Scenic Routes · Where to Stay · Rail Guide · Arrival Prep, with Check Seat as the one filled button. The current section is underlined (desktop) or tinted (menu).

## Affiliate placement
- Hotels go to Booking.com and rail, tours and experiences to Klook. No other providers reach a page.
- Show a booking link once the reader is planning a concrete trip: after a search answer, in the route page's ticket section, or on a stay card. Never as the first thing under the hero.
- Every affiliate block has a PR/commission line and `AFFILIATE_REL`.
