import type { TripPick } from "@/lib/trip-picks";
import { requireAffUrl } from "@/src/affiliateLinks";


// ─── Types ──────────────────────────────────────────────────────────────────

export type ItineraryDay = {
  day: number;
  location: string;
  title: string;
  highlights: string[];
  stayArea?: string;
  stayLink?: string;
  transport?: string;
  bookingCta?: { label: string; href: string };
};

export type ItineraryPage = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  pace: "relaxed" | "moderate" | "fast";
  bestFor: string;
  days: ItineraryDay[];
  proTip: string;
  nextActions: TripPick[];
};

// ─── Affiliate URLs ─────────────────────────────────────────────────────────

const jrPassUrl = requireAffUrl("jrPass");
const esimUrl = requireAffUrl("esim");
const tokyoUrl = requireAffUrl("cityTokyo");
const kyotoUrl = requireAffUrl("cityKyoto");
const osakaUrl = requireAffUrl("cityOsaka");
const hiroshimaUrl = requireAffUrl("cityHiroshima");
const nikkoUrl = requireAffUrl("cityNikko");
const hakoneUrl = requireAffUrl("hakone");
const naraUrl = requireAffUrl("nara");
const hotelShinjukuUrl = requireAffUrl("hotelShinjuku");
const hotelKyotoStationUrl = requireAffUrl("hotelKyotoStation");
const hotelOsakaUrl = requireAffUrl("hotelOsaka");
const hotelKawaguchikoUrl = requireAffUrl("hotelKawaguchiko");
const hotelHiroshimaUrl = requireAffUrl("hotelHiroshima");
const hotelHakoneUrl = requireAffUrl("hotelHakone");
const hotelUenoUrl = requireAffUrl("hotelUeno");
const hotelAsakusaUrl = requireAffUrl("hotelAsakusa");

// ─── Shared next actions ────────────────────────────────────────────────────

