import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Mountain, Train, Info } from "lucide-react";
import Script from "next/script";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "../components/SiteHeader";
import { getAlternates } from "@/i18n/hreflang";
import { KLOOK_URL, ESIM_URL, JR_PASS_URL, OMIO_SHINKANSEN_URL } from "@/src/affiliateLinks";
import { SiteFooter } from "@/components/content/SiteFooter";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { ShareThisPage } from "@/components/share/ShareThisPage";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { StickyMobileCta } from "@/components/affiliate/StickyMobileCta";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";

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
  faqH2: "Questions fréquentes",
  makeEasyH2: "Simplifiez-vous la tâche avec le Shinkansen Mt. Fuji Seat Checker",
  footerBrand: "fujiseat.com — outils de voyage au Japon",
  footerPartner: "Liens partenaires affichés uniquement lorsqu'ils correspondent à l'étape de préparation.",
};

const guideCopyOverridesByLocale: Record<string, Partial<typeof enGuideCopy>> = {
  "pt-BR": {
    title: "Como ver o Monte Fuji do Shinkansen",
    quickLabel: "Resposta rápida:",
    whichSideQuick: <>De Tokyo para Kyoto ou Osaka, o Monte Fuji fica no <strong>lado direito</strong> do Shinkansen — especificamente no assento E nos carros standard. De Kyoto ou Osaka de volta para Tokyo, fica no <strong>lado esquerdo</strong> — também no assento E. A vista aparece perto da estação Shin-Fuji e dura cerca de 30 a 60 segundos.</>,
    lettersQuick: <>Os carros standard do Tokaido Shinkansen têm layout 3+2, com as letras A, B, C de um lado e D, E do outro. <strong>O assento E é a janela do lado do Monte Fuji</strong> nos carros standard. O Green Car usa layout 2+2, em que o assento D costuma ser a janela do lado do Monte Fuji. O assento A fica sempre no lado oposto, voltado para o mar.</>,
    whenQuick: <>Fim da manhã até o começo da tarde costuma dar a visão mais clara do Monte Fuji em um dia típico. <strong>O inverno (dezembro-fevereiro)</strong> é a melhor estação para ver a silhueta com neve e céu limpo. À noite, o Monte Fuji geralmente não é visível porque a montanha não é iluminada.</>,
    routeQuick: <>O Monte Fuji fica visível no Tokaido Shinkansen entre as estações <strong>Shin-Yokohama e Shizuoka</strong>, com a melhor vista perto da <strong>estação Shin-Fuji</strong>. A janela total de visibilidade é de cerca de 30 a 60 segundos em velocidade de Shinkansen.</>,
    trainTypeQuick: <>Nozomi, Hikari e Kodama passam pelo Monte Fuji, e o assento recomendado é o mesmo: E. <strong>Hikari e Kodama</strong> param em Shin-Fuji, o que pode dar uma janela um pouco mais longa. <strong>Nozomi</strong> é o mais rápido, mas não para em Shin-Fuji.</>,
    jrPassQuick: <>Para uma viagem simples Tokyo-Kyoto ida e volta, <strong>bilhetes separados costumam ser mais baratos</strong>. O JR Pass começa a fazer sentido quando você adiciona Hiroshima, faz 2 ou mais viagens longas de JR ou usa vários trechos de Shinkansen em uma semana.</>,
    bookQuick: <>No guichê JR, mostre 「<strong>E席をお願いします</strong>」. Na Klook, escolha a rota e selecione a coluna E no mapa de assentos. Com JR Pass, reserve no balcão de reservas JR antes de embarcar.</>,
  },
  es: {
    title: "Cómo ver el Monte Fuji desde el Shinkansen",
    quickLabel: "Respuesta rápida:",
    whichSideQuick: <>De Tokio a Kioto u Osaka, el Monte Fuji está en el <strong>lado derecho</strong> del Shinkansen — concretamente el asiento E en coches estándar. De Kioto u Osaka de vuelta a Tokio, está en el <strong>lado izquierdo</strong> — también el asiento E. La vista aparece cerca de la estación Shin-Fuji y dura unos 30 a 60 segundos.</>,
    lettersQuick: <>Los coches estándar del Tokaido Shinkansen tienen distribución 3+2, con A, B, C a un lado y D, E al otro. <strong>El asiento E es la ventana del lado del Monte Fuji</strong> en coches estándar. Los Green Cars usan distribución 2+2, donde la ventana del Monte Fuji suele ser el asiento D. El asiento A siempre queda en el lado opuesto, hacia el mar.</>,
    whenQuick: <>De media mañana a primera hora de la tarde suele dar la vista más clara del Monte Fuji en un día normal. <strong>El invierno (diciembre-febrero)</strong> es la mejor temporada para ver la silueta nevada y cielos despejados. De noche, el Monte Fuji normalmente no se ve porque la montaña no está iluminada.</>,
    routeQuick: <>El Monte Fuji se ve desde el Tokaido Shinkansen entre <strong>Shin-Yokohama y Shizuoka</strong>, con la vista más clara cerca de la <strong>estación Shin-Fuji</strong>. La ventana total de visibilidad es de unos 30 a 60 segundos a velocidad de Shinkansen.</>,
    trainTypeQuick: <>Nozomi, Hikari y Kodama pasan por el Monte Fuji, y el asiento recomendado es el mismo: E. <strong>Hikari y Kodama</strong> paran en Shin-Fuji, lo que puede dar una ventana de vista algo más larga. <strong>Nozomi</strong> es el más rápido, pero no para en Shin-Fuji.</>,
    jrPassQuick: <>Para un viaje simple de ida y vuelta Tokio-Kioto, <strong>los billetes individuales suelen ser más baratos</strong>. El JR Pass empieza a compensar si añades Hiroshima, haces 2 o más trayectos largos de JR, o tomas varios tramos de Shinkansen en una semana.</>,
    bookQuick: <>En una taquilla JR, muestra 「<strong>E席をお願いします</strong>」. En Klook, elige la ruta y selecciona la columna E en el mapa de asientos. Con JR Pass, reserva en un mostrador de reservas JR antes de subir.</>,
  },
  ko: {
    title: "신칸센에서 후지산을 보는 좌석 가이드",
    quickLabel: "빠른 답변:",
    whichSideQuick: <>도쿄에서 교토나 오사카로 갈 때 후지산은 신칸센의 <strong>오른쪽</strong>에 보이며, 일반석에서는 E석이 기준입니다. 교토나 오사카에서 도쿄로 돌아올 때는 <strong>왼쪽</strong>이며, 역시 E석입니다. 후지산은 신후지 역 근처에서 약 30~60초 동안 보입니다.</>,
    lettersQuick: <>도카이도 신칸센 일반석은 A, B, C 한쪽과 D, E 다른 쪽으로 된 3+2 배열입니다. 일반석에서는 <strong>E석이 후지산 쪽 창가 좌석</strong>입니다. 그린샤는 2+2 배열이라 후지산 쪽 창가는 보통 D석입니다. A석은 항상 반대편, 바다 쪽입니다.</>,
    whenQuick: <>보통 맑은 날에는 늦은 오전부터 이른 오후가 후지산을 가장 보기 좋습니다. <strong>겨울(12월-2월)</strong>은 눈 덮인 실루엣과 맑은 하늘을 보기 가장 좋은 계절입니다. 밤에는 산에 조명이 없어 보통 후지산이 보이지 않습니다.</>,
    routeQuick: <>후지산은 도카이도 신칸센의 <strong>신요코하마-시즈오카</strong> 구간에서 보이며, 가장 선명한 구간은 <strong>신후지 역</strong> 근처입니다. 신칸센 속도에서는 전체 시야 시간이 약 30~60초 정도입니다.</>,
    trainTypeQuick: <>노조미, 히카리, 고다마 모두 후지산 구간을 지나며 추천 좌석은 동일하게 E석입니다. <strong>히카리와 고다마</strong>는 신후지에 정차해 조금 더 여유가 있을 수 있습니다. <strong>노조미</strong>는 가장 빠르지만 신후지에 정차하지 않습니다.</>,
    jrPassQuick: <>단순한 도쿄-교토 왕복이라면 <strong>개별 승차권이 보통 더 저렴합니다</strong>. 히로시마를 추가하거나 장거리 JR 이동이 2회 이상이거나 일주일 안에 여러 신칸센 구간을 타는 경우 JR Pass를 비교해 보세요.</>,
    bookQuick: <>JR 매표소에서는 「<strong>E席をお願いします</strong>」라고 보여 주세요. Klook에서는 노선을 고른 뒤 좌석표에서 E열을 선택합니다. JR Pass가 있다면 승차 전 JR 예약 창구에서 좌석을 예약하세요.</>,
  },
  "zh-TW": {
    title: "從新幹線看富士山的座位指南",
    quickLabel: "快速答案：",
    whichSideQuick: <>從東京前往京都或大阪時，富士山在新幹線的<strong>右側</strong>，普通車請選 E 座。從京都或大阪返回東京時，富士山在<strong>左側</strong>，同樣選 E 座。富士山會在新富士站附近出現約 30 到 60 秒。</>,
    lettersQuick: <>東海道新幹線普通車是 3+2 座位排列，一側是 A、B、C，另一側是 D、E。普通車中，<strong>E 座是富士山側窗邊座位</strong>。Green Car 是 2+2 排列，富士山側窗邊通常是 D 座。A 座永遠是相反的海側。</>,
    whenQuick: <>一般來說，天氣晴朗時，上午較晚到下午較早時段最容易看清富士山。<strong>冬季（12 月到 2 月）</strong>最適合看見積雪輪廓與清楚天空。晚上通常看不到富士山，因為山體沒有照明。</>,
    routeQuick: <>富士山會在東海道新幹線的<strong>新橫濱到靜岡</strong>之間出現，最清楚的位置在<strong>新富士站</strong>附近。以新幹線速度通過時，總可見時間約 30 到 60 秒。</>,
    trainTypeQuick: <>Nozomi、Hikari、Kodama 都會經過富士山，建議座位一樣是 E 座。<strong>Hikari 和 Kodama</strong>會停靠新富士，視野時間可能稍長。<strong>Nozomi</strong>最快，但不停靠新富士。</>,
    jrPassQuick: <>單純東京和京都來回時，<strong>單買車票通常比較便宜</strong>。如果加入廣島、兩段以上長距離 JR 移動，或一週內搭多段新幹線，再比較 JR Pass 較合理。</>,
    bookQuick: <>在 JR 售票處可出示「<strong>E席をお願いします</strong>」。在 Klook 請先選路線，再從座位圖選 E 欄。有 JR Pass 的話，搭車前到 JR 預約櫃台劃位。</>,
  },
  "zh-CN": {
    title: "从新干线看富士山的座位指南",
    quickLabel: "快速答案：",
    whichSideQuick: <>从东京前往京都或大阪时，富士山在新干线的<strong>右侧</strong>，普通车请选择 E 座。从京都或大阪返回东京时，富士山在<strong>左侧</strong>，同样选择 E 座。富士山会在新富士站附近出现约 30 到 60 秒。</>,
    lettersQuick: <>东海道新干线普通车是 3+2 座位排列，一侧是 A、B、C，另一侧是 D、E。普通车中，<strong>E 座是富士山侧窗边座位</strong>。Green Car 是 2+2 排列，富士山侧窗边通常是 D 座。A 座始终是相反的海侧。</>,
    whenQuick: <>通常在晴天，上午较晚到下午较早时段最容易看清富士山。<strong>冬季（12 月到 2 月）</strong>最适合看见积雪轮廓和清晰天空。夜间通常看不到富士山，因为山体没有照明。</>,
    routeQuick: <>富士山会在东海道新干线的<strong>新横滨到静冈</strong>之间出现，最清楚的位置在<strong>新富士站</strong>附近。以新干线速度通过时，总可见时间约 30 到 60 秒。</>,
    trainTypeQuick: <>Nozomi、Hikari、Kodama 都会经过富士山，推荐座位同样是 E 座。<strong>Hikari 和 Kodama</strong>会停靠新富士，视野时间可能稍长。<strong>Nozomi</strong>最快，但不停靠新富士。</>,
    jrPassQuick: <>如果只是东京和京都往返，<strong>单买车票通常更划算</strong>。如果加入广岛、两段以上长距离 JR 移动，或一周内乘坐多段新干线，再比较 JR Pass。</>,
    bookQuick: <>在 JR 售票处可出示「<strong>E席をお願いします</strong>」。在 Klook 先选择路线，再从座位图选择 E 列。有 JR Pass 的话，请在乘车前到 JR 预约窗口划位。</>,
  },
  de: {
    title: "Mt. Fuji aus dem Shinkansen sehen",
    quickLabel: "Kurzantwort:",
    whichSideQuick: <>Von Tokyo nach Kyoto oder Osaka liegt Mt. Fuji auf der <strong>rechten Seite</strong> des Shinkansen — im Standardwagen konkret Sitz E. Von Kyoto oder Osaka zurück nach Tokyo liegt er auf der <strong>linken Seite</strong> — ebenfalls Sitz E. Der Blick erscheint rund um Shin-Fuji und dauert etwa 30 bis 60 Sekunden.</>,
    lettersQuick: <>Standardwagen des Tokaido Shinkansen haben eine 3+2-Sitzordnung mit A, B, C auf einer Seite und D, E auf der anderen. <strong>Sitz E ist im Standardwagen der Mt.-Fuji-Fensterplatz</strong>. Green Cars haben meist 2+2, dort ist Sitz D das Mt.-Fuji-Fenster. Sitz A ist immer die gegenüberliegende Meerseite.</>,
    whenQuick: <>Später Vormittag bis früher Nachmittag bietet an einem typischen klaren Tag meist den besten Mt.-Fuji-Blick. <strong>Winter (Dezember-Februar)</strong> ist die beste Saison für eine schneebedeckte Silhouette und klaren Himmel. Nachts ist Mt. Fuji normalerweise nicht sichtbar, weil der Berg nicht beleuchtet ist.</>,
    routeQuick: <>Mt. Fuji wird auf dem Tokaido Shinkansen zwischen <strong>Shin-Yokohama und Shizuoka</strong> sichtbar, mit dem klarsten Blick rund um <strong>Shin-Fuji</strong>. Bei Shinkansen-Geschwindigkeit dauert das Hauptfenster etwa 30 bis 60 Sekunden.</>,
    trainTypeQuick: <>Nozomi, Hikari und Kodama fahren alle an Mt. Fuji vorbei, und die Sitzempfehlung bleibt Sitz E. <strong>Hikari und Kodama</strong> halten in Shin-Fuji und können ein etwas längeres Sichtfenster geben. <strong>Nozomi</strong> ist am schnellsten, hält aber nicht in Shin-Fuji.</>,
    jrPassQuick: <>Für eine einfache Hin- und Rückfahrt Tokyo-Kyoto sind <strong>Einzeltickets meist günstiger</strong>. Der JR Pass lohnt sich eher, wenn Hiroshima, mehrere lange JR-Fahrten oder mehrere Shinkansen-Abschnitte in einer Woche dazukommen.</>,
    bookQuick: <>Am JR-Schalter zeigst du 「<strong>E席をお願いします</strong>」. Bei Klook wählst du die Strecke und dann Spalte E im Sitzplan. Mit JR Pass reservierst du vor der Fahrt am JR Reservation Counter.</>,
  },
  ru: {
    title: "Как увидеть Фудзи из синкансэна",
    quickLabel: "Короткий ответ:",
    whichSideQuick: <>Из Токио в Киото или Осаку Фудзи находится <strong>справа</strong> от синкансэна — в обычном вагоне это место E. Из Киото или Осаки обратно в Токио Фудзи будет <strong>слева</strong> — тоже место E. Вид появляется около станции Shin-Fuji примерно на 30-60 секунд.</>,
    lettersQuick: <>В обычных вагонах Tokaido Shinkansen схема 3+2: A, B, C с одной стороны и D, E с другой. <strong>Место E — окно на сторону Фудзи</strong> в обычных вагонах. В Green Car схема 2+2, и окно на сторону Фудзи обычно место D. Место A всегда на противоположной, морской стороне.</>,
    whenQuick: <>В ясный день позднее утро и ранний день обычно дают самый четкий вид на Фудзи. <strong>Зима (декабрь-февраль)</strong> — лучший сезон для снежной вершины и чистого неба. Ночью Фудзи обычно не видна, потому что гора не подсвечивается.</>,
    routeQuick: <>Фудзи видна из Tokaido Shinkansen между <strong>Shin-Yokohama и Shizuoka</strong>, самый ясный вид обычно около <strong>Shin-Fuji</strong>. На скорости синкансэна основное окно видимости длится около 30-60 секунд.</>,
    trainTypeQuick: <>Nozomi, Hikari и Kodama проходят мимо Фудзи, и рекомендация по месту та же: E. <strong>Hikari и Kodama</strong> останавливаются в Shin-Fuji, что может дать чуть более долгий обзор. <strong>Nozomi</strong> самый быстрый, но не останавливается в Shin-Fuji.</>,
    jrPassQuick: <>Для простого маршрута Токио-Киото туда-обратно <strong>отдельные билеты обычно дешевле</strong>. JR Pass стоит сравнивать, если добавляете Хиросиму, несколько длинных поездок JR или несколько сегментов синкансэна за неделю.</>,
    bookQuick: <>В кассе JR покажите 「<strong>E席をお願いします</strong>」. В Klook выберите маршрут, затем колонку E на схеме мест. С JR Pass зарезервируйте место в JR Reservation Counter до посадки.</>,
  },
};

