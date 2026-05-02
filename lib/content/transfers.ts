import type { TripPick } from "@/lib/trip-picks";
import { requireAffUrl } from "@/src/affiliateLinks";
import { getHotelLink } from "@/lib/hotel-links";


// ─── Types ──────────────────────────────────────────────────────────────────

export type TransferOption = {
  name: string;
  badge: "fastest" | "easiest" | "cheapest";
  duration: string;
  cost: string;
  pros: string[];
  cons: string[];
  luggageFriendly: boolean;
  lateOk: boolean;
  bookingLink?: string;
  bookingLabel?: string;
};

export type TransferPage = {
  slug: string;
  title: string;
  description: string;
  from: string;
  to: string;
  options: TransferOption[];
  lateArrivalNote: string;
  proTip: string;
  nextActions: TripPick[];
};

// ─── Affiliate URLs ─────────────────────────────────────────────────────────

const nexUrl = requireAffUrl("nex");
const skylinerUrl = requireAffUrl("skyliner");
const limousineBusUrl = requireAffUrl("limousineBus");
const monorailUrl = requireAffUrl("hanedaMonorail");
const esimUrl = requireAffUrl("esim");
const airportTransferUrl = requireAffUrl("airportTransfer");

const hotelAsakusa = getHotelLink("asakusa");
const hotelOshiage = getHotelLink("oshiage");
const hotelUeno = getHotelLink("ueno");

// ─── Shared next actions ────────────────────────────────────────────────────

