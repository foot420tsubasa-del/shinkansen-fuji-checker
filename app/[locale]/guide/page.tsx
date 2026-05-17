import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mountain, Train, Info, AlertTriangle } from "lucide-react";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "../components/SiteHeader";
import { getAlternates } from "@/i18n/hreflang";
import { KLOOK_URL, ESIM_URL, JR_PASS_URL, OMIO_SHINKANSEN_URL } from "@/src/affiliateLinks";
import { SiteFooter } from "@/components/content/SiteFooter";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { ShareThisPage } from "@/components/share/ShareThisPage";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { RailDecisionCard } from "@/components/affiliate/RailDecisionCard";

const SITE_URL = "https://fujiseat.com";

function localizedUrl(locale: string, path: string) {
  return locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

function dedupeFaqItems(items: Array<{ q: string; a: string }>) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const normalized = item.q.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function faqItemsToSchema(items: Array<{ q: string; a: string }>, locale?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(locale ? { inLanguage: locale, "@language": locale } : {}),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

function isDuplicateGuideFaq(item: { q: string }, index?: number) {
  if (typeof index === "number" && [1, 2, 5, 6].includes(index)) return true;
  const normalized = item.q.toLowerCase();
  return (
    normalized.includes("how long") ||
    normalized.includes("combien de temps") ||
    normalized.includes("seat e always") ||
    normalized.includes("siège e est-il toujours") ||
    normalized.includes("nozomi") ||
    normalized.includes("jr pass worth") ||
    normalized.includes("jr pass vaut") ||
    normalized.includes("tokyo–osaka only") ||
    normalized.includes("tokyo-osaka only")
  );
}

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
  quickAnswerTitle: "Quick Answer",
  quickAnswerHeading: "Book Seat E in standard cars. Use Seat D in Green Car.",
  quickAnswerItems: [
    { bold: "Tokyo → Kyoto/Osaka:", text: "right side, Seat E." },
    { bold: "Kyoto/Osaka → Tokyo:", text: "left side, Seat E." },
    { bold: "Green Car:", text: "usually Seat D for the Mt. Fuji window." },
    { bold: "Best timing:", text: "be ready around Shin-Fuji." },
  ],
  openSeatChecker: "Open free Seat Checker",
  quickNav: "Quick navigation",
  checkSeatNow: "Check my seat now →",
  readFullGuide: "Read full guide ↓",
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
  quickAnswerTitle: "Réponse rapide",
  quickAnswerHeading: "Réservez le siège E en voiture standard. Choisissez le siège D en Green Car.",
  quickAnswerItems: [
    { bold: "Tokyo → Kyoto/Osaka :", text: "côté droit, siège E." },
    { bold: "Kyoto/Osaka → Tokyo :", text: "côté gauche, siège E." },
    { bold: "Green Car :", text: "généralement siège D pour la fenêtre côté mont Fuji." },
    { bold: "Meilleur timing :", text: "soyez prêt autour de Shin-Fuji." },
  ],
  openSeatChecker: "Ouvrir le vérificateur de siège gratuit",
  quickNav: "Navigation rapide",
  checkSeatNow: "Vérifier mon siège →",
  readFullGuide: "Lire le guide ↓",
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
  const guideTitle = locale === "en" ? "Which Shinkansen Seat to See Mt. Fuji? Seat E Guide for Tokyo to Kyoto" : t("guideTitle");
  const guideDesc = locale === "en"
    ? "Find the Mt. Fuji side of the Shinkansen before booking. For Tokyo to Kyoto or Osaka, choose the right side and Seat E in standard cars. Includes seat checker, timing, JR Pass notes, and booking tips."
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

type QuickAnswerCopy = {
  title: string;
  heading: string;
  items: Array<{ bold: string; text: string }>;
  cta: string;
};

type GuideFaqItem = { q: string; a: string };

const quickAnswerCopyByLocale: Record<string, QuickAnswerCopy> = {
  en: {
    title: "Quick Answer",
    heading: "Book Seat E in standard cars. Use Seat D in Green Car.",
    items: [
      { bold: "Tokyo → Kyoto/Osaka:", text: "right side, Seat E." },
      { bold: "Kyoto/Osaka → Tokyo:", text: "left side, Seat E." },
      { bold: "Green Car:", text: "usually Seat D for the Mt. Fuji window." },
      { bold: "Best timing:", text: "be ready around Shin-Fuji." },
    ],
    cta: "Open free Seat Checker",
  },
  "pt-BR": {
    title: "Resposta rápida",
    heading: "Reserve o assento E nos carros standard. Use o assento D no Green Car.",
    items: [
      { bold: "Tokyo → Kyoto/Osaka:", text: "lado direito, assento E." },
      { bold: "Kyoto/Osaka → Tokyo:", text: "lado esquerdo, assento E." },
      { bold: "Green Car:", text: "geralmente assento D para a janela do Monte Fuji." },
      { bold: "Melhor timing:", text: "esteja pronto perto de Shin-Fuji." },
    ],
    cta: "Abrir verificador de assento grátis",
  },
  es: {
    title: "Respuesta rápida",
    heading: "Reserva el asiento E en coches estándar. Usa el asiento D en Green Car.",
    items: [
      { bold: "Tokio → Kioto/Osaka:", text: "lado derecho, asiento E." },
      { bold: "Kioto/Osaka → Tokio:", text: "lado izquierdo, asiento E." },
      { bold: "Green Car:", text: "normalmente asiento D para la ventana del Monte Fuji." },
      { bold: "Mejor momento:", text: "prepárate cerca de Shin-Fuji." },
    ],
    cta: "Abrir verificador de asiento gratis",
  },
  ko: {
    title: "빠른 답변",
    heading: "일반석은 E석, 그린샤는 D석을 예약하세요.",
    items: [
      { bold: "도쿄 → 교토/오사카:", text: "오른쪽, E석." },
      { bold: "교토/오사카 → 도쿄:", text: "왼쪽, E석." },
      { bold: "그린샤:", text: "후지산 쪽 창가는 보통 D석입니다." },
      { bold: "좋은 타이밍:", text: "신후지 근처에서 준비하세요." },
    ],
    cta: "무료 좌석 체커 열기",
  },
  "zh-TW": {
    title: "快速答案",
    heading: "普通車請選 E 座。Green Car 請選 D 座。",
    items: [
      { bold: "東京 → 京都/大阪：", text: "右側，E 座。" },
      { bold: "京都/大阪 → 東京：", text: "左側，E 座。" },
      { bold: "Green Car：", text: "富士山側窗邊通常是 D 座。" },
      { bold: "最佳時機：", text: "接近新富士時先準備好。" },
    ],
    cta: "開啟免費座位檢查器",
  },
  "zh-CN": {
    title: "快速答案",
    heading: "普通车选 E 座。Green Car 选 D 座。",
    items: [
      { bold: "东京 → 京都/大阪：", text: "右侧，E 座。" },
      { bold: "京都/大阪 → 东京：", text: "左侧，E 座。" },
      { bold: "Green Car：", text: "富士山侧窗边通常是 D 座。" },
      { bold: "最佳时机：", text: "接近新富士时提前准备。" },
    ],
    cta: "打开免费座位检查器",
  },
  fr: {
    title: "Réponse rapide",
    heading: "Réservez le siège E en voiture standard. Choisissez le siège D en Green Car.",
    items: [
      { bold: "Tokyo → Kyoto/Osaka :", text: "côté droit, siège E." },
      { bold: "Kyoto/Osaka → Tokyo :", text: "côté gauche, siège E." },
      { bold: "Green Car :", text: "généralement siège D pour la fenêtre côté mont Fuji." },
      { bold: "Meilleur timing :", text: "soyez prêt autour de Shin-Fuji." },
    ],
    cta: "Ouvrir le vérificateur de siège gratuit",
  },
  de: {
    title: "Kurzantwort",
    heading: "Buche Sitz E im Standardwagen. Im Green Car ist meist Sitz D richtig.",
    items: [
      { bold: "Tokyo → Kyoto/Osaka:", text: "rechte Seite, Sitz E." },
      { bold: "Kyoto/Osaka → Tokyo:", text: "linke Seite, Sitz E." },
      { bold: "Green Car:", text: "meist Sitz D für das Mt.-Fuji-Fenster." },
      { bold: "Bester Zeitpunkt:", text: "sei rund um Shin-Fuji bereit." },
    ],
    cta: "Kostenlosen Sitz-Checker öffnen",
  },
  ru: {
    title: "Короткий ответ",
    heading: "В обычном вагоне выбирайте место E. В Green Car обычно место D.",
    items: [
      { bold: "Токио → Киото/Осака:", text: "правая сторона, место E." },
      { bold: "Киото/Осака → Токио:", text: "левая сторона, место E." },
      { bold: "Green Car:", text: "обычно место D у окна на сторону Фудзи." },
      { bold: "Лучший момент:", text: "будьте готовы около Shin-Fuji." },
    ],
    cta: "Открыть бесплатную проверку места",
  },
};

const priorityGuideFaqByLocale: Record<string, GuideFaqItem[]> = {
  en: [
    { q: "Which side of the Shinkansen is Mt. Fuji on from Tokyo to Kyoto?", a: "From Tokyo to Kyoto or Osaka, Mt. Fuji is on the right side of the Shinkansen. In standard cars, choose Seat E for the Fuji-side window." },
    { q: "Which seat letter should I book to see Mt. Fuji?", a: "Book Seat E in standard 3+2 cars. In Green Cars with a 2+2 layout, the Mt. Fuji-side window is usually Seat D." },
    { q: "Can I see Mt. Fuji from the Nozomi Shinkansen?", a: "Yes. Nozomi does not stop at Shin-Fuji, but it still passes Mt. Fuji. From Tokyo to Kyoto or Osaka, choose the right side, Seat E." },
    { q: "When is the best time to see Mt. Fuji from the Shinkansen?", a: "Late morning to early afternoon on a clear day often works well. In summer, morning can be better before heat haze builds up." },
    { q: "How long can I see Mt. Fuji from the train?", a: "The main view usually lasts under a minute around Shin-Fuji. Have your camera ready before that part of the route." },
    { q: "Is the JR Pass worth it for Tokyo to Kyoto or Osaka?", a: "For a simple Tokyo-Kyoto or Tokyo-Osaka trip, single tickets usually make more sense. Check JR Pass options if you add Hiroshima or several long-distance JR rides." },
    { q: "Can I reserve a Fuji-side seat with oversized luggage?", a: "Yes, but reserve early if you also need oversized luggage space. Fuji-side window seats and luggage seats can both sell out." },
    { q: "What should I do if Seat E is not available?", a: "Try another train time, or choose another right-side seat from Tokyo to Kyoto or Osaka if the seat map allows it." },
    { q: "Should I stay near Tokyo Station before an early Shinkansen?", a: "Tokyo Station can reduce luggage stress for early trains, but Shinjuku, Ueno, and Asakusa may fit different travel styles." },
  ],
  "pt-BR": [
    { q: "De que lado do Shinkansen fica o Monte Fuji de Tokyo para Kyoto?", a: "De Tokyo para Kyoto ou Osaka, o Monte Fuji fica do lado direito do Shinkansen. Nos carros standard, escolha o assento E para a janela do lado do Fuji." },
    { q: "Qual letra de assento devo reservar para ver o Monte Fuji?", a: "Reserve o assento E nos carros standard 3+2. No Green Car 2+2, a janela do lado do Monte Fuji geralmente é o assento D." },
    { q: "Posso ver o Monte Fuji do Shinkansen Nozomi?", a: "Sim. O Nozomi não para em Shin-Fuji, mas passa pelo Monte Fuji. De Tokyo para Kyoto ou Osaka, escolha o lado direito, assento E." },
    { q: "Qual é o melhor horário para ver o Monte Fuji do Shinkansen?", a: "Fim da manhã até o começo da tarde, em dia claro, costuma funcionar bem. No verão, a manhã pode ser melhor antes da névoa de calor." },
    { q: "Por quanto tempo dá para ver o Monte Fuji do trem?", a: "A vista principal geralmente dura menos de um minuto perto de Shin-Fuji. Deixe a câmera pronta antes dessa parte da rota." },
    { q: "O JR Pass vale a pena para Tokyo a Kyoto ou Osaka?", a: "Para uma viagem simples Tokyo-Kyoto ou Tokyo-Osaka, bilhetes avulsos geralmente fazem mais sentido. Compare o JR Pass se adicionar Hiroshima ou vários trajetos JR longos." },
    { q: "Posso reservar assento do lado do Fuji com bagagem grande?", a: "Sim, mas reserve cedo se também precisar de espaço para bagagem oversized. Assentos do lado do Fuji e vagas de bagagem podem esgotar." },
    { q: "O que fazer se o assento E não estiver disponível?", a: "Tente outro horário ou escolha outro assento do lado direito de Tokyo para Kyoto ou Osaka se o mapa de assentos permitir." },
    { q: "Devo ficar perto da Tokyo Station antes de um Shinkansen cedo?", a: "Tokyo Station pode reduzir o estresse com bagagem em trens cedo, mas Shinjuku, Ueno e Asakusa podem combinar melhor com outros estilos de viagem." },
  ],
  es: [
    { q: "¿De qué lado del Shinkansen está el Monte Fuji de Tokio a Kioto?", a: "De Tokio a Kioto u Osaka, el Monte Fuji queda en el lado derecho del Shinkansen. En coches estándar, elige el asiento E para la ventana del lado Fuji." },
    { q: "¿Qué letra de asiento debo reservar para ver el Monte Fuji?", a: "Reserva el asiento E en coches estándar 3+2. En Green Car 2+2, la ventana del lado del Monte Fuji suele ser el asiento D." },
    { q: "¿Puedo ver el Monte Fuji desde el Shinkansen Nozomi?", a: "Sí. El Nozomi no se detiene en Shin-Fuji, pero pasa frente al Monte Fuji. De Tokio a Kioto u Osaka, elige el lado derecho, asiento E." },
    { q: "¿Cuál es la mejor hora para ver el Monte Fuji desde el Shinkansen?", a: "De media mañana a primeras horas de la tarde en un día despejado suele funcionar bien. En verano, la mañana puede ser mejor antes de la bruma." },
    { q: "¿Cuánto tiempo se ve el Monte Fuji desde el tren?", a: "La vista principal normalmente dura menos de un minuto cerca de Shin-Fuji. Ten la cámara lista antes de esa parte de la ruta." },
    { q: "¿Vale la pena el JR Pass para Tokio a Kioto u Osaka?", a: "Para un viaje simple Tokio-Kioto o Tokio-Osaka, los billetes sueltos suelen tener más sentido. Compara el JR Pass si añades Hiroshima o varios trayectos JR largos." },
    { q: "¿Puedo reservar un asiento del lado Fuji con equipaje grande?", a: "Sí, pero reserva pronto si también necesitas espacio para equipaje oversized. Los asientos del lado Fuji y los espacios de equipaje pueden agotarse." },
    { q: "¿Qué hago si el asiento E no está disponible?", a: "Prueba otro horario o elige otro asiento del lado derecho de Tokio a Kioto u Osaka si el mapa lo permite." },
    { q: "¿Debería alojarme cerca de Tokyo Station antes de un Shinkansen temprano?", a: "Tokyo Station puede reducir el estrés con equipaje en trenes tempranos, pero Shinjuku, Ueno y Asakusa pueden encajar mejor con otros estilos de viaje." },
  ],
  ko: [
    { q: "도쿄에서 교토로 갈 때 후지산은 신칸센 어느 쪽에 있나요?", a: "도쿄에서 교토나 오사카로 갈 때 후지산은 신칸센 오른쪽에 있습니다. 일반석에서는 후지산 쪽 창가인 E석을 선택하세요." },
    { q: "후지산을 보려면 어떤 좌석 문자를 예약해야 하나요?", a: "일반석 3+2 배열에서는 E석을 예약하세요. 2+2 배열의 그린샤에서는 후지산 쪽 창가가 보통 D석입니다." },
    { q: "노조미 신칸센에서도 후지산을 볼 수 있나요?", a: "네. 노조미는 신후지역에 정차하지 않지만 후지산 앞을 지나갑니다. 도쿄에서 교토나 오사카로 갈 때는 오른쪽 E석을 선택하세요." },
    { q: "신칸센에서 후지산을 보기 가장 좋은 시간은 언제인가요?", a: "맑은 날 늦은 오전부터 이른 오후가 대체로 좋습니다. 여름에는 열 안개가 생기기 전인 오전이 더 나을 수 있습니다." },
    { q: "열차에서 후지산은 얼마나 오래 보이나요?", a: "신후지 근처의 주요 전망은 보통 1분 미만입니다. 그 구간 전에 카메라를 준비하세요." },
    { q: "도쿄에서 교토나 오사카만 갈 때 JR 패스가 필요할까요?", a: "단순한 도쿄-교토 또는 도쿄-오사카 일정이라면 보통 개별 티켓이 더 합리적입니다. 히로시마나 여러 장거리 JR 이동을 추가할 때 JR 패스를 비교하세요." },
    { q: "큰 짐이 있어도 후지산 쪽 좌석을 예약할 수 있나요?", a: "가능하지만 대형 수하물 공간도 필요하다면 일찍 예약하세요. 후지산 쪽 창가와 수하물 공간 좌석은 모두 매진될 수 있습니다." },
    { q: "E석이 없으면 어떻게 해야 하나요?", a: "다른 시간대 열차를 확인하거나, 좌석표에서 가능하다면 도쿄에서 교토/오사카 방향의 다른 오른쪽 좌석을 선택하세요." },
    { q: "이른 신칸센 전날에는 도쿄역 근처에 머무는 게 좋나요?", a: "도쿄역은 이른 열차와 짐 이동의 부담을 줄여줍니다. 다만 신주쿠, 우에노, 아사쿠사도 여행 스타일에 따라 더 잘 맞을 수 있습니다." },
  ],
  "zh-TW": [
    { q: "從東京到京都時，富士山在新幹線哪一側？", a: "從東京前往京都或大阪時，富士山在新幹線右側。普通車請選 E 座，這是富士山側窗邊。" },
    { q: "想看富士山應該訂哪個座位字母？", a: "普通車 3+2 座位配置請訂 E 座。Green Car 2+2 配置中，富士山側窗邊通常是 D 座。" },
    { q: "搭 Nozomi 新幹線也能看到富士山嗎？", a: "可以。Nozomi 不停靠新富士，但仍會經過富士山。東京往京都或大阪方向請選右側 E 座。" },
    { q: "從新幹線看富士山的最佳時間是？", a: "天氣晴朗時，上午晚些時候到下午早些時候通常較好。夏天則可能早上更好，因為熱霧還沒變重。" },
    { q: "從列車上可以看到富士山多久？", a: "主要景色通常在新富士附近不到一分鐘。請在進入該區間前先準備好相機。" },
    { q: "東京到京都或大阪需要 JR Pass 嗎？", a: "單純東京-京都或東京-大阪行程通常買單程票更合理。若加入廣島或多段長距離 JR，再比較 JR Pass。" },
    { q: "有大型行李也能訂富士山側座位嗎？", a: "可以，但如果還需要大型行李空間，請提早預訂。富士山側窗邊和行李空間座位都可能售完。" },
    { q: "如果 E 座沒有了怎麼辦？", a: "可以改查其他班次，或在座位圖允許時選擇東京往京都/大阪方向的其他右側座位。" },
    { q: "搭早班新幹線前一晚該住東京站附近嗎？", a: "東京站能減少早班列車與行李壓力，但新宿、上野、淺草也可能更符合不同旅行風格。" },
  ],
  "zh-CN": [
    { q: "从东京到京都时，富士山在新干线哪一侧？", a: "从东京前往京都或大阪时，富士山在新干线右侧。普通车请选 E 座，这是富士山侧窗边。" },
    { q: "想看富士山应该订哪个座位字母？", a: "普通车 3+2 座位布局请订 E 座。Green Car 2+2 布局中，富士山侧窗边通常是 D 座。" },
    { q: "坐 Nozomi 新干线也能看到富士山吗？", a: "可以。Nozomi 不停靠新富士，但仍会经过富士山。东京去京都或大阪方向请选择右侧 E 座。" },
    { q: "从新干线看富士山的最佳时间是？", a: "天气晴朗时，上午较晚到下午较早通常比较好。夏天可能早上更好，因为热雾还没变重。" },
    { q: "从列车上能看到富士山多久？", a: "主要景色通常在新富士附近不到一分钟。请在进入该区间前准备好相机。" },
    { q: "东京到京都或大阪需要 JR Pass 吗？", a: "单纯东京-京都或东京-大阪行程通常买单程票更合理。如果加入广岛或多段长距离 JR，再比较 JR Pass。" },
    { q: "有大件行李也能订富士山侧座位吗？", a: "可以，但如果还需要大件行李空间，请尽早预订。富士山侧窗边和行李空间座位都可能售罄。" },
    { q: "如果 E 座没有了怎么办？", a: "可以查看其他班次，或在座位图允许时选择东京去京都/大阪方向的其他右侧座位。" },
    { q: "早班新干线前一晚应该住东京站附近吗？", a: "东京站能减少早班列车和行李压力，但新宿、上野、浅草也可能更适合不同旅行风格。" },
  ],
  fr: [
    { q: "De quel côté du Shinkansen voit-on le mont Fuji de Tokyo à Kyoto ?", a: "De Tokyo vers Kyoto ou Osaka, le mont Fuji est du côté droit du Shinkansen. En voiture standard, choisissez le siège E pour la fenêtre côté Fuji." },
    { q: "Quelle lettre de siège réserver pour voir le mont Fuji ?", a: "En voiture standard 3+2, réservez le siège E. En Green Car 2+2, la fenêtre côté mont Fuji est généralement le siège D." },
    { q: "Peut-on voir le mont Fuji depuis le Nozomi Shinkansen ?", a: "Oui. Le Nozomi ne s’arrête pas à Shin-Fuji, mais il passe devant le mont Fuji. Depuis Tokyo vers Kyoto ou Osaka, choisissez le côté droit, siège E." },
    { q: "Quel est le meilleur moment pour voir le mont Fuji depuis le Shinkansen ?", a: "La fin de matinée ou le début d’après-midi par temps clair fonctionne souvent bien. En été, le matin peut être meilleur avant que la brume ne s’installe." },
    { q: "Combien de temps voit-on le mont Fuji depuis le train ?", a: "La vue principale dure généralement moins d’une minute autour de Shin-Fuji. Préparez votre appareil photo avant cette zone." },
    { q: "Le JR Pass vaut-il le coup pour Tokyo vers Kyoto ou Osaka ?", a: "Pour un simple Tokyo-Kyoto ou Tokyo-Osaka, les billets à l’unité sont généralement plus logiques. Vérifiez le JR Pass seulement si vous ajoutez Hiroshima ou plusieurs longs trajets JR." },
    { q: "Puis-je réserver un siège côté Fuji avec de gros bagages ?", a: "Oui, mais réservez tôt si vous avez besoin d’un espace pour bagages volumineux. La disponibilité côté Fuji peut partir vite." },
    { q: "Que faire si le siège E n’est pas disponible ?", a: "Choisissez un autre siège côté droit de Tokyo vers Kyoto/Osaka si possible, ou vérifiez un horaire voisin." },
    { q: "Faut-il dormir près de Tokyo Station avant un Shinkansen tôt ?", a: "Tokyo Station peut réduire le stress avec les bagages, mais Shinjuku, Ueno et Asakusa peuvent mieux convenir selon votre style de voyage." },
  ],
  de: [
    { q: "Auf welcher Seite des Shinkansen ist Mt. Fuji von Tokyo nach Kyoto?", a: "Von Tokyo nach Kyoto oder Osaka liegt Mt. Fuji auf der rechten Seite des Shinkansen. Im Standardwagen wähle Sitz E für das Fuji-seitige Fenster." },
    { q: "Welchen Sitzbuchstaben soll ich für Mt. Fuji buchen?", a: "Buche Sitz E in Standardwagen mit 3+2-Anordnung. Im Green Car mit 2+2-Anordnung ist das Fuji-Fenster meistens Sitz D." },
    { q: "Kann ich Mt. Fuji aus dem Nozomi Shinkansen sehen?", a: "Ja. Nozomi hält nicht in Shin-Fuji, fährt aber an Mt. Fuji vorbei. Von Tokyo nach Kyoto oder Osaka wähle rechts, Sitz E." },
    { q: "Wann sieht man Mt. Fuji aus dem Shinkansen am besten?", a: "Später Vormittag bis früher Nachmittag funktioniert an klaren Tagen oft gut. Im Sommer kann der Morgen besser sein, bevor Hitzedunst entsteht." },
    { q: "Wie lange sieht man Mt. Fuji aus dem Zug?", a: "Die wichtigste Sicht dauert rund um Shin-Fuji meist weniger als eine Minute. Halte die Kamera vorher bereit." },
    { q: "Lohnt sich der JR Pass für Tokyo nach Kyoto oder Osaka?", a: "Für eine einfache Tokyo-Kyoto- oder Tokyo-Osaka-Reise sind Einzeltickets meist sinnvoller. Vergleiche den JR Pass, wenn du Hiroshima oder mehrere lange JR-Fahrten hinzufügst." },
    { q: "Kann ich einen Fuji-seitigen Sitz mit großem Gepäck reservieren?", a: "Ja, aber buche früh, wenn du zusätzlich Platz für übergroßes Gepäck brauchst. Fuji-Fensterplätze und Gepäckplätze können ausverkauft sein." },
    { q: "Was tun, wenn Sitz E nicht verfügbar ist?", a: "Prüfe eine andere Abfahrtszeit oder wähle, wenn möglich, einen anderen rechten Sitz von Tokyo nach Kyoto oder Osaka." },
    { q: "Sollte ich vor einem frühen Shinkansen nahe Tokyo Station übernachten?", a: "Tokyo Station kann Stress mit Gepäck und frühen Zügen reduzieren. Shinjuku, Ueno und Asakusa können je nach Reisestil aber besser passen." },
  ],
  ru: [
    { q: "С какой стороны синкансэна видна Фудзи по пути из Токио в Киото?", a: "Из Токио в Киото или Осаку Фудзи находится справа от синкансэна. В обычном вагоне выбирайте место E у окна на сторону Фудзи." },
    { q: "Какую букву места выбрать, чтобы увидеть Фудзи?", a: "В обычных вагонах с компоновкой 3+2 выбирайте место E. В Green Car с компоновкой 2+2 окно на сторону Фудзи обычно место D." },
    { q: "Можно ли увидеть Фудзи из синкансэна Nozomi?", a: "Да. Nozomi не останавливается на Shin-Fuji, но проходит мимо Фудзи. Из Токио в Киото или Осаку выбирайте правую сторону, место E." },
    { q: "Когда лучше всего смотреть на Фудзи из синкансэна?", a: "В ясный день обычно хорошо подходит позднее утро или ранний день. Летом утро может быть лучше до появления дымки." },
    { q: "Как долго видно Фудзи из поезда?", a: "Главный вид около Shin-Fuji обычно длится меньше минуты. Подготовьте камеру заранее." },
    { q: "Стоит ли брать JR Pass для маршрута Токио-Киото или Осака?", a: "Для простого маршрута Токио-Киото или Токио-Осака обычно разумнее отдельные билеты. Сравните JR Pass, если добавляете Хиросиму или несколько длинных поездок JR." },
    { q: "Можно ли забронировать место со стороны Фудзи с крупным багажом?", a: "Да, но бронируйте заранее, если нужен и отсек для крупного багажа. Места у окна на сторону Фудзи и багажные места могут закончиться." },
    { q: "Что делать, если места E нет?", a: "Проверьте другое время отправления или выберите другое место справа из Токио в Киото или Осаку, если схема мест позволяет." },
    { q: "Стоит ли жить рядом с Tokyo Station перед ранним синкансэном?", a: "Tokyo Station снижает стресс с багажом и ранними поездами, но Shinjuku, Ueno и Asakusa могут лучше подойти под другой стиль поездки." },
  ],
};

export default async function GuidePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guide" });
  const isFr = locale === "fr";
  const copy = isFr ? frGuideCopy : enGuideCopy;
  const quickAnswer = quickAnswerCopyByLocale[locale] ?? quickAnswerCopyByLocale.en;
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

  const priorityFaqItems = priorityGuideFaqByLocale[locale] ?? priorityGuideFaqByLocale.en;
  const orderedFaqItems = dedupeFaqItems([
    ...priorityFaqItems,
    ...faqItems.filter((item, index) => !isDuplicateGuideFaq(item, index)),
  ]);
  const faqSchemaData = faqItemsToSchema(orderedFaqItems, isFr ? "fr" : undefined);
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

  const renderTravelEssentials = () => (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-3.5 md:px-6 md:py-4 border-b border-slate-100 bg-slate-50/60">
        <h2 className="text-[13px] md:text-[15px] font-semibold text-slate-900">
          Pre-departure checklist
        </h2>
        <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
          Keep the booking steps in order: route first, rail second, arrival basics after.
        </p>
      </div>
      <div className="grid gap-3 p-3.5 md:p-4">
        <div className="grid gap-2 text-[12px] leading-5 text-slate-600 md:grid-cols-2">
          <Link href="/plan-your-trip" className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 font-semibold text-slate-800 hover:bg-white">
            Choose your route
          </Link>
          <Link href="/airport-transfers" className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 font-semibold text-slate-800 hover:bg-white">
            Plan airport transfer
          </Link>
          <Link href="/areas-to-stay" className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 font-semibold text-slate-800 hover:bg-white">
            Choose stay area
          </Link>
          <TrackedAffiliateLink
            href={ESIM_URL}
            target="_blank"
            rel={AFFILIATE_REL}
            category="esim"
            provider="klook"
            placement="guide_checklist"
            pagePath="/guide"
            locale={locale}
            label="Get Japan eSIM"
            linkId="esim"
            product="esim"
            className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 font-semibold text-slate-800 hover:bg-white"
          >
            Get Japan eSIM
          </TrackedAffiliateLink>
        </div>
      </div>
    </section>
  );

  const renderShinkansenDaySetup = () => (
    <section className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-4 shadow-sm shadow-emerald-100/60 lg:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">
        Shinkansen day setup
      </p>
      <div className="mt-2 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Choose where to stay before your Shinkansen day
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-slate-600">
            If you are taking an early Shinkansen to Kyoto or Osaka, your Tokyo base matters. Tokyo Station can reduce luggage stress, while Shinjuku, Ueno, and Asakusa may fit different travel styles.
          </p>
        </div>
        <TrackedInternalLink
          href="/areas-to-stay/tokyo-first-time"
          sourcePage="/guide"
          placement="guide_shinkansen_day_setup"
          label="Choose Tokyo stay area"
          locale={locale}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#168a56] bg-[#168a56] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
        >
          Choose Tokyo stay area
        </TrackedInternalLink>
      </div>
    </section>
  );

  const renderSeatGuides = () => (
    <section className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
        Seat guides by topic
      </p>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <Link href="/shinkansen-seat-e" className="rounded-xl border border-sky-100 bg-white px-3.5 py-3 text-[12px] transition-colors hover:bg-sky-50">
          <span className="block font-semibold text-slate-900">Seat E guide</span>
          <span className="mt-0.5 block text-slate-500">Learn when Seat E is the Mt. Fuji-side window seat.</span>
        </Link>
        <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="rounded-xl border border-sky-100 bg-white px-3.5 py-3 text-[12px] transition-colors hover:bg-sky-50">
          <span className="block font-semibold text-slate-900">Tokyo → Kyoto Mt. Fuji seat</span>
          <span className="mt-0.5 block text-slate-500">The simple right-side / Seat E answer for Tokyo to Kyoto or Osaka.</span>
        </Link>
        <Link href="/kyoto-to-tokyo-mt-fuji-seat" className="rounded-xl border border-sky-100 bg-white px-3.5 py-3 text-[12px] transition-colors hover:bg-sky-50">
          <span className="block font-semibold text-slate-900">Kyoto → Tokyo Mt. Fuji seat</span>
          <span className="mt-0.5 block text-slate-500">Which side and seat to choose on the return trip.</span>
        </Link>
        <Link href="/shinkansen-seat-letters" className="rounded-xl border border-sky-100 bg-white px-3.5 py-3 text-[12px] transition-colors hover:bg-sky-50">
          <span className="block font-semibold text-slate-900">Seat letters explained</span>
          <span className="mt-0.5 block text-slate-500">Understand A, B, C, D, E, window and aisle seats.</span>
        </Link>
      </div>
    </section>
  );

  const renderContinuePlanning = () => (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/70">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        Continue planning
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Link
          href="/local-tokyo"
          className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-[12px] transition-colors hover:border-slate-300 hover:bg-white"
        >
          <span className="block font-semibold text-slate-900">Local Tokyo neighborhoods</span>
          <span className="mt-0.5 block text-slate-500">
            Explore quieter east-side neighborhoods like Kiyosumi-Shirakawa, Kuramae, and Ryogoku.
          </span>
          <span className="mt-3 inline-flex text-[11px] font-semibold text-slate-600">Explore Local Tokyo →</span>
        </Link>
        <Link
          href="/itineraries/7-day-first-time-japan"
          className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-[12px] transition-colors hover:border-slate-300 hover:bg-white"
        >
          <span className="block font-semibold text-slate-900">7-day first-time Japan itinerary</span>
          <span className="mt-0.5 block text-slate-500">
            Plan Tokyo, Mt. Fuji, Kyoto, and Osaka in a practical first-time route.
          </span>
          <span className="mt-3 inline-flex text-[11px] font-semibold text-slate-600">Open itinerary →</span>
        </Link>
        <Link
          href="/areas-to-stay/tokyo-first-time"
          className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-[12px] transition-colors hover:border-slate-300 hover:bg-white"
        >
          <span className="block font-semibold text-slate-900">Tokyo areas to stay</span>
          <span className="mt-0.5 block text-slate-500">
            Choose Shinjuku, Ueno, Asakusa, Tokyo Station, or East Tokyo before booking hotels.
          </span>
          <span className="mt-3 inline-flex text-[11px] font-semibold text-slate-600">Choose Tokyo stay area →</span>
        </Link>
        <TrackedCtaLink
          href="/local-hotel-picks"
          placement="guide_local_hotel_picks"
          label="See local hotel picks"
          pagePath="/guide"
          locale={locale}
          category="hotel"
          className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-[12px] transition-colors hover:border-slate-300 hover:bg-white"
        >
          <span className="block font-semibold text-slate-900">Local hotel picks</span>
          <span className="mt-0.5 block text-slate-500">See practical hotel examples by area logic. Not rankings.</span>
          <span className="mt-3 inline-flex text-[11px] font-semibold text-slate-600">See hotel examples →</span>
        </TrackedCtaLink>
      </div>
    </section>
  );

  const renderSeatBookingReminder = () => (
    <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/60 px-3.5 py-3">
      <p className="text-sm font-semibold text-slate-950">Ready to book Seat E?</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        Book your Shinkansen ticket after confirming the Fuji-side seat. Check JR Pass only if your route includes multiple long-distance JR rides.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <TrackedAffiliateLink
          href={KLOOK_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          category="train"
          provider="klook"
          placement="guide_top"
          pagePath="/guide"
          locale={locale}
          label="Book Shinkansen ticket"
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#e66700]"
        >
          Book Shinkansen ticket
        </TrackedAffiliateLink>
        <TrackedAffiliateLink
          href={JR_PASS_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          category="train"
          provider="klook"
          placement="guide_top"
          pagePath="/guide"
          locale={locale}
          label="Check JR Pass options"
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[#ff7a00] bg-[#ff7a00] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#e66700]"
        >
          Check JR Pass options
        </TrackedAffiliateLink>
      </div>
    </div>
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
      <div className="flex-1 flex flex-col px-4 py-6 lg:py-10 max-w-2xl lg:max-w-5xl mx-auto w-full">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-lg lg:text-[26px] lg:leading-tight font-semibold tracking-tight text-slate-950">
            {displayTitle}
          </h1>
          <p className="mt-1 text-xs lg:text-sm text-slate-500">{t("subtitle")}</p>
          <p className="mt-0.5 text-[10px] lg:text-xs text-slate-500">
            {t("writtenBy")}
          </p>
        </div>

        <section className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-[13px] leading-relaxed text-emerald-950 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-emerald-700">
            {quickAnswer.title}
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            {quickAnswer.heading}
          </h2>
          <ul className="mt-3 space-y-2">
            {quickAnswer.items.map((item) => (
              <li key={item.bold}>
                <strong>{item.bold}</strong> {item.text}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/#seat-checker"
              className="inline-flex items-center rounded-full border border-[#168a56] bg-[#168a56] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {quickAnswer.cta}
            </Link>
          </div>
        </section>

        {/* Two-column layout on desktop: article + sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:items-start">
        <div className="min-w-0">

        {/* Intro */}
        <section className="mb-5 text-[13px] lg:text-sm leading-relaxed text-slate-700 bg-white/90 border border-slate-200 rounded-2xl px-4 py-3 lg:px-6 lg:py-4 shadow-sm shadow-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            {t("introH2")}
          </h2>
          <p className="mb-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
            <strong>{copy.quickLabel}</strong> {copy.introQuick}
          </p>
          <p>{t("introP1")}</p>
          <p className="mt-2 text-[12px] text-slate-600">{t("introP2")}</p>
        </section>

        <div className="mb-5">
          <RailDecisionCard
            title="Book Shinkansen ticket"
            body="For a simple Tokyo → Kyoto / Osaka trip, choose Seat E if available and book a single Shinkansen ticket."
            primaryCta={{
              label: "Klook",
              href: KLOOK_URL,
              provider: "klook",
              linkId: "shinkansenTicket",
              product: "shinkansen_ticket",
              adid: "1265303",
            }}
            secondaryCta={{
              label: "Klook",
              href: JR_PASS_URL,
              provider: "klook",
              linkId: "jrPass",
              product: "jr_pass",
              adid: "1165791",
            }}
            tertiaryTextLink={
              OMIO_SHINKANSEN_URL
                ? {
                    label: "Omio",
                    href: OMIO_SHINKANSEN_URL,
                    provider: "omio",
                    linkId: "omioShinkansen",
                    product: "route_compare",
                  }
                : undefined
            }
            secondaryTitle="Check JR Pass options"
            secondaryBody="If your route includes Hiroshima, multiple long JR rides, or a return to Tokyo, check JR Pass options before booking separate tickets."
            placement="guide_rail_decision"
            locale={locale}
            routeType="simple-shinkansen"
          />
        </div>

        {renderShinkansenDaySetup()}

        {/* TL;DR */}
        <section id="tldr" className="mb-5 text-[13px] lg:text-sm leading-relaxed text-slate-700 bg-white border border-slate-200 rounded-2xl px-4 py-3 lg:px-6 lg:py-4 shadow-sm shadow-slate-200/70">
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

        {/* Jump to section — mobile only */}
        <div className="mb-5 text-[12px] text-slate-500 leading-relaxed lg:hidden">
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

        <div className="space-y-6 lg:space-y-8 text-[13px] lg:text-sm leading-relaxed text-slate-700">
          <section id="which-side" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 mb-2.5">
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

          <section id="seat-letters" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 mb-2.5">
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

          <section id="when-to-see" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 mb-2.5">
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

          <section id="route-zone" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 mb-2.5">
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

          <section id="nozomi-hikari-kodama" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 mb-2.5">
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

          <section id="jr-pass" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 mb-2.5">
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
            <p className="mt-3 text-[12px] text-slate-600">
              For a route-level decision before buying, use the{" "}
              <Link href="/jr-pass-vs-single-ticket" className="font-semibold text-sky-700 underline underline-offset-2">
                JR Pass vs single ticket guide
              </Link>
              .
            </p>
            <p className="mt-3 text-[12px] text-slate-600">
              {copy.itineraryBefore} <Link href="/itineraries/7-day-first-time-japan" className="font-semibold text-sky-700 underline underline-offset-2">{copy.itineraryLink}</Link>.
            </p>
          </section>

          <section id="book-seat-e" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 mb-2.5">
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
            {renderSeatBookingReminder()}
          </section>

          <section id="common-mistakes" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 mb-2.5">
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
          <section id="faq" className="bg-white border border-slate-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-slate-200/60">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-3">
              <Info className="h-4 w-4 text-sky-600" />
              {copy.faqH2 ?? t("faqH2")}
            </h2>
            <div className="space-y-3">
              {orderedFaqItems.map((item, i) => (
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
          </section>

          {/* Section 5: Make it easy */}
          <section className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-4 lg:px-6 lg:py-5 shadow-sm shadow-sky-100">
            <h2 className="flex items-center gap-2 text-sm lg:text-base font-semibold text-slate-900 mb-2.5">
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

          {renderSeatGuides()}

          {renderContinuePlanning()}

          <ShareThisPage
            title="Which Shinkansen Seat to See Mt. Fuji?"
            placement="guide_footer"
            description="Was this Shinkansen seat guide helpful? Share it with someone planning a Japan trip."
            locale={locale}
          />

        </div>
        </div>{/* close main column */}

        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            {/* Table of contents */}
            <nav className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                {copy.jumpTo}
              </p>
              <ul className="space-y-2 text-[12px]">
                <li><a href="#tldr" className="text-slate-600 hover:text-slate-900 transition-colors">{copy.jumpTldr}</a></li>
                <li><a href="#which-side" className="text-slate-600 hover:text-slate-900 transition-colors">{copy.jumpSide}</a></li>
                <li><a href="#seat-letters" className="text-slate-600 hover:text-slate-900 transition-colors">{copy.jumpLetters}</a></li>
                <li><a href="#when-to-see" className="text-slate-600 hover:text-slate-900 transition-colors">{copy.jumpTime}</a></li>
                <li><a href="#route-zone" className="text-slate-600 hover:text-slate-900 transition-colors">{copy.jumpZone}</a></li>
                <li><a href="#jr-pass" className="text-slate-600 hover:text-slate-900 transition-colors">{copy.jumpJrPass}</a></li>
                <li><a href="#faq" className="text-slate-600 hover:text-slate-900 transition-colors">{copy.jumpFaq}</a></li>
              </ul>
            </nav>

          </div>
        </aside>

        </div>{/* close 2-column grid */}
      </div>
      <SiteFooter />
    </main>
  );
}
