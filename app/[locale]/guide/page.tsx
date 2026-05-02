import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mountain, Train, Info, Wifi, ShieldCheck, Car, ExternalLink, AlertTriangle } from "lucide-react";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { KlookCTA } from "../components/KlookCTA";
import { SiteHeader } from "../components/SiteHeader";
import { getAlternates } from "@/i18n/hreflang";
import { KLOOK_URL, ESIM_URL, AIRPORT_TRANSFER_URL, INSURANCE_URL, CAR_RENTAL_URL } from "@/src/affiliateLinks";
import { GuideNextSteps } from "@/components/travel/GuideNextSteps";
import { SiteLegalLinks } from "@/components/content/SiteLegalLinks";
import { LastCheckedNote } from "@/components/content/LastCheckedNote";
import { AFFILIATE_REL } from "@/lib/link-rel";

const SITE_URL = "https://fujiseat.com";

function localizedUrl(locale: string, path: string) {
  return locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

const baseFaqSchemaItems = [
  {
    "@type": "Question",
    name: "Can I see Mt. Fuji from a non-reserved car?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Yes, but risky — you may end up in an aisle seat with no view. Reserve Seat E in advance.",
    },
  },
  {
    "@type": "Question",
    name: "How long can I see Mt. Fuji from the train?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Only about 30–60 seconds at Shinkansen speed. Have your camera ready before reaching Shin-Fuji station.",
    },
  },
  {
    "@type": "Question",
    name: "Is Seat E always the Mt. Fuji side?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "In standard 3+2 cars, yes. In Green Cars (2+2 layout), the Mt. Fuji window seat is Seat D.",
    },
  },
  {
    "@type": "Question",
    name: "What if it's cloudy?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Mt. Fuji is often hidden, especially in summer. Check the live visibility indicator at the top of fujiseat.com.",
    },
  },
  {
    "@type": "Question",
    name: "Can I see Mt. Fuji on the return trip from Osaka/Kyoto to Tokyo?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Yes — Mt. Fuji is on the LEFT side, which is again Seat E. Use the checker and select the opposite direction.",
    },
  },
  {
    "@type": "Question",
    name: "Does the Nozomi stop near Mt. Fuji?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "No, but you can still see it through the window as the train passes. Hikari and Kodama stop at Shin-Fuji station.",
    },
  },
  {
    "@type": "Question",
    name: "Is the JR Pass worth it for Tokyo to Osaka only?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Generally no. Round trip is approximately ¥29,000 vs 7-day Pass ¥50,000. The Pass makes sense if also visiting Hiroshima, Nara, etc.",
    },
  },
  {
    "@type": "Question",
    name: "Can I bring large luggage on the Shinkansen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Bags with total dimensions over 160cm and up to 250cm require a seat reservation with an oversized baggage area (予約が必要). Reserve this when booking your Shinkansen seat. Bags over 250cm are not permitted.",
    },
  },
  {
    "@type": "Question",
    name: "Is there WiFi on the Shinkansen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Onboard WiFi exists but can be unreliable. A Japan eSIM is recommended for consistent connectivity throughout your trip.",
    },
  },
  {
    "@type": "Question",
    name: "What is the best way to book Shinkansen tickets as a foreigner?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Klook — fully in English, instant mobile voucher, and you can select Seat E on the seat map.",
    },
  },
];

const extraFaqSchemaItems = [
  {
    "@type": "Question",
    name: "Which side of the bullet train for Mt. Fuji?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Bullet train is the English name for the Shinkansen. Tokyo to Kyoto or Osaka means Mt. Fuji on the right, Seat E. Kyoto or Osaka to Tokyo means Mt. Fuji on the left, also Seat E.",
    },
  },
  {
    "@type": "Question",
    name: "When can I see Mt. Fuji on the Shinkansen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "The Mt. Fuji viewing window is between Shin-Yokohama and Shizuoka stations, peaking around Shin-Fuji. Total time visible is about 30 to 60 seconds. Late morning to early afternoon, on a clear day, generally gives the best chance.",
    },
  },
  {
    "@type": "Question",
    name: "Can you see Mt. Fuji from the Nozomi Shinkansen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Yes. Although the Nozomi does not stop at Shin-Fuji, you can still see Mt. Fuji clearly from the right-side window, Seat E, when traveling Tokyo to Kyoto or Osaka. The viewing time is just slightly shorter than on Hikari or Kodama.",
    },
  },
  {
    "@type": "Question",
    name: "What is the best time of day to see Mt. Fuji from the Shinkansen?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Late morning to early afternoon usually offers the clearest view. Mornings before 10 AM can be even better in summer because heat haze has not built up yet. Late afternoon often has sun glare on the Mt. Fuji side.",
    },
  },
  {
    "@type": "Question",
    name: "Which seat letter is the Mt. Fuji window in a Green Car?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "In Green Cars, which use a 2+2 layout in cars 8 to 10 on most Tokaido Shinkansen trains, Seat D is the Mt. Fuji window seat. The same left/right rule applies: right side going to Kyoto, left side going to Tokyo.",
    },
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [...baseFaqSchemaItems, ...extraFaqSchemaItems],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Mt. Fuji Shinkansen Seat Guide",
  description: "Which side and seat letter to choose for seeing Mt. Fuji from the Tokaido Shinkansen, plus timing, route, JR Pass context, and booking steps.",
  author: {
    "@type": "Person",
    name: "fujiseat (Tokyo-based Japanese creator)",
  },
  datePublished: "2026-04-01",
  dateModified: "2026-04-27",
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to book Seat E for the Mt. Fuji view",
  step: [
    {
      "@type": "HowToStep",
      name: "Choose direction",
      text: "Choose whether you are traveling from Tokyo to Kyoto or Osaka, or from Kyoto or Osaka back to Tokyo.",
    },
    {
      "@type": "HowToStep",
      name: "Pick column E on the seat map",
      text: "In standard 3+2 Tokaido Shinkansen cars, pick Seat E for the Mt. Fuji window view.",
    },
    {
      "@type": "HowToStep",
      name: "Confirm before payment",
      text: "Before payment or ticket pickup, confirm that your reserved seat letter is E for standard cars, or D for Green Cars.",
    },
  ],
};

