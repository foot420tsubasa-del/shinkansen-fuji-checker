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
import { StayBaseCard } from "@/components/affiliate/StayBaseCard";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { getAllStaySlugs, getStayBySlug, type StayPage as StayContentPage } from "@/lib/content/stay";
import { getAlternates } from "@/i18n/hreflang";
import { getAffUrl } from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { getAgodaHotelAreaUrl, getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";
import { buttonClassName } from "@/components/ui/Button";

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
  title: string;
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
  internalLinks: Array<{
    label: string;
    href: string;
  }>;
};

const tokyoHotelBaseMatrixGroups: TokyoHotelBaseMatrixGroup[] = [
  {
    title: "Shinjuku area",
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
    internalLinks: [{ label: "Compare Shinjuku vs Ueno", href: "/areas-to-stay/ueno-vs-shinjuku" }],
  },
  {
    title: "Ueno area",
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
    internalLinks: [
      { label: "Compare Ueno vs Shinjuku", href: "/areas-to-stay/ueno-vs-shinjuku" },
      { label: "Compare Asakusa vs Ueno", href: "/areas-to-stay/asakusa-vs-ueno" },
    ],
  },
  {
    title: "Asakusa area",
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
    internalLinks: [{ label: "Compare Asakusa vs Ueno", href: "/areas-to-stay/asakusa-vs-ueno" }],
  },
  {
    title: "Tokyo Station / Ginza area",
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
    internalLinks: [{ label: "Where to stay before Shinkansen", href: "/areas-to-stay/where-to-stay-before-shinkansen" }],
  },
  {
    title: "Central balance area",
    categoryLabel: "Calm central",
    tone: "calm",
    mainBaseLabel: "Main bases",
    mainBase: "Akasaka / Akasaka-mitsuke / Suitengumae / Ningyocho",
    goodIf: "Central Tokyo balance, calmer nights, airport bus / T-CAT, and Nihombashi access.",
    watchOut: "Less famous for first-time visitors; routing depends on subway or bus.",
    internalLinks: [
      { label: "Use the Tokyo first-time guide", href: "/areas-to-stay/tokyo-first-time" },
      { label: "Choose by luggage / airport logic", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage" },
    ],
  },
  {
    title: "Airport / logistics area",
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
};

const tokyoFirstTimeSupplementCopyByLocale: Record<string, TokyoFirstTimeSupplementCopy> = {
  en: {
    matrix: {
      eyebrow: "Hotel base decision",
      title: "Tokyo hotel base matrix",
      intro:
        "Compare famous stations, calmer nearby bases, and logistics-friendly hotel areas before you search hotels. This is a general starting point, not traveler-specific advice.",
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
          internalLabels: ["Where to stay before Shinkansen"],
        },
        {
          title: "Central balance area",
          categoryLabel: "Calm central",
          mainBaseLabel: "Main bases",
          goodIf: "Central Tokyo balance, calmer nights, airport bus / T-CAT, and Nihombashi access.",
          watchOut: "Less famous for first-time visitors; routing depends on subway or bus.",
          internalLabels: ["Use the Tokyo first-time guide", "Choose by luggage / airport logic"],
        },
        {
          title: "Airport / logistics area",
          categoryLabel: "Airport + rail",
          mainBaseLabel: "Main bases",
          goodIf: "Haneda, Shinkansen, first/last night, and luggage-heavy travel.",
          watchOut: "Businesslike and less atmospheric.",
          internalLabels: ["See Shinkansen-friendly stays", "Check airport transfer"],
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

tokyoFirstTimeSupplementCopyByLocale.es.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "Este de Tokio / lado Tokyo Station", bestFor: "Noches mas tranquilas, logistica desde Haneda o Narita y calles mas faciles que los grandes hubs.", watchOut: "Menos vida nocturna que Shinjuku y menos iconos obvios de primer viaje fuera del hotel.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "Centro de Tokio", bestFor: "Comida, acceso en metro y una base nocturna mas controlada que las zonas mas concurridas.", watchOut: "Menos directo para mananas de Shinkansen que alojarse cerca de Tokyo Station.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "Asakusa / Este de Tokio", bestFor: "Cafes, tiendas de diseno, calles mas calmas y acceso al viejo Tokio sin dormir en los bloques mas turisticos.", watchOut: "Algunas rutas de aeropuerto o Shinkansen pueden necesitar un transbordo extra.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "Lado Tokyo Station", bestFor: "Shinkansen temprano, equipaje y una base de negocios mas tranquila cerca de rutas centrales.", watchOut: "Menos energia local de noche que Shinjuku, Ueno o Asakusa.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "Lado Ueno", bestFor: "Acceso a Narita, busquedas de hotel de mejor valor y comida practica en el corredor de Ueno.", watchOut: "Elige con cuidado si quieres vida nocturna o una primera noche mas pulida.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "Lado Shinjuku", bestFor: "Comodidad de Shinjuku con mas probabilidad de noches tranquilas que los bloques mas ruidosos.", watchOut: "La distancia a pie y las salidas importan porque Shinjuku sigue siendo enorme.", href: "/areas-to-stay/tokyo/shinjuku" },
];

tokyoFirstTimeSupplementCopyByLocale.ko.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "동쪽 도쿄 / 도쿄역 쪽", bestFor: "조용한 밤, 하네다 또는 나리타 동선, 큰 허브보다 걷기 쉬운 거리.", watchOut: "신주쿠보다 밤문화가 적고 호텔 밖 첫 여행 명소가 덜 뚜렷합니다.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "도쿄 중심부", bestFor: "음식, 지하철 접근, 가장 붐비는 역 주변보다 안정적인 밤 거점.", watchOut: "도쿄역 근처보다 신칸센 아침 동선은 덜 직접적입니다.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "아사쿠사 / 동쪽 도쿄", bestFor: "카페, 디자인 숍, 조용한 거리, 가장 관광객 많은 블록 밖의 옛 도쿄 접근.", watchOut: "공항이나 신칸센 동선에 환승이 하나 더 필요할 수 있습니다.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "도쿄역 쪽", bestFor: "이른 신칸센, 짐 이동, 중앙 철도 동선 근처의 조용한 비즈니스 거점.", watchOut: "신주쿠, 우에노, 아사쿠사보다 밤의 현지 에너지는 적습니다.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "우에노 쪽", bestFor: "나리타 접근, 더 나은 가격대의 호텔 검색, 우에노 축의 실용적인 식사.", watchOut: "밤문화나 세련된 첫날 느낌을 원하면 신중히 고르세요.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "신주쿠 쪽", bestFor: "신주쿠 편리함을 유지하면서 가장 시끄러운 동쪽 블록보다 조용한 밤을 기대할 때.", watchOut: "신주쿠는 여전히 크므로 도보 거리와 역 출구가 중요합니다.", href: "/areas-to-stay/tokyo/shinjuku" },
];

tokyoFirstTimeSupplementCopyByLocale["zh-TW"].nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "東東京 / 東京站側", bestFor: "較安靜的夜晚、羽田或成田動線，以及比大型樞紐更好走的街道。", watchOut: "夜生活少於新宿，飯店外的第一次東京地標也較不明顯。", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "東京中心", bestFor: "餐飲、地鐵交通，以及比最繁忙車站區更可控的夜晚基地。", watchOut: "新幹線早晨動線不如住在東京站附近直接。", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "淺草 / 東東京", bestFor: "咖啡館、設計小店、安靜街道，以及不用住在最觀光街區也能接近老東京。", watchOut: "部分機場或新幹線路線可能需要多一次轉乘。", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "東京站側", bestFor: "早班新幹線、行李動線，以及靠近中央鐵道路線的較安靜商務基地。", watchOut: "夜晚地方感少於新宿、上野或淺草。", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "上野側", bestFor: "成田交通、較有價值感的飯店搜尋，以及上野走廊周邊實用餐飲。", watchOut: "若想要夜生活或精緻第一晚，請仔細挑選。", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "新宿側", bestFor: "保留新宿便利，同時比最吵的東側街區更可能有安靜夜晚。", watchOut: "新宿規模仍大，步行距離與車站出口很重要。", href: "/areas-to-stay/tokyo/shinjuku" },
];

tokyoFirstTimeSupplementCopyByLocale["zh-CN"].nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "东东京 / 东京站侧", bestFor: "较安静的夜晚、羽田或成田动线，以及比大型枢纽更好走的街道。", watchOut: "夜生活少于新宿，酒店外的第一次东京地标也较不明显。", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "东京中心", bestFor: "餐饮、地铁交通，以及比最繁忙车站区更可控的夜晚基地。", watchOut: "新干线早晨动线不如住在东京站附近直接。", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "浅草 / 东东京", bestFor: "咖啡馆、设计小店、安静街道，以及不用住在最观光街区也能接近老东京。", watchOut: "部分机场或新干线路线可能需要多一次换乘。", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "东京站侧", bestFor: "早班新干线、行李动线，以及靠近中央铁路路线的较安静商务基地。", watchOut: "夜晚地方感少于新宿、上野或浅草。", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "上野侧", bestFor: "成田交通、较有性价比的酒店搜索，以及上野走廊周边实用餐饮。", watchOut: "若想要夜生活或精致第一晚，请仔细挑选。", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "新宿侧", bestFor: "保留新宿便利，同时比最吵的东侧街区更可能有安静夜晚。", watchOut: "新宿规模仍大，步行距离与车站出口很重要。", href: "/areas-to-stay/tokyo/shinjuku" },
];

