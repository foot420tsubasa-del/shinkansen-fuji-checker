// japanTripModel.js
// Japan Trip Command Center — data layer
// Drop-in replacement for tripModel.js from andrewjiang/palantir-for-family-trips

export const TRIP_DEPARTURE_DATE = "2026-05-15";

export const JAPAN_MAP_CENTER = { lat: 36.2, lng: 138.5 };
export const JAPAN_MAP_ZOOM = 6;

export const EMERGENCY_CONTACTS = [
  { label: "Police", number: "110", icon: "🚨", note: "English support available" },
  { label: "Ambulance / Fire", number: "119", icon: "🚑", note: "Say 'kyuukyuu' (ambulance)" },
  { label: "JNTO Tourist Hotline", number: "050-3816-2787", icon: "📞", note: "24/7 multilingual" },
  { label: "Emergency Translation", number: "03-5285-8185", icon: "🌐", note: "Himawari — free interpreter" },
  { label: "US Embassy Tokyo", number: "03-3224-5000", icon: "🏛", note: "After hours: same number" },
  { label: "Lost & Found (JR East)", number: "050-2016-1601", icon: "🔍", note: "English line available" },
];

// Shinkansen route polyline — traced along actual Tokaido + Sanyo track alignment
export const SHINKANSEN_ROUTE = [
  // ── Tokyo → Shinagawa → Shin-Yokohama ──
  { lat: 35.6812, lng: 139.7671 }, // Tokyo Station
  { lat: 35.6284, lng: 139.7388 }, // Shinagawa Station
  { lat: 35.5756, lng: 139.6720 }, // Musashi-Kosugi area
  { lat: 35.5076, lng: 139.6173 }, // Shin-Yokohama Station
  // ── Shin-Yokohama → Odawara (INLAND through Yamato/Ebina/Hadano) ──
  { lat: 35.4700, lng: 139.5700 }, // Midori-ku/Izumi-ku
  { lat: 35.4450, lng: 139.4600 }, // Yamato area
  { lat: 35.4200, lng: 139.3900 }, // Ebina area
  { lat: 35.3850, lng: 139.3200 }, // Isehara area
  { lat: 35.3500, lng: 139.2500 }, // Hadano/Matsuda area
  { lat: 35.3100, lng: 139.1900 }, // Kaisei area
  { lat: 35.2561, lng: 139.1554 }, // Odawara Station
  // ── Odawara → Atami (through tunnels in mountains) ──
  { lat: 35.2300, lng: 139.1300 }, // West Odawara
  { lat: 35.2000, lng: 139.1050 }, // Nebukawa tunnel
  { lat: 35.1650, lng: 139.0900 }, // Manazuru tunnel area
  { lat: 35.1043, lng: 139.0776 }, // Atami Station
  // ── Atami → Mishima → Shin-Fuji (Tanna tunnel, then along coast) ──
  { lat: 35.1100, lng: 139.0200 }, // Tanna tunnel east
  { lat: 35.1200, lng: 138.9600 }, // Tanna tunnel west
  { lat: 35.1267, lng: 138.9111 }, // Mishima Station
  { lat: 35.1350, lng: 138.8500 }, // Numazu area
  { lat: 35.1420, lng: 138.7700 }, // Fuji city east
  { lat: 35.1441, lng: 138.6254 }, // Shin-Fuji Station
  // ── Shin-Fuji → Shizuoka ──
  { lat: 35.1100, lng: 138.5500 }, // Yui area
  { lat: 35.0600, lng: 138.4800 }, // Shimizu area
  { lat: 34.9710, lng: 138.3889 }, // Shizuoka Station
  // ── Shizuoka → Kakegawa → Hamamatsu ──
  { lat: 34.9200, lng: 138.2600 }, // Yaizu area
  { lat: 34.8500, lng: 138.1200 }, // Kikugawa area
  { lat: 34.7694, lng: 137.9965 }, // Kakegawa Station
  { lat: 34.7400, lng: 137.8600 }, // Fukuroi area
  { lat: 34.7200, lng: 137.7900 }, // Iwata area
  { lat: 34.7036, lng: 137.7343 }, // Hamamatsu Station
  // ── Hamamatsu → Toyohashi → Nagoya ──
  { lat: 34.7500, lng: 137.6400 }, // Hamana Lake north shore
  { lat: 34.7600, lng: 137.5600 }, // Araimachi area (north of lake)
  { lat: 34.7500, lng: 137.5000 }, // Kosai area
  { lat: 34.7633, lng: 137.3822 }, // Toyohashi Station
  { lat: 34.8300, lng: 137.2200 }, // Gamagori area
  { lat: 34.9000, lng: 137.1100 }, // Okazaki area
  { lat: 34.9583, lng: 137.0572 }, // Mikawa-Anjo Station
  { lat: 35.0500, lng: 136.9700 }, // Chiryu area
  { lat: 35.1100, lng: 136.9200 }, // Owari area
  { lat: 35.1709, lng: 136.8815 }, // Nagoya Station
  // ── Nagoya → Gifu-Hashima → Sekigahara → Maibara ──
  { lat: 35.2100, lng: 136.8300 }, // Ichinomiya area
  { lat: 35.2700, lng: 136.7400 }, // Hashima area
  { lat: 35.3148, lng: 136.6756 }, // Gifu-Hashima Station
  { lat: 35.3400, lng: 136.5500 }, // Ogaki area
  { lat: 35.3650, lng: 136.4700 }, // Sekigahara west
  { lat: 35.3600, lng: 136.3800 }, // Sekigahara pass
  { lat: 35.3146, lng: 136.2881 }, // Maibara Station
  // ── Maibara → Kyoto (EAST shore of Lake Biwa, then south around lake) ──
  { lat: 35.2750, lng: 136.2650 }, // Hikone (east shore of lake)
  { lat: 35.2200, lng: 136.2300 }, // Toyosato area (east of lake)
  { lat: 35.1550, lng: 136.1500 }, // Omi-Hachiman area (east of lake)
  { lat: 35.0900, lng: 136.0700 }, // Yasu area (southeast of lake)
  { lat: 35.0400, lng: 136.0100 }, // Ritto/Moriyama area
  { lat: 35.0150, lng: 135.9600 }, // Kusatsu (south tip of lake)
  { lat: 35.0050, lng: 135.8900 }, // Otsu area (south of lake)
  { lat: 34.9858, lng: 135.7587 }, // Kyoto Station
  // ── Kyoto → Shin-Osaka ──
  { lat: 34.9500, lng: 135.7300 }, // Minami-ku Kyoto
  { lat: 34.9100, lng: 135.6800 }, // Nagaokakyo
  { lat: 34.8600, lng: 135.6200 }, // Takatsuki
  { lat: 34.8100, lng: 135.5700 }, // Ibaraki
  { lat: 34.7640, lng: 135.5200 }, // Suita
  { lat: 34.7332, lng: 135.5000 }, // Shin-Osaka Station
  // ── Shin-Osaka → Shin-Kobe → Himeji ──
  { lat: 34.7100, lng: 135.4300 }, // Amagasaki
  { lat: 34.6900, lng: 135.2800 }, // Ashiya/Nishinomiya
  { lat: 34.6916, lng: 135.1710 }, // Shin-Kobe Station
  { lat: 34.7100, lng: 135.0300 }, // Akashi area
  { lat: 34.7400, lng: 134.8700 }, // Kakogawa
  { lat: 34.8150, lng: 134.6880 }, // Himeji Station
  // ── Himeji → Okayama ──
  { lat: 34.7900, lng: 134.5500 }, // Tatsuno area
  { lat: 34.7500, lng: 134.4000 }, // Aioi Station area
  { lat: 34.7400, lng: 134.2500 }, // Bizen area
  { lat: 34.7300, lng: 134.1000 }, // Seto area
  { lat: 34.6700, lng: 133.9200 }, // Okayama Station
  // ── Okayama → Hiroshima (inland route) ──
  { lat: 34.6100, lng: 133.7700 }, // Kurashiki
  { lat: 34.5850, lng: 133.5800 }, // Shin-Kurashiki area
  { lat: 34.4875, lng: 133.3629 }, // Fukuyama Station
  { lat: 34.4500, lng: 133.2000 }, // Onomichi area
  { lat: 34.4000, lng: 133.0800 }, // Mihara Station area
  { lat: 34.4300, lng: 132.9000 }, // Saijo area
  { lat: 34.4268, lng: 132.7433 }, // Higashi-Hiroshima
  { lat: 34.3916, lng: 132.4596 }, // Hiroshima Station
  // ── Hiroshima → Hakata ──
  { lat: 34.3500, lng: 132.3000 }, // Itsukaichi
  { lat: 34.2900, lng: 132.1300 }, // Ono area
  { lat: 34.1700, lng: 131.9400 }, // Iwakuni
  { lat: 34.1200, lng: 131.7500 }, // Shimada area
  { lat: 34.0550, lng: 131.5700 }, // Tokuyama/Shunan
  { lat: 34.0200, lng: 131.3500 }, // Shin-Yamaguchi
  { lat: 33.9800, lng: 131.1200 }, // Asa area
  { lat: 33.9600, lng: 130.9400 }, // Ube/Shimonoseki
  { lat: 33.9500, lng: 130.8500 }, // Shin-Shimonoseki
  { lat: 33.8842, lng: 130.7513 }, // Kokura Station
  { lat: 33.7500, lng: 130.5800 }, // Hakata approach
  { lat: 33.5898, lng: 130.4200 }, // Hakata Station
];

