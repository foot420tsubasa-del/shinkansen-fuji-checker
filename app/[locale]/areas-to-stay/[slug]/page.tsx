import type { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "node:fs";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { QuickRec } from "@/components/content/QuickRec";
import { AreaCard } from "@/components/content/AreaCard";
import { ComparisonTable } from "@/components/content/ComparisonTable";
import { ProTip } from "@/components/content/ProTip";
import { StayAreaMap } from "@/components/content/StayAreaMap";
import { HotelPicks } from "@/components/content/HotelPicks";
import { NextActions } from "@/components/content/NextActions";
import { SuggestedNextSteps } from "@/components/content/SuggestedNextSteps";
import { SiteFooter } from "@/components/content/SiteFooter";
import { AgodaHotelMap } from "@/components/affiliate/AgodaHotelMap";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { AdSlot } from "@/components/ads/AdSlot";
import { getAllStaySlugs, getStayBySlug, type StayPage as StayContentPage } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";
import { getAffUrl } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { getAgodaHotelAreaUrl, getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { buttonClassName } from "@/components/ui/Button";
import type { AdPlacement } from "@/lib/ads";

type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

const agodaMapIdsByStaySlug: Record<string, string[]> = {
  "where-to-stay-before-shinkansen": ["tokyoStation"],
  "kyoto-station-vs-gion": ["kyotoStation"],
  "namba-vs-umeda": ["namba"],
  "shin-osaka-vs-namba": ["shinOsaka", "namba"],
};

const stayComparisonHotelPickSlugs = new Set([
  "asakusa-vs-ueno",
  "tokyo-station-vs-shinjuku",
  "ueno-vs-shinjuku",
  "shinjuku-vs-ueno-vs-asakusa",
  "kyoto-station-vs-gion",
  "namba-vs-umeda",
  "shin-osaka-vs-namba",
]);

const stayComparisonAdPlacements: Partial<Record<string, AdPlacement>> = {
  "asakusa-vs-ueno": "asakusa_ueno_after_hotel_cta",
  "ueno-vs-shinjuku": "ueno_shinjuku_after_hotel_cta",
};

const filledNextStepClass =
  buttonClassName({ variant: "internal", fullWidth: true, className: "p-4 text-center" });
const filledCommercialNextStepClass =
  buttonClassName({ variant: "commercial", fullWidth: true, className: "p-4 text-center" });

type StayPageTranslation = Partial<Pick<StayContentPage, "title" | "description" | "proTip">> & {
  quickRec?: Partial<StayContentPage["quickRec"]>;
  mapDescription?: StayContentPage["mapDescription"];
  areas?: Array<Partial<StayContentPage["areas"][number]>>;
  comparisonColumns?: StayContentPage["comparisonColumns"];
  comparison?: StayContentPage["comparison"];
  hotelPicks?: Array<Partial<StayContentPage["hotelPicks"][number]>>;
  nextActions?: Array<Partial<StayContentPage["nextActions"][number]>>;
  faqs?: StayContentPage["faqs"];
};

type TokyoHotelBaseMatrixGroup = {
  anchorId: string;
  title: string;
  image?: string;
  categoryLabel: string;
  tone: "active" | "airport" | "rail" | "calm" | "traditional";
  mainBaseLabel: string;
  mainBase: string;
  nearbyLabel?: string;
  nearbyBases?: string;
  goodIf: string;
  watchOut: string;
  hotelAreaKey?: HotelAreaKey;
  hotelActionLabel?: string;
  detailLink?: {
    label: string;
    href: string;
  };
  internalLinks: Array<{
    label: string;
    href: string;
  }>;
};

const tokyoHotelBaseMatrixGroups: TokyoHotelBaseMatrixGroup[] = [
  {
    anchorId: "shinjuku-area",
    title: "Shinjuku area",
    image: "/images/stay/tokyo/stay-shinjuku.png",
    categoryLabel: "Active city",
    tone: "active",
    mainBaseLabel: "Main base",
    mainBase: "Shinjuku",
    nearbyLabel: "Nearby calmer bases",
    nearbyBases: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae",
    goodIf: "First-time energy, food, nightlife, and many hotel choices.",
    watchOut: "Crowds, a huge station, and a tiring arrival with luggage.",
    hotelAreaKey: "shinjuku",
    hotelActionLabel: "Search Shinjuku area hotels",
    detailLink: { label: "See Shinjuku micro-area guide", href: "/areas-to-stay/tokyo/shinjuku" },
    internalLinks: [{ label: "Compare Shinjuku vs Ueno", href: "/areas-to-stay/ueno-vs-shinjuku" }],
  },
  {
    anchorId: "ueno-area",
    title: "Ueno area",
    image: "/images/stay/tokyo/stay-ueno.png",
    categoryLabel: "Airport access",
    tone: "airport",
    mainBaseLabel: "Main base",
    mainBase: "Ueno",
    nearbyLabel: "Nearby / logistics bases",
    nearbyBases: "Nippori / Okachimachi",
    goodIf: "Narita access, museums, practical hotel search, and better-value stays.",
    watchOut: "Less polished than Ginza or Shinjuku.",
    hotelAreaKey: "ueno",
    hotelActionLabel: "Search Ueno area hotels",
    detailLink: { label: "See Ueno micro-area guide", href: "/areas-to-stay/tokyo/ueno" },
    internalLinks: [
      { label: "Compare Ueno vs Shinjuku", href: "/areas-to-stay/ueno-vs-shinjuku" },
      { label: "Compare Asakusa vs Ueno", href: "/areas-to-stay/asakusa-vs-ueno" },
    ],
  },
  {
    anchorId: "asakusa-area",
    title: "Asakusa area",
    image: "/images/stay/tokyo/stay-asakusa.png",
    categoryLabel: "Traditional",
    tone: "traditional",
    mainBaseLabel: "Main base",
    mainBase: "Asakusa",
    nearbyLabel: "Nearby calmer bases",
    nearbyBases: "Kuramae / Tawaramachi",
    goodIf: "Old Tokyo atmosphere, Senso-ji, river walks, and calmer nights.",
    watchOut: "Not JR-centered; check subway routing.",
    hotelAreaKey: "asakusa",
    hotelActionLabel: "Search Asakusa area hotels",
    detailLink: { label: "See Asakusa micro-area guide", href: "/areas-to-stay/tokyo/asakusa" },
    internalLinks: [{ label: "Compare Asakusa vs Ueno", href: "/areas-to-stay/asakusa-vs-ueno" }],
  },
  {
    anchorId: "tokyo-station-ginza-area",
    title: "Tokyo Station / Ginza area",
    image: "/images/stay/tokyo/stay-tokyo-station.png",
    categoryLabel: "Rail logistics",
    tone: "rail",
    mainBaseLabel: "Main base",
    mainBase: "Tokyo Station",
    nearbyLabel: "Nearby bases",
    nearbyBases: "Hatchobori / Kyobashi / Nihombashi / Yurakucho / Ginza / Hibiya",
    goodIf: "Early Shinkansen, luggage logistics, first/last night, and Ginza access.",
    watchOut: "Businesslike, large stations, and less local atmosphere.",
    hotelAreaKey: "tokyoStation",
    hotelActionLabel: "Search Tokyo Station area hotels",
    detailLink: { label: "See Tokyo Station area guide", href: "/areas-to-stay/tokyo/tokyo-station" },
    internalLinks: [{ label: "Where to stay before Shinkansen", href: "/areas-to-stay/where-to-stay-before-shinkansen" }],
  },
  {
    anchorId: "central-balance-area",
    title: "Central balance area",
    image: "/images/stay/tokyo/stay-east-tokyo.png",
    categoryLabel: "Calm central",
    tone: "calm",
    mainBaseLabel: "Main bases",
    mainBase: "Akasaka / Akasaka-mitsuke / Suitengumae / Ningyocho",
    goodIf: "Central Tokyo balance, calmer nights, airport bus / T-CAT, and Nihombashi access.",
    watchOut: "Less famous for first-time visitors; routing depends on subway or bus.",
    detailLink: { label: "See East Tokyo area guide", href: "/areas-to-stay/tokyo/east-tokyo" },
    internalLinks: [
      { label: "Use the Tokyo first-time guide", href: "/areas-to-stay/tokyo-first-time" },
      { label: "Choose by luggage / airport logic", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage" },
    ],
  },
  {
    anchorId: "airport-logistics-area",
    title: "Airport / logistics area",
    image: "/images/stay/tokyo/stay-airport-logistics.png",
    categoryLabel: "Airport + rail",
    tone: "airport",
    mainBaseLabel: "Main bases",
    mainBase: "Hamamatsucho / Daimon / Shinagawa / Takanawa Gateway",
    goodIf: "Haneda, Shinkansen, first/last night, and luggage-heavy travel.",
    watchOut: "Businesslike and less atmospheric.",
    internalLinks: [
      { label: "See Shinkansen-friendly stays", href: "/areas-to-stay/where-to-stay-before-shinkansen" },
      { label: "Check airport transfer", href: "/airport-transfers" },
    ],
  },
];

const hotelBaseMatrixToneClasses: Record<TokyoHotelBaseMatrixGroup["tone"], string> = {
  active: "border-orange-200 bg-orange-50 text-orange-700",
  airport: "border-sky-200 bg-sky-50 text-sky-700",
  rail: "border-indigo-200 bg-indigo-50 text-indigo-700",
  calm: "border-emerald-200 bg-emerald-50 text-emerald-700",
  traditional: "border-rose-200 bg-rose-50 text-rose-700",
};

type TokyoFirstTimeSupplementCopy = {
  matrix: {
    eyebrow: string;
    title: string;
    intro: string;
    goodIfLabel: string;
    watchOutLabel: string;
    providerDescription: string;
    groups: Array<{
      title: string;
      categoryLabel: string;
      mainBaseLabel: string;
      nearbyLabel?: string;
      goodIf: string;
      watchOut: string;
      hotelActionLabel?: string;
      detailLabel?: string;
      internalLabels: string[];
    }>;
  };
  commonMistakes: { title: string; items: string[] };
  roomSize: { title: string; paragraphs: string[] };
  nearby: {
    eyebrow: string;
    title: string;
    intro: string;
    goodIfLabel: string;
    watchOutLabel: string;
    compareLabel: string;
    items: Array<{
      name: string;
      broadBase: string;
      bestFor: string;
      watchOut: string;
      href: string;
    }>;
  };
  framework: {
    title: string;
    body: string;
    roomSize: string;
    luggage: string;
    stayHub: string;
  };
  priceTiming: {
    eyebrow: string;
    title: string;
    intro: string;
    cards: Array<{ title: string; body: string }>;
    panelTitle: string;
    panelItems: string[];
    matrixCta: string;
    examplesCta: string;
    sourcesTitle: string;
  };
  quickAnswerOverride: {
    title: string;
    intro: string;
    bases: string[];
    famousStationNote: string;
    nearbyIntro: string;
    nearbyBases: string;
    matrixNote: string;
    matrixCta: string;
  };
  earlyDecision: {
    title: string;
    body: string;
    chips: string[];
    mistakesTitle: string;
    mistakes: string[];
    note: string;
    roomDateCta: string;
  };
};

const tokyoFirstTimeSupplementCopyByLocale: Record<string, TokyoFirstTimeSupplementCopy> = {
  en: {
    matrix: {
      eyebrow: "",
      title: "Compare Tokyo hotel bases before you book",
      intro:
        "Start with the broad area, then check nearby calmer or logistics-friendly bases. Use this as a general starting point before opening hotel search sites.",
      goodIfLabel: "Good if",
      watchOutLabel: "Watch out",
      providerDescription: "Broad area search only. Smaller nearby bases do not have separate provider buttons here.",
    groups: [
        {
          title: "Shinjuku area",
          categoryLabel: "Active city",
          mainBaseLabel: "Main base",
          nearbyLabel: "Nearby calmer bases",
          goodIf: "First-time energy, food, nightlife, and many hotel choices.",
          watchOut: "Crowds, a huge station, and a tiring arrival with luggage.",
          hotelActionLabel: "Search Shinjuku area hotels",
          detailLabel: "See Shinjuku micro-area guide",
          internalLabels: ["Compare Shinjuku vs Ueno"],
        },
        {
          title: "Ueno area",
          categoryLabel: "Airport access",
          mainBaseLabel: "Main base",
          nearbyLabel: "Nearby / logistics bases",
          goodIf: "Narita access, museums, practical hotel search, and better-value stays.",
          watchOut: "Less polished than Ginza or Shinjuku.",
          hotelActionLabel: "Search Ueno area hotels",
          detailLabel: "See Ueno micro-area guide",
          internalLabels: ["Compare Ueno vs Shinjuku", "Compare Asakusa vs Ueno"],
        },
        {
          title: "Asakusa area",
          categoryLabel: "Traditional",
          mainBaseLabel: "Main base",
          nearbyLabel: "Nearby calmer bases",
          goodIf: "Old Tokyo atmosphere, Senso-ji, river walks, and calmer nights.",
          watchOut: "Not JR-centered; check subway routing.",
          hotelActionLabel: "Search Asakusa area hotels",
          detailLabel: "See Asakusa micro-area guide",
          internalLabels: ["Compare Asakusa vs Ueno"],
        },
        {
          title: "Tokyo Station / Ginza area",
          categoryLabel: "Rail logistics",
          mainBaseLabel: "Main base",
          nearbyLabel: "Nearby bases",
          goodIf: "Early Shinkansen, luggage logistics, first/last night, and Ginza access.",
          watchOut: "Businesslike, large stations, and less local atmosphere.",
          hotelActionLabel: "Search Tokyo Station area hotels",
          detailLabel: "See Tokyo Station area guide",
          internalLabels: ["Where to stay before taking the Shinkansen"],
        },
        {
          title: "Central balance area",
          categoryLabel: "Calm central",
          mainBaseLabel: "Main bases",
          goodIf: "Central Tokyo balance, calmer nights, airport bus / T-CAT, and Nihombashi access.",
          watchOut: "Less famous for first-time visitors; routing depends on subway or bus.",
          detailLabel: "See East Tokyo area guide",
          internalLabels: ["Where to stay in Tokyo for first-time visitors", "Choose a Tokyo hotel area with luggage"],
        },
        {
          title: "Airport / logistics area",
          categoryLabel: "Airport + rail",
          mainBaseLabel: "Main bases",
          goodIf: "Haneda, Shinkansen, first/last night, and luggage-heavy travel.",
          watchOut: "Businesslike and less atmospheric.",
          internalLabels: ["Best Tokyo area before Shinkansen", "Choose your first-night hotel area by airport"],
        },
      ],
    },
    commonMistakes: {
      title: "Common mistakes when choosing a Tokyo hotel area",
      items: [
        "Do not choose Shinjuku only because everyone recommends it.",
        "Do not choose Asakusa only because it looks traditional.",
        "Do not choose Tokyo Station only because it is convenient for Shinkansen.",
        "A famous station is not always the easiest place to sleep.",
        "Your best base depends on airport access, luggage, Shinkansen day, station complexity, quiet nights, and room size.",
      ],
    },
    roomSize: {
      title: "Room size note for Tokyo hotels",
      paragraphs: [
        "Tokyo hotel rooms can feel compact compared with hotels or apartments in some countries. For two travelers, rooms under 18㎡ can feel tight with large suitcases. Around 22–26㎡ is usually workable, and 30㎡+ is generally comfortable for two by Tokyo hotel standards.",
        "Before booking, check room size, bed setup, and reviews mentioning luggage or small rooms.",
      ],
    },
    nearby: {
      eyebrow: "Hotel-base refinement",
      title: "Smarter nearby hotel bases",
      intro:
        "The famous area name is only the starting point. A nearby hotel base can sometimes make arrival, luggage, room size, or quiet nights easier while still keeping the same broad Tokyo logic. Use these as general search directions, not station-by-station instructions.",
      goodIfLabel: "Good if:",
      watchOutLabel: "Watch out:",
      compareLabel: "Compare the broader area",
      items: [
        {
          name: "Suitengumae / Ningyocho",
          broadBase: "East Tokyo / Tokyo Station side",
          bestFor: "Calmer nights, Haneda or Narita logistics, and travelers who want easier streets than the biggest hubs.",
          watchOut: "Less nightlife than Shinjuku and fewer obvious first-time landmarks outside the hotel.",
          href: "/areas-to-stay/tokyo/east-tokyo",
        },
        {
          name: "Akasaka / Akasaka-mitsuke",
          broadBase: "Central Tokyo",
          bestFor: "Food, subway access, and a more controlled night base than the busiest station areas.",
          watchOut: "Not as direct for Shinkansen mornings as staying near Tokyo Station.",
          href: "/areas-to-stay/tokyo-first-time",
        },
        {
          name: "Kuramae / Tawaramachi",
          broadBase: "Asakusa / East Tokyo",
          bestFor: "Cafes, design shops, calmer streets, and old-town access without sleeping in the most tourist-heavy blocks.",
          watchOut: "Some airport or Shinkansen routes may need one extra transfer.",
          href: "/areas-to-stay/tokyo/asakusa",
        },
        {
          name: "Hatchobori / Kyobashi / Nihombashi",
          broadBase: "Tokyo Station side",
          bestFor: "Early Shinkansen, luggage logistics, and a quieter businesslike base near central rail routes.",
          watchOut: "Less local-night energy than Shinjuku, Ueno, or Asakusa.",
          href: "/areas-to-stay/tokyo/tokyo-station",
        },
        {
          name: "Nippori / Okachimachi",
          broadBase: "Ueno side",
          bestFor: "Narita access, better-value hotel searches, and practical food options around the Ueno corridor.",
          watchOut: "Pick carefully if you want nightlife or a polished first-night feel.",
          href: "/areas-to-stay/tokyo/ueno",
        },
        {
          name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae",
          broadBase: "Shinjuku side",
          bestFor: "Shinjuku convenience with a better chance of calmer nights than the loudest east-side blocks.",
          watchOut: "Walking distance and station exits matter because Shinjuku scale can still be tiring.",
          href: "/areas-to-stay/tokyo/shinjuku",
        },
      ],
    },
    framework: {
      title: "Need a clearer Tokyo hotel-base framework?",
      body:
        "Use the free guides for general area logic. Room size, luggage, airport arrival, and Shinkansen timing can change the easiest hotel base, so keep those constraints visible before comparing hotels.",
      roomSize: "Room size guide",
      luggage: "Tokyo with luggage",
      stayHub: "Compare stay area guides",
    },
    priceTiming: {
      eyebrow: "Hotel price timing",
      title: "When Tokyo hotels get expensive",
      intro:
        "Hotel prices change by demand. If your dates fall on weekends, holidays, or major travel seasons, compare nearby hotel bases before giving up on Tokyo.",
      cards: [
        { title: "Friday / Saturday nights", body: "Often higher than weekdays, especially in popular city areas." },
        { title: "Night before a national holiday", body: "Long weekends can make central hotels and transport busier." },
        { title: "Golden Week", body: "Late April to early May. Several national holidays are close together, so domestic travel can be busy." },
        { title: "Obon", body: "Around mid-August. Many people travel domestically or return to hometowns." },
        { title: "New Year holidays", body: "Late December to early January. Transport and accommodation can be crowded." },
        { title: "Cherry blossom season", body: "Usually late March to early April in Tokyo and Kyoto." },
        { title: "Autumn foliage season", body: "Especially November for Tokyo/Kyoto and nearby day-trip areas." },
        { title: "Big events", body: "Concerts, sports, exhibitions, and festivals can raise prices around specific stations." },
      ],
      panelTitle: "What to do if your dates are expensive",
      panelItems: [
        "Compare nearby bases, not only Shinjuku or Tokyo Station.",
        "Try weekday nights if your schedule is flexible.",
        "Check luggage-friendly bases if you are arriving with suitcases.",
        "Open the Tokyo hotel base matrix before opening booking sites.",
        "See local hotel examples after choosing a base.",
      ],
      matrixCta: "Compare Tokyo hotel areas",
      examplesCta: "See local hotel examples",
      sourcesTitle: "Official / useful references",
    },
    quickAnswerOverride: {
      title: "Quick answer",
      intro: "For a first Tokyo trip, start with these broad hotel bases:",
      bases: [
        "Shinjuku: best if you want food, nightlife, and big-city energy.",
        "Ueno: best if you arrive from Narita or want practical east-side access.",
        "Asakusa: best if you want old Tokyo atmosphere and calmer nights.",
        "Tokyo Station / Ginza: best if you have an early Shinkansen, luggage, or a first/last night in Tokyo.",
      ],
      famousStationNote: "But you do not always need to sleep at the famous station itself.",
      nearbyIntro:
        "If the main station feels too crowded, expensive, or hard with luggage, compare nearby bases:",
      nearbyBases:
        "Nishi-Shinjuku / Yoyogi, Nippori / Okachimachi, Kuramae / Tawaramachi, Hatchobori / Nihombashi, Akasaka, Suitengumae, Hamamatsucho, or Shinagawa.",
      matrixNote: "Use the hotel base matrix below before opening booking sites.",
      matrixCta: "Compare Tokyo station areas",
    },
    earlyDecision: {
      title: "Before you book a Tokyo hotel",
      body: "Start with how your trip moves, then compare hotel names.",
      chips: [
        "Narita or Haneda",
        "Kyoto / Osaka by Shinkansen",
        "Large suitcases",
        "Nightlife or quiet nights",
        "Huge station or calmer base",
      ],
      mistakesTitle: "Common Tokyo hotel area mistakes",
      mistakes: [
        "Choosing Shinjuku only because it is famous",
        "Choosing Asakusa only because it looks traditional",
        "Choosing Tokyo Station only for Shinkansen",
        "Ignoring luggage, room size, and station complexity",
        "Booking before deciding airport and rail routes",
      ],
      note:
        "A famous station is not always the easiest place to sleep. The best Tokyo hotel area usually reduces transfers, luggage stress, and first-night confusion.",
      roomDateCta: "Check room size and expensive dates before booking",
    },
  },
};

tokyoFirstTimeSupplementCopyByLocale["pt-BR"] = {
  ...tokyoFirstTimeSupplementCopyByLocale.en,
  matrix: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.matrix,
    eyebrow: "Decisao da base do hotel",
    title: "Matriz de bases para hotel em Toquio",
    intro:
      "Compare estacoes famosas, bases proximas mais calmas e areas boas para logistica antes de procurar hoteis. Isto e um ponto de partida geral, nao uma orientacao especifica para cada viajante.",
    goodIfLabel: "Bom se",
    watchOutLabel: "Atencao",
    providerDescription: "Busca por area ampla apenas. As bases menores proximas nao tem botoes de provedor separados aqui.",
    groups: [
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[0], categoryLabel: "Cidade ativa", goodIf: "Energia de primeira viagem, comida, vida noturna e muitas opcoes de hoteis.", watchOut: "Multidoes, uma estacao enorme e chegada cansativa com bagagem.", hotelActionLabel: "Buscar hoteis na area de Shinjuku", internalLabels: ["Comparar Shinjuku e Ueno"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[1], categoryLabel: "Acesso ao aeroporto", goodIf: "Acesso a Narita, museus, busca pratica de hoteis e estadias de melhor valor.", watchOut: "Menos polida que Ginza ou Shinjuku.", hotelActionLabel: "Buscar hoteis na area de Ueno", internalLabels: ["Comparar Ueno e Shinjuku", "Comparar Asakusa e Ueno"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[2], categoryLabel: "Tradicional", goodIf: "Atmosfera de Toquio antiga, Senso-ji, caminhadas junto ao rio e noites mais calmas.", watchOut: "Nao e centrada na JR; confira a rota de metro.", hotelActionLabel: "Buscar hoteis na area de Asakusa", internalLabels: ["Comparar Asakusa e Ueno"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[3], categoryLabel: "Logistica ferroviaria", goodIf: "Shinkansen cedo, logistica com bagagem, primeira/ultima noite e acesso a Ginza.", watchOut: "Ambiente mais comercial, estacoes grandes e menos atmosfera local.", hotelActionLabel: "Buscar hoteis na area da Tokyo Station", internalLabels: ["Onde ficar antes do Shinkansen"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[4], categoryLabel: "Centro calmo", goodIf: "Equilibrio central em Toquio, noites mais calmas, onibus de aeroporto / T-CAT e acesso a Nihombashi.", watchOut: "Menos famosa para primeira viagem; a rota depende de metro ou onibus.", internalLabels: ["Usar o guia de primeira viagem em Toquio", "Escolher por bagagem / aeroporto"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[5], categoryLabel: "Aeroporto + trem", goodIf: "Haneda, Shinkansen, primeira/ultima noite e viagem com muita bagagem.", watchOut: "Mais comercial e menos atmosferica.", internalLabels: ["Ver bases boas para Shinkansen", "Ver transfer do aeroporto"] },
    ],
  },
  commonMistakes: {
    title: "Erros comuns ao escolher uma area de hotel em Toquio",
    items: [
      "Nao escolha Shinjuku apenas porque todo mundo recomenda.",
      "Nao escolha Asakusa apenas porque parece tradicional.",
      "Nao escolha Tokyo Station apenas porque e conveniente para o Shinkansen.",
      "Uma estacao famosa nem sempre e o lugar mais facil para dormir.",
      "A melhor base depende de acesso ao aeroporto, bagagem, dia de Shinkansen, complexidade da estacao, noites calmas e tamanho do quarto.",
    ],
  },
  roomSize: {
    title: "Nota sobre tamanho de quartos em Toquio",
    paragraphs: [
      "Quartos de hotel em Toquio podem parecer compactos em comparacao com hoteis ou apartamentos de alguns paises. Para duas pessoas, quartos abaixo de 18㎡ podem ficar apertados com malas grandes. Cerca de 22–26㎡ costuma funcionar, e 30㎡+ geralmente e confortavel para duas pessoas pelos padroes de Toquio.",
      "Antes de reservar, confira tamanho do quarto, configuracao das camas e avaliacoes que mencionem bagagem ou quartos pequenos.",
    ],
  },
  nearby: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.nearby,
    eyebrow: "Ajuste da base do hotel",
    title: "Bases proximas mais inteligentes",
    intro: "O nome da area famosa e apenas o ponto de partida. Uma base proxima pode facilitar chegada, bagagem, tamanho do quarto ou noites calmas mantendo a mesma logica geral de Toquio. Use como direcoes gerais de busca, nao instrucoes por estacao.",
    goodIfLabel: "Bom se:",
    watchOutLabel: "Atencao:",
    compareLabel: "Comparar a area ampla",
  },
  framework: {
    title: "Precisa de uma estrutura mais clara para escolher a base do hotel?",
    body: "Use os guias gratuitos para logica geral de areas. Tamanho do quarto, bagagem, chegada ao aeroporto e horario do Shinkansen podem mudar a base mais facil, entao mantenha essas restricoes visiveis antes de comparar hoteis.",
    roomSize: "Guia de tamanho de quarto",
    luggage: "Toquio com bagagem",
    stayHub: "Comparar guias de areas",
  },
};

tokyoFirstTimeSupplementCopyByLocale.es = {
  ...tokyoFirstTimeSupplementCopyByLocale.en,
  matrix: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.matrix,
    eyebrow: "Decision de base de hotel",
    title: "Matriz de bases hoteleras en Tokio",
    intro:
      "Compara estaciones famosas, bases cercanas mas tranquilas y zonas utiles para la logistica antes de buscar hoteles. Es un punto de partida general, no un consejo especifico para cada viajero.",
    goodIfLabel: "Buena opcion si",
    watchOutLabel: "Ten en cuenta",
    providerDescription: "Busqueda solo por zona amplia. Las bases cercanas pequenas no tienen botones de proveedor separados aqui.",
    groups: [
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[0], categoryLabel: "Ciudad activa", goodIf: "Energia de primer viaje, comida, vida nocturna y muchas opciones de hotel.", watchOut: "Multitudes, una estacion enorme y una llegada cansada con equipaje.", hotelActionLabel: "Buscar hoteles en la zona de Shinjuku", internalLabels: ["Comparar Shinjuku y Ueno"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[1], categoryLabel: "Acceso al aeropuerto", goodIf: "Acceso a Narita, museos, busqueda practica de hoteles y estancias de mejor valor.", watchOut: "Menos pulida que Ginza o Shinjuku.", hotelActionLabel: "Buscar hoteles en la zona de Ueno", internalLabels: ["Comparar Ueno y Shinjuku", "Comparar Asakusa y Ueno"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[2], categoryLabel: "Tradicional", goodIf: "Ambiente del viejo Tokio, Senso-ji, paseos junto al rio y noches mas tranquilas.", watchOut: "No esta centrada en JR; revisa las rutas de metro.", hotelActionLabel: "Buscar hoteles en la zona de Asakusa", internalLabels: ["Comparar Asakusa y Ueno"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[3], categoryLabel: "Logistica ferroviaria", goodIf: "Shinkansen temprano, equipaje, primera/ultima noche y acceso a Ginza.", watchOut: "Ambiente mas de negocios, estaciones grandes y menos sensacion local.", hotelActionLabel: "Buscar hoteles cerca de Tokyo Station", internalLabels: ["Donde alojarse antes del Shinkansen"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[4], categoryLabel: "Centro tranquilo", goodIf: "Equilibrio centrico, noches mas tranquilas, bus de aeropuerto / T-CAT y acceso a Nihombashi.", watchOut: "Menos famosa para primer viaje; la ruta depende del metro o bus.", internalLabels: ["Usar la guia de Tokio para primera vez", "Elegir por equipaje / aeropuerto"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[5], categoryLabel: "Aeropuerto + tren", goodIf: "Haneda, Shinkansen, primera/ultima noche y viajes con mucho equipaje.", watchOut: "Mas de negocios y menos atmosferica.", internalLabels: ["Ver bases utiles para Shinkansen", "Ver traslado desde el aeropuerto"] },
    ],
  },
  commonMistakes: {
    title: "Errores comunes al elegir una zona de hotel en Tokio",
    items: [
      "No elijas Shinjuku solo porque todo el mundo lo recomienda.",
      "No elijas Asakusa solo porque parece tradicional.",
      "No elijas Tokyo Station solo porque es comoda para el Shinkansen.",
      "Una estacion famosa no siempre es el lugar mas facil para dormir.",
      "Tu mejor base depende del acceso al aeropuerto, equipaje, dia de Shinkansen, complejidad de la estacion, noches tranquilas y tamano de habitacion.",
    ],
  },
  roomSize: {
    title: "Nota sobre el tamano de las habitaciones en Tokio",
    paragraphs: [
      "Las habitaciones de hotel en Tokio pueden sentirse compactas frente a hoteles o apartamentos de algunos paises. Para dos viajeros, menos de 18㎡ puede ser justo con maletas grandes. Unos 22–26㎡ suele funcionar, y 30㎡+ suele ser comodo para dos segun los estandares de Tokio.",
      "Antes de reservar, revisa el tamano, la configuracion de camas y comentarios que mencionen equipaje o habitaciones pequenas.",
    ],
  },
  nearby: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.nearby,
    eyebrow: "Ajuste de base hotelera",
    title: "Bases cercanas mas inteligentes",
    intro: "El nombre famoso de la zona es solo el punto de partida. Una base cercana puede facilitar llegada, equipaje, tamano de habitacion o noches tranquilas manteniendo la misma logica general de Tokio.",
    goodIfLabel: "Buena opcion si:",
    watchOutLabel: "Ten en cuenta:",
    compareLabel: "Comparar la zona amplia",
  },
  framework: {
    title: "Necesitas una estructura mas clara para elegir base hotelera?",
    body: "Usa las guias gratuitas para la logica general de zonas. Tamano de habitacion, equipaje, llegada al aeropuerto y horario del Shinkansen pueden cambiar la base mas facil.",
    roomSize: "Guia de tamano de habitacion",
    luggage: "Tokio con equipaje",
    stayHub: "Comparar guias de zonas",
  },
};

tokyoFirstTimeSupplementCopyByLocale.ko = {
  ...tokyoFirstTimeSupplementCopyByLocale.en,
  matrix: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.matrix,
    eyebrow: "호텔 거점 선택",
    title: "도쿄 호텔 거점 매트릭스",
    intro: "유명 역, 더 조용한 주변 거점, 공항과 신칸센 이동에 유리한 지역을 호텔 검색 전에 비교하세요. 개인 맞춤 추천이 아니라 일반적인 출발점입니다.",
    goodIfLabel: "이런 경우 좋음",
    watchOutLabel: "주의할 점",
    providerDescription: "넓은 지역 기준 검색입니다. 주변의 작은 거점에는 별도 제공업체 버튼을 두지 않았습니다.",
    groups: [
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[0], categoryLabel: "활기찬 도심", goodIf: "첫 도쿄 여행의 활기, 음식, 밤문화, 다양한 호텔 선택지.", watchOut: "혼잡, 큰 역 규모, 짐이 있을 때 피곤한 도착 동선.", hotelActionLabel: "신주쿠 지역 호텔 검색", internalLabels: ["신주쿠와 우에노 비교"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[1], categoryLabel: "공항 접근", goodIf: "나리타 접근, 박물관, 실용적인 호텔 검색, 비교적 좋은 가격대.", watchOut: "긴자나 신주쿠보다 세련된 느낌은 덜합니다.", hotelActionLabel: "우에노 지역 호텔 검색", internalLabels: ["우에노와 신주쿠 비교", "아사쿠사와 우에노 비교"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[2], categoryLabel: "전통 분위기", goodIf: "옛 도쿄 분위기, 센소지, 강변 산책, 조용한 밤.", watchOut: "JR 중심 지역이 아니므로 지하철 동선을 확인하세요.", hotelActionLabel: "아사쿠사 지역 호텔 검색", internalLabels: ["아사쿠사와 우에노 비교"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[3], categoryLabel: "철도 동선", goodIf: "이른 신칸센, 짐 이동, 첫날/마지막 밤, 긴자 접근.", watchOut: "비즈니스 분위기, 큰 역, 현지 느낌은 적은 편.", hotelActionLabel: "도쿄역 주변 호텔 검색", internalLabels: ["신칸센 전날 어디에 묵을까"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[4], categoryLabel: "조용한 중심부", goodIf: "도쿄 중심 균형, 조용한 밤, 공항 버스 / T-CAT, 니혼바시 접근.", watchOut: "첫 여행자에게 덜 유명하고 지하철/버스 동선이 중요합니다.", internalLabels: ["도쿄 첫 여행 가이드 보기", "짐 / 공항 기준으로 고르기"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[5], categoryLabel: "공항 + 철도", goodIf: "하네다, 신칸센, 첫날/마지막 밤, 짐이 많은 여행.", watchOut: "비즈니스 느낌이 강하고 분위기는 덜합니다.", internalLabels: ["신칸센에 편한 숙박지 보기", "공항 교통 확인"] },
    ],
  },
  commonMistakes: {
    title: "도쿄 호텔 지역을 고를 때 흔한 실수",
    items: [
      "모두가 추천한다고 해서 신주쿠만 고르지 마세요.",
      "전통적으로 보인다고 해서 아사쿠사만 고르지 마세요.",
      "신칸센에 편하다는 이유만으로 도쿄역만 고르지 마세요.",
      "유명한 역이 항상 잠자기 가장 쉬운 곳은 아닙니다.",
      "공항 접근, 짐, 신칸센 일정, 역 복잡도, 조용한 밤, 객실 크기를 함께 봐야 합니다.",
    ],
  },
  roomSize: {
    title: "도쿄 호텔 객실 크기 메모",
    paragraphs: [
      "도쿄 호텔 객실은 일부 국가의 호텔이나 아파트보다 작게 느껴질 수 있습니다. 두 명이 큰 캐리어를 가져가면 18㎡ 미만은 좁을 수 있습니다. 22–26㎡ 정도는 보통 괜찮고, 30㎡ 이상은 도쿄 호텔 기준으로 두 명에게 대체로 편안합니다.",
      "예약 전 객실 크기, 침대 구성, 짐이나 작은 방을 언급한 리뷰를 확인하세요.",
    ],
  },
  nearby: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.nearby,
    eyebrow: "호텔 거점 조정",
    title: "더 똑똑한 주변 호텔 거점",
    intro: "유명 지역 이름은 출발점일 뿐입니다. 가까운 주변 거점이 도착, 짐, 객실 크기, 조용한 밤을 더 쉽게 만들 수 있습니다. 역별 지시가 아니라 일반적인 검색 방향으로 보세요.",
    goodIfLabel: "좋은 경우:",
    watchOutLabel: "주의:",
    compareLabel: "넓은 지역 비교",
  },
  framework: {
    title: "도쿄 호텔 거점 선택 기준이 더 필요하신가요?",
    body: "무료 가이드는 일반적인 지역 판단에 사용하세요. 객실 크기, 짐, 공항 도착, 신칸센 시간이 가장 쉬운 호텔 거점을 바꿀 수 있습니다.",
    roomSize: "객실 크기 가이드",
    luggage: "짐이 있는 도쿄",
    stayHub: "숙박 지역 가이드 비교",
  },
};

tokyoFirstTimeSupplementCopyByLocale["zh-TW"] = {
  ...tokyoFirstTimeSupplementCopyByLocale.en,
  matrix: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.matrix,
    eyebrow: "飯店基地選擇",
    title: "東京飯店基地矩陣",
    intro: "在搜尋飯店前，先比較知名車站、較安靜的鄰近基地，以及適合機場與新幹線動線的住宿區。這是一般起點，不是個人化建議。",
    goodIfLabel: "適合",
    watchOutLabel: "注意",
    providerDescription: "僅提供大區域搜尋。較小的鄰近基地不在此提供獨立訂房按鈕。",
    groups: [
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[0], categoryLabel: "熱鬧市區", goodIf: "第一次東京的活力、美食、夜生活與大量飯店選擇。", watchOut: "人潮多、車站巨大，帶行李抵達時可能很累。", hotelActionLabel: "搜尋新宿區域飯店", internalLabels: ["比較新宿與上野"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[1], categoryLabel: "機場交通", goodIf: "成田交通、博物館、實用飯店搜尋與較有價值感的住宿。", watchOut: "精緻感不如銀座或新宿。", hotelActionLabel: "搜尋上野區域飯店", internalLabels: ["比較上野與新宿", "比較淺草與上野"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[2], categoryLabel: "傳統氛圍", goodIf: "老東京氛圍、淺草寺、河邊散步與較安靜的夜晚。", watchOut: "不是以 JR 為中心，請確認地鐵路線。", hotelActionLabel: "搜尋淺草區域飯店", internalLabels: ["比較淺草與上野"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[3], categoryLabel: "鐵道動線", goodIf: "早班新幹線、行李動線、第一晚/最後一晚與銀座交通。", watchOut: "商務感較強、車站很大，地方生活感較少。", hotelActionLabel: "搜尋東京站區域飯店", internalLabels: ["新幹線前一晚住哪裡"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[4], categoryLabel: "安靜市中心", goodIf: "東京中心平衡、較安靜夜晚、機場巴士 / T-CAT 與日本橋交通。", watchOut: "對第一次旅客較不有名，路線取決於地鐵或巴士。", internalLabels: ["使用東京第一次住宿指南", "依行李 / 機場邏輯選擇"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[5], categoryLabel: "機場 + 鐵道", goodIf: "羽田、新幹線、第一晚/最後一晚與行李多的行程。", watchOut: "商務感較強，氛圍較少。", internalLabels: ["查看適合新幹線的住宿基地", "查看機場交通"] },
    ],
  },
  commonMistakes: {
    title: "選擇東京飯店區域時的常見錯誤",
    items: [
      "不要只因為大家推薦就選新宿。",
      "不要只因為看起來傳統就選淺草。",
      "不要只因為新幹線方便就選東京站。",
      "有名的車站不一定最適合睡覺。",
      "最佳基地取決於機場交通、行李、新幹線日期、車站複雜度、安靜夜晚與房間大小。",
    ],
  },
  roomSize: {
    title: "東京飯店房間大小提醒",
    paragraphs: [
      "東京飯店房間相較某些國家的飯店或公寓可能偏小。兩位旅客若有大型行李，18㎡以下可能很擠。22–26㎡通常可用，30㎡以上以東京飯店標準來說通常對兩人較舒適。",
      "訂房前請確認房間大小、床型，以及提到行李或房間狹小的評價。",
    ],
  },
  nearby: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.nearby,
    eyebrow: "飯店基地微調",
    title: "更聰明的鄰近飯店基地",
    intro: "知名區域名稱只是起點。鄰近基地有時能讓抵達、行李、房間大小或安靜夜晚更容易，同時保留相同的大方向。",
    goodIfLabel: "適合：",
    watchOutLabel: "注意：",
    compareLabel: "比較較大的區域",
  },
  framework: {
    title: "需要更清楚的東京飯店基地框架？",
    body: "免費指南提供一般區域邏輯。房間大小、行李、機場抵達與新幹線時間，都可能改變最輕鬆的飯店基地。",
    roomSize: "房間大小指南",
    luggage: "帶行李住東京",
    stayHub: "比較住宿區域指南",
  },
};

tokyoFirstTimeSupplementCopyByLocale["zh-CN"] = {
  ...tokyoFirstTimeSupplementCopyByLocale["zh-TW"],
  matrix: {
    ...tokyoFirstTimeSupplementCopyByLocale["zh-TW"].matrix,
    eyebrow: "酒店基地选择",
    title: "东京酒店基地矩阵",
    intro: "在搜索酒店前，先比较知名车站、较安静的邻近基地，以及适合机场与新干线动线的住宿区。这是一般起点，不是个性化建议。",
    goodIfLabel: "适合",
    watchOutLabel: "注意",
    providerDescription: "仅提供大区域搜索。较小的邻近基地不在此提供独立预订按钮。",
    groups: [
      { ...tokyoFirstTimeSupplementCopyByLocale["zh-TW"].matrix.groups[0], categoryLabel: "热闹市区", goodIf: "第一次东京的活力、美食、夜生活与大量酒店选择。", watchOut: "人潮多、车站巨大，带行李抵达时可能很累。", hotelActionLabel: "搜索新宿区域酒店", internalLabels: ["比较新宿与上野"] },
      { ...tokyoFirstTimeSupplementCopyByLocale["zh-TW"].matrix.groups[1], categoryLabel: "机场交通", goodIf: "成田交通、博物馆、实用酒店搜索与较有性价比的住宿。", watchOut: "精致感不如银座或新宿。", hotelActionLabel: "搜索上野区域酒店", internalLabels: ["比较上野与新宿", "比较浅草与上野"] },
      { ...tokyoFirstTimeSupplementCopyByLocale["zh-TW"].matrix.groups[2], categoryLabel: "传统氛围", goodIf: "老东京氛围、浅草寺、河边散步与较安静的夜晚。", watchOut: "不是以 JR 为中心，请确认地铁路线。", hotelActionLabel: "搜索浅草区域酒店", internalLabels: ["比较浅草与上野"] },
      { ...tokyoFirstTimeSupplementCopyByLocale["zh-TW"].matrix.groups[3], categoryLabel: "铁路动线", goodIf: "早班新干线、行李动线、第一晚/最后一晚与银座交通。", watchOut: "商务感较强、车站很大，地方生活感较少。", hotelActionLabel: "搜索东京站区域酒店", internalLabels: ["新干线前一晚住哪里"] },
      { ...tokyoFirstTimeSupplementCopyByLocale["zh-TW"].matrix.groups[4], categoryLabel: "安静市中心", goodIf: "东京中心平衡、较安静夜晚、机场巴士 / T-CAT 与日本桥交通。", watchOut: "对第一次游客较不有名，路线取决于地铁或巴士。", internalLabels: ["使用东京第一次住宿指南", "按行李 / 机场逻辑选择"] },
      { ...tokyoFirstTimeSupplementCopyByLocale["zh-TW"].matrix.groups[5], categoryLabel: "机场 + 铁路", goodIf: "羽田、新干线、第一晚/最后一晚与行李多的行程。", watchOut: "商务感较强，氛围较少。", internalLabels: ["查看适合新干线的住宿基地", "查看机场交通"] },
    ],
  },
  commonMistakes: {
    title: "选择东京酒店区域时的常见错误",
    items: [
      "不要只因为大家推荐就选新宿。",
      "不要只因为看起来传统就选浅草。",
      "不要只因为新干线方便就选东京站。",
      "有名的车站不一定最适合睡觉。",
      "最佳基地取决于机场交通、行李、新干线日期、车站复杂度、安静夜晚与房间大小。",
    ],
  },
  roomSize: {
    title: "东京酒店房间大小提醒",
    paragraphs: [
      "东京酒店房间相较某些国家的酒店或公寓可能偏小。两位旅客若有大型行李，18㎡以下可能很挤。22–26㎡通常可用，30㎡以上以东京酒店标准来说通常对两人较舒适。",
      "订房前请确认房间大小、床型，以及提到行李或房间狭小的评价。",
    ],
  },
  framework: {
    title: "需要更清楚的东京酒店基地框架？",
    body: "免费指南提供一般区域逻辑。房间大小、行李、机场抵达与新干线时间，都可能改变最轻松的酒店基地。",
    roomSize: "房间大小指南",
    luggage: "带行李住东京",
    stayHub: "比较住宿区域指南",
  },
};

tokyoFirstTimeSupplementCopyByLocale.fr = {
  ...tokyoFirstTimeSupplementCopyByLocale.en,
  matrix: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.matrix,
    eyebrow: "Choix de base d'hotel",
    title: "Matrice des bases d'hotel a Tokyo",
    intro:
      "Comparez les grandes gares, les bases voisines plus calmes et les zones pratiques pour la logistique avant de chercher un hotel. C'est un point de depart general, pas un conseil personnalise.",
    goodIfLabel: "Bien si",
    watchOutLabel: "Attention",
    providerDescription: "Recherche par grande zone uniquement. Les petites bases voisines n'ont pas de boutons fournisseur separes ici.",
    groups: [
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[0], categoryLabel: "Ville active", goodIf: "Energie d'un premier sejour, restaurants, vie nocturne et beaucoup de choix d'hotels.", watchOut: "Foule, gare immense et arrivee fatigante avec des bagages.", hotelActionLabel: "Chercher des hotels dans Shinjuku", internalLabels: ["Comparer Shinjuku et Ueno"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[1], categoryLabel: "Acces aeroport", goodIf: "Acces a Narita, musees, recherche d'hotel pratique et bon rapport qualite-prix.", watchOut: "Moins raffine que Ginza ou Shinjuku.", hotelActionLabel: "Chercher des hotels dans Ueno", internalLabels: ["Comparer Ueno et Shinjuku", "Comparer Asakusa et Ueno"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[2], categoryLabel: "Traditionnel", goodIf: "Ambiance du vieux Tokyo, Senso-ji, promenades au bord de la riviere et nuits plus calmes.", watchOut: "Pas centre sur JR; verifiez les trajets en metro.", hotelActionLabel: "Chercher des hotels dans Asakusa", internalLabels: ["Comparer Asakusa et Ueno"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[3], categoryLabel: "Logistique ferroviaire", goodIf: "Shinkansen tot, bagages, premiere/derniere nuit et acces a Ginza.", watchOut: "Ambiance business, grandes gares et moins d'atmosphere locale.", hotelActionLabel: "Chercher des hotels pres de Tokyo Station", internalLabels: ["Ou dormir avant le Shinkansen"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[4], categoryLabel: "Centre calme", goodIf: "Bon equilibre central, nuits plus calmes, bus aeroport / T-CAT et acces a Nihombashi.", watchOut: "Moins connu pour un premier sejour; le trajet depend du metro ou du bus.", internalLabels: ["Utiliser le guide Tokyo premiere fois", "Choisir selon bagages / aeroport"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[5], categoryLabel: "Aeroport + train", goodIf: "Haneda, Shinkansen, premiere/derniere nuit et voyage avec beaucoup de bagages.", watchOut: "Plus business et moins atmospherique.", internalLabels: ["Voir les bases pratiques pour Shinkansen", "Verifier le transfert aeroport"] },
    ],
  },
  commonMistakes: {
    title: "Erreurs frequentes pour choisir une zone d'hotel a Tokyo",
    items: [
      "Ne choisissez pas Shinjuku seulement parce que tout le monde le recommande.",
      "Ne choisissez pas Asakusa seulement parce que cela semble traditionnel.",
      "Ne choisissez pas Tokyo Station seulement parce que c'est pratique pour le Shinkansen.",
      "Une gare celebre n'est pas toujours l'endroit le plus simple pour dormir.",
      "La meilleure base depend de l'acces aeroport, des bagages, du jour de Shinkansen, de la complexite des gares, du calme la nuit et de la taille de la chambre.",
    ],
  },
  roomSize: {
    title: "Note sur la taille des chambres d'hotel a Tokyo",
    paragraphs: [
      "Les chambres d'hotel a Tokyo peuvent sembler compactes par rapport a certains pays. Pour deux voyageurs avec de grandes valises, moins de 18㎡ peut etre serre. Environ 22–26㎡ est souvent utilisable, et 30㎡+ est generalement confortable pour deux selon les standards de Tokyo.",
      "Avant de reserver, verifiez la taille de la chambre, les lits et les avis mentionnant les bagages ou les petites chambres.",
    ],
  },
  nearby: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.nearby,
    eyebrow: "Affiner la base d'hotel",
    title: "Bases d'hotel voisines plus malines",
    intro: "Le nom de la zone celebre n'est qu'un point de depart. Une base voisine peut faciliter l'arrivee, les bagages, la taille de chambre ou les nuits calmes tout en gardant la meme logique generale.",
    goodIfLabel: "Bien si :",
    watchOutLabel: "Attention :",
    compareLabel: "Comparer la grande zone",
  },
  framework: {
    title: "Besoin d'un cadre plus clair pour choisir votre base d'hotel ?",
    body: "Utilisez les guides gratuits pour la logique generale des zones. Taille de chambre, bagages, arrivee aeroport et horaire du Shinkansen peuvent changer la base la plus simple.",
    roomSize: "Guide taille de chambre",
    luggage: "Tokyo avec bagages",
    stayHub: "Comparer les guides de zones",
  },
};

tokyoFirstTimeSupplementCopyByLocale.de = {
  ...tokyoFirstTimeSupplementCopyByLocale.en,
  matrix: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.matrix,
    eyebrow: "Hotelbasis entscheiden",
    title: "Matrix fur Hotelbasen in Tokio",
    intro: "Vergleiche bekannte Bahnhofe, ruhigere nahe Basen und logistisch praktische Hotelgebiete, bevor du Hotels suchst. Das ist ein allgemeiner Startpunkt, keine personliche Empfehlung.",
    goodIfLabel: "Gut, wenn",
    watchOutLabel: "Achten auf",
    providerDescription: "Nur Suche nach grober Gegend. Kleinere nahe Basen haben hier keine eigenen Anbieterbuttons.",
    groups: [
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[0], categoryLabel: "Aktive Stadt", goodIf: "Energie fur den ersten Tokio-Besuch, Essen, Nachtleben und viele Hoteloptionen.", watchOut: "Menschenmengen, riesiger Bahnhof und anstrengende Ankunft mit Gepack.", hotelActionLabel: "Hotels in Shinjuku suchen", internalLabels: ["Shinjuku und Ueno vergleichen"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[1], categoryLabel: "Flughafenzugang", goodIf: "Narita-Zugang, Museen, praktische Hotelsuche und oft besseres Preisgefuhl.", watchOut: "Weniger elegant als Ginza oder Shinjuku.", hotelActionLabel: "Hotels in Ueno suchen", internalLabels: ["Ueno und Shinjuku vergleichen", "Asakusa und Ueno vergleichen"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[2], categoryLabel: "Traditionell", goodIf: "Alt-Tokio-Atmosphare, Senso-ji, Spaziergange am Fluss und ruhigere Nachte.", watchOut: "Nicht JR-zentriert; U-Bahn-Routen prufen.", hotelActionLabel: "Hotels in Asakusa suchen", internalLabels: ["Asakusa und Ueno vergleichen"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[3], categoryLabel: "Bahnlogistik", goodIf: "Fruher Shinkansen, Gepacklogistik, erste/letzte Nacht und Ginza-Zugang.", watchOut: "Geschaftlich, grosse Bahnhofe und weniger lokale Atmosphare.", hotelActionLabel: "Hotels nahe Tokyo Station suchen", internalLabels: ["Ubernachten vor dem Shinkansen"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[4], categoryLabel: "Ruhige Mitte", goodIf: "Zentrale Balance, ruhigere Nachte, Flughafenbus / T-CAT und Zugang zu Nihombashi.", watchOut: "Fur Erstbesucher weniger bekannt; Route hangt von U-Bahn oder Bus ab.", internalLabels: ["Tokio-Erstbesucher-Guide nutzen", "Nach Gepack / Flughafen wahlen"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[5], categoryLabel: "Flughafen + Bahn", goodIf: "Haneda, Shinkansen, erste/letzte Nacht und Reisen mit viel Gepack.", watchOut: "Geschaftlicher und weniger atmospharisch.", internalLabels: ["Shinkansen-freundliche Basen ansehen", "Flughafentransfer prufen"] },
    ],
  },
  commonMistakes: {
    title: "Haufige Fehler bei der Wahl eines Hotelgebiets in Tokio",
    items: [
      "Wahle Shinjuku nicht nur, weil es alle empfehlen.",
      "Wahle Asakusa nicht nur, weil es traditionell aussieht.",
      "Wahle Tokyo Station nicht nur, weil es fur den Shinkansen praktisch ist.",
      "Ein beruhmter Bahnhof ist nicht immer der einfachste Schlafort.",
      "Die beste Basis hangt von Flughafen, Gepack, Shinkansen-Tag, Bahnhofskomplexitat, ruhigen Nachten und Zimmergrosse ab.",
    ],
  },
  roomSize: {
    title: "Hinweis zur Zimmergrosse in Tokio-Hotels",
    paragraphs: [
      "Hotelzimmer in Tokio konnen im Vergleich zu manchen Landern kompakt wirken. Fur zwei Reisende mit grossen Koffern kann unter 18㎡ eng sein. Etwa 22–26㎡ ist meist nutzbar, und 30㎡+ ist nach Tokio-Standard fur zwei meist komfortabel.",
      "Prufe vor der Buchung Zimmergrosse, Betten und Bewertungen zu Gepack oder kleinen Zimmern.",
    ],
  },
  nearby: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.nearby,
    eyebrow: "Hotelbasis verfeinern",
    title: "Kluge nahe Hotelbasen",
    intro: "Der bekannte Gebietsname ist nur der Startpunkt. Eine nahe Basis kann Ankunft, Gepack, Zimmergrosse oder ruhige Nachte erleichtern und trotzdem zur gleichen Tokio-Logik passen.",
    goodIfLabel: "Gut, wenn:",
    watchOutLabel: "Achten auf:",
    compareLabel: "Grossere Gegend vergleichen",
  },
  framework: {
    title: "Brauchst du einen klareren Rahmen fur die Hotelbasis?",
    body: "Nutze die kostenlosen Guides fur allgemeine Gebietlogik. Zimmergrosse, Gepack, Flughafenankunft und Shinkansen-Zeit konnen die einfachste Hotelbasis verandern.",
    roomSize: "Zimmergrossen-Guide",
    luggage: "Tokio mit Gepack",
    stayHub: "Gebiets-Guides vergleichen",
  },
};

tokyoFirstTimeSupplementCopyByLocale.ru = {
  ...tokyoFirstTimeSupplementCopyByLocale.en,
  matrix: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.matrix,
    eyebrow: "Выбор района для отеля",
    title: "Матрица районов для отеля в Токио",
    intro: "Сравните известные станции, более спокойные соседние базы и районы, удобные для аэропорта, багажа и синкансэна, до поиска отелей. Это общий ориентир, а не персональная рекомендация.",
    goodIfLabel: "Подходит, если",
    watchOutLabel: "Учтите",
    providerDescription: "Поиск только по широкому району. Для небольших соседних баз здесь нет отдельных кнопок провайдеров.",
    groups: [
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[0], categoryLabel: "Активный центр", goodIf: "Энергия первого визита, еда, ночная жизнь и много вариантов отелей.", watchOut: "Толпы, огромная станция и утомительный приезд с багажом.", hotelActionLabel: "Искать отели в районе Синдзюку", internalLabels: ["Сравнить Синдзюку и Уэно"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[1], categoryLabel: "Доступ к аэропорту", goodIf: "Удобный доступ к Нарите, музеи, практичный поиск отелей и часто лучшая ценность.", watchOut: "Менее отполировано, чем Гиндза или Синдзюку.", hotelActionLabel: "Искать отели в районе Уэно", internalLabels: ["Сравнить Уэно и Синдзюку", "Сравнить Асакуса и Уэно"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[2], categoryLabel: "Традиционный район", goodIf: "Атмосфера старого Токио, Сэнсо-дзи, прогулки у реки и более спокойные ночи.", watchOut: "Не центр JR; проверяйте маршруты метро.", hotelActionLabel: "Искать отели в районе Асакуса", internalLabels: ["Сравнить Асакуса и Уэно"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[3], categoryLabel: "Железнодорожная логистика", goodIf: "Ранний синкансэн, багаж, первая/последняя ночь и доступ к Гиндзе.", watchOut: "Деловая атмосфера, большие станции и меньше местного ощущения.", hotelActionLabel: "Искать отели у Tokyo Station", internalLabels: ["Где жить перед синкансэном"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[4], categoryLabel: "Спокойный центр", goodIf: "Центральный баланс, более спокойные ночи, автобус аэропорта / T-CAT и доступ к Нихомбаси.", watchOut: "Менее известен для первого визита; маршрут зависит от метро или автобуса.", internalLabels: ["Открыть гид для первого визита в Токио", "Выбрать по багажу / аэропорту"] },
      { ...tokyoFirstTimeSupplementCopyByLocale.en.matrix.groups[5], categoryLabel: "Аэропорт + поезд", goodIf: "Ханэда, синкансэн, первая/последняя ночь и поездка с большим багажом.", watchOut: "Более деловой район и меньше атмосферы.", internalLabels: ["Посмотреть базы для синкансэна", "Проверить трансфер из аэропорта"] },
    ],
  },
  commonMistakes: {
    title: "Частые ошибки при выборе района отеля в Токио",
    items: [
      "Не выбирайте Синдзюку только потому, что все его советуют.",
      "Не выбирайте Асакуса только потому, что район выглядит традиционно.",
      "Не выбирайте Tokyo Station только потому, что это удобно для синкансэна.",
      "Известная станция не всегда самое простое место для ночлега.",
      "Лучшая база зависит от аэропорта, багажа, дня синкансэна, сложности станции, тихих ночей и размера номера.",
    ],
  },
  roomSize: {
    title: "Заметка о размере номеров в отелях Токио",
    paragraphs: [
      "Номера в отелях Токио могут казаться компактными по сравнению с некоторыми странами. Для двух путешественников с большими чемоданами меньше 18㎡ может быть тесно. Около 22–26㎡ обычно приемлемо, а 30㎡+ по токийским меркам обычно комфортно для двоих.",
      "Перед бронированием проверьте размер номера, тип кроватей и отзывы про багаж или маленькие комнаты.",
    ],
  },
  nearby: {
    ...tokyoFirstTimeSupplementCopyByLocale.en.nearby,
    eyebrow: "Уточнение базы отеля",
    title: "Более разумные соседние базы",
    intro: "Название известного района — только начало. Соседняя база иногда облегчает приезд, багаж, размер номера или тихие ночи, сохраняя ту же общую логику Токио.",
    goodIfLabel: "Подходит, если:",
    watchOutLabel: "Учтите:",
    compareLabel: "Сравнить широкий район",
  },
  framework: {
    title: "Нужна более понятная схема выбора района для отеля?",
    body: "Используйте бесплатные гиды для общей логики районов. Размер номера, багаж, приезд из аэропорта и время синкансэна могут изменить самый простой район для отеля.",
    roomSize: "Гид по размеру номера",
    luggage: "Токио с багажом",
    stayHub: "Сравнить гиды по районам",
  },
};

tokyoFirstTimeSupplementCopyByLocale["pt-BR"].nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "Leste de Toquio / lado Tokyo Station", bestFor: "Noites mais calmas, logistica por Haneda ou Narita e ruas mais simples que os grandes hubs.", watchOut: "Menos vida noturna que Shinjuku e menos pontos classicos de primeira viagem fora do hotel.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "Centro de Toquio", bestFor: "Comida, acesso de metro e uma base noturna mais controlada que as areas mais movimentadas.", watchOut: "Menos direto para manhas de Shinkansen que ficar perto da Tokyo Station.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "Asakusa / Leste de Toquio", bestFor: "Cafes, lojas de design, ruas calmas e acesso ao velho Tokyo sem dormir nos blocos mais turisticos.", watchOut: "Algumas rotas de aeroporto ou Shinkansen podem exigir uma baldeacao extra.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "Lado Tokyo Station", bestFor: "Shinkansen cedo, logistica com bagagem e uma base mais calma perto de rotas centrais.", watchOut: "Menos energia local a noite que Shinjuku, Ueno ou Asakusa.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "Lado Ueno", bestFor: "Acesso a Narita, busca de hoteis com melhor valor e comida pratica no corredor de Ueno.", watchOut: "Escolha com cuidado se quiser vida noturna ou uma chegada mais polida.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "Lado Shinjuku", bestFor: "Conveniência de Shinjuku com mais chance de noites calmas que os blocos mais barulhentos.", watchOut: "Distancia a pe e saidas da estacao importam porque Shinjuku ainda e grande.", href: "/areas-to-stay/tokyo/shinjuku" },
];
tokyoFirstTimeSupplementCopyByLocale["pt-BR"].priceTiming = {
  eyebrow: "Quando os hoteis ficam caros",
  title: "Quando hoteis em Toquio ficam caros",
  intro: "Precos de hotel mudam conforme a demanda. Se suas datas caem em fins de semana, feriados ou grandes temporadas de viagem, compare bases proximas antes de desistir de Toquio.",
  cards: [
    { title: "Sexta / sabado a noite", body: "Costumam ser mais caros que dias de semana, especialmente em areas populares." },
    { title: "Vespera de feriado nacional", body: "Fins de semana prolongados podem deixar hoteis centrais e transportes mais cheios." },
    { title: "Golden Week", body: "Fim de abril a inicio de maio. Varios feriados nacionais ficam proximos, entao viagens domesticas podem aumentar." },
    { title: "Obon", body: "Por volta de meados de agosto. Muitas pessoas viajam no Japao ou voltam para suas cidades." },
    { title: "Ano Novo", body: "Fim de dezembro a inicio de janeiro. Transporte e hospedagem podem ficar cheios." },
    { title: "Temporada de cerejeiras", body: "Geralmente fim de marco a inicio de abril em Toquio e Kyoto." },
    { title: "Temporada de folhas de outono", body: "Especialmente novembro para Toquio/Kyoto e areas de bate-volta." },
    { title: "Grandes eventos", body: "Shows, esportes, feiras e festivais podem elevar precos perto de estacoes especificas." },
  ],
  panelTitle: "O que fazer se suas datas estiverem caras",
  panelItems: [
    "Compare bases proximas, nao apenas Shinjuku ou Tokyo Station.",
    "Tente noites de semana se sua agenda permitir.",
    "Confira bases boas para bagagem se chegar com malas.",
    "Abra a matriz de bases de hotel antes de abrir sites de reserva.",
    "Veja exemplos de hoteis locais depois de escolher uma base.",
  ],
  matrixCta: "Abrir matriz de bases em Toquio",
  examplesCta: "Ver exemplos de hoteis locais",
  sourcesTitle: "Referencias oficiais / uteis",
};
tokyoFirstTimeSupplementCopyByLocale["pt-BR"].quickAnswerOverride = {
  title: "Resposta rapida",
  intro: "Para uma primeira viagem a Toquio, comece por estas bases amplas de hotel:",
  bases: [
    "Shinjuku: melhor se voce quer comida, vida noturna e energia de cidade grande.",
    "Ueno: melhor se voce chega por Narita ou quer acesso pratico ao lado leste.",
    "Asakusa: melhor se voce quer atmosfera de Tokyo antiga e noites mais calmas.",
    "Tokyo Station / Ginza: melhor se voce tem Shinkansen cedo, bagagem ou primeira/ultima noite em Toquio.",
  ],
  famousStationNote: "Mas voce nem sempre precisa dormir na estacao famosa em si.",
  nearbyIntro: "Se a estacao principal parecer cheia, cara ou dificil com bagagem, compare bases proximas:",
  nearbyBases: "Nishi-Shinjuku / Yoyogi, Nippori / Okachimachi, Kuramae / Tawaramachi, Hatchobori / Nihombashi, Akasaka, Suitengumae, Hamamatsucho ou Shinagawa.",
  matrixNote: "Use a matriz de bases de hotel abaixo antes de abrir sites de reserva.",
  matrixCta: "Abrir matriz de bases",
};

tokyoFirstTimeSupplementCopyByLocale.es.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "Este de Tokio / lado Tokyo Station", bestFor: "Noches mas tranquilas, logistica desde Haneda o Narita y calles mas faciles que los grandes hubs.", watchOut: "Menos vida nocturna que Shinjuku y menos iconos obvios de primer viaje fuera del hotel.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "Centro de Tokio", bestFor: "Comida, acceso en metro y una base nocturna mas controlada que las zonas mas concurridas.", watchOut: "Menos directo para mananas de Shinkansen que alojarse cerca de Tokyo Station.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "Asakusa / Este de Tokio", bestFor: "Cafes, tiendas de diseno, calles mas calmas y acceso al viejo Tokio sin dormir en los bloques mas turisticos.", watchOut: "Algunas rutas de aeropuerto o Shinkansen pueden necesitar un transbordo extra.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "Lado Tokyo Station", bestFor: "Shinkansen temprano, equipaje y una base de negocios mas tranquila cerca de rutas centrales.", watchOut: "Menos energia local de noche que Shinjuku, Ueno o Asakusa.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "Lado Ueno", bestFor: "Acceso a Narita, busquedas de hotel de mejor valor y comida practica en el corredor de Ueno.", watchOut: "Elige con cuidado si quieres vida nocturna o una primera noche mas pulida.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "Lado Shinjuku", bestFor: "Comodidad de Shinjuku con mas probabilidad de noches tranquilas que los bloques mas ruidosos.", watchOut: "La distancia a pie y las salidas importan porque Shinjuku sigue siendo enorme.", href: "/areas-to-stay/tokyo/shinjuku" },
];
tokyoFirstTimeSupplementCopyByLocale.es.priceTiming = {
  eyebrow: "Temporada de precios",
  title: "Cuando los hoteles en Tokio se encarecen",
  intro: "Los precios cambian segun la demanda. Si tus fechas caen en fines de semana, festivos o grandes temporadas de viaje, compara bases cercanas antes de descartar Tokio.",
  cards: [
    { title: "Viernes / sabados por la noche", body: "Suelen ser mas altos que entre semana, sobre todo en zonas populares." },
    { title: "Noche antes de festivo nacional", body: "Los puentes pueden llenar mas los hoteles centrales y el transporte." },
    { title: "Golden Week", body: "Finales de abril a principios de mayo. Varios festivos estan juntos y puede haber mucho viaje domestico." },
    { title: "Obon", body: "Alrededor de mediados de agosto. Muchas personas viajan dentro de Japon o vuelven a sus ciudades." },
    { title: "Ano Nuevo", body: "Finales de diciembre a principios de enero. Transporte y alojamiento pueden estar concurridos." },
    { title: "Temporada de cerezos", body: "Normalmente de finales de marzo a principios de abril en Tokio y Kioto." },
    { title: "Hojas de otono", body: "Especialmente noviembre para Tokio/Kioto y zonas de excursion cercanas." },
    { title: "Grandes eventos", body: "Conciertos, deportes, ferias y festivales pueden subir precios alrededor de ciertas estaciones." },
  ],
  panelTitle: "Que hacer si tus fechas son caras",
  panelItems: [
    "Compara bases cercanas, no solo Shinjuku o Tokyo Station.",
    "Prueba noches entre semana si tu horario es flexible.",
    "Revisa bases faciles con equipaje si llegas con maletas.",
    "Abre la matriz de bases de Tokio antes de abrir webs de reserva.",
    "Mira ejemplos de hoteles locales despues de elegir una base.",
  ],
  matrixCta: "Abrir matriz de bases de Tokio",
  examplesCta: "Ver ejemplos de hoteles locales",
  sourcesTitle: "Referencias oficiales / utiles",
};
tokyoFirstTimeSupplementCopyByLocale.es.quickAnswerOverride = {
  title: "Respuesta rapida",
  intro: "Para un primer viaje a Tokio, empieza con estas bases hoteleras amplias:",
  bases: [
    "Shinjuku: mejor si quieres comida, vida nocturna y energia de gran ciudad.",
    "Ueno: mejor si llegas desde Narita o quieres acceso practico al lado este.",
    "Asakusa: mejor si quieres ambiente del viejo Tokio y noches mas tranquilas.",
    "Tokyo Station / Ginza: mejor si tienes un Shinkansen temprano, equipaje o primera/ultima noche en Tokio.",
  ],
  famousStationNote: "Pero no siempre necesitas dormir en la estacion famosa en si.",
  nearbyIntro: "Si la estacion principal parece demasiado llena, cara o dificil con equipaje, compara bases cercanas:",
  nearbyBases: "Nishi-Shinjuku / Yoyogi, Nippori / Okachimachi, Kuramae / Tawaramachi, Hatchobori / Nihombashi, Akasaka, Suitengumae, Hamamatsucho o Shinagawa.",
  matrixNote: "Usa la matriz de bases hoteleras antes de abrir webs de reserva.",
  matrixCta: "Abrir matriz hotelera",
};

tokyoFirstTimeSupplementCopyByLocale.ko.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "동쪽 도쿄 / 도쿄역 쪽", bestFor: "조용한 밤, 하네다 또는 나리타 동선, 큰 허브보다 걷기 쉬운 거리.", watchOut: "신주쿠보다 밤문화가 적고 호텔 밖 첫 여행 명소가 덜 뚜렷합니다.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "도쿄 중심부", bestFor: "음식, 지하철 접근, 가장 붐비는 역 주변보다 안정적인 밤 거점.", watchOut: "도쿄역 근처보다 신칸센 아침 동선은 덜 직접적입니다.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "아사쿠사 / 동쪽 도쿄", bestFor: "카페, 디자인 숍, 조용한 거리, 가장 관광객 많은 블록 밖의 옛 도쿄 접근.", watchOut: "공항이나 신칸센 동선에 환승이 하나 더 필요할 수 있습니다.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "도쿄역 쪽", bestFor: "이른 신칸센, 짐 이동, 중앙 철도 동선 근처의 조용한 비즈니스 거점.", watchOut: "신주쿠, 우에노, 아사쿠사보다 밤의 현지 에너지는 적습니다.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "우에노 쪽", bestFor: "나리타 접근, 더 나은 가격대의 호텔 검색, 우에노 축의 실용적인 식사.", watchOut: "밤문화나 세련된 첫날 느낌을 원하면 신중히 고르세요.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "신주쿠 쪽", bestFor: "신주쿠 편리함을 유지하면서 가장 시끄러운 동쪽 블록보다 조용한 밤을 기대할 때.", watchOut: "신주쿠는 여전히 크므로 도보 거리와 역 출구가 중요합니다.", href: "/areas-to-stay/tokyo/shinjuku" },
];
tokyoFirstTimeSupplementCopyByLocale.ko.priceTiming = {
  eyebrow: "호텔 가격 시기",
  title: "도쿄 호텔이 비싸지기 쉬운 시기",
  intro: "호텔 가격은 수요에 따라 달라집니다. 주말, 공휴일, 큰 여행 시즌에 겹치면 도쿄를 포기하기 전에 주변 호텔 거점을 함께 비교하세요.",
  cards: [
    { title: "금요일 / 토요일 밤", body: "특히 인기 도심 지역에서는 평일보다 높아지는 경우가 많습니다." },
    { title: "공휴일 전날 밤", body: "연휴에는 중심부 호텔과 교통이 더 붐빌 수 있습니다." },
    { title: "골든위크", body: "4월 말부터 5월 초. 여러 공휴일이 가까워 국내 여행 수요가 많아질 수 있습니다." },
    { title: "오봉", body: "8월 중순 전후. 많은 사람이 국내 이동이나 귀성을 합니다." },
    { title: "연말연시", body: "12월 말부터 1월 초. 교통과 숙박이 붐빌 수 있습니다." },
    { title: "벚꽃 시즌", body: "도쿄와 교토는 보통 3월 말부터 4월 초입니다." },
    { title: "단풍 시즌", body: "도쿄/교토와 근교 당일치기 지역은 특히 11월이 중요합니다." },
    { title: "대형 이벤트", body: "콘서트, 스포츠, 전시, 축제는 특정 역 주변 가격을 올릴 수 있습니다." },
  ],
  panelTitle: "날짜가 비쌀 때 할 일",
  panelItems: [
    "신주쿠나 도쿄역만 보지 말고 주변 거점도 비교하세요.",
    "일정이 유연하면 평일 밤을 확인하세요.",
    "캐리어가 있다면 짐 친화적인 거점을 확인하세요.",
    "예약 사이트를 열기 전에 도쿄 호텔 거점 매트릭스를 보세요.",
    "거점을 고른 뒤 현지 호텔 예시를 확인하세요.",
  ],
  matrixCta: "도쿄 호텔 거점 매트릭스 열기",
  examplesCta: "현지 호텔 예시 보기",
  sourcesTitle: "공식 / 유용한 참고자료",
};
tokyoFirstTimeSupplementCopyByLocale.ko.quickAnswerOverride = {
  title: "빠른 답변",
  intro: "첫 도쿄 여행이라면 먼저 넓은 호텔 거점부터 보세요:",
  bases: [
    "신주쿠: 음식, 밤문화, 대도시 에너지를 원할 때 좋습니다.",
    "우에노: 나리타에서 도착하거나 동쪽 접근을 실용적으로 쓰고 싶을 때 좋습니다.",
    "아사쿠사: 옛 도쿄 분위기와 조용한 밤을 원할 때 좋습니다.",
    "도쿄역 / 긴자: 이른 신칸센, 짐, 첫날/마지막 밤이 있을 때 좋습니다.",
  ],
  famousStationNote: "하지만 꼭 유명한 역 바로 옆에서 잘 필요는 없습니다.",
  nearbyIntro: "주요 역이 너무 붐비거나 비싸거나 짐과 함께 어렵게 느껴지면 주변 거점도 비교하세요:",
  nearbyBases: "Nishi-Shinjuku / Yoyogi, Nippori / Okachimachi, Kuramae / Tawaramachi, Hatchobori / Nihombashi, Akasaka, Suitengumae, Hamamatsucho, Shinagawa.",
  matrixNote: "예약 사이트를 열기 전에 아래 호텔 거점 매트릭스를 사용하세요.",
  matrixCta: "호텔 거점 매트릭스 열기",
};

tokyoFirstTimeSupplementCopyByLocale["zh-TW"].nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "東東京 / 東京站側", bestFor: "較安靜的夜晚、羽田或成田動線，以及比大型樞紐更好走的街道。", watchOut: "夜生活少於新宿，飯店外的第一次東京地標也較不明顯。", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "東京中心", bestFor: "餐飲、地鐵交通，以及比最繁忙車站區更可控的夜晚基地。", watchOut: "新幹線早晨動線不如住在東京站附近直接。", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "淺草 / 東東京", bestFor: "咖啡館、設計小店、安靜街道，以及不用住在最觀光街區也能接近老東京。", watchOut: "部分機場或新幹線路線可能需要多一次轉乘。", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "東京站側", bestFor: "早班新幹線、行李動線，以及靠近中央鐵道路線的較安靜商務基地。", watchOut: "夜晚地方感少於新宿、上野或淺草。", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "上野側", bestFor: "成田交通、較有價值感的飯店搜尋，以及上野走廊周邊實用餐飲。", watchOut: "若想要夜生活或精緻第一晚，請仔細挑選。", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "新宿側", bestFor: "保留新宿便利，同時比最吵的東側街區更可能有安靜夜晚。", watchOut: "新宿規模仍大，步行距離與車站出口很重要。", href: "/areas-to-stay/tokyo/shinjuku" },
];
tokyoFirstTimeSupplementCopyByLocale["zh-TW"].priceTiming = {
  eyebrow: "飯店價格時機",
  title: "東京飯店容易變貴的時候",
  intro: "飯店價格會隨需求變動。若日期碰到週末、假日或主要旅遊季，先比較鄰近飯店基地，再決定是否放棄東京。",
  cards: [
    { title: "週五 / 週六晚上", body: "通常比平日高，特別是在熱門市區。" },
    { title: "國定假日前一晚", body: "連假可能讓市中心飯店與交通更繁忙。" },
    { title: "黃金週", body: "4月底到5月初。多個國定假日相近，國內旅遊可能很忙。" },
    { title: "盂蘭盆節", body: "約8月中旬。許多人會在日本國內旅行或返鄉。" },
    { title: "新年假期", body: "12月底到1月初。交通與住宿可能擁擠。" },
    { title: "櫻花季", body: "東京與京都通常是3月底到4月初。" },
    { title: "紅葉季", body: "東京/京都與附近一日遊區域，特別是11月。" },
    { title: "大型活動", body: "演唱會、體育賽事、展覽與祭典可能推高特定車站周邊價格。" },
  ],
  panelTitle: "如果你的日期很貴，可以怎麼做",
  panelItems: [
    "比較鄰近基地，不要只看新宿或東京站。",
    "如果行程彈性，試著查看平日晚上。",
    "若帶大型行李抵達，查看行李友善基地。",
    "打開訂房網站前，先看東京飯店基地矩陣。",
    "選定基地後，再看當地飯店範例。",
  ],
  matrixCta: "打開東京飯店基地矩陣",
  examplesCta: "查看當地飯店範例",
  sourcesTitle: "官方 / 實用參考",
};
tokyoFirstTimeSupplementCopyByLocale["zh-TW"].quickAnswerOverride = {
  title: "快速答案",
  intro: "第一次東京旅行，可以先從這些大範圍飯店基地開始：",
  bases: [
    "新宿：適合想要美食、夜生活與大城市能量。",
    "上野：適合從成田抵達，或想要實用的東側交通。",
    "淺草：適合想要老東京氛圍與較安靜夜晚。",
    "東京站 / 銀座：適合有早班新幹線、行李，或東京第一晚/最後一晚。",
  ],
  famousStationNote: "但你不一定需要睡在知名車站本身。",
  nearbyIntro: "如果主要車站太擁擠、太貴，或帶行李很麻煩，可以比較附近基地：",
  nearbyBases: "Nishi-Shinjuku / Yoyogi、Nippori / Okachimachi、Kuramae / Tawaramachi、Hatchobori / Nihombashi、Akasaka、Suitengumae、Hamamatsucho 或 Shinagawa。",
  matrixNote: "打開訂房網站前，先使用下方飯店基地矩陣。",
  matrixCta: "打開飯店基地矩陣",
};

tokyoFirstTimeSupplementCopyByLocale["zh-CN"].nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "东东京 / 东京站侧", bestFor: "较安静的夜晚、羽田或成田动线，以及比大型枢纽更好走的街道。", watchOut: "夜生活少于新宿，酒店外的第一次东京地标也较不明显。", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "东京中心", bestFor: "餐饮、地铁交通，以及比最繁忙车站区更可控的夜晚基地。", watchOut: "新干线早晨动线不如住在东京站附近直接。", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "浅草 / 东东京", bestFor: "咖啡馆、设计小店、安静街道，以及不用住在最观光街区也能接近老东京。", watchOut: "部分机场或新干线路线可能需要多一次换乘。", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "东京站侧", bestFor: "早班新干线、行李动线，以及靠近中央铁路路线的较安静商务基地。", watchOut: "夜晚地方感少于新宿、上野或浅草。", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "上野侧", bestFor: "成田交通、较有性价比的酒店搜索，以及上野走廊周边实用餐饮。", watchOut: "若想要夜生活或精致第一晚，请仔细挑选。", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "新宿侧", bestFor: "保留新宿便利，同时比最吵的东侧街区更可能有安静夜晚。", watchOut: "新宿规模仍大，步行距离与车站出口很重要。", href: "/areas-to-stay/tokyo/shinjuku" },
];
tokyoFirstTimeSupplementCopyByLocale["zh-CN"].priceTiming = {
  eyebrow: "酒店价格时机",
  title: "东京酒店容易变贵的时候",
  intro: "酒店价格会随需求变动。若日期碰到周末、假日或主要旅游季，先比较邻近酒店基地，再决定是否放弃东京。",
  cards: [
    { title: "周五 / 周六晚上", body: "通常比平日高，特别是在热门市区。" },
    { title: "国定假日前一晚", body: "连假可能让市中心酒店与交通更繁忙。" },
    { title: "黄金周", body: "4月底到5月初。多个国定假日相近，国内旅游可能很忙。" },
    { title: "盂兰盆节", body: "约8月中旬。许多人会在日本国内旅行或返乡。" },
    { title: "新年假期", body: "12月底到1月初。交通与住宿可能拥挤。" },
    { title: "樱花季", body: "东京与京都通常是3月底到4月初。" },
    { title: "红叶季", body: "东京/京都与附近一日游区域，特别是11月。" },
    { title: "大型活动", body: "演唱会、体育赛事、展览与祭典可能推高特定车站周边价格。" },
  ],
  panelTitle: "如果你的日期很贵，可以怎么做",
  panelItems: [
    "比较邻近基地，不要只看新宿或东京站。",
    "如果行程弹性，试着查看平日晚上。",
    "若带大型行李抵达，查看行李友好基地。",
    "打开订房网站前，先看东京酒店基地矩阵。",
    "选定基地后，再看当地酒店范例。",
  ],
  matrixCta: "打开东京酒店基地矩阵",
  examplesCta: "查看当地酒店范例",
  sourcesTitle: "官方 / 实用参考",
};
tokyoFirstTimeSupplementCopyByLocale["zh-CN"].quickAnswerOverride = {
  title: "快速答案",
  intro: "第一次东京旅行，可以先从这些大范围酒店基地开始：",
  bases: [
    "新宿：适合想要美食、夜生活与大城市能量。",
    "上野：适合从成田抵达，或想要实用的东侧交通。",
    "浅草：适合想要老东京氛围与较安静夜晚。",
    "东京站 / 银座：适合有早班新干线、行李，或东京第一晚/最后一晚。",
  ],
  famousStationNote: "但你不一定需要睡在知名车站本身。",
  nearbyIntro: "如果主要车站太拥挤、太贵，或带行李很麻烦，可以比较附近基地：",
  nearbyBases: "Nishi-Shinjuku / Yoyogi、Nippori / Okachimachi、Kuramae / Tawaramachi、Hatchobori / Nihombashi、Akasaka、Suitengumae、Hamamatsucho 或 Shinagawa。",
  matrixNote: "打开订房网站前，先使用下方酒店基地矩阵。",
  matrixCta: "打开酒店基地矩阵",
};

tokyoFirstTimeSupplementCopyByLocale.fr.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "Est de Tokyo / cote Tokyo Station", bestFor: "Nuits plus calmes, logistique Haneda ou Narita et rues plus faciles que les grands hubs.", watchOut: "Moins de vie nocturne que Shinjuku et moins de reperes evidents de premier sejour hors de l'hotel.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "Centre de Tokyo", bestFor: "Restaurants, acces metro et base de nuit plus controlee que les zones les plus chargees.", watchOut: "Moins direct pour les matins Shinkansen que pres de Tokyo Station.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "Asakusa / Est de Tokyo", bestFor: "Cafes, boutiques de design, rues calmes et acces au vieux Tokyo sans dormir dans les blocs les plus touristiques.", watchOut: "Certains trajets aeroport ou Shinkansen peuvent demander une correspondance de plus.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "Cote Tokyo Station", bestFor: "Shinkansen tot, bagages et base business plus calme pres des lignes centrales.", watchOut: "Moins d'energie locale le soir que Shinjuku, Ueno ou Asakusa.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "Cote Ueno", bestFor: "Acces Narita, recherche d'hotels bon rapport qualite-prix et repas pratiques autour du corridor Ueno.", watchOut: "Choisissez avec soin si vous voulez de la vie nocturne ou une premiere nuit plus raffinee.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "Cote Shinjuku", bestFor: "Confort de Shinjuku avec plus de chances de nuits calmes que les blocs est les plus bruyants.", watchOut: "La distance a pied et les sorties comptent, car Shinjuku reste immense.", href: "/areas-to-stay/tokyo/shinjuku" },
];
tokyoFirstTimeSupplementCopyByLocale.fr.priceTiming = {
  eyebrow: "Timing des prix d'hotel",
  title: "Quand les hotels de Tokyo deviennent chers",
  intro: "Les prix d'hotel changent selon la demande. Si vos dates tombent sur des week-ends, jours feries ou grandes saisons, comparez les bases voisines avant d'abandonner Tokyo.",
  cards: [
    { title: "Vendredi / samedi soir", body: "Souvent plus cher que les jours de semaine, surtout dans les quartiers populaires." },
    { title: "Veille d'un jour ferie national", body: "Les longs week-ends peuvent rendre les hotels centraux et les transports plus charges." },
    { title: "Golden Week", body: "Fin avril a debut mai. Plusieurs jours feries sont rapproches, donc le tourisme domestique peut etre dense." },
    { title: "Obon", body: "Autour de la mi-aout. Beaucoup de gens voyagent au Japon ou retournent dans leur ville d'origine." },
    { title: "Nouvel An", body: "Fin decembre a debut janvier. Transports et hebergements peuvent etre charges." },
    { title: "Saison des cerisiers", body: "Generalement fin mars a debut avril a Tokyo et Kyoto." },
    { title: "Saison des feuilles d'automne", body: "Surtout novembre pour Tokyo/Kyoto et les zones d'excursion proches." },
    { title: "Grands evenements", body: "Concerts, sports, salons et festivals peuvent faire monter les prix autour de certaines gares." },
  ],
  panelTitle: "Que faire si vos dates sont cheres",
  panelItems: [
    "Comparez les bases voisines, pas seulement Shinjuku ou Tokyo Station.",
    "Essayez les nuits en semaine si votre planning est flexible.",
    "Verifiez les bases faciles avec bagages si vous arrivez avec des valises.",
    "Ouvrez la matrice des bases d'hotel avant les sites de reservation.",
    "Consultez les exemples d'hotels locaux apres avoir choisi une base.",
  ],
  matrixCta: "Ouvrir la matrice des bases de Tokyo",
  examplesCta: "Voir des exemples d'hotels locaux",
  sourcesTitle: "References officielles / utiles",
};
tokyoFirstTimeSupplementCopyByLocale.fr.quickAnswerOverride = {
  title: "Reponse rapide",
  intro: "Pour un premier sejour a Tokyo, commencez par ces grandes bases d'hotel :",
  bases: [
    "Shinjuku : bien si vous voulez restaurants, vie nocturne et energie de grande ville.",
    "Ueno : bien si vous arrivez de Narita ou voulez un acces pratique cote est.",
    "Asakusa : bien si vous voulez l'ambiance du vieux Tokyo et des nuits plus calmes.",
    "Tokyo Station / Ginza : bien si vous avez un Shinkansen tot, des bagages ou une premiere/derniere nuit a Tokyo.",
  ],
  famousStationNote: "Mais vous n'avez pas toujours besoin de dormir a la gare celebre elle-meme.",
  nearbyIntro: "Si la gare principale semble trop chargee, chere ou difficile avec des bagages, comparez les bases voisines :",
  nearbyBases: "Nishi-Shinjuku / Yoyogi, Nippori / Okachimachi, Kuramae / Tawaramachi, Hatchobori / Nihombashi, Akasaka, Suitengumae, Hamamatsucho ou Shinagawa.",
  matrixNote: "Utilisez la matrice des bases d'hotel ci-dessous avant d'ouvrir les sites de reservation.",
  matrixCta: "Ouvrir la matrice hotel",
};

tokyoFirstTimeSupplementCopyByLocale.de.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "Ost-Tokio / Seite Tokyo Station", bestFor: "Ruhigere Nachte, Haneda- oder Narita-Logistik und einfachere Strassen als die grossen Hubs.", watchOut: "Weniger Nachtleben als Shinjuku und weniger offensichtliche Erstbesucher-Orte direkt am Hotel.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "Zentrales Tokio", bestFor: "Essen, U-Bahn-Zugang und kontrolliertere Nachtbasis als die vollsten Bahnhofsgebiete.", watchOut: "Fur Shinkansen-Morgen weniger direkt als nahe Tokyo Station.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "Asakusa / Ost-Tokio", bestFor: "Cafes, Designshops, ruhigere Strassen und Alt-Tokio-Zugang ohne die touristischsten Blocks.", watchOut: "Einige Flughafen- oder Shinkansen-Routen brauchen eventuell einen Umstieg mehr.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "Seite Tokyo Station", bestFor: "Fruher Shinkansen, Gepacklogistik und ruhigere Business-Basis nahe zentralen Bahnlinien.", watchOut: "Weniger lokale Abendenergie als Shinjuku, Ueno oder Asakusa.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "Seite Ueno", bestFor: "Narita-Zugang, bessere Hotelsuche nach Wert und praktische Essensoptionen im Ueno-Korridor.", watchOut: "Sorgfaltig wahlen, wenn du Nachtleben oder ein polierteres Ankunftsgefuhl willst.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "Seite Shinjuku", bestFor: "Shinjuku-Komfort mit besserer Chance auf ruhige Nachte als in den lautesten Ost-Blocks.", watchOut: "Fusswege und Bahnhofsausgange zahlen, weil Shinjuku weiterhin gross ist.", href: "/areas-to-stay/tokyo/shinjuku" },
];
tokyoFirstTimeSupplementCopyByLocale.de.priceTiming = {
  eyebrow: "Hotelpreis-Zeiten",
  title: "Wann Hotels in Tokio teuer werden",
  intro: "Hotelpreise andern sich mit der Nachfrage. Wenn deine Daten auf Wochenenden, Feiertage oder grosse Reisesaisons fallen, vergleiche nahe Hotelbasen, bevor du Tokio aufgibst.",
  cards: [
    { title: "Freitag- / Samstagabend", body: "Oft teurer als Werktage, besonders in beliebten Stadtgebieten." },
    { title: "Nacht vor einem Feiertag", body: "Lange Wochenenden konnen zentrale Hotels und Verkehr voller machen." },
    { title: "Golden Week", body: "Ende April bis Anfang Mai. Mehrere Feiertage liegen nah beieinander, daher kann Inlandsreiseverkehr stark sein." },
    { title: "Obon", body: "Etwa Mitte August. Viele Menschen reisen im Inland oder fahren in ihre Heimatorte." },
    { title: "Neujahrsferien", body: "Ende Dezember bis Anfang Januar. Verkehr und Unterkunfte konnen voll sein." },
    { title: "Kirschblutenzeit", body: "In Tokio und Kyoto meist Ende Marz bis Anfang April." },
    { title: "Herbstlaubzeit", body: "Besonders November fur Tokio/Kyoto und nahe Tagesausflugsgebiete." },
    { title: "Grosse Events", body: "Konzerte, Sport, Messen und Festivals konnen Preise rund um bestimmte Bahnhofe erhohen." },
  ],
  panelTitle: "Was tun, wenn deine Daten teuer sind",
  panelItems: [
    "Vergleiche nahe Basen, nicht nur Shinjuku oder Tokyo Station.",
    "Prufe Werktage, wenn dein Zeitplan flexibel ist.",
    "Prufe gepackfreundliche Basen, wenn du mit Koffern ankommst.",
    "Offne die Tokio-Hotelbasis-Matrix vor Buchungsseiten.",
    "Sieh lokale Hotelbeispiele an, nachdem du eine Basis gewahlt hast.",
  ],
  matrixCta: "Tokio-Hotelbasis-Matrix offnen",
  examplesCta: "Lokale Hotelbeispiele ansehen",
  sourcesTitle: "Offizielle / nutzliche Quellen",
};
tokyoFirstTimeSupplementCopyByLocale.de.quickAnswerOverride = {
  title: "Schnelle Antwort",
  intro: "Fur die erste Tokio-Reise starte mit diesen breiten Hotelbasen:",
  bases: [
    "Shinjuku: gut, wenn du Essen, Nachtleben und Grossstadtenergie willst.",
    "Ueno: gut, wenn du aus Narita ankommst oder praktischen Zugang zur Ostseite willst.",
    "Asakusa: gut, wenn du Alt-Tokio-Atmosphare und ruhigere Nachte willst.",
    "Tokyo Station / Ginza: gut bei fruhem Shinkansen, Gepack oder erster/letzter Nacht in Tokio.",
  ],
  famousStationNote: "Du musst aber nicht immer direkt am beruhmten Bahnhof schlafen.",
  nearbyIntro: "Wenn der Hauptbahnhof zu voll, teuer oder mit Gepack schwierig wirkt, vergleiche nahe Basen:",
  nearbyBases: "Nishi-Shinjuku / Yoyogi, Nippori / Okachimachi, Kuramae / Tawaramachi, Hatchobori / Nihombashi, Akasaka, Suitengumae, Hamamatsucho oder Shinagawa.",
  matrixNote: "Nutze die Hotelbasis-Matrix unten, bevor du Buchungsseiten offnest.",
  matrixCta: "Hotelbasis-Matrix offnen",
};

tokyoFirstTimeSupplementCopyByLocale.ru.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "Восточный Токио / сторона Tokyo Station", bestFor: "Более тихие ночи, логистика Ханэда или Нарита и улицы проще, чем у крупных узлов.", watchOut: "Меньше ночной жизни, чем в Синдзюку, и меньше очевидных мест первого визита рядом с отелем.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "Центр Токио", bestFor: "Еда, метро и более спокойная ночная база, чем самые загруженные районы станций.", watchOut: "Менее прямой вариант для утреннего синкансэна, чем район Tokyo Station.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "Асакуса / Восточный Токио", bestFor: "Кафе, дизайн-магазины, спокойные улицы и доступ к старому Токио без самых туристических кварталов.", watchOut: "Для некоторых маршрутов из аэропорта или к синкансэну может понадобиться лишняя пересадка.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "Сторона Tokyo Station", bestFor: "Ранний синкансэн, багаж и более спокойная деловая база рядом с центральными линиями.", watchOut: "Меньше местной вечерней энергии, чем в Синдзюку, Уэно или Асакуса.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "Сторона Уэно", bestFor: "Доступ к Нарите, поиск отелей с лучшей ценностью и практичная еда вокруг коридора Уэно.", watchOut: "Выбирайте внимательно, если нужны ночная жизнь или более аккуратное первое впечатление.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "Сторона Синдзюку", bestFor: "Удобство Синдзюку с большей вероятностью тихих ночей, чем в самых шумных восточных кварталах.", watchOut: "Пешая дистанция и выходы станции важны, потому что Синдзюку все равно очень большой.", href: "/areas-to-stay/tokyo/shinjuku" },
];
tokyoFirstTimeSupplementCopyByLocale.ru.priceTiming = {
  eyebrow: "Сезоны цен на отели",
  title: "Когда отели в Токио становятся дороже",
  intro: "Цены на отели меняются по спросу. Если даты попадают на выходные, праздники или крупные сезоны поездок, сравните соседние базы перед тем, как отказываться от Токио.",
  cards: [
    { title: "Пятница / суббота вечером", body: "Часто дороже будней, особенно в популярных городских районах." },
    { title: "Ночь перед национальным праздником", body: "Длинные выходные могут сделать центральные отели и транспорт более загруженными." },
    { title: "Golden Week", body: "Конец апреля — начало мая. Несколько праздников идут рядом, поэтому внутренних поездок может быть много." },
    { title: "Обон", body: "Около середины августа. Многие путешествуют по Японии или возвращаются в родные города." },
    { title: "Новогодние праздники", body: "Конец декабря — начало января. Транспорт и жилье могут быть загружены." },
    { title: "Сезон сакуры", body: "Обычно конец марта — начало апреля в Токио и Киото." },
    { title: "Сезон осенних листьев", body: "Особенно ноябрь для Токио/Киото и близких районов однодневных поездок." },
    { title: "Крупные события", body: "Концерты, спорт, выставки и фестивали могут поднимать цены вокруг отдельных станций." },
  ],
  panelTitle: "Что делать, если ваши даты дорогие",
  panelItems: [
    "Сравните соседние базы, а не только Синдзюку или Tokyo Station.",
    "Попробуйте будние ночи, если расписание гибкое.",
    "Проверьте базы, удобные с багажом, если приезжаете с чемоданами.",
    "Откройте матрицу районов для отеля до сайтов бронирования.",
    "Посмотрите местные примеры отелей после выбора базы.",
  ],
  matrixCta: "Открыть матрицу районов Токио",
  examplesCta: "Посмотреть местные примеры отелей",
  sourcesTitle: "Официальные / полезные источники",
};
tokyoFirstTimeSupplementCopyByLocale.ru.quickAnswerOverride = {
  title: "Краткий ответ",
  intro: "Для первой поездки в Токио начните с этих широких районов для отеля:",
  bases: [
    "Синдзюку: если нужны еда, ночная жизнь и энергия большого города.",
    "Уэно: если вы приезжаете из Нариты или нужен практичный доступ к восточной стороне.",
    "Асакуса: если нужна атмосфера старого Токио и более спокойные ночи.",
    "Tokyo Station / Гиндза: если есть ранний синкансэн, багаж или первая/последняя ночь в Токио.",
  ],
  famousStationNote: "Но не всегда нужно жить прямо у самой известной станции.",
  nearbyIntro: "Если главная станция кажется слишком людной, дорогой или сложной с багажом, сравните соседние базы:",
  nearbyBases: "Nishi-Shinjuku / Yoyogi, Nippori / Okachimachi, Kuramae / Tawaramachi, Hatchobori / Nihombashi, Akasaka, Suitengumae, Hamamatsucho или Shinagawa.",
  matrixNote: "Используйте матрицу районов ниже перед открытием сайтов бронирования.",
  matrixCta: "Открыть матрицу отелей",
};

tokyoFirstTimeSupplementCopyByLocale["pt-BR"].quickAnswerOverride.matrixCta = "Comparar areas de estacao em Toquio";
tokyoFirstTimeSupplementCopyByLocale.es.quickAnswerOverride.matrixCta = "Comparar zonas de estacion en Tokio";
tokyoFirstTimeSupplementCopyByLocale.ko.quickAnswerOverride.matrixCta = "도쿄 역 주변 지역 비교";
tokyoFirstTimeSupplementCopyByLocale["zh-TW"].quickAnswerOverride.matrixCta = "比較東京車站區域";
tokyoFirstTimeSupplementCopyByLocale["zh-CN"].quickAnswerOverride.matrixCta = "比较东京车站区域";
tokyoFirstTimeSupplementCopyByLocale.fr.quickAnswerOverride.matrixCta = "Comparer les zones de gare a Tokyo";
tokyoFirstTimeSupplementCopyByLocale.de.quickAnswerOverride.matrixCta = "Tokio-Stationsgebiete vergleichen";
tokyoFirstTimeSupplementCopyByLocale.ru.quickAnswerOverride.matrixCta = "Сравнить районы станций Токио";

tokyoFirstTimeSupplementCopyByLocale["pt-BR"].earlyDecision = {
  title: "Antes de reservar um hotel em Toquio",
  body: "Comece pelo movimento da viagem; depois compare nomes de hoteis.",
  chips: ["Narita ou Haneda", "Kyoto / Osaka de Shinkansen", "Malas grandes", "Vida noturna ou noites calmas", "Estacao enorme ou base mais calma"],
  mistakesTitle: "Erros comuns ao escolher area de hotel em Toquio",
  mistakes: [
    "Escolher Shinjuku so porque e famosa",
    "Escolher Asakusa so porque parece tradicional",
    "Escolher Tokyo Station so pelo Shinkansen",
    "Ignorar bagagem, tamanho do quarto e complexidade da estacao",
    "Reservar antes de decidir aeroporto e rotas de trem",
  ],
  note: "Uma estacao famosa nem sempre e o lugar mais facil para dormir. A melhor area de hotel em Toquio costuma reduzir baldeacoes, estresse com bagagem e confusao na primeira noite.",
  roomDateCta: "Ver tamanho do quarto e datas caras antes de reservar",
};
tokyoFirstTimeSupplementCopyByLocale.es.earlyDecision = {
  title: "Antes de reservar un hotel en Tokio",
  body: "Empieza por como se mueve tu viaje; despues compara nombres de hoteles.",
  chips: ["Narita o Haneda", "Kioto / Osaka en Shinkansen", "Maletas grandes", "Vida nocturna o noches tranquilas", "Estacion enorme o base mas calmada"],
  mistakesTitle: "Errores comunes al elegir zona de hotel en Tokio",
  mistakes: [
    "Elegir Shinjuku solo porque es famoso",
    "Elegir Asakusa solo porque parece tradicional",
    "Elegir Tokyo Station solo por el Shinkansen",
    "Ignorar equipaje, tamano de habitacion y complejidad de estaciones",
    "Reservar antes de decidir aeropuerto y rutas de tren",
  ],
  note: "Una estacion famosa no siempre es el lugar mas facil para dormir. La mejor zona de hotel en Tokio suele reducir transbordos, estres con equipaje y confusion la primera noche.",
  roomDateCta: "Revisar tamano de habitacion y fechas caras antes de reservar",
};
tokyoFirstTimeSupplementCopyByLocale.ko.earlyDecision = {
  title: "도쿄 호텔을 예약하기 전에",
  body: "호텔 이름보다 먼저 여행 동선부터 정리하세요.",
  chips: ["나리타 또는 하네다", "교토 / 오사카 신칸센", "큰 여행가방", "밤문화 또는 조용한 밤", "큰 역 또는 더 차분한 거점"],
  mistakesTitle: "도쿄 호텔 지역 선택에서 흔한 실수",
  mistakes: [
    "유명하다는 이유만으로 신주쿠를 고르기",
    "전통적으로 보인다는 이유만으로 아사쿠사를 고르기",
    "신칸센 때문에 도쿄역만 고르기",
    "짐, 객실 크기, 역 복잡도를 무시하기",
    "공항과 철도 동선을 정하기 전에 예약하기",
  ],
  note: "유명한 역이 항상 가장 편한 숙박지는 아닙니다. 좋은 도쿄 호텔 지역은 환승, 짐 스트레스, 첫날 밤의 혼란을 줄여 줍니다.",
  roomDateCta: "예약 전 객실 크기와 비싼 날짜 확인",
};
tokyoFirstTimeSupplementCopyByLocale["zh-TW"].earlyDecision = {
  title: "預訂東京飯店前",
  body: "先看你的行程如何移動，再比較飯店名稱。",
  chips: ["成田或羽田", "搭新幹線去京都 / 大阪", "大型行李箱", "夜生活或安靜夜晚", "大型車站或較平靜的基地"],
  mistakesTitle: "選東京飯店區域時常見的錯誤",
  mistakes: [
    "只因為新宿有名就選新宿",
    "只因為淺草看起來傳統就選淺草",
    "只因為新幹線就選東京站",
    "忽略行李、房間大小與車站複雜度",
    "還沒決定機場與鐵路動線就先訂房",
  ],
  note: "有名的車站不一定是最好睡的地方。好的東京飯店區域通常能減少轉乘、行李壓力與第一晚的混亂感。",
  roomDateCta: "訂房前確認房間大小與容易變貴的日期",
};
tokyoFirstTimeSupplementCopyByLocale["zh-CN"].earlyDecision = {
  title: "预订东京酒店前",
  body: "先看你的行程如何移动，再比较酒店名称。",
  chips: ["成田或羽田", "搭新干线去京都 / 大阪", "大型行李箱", "夜生活或安静夜晚", "大型车站或更平静的基地"],
  mistakesTitle: "选择东京酒店区域时常见的错误",
  mistakes: [
    "只因为新宿有名就选新宿",
    "只因为浅草看起来传统就选浅草",
    "只因为新干线就选东京站",
    "忽略行李、房间大小和车站复杂度",
    "还没决定机场和铁路动线就先订房",
  ],
  note: "有名的车站不一定是最容易休息的地方。好的东京酒店区域通常能减少换乘、行李压力和第一晚的混乱感。",
  roomDateCta: "订房前确认房间大小和容易变贵的日期",
};
tokyoFirstTimeSupplementCopyByLocale.fr.earlyDecision = {
  title: "Avant de reserver un hotel a Tokyo",
  body: "Commencez par la logique de votre trajet, puis comparez les noms d'hotels.",
  chips: ["Narita ou Haneda", "Kyoto / Osaka en Shinkansen", "Grosses valises", "Vie nocturne ou nuits calmes", "Grande gare ou base plus calme"],
  mistakesTitle: "Erreurs frequentes pour choisir un quartier d'hotel a Tokyo",
  mistakes: [
    "Choisir Shinjuku seulement parce que c'est connu",
    "Choisir Asakusa seulement parce que cela semble traditionnel",
    "Choisir Tokyo Station seulement pour le Shinkansen",
    "Ignorer les bagages, la taille de chambre et la complexite des gares",
    "Reserver avant de decider aeroport et trajets en train",
  ],
  note: "Une gare connue n'est pas toujours l'endroit le plus facile pour dormir. Le bon quartier d'hotel a Tokyo reduit souvent les correspondances, le stress des bagages et la confusion de la premiere nuit.",
  roomDateCta: "Verifier taille de chambre et dates cheres avant de reserver",
};
tokyoFirstTimeSupplementCopyByLocale.de.earlyDecision = {
  title: "Bevor du ein Hotel in Tokio buchst",
  body: "Beginne mit deiner Reiselogik, dann vergleiche Hotelnamen.",
  chips: ["Narita oder Haneda", "Kyoto / Osaka mit Shinkansen", "Grosse Koffer", "Nachtleben oder ruhige Nachte", "Riesiger Bahnhof oder ruhigere Basis"],
  mistakesTitle: "Haufige Fehler bei der Hotelgegend in Tokio",
  mistakes: [
    "Shinjuku nur wahlen, weil es bekannt ist",
    "Asakusa nur wahlen, weil es traditionell wirkt",
    "Tokyo Station nur wegen des Shinkansen wahlen",
    "Gepack, Zimmergrosse und Bahnhofskomplexitat ignorieren",
    "Buchen, bevor Flughafen und Bahnroute klar sind",
  ],
  note: "Ein bekannter Bahnhof ist nicht immer der einfachste Schlafort. Die beste Hotelgegend in Tokio reduziert meist Umstiege, Gepackstress und Verwirrung in der ersten Nacht.",
  roomDateCta: "Zimmergrosse und teure Daten vor dem Buchen prufen",
};
tokyoFirstTimeSupplementCopyByLocale.ru.earlyDecision = {
  title: "Перед бронированием отеля в Токио",
  body: "Сначала разберите логику маршрута, а потом сравнивайте названия отелей.",
  chips: ["Нарита или Ханэда", "Киото / Осака на синкансэне", "Большие чемоданы", "Ночная жизнь или тихие ночи", "Огромная станция или более спокойная база"],
  mistakesTitle: "Частые ошибки при выборе района отеля в Токио",
  mistakes: [
    "Выбирать Синдзюку только потому, что он известен",
    "Выбирать Асакуса только потому, что он выглядит традиционно",
    "Выбирать Tokyo Station только из-за синкансэна",
    "Игнорировать багаж, размер номера и сложность станций",
    "Бронировать до выбора аэропорта и железнодорожных маршрутов",
  ],
  note: "Известная станция не всегда самое простое место для ночлега. Хороший район отеля в Токио обычно уменьшает пересадки, стресс с багажом и путаницу в первую ночь.",
  roomDateCta: "Проверить размер номера и дорогие даты до бронирования",
};

const tokyoMatrixDetailLabelsByLocale: Record<string, string[]> = {
  en: [
    "See Shinjuku micro-area guide",
    "See Ueno micro-area guide",
    "See Asakusa micro-area guide",
    "See Tokyo Station area guide",
    "See East Tokyo area guide",
  ],
  "pt-BR": [
    "Ver microareas de Shinjuku",
    "Ver microareas de Ueno",
    "Ver microareas de Asakusa",
    "Ver guia da area Tokyo Station",
    "Ver guia do leste de Toquio",
  ],
  es: [
    "Ver microzonas de Shinjuku",
    "Ver microzonas de Ueno",
    "Ver microzonas de Asakusa",
    "Ver guia de Tokyo Station",
    "Ver guia del este de Tokio",
  ],
  ko: [
    "신주쿠 세부 지역 가이드 보기",
    "우에노 세부 지역 가이드 보기",
    "아사쿠사 세부 지역 가이드 보기",
    "도쿄역 지역 가이드 보기",
    "동쪽 도쿄 지역 가이드 보기",
  ],
  "zh-TW": [
    "查看新宿細分區域指南",
    "查看上野細分區域指南",
    "查看淺草細分區域指南",
    "查看東京站區域指南",
    "查看東東京區域指南",
  ],
  "zh-CN": [
    "查看新宿细分区域指南",
    "查看上野细分区域指南",
    "查看浅草细分区域指南",
    "查看东京站区域指南",
    "查看东东京区域指南",
  ],
  fr: [
    "Voir les micro-zones de Shinjuku",
    "Voir les micro-zones de Ueno",
    "Voir les micro-zones de Asakusa",
    "Voir le guide Tokyo Station",
    "Voir le guide Est de Tokyo",
  ],
  de: [
    "Shinjuku-Mikrobereiche ansehen",
    "Ueno-Mikrobereiche ansehen",
    "Asakusa-Mikrobereiche ansehen",
    "Guide zu Tokyo Station ansehen",
    "Guide zu Ost-Tokio ansehen",
  ],
  ru: [
    "Открыть микрорайоны Синдзюку",
    "Открыть микрорайоны Уэно",
    "Открыть микрорайоны Асакуса",
    "Открыть гид по Tokyo Station",
    "Открыть гид по Восточному Токио",
  ],
};

function applyStayPageTranslation(page: StayContentPage, translation?: StayPageTranslation): StayContentPage {
  if (!translation) return page;
  return {
    ...page,
    title: translation.title ?? page.title,
    description: translation.description ?? page.description,
    proTip: translation.proTip ?? page.proTip,
    mapDescription: translation.mapDescription ?? page.mapDescription,
    areas: translation.areas
      ? page.areas.map((area, index) => ({
          ...area,
          ...translation.areas?.[index],
          hotelLink: area.hotelLink,
          hotelKey: area.hotelKey,
        }))
      : page.areas,
    comparisonColumns: translation.comparisonColumns ?? page.comparisonColumns,
    comparison: translation.comparison ?? page.comparison,
    hotelPicks: translation.hotelPicks
      ? page.hotelPicks.map((pick, index) => ({
          ...pick,
          ...translation.hotelPicks?.[index],
          link: pick.link,
          trackingHref: pick.trackingHref,
          hotelKey: pick.hotelKey,
          provider: pick.provider,
        }))
      : page.hotelPicks,
    nextActions: translation.nextActions
      ? page.nextActions.map((action, index) => ({
          ...action,
          ...translation.nextActions?.[index],
          href: action.href,
        }))
      : page.nextActions,
    faqs: translation.faqs ?? page.faqs,
    quickRec: {
      ...page.quickRec,
      ...translation.quickRec,
    },
  };
}

const tokyoStayImages = {
  hero: "/images/stay/tokyo/tokyo-stay-hero.png",
  shinjuku: "/images/stay/tokyo/stay-shinjuku.png",
  ueno: "/images/stay/tokyo/stay-ueno.png",
  asakusa: "/images/stay/tokyo/stay-asakusa.png",
  tokyoStation: "/images/stay/tokyo/stay-tokyo-station.png",
  eastTokyo: "/images/stay/tokyo/stay-east-tokyo.png",
};

function publicImageIfExists(src: string) {
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  return fs.existsSync(filePath) ? src : undefined;
}

function providerChoices(...providers: Array<ProviderChoiceButton | null | undefined>) {
  return providers.filter((provider): provider is ProviderChoiceButton => Boolean(provider));
}

function hotelProviderChoices(areaKey: HotelAreaKey, placement: ProviderChoiceButton["placement"]) {
  const hotel = getHotelLink(areaKey);
  const config = getTripHotelConfig(areaKey);
  const tripHref = hotel.provider === "trip" ? hotel.href : config.tripUrl;
  const tripTrackingHref = hotel.provider === "trip" ? hotel.trackingHref : config.tripUrl;
  const agodaLink = getAgodaHotelAreaUrl(areaKey);

  return providerChoices(
    tripHref
      ? {
          label: "Trip.com",
          href: tripHref,
          trackingHref: tripTrackingHref,
          provider: "trip",
          product: "hotel",
          linkId: `hotelArea.${areaKey}.trip`,
          placement,
          variant: "primary",
          category: "hotel",
        }
      : null,
    agodaLink
      ? {
          label: "Agoda",
          href: agodaLink.href,
          trackingHref: agodaLink.trackingHref,
          provider: "agoda",
          product: "hotel",
          linkId: agodaLink.linkId,
          placement,
          variant: "secondary",
          category: "hotel",
        }
      : null,
  );
}

async function TokyoFirstTimeHub({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "tokyoStayHub" });
  const supplement = tokyoFirstTimeSupplementCopyByLocale[locale] ?? tokyoFirstTimeSupplementCopyByLocale.en;
  const pagePath = "/areas-to-stay/tokyo-first-time";
  const esimHref = getAffUrl("esim");
  const heroImage = publicImageIfExists(tokyoStayImages.hero);
  const planCards = (t.raw("travelPlan.cards") as Array<{ label: string; area: string; href: string }>).map((card) => ({
    ...card,
    href: {
      "#shinjuku": "#shinjuku-area",
      "#ueno": "#ueno-area",
      "#tokyo-station": "#tokyo-station-ginza-area",
      "#asakusa": "#asakusa-area",
      "#east-tokyo": "/areas-to-stay/tokyo/east-tokyo",
    }[card.href] ?? card.href,
  }));
  const comparisonHeadings = t.raw("comparison.headings") as string[];
  const comparisonRows = t.raw("comparison.rows") as string[][];
  const faqs = t.raw("faq.items") as Array<{ question: string; answer: string }>;
  const detailLabels = tokyoMatrixDetailLabelsByLocale[locale] ?? tokyoMatrixDetailLabelsByLocale.en;
  const matrixGroups = tokyoHotelBaseMatrixGroups.map((group, index) => {
    const localizedGroup = supplement.matrix.groups[index];
    const detailLabel = detailLabels[index];
    return {
      ...group,
      ...localizedGroup,
      detailLink: group.detailLink
        ? { ...group.detailLink, label: detailLabel ?? localizedGroup?.detailLabel ?? group.detailLink.label }
        : undefined,
      internalLinks: group.internalLinks.map((link, linkIndex) => ({
        ...link,
        label: localizedGroup?.internalLabels[linkIndex] ?? link.label,
      })),
    };
  });

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: t("breadcrumb.parent"), href: "/" },
          { label: t("breadcrumb.current") },
        ]} />

        <section className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt={t("hero.imageAlt")} className="aspect-[16/9] max-h-[420px] w-full object-cover" />
          ) : (
            <div className="h-64 bg-[linear-gradient(135deg,#eef6fb,#fff_50%,#f0fbf6)]" aria-hidden="true" />
          )}
          <div className="p-6 md:p-9">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">{t("hero.eyebrow")}</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              {t("hero.subtitle")}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{supplement.quickAnswerOverride.title}</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <p>{supplement.quickAnswerOverride.intro}</p>
              <ul className="space-y-2">
                {supplement.quickAnswerOverride.bases.map((answer) => (
                  <li key={answer} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#106b43]" aria-hidden="true" />
                    <span>{answer}</span>
                  </li>
                ))}
              </ul>
              <p className="font-semibold text-slate-900">{supplement.quickAnswerOverride.famousStationNote}</p>
              <p>{supplement.quickAnswerOverride.nearbyIntro}</p>
              <p className="font-semibold text-slate-900">{supplement.quickAnswerOverride.nearbyBases}</p>
              <p>{supplement.quickAnswerOverride.matrixNote}</p>
              <TrackedInternalLink
                href="/areas-to-stay/tokyo-stay-area-index"
                sourcePage={pagePath}
                placement="tokyo_first_time_quick_answer_matrix_jump"
                label={supplement.quickAnswerOverride.matrixCta}
                locale={locale}
                className="inline-flex min-h-10 items-center rounded-xl bg-[#168a56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
              >
                {supplement.quickAnswerOverride.matrixCta} →
              </TrackedInternalLink>
              <div className="mt-5 border-t border-emerald-200 pt-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-white/80 p-4">
                    <h3 className="text-base font-semibold text-slate-950">{supplement.earlyDecision.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{supplement.earlyDecision.body}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {supplement.earlyDecision.chips.map((question) => (
                        <span
                          key={question}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#106b43]"
                        >
                          {question}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                    <h3 className="text-base font-semibold text-slate-950">{supplement.earlyDecision.mistakesTitle}</h3>
                    <ul className="mt-3 grid gap-2 text-sm leading-5 text-slate-700">
                      {supplement.earlyDecision.mistakes.map((mistake) => (
                        <li key={mistake} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#106b43]" aria-hidden="true" />
                          <span>{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 p-4">
                  <p className="text-sm font-semibold leading-6 text-slate-900">{supplement.earlyDecision.note}</p>
                  <TrackedInternalLink
                    href="/areas-to-stay/tokyo-first-time#hotel-price-timing"
                    sourcePage={pagePath}
                    placement="tokyo_first_time_quick_answer_matrix_jump"
                    label={supplement.earlyDecision.roomDateCta}
                    locale={locale}
                    className="mt-3 inline-flex min-h-9 items-center rounded-xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                  >
                    {supplement.earlyDecision.roomDateCta} →
                  </TrackedInternalLink>
                </div>
              </div>
            </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-950">{t("travelPlan.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {planCards.map(({ label, area, href }) => (
              <a key={label} href={href} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition-colors hover:bg-slate-50">
                <span className="block text-slate-600">{label}</span>
                <span className="mt-2 block font-semibold text-slate-950">→ {area}</span>
              </a>
            ))}
          </div>
        </section>

        <section id="hotel-base-matrix" className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="max-w-3xl">
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{supplement.matrix.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {supplement.matrix.intro}
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {matrixGroups.map((group) => {
              const hotelProviders = group.hotelAreaKey
                ? hotelProviderChoices(group.hotelAreaKey, "tokyo_first_time_hotel_base_matrix")
                : [];
              const cardImage = group.image ? publicImageIfExists(group.image) : undefined;

              return (
                <article id={group.anchorId} key={group.title} className="flex h-full scroll-mt-24 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50 shadow-sm">
                  {cardImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cardImage}
                      alt={`${group.title} hotel base in Tokyo`}
                      className="aspect-[16/7] w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="flex flex-1 flex-col p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${hotelBaseMatrixToneClasses[group.tone]}`}>
                      {group.categoryLabel}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-950">{group.title}</h3>
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{group.mainBaseLabel}</dt>
                      <dd className="mt-1 font-semibold text-slate-950">{group.mainBase}</dd>
                    </div>
                    {group.nearbyBases ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{group.nearbyLabel}</dt>
                        <dd className="mt-2">
                          <p className="font-semibold text-slate-800">{group.nearbyBases}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {group.nearbyBases.split(" / ").map((base) => (
                              <span key={base} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {base}
                              </span>
                            ))}
                          </div>
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="font-semibold text-slate-900">{supplement.matrix.goodIfLabel}</dt>
                      <dd>{group.goodIf}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate-900">{supplement.matrix.watchOutLabel}</dt>
                      <dd>{group.watchOut}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-4">
                    {hotelProviders.length > 0 && group.hotelActionLabel ? (
                      <ProviderChoiceCTA
                        actionLabel={group.hotelActionLabel}
                        description={supplement.matrix.providerDescription}
                        providers={hotelProviders}
                        pagePath={pagePath}
                        locale={locale}
                        area={group.title}
                        city="Tokyo"
                      />
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.detailLink ? (
                        <TrackedInternalLink
                          href={group.detailLink.href}
                          sourcePage={pagePath}
                          placement="tokyo_first_time_hotel_base_detail"
                          label={group.detailLink.label}
                          locale={locale}
                          className="inline-flex min-h-9 items-center rounded-xl bg-[#168a56] px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
                        >
                          {group.detailLink.label} →
                        </TrackedInternalLink>
                      ) : null}
                      {group.internalLinks.map((link) => (
                        <TrackedInternalLink
                          key={link.href}
                          href={link.href}
                          sourcePage={pagePath}
                          placement="tokyo_first_time_hotel_base_matrix"
                          label={link.label}
                          locale={locale}
                          className="inline-flex min-h-9 items-center rounded-xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                        >
                          {link.label} →
                        </TrackedInternalLink>
                      ))}
                    </div>
                  </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{supplement.commonMistakes.title}</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              {supplement.commonMistakes.items.map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
          <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{supplement.roomSize.title}</h2>
            <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {supplement.roomSize.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </section>

        <section id="hotel-price-timing" className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">
              {supplement.priceTiming.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{supplement.priceTiming.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{supplement.priceTiming.intro}</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {supplement.priceTiming.cards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <h3 className="text-base font-semibold text-slate-950">{supplement.priceTiming.panelTitle}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {supplement.priceTiming.panelItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#106b43]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <TrackedInternalLink
                  href="/areas-to-stay/tokyo-first-time#hotel-base-matrix"
                  sourcePage={pagePath}
                  placement="tokyo_first_time_price_timing"
                  label={supplement.priceTiming.matrixCta}
                  locale={locale}
                  className="inline-flex min-h-10 items-center rounded-xl bg-[#168a56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
                >
                  {supplement.priceTiming.matrixCta}
                </TrackedInternalLink>
                <TrackedInternalLink
                  href="/local-hotel-picks#hotel-examples-matrix"
                  sourcePage={pagePath}
                  placement="tokyo_first_time_price_timing"
                  label={supplement.priceTiming.examplesCta}
                  locale={locale}
                  className="inline-flex min-h-10 items-center rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-[#106b43] transition-colors hover:bg-emerald-50"
                >
                  {supplement.priceTiming.examplesCta}
                </TrackedInternalLink>
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-950">{supplement.priceTiming.sourcesTitle}</h3>
              <div className="mt-3 grid gap-2 text-sm">
                <a
                  href="https://www.japan.travel/en/gc/tips/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#106b43] underline underline-offset-4"
                >
                  JNTO high/low travel seasons
                </a>
                <a
                  href="https://www.japan.travel/en/plan/business-hours-and-holidays/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#106b43] underline underline-offset-4"
                >
                  JNTO business hours and holidays
                </a>
                <a
                  href="https://www.gotokyo.org/en/story/guide/public-holidays/index.html"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#106b43] underline underline-offset-4"
                >
                  Go Tokyo public holidays
                </a>
              </div>
            </aside>
          </div>
        </section>

        <section id="comparison" className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("comparison.title")}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.08em] text-slate-500">
                  {comparisonHeadings.map((heading) => (
                    <th key={heading} className="px-3 py-2 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row[0]} className="border-b border-slate-100 last:border-0">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className={["px-3 py-3 align-top", index === 0 ? "font-semibold text-slate-950" : "text-slate-600"].join(" ")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("faq.title")}</h2>
          <dl className="mt-4 grid gap-3 md:grid-cols-2">
            {faqs.map(({ question, answer }) => (
              <div key={question} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <dt className="font-semibold text-slate-950">{question}</dt>
                <dd className="mt-1 text-sm leading-6 text-slate-600">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">{t("continue.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label={t("continue.plan")} pagePath={pagePath} locale={locale} className={filledNextStepClass}>
              {t("continue.plan")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/jr-pass-vs-single-ticket" placement="next_steps" label={t("continue.jrPass")} pagePath={pagePath} locale={locale} category="rail" className={filledNextStepClass}>
              {t("continue.jrPass")}
            </TrackedCtaLink>
            {esimHref ? (
              <TrackedAffiliateLink href={esimHref} target="_blank" rel={AFFILIATE_REL} category="esim" provider="klook" placement="next_steps" pagePath={pagePath} locale={locale} label={t("continue.esim")} linkId="esim" product="esim" adid="1166001" className={filledCommercialNextStepClass}>
                {t("continue.esim")}
              </TrackedAffiliateLink>
            ) : (
              <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label={t("continue.esim")} pagePath={pagePath} locale={locale} className={filledNextStepClass}>
                {t("continue.esim")}
              </TrackedCtaLink>
            )}
            <TrackedCtaLink href="/airport-transfers" placement="next_steps" label={t("continue.airport")} pagePath={pagePath} locale={locale} category="transfer" className={filledNextStepClass}>
              {t("continue.airport")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/local-hotel-picks" placement="next_steps" label={t("continue.localPicks")} pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              {t("continue.localPicks")}
            </TrackedCtaLink>
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}

type FirstTimeStayArea = {
  id: string;
  name: string;
  bestFor: string;
  watchOut: string;
  transportNote: string;
  hotelKey?: HotelAreaKey;
  actionLabel?: string;
  detailHref?: string;
  detailLabel?: string;
};

type FirstTimeStayHubConfig = {
  slug: string;
  city: string;
  title: string;
  subtitle: string;
  quickAnswer: string[];
  areas: FirstTimeStayArea[];
  comparisonRows: string[][];
};

const firstTimeStayHubs: Record<string, FirstTimeStayHubConfig> = {
  "kyoto-first-time": {
    slug: "kyoto-first-time",
    city: "Kyoto",
    title: "Where to Stay in Kyoto for First-Time Visitors",
    subtitle: "Pick the right Kyoto base before you book. Kyoto Station solves luggage and day trips; Gion and Higashiyama solve atmosphere; Kawaramachi / Shijo keeps food and shopping central.",
    quickAnswer: [
      "Choose Kyoto Station if transport, luggage, and day trips matter most.",
      "Choose Kawaramachi / Shijo if you want food, shopping, and central convenience.",
      "Choose Gion / Higashiyama if temples and traditional Kyoto atmosphere matter most.",
      "Choose Arashiyama for a scenic stay, but expect a less central base.",
      "Choose Kyoto Imperial Palace / quieter north if you want calmer streets on a repeat visit.",
    ],
    areas: [
      {
        id: "kyoto-station",
        name: "Kyoto Station",
        bestFor: "Transport, luggage, day trips.",
        watchOut: "Modern and practical rather than atmospheric.",
        transportNote: "Direct Shinkansen, JR, subway, buses, and Haruka airport train.",
        hotelKey: "kyotoStation",
        actionLabel: "Compare Kyoto Station hotels",
        detailHref: "/areas-to-stay/kyoto-station-vs-gion",
        detailLabel: "See Kyoto Station vs Gion",
      },
      {
        id: "kawaramachi-shijo",
        name: "Kawaramachi / Shijo",
        bestFor: "Food, shopping, central convenience.",
        watchOut: "Less direct for Shinkansen luggage days.",
        transportNote: "Good Hankyu, subway, bus, and taxi access across central Kyoto.",
        hotelKey: "gionKawaramachi",
        actionLabel: "Compare Kawaramachi / Shijo hotels",
        detailHref: "/areas-to-stay/kyoto-station-vs-gion",
        detailLabel: "See Kyoto Station vs Gion",
      },
      {
        id: "gion-higashiyama",
        name: "Gion / Higashiyama",
        bestFor: "Temples, atmosphere, traditional Kyoto.",
        watchOut: "Narrow streets and luggage are less convenient.",
        transportNote: "Best on foot and by taxi; Kyoto Station is usually a bus or taxi ride away.",
        hotelKey: "gionKawaramachi",
        actionLabel: "Compare Gion / Higashiyama hotels",
        detailHref: "/areas-to-stay/kyoto-station-vs-gion",
        detailLabel: "See Kyoto Station vs Gion",
      },
      {
        id: "arashiyama",
        name: "Arashiyama",
        bestFor: "Scenic stays, bamboo grove, riverside walks.",
        watchOut: "Less central for first-time city sightseeing.",
        transportNote: "Useful JR and Hankyu access, but most central Kyoto plans require extra travel.",
      },
      {
        id: "imperial-palace-north",
        name: "Kyoto Imperial Palace / quieter north",
        bestFor: "Calmer repeat visitors.",
        watchOut: "Not the default first-night base for temple-heavy trips.",
        transportNote: "Subway and buses work, but taxis may be useful at night.",
      },
    ],
    comparisonRows: [
      ["Kyoto Station", "Best", "Best", "Practical", "Modern logistics"],
      ["Kawaramachi / Shijo", "Good", "Transfer needed", "Strongest", "Central city"],
      ["Gion / Higashiyama", "Atmospheric", "Taxi/bus needed", "Good but touristy", "Traditional"],
      ["Arashiyama", "Scenic", "Less central", "Limited at night", "Riverside"],
      ["Imperial Palace / north", "Calm", "Moderate", "Quiet", "Residential"],
    ],
  },
  "osaka-first-time": {
    slug: "osaka-first-time",
    city: "Osaka",
    title: "Where to Stay in Osaka for First-Time Visitors",
    subtitle: "Pick the Osaka base by how you will use the city. Namba is easiest for food and nightlife; Umeda is stronger for rail; Shin-Osaka is a logistics choice.",
    quickAnswer: [
      "Choose Namba if food, nightlife, and first-time Osaka energy matter most.",
      "Choose Umeda if rail access, Kyoto / Kobe trips, and airport connections matter most.",
      "Choose Shin-Osaka if Shinkansen logistics are the main priority.",
      "Choose Tennoji if you want value and south Osaka access.",
      "Choose Osaka Castle / quieter central if you want a calmer base.",
    ],
    areas: [
      {
        id: "namba",
        name: "Namba",
        bestFor: "Food, nightlife, first-time Osaka.",
        watchOut: "Can feel busy and loud at night.",
        transportNote: "Strong subway and Nankai access; practical for KIX and Dotonbori.",
        hotelKey: "namba",
        actionLabel: "Compare Namba hotels",
        detailHref: "/areas-to-stay/namba-vs-umeda",
        detailLabel: "See Namba vs Umeda",
      },
      {
        id: "umeda",
        name: "Umeda",
        bestFor: "Rail access, Kyoto / Kobe / airport connections.",
        watchOut: "Less classic Osaka nightlife than Namba.",
        transportNote: "Best for JR, Hankyu, Hanshin, subway, and Kansai rail day trips.",
        hotelKey: "umeda",
        actionLabel: "Compare Umeda hotels",
        detailHref: "/areas-to-stay/namba-vs-umeda",
        detailLabel: "See Namba vs Umeda",
      },
      {
        id: "shin-osaka",
        name: "Shin-Osaka",
        bestFor: "Shinkansen logistics.",
        watchOut: "Not a lively neighborhood base.",
        transportNote: "Direct Shinkansen and subway to central Osaka; useful for early rail days.",
        hotelKey: "shinOsaka",
        actionLabel: "Compare Shin-Osaka hotels",
        detailHref: "/areas-to-stay/shin-osaka-vs-namba",
        detailLabel: "See Shin-Osaka vs Namba",
      },
      {
        id: "tennoji",
        name: "Tennoji",
        bestFor: "Value and south Osaka access.",
        watchOut: "Less central for Kyoto or Kobe day trips.",
        transportNote: "JR and subway access works well for south Osaka, Nara, and KIX routes.",
      },
      {
        id: "osaka-castle",
        name: "Osaka Castle / quieter central",
        bestFor: "Calmer stays.",
        watchOut: "Less food-and-nightlife density than Namba or Umeda.",
        transportNote: "Good if your plans cluster around central Osaka, but check station distance carefully.",
      },
    ],
    comparisonRows: [
      ["Namba", "Good via Nankai", "Transfer to Shin-Osaka", "Strongest", "Food-first"],
      ["Umeda", "Good rail links", "Good via JR/subway", "Strong but polished", "Transport hub"],
      ["Shin-Osaka", "Transfer needed", "Best", "Limited", "Logistics"],
      ["Tennoji", "Good for KIX", "Transfer needed", "Moderate", "Value"],
      ["Osaka Castle / quieter central", "Varies", "Transfer needed", "Calmer", "Central quiet"],
    ],
  },
};

async function FirstTimeStayDecisionHub({ config, locale }: { config: FirstTimeStayHubConfig; locale: string }) {
  const t = await getTranslations({ locale, namespace: `firstTimeStayHubs.${config.slug}` });
  const pagePath = `/areas-to-stay/${config.slug}`;
  const quickAnswer = t.raw("quickAnswer") as string[];
  const comparisonHeadings = t.raw("comparisonHeadings") as string[];
  const comparisonRows = t.raw("comparisonRows") as string[][];
  const localizedAreas = config.areas.map((area) => ({
    ...area,
    ...(t.raw(`areas.${area.id}`) as {
      name: string;
      bestFor: string;
      watchOut: string;
      transportNote: string;
      actionLabel?: string;
      detailLabel?: string;
    }),
  }));

  return (
    <main className="page-shell min-h-screen text-slate-950">
      <SiteHeader />
      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: t("breadcrumb.parent"), href: "/" },
          { label: t("breadcrumb.current") },
        ]} />

        <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#106b43]">{t("hero.eyebrow")}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-slate-950 md:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            {t("hero.subtitle")}
          </p>
        </section>

        <section className="mt-8 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("quickAnswerTitle")}</h2>
          <div className="mt-4 grid gap-2 text-sm leading-6 text-slate-700 md:grid-cols-2">
            {quickAnswer.map((answer) => (
              <p key={answer}>{answer}</p>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("glance.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t("glance.title")}</h2>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {localizedAreas.map((area) => {
              const choices = area.hotelKey ? hotelProviderChoices(area.hotelKey, "stay_area_glance_card") : [];

              return (
                <article key={area.id} id={area.id} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("city")}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{area.name}</h3>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">{t("labels.bestFor")}</p>
                      <p className="mt-1 leading-5 text-slate-700">{area.bestFor}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">{t("labels.watchOut")}</p>
                      <p className="mt-1 leading-5 text-slate-700">{area.watchOut}</p>
                    </div>
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sky-700">{t("labels.transportNote")}</p>
                      <p className="mt-1 leading-5 text-slate-700">{area.transportNote}</p>
                    </div>
                  </div>
                  {choices.length > 0 && area.actionLabel ? (
                    <ProviderChoiceCTA
                      actionLabel={area.actionLabel}
                      providers={choices}
                      pagePath={pagePath}
                      locale={locale}
                      area={`${config.city}: ${area.name}`}
                      city={config.city}
                      className="mt-4"
                    />
                  ) : null}
                  {area.detailHref && area.detailLabel ? (
                    <Link href={area.detailHref} className="mt-4 inline-flex text-sm font-semibold text-[#106b43] underline underline-offset-4">
                      {area.detailLabel}
                    </Link>
                  ) : (
                    <p className="mt-4 text-xs font-semibold text-slate-500">{t("labels.detailGuidePlanned")}</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section id="comparison" className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("comparisonTitle")}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.08em] text-slate-500">
                  {comparisonHeadings.map((heading) => (
                    <th key={heading} className="px-3 py-2 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row[0]} className="border-b border-slate-100 last:border-0">
                    {row.map((cell, index) => (
                      <td key={`${row[0]}-${index}`} className={["px-3 py-3 align-top", index === 0 ? "font-semibold text-slate-950" : "text-slate-600"].join(" ")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-950">{t("continue.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <TrackedCtaLink href="/areas-to-stay" placement="next_steps" label={t("continue.areas")} pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              {t("continue.areas")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/local-hotel-picks" placement="next_steps" label={t("continue.localPicks")} pagePath={pagePath} locale={locale} category="hotel" className={filledNextStepClass}>
              {t("continue.localPicks")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/plan-your-trip" placement="next_steps" label={t("continue.plan")} pagePath={pagePath} locale={locale} className={filledNextStepClass}>
              {t("continue.plan")}
            </TrackedCtaLink>
            <TrackedCtaLink href="/airport-transfers" placement="next_steps" label={t("continue.airport")} pagePath={pagePath} locale={locale} category="transfer" className={filledNextStepClass}>
              {t("continue.airport")}
            </TrackedCtaLink>
          </div>
        </section>
      </Container>
      <SiteFooter />
    </main>
  );
}

export async function generateStaticParams() {
  return getAllStaySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const rawPage = getStayBySlug(slug);
  if (!rawPage) return {};
  const firstTimeStayHub = firstTimeStayHubs[slug];

  if (firstTimeStayHub) {
    const t = await getTranslations({ locale, namespace: `firstTimeStayHubs.${slug}.meta` });
    return {
      title: `${t("title")} | fujiseat`,
      description: t("description"),
      robots: locale === "en" ? undefined : { index: false, follow: true },
      openGraph: {
        title: t("title"),
        description: t("description"),
        siteName: "fujiseat",
      },
      alternates: getAlternates(`/areas-to-stay/${slug}`, locale),
    };
  }

  const stayPagesT = await getTranslations({ locale, namespace: "stayPages" });
  const pageTranslations = stayPagesT.raw("pages") as Record<string, StayPageTranslation>;
  const page = applyStayPageTranslation(rawPage, pageTranslations[slug]);

  return {
    title: `${page.title} | fujiseat`,
    description: page.description,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    openGraph: {
      title: page.title,
      description: page.description,
      siteName: "fujiseat",
    },
    alternates: getAlternates(`/areas-to-stay/${slug}`, locale),
  };
}

export default async function StayPage({ params }: Props) {
  const { slug, locale } = await params;
  const localHotelT = await getTranslations("localHotelPicks");
  const stayPagesT = await getTranslations({ locale, namespace: "stayPages" });
  const stayPagesCommon = stayPagesT.raw("common") as Record<string, string>;
  const pageTranslations = stayPagesT.raw("pages") as Record<string, StayPageTranslation>;
  const rawPage = getStayBySlug(slug);
  if (!rawPage) notFound();
  const page = applyStayPageTranslation(rawPage, pageTranslations[slug]);
  const pagePath = `/areas-to-stay/${slug}`;
  const stayComparisonAdPlacement = stayComparisonAdPlacements[page.slug];

  const isTokyoFirstTime = page.slug === "tokyo-first-time";
  const firstTimeStayHub = firstTimeStayHubs[page.slug];

  if (isTokyoFirstTime) {
    return <TokyoFirstTimeHub locale={locale} />;
  }

  if (firstTimeStayHub) {
    return <FirstTimeStayDecisionHub config={firstTimeStayHub} locale={locale} />;
  }

  return (
    <main className="page-shell min-h-screen text-slate-950">
      {page.faqs && page.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: page.faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            }),
          }}
        />
      )}
      <SiteHeader />

      <Container className="py-8 md:py-12">
        <Breadcrumb items={[
          { label: stayPagesCommon.breadcrumbParent, href: "/" },
          { label: page.title.split("—")[0].trim() },
        ]} />

        <h1 className="mt-4 text-2xl font-semibold text-slate-950 md:text-3xl">
          {page.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
          {page.description}
        </p>

        <div className="mt-8 space-y-8">
          {page.mapId ? (
            <section className="space-y-4">
              <StayAreaMap
                mapId={page.mapId}
                priority={page.slug === "tokyo-first-time"}
              />
              {page.mapDescription && page.mapDescription.length > 0 ? (
                <div className="rounded-[18px] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
                  {page.mapDescription.map((paragraph) => (
                    <p key={paragraph} className="mt-3 first:mt-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          <QuickRec
            area={page.quickRec.area}
            why={page.quickRec.why}
            link={page.quickRec.link}
            locale={locale}
            pagePath={pagePath}
            showCta={!isTokyoFirstTime}
          />

          <section id="areas" className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-slate-950">{stayPagesCommon.areaBreakdownTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">{stayPagesCommon.areaBreakdownSubtitle}</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {page.areas.map((area) => (
                <AreaCard key={area.name} {...area} locale={locale} pagePath={pagePath} showHotelCta={isTokyoFirstTime} />
              ))}
            </div>
          </section>

          <section id="comparison" className="scroll-mt-24">
            <h2 className="mb-4 text-lg font-semibold text-slate-950">{stayPagesCommon.comparisonTitle}</h2>
            <ComparisonTable
              columns={page.comparisonColumns}
              rows={page.comparison}
              highlight={page.quickRec.area}
            />
          </section>

          <ProTip>{page.proTip}</ProTip>

          <section>
            <HotelPicks
              picks={page.hotelPicks}
              locale={locale}
              pagePath={pagePath}
              placement={stayComparisonHotelPickSlugs.has(page.slug) ? "stay_comparison_hotel_pick" : "hotel_pick"}
            />
            <div className="mt-4 rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="text-sm font-semibold text-slate-950">
                {stayPagesCommon.localHotelBoxTitle}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {stayPagesCommon.localHotelBoxBody}
              </p>
              <TrackedCtaLink
                href="/local-hotel-picks"
                placement="stay_detail_local_hotel_picks"
                label={stayPagesCommon.localHotelCtaLabel}
                pagePath={pagePath}
                locale={locale}
                category="hotel"
                className="mt-3 inline-flex rounded-xl border border-[#168a56] bg-[#168a56] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#0f6f45]"
              >
                {localHotelT("seeLocalHotelPicks")}
              </TrackedCtaLink>
            </div>
          </section>

          {stayComparisonAdPlacement ? (
            <AdSlot placement={stayComparisonAdPlacement} format="horizontal" />
          ) : null}

          <NextActions
            picks={page.nextActions}
            title={stayPagesCommon.nextActionsTitle}
            subtitle={stayPagesCommon.nextActionsSubtitle}
            maxItems={3}
            locale={locale}
            pagePath={pagePath}
          />

          {page.faqs && page.faqs.length > 0 && (
            <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-950">{stayPagesCommon.faqTitle}</h2>
              <dl className="mt-4 space-y-4 text-sm">
                {page.faqs.map((item) => (
                  <div key={item.question}>
                    <dt className="font-semibold text-slate-900">{item.question}</dt>
                    <dd className="mt-1 leading-6 text-slate-600">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {(agodaMapIdsByStaySlug[page.slug] ?? []).map((mapId) => (
            <AgodaHotelMap
              key={mapId}
              mapId={mapId}
              placement="stay_area_map"
              locale={locale}
            />
          ))}

          <SuggestedNextSteps currentPageType="stay" locale={locale} excludeTypes={["esim"]} />
        </div>

      </Container>
      <SiteFooter />
    </main>
  );
}
