import {
  ESIM_URL,
  INSURANCE_URL,
  JR_PASS_URL,
} from "@/src/affiliateLinks";

export type TripPick = {
  id: string;
  category: "train" | "connectivity" | "transfer" | "stay" | "experience" | "itinerary" | "insurance";
  title: string;
  description: string;
  cta: string;
  href: string;
};

export const starterTripPicks: TripPick[] = [
  {
    id: "itinerary",
    category: "itinerary",
    title: "Choose your route",
    description: "7-day golden route or 5/10/14-day alternatives.",
    cta: "See itineraries",
    href: "/itineraries/7-day-first-time-japan",
  },
  {
    id: "shinkansen",
    category: "train",
    title: "Shinkansen ticket",
    description: "Book after you know the Fuji-side seat.",
    cta: "Book train",
    href: JR_PASS_URL,
  },
  {
    id: "esim",
    category: "connectivity",
    title: "Japan eSIM",
    description: "Set up data before landing — maps, translate, transit.",
    cta: "Get eSIM",
    href: ESIM_URL,
  },
  {
    id: "airport-transfer",
    category: "transfer",
    title: "Airport transfer",
    description: "Sort Narita/Haneda to city before arrival day.",
    cta: "Compare options",
    href: "/airport-transfers/narita-to-shinjuku",
  },
  {
    id: "tokyo-stay",
    category: "stay",
    title: "Tokyo stay",
    description: "Use Shinjuku, Ueno, or Tokyo Station as your base.",
    cta: "Compare areas",
    href: "/areas-to-stay/tokyo-first-time",
  },
  {
    id: "insurance",
    category: "insurance",
    title: "Travel insurance",
    description: "Medical + trip cancellation. Easy to skip, hard to regret.",
    cta: "See plans",
    href: INSURANCE_URL,
  },
];

export type DecisionModule = {
  id: string;
  label: string;
  title: string;
  description: string;
  tradeoff: string;
  href: string;
  cta: string;
  external?: boolean;
};

export const homeDecisionModules: DecisionModule[] = [
  {
    id: "stay-tokyo",
    label: "Areas to stay",
    title: "Tokyo base decision",
    description: "Shinjuku, Ueno, Asakusa, or Tokyo Station.",
    tradeoff: "Balance nightlife, airport access, and luggage ease.",
    href: "/areas-to-stay/tokyo-first-time",
    cta: "Compare areas",
  },
  {
    id: "transfer-narita",
    label: "Airport transfers",
    title: "Narita to city",
    description: "Choose between train, bus, and private transfer.",
    tradeoff: "Luggage and arrival time matter more than raw speed.",
    href: "/airport-transfers/narita-to-shinjuku",
    cta: "Compare options",
  },
  {
    id: "itinerary-golden-route",
    label: "Itinerary",
    title: "Tokyo to Kyoto shape",
    description: "A simple first-time Japan route with Fuji on the way.",
    tradeoff: "Use the Shinkansen day as a planning anchor.",
    href: "/itineraries/7-day-first-time-japan",
    cta: "See itinerary",
  },
  {
    id: "essentials",
    label: "Essentials",
    title: "Before you land",
    description: "eSIM, train booking, airport transfer, and backup plan.",
    tradeoff: "Small decisions that remove arrival-day friction.",
    href: ESIM_URL,
    cta: "Start with eSIM",
    external: true,
  },
];