import { getAffUrl } from "./affiliateLinks";

export const CITIES = [
  {
    id: "tokyo",
    name: "TOKYO",
    codename: "Base Alpha",
    lat: 35.6812,
    lng: 139.7671,
    days: "Day 1–3",
    district: "Shinjuku · Shibuya · Asakusa",
    status: "active",
    seatRecommendation: "Seat E, Car 3–7 (Mt. Fuji side)",
    highlights: ["Senso-ji Temple", "Akihabara", "Shibuya Crossing", "teamLab"],
    intel: [
      { tag: "IC CARD", level: "ok", text: "Buy Suica at Tokyo Station JR office or any airport vending machine." },
      { tag: "TRANSIT", level: "ok", text: "Tokyo Metro day pass (¥600) covers most inner-city missions efficiently." },
      { tag: "CASH", level: "warn", text: "7-Eleven and Japan Post ATMs accept foreign Visa/Mastercard." },
    ],
    klookUrl: getAffUrl("cityTokyo"),
  },
  {
    id: "nikko",
    name: "NIKKO",
    codename: "Sector Foxtrot",
    lat: 36.7198,
    lng: 139.6983,
    days: "Day 2 (day trip)",
    district: "Toshogu Shrine area",
    status: "pending",
    seatRecommendation: "Tobu Nikko Line from Asakusa (no shinkansen needed)",
    highlights: ["Toshogu Shrine", "Kegon Falls", "Lake Chuzenji"],
    intel: [
      { tag: "ACCESS", level: "ok", text: "Tobu Nikko Pass covers round-trip train + local bus (¥2,780 from Asakusa)." },
    ],
    klookUrl: getAffUrl("cityNikko"),
  },
  {
    id: "kyoto",
    name: "KYOTO",
    codename: "Sector Bravo",
    lat: 35.0120,
    lng: 135.7556,
    days: "Day 4–6",
    district: "Gion · Higashiyama",
    status: "pending",
    seatRecommendation: "Seat E departing Tokyo — Mt. Fuji visible near Shin-Fuji",
    highlights: ["Fushimi Inari", "Arashiyama", "Kinkaku-ji", "Gion night walk"],
    intel: [
      { tag: "BOOK NOW", level: "warn", text: "Fushimi Inari is free & 24hr — no booking needed. Arashiyama bamboo best before 8am." },
      { tag: "CASH", level: "warn", text: "Many Kyoto temples are cash-only entry. Carry ¥3,000+ per person." },
      { tag: "ETIQUETTE", level: "ok", text: "No photography of geiko/maiko in Gion without consent. Strict since 2024." },
    ],
    klookUrl: getAffUrl("cityKyoto"),
  },
  {
    id: "osaka",
    name: "OSAKA",
    codename: "Sector Charlie",
    lat: 34.6937,
    lng: 135.5023,
    days: "Day 7–8",
    district: "Namba · Dotonbori",
    status: "locked",
    seatRecommendation: "Seat A departing Osaka → Tokyo (Mt. Fuji is on left/A side)",
    highlights: ["Dotonbori", "Osaka Castle", "Kuromon Market", "Namba nightlife"],
    intel: [
      { tag: "FOOD OPS", level: "ok", text: "Dotonbori: takoyaki ¥500–800, ramen ¥900–1,200. Cash preferred at stalls." },
    ],
    klookUrl: getAffUrl("cityOsaka"),
  },
  {
    id: "hiroshima",
    name: "HIROSHIMA",
    codename: "Sector Delta",
    lat: 34.3916,
    lng: 132.4596,
    days: "Day 9 (day trip from Osaka)",
    district: "Peace Memorial · Miyajima",
    status: "locked",
    seatRecommendation: "JR Pass: Hikari or Kodama (Nozomi not covered)",
    highlights: ["Peace Memorial Museum", "Miyajima Island", "Itsukushima Shrine"],
    intel: [
      { tag: "JR PASS", level: "ok", text: "Miyajima ferry covered by JR Pass from Hiroshima pier." },
    ],
    klookUrl: getAffUrl("cityHiroshima"),
  },
];