tokyoFirstTimeSupplementCopyByLocale.fr.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "Est de Tokyo / cote Tokyo Station", bestFor: "Nuits plus calmes, logistique Haneda ou Narita et rues plus faciles que les grands hubs.", watchOut: "Moins de vie nocturne que Shinjuku et moins de reperes evidents de premier sejour hors de l'hotel.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "Centre de Tokyo", bestFor: "Restaurants, acces metro et base de nuit plus controlee que les zones les plus chargees.", watchOut: "Moins direct pour les matins Shinkansen que pres de Tokyo Station.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "Asakusa / Est de Tokyo", bestFor: "Cafes, boutiques de design, rues calmes et acces au vieux Tokyo sans dormir dans les blocs les plus touristiques.", watchOut: "Certains trajets aeroport ou Shinkansen peuvent demander une correspondance de plus.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "Cote Tokyo Station", bestFor: "Shinkansen tot, bagages et base business plus calme pres des lignes centrales.", watchOut: "Moins d'energie locale le soir que Shinjuku, Ueno ou Asakusa.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "Cote Ueno", bestFor: "Acces Narita, recherche d'hotels bon rapport qualite-prix et repas pratiques autour du corridor Ueno.", watchOut: "Choisissez avec soin si vous voulez de la vie nocturne ou une premiere nuit plus raffinee.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "Cote Shinjuku", bestFor: "Confort de Shinjuku avec plus de chances de nuits calmes que les blocs est les plus bruyants.", watchOut: "La distance a pied et les sorties comptent, car Shinjuku reste immense.", href: "/areas-to-stay/tokyo/shinjuku" },
];

