"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Car,
  ExternalLink,
  Train,
  ArrowRight,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "@/components/content/SiteFooter";
import Image from "next/image";
import { SeatCheckerPanel } from "@/components/travel/SeatCheckerPanel";
import { SeatMapCard } from "@/components/travel/SeatResultCard";
import { trackAffiliateClick, trackCtaClick, trackEvent, trackSeatCheckComplete } from "@/lib/analytics";
import {
  type DirectionId,
  type FujiVisibility,
  getSeatRecommendation,
} from "@/lib/seat-checker";
import {
  JR_PASS_URL,
  OMIO_SHINKANSEN_URL,
  SHINKANSEN_TICKET_URL,
} from "@/src/affiliateLinks";
import { AFFILIATE_REL } from "@/lib/link-rel";

const JR_CENTRAL_SOURCE_URL =
  "https://recommend.jr-central.co.jp/shizuoka-tabi/articles/01/";

const image2Placeholder = (name: string) => `/design-home-assets/${name}`;

type PopularLink = {
  label: string;
  href: string;
  icon: typeof Train;
};

const homeHotelCopyByLocale: Record<
  string,
  {
    title: string;
    body: string;
    links: Array<{ href: string; label: string; variant?: "primary" | "secondary" }>;
    imageNote: string;
  }
> = {
  en: {
    title: "Tokyo hotel base",
    body:
      "Choose your Tokyo hotel base before booking hotels. Your hotel area affects airport arrival, luggage, Shinkansen days, and how busy your nights feel.",
    links: [
      { href: "/areas-to-stay/tokyo-hotels", label: "Tokyo hotels by area", variant: "primary" },
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "Compare Tokyo station areas", variant: "secondary" },
    ],
    imageNote: "Use fujiseat to choose the broad hotel area first, then check current prices, room size, bed setup, and station distance on booking sites.",
  },
  "pt-BR": {
    title: "Escolha onde ficar antes de comparar hotéis",
    body: "Comece pela sua base em Tóquio, não pelos nomes dos hotéis. A melhor área depende de aeroporto, bagagem, dias de Shinkansen, estações grandes e noites agitadas ou mais calmas.",
    links: [
      { href: "/areas-to-stay/tokyo-hotels", label: "Hotéis em Tóquio por área", variant: "primary" },
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "Comparar áreas de Tóquio", variant: "secondary" },
    ],
    imageNote: "Compare estações famosas, bases próximas mais calmas e áreas práticas antes de buscar hotéis.",
  },
  es: {
    title: "Elige dónde alojarte antes de comparar hoteles",
    body: "Empieza por tu base en Tokio, no por nombres de hoteles. La mejor zona depende del aeropuerto, equipaje, días de Shinkansen, estaciones grandes y noches animadas o tranquilas.",
    links: [
      { href: "/areas-to-stay/tokyo-hotels", label: "Hoteles en Tokio por zona", variant: "primary" },
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "Comparar zonas de Tokio", variant: "secondary" },
    ],
    imageNote: "Compara estaciones famosas, bases cercanas más tranquilas y zonas logísticas antes de buscar hoteles.",
  },
  ko: {
    title: "호텔을 비교하기 전에 묵을 지역부터 고르기",
    body: "호텔 이름보다 도쿄 거점부터 정하세요. 좋은 지역은 공항 접근, 짐, 신칸센 일정, 큰 역의 복잡도, 활기찬 밤 또는 조용한 밤에 따라 달라집니다.",
    links: [
      { href: "/areas-to-stay/tokyo-hotels", label: "지역별 도쿄 호텔", variant: "primary" },
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "도쿄 숙소 지역 비교하기", variant: "secondary" },
    ],
    imageNote: "호텔을 찾기 전에 유명 역, 더 차분한 인근 거점, 이동에 편한 지역을 비교하세요.",
  },
  "zh-TW": {
    title: "比較飯店前，先選住宿區域",
    body: "先從東京住宿基地開始，不要先看飯店名稱。適合的區域取決於機場交通、行李、新幹線日程、車站複雜度，以及你想要熱鬧或安靜的夜晚。",
    links: [
      { href: "/areas-to-stay/tokyo-hotels", label: "依區域選東京飯店", variant: "primary" },
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "比較東京住宿區域", variant: "secondary" },
    ],
    imageNote: "搜尋飯店前，先比較知名車站、較安靜的附近基地與動線友善區域。",
  },
  "zh-CN": {
    title: "比较酒店前，先选择住宿区域",
    body: "先从东京住宿基地开始，不要先看酒店名称。适合的区域取决于机场交通、行李、新干线日程、车站复杂度，以及你想要热闹或安静的夜晚。",
    links: [
      { href: "/areas-to-stay/tokyo-hotels", label: "按区域选东京酒店", variant: "primary" },
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "比较东京住宿区域", variant: "secondary" },
    ],
    imageNote: "搜索酒店前，先比较知名车站、较安静的附近基地和动线友好区域。",
  },
  fr: {
    title: "Choisissez où dormir avant de comparer les hôtels",
    body: "Commencez par votre base à Tokyo, pas par les noms d'hôtels. Le bon quartier dépend de l'aéroport, des bagages, du Shinkansen, des grandes gares et de nuits animées ou plus calmes.",
    links: [
      { href: "/areas-to-stay/tokyo-hotels", label: "Hôtels de Tokyo par quartier", variant: "primary" },
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "Comparer les quartiers de Tokyo", variant: "secondary" },
    ],
    imageNote: "Comparez gares connues, bases plus calmes et quartiers pratiques avant de chercher des hôtels.",
  },
  de: {
    title: "Erst die Hotelgegend wählen, dann Hotels vergleichen",
    body: "Beginne mit deiner Tokio-Basis, nicht mit Hotelnamen. Die beste Gegend hängt von Flughafen, Gepäck, Shinkansen-Tagen, großen Bahnhöfen und lebhaften oder ruhigeren Nächten ab.",
    links: [
      { href: "/areas-to-stay/tokyo-hotels", label: "Tokio-Hotels nach Gebiet", variant: "primary" },
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "Tokio-Hotelgegenden vergleichen", variant: "secondary" },
    ],
    imageNote: "Vergleiche bekannte Bahnhöfe, ruhigere nahe Basen und logistische Gegenden, bevor du Hotels suchst.",
  },
  ru: {
    title: "Сначала выберите район, потом сравнивайте отели",
    body: "Начните с базы в Токио, а не с названий отелей. Подходящий район зависит от аэропорта, багажа, синкансэна, сложности станций и того, нужны ли вам оживленные или спокойные ночи.",
    links: [
      { href: "/areas-to-stay/tokyo-hotels", label: "Отели Токио по районам", variant: "primary" },
      { href: "/areas-to-stay/tokyo-stay-area-index", label: "Сравнить районы Токио", variant: "secondary" },
    ],
    imageNote: "Сравните известные станции, более спокойные соседние базы и удобные районы до поиска отелей.",
  },
};