export const ROUTE_TEMPLATES = [
  {
    id: "classic-7",
    name: "7-DAY CLASSIC",
    description: "Tokyo → Kyoto → Osaka",
    duration: "7 days",
    cities: [
      { id: "tokyo", days: "Day 1–3", status: "active" },
      { id: "kyoto", days: "Day 4–5", status: "pending" },
      { id: "osaka", days: "Day 6–7", status: "locked" },
    ],
  },
  {
    id: "full-10",
    name: "10-DAY GOLDEN ROUTE",
    description: "Tokyo → Nikko → Kyoto → Osaka → Hiroshima",
    duration: "10 days",
    cities: [
      { id: "tokyo", days: "Day 1–3", status: "active" },
      { id: "nikko", days: "Day 2 (day trip)", status: "pending" },
      { id: "kyoto", days: "Day 4–6", status: "pending" },
      { id: "osaka", days: "Day 7–8", status: "locked" },
      { id: "hiroshima", days: "Day 9 (day trip)", status: "locked" },
    ],
  },
  {
    id: "express-5",
    name: "5-DAY EXPRESS",
    description: "Tokyo → Osaka",
    duration: "5 days",
    cities: [
      { id: "tokyo", days: "Day 1–3", status: "active" },
      { id: "osaka", days: "Day 4–5", status: "pending" },
    ],
  },
  {
    id: "deep-14",
    name: "14-DAY EXPLORER",
    description: "Tokyo → Nikko → Kyoto → Osaka → Hiroshima",
    duration: "14 days",
    cities: [
      { id: "tokyo", days: "Day 1–5", status: "active" },
      { id: "nikko", days: "Day 3 (day trip)", status: "pending" },
      { id: "kyoto", days: "Day 6–9", status: "pending" },
      { id: "osaka", days: "Day 10–12", status: "locked" },
      { id: "hiroshima", days: "Day 13 (day trip)", status: "locked" },
    ],
  },
];