const enGuideCopy = {
  title: "Mt. Fuji Shinkansen Seat Guide",
  introQuick: "For Tokyo to Kyoto or Osaka, sit on the right side of the Shinkansen in Seat E. For Kyoto or Osaka back to Tokyo, sit on the left side, also Seat E. Mt. Fuji appears around Shin-Fuji station for about 30 to 60 seconds.",
  quickNav: "Quick navigation",
  checkSeatNow: "Check my seat now →",
  readFullGuide: "Read full guide ↓",
  bookOnKlook: "Book on Klook →",
  jumpTo: "Jump to:",
  jumpTldr: "TL;DR",
  jumpSide: "Which side?",
  jumpLetters: "Seat letters",
  jumpTime: "Best time",
  jumpZone: "Viewing zone",
  jumpJrPass: "JR Pass",
  jumpFaq: "FAQ",
  tldrH2: "TL;DR — which side and which seat for Mt. Fuji",
  quickLabel: "Quick answer:",
  whichSideH2: "Which side of the Shinkansen is Mt. Fuji on?",
  whichSideQuick: <>Going from Tokyo to Kyoto or Osaka, Mt. Fuji is on the <strong>right side</strong> of the Shinkansen — specifically Seat E in standard cars. Going from Kyoto or Osaka back to Tokyo, it is on the <strong>left side</strong> — also Seat E. The view appears around Shin-Fuji station and lasts about 30 to 60 seconds.</>,
  tokyoRightH3: "Tokyo → Kyoto / Osaka: right side",
  returnLeftH3: "Kyoto / Osaka → Tokyo: left side",
  sideBackH3: "What side for Tokyo to Osaka, Tokyo to Kyoto, and back",
  lettersH2: "Shinkansen seat letters explained (A, B, C, D, E)",
  lettersQuick: <>Standard Tokaido Shinkansen cars have a 3+2 seat layout with letters A, B, C on one side and D, E on the other. <strong>Seat E is the Mt. Fuji window seat</strong> in standard cars. Green Cars use a 2+2 layout where Seat D is the Mt. Fuji window. Seat A is always the opposite sea side.</>,
  seatEH3: "Seat E is the Mt. Fuji window seat in standard 3+2 cars",
  greenCarH3: "Seat D is the Mt. Fuji window in Green Cars (2+2 layout)",
  seatAH3: "Seat A is the opposite side (sea side)",
  whyEH3: "Why Seat E matters more than right side alone",
  seatAText: "Seat A is useful if you want the sea-side window, but it is not the Mt. Fuji-side window on the Tokaido Shinkansen.",
  whyEText: "When booking online, you usually choose a seat letter rather than only a side of the train. Seat E is the practical instruction most travelers need.",
  whenH2: "When to see Mt. Fuji from the Shinkansen",
  whenQuick: <>Late morning to early afternoon usually gives the clearest view of Mt. Fuji on a typical day. <strong>Winter (December–February)</strong> is the best season for a snow-capped silhouette and clear skies. Mt. Fuji is generally not visible at night because the mountain is unlit.</>,
  timeH3: "Best time of day — late morning to early afternoon",
  seasonH3: "Best season — winter for snow-cap, autumn for clear skies",
  nightH3: "Can you see Mt. Fuji at night from the Shinkansen?",
  nightText: "Usually no. Mt. Fuji is not lit at night, so even from the correct side it is normally too dark to see.",
  liveH3: "Live visibility check before you board",
  liveTextBefore: "Before booking or boarding,",
  liveLink: "check today's live visibility",
  liveTextAfter: "with the free seat checker.",
  routeH2: "Where on the route does Mt. Fuji appear?",
  routeQuick: <>Mt. Fuji becomes visible from the Tokaido Shinkansen between <strong>Shin-Yokohama and Shizuoka stations</strong>, with the clearest view around <strong>Shin-Fuji station</strong>. Total visibility window is about 30 to 60 seconds at full Shinkansen speed, so have your camera ready before reaching Shin-Fuji.</>,
  shinFujiH3: "Around Shin-Fuji station — the prime viewing zone",
  durationH3: "How long is Mt. Fuji visible from the train? (about 30-60 seconds)",
  mapH3: "Tokaido Shinkansen route map — Shin-Yokohama to Shizuoka",
  trainTypeH2: "Nozomi vs Hikari vs Kodama — which Shinkansen for Mt. Fuji?",
  trainTypeQuick: <>All three Tokaido Shinkansen services pass Mt. Fuji, and the seat to pick (Seat E) is the same regardless. <strong>Hikari and Kodama</strong> stop at Shin-Fuji station, which can give a slightly longer viewing window. <strong>Nozomi</strong> is fastest but does not stop at Shin-Fuji.</>,
  nozomiH3: "Nozomi: fastest, but no Shin-Fuji stop",
  nozomiText: "Nozomi trains still pass the Fuji viewing zone, but they do not stop at Shin-Fuji.",
  hikariH3: "Hikari and Kodama: stop at Shin-Fuji, slightly better viewing",
  typeSeatH3: "Does the train type change which seat to pick? (no — Seat E either way)",
  typeSeatText: "The left/right rule and Seat E recommendation do not change between Nozomi, Hikari, and Kodama standard cars.",
  jrPassH2: "JR Pass vs single ticket — which is cheaper for Tokyo-Kyoto?",
  jrPassQuick: <>For a simple Tokyo–Kyoto round trip, <strong>single tickets are cheaper</strong> (about ¥29,000 round trip vs ¥50,000 for a 7-day JR Pass). The Pass starts paying off only when you add Hiroshima, do 2+ long-distance rides, or take multiple Shinkansen segments in one week.</>,
  itineraryBefore: "To see how this fits into a trip plan,",
  itineraryLink: "see how this fits into a 7-day route",
  bookH2: "How to book Seat E — step by step",
  bookQuick: <>At a JR ticket office, show 「<strong>E席をお願いします</strong>」 (Please give me Seat E). On Klook, choose your route then select column E from the seat map. With a JR Pass, walk into any JR Reservation Counter — seat reservations are free.</>,
  jrOfficeH3: "At a JR ticket office (Japanese phrase included)",
  klookH3: "Booking via Klook (English UI)",
  klookText: "Choose the Tokaido Shinkansen route, then select column E on the seat map when the option is available.",
  jrPassCounterH3: "Reserving with a JR Pass",
  jrPassCounterTextBefore: "With a JR Pass, reserve your seat at a JR Reservation Counter before boarding. For an early Shinkansen day, it can help to",
  stayLink: "stay near Tokyo Station for an early Shinkansen day",
  mistakesTextBefore: "The same planning logic applies when you land:",
  mistakesLink: "do not make the same mistake on arrival day",
  mistakesTextAfter: "by choosing the wrong airport transfer for your luggage and arrival time.",
  mistakesH2: "Common mistakes when trying to see Mt. Fuji from the Shinkansen",
  priorityH2: "Priority seats (優先席) — etiquette foreigners should know",
  faqH2: "Frequently Asked Questions",
  makeEasyH2: "Make it easy with the Shinkansen Mt. Fuji Seat Checker",
  footerBrand: "fujiseat.com — Japan travel utility hub",
  footerPartner: "Partner links shown where they match the planning step.",
};

