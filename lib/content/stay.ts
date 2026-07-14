import type { TripPick } from "@/lib/trip-picks";
import { getHotelLink, type HotelAreaKey } from "@/lib/hotel-links";
import type { StayAreaMapKey } from "@/lib/stay-area-maps";
import { getManagedStayHotelPicks } from "@/lib/stay-hotel-picks";
import { requireAffUrl } from "@/src/affiliateLinks";


// ─── Types ──────────────────────────────────────────────────────────────────

export type StayArea = {
  id?: string;
  name: string;
  vibe: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  transport: string;
  hotelLink: string;
  hotelKey?: HotelAreaKey;
};

export type HotelPick = {
  id?: string;
  name: string;
  area: string;
  price: string;
  link: string;
  hotelKey?: HotelAreaKey;
  tag?: string;
  provider?: "trip" | "klook";
  trackingHref?: string;
  label?: string;
};

export type ComparisonRow = {
  feature: string;
  values: Record<string, string>;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type StayPage = {
  slug: string;
  title: string;
  description: string;
  quickRec: { area: string; why: string; link: string; areaId?: string };
  mapId?: StayAreaMapKey;
  mapDescription?: string[];
  areas: StayArea[];
  comparisonColumns: string[];
  comparison: ComparisonRow[];
  proTip: string;
  hotelPicks: HotelPick[];
  nextActions: TripPick[];
  faqs?: FaqItem[];
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const ESIM_URL = requireAffUrl("esim");
const hotelTokyo = getHotelLink("tokyoStation");
const hotelShinjuku = getHotelLink("shinjuku");
const hotelUeno = getHotelLink("ueno");
const hotelAsakusa = getHotelLink("asakusa");
const hotelKyotoStation = getHotelLink("kyotoStation");
const hotelGion = getHotelLink("gionKawaramachi");
const hotelKawaguchiko = getHotelLink("kawaguchiko");
const hotelNamba = getHotelLink("namba");
const hotelUmeda = getHotelLink("umeda");
const hotelShinOsaka = getHotelLink("shinOsaka");

// ─── Shared next actions ────────────────────────────────────────────────────

const commonNextActions: TripPick[] = [
  { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Set up connectivity before landing.", cta: "Get eSIM", href: ESIM_URL },
  { id: "jr-pass", category: "train", title: "JR Pass fit guide", description: "Check whether your route has enough long-distance JR rides before buying.", cta: "Read guide", href: "/jr-pass-vs-single-ticket" },
];

// ─── Page Data ──────────────────────────────────────────────────────────────

const rawStayPages: StayPage[] = [
  {
    slug: "tokyo-first-time",
    title: "Where to stay in Tokyo — first-time visitor guide",
    description: "Compare Shinjuku, Ueno, Asakusa, and Tokyo Station for your first trip to Japan. Find the best area based on transport access, nightlife, and luggage ease.",
    quickRec: {
      area: "Shinjuku",
      why: "Best balance of nightlife, transport access, and hotel density. 10 min to Tokyo Station for Shinkansen day trips. Most first-timers start here.",
      link: hotelShinjuku.href,
    },
    mapId: "shinjukuStayMap",
    mapDescription: [
      "Shinjuku is convenient, but not every part of Shinjuku feels the same at night. Kabukicho is lively and useful for nightlife, but it may feel noisy for families or light sleepers.",
      "For a calmer stay, look around Nishi-Shinjuku, Shinjuku-Gyoenmae / Shinjuku-sanchome, or Yoyogi / South Shinjuku. This is a local-style way to think about Shinjuku hotels, not a strict rule.",
    ],
    areas: [
      {
        id: "shinjuku",
        name: "Shinjuku",
        vibe: "Buzzing hub — nightlife, shopping, transport",
        pros: ["Best train connectivity (JR + Metro + private lines)", "Huge hotel selection across different budget levels", "Walking distance to Kabukicho, Golden Gai, Omoide Yokocho"],
        cons: ["Can feel overwhelming on first night", "Station is enormous — easy to get lost"],
        bestFor: "First-timers",
        transport: "10 min to Tokyo Station (JR Chuo). Direct Narita Express. Odakyu to Hakone.",
        hotelLink: hotelShinjuku.href,
        hotelKey: "shinjuku",
      },
      {
        id: "ueno",
        name: "Ueno",
        vibe: "Calm, cultural, budget-friendly",
        pros: ["More budget hotel options in central Tokyo", "Walking distance to Ameyoko market + museums", "Skyliner direct to Narita (36 min)"],
        cons: ["Quieter nightlife than Shinjuku/Shibuya", "Fewer dining options late night"],
        bestFor: "Budget travelers",
        transport: "Skyliner to Narita 36 min. JR Yamanote to Shinjuku 25 min. Metro to Asakusa 5 min.",
        hotelLink: hotelUeno.href,
        hotelKey: "ueno",
      },
      {
        id: "asakusa",
        name: "Asakusa",
        vibe: "Traditional Tokyo — temples, riverside, old-town charm",
        pros: ["Senso-ji Temple walking distance", "Sumida River views, Tokyo Skytree nearby", "Strong local neighborhood feel"],
        cons: ["Not on JR Yamanote Line — transfers needed", "Limited late-night food options"],
        bestFor: "Culture-first trips",
        transport: "Metro Ginza Line to Shibuya 30 min. Tobu Line direct to Nikko. Water bus to Odaiba.",
        hotelLink: hotelAsakusa.href,
        hotelKey: "asakusa",
      },
      {
        id: "tokyo-station",
        name: "Tokyo Station area",
        vibe: "Business-efficient — Shinkansen access, clean, quiet",
        pros: ["Direct Shinkansen platform — zero transfer for Kyoto/Osaka", "Excellent for early departures and late arrivals", "Marunouchi and Ginza shopping nearby"],
        cons: ["Usually higher hotel rates", "Less neighborhood character — mostly offices after 9pm"],
        bestFor: "Shinkansen-heavy trips",
        transport: "All Shinkansen lines. Narita Express direct. JR Yamanote to anywhere.",
        hotelLink: hotelTokyo.href,
        hotelKey: "tokyoStation",
      },
    ],
    comparisonColumns: ["Shinjuku", "Ueno", "Asakusa", "Tokyo Stn"],
    comparison: [
      { feature: "Airport access", values: { "Shinjuku": "N'EX 80min", "Ueno": "Skyliner 36min", "Asakusa": "Skyliner+Metro 45min", "Tokyo Stn": "N'EX 55min" } },
      { feature: "Shinkansen access", values: { "Shinjuku": "10 min transfer", "Ueno": "Ueno Stn (some stop)", "Asakusa": "20 min transfer", "Tokyo Stn": "Direct" } },
      { feature: "Nightlife", values: { "Shinjuku": "★★★★★", "Ueno": "★★☆☆☆", "Asakusa": "★★☆☆☆", "Tokyo Stn": "★★★☆☆" } },
      { feature: "Hotel cost feel", values: { "Shinjuku": "Wide range", "Ueno": "More budget options", "Asakusa": "Good value outside peak dates", "Tokyo Stn": "Usually higher" } },
      { feature: "Vibe", values: { "Shinjuku": "Electric", "Ueno": "Local charm", "Asakusa": "Traditional", "Tokyo Stn": "Business" } },
    ],
    proTip: "If you're taking the Shinkansen to Kyoto on Day 3+, staying in Shinjuku and transferring to Tokyo Station (10 min) is more fun than staying near Tokyo Station the whole time. You get the best nightlife and still catch your train easily.",
    hotelPicks: [
      { name: "Hotel Gracery Shinjuku", area: "Shinjuku", price: "Check latest price", link: hotelShinjuku.href, hotelKey: "shinjuku", tag: "Popular" },
      { name: "Dormy Inn Ueno Okachimachi", area: "Ueno", price: "Check latest price", link: hotelUeno.href, hotelKey: "ueno", tag: "Budget" },
      { name: "Richmond Hotel Asakusa", area: "Asakusa", price: "Check latest price", link: hotelAsakusa.href, hotelKey: "asakusa" },
      { name: "Hotel Metropolitan Tokyo", area: "Tokyo Station", price: "Check latest price", link: hotelTokyo.href, hotelKey: "tokyoStation" },
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
      areaId: "shinjuku",
      area: "Shinjuku",
      why: "If you can only pick one: Shinjuku wins on transport flexibility, dining variety, and nightlife. But Ueno beats it on budget, and Asakusa beats it on atmosphere.",
      link: hotelShinjuku.href,
    },
    areas: [
      {
        name: "Shinjuku",
        vibe: "Maximum Tokyo — neon, crowds, options",
        pros: ["Most connected station in Tokyo (12 lines)", "Golden Gai + Omoide Yokocho for nightlife", "Don Quijote, Kabukicho, department stores"],
        cons: ["Station layout is confusing", "Can feel chaotic late at night", "Rates can rise on weekends"],
        bestFor: "Nightlife & flexibility",
        transport: "JR Yamanote hub. N'EX to Narita. Odakyu to Hakone. 10 min to Tokyo Station.",
        hotelLink: hotelShinjuku.href,
        hotelKey: "shinjuku",
      },
      {
        name: "Ueno",
        vibe: "Relaxed, museum-rich, market vibes",
        pros: ["More budget options for quality hotels", "Ameyoko market for street food & shopping", "Ueno Park: museums, zoo, cherry blossoms"],
        cons: ["Smaller nightlife scene", "Fewer restaurant options late night", "Some streets feel dated"],
        bestFor: "Budget & culture",
        transport: "Skyliner to Narita 36 min. JR Yamanote + Metro access. Close to Akihabara (3 min JR).",
        hotelLink: hotelUeno.href,
        hotelKey: "ueno",
      },
      {
        name: "Asakusa",
        vibe: "Old-town Tokyo — temples, craftsmen, river walks",
        pros: ["Senso-ji Temple at your doorstep", "Sumida River evening walks", "Authentic neighborhood restaurants"],
        cons: ["No JR Yamanote — need Metro/Tobu", "Quiet after 9pm", "Farther from Shibuya/Shinjuku (30+ min)"],
        bestFor: "Culture & photo ops",
        transport: "Metro Ginza Line. Tobu Line to Nikko (direct). Water bus to Odaiba.",
        hotelLink: hotelAsakusa.href,
        hotelKey: "asakusa",
      },
    ],
    comparisonColumns: ["Shinjuku", "Ueno", "Asakusa"],
    comparison: [
      { feature: "Hotel cost feel", values: { "Shinjuku": "Wide range, weekend spikes", "Ueno": "More budget options", "Asakusa": "Good value, fewer late-night options" } },
      { feature: "Food variety", values: { "Shinjuku": "★★★★★", "Ueno": "★★★☆☆", "Asakusa": "★★★☆☆" } },
      { feature: "Narita access", values: { "Shinjuku": "N'EX 80min", "Ueno": "Skyliner 36min", "Asakusa": "45min w/ transfer" } },
      { feature: "Haneda access", values: { "Shinjuku": "Bus 40min", "Ueno": "Monorail+JR 40min", "Asakusa": "Keikyu+Metro 50min" } },
      { feature: "Walking sightseeing", values: { "Shinjuku": "Kabukicho, Gyoen", "Ueno": "Park, Ameyoko", "Asakusa": "Senso-ji, Skytree" } },
    ],
    proTip: "Staying 2–3 nights? Consider splitting: 2 nights Shinjuku (nightlife + shopping) → 1 night Asakusa (temple morning). The move takes 30 min by Metro and changes the whole trip feel.",
    hotelPicks: [
      { name: "Tokyu Stay Shinjuku Eastside", area: "Shinjuku", price: "Check latest price", link: hotelShinjuku.href, hotelKey: "shinjuku", tag: "Value" },
      { name: "Nohga Hotel Ueno Tokyo", area: "Ueno", price: "Check latest price", link: hotelUeno.href, hotelKey: "ueno", tag: "Design" },
      { name: "Gate Hotel Kaminarimon", area: "Asakusa", price: "Check latest price", link: hotelAsakusa.href, hotelKey: "asakusa", tag: "Views" },
    ],
    nextActions: [
      { id: "transfer-narita", category: "transfer", title: "Narita to your area", description: "Compare the fastest route to Shinjuku, Ueno, or Asakusa.", cta: "See transfers", href: "/airport-transfers/narita-to-shinjuku" },
      { id: "compare-asakusa-ueno", category: "stay", title: "Asakusa vs Ueno", description: "Old-town atmosphere vs rail-hub convenience.", cta: "Compare areas", href: "/areas-to-stay/asakusa-vs-ueno" },
      { id: "compare-tokyo-station-shinjuku", category: "stay", title: "Tokyo Station vs Shinjuku", description: "Shinkansen-side vs nightlife-and-transport hub.", cta: "Compare areas", href: "/areas-to-stay/tokyo-station-vs-shinjuku" },
      { id: "itinerary", category: "experience", title: "Plan your Tokyo days", description: "See a sample 7-day Japan itinerary.", cta: "View itinerary", href: "/itineraries/7-day-first-time-japan" },
      ...commonNextActions,
    ],
  },
  {
    slug: "kyoto-station-vs-gion",
    title: "Kyoto Station vs Gion: Where Should You Stay in Kyoto?",
    description: "Compare Kyoto Station and Gion for first-time Kyoto visitors. Choose the better hotel base for Shinkansen access, luggage, sightseeing, food and atmosphere.",
    quickRec: {
      area: "Kyoto Station",
      why: "First-time visitors with heavy luggage usually do better near Kyoto Station. Shinkansen access is direct, buses depart from the main terminal, and luggage storage is easy. Choose Gion if you value traditional atmosphere over convenience.",
      link: hotelKyotoStation.href,
    },
    mapId: "kyotoStationGionMap",
    areas: [
      {
        id: "kyoto-station",
        name: "Kyoto Station",
        vibe: "Transport hub — practical, efficient, central access",
        pros: ["Direct Shinkansen platform — zero transfer", "JR, Kintetsu, subway, bus terminal all in one place", "Luggage storage and coin lockers everywhere", "Best base for day trips to Nara, Osaka, Fushimi Inari"],
        cons: ["Modern and functional — not atmospheric", "Restaurant options mostly inside station malls", "Feels less like 'Kyoto' than other areas"],
        bestFor: "Shinkansen / luggage / day trips",
        transport: "Shinkansen direct. JR to Nara 45 min. Bus to Kinkaku-ji 40 min. Bus to Gion 15 min.",
        hotelLink: hotelKyotoStation.href,
        hotelKey: "kyotoStation",
      },
      {
        id: "gion",
        name: "Gion / Kawaramachi",
        vibe: "Traditional Kyoto — geisha streets, lanterns, temples",
        pros: ["Walking distance to Kiyomizu-dera, Yasaka Shrine, Philosopher's Path", "Traditional teahouses, kaiseki restaurants, evening atmosphere", "Best area for experiencing old Kyoto on foot", "Pontocho and Kawaramachi for dining variety"],
        cons: ["15 min bus or taxi to Kyoto Station", "Luggage handling more difficult — narrow streets, fewer lockers", "Usually higher rates for ryokan-style stays", "Public transport less convenient than station area"],
        bestFor: "Atmosphere / temples / evening walks",
        transport: "Bus to Kyoto Station 15 min. Walk to Kiyomizu-dera 15 min. Walk to Pontocho 5 min.",
        hotelLink: hotelGion.href,
        hotelKey: "gionKawaramachi",
      },
    ],
    comparisonColumns: ["Kyoto Station", "Gion"],
    comparison: [
      { feature: "Shinkansen access", values: { "Kyoto Station": "Direct (0 min)", "Gion": "Bus/taxi 15 min" } },
      { feature: "Temple access", values: { "Kyoto Station": "Bus 15–40 min", "Gion": "Walk 5–15 min" } },
      { feature: "Luggage ease", values: { "Kyoto Station": "★★★★★", "Gion": "★★☆☆☆" } },
      { feature: "Food & dining", values: { "Kyoto Station": "Station malls, Ramen Koji", "Gion": "Kaiseki, Pontocho, Kawaramachi" } },
      { feature: "Evening atmosphere", values: { "Kyoto Station": "Quiet after 9pm", "Gion": "Lantern streets, geisha quarter" } },
      { feature: "Kansai Airport", values: { "Kyoto Station": "Haruka 75 min direct", "Gion": "Bus + Haruka ~90 min" } },
      { feature: "Day trip base", values: { "Kyoto Station": "★★★★★ (Nara, Osaka, Fushimi)", "Gion": "★★★☆☆ (need bus to station)" } },
      { feature: "Hotel cost feel", values: { "Kyoto Station": "Practical mid-range hotels", "Gion": "Usually higher, more atmosphere" } },
    ],
    proTip: "Consider splitting your stay: one night near Kyoto Station for easy Shinkansen arrival with luggage, then move to Gion or Kawaramachi for the rest. Use luggage-forward service (¥800–2,000) between hotels so you don't have to drag bags through narrow streets.",
    hotelPicks: [
      { name: "Hotel Granvia Kyoto", area: "Kyoto Station", price: "Check latest price", link: hotelKyotoStation.href, hotelKey: "kyotoStation", tag: "Connected" },
      { name: "Daiwa Roynet Kyoto Station", area: "Kyoto Station", price: "Check latest price", link: hotelKyotoStation.href, hotelKey: "kyotoStation", tag: "Value" },
      { name: "Sowaka Gion", area: "Gion", price: "Check latest price", link: hotelGion.href, hotelKey: "gionKawaramachi", tag: "Ryokan" },
      { name: "Hotel The Celestine Gion", area: "Gion / Kawaramachi", price: "Check latest price", link: hotelGion.href, hotelKey: "gionKawaramachi" },
    ],
    nextActions: [
      { id: "kyoto-before-shinkansen", category: "stay", title: "Before an early Shinkansen from Kyoto", description: "Which station side to sleep on for a stress-free departure.", cta: "See departure bases", href: "/areas-to-stay/kyoto-before-shinkansen" },
      { id: "kyoto-first-time", category: "stay", title: "Full Kyoto stay guide", description: "Compare all three Kyoto areas including Kawaramachi.", cta: "See full guide", href: "/areas-to-stay/kyoto-first-time" },
      { id: "airport-kansai-kyoto", category: "transfer", title: "Kansai Airport → Kyoto", description: "Haruka express, bus, and transfer options.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "airport-kyoto-kansai", category: "transfer", title: "Kyoto → Kansai Airport", description: "Departure-day routes from Kyoto to KIX.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "seat", category: "train", title: "Check Fuji-side seat", description: "Find the right window seat for Mt. Fuji views.", cta: "Check seat", href: "/guide" },
      { id: "itinerary", category: "itinerary", title: "7-day Japan itinerary", description: "Place Tokyo and Kyoto in a first-time route.", cta: "View itinerary", href: "/itineraries/7-day-first-time-japan" },
      ...commonNextActions,
    ],
    faqs: [
      { question: "Is Kyoto Station a good place to stay?", answer: "Yes — Kyoto Station is one of the most practical areas for first-time visitors. You get direct Shinkansen access, easy luggage handling, and a bus terminal that connects to all major temples. It lacks traditional Kyoto atmosphere but makes logistics much simpler." },
      { question: "Is Gion better than Kyoto Station?", answer: "Gion is better for atmosphere, evening walks, and temple access on foot. Kyoto Station is better for Shinkansen connections, luggage, and day trips. First-time visitors with heavy bags usually prefer Kyoto Station; return visitors often choose Gion." },
      { question: "Where should I stay in Kyoto with luggage?", answer: "Near Kyoto Station. It has the most coin lockers, luggage forwarding services, and direct hotel access from the Shinkansen platform. Gion's narrow streets make rolling suitcases difficult." },
      { question: "Is Kyoto Station better for day trips?", answer: "Yes. JR trains to Nara (45 min), Osaka (15 min), and Fushimi Inari (5 min) all depart from Kyoto Station. The central bus terminal connects to Kinkaku-ji, Arashiyama, and other major temple areas." },
    ],
  },
  {
    slug: "kawaguchiko",
    title: "Where to stay in Kawaguchiko — best Mt. Fuji view hotels",
    description: "Lake Kawaguchiko is the closest area to see Mt. Fuji up close. Compare north shore vs south shore, ryokans with private onsen, and how to get there from Tokyo.",
    quickRec: {
      area: "North shore of Lake Kawaguchiko",
      why: "North shore gives you the iconic Fuji-over-lake view directly from your room. Most ryokans with outdoor onsen face south toward Fuji. Book early — Fuji-view rooms sell out months ahead.",
      link: hotelKawaguchiko.href,
    },
    areas: [
      {
        name: "North shore (Fuji-view side)",
        vibe: "Classic postcard view — Fuji across the lake",
        pros: ["Direct Mt. Fuji views from hotel rooms", "Most ryokans with private onsen here", "Quieter, more scenic walking paths"],
        cons: ["Fewer restaurants and konbini nearby", "Need bus/car to reach Kawaguchiko Station", "Premium pricing for Fuji-view rooms"],
        bestFor: "Fuji views & onsen",
        transport: "Retro Bus Red Line loops every 15 min. Most hotels offer station shuttle. Taxi ¥1,500–2,000.",
        hotelLink: hotelKawaguchiko.href,
        hotelKey: "kawaguchiko",
      },
      {
        name: "Kawaguchiko Station area",
        vibe: "Convenient — restaurants, shops, station access",
        pros: ["Walking distance to station + bus terminal", "More dining options", "Better value than many lakeside ryokans"],
        cons: ["No lake/Fuji view from most hotels", "More tourist-commercial feel", "Less memorable than lakeside stay"],
        bestFor: "Budget & convenience",
        transport: "Fujikyu Railway to Otsuki → JR Chuo to Shinjuku (2h total). Highway bus to Shinjuku 1h50m.",
        hotelLink: hotelKawaguchiko.href,
        hotelKey: "kawaguchiko",
      },
    ],
    comparisonColumns: ["North shore", "Station area"],
    comparison: [
      { feature: "Mt. Fuji view", values: { "North shore": "★★★★★ (direct)", "Station area": "★★☆☆☆ (partial)" } },
      { feature: "Onsen quality", values: { "North shore": "Private outdoor, Fuji-facing", "Station area": "Public bath, no view" } },
      { feature: "Access to station", values: { "North shore": "Bus/shuttle 10 min", "Station area": "Walk 5 min" } },
      { feature: "Hotel cost feel", values: { "North shore": "Premium lake-view ryokan", "Station area": "More budget options" } },
      { feature: "Dining nearby", values: { "North shore": "Limited (hotel dining)", "Station area": "Many options" } },
    ],
    proTip: "Fuji is most visible in early morning (before clouds build). Book a north-shore ryokan with an in-room or private onsen so you can soak with the Fuji view at 6am — that's the money shot.",
    hotelPicks: [
      { name: "Kozantei Ubuya", area: "Kawaguchiko", price: "Check latest price", link: hotelKawaguchiko.href, hotelKey: "kawaguchiko", tag: "Fuji view" },
      { name: "Fuji Lake Hotel", area: "Kawaguchiko", price: "Check latest price", link: hotelKawaguchiko.href, hotelKey: "kawaguchiko" },
      { name: "Hotel Mystays Fuji", area: "Kawaguchiko", price: "Check latest price", link: hotelKawaguchiko.href, hotelKey: "kawaguchiko", tag: "Budget" },
    ],
    nextActions: [
      { id: "itinerary-fuji", category: "experience", title: "Tokyo to Fuji day trip", description: "Plan a 1-day Kawaguchiko itinerary from Tokyo.", cta: "See itinerary", href: "/itineraries/tokyo-to-fuji-1day" },
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare Shinjuku, Ueno, Asakusa for your Tokyo base.", cta: "See Tokyo areas", href: "/areas-to-stay/tokyo-first-time" },
      ...commonNextActions,
    ],
  },

  // ─── New: Shinkansen-oriented stay pages ───────────────────────────────────

  {
    slug: "where-to-stay-before-shinkansen",
    title: "Where to Stay Before Taking the Shinkansen in Tokyo",
    description: "Use this before booking your Tokyo hotel if Kyoto, Osaka, or an early Shinkansen is part of your route. Compare Tokyo Station, Shinjuku, Ueno and Asakusa by departure time, luggage and station complexity.",
    quickRec: {
      area: "Tokyo Station",
      why: "The best Tokyo hotel area before a Shinkansen day depends on departure time, luggage, station complexity, and what you want to do the night before. If the Shinkansen is your priority, Tokyo Station is the simplest base.",
      link: hotelTokyo.href,
    },
    mapId: "tokyoStationMap",
    areas: [
      {
        id: "tokyo-station",
        name: "Tokyo Station",
        vibe: "Efficient — direct Shinkansen, clean logistics",
        pros: ["Direct Shinkansen platform — zero transfer", "Excellent for early-morning departures", "Marunouchi dining + Ginza nearby"],
        cons: ["Usually higher hotel rates", "Quiet after 9pm — mostly offices", "Less neighborhood character"],
        bestFor: "Early Shinkansen",
        transport: "All Shinkansen lines. Narita Express direct. JR Yamanote to anywhere.",
        hotelLink: hotelTokyo.href,
        hotelKey: "tokyoStation",
      },
      {
        id: "shinjuku",
        name: "Shinjuku",
        vibe: "Buzzing hub — nightlife, food, flexibility",
        pros: ["Best hotel selection and nightlife", "10 min JR Chuo Rapid to Tokyo Station", "Golden Gai, Omoide Yokocho, Kabukicho walking distance"],
        cons: ["Station is enormous — allow extra time", "Chuo Rapid gets packed in morning rush", "Loud area around Kabukicho"],
        bestFor: "First-time + nightlife",
        transport: "10 min to Tokyo Station. Narita Express direct. Odakyu to Hakone.",
        hotelLink: hotelShinjuku.href,
        hotelKey: "shinjuku",
      },
      {
        id: "ueno",
        name: "Ueno",
        vibe: "Calm, budget-friendly, Narita direct",
        pros: ["More budget options near central Tokyo", "Skyliner to Narita 36 min", "Some Shinkansen stop at Ueno Station"],
        cons: ["Not all Shinkansen stop here — check your train", "Quieter nightlife", "Fewer dining options late night"],
        bestFor: "Budget + Narita",
        transport: "Skyliner to Narita 36 min. JR Yamanote to Tokyo Station 7 min.",
        hotelLink: hotelUeno.href,
        hotelKey: "ueno",
      },
      {
        id: "asakusa",
        name: "Asakusa",
        vibe: "Traditional Tokyo — temples, riverside",
        pros: ["Senso-ji and Skytree walking distance", "Strong neighborhood feel", "Sumida River evening walks"],
        cons: ["20 min to Tokyo Station with transfer", "Not on JR Yamanote", "Limited late-night food"],
        bestFor: "Traditional Tokyo",
        transport: "Metro Ginza Line to Nihonbashi + JR to Tokyo Station ~20 min. Tobu Line to Nikko.",
        hotelLink: hotelAsakusa.href,
        hotelKey: "asakusa",
      },
    ],
    comparisonColumns: ["Tokyo Stn", "Shinjuku", "Ueno", "Asakusa"],
    comparison: [
      { feature: "Shinkansen access", values: { "Tokyo Stn": "Direct (0 min)", "Shinjuku": "10 min transfer", "Ueno": "Some trains stop", "Asakusa": "20 min transfer" } },
      { feature: "Luggage ease", values: { "Tokyo Stn": "★★★★★", "Shinjuku": "★★★☆☆", "Ueno": "★★★★☆", "Asakusa": "★★☆☆☆" } },
      { feature: "Narita access", values: { "Tokyo Stn": "N'EX 55 min", "Shinjuku": "N'EX 80 min", "Ueno": "Skyliner 36 min", "Asakusa": "45 min + transfer" } },
      { feature: "Nightlife", values: { "Tokyo Stn": "★★★☆☆", "Shinjuku": "★★★★★", "Ueno": "★★☆☆☆", "Asakusa": "★★☆☆☆" } },
      { feature: "Hotel cost feel", values: { "Tokyo Stn": "Usually higher", "Shinjuku": "Wide range", "Ueno": "More budget options", "Asakusa": "Good value" } },
    ],
    proTip: "If your Shinkansen leaves before 8am, stay near Tokyo Station because morning rush makes transfers less predictable. If your train is after 10am, Shinjuku gives you a better evening and the transfer is usually manageable.",
    hotelPicks: [
      { name: "Hotel Metropolitan Tokyo", area: "Tokyo Station", price: "Check latest price", link: hotelTokyo.href, hotelKey: "tokyoStation", tag: "Shinkansen" },
      { name: "Hotel Gracery Shinjuku", area: "Shinjuku", price: "Check latest price", link: hotelShinjuku.href, hotelKey: "shinjuku", tag: "Popular" },
      { name: "Dormy Inn Ueno Okachimachi", area: "Ueno", price: "Check latest price", link: hotelUeno.href, hotelKey: "ueno", tag: "Budget" },
      { name: "Richmond Hotel Asakusa", area: "Asakusa", price: "Check latest price", link: hotelAsakusa.href, hotelKey: "asakusa" },
    ],
    nextActions: [
      { id: "kyoto-osaka-departures", category: "stay", title: "Departing from Kyoto or Osaka instead?", description: "The same logic for Kyoto Station and Shin-Osaka departures.", cta: "Kyoto version", href: "/areas-to-stay/kyoto-before-shinkansen" },
      { id: "shinkansen-seat", category: "train", title: "Check Fuji-side seat", description: "Find the Mt. Fuji window seat before boarding.", cta: "Check seat", href: "/guide" },
      { id: "transfer-narita", category: "transfer", title: "Compare airport transfer", description: "Narita or Haneda to your hotel area.", cta: "See transfers", href: "/airport-transfers/narita-to-tokyo-station" },
      { id: "itinerary", category: "experience", title: "7-day Japan itinerary", description: "Place Tokyo, Fuji, Kyoto and Osaka in order.", cta: "View itinerary", href: "/itineraries/7-day-first-time-japan" },
      ...commonNextActions,
    ],
    faqs: [
      {
        question: "Should I stay near Tokyo Station before going to Kyoto or Osaka?",
        answer: "Stay near Tokyo Station if your Shinkansen is early or your luggage is heavy. If the evening before matters more, Shinjuku, Ueno, or Asakusa can still work depending on your route.",
      },
      {
        question: "Is Shinjuku a bad place to stay before the Shinkansen?",
        answer: "No. Shinjuku can work well if you want food, nightlife, and hotel choice, but Tokyo Station is simpler for early departures and heavy luggage.",
      },
      {
        question: "What is the best Tokyo area for an early Shinkansen?",
        answer: "Tokyo Station / Ginza / Nihombashi is usually the simplest area for early Shinkansen logistics.",
      },
    ],
  },
  {
    slug: "tokyo-station-vs-shinjuku",
    title: "Tokyo Station vs Shinjuku: Where Should You Stay in Tokyo?",
    description: "Compare Tokyo Station and Shinjuku for first-time Japan travelers. Choose the better hotel base for Shinkansen access, nightlife, food, airport transfers and luggage.",
    quickRec: {
      areaId: "tokyo-station",
      area: "Shinjuku",
      why: "For most first-time visitors, Shinjuku is the better all-round base. You get nightlife, food variety, and easy transfers. Tokyo Station wins only if you have very early Shinkansen departures or want zero-hassle luggage logistics.",
      link: hotelShinjuku.href,
    },
    areas: [
      {
        id: "tokyo-station",
        name: "Tokyo Station",
        vibe: "Business-efficient — Shinkansen, clean, quiet",
        pros: ["Direct Shinkansen platform — zero transfer for Kyoto/Osaka", "Excellent for early departures and late arrivals", "Marunouchi and Ginza nearby"],
        cons: ["Usually higher hotel rates", "Quiet after 9pm — mostly offices", "Less character as a neighborhood"],
        bestFor: "Shinkansen-heavy trips",
        transport: "All Shinkansen lines. Narita Express direct 55 min. JR Yamanote loop.",
        hotelLink: hotelTokyo.href,
        hotelKey: "tokyoStation",
      },
      {
        id: "shinjuku",
        name: "Shinjuku",
        vibe: "Maximum Tokyo — nightlife, shopping, food",
        pros: ["Best train connectivity in Tokyo (12 lines)", "Huge hotel selection across different budget levels", "Golden Gai, Omoide Yokocho, Kabukicho walking distance"],
        cons: ["Station is enormous — easy to get lost", "10 min transfer to Tokyo Station for Shinkansen", "Can feel overwhelming on first night"],
        bestFor: "First-timers & nightlife",
        transport: "10 min JR Chuo to Tokyo Station. Narita Express direct. Odakyu to Hakone.",
        hotelLink: hotelShinjuku.href,
        hotelKey: "shinjuku",
      },
    ],
    comparisonColumns: ["Tokyo Station", "Shinjuku"],
    comparison: [
      { feature: "Shinkansen access", values: { "Tokyo Station": "Direct (0 min)", "Shinjuku": "10 min JR Chuo transfer" } },
      { feature: "Nightlife & food", values: { "Tokyo Station": "★★★☆☆ (Marunouchi)", "Shinjuku": "★★★★★ (Golden Gai etc.)" } },
      { feature: "Narita access", values: { "Tokyo Station": "N'EX 55 min", "Shinjuku": "N'EX 80 min" } },
      { feature: "Haneda access", values: { "Tokyo Station": "Monorail + JR 30 min", "Shinjuku": "Bus 40 min" } },
      { feature: "Luggage ease", values: { "Tokyo Station": "★★★★★", "Shinjuku": "★★★☆☆" } },
      { feature: "Hotel cost feel", values: { "Tokyo Station": "Premium business hotels", "Shinjuku": "Wider range" } },
      { feature: "Vibe after 9pm", values: { "Tokyo Station": "Quiet offices", "Shinjuku": "Neon and noise" } },
    ],
    proTip: "The 10-minute Chuo Rapid from Shinjuku to Tokyo Station is the key trade-off. If that transfer feels fine, Shinjuku wins. If you'd rather walk to the Shinkansen gate, Tokyo Station wins.",
    hotelPicks: [
      { name: "Hotel Metropolitan Tokyo", area: "Tokyo Station", price: "Check latest price", link: hotelTokyo.href, hotelKey: "tokyoStation", tag: "Shinkansen" },
      { name: "Hotel Gracery Shinjuku", area: "Shinjuku", price: "Check latest price", link: hotelShinjuku.href, hotelKey: "shinjuku", tag: "Popular" },
      { name: "Tokyu Stay Shinjuku Eastside", area: "Shinjuku", price: "Check latest price", link: hotelShinjuku.href, hotelKey: "shinjuku", tag: "Value" },
    ],
    nextActions: [
      { id: "stay-tokyo", category: "stay", title: "Full Tokyo area guide", description: "Compare all four major Tokyo bases.", cta: "See all areas", href: "/areas-to-stay/tokyo-first-time" },
      { id: "compare-ueno-shinjuku", category: "stay", title: "Ueno vs Shinjuku", description: "Budget rail-hub vs nightlife-and-transport hub.", cta: "Compare areas", href: "/areas-to-stay/ueno-vs-shinjuku" },
      { id: "compare-asakusa-ueno", category: "stay", title: "Asakusa vs Ueno", description: "Old-town atmosphere vs Narita access.", cta: "Compare areas", href: "/areas-to-stay/asakusa-vs-ueno" },
      { id: "shinkansen-seat", category: "train", title: "Check Fuji-side seat", description: "Find the Mt. Fuji window seat for your route.", cta: "Check seat", href: "/guide" },
      { id: "transfer", category: "transfer", title: "Sort airport transfer", description: "Narita or Haneda to your hotel area.", cta: "Compare transfers", href: "/airport-transfers/narita-to-shinjuku" },
      ...commonNextActions,
    ],
  },
  {
    slug: "ueno-vs-shinjuku",
    title: "Ueno vs Shinjuku: Which Tokyo Area Should You Stay In?",
    description: "Compare Ueno and Shinjuku for first-time Tokyo travelers. Decide based on Narita access, hotel budget, nightlife, food, museums, luggage and train convenience.",
    quickRec: {
      areaId: "ueno",
      area: "Shinjuku",
      why: "For most first-timers, Shinjuku gives the best overall experience: nightlife, food, shopping, and flexible transport. Ueno wins on budget, Narita speed, and a calmer daytime vibe with museums and Ameyoko.",
      link: hotelShinjuku.href,
    },
    areas: [
      {
        id: "ueno",
        name: "Ueno",
        vibe: "Calm, cultural, budget-friendly",
        pros: ["More budget hotel options in central Tokyo", "Skyliner to Narita in 36 min — fastest airport link", "Ueno Park: museums, zoo, cherry blossoms", "Ameyoko market for street food and bargains"],
        cons: ["Quieter nightlife — mostly closes by 10pm", "Fewer late-night dining options", "Some streets feel dated"],
        bestFor: "Budget + Narita + museums",
        transport: "Skyliner to Narita 36 min. JR Yamanote to Shinjuku 25 min. Metro to Asakusa 5 min.",
        hotelLink: hotelUeno.href,
        hotelKey: "ueno",
      },
      {
        id: "shinjuku",
        name: "Shinjuku",
        vibe: "Electric — neon, crowds, endless options",
        pros: ["Most connected station in Tokyo (12 lines)", "Best nightlife, food and shopping in one area", "Golden Gai, Omoide Yokocho, Don Quijote, Kabukicho"],
        cons: ["Station is enormous — expect confusion at first", "Rates can rise on weekends", "Narita Express takes 80 min"],
        bestFor: "Nightlife + flexibility",
        transport: "10 min to Tokyo Station. Narita Express direct. Odakyu to Hakone.",
        hotelLink: hotelShinjuku.href,
        hotelKey: "shinjuku",
      },
    ],
    comparisonColumns: ["Ueno", "Shinjuku"],
    comparison: [
      { feature: "Narita access", values: { "Ueno": "Skyliner 36 min ★★★★★", "Shinjuku": "N'EX 80 min ★★★☆☆" } },
      { feature: "Hotel cost feel", values: { "Ueno": "More budget options", "Shinjuku": "Wider range, weekend spikes" } },
      { feature: "Nightlife", values: { "Ueno": "★★☆☆☆", "Shinjuku": "★★★★★" } },
      { feature: "Food variety", values: { "Ueno": "★★★☆☆ (Ameyoko, local)", "Shinjuku": "★★★★★ (everything)" } },
      { feature: "Shinkansen access", values: { "Ueno": "Some trains stop at Ueno", "Shinjuku": "10 min to Tokyo Station" } },
      { feature: "Daytime sightseeing", values: { "Ueno": "Museums, park, Ameyoko", "Shinjuku": "Gyoen, shopping, arcades" } },
      { feature: "Vibe", values: { "Ueno": "Local charm, relaxed", "Shinjuku": "Electric, overwhelming" } },
    ],
    proTip: "If you arrive at Narita after 9pm, Ueno is the smarter first night — the Skyliner is fast and the area is calm for a jet-lagged arrival. Switch to Shinjuku on Night 2 for nightlife.",
    hotelPicks: [
      { name: "Nohga Hotel Ueno Tokyo", area: "Ueno", price: "Check latest price", link: hotelUeno.href, hotelKey: "ueno", tag: "Design" },
      { name: "Dormy Inn Ueno Okachimachi", area: "Ueno", price: "Check latest price", link: hotelUeno.href, hotelKey: "ueno", tag: "Budget" },
      { name: "Hotel Gracery Shinjuku", area: "Shinjuku", price: "Check latest price", link: hotelShinjuku.href, hotelKey: "shinjuku", tag: "Popular" },
      { name: "Tokyu Stay Shinjuku Eastside", area: "Shinjuku", price: "Check latest price", link: hotelShinjuku.href, hotelKey: "shinjuku", tag: "Value" },
    ],
    nextActions: [
      { id: "transfer-narita", category: "transfer", title: "Narita to Ueno or Shinjuku", description: "Compare Skyliner, N'EX and bus options.", cta: "Compare transfers", href: "/airport-transfers/narita-to-ueno" },
      { id: "stay-full", category: "stay", title: "Full Tokyo area guide", description: "Add Asakusa and Tokyo Station to the comparison.", cta: "See all areas", href: "/areas-to-stay/tokyo-first-time" },
      { id: "compare-asakusa-ueno", category: "stay", title: "Asakusa vs Ueno", description: "If you're torn between the two east-side bases.", cta: "Compare areas", href: "/areas-to-stay/asakusa-vs-ueno" },
      { id: "compare-tokyo-station-shinjuku", category: "stay", title: "Tokyo Station vs Shinjuku", description: "Shinkansen-side vs west-side transport hub.", cta: "Compare areas", href: "/areas-to-stay/tokyo-station-vs-shinjuku" },
      { id: "itinerary", category: "experience", title: "7-day Japan itinerary", description: "Place Tokyo, Fuji, Kyoto and Osaka in order.", cta: "View itinerary", href: "/itineraries/7-day-first-time-japan" },
      ...commonNextActions,
    ],
  },
  {
    slug: "kyoto-first-time",
    title: "Where to Stay in Kyoto for First-Time Visitors",
    description: "Compare Kyoto Station, Gion, Kawaramachi and quieter Kyoto areas for first-time visitors. Choose the best hotel base for Shinkansen access, sightseeing, food and luggage.",
    quickRec: {
      area: "Kyoto Station area",
      why: "For first-time visitors arriving by Shinkansen, Kyoto Station is the safest bet. Direct platform access, every bus line departs from here, and luggage handling is simple. Gion/Kawaramachi is better for atmosphere but harder with big bags.",
      link: hotelKyotoStation.href,
    },
    areas: [
      {
        id: "kyoto-station",
        name: "Kyoto Station",
        vibe: "Transit hub — practical, modern, efficient",
        pros: ["Shinkansen platform — zero transfer from Tokyo", "All major bus lines depart from station", "Coin lockers and luggage storage everywhere"],
        cons: ["Feels like a transit hub, not old Kyoto", "Walking to temples takes 20+ min", "Hotels can feel generic"],
        bestFor: "First-time + easy transport",
        transport: "Shinkansen direct. Bus 100/101/206 to all temples. JR Nara Line to Nara 45 min.",
        hotelLink: hotelKyotoStation.href,
        hotelKey: "kyotoStation",
      },
      {
        id: "gion",
        name: "Gion / Kawaramachi",
        vibe: "Traditional Kyoto — geisha district, lantern-lit streets",
        pros: ["Walking distance to Kiyomizu-dera, Yasaka Shrine", "Best atmosphere for photos and evening walks", "Nishiki Market and Pontocho for food"],
        cons: ["15 min bus/taxi to Kyoto Station", "Narrow streets — luggage is difficult", "Usually higher rates, especially ryokan"],
        bestFor: "Traditional atmosphere",
        transport: "Bus 206 to Kyoto Station 15 min. Walk to Higashiyama temples. Keihan Line to Osaka.",
        hotelLink: hotelGion.href,
        hotelKey: "gionKawaramachi",
      },
      {
        id: "kawaramachi",
        name: "Kawaramachi / Shijo",
        vibe: "Central Kyoto — food, shopping, nightlife",
        pros: ["Nishiki Market, Pontocho, department stores", "Best late-night dining in Kyoto", "Hankyu Line direct to Osaka/Umeda"],
        cons: ["Crowded on weekends and holidays", "Not as atmospheric as Gion", "15 min to Kyoto Station"],
        bestFor: "Food / shopping / nightlife",
        transport: "Hankyu to Osaka Umeda 45 min. Bus to Kyoto Station 15 min. Walk to Gion 10 min.",
        hotelLink: hotelGion.href,
        hotelKey: "gionKawaramachi",
      },
    ],
    comparisonColumns: ["Kyoto Station", "Gion", "Kawaramachi"],
    comparison: [
      { feature: "Shinkansen access", values: { "Kyoto Station": "Direct (0 min)", "Gion": "Bus/taxi 15 min", "Kawaramachi": "Bus 15 min" } },
      { feature: "Temple access", values: { "Kyoto Station": "Bus 15–25 min", "Gion": "Walk 5–15 min", "Kawaramachi": "Walk/bus 10–20 min" } },
      { feature: "Luggage ease", values: { "Kyoto Station": "★★★★★", "Gion": "★★☆☆☆", "Kawaramachi": "★★★☆☆" } },
      { feature: "Food & dining", values: { "Kyoto Station": "★★★☆☆ (station)", "Gion": "★★★★☆ (traditional)", "Kawaramachi": "★★★★★ (variety)" } },
      { feature: "Evening vibe", values: { "Kyoto Station": "Mall dining, quiet", "Gion": "Lantern streets, serene", "Kawaramachi": "Pontocho, lively" } },
      { feature: "Hotel cost feel", values: { "Kyoto Station": "Practical mid-range", "Gion": "Usually higher", "Kawaramachi": "Wider range" } },
    ],
    proTip: "Arriving by Shinkansen with luggage? Stay near Kyoto Station for the first night. Use luggage-forward service (¥800–2,000) to send bags to your next hotel — then switch to Gion or Kawaramachi luggage-free.",
    hotelPicks: [
      { name: "Hotel Granvia Kyoto", area: "Kyoto Station", price: "Check latest price", link: hotelKyotoStation.href, hotelKey: "kyotoStation", tag: "Connected" },
      { name: "Daiwa Roynet Kyoto Station", area: "Kyoto Station", price: "Check latest price", link: hotelKyotoStation.href, hotelKey: "kyotoStation", tag: "Value" },
      { name: "Sowaka Gion", area: "Gion", price: "Check latest price", link: hotelGion.href, hotelKey: "gionKawaramachi", tag: "Ryokan" },
      { name: "Hotel The Celestine Gion", area: "Gion / Kawaramachi", price: "Check latest price", link: hotelGion.href, hotelKey: "gionKawaramachi" },
    ],
    nextActions: [
      { id: "shinkansen-seat", category: "train", title: "Check Fuji-side seat", description: "Tokyo → Kyoto: Seat E for Mt. Fuji views.", cta: "Check seat", href: "/guide" },
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Sort your Tokyo base before heading to Kyoto.", cta: "See Tokyo areas", href: "/areas-to-stay/tokyo-first-time" },
      { id: "airport-kansai-kyoto", category: "transfer", title: "Kansai Airport → Kyoto", description: "Haruka express, bus, and private transfer options.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "itinerary", category: "experience", title: "7-day Japan itinerary", description: "Place Tokyo and Kyoto in a first-time route.", cta: "View itinerary", href: "/itineraries/7-day-first-time-japan" },
      ...commonNextActions,
    ],
  },
  {
    slug: "osaka-first-time",
    title: "Where to Stay in Osaka for First-Time Visitors",
    description: "Compare Namba, Umeda and Shin-Osaka for first-time Osaka visitors. Choose the best hotel base for food, nightlife, Shinkansen access, USJ and airport transfers.",
    quickRec: {
      area: "Namba",
      why: "Namba puts you at the heart of Osaka's food and nightlife scene — Dotonbori, Shinsekai, and Kuromon Market are all walking distance. For Shinkansen-first logistics, Shin-Osaka is more practical but less fun.",
      link: hotelNamba.href,
    },
    areas: [
      {
        id: "namba",
        name: "Namba",
        vibe: "Osaka's soul — street food, neon, nightlife",
        pros: ["Dotonbori, Shinsekai, Kuromon Market walking distance", "Best street food concentration in Japan", "Nankai Line direct to Kansai Airport"],
        cons: ["Loud and crowded, especially weekends", "30 min to Shin-Osaka for Shinkansen", "Can feel chaotic for first-night arrivals"],
        bestFor: "Food / nightlife",
        transport: "Nankai to Kansai Airport 40 min. Metro Midosuji to Shin-Osaka 20 min. Metro to Umeda 10 min.",
        hotelLink: hotelNamba.href,
        hotelKey: "namba",
      },
      {
        id: "umeda",
        name: "Umeda / Osaka Station",
        vibe: "Business district — shopping, transport, modern",
        pros: ["Osaka Station + Umeda — massive rail hub", "Department stores, Grand Front Osaka", "JR direct to Shin-Osaka 4 min", "Hankyu Line direct to Kyoto 45 min"],
        cons: ["Less street-food character than Namba", "Business-district feel after 9pm", "Further from Dotonbori (15 min Metro)"],
        bestFor: "Shopping / transport hub",
        transport: "JR to Shin-Osaka 4 min. Hankyu to Kyoto Kawaramachi 45 min. JR to Kansai Airport 70 min.",
        hotelLink: hotelUmeda.href,
        hotelKey: "umeda",
      },
      {
        id: "shin-osaka",
        name: "Shin-Osaka",
        vibe: "Shinkansen hub — practical, efficient",
        pros: ["Direct Shinkansen platform — zero transfer", "Good for early departure or late arrival by Shinkansen", "Midosuji Metro to Namba 20 min"],
        cons: ["Not much to do in the immediate area", "Business hotels dominate — few boutique options", "No nightlife or sightseeing walking distance"],
        bestFor: "Early Shinkansen",
        transport: "All Shinkansen lines. Midosuji Metro to Namba 20 min, Umeda 7 min.",
        hotelLink: hotelShinOsaka.href,
        hotelKey: "shinOsaka",
      },
    ],
    comparisonColumns: ["Namba", "Umeda", "Shin-Osaka"],
    comparison: [
      { feature: "Food & street food", values: { "Namba": "★★★★★", "Umeda": "★★★☆☆", "Shin-Osaka": "★★☆☆☆" } },
      { feature: "Nightlife", values: { "Namba": "★★★★★", "Umeda": "★★★☆☆", "Shin-Osaka": "★☆☆☆☆" } },
      { feature: "Shinkansen access", values: { "Namba": "Metro 20 min", "Umeda": "JR 4 min", "Shin-Osaka": "Direct (0 min)" } },
      { feature: "Kansai Airport", values: { "Namba": "Nankai 40 min", "Umeda": "JR 70 min / bus 60 min", "Shin-Osaka": "Haruka 50 min" } },
      { feature: "Kyoto access", values: { "Namba": "Midosuji + Shinkansen 50 min", "Umeda": "Hankyu 45 min", "Shin-Osaka": "Shinkansen 15 min" } },
      { feature: "Hotel cost feel", values: { "Namba": "Good value outside peak dates", "Umeda": "Usually higher", "Shin-Osaka": "Business-hotel value" } },
      { feature: "USJ access", values: { "Namba": "Metro + JR 40 min", "Umeda": "JR direct 15 min", "Shin-Osaka": "JR 25 min" } },
    ],
    proTip: "If you're doing Osaka → Kyoto day trips, Umeda is the sweet spot: 4 min to Shin-Osaka for Shinkansen, or 45 min Hankyu direct to Kawaramachi. You skip the Namba-to-Shin-Osaka transfer hassle.",
    hotelPicks: [
      { name: "Cross Hotel Osaka", area: "Namba", price: "Check latest price", link: hotelNamba.href, hotelKey: "namba", tag: "Location" },
      { name: "Hotel Granvia Osaka", area: "Umeda", price: "Check latest price", link: hotelUmeda.href, hotelKey: "umeda", tag: "Transport" },
      { name: "Remm Shin-Osaka", area: "Shin-Osaka", price: "Check latest price", link: hotelShinOsaka.href, hotelKey: "shinOsaka", tag: "Shinkansen" },
    ],
    nextActions: [
      { id: "shinkansen-seat", category: "train", title: "Check Fuji-side seat", description: "Find the Mt. Fuji window seat for Tokyo → Osaka.", cta: "Check seat", href: "/guide" },
      { id: "stay-kyoto", category: "stay", title: "Where to stay in Kyoto", description: "Compare Kyoto Station vs Gion for your Kyoto nights.", cta: "See Kyoto areas", href: "/areas-to-stay/kyoto-first-time" },
      { id: "airport-kansai-namba", category: "transfer", title: "Kansai Airport → Namba", description: "Nankai Rapi:t, bus, and transfer options to Namba.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "airport-kansai-umeda", category: "transfer", title: "Kansai Airport → Umeda", description: "JR, bus, and transfer options to Umeda / Osaka Station.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "airport-osaka-kansai", category: "transfer", title: "Osaka → Kansai Airport", description: "Departure-day routes from Osaka to KIX.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "itinerary", category: "experience", title: "7-day Japan itinerary", description: "Place Osaka in a first-time Japan route.", cta: "View itinerary", href: "/itineraries/7-day-first-time-japan" },
      ...commonNextActions,
    ],
  },
  {
    slug: "namba-vs-umeda",
    title: "Namba vs Umeda: Where Should You Stay in Osaka?",
    description: "Compare Namba and Umeda for first-time Osaka visitors. Choose the better hotel base for food, nightlife, shopping, transport, Kyoto day trips and Kansai Airport access.",
    quickRec: {
      area: "Namba",
      why: "First-time visitors who want the classic Osaka experience should stay near Namba. Dotonbori, Shinsekai, and Kuromon Market are walking distance. Nankai Line runs direct to Kansai Airport. Umeda is better for shopping, business hotels, and easier Kyoto access.",
      link: hotelNamba.href,
    },
    mapId: "osakaNambaUmedaMap",
    areas: [
      {
        id: "namba",
        name: "Namba",
        vibe: "Osaka's soul — street food, neon, nightlife",
        pros: ["Dotonbori, Shinsekai, Kuromon Market walking distance", "Best street food concentration in Japan", "Nankai Line direct to Kansai Airport (40 min)", "Strongest first-time Osaka atmosphere"],
        cons: ["Loud and crowded, especially weekends", "30 min to Shin-Osaka for Shinkansen", "Can feel chaotic for first-night arrivals"],
        bestFor: "Food / nightlife / first-time Osaka",
        transport: "Nankai to KIX 40 min. Metro to Shin-Osaka 20 min. Metro to Umeda 10 min.",
        hotelLink: hotelNamba.href,
        hotelKey: "namba",
      },
      {
        id: "umeda",
        name: "Umeda / Osaka Station",
        vibe: "Business district — shopping, transport, modern",
        pros: ["Osaka Station + Umeda — massive rail hub", "JR direct to Shin-Osaka in 4 min", "Hankyu Line direct to Kyoto Kawaramachi (45 min)", "Department stores, Grand Front Osaka"],
        cons: ["Less street-food character than Namba", "Business-district feel after 9pm", "Kansai Airport access less direct (70 min by JR)"],
        bestFor: "Shopping / transport / Kyoto day trips",
        transport: "JR to Shin-Osaka 4 min. Hankyu to Kyoto 45 min. JR to KIX 70 min.",
        hotelLink: hotelUmeda.href,
        hotelKey: "umeda",
      },
    ],
    comparisonColumns: ["Namba", "Umeda"],
    comparison: [
      { feature: "Food & street food", values: { "Namba": "★★★★★ (Dotonbori, Shinsekai)", "Umeda": "★★★☆☆ (department store dining)" } },
      { feature: "Nightlife", values: { "Namba": "★★★★★", "Umeda": "★★★☆☆" } },
      { feature: "Shopping", values: { "Namba": "★★★★☆ (Shinsaibashi)", "Umeda": "★★★★★ (Grand Front, Lucua)" } },
      { feature: "Shinkansen access", values: { "Namba": "Metro 20 min to Shin-Osaka", "Umeda": "JR 4 min to Shin-Osaka" } },
      { feature: "Kansai Airport", values: { "Namba": "Nankai 40 min direct", "Umeda": "JR 70 min / bus 60 min" } },
      { feature: "Kyoto access", values: { "Namba": "Metro + Shinkansen ~50 min", "Umeda": "Hankyu direct 45 min" } },
      { feature: "Luggage ease", values: { "Namba": "★★★☆☆", "Umeda": "★★★★☆" } },
      { feature: "Hotel cost feel", values: { "Namba": "Good value outside peak dates", "Umeda": "Usually higher" } },
    ],
    proTip: "If you're doing Osaka → Kyoto day trips, Umeda is the sweet spot: JR to Shin-Osaka in 4 min for Shinkansen, or Hankyu direct to Kawaramachi in 45 min. You skip the Namba-to-Shin-Osaka Metro transfer.",
    hotelPicks: [
      { name: "Cross Hotel Osaka", area: "Namba", price: "Check latest price", link: hotelNamba.href, hotelKey: "namba", tag: "Location" },
      { name: "Hotel Monterey Grasmere", area: "Namba", price: "Check latest price", link: hotelNamba.href, hotelKey: "namba", tag: "Value" },
      { name: "Hotel Granvia Osaka", area: "Umeda", price: "Check latest price", link: hotelUmeda.href, hotelKey: "umeda", tag: "Transport" },
      { name: "Hotel Hankyu International", area: "Umeda", price: "Check latest price", link: hotelUmeda.href, hotelKey: "umeda" },
    ],
    nextActions: [
      { id: "osaka-first-time", category: "stay", title: "Full Osaka stay guide", description: "Compare Namba, Umeda, and Shin-Osaka.", cta: "See full guide", href: "/areas-to-stay/osaka-first-time" },
      { id: "airport-kansai-namba", category: "transfer", title: "Kansai Airport → Namba", description: "Nankai Rapi:t, bus, and transfer options.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "airport-kansai-umeda", category: "transfer", title: "Kansai Airport → Umeda", description: "JR, bus, and transfer options to Umeda.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "airport-osaka-kansai", category: "transfer", title: "Osaka → Kansai Airport", description: "Departure-day routes from Osaka to KIX.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "seat", category: "train", title: "Check Fuji-side seat", description: "Find the right window seat for Mt. Fuji views.", cta: "Check seat", href: "/guide" },
      ...commonNextActions,
    ],
    faqs: [
      { question: "Is Namba or Umeda better for first-time Osaka?", answer: "Namba is usually better for first-time visitors who want the classic Osaka experience — Dotonbori street food, neon lights, and walkable nightlife. Umeda suits travelers who prioritize transport convenience, shopping, and Kyoto day trips." },
      { question: "Which is better for nightlife, Namba or Umeda?", answer: "Namba. Dotonbori, Amerikamura, and Shinsekai are all within walking distance. Umeda has bars and restaurants but the atmosphere quiets down by 9–10pm." },
      { question: "Which area is easier from Kansai Airport?", answer: "Namba — the Nankai Rapi:t runs directly from KIX to Namba in about 40 minutes. Umeda requires either a JR ride (70 min) or an airport bus (60 min)." },
      { question: "Should I stay in Namba if visiting Dotonbori?", answer: "Yes. Dotonbori is in the Namba area, so staying there means you can walk to the canal at any time. From Umeda, it's about 15 minutes by Metro." },
    ],
  },
  {
    slug: "shin-osaka-vs-namba",
    title: "Shin-Osaka vs Namba: Where Should You Stay in Osaka?",
    description: "Compare Shin-Osaka and Namba for Osaka hotels. Choose the better base for Shinkansen access, nightlife, food, luggage, early trains and first-time Osaka trips.",
    quickRec: {
      area: "Namba",
      why: "For first-time sightseeing, Namba is usually more memorable — Dotonbori, street food, and nightlife are walking distance. Choose Shin-Osaka only if you have an early Shinkansen, heavy luggage, or a short overnight stop between rail legs.",
      link: hotelNamba.href,
    },
    mapId: "shinOsakaNambaMap",
    areas: [
      {
        id: "shin-osaka",
        name: "Shin-Osaka",
        vibe: "Shinkansen hub — practical, efficient",
        pros: ["Direct Shinkansen platform — zero transfer", "Best for early departure or late arrival by Shinkansen", "Midosuji Metro to Namba in 20 min", "Simple luggage handling on arrival day"],
        cons: ["Not much to do in the immediate area", "Business hotels dominate — few boutique options", "No nightlife or sightseeing walking distance"],
        bestFor: "Early Shinkansen / luggage / overnight stop",
        transport: "Shinkansen direct. Midosuji Metro to Namba 20 min, Umeda 7 min.",
        hotelLink: hotelShinOsaka.href,
        hotelKey: "shinOsaka",
      },
      {
        id: "namba",
        name: "Namba",
        vibe: "Osaka's soul — street food, neon, nightlife",
        pros: ["Dotonbori, Shinsekai, Kuromon Market walking distance", "Best street food concentration in Japan", "Nankai Line direct to Kansai Airport (40 min)", "Strongest first-time Osaka atmosphere"],
        cons: ["30 min Metro to Shin-Osaka for Shinkansen", "Loud and crowded, especially weekends", "Can feel chaotic for first-night arrivals"],
        bestFor: "Food / nightlife / first-time Osaka",
        transport: "Nankai to KIX 40 min. Metro to Shin-Osaka 20 min. Metro to Umeda 10 min.",
        hotelLink: hotelNamba.href,
        hotelKey: "namba",
      },
    ],
    comparisonColumns: ["Shin-Osaka", "Namba"],
    comparison: [
      { feature: "Shinkansen access", values: { "Shin-Osaka": "Direct (0 min)", "Namba": "Metro 20 min" } },
      { feature: "Food & street food", values: { "Shin-Osaka": "★★☆☆☆", "Namba": "★★★★★" } },
      { feature: "Nightlife", values: { "Shin-Osaka": "★☆☆☆☆", "Namba": "★★★★★" } },
      { feature: "Luggage ease", values: { "Shin-Osaka": "★★★★★", "Namba": "★★★☆☆" } },
      { feature: "Kansai Airport", values: { "Shin-Osaka": "Haruka 50 min", "Namba": "Nankai 40 min" } },
      { feature: "Kyoto access", values: { "Shin-Osaka": "Shinkansen 15 min", "Namba": "Metro + Shinkansen ~50 min" } },
      { feature: "First-time atmosphere", values: { "Shin-Osaka": "★★☆☆☆", "Namba": "★★★★★" } },
      { feature: "Hotel cost feel", values: { "Shin-Osaka": "Business-hotel value", "Namba": "Wider range" } },
    ],
    proTip: "If you arrive late by Shinkansen or leave early the next morning, Shin-Osaka saves time and stress. For everything else — food, nightlife, sightseeing — Namba is where the Osaka experience happens. The 20-minute Metro ride between them is easy either way.",
    hotelPicks: [
      { name: "Remm Shin-Osaka", area: "Shin-Osaka", price: "Check latest price", link: hotelShinOsaka.href, hotelKey: "shinOsaka", tag: "Shinkansen" },
      { name: "Courtyard by Marriott Shin-Osaka", area: "Shin-Osaka", price: "Check latest price", link: hotelShinOsaka.href, hotelKey: "shinOsaka", tag: "Business" },
      { name: "Cross Hotel Osaka", area: "Namba", price: "Check latest price", link: hotelNamba.href, hotelKey: "namba", tag: "Location" },
      { name: "Hotel Monterey Grasmere", area: "Namba", price: "Check latest price", link: hotelNamba.href, hotelKey: "namba", tag: "Value" },
    ],
    nextActions: [
      { id: "osaka-before-shinkansen", category: "stay", title: "Before an early Shinkansen from Osaka", description: "Shin-Osaka vs Umeda vs Namba for departure morning.", cta: "See departure bases", href: "/areas-to-stay/osaka-before-shinkansen" },
      { id: "osaka-first-time", category: "stay", title: "Full Osaka stay guide", description: "Compare Namba, Umeda, and Shin-Osaka.", cta: "See full guide", href: "/areas-to-stay/osaka-first-time" },
      { id: "namba-vs-umeda", category: "stay", title: "Namba vs Umeda", description: "Compare the two main sightseeing bases in Osaka.", cta: "Compare", href: "/areas-to-stay/namba-vs-umeda" },
      { id: "airport-osaka-kansai", category: "transfer", title: "Osaka → Kansai Airport", description: "Departure-day routes from Osaka to KIX.", cta: "See routes", href: "/airport-transfers#kansai-airport-routes" },
      { id: "seat", category: "train", title: "Check Fuji-side seat", description: "Find the right window seat for Mt. Fuji views.", cta: "Check seat", href: "/guide" },
      { id: "itinerary", category: "itinerary", title: "No-JR-Pass itinerary", description: "Tokyo → Kyoto → Osaka without a JR Pass.", cta: "View itinerary", href: "/itineraries/tokyo-kyoto-osaka-without-jr-pass" },
      ...commonNextActions,
    ],
    faqs: [
      { question: "Is Shin-Osaka a good place to stay?", answer: "Shin-Osaka is practical for early Shinkansen departures and late arrivals, but the area itself has limited sightseeing, food, and nightlife. It works well as a one-night stopover between rail legs, but most visitors prefer Namba or Umeda for longer stays." },
      { question: "Is Namba better than Shin-Osaka for first-time visitors?", answer: "Yes — Namba puts you in the heart of Osaka's food and nightlife scene. Dotonbori, Shinsekai, and Kuromon Market are all walking distance. Shin-Osaka is better only if your schedule revolves around the Shinkansen." },
      { question: "Should I stay near Shin-Osaka for the Shinkansen?", answer: "Only if you have an early morning departure or arrive late at night. The Midosuji Metro from Namba to Shin-Osaka takes 20 minutes, which is easy enough for most schedules." },
      { question: "Is Namba convenient for Kansai Airport?", answer: "Yes — the Nankai Rapi:t runs directly from Namba to Kansai Airport in about 40 minutes. It's actually faster than getting to KIX from Shin-Osaka (Haruka, 50 min)." },
    ],
  },
  {
    slug: "tokyo-station-hotels-before-shinkansen",
    title: "Best Area to Stay Before Taking the Shinkansen from Tokyo",
    description: "Should you stay near Tokyo Station before taking the Shinkansen to Kyoto or Osaka? Compare Tokyo Station, Shinjuku, Ueno and Asakusa for early trains and luggage.",
    quickRec: {
      area: "Tokyo Station",
      why: "If you have an early Shinkansen or heavy luggage, staying near Tokyo Station removes all morning transfer stress. Walk to the platform in minutes. For everything else — nightlife, atmosphere, budget — Shinjuku, Ueno, or Asakusa may suit you better.",
      link: hotelTokyo.href,
    },
    areas: [
      {
        id: "tokyo-station",
        name: "Tokyo Station",
        vibe: "Business district — direct Shinkansen, efficient",
        pros: ["Walk to Shinkansen platform in minutes", "Luggage storage and coin lockers everywhere", "Marunouchi and Nihonbashi dining nearby", "Best base for early morning departures"],
        cons: ["Business district — quiets down after 8pm", "Usually higher hotel rates around the station", "Less character than Shinjuku or Asakusa"],
        bestFor: "Early Shinkansen / heavy luggage",
        transport: "Shinkansen direct. JR to Shinjuku 15 min. JR to Ueno 7 min. Metro to Asakusa 15 min.",
        hotelLink: hotelTokyo.href,
        hotelKey: "tokyoStation",
      },
      {
        id: "shinjuku",
        name: "Shinjuku",
        vibe: "Lively hub — nightlife, shopping, transport",
        pros: ["Best nightlife and restaurant variety in Tokyo", "JR Chuo Line to Tokyo Station in 15 min", "Golden Gai, Kabukicho, Omoide Yokocho", "Major rail hub with access everywhere"],
        cons: ["15 min transfer to Tokyo Station with luggage", "Station layout is confusing for first-timers", "Loud and crowded around the station"],
        bestFor: "Nightlife / shopping / energy",
        transport: "JR to Tokyo Station 15 min. JR to Shibuya 5 min. Odakyu to Hakone 90 min.",
        hotelLink: hotelShinjuku.href,
        hotelKey: "shinjuku",
      },
      {
        id: "ueno",
        name: "Ueno",
        vibe: "Cultural hub — museums, park, budget-friendly",
        pros: ["Keisei Skyliner direct from Narita (36 min)", "Budget hotels and hostels", "Ueno Park, Ameyoko market, museums", "JR to Tokyo Station in 7 min"],
        cons: ["Less nightlife than Shinjuku", "Area can feel dated", "Not as scenic as Asakusa"],
        bestFor: "Narita access / budget / museums",
        transport: "Skyliner to Narita 36 min. JR to Tokyo Station 7 min. Metro to Asakusa 5 min.",
        hotelLink: hotelUeno.href,
        hotelKey: "ueno",
      },
      {
        id: "asakusa",
        name: "Asakusa",
        vibe: "Traditional Tokyo — temples, Skytree, calm",
        pros: ["Senso-ji, Nakamise-dori, Tokyo Skytree nearby", "Traditional Tokyo atmosphere", "Tobu line access to Nikko", "Calmer evenings than Shinjuku"],
        cons: ["25 min to Tokyo Station (Metro + JR)", "Fewer late-night dining options", "Luggage transfer more complex on Shinkansen day"],
        bestFor: "Atmosphere / temples / calm evenings",
        transport: "Metro to Ueno 5 min. Metro + JR to Tokyo Station 25 min. Tobu to Nikko 2h.",
        hotelLink: hotelAsakusa.href,
        hotelKey: "asakusa",
      },
    ],
    comparisonColumns: ["Tokyo Station", "Shinjuku", "Ueno", "Asakusa"],
    comparison: [
      { feature: "Shinkansen access", values: { "Tokyo Station": "Direct (0 min)", "Shinjuku": "JR 15 min", "Ueno": "JR 7 min", "Asakusa": "Metro + JR 25 min" } },
      { feature: "Narita Airport", values: { "Tokyo Station": "N'EX 60 min", "Shinjuku": "N'EX 80 min", "Ueno": "Skyliner 36 min", "Asakusa": "Access Express 55 min" } },
      { feature: "Haneda Airport", values: { "Tokyo Station": "Monorail + JR 30 min", "Shinjuku": "Bus 45 min", "Ueno": "Keikyu + JR 40 min", "Asakusa": "Keikyu + Metro 45 min" } },
      { feature: "Luggage ease", values: { "Tokyo Station": "★★★★★", "Shinjuku": "★★★☆☆", "Ueno": "★★★★☆", "Asakusa": "★★☆☆☆" } },
      { feature: "Nightlife", values: { "Tokyo Station": "★★☆☆☆", "Shinjuku": "★★★★★", "Ueno": "★★★☆☆", "Asakusa": "★★☆☆☆" } },
      { feature: "Food variety", values: { "Tokyo Station": "★★★★☆ (Ramen Street)", "Shinjuku": "★★★★★", "Ueno": "★★★★☆ (Ameyoko)", "Asakusa": "★★★☆☆ (traditional)" } },
      { feature: "Hotel cost feel", values: { "Tokyo Station": "Premium business hotels", "Shinjuku": "Wide range", "Ueno": "More budget options", "Asakusa": "Good value" } },
    ],
    proTip: "If your Shinkansen leaves before 8am, stay near Tokyo Station or Ueno — both are under 10 minutes from the platform. If your train is after 10am, any of these areas works fine. The 15-minute ride from Shinjuku is easy at that hour.",
    hotelPicks: [
      { name: "Hotel Metropolitan Tokyo Marunouchi", area: "Tokyo Station", price: "Check latest price", link: hotelTokyo.href, hotelKey: "tokyoStation", tag: "Connected" },
      { name: "Hotel Ryumeikan Tokyo", area: "Tokyo Station", price: "Check latest price", link: hotelTokyo.href, hotelKey: "tokyoStation", tag: "Value" },
      { name: "Hotel Gracery Shinjuku", area: "Shinjuku", price: "Check latest price", link: hotelShinjuku.href, hotelKey: "shinjuku", tag: "Nightlife" },
      { name: "Nohga Hotel Ueno Tokyo", area: "Ueno", price: "Check latest price", link: hotelUeno.href, hotelKey: "ueno", tag: "Budget" },
    ],
    nextActions: [
      { id: "tokyo-first-time", category: "stay", title: "Full Tokyo stay guide", description: "Compare Shinjuku, Ueno, Asakusa, and Tokyo Station.", cta: "See full guide", href: "/areas-to-stay/tokyo-first-time" },
      { id: "seat", category: "train", title: "Check Fuji-side seat", description: "Tokyo → Kyoto: find the right window seat for Mt. Fuji.", cta: "Check seat", href: "/tokyo-to-kyoto-mt-fuji-seat" },
      { id: "ticket", category: "train", title: "Shinkansen ticket guide", description: "How to book Tokyo → Kyoto Shinkansen tickets.", cta: "Read guide", href: "/tokyo-to-kyoto-shinkansen-ticket" },
      { id: "itinerary", category: "itinerary", title: "7-day Japan itinerary", description: "Place your Shinkansen day in a full Japan route.", cta: "View itinerary", href: "/itineraries/7-day-first-time-japan" },
      ...commonNextActions,
    ],
    faqs: [
      { question: "Should I stay near Tokyo Station before the Shinkansen?", answer: "If you have an early departure (before 8am) or heavy luggage, yes. You can walk to the Shinkansen platform in minutes. For later departures, Shinjuku or Ueno work fine — the transfer takes 7–15 minutes." },
      { question: "Is Shinjuku too far from Tokyo Station for the Shinkansen?", answer: "No — JR Chuo Line runs from Shinjuku to Tokyo Station in 15 minutes. It's only inconvenient if you have very early morning trains or heavy bags to manage during rush hour." },
      { question: "Which area has more budget options near Tokyo Station?", answer: "Ueno has the most budget options. It's just 7 minutes from Tokyo Station by JR and also has direct Narita Skyliner access. Tokyo Station itself is usually a premium business-hotel area." },
      { question: "Can I store luggage at Tokyo Station?", answer: "Yes — Tokyo Station has extensive coin lockers and a staffed luggage storage service. You can also use luggage forwarding (takkyubin) to send bags to your next hotel for ¥1,500–2,500." },
    ],
  },
  {
    slug: "asakusa-vs-ueno",
    title: "Asakusa vs Ueno: Where Should You Stay in Tokyo?",
    description: "Asakusa or Ueno for your Tokyo hotel? Ueno wins on Narita access (Skyliner 36 min), budget hotels, and a 7-min hop to Tokyo Station; Asakusa wins on old-town atmosphere and Senso-ji. Side-by-side compare with hotel picks for first-time visitors.",
    quickRec: {
      areaId: "ueno",
      area: "Ueno",
      why: "Ueno is more practical: direct Skyliner from Narita, JR to Tokyo Station in 7 min, budget hotels, and Ameyoko market. Asakusa is more atmospheric but slightly less convenient for rail connections. Both areas are only 5 minutes apart by Metro.",
      link: hotelUeno.href,
    },
    mapId: "eastTokyoMap",
    areas: [
      {
        id: "asakusa",
        name: "Asakusa",
        vibe: "Traditional Tokyo — temples, Skytree, calm evenings",
        pros: ["Senso-ji temple and Nakamise-dori shopping street", "Tokyo Skytree walking distance", "Traditional atmosphere — rickshaws, old-town feel", "Access Express to Narita (55 min, no transfer)"],
        cons: ["25 min to Tokyo Station for Shinkansen", "Fewer late-night dining and bar options", "Slightly more complex luggage routing on rail days"],
        bestFor: "Atmosphere / temples / Skytree / calm",
        transport: "Metro to Ueno 5 min. Access Express to Narita 55 min. Metro + JR to Tokyo Station 25 min.",
        hotelLink: hotelAsakusa.href,
        hotelKey: "asakusa",
      },
      {
        id: "ueno",
        name: "Ueno",
        vibe: "Cultural hub — museums, park, budget-friendly",
        pros: ["Keisei Skyliner direct from Narita (36 min)", "JR to Tokyo Station in 7 min — Shinkansen-ready", "Budget hotels and hostels", "Ueno Park, Ameyoko market, national museums"],
        cons: ["Less atmospheric than Asakusa", "Area around the station can feel dated", "Nightlife is limited compared to Shinjuku or Shibuya"],
        bestFor: "Narita access / budget / museums / rail hub",
        transport: "Skyliner to Narita 36 min. JR to Tokyo Station 7 min. Metro to Asakusa 5 min.",
        hotelLink: hotelUeno.href,
        hotelKey: "ueno",
      },
    ],
    comparisonColumns: ["Asakusa", "Ueno"],
    comparison: [
      { feature: "Narita Airport", values: { "Asakusa": "Access Express 55 min", "Ueno": "Skyliner 36 min" } },
      { feature: "Tokyo Station (Shinkansen)", values: { "Asakusa": "Metro + JR 25 min", "Ueno": "JR 7 min" } },
      { feature: "Atmosphere", values: { "Asakusa": "★★★★★ (old-town temples)", "Ueno": "★★★☆☆ (park and markets)" } },
      { feature: "Food & dining", values: { "Asakusa": "★★★☆☆ (traditional, tempura)", "Ueno": "★★★★☆ (Ameyoko, izakaya)" } },
      { feature: "Museums", values: { "Asakusa": "★★☆☆☆", "Ueno": "★★★★★ (National Museum, Ueno Zoo)" } },
      { feature: "Budget hotels", values: { "Asakusa": "★★★☆☆", "Ueno": "★★★★★" } },
      { feature: "Luggage ease", values: { "Asakusa": "★★★☆☆", "Ueno": "★★★★☆" } },
      { feature: "Hotel cost feel", values: { "Asakusa": "Good value, fewer options", "Ueno": "More budget options" } },
    ],
    proTip: "Asakusa and Ueno are only 5 minutes apart by Metro (Ginza Line). If you stay in Ueno for the practical benefits, you can walk to Senso-ji in 20 minutes or take one Metro stop. You get both areas without choosing.",
    hotelPicks: [
      { name: "Gate Hotel Kaminarimon", area: "Asakusa", price: "Check latest price", link: hotelAsakusa.href, hotelKey: "asakusa", tag: "Views" },
      { name: "Richmond Hotel Asakusa", area: "Asakusa", price: "Check latest price", link: hotelAsakusa.href, hotelKey: "asakusa", tag: "Value" },
      { name: "Nohga Hotel Ueno Tokyo", area: "Ueno", price: "Check latest price", link: hotelUeno.href, hotelKey: "ueno", tag: "Design" },
      { name: "MIMARU Tokyo Ueno", area: "Ueno", price: "Check latest price", link: hotelUeno.href, hotelKey: "ueno", tag: "Family" },
    ],
    nextActions: [
      { id: "tokyo-first-time", category: "stay", title: "Full Tokyo stay guide", description: "Compare Shinjuku, Ueno, Asakusa, and Tokyo Station.", cta: "See full guide", href: "/areas-to-stay/tokyo-first-time" },
      { id: "narita-asakusa", category: "transfer", title: "Narita → Asakusa", description: "Access Express and other routes from Narita.", cta: "See routes", href: "/airport-transfers/narita-to-asakusa" },
      { id: "narita-ueno", category: "transfer", title: "Narita → Ueno", description: "Skyliner and other routes from Narita.", cta: "See routes", href: "/airport-transfers/narita-to-ueno" },
      { id: "local-oshiage", category: "experience", title: "Explore Oshiage / Skytree area", description: "One stop from Asakusa — local food and Skytree.", cta: "See guide", href: "/local-tokyo/oshiage" },
      { id: "compare-shinjuku-ueno-asakusa", category: "stay", title: "Add Shinjuku to the comparison", description: "Shinjuku vs Ueno vs Asakusa — three bases side by side.", cta: "Compare areas", href: "/areas-to-stay/shinjuku-vs-ueno-vs-asakusa" },
      { id: "compare-ueno-shinjuku", category: "stay", title: "Ueno vs Shinjuku", description: "Compare Ueno and Shinjuku directly.", cta: "Compare areas", href: "/areas-to-stay/ueno-vs-shinjuku" },
      { id: "seat", category: "train", title: "Check Fuji-side seat", description: "Find the right window seat for Mt. Fuji views.", cta: "Check seat", href: "/guide" },
      ...commonNextActions,
    ],
    faqs: [
      { question: "Is Asakusa or Ueno better for first-time Tokyo?", answer: "Ueno is more practical — direct Narita Skyliner, 7 min to Tokyo Station, and more budget hotel options. Asakusa is more atmospheric with Senso-ji and old-town charm. They're only 5 min apart by Metro, so you can easily visit both." },
      { question: "Which is closer to Narita Airport?", answer: "Ueno — the Keisei Skyliner runs directly from Narita to Ueno in 36 minutes. From Asakusa, the Access Express takes about 55 minutes." },
      { question: "Is Asakusa good for families?", answer: "Yes — Senso-ji, Nakamise shopping street, and nearby Tokyo Skytree are family-friendly. The area is calmer than Shinjuku. Ueno also works well with the zoo, parks, and museums." },
      { question: "Can I walk from Ueno to Asakusa?", answer: "Yes — it's about a 20-minute walk through Kappabashi (Kitchen Town) or along the river. By Metro (Ginza Line), it's one stop, about 5 minutes." },
      { question: "Is Asakusa or Ueno cheaper for hotels?", answer: "Ueno generally has more budget hotels and hostels, especially around Ueno Station and Okachimachi, so it's the easier area to find a low-priced room. Asakusa has good value too but fewer rooms overall, so prices can rise on busy dates. Check live prices for both before deciding." },
      { question: "Ueno or Asakusa for an easy first night with luggage?", answer: "Ueno is easier: the Keisei Skyliner runs direct from Narita (36 min) straight to Ueno, so you arrive with minimal transfers. From Asakusa the Access Express takes about 55 minutes. If your first night is right after a long flight, Ueno keeps luggage handling simplest." },
      { question: "Which has more to do at night, Asakusa or Ueno?", answer: "Ueno has more late dining and izakaya, especially around Ameyoko, while Asakusa is quieter after the temples close in the evening. For nightlife you'd still go to Shinjuku or Shibuya, but between these two, Ueno stays livelier later." },
    ],
  },
  {
    slug: "kyoto-first-time",
    title: "Where to Stay in Kyoto for First-Time Visitors",
    description: "Choose a Kyoto hotel area by transport, luggage, day trips, temple access, food, and atmosphere.",
    quickRec: {
      area: "Kyoto Station",
      why: "Kyoto Station is the easiest first Kyoto base for Shinkansen arrivals, luggage, buses, and day trips. Choose Gion or Kawaramachi if atmosphere matters more than logistics.",
      link: hotelKyotoStation.href,
    },
    areas: [],
    comparisonColumns: [],
    comparison: [],
    proTip: "Pick Kyoto Station for logistics, Kawaramachi / Shijo for central food and shopping, and Gion / Higashiyama for atmosphere.",
    hotelPicks: [],
    nextActions: [
      { id: "kyoto-station-vs-gion", category: "stay", title: "Kyoto Station vs Gion", description: "Compare the main Kyoto first-time tradeoff.", cta: "Read guide", href: "/areas-to-stay/kyoto-station-vs-gion" },
      { id: "plan-trip", category: "itinerary", title: "Plan Your Trip", description: "Place Kyoto inside the full Japan route.", cta: "Plan trip", href: "/plan-your-trip" },
    ],
  },
  {
    slug: "osaka-first-time",
    title: "Where to Stay in Osaka for First-Time Visitors",
    description: "Choose an Osaka hotel area by food, nightlife, rail access, Shinkansen logistics, airport connections, and calmer central stays.",
    quickRec: {
      area: "Namba",
      why: "Namba is the easiest first Osaka base if food, nightlife, and orientation matter most. Choose Umeda for rail links or Shin-Osaka for pure Shinkansen logistics.",
      link: hotelNamba.href,
    },
    areas: [],
    comparisonColumns: [],
    comparison: [],
    proTip: "Pick Namba for food and nightlife, Umeda for rail connections, and Shin-Osaka only when the Shinkansen is the main priority.",
    hotelPicks: [],
    nextActions: [
      { id: "namba-vs-umeda", category: "stay", title: "Namba vs Umeda", description: "Compare Osaka's two most useful first-time bases.", cta: "Read guide", href: "/areas-to-stay/namba-vs-umeda" },
      { id: "shin-osaka-vs-namba", category: "stay", title: "Shin-Osaka vs Namba", description: "Decide whether Shinkansen logistics should drive your Osaka base.", cta: "Read guide", href: "/areas-to-stay/shin-osaka-vs-namba" },
    ],
  },
  {
    slug: "kyoto-before-shinkansen",
    title: "Where to Stay in Kyoto Before an Early Shinkansen",
    description: "Catching an early Shinkansen from Kyoto Station? Compare the Hachijo (Shinkansen) side, the central Karasuma side, and Gion / Kawaramachi by gate walk, luggage, and evening atmosphere.",
    quickRec: {
      area: "Kyoto Station (Hachijo side)",
      why: "The Shinkansen gates are on the Hachijo (south) side of Kyoto Station. Sleeping on that side turns your departure into a flat 3–8 minute walk — no taxi timing, no crossing the station complex with luggage.",
      link: hotelKyotoStation.href,
    },
    areas: [
      {
        id: "kyoto-station-hachijo",
        name: "Kyoto Station — Hachijo side",
        vibe: "Quiet, functional, right at the Shinkansen gates",
        pros: ["Shinkansen (Hachijo) gates within a few minutes on foot", "Flat routes, no crossing the huge station building", "Convenience stores open early for breakfast"],
        cons: ["Little evening atmosphere — mostly hotels and offices", "Fewer dinner options than the city center"],
        bestFor: "Departures before ~8:30am",
        transport: "Shinkansen gates 3–8 min on foot. Airport Haruka from the same station.",
        hotelLink: hotelKyotoStation.href,
        hotelKey: "kyotoStation",
      },
      {
        id: "kyoto-station-central",
        name: "Kyoto Station — central (Karasuma) side",
        vibe: "Busier station side with more hotels and food",
        pros: ["Big hotel choice and station dining floors", "Direct bus/subway access for your sightseeing days", "Still walkable to the Shinkansen gates"],
        cons: ["You cross the station complex to reach the Shinkansen side — allow 10–15 min with luggage", "Morning crowds inside the station"],
        bestFor: "Balancing sightseeing days with an early-ish departure",
        transport: "Walk through or around the station to the Hachijo gates (~10–15 min with bags).",
        hotelLink: hotelKyotoStation.href,
        hotelKey: "kyotoStation",
      },
      {
        id: "gion-kawaramachi",
        name: "Gion / Kawaramachi",
        vibe: "Classic Kyoto evenings — lanes, dining, riverside",
        pros: ["The Kyoto atmosphere you came for at night", "Best dinner choice in the city", "Taxi to Kyoto Station is short outside rush hour"],
        cons: ["15–25 min to the station by taxi or subway+walk in the morning", "Early taxis are usually fine but add a variable you don't control"],
        bestFor: "Daytime departures where atmosphere beats logistics",
        transport: "Taxi ~15 min or Karasuma Line + walk. Add buffer before 9am.",
        hotelLink: hotelGion.href,
        hotelKey: "gionKawaramachi",
      },
    ],
    comparisonColumns: ["Hachijo side", "Central side", "Gion / Kawaramachi"],
    comparison: [
      { feature: "Walk to Shinkansen gates", values: { "Hachijo side": "3–8 min, flat", "Central side": "10–15 min through station", "Gion / Kawaramachi": "15–25 min taxi/subway" } },
      { feature: "Luggage ease", values: { "Hachijo side": "Easiest", "Central side": "Good", "Gion / Kawaramachi": "Taxi recommended" } },
      { feature: "Evening atmosphere", values: { "Hachijo side": "★★☆☆☆", "Central side": "★★★☆☆", "Gion / Kawaramachi": "★★★★★" } },
      { feature: "Best departure time", values: { "Hachijo side": "Before 8:30am", "Central side": "8:30–10am", "Gion / Kawaramachi": "After 10am" } },
    ],
    proTip: "Split the difference: spend your Kyoto nights in Gion or Kawaramachi, then move to a Hachijo-side hotel for the final night only if your Shinkansen leaves before 8:30am. One logistics night buys a stress-free departure without giving up Kyoto evenings.",
    hotelPicks: [
      { name: "Hotel Granvia Kyoto", area: "Kyoto Station", price: "Check latest price", link: hotelKyotoStation.href, hotelKey: "kyotoStation", tag: "In-station" },
      { name: "Daiwa Roynet Kyoto Station", area: "Kyoto Station", price: "Check latest price", link: hotelKyotoStation.href, hotelKey: "kyotoStation" },
      { name: "Sowaka", area: "Gion", price: "Check latest price", link: hotelGion.href, hotelKey: "gionKawaramachi" },
    ],
    nextActions: [
      { id: "seat", category: "train", title: "Pick the Mt. Fuji-side seat", description: "Kyoto → Tokyo: left side, Seat E. Check your exact window.", cta: "Check seat", href: "/kyoto-to-tokyo-mt-fuji-seat" },
      { id: "kyoto-vs", category: "stay", title: "Kyoto Station vs Gion", description: "The full comparison for your non-departure nights.", cta: "Compare areas", href: "/areas-to-stay/kyoto-station-vs-gion" },
      ...commonNextActions,
    ],
    faqs: [
      { question: "Which side of Kyoto Station is the Shinkansen on?", answer: "The south (Hachijo) side. Hotels on the Hachijo side put you a few flat minutes from the Shinkansen gates — the central Karasuma side means crossing the large station complex first." },
      { question: "Is Gion too far for an early Shinkansen from Kyoto?", answer: "For departures before about 9am it adds real risk and stress: 15–25 minutes by taxi or subway plus a walk. It works fine for daytime departures — or move to a station-side hotel for the last night only." },
      { question: "Where do I see Mt. Fuji from the Kyoto to Tokyo Shinkansen?", answer: "On the left side — Seat E in Ordinary Cars — around 70–80 minutes after leaving Kyoto, near Shin-Fuji station." },
    ],
  },
  {
    slug: "osaka-before-shinkansen",
    title: "Where to Stay in Osaka Before an Early Shinkansen",
    description: "The Shinkansen leaves from Shin-Osaka, not Namba or Umeda. Compare Shin-Osaka, Umeda / Osaka Station, and Namba by morning transfer, luggage, and what your last Osaka evening feels like.",
    quickRec: {
      area: "Shin-Osaka",
      why: "The Shinkansen leaves from Shin-Osaka station — not Namba, not Umeda. Sleeping at Shin-Osaka removes the morning transfer entirely: elevator down, gates, train. It is a logistics choice, and for pre-9am departures the right one.",
      link: hotelShinOsaka.href,
    },
    areas: [
      {
        id: "shin-osaka",
        name: "Shin-Osaka",
        vibe: "Pure logistics — business hotels at the Shinkansen station",
        pros: ["Zero morning transfer — you sleep at the departure station", "Reliable business hotels at reasonable rates", "Convenience stores and coffee open early"],
        cons: ["No Osaka atmosphere — offices and hotels", "Dinner options are functional, not memorable"],
        bestFor: "Departures before ~9am",
        transport: "You are at the station. Midosuji Line connects to Umeda (6 min) and Namba (15 min).",
        hotelLink: hotelShinOsaka.href,
        hotelKey: "shinOsaka",
      },
      {
        id: "umeda",
        name: "Umeda / Osaka Station",
        vibe: "Big-city hub — department stores, dining floors, skyline",
        pros: ["One JR stop or one Midosuji stop to Shin-Osaka (~4–6 min)", "Huge hotel and dining choice", "Good middle ground between atmosphere and logistics"],
        cons: ["Osaka/Umeda station complex is large — allow time to find your platform with luggage", "Morning rush crowds from ~7:30am"],
        bestFor: "Early-ish departures with a proper last evening",
        transport: "JR Kyoto Line or Midosuji Line to Shin-Osaka in one stop.",
        hotelLink: hotelUmeda.href,
        hotelKey: "umeda",
      },
      {
        id: "namba",
        name: "Namba",
        vibe: "Dotonbori food and neon — the classic Osaka night",
        pros: ["The best last-night atmosphere in Osaka", "Endless dinner and street-food options", "Direct Midosuji Line to Shin-Osaka (~15 min, no transfer)"],
        cons: ["15+ min subway ride with luggage in the morning", "Midosuji trains get crowded from ~7:30am"],
        bestFor: "Daytime departures — enjoy the last night properly",
        transport: "Midosuji Line direct to Shin-Osaka, ~15 min. Ride before 7:15am or expect crowds.",
        hotelLink: hotelNamba.href,
        hotelKey: "namba",
      },
    ],
    comparisonColumns: ["Shin-Osaka", "Umeda", "Namba"],
    comparison: [
      { feature: "Morning transfer to Shinkansen", values: { "Shin-Osaka": "None — you're there", "Umeda": "1 stop (~5 min)", "Namba": "Direct subway ~15 min" } },
      { feature: "Luggage ease", values: { "Shin-Osaka": "Easiest", "Umeda": "Good, big station", "Namba": "Rush-hour subway with bags" } },
      { feature: "Last-night atmosphere", values: { "Shin-Osaka": "★☆☆☆☆", "Umeda": "★★★★☆", "Namba": "★★★★★" } },
      { feature: "Best departure time", values: { "Shin-Osaka": "Before 9am", "Umeda": "8:30–10am", "Namba": "After 10am" } },
    ],
    proTip: "Book a daytime Shinkansen if you can: staying in Namba for the food and neon, then riding the Midosuji Line at 10am with light crowds, beats sacrificing your last Osaka night to a business-hotel district. Reserve Shin-Osaka for genuinely early departures.",
    hotelPicks: [
      { name: "remm Shin-Osaka", area: "Shin-Osaka", price: "Check latest price", link: hotelShinOsaka.href, hotelKey: "shinOsaka", tag: "At the station" },
      { name: "Hotel Granvia Osaka", area: "Umeda", price: "Check latest price", link: hotelUmeda.href, hotelKey: "umeda" },
      { name: "Cross Hotel Osaka", area: "Namba", price: "Check latest price", link: hotelNamba.href, hotelKey: "namba" },
    ],
    nextActions: [
      { id: "seat", category: "train", title: "Pick the Mt. Fuji-side seat", description: "Osaka → Tokyo: left side, Seat E. The view comes ~85–95 min in.", cta: "Check seat", href: "/osaka-to-tokyo-mt-fuji-seat" },
      { id: "osaka-vs", category: "stay", title: "Shin-Osaka vs Namba", description: "The full comparison for your non-departure nights.", cta: "Compare areas", href: "/areas-to-stay/shin-osaka-vs-namba" },
      ...commonNextActions,
    ],
    faqs: [
      { question: "Does the Shinkansen leave from Osaka Station or Shin-Osaka?", answer: "Shin-Osaka. Osaka Station (Umeda) is one JR or subway stop away; Namba is about 15 minutes by Midosuji Line. Plan your last hotel around that transfer, not around the name 'Osaka Station'." },
      { question: "Is Namba too far for an early Shinkansen?", answer: "For departures before about 9am it means a 15-minute subway ride with luggage into the start of rush hour. It's fine for daytime trains; for genuinely early ones, sleep at Shin-Osaka or Umeda." },
      { question: "Where do I see Mt. Fuji from the Osaka to Tokyo Shinkansen?", answer: "On the left side — Seat E in Ordinary Cars — around 85–95 minutes after leaving Shin-Osaka, near Shin-Fuji station." },
    ],
  },
];

export const stayPages: StayPage[] = rawStayPages.map((page) => ({
  ...page,
  hotelPicks: getManagedStayHotelPicks(page.slug, page.hotelPicks),
}));

// ─── Lookup ─────────────────────────────────────────────────────────────────

export function getStayBySlug(slug: string): StayPage | undefined {
  return stayPages.find((p) => p.slug === slug);
}

export function getAllStaySlugs(): string[] {
  return stayPages.map((p) => p.slug);
}