export const MISSION_CHECKLIST = [
  {
    id: "jrpass", label: "Compare JR Pass vs single tickets", done: false, critical: false,
    actionUrl: getAffUrl("jrPass"),
    actionLabel: "Compare",
  },
  { id: "suica", label: "Suica IC Card loaded", done: true, critical: true },
  {
    id: "wifi", label: "Pocket WiFi / eSIM", done: true, critical: true,
    actionUrl: getAffUrl("esim"),
    actionLabel: "Get eSIM",
  },
  { id: "maps", label: "Google Maps offline (Japan)", done: true, critical: false },
  { id: "cash", label: "¥50,000+ cash withdrawn", done: false, critical: true },
  {
    id: "temples", label: "Kyoto temple bookings", done: false, critical: true,
    actionUrl: getAffUrl("cityKyoto"),
    actionLabel: "Browse Kyoto",
  },
  { id: "translate", label: "DeepL / Google Translate", done: false, critical: false },
  {
    id: "insurance", label: "Travel insurance docs", done: false, critical: false,
    actionUrl: getAffUrl("insurance"),
    actionLabel: "Get insured",
  },
  {
    id: "nex", label: "Airport transfer booked", done: false, critical: false,
    actionUrl: getAffUrl("airportTransfer"),
    actionLabel: "Book N'EX",
  },
];