const frGuideCopy = {
  title: "Guide des sièges Shinkansen pour voir le mont Fuji",
  introQuick: "Pour Tokyo → Kyoto ou Osaka, asseyez-vous du côté droit du Shinkansen, au siège E. Pour Kyoto ou Osaka → Tokyo, asseyez-vous du côté gauche, toujours au siège E. Le mont Fuji apparaît aux alentours de Shin-Fuji pendant environ 30 à 60 secondes.",
  quickNav: "Navigation rapide",
  checkSeatNow: "Vérifier mon siège →",
  readFullGuide: "Lire le guide ↓",
  bookOnKlook: "Réserver sur Klook →",
  jumpTo: "Aller à :",
  jumpTldr: "En bref",
  jumpSide: "Quel côté ?",
  jumpLetters: "Lettres de siège",
  jumpTime: "Meilleure heure",
  jumpZone: "Zone de vue",
  jumpJrPass: "JR Pass",
  jumpFaq: "FAQ",
  tldrH2: "En bref — quel côté et quel siège pour le mont Fuji",
  quickLabel: "Réponse rapide :",
  whichSideH2: "De quel côté du Shinkansen se trouve le mont Fuji ?",
  whichSideQuick: <>Lors du trajet Tokyo → Kyoto ou Osaka, le mont Fuji se trouve <strong>du côté droit</strong> du Shinkansen — précisément au siège E dans les voitures standard. Au retour Kyoto ou Osaka → Tokyo, il se trouve <strong>du côté gauche</strong> — toujours au siège E. La vue apparaît aux alentours de la gare de Shin-Fuji et dure environ 30 à 60 secondes.</>,
  tokyoRightH3: "Tokyo → Kyoto / Osaka : côté droit",
  returnLeftH3: "Kyoto / Osaka → Tokyo : côté gauche",
  sideBackH3: "Quel côté pour Tokyo–Osaka, Tokyo–Kyoto, et le retour",
  lettersH2: "Comprendre les lettres de siège du Shinkansen (A, B, C, D, E)",
  lettersQuick: <>Les voitures standard du Tokaido Shinkansen ont une disposition 3+2, avec les lettres A, B, C d&apos;un côté et D, E de l&apos;autre. <strong>Le siège E est la place côté fenêtre du mont Fuji</strong> dans les voitures standard. Les Green Cars utilisent une disposition 2+2 où le siège D donne sur le mont Fuji. Le siège A se trouve toujours du côté opposé (côté mer).</>,
  seatEH3: "Le siège E est la fenêtre côté mont Fuji dans les voitures standard",
  greenCarH3: "Le siège D est la fenêtre côté mont Fuji en Green Car (disposition 2+2)",
  seatAH3: "Le siège A se trouve toujours du côté opposé (côté mer)",
  whyEH3: "Pourquoi « E » importe plus que « côté droit » seul",
  seatAText: "Le siège A est utile si vous voulez la fenêtre côté mer, mais ce n'est pas la fenêtre côté mont Fuji sur le Tokaido Shinkansen.",
  whyEText: "Lors d'une réservation en ligne, vous choisissez généralement une lettre de siège plutôt qu'un côté du train. Le siège E est donc l'instruction la plus pratique.",
  whenH2: "Quand voir le mont Fuji depuis le Shinkansen",
  whenQuick: <>En général, la fin de matinée et le début d&apos;après-midi offrent la vue la plus dégagée sur le mont Fuji par temps clair. <strong>L&apos;hiver (décembre–février)</strong> est la meilleure saison, avec une silhouette enneigée et un ciel souvent dégagé. Le mont Fuji n&apos;est généralement pas visible la nuit — la montagne n&apos;est pas éclairée.</>,
  timeH3: "Meilleure heure — fin de matinée à début d'après-midi",
  seasonH3: "Meilleure saison — l'hiver pour la silhouette enneigée, l'automne pour le ciel dégagé",
  nightH3: "Peut-on voir le mont Fuji la nuit depuis le Shinkansen ?",
  nightText: "En général, non. Le mont Fuji n'est pas éclairé la nuit, il est donc normalement trop sombre pour être visible, même du bon côté.",
  liveH3: "Vérifiez la visibilité en direct avant de monter à bord",
  liveTextBefore: "Avant de réserver ou de monter à bord,",
  liveLink: "vérifier la visibilité en direct",
  liveTextAfter: "avec le vérificateur de siège gratuit.",
  routeH2: "Sur quelle partie du trajet le mont Fuji apparaît-il ?",
  routeQuick: <>Le mont Fuji devient visible depuis le Tokaido Shinkansen entre les gares de <strong>Shin-Yokohama et Shizuoka</strong>, avec la vue la plus dégagée aux alentours de la <strong>gare de Shin-Fuji</strong>. La fenêtre de visibilité totale est d&apos;environ 30 à 60 secondes à pleine vitesse.</>,
  shinFujiH3: "Aux alentours de la gare de Shin-Fuji — la zone de vue principale",
  durationH3: "Combien de temps le mont Fuji est-il visible depuis le train ? (environ 30 à 60 secondes)",
  mapH3: "Carte du trajet Tokaido Shinkansen — de Shin-Yokohama à Shizuoka",
  trainTypeH2: "Nozomi, Hikari ou Kodama — quel Shinkansen pour le mont Fuji ?",
  trainTypeQuick: <>Les trois services du Tokaido Shinkansen passent près du mont Fuji, et le siège à réserver (siège E) est le même pour tous. <strong>Hikari et Kodama</strong> s&apos;arrêtent à la gare de Shin-Fuji, ce qui peut offrir une fenêtre de visualisation légèrement plus longue. <strong>Nozomi</strong> est le plus rapide mais ne s&apos;arrête pas à Shin-Fuji.</>,
  nozomiH3: "Nozomi : le plus rapide, mais sans arrêt à Shin-Fuji",
  nozomiText: "Les trains Nozomi passent bien dans la zone de vue du mont Fuji, mais ils ne s'arrêtent pas à Shin-Fuji.",
  hikariH3: "Hikari et Kodama : avec arrêt à Shin-Fuji, vue légèrement plus longue",
  typeSeatH3: "Le type de train change-t-il le siège à choisir ? (non — siège E dans tous les cas)",
  typeSeatText: "La règle gauche/droite et la recommandation du siège E ne changent pas entre Nozomi, Hikari et Kodama en voiture standard.",
  jrPassH2: "JR Pass ou billet à l'unité — quel est le plus économique pour Tokyo–Kyoto ?",
  jrPassQuick: <>Pour un simple aller-retour Tokyo–Kyoto, <strong>les billets à l&apos;unité sont moins chers</strong> (environ 29 000 ¥ aller-retour contre 50 000 ¥ pour un JR Pass 7 jours). Le JR Pass devient rentable uniquement si vous ajoutez Hiroshima, effectuez 2 longs trajets ou plus, ou prenez plusieurs segments de Shinkansen en une semaine.</>,
  itineraryBefore: "Pour voir comment cela s'intègre dans un voyage,",
  itineraryLink: "voir comment cela s'intègre dans un itinéraire de 7 jours",
  bookH2: "Comment réserver le siège E — étape par étape",
  bookQuick: <>Au guichet JR, montrez 「<strong>E席をお願いします</strong>」 (« Le siège E, s&apos;il vous plaît »). Sur Klook, choisissez votre trajet puis sélectionnez la colonne E sur le plan de siège. Avec un JR Pass, rendez-vous dans n&apos;importe quel comptoir de réservation JR — les réservations de siège y sont gratuites.</>,
  jrOfficeH3: "Au guichet JR (avec la phrase japonaise utile)",
  klookH3: "Réservation via Klook (interface en français/anglais)",
  klookText: "Choisissez le trajet Tokaido Shinkansen, puis sélectionnez la colonne E sur le plan de siège lorsque l'option est disponible.",
  jrPassCounterH3: "Avec un JR Pass au comptoir de réservation",
  jrPassCounterTextBefore: "Avec un JR Pass, réservez votre siège à un comptoir de réservation JR avant de monter à bord. Pour un départ tôt en Shinkansen, il peut être pratique de",
  stayLink: "séjourner près de la gare de Tokyo",
  mistakesTextBefore: "La même logique s'applique à l'arrivée :",
  mistakesLink: "ne commettez pas la même erreur le jour de l'arrivée",
  mistakesTextAfter: "en choisissant un transfert aéroport inadapté à vos bagages et à votre heure d'arrivée.",
  mistakesH2: "Erreurs fréquentes lorsqu'on essaie de voir le mont Fuji depuis le Shinkansen",
  priorityH2: "Sièges prioritaires (優先席) — l'étiquette à connaître",
  faqH2: "Questions fréquentes",
  makeEasyH2: "Simplifiez-vous la tâche avec le Shinkansen Mt. Fuji Seat Checker",
  footerBrand: "fujiseat.com — outils de voyage au Japon",
  footerPartner: "Liens partenaires affichés uniquement lorsqu'ils correspondent à l'étape de préparation.",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  if (locale === "fr") {
    return {
      title: "Mont Fuji depuis le Shinkansen — côté, siège et timing",
      description: "Guide gratuit par un Tokyoïte : quel côté du Shinkansen pour voir le mont Fuji, pourquoi le siège E, et quand regarder. Mis à jour 2026.",
      alternates: getAlternates("/guide", locale),
      openGraph: {
        title: "Mont Fuji depuis le Shinkansen — côté, siège et timing",
        description: "Guide gratuit par un Tokyoïte : quel côté du Shinkansen pour voir le mont Fuji.",
        siteName: "fujiseat",
        images: [{ url: "https://fujiseat.com/og-guide.png", width: 1200, height: 630 }],
      },
    };
  }
  const guideTitle = locale === "en" ? "Which Shinkansen Seat to See Mt. Fuji? Seat E, Side & Timing Guide" : t("guideTitle");
  const guideDesc = locale === "en"
    ? "Find which Shinkansen seat to book for Mt. Fuji. Tokyo to Kyoto/Osaka: right side, Seat E. Kyoto/Osaka to Tokyo: left side, Seat E. Includes timing, Green Car tips, and a free seat checker."
    : t("guideDesc");
  return {
    title: guideTitle,
    description: guideDesc,
    alternates: getAlternates("/guide", locale),
    openGraph: {
      title: guideTitle,
      description: guideDesc,
      siteName: "fujiseat",
      images: [{ url: "https://fujiseat.com/og-guide.png", width: 1200, height: 630 }],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guide" });
  const h = await getTranslations({ locale, namespace: "home" });
  const isFr = locale === "fr";
  const copy = isFr ? frGuideCopy : enGuideCopy;
  const displayTitle = locale === "en"
    ? "Which Shinkansen Seat to See Mt. Fuji? Seat E, Side & Timing Guide"
    : copy.title;

  const tldrItems = t.raw("tldr") as Array<{ bold: string; text: string }>;
  const seasons = t.raw("seasons") as Array<{
    season: string;
    stars: string;
    rating: string;
    note: string;
  }>;
  const timeItems = t.raw("timeItems") as Array<{
    bold: string;
    text: string;
  }>;
  const carStandard = t.raw("carStandard") as string[];
  const carGreen = t.raw("carGreen") as string[];
  const carRequest = t.raw("carRequest") as Array<{
    bold: string;
    text: string;
  }>;
  const jrSingle = t.raw("jrSingle") as string[];
  const jrPassItems = t.raw("jrPassItems") as string[];
  const faqItems = t.raw("faq") as Array<{ q: string; a: string }>;
  const extraFaqItems = isFr
    ? [
        {
          q: "De quel côté du train à grande vitesse pour voir le mont Fuji ?",
          a: "« Train à grande vitesse » est l'équivalent français de Shinkansen. Tokyo → Kyoto/Osaka : mont Fuji à droite (siège E). Kyoto/Osaka → Tokyo : mont Fuji à gauche (également siège E).",
        },
        {
          q: "Quand peut-on voir le mont Fuji depuis le Shinkansen ?",
          a: "La fenêtre de visualisation se situe entre les gares de Shin-Yokohama et Shizuoka, avec un point culminant aux alentours de Shin-Fuji. La durée totale de visibilité est d'environ 30 à 60 secondes. La fin de matinée et le début d'après-midi par temps clair offrent généralement les meilleures chances.",
        },
        {
          q: "Peut-on voir le mont Fuji depuis le Nozomi Shinkansen ?",
          a: "Oui — bien que le Nozomi ne s'arrête pas à Shin-Fuji, vous pouvez toujours voir clairement le mont Fuji depuis la fenêtre côté droit (siège E) lors du trajet Tokyo → Kyoto/Osaka. La durée de visualisation est juste un peu plus courte qu'en Hikari ou Kodama.",
        },
        {
          q: "À quel moment de la journée le mont Fuji est-il le mieux visible depuis le Shinkansen ?",
          a: "La fin de matinée et le début d'après-midi offrent généralement la vue la plus dégagée. En été, le matin avant 10 h peut être encore meilleur car la brume de chaleur ne s'est pas encore installée. En fin d'après-midi, le soleil produit souvent des reflets gênants côté mont Fuji.",
        },
        {
          q: "Quelle lettre de siège correspond à la fenêtre côté mont Fuji en Green Car ?",
          a: "Dans les Green Cars (disposition 2+2, voitures 8 à 10 sur la plupart des Tokaido Shinkansen), le siège D est la place côté fenêtre du mont Fuji. La règle gauche/droite reste la même — côté droit en allant à Kyoto, côté gauche en allant à Tokyo.",
        },
      ]
    : [
        {
          q: "Which side of the bullet train for Mt. Fuji?",
          a: "Bullet train is the English name for the Shinkansen. Tokyo → Kyoto/Osaka means Mt. Fuji on the right (Seat E). Kyoto/Osaka → Tokyo means Mt. Fuji on the left (also Seat E).",
        },
        {
          q: "When can I see Mt. Fuji on the Shinkansen?",
          a: "The Mt. Fuji viewing window is between Shin-Yokohama and Shizuoka stations, peaking around Shin-Fuji. Total time visible is about 30 to 60 seconds. Late morning to early afternoon, on a clear day, generally gives the best chance.",
        },
        {
          q: "Can you see Mt. Fuji from the Nozomi Shinkansen?",
          a: "Yes — although the Nozomi does not stop at Shin-Fuji, you can still see Mt. Fuji clearly from the right-side window (Seat E) when traveling Tokyo to Kyoto/Osaka. The viewing time is just slightly shorter than on Hikari or Kodama.",
        },
        {
          q: "What is the best time of day to see Mt. Fuji from the Shinkansen?",
          a: "Late morning to early afternoon usually offers the clearest view. Mornings before 10 AM can be even better in summer because heat haze has not built up yet. Late afternoon often has sun glare on the Mt. Fuji side.",
        },
        {
          q: "Which seat letter is the Mt. Fuji window in a Green Car?",
          a: "In Green Cars (2+2 layout, cars 8-10 on most Tokaido Shinkansen), Seat D is the Mt. Fuji window seat. The same left/right rule applies — right side going to Kyoto, left side going to Tokyo.",
        },
      ];

  const faqSchemaData = isFr
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage: "fr",
        "@language": "fr",
        mainEntity: [...faqItems, ...extraFaqItems].map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        })),
      }
    : faqSchema;
  const articleSchemaData = isFr
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "@language": "fr",
        inLanguage: "fr",
        headline: "Guide des sièges Shinkansen pour voir le mont Fuji",
        description: "Guide gratuit par un Tokyoïte : quel côté du Shinkansen pour voir le mont Fuji, pourquoi le siège E, et quand regarder. Mis à jour 2026.",
        author: {
          "@type": "Person",
          name: "fujiseat (créateur japonais basé à Tokyo)",
        },
        datePublished: "2026-04-01",
        dateModified: "2026-04-27",
      }
    : articleSchema;
  const howToSchemaData = isFr
    ? {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "@language": "fr",
        inLanguage: "fr",
        name: "Comment réserver le siège E pour la vue du mont Fuji",
        step: [
          {
            "@type": "HowToStep",
            name: "Choisir la direction",
            text: "Choisissez si vous voyagez de Tokyo vers Kyoto ou Osaka, ou de Kyoto ou Osaka vers Tokyo.",
          },
          {
            "@type": "HowToStep",
            name: "Sélectionner la colonne E sur le plan de siège",
            text: "Dans les voitures standard 3+2 du Tokaido Shinkansen, choisissez le siège E pour la fenêtre côté mont Fuji.",
          },
          {
            "@type": "HowToStep",
            name: "Confirmer avant le paiement",
            text: "Avant le paiement ou le retrait du billet, vérifiez que la lettre de siège réservée est E en voiture standard, ou D en Green Car.",
          },
        ],
      }
    : howToSchema;
  const breadcrumbSchemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: localizedUrl(locale, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: copy.title,
        item: localizedUrl(locale, "/guide"),
      },
    ],
  };

  const seasonColors = [
    "text-emerald-700",
    "text-sky-700",
    "text-amber-700",
    "text-slate-500",
  ];

  const essentialLinks = [
    {
      url: KLOOK_URL,
      icon: <Train className="h-4 w-4 text-red-500" />,
      title: h("jrPassTitle"),
      desc: h("jrPassDesc"),
      accent: "from-red-50 to-red-100 border-red-100 group-hover:from-red-100 group-hover:to-red-200",
      featured: true,
    },
    {
      url: ESIM_URL,
      icon: <Wifi className="h-4 w-4 text-emerald-500" />,
      title: h("esimTitle"),
      desc: h("esimDesc"),
      accent: "from-emerald-50 to-emerald-100 border-emerald-100 group-hover:from-emerald-100 group-hover:to-emerald-200",
    },
    {
      url: AIRPORT_TRANSFER_URL,
      icon: <Train className="h-4 w-4 text-sky-500" />,
      title: h("nexTitle"),
      desc: h("nexDesc"),
      accent: "from-sky-50 to-sky-100 border-sky-100 group-hover:from-sky-100 group-hover:to-sky-200",
    },
    {
      url: INSURANCE_URL,
      icon: <ShieldCheck className="h-4 w-4 text-amber-500" />,
      title: h("insuranceTitle"),
      desc: h("insuranceDesc"),
      accent: "from-amber-50 to-amber-100 border-amber-100 group-hover:from-amber-100 group-hover:to-amber-200",
    },
    {
      url: CAR_RENTAL_URL,
      icon: <Car className="h-4 w-4 text-violet-500" />,
      title: h("carTitle"),
      desc: h("carDesc"),
      accent: "from-violet-50 to-violet-100 border-violet-100 group-hover:from-violet-100 group-hover:to-violet-200",
    },
  ];

  const renderTravelEssentials = () => (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm md:shadow">
      <div className="px-4 py-3.5 md:px-6 md:py-4 border-b border-slate-100 bg-slate-50/60">
        <h2 className="text-[13px] md:text-[15px] font-semibold text-slate-900">
          {h("essentialsTitle")}
        </h2>
        <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
          {h("essentialsNote")}
        </p>
      </div>
      <div className="p-2.5 md:p-3.5 grid gap-2 md:grid-cols-2 md:gap-2.5">
        {essentialLinks.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel={AFFILIATE_REL}
            className={[
              "flex items-center gap-3 rounded-xl border px-3.5 py-3 md:px-4 md:py-3.5",
              "border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200 hover:shadow-sm",
              "transition-all duration-150 group",
              link.featured ? "md:col-span-2" : "",
            ].join(" ")}
          >
            <div
              className={`shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${link.accent} border flex items-center justify-center`}
            >
              {link.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] md:text-[13px] font-semibold text-slate-800">
                {link.title}
              </p>
              <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {link.desc}
              </p>
            </div>
            <ExternalLink className="shrink-0 h-3.5 w-3.5 md:h-4 md:w-4 text-slate-300 group-hover:text-red-500 transition-colors" />
          </a>
        ))}
      </div>
    </section>
  );

  return (
    <main className="page-shell flex min-h-screen flex-col text-slate-900">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
      />
      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchemaData) }}
      />
      <Script
        id="howto-seat-e-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchemaData) }}
      />
      <Script
        id="breadcrumb-guide-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaData) }}
      />
      <SiteHeader />
      <div className="flex-1 flex flex-col px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-lg font-semibold tracking-tight text-slate-950">
            {displayTitle}
          </h1>
          <p className="mt-1 text-xs text-slate-500">{t("subtitle")}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {t("writtenBy")}
          </p>
        </div>

        {locale === "en" && (
          <section className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-[13px] leading-relaxed text-emerald-950 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.1em] text-emerald-700">
              Quick Answer
            </p>
            <h2 className="mt-1 text-base font-semibold text-slate-950">
              Book Seat E in standard cars. Use Seat D in Green Car.
            </h2>
            <ul className="mt-3 space-y-2">
              <li><strong>Tokyo → Kyoto/Osaka:</strong> right side, Seat E.</li>
              <li><strong>Kyoto/Osaka → Tokyo:</strong> left side, Seat E.</li>
              <li><strong>Green Car:</strong> usually Seat D for the Mt. Fuji window.</li>
              <li><strong>Best timing:</strong> be ready around Shin-Fuji.</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/#seat-checker"
                className="inline-flex items-center rounded-full border border-[#168a56] bg-[#168a56] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
              >
                Open free Seat Checker
              </Link>
              <span className="inline-flex cursor-not-allowed items-center rounded-full border border-emerald-200 bg-white/70 px-3.5 py-1.5 text-[12px] font-semibold text-emerald-700" title="Prepared for a future child page">
                Seat E guide
              </span>
              <span className="inline-flex cursor-not-allowed items-center rounded-full border border-emerald-200 bg-white/70 px-3.5 py-1.5 text-[12px] font-semibold text-emerald-700" title="Prepared for a future child page">
                Green Car seats
              </span>
            </div>
          </section>
        )}

        {/* Intro */}
        <section className="mb-5 text-[13px] leading-relaxed text-slate-700 bg-white/90 border border-slate-200 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            {t("introH2")}
          </h2>
          <p className="mb-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
            <strong>{copy.quickLabel}</strong> {copy.introQuick}
          </p>
          <p>{t("introP1")}</p>
          <p className="mt-2 text-[12px] text-slate-600">{t("introP2")}</p>
        </section>

        {/* Quick navigation */}
        <section className="mb-5 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/70">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2.5">
            {copy.quickNav}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-[#168a56] bg-[#168a56] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {copy.checkSeatNow}
            </Link>
            <a
              href="#tldr"
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-[12px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {copy.readFullGuide}
            </a>
            <a
              href={KLOOK_URL}
              target="_blank"
              rel={AFFILIATE_REL}
              className="inline-flex items-center rounded-full border border-[#ff7a00] bg-[#ff7a00] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#e66700]"
            >
              {copy.bookOnKlook}
            </a>
            <Link
              href="/planner"
              className="inline-flex items-center rounded-full border border-[#9fd7bd] bg-[#f0fbf6] px-3.5 py-1.5 text-[12px] font-semibold text-[#106b43] transition-colors hover:border-[#168a56] hover:bg-white"
            >
              {t("commandCenterBtn")} →
            </Link>
          </div>
        </section>

        {/* TL;DR */}
        <section id="tldr" className="mb-5 text-[13px] leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm shadow-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            {copy.tldrH2}
          </h2>
          <ul className="list-disc pl-5 space-y-1.5">
            {tldrItems.map((item, i) => (
              <li key={i}>
                <span className="font-semibold">{item.bold}</span> {item.text}
              </li>
            ))}
          </ul>
        </section>

        <div className="mb-6">
          <GuideNextSteps />
        </div>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/70">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Continue planning
          </p>
          <div className="mt-3 grid gap-2.5">
            <Link
              href="/local-tokyo"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[12px] transition-colors hover:bg-white"
            >
              <span className="block font-semibold text-slate-900">Local Tokyo neighborhoods</span>
              <span className="mt-0.5 block text-slate-500">
                Add quieter east-side stops like Kiyosumi-Shirakawa, Kuramae, Oshiage, and Ryogoku.
              </span>
            </Link>
            <Link
              href="/itineraries/7-day-first-time-japan"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[12px] transition-colors hover:bg-white"
            >
              <span className="block font-semibold text-slate-900">7-day first-time Japan itinerary</span>
              <span className="mt-0.5 block text-slate-500">
                Put the Fuji-side Shinkansen ride into a realistic Tokyo, Kyoto, and Osaka route.
              </span>
            </Link>
            <Link
              href="/areas-to-stay/tokyo-first-time"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-[12px] transition-colors hover:bg-white"
            >
              <span className="block font-semibold text-slate-900">Tokyo areas to stay</span>
              <span className="mt-0.5 block text-slate-500">
                Compare Shinjuku, Ueno, Asakusa, Tokyo Station, and calmer east-side bases.
              </span>
            </Link>
          </div>
        </section>

        {/* Jump to section */}
        <div className="mb-5 text-[12px] text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-600">{copy.jumpTo} </span>
          <a href="#tldr" className="underline underline-offset-2 hover:text-slate-800 transition-colors">{copy.jumpTldr}</a>
          {" · "}
          <a href="#which-side" className="underline underline-offset-2 hover:text-slate-800 transition-colors">{copy.jumpSide}</a>
          {" · "}
          <a href="#seat-letters" className="underline underline-offset-2 hover:text-slate-800 transition-colors">{copy.jumpLetters}</a>
          {" · "}
          <a href="#when-to-see" className="underline underline-offset-2 hover:text-slate-800 transition-colors">{copy.jumpTime}</a>
          {" · "}
          <a href="#route-zone" className="underline underline-offset-2 hover:text-slate-800 transition-colors">{copy.jumpZone}</a>
          {" · "}
          <a href="#jr-pass" className="underline underline-offset-2 hover:text-slate-800 transition-colors">{copy.jumpJrPass}</a>
          {" · "}
          <a href="#faq" className="underline underline-offset-2 hover:text-slate-800 transition-colors">{copy.jumpFaq}</a>
        </div>

        <div className="space-y-6 text-[13px] leading-relaxed text-slate-700">
          <section id="which-side" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              {copy.whichSideH2}
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>{copy.quickLabel}</strong> {copy.whichSideQuick}
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.tokyoRightH3}</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">{t("s1Bullet1Bold")}</span>{" "}
                {t("s1Bullet1")}
              </li>
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.returnLeftH3}</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <span className="font-semibold">{t("s1Bullet2Bold")}</span>{" "}
                {t("s1Bullet2")}
              </li>
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.sideBackH3}</h3>
            <p className="mt-2 text-[12px] text-slate-600">{t("s1Note")}</p>
          </section>

          <section id="seat-letters" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              {copy.lettersH2}
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>{copy.quickLabel}</strong> {copy.lettersQuick}
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.seatEH3}</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              {carStandard.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.greenCarH3}</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              {carGreen.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.seatAH3}</h3>
            <p className="text-[12px] text-slate-600">{copy.seatAText}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.whyEH3}</h3>
            <p className="text-[12px] text-slate-600">{copy.whyEText}</p>
          </section>

          <section id="when-to-see" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              {copy.whenH2}
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>{copy.quickLabel}</strong> {copy.whenQuick}
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.timeH3}</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              {timeItems.map((item, i) => (
                <li key={i}>
                  <span className="font-semibold">{item.bold}</span> {item.text}
                </li>
              ))}
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.seasonH3}</h3>
            <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden text-[12px]">
              {seasons.map((s, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 bg-white">
                  <span className={`shrink-0 font-semibold ${seasonColors[i] ?? "text-slate-500"}`}>{s.stars}</span>
                  <div>
                    <span className="font-semibold text-slate-800">{s.season}:</span>{" "}
                    <span className={`font-semibold ${seasonColors[i] ?? "text-slate-500"}`}>{s.rating}</span> — {s.note}
                  </div>
                </div>
              ))}
            </div>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.nightH3}</h3>
            <p className="text-[12px] text-slate-600">{copy.nightText}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.liveH3}</h3>
            <p className="text-[12px] text-slate-600">
              {copy.liveTextBefore} <Link href="/#seat-checker" className="font-semibold text-sky-700 underline underline-offset-2">{copy.liveLink}</Link> {copy.liveTextAfter}
            </p>
          </section>

          <section id="route-zone" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Mountain className="h-4 w-4 text-sky-600" />
              {copy.routeH2}
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>{copy.quickLabel}</strong> {copy.routeQuick}
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.shinFujiH3}</h3>
            <p>{t("s2P1")}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.durationH3}</h3>
            <p className="text-[12px] text-slate-600">{t("s3Bullet3")}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.mapH3}</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><span className="font-semibold">{t("s2Bullet1Bold")}</span> {t("s2Bullet1")}</li>
              <li><span className="font-semibold">{t("s2Bullet3Bold")}</span> {t("s2Bullet3")}</li>
            </ul>
          </section>

          <section id="nozomi-hikari-kodama" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              {copy.trainTypeH2}
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>{copy.quickLabel}</strong> {copy.trainTypeQuick}
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.nozomiH3}</h3>
            <p className="text-[12px] text-slate-600">{copy.nozomiText}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.hikariH3}</h3>
            <p className="text-[12px] text-slate-600">{t("jrNozomiNote")}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.typeSeatH3}</h3>
            <p className="text-[12px] text-slate-600">{copy.typeSeatText}</p>
          </section>

          <section id="jr-pass" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              {copy.jrPassH2}
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>{copy.quickLabel}</strong> {copy.jrPassQuick}
            </p>
            <p className="mb-2">{t("jrSingleLabel")}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              {jrSingle.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-2.5 mb-2">{t("jrPassLabel")}</p>
            <ul className="list-disc pl-5 space-y-1.5">
              {jrPassItems.map((item, i) => (
                <li key={i}>
                  <span className="font-semibold">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-2 text-[12px] text-slate-600">
              <p>{t("jrPassWorth")}</p>
              <p className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800">
                {t("jrNozomiNote")}
              </p>
            </div>
            <div className="mt-3">
              <KlookCTA />
            </div>
            <p className="mt-3 text-[12px] text-slate-600">
              {copy.itineraryBefore} <Link href="/itineraries/7-day-first-time-japan" className="font-semibold text-sky-700 underline underline-offset-2">{copy.itineraryLink}</Link>.
            </p>
          </section>

          <section id="book-seat-e" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Train className="h-4 w-4 text-sky-600" />
              {copy.bookH2}
            </h2>
            <p className="mb-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
              <strong>{copy.quickLabel}</strong> {copy.bookQuick}
            </p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.jrOfficeH3}</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              {carRequest.slice(0, 1).map((item, i) => (
                <li key={i}>
                  <span className="font-semibold">{item.bold}</span> {item.text}
                </li>
              ))}
            </ul>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.klookH3}</h3>
            <p className="text-[12px] text-slate-600">{copy.klookText}</p>
            <h3 className="mt-3 text-[13px] font-semibold text-slate-900">{copy.jrPassCounterH3}</h3>
            <p className="text-[12px] text-slate-600">{copy.jrPassCounterTextBefore} <Link href="/areas-to-stay/tokyo-first-time" className="font-semibold text-sky-700 underline underline-offset-2">{copy.stayLink}</Link>.</p>
            <div className="mt-3">
              <KlookCTA />
            </div>
          </section>

          <section id="common-mistakes" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Info className="h-4 w-4 text-sky-600" />
              {copy.mistakesH2 ?? t("s4H2")}
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><span className="font-semibold">{t("s4Bullet1Bold")}</span> {t("s4Bullet1")}</li>
              <li><span className="font-semibold">{t("s4Bullet2Bold")}</span> {t("s4Bullet2")}</li>
              <li><span className="font-semibold">{t("s4Bullet3Bold")}</span> {t("s4Bullet3")}</li>
            </ul>
            <p className="mt-3 text-[12px] text-slate-600">
              {copy.mistakesTextBefore} <Link href="/airport-transfers/narita-to-shinjuku" className="font-semibold text-sky-700 underline underline-offset-2">{copy.mistakesLink}</Link> {copy.mistakesTextAfter}
            </p>
          </section>

          <section id="etiquette" className="rounded-2xl border border-amber-200/80 bg-amber-50/30 px-4 py-4 md:px-6 md:py-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm md:text-[15px] font-semibold text-slate-900 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {copy.priorityH2 ?? t("priorityH2")}
            </h2>
            <div className="space-y-3 text-[13px] md:text-sm leading-relaxed text-slate-700">
              <p>{t("priorityP1")}</p>
              <p>{t("priorityP2")}</p>
              <p>{t("priorityP3")}</p>
            </div>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-white/80 border border-amber-200/60 px-3.5 py-3 md:px-4">
              <Info className="shrink-0 h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-[11px] md:text-xs text-amber-800 leading-relaxed">{t("priorityTip")}</p>
            </div>
          </section>

          {renderTravelEssentials()}

          {/* Section D: FAQ */}
          <section id="faq" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
              <Info className="h-4 w-4 text-sky-600" />
              {copy.faqH2 ?? t("faqH2")}
            </h2>
            <div className="space-y-3">
              {[...faqItems, ...extraFaqItems].map((item, i) => (
                <div
                  key={i}
                  className="border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <p className="font-semibold text-slate-800 mb-1">
                    Q: {item.q}
                  </p>
                  <p className="text-[12px] text-slate-600">A: {item.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <KlookCTA />
            </div>
          </section>

          {/* Section 5: Make it easy */}
          <section className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-4 shadow-sm shadow-sky-100">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-2.5">
              <Mountain className="h-4 w-4 text-sky-700" />
              {copy.makeEasyH2 ?? t("makeEasyH2")}
            </h2>
            <p>{t("makeEasyP1")}</p>
            <p className="mt-2 text-[12px] text-slate-600">
              {t("makeEasyP2")}
            </p>
            <div className="mt-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-[#168a56] bg-[#168a56] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-100 transition-colors hover:bg-[#0f6f45] active:brightness-95"
              >
                {t("openChecker")}
              </Link>
            </div>
          </section>

          <footer className="border-t border-slate-200 pt-5 text-center text-[10px] text-slate-400">
            <p>{copy.footerBrand}</p>
            <p className="mt-1">{copy.footerPartner}</p>
            <LastCheckedNote className="mt-3" />
            <SiteLegalLinks className="mt-3 text-slate-400" />
          </footer>

        </div>
      </div>
    </main>
  );
}