const guideUiByLocale = {
  en: {
    travelEssentialsTitle: "Pre-departure checklist",
    travelEssentialsBody: "Keep the booking steps in order: route first, rail second, arrival basics after.",
    chooseRoute: "Choose your route",
    planAirportTransfer: "Plan airport transfer",
    chooseStayArea: "Choose stay area",
    getJapanEsim: "Get Japan eSIM",
    railDecisionLabel: "Rail booking options",
    bookShinkansenTitle: "Book Shinkansen ticket",
    bookShinkansenBody: "For a simple Tokyo → Kyoto / Osaka trip, choose Seat E if available. Use Klook to book a specific Shinkansen ticket, or Omio to compare route options before booking.",
    checkJrPassTitle: "Check JR Pass options",
    checkJrPassBody: "JR Pass is a separate decision from a single Shinkansen ticket. Check it if your route includes Hiroshima, multiple long JR rides, or a return to Tokyo.",
    shinkansenDayLabel: "Shinkansen day setup",
    shinkansenDayTitle: "Choose where to stay before your Shinkansen day",
    shinkansenDayBody: "If you are taking an early Shinkansen to Kyoto or Osaka, your Tokyo base matters. Tokyo Station can reduce luggage stress, while Shinjuku, Ueno, and Asakusa may fit different travel styles. If your Shinkansen leaves early, the hotel area matters almost as much as the seat.",
    chooseTokyoStayArea: "Choose Tokyo stay area",
    seatGuidesLabel: "Seat guides by topic",
    seatGuideTitle: "Seat E guide",
    seatGuideBody: "Learn when Seat E is the Mt. Fuji-side window seat.",
    tokyoKyotoSeatTitle: "Tokyo → Kyoto Mt. Fuji seat",
    tokyoKyotoSeatBody: "The simple right-side / Seat E answer for Tokyo to Kyoto or Osaka.",
    kyotoTokyoSeatTitle: "Kyoto → Tokyo Mt. Fuji seat",
    kyotoTokyoSeatBody: "Which side and seat to choose on the return trip.",
    seatLettersTitle: "Seat letters explained",
    seatLettersBody: "Understand A, B, C, D, E, window and aisle seats.",
    continuePlanningLabel: "Continue planning",
    localTokyoTitle: "Local Tokyo neighborhoods",
    localTokyoBody: "Explore quieter east-side neighborhoods like Kiyosumi-Shirakawa, Kuramae, and Ryogoku.",
    localTokyoLink: "Explore Local Tokyo →",
    itineraryTitle: "7-day first-time Japan itinerary",
    itineraryBody: "Plan Tokyo, Mt. Fuji, Kyoto, and Osaka in a practical first-time route.",
    itineraryLink: "Open itinerary →",
    tokyoStayTitle: "Tokyo areas to stay",
    tokyoStayBody: "Choose Shinjuku, Ueno, Asakusa, Tokyo Station, or East Tokyo before booking hotels.",
    tokyoStayLink: "Choose Tokyo stay area →",
    localHotelTitle: "Local hotel picks",
    localHotelBody: "See practical hotel examples by area logic. Not rankings.",
    localHotelLink: "See hotel examples →",
    readyTitle: "Ready to book Seat E?",
    readyBody: "Book your Shinkansen ticket after confirming the Fuji-side seat. Use route comparison if you are still deciding the train path, and check JR Pass only for multi-city JR-heavy routes.",
    bookShinkansenButton: "Book Shinkansen ticket",
    checkJrPassButton: "Check JR Pass options",
  },
  "pt-BR": {
    travelEssentialsTitle: "Checklist antes da partida",
    travelEssentialsBody: "Mantenha a ordem: rota primeiro, trem depois, chegada por último.",
    chooseRoute: "Escolher rota",
    planAirportTransfer: "Planejar traslado do aeroporto",
    chooseStayArea: "Escolher área para ficar",
    getJapanEsim: "Obter eSIM do Japão",
    railDecisionLabel: "Decisão de reserva de trem",
    bookShinkansenTitle: "Reservar bilhete Shinkansen",
    bookShinkansenBody: "Para uma rota simples Tokyo → Kyoto / Osaka, escolha o assento E se estiver disponível e reserve um bilhete avulso de Shinkansen.",
    checkJrPassTitle: "Ver opções de JR Pass",
    checkJrPassBody: "Se sua rota inclui Hiroshima, vários trechos longos de JR ou retorno a Tokyo, verifique o JR Pass antes de comprar bilhetes separados.",
    shinkansenDayLabel: "Preparação do dia do Shinkansen",
    shinkansenDayTitle: "Escolha onde ficar antes do dia do Shinkansen",
    shinkansenDayBody: "Se você vai pegar um Shinkansen cedo para Kyoto ou Osaka, sua base em Tokyo importa. Tokyo Station reduz o estresse com bagagem; Shinjuku, Ueno e Asakusa podem combinar com outros estilos.",
    chooseTokyoStayArea: "Escolher área em Tokyo",
    seatGuidesLabel: "Guias de assento por tema",
    seatGuideTitle: "Guia do assento E",
    seatGuideBody: "Entenda quando o assento E é a janela do lado do Monte Fuji.",
    tokyoKyotoSeatTitle: "Assento Tokyo → Kyoto para Fuji",
    tokyoKyotoSeatBody: "A resposta simples: lado direito / assento E de Tokyo para Kyoto ou Osaka.",
    kyotoTokyoSeatTitle: "Assento Kyoto → Tokyo para Fuji",
    kyotoTokyoSeatBody: "Qual lado e assento escolher no retorno.",
    seatLettersTitle: "Letras dos assentos explicadas",
    seatLettersBody: "Entenda A, B, C, D, E, janela e corredor.",
    continuePlanningLabel: "Continue planejando",
    localTokyoTitle: "Bairros locais de Tokyo",
    localTokyoBody: "Explore áreas mais calmas no leste, como Kiyosumi-Shirakawa, Kuramae e Ryogoku.",
    localTokyoLink: "Explorar Tokyo local →",
    itineraryTitle: "Roteiro de 7 dias para primeira viagem",
    itineraryBody: "Planeje Tokyo, Monte Fuji, Kyoto e Osaka em uma rota prática.",
    itineraryLink: "Abrir roteiro →",
    tokyoStayTitle: "Onde ficar em Tokyo",
    tokyoStayBody: "Escolha Shinjuku, Ueno, Asakusa, Tokyo Station ou East Tokyo antes de reservar hotéis.",
    tokyoStayLink: "Escolher área em Tokyo →",
    localHotelTitle: "Exemplos de hotéis locais",
    localHotelBody: "Veja exemplos práticos por lógica de área. Não são rankings.",
    localHotelLink: "Ver exemplos de hotéis →",
    readyTitle: "Pronto para reservar o assento E?",
    readyBody: "Reserve o Shinkansen depois de confirmar o assento do lado do Fuji. Veja o JR Pass apenas se sua rota tiver vários trajetos longos de JR.",
    bookShinkansenButton: "Reservar Shinkansen",
    checkJrPassButton: "Ver JR Pass",
  },
  es: {
    travelEssentialsTitle: "Checklist antes de salir",
    travelEssentialsBody: "Mantén el orden: primero ruta, luego tren, después lo básico de llegada.",
    chooseRoute: "Elegir ruta",
    planAirportTransfer: "Planificar traslado",
    chooseStayArea: "Elegir zona para alojarse",
    getJapanEsim: "Obtener eSIM de Japón",
    railDecisionLabel: "Decisión de reserva de tren",
    bookShinkansenTitle: "Reservar billete Shinkansen",
    bookShinkansenBody: "Para una ruta simple Tokio → Kioto / Osaka, elige el asiento E si está disponible y reserva un billete individual de Shinkansen.",
    checkJrPassTitle: "Ver opciones de JR Pass",
    checkJrPassBody: "Si tu ruta incluye Hiroshima, varios trayectos largos de JR o regreso a Tokio, revisa el JR Pass antes de comprar billetes separados.",
    shinkansenDayLabel: "Preparación del día Shinkansen",
    shinkansenDayTitle: "Elige dónde alojarte antes del día del Shinkansen",
    shinkansenDayBody: "Si tomas un Shinkansen temprano a Kioto u Osaka, tu base en Tokio importa. Tokyo Station reduce el estrés con equipaje; Shinjuku, Ueno y Asakusa pueden encajar con otros estilos.",
    chooseTokyoStayArea: "Elegir zona en Tokio",
    seatGuidesLabel: "Guías de asiento por tema",
    seatGuideTitle: "Guía del asiento E",
    seatGuideBody: "Aprende cuándo el asiento E es la ventana del lado del Monte Fuji.",
    tokyoKyotoSeatTitle: "Asiento Tokio → Kioto para Fuji",
    tokyoKyotoSeatBody: "La respuesta simple: lado derecho / asiento E de Tokio a Kioto u Osaka.",
    kyotoTokyoSeatTitle: "Asiento Kioto → Tokio para Fuji",
    kyotoTokyoSeatBody: "Qué lado y asiento elegir en el viaje de vuelta.",
    seatLettersTitle: "Letras de asiento explicadas",
    seatLettersBody: "Entiende A, B, C, D, E, ventana y pasillo.",
    continuePlanningLabel: "Continuar planificación",
    localTokyoTitle: "Barrios locales de Tokio",
    localTokyoBody: "Explora zonas tranquilas del este como Kiyosumi-Shirakawa, Kuramae y Ryogoku.",
    localTokyoLink: "Explorar Tokio local →",
    itineraryTitle: "Itinerario de 7 días para primera visita",
    itineraryBody: "Planifica Tokio, Monte Fuji, Kioto y Osaka en una ruta práctica.",
    itineraryLink: "Abrir itinerario →",
    tokyoStayTitle: "Zonas para alojarse en Tokio",
    tokyoStayBody: "Elige Shinjuku, Ueno, Asakusa, Tokyo Station o East Tokyo antes de reservar hoteles.",
    tokyoStayLink: "Elegir zona en Tokio →",
    localHotelTitle: "Ejemplos de hoteles locales",
    localHotelBody: "Mira ejemplos prácticos por lógica de zona. No son rankings.",
    localHotelLink: "Ver ejemplos de hoteles →",
    readyTitle: "¿Listo para reservar el asiento E?",
    readyBody: "Reserva el Shinkansen después de confirmar el asiento del lado del Fuji. Revisa el JR Pass solo si tu ruta incluye varios trayectos largos de JR.",
    bookShinkansenButton: "Reservar Shinkansen",
    checkJrPassButton: "Ver JR Pass",
  },
  ko: {
    travelEssentialsTitle: "출발 전 체크리스트",
    travelEssentialsBody: "순서는 노선, 철도 예약, 도착 준비 순으로 정리하세요.",
    chooseRoute: "노선 선택",
    planAirportTransfer: "공항 이동 계획",
    chooseStayArea: "숙소 지역 선택",
    getJapanEsim: "일본 eSIM 받기",
    railDecisionLabel: "철도 예약 결정",
    bookShinkansenTitle: "신칸센 티켓 예약",
    bookShinkansenBody: "도쿄 → 교토 / 오사카처럼 단순한 이동이라면 E석을 확인한 뒤 신칸센 단일 티켓을 예약하세요.",
    checkJrPassTitle: "JR Pass 옵션 확인",
    checkJrPassBody: "히로시마, 여러 장거리 JR 이동, 도쿄 복귀가 포함되면 개별 티켓 예약 전에 JR Pass를 확인하세요.",
    shinkansenDayLabel: "신칸센 당일 준비",
    shinkansenDayTitle: "신칸센 당일 전에 도쿄 숙소 위치를 정하세요",
    shinkansenDayBody: "이른 신칸센으로 교토나 오사카에 간다면 도쿄 숙소 위치가 중요합니다. 도쿄역은 짐 부담을 줄이고, 신주쿠·우에노·아사쿠사는 다른 여행 스타일에 맞을 수 있습니다.",
    chooseTokyoStayArea: "도쿄 숙소 지역 선택",
    seatGuidesLabel: "주제별 좌석 가이드",
    seatGuideTitle: "E석 가이드",
    seatGuideBody: "E석이 후지산 쪽 창가가 되는 경우를 확인하세요.",
    tokyoKyotoSeatTitle: "도쿄 → 교토 후지산 좌석",
    tokyoKyotoSeatBody: "도쿄에서 교토나 오사카로 갈 때는 오른쪽 / E석입니다.",
    kyotoTokyoSeatTitle: "교토 → 도쿄 후지산 좌석",
    kyotoTokyoSeatBody: "돌아오는 길에 어느 쪽과 어떤 좌석을 고를지 확인하세요.",
    seatLettersTitle: "좌석 문자 설명",
    seatLettersBody: "A, B, C, D, E와 창가·통로 좌석을 이해하세요.",
    continuePlanningLabel: "계속 계획하기",
    localTokyoTitle: "도쿄 로컬 동네",
    localTokyoBody: "기요스미시라카와, 구라마에, 료고쿠 같은 조용한 동쪽 지역을 둘러보세요.",
    localTokyoLink: "로컬 도쿄 보기 →",
    itineraryTitle: "첫 일본 7일 일정",
    itineraryBody: "도쿄, 후지산, 교토, 오사카를 실용적인 첫 여행 루트로 계획하세요.",
    itineraryLink: "일정 열기 →",
    tokyoStayTitle: "도쿄 숙소 지역",
    tokyoStayBody: "호텔 예약 전 신주쿠, 우에노, 아사쿠사, 도쿄역, 이스트 도쿄 중에서 고르세요.",
    tokyoStayLink: "도쿄 숙소 지역 선택 →",
    localHotelTitle: "로컬 호텔 예시",
    localHotelBody: "지역 논리별 실용적인 호텔 예시입니다. 순위가 아닙니다.",
    localHotelLink: "호텔 예시 보기 →",
    readyTitle: "E석을 예약할 준비가 되었나요?",
    readyBody: "후지산 쪽 좌석을 확인한 뒤 신칸센 티켓을 예약하세요. 여러 장거리 JR 이동이 있을 때만 JR Pass를 확인하세요.",
    bookShinkansenButton: "신칸센 예약",
    checkJrPassButton: "JR Pass 확인",
  },
  "zh-TW": {
    travelEssentialsTitle: "出發前檢查清單",
    travelEssentialsBody: "請依序整理：先路線，再鐵路，最後處理抵達後的基本準備。",
    chooseRoute: "選擇路線",
    planAirportTransfer: "規劃機場交通",
    chooseStayArea: "選擇住宿區域",
    getJapanEsim: "取得日本 eSIM",
    railDecisionLabel: "鐵路預訂決策",
    bookShinkansenTitle: "預訂新幹線車票",
    bookShinkansenBody: "東京 → 京都 / 大阪這類簡單路線，請先確認 E 座是否可選，再預訂單程新幹線車票。",
    checkJrPassTitle: "查看 JR Pass 選項",
    checkJrPassBody: "如果路線包含廣島、多段長距離 JR，或回到東京，請在買單程票前先查看 JR Pass 選項。",
    shinkansenDayLabel: "新幹線當日準備",
    shinkansenDayTitle: "新幹線當日前先選好東京住宿區域",
    shinkansenDayBody: "如果你要搭早班新幹線前往京都或大阪，東京住宿位置很重要。東京站可減少拖行李壓力，而新宿、上野、淺草則可能更符合不同旅遊風格。",
    chooseTokyoStayArea: "選擇東京住宿區域",
    seatGuidesLabel: "主題座位指南",
    seatGuideTitle: "E 座指南",
    seatGuideBody: "了解什麼時候 E 座是富士山側窗邊座位。",
    tokyoKyotoSeatTitle: "東京 → 京都富士山座位",
    tokyoKyotoSeatBody: "東京到京都或大阪的簡單答案：右側 / E 座。",
    kyotoTokyoSeatTitle: "京都 → 東京富士山座位",
    kyotoTokyoSeatBody: "回程時該選哪一側與哪個座位。",
    seatLettersTitle: "座位字母說明",
    seatLettersBody: "了解 A、B、C、D、E，以及窗邊與走道座位。",
    continuePlanningLabel: "繼續規劃",
    localTokyoTitle: "東京在地街區",
    localTokyoBody: "探索清澄白河、藏前、兩國等較安靜的東京東側街區。",
    localTokyoLink: "探索在地東京 →",
    itineraryTitle: "第一次日本 7 日行程",
    itineraryBody: "用實用路線規劃東京、富士山、京都與大阪。",
    itineraryLink: "開啟行程 →",
    tokyoStayTitle: "東京住宿區域",
    tokyoStayBody: "訂飯店前，先選新宿、上野、淺草、東京站或 East Tokyo。",
    tokyoStayLink: "選擇東京住宿區域 →",
    localHotelTitle: "在地飯店範例",
    localHotelBody: "查看依區域邏輯整理的實用飯店範例。這不是排名。",
    localHotelLink: "查看飯店範例 →",
    readyTitle: "準備好預訂 E 座了嗎？",
    readyBody: "確認富士山側座位後再預訂新幹線車票。只有多段長距離 JR 移動時才需要查看 JR Pass。",
    bookShinkansenButton: "預訂新幹線",
    checkJrPassButton: "查看 JR Pass",
  },
  "zh-CN": {
    travelEssentialsTitle: "出发前检查清单",
    travelEssentialsBody: "请按顺序整理：先路线，再铁路，最后处理抵达后的基本准备。",
    chooseRoute: "选择路线",
    planAirportTransfer: "规划机场交通",
    chooseStayArea: "选择住宿区域",
    getJapanEsim: "获取日本 eSIM",
    railDecisionLabel: "铁路预订决策",
    bookShinkansenTitle: "预订新干线车票",
    bookShinkansenBody: "东京 → 京都 / 大阪这类简单路线，请先确认 E 座是否可选，再预订单程新干线车票。",
    checkJrPassTitle: "查看 JR Pass 选项",
    checkJrPassBody: "如果路线包含广岛、多段长距离 JR，或返回东京，请在购买单程票前先查看 JR Pass 选项。",
    shinkansenDayLabel: "新干线当日准备",
    shinkansenDayTitle: "新干线当日前先选好东京住宿区域",
    shinkansenDayBody: "如果你要搭早班新干线前往京都或大阪，东京住宿位置很重要。东京站可减少拖行李压力，而新宿、上野、浅草则可能更符合不同旅行风格。",
    chooseTokyoStayArea: "选择东京住宿区域",
    seatGuidesLabel: "主题座位指南",
    seatGuideTitle: "E 座指南",
    seatGuideBody: "了解什么时候 E 座是富士山侧窗边座位。",
    tokyoKyotoSeatTitle: "东京 → 京都富士山座位",
    tokyoKyotoSeatBody: "东京到京都或大阪的简单答案：右侧 / E 座。",
    kyotoTokyoSeatTitle: "京都 → 东京富士山座位",
    kyotoTokyoSeatBody: "回程时该选哪一侧和哪个座位。",
    seatLettersTitle: "座位字母说明",
    seatLettersBody: "了解 A、B、C、D、E，以及窗边和走道座位。",
    continuePlanningLabel: "继续规划",
    localTokyoTitle: "东京本地街区",
    localTokyoBody: "探索清澄白河、藏前、两国等较安静的东京东侧街区。",
    localTokyoLink: "探索本地东京 →",
    itineraryTitle: "第一次日本 7 日行程",
    itineraryBody: "用实用路线规划东京、富士山、京都和大阪。",
    itineraryLink: "打开行程 →",
    tokyoStayTitle: "东京住宿区域",
    tokyoStayBody: "订酒店前，先选择新宿、上野、浅草、东京站或 East Tokyo。",
    tokyoStayLink: "选择东京住宿区域 →",
    localHotelTitle: "本地酒店示例",
    localHotelBody: "查看按区域逻辑整理的实用酒店示例。这不是排名。",
    localHotelLink: "查看酒店示例 →",
    readyTitle: "准备好预订 E 座了吗？",
    readyBody: "确认富士山侧座位后再预订新干线车票。只有多段长距离 JR 移动时才需要查看 JR Pass。",
    bookShinkansenButton: "预订新干线",
    checkJrPassButton: "查看 JR Pass",
  },
  fr: {
    travelEssentialsTitle: "Checklist avant le départ",
    travelEssentialsBody: "Gardez l'ordre logique : itinéraire d'abord, train ensuite, puis les bases à l'arrivée.",
    chooseRoute: "Choisir l'itinéraire",
    planAirportTransfer: "Prévoir le transfert aéroport",
    chooseStayArea: "Choisir le quartier",
    getJapanEsim: "Obtenir une eSIM Japon",
    railDecisionLabel: "Décision de réservation ferroviaire",
    bookShinkansenTitle: "Réserver un billet Shinkansen",
    bookShinkansenBody: "Pour un trajet simple Tokyo → Kyoto / Osaka, choisissez le siège E si disponible et réservez un billet Shinkansen à l'unité.",
    checkJrPassTitle: "Voir les options JR Pass",
    checkJrPassBody: "Si votre itinéraire inclut Hiroshima, plusieurs longs trajets JR ou un retour à Tokyo, vérifiez le JR Pass avant d'acheter des billets séparés.",
    shinkansenDayLabel: "Préparation du jour Shinkansen",
    shinkansenDayTitle: "Choisissez où dormir avant votre jour de Shinkansen",
    shinkansenDayBody: "Si vous prenez un Shinkansen tôt vers Kyoto ou Osaka, votre base à Tokyo compte. Tokyo Station réduit le stress avec les bagages, tandis que Shinjuku, Ueno et Asakusa peuvent mieux correspondre à d'autres styles.",
    chooseTokyoStayArea: "Choisir un quartier à Tokyo",
    seatGuidesLabel: "Guides de sièges par thème",
    seatGuideTitle: "Guide du siège E",
    seatGuideBody: "Comprendre quand le siège E est la fenêtre côté mont Fuji.",
    tokyoKyotoSeatTitle: "Siège Tokyo → Kyoto pour Fuji",
    tokyoKyotoSeatBody: "La réponse simple : côté droit / siège E de Tokyo vers Kyoto ou Osaka.",
    kyotoTokyoSeatTitle: "Siège Kyoto → Tokyo pour Fuji",
    kyotoTokyoSeatBody: "Quel côté et quel siège choisir au retour.",
    seatLettersTitle: "Lettres de siège expliquées",
    seatLettersBody: "Comprendre A, B, C, D, E, fenêtre et couloir.",
    continuePlanningLabel: "Continuer la préparation",
    localTokyoTitle: "Quartiers locaux de Tokyo",
    localTokyoBody: "Explorez des quartiers plus calmes de l'est comme Kiyosumi-Shirakawa, Kuramae et Ryogoku.",
    localTokyoLink: "Explorer Tokyo local →",
    itineraryTitle: "Itinéraire Japon 7 jours pour une première visite",
    itineraryBody: "Planifiez Tokyo, le mont Fuji, Kyoto et Osaka dans un itinéraire pratique.",
    itineraryLink: "Ouvrir l'itinéraire →",
    tokyoStayTitle: "Quartiers où dormir à Tokyo",
    tokyoStayBody: "Choisissez Shinjuku, Ueno, Asakusa, Tokyo Station ou East Tokyo avant de réserver un hôtel.",
    tokyoStayLink: "Choisir un quartier à Tokyo →",
    localHotelTitle: "Exemples d'hôtels locaux",
    localHotelBody: "Voir des exemples pratiques selon la logique de quartier. Ce ne sont pas des classements.",
    localHotelLink: "Voir les exemples d'hôtels →",
    readyTitle: "Prêt à réserver le siège E ?",
    readyBody: "Réservez votre Shinkansen après avoir confirmé le siège côté Fuji. Vérifiez le JR Pass seulement si votre itinéraire comprend plusieurs longs trajets JR.",
    bookShinkansenButton: "Réserver Shinkansen",
    checkJrPassButton: "Voir JR Pass",
  },
  de: {
    travelEssentialsTitle: "Checkliste vor der Abfahrt",
    travelEssentialsBody: "Halte die Reihenfolge ein: zuerst Route, dann Bahn, danach Ankunftsbasics.",
    chooseRoute: "Route wählen",
    planAirportTransfer: "Flughafentransfer planen",
    chooseStayArea: "Übernachtungsviertel wählen",
    getJapanEsim: "Japan-eSIM holen",
    railDecisionLabel: "Bahn-Buchungsentscheidung",
    bookShinkansenTitle: "Shinkansen-Ticket buchen",
    bookShinkansenBody: "Für eine einfache Strecke Tokyo → Kyoto / Osaka wähle Sitz E, wenn verfügbar, und buche ein einzelnes Shinkansen-Ticket.",
    checkJrPassTitle: "JR-Pass-Optionen prüfen",
    checkJrPassBody: "Wenn deine Route Hiroshima, mehrere lange JR-Fahrten oder eine Rückkehr nach Tokyo enthält, prüfe den JR Pass vor Einzeltickets.",
    shinkansenDayLabel: "Shinkansen-Tag vorbereiten",
    shinkansenDayTitle: "Wähle deine Unterkunft vor dem Shinkansen-Tag",
    shinkansenDayBody: "Wenn du früh nach Kyoto oder Osaka fährst, ist deine Basis in Tokyo wichtig. Tokyo Station reduziert Gepäckstress; Shinjuku, Ueno und Asakusa passen zu anderen Reisestilen.",
    chooseTokyoStayArea: "Tokyo-Viertel wählen",
    seatGuidesLabel: "Sitzplatz-Guides nach Thema",
    seatGuideTitle: "Sitz-E-Guide",
    seatGuideBody: "Erfahre, wann Sitz E der Mt.-Fuji-Fensterplatz ist.",
    tokyoKyotoSeatTitle: "Tokyo → Kyoto Mt.-Fuji-Sitz",
    tokyoKyotoSeatBody: "Die einfache Antwort: rechte Seite / Sitz E von Tokyo nach Kyoto oder Osaka.",
    kyotoTokyoSeatTitle: "Kyoto → Tokyo Mt.-Fuji-Sitz",
    kyotoTokyoSeatBody: "Welche Seite und welchen Sitz du auf der Rückfahrt wählen solltest.",
    seatLettersTitle: "Sitzbuchstaben erklärt",
    seatLettersBody: "A, B, C, D, E sowie Fenster- und Gangplätze verstehen.",
    continuePlanningLabel: "Weiter planen",
    localTokyoTitle: "Lokale Viertel in Tokyo",
    localTokyoBody: "Entdecke ruhigere Ost-Tokyo-Viertel wie Kiyosumi-Shirakawa, Kuramae und Ryogoku.",
    localTokyoLink: "Lokales Tokyo ansehen →",
    itineraryTitle: "7-Tage-Japanroute für Erstbesucher",
    itineraryBody: "Plane Tokyo, Mt. Fuji, Kyoto und Osaka als praktische erste Route.",
    itineraryLink: "Route öffnen →",
    tokyoStayTitle: "Übernachten in Tokyo",
    tokyoStayBody: "Wähle vor der Hotelbuchung Shinjuku, Ueno, Asakusa, Tokyo Station oder East Tokyo.",
    tokyoStayLink: "Tokyo-Viertel wählen →",
    localHotelTitle: "Lokale Hotelbeispiele",
    localHotelBody: "Praktische Beispiele nach Gebietslogik. Keine Rangliste.",
    localHotelLink: "Hotelbeispiele ansehen →",
    readyTitle: "Bereit, Sitz E zu buchen?",
    readyBody: "Buche dein Shinkansen-Ticket nach der Fuji-Sitzprüfung. Prüfe den JR Pass nur bei mehreren langen JR-Fahrten.",
    bookShinkansenButton: "Shinkansen buchen",
    checkJrPassButton: "JR Pass prüfen",
  },
  ru: {
    travelEssentialsTitle: "Чек-лист перед отправлением",
    travelEssentialsBody: "Сначала маршрут, затем поезд, потом базовые вопросы прибытия.",
    chooseRoute: "Выбрать маршрут",
    planAirportTransfer: "Спланировать трансфер",
    chooseStayArea: "Выбрать район проживания",
    getJapanEsim: "Получить eSIM для Японии",
    railDecisionLabel: "Выбор железнодорожного билета",
    bookShinkansenTitle: "Забронировать билет Shinkansen",
    bookShinkansenBody: "Для простого маршрута Токио → Киото / Осака выберите место E, если оно доступно, и купите отдельный билет на синкансэн.",
    checkJrPassTitle: "Проверить JR Pass",
    checkJrPassBody: "Если маршрут включает Хиросиму, несколько длинных поездок JR или возвращение в Токио, проверьте JR Pass до покупки отдельных билетов.",
    shinkansenDayLabel: "Подготовка к дню Shinkansen",
    shinkansenDayTitle: "Выберите район проживания перед днем Shinkansen",
    shinkansenDayBody: "Если вы едете ранним синкансэном в Киото или Осаку, база в Токио важна. Tokyo Station уменьшает стресс с багажом, а Shinjuku, Ueno и Asakusa подходят под разные стили поездки.",
    chooseTokyoStayArea: "Выбрать район в Токио",
    seatGuidesLabel: "Гиды по местам",
    seatGuideTitle: "Гид по месту E",
    seatGuideBody: "Когда место E является окном на сторону Фудзи.",
    tokyoKyotoSeatTitle: "Место Токио → Киото для Фудзи",
    tokyoKyotoSeatBody: "Простой ответ: правая сторона / место E из Токио в Киото или Осаку.",
    kyotoTokyoSeatTitle: "Место Киото → Токио для Фудзи",
    kyotoTokyoSeatBody: "Какую сторону и место выбрать на обратном пути.",
    seatLettersTitle: "Буквы мест",
    seatLettersBody: "Разберитесь с A, B, C, D, E, окнами и проходами.",
    continuePlanningLabel: "Продолжить планирование",
    localTokyoTitle: "Локальные районы Токио",
    localTokyoBody: "Изучите более спокойные восточные районы: Kiyosumi-Shirakawa, Kuramae и Ryogoku.",
    localTokyoLink: "Открыть локальный Токио →",
    itineraryTitle: "7-дневный маршрут по Японии",
    itineraryBody: "Спланируйте Токио, Фудзи, Киото и Осаку в практичном маршруте для первой поездки.",
    itineraryLink: "Открыть маршрут →",
    tokyoStayTitle: "Где остановиться в Токио",
    tokyoStayBody: "Перед бронированием отеля выберите Shinjuku, Ueno, Asakusa, Tokyo Station или East Tokyo.",
    tokyoStayLink: "Выбрать район в Токио →",
    localHotelTitle: "Примеры местных отелей",
    localHotelBody: "Практичные примеры по логике районов. Это не рейтинг.",
    localHotelLink: "Посмотреть примеры отелей →",
    readyTitle: "Готовы забронировать место E?",
    readyBody: "Бронируйте Shinkansen после проверки места на сторону Фудзи. JR Pass проверяйте только при нескольких длинных поездках JR.",
    bookShinkansenButton: "Забронировать Shinkansen",
    checkJrPassButton: "Проверить JR Pass",
  },
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
  const guideTitle = locale === "en" ? "Which Shinkansen Seat for Mt. Fuji? Right Side, Seat E" : t("guideTitle");
  const guideDesc = locale === "en"
    ? "Mt. Fuji is on the right going Tokyo→Kyoto/Osaka (left coming back) — book Seat E. Free seat checker finds your exact window seat, plus when Fuji appears and JR Pass tips."
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
  summary: string;
  items: Array<{ bold: string; text: string }>;
  cta: string;
};