// ── Restaurant / Food recommendations per city (with Klook food tour affiliate links) ──
export const RESTAURANTS = {
  tokyo: [
    { name: "Ichiran Ramen (Shibuya)", type: "Ramen", price: "¥1,000", note: "24hr, solo booths, no Japanese needed", bookable: false },
    { name: "Tsukiji Outer Market", type: "Seafood/Street food", price: "¥2,000–4,000", note: "Open 5am–2pm. Go early to avoid crowds", bookable: false },
    { name: "Gonpachi Nishi-Azabu", type: "Izakaya", price: "¥3,000–5,000", note: "Kill Bill restaurant. English menu available", bookable: false },
  ],
  nikko: [
    { name: "Hippari Dako", type: "Yuba (tofu skin)", price: "¥1,500", note: "Local specialty — yuba set meal", bookable: false },
  ],
  kyoto: [
    { name: "Nishiki Market", type: "Street food", price: "¥1,000–3,000", note: "Walk-and-eat market. Cash preferred", bookable: false },
    { name: "Gion Kappa", type: "Tempura/Kaiseki", price: "¥2,500–4,000", note: "Near Gion. English menu. Reserve dinner", bookable: false },
    { name: "Arashiyama Yoshimura", type: "Soba", price: "¥1,200", note: "River-view soba near bamboo grove", bookable: false },
  ],
  osaka: [
    { name: "Dotonbori Street Food", type: "Takoyaki/Okonomiyaki", price: "¥500–1,500", note: "Walk the strip. Cash for stalls", bookable: false },
    { name: "Kuromon Market", type: "Seafood/Wagyu", price: "¥2,000–5,000", note: "Open 9am–5pm. Try the ¥1,000 uni", bookable: false },
  ],
  hiroshima: [
    { name: "Okonomimura", type: "Okonomiyaki", price: "¥900–1,500", note: "Building of 24+ okonomiyaki shops. Pick any floor", bookable: false },
  ],
};

export const FOOD_TOUR_LINKS = {
  tokyo: { label: "Tokyo Food Tour", url: getAffUrl("foodTourTokyo") },
  kyoto: { label: "Kyoto Food Walk", url: getAffUrl("foodTourKyoto") },
  osaka: { label: "Osaka Street Food Tour", url: getAffUrl("foodTourOsaka") },
};

// ── Accommodation data per city ──
export const ACCOMMODATIONS = {
  tokyo: {
    area: "Shinjuku / Shibuya",
    stayType: "Hotel",
    checkIn: "15:00", checkOut: "11:00",
    tips: [
      "Shinjuku = best Shinkansen access (10 min to Tokyo Station)",
      "Shibuya = nightlife + shopping hub",
      "Coin lockers at stations: ¥300–700/day",
    ],
    klookUrl: getAffUrl("hotelTokyo"),
  },
  kyoto: {
    area: "Gion / Higashiyama / Kyoto Station",
    stayType: "Ryokan or Hotel",
    checkIn: "15:00–16:00", checkOut: "10:00",
    tips: [
      "Kyoto Station area = best transit access",
      "Gion = walking distance to temples",
      "Try a ryokan (traditional inn) for at least 1 night",
    ],
    klookUrl: getAffUrl("hotelKyotoStation"),
  },
  osaka: {
    area: "Namba / Shinsaibashi",
    stayType: "Hotel",
    checkIn: "15:00", checkOut: "11:00",
    tips: [
      "Namba = walking distance to Dotonbori",
      "Close to Kansai Airport via Nankai line (45 min)",
    ],
    klookUrl: getAffUrl("hotelOsaka"),
  },
};