tokyoFirstTimeSupplementCopyByLocale.de.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "Ost-Tokio / Seite Tokyo Station", bestFor: "Ruhigere Nachte, Haneda- oder Narita-Logistik und einfachere Strassen als die grossen Hubs.", watchOut: "Weniger Nachtleben als Shinjuku und weniger offensichtliche Erstbesucher-Orte direkt am Hotel.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "Zentrales Tokio", bestFor: "Essen, U-Bahn-Zugang und kontrolliertere Nachtbasis als die vollsten Bahnhofsgebiete.", watchOut: "Fur Shinkansen-Morgen weniger direkt als nahe Tokyo Station.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "Asakusa / Ost-Tokio", bestFor: "Cafes, Designshops, ruhigere Strassen und Alt-Tokio-Zugang ohne die touristischsten Blocks.", watchOut: "Einige Flughafen- oder Shinkansen-Routen brauchen eventuell einen Umstieg mehr.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "Seite Tokyo Station", bestFor: "Fruher Shinkansen, Gepacklogistik und ruhigere Business-Basis nahe zentralen Bahnlinien.", watchOut: "Weniger lokale Abendenergie als Shinjuku, Ueno oder Asakusa.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "Seite Ueno", bestFor: "Narita-Zugang, bessere Hotelsuche nach Wert und praktische Essensoptionen im Ueno-Korridor.", watchOut: "Sorgfaltig wahlen, wenn du Nachtleben oder ein polierteres Ankunftsgefuhl willst.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "Seite Shinjuku", bestFor: "Shinjuku-Komfort mit besserer Chance auf ruhige Nachte als in den lautesten Ost-Blocks.", watchOut: "Fusswege und Bahnhofsausgange zahlen, weil Shinjuku weiterhin gross ist.", href: "/areas-to-stay/tokyo/shinjuku" },
];

