import type { TripPick } from "@/lib/trip-picks";
import { getAffUrl } from "@/src/affiliateLinks";


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
  bookingLink: string;
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

const nexUrl = getAffUrl("nex");
const skylinerUrl = getAffUrl("skyliner");
const limousineBusUrl = getAffUrl("limousineBus");
const monorailUrl = getAffUrl("hanedaMonorail");
const esimUrl = getAffUrl("esim");
const jrPassUrl = getAffUrl("jrPass");

// ─── Shared next actions ────────────────────────────────────────────────────

const commonNextActions: TripPick[] = [
  { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Set up data before landing — maps, translate, transit apps.", cta: "Get eSIM", href: esimUrl },
  { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare Shinjuku, Ueno, Asakusa for your base.", cta: "Compare areas", href: "/areas-to-stay/tokyo-first-time" },
];

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
        bookingLink: nexUrl,
        bookingLabel: "Compare train options",
      },
    ],
    lateArrivalNote: "Flight landing after 21:00? The Limousine Bus and Keisei Access Express run later than N'EX. If you land after 23:00, budget ¥20,000–25,000 for a taxi or book an airport hotel for the night.",
    proTip: "If you have 2+ large suitcases, the Limousine Bus is the least stressful option. N'EX is fast but Shinjuku Station is enormous — navigating to your exit with heavy luggage is the hidden cost.",
    nextActions: [
      { id: "stay-shinjuku", category: "stay", title: "Hotels near Shinjuku Station", description: "Best areas to stay once you arrive.", cta: "See Shinjuku stays", href: "/areas-to-stay/shinjuku-vs-ueno-vs-asakusa" },
      ...commonNextActions,
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
        bookingLink: nexUrl,
        bookingLabel: "Compare options",
      },
    ],
    lateArrivalNote: "Catching a Shinkansen the same day? Book N'EX to arrive at Tokyo Station with zero transfers. JR Pass holders: N'EX is covered by the pass — activate it at Narita JR counter before boarding.",
    proTip: "If you have a JR Pass, the Narita Express is free (covered by pass). Activate your pass at the JR East Travel Service Center in Narita Terminal 1 or 2 before boarding — it takes 10–15 min.",
    nextActions: [
      { id: "jr-pass", category: "train", title: "Get JR Pass", description: "Covers N'EX + all Shinkansen (except Nozomi).", cta: "See JR Pass", href: jrPassUrl },
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
        bookingLink: monorailUrl,
        bookingLabel: "See transit passes",
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
        bookingLink: monorailUrl,
        bookingLabel: "See transit options",
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
        bookingLink: esimUrl,
        bookingLabel: "Get eSIM for maps",
      },
    ],
    lateArrivalNote: "The Keikyu direct to Asakusa runs until about 23:30. If you arrive later, a taxi from Haneda to Asakusa is ¥5,000–7,000 and takes 30 min — reasonable for 2 people splitting.",
    proTip: "The Keikyu → Asakusa Line through-service is the hidden gem here. Many travelers don't know this direct connection exists and take unnecessary transfers via Shinagawa. Look for trains marked 'エアポート快特 Asakusa Line' on the platform display.",
    nextActions: [
      { id: "stay-asakusa", category: "stay", title: "Staying in Asakusa", description: "Compare Asakusa with Shinjuku and Ueno.", cta: "See comparison", href: "/areas-to-stay/shinjuku-vs-ueno-vs-asakusa" },
      { id: "nikko", category: "experience", title: "Day trip to Nikko", description: "Tobu Line from Asakusa — direct to Nikko shrines.", cta: "See itinerary", href: "/itineraries/7-day-first-time-japan" },
      ...commonNextActions,
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