const commonNextActions: TripPick[] = [
  { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Set up data before landing — maps, translate, transit apps.", cta: "Get eSIM", href: esimUrl },
  { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare Shinjuku, Ueno, Asakusa for your base.", cta: "Compare areas", href: "/areas-to-stay/tokyo-first-time" },
];

function arrivalBundle(stayAction: TripPick): TripPick[] {
  return [
    { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Set up data before landing — maps, translate, transit apps.", cta: "Get eSIM", href: esimUrl },
    { id: "transfer", category: "transfer", title: "Book airport transfer", description: "Compare train, bus, and private transfer options.", cta: "Compare transfers", href: airportTransferUrl },
    stayAction,
    { id: "seat", category: "train", title: "Check Shinkansen seat", description: "Find the Mt. Fuji-side window seat for your direction.", cta: "Check seat", href: "/guide" },
    { id: "itinerary", category: "itinerary", title: "Open 7-day itinerary", description: "Place your Shinkansen day in a full golden route.", cta: "See itinerary", href: "/itineraries/7-day-first-time-japan" },
  ];
}

// ─── Page Data ──────────────────────────────────────────────────────────────

export const transferPages: TransferPage[] = [
  {
    slug: "narita-to-shinjuku",
    title: "Narita to Shinjuku — fastest, easiest, cheapest options",
    description: "Compare Narita Express, Limousine Bus, and budget train routes from Narita Airport to Shinjuku. Includes luggage tips and late-arrival options.",
    from: "Narita Airport (NRT)",
    to: "Shinjuku",
    options: [
      {
        name: "Narita Express (N'EX)",
        badge: "fastest",
        duration: "80 min",
        cost: "¥3,250",
        pros: ["Direct to Shinjuku — no transfers", "Reserved seat guaranteed", "Large luggage space behind seats", "Runs every 30–60 min"],
        cons: ["Most expensive option", "Last departure ~21:30"],
        luggageFriendly: true,
        lateOk: false,
        bookingLink: nexUrl,
        bookingLabel: "Book N'EX on Klook",
      },
      {
        name: "Limousine Bus",
        badge: "easiest",
        duration: "85–120 min",
        cost: "¥3,200",
        pros: ["Drops off at major Shinjuku hotels directly", "Luggage stored under the bus — hands free", "No stairs, escalators, or station navigation"],
        cons: ["Affected by traffic — can be 2h+ at rush hour", "Less frequent than trains"],
        luggageFriendly: true,
        lateOk: true,
        bookingLink: limousineBusUrl,
        bookingLabel: "Book Limousine Bus",
      },
      {
        name: "Keisei Access Express + Metro",
        badge: "cheapest",
        duration: "100–110 min",
        cost: "¥1,270",
        pros: ["Less than half the cost of N'EX", "Frequent departures", "Runs late (last ~23:00 from Narita)"],
        cons: ["Requires 1 transfer at Aoto or Oshiage", "Crowded during rush hour — standing with luggage", "No reserved seats"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
    ],
    lateArrivalNote: "Flight landing after 21:00? The Limousine Bus and Keisei Access Express run later than N'EX. If you land after 23:00, budget ¥20,000–25,000 for a taxi or book an airport hotel for the night.",
    proTip: "If you have 2+ large suitcases, the Limousine Bus is the least stressful option. N'EX is fast but Shinjuku Station is enormous — navigating to your exit with heavy luggage is the hidden cost.",
    nextActions: [
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare Shinjuku, Ueno, Asakusa for your base.", cta: "Compare areas", href: "/areas-to-stay/tokyo-first-time" },
      ...commonNextActions.filter(a => a.id !== "stay-tokyo"),
    ],
  },
  {
    slug: "narita-to-tokyo-station",
    title: "Narita to Tokyo Station — all transfer options compared",
    description: "Compare Narita Express, Skyliner + transfer, and budget trains from Narita Airport to Tokyo Station. Best for Shinkansen connections.",
    from: "Narita Airport (NRT)",
    to: "Tokyo Station",
    options: [
      {
        name: "Narita Express (N'EX)",
        badge: "easiest",
        duration: "55 min",
        cost: "¥3,070",
        pros: ["Direct to Tokyo Station — zero transfers", "Fastest train option", "Reserved seat, luggage space", "Perfect for same-day Shinkansen connections"],
        cons: ["Premium price", "Last departure ~21:30"],
        luggageFriendly: true,
        lateOk: false,
        bookingLink: nexUrl,
        bookingLabel: "Book N'EX on Klook",
      },
      {
        name: "Keisei Skyliner + JR Transfer",
        badge: "fastest",
        duration: "50–60 min",
        cost: "¥2,520 + ¥170",
        pros: ["Skyliner is the fastest train from Narita (36 min to Ueno)", "Comfortable reserved seats", "JR transfer from Ueno to Tokyo Station is 7 min"],
        cons: ["Requires 1 transfer at Ueno", "Navigating Ueno Station with luggage", "Skyliner stops at Ueno/Nippori only"],
        luggageFriendly: true,
        lateOk: false,
        bookingLink: skylinerUrl,
        bookingLabel: "Book Skyliner on Klook",
      },
      {
        name: "Keisei Access Express + Metro",
        badge: "cheapest",
        duration: "90–100 min",
        cost: "¥1,070",
        pros: ["Budget option — under ¥1,100", "No reservation needed", "Runs until ~23:00"],
        cons: ["1–2 transfers required", "No luggage storage", "Standing room only during rush hour"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
    ],
    lateArrivalNote: "Catching a Shinkansen the same day? N'EX is usually the simplest way to reach Tokyo Station with zero transfers. If you already have a JR Pass, N'EX may be covered after activation at the Narita JR counter.",
    proTip: "Do not buy a JR Pass just for N'EX. It only starts to make sense when your wider route has multiple long-distance JR rides. If you already have one, activate it at the JR East Travel Service Center in Narita Terminal 1 or 2 before boarding.",
    nextActions: [
      { id: "jr-pass", category: "train", title: "JR Pass fit guide", description: "Check whether your route has enough long-distance JR rides before buying.", cta: "Read guide", href: "/guide#jr-pass" },
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare areas by Shinkansen access.", cta: "Compare areas", href: "/areas-to-stay/tokyo-first-time" },
      ...commonNextActions.filter(a => a.id !== "stay-tokyo"),
    ],
  },
  {
    slug: "haneda-to-shinjuku",
    title: "Haneda to Shinjuku — fastest and easiest options",
    description: "Compare Tokyo Monorail + JR, Keikyu Line, Limousine Bus, and taxi from Haneda Airport to Shinjuku. Haneda is closer than Narita — most options are under 40 min.",
    from: "Haneda Airport (HND)",
    to: "Shinjuku",
    options: [
      {
        name: "Limousine Bus",
        badge: "easiest",
        duration: "35–55 min",
        cost: "¥1,300",
        pros: ["Direct to Shinjuku Expressway Bus Terminal (Busta)", "Luggage stored under bus", "No transfers, no stairs", "Drops off near major hotels"],
        cons: ["Affected by highway traffic", "Can take 70+ min during rush hour", "Less frequent than trains"],
        luggageFriendly: true,
        lateOk: true,
        bookingLink: limousineBusUrl,
        bookingLabel: "Book Limousine Bus",
      },
      {
        name: "Keikyu Line + JR",
        badge: "fastest",
        duration: "35 min",
        cost: "¥610",
        pros: ["Fastest and cheapest combined", "Keikyu Airport Express is frequent (every 10 min)", "Transfer at Shinagawa to JR Yamanote (1 stop)"],
        cons: ["1 transfer at Shinagawa", "Rush hour trains are packed", "Luggage on crowded train is hard"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
      {
        name: "Tokyo Monorail + JR",
        badge: "cheapest",
        duration: "45 min",
        cost: "¥680",
        pros: ["Scenic monorail ride over Tokyo Bay", "Connects to JR Yamanote at Hamamatsucho", "Covered by JR Pass (monorail section)"],
        cons: ["2 transfers (monorail → JR Yamanote → Shinjuku)", "Longer than Keikyu route", "Monorail gets crowded"],
        luggageFriendly: false,
        lateOk: true,
        bookingLink: monorailUrl,
        bookingLabel: "Book Monorail ticket",
      },
    ],
    lateArrivalNote: "Haneda has later domestic and international arrivals than Narita. The Keikyu Line runs until ~midnight, and taxi to Shinjuku is ¥6,000–8,000 (30 min). Affordable backup if you land late.",
    proTip: "Haneda to Shinjuku is short enough that a taxi split 2 ways (¥3,000–4,000 per person) is worth considering if you have heavy luggage and arrive tired. The ride is scenic at night.",
    nextActions: [
      { id: "stay-shinjuku", category: "stay", title: "Shinjuku vs Ueno vs Asakusa", description: "Landed in Shinjuku — now decide your base.", cta: "Compare areas", href: "/areas-to-stay/shinjuku-vs-ueno-vs-asakusa" },
      ...commonNextActions,
    ],
  },
  {
    slug: "haneda-to-asakusa",
    title: "Haneda to Asakusa — direct and transfer options",
    description: "Compare Keikyu Line direct, Limousine Bus, and taxi from Haneda Airport to Asakusa. Best route if you're staying near Senso-ji or heading to Nikko.",
    from: "Haneda Airport (HND)",
    to: "Asakusa",
    options: [
      {
        name: "Keikyu Line → Asakusa Line (Direct)",
        badge: "fastest",
        duration: "35–40 min",
        cost: "¥620",
        pros: ["Direct train — no transfer needed (through-service)", "Cheap and fast", "Drops you at Asakusa Station (2 min walk to Senso-ji)", "Runs frequently"],
        cons: ["Not all trains run direct — check for 'Asakusa Line direct' on platform", "Can be crowded during rush hour", "No luggage storage"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
      {
        name: "Limousine Bus to Asakusa View Hotel",
        badge: "easiest",
        duration: "50–75 min",
        cost: "¥1,000",
        pros: ["Drops at Asakusa View Hotel — in the temple district", "Luggage handled for you", "Comfortable, no stairs or transfers"],
        cons: ["Limited schedule (fewer runs than Shinjuku route)", "Traffic dependent", "May need to walk 5–10 min from drop-off to your hotel"],
        luggageFriendly: true,
        lateOk: false,
        bookingLink: limousineBusUrl,
        bookingLabel: "Book Limousine Bus",
      },
      {
        name: "Taxi",
        badge: "cheapest",
        duration: "30–45 min",
        cost: "¥5,000–7,000",
        pros: ["Door-to-door, zero effort", "Available 24/7", "Best for groups of 2–3 (split cost)"],
        cons: ["Most expensive solo option", "Traffic adds time and cost", "Communication barrier (use Google Maps to show destination)"],
        luggageFriendly: true,
        lateOk: true,
        bookingLabel: "Use airport taxi or taxi app",
      },
    ],
    lateArrivalNote: "The Keikyu direct to Asakusa runs until about 23:30. If you arrive later, a taxi from Haneda to Asakusa is ¥5,000–7,000 and takes 30 min — reasonable for 2 people splitting.",
    proTip: "The Keikyu → Asakusa Line through-service is the hidden gem here. Many travelers don't know this direct connection exists and take unnecessary transfers via Shinagawa. Look for trains marked 'エアポート快特 Asakusa Line' on the platform display.",
    nextActions: arrivalBundle(
      { id: "stay-asakusa", category: "stay", title: "Compare Asakusa hotels on Trip.com", description: "Senso-ji area — traditional vibe with great Narita/Haneda access.", cta: "Compare hotels", href: hotelAsakusa.href },
    ),
  },
  {
    slug: "narita-to-ueno",
    title: "Narita to Ueno — Skyliner, bus, and budget train options",
    description: "Compare the easiest ways from Narita Airport to Ueno, including Keisei Skyliner, budget trains, and luggage-friendly backups.",
    from: "Narita Airport (NRT)",
    to: "Ueno",
    options: [
      {
        name: "Keisei Skyliner",
        badge: "fastest",
        duration: "36 min",
        cost: "¥2,570",
        pros: ["Fastest Narita to central Tokyo route", "Reserved seats", "Good luggage space", "Arrives at Keisei Ueno near Ueno Park"],
        cons: ["Premium price versus local trains", "Ends earlier than some local options"],
        luggageFriendly: true,
        lateOk: false,
        bookingLink: skylinerUrl,
        bookingLabel: "Book Skyliner on Klook",
      },
      {
        name: "Keisei Main Line local",
        badge: "cheapest",
        duration: "70–85 min",
        cost: "¥1,050–1,300",
        pros: ["Cheaper than Skyliner", "No city transfer needed", "Frequent departures"],
        cons: ["No reserved seats", "Crowded with luggage", "Slower after a long flight"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
    ],
    lateArrivalNote: "Late arrivals should check the final Keisei departures before landing. If you miss trains, an airport hotel is usually better value than a long taxi.",
    proTip: "Ueno is the easiest Tokyo base from Narita. If your hotel is near Ueno or Okachimachi, Skyliner is usually worth the premium on arrival day.",
    nextActions: [
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare Ueno against Shinjuku, Asakusa, and Tokyo Station.", cta: "Compare bases", href: "/areas-to-stay/tokyo-first-time#ueno" },
      ...commonNextActions.filter(a => a.id !== "stay-tokyo"),
    ],
  },
  {
    slug: "narita-to-shibuya",
    title: "Narita to Shibuya — easiest routes with luggage",
    description: "Compare Narita Express, bus, and train routes from Narita Airport to Shibuya. Best for first arrivals with luggage.",
    from: "Narita Airport (NRT)",
    to: "Shibuya",
    options: [
      {
        name: "Narita Express (N'EX)",
        badge: "easiest",
        duration: "80–90 min",
        cost: "¥3,250",
        pros: ["Direct to Shibuya", "Reserved seat", "Luggage space", "Simple after a long flight"],
        cons: ["More expensive", "Limited late-night departures"],
        luggageFriendly: true,
        lateOk: false,
        bookingLink: nexUrl,
        bookingLabel: "Book N'EX on Klook",
      },
      {
        name: "Skyliner + JR Yamanote",
        badge: "fastest",
        duration: "75–90 min",
        cost: "¥2,570 + JR fare",
        pros: ["Fast Narita segment", "Frequent JR connection from Nippori", "Good if N'EX timing is poor"],
        cons: ["Requires transfer with luggage", "Shibuya Station is busy"],
        luggageFriendly: false,
        lateOk: false,
        bookingLink: skylinerUrl,
        bookingLabel: "Book Skyliner on Klook",
      },
    ],
    lateArrivalNote: "After 21:00, confirm N'EX and Skyliner departure times. Shibuya taxi from Narita is usually too expensive unless split by a group.",
    proTip: "If you have big luggage, prioritize N'EX over saving a small amount. Shibuya Station transfer routes are not where you want to improvise on arrival night.",
    nextActions: [
      { id: "stay-tokyo", category: "stay", title: "Is Shibuya the right base?", description: "Compare west-side convenience with Shinjuku, Ueno, and Asakusa.", cta: "Compare fit", href: "/areas-to-stay/tokyo-first-time#comparison" },
      ...commonNextActions.filter(a => a.id !== "stay-tokyo"),
    ],
  },
  {
    slug: "haneda-to-tokyo-station",
    title: "Haneda to Tokyo Station — fastest and easiest routes",
    description: "Compare Tokyo Monorail, Keikyu, bus, and taxi from Haneda Airport to Tokyo Station for Shinkansen connections.",
    from: "Haneda Airport (HND)",
    to: "Tokyo Station",
    options: [
      {
        name: "Tokyo Monorail + JR",
        badge: "fastest",
        duration: "30–40 min",
        cost: "¥680",
        pros: ["Fast and frequent", "Easy JR connection at Hamamatsucho", "Good for Shinkansen access"],
        cons: ["One transfer with luggage", "Busy during rush hour"],
        luggageFriendly: false,
        lateOk: true,
        bookingLink: monorailUrl,
        bookingLabel: "See transit passes",
      },
      {
        name: "Taxi",
        badge: "easiest",
        duration: "25–40 min",
        cost: "¥5,000–7,000",
        pros: ["Door-to-door", "Best with heavy luggage", "Available late"],
        cons: ["Traffic dependent", "Expensive solo"],
        luggageFriendly: true,
        lateOk: true,
        bookingLabel: "Use airport taxi or taxi app",
      },
    ],
    lateArrivalNote: "Haneda is close enough that taxi is a reasonable late-night backup, especially for two people with luggage.",
    proTip: "Tokyo Station is ideal for early Shinkansen departures. If your first intercity train leaves before 9:00, staying nearby can reduce stress.",
    nextActions: [
      { id: "stay-tokyo", category: "stay", title: "Tokyo Station as a base", description: "Best for early Shinkansen and clean logistics.", cta: "View area", href: "/areas-to-stay/tokyo-first-time#tokyo-station" },
      ...commonNextActions.filter(a => a.id !== "stay-tokyo"),
    ],
  },
  {
    slug: "haneda-to-shibuya",
    title: "Haneda to Shibuya — train, bus, and taxi compared",
    description: "Compare Keikyu + JR, Limousine Bus, and taxi from Haneda Airport to Shibuya. Includes luggage and late-arrival notes.",
    from: "Haneda Airport (HND)",
    to: "Shibuya",
    options: [
      {
        name: "Keikyu + JR via Shinagawa",
        badge: "fastest",
        duration: "35–45 min",
        cost: "¥610–700",
        pros: ["Fast and cheap", "Frequent trains", "Good if traveling light"],
        cons: ["Transfer at Shinagawa", "Crowded with luggage", "Shibuya exits can be confusing"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
      {
        name: "Limousine Bus",
        badge: "easiest",
        duration: "40–70 min",
        cost: "¥1,100–1,300",
        pros: ["Luggage handled under bus", "Drops near major Shibuya stops", "No train transfers"],
        cons: ["Traffic delays", "Schedule is less frequent than trains"],
        luggageFriendly: true,
        lateOk: false,
        bookingLink: limousineBusUrl,
        bookingLabel: "Book Limousine Bus",
      },
    ],
    lateArrivalNote: "If you land late and miss buses, train may still run until around midnight. Taxi is a practical backup from Haneda to Shibuya.",
    proTip: "Shibuya is fun but not always the easiest first-night base. If luggage is heavy, consider Shinjuku or Tokyo Station unless your hotel is close to a clear Shibuya exit.",
    nextActions: [
      { id: "stay-tokyo", category: "stay", title: "Choose your Tokyo base", description: "Compare Shibuya against the practical first-time bases.", cta: "Compare bases", href: "/areas-to-stay/tokyo-first-time#comparison" },
      ...commonNextActions.filter(a => a.id !== "stay-tokyo"),
    ],
  },

  // ─── New routes: East Tokyo & late arrival ─────────────────────────────────

  {
    slug: "narita-to-asakusa",
    title: "Narita to Asakusa — Best Airport Transfer Options",
    description: "Compare the best ways to get from Narita Airport to Asakusa, including Keisei Access Express, Skyliner connections, limousine bus, taxi and private transfer.",
    from: "Narita Airport (NRT)",
    to: "Asakusa",
    options: [
      {
        name: "Keisei Access Express → Asakusa Line",
        badge: "cheapest",
        duration: "70–85 min",
        cost: "¥1,270",
        pros: ["Direct through-service to Asakusa via Oshiage", "Cheapest train option from Narita", "Runs late — last departure ~23:00", "No reservation needed"],
        cons: ["Not all trains run direct — confirm 'Asakusa Line' on platform", "No reserved seats or luggage racks", "Crowded during rush hour"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
      {
        name: "Skyliner to Ueno + Ginza Line",
        badge: "fastest",
        duration: "55–65 min",
        cost: "¥2,570 + ¥170",
        pros: ["Fastest Narita segment (36 min to Ueno)", "Reserved seats and luggage space on Skyliner", "Ginza Line from Ueno to Asakusa is 5 min"],
        cons: ["Requires transfer at Ueno with luggage", "Slightly more expensive", "Skyliner ends earlier than Access Express"],
        luggageFriendly: true,
        lateOk: false,
        bookingLink: skylinerUrl,
        bookingLabel: "Book Skyliner on Klook",
      },
      {
        name: "Private transfer",
        badge: "easiest",
        duration: "70–90 min",
        cost: "¥15,000–25,000",
        pros: ["Door-to-door from airport to hotel", "Driver handles all luggage", "Available 24/7 including late flights", "Best for families or groups"],
        cons: ["Most expensive option", "Traffic dependent", "Must book in advance"],
        luggageFriendly: true,
        lateOk: true,
        bookingLink: airportTransferUrl,
        bookingLabel: "Book private transfer",
      },
    ],
    lateArrivalNote: "The Keisei Access Express runs until about 23:00 from Narita. If you land after 22:00, check remaining departures before clearing customs. After the last train, budget ¥20,000+ for a taxi or book a private transfer in advance.",
    proTip: "The Keisei Access Express through-service to Asakusa Line is the underrated option here. Many guides default to Skyliner, but if you're heading to Asakusa specifically, Access Express drops you there without any transfer.",
    nextActions: arrivalBundle(
      { id: "stay-asakusa", category: "stay", title: "Compare Asakusa hotels on Trip.com", description: "Senso-ji area — traditional vibe, great transit access.", cta: "Compare hotels", href: hotelAsakusa.href },
    ),
  },
  {
    slug: "narita-to-oshiage",
    title: "Narita to Oshiage / Tokyo Skytree — Best Airport Transfer Options",
    description: "Compare Narita Airport to Oshiage and Tokyo Skytree transfer options, including Keisei Access Express, Skyliner, taxi and private transfer. Useful for East Tokyo stays.",
    from: "Narita Airport (NRT)",
    to: "Oshiage / Tokyo Skytree",
    options: [
      {
        name: "Keisei Access Express (direct to Oshiage)",
        badge: "cheapest",
        duration: "60–70 min",
        cost: "¥1,170",
        pros: ["Direct to Oshiage — no transfer needed", "Cheapest option from Narita", "Runs until ~23:00", "Oshiage station is directly under Skytree"],
        cons: ["No reserved seats", "No luggage racks", "Can be crowded during rush hour"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
      {
        name: "Skyliner to Nippori + JR/Metro transfer",
        badge: "fastest",
        duration: "55–70 min",
        cost: "¥2,570 + ¥170",
        pros: ["Fastest Narita segment", "Reserved seats and luggage space", "Good if connecting to other East Tokyo destinations"],
        cons: ["Requires transfer at Nippori or Ueno", "More expensive for a short remaining journey", "Skyliner doesn't stop at Oshiage"],
        luggageFriendly: true,
        lateOk: false,
        bookingLink: skylinerUrl,
        bookingLabel: "Book Skyliner on Klook",
      },
      {
        name: "Private transfer",
        badge: "easiest",
        duration: "70–90 min",
        cost: "¥15,000–25,000",
        pros: ["Door-to-door to your hotel", "All luggage handled", "Available 24/7", "Best for families or late arrivals"],
        cons: ["Most expensive option", "Must book in advance", "Traffic dependent"],
        luggageFriendly: true,
        lateOk: true,
        bookingLink: airportTransferUrl,
        bookingLabel: "Book private transfer",
      },
    ],
    lateArrivalNote: "Keisei Access Express runs until about 23:00 from Narita to Oshiage. After the last train, a taxi costs ¥20,000+ or book a private transfer. If landing very late, consider staying near Narita and traveling to Oshiage the next morning.",
    proTip: "Oshiage is one of the most direct Narita connections in Tokyo. The Keisei Access Express runs straight there with no transfer — something most first-time visitors don't realize. If your hotel is near Skytree, this is the simplest arrival in East Tokyo.",
    nextActions: arrivalBundle(
      { id: "stay-oshiage", category: "stay", title: "Compare Oshiage / Skytree hotels", description: "East Tokyo base near Skytree, Asakusa, and Sumida River.", cta: "Compare hotels", href: hotelOshiage.href },
    ),
  },
  {
    slug: "haneda-to-ueno",
    title: "Haneda to Ueno — Best Airport Transfer Options",
    description: "Compare Haneda Airport to Ueno transfer options, including monorail, JR, Keikyu, taxi and private transfer. Good for travelers staying near Ueno or taking trains north.",
    from: "Haneda Airport (HND)",
    to: "Ueno",
    options: [
      {
        name: "Keikyu + JR Ueno-Tokyo Line",
        badge: "fastest",
        duration: "35–45 min",
        cost: "¥650",
        pros: ["Fastest and cheapest train combination", "Frequent Keikyu departures from Haneda", "JR Ueno-Tokyo Line is direct from Shinagawa", "Works late — trains run until ~midnight"],
        cons: ["Requires transfer at Shinagawa", "Crowded during rush hour", "Navigating Shinagawa with luggage takes practice"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
      {
        name: "Tokyo Monorail + JR",
        badge: "cheapest",
        duration: "45–55 min",
        cost: "¥680",
        pros: ["Scenic monorail over Tokyo Bay", "Connects to JR at Hamamatsucho", "Monorail covered by JR Pass if activated"],
        cons: ["Requires 2 connections (Monorail → JR → Ueno)", "Slightly longer than Keikyu route", "More walking with luggage"],
        luggageFriendly: false,
        lateOk: true,
        bookingLink: monorailUrl,
        bookingLabel: "Book Monorail ticket",
      },
      {
        name: "Taxi",
        badge: "easiest",
        duration: "30–50 min",
        cost: "¥6,000–9,000",
        pros: ["Door-to-door, zero navigation", "Available 24/7", "Reasonable split between 2–3 people", "Best for late arrivals with luggage"],
        cons: ["Most expensive option", "Traffic adds time and cost", "Communication can be tricky — use Google Maps"],
        luggageFriendly: true,
        lateOk: true,
        bookingLabel: "Use airport taxi or taxi app",
      },
    ],
    lateArrivalNote: "Keikyu trains from Haneda run until about midnight. A taxi to Ueno is ¥6,000–9,000 and takes 30–50 min — reasonable for two people splitting the fare after a late landing.",
    proTip: "Ueno is a great first-night base from Haneda. Budget hotels, easy Narita connections (for return), museums, and Ameyoko market are all within walking distance. If you're also planning a Skyliner return to Narita, Ueno makes double sense.",
    nextActions: arrivalBundle(
      { id: "stay-ueno", category: "stay", title: "Compare Ueno hotels on Trip.com", description: "Budget-friendly base with museum access and easy Narita return.", cta: "Compare hotels", href: hotelUeno.href },
    ),
  },
  {
    slug: "narita-late-arrival",
    title: "Narita Late Arrival Guide — What to Do If You Land at Night",
    description: "Landing late at Narita Airport? Compare late trains, buses, taxis, airport hotels and private transfers for getting into Tokyo after evening arrivals.",
    from: "Narita Airport (NRT)",
    to: "Central Tokyo",
    options: [
      {
        name: "Keisei Access Express (last trains)",
        badge: "cheapest",
        duration: "70–100 min",
        cost: "¥1,070–1,270",
        pros: ["Runs later than N'EX or Skyliner (~23:00)", "Cheapest way into Tokyo at night", "Connects to Asakusa, Oshiage, and metro"],
        cons: ["No reserved seats", "Crowded with tired travelers and luggage", "Must confirm final departure time on arrival day", "Limited destinations without further transfer"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
      {
        name: "Limousine Bus (late departures)",
        badge: "easiest",
        duration: "85–120 min",
        cost: "¥3,200",
        pros: ["Some routes run until 23:00+", "Luggage stored under the bus", "Drops off at major hotel areas", "Comfortable after a long flight"],
        cons: ["Not all routes run late — check schedule", "Traffic can extend travel time", "Limited destinations at night"],
        luggageFriendly: true,
        lateOk: true,
        bookingLink: limousineBusUrl,
        bookingLabel: "Book Limousine Bus",
      },
      {
        name: "Private transfer / taxi",
        badge: "fastest",
        duration: "60–80 min",
        cost: "¥20,000–30,000",
        pros: ["Available 24/7 — no schedule risk", "Door-to-door to any hotel", "Driver handles luggage", "Best for families, groups, or very late arrivals"],
        cons: ["Expensive for solo travelers", "Must book private transfer in advance", "Taxi queue can be long after midnight"],
        luggageFriendly: true,
        lateOk: true,
        bookingLink: airportTransferUrl,
        bookingLabel: "Book private transfer",
      },
    ],
    lateArrivalNote: "Before 21:00: N'EX, Skyliner, and most buses are still running. After 22:00: options thin out quickly — Keisei Access Express is your best train bet. After 23:00: consider a Narita airport hotel (transit hotels are available inside terminals), taxi, or pre-booked private transfer.",
    proTip: "If your flight lands after 21:00, check exact train schedules before departure day. The Keisei website shows final departures. If there's any doubt, book a private transfer as backup — cancellation is usually free until 24h before.",
    nextActions: [
      { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Activate before landing — essential for checking live schedules.", cta: "Get eSIM", href: esimUrl },
      { id: "transfer", category: "transfer", title: "Book airport transfer", description: "Pre-book a private transfer as late-night backup.", cta: "Book transfer", href: airportTransferUrl },
      { id: "narita-shinjuku", category: "transfer", title: "Narita to Shinjuku options", description: "Full comparison if Shinjuku is your destination.", cta: "See options", href: "/airport-transfers/narita-to-shinjuku" },
      { id: "narita-asakusa", category: "transfer", title: "Narita to Asakusa options", description: "Direct Access Express route to East Tokyo.", cta: "See options", href: "/airport-transfers/narita-to-asakusa" },
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Pick a base that's easy to reach late at night.", cta: "Compare areas", href: "/areas-to-stay/tokyo-first-time" },
    ],
  },
  {
    slug: "haneda-late-arrival",
    title: "Haneda Late Arrival Guide — What to Do If You Land at Night",
    description: "Landing late at Haneda Airport? Compare late trains, taxis, private transfers, airport hotels and the safest options for reaching Tokyo at night.",
    from: "Haneda Airport (HND)",
    to: "Central Tokyo",
    options: [
      {
        name: "Keikyu Line (last trains)",
        badge: "cheapest",
        duration: "20–40 min",
        cost: "¥300–700",
        pros: ["Runs until ~midnight", "Cheapest option available", "Direct connections to Shinagawa and beyond", "Through-service to Asakusa Line on some trains"],
        cons: ["Final trains may be crowded", "Limited onward connections after Shinagawa", "Luggage management on late trains", "Must confirm last train time for your destination"],
        luggageFriendly: false,
        lateOk: true,
        bookingLabel: "No booking needed - use IC card",
      },
      {
        name: "Taxi",
        badge: "easiest",
        duration: "20–45 min",
        cost: "¥3,000–8,000",
        pros: ["Available 24/7 at the airport", "Haneda is close to central Tokyo — fares are reasonable", "Door-to-door, no navigation needed", "Split between 2 people makes it practical"],
        cons: ["Late-night surcharge applies (22:00–05:00, ~20%)", "Traffic to distant areas adds cost", "Taxi queue can be long after midnight"],
        luggageFriendly: true,
        lateOk: true,
        bookingLabel: "Use airport taxi or taxi app",
      },
      {
        name: "Private transfer",
        badge: "fastest",
        duration: "20–40 min",
        cost: "¥8,000–15,000",
        pros: ["Pre-booked, driver meets you at arrivals", "Fixed price — no meter anxiety", "Available at any hour", "Best for families or groups with luggage"],
        cons: ["More expensive than taxi for solo travelers", "Must book in advance", "Cancellation policies vary"],
        luggageFriendly: true,
        lateOk: true,
        bookingLink: airportTransferUrl,
        bookingLabel: "Book private transfer",
      },
    ],
    lateArrivalNote: "Haneda is much closer to central Tokyo than Narita. Even after midnight, a taxi to Shinjuku or Shibuya is ¥5,000–8,000 (20–35 min). For Asakusa or Ueno, expect ¥5,000–7,000. This makes Haneda the more forgiving airport for late arrivals.",
    proTip: "Haneda's proximity to Tokyo means 'late arrival' is less of a crisis than at Narita. A taxi split two ways is often comparable to a train fare per person. If you land after 23:00, don't stress — just take a taxi and save the transit navigation for day one.",
    nextActions: [
      { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Activate before landing — check live schedules and call a taxi.", cta: "Get eSIM", href: esimUrl },
      { id: "transfer", category: "transfer", title: "Book airport transfer", description: "Pre-book a private transfer for peace of mind.", cta: "Book transfer", href: airportTransferUrl },
      { id: "haneda-shinjuku", category: "transfer", title: "Haneda to Shinjuku options", description: "Full comparison for the most popular late-night destination.", cta: "See options", href: "/airport-transfers/haneda-to-shinjuku" },
      { id: "haneda-asakusa", category: "transfer", title: "Haneda to Asakusa options", description: "Direct Keikyu through-service to East Tokyo.", cta: "See options", href: "/airport-transfers/haneda-to-asakusa" },
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Choose your hotel area based on late-night access.", cta: "Compare areas", href: "/areas-to-stay/tokyo-first-time" },
    ],
  },
];

// ─── Lookup ─────────────────────────────────────────────────────────────────

export function getTransferBySlug(slug: string): TransferPage | undefined {
  return transferPages.find((p) => p.slug === slug);
}

export function getAllTransferSlugs(): string[] {
  return transferPages.map((p) => p.slug);
}