tokyoFirstTimeSupplementCopyByLocale.ru.nearby.items = [
  { name: "Suitengumae / Ningyocho", broadBase: "Восточный Токио / сторона Tokyo Station", bestFor: "Более тихие ночи, логистика Ханэда или Нарита и улицы проще, чем у крупных узлов.", watchOut: "Меньше ночной жизни, чем в Синдзюку, и меньше очевидных мест первого визита рядом с отелем.", href: "/areas-to-stay/tokyo/east-tokyo" },
  { name: "Akasaka / Akasaka-mitsuke", broadBase: "Центр Токио", bestFor: "Еда, метро и более спокойная ночная база, чем самые загруженные районы станций.", watchOut: "Менее прямой вариант для утреннего синкансэна, чем район Tokyo Station.", href: "/areas-to-stay/tokyo-first-time" },
  { name: "Kuramae / Tawaramachi", broadBase: "Асакуса / Восточный Токио", bestFor: "Кафе, дизайн-магазины, спокойные улицы и доступ к старому Токио без самых туристических кварталов.", watchOut: "Для некоторых маршрутов из аэропорта или к синкансэну может понадобиться лишняя пересадка.", href: "/areas-to-stay/tokyo/asakusa" },
  { name: "Hatchobori / Kyobashi / Nihombashi", broadBase: "Сторона Tokyo Station", bestFor: "Ранний синкансэн, багаж и более спокойная деловая база рядом с центральными линиями.", watchOut: "Меньше местной вечерней энергии, чем в Синдзюку, Уэно или Асакуса.", href: "/areas-to-stay/tokyo/tokyo-station" },
  { name: "Nippori / Okachimachi", broadBase: "Сторона Уэно", bestFor: "Доступ к Нарите, поиск отелей с лучшей ценностью и практичная еда вокруг коридора Уэно.", watchOut: "Выбирайте внимательно, если нужны ночная жизнь или более аккуратное первое впечатление.", href: "/areas-to-stay/tokyo/ueno" },
  { name: "Nishi-Shinjuku / Yoyogi / Shinjuku-Gyoenmae", broadBase: "Сторона Синдзюку", bestFor: "Удобство Синдзюку с большей вероятностью тихих ночей, чем в самых шумных восточных кварталах.", watchOut: "Пешая дистанция и выходы станции важны, потому что Синдзюку все равно очень большой.", href: "/areas-to-stay/tokyo/shinjuku" },
];

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
  const cardConfigs = [
    {
      key: "shinjuku",
      area: "Tokyo: Shinjuku",
      image: publicImageIfExists(tokyoStayImages.shinjuku),
      providerChoices: hotelProviderChoices("shinjuku", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/shinjuku",
    },
    {
      key: "ueno",
      area: "Tokyo: Ueno",
      image: publicImageIfExists(tokyoStayImages.ueno),
      providerChoices: hotelProviderChoices("ueno", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/ueno",
    },
    {
      key: "asakusa",
      area: "Tokyo: Asakusa",
      image: publicImageIfExists(tokyoStayImages.asakusa),
      providerChoices: hotelProviderChoices("asakusa", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/asakusa",
    },
    {
      key: "tokyoStation",
      area: "Tokyo: Tokyo Station",
      image: publicImageIfExists(tokyoStayImages.tokyoStation),
      providerChoices: hotelProviderChoices("tokyoStation", "stay_area_glance_card"),
      detailHref: "/areas-to-stay/tokyo/tokyo-station",
    },
    {
      key: "eastTokyo",
      area: "Tokyo: East Tokyo",
      image: publicImageIfExists(tokyoStayImages.eastTokyo),
      providerChoices: providerChoices({
        label: t("cards.eastTokyo.primaryAction"),
        internalLink: "/local-tokyo",
        provider: "other",
        product: "hotel",
        placement: "stay_area_glance_card",
        variant: "primary",
        category: "hotel",
      }),
      detailHref: "/areas-to-stay/tokyo/east-tokyo",
    },
  ];
  const cards = cardConfigs.map((card) => ({
    ...card,
    title: t(`cards.${card.key}.title`),
    subtitle: t(`cards.${card.key}.subtitle`),
    bestFor: t(`cards.${card.key}.bestFor`),
    weakness: t(`cards.${card.key}.weakness`),
    primaryAction: t(`cards.${card.key}.primaryAction`),
  }));

  const quickAnswers = t.raw("quickAnswer.items") as string[];
  const planCards = t.raw("travelPlan.cards") as Array<{ label: string; area: string; href: string }>;
  const benefits = t.raw("benefits.items") as Array<{ title: string; body: string }>;
  const comparisonHeadings = t.raw("comparison.headings") as string[];
  const comparisonRows = t.raw("comparison.rows") as string[][];
  const faqs = t.raw("faq.items") as Array<{ question: string; answer: string }>;
  const matrixGroups = tokyoHotelBaseMatrixGroups.map((group, index) => {
    const localizedGroup = supplement.matrix.groups[index];
    return {
      ...group,
      ...localizedGroup,
      internalLinks: group.internalLinks.map((link, linkIndex) => ({
        ...link,
        label: localizedGroup?.internalLabels[linkIndex] ?? link.label,
      })),
    };
  });
  const nearbyBases = supplement.nearby.items;

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

        <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-950">{t("quickAnswer.title")}</h2>
            <div className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
              {quickAnswers.map((answer) => <p key={answer}>{answer}</p>)}
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
            <ProviderChoiceCTA
              actionLabel={t("quickAnswer.cta")}
              providers={hotelProviderChoices("shinjuku", "stay_quick_answer")}
              pagePath={pagePath}
              locale={locale}
              area="Tokyo: Shinjuku"
            />
            <TrackedCtaLink
              href="/local-hotel-picks"
              placement="stay_quick_answer"
              label={t("quickAnswer.secondaryCta")}
              pagePath={pagePath}
              locale={locale}
              category="hotel"
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#168a56] bg-[#168a56] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f6f45]"
            >
              {t("quickAnswer.secondaryCta")}
            </TrackedCtaLink>
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">{supplement.matrix.eyebrow}</p>
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

              return (
                <article key={group.title} className="flex h-full flex-col rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-sm">
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
                        <dd className="mt-1 text-slate-700">{group.nearbyBases}</dd>
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
                      {group.internalLinks.map((link) => (
                        <TrackedInternalLink
                          key={link.href}
                          href={link.href}
                          sourcePage={pagePath}
                          placement="tokyo_first_time_hotel_base_matrix"
                          label={link.label}
                          locale={locale}
                          className="inline-flex min-h-9 items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#106b43] transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                        >
                          {link.label} →
                        </TrackedInternalLink>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#106b43]">{t("glance.eyebrow")}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{t("glance.title")}</h2>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            {cards.map((card) => (
              <StayBaseCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                bestFor={card.bestFor}
                weakness={card.weakness}
                image={card.image ? { src: card.image, alt: t("glance.cardImageAlt", { area: card.title }) } : undefined}
                area={card.area}
                primaryAction={card.primaryAction}
                providerChoices={card.providerChoices}
                secondaryInternalLink={{ href: card.detailHref, label: t("glance.detailLabel") }}
                placement="stay_area_glance_card"
                pagePath={pagePath}
                locale={locale}
              />
            ))}
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

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">{supplement.nearby.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">{supplement.nearby.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {supplement.nearby.intro}
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nearbyBases.map((base) => (
              <article key={base.name} className="flex h-full flex-col rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-base font-semibold text-slate-950">{base.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{base.broadBase}</p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <p><span className="font-semibold text-slate-900">{supplement.nearby.goodIfLabel}</span> {base.bestFor}</p>
                  <p><span className="font-semibold text-slate-900">{supplement.nearby.watchOutLabel}</span> {base.watchOut}</p>
                </div>
                <Link
                  href={base.href}
                  className="mt-4 inline-flex text-sm font-semibold text-[#106b43] underline underline-offset-4"
                >
                  {supplement.nearby.compareLabel} →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">{supplement.framework.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {supplement.framework.body}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <TrackedInternalLink
              href="/areas-to-stay/tokyo-hotel-room-size-guide"
              sourcePage={pagePath}
              placement="tokyo_first_time_tokyo_pack"
              label="Tokyo hotel room size guide"
              locale={locale}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              {supplement.framework.roomSize} →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/areas-to-stay/where-to-stay-in-tokyo-with-luggage"
              sourcePage={pagePath}
              placement="tokyo_first_time_tokyo_pack"
              label="Tokyo with luggage guide"
              locale={locale}
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-white"
            >
              {supplement.framework.luggage} →
            </TrackedInternalLink>
            <TrackedInternalLink
              href="/areas-to-stay"
              sourcePage={pagePath}
              placement="tokyo_first_time_tokyo_pack"
              label="Japan stay area hub"
              locale={locale}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-[#106b43] transition-colors hover:bg-white"
            >
              {supplement.framework.stayHub} →
            </TrackedInternalLink>
          </div>
        </section>

        <section className="mt-10 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">{t("benefits.title")}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {benefits.map(({ title, body }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{body}</p>
              </div>
            ))}
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
