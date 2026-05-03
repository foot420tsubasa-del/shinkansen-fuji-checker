import type { TripPick } from "@/lib/trip-picks";
import { getHotelLink, type HotelAreaKey } from "@/lib/hotel-links";
import { requireAffUrl } from "@/src/affiliateLinks";


// ─── Types ──────────────────────────────────────────────────────────────────

export type ItineraryDay = {
  day: number;
  location: string;
  title: string;
  highlights: string[];
  stayArea?: string;
  stayLink?: string;
  stayHotelKey?: HotelAreaKey;
  transport?: string;
  bookingCta?: {
    label: string;
    href: string;
    category?: "hotel" | "esim" | "transfer" | "train" | "activity" | "tour" | "insurance";
  };
  prepare?: string;
  prepareCta?: { label: string; href: string };
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
const hotelShinjuku = getHotelLink("shinjuku");
const hotelKyotoStation = getHotelLink("kyotoStation");
const hotelNamba = getHotelLink("namba");
const hotelKawaguchiko = getHotelLink("kawaguchiko");
const hotelHiroshima = getHotelLink("hiroshima");
const hotelHakone = getHotelLink("hakone");
const hotelUeno = getHotelLink("ueno");
const hotelAsakusa = getHotelLink("asakusa");
const hotelTokyoStation = getHotelLink("tokyoStation");
const shinkansenTicketUrl = requireAffUrl("shinkansenTicket");
const kimonoUrl = requireAffUrl("kimonoRentalKyoto");
const foodTourTokyoUrl = requireAffUrl("foodTourTokyo");
const foodTourOsakaUrl = requireAffUrl("foodTourOsaka");
const usjUrl = requireAffUrl("universalStudiosJapan");
const teamlabUrl = requireAffUrl("teamlabBorderless");

// ─── Shared next actions ────────────────────────────────────────────────────

const commonNextActions: TripPick[] = [
  { id: "jr-pass", category: "train", title: "JR Pass fit guide", description: "Check whether your route has enough long-distance JR rides before buying.", cta: "Read guide", href: "/jr-pass-vs-single-ticket" },
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
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        transport: "Airport transfer to hotel",
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku", category: "transfer" },
        prepare: "eSIM / IC card",
        prepareCta: { label: "Get eSIM", href: esimUrl },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "Classic Tokyo highlights",
        highlights: ["Morning: Senso-ji temple (Asakusa)", "Afternoon: Akihabara or Ueno Park", "Evening: Shibuya crossing → Shibuya Sky or Tokyo Tower"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl, category: "activity" },
        prepare: "Keep the day light after arrival",
      },
      {
        day: 3,
        location: "Tokyo",
        title: "Explore deeper or day trip",
        highlights: ["Option A: Harajuku → Meiji Shrine → Omotesando → Shinjuku Gyoen", "Option B: Day trip to Nikko (2.5h) — stunning shrines in the mountains", "Option C: Tsukiji outer market → TeamLab → Odaiba"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        bookingCta: { label: "Book Nikko day trip", href: nikkoUrl, category: "tour" },
        prepare: "Confirm weather and transit timing",
      },
      {
        day: 4,
        location: "Tokyo → Kyoto",
        title: "Shinkansen day — see Mt. Fuji",
        highlights: ["Take Tokaido Shinkansen Tokyo → Kyoto (2h15m)", "Sit on the right side (E seat) for Mt. Fuji view", "Afternoon: Fushimi Inari — walk the torii gates", "Evening: Gion district walk"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        transport: "Shinkansen (single ticket is often cheaper)",
        bookingCta: { label: "Book Shinkansen ticket", href: jrPassUrl, category: "train" },
        prepare: "Fuji-side seat checker",
        prepareCta: { label: "Which seat for Fuji?", href: "/tokyo-to-kyoto-mt-fuji-seat" },
      },
      {
        day: 5,
        location: "Kyoto",
        title: "Temples & traditions",
        highlights: ["Morning: Kinkaku-ji (Golden Pavilion) → Ryoan-ji", "Afternoon: Arashiyama bamboo grove + monkey park", "Evening: Pontocho alley for dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        bookingCta: { label: "See Kyoto activities", href: kyotoUrl, category: "activity" },
        prepare: "Temple timing and dinner area",
      },
      {
        day: 6,
        location: "Kyoto → Osaka",
        title: "Nara detour + Osaka night",
        highlights: ["Morning: Day trip to Nara (45 min) — deer park + Todai-ji", "Afternoon: Train to Osaka (30 min from Nara)", "Evening: Dotonbori street food — takoyaki, okonomiyaki, gyoza"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
        stayHotelKey: "namba",
        transport: "JR Nara Line + JR to Osaka",
        bookingCta: { label: "See Osaka activities", href: osakaUrl, category: "activity" },
        prepare: "Forward luggage if changing hotels",
      },
      {
        day: 7,
        location: "Osaka → Depart",
        title: "Last morning + fly home",
        highlights: ["Morning: Osaka Castle or Shinsekai district", "Head to KIX (Kansai Airport) for departure", "Alternative: Shinkansen back to Tokyo if flying from Narita/Haneda"],
        transport: "Nankai/JR to Kansai Airport, or Shinkansen to Tokyo",
        prepare: "Airport transfer buffer and souvenirs",
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
        stayLink: hotelShinjuku.href,
        transport: "Airport transfer",
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku" },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "Full Tokyo day",
        highlights: ["Morning: Senso-ji (Asakusa) → Ueno", "Afternoon: Akihabara or teamLab", "Evening: Tokyo Tower or Shibuya Sky"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl },
      },
      {
        day: 3,
        location: "Tokyo → Kyoto",
        title: "Shinkansen to Kyoto + afternoon temples",
        highlights: ["Morning: Shinkansen to Kyoto (2h15m) — E seat for Fuji", "Afternoon: Fushimi Inari (torii gates)", "Evening: Gion district walk + dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        transport: "Shinkansen (single ticket is often cheaper)",
        bookingCta: { label: "Compare train tickets", href: jrPassUrl },
      },
      {
        day: 4,
        location: "Kyoto",
        title: "Kyoto temples & bamboo",
        highlights: ["Morning: Kinkaku-ji → Ryoan-ji", "Afternoon: Arashiyama bamboo grove", "Evening: Pontocho or Nishiki Market"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
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
        stayLink: hotelShinjuku.href,
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku" },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "East Tokyo — temples & tradition",
        highlights: ["Morning: Senso-ji → Nakamise → Asakusa", "Afternoon: Ueno Park + museums", "Evening: Ameyoko street market → dinner in Ueno"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl },
      },
      {
        day: 3,
        location: "Tokyo",
        title: "West Tokyo — modern & pop culture",
        highlights: ["Morning: Meiji Shrine → Harajuku → Omotesando", "Afternoon: Shibuya crossing → Shibuya Sky", "Evening: Shinjuku Golden Gai or Kabukicho"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
      },
      {
        day: 4,
        location: "Tokyo → Kawaguchiko",
        title: "Mt. Fuji area — lake & views",
        highlights: ["Highway bus from Shinjuku to Kawaguchiko (2h)", "Afternoon: Chureito Pagoda for the iconic Fuji shot", "Onsen hotel with Fuji view — the best part of this trip"],
        stayArea: "Kawaguchiko",
        stayLink: hotelKawaguchiko.href,
        transport: "Highway bus from Shinjuku Busta (2h)",
        bookingCta: { label: "See Kawaguchiko hotels", href: hotelKawaguchiko.href },
      },
      {
        day: 5,
        location: "Kawaguchiko → Hakone",
        title: "Fuji views + Hakone onsen",
        highlights: ["Morning: Lake Kawaguchiko cycling or Oshino Hakkai", "Afternoon: Bus to Hakone (or return to Tokyo, then Romancecar)", "Evening: Hakone onsen ryokan experience"],
        stayArea: "Hakone",
        stayLink: hotelHakone.href,
        transport: "Bus or train via Gotemba/Mishima",
        bookingCta: { label: "Get Hakone Free Pass", href: hakoneUrl },
      },
      {
        day: 6,
        location: "Hakone → Kyoto",
        title: "Hakone loop + Shinkansen to Kyoto",
        highlights: ["Morning: Hakone ropeway → Owakudani → Lake Ashi pirate ship", "Afternoon: Bus to Odawara, Shinkansen to Kyoto (2h)", "Evening: Arrive Kyoto, explore Kyoto Station area"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        transport: "Hakone bus → Odawara → Shinkansen",
        bookingCta: { label: "Compare JR Pass", href: jrPassUrl },
      },
      {
        day: 7,
        location: "Kyoto",
        title: "Kyoto — temples & shrines",
        highlights: ["Morning: Fushimi Inari (go early, avoid crowds)", "Afternoon: Kinkaku-ji → Ryoan-ji", "Evening: Gion geisha district walk"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        bookingCta: { label: "See Kyoto activities", href: kyotoUrl },
      },
      {
        day: 8,
        location: "Kyoto",
        title: "Kyoto — bamboo & day trip",
        highlights: ["Morning: Arashiyama bamboo grove + monkey park", "Afternoon: Day trip to Nara (45 min) — deer + Todai-ji", "Evening: Nishiki Market → Pontocho dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        bookingCta: { label: "Book Nara trip", href: naraUrl },
      },
      {
        day: 9,
        location: "Kyoto → Osaka",
        title: "Osaka — street food capital",
        highlights: ["Morning: Train to Osaka (15 min on Shinkansen)", "Afternoon: Osaka Castle → Shinsekai", "Evening: Dotonbori — takoyaki, okonomiyaki, kushikatsu"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
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
      { id: "stay-kawaguchiko", category: "stay", title: "Kawaguchiko hotels", description: "Fuji-view onsen hotels by the lake.", cta: "See hotels", href: hotelKawaguchiko.href },
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
        stayLink: hotelAsakusa.href,
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku" },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "East Tokyo deep dive",
        highlights: ["Morning: Tsukiji outer market for breakfast", "Afternoon: TeamLab Planets → Odaiba", "Evening: Tokyo Tower or Roppongi"],
        stayArea: "Asakusa",
        stayLink: hotelAsakusa.href,
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl },
      },
      {
        day: 3,
        location: "Tokyo",
        title: "West Tokyo & Shinjuku",
        highlights: ["Morning: Meiji Shrine → Harajuku → Omotesando", "Afternoon: Shinjuku Gyoen gardens", "Evening: Golden Gai or Omoide Yokocho"],
        stayArea: "Asakusa",
        stayLink: hotelAsakusa.href,
      },
      {
        day: 4,
        location: "Day trip: Nikko",
        title: "Mountain shrines & waterfalls",
        highlights: ["Tobu train from Asakusa to Nikko (2h)", "Toshogu Shrine — elaborate carvings, see-no-evil monkeys", "Kegon Falls or Lake Chuzenji if time allows"],
        stayArea: "Asakusa",
        stayLink: hotelAsakusa.href,
        transport: "Tobu Nikko Line from Asakusa (2h direct)",
        bookingCta: { label: "Book Nikko trip", href: nikkoUrl },
      },
      {
        day: 5,
        location: "Tokyo → Kawaguchiko",
        title: "Mt. Fuji lakeside",
        highlights: ["Highway bus from Shinjuku to Kawaguchiko (2h)", "Chureito Pagoda for the postcard Fuji view", "Onsen with Fuji view — peak of the trip"],
        stayArea: "Kawaguchiko",
        stayLink: hotelKawaguchiko.href,
        transport: "Highway bus from Shinjuku Busta",
        bookingCta: { label: "See Kawaguchiko hotels", href: hotelKawaguchiko.href },
      },
      {
        day: 6,
        location: "Kawaguchiko → Tokyo",
        title: "Morning by the lake + return",
        highlights: ["Morning: Cycling around Lake Kawaguchiko or Oshino Hakkai", "Afternoon: Return to Tokyo", "Evening: Akihabara or Shimokitazawa — your pick"],
        stayArea: "Ueno",
        stayLink: hotelUeno.href,
        transport: "Highway bus back to Shinjuku (2h)",
      },
      {
        day: 7,
        location: "Tokyo → Kyoto",
        title: "Shinkansen day — see Fuji from the train",
        highlights: ["Tokaido Shinkansen Tokyo → Kyoto (2h15m)", "Right side E seat for Mt. Fuji — use fujiseat checker", "Afternoon: Fushimi Inari torii gates", "Evening: Gion walk + dinner on Pontocho"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        transport: "Shinkansen (compare pass vs tickets)",
        bookingCta: { label: "Compare JR Pass", href: jrPassUrl },
      },
      {
        day: 8,
        location: "Kyoto",
        title: "North Kyoto temples",
        highlights: ["Morning: Kinkaku-ji (Golden Pavilion)", "Afternoon: Ryoan-ji → Ninna-ji", "Evening: Nishiki Market → kaiseki dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        bookingCta: { label: "See Kyoto activities", href: kyotoUrl },
      },
      {
        day: 9,
        location: "Kyoto",
        title: "Arashiyama + south Kyoto",
        highlights: ["Morning: Arashiyama bamboo grove + monkey park", "Afternoon: Tofuku-ji or Sanjusangendo (1,001 statues)", "Evening: Free evening — rest or explore"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
      },
      {
        day: 10,
        location: "Day trip: Nara",
        title: "Deer park & giant Buddha",
        highlights: ["JR or Kintetsu to Nara (45 min)", "Todai-ji — world's largest wooden building", "Walk through deer park + Kasuga Taisha shrine"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        transport: "JR Nara Line (covered if you already use JR Pass)",
        bookingCta: { label: "Book Nara trip", href: naraUrl },
      },
      {
        day: 11,
        location: "Kyoto → Hiroshima",
        title: "Hiroshima — history & peace",
        highlights: ["Shinkansen Kyoto → Hiroshima (1h40m)", "Peace Memorial Park + Museum", "Evening: Hiroshima-style okonomiyaki"],
        stayArea: "Hiroshima",
        stayLink: hotelHiroshima.href,
        transport: "Shinkansen (compare JR Pass vs tickets)",
        bookingCta: { label: "See Hiroshima activities", href: hiroshimaUrl },
      },
      {
        day: 12,
        location: "Hiroshima + Miyajima",
        title: "Floating torii gate island",
        highlights: ["Ferry to Miyajima island (10 min from mainland)", "Itsukushima Shrine — floating torii at high tide", "Try momiji manju (maple leaf cake) + grilled oysters"],
        stayArea: "Hiroshima",
        stayLink: hotelHiroshima.href,
        transport: "JR train + ferry (covered if you use JR Pass)",
      },
      {
        day: 13,
        location: "Hiroshima → Osaka",
        title: "Osaka street food finale",
        highlights: ["Shinkansen Hiroshima → Osaka (1h20m)", "Afternoon: Osaka Castle or Shinsekai", "Evening: Dotonbori — the ultimate street food strip"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
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
      { id: "stay-kawaguchiko", category: "stay", title: "Kawaguchiko hotels", description: "Fuji-view onsen hotels by the lake.", cta: "See hotels", href: hotelKawaguchiko.href },
      { id: "hiroshima", category: "experience", title: "Hiroshima activities", description: "Peace park, Miyajima, and local food.", cta: "See activities", href: hiroshimaUrl },
      ...commonNextActions,
    ],
  },

  // ─── New itineraries: booking-checklist format ─────────────────────────────

  {
    slug: "10-day-japan-with-fuji",
    title: "10-Day Japan Itinerary with Mt. Fuji, Tokyo, Kyoto and Osaka",
    description: "A practical 10-day Japan itinerary for first-time visitors, including Tokyo, Mt. Fuji views from the Shinkansen, Kyoto, Osaka, hotels, airport transfers, eSIM and activities.",
    duration: "10 days",
    pace: "relaxed",
    bestFor: "First-time visitors who want Tokyo, Fuji views, Kyoto and Osaka without rushing",
    days: [
      {
        day: 1,
        location: "Tokyo",
        title: "Arrive & settle in",
        highlights: ["Land at Narita or Haneda, transfer to hotel", "Activate eSIM and get IC card (Suica/Pasmo) at the airport", "Evening stroll — explore your neighbourhood on foot"],
        stayArea: "Shinjuku or Tokyo Station",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        transport: "Airport transfer to hotel",
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku", category: "transfer" },
        prepare: "eSIM / IC card",
        prepareCta: { label: "Get eSIM", href: esimUrl },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "Tokyo classic day",
        highlights: ["Morning: Senso-ji temple and Nakamise street (Asakusa)", "Afternoon: Ueno Park, museums, or Akihabara", "Evening: Shibuya crossing → Shibuya Sky or Tokyo Tower"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl, category: "activity" },
        prepare: "Keep the day light — you're still adjusting",
      },
      {
        day: 3,
        location: "Tokyo — East Tokyo",
        title: "East Tokyo slow day",
        highlights: ["Morning: Kiyosumi-Shirakawa — specialty coffee and gardens", "Afternoon: Kuramae or Monzen-Nakacho — craft shops and temples", "Evening: Oshiage — Tokyo Skytree views at sunset", "Alternative: Asakusa → Sumida River walk"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        bookingCta: { label: "See teamLab tickets", href: teamlabUrl, category: "activity" },
        prepare: "Explore Local Tokyo neighbourhoods",
        prepareCta: { label: "Local Tokyo guide", href: "/local-tokyo" },
      },
      {
        day: 4,
        location: "Tokyo",
        title: "Harajuku, Meiji & deeper Tokyo",
        highlights: ["Morning: Meiji Shrine — early is best", "Afternoon: Harajuku → Omotesando → Shinjuku Gyoen", "Evening: Golden Gai or Omoide Yokocho in Shinjuku"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        bookingCta: { label: "See Tokyo food tours", href: foodTourTokyoUrl, category: "activity" },
      },
      {
        day: 5,
        location: "Tokyo → Kyoto",
        title: "Shinkansen day — see Mt. Fuji",
        highlights: ["Take Tokaido Shinkansen Tokyo → Kyoto (2h15m)", "Sit on the right side (Seat E) for the Mt. Fuji view", "Afternoon: Fushimi Inari — walk the torii gates", "Evening: Gion district walk and dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        transport: "Shinkansen (single ticket is often cheaper than JR Pass)",
        bookingCta: { label: "Book Shinkansen ticket", href: shinkansenTicketUrl, category: "train" },
        prepare: "Check Fuji-side seat",
        prepareCta: { label: "Which seat for Fuji?", href: "/tokyo-to-kyoto-mt-fuji-seat" },
      },
      {
        day: 6,
        location: "Kyoto",
        title: "Kyoto classic sightseeing",
        highlights: ["Morning: Kinkaku-ji (Golden Pavilion) → Ryoan-ji", "Afternoon: Arashiyama bamboo grove and monkey park", "Evening: Pontocho alley for dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        bookingCta: { label: "Book kimono rental", href: kimonoUrl, category: "activity" },
        prepare: "Temple opening times and weather check",
      },
      {
        day: 7,
        location: "Kyoto or Nara day trip",
        title: "Slower Kyoto or Nara day",
        highlights: ["Option A: Nara day trip (45 min) — deer park and Todai-ji", "Option B: Philosopher's Path → Ginkaku-ji → Nanzen-ji", "Evening: Nishiki Market stroll and kaiseki dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        bookingCta: { label: "Book Nara day trip", href: naraUrl, category: "tour" },
      },
      {
        day: 8,
        location: "Kyoto → Osaka",
        title: "Move to Osaka",
        highlights: ["Morning: Last Kyoto stop — Tofuku-ji or tea ceremony", "Afternoon: Train to Osaka (15–30 min)", "Evening: Dotonbori street food — takoyaki, okonomiyaki, kushikatsu"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
        stayHotelKey: "namba",
        transport: "JR or Hankyu to Osaka (15–30 min)",
        bookingCta: { label: "See Osaka activities", href: osakaUrl, category: "activity" },
        prepare: "Forward luggage if switching hotels",
      },
      {
        day: 9,
        location: "Osaka",
        title: "Osaka food and flexible day",
        highlights: ["Option A: Universal Studios Japan (book early)", "Option B: Osaka Castle → Shinsekai → Kuromon Market", "Option C: Day trip to Kobe (30 min) for beef and harbour views", "Evening: Osaka street food tour or Amerikamura nightlife"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
        stayHotelKey: "namba",
        bookingCta: { label: "Book USJ tickets", href: usjUrl, category: "activity" },
      },
      {
        day: 10,
        location: "Osaka → Depart",
        title: "Departure day",
        highlights: ["Morning: Kuromon Market or last-minute shopping", "Head to KIX (Kansai Airport) for departure", "Alternative: Shinkansen back to Tokyo if flying from Narita/Haneda"],
        transport: "Nankai or JR to KIX, or Shinkansen to Tokyo",
        prepare: "Airport transfer buffer and final checklist",
        bookingCta: { label: "Osaka → KIX routes", href: "/airport-transfers/osaka-to-kansai-airport", category: "transfer" },
      },
    ],
    proTip: "With 10 days on a Tokyo → Kyoto → Osaka route, a JR Pass usually does not pay off unless you add Hiroshima or return to Tokyo by Shinkansen. Single Shinkansen tickets are simpler. Spend the saved complexity on enjoying the extra days.",
    nextActions: [
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare Shinjuku, Ueno, Asakusa, Tokyo Station.", cta: "Compare areas", href: "/areas-to-stay/tokyo-first-time" },
      { id: "stay-kyoto", category: "stay", title: "Where to stay in Kyoto", description: "Kyoto Station vs Gion vs Kawaramachi.", cta: "Compare areas", href: "/areas-to-stay/kyoto-first-time" },
      { id: "stay-osaka", category: "stay", title: "Where to stay in Osaka", description: "Namba, Umeda, or Shin-Osaka — which base?", cta: "Compare areas", href: "/areas-to-stay/osaka-first-time" },
      { id: "seat", category: "train", title: "Check Fuji-side seat", description: "Find the right window seat for Mt. Fuji views.", cta: "Check seat", href: "/tokyo-to-kyoto-mt-fuji-seat" },
      { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Set up data before landing.", cta: "Get eSIM", href: esimUrl },
      { id: "local-tokyo", category: "experience", title: "Explore Local Tokyo", description: "Kiyosumi-Shirakawa, Kuramae, Oshiage and more.", cta: "See neighbourhoods", href: "/local-tokyo" },
    ],
  },
  {
    slug: "14-day-japan-golden-route",
    title: "14-Day Japan Golden Route Itinerary for First-Time Visitors",
    description: "A practical 14-day Japan itinerary covering Tokyo, East Tokyo, Mt. Fuji Shinkansen views, Kyoto, Osaka, Nara and optional Hiroshima, with hotels and transport planning.",
    duration: "14 days",
    pace: "relaxed",
    bestFor: "First-time visitors who want the classic route without rushing",
    days: [
      {
        day: 1,
        location: "Tokyo",
        title: "Arrive & settle in",
        highlights: ["Land at Narita or Haneda, transfer to hotel", "Activate eSIM and get IC card at the airport", "Evening: walk your neighbourhood — Shinjuku, Ueno, or Asakusa"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        transport: "Airport transfer to hotel",
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku", category: "transfer" },
        prepare: "eSIM / IC card",
        prepareCta: { label: "Get eSIM", href: esimUrl },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "Classic Tokyo highlights",
        highlights: ["Morning: Senso-ji temple (Asakusa) → Nakamise shopping", "Afternoon: Akihabara or Ueno Park museums", "Evening: Shibuya crossing → Shibuya Sky observation deck"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl, category: "activity" },
      },
      {
        day: 3,
        location: "Tokyo — East Tokyo",
        title: "East Tokyo slow day",
        highlights: ["Morning: Kiyosumi-Shirakawa — specialty coffee and gardens", "Afternoon: Kuramae craft shops or Oshiage / Skytree", "Evening: Sumida River walk → local izakaya dinner"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        prepare: "Explore Local Tokyo",
        prepareCta: { label: "Local Tokyo guide", href: "/local-tokyo" },
      },
      {
        day: 4,
        location: "Tokyo",
        title: "Harajuku, Meiji & west Tokyo",
        highlights: ["Morning: Meiji Shrine → Harajuku → Omotesando", "Afternoon: Shinjuku Gyoen gardens", "Evening: Golden Gai or Omoide Yokocho"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        bookingCta: { label: "See Tokyo food tours", href: foodTourTokyoUrl, category: "activity" },
      },
      {
        day: 5,
        location: "Day trip: Nikko or Kamakura",
        title: "Day trip from Tokyo",
        highlights: ["Nikko: Toshogu Shrine, mountain scenery (2h from Asakusa)", "Or Kamakura: Great Buddha, beach town vibe (1h from Shinjuku)", "Return to Tokyo by evening"],
        stayArea: "Shinjuku",
        stayLink: hotelShinjuku.href,
        stayHotelKey: "shinjuku",
        bookingCta: { label: "Book Nikko day trip", href: nikkoUrl, category: "tour" },
      },
      {
        day: 6,
        location: "Tokyo → Kyoto",
        title: "Shinkansen day — see Mt. Fuji",
        highlights: ["Take Tokaido Shinkansen Tokyo → Kyoto (2h15m)", "Sit on the right side (Seat E) for the Mt. Fuji view", "Afternoon: Fushimi Inari — walk the torii gates", "Evening: Gion district walk and dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        transport: "Shinkansen (compare single ticket vs JR Pass)",
        bookingCta: { label: "Book Shinkansen ticket", href: shinkansenTicketUrl, category: "train" },
        prepare: "Check Fuji-side seat",
        prepareCta: { label: "Which seat for Fuji?", href: "/tokyo-to-kyoto-mt-fuji-seat" },
      },
      {
        day: 7,
        location: "Kyoto",
        title: "North Kyoto temples",
        highlights: ["Morning: Kinkaku-ji (Golden Pavilion)", "Afternoon: Ryoan-ji rock garden → Ninna-ji", "Evening: Nishiki Market → kaiseki dinner"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        bookingCta: { label: "See Kyoto activities", href: kyotoUrl, category: "activity" },
      },
      {
        day: 8,
        location: "Kyoto",
        title: "Arashiyama & south Kyoto",
        highlights: ["Morning: Arashiyama bamboo grove and monkey park", "Afternoon: Tofuku-ji or Sanjusangendo", "Evening: Free evening — rest or explore Pontocho"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        bookingCta: { label: "Book kimono rental", href: kimonoUrl, category: "activity" },
      },
      {
        day: 9,
        location: "Day trip: Nara",
        title: "Nara — deer park & giant Buddha",
        highlights: ["JR or Kintetsu to Nara (45 min from Kyoto)", "Todai-ji — world's largest wooden building", "Walk through deer park and Kasuga Taisha shrine", "Return to Kyoto by evening"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        bookingCta: { label: "Book Nara trip", href: naraUrl, category: "tour" },
      },
      {
        day: 10,
        location: "Kyoto → Osaka",
        title: "Move to Osaka",
        highlights: ["Morning: Philosopher's Path or last Kyoto temple", "Afternoon: Train to Osaka (15–30 min)", "Evening: Dotonbori street food — takoyaki, okonomiyaki, kushikatsu"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
        stayHotelKey: "namba",
        transport: "JR or Hankyu to Osaka (15–30 min)",
        bookingCta: { label: "See Osaka activities", href: osakaUrl, category: "activity" },
      },
      {
        day: 11,
        location: "Osaka",
        title: "Osaka food & city day",
        highlights: ["Morning: Osaka Castle park", "Afternoon: Shinsekai district → Tsutenkaku Tower", "Evening: Osaka street food tour or Kuromon Market"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
        stayHotelKey: "namba",
        bookingCta: { label: "See Osaka food tours", href: foodTourOsakaUrl, category: "activity" },
      },
      {
        day: 12,
        location: "Osaka — flexible day",
        title: "USJ, Kobe, or extra Nara",
        highlights: ["Option A: Universal Studios Japan (book well in advance)", "Option B: Day trip to Kobe (30 min) — beef, harbour, Chinatown", "Option C: Return to Nara if you missed it, or revisit Kyoto", "Evening: Amerikamura or Umeda night views"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
        stayHotelKey: "namba",
        bookingCta: { label: "Book USJ tickets", href: usjUrl, category: "activity" },
      },
      {
        day: 13,
        location: "Optional: Hiroshima day trip",
        title: "Hiroshima & Miyajima (optional)",
        highlights: ["Shinkansen Osaka → Hiroshima (1h20m)", "Peace Memorial Park and Museum", "Ferry to Miyajima — floating torii gate", "Return to Osaka by evening"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
        stayHotelKey: "namba",
        transport: "Shinkansen round trip (JR Pass helps here)",
        bookingCta: { label: "See Hiroshima activities", href: hiroshimaUrl, category: "activity" },
        prepare: "This leg may tip the JR Pass decision",
      },
      {
        day: 14,
        location: "Osaka → Depart",
        title: "Departure day",
        highlights: ["Morning: Kuromon Market or last-minute shopping", "Head to KIX (Kansai Airport) for departure", "Alternative: Shinkansen back to Tokyo if flying from Narita/Haneda"],
        transport: "Nankai or JR to KIX, or Shinkansen to Tokyo",
        prepare: "Airport transfer buffer and final checklist",
        bookingCta: { label: "Osaka → KIX routes", href: "/airport-transfers/osaka-to-kansai-airport", category: "transfer" },
      },
    ],
    proTip: "14 days on the golden route gives you flexibility most itineraries don't have. Use it: skip a temple if you're tired, spend an extra evening in Dotonbori, or add the Hiroshima day trip. A JR Pass may be worth it if you do the Hiroshima round trip — otherwise single tickets are usually simpler.",
    nextActions: [
      { id: "stay-tokyo", category: "stay", title: "Where to stay in Tokyo", description: "Compare Shinjuku, Ueno, Asakusa, Tokyo Station.", cta: "Compare areas", href: "/areas-to-stay/tokyo-first-time" },
      { id: "stay-kyoto", category: "stay", title: "Where to stay in Kyoto", description: "Kyoto Station vs Gion vs Kawaramachi.", cta: "Compare areas", href: "/areas-to-stay/kyoto-first-time" },
      { id: "stay-osaka", category: "stay", title: "Where to stay in Osaka", description: "Namba, Umeda, or Shin-Osaka — which base?", cta: "Compare areas", href: "/areas-to-stay/osaka-first-time" },
      { id: "seat", category: "train", title: "Check Fuji-side seat", description: "Find the right window seat for Mt. Fuji views.", cta: "Check seat", href: "/tokyo-to-kyoto-mt-fuji-seat" },
      { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Set up data before landing.", cta: "Get eSIM", href: esimUrl },
      { id: "local-tokyo", category: "experience", title: "Explore Local Tokyo", description: "Kiyosumi-Shirakawa, Kuramae, Oshiage and more.", cta: "See neighbourhoods", href: "/local-tokyo" },
    ],
  },
  {
    slug: "tokyo-kyoto-osaka-without-jr-pass",
    title: "Tokyo, Kyoto and Osaka Without a JR Pass: Simple Itinerary and Booking Plan",
    description: "Plan Tokyo, Kyoto and Osaka without a JR Pass. Compare single Shinkansen tickets, hotel areas, airport transfers, eSIM and activities for a first Japan trip.",
    duration: "7–10 days",
    pace: "moderate",
    bestFor: "First-time visitors doing the simple Tokyo → Kyoto → Osaka route without a JR Pass",
    days: [
      {
        day: 1,
        location: "Tokyo",
        title: "Arrive & settle in",
        highlights: ["Land at Narita or Haneda, transfer to hotel", "Activate eSIM, get IC card (Suica/Pasmo)", "No need to pick up a JR Pass — you're buying single tickets for this route"],
        stayArea: "Tokyo Station area",
        stayLink: hotelTokyoStation.href,
        stayHotelKey: "tokyoStation",
        transport: "Airport transfer to hotel",
        bookingCta: { label: "Book airport transfer", href: "/airport-transfers/narita-to-shinjuku", category: "transfer" },
        prepare: "eSIM / IC card / no JR Pass needed",
        prepareCta: { label: "Get eSIM", href: esimUrl },
      },
      {
        day: 2,
        location: "Tokyo",
        title: "Tokyo sightseeing",
        highlights: ["Use IC card for all local trains and buses — no pass needed", "Morning: Senso-ji (Asakusa) → Ueno", "Afternoon: Shibuya crossing → Harajuku", "Evening: Shinjuku or Tokyo Tower"],
        stayArea: "Tokyo Station area",
        stayLink: hotelTokyoStation.href,
        stayHotelKey: "tokyoStation",
        bookingCta: { label: "See Tokyo activities", href: tokyoUrl, category: "activity" },
        prepare: "IC card covers all local transport in Tokyo",
      },
      {
        day: 3,
        location: "Tokyo (extra day)",
        title: "Deeper Tokyo or day trip",
        highlights: ["East Tokyo: Kiyosumi-Shirakawa, Kuramae, Oshiage", "Or day trip: Nikko (2h), Kamakura (1h)", "Or: teamLab, Tsukiji Market, Odaiba"],
        stayArea: "Tokyo Station area",
        stayLink: hotelTokyoStation.href,
        stayHotelKey: "tokyoStation",
        bookingCta: { label: "See teamLab tickets", href: teamlabUrl, category: "activity" },
        prepare: "Local Tokyo neighbourhoods",
        prepareCta: { label: "Local Tokyo guide", href: "/local-tokyo" },
      },
      {
        day: 4,
        location: "Tokyo → Kyoto",
        title: "Shinkansen to Kyoto — single ticket, no pass",
        highlights: ["Buy Shinkansen ticket at Tokyo Station or online (¥13,320 one-way)", "Tokaido Shinkansen Tokyo → Kyoto (2h15m)", "Sit on the right side (Seat E) for Mt. Fuji views", "Afternoon: Fushimi Inari torii gates"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        transport: "Shinkansen single ticket (¥13,320)",
        bookingCta: { label: "Book Shinkansen ticket", href: shinkansenTicketUrl, category: "train" },
        prepare: "Check Fuji-side seat",
        prepareCta: { label: "Which seat for Fuji?", href: "/tokyo-to-kyoto-mt-fuji-seat" },
      },
      {
        day: 5,
        location: "Kyoto",
        title: "Kyoto temples & traditions",
        highlights: ["Morning: Kinkaku-ji → Ryoan-ji", "Afternoon: Arashiyama bamboo grove", "Evening: Gion walk and Pontocho dinner", "Local transport: city bus day pass (¥700) or IC card"],
        stayArea: "Kyoto Station area",
        stayLink: hotelKyotoStation.href,
        stayHotelKey: "kyotoStation",
        bookingCta: { label: "See Kyoto activities", href: kyotoUrl, category: "activity" },
        prepare: "Kyoto bus day pass is separate from JR — works without any pass",
      },
      {
        day: 6,
        location: "Kyoto → Osaka",
        title: "Move to Osaka — no Shinkansen needed",
        highlights: ["Take JR Special Rapid to Osaka (30 min, ¥580 — no JR Pass needed)", "This is a local train, covered by IC card", "Afternoon: Osaka Castle or Shinsekai", "Evening: Dotonbori street food"],
        stayArea: "Namba / Dotonbori",
        stayLink: hotelNamba.href,
        stayHotelKey: "namba",
        transport: "JR Special Rapid (30 min, ¥580 on IC card)",
        bookingCta: { label: "See Osaka activities", href: osakaUrl, category: "activity" },
        prepare: "Kyoto → Osaka is cheap — no pass needed for this leg",
      },
      {
        day: 7,
        location: "Osaka → Depart",
        title: "Departure day",
        highlights: ["Morning: Kuromon Market or last shopping", "Head to KIX — Nankai Rapi:t or JR Haruka (both are single tickets, no pass)", "Or Shinkansen back to Tokyo (single ticket ¥13,870) if flying from Narita/Haneda"],
        transport: "Nankai Rapi:t to KIX (¥1,450) or Shinkansen to Tokyo",
        prepare: "Final checklist: eSIM return, luggage, airport transfer",
      },
    ],
    proTip: "For the basic Tokyo → Kyoto → Osaka route, single Shinkansen tickets total ~¥13,320 one-way. A 7-day JR Pass costs ~¥50,000. Unless you're adding Hiroshima, multiple long-distance rides, or returning to Tokyo by Shinkansen, the pass doesn't pay off. Keep it simple: buy tickets at the station or book online.",
    nextActions: [
      { id: "stay-before-shinkansen", category: "stay", title: "Where to stay before the Shinkansen", description: "Choose between Tokyo Station, Shinjuku, and Ueno.", cta: "Compare areas", href: "/areas-to-stay/where-to-stay-before-shinkansen" },
      { id: "seat", category: "train", title: "Check Fuji-side seat", description: "Which window seat faces Mt. Fuji.", cta: "Check seat", href: "/tokyo-to-kyoto-mt-fuji-seat" },
      { id: "stay-kyoto", category: "stay", title: "Where to stay in Kyoto", description: "Station area vs Gion vs Kawaramachi.", cta: "Compare areas", href: "/areas-to-stay/kyoto-first-time" },
      { id: "stay-osaka", category: "stay", title: "Where to stay in Osaka", description: "Namba, Umeda, Shin-Osaka — which base?", cta: "Compare areas", href: "/areas-to-stay/osaka-first-time" },
      { id: "esim", category: "connectivity", title: "Get Japan eSIM", description: "Maps, translate, transit apps from landing.", cta: "Get eSIM", href: esimUrl },
      { id: "transfer", category: "transfer", title: "Airport transfer", description: "Compare Narita/Haneda to city options.", cta: "Compare options", href: "/airport-transfers" },
    ],
  },
];

export const itineraryRedirects: Record<string, string> = {
  "10-day-with-fuji": "10-day-japan-with-fuji",
  "14-day-deep-japan": "14-day-japan-golden-route",
};

export const publicItineraryPages = itineraryPages.filter(
  (page) => !Object.prototype.hasOwnProperty.call(itineraryRedirects, page.slug),
);

// ─── Lookup ─────────────────────────────────────────────────────────────────

export function getItineraryBySlug(slug: string): ItineraryPage | undefined {
  return itineraryPages.find((p) => p.slug === slug);
}

export function getAllItinerarySlugs(): string[] {
  return itineraryPages.map((p) => p.slug);
}

export function getPublicItinerarySlugs(): string[] {
  return publicItineraryPages.map((p) => p.slug);
}
