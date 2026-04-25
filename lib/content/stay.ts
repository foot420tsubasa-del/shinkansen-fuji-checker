import type { TripPick } from "@/lib/trip-picks";
import { getAffUrl } from "@/src/affiliateLinks";


// ─── Types ──────────────────────────────────────────────────────────────────

export type StayArea = {
  name: string;
  vibe: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  transport: string;
  hotelLink: string;
};

export type HotelPick = {
  name: string;
  area: string;
  price: string;
  link: string;
  tag?: string;
};

export type ComparisonRow = {
  feature: string;
  values: Record<string, string>;
};

export type StayPage = {
  slug: string;
  title: string;
  description: string;
  quickRec: { area: string; why: string; link: string };
  areas: StayArea[];
  comparisonColumns: string[];
  comparison: ComparisonRow[];
  proTip: string;
  hotelPicks: HotelPick[];
  nextActions: TripPick[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const ESIM_URL = getAffUrl("esim");
const JR_PASS_URL = getAffUrl("jrPass");
const hotelTokyo = getAffUrl("hotelTokyo");
const hotelShinjuku = getAffUrl("hotelShinjuku");
const hotelUeno = getAffUrl("hotelUeno");
const hotelAsakusa = getAffUrl("hotelAsakusa");
const hotelKyotoStation = getAffUrl("hotelKyotoStation");
const hotelGion = getAffUrl("hotelGion");
const hotelKawaguchiko = getAffUrl("hotelKawaguchiko");

// ─── Shared next actions ────────────────────────────────────────────────────

const commonNextActions: TripPick[] = [
  { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Set up connectivity before landing.", cta: "Get eSIM", href: ESIM_URL },
  { id: "jr-pass", category: "train", title: "Book JR Pass", description: "Covers Shinkansen + most JR trains.", cta: "See JR Pass", href: JR_PASS_URL },
];

// ─── Page Data ──────────────────────────────────────────────────────────────

export const stayPages: StayPage[] = [
  {
    slug: "tokyo-first-time",
    title: "Where to stay in Tokyo — first-time visitor guide",
    description: "Compare Shinjuku, Ueno, Asakusa, and Tokyo Station for your first trip to Japan. Find the best area based on transport access, nightlife, and luggage ease.",
    quickRec: {
      area: "Shinjuku",
      why: "Best balance of nightlife, transport access, and hotel density. 10 min to Tokyo Station for Shinkansen day trips. Most first-timers start here.",
      link: hotelShinjuku,
    },
    areas: [
      {
        name: "Shinjuku",
        vibe: "Buzzing hub — nightlife, shopping, transport",
        pros: ["Best train connectivity (JR + Metro + private lines)", "Huge hotel selection at every price point", "Walking distance to Kabukicho, Golden Gai, Omoide Yokocho"],
        cons: ["Can feel overwhelming on first night", "Station is enormous — easy to get lost"],
        bestFor: "First-timers",
        transport: "10 min to Tokyo Station (JR Chuo). Direct Narita Express. Odakyu to Hakone.",
        hotelLink: hotelShinjuku,
      },
      {
        name: "Ueno",
        vibe: "Calm, cultural, budget-friendly",
        pros: ["Cheapest hotel area in central Tokyo", "Walking distance to Ameyoko market + museums", "Skyliner direct to Narita (36 min)"],
        cons: ["Quieter nightlife than Shinjuku/Shibuya", "Fewer dining options late night"],
        bestFor: "Budget travelers",
        transport: "Skyliner to Narita 36 min. JR Yamanote to Shinjuku 25 min. Metro to Asakusa 5 min.",
        hotelLink: hotelUeno,
      },
      {
        name: "Asakusa",
        vibe: "Traditional Tokyo — temples, riverside, old-town charm",
        pros: ["Senso-ji Temple walking distance", "Sumida River views, Tokyo Skytree nearby", "Strong local neighborhood feel"],
        cons: ["Not on JR Yamanote Line — transfers needed", "Limited late-night food options"],
        bestFor: "Culture-first trips",
        transport: "Metro Ginza Line to Shibuya 30 min. Tobu Line direct to Nikko. Water bus to Odaiba.",
        hotelLink: hotelAsakusa,
      },
      {
        name: "Tokyo Station area",
        vibe: "Business-efficient — Shinkansen access, clean, quiet",
        pros: ["Direct Shinkansen platform — zero transfer for Kyoto/Osaka", "Excellent for early departures and late arrivals", "Marunouchi and Ginza shopping nearby"],
        cons: ["Higher hotel prices", "Less neighborhood character — mostly offices after 9pm"],
        bestFor: "Shinkansen-heavy trips",
        transport: "All Shinkansen lines. Narita Express direct. JR Yamanote to anywhere.",
        hotelLink: hotelTokyo,
      },
    ],
    comparisonColumns: ["Shinjuku", "Ueno", "Asakusa", "Tokyo Stn"],
    comparison: [
      { feature: "Airport access", values: { "Shinjuku": "N'EX 80min", "Ueno": "Skyliner 36min", "Asakusa": "Skyliner+Metro 45min", "Tokyo Stn": "N'EX 55min" } },
      { feature: "Shinkansen access", values: { "Shinjuku": "10 min transfer", "Ueno": "Ueno Stn (some stop)", "Asakusa": "20 min transfer", "Tokyo Stn": "Direct" } },
      { feature: "Nightlife", values: { "Shinjuku": "★★★★★", "Ueno": "★★☆☆☆", "Asakusa": "★★☆☆☆", "Tokyo Stn": "★★★☆☆" } },
      { feature: "Budget hotels", values: { "Shinjuku": "¥6,000–12,000", "Ueno": "¥4,500–8,000", "Asakusa": "¥5,000–9,000", "Tokyo Stn": "¥9,000–18,000" } },
      { feature: "Vibe", values: { "Shinjuku": "Electric", "Ueno": "Local charm", "Asakusa": "Traditional", "Tokyo Stn": "Business" } },
    ],
    proTip: "If you're taking the Shinkansen to Kyoto on Day 3+, staying in Shinjuku and transferring to Tokyo Station (10 min) is more fun than staying near Tokyo Station the whole time. You get the best nightlife and still catch your train easily.",
    hotelPicks: [
      { name: "Hotel Gracery Shinjuku", area: "Shinjuku", price: "¥12,000/night", link: hotelShinjuku, tag: "Popular" },
      { name: "Dormy Inn Ueno Okachimachi", area: "Ueno", price: "¥7,500/night", link: hotelUeno, tag: "Budget" },
      { name: "Richmond Hotel Asakusa", area: "Asakusa", price: "¥9,000/night", link: hotelAsakusa },
      { name: "Hotel Metropolitan Tokyo", area: "Tokyo Station", price: "¥15,000/night", link: hotelTokyo },
    ],
    nextActions: [
      { id: "transfer", category: "transfer", title: "Sort airport transfer", description: "Narita to Shinjuku — compare N'EX, bus, and Skyliner.", cta: "Compare transfers", href: "/airport-transfers/narita-to-shinjuku" },
      ...commonNextActions,
    ],
  },
  {
    slug: "shinjuku-vs-ueno-vs-asakusa",
    title: "Shinjuku vs Ueno vs Asakusa — which Tokyo base is right?",
    description: "A head-to-head comparison of Tokyo's three most popular tourist areas. Covers transport, budget, vibe, and which type of traveler each area suits best.",
    quickRec: {
      area: "Shinjuku",
      why: "If you can only pick one: Shinjuku wins on transport flexibility, dining variety, and nightlife. But Ueno beats it on budget, and Asakusa beats it on atmosphere.",
      link: hotelShinjuku,
    },
    areas: [
      {
        name: "Shinjuku",
        vibe: "Maximum Tokyo — neon, crowds, options",
        pros: ["Most connected station in Tokyo (12 lines)", "Golden Gai + Omoide Yokocho for nightlife", "Don Quijote, Kabukicho, department stores"],
        cons: ["Station layout is confusing", "Can feel chaotic late at night", "Hotel prices spike on weekends"],
        bestFor: "Nightlife & flexibility",
        transport: "JR Yamanote hub. N'EX to Narita. Odakyu to Hakone. 10 min to Tokyo Station.",
        hotelLink: hotelShinjuku,
      },
      {
        name: "Ueno",
        vibe: "Relaxed, museum-rich, market vibes",
        pros: ["Cheapest area for quality hotels", "Ameyoko market for street food & shopping", "Ueno Park: museums, zoo, cherry blossoms"],
        cons: ["Smaller nightlife scene", "Fewer restaurant options late night", "Some streets feel dated"],
        bestFor: "Budget & culture",
        transport: "Skyliner to Narita 36 min. JR Yamanote + Metro access. Close to Akihabara (3 min JR).",
        hotelLink: hotelUeno,
      },
      {
        name: "Asakusa",
        vibe: "Old-town Tokyo — temples, craftsmen, river walks",
        pros: ["Senso-ji Temple at your doorstep", "Sumida River evening walks", "Authentic neighborhood restaurants"],
        cons: ["No JR Yamanote — need Metro/Tobu", "Quiet after 9pm", "Farther from Shibuya/Shinjuku (30+ min)"],
        bestFor: "Culture & photo ops",
        transport: "Metro Ginza Line. Tobu Line to Nikko (direct). Water bus to Odaiba.",
        hotelLink: hotelAsakusa,
      },
    ],
    comparisonColumns: ["Shinjuku", "Ueno", "Asakusa"],
    comparison: [
      { feature: "Hotel budget", values: { "Shinjuku": "¥8,000–15,000", "Ueno": "¥4,500–8,000", "Asakusa": "¥5,500–10,000" } },
      { feature: "Food variety", values: { "Shinjuku": "★★★★★", "Ueno": "★★★☆☆", "Asakusa": "★★★☆☆" } },
      { feature: "Narita access", values: { "Shinjuku": "N'EX 80min", "Ueno": "Skyliner 36min", "Asakusa": "45min w/ transfer" } },
      { feature: "Haneda access", values: { "Shinjuku": "Bus 40min", "Ueno": "Monorail+JR 40min", "Asakusa": "Keikyu+Metro 50min" } },
      { feature: "Walking sightseeing", values: { "Shinjuku": "Kabukicho, Gyoen", "Ueno": "Park, Ameyoko", "Asakusa": "Senso-ji, Skytree" } },
    ],
    proTip: "Staying 2–3 nights? Consider splitting: 2 nights Shinjuku (nightlife + shopping) → 1 night Asakusa (temple morning). The move takes 30 min by Metro and changes the whole trip feel.",
    hotelPicks: [
      { name: "Tokyu Stay Shinjuku Eastside", area: "Shinjuku", price: "¥10,000/night", link: hotelShinjuku, tag: "Best value" },
      { name: "Nohga Hotel Ueno Tokyo", area: "Ueno", price: "¥11,000/night", link: hotelUeno, tag: "Design" },
      { name: "Gate Hotel Kaminarimon", area: "Asakusa", price: "¥13,000/night", link: hotelAsakusa, tag: "Views" },
    ],
    nextActions: [
      { id: "transfer-narita", category: "transfer", title: "Narita to your area", description: "Compare the fastest route to Shinjuku, Ueno, or Asakusa.", cta: "See transfers", href: "/airport-transfers/narita-to-shinjuku" },
      { id: "itinerary", category: "experience", title: "Plan your Tokyo days", description: "See a sample 7-day Japan itinerary.", cta: "View itinerary", href: "/itineraries/7-day-first-time-japan" },
      ...commonNextActions,
    ],
  },
  {
    slug: "kyoto-station-vs-gion",
    title: "Kyoto Station vs Gion — where to stay in Kyoto",
    description: "Compare Kyoto Station area and Gion for your Kyoto stay. Transport access, temple proximity, ryokan options, and which suits your trip style.",
    quickRec: {
      area: "Kyoto Station area",
      why: "Best for first-timers using JR Pass. Direct Shinkansen access, bus hub for all major temples, and easy luggage handling. Gion is better for atmosphere but worse for logistics.",
      link: hotelKyotoStation,
    },
    areas: [
      {
        name: "Kyoto Station",
        vibe: "Transit hub — practical, modern, efficient",
        pros: ["Shinkansen platform — zero transfer", "All major bus lines depart from here", "Coin lockers + luggage storage everywhere"],
        cons: ["Feels like a transit hub, not 'old Kyoto'", "Walking to temples takes 20+ min", "Hotels can feel generic"],
        bestFor: "Transit efficiency",
        transport: "Shinkansen direct. Bus 100/101/206 to all temples. JR Nara Line to Nara (45 min).",
        hotelLink: hotelKyotoStation,
      },
      {
        name: "Gion / Higashiyama",
        vibe: "Traditional Kyoto — geisha district, lantern-lit streets",
        pros: ["Walking distance to Kiyomizu-dera, Yasaka Shrine", "Evening geiko/maiko sightings possible", "Best atmosphere for photos and ryokan stays"],
        cons: ["15 min bus/taxi to Kyoto Station", "Narrow streets — luggage is a hassle", "Higher prices, especially ryokans"],
        bestFor: "Atmosphere & temples",
        transport: "Bus 206 to Kyoto Station 15 min. Walking to Higashiyama temples. Keihan Line to Osaka.",
        hotelLink: hotelGion,
      },
    ],
    comparisonColumns: ["Kyoto Station", "Gion"],
    comparison: [
      { feature: "Shinkansen access", values: { "Kyoto Station": "Direct (0 min)", "Gion": "Bus/taxi 15 min" } },
      { feature: "Temple access", values: { "Kyoto Station": "Bus 15–25 min", "Gion": "Walk 5–15 min" } },
      { feature: "Luggage ease", values: { "Kyoto Station": "★★★★★", "Gion": "★★☆☆☆" } },
      { feature: "Ryokan options", values: { "Kyoto Station": "Few", "Gion": "Many (premium)" } },
      { feature: "Evening vibe", values: { "Kyoto Station": "Mall dining", "Gion": "Lantern streets" } },
      { feature: "Budget hotels", values: { "Kyoto Station": "¥6,000–12,000", "Gion": "¥10,000–25,000" } },
    ],
    proTip: "If arriving by Shinkansen with luggage, stay near Kyoto Station for the first night. Luggage-forward services (¥800–2,000) can send bags to your next hotel by next morning — use this to switch to a Gion ryokan luggage-free.",
    hotelPicks: [
      { name: "Hotel Granvia Kyoto", area: "Kyoto Station", price: "¥14,000/night", link: hotelKyotoStation, tag: "Connected" },
      { name: "Daiwa Roynet Kyoto Station", area: "Kyoto Station", price: "¥9,000/night", link: hotelKyotoStation, tag: "Budget" },
      { name: "Sowaka Gion", area: "Gion", price: "¥35,000/night", link: hotelGion, tag: "Ryokan" },
      { name: "Hotel The Celestine Gion", area: "Gion", price: "¥18,000/night", link: hotelGion },
    ],
    nextActions: [
      { id: "shinkansen-seat", category: "train", title: "Check Fuji-side seat", description: "Tokyo → Kyoto: Seat E for Mt. Fuji views.", cta: "Check seat", href: "/" },
      { id: "itinerary-shinkansen", category: "experience", title: "Tokyo to Kyoto route", description: "Plan the Shinkansen day with stops.", cta: "See route", href: "/itineraries/tokyo-to-kyoto-by-shinkansen" },
      ...commonNextActions,
    ],
  },
  {
    slug: "kawaguchiko",
    title: "Where to stay in Kawaguchiko — best Mt. Fuji view hotels",
    description: "Lake Kawaguchiko is the closest area to see Mt. Fuji up close. Compare north shore vs south shore, ryokans with private onsen, and how to get there from Tokyo.",
    quickRec: {
      area: "North shore of Lake Kawaguchiko",
      why: "North shore gives you the iconic Fuji-over-lake view directly from your room. Most ryokans with outdoor onsen face south toward Fuji. Book early — Fuji-view rooms sell out months ahead.",
      link: hotelKawaguchiko,
    },
    areas: [
      {
        name: "North shore (Fuji-view side)",
        vibe: "Classic postcard view — Fuji across the lake",
        pros: ["Direct Mt. Fuji views from hotel rooms", "Most ryokans with private onsen here", "Quieter, more scenic walking paths"],
        cons: ["Fewer restaurants and konbini nearby", "Need bus/car to reach Kawaguchiko Station", "Premium pricing for Fuji-view rooms"],
        bestFor: "Fuji views & onsen",
        transport: "Retro Bus Red Line loops every 15 min. Most hotels offer station shuttle. Taxi ¥1,500–2,000.",
        hotelLink: hotelKawaguchiko,
      },
      {
        name: "Kawaguchiko Station area",
        vibe: "Convenient — restaurants, shops, station access",
        pros: ["Walking distance to station + bus terminal", "More dining options", "Lower prices than lakeside ryokans"],
        cons: ["No lake/Fuji view from most hotels", "More tourist-commercial feel", "Less memorable than lakeside stay"],
        bestFor: "Budget & convenience",
        transport: "Fujikyu Railway to Otsuki → JR Chuo to Shinjuku (2h total). Highway bus to Shinjuku 1h50m.",
        hotelLink: hotelKawaguchiko,
      },
    ],
    comparisonColumns: ["North shore", "Station area"],
    comparison: [
      { feature: "Mt. Fuji view", values: { "North shore": "★★★★★ (direct)", "Station area": "★★☆☆☆ (partial)" } },
      { feature: "Onsen quality", values: { "North shore": "Private outdoor, Fuji-facing", "Station area": "Public bath, no view" } },
      { feature: "Access to station", values: { "North shore": "Bus/shuttle 10 min", "Station area": "Walk 5 min" } },
      { feature: "Price range", values: { "North shore": "¥20,000–60,000", "Station area": "¥8,000–15,000" } },
      { feature: "Dining nearby", values: { "North shore": "Limited (hotel dining)", "Station area": "Many options" } },
    ],
    proTip: "Fuji is most visible in early morning (before clouds build). Book a north-shore ryokan with an in-room or private onsen so you can soak with the Fuji view at 6am — that's the money shot.",
    hotelPicks: [
      { name: "Kozantei Ubuya", area: "North shore", price: "¥45,000/night", link: hotelKawaguchiko, tag: "Iconic view" },
      { name: "Fuji Lake Hotel", area: "North shore", price: "¥22,000/night", link: hotelKawaguchiko },
      { name: "Hotel Mystays Fuji", area: "Station area", price: "¥9,000/night", link: hotelKawaguchiko, tag: "Budget" },
    ],
    nextActions: [
      { id: "itinerary-fuji", category: "experience", title: "Tokyo to Fuji day trip", description: "Plan a 1-day Kawaguchiko itinerary from Tokyo.", cta: "See itinerary", href: "/itineraries/tokyo-to-fuji-1day" },
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare Shinjuku, Ueno, Asakusa for your Tokyo base.", cta: "See Tokyo areas", href: "/areas-to-stay/tokyo-first-time" },
      ...commonNextActions,
    ],
  },
];

// ─── Lookup ─────────────────────────────────────────────────────────────────

export function getStayBySlug(slug: string): StayPage | undefined {
  return stayPages.find((p) => p.slug === slug);
}

export function getAllStaySlugs(): string[] {
  return stayPages.map((p) => p.slug);
}
