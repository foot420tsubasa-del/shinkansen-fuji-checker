import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowRight, Clock, Luggage, MapPin, Plane, Train } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SiteHeader } from "../components/SiteHeader";
import { Breadcrumb } from "@/components/content/Breadcrumb";
import { SiteFooter } from "@/components/content/SiteFooter";
import { ProviderChoiceCTA, type ProviderChoiceButton } from "@/components/affiliate/ProviderChoiceCTA";
import { transferPages, type TransferPage } from "@/lib/content/transfers";
import { getAlternates } from "@/i18n/hreflang";
import { AFFILIATE_REL } from "@/lib/link-rel";
import { TrackedAffiliateLink } from "@/components/analytics/TrackedAffiliateLink";
import { TrackedInternalLink } from "@/components/analytics/TrackedInternalLink";
import { ESIM_URL } from "@/src/affiliateLinks";
import { getAirportTransferHubImage, getAirportTransferRouteImage } from "@/lib/airport-transfer-images";
import { getAirportTransferHubCopy, localizedRouteTitle } from "@/lib/content/airport-transfer-i18n";
import { getAgodaHotelAreaUrl, getHotelLink, getTripHotelConfig, type HotelAreaKey } from "@/lib/hotel-links";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const image = getAirportTransferHubImage();
  const copy = getAirportTransferHubCopy(locale);
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    robots: locale === "en" ? undefined : { index: false, follow: true },
    alternates: getAlternates("/airport-transfers", locale),
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      siteName: "fujiseat",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
  };
}

const naritaSlugs = [
  "narita-to-shinjuku",
  "narita-to-tokyo-station",
  "narita-to-ueno",
  "narita-to-shibuya",
  "narita-to-asakusa",
  "narita-to-oshiage",
] as const;
const hanedaSlugs = [
  "haneda-to-shinjuku",
  "haneda-to-asakusa",
  "haneda-to-ueno",
  "haneda-to-tokyo-station",
  "haneda-to-shibuya",
] as const;
const kansaiSlugs = [
  "kansai-airport-to-kyoto",
  "kansai-airport-to-namba",
  "kansai-airport-to-umeda",
  "osaka-to-kansai-airport",
  "kyoto-to-kansai-airport",
] as const;
const lateArrivalSlugs = ["narita-late-arrival", "haneda-late-arrival"] as const;
const pagePath = "/airport-transfers";

type FirstNightHotelArea = {
  title: string;
  goodIf: string;
  avoidIf: string;
  logic: string;
  hotelKey: HotelAreaKey;
};

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

const firstNightHotelAreas: FirstNightHotelArea[] = [
  {
    title: "Ueno",
    goodIf: "Narita arrival, museums, practical rail connections, and a straightforward east-side first night.",
    avoidIf: "You want Shinjuku nightlife or the simplest possible Tokaido Shinkansen morning.",
    logic: "Strong for Narita. Train is enough for many travelers if your hotel is close to the station side you need.",
    hotelKey: "ueno",
  },
  {
    title: "Asakusa",
    goodIf: "Old Tokyo atmosphere, calmer nights, and a slower first evening after landing.",
    avoidIf: "You need JR-centered movement or dislike checking subway exits with luggage.",
    logic: "Works well for east Tokyo arrivals. Check subway line, elevators, and walking distance before booking.",
    hotelKey: "asakusa",
  },
  {
    title: "Tokyo Station / Ginza",
    goodIf: "First/last Tokyo nights, early Shinkansen, and central luggage logistics.",
    avoidIf: "You want a local-feeling night or a softer arrival after a long flight.",
    logic: "Rail-friendly and central. Airport bus or private transfer can be easier if your hotel is not close to a simple station exit.",
    hotelKey: "tokyoStation",
  },
  {
    title: "Shinjuku",
    goodIf: "Food, nightlife, hotel choice, and a big-city first Tokyo night.",
    avoidIf: "You arrive late with kids, several suitcases, or low tolerance for huge stations.",
    logic: "Good once settled, but arrival with luggage can be tiring. Airport bus can be worth comparing.",
    hotelKey: "shinjuku",
  },
];

