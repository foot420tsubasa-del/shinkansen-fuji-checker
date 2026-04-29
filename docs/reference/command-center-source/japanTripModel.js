// japanTripModel.js
// Japan Trip Command Center — data layer
// Drop-in replacement for tripModel.js from andrewjiang/palantir-for-family-trips

export const JAPAN_MAP_CENTER = { lat: 36.2, lng: 138.5 };
export const JAPAN_MAP_ZOOM = 6;

// Shinkansen route polyline coordinates (Tokaido + Sanyo main corridor)
export const SHINKANSEN_ROUTE = [
  { lat: 35.6812, lng: 139.7671 }, // Tokyo
  { lat: 35.4658, lng: 139.6223 }, // Shin-Yokohama
  { lat: 35.1167, lng: 138.9167 }, // Shin-Fuji (Fuji viewing zone)
  { lat: 34.9667, lng: 138.3833 }, // Shizuoka
  { lat: 34.7108, lng: 137.7339 }, // Hamamatsu
  { lat: 34.8549, lng: 136.8053 }, // Nagoya
  { lat: 35.0120, lng: 135.7556 }, // Kyoto
  { lat: 34.7332, lng: 135.5000 }, // Shin-Osaka
  { lat: 34.3916, lng: 132.4596 }, // Hiroshima
  { lat: 33.5898, lng: 130.4200 }, // Hakata (Fukuoka)
];

export const CITIES = [
  {
    id: "tokyo",
    name: "TOKYO",
    codename: "Base Alpha",
    lat: 35.6812,
    lng: 139.7671,
    days: "Day 1–3",
    district: "Shinjuku · Shibuya · Asakusa",
    status: "active", // active | pending | locked
    seatRecommendation: "Seat E, Car 3–7 (Mt. Fuji side)",
    highlights: ["Senso-ji Temple", "Akihabara", "Shibuya Crossing", "teamLab"],
    intel: [
      { tag: "IC CARD", level: "ok", text: "Buy Suica at Tokyo Station JR office or any airport vending machine." },
      { tag: "TRANSIT", level: "ok", text: "Tokyo Metro day pass (¥600) covers most inner-city missions efficiently." },
      { tag: "CASH", level: "warn", text: "7-Eleven and Japan Post ATMs accept foreign Visa/Mastercard." },
    ],
    klookUrl: "https://www.klook.com/en-US/city/7-tokyo-things-to-do/",
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
    klookUrl: "https://www.klook.com/en-US/activity/3689-nikko-day-trip-tokyo/",
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
    klookUrl: "https://www.klook.com/en-US/city/17-kyoto-things-to-do/",
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
    klookUrl: "https://www.klook.com/en-US/city/18-osaka-things-to-do/",
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
    klookUrl: "https://www.klook.com/en-US/city/13-hiroshima-things-to-do/",
  },
];

export const MISSION_CHECKLIST = [
  { id: "jrpass", label: "JR Pass activated", done: true, critical: false },
  { id: "suica", label: "Suica IC Card loaded", done: true, critical: true },
  { id: "wifi", label: "Pocket WiFi / eSIM", done: true, critical: true },
  { id: "maps", label: "Google Maps offline (Japan)", done: true, critical: false },
  { id: "cash", label: "¥50,000+ cash withdrawn", done: false, critical: true },
  { id: "temples", label: "Kyoto temple bookings", done: false, critical: true },
  { id: "translate", label: "DeepL / Google Translate", done: false, critical: false },
  { id: "insurance", label: "Travel insurance docs", done: false, critical: false },
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