type GuideFaqItem = { q: string; a: string };

const quickAnswerCopyByLocale: Record<string, QuickAnswerCopy> = {
  en: {
    title: "Quick Answer",
    heading: "Book Seat E in standard cars. Use Seat D in Green Car.",
    summary: "For Tokyo to Kyoto or Osaka, sit on the right side of the Shinkansen in Seat E. For Kyoto or Osaka back to Tokyo, sit on the left side, also Seat E. Mt. Fuji appears around Shin-Fuji station for about 30 to 60 seconds.",
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
    summary: "De Tokyo para Kyoto ou Osaka, sente-se do lado direito do Shinkansen no assento E. De Kyoto ou Osaka de volta para Tokyo, sente-se do lado esquerdo, também no assento E. O Monte Fuji aparece perto da estação Shin-Fuji por cerca de 30 a 60 segundos.",
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
    summary: "De Tokio a Kioto u Osaka, siéntate en el lado derecho del Shinkansen, en el asiento E. De Kioto u Osaka de vuelta a Tokio, siéntate en el lado izquierdo, también en el asiento E. El Monte Fuji aparece cerca de la estación Shin-Fuji durante unos 30 a 60 segundos.",
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
    summary: "도쿄에서 교토나 오사카로 갈 때는 신칸센 오른쪽 E석에 앉으세요. 교토나 오사카에서 도쿄로 돌아올 때는 왼쪽, 역시 E석입니다. 후지산은 신후지 역 근처에서 약 30~60초 동안 보입니다.",
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
    summary: "從東京前往京都或大阪時，請坐新幹線右側的 E 座。從京都或大阪返回東京時，請坐左側，也是一樣選 E 座。富士山會在新富士站附近出現約 30 到 60 秒。",
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
    summary: "从东京前往京都或大阪时，请坐新干线右侧的 E 座。从京都或大阪返回东京时，请坐左侧，同样选择 E 座。富士山会在新富士站附近出现约 30 到 60 秒。",
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
    summary: "Pour Tokyo → Kyoto ou Osaka, asseyez-vous du côté droit du Shinkansen, au siège E. Pour Kyoto ou Osaka → Tokyo, asseyez-vous du côté gauche, toujours au siège E. Le mont Fuji apparaît aux alentours de Shin-Fuji pendant environ 30 à 60 secondes.",
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
    summary: "Von Tokyo nach Kyoto oder Osaka sitzt du auf der rechten Seite des Shinkansen in Sitz E. Von Kyoto oder Osaka zurück nach Tokyo sitzt du auf der linken Seite, ebenfalls in Sitz E. Der Mt. Fuji erscheint rund um Shin-Fuji für etwa 30 bis 60 Sekunden.",
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
    summary: "Из Токио в Киото или Осаку садитесь справа в синкансэне, на место E. Из Киото или Осаки обратно в Токио садитесь слева, также на место E. Фудзи появляется около станции Shin-Fuji примерно на 30-60 секунд.",
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
  const copy = locale === "fr" ? frGuideCopy : { ...enGuideCopy, ...guideCopyOverridesByLocale[locale] };
  const quickAnswer = quickAnswerCopyByLocale[locale] ?? quickAnswerCopyByLocale.en;
  const ui = guideUiByLocale[locale as keyof typeof guideUiByLocale] ?? guideUiByLocale.en;
  const quickLabel = `${quickAnswer.title}:`;
  const displayTitle = locale === "en"
    ? "Which Shinkansen Seat to See Mt. Fuji? Seat E, Side & Timing Guide"
    : t("h1");

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
        name: displayTitle,
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
          {ui.travelEssentialsTitle}
        </h2>
        <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
          {ui.travelEssentialsBody}
        </p>
      </div>
      <div className="p-3.5 md:p-4">
        <div className="grid gap-2 text-[12px] leading-5 sm:grid-cols-2">
          <Link
            href="/plan-your-trip"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 font-semibold text-sky-800 transition-colors hover:border-sky-300 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
          >
            {ui.chooseRoute}
          </Link>
          <Link
            href="/airport-transfers"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 font-semibold text-indigo-800 transition-colors hover:border-indigo-300 hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
          >
            {ui.planAirportTransfer}
          </Link>
          <Link
            href="/areas-to-stay/tokyo-hotels"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#0b214a] bg-[#0b214a] px-3 py-2 font-semibold text-yellow-300 transition-colors hover:bg-[#081a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b214a]/30"
          >
            {ui.chooseStayArea}
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
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 font-semibold text-orange-700 transition-colors hover:border-orange-300 hover:bg-orange-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
          >
            {ui.getJapanEsim}
          </TrackedAffiliateLink>
        </div>
      </div>
    </section>
  );

  const renderEarlyShinkansenHotelStrip = () => (
    <div className="mb-5 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 shadow-sm shadow-sky-100/60 lg:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            Taking an early Shinkansen from Tokyo?
          </p>
          <p className="mt-1 text-[12px] leading-5 text-slate-600">
            Seat E solves the Fuji view. Your hotel base solves luggage stress if you are leaving early with bags.
          </p>
        </div>
        <TrackedInternalLink
          href="/areas-to-stay/where-to-stay-before-shinkansen"
          sourcePage="/guide"
          placement="guide_top_after_quick_answer"
          label="Compare Tokyo hotel bases"
          locale={locale}
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[#0b214a] bg-[#0b214a] px-3.5 py-2 text-[12px] font-semibold text-yellow-300 shadow-sm transition-colors hover:bg-[#081a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b214a]/30"
        >
          Choose Tokyo hotel base
        </TrackedInternalLink>
      </div>
    </div>
  );

  const renderTopBookingCtas = () => (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/70 lg:px-5">
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <TrackedAffiliateLink
          href={KLOOK_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          category="train"
          provider="klook"
          placement="guide_top_klook_shinkansen"
          pagePath="/guide"
          locale={locale}
          label="Book Shinkansen ticket on Klook"
          linkId="shinkansenTicket"
          product="shinkansen_ticket"
          adid="1265303"
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[#D94A32] bg-[#D94A32] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#bf3d28]"
        >
          Book Shinkansen ticket on Klook
        </TrackedAffiliateLink>
        {OMIO_SHINKANSEN_URL ? (
          <TrackedAffiliateLink
            href={OMIO_SHINKANSEN_URL}
            target="_blank"
            rel={AFFILIATE_REL}
            category="train"
            provider="omio"
            placement="guide_top_omio_compare"
            pagePath="/guide"
            locale={locale}
            label="Compare route on Omio"
            linkId="omioShinkansen"
            product="route_compare"
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[#2563EB] bg-white px-3 py-2 text-xs font-semibold text-[#0B3A75] shadow-sm shadow-blue-100/70 transition-colors hover:border-[#1D4ED8] hover:bg-[#F0F6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
          >
            Compare route on Omio
          </TrackedAffiliateLink>
        ) : null}
      </div>
    </section>
  );

  const renderAfterSeatNextSteps = () => (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/70 lg:px-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
        Decision gateway
      </p>
      <h2 className="mt-1 text-base font-semibold text-slate-950">
        After checking Seat E, choose your next step
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TrackedAffiliateLink
          href={KLOOK_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          category="train"
          provider="klook"
          placement="guide_top_klook_shinkansen"
          pagePath="/guide"
          locale={locale}
          label="Book Shinkansen ticket"
          linkId="shinkansenTicket"
          product="shinkansen_ticket"
          className="flex h-full flex-col rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-[12px] shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-100"
        >
          <span className="block font-semibold text-slate-950">Book Shinkansen ticket</span>
          <span className="mt-1 block leading-5 text-slate-600">
            For users who already know the route and want to reserve the right seat.
          </span>
          <span className="mt-auto inline-flex w-fit rounded-full border border-orange-300 bg-white px-3 py-1.5 font-semibold text-orange-700">
            Open Klook
          </span>
        </TrackedAffiliateLink>

        <TrackedAffiliateLink
          href={JR_PASS_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          category="train"
          provider="klook"
          placement="guide_top_klook_jr_pass"
          pagePath="/guide"
          locale={locale}
          label="Check JR Pass options"
          linkId="jrPass"
          product="jr_pass"
          adid="1165791"
          className="flex h-full flex-col rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-[12px] shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-100"
        >
          <span className="block font-semibold text-slate-950">Check JR Pass options</span>
          <span className="mt-1 block leading-5 text-slate-600">
            Use this only if your itinerary includes several long JR rides.
          </span>
          <span className="mt-auto inline-flex w-fit rounded-full border border-orange-300 bg-white px-3 py-1.5 font-semibold text-orange-700">
            Open Klook
          </span>
        </TrackedAffiliateLink>

        {OMIO_SHINKANSEN_URL ? (
          <TrackedAffiliateLink
            href={OMIO_SHINKANSEN_URL}
            target="_blank"
            rel={AFFILIATE_REL}
            category="train"
            provider="omio"
            placement="guide_top_omio_compare"
            pagePath="/guide"
            locale={locale}
            label="Compare train options"
            linkId="omioShinkansen"
            product="route_compare"
          className="flex h-full flex-col rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3.5 text-[12px] shadow-sm transition-colors hover:border-indigo-300 hover:bg-indigo-100"
          >
            <span className="block font-semibold text-slate-950">Compare train options</span>
            <span className="mt-1 block leading-5 text-slate-600">
              Use Omio if you are still comparing route options before booking.
            </span>
            <span className="mt-auto inline-flex w-fit rounded-full border border-indigo-300 bg-white px-3 py-1.5 font-semibold text-indigo-700">
              Open Omio
            </span>
          </TrackedAffiliateLink>
        ) : null}

        <TrackedInternalLink
          href="/areas-to-stay/where-to-stay-before-shinkansen"
          sourcePage="/guide"
          placement="guide_after_seat_next_step"
          label="Choose hotel base before Shinkansen"
          locale={locale}
          className="flex h-full flex-col rounded-2xl border border-[#0b214a] bg-[#0b214a] px-4 py-3.5 text-[12px] shadow-sm transition-colors hover:bg-[#081a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b214a]/30"
        >
          <span className="block font-semibold text-yellow-300">Choose hotel base before Shinkansen</span>
          <span className="mt-1 block leading-5 text-slate-200">
            Useful if you have luggage or an early train from Tokyo.
          </span>
          <span className="mt-auto inline-flex w-fit rounded-full border border-yellow-300/70 bg-yellow-300 px-3 py-1.5 font-semibold text-[#0b214a]">
            Open stay guide
          </span>
        </TrackedInternalLink>

      </div>
    </section>
  );

  const renderHotelBridge = () => (
    <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3.5">
      <p className="text-sm font-semibold text-slate-950">
        Staying in Tokyo around your Shinkansen? Pick your hotel area first.
      </p>
      <p className="mt-1 text-[12px] leading-5 text-slate-600">
        The right base near your route saves time with luggage and early trains.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <TrackedInternalLink
          href="/areas-to-stay/tokyo-first-time"
          sourcePage="/guide"
          placement="guide_to_hotels"
          label="Where to stay in Tokyo"
          locale={locale}
          className="inline-flex min-h-9 items-center rounded-xl border border-[#2E7D5B] bg-[#2E7D5B] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#246449]"
        >
          Where to stay in Tokyo
        </TrackedInternalLink>
        <TrackedInternalLink
          href="/areas-to-stay/tokyo-stay-area-index"
          sourcePage="/guide"
          placement="guide_to_hotels"
          label="Compare station areas"
          locale={locale}
          className="inline-flex min-h-9 items-center rounded-xl border border-[#0b214a] bg-[#0b214a] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#081a3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b214a]/30"
        >
          Compare station areas
        </TrackedInternalLink>
        <TrackedInternalLink
          href="/areas-to-stay/asakusa-vs-ueno"
          sourcePage="/guide"
          placement="guide_to_hotels"
          label="Ueno or Asakusa?"
          locale={locale}
          className="inline-flex min-h-9 items-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50"
        >
          Ueno or Asakusa?
        </TrackedInternalLink>
      </div>
    </div>
  );

  const renderSeatGuides = () => (
    <section className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
        {ui.seatGuidesLabel}
      </p>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <Link href="/shinkansen-seat-e" className="rounded-xl border border-sky-100 bg-white px-3.5 py-3 text-[12px] transition-colors hover:bg-sky-50">
          <span className="block font-semibold text-slate-900">{ui.seatGuideTitle}</span>
          <span className="mt-0.5 block text-slate-500">{ui.seatGuideBody}</span>
        </Link>
        <Link href="/tokyo-to-kyoto-mt-fuji-seat" className="rounded-xl border border-sky-100 bg-white px-3.5 py-3 text-[12px] transition-colors hover:bg-sky-50">
          <span className="block font-semibold text-slate-900">{ui.tokyoKyotoSeatTitle}</span>
          <span className="mt-0.5 block text-slate-500">{ui.tokyoKyotoSeatBody}</span>
        </Link>
        <Link href="/kyoto-to-tokyo-mt-fuji-seat" className="rounded-xl border border-sky-100 bg-white px-3.5 py-3 text-[12px] transition-colors hover:bg-sky-50">
          <span className="block font-semibold text-slate-900">{ui.kyotoTokyoSeatTitle}</span>
          <span className="mt-0.5 block text-slate-500">{ui.kyotoTokyoSeatBody}</span>
        </Link>
        <Link href="/shinkansen-seat-letters" className="rounded-xl border border-sky-100 bg-white px-3.5 py-3 text-[12px] transition-colors hover:bg-sky-50">
          <span className="block font-semibold text-slate-900">{ui.seatLettersTitle}</span>
          <span className="mt-0.5 block text-slate-500">{ui.seatLettersBody}</span>
        </Link>
      </div>
    </section>
  );

  const renderContinuePlanning = () => (
    <section className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/70">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {ui.continuePlanningLabel}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <TrackedAffiliateLink
          href={KLOOK_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          category="train"
          provider="klook"
          placement="guide_article_inline"
          pagePath="/guide"
          locale={locale}
          label="Book Shinkansen ticket"
          linkId="shinkansenTicket"
          product="shinkansen_ticket"
          className="group flex h-full flex-col rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-[12px] shadow-sm shadow-orange-100/60 transition-colors hover:border-[#D94A32] hover:bg-[#fff8f0]"
        >
          <span className="block font-semibold text-slate-900">Book Shinkansen ticket</span>
          <span className="mt-0.5 block text-slate-500">Reserve after confirming the Fuji-side seat.</span>
          <span className="mt-auto inline-flex w-fit rounded-full border border-[#D94A32] bg-[#D94A32] px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition-colors group-hover:bg-[#bf3d28]">
            Open Klook
          </span>
        </TrackedAffiliateLink>
        <TrackedInternalLink
          href="/areas-to-stay/tokyo-hotels"
          sourcePage="/guide"
          placement="guide_continue_planning"
          label="Choose Tokyo hotel base"
          locale={locale}
          className="group flex h-full flex-col rounded-2xl border border-[#0b214a] bg-[#0b214a] px-4 py-3.5 text-[12px] shadow-sm shadow-slate-200/70 transition-colors hover:bg-[#081a3a]"
        >
          <span className="block font-semibold text-yellow-300">Choose Tokyo hotel base</span>
          <span className="mt-0.5 block text-slate-200">Compare famous stations, calmer bases, and luggage logic.</span>
          <span className="mt-auto inline-flex w-fit rounded-full border border-yellow-300/70 bg-yellow-300 px-3 py-1.5 text-[11px] font-semibold text-[#0b214a] shadow-sm transition-colors group-hover:bg-yellow-200">
            See hotel areas
          </span>
        </TrackedInternalLink>
        <TrackedCtaLink
          href="/jr-pass-vs-single-ticket"
          placement="guide_continue_planning"
          label="Compare JR Pass"
          pagePath="/guide"
          locale={locale}
          category="rail"
          className="group flex h-full flex-col rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-[12px] shadow-sm shadow-amber-100/60 transition-colors hover:border-amber-300 hover:bg-amber-100/70"
        >
          <span className="block font-semibold text-slate-900">Compare JR Pass</span>
          <span className="mt-0.5 block text-slate-500">Check only if your route has several long JR rides.</span>
          <span className="mt-auto inline-flex w-fit rounded-full border border-amber-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-amber-800 shadow-sm transition-colors group-hover:bg-amber-50">
            Open guide
          </span>
        </TrackedCtaLink>
        <TrackedCtaLink
          href="/how-to-read-japanese-train-signs"
          placement="guide_continue_planning"
          label="Read station signs and practice station navigation"
          pagePath="/guide"
          locale={locale}
          category="station_practice"
          className="group flex h-full flex-col rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3.5 text-[12px] shadow-sm shadow-sky-100/60 transition-colors hover:border-sky-300 hover:bg-sky-100/70"
        >
          <span className="block font-semibold text-slate-900">Read station signs / practice station navigation</span>
          <span className="mt-0.5 block text-slate-500">Prepare for exits, transfer gates, and platform signs.</span>
          <span className="mt-auto inline-flex w-fit rounded-full border border-sky-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-sky-800 shadow-sm transition-colors group-hover:bg-sky-50">
            Open train signs guide
          </span>
        </TrackedCtaLink>
      </div>
    </section>
  );

  const renderSeatBookingReminder = () => (
    <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/60 px-3.5 py-3">
      <p className="text-sm font-semibold text-slate-950">{ui.readyTitle}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        {ui.readyBody}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <TrackedAffiliateLink
          href={KLOOK_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          category="train"
          provider="klook"
          placement="guide_ready_klook_shinkansen"
          pagePath="/guide"
          locale={locale}
          label="Book Shinkansen ticket"
          linkId="shinkansenTicket"
          product="shinkansen_ticket"
          adid="1265303"
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[#D94A32] bg-[#D94A32] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#bf3d28]"
        >
          {ui.bookShinkansenButton}
        </TrackedAffiliateLink>
        <TrackedAffiliateLink
          href={JR_PASS_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          category="train"
          provider="klook"
          placement="guide_ready_klook_jr_pass"
          pagePath="/guide"
          locale={locale}
          label="Check JR Pass options"
          linkId="jrPass"
          product="jr_pass"
          adid="1165791"
          className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl border border-[#D94A32] bg-[#D94A32] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#bf3d28]"
        >
          {ui.checkJrPassButton}
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
              className="inline-flex items-center rounded-full border border-[#2E7D5B] bg-[#2E7D5B] px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-[#246449]"
            >
              {quickAnswer.cta}
            </Link>
          </div>
        </section>

        {renderTopBookingCtas()}

        {renderEarlyShinkansenHotelStrip()}

        {/* Two-column layout on desktop: article + sidebar */}
        <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10 lg:items-start">
        <div className="min-w-0">

        {/* Intro */}
        <section className="mb-5 text-[13px] lg:text-sm leading-relaxed text-slate-700 bg-white/90 border border-slate-200 rounded-2xl px-4 py-3 lg:px-6 lg:py-4 shadow-sm shadow-slate-200/70">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">
            {t("introH2")}
          </h2>
          <p className="mb-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-[12px] text-sky-900">
            <strong>{quickLabel}</strong> {quickAnswer.summary}
          </p>
          <p>{t("introP1")}</p>
          <p className="mt-2 text-[12px] text-slate-600">{t("introP2")}</p>
        </section>

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
              <strong>{quickLabel}</strong> {copy.whichSideQuick}
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
              <strong>{quickLabel}</strong> {copy.lettersQuick}
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
              <strong>{quickLabel}</strong> {copy.whenQuick}
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
              <strong>{quickLabel}</strong> {copy.routeQuick}
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
              <strong>{quickLabel}</strong> {copy.trainTypeQuick}
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
              <strong>{quickLabel}</strong> {copy.jrPassQuick}
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
            <div className="mt-3 rounded-2xl border border-orange-100 bg-orange-50/70 px-3.5 py-3">
              <p className="text-[12px] font-semibold leading-5 text-slate-950">
                If your route includes Tokyo → Kyoto/Osaka → Hiroshima, several long JR rides, or a return to Tokyo, check JR Pass options before booking single tickets.
              </p>
              <TrackedAffiliateLink
                href={JR_PASS_URL}
                target="_blank"
                rel={AFFILIATE_REL}
                category="train"
                provider="klook"
                placement="guide_jrpass_section_klook"
                pagePath="/guide"
                locale={locale}
                label="Check JR Pass options on Klook"
                linkId="jrPass"
                product="jr_pass"
                adid="1165791"
                className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#D94A32] bg-[#D94A32] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#bf3d28]"
              >
                Check JR Pass options on Klook
              </TrackedAffiliateLink>
            </div>
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
              <strong>{quickLabel}</strong> {copy.bookQuick}
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
            {renderHotelBridge()}
            {renderSeatBookingReminder()}
          </section>

          {renderAfterSeatNextSteps()}

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
            <p className="text-[13px] md:text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-900">{t("priorityShortNoteLabel")}</span>{" "}
              {t("priorityShortNoteBody")}{" "}
              <Link
                href="/how-to-read-japanese-train-signs#priority-seats"
                className="font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-900"
              >
                {t("priorityShortNoteLink")}
              </Link>
              .
            </p>
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
                className="inline-flex items-center justify-center rounded-2xl border border-[#2E7D5B] bg-[#2E7D5B] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-100 transition-colors hover:bg-[#246449] active:brightness-95"
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

      {/* Mobile-only sticky Klook CTA — the Shinkansen ticket is this
          page's highest-value conversion, and the top booking strip
          scrolls away early in a very long article. Purchase (terracotta)
          styling per the design system; same affiliate params as the top
          strip with a dedicated placement for measurement. */}
      <StickyMobileCta>
        <TrackedAffiliateLink
          href={KLOOK_URL}
          target="_blank"
          rel={AFFILIATE_REL}
          category="train"
          provider="klook"
          placement="guide_sticky_klook"
          pagePath="/guide"
          locale={locale}
          label="Book Shinkansen ticket on Klook"
          linkId="shinkansenTicket"
          product="shinkansen_ticket"
          adid="1265303"
          className="inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-[12px] border border-[#D94A32] bg-[#D94A32] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#bf3d28]"
        >
          Book Shinkansen ticket on Klook
        </TrackedAffiliateLink>
      </StickyMobileCta>
    </main>
  );
}