const firstHotelAreaCopyByLocale: Record<
  string,
  {
    title: string;
    body: string;
    cards: Array<{ title: string; body: string; label: string; href: string }>;
  }
> = {
  en: {
    title: "Choose your first hotel area by arrival airport",
    body:
      "Your first hotel area should match your arrival airport, landing time, luggage, and first-night energy. The fastest train is not always the easiest route with suitcases.",
    cards: [
      { title: "Arriving at Narita", body: "Compare Ueno, Asakusa, Tokyo Station, and Shinjuku.", href: "/areas-to-stay/tokyo-first-time", label: "Choose Narita-friendly hotel area" },
      { title: "Arriving at Haneda", body: "Compare Hamamatsucho, Shinagawa, Tokyo Station, and Shinjuku.", href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "Choose Haneda-friendly hotel area" },
      { title: "Landing late", body: "Check last trains before booking far from the airport.", href: "/airport-transfers/haneda-late-arrival", label: "Check late-arrival routes" },
      { title: "Carrying large luggage", body: "Prioritize direct trains, airport buses, or private transfers.", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Choose luggage-friendly Tokyo base" },
    ],
  },
  "pt-BR": {
    title: "Escolha a primeira area de hotel pelo aeroporto de chegada",
    body: "A primeira area de hotel deve combinar com aeroporto, horario de pouso, bagagem e energia da primeira noite. O trem mais rapido nem sempre e a rota mais facil com malas.",
    cards: [
      { title: "Chegando por Narita", body: "Compare Ueno, Asakusa, Tokyo Station e Shinjuku.", href: "/areas-to-stay/tokyo-first-time", label: "Escolher area boa para Narita" },
      { title: "Chegando por Haneda", body: "Compare Hamamatsucho, Shinagawa, Tokyo Station e Shinjuku.", href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "Escolher area boa para Haneda" },
      { title: "Chegada tarde", body: "Confira os ultimos trens antes de reservar longe do aeroporto.", href: "/airport-transfers/haneda-late-arrival", label: "Ver rotas de chegada tarde" },
      { title: "Com malas grandes", body: "Priorize trens diretos, onibus de aeroporto ou transfer privado.", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Escolher base facil com bagagem" },
    ],
  },
  es: {
    title: "Elige tu primera zona de hotel segun el aeropuerto",
    body: "Tu primera zona de hotel debe encajar con el aeropuerto, la hora de llegada, el equipaje y la energia de la primera noche. El tren mas rapido no siempre es la ruta mas facil con maletas.",
    cards: [
      { title: "Llegas a Narita", body: "Compara Ueno, Asakusa, Tokyo Station y Shinjuku.", href: "/areas-to-stay/tokyo-first-time", label: "Elegir zona comoda para Narita" },
      { title: "Llegas a Haneda", body: "Compara Hamamatsucho, Shinagawa, Tokyo Station y Shinjuku.", href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "Elegir zona comoda para Haneda" },
      { title: "Llegada tarde", body: "Revisa ultimos trenes antes de reservar lejos del aeropuerto.", href: "/airport-transfers/haneda-late-arrival", label: "Ver rutas de llegada tarde" },
      { title: "Con equipaje grande", body: "Prioriza trenes directos, buses de aeropuerto o transfer privado.", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Elegir base facil con equipaje" },
    ],
  },
  ko: {
    title: "도착 공항에 맞춰 첫 호텔 지역 고르기",
    body: "첫 호텔 지역은 도착 공항, 도착 시간, 짐, 첫날 밤의 컨디션과 맞아야 합니다. 여행가방이 있으면 가장 빠른 열차가 항상 가장 쉬운 길은 아닙니다.",
    cards: [
      { title: "나리타 도착", body: "우에노, 아사쿠사, 도쿄역, 신주쿠를 비교하세요.", href: "/areas-to-stay/tokyo-first-time", label: "나리타에 편한 호텔 지역 선택" },
      { title: "하네다 도착", body: "하마마쓰초, 시나가와, 도쿄역, 신주쿠를 비교하세요.", href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "하네다에 편한 호텔 지역 선택" },
      { title: "늦은 도착", body: "공항에서 먼 호텔을 예약하기 전에 막차를 확인하세요.", href: "/airport-transfers/haneda-late-arrival", label: "늦은 도착 경로 확인" },
      { title: "큰 짐이 있음", body: "직통 열차, 공항 버스, 프라이빗 이동을 우선하세요.", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "짐에 편한 도쿄 거점 선택" },
    ],
  },
  "zh-TW": {
    title: "依抵達機場選擇第一晚飯店區域",
    body: "第一晚飯店區域應該配合抵達機場、落地時間、行李與第一晚體力。帶行李箱時，最快的列車不一定是最輕鬆的路線。",
    cards: [
      { title: "抵達成田", body: "比較上野、淺草、東京站與新宿。", href: "/areas-to-stay/tokyo-first-time", label: "選擇適合成田的飯店區域" },
      { title: "抵達羽田", body: "比較濱松町、品川、東京站與新宿。", href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "選擇適合羽田的飯店區域" },
      { title: "深夜抵達", body: "訂離機場遠的飯店前，先確認末班車。", href: "/airport-transfers/haneda-late-arrival", label: "查看深夜抵達路線" },
      { title: "攜帶大型行李", body: "優先考慮直達列車、機場巴士或包車接送。", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "選擇行李友善的東京基地" },
    ],
  },
  "zh-CN": {
    title: "按抵达机场选择第一晚酒店区域",
    body: "第一晚酒店区域应该配合抵达机场、落地时间、行李和第一晚体力。带行李箱时，最快的列车不一定是最轻松的路线。",
    cards: [
      { title: "抵达成田", body: "比较上野、浅草、东京站和新宿。", href: "/areas-to-stay/tokyo-first-time", label: "选择适合成田的酒店区域" },
      { title: "抵达羽田", body: "比较滨松町、品川、东京站和新宿。", href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "选择适合羽田的酒店区域" },
      { title: "深夜抵达", body: "预订离机场远的酒店前，先确认末班车。", href: "/airport-transfers/haneda-late-arrival", label: "查看深夜抵达路线" },
      { title: "携带大型行李", body: "优先考虑直达列车、机场巴士或包车接送。", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "选择行李友好的东京基地" },
    ],
  },
  fr: {
    title: "Choisir votre premier quartier d'hotel selon l'aeroport",
    body: "Votre premier quartier d'hotel doit correspondre a l'aeroport, l'heure d'arrivee, les bagages et l'energie de la premiere nuit. Le train le plus rapide n'est pas toujours le plus simple avec des valises.",
    cards: [
      { title: "Arrivee a Narita", body: "Comparez Ueno, Asakusa, Tokyo Station et Shinjuku.", href: "/areas-to-stay/tokyo-first-time", label: "Choisir un quartier pratique pour Narita" },
      { title: "Arrivee a Haneda", body: "Comparez Hamamatsucho, Shinagawa, Tokyo Station et Shinjuku.", href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "Choisir un quartier pratique pour Haneda" },
      { title: "Arrivee tardive", body: "Verifiez les derniers trains avant de reserver loin de l'aeroport.", href: "/airport-transfers/haneda-late-arrival", label: "Voir les trajets tardifs" },
      { title: "Grosses valises", body: "Priorisez trains directs, bus aeroport ou transfert prive.", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Choisir une base facile avec bagages" },
    ],
  },
  de: {
    title: "Erste Hotelgegend nach Ankunftsflughafen wahlen",
    body: "Deine erste Hotelgegend sollte zu Flughafen, Landezeit, Gepack und Energie am ersten Abend passen. Der schnellste Zug ist mit Koffern nicht immer der einfachste Weg.",
    cards: [
      { title: "Ankunft in Narita", body: "Vergleiche Ueno, Asakusa, Tokyo Station und Shinjuku.", href: "/areas-to-stay/tokyo-first-time", label: "Narita-freundliche Hotelgegend wahlen" },
      { title: "Ankunft in Haneda", body: "Vergleiche Hamamatsucho, Shinagawa, Tokyo Station und Shinjuku.", href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "Haneda-freundliche Hotelgegend wahlen" },
      { title: "Spate Ankunft", body: "Prufe letzte Zuge, bevor du weit vom Flughafen buchst.", href: "/airport-transfers/haneda-late-arrival", label: "Spatankunft-Routen ansehen" },
      { title: "Viel Gepack", body: "Priorisiere Direktzuge, Flughafenbusse oder private Transfers.", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Gepackfreundliche Tokio-Basis wahlen" },
    ],
  },
  ru: {
    title: "Выберите первый район отеля по аэропорту прилета",
    body: "Первый район отеля должен соответствовать аэропорту, времени прилета, багажу и силам в первую ночь. Самый быстрый поезд не всегда самый простой маршрут с чемоданами.",
    cards: [
      { title: "Прилет в Нариту", body: "Сравните Уэно, Асакуса, Tokyo Station и Синдзюку.", href: "/areas-to-stay/tokyo-first-time", label: "Выбрать район, удобный для Нариты" },
      { title: "Прилет в Ханэду", body: "Сравните Hamamatsucho, Shinagawa, Tokyo Station и Синдзюку.", href: "/areas-to-stay/tokyo-first-time#hotel-base-matrix", label: "Выбрать район, удобный для Ханэды" },
      { title: "Поздний прилет", body: "Проверьте последние поезда перед бронированием далеко от аэропорта.", href: "/airport-transfers/haneda-late-arrival", label: "Проверить поздние маршруты" },
      { title: "Большой багаж", body: "Сначала смотрите прямые поезда, автобусы аэропорта или частный трансфер.", href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Выбрать базу в Токио с багажом" },
    ],
  },
};

const transferTogetherCopyByLocale: Record<string, { title: string; body: string }> = {
  en: {
    title: "Choose the hotel area and transfer together",
    body:
      "Airport transfer is not only about the fastest train. Your first hotel area, luggage, arrival time, and station exits can change the easiest route. If you arrive late or carry large suitcases, choose the transfer and hotel area together.",
  },
  "pt-BR": {
    title: "Escolha a area do hotel e o traslado juntos",
    body: "Traslado de aeroporto nao e so o trem mais rapido. A primeira area de hotel, bagagem, horario de chegada e saidas da estacao podem mudar a rota mais facil. Se voce chega tarde ou leva malas grandes, escolha traslado e area do hotel juntos.",
  },
  es: {
    title: "Elige juntos la zona de hotel y el traslado",
    body: "El traslado desde el aeropuerto no es solo el tren mas rapido. La primera zona de hotel, el equipaje, la hora de llegada y las salidas de la estacion pueden cambiar la ruta mas facil. Si llegas tarde o llevas maletas grandes, elige traslado y zona de hotel juntos.",
  },
  ko: {
    title: "호텔 지역과 공항 이동을 함께 고르기",
    body: "공항 이동은 가장 빠른 열차만의 문제가 아닙니다. 첫 호텔 지역, 짐, 도착 시간, 역 출구가 가장 쉬운 동선을 바꿀 수 있습니다. 늦게 도착하거나 큰 여행가방이 있다면 이동 방법과 호텔 지역을 함께 정하세요.",
  },
  "zh-TW": {
    title: "飯店區域與機場交通一起決定",
    body: "機場交通不只是最快的列車。第一晚飯店區域、行李、抵達時間與車站出口，都可能改變最輕鬆的路線。如果深夜抵達或帶大型行李，請一起選擇交通與飯店區域。",
  },
  "zh-CN": {
    title: "酒店区域与机场交通一起决定",
    body: "机场交通不只是最快的列车。第一晚酒店区域、行李、抵达时间和车站出口，都可能改变最轻松的路线。如果深夜抵达或带大型行李，请一起选择交通和酒店区域。",
  },
  fr: {
    title: "Choisir ensemble le quartier d'hotel et le transfert",
    body: "Le transfert aeroport ne se resume pas au train le plus rapide. Le premier quartier d'hotel, les bagages, l'heure d'arrivee et les sorties de gare peuvent changer le trajet le plus simple. Si vous arrivez tard ou avec de grosses valises, choisissez transfert et quartier ensemble.",
  },
  de: {
    title: "Hotelgegend und Transfer zusammen wahlen",
    body: "Beim Flughafentransfer geht es nicht nur um den schnellsten Zug. Erste Hotelgegend, Gepack, Ankunftszeit und Bahnhofsausgange konnen den einfachsten Weg verandern. Wenn du spat ankommst oder grosse Koffer hast, wahle Transfer und Hotelgegend zusammen.",
  },
  ru: {
    title: "Выбирайте район отеля и трансфер вместе",
    body: "Трансфер из аэропорта — это не только самый быстрый поезд. Первый район отеля, багаж, время прилета и выходы со станции могут изменить самый простой маршрут. Если вы прилетаете поздно или с большими чемоданами, выбирайте трансфер и район отеля вместе.",
  },
};

function orderedPages(slugs: readonly string[]): TransferPage[] {
  return slugs
    .map((slug) => transferPages.find((page) => page.slug === slug))
    .filter((page): page is TransferPage => Boolean(page));
}

function RouteTextLink({
  page,
  locale,
  placement,
}: {
  page: TransferPage;
  locale: string;
  placement: string;
}) {
  return (
    <TrackedInternalLink
      href={`/airport-transfers/${page.slug}`}
      sourcePage={pagePath}
      placement={placement}
      label={localizedRouteTitle(page, locale)}
      locale={locale}
      className="inline-flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
    >
      <span>{page.from} → {page.to}</span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
    </TrackedInternalLink>
  );
}

function AirportCard({
  title,
  body,
  image,
  imageAlt,
  pages,
  locale,
}: {
  title: string;
  body: string;
  image?: string;
  imageAlt: string;
  pages: TransferPage[];
  locale: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {image ? (
        <div className="relative aspect-[16/9] w-full">
          <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-sky-50">
          <Plane className="h-10 w-10 text-sky-300" />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        <div className="mt-4 grid gap-2">
          {pages.map((page) => (
            <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickAnswerCard({
  title,
  copy,
  href,
  label,
  locale,
}: {
  title: string;
  copy: string;
  href: string;
  label: string;
  locale: string;
}) {
  return (
    <TrackedInternalLink
      href={href}
      sourcePage={pagePath}
      placement="airport_hub_quick_answer"
      label={label}
      locale={locale}
      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50"
    >
      <p className="text-sm font-bold text-slate-950">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-slate-600">{copy}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700">
        {label} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </TrackedInternalLink>
  );
}

function ProblemCard({
  icon,
  title,
  body,
  href,
  label,
  locale,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href: string;
  label: string;
  locale: string;
}) {
  return (
    <TrackedInternalLink
      href={href}
      sourcePage={pagePath}
      placement="airport_hub_problem_card"
      label={label}
      locale={locale}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">{icon}</div>
        <div>
          <p className="text-sm font-bold text-slate-950">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
          <span className="mt-2 inline-flex text-xs font-semibold text-slate-700">{label} →</span>
        </div>
      </div>
    </TrackedInternalLink>
  );
}

export default async function AirportTransfersIndex({ params }: Props) {
  const { locale } = await params;
  const copy = getAirportTransferHubCopy(locale);
  const firstHotelAreaCopy = firstHotelAreaCopyByLocale[locale] ?? firstHotelAreaCopyByLocale.en;
  const transferTogetherCopy = transferTogetherCopyByLocale[locale] ?? transferTogetherCopyByLocale.en;
  const heroImage = getAirportTransferHubImage();
  const naritaImage = getAirportTransferRouteImage("narita");
  const hanedaImage = getAirportTransferRouteImage("haneda");
  const kansaiImage = getAirportTransferRouteImage("kansai-airport");
  const naritaPages = orderedPages(naritaSlugs);
  const hanedaPages = orderedPages(hanedaSlugs);
  const kansaiPages = orderedPages(kansaiSlugs);
  const lateArrivalPages = orderedPages(lateArrivalSlugs);

  return (
    <main className="page-shell min-h-screen text-slate-950">
    <SiteHeader />
    <Container className="py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: copy.breadcrumbHome, href: "/" },
          { label: copy.breadcrumbCurrent },
        ]}
      />

      <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {heroImage ? (
          <div className="relative aspect-[21/9] max-h-[360px] min-h-[180px] w-full">
            <Image src={heroImage} alt={copy.heroImageAlt} fill priority sizes="(min-width: 768px) 1180px, 100vw" className="object-cover" />
          </div>
        ) : (
          <div className="flex aspect-[21/9] max-h-[360px] min-h-[180px] items-center justify-center bg-gradient-to-br from-sky-50 to-emerald-50">
            <Plane className="h-12 w-12 text-sky-300" />
          </div>
        )}
        <div className="p-5 md:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
            {copy.heroLabel}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            {copy.heroBody}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <TrackedInternalLink
              href="#tokyo-airport-routes"
              sourcePage={pagePath}
              placement="airport_hub_hero"
              label={copy.heroPrimary}
              locale={locale}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#168a56] bg-[#168a56] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6f45]"
            >
              {copy.heroPrimary}
            </TrackedInternalLink>
            <TrackedInternalLink
              href="#kansai-airport-routes"
              sourcePage={pagePath}
              placement="airport_hub_hero"
              label={copy.heroSecondary}
              locale={locale}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#082653] bg-[#082653] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#061d40]"
            >
              {copy.heroSecondary}
            </TrackedInternalLink>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[22px] border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">{transferTogetherCopy.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">{transferTogetherCopy.body}</p>
      </section>

      <section className="mt-8 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-slate-950">{firstHotelAreaCopy.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{firstHotelAreaCopy.body}</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {firstHotelAreaCopy.cards.map((item) => (
            <TrackedInternalLink
              key={item.title}
              href={item.href}
              sourcePage={pagePath}
              placement="airport_hub_problem_card"
              label={item.label}
              locale={locale}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors hover:border-sky-200 hover:bg-sky-50"
            >
              <p className="text-sm font-bold text-slate-950">{item.title}</p>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">{item.body}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-sky-700">
                {item.label} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </TrackedInternalLink>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#106b43]">First-night hotel base</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">Best first-night hotel areas for Tokyo arrivals</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Choose the hotel base with the transfer. Train is enough for many travelers, while airport bus or private transfer may be better for late arrival, kids, or heavy luggage.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {firstNightHotelAreas.map((area) => {
            const choices = hotelProviderChoices(area.hotelKey, "airport_page_first_night_cta");
            return (
              <article key={area.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-lg font-semibold text-slate-950">{area.title}</h3>
                <dl className="mt-3 grid gap-2 text-sm leading-6">
                  <div>
                    <dt className="font-semibold text-[#106b43]">Good if</dt>
                    <dd className="text-slate-700">{area.goodIf}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-amber-700">Who should avoid it</dt>
                    <dd className="text-slate-700">{area.avoidIf}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Airport / luggage logic</dt>
                    <dd className="text-slate-700">{area.logic}</dd>
                  </div>
                </dl>
                <ProviderChoiceCTA
                  actionLabel={`Compare hotels in ${area.title}`}
                  description="Broad area search only. Check exact station distance, room size, bed setup, and latest price on the provider site."
                  providers={choices}
                  pagePath={pagePath}
                  locale={locale}
                  area={area.title}
                  city="Tokyo"
                  className="mt-4"
                />
              </article>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { href: "/areas-to-stay/tokyo-stay-area-index", label: "Open Tokyo Hotel Area Finder" },
            { href: "/areas-to-stay/tokyo-first-time", label: "Tokyo first-time hotel base guide" },
            { href: "/areas-to-stay/where-to-stay-in-tokyo-with-luggage", label: "Choose a luggage-friendly Tokyo base" },
            { href: "/local-hotel-picks#hotel-examples-matrix", label: "Local hotel examples" },
          ].map((link) => (
            <TrackedInternalLink
              key={link.href}
              href={link.href}
              sourcePage={pagePath}
              placement="airport_page_first_night_cta"
              label={link.label}
              locale={locale}
              className="inline-flex min-h-9 items-center rounded-xl bg-slate-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
            >
              {link.label} →
            </TrackedInternalLink>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.quickLabel}</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">{copy.quickTitle}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <QuickAnswerCard
            title={copy.quickAnswers[0].title}
            copy={copy.quickAnswers[0].copy}
            href="/airport-transfers/narita-to-shinjuku"
            label={copy.quickAnswers[0].label}
            locale={locale}
          />
          <QuickAnswerCard
            title={copy.quickAnswers[1].title}
            copy={copy.quickAnswers[1].copy}
            href="/airport-transfers/narita-to-ueno"
            label={copy.quickAnswers[1].label}
            locale={locale}
          />
          <QuickAnswerCard
            title={copy.quickAnswers[2].title}
            copy={copy.quickAnswers[2].copy}
            href="/areas-to-stay/where-to-stay-before-shinkansen"
            label={copy.quickAnswers[2].label}
            locale={locale}
          />
          <QuickAnswerCard
            title={copy.quickAnswers[3].title}
            copy={copy.quickAnswers[3].copy}
            href="/airport-transfers/narita-late-arrival"
            label={copy.quickAnswers[3].label}
            locale={locale}
          />
        </div>
      </section>

      <section id="tokyo-airport-routes" className="mt-12 scroll-mt-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">{copy.chooseLabel}</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{copy.chooseTitle}</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <AirportCard
            title={copy.airportCards.narita.title}
            body={copy.airportCards.narita.body}
            image={naritaImage}
            imageAlt={copy.airportCards.narita.imageAlt}
            pages={naritaPages.filter((page) => ["narita-to-shinjuku", "narita-to-tokyo-station", "narita-to-ueno", "narita-to-asakusa"].includes(page.slug))}
            locale={locale}
          />
          <AirportCard
            title={copy.airportCards.haneda.title}
            body={copy.airportCards.haneda.body}
            image={hanedaImage}
            imageAlt={copy.airportCards.haneda.imageAlt}
            pages={hanedaPages.filter((page) => ["haneda-to-shinjuku", "haneda-to-tokyo-station", "haneda-to-asakusa", "haneda-to-ueno"].includes(page.slug))}
            locale={locale}
          />
          <div id="kansai-airport-routes" className="scroll-mt-24">
            <AirportCard
              title={copy.airportCards.kansai.title}
              body={copy.airportCards.kansai.body}
              image={kansaiImage}
              imageAlt={copy.airportCards.kansai.imageAlt}
              pages={kansaiPages.filter((page) => ["kansai-airport-to-kyoto", "kansai-airport-to-namba", "kansai-airport-to-umeda"].includes(page.slug))}
              locale={locale}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.problemLabel}</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">{copy.problemTitle}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <ProblemCard icon={<Luggage className="h-4 w-4" />} title={copy.problems[0].title} body={copy.problems[0].body} href="/airport-transfers/narita-to-shinjuku" label={copy.problems[0].label} locale={locale} />
          <ProblemCard icon={<Clock className="h-4 w-4" />} title={copy.problems[1].title} body={copy.problems[1].body} href="/airport-transfers/haneda-late-arrival" label={copy.problems[1].label} locale={locale} />
          <ProblemCard icon={<MapPin className="h-4 w-4" />} title={copy.problems[2].title} body={copy.problems[2].body} href="/areas-to-stay/tokyo-first-time" label={copy.problems[2].label} locale={locale} />
          <ProblemCard icon={<Train className="h-4 w-4" />} title={copy.problems[3].title} body={copy.problems[3].body} href="/airport-transfers/kansai-airport-to-kyoto" label={copy.problems[3].label} locale={locale} />
          <ProblemCard icon={<MapPin className="h-4 w-4" />} title={copy.problems[4].title} body={copy.problems[4].body} href="/airport-transfers/kansai-airport-to-namba" label={copy.problems[4].label} locale={locale} />
          <ProblemCard icon={<Train className="h-4 w-4" />} title={copy.problems[5].title} body={copy.problems[5].body} href="/areas-to-stay/where-to-stay-before-shinkansen" label={copy.problems[5].label} locale={locale} />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.allRoutesLabel}</p>
        <h2 className="mt-2 text-lg font-bold text-slate-950">{copy.allRoutesTitle}</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Narita</h3>
            <div className="mt-2 grid gap-2">
              {naritaPages.map((page) => <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Haneda</h3>
            <div className="mt-2 grid gap-2">
              {hanedaPages.map((page) => <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Kansai</h3>
            <div className="mt-2 grid gap-2">
              {kansaiPages.map((page) => <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{copy.lateArrival}</h3>
            <div className="mt-2 grid gap-2">
              {lateArrivalPages.map((page) => <RouteTextLink key={page.slug} page={page} locale={locale} placement="airport_hub_airport_card" />)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.continueLabel}</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <TrackedInternalLink href="/areas-to-stay" sourcePage={pagePath} placement="airport_hub_continue_planning" label={copy.continueCards[0].title} locale={locale} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            {copy.continueCards[0].title} <span className="mt-1 block text-xs font-normal text-slate-500">{copy.continueCards[0].body}</span>
          </TrackedInternalLink>
          <TrackedAffiliateLink href={ESIM_URL} target="_blank" rel={AFFILIATE_REL} category="esim" provider="klook" placement="airport_hub_continue_planning" pagePath={pagePath} locale={locale} label={copy.continueCards[1].title} linkId="esim" product="esim" className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            {copy.continueCards[1].title} <span className="mt-1 block text-xs font-normal text-slate-500">{copy.continueCards[1].body}</span>
          </TrackedAffiliateLink>
          <TrackedInternalLink href="/guide" sourcePage={pagePath} placement="airport_hub_continue_planning" label={copy.continueCards[2].title} locale={locale} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            {copy.continueCards[2].title} <span className="mt-1 block text-xs font-normal text-slate-500">{copy.continueCards[2].body}</span>
          </TrackedInternalLink>
          <TrackedInternalLink href="/itineraries/7-day-first-time-japan" sourcePage={pagePath} placement="airport_hub_continue_planning" label={copy.continueCards[3].title} locale={locale} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50">
            {copy.continueCards[3].title} <span className="mt-1 block text-xs font-normal text-slate-500">{copy.continueCards[3].body}</span>
          </TrackedInternalLink>
        </div>
      </section>

    </Container>
    <SiteFooter />
    </main>
  );
}