const commonNextActions: TripPick[] = [
  { id: "jr-pass", category: "train", title: "Compare JR Pass vs single tickets", description: "Usually worth it only for multiple long-distance rides.", cta: "Compare JR Pass", href: jrPassUrl },
  { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Set up data before landing — maps, translate, transit apps.", cta: "Get eSIM", href: esimUrl },
  { id: "transfer", category: "transfer", title: "Airport transfer", description: "Plan your Narita/Haneda to city route.", cta: "Compare options", href: "/airport-transfers/narita-to-shinjuku" },
  { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare Shinjuku, Ueno, Asakusa for your base.", cta: "Compare areas", href: "/areas-to-stay/tokyo-first-time" },
];

// ─── Page Data ──────────────────────────────────────────────────────────────

export const itineraryPages: ItineraryPage[] = [
  {
    slug: "7-day-first-time-japan",
    title: "7-day first-time Japan — Tokyo, Fuji, Kyoto, Osaka",
    description: "The classic golden route for first-time visitors. Tokyo as your base, Shinkansen to Kyoto with Mt. Fuji on the way, finish in Osaka. Balanced pace with room to explore.",
    duration: "7 days",
    pace: "moderate",
    bestFor: "First-time visitors who want the highlights without rushing",
    days: [
      {
        day: 1,
        location: "Tokyo",
        title: "Arrive & settle in",
        highlights: ["Land at Narita/Haneda, transfer to hotel", "Activate eSIM, get IC card (Suica/Pasmo)", "Evening walk around your neighbourhood — Shinjuku or Asakusa"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjukuUrl,
        transport: "Airport transfer to hotel",
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku" },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "Classic Tokyo highlights",
        highlights: ["Morning: Senso-ji temple (Asakusa)", "Afternoon: Akihabara or Ueno Park", "Evening: Shibuya crossing → Shibuya Sky or Tokyo Tower"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjukuUrl,
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl },
      },
      {
        day: 3,
        location: "Tokyo",
        title: "Explore deeper or day trip",
        highlights: ["Option A: Harajuku → Meiji Shrine → Omotesando → Shinjuku Gyoen", "Option B: Day trip to Nikko (2.5h) — stunning shrines in the mountains", "Option C: Tsukiji outer market → TeamLab → Odaiba"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjukuUrl,
        bookingCta: { label: "Book Nikko day trip", href: nikkoUrl },
      },
      {
        day: 4,
        location: "Tokyo → Kyoto",
        title: "Shinkansen day — see Mt. Fuji",
        highlights: ["Take Tokaido Shinkansen Tokyo → Kyoto (2h15m)", "Sit on the right side (E seat) for Mt. Fuji view", "Afternoon: Fushimi Inari — walk the torii gates", "Evening: Gion district walk"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        transport: "Shinkansen (single ticket is often cheaper)",
        bookingCta: { label: "Compare train tickets", href: jrPassUrl },
      },
      {
        day: 5,
        location: "Kyoto",
        title: "Temples & traditions",
        highlights: ["Morning: Kinkaku-ji (Golden Pavilion) → Ryoan-ji", "Afternoon: Arashiyama bamboo grove + monkey park", "Evening: Pontocho alley for dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        bookingCta: { label: "See Kyoto activities", href: kyotoUrl },
      },
      {
        day: 6,
        location: "Kyoto → Osaka",
        title: "Nara detour + Osaka night",
        highlights: ["Morning: Day trip to Nara (45 min) — deer park + Todai-ji", "Afternoon: Train to Osaka (30 min from Nara)", "Evening: Dotonbori street food — takoyaki, okonomiyaki, gyoza"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelOsakaUrl,
        transport: "JR Nara Line + JR to Osaka",
        bookingCta: { label: "See Osaka activities", href: osakaUrl },
      },
      {
        day: 7,
        location: "Osaka → Depart",
        title: "Last morning + fly home",
        highlights: ["Morning: Osaka Castle or Shinsekai district", "Head to KIX (Kansai Airport) for departure", "Alternative: Shinkansen back to Tokyo if flying from Narita/Haneda"],
        transport: "Nankai/JR to Kansai Airport, or Shinkansen to Tokyo",
      },
    ],
    proTip: "The Shinkansen on Day 4 is the anchor of this trip. Book the right-side seat (E) for the Fuji view. JR Pass is usually not worth it for this simple route. Single tickets are often cheaper unless you add Hiroshima, multiple long-distance rides, or return to Tokyo by Shinkansen.",
    nextActions: commonNextActions,
  },
  {
    slug: "5-day-express-japan",
    title: "5-day express Japan — Tokyo & Kyoto highlights",
    description: "Short on time but want the essentials? This tight itinerary covers Tokyo's best, a Shinkansen ride past Fuji, and Kyoto's top temples. Fast pace, zero filler.",
    duration: "5 days",
    pace: "fast",
    bestFor: "Travellers with limited days who still want Tokyo + Kyoto",
    days: [
      {
        day: 1,
        location: "Tokyo",
        title: "Arrive & hit the ground running",
        highlights: ["Arrive at Narita/Haneda, transfer to Shinjuku", "Afternoon: Shibuya crossing → Harajuku → Meiji Shrine", "Evening: Shinjuku nightlife or Golden Gai"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjukuUrl,
        transport: "Airport transfer",
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku" },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "Full Tokyo day",
        highlights: ["Morning: Senso-ji (Asakusa) → Ueno", "Afternoon: Akihabara or teamLab", "Evening: Tokyo Tower or Shibuya Sky"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjukuUrl,
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl },
      },
      {
        day: 3,
        location: "Tokyo → Kyoto",
        title: "Shinkansen to Kyoto + afternoon temples",
        highlights: ["Morning: Shinkansen to Kyoto (2h15m) — E seat for Fuji", "Afternoon: Fushimi Inari (torii gates)", "Evening: Gion district walk + dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        transport: "Shinkansen (single ticket is often cheaper)",
        bookingCta: { label: "Compare train tickets", href: jrPassUrl },
      },
      {
        day: 4,
        location: "Kyoto",
        title: "Kyoto temples & bamboo",
        highlights: ["Morning: Kinkaku-ji → Ryoan-ji", "Afternoon: Arashiyama bamboo grove", "Evening: Pontocho or Nishiki Market"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        bookingCta: { label: "See Kyoto activities", href: kyotoUrl },
      },
      {
        day: 5,
        location: "Kyoto → Depart",
        title: "Last stop + fly home",
        highlights: ["Morning: Quick visit to Nara (1h from Kyoto) or Osaka", "Fly from KIX, or Shinkansen back to Tokyo for Narita/Haneda"],
        transport: "Shinkansen or Haruka Express to KIX",
      },
    ],
    proTip: "With only 5 days, a JR Pass may not pay off unless you're doing the Tokyo–Kyoto round trip. Calculate: Shinkansen one-way is ~¥13,320, JR Pass 7-day is ~¥50,000. If flying out of KIX (one-way Shinkansen), individual tickets are cheaper.",
    nextActions: commonNextActions,
  },
  {
    slug: "10-day-with-fuji",
    title: "10-day Japan with Mt. Fuji — Tokyo, Hakone, Kyoto, Osaka",
    description: "The golden route plus a Mt. Fuji area stay. Spend a night near Kawaguchiko or Hakone for views, onsen, and a change of pace from the cities. Relaxed pacing throughout.",
    duration: "10 days",
    pace: "relaxed",
    bestFor: "Travellers who want the classic route plus a Fuji-area experience",
    days: [
      {
        day: 1,
        location: "Tokyo",
        title: "Arrive & settle in",
        highlights: ["Land at Narita/Haneda, transfer to hotel", "Activate eSIM, get IC card", "Evening stroll around Shinjuku or Asakusa"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjukuUrl,
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku" },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "East Tokyo — temples & tradition",
        highlights: ["Morning: Senso-ji → Nakamise → Asakusa", "Afternoon: Ueno Park + museums", "Evening: Ameyoko street market → dinner in Ueno"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjukuUrl,
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl },
      },
      {
        day: 3,
        location: "Tokyo",
        title: "West Tokyo — modern & pop culture",
        highlights: ["Morning: Meiji Shrine → Harajuku → Omotesando", "Afternoon: Shibuya crossing → Shibuya Sky", "Evening: Shinjuku Golden Gai or Kabukicho"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjukuUrl,
      },
      {
        day: 4,
        location: "Tokyo → Kawaguchiko",
        title: "Mt. Fuji area — lake & views",
        highlights: ["Highway bus from Shinjuku to Kawaguchiko (2h)", "Afternoon: Chureito Pagoda for the iconic Fuji shot", "Onsen hotel with Fuji view — the best part of this trip"],
        stayArea: "Kawaguchiko",
        stayLink: hotelKawaguchikoUrl,
        transport: "Highway bus from Shinjuku Busta (2h)",
        bookingCta: { label: "See Kawaguchiko hotels", href: hotelKawaguchikoUrl },
      },
      {
        day: 5,
        location: "Kawaguchiko → Hakone",
        title: "Fuji views + Hakone onsen",
        highlights: ["Morning: Lake Kawaguchiko cycling or Oshino Hakkai", "Afternoon: Bus to Hakone (or return to Tokyo, then Romancecar)", "Evening: Hakone onsen ryokan experience"],
        stayArea: "Hakone",
        stayLink: hotelHakoneUrl,
        transport: "Bus or train via Gotemba/Mishima",
        bookingCta: { label: "Get Hakone Free Pass", href: hakoneUrl },
      },
      {
        day: 6,
        location: "Hakone → Kyoto",
        title: "Hakone loop + Shinkansen to Kyoto",
        highlights: ["Morning: Hakone ropeway → Owakudani → Lake Ashi pirate ship", "Afternoon: Bus to Odawara, Shinkansen to Kyoto (2h)", "Evening: Arrive Kyoto, explore Kyoto Station area"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        transport: "Hakone bus → Odawara → Shinkansen",
        bookingCta: { label: "Compare JR Pass", href: jrPassUrl },
      },
      {
        day: 7,
        location: "Kyoto",
        title: "Kyoto — temples & shrines",
        highlights: ["Morning: Fushimi Inari (go early, avoid crowds)", "Afternoon: Kinkaku-ji → Ryoan-ji", "Evening: Gion geisha district walk"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        bookingCta: { label: "See Kyoto activities", href: kyotoUrl },
      },
      {
        day: 8,
        location: "Kyoto",
        title: "Kyoto — bamboo & day trip",
        highlights: ["Morning: Arashiyama bamboo grove + monkey park", "Afternoon: Day trip to Nara (45 min) — deer + Todai-ji", "Evening: Nishiki Market → Pontocho dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        bookingCta: { label: "Book Nara trip", href: naraUrl },
      },
      {
        day: 9,
        location: "Kyoto → Osaka",
        title: "Osaka — street food capital",
        highlights: ["Morning: Train to Osaka (15 min on Shinkansen)", "Afternoon: Osaka Castle → Shinsekai", "Evening: Dotonbori — takoyaki, okonomiyaki, kushikatsu"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelOsakaUrl,
        bookingCta: { label: "See Osaka activities", href: osakaUrl },
      },
      {
        day: 10,
        location: "Osaka → Depart",
        title: "Last morning + fly home",
        highlights: ["Morning: Kuromon Market or last-minute shopping", "Head to KIX for departure", "Or Shinkansen back to Tokyo if flying from Narita/Haneda"],
        transport: "Nankai/JR to KIX or Shinkansen to Tokyo",
      },
    ],
    proTip: "The Kawaguchiko → Hakone → Kyoto sequence on Days 4–6 is the highlight most itineraries miss. You see Fuji from both the lake and mountain side, soak in an onsen, and naturally end up on the Shinkansen to Kyoto from Odawara — no backtracking to Tokyo.",
    nextActions: [
      { id: "stay-kawaguchiko", category: "stay", title: "Kawaguchiko hotels", description: "Fuji-view onsen hotels by the lake.", cta: "See hotels", href: hotelKawaguchikoUrl },
      ...commonNextActions,
    ],
  },
  {
    slug: "14-day-deep-japan",
    title: "14-day deep Japan — Tokyo to Hiroshima and beyond",
    description: "Two weeks to go beyond the golden route. Tokyo, Nikko, Fuji area, Kyoto, Nara, Osaka, Hiroshima, Miyajima — with enough rest days built in to avoid burnout.",
    duration: "14 days",
    pace: "relaxed",
    bestFor: "Travellers with two weeks who want depth, not just highlights",
    days: [
      {
        day: 1,
        location: "Tokyo",
        title: "Arrive & settle in",
        highlights: ["Land at Narita/Haneda, transfer to Asakusa or Ueno", "Activate eSIM, get IC card", "Evening: Senso-ji lit up at night (fewer crowds)"],
        stayArea: "Asakusa",
        stayLink: hotelAsakusaUrl,
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku" },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "East Tokyo deep dive",
        highlights: ["Morning: Tsukiji outer market for breakfast", "Afternoon: TeamLab Planets → Odaiba", "Evening: Tokyo Tower or Roppongi"],
        stayArea: "Asakusa",
        stayLink: hotelAsakusaUrl,
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl },
      },
      {
        day: 3,
        location: "Tokyo",
        title: "West Tokyo & Shinjuku",
        highlights: ["Morning: Meiji Shrine → Harajuku → Omotesando", "Afternoon: Shinjuku Gyoen gardens", "Evening: Golden Gai or Omoide Yokocho"],
        stayArea: "Asakusa",
        stayLink: hotelAsakusaUrl,
      },
      {
        day: 4,
        location: "Day trip: Nikko",
        title: "Mountain shrines & waterfalls",
        highlights: ["Tobu train from Asakusa to Nikko (2h)", "Toshogu Shrine — elaborate carvings, see-no-evil monkeys", "Kegon Falls or Lake Chuzenji if time allows"],
        stayArea: "Asakusa",
        stayLink: hotelAsakusaUrl,
        transport: "Tobu Nikko Line from Asakusa (2h direct)",
        bookingCta: { label: "Book Nikko trip", href: nikkoUrl },
      },
      {
        day: 5,
        location: "Tokyo → Kawaguchiko",
        title: "Mt. Fuji lakeside",
        highlights: ["Highway bus from Shinjuku to Kawaguchiko (2h)", "Chureito Pagoda for the postcard Fuji view", "Onsen with Fuji view — peak of the trip"],
        stayArea: "Kawaguchiko",
        stayLink: hotelKawaguchikoUrl,
        transport: "Highway bus from Shinjuku Busta",
        bookingCta: { label: "See Kawaguchiko hotels", href: hotelKawaguchikoUrl },
      },
      {
        day: 6,
        location: "Kawaguchiko → Tokyo",
        title: "Morning by the lake + return",
        highlights: ["Morning: Cycling around Lake Kawaguchiko or Oshino Hakkai", "Afternoon: Return to Tokyo", "Evening: Akihabara or Shimokitazawa — your pick"],
        stayArea: "Ueno",
        stayLink: hotelUenoUrl,
        transport: "Highway bus back to Shinjuku (2h)",
      },
      {
        day: 7,
        location: "Tokyo → Kyoto",
        title: "Shinkansen day — see Fuji from the train",
        highlights: ["Tokaido Shinkansen Tokyo → Kyoto (2h15m)", "Right side E seat for Mt. Fuji — use fujiseat checker", "Afternoon: Fushimi Inari torii gates", "Evening: Gion walk + dinner on Pontocho"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        transport: "Shinkansen (compare pass vs tickets)",
        bookingCta: { label: "Compare JR Pass", href: jrPassUrl },
      },
      {
        day: 8,
        location: "Kyoto",
        title: "North Kyoto temples",
        highlights: ["Morning: Kinkaku-ji (Golden Pavilion)", "Afternoon: Ryoan-ji → Ninna-ji", "Evening: Nishiki Market → kaiseki dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        bookingCta: { label: "See Kyoto activities", href: kyotoUrl },
      },
      {
        day: 9,
        location: "Kyoto",
        title: "Arashiyama + south Kyoto",
        highlights: ["Morning: Arashiyama bamboo grove + monkey park", "Afternoon: Tofuku-ji or Sanjusangendo (1,001 statues)", "Evening: Free evening — rest or explore"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
      },
      {
        day: 10,
        location: "Day trip: Nara",
        title: "Deer park & giant Buddha",
        highlights: ["JR or Kintetsu to Nara (45 min)", "Todai-ji — world's largest wooden building", "Walk through deer park + Kasuga Taisha shrine"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStationUrl,
        transport: "JR Nara Line (covered if you already use JR Pass)",
        bookingCta: { label: "Book Nara trip", href: naraUrl },
      },
      {
        day: 11,
        location: "Kyoto → Hiroshima",
        title: "Hiroshima — history & peace",
        highlights: ["Shinkansen Kyoto → Hiroshima (1h40m)", "Peace Memorial Park + Museum", "Evening: Hiroshima-style okonomiyaki"],
        stayArea: "Hiroshima",
        stayLink: hotelHiroshimaUrl,
        transport: "Shinkansen (compare JR Pass vs tickets)",
        bookingCta: { label: "See Hiroshima activities", href: hiroshimaUrl },
      },
      {
        day: 12,
        location: "Hiroshima + Miyajima",
        title: "Floating torii gate island",
        highlights: ["Ferry to Miyajima island (10 min from mainland)", "Itsukushima Shrine — floating torii at high tide", "Try momiji manju (maple leaf cake) + grilled oysters"],
        stayArea: "Hiroshima",
        stayLink: hotelHiroshimaUrl,
        transport: "JR train + ferry (covered if you use JR Pass)",
      },
      {
        day: 13,
        location: "Hiroshima → Osaka",
        title: "Osaka street food finale",
        highlights: ["Shinkansen Hiroshima → Osaka (1h20m)", "Afternoon: Osaka Castle or Shinsekai", "Evening: Dotonbori — the ultimate street food strip"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelOsakaUrl,
        transport: "Shinkansen (compare JR Pass vs tickets)",
        bookingCta: { label: "See Osaka activities", href: osakaUrl },
      },
      {
        day: 14,
        location: "Osaka → Depart",
        title: "Last morning + fly home",
        highlights: ["Morning: Kuromon Market or Amerikamura shopping", "Head to KIX for departure", "Or Shinkansen back to Tokyo for Narita/Haneda"],
        transport: "Nankai/JR to KIX or Shinkansen to Tokyo",
      },
    ],
    proTip: "The 14-day JR Pass is usually worth comparing for this route because it includes several long-distance legs: Tokyo→Kyoto, Kyoto→Hiroshima, Hiroshima→Osaka, and potentially Osaka→Tokyo. Activate it around Day 7 so it covers the dense train section, then confirm current prices before buying.",
    nextActions: [
      { id: "stay-kawaguchiko", category: "stay", title: "Kawaguchiko hotels", description: "Fuji-view onsen hotels by the lake.", cta: "See hotels", href: hotelKawaguchikoUrl },
      { id: "hiroshima", category: "experience", title: "Hiroshima activities", description: "Peace park, Miyajima, and local food.", cta: "See activities", href: hiroshimaUrl },
      ...commonNextActions,
    ],
  },
];

// ─── Lookup ─────────────────────────────────────────────────────────────────

export function getItineraryBySlug(slug: string): ItineraryPage | undefined {
  return itineraryPages.find((p) => p.slug === slug);
}

export function getAllItinerarySlugs(): string[] {
  return itineraryPages.map((p) => p.slug);
}