// ── Daily Briefing data (shown once per session) ──
export const DAILY_BRIEFINGS = [
  {
    dayRange: "Day 1–3",
    cityId: "tokyo",
    title: "TOKYO OPS BRIEFING",
    watchItems: [
      { level: "warn", text: "Withdraw ¥50,000+ from 7-Eleven ATM on arrival" },
      { level: "ok", text: "Activate JR Pass at Tokyo Station JR office (bring passport)" },
      { level: "ok", text: "Load Suica card (¥2,000 minimum) for metro" },
    ],
    recommendedBookings: [
      { label: "teamLab Borderless", url: getAffUrl("teamlabBorderless") },
      { label: "Tokyo Tower", url: getAffUrl("tokyoTower") },
    ],
  },
  {
    dayRange: "Day 4–6",
    cityId: "kyoto",
    title: "KYOTO OPS BRIEFING",
    watchItems: [
      { level: "warn", text: "Carry ¥3,000+ cash — most temples are cash-only entry" },
      { level: "ok", text: "Arashiyama bamboo grove: arrive before 8am to avoid crowds" },
      { level: "warn", text: "No photos of geiko/maiko in Gion without consent" },
    ],
    recommendedBookings: [
      { label: "Kimono Rental", url: getAffUrl("kimonoRentalKyoto") },
      { label: "Fushimi Inari + Nara Day Tour", url: getAffUrl("fushimiInariNaraTour") },
    ],
  },
  {
    dayRange: "Day 7–8",
    cityId: "osaka",
    title: "OSAKA OPS BRIEFING",
    watchItems: [
      { level: "ok", text: "Osaka Amazing Pass covers 50+ attractions + unlimited metro" },
      { level: "ok", text: "Dotonbori is best after 6pm — neon lights + street food" },
    ],
    recommendedBookings: [
      { label: "Osaka Amazing Pass", url: getAffUrl("osakaAmazingPass") },
      { label: "Universal Studios Japan", url: getAffUrl("universalStudiosJapan") },
    ],
  },
];

export const INTEL_BRIEFINGS = [
  { tag: "ETIQUETTE", level: "ok", text: "No phone calls on trains. Silent mode required in all cars." },
  { tag: "CASH", level: "warn", text: "Japan is still heavily cash-based. Budget ¥5,000–10,000/person/day." },
  { tag: "JR PASS", level: "ok", text: "Nozomi/Mizuho NOT covered. Use Hikari or Kodama for JR Pass travel." },
  { tag: "TIPPING", level: "ok", text: "Tipping is not practiced in Japan. It may cause confusion or offence." },
  { tag: "FUJI VIEW", level: "ok", text: "Sit Seat E (Tokyo→Osaka) or Seat A (Osaka→Tokyo) for Mt. Fuji views." },
  { tag: "TRASH", level: "warn", text: "Almost no public bins. Pack a small bag and dispose at convenience stores." },
];

export const PHRASE_ARSENAL = [
  { jp: "すみません", romaji: "Sumimasen", en: "Excuse me / Sorry" },
  { jp: "〜はどこですか？", romaji: "~ wa doko desu ka?", en: "Where is ~?" },
  { jp: "いくらですか？", romaji: "Ikura desu ka?", en: "How much is this?" },
  { jp: "カードで払えますか？", romaji: "Kādo de haraemasu ka?", en: "Can I pay by card?" },
  { jp: "英語のメニューありますか？", romaji: "Eigo no menyu arimasu ka?", en: "Do you have an English menu?" },
  { jp: "写真を撮ってもいいですか？", romaji: "Shashin wo totte mo ii desu ka?", en: "May I take a photo?" },
];

// Google Maps dark style — command center aesthetic
export const MAP_DARK_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0e1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4a9eff" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1e3a5f" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#6b8ab0" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#4a9eff" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b8ab0" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0d1829" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3a5a40" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#131d2e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e3a5f" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1a2d4a" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#0d1829" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1a3a5c" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#4a9eff" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#060c18" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#1e3a5f" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#0a0e1a" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0d1220" }] },
];
