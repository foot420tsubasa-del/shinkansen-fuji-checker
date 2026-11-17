/**
 * Short Suica guides, one idea each, shown as a picture grid on
 * /how-to-buy-suica and as their own pages at /how-to-buy-suica/<slug>.
 * Each is led by a diagram (components/suica/SuicaDiagram.tsx); the words
 * are kept to a few lines. Facts only from the long guide these replace
 * (2026-11-15): availability varies by station and date, and the official
 * JR East page is the source for anything that changes.
 */
export type SuicaDiagramId = "where" | "steps" | "bring" | "compare" | "amount" | "topup" | "mistakes" | "ride";

export type SuicaGuide = {
  slug: string;
  /** Short title under the picture in the grid. */
  card: string;
  title: string;
  description: string;
  diagram: SuicaDiagramId;
  /** One-line answer shown under the diagram. */
  answer: string;
  points: string[];
  note?: string;
};

export const SUICA_GUIDES: SuicaGuide[] = [
  {
    slug: "where-to-buy",
    card: "Where to buy a Suica",
    title: "Where to buy a Suica card in Japan",
    description: "Designated JR East machines and counters, including the JR stations at Narita; at Haneda, Welcome Suica is sold at Terminal 3's Tokyo Monorail station — or use Apple Wallet on a supported phone.",
    diagram: "where",
    answer: "At designated JR East machines and counters; airport locations differ between Narita and Haneda.",
    points: [
      "Narita: use the JR East station's designated machines or Travel Service Center. Keisei machines do not sell Suica.",
      "Haneda: there is no JR station. Welcome Suica is currently sold at designated facilities at Terminal 3's Tokyo Monorail station, not Terminals 1 or 2.",
      "In the city: the multilingual touchscreen machines near the gates, or a staffed window (Midori-no-madoguchi at JR East stations).",
      "Sold out? Try a nearby larger station or ask staff — availability may vary by station and date.",
      "On a supported iPhone or Apple Watch you can add a Suica in Apple Wallet instead of a card.",
    ],
  },
  {
    slug: "ticket-machine-steps",
    card: "Buying at the machine",
    title: "How to buy a Suica at the ticket machine, step by step",
    description: "Six steps on the station ticket machine: language, new Suica, card type, cash, amount, and taking your card.",
    diagram: "steps",
    answer: "Six taps: language, new Suica, card type, cash, amount, take your card.",
    points: [
      "Switch the screen to English (or your language).",
      "Choose “Purchase new Suica” or the IC card option.",
      "Pick a regular Suica, or the tourist Welcome Suica where it is offered.",
      "Insert cash in yen — many IC-card machines are cash-only.",
      "Choose how much to load, then take your card, change and receipt.",
    ],
    note: "A regular Suica usually includes a 500 yen refundable deposit.",
  },
  {
    slug: "what-to-bring",
    card: "What to bring",
    title: "What you need before using the Suica machine",
    description: "Cash in yen, an amount in mind — and no passport or registration for a normal Suica.",
    diagram: "bring",
    answer: "Yen in cash and an amount in mind. No passport needed.",
    points: [
      "Cash in Japanese yen — 1,000 yen notes and coins are safest.",
      "Many IC-card machines reject foreign credit cards.",
      "Decide how much to load before you reach the machine.",
      "A normal Suica needs no passport and no registration.",
    ],
  },
  {
    slug: "suica-vs-welcome-suica",
    card: "Suica vs Welcome Suica",
    title: "Suica vs Welcome Suica: which should a tourist get?",
    description: "A regular Suica has a 500 yen refundable deposit and no short tourist validity period, but becomes unusable after 10 years without qualifying use; Welcome Suica has no deposit, lasts 28 days and has no balance refund.",
    diagram: "compare",
    answer: "Short single trip: Welcome Suica. Coming back, or want the deposit back: regular Suica.",
    points: [
      "Regular Suica: 500 yen refundable deposit and reloadable for years, but JR East says it becomes unusable after 10 years with no qualifying use.",
      "Welcome Suica: no deposit, red design, expires 28 days after purchase, not refundable.",
      "Physical cards have been hard to find at times; a mobile Suica in Apple Wallet is a reliable alternative on supported phones.",
    ],
  },
  {
    slug: "how-much-to-load",
    card: "How much to load",
    title: "How much money to put on your Suica first",
    description: "2,000–3,000 yen covers several trains, subways, buses and convenience-store stops; top up any time.",
    diagram: "amount",
    answer: "Start with 2,000–3,000 yen and top up when it runs low.",
    points: [
      "That covers several train, subway and bus rides plus convenience-store stops.",
      "You can top up at any machine, any time.",
      "Leaving Japan soon? Load less: a regular Suica refund has a small fee, and a Welcome Suica cannot be refunded.",
    ],
  },
  {
    slug: "how-to-top-up",
    card: "Topping up later",
    title: "How to charge (top up) your Suica",
    description: "At any ticket machine, fare-adjustment machine or convenience-store counter: tap Charge, place the card, add 1,000 yen or more in cash.",
    diagram: "topup",
    answer: "Tap “Charge”, place the card, add 1,000 yen or more.",
    points: [
      "Ticket machines and fare-adjustment machines at the station.",
      "Convenience-store registers can top up at the counter.",
      "On the machine: “Charge” (chāji) → card on the tray or reader → cash.",
    ],
  },
  {
    slug: "common-mistakes",
    card: "Common mistakes",
    title: "Common mistakes at the Suica ticket machine",
    description: "Credit cards in a cash-only slot, buying a paper ticket by mistake, overloading before you leave, tapping too fast.",
    diagram: "mistakes",
    answer: "Most problems at the machine are one of these four.",
    points: [
      "Trying a foreign credit card in a cash-only IC-card slot.",
      "Buying a single paper ticket instead of choosing the IC card / Suica option.",
      "Loading far too much right before leaving Japan.",
      "Tapping the wrong reader, or tapping too fast before the gate responds.",
      "Assuming every station has cards in stock — availability may vary by station and date.",
    ],
  },
  {
    slug: "where-suica-works",
    card: "Trains, buses and shops",
    title: "Where you can use a Suica: trains, buses and shops",
    description: "One card for most trains, subways and buses across Japan, and many convenience stores, vending machines and shops.",
    diagram: "ride",
    answer: "One card for most trains, subways and buses — and many shops.",
    points: [
      "Tap the reader on the ticket gate, or the reader by the bus door.",
      "No need to know the exact fare in advance.",
      "Pays at many convenience stores, vending machines and shops.",
    ],
  },
];

export const getSuicaGuide = (slug: string) => SUICA_GUIDES.find((g) => g.slug === slug);