function Header() {
  return <SiteHeader />;
}

function SmartLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel={AFFILIATE_REL} className={className}>
        {children}
      </a>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function SectionTitle({
  eyebrow,
  description,
  centered = false,
}: {
  eyebrow: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={["mb-5", centered ? "text-center" : ""].join(" ")}>
      <p className="text-sm font-black uppercase tracking-[0.12em] text-[#082653]">
        {eyebrow}
      </p>
      {description && (
        <p className={["mt-2 text-sm leading-6 text-[#5f7190]", centered ? "mx-auto max-w-2xl" : "max-w-2xl"].join(" ")}>
          {description}
        </p>
      )}
    </div>
  );
}

export default function HomeClient() {
  const t = useTranslations("home");
  const locale = useLocale();
  const homeHotelCopy = homeHotelCopyByLocale[locale] ?? homeHotelCopyByLocale.en;
  const [direction, setDirection] = useState<DirectionId>("tokyo-osaka");
  const [hasChecked, setHasChecked] = useState(false);
  const [visData, setVisData] = useState<FujiVisibility | null>(null);
  const [visLoading, setVisLoading] = useState(true);
  const [visSlowLoading, setVisSlowLoading] = useState(false);
  const [visError, setVisError] = useState(false);

  const popularLinks: PopularLink[] = useMemo(() => [
    { label: "Seat E guide", href: "/guide#seat-e", icon: Train },
    { label: "Seat letters A-E", href: "/shinkansen-seat-letters", icon: Train },
    { label: "All seat guides", href: "/shinkansen-seat-guides", icon: Train },
  ], []);

  const omioRouteCompareHref = OMIO_SHINKANSEN_URL;

  useEffect(() => {
    const fetchVisibility = async () => {
      const startedAt = performance.now();
      let slowTimer: ReturnType<typeof setTimeout> | undefined;
      try {
        setVisLoading(true);
        setVisSlowLoading(false);
        setVisError(false);
        slowTimer = setTimeout(() => setVisSlowLoading(true), 3000);
        const res = await fetch("/api/fuji-visibility");
        if (!res.ok) throw new Error("Failed to fetch visibility");
        const json = await res.json();
        setVisData({
          visibility: json.visibility,
          cloudPercent: json.cloudPercent,
          message: json.message,
        });
      } catch {
        setVisError(true);
      } finally {
        if (slowTimer) clearTimeout(slowTimer);
        setVisLoading(false);
        const elapsedMs = Math.round(performance.now() - startedAt);
        trackEvent({
          action: "fuji_visibility_load_time",
          category: "weather",
          value: elapsedMs,
        });
      }
    };
    fetchVisibility();
  }, []);

  const recommendation = useMemo(() => getSeatRecommendation(direction), [direction]);
  const currentDirectionLabel =
    direction === "tokyo-osaka" ? t("dirToOsaka") : t("dirToTokyo");

  const handleDirectionChange = (nextDirection: DirectionId) => {
    setDirection(nextDirection);
    setHasChecked(false);
  };

  return (
    <main className="page-shell min-h-screen text-[#102748]">
      <Header />

      <section className="relative min-h-[410px] overflow-hidden bg-[#e8f3fb] md:min-h-[430px]">
        <Image
          className="absolute inset-0 h-full w-full object-cover object-[66%_center] opacity-90 md:object-center md:opacity-100"
          src={image2Placeholder("home-hero-train-fuji.png")}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#fff_0%,rgba(255,255,255,0.94)_62%,rgba(255,255,255,0.18)_100%),linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.32)_100%)] md:bg-[linear-gradient(90deg,#fff_0%,#fff_43%,rgba(255,255,255,0.92)_55%,rgba(255,255,255,0.24)_65%,rgba(255,255,255,0.02)_78%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.23)_100%)]" />
        <div className="relative z-10 mx-auto max-w-[1180px] px-5 py-14 md:px-7 md:py-[72px] md:pb-[48px]">
          <div className="max-w-[700px]">
            <p className="mb-4 inline-flex rounded-full border border-[#d9e5f2] bg-[#f4f9ff] px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#145aa0]">
              {t("nav.hub")}
            </p>
            <h1 className="font-serif text-[35px] font-bold leading-[1.03] tracking-[-0.02em] text-[#082653] sm:text-[42px] md:text-[58px] md:leading-[0.98] md:tracking-[-0.035em]">
              {t("brandTitle").split("\n").map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-[560px] text-lg leading-8 text-[#263a5d] md:text-xl">
              {t("brandSubtitle")}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1180px] px-5 md:px-7">
        <section id="seat-checker" className="scroll-mt-28 py-10">
          <SectionTitle
            eyebrow="Fuji-side seat checker"
            description="Choose your direction and check the Mt. Fuji-side seat."
          />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_410px]">
            <SeatCheckerPanel
              direction={direction}
              onDirectionChange={handleDirectionChange}
              onCheck={() => {
                setHasChecked(true);
                trackSeatCheckComplete({
                  direction,
                  route: direction,
                  result_seat: recommendation.standardWindowSeat,
                  result_side: recommendation.sideLabel,
                  locale,
                });
              }}
              visibility={visData}
              visibilityLoading={visLoading}
              visibilitySlowLoading={visSlowLoading}
              visibilityError={visError}
            />
            <SeatMapCard
              recommendation={recommendation}
              directionLabel={currentDirectionLabel}
              highlighted={hasChecked}
            />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-slate-400">
            {t("brandSource")}{" "}
            <a href={JR_CENTRAL_SOURCE_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-600 underline underline-offset-2">
              [view source]
            </a>
            {" · "}
            {t("brandDisclaimer")}
          </p>
          <div className="mt-5 rounded-2xl border border-[#d9e5f2] bg-white p-4 shadow-[0_10px_25px_rgba(8,38,83,0.07)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f7190]">After checking your seat</p>
            <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-3">
              <div className="flex h-full flex-col rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
                <p className="text-sm font-bold text-[#082653]">Book Shinkansen ticket</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Choose Seat E if available, then book the simple Tokyo to Kyoto / Osaka ticket.
                </p>
                <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row">
                  <a
                    href={SHINKANSEN_TICKET_URL}
                    target="_blank"
                    rel={AFFILIATE_REL}
                    onClick={() => trackAffiliateClick({
                      category: "train",
                      provider: "klook",
                      placement: "home_seat_result",
                      href: SHINKANSEN_TICKET_URL,
                      label: "Book Shinkansen ticket",
                      link_id: "shinkansenTicket",
                      product: "shinkansen_ticket",
                      adid: "1265303",
                      locale,
                    })}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D94A32] bg-[#D94A32] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#bf3d28]"
                  >
                    <Train className="h-3.5 w-3.5" />
                    Klook
                  </a>
                  {omioRouteCompareHref ? (
                    <a
                      href={omioRouteCompareHref}
                      target="_blank"
                      rel={AFFILIATE_REL}
                      onClick={() => trackAffiliateClick({
                        category: "train",
                        provider: "omio",
                        placement: "home_seat_result",
                        href: omioRouteCompareHref,
                        label: "Still planning? Compare routes on Omio",
                        link_id: "omioShinkansen",
                        product: "route_compare",
                        route_type: "route-comparison",
                        locale,
                      })}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#2563EB] bg-white px-3 py-2 text-xs font-bold text-[#0B3A75] shadow-sm shadow-blue-100/70 transition-colors hover:border-[#1D4ED8] hover:bg-[#F0F6FF]"
                    >
                      Omio
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-bold text-[#082653]">Compare JR Pass</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Use this if your route includes Hiroshima, multiple long JR rides, or a return to Tokyo.
                </p>
                <div className="mt-auto pt-3">
                  <a
                    href={JR_PASS_URL}
                    target="_blank"
                    rel={AFFILIATE_REL}
                    onClick={() => trackAffiliateClick({
                      category: "train",
                      provider: "klook",
                      placement: "home_seat_result",
                      href: JR_PASS_URL,
                      label: "Check JR Pass options",
                      link_id: "jrPass",
                      product: "jr_pass",
                      adid: "1165791",
                      locale,
                    })}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#D94A32] bg-[#D94A32] px-3 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#bf3d28]"
                  >
                    <Train className="h-3.5 w-3.5" />
                    Klook
                  </a>
                </div>
              </div>
              <TrackedCtaLink
                href="/airport-transfers"
                placement="home_seat_result"
                label="Get eSIM / airport transfer"
                category="transfer"
                ctaType="transfer"
                pagePath="/"
                locale={locale}
                className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3 transition-colors hover:bg-sky-50"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#082653]">
                  <Car className="h-3.5 w-3.5 text-[#145aa0]" />
                  Get eSIM / airport transfer
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-600">
                  Sort your first arrival route, then prepare data for maps, translation, and transit apps.
                </span>
                <span className="mt-2 inline-flex text-xs font-bold text-[#145aa0]">Plan arrival essentials →</span>
              </TrackedCtaLink>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f7190]">More seat guides</p>
              <div className="mt-2 flex flex-wrap gap-2">
              {popularLinks.map((link, index) => {
                const Icon = link.icon;
                const content = (
                  <>
                    <Icon className="h-3 w-3" />
                    {link.label}
                  </>
                );
                return (
                  <SmartLink
                    key={link.label}
                    href={link.href}
                    className={[
                      "inline-flex min-h-8 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-extrabold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15803d]",
                      index === 0
                        ? "border-[#15803d] bg-[#15803d] text-white hover:border-[#166534] hover:bg-[#166534]"
                        : "border-[#86efac] bg-white text-[#166534] hover:border-[#22c55e] hover:bg-[#f0fdf4] hover:text-[#14532d]",
                    ].join(" ")}
                  >
                    {content}
                  </SmartLink>
                );
              })}
              </div>
            </div>
          </div>
        </section>

        {/* §6 (redesign spec §2): the "decision flow" strip — the five travel
            decisions in the order the trip actually happens, each linking to
            the tool or guide that answers it. Sits below the hero + seat
            checker, which stay untouched. */}
        <section className="py-7">
          <SectionTitle
            eyebrow={t("decisionFlow.eyebrow")}
            description={t("decisionFlow.body")}
          />
          <h2 className="sr-only">{t("decisionFlow.title")}</h2>
          <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {([
              { href: "/plan-your-trip", placement: "home_decision_flow_arrival" },
              { href: "/airport-transfers", placement: "home_decision_flow_transfer" },
              { href: "/areas-to-stay/tokyo-stay-area-index", placement: "home_decision_flow_stay" },
              { href: "/jr-pass-vs-single-ticket", placement: "home_decision_flow_ticket" },
              { href: "/#seat-checker", placement: "home_decision_flow_seat" },
            ] as const).map((step, index) => (
              <li key={step.href} className="h-full">
                <Link
                  href={step.href}
                  onClick={() =>
                    trackCtaClick({
                      placement: step.placement,
                      href: step.href,
                      label: t(`decisionFlow.steps.${index}.title`),
                      category: "navigation",
                      locale,
                    })
                  }
                  className="flex h-full flex-col rounded-2xl border border-[#d9e5f2] bg-white p-4 shadow-[0_10px_25px_rgba(8,38,83,0.06)] transition-colors hover:border-[#2E7D5B] hover:bg-[#f0fbf6]"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#082653] text-xs font-black text-[#f6c343]">
                    {index + 1}
                  </span>
                  <span className="mt-2.5 text-sm font-bold text-[#082653]">
                    {t(`decisionFlow.steps.${index}.title`)}
                  </span>
                  <span className="mt-1 text-xs leading-5 text-[#5f7190]">
                    {t(`decisionFlow.steps.${index}.desc`)}
                  </span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-semibold text-[#106b43]">
                    {t(`decisionFlow.steps.${index}.cta`)}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-7">
          <div className="overflow-hidden rounded-[18px] border border-emerald-100 bg-emerald-50/70 p-5 shadow-[0_10px_25px_rgba(8,38,83,0.06)] md:grid md:grid-cols-[minmax(0,1fr)_240px] md:items-center md:gap-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#106b43]">
                Tokyo hotel base
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#082653]">{homeHotelCopy.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f7190]">{homeHotelCopy.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {homeHotelCopy.links.map((link) => {
                  const isSecondary = link.variant === "secondary";
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() =>
                        trackCtaClick({
                          placement: "home_hotel_base_click",
                          href: link.href,
                          label: link.label,
                          category: "stay",
                          locale,
                        })
                      }
                      className={
                        isSecondary
                          ? "inline-flex min-h-11 items-center justify-center rounded-xl border border-[#082653]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#082653] transition-colors hover:bg-[#eef2f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082653]"
                          : "inline-flex min-h-11 items-center justify-center rounded-xl bg-[#082653] px-5 py-2.5 text-sm font-bold text-[#f6c343] shadow-sm transition-colors hover:bg-[#123967] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#082653]"
                      }
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="mt-5 md:mt-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm">
                <Image
                  src="/images/home/tokyo-hotel-base.png"
                  alt="Luggage near a Tokyo station hotel area"
                  fill
                  sizes="(min-width: 768px) 240px, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-600">
                {homeHotelCopy.imageNote}
              </p>
            </div>
          </div>
        </section>

        <section className="py-7">
          <SectionTitle
            eyebrow={t("supportTools.eyebrow")}
            description={t("supportTools.description")}
          />
          <div className="grid gap-3 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-center">
            <Link
              href="/station-practice"
              onClick={() =>
                trackCtaClick({
                  placement: "home_more_tools_featured",
                  href: "/station-practice",
                  label: t("supportTools.stationPracticeCta"),
                  category: "station_practice",
                  locale,
                })
              }
              className="block rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-4 shadow-sm transition-colors hover:bg-[#dbeafe] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d4ed8]"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-[#1d4ed8]">
                {t("supportTools.featuredLabel")}
              </span>
              <span className="mt-1 block text-base font-bold text-[#0b214a]">
                {t("supportTools.stationPracticeTitle")}
              </span>
              <span className="mt-1 block text-sm leading-5 text-slate-600">
                {t("supportTools.stationPracticeDesc")}
              </span>
              <span className="mt-3 inline-flex min-h-9 items-center rounded-xl bg-[#0b214a] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#123967]">
                {t("supportTools.stationPracticeCta")}
              </span>
            </Link>
            <div>
              <p className="mb-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">
                {t("supportTools.otherLabel")}
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {[
                  { href: "/local-tokyo", label: t("supportTools.localTokyo"), category: "local_tokyo" },
                  { href: "/itineraries/7-day-first-time-japan", label: t("supportTools.itinerary"), category: "itinerary" },
                  { href: "/plan-your-trip", label: t("supportTools.planner"), category: "itinerary" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() =>
                      trackCtaClick({
                        placement: "home_more_tools",
                        href: link.href,
                        label: link.label,
                        category: link.category,
                        locale,
                      })
                    }
                    className="inline-flex min-h-9 items-center rounded-full border border-[#b7ddf6] bg-white px-3 py-1.5 text-[#0b5ea8] shadow-sm transition-colors hover:bg-[#eff6ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#145aa0]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      <SiteFooter />
    </main>
  );
}
